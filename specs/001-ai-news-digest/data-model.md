# data-model: 生成AIニュースダイジェスト

## 1. SourceFeed
| 属性 | 型 | 必須 | 説明 | 検証/制約 |
|------|----|------|------|-----------|
| id | string (slug) | ✅ | `qiita`, `zenn`, `itmedia` などユニークID | 英小文字+ハイフン、20文字以下 |
| name | string | ✅ | 表示名 | 50文字以内 |
| feed_url | string | ✅ | RSS/APIエンドポイント | https, 2048文字以内 |
| category | enum | ✅ | `tech-community`, `it-media`, `press-release` | 固定集合外は拒否 |
| last_fetched_at | timestamp | ✅ | 直近取得時刻 (UTC) | Cloud Scheduler実行後に更新 |
| status | enum | ✅ | `active`, `paused`, `blocked` | `blocked`はUIに出さない |
| terms_version | string | ✅ | 取得時の利用規約バージョン | 例: `2024-07` |

**関係**: ArticleCandidateが`source_id`で参照。`blocked`の場合はクロール対象外。

## 2. ArticleCandidate
| 属性 | 型 | 必須 | 説明 | 検証/制約 |
|------|----|------|------|-----------|
| id | string (ULID) | ✅ | FirestoreドキュメントID | ULID | 
| source_id | string | ✅ | SourceFeed.id | 参照整合性チェック |
| original_url | string | ✅ | 元記事URL | 正規化済https、255文字以内 |
| title | string | ✅ | 記事タイトル | 150文字以内 |
| summary_draft | string | ✅ | LLM生成要約案 (100〜150字) | 150字上限。マークダウン禁止 |
| tags | string[] | ✅ | 自動推定タグ (最大3) | enum集合 `model-update` 等 |
| duplicate_group_id | string | ✅ | ハッシュ化ID | URL & タイトルから生成 |
| confidence | number | ✅ | 0-1 | 0.6未満は要再要約 |
| status | enum | ✅ | `pending`, `approved`, `rejected` | Workflow制御 |
| fetched_at | timestamp | ✅ | クロール時刻 | | 
| published_at | timestamp | ✅ | 元記事公開日時 | timezone正規化 |
| reviewer_notes | string | ❌ | 人手メモ | 500字以内 |

**状態遷移**: `pending` → (`approved` または `rejected`)。`approved`時にDigestEntryへコピー。

## 3. DigestEntry
| 属性 | 型 | 必須 | 説明 | 検証/制約 |
|------|----|------|------|-----------|
| id | string (ULID) | ✅ | 表示用ID | | 
| digest_date | date | ✅ | YYYY-MM-DD (JST) | インデックス化 |
| order | number | ✅ | 1〜10 | ユニーク制約 (date+order) |
| title | string | ✅ | 表示タイトル | 150文字以内 |
| summary | string | ✅ | 公開用要約 (人手修正可) | 150字以内、日本語 |
| tags | string[] | ✅ | 表示タグ (最大3) | 設定済みリストから選択 |
| primary_source | object | ✅ | {name,url,logo} | URL必須 |
| related_sources | object[] | ✅ | 最大3件 | URL一意 |
| read_time_minutes | number | ✅ | 1〜5 | 自動算出 |
| published_at | timestamp | ✅ | 公開日時 | JST |
| updated_at | timestamp | ✅ | 最終更新 | Firestore server timestamp |
| visibility | enum | ✅ | `featured`, `read-more`, `hidden` | 既定 `featured` |

**関係**: ArticleCandidate承認時にDigestEntry作成。`digest_date`+`order`でクエリ。

## 4. EditorialReview
| 属性 | 型 | 必須 | 説明 | 検証/制約 |
|------|----|------|------|-----------|
| id | string | ✅ | レビューID | | 
| article_candidate_id | string | ✅ | ArticleCandidate.id | 外部キー |
| reviewer_id | string | ✅ | 編集者UID (Auth) | 監査用 |
| action | enum | ✅ | `approve`, `reject`, `revise` | | 
| comment | string | ✅ | 審査コメント | 500字以内 |
| created_at | timestamp | ✅ | 操作時刻 | | 

## 5. TagFacet (補助ビュー)
| 属性 | 型 | 必須 | 説明 | 検証/制約 |
|------|----|------|------|-----------|
| id | string | ✅ | タグID (例: `model-update`) | | 
| label | string | ✅ | 表示名 | 30文字以内 |
| description | string | ✅ | タグ説明 | 120文字以内 |
| color | string | ❌ | HEX | UIテーマに合わせる |
| active | boolean | ✅ | 有効フラグ | falseでフィルタ非表示 |

**関係**: DigestEntry.tags・ArticleCandidate.tagsの選択肢ソース。

## 6. DigestRun (配信ジョブログ)
| 属性 | 型 | 必須 | 説明 | 検証/制約 |
|------|----|------|------|-----------|
| id | string | ✅ | `digest_date`+`slot` (例: `2024-05-01-0630`) | |
| digest_date | date | ✅ | 処理対象日 (JST) | `YYYY-MM-DD` |
| slot | enum | ✅ | `0530`, `0600`, `0630` | Cloud Schedulerトリガーと一致 |
| started_at | timestamp | ✅ | Cloud Run Job開始 | JST/UTC両方保持 (server timestamp) |
| finished_at | timestamp | ❌ | 成功時のみ | |
| status | enum | ✅ | `success`, `failed`, `fallback` | 失敗時は理由を`error_code`に格納 |
| error_code | string | ❌ | 例: `VERTEX_TIMEOUT` | プレイブック参照用 |
| fallback_used | boolean | ✅ | 前日キャッシュなどフォールバック利用有無 | デフォルト false |

**関係**: `DigestRun` は Cloud Monitoring でSLO可視化する基礎データ、`DigestEntry`/`ArticleCandidate`とは疎結合 (外部参照: digest_date)。

## バリデーションまとめ
- URL: `https://` から始まり 255 文字以下。  
- タグ: 事前定義リスト (model-update/new-tools/industry-insight/regulation/community) から選択。  
- 要約: 100〜150文字、日本語、HTML不可。  
- ダイジェスト: 1日最大10件 `visibility=featured`、残りは `read-more` として`/more`に表示。  
- Firestore Index案:  
  1. `DigestEntry`: `digest_date ASC, order ASC`  
  2. `DigestEntry`: `tags ARRAY_CONTAINS, digest_date DESC`  
  3. `ArticleCandidate`: `status`, `fetched_at DESC` (レビューキュー用)  
  4. `DigestRun`: `digest_date ASC, slot ASC` (SLO監視)  
- DigestRun/SLO: 06:45 JST までに `status=success` が1件以上ない場合は `fallback_used=true` で直近ダイジェストを露出し「最新号準備中」バナーを表示。
