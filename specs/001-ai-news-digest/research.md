# research: 生成AIニュースダイジェスト

## Decision 1: クロール＆要約パイプラインを Cloud Scheduler + Cloud Run Jobs + Firestore で構築
- **Rationale**: Scheduler→Run Jobs→Firestore なら最小構成で済み、Run Jobs の最小インスタンスを0にできるため1日3回×数分でも課金は従量のみ。軽量なPub/SubやWorkflowsを挟むより構成が単純で、GCP IAMもジョブ単位で権限最小化しやすい。Firestoreは自動スケールでメンテ不要。  
- **Alternatives considered**:  
  - Cloud Functions 第2世代: トリガー構成は簡単だが長時間実行や依存バイナリでCold Startが大きく、ジョブのリトライ制御もしづらい。  
  - Compute Engine (f1-micro常駐): 常時インスタンスコストとメンテが必要で「最小運用コスト」要件に反する。  
  - Workflows + Cloud Run複数ステップ: 柔軟だが現段階ではステップが少なく、Workflowsの基本料金が無駄になる。

## Decision 2: Firestore コレクション設計（SourceFeeds / ArticleCandidates / DigestEntries / EditorialReviews）
- **Rationale**: Specで定義したエンティティをそのままコレクション化するとクエリが単純化され、タグ・日付でのインデックスも少数で済む。Firestoreはドキュメント課金なので、1日あたり数百件規模なら無料枠に収まる見込み。関連ソースはサブコレクションではなく配列フィールドで保持し読み込み回数を削減。  
- **Alternatives considered**:  
  - BigQuery: 将来的な分析には有用だが本機能は日次ダイジェストのみで、クエリ課金が割高。  
  - Cloud SQL: リレーショナルなJOINは不要で常時稼働が必要となりコスト増。  
  - Datastoreモード: 既存プロジェクトはFirestore Native優先であり今後のリアルタイム機能とも整合しない。

## Decision 3: Vertex AI Text Bison (または最新Gemini) を要約エンジンに採用
- **Rationale**: GCPネイティブなLLMを使うことでIAM/請求/監査を一元化でき、1Kトークンあたり数セントで済む。デイリーで最大30エントリなら月額$10前後。要約品質が不十分な場合のヒューマンレビューを前提にしており、モデル切替もAPIで行える。  
- **Alternatives considered**:  
  - OpenAI API: 品質は高いがマルチクラウド連携と秘密情報管理が増える。  
  - 自前LLM: 推論コスト・メンテ負担が大幅に増え要件に合わない。  
  - OSS要約パイプライン (BART等): GPUコストが高くデプロイが複雑。

## Decision 4: 配信面は Next.js 14 SSG + Cloud CDN + Cloud Run (min=0)
- **Rationale**: 5分で読める静的コンテンツが中心なのでSSG/ISRでビルドし、Cloud CDNにキャッシュさせれば叩かれるのはEdgeで済む。Next.jsはSSGとAPI Routesを同居でき、社内ナレッジも多い。Cloud Run最小インスタンス0によりアクセスが少ない時間帯のコストを削減。  
- **Alternatives considered**:  
  - Firebase Hosting + Cloud Functions: SSRが不要なら可能だがタグフィルタAPIやレビューUIのためにAPI Routesを併設したい。  
  - Hugoなど静的ジェネレータ: 表示面だけなら十分だが認証付き編集UIが難しく、Reactエコシステム資産を活かしづらい。  
  - App Engine: Runよりコスト高＆柔軟性が低い。

## Decision 5: 観測とコスト監視は Cloud Monitoring 無料枠 + BigQuery Export (週次)
- **Rationale**: Cloud Monitoring無料枠でCPU/メモリ/請求を把握し、必要に応じて課金アラート(月$40閾値)を設定。アクセスログはCloud Loggingから週1回BigQueryへエクスポートし、分析時のみクエリ課金する。  
- **Alternatives considered**:  
  - Datadog等SaaS: 月額が跳ね上がり要件NG。  
  - ローカルGrafana: 維持コストとGCP連携が煩雑。

## Decision 6: テスト戦略 (Jest + Playwright + Contract tests)
- **Rationale**: Node/Next.jsとの親和性が高く、Firestore EmulatorやmswでAPIモックが容易。Playwrightでタグフィルタや5分読了UIをE2Eテストできる。ContractテストはOpenAPIに基づき `tests/contract` で実行し、CIで `make test` に統合できる。  
- **Alternatives considered**:  
  - Cypress: 既存ライセンスがなく、Playwrightの方がヘッドレスサーバーレス環境で安定。  
  - Vitest: 高速だがCIでの互換性よりJestのプラグイン資産を優先。

## Decision 7: コストガードレール
- **Rationale**: Cloud RunリビジョンごとにCPU/メモリを0.25vCPU/0.5GBに制限し、自動スケール最大10インスタンス。Firestoreは1ドキュメント=1KB以内を目安に要約を150字に制限。Vertex AIの1日要約数をConfigで抑え、LLM失敗時は再試行間隔を指数バックオフ。  
- **Alternatives considered**:  
  - 予約インスタンス: 常時費用が発生するため不採用。  
  - 自前キャッシュ: Cloud CDN/Edge Cacheで十分、Redis等は維持コストが増える。

## Decision 8: dev/stg/prod の3環境をGCPプロジェクト分離で構築
- **Rationale**: FirestoreやVertex AIはプロジェクトごとに課金されるため、環境ごとにプロジェクトを分けると課金とIAM境界を独立できる。Cloud Run/Cloud Schedulerもプロジェクト単位でリソースアイソレーションが容易。min instances=0のため環境が増えても固定費は増えず、stgで本番モデルを使っても請求が分離される。  
- **Alternatives considered**:  
  - 単一プロジェクト＋サービス名プレフィックス: IAMロールの分離が難しく、本番事故リスクが高い。  
  - マルチリージョン環境 (dev/us, prod/jp): レイテンシが増え、オブザーバビリティ設定が複雑。  
  - Firebase Hostingのみでdev/prod切り替え: バッチやVertex AIが絡むため不十分。

## Decision 9: 通勤帯リリースSLO (07:00 JST) をCloud Scheduler + 再実行窓で担保
- **Rationale**: ユーザー要望により朝7時までの公開が必須となったため、Cloud Schedulerジョブを05:30/06:00/06:30の3回に分割し、各Run Jobが失敗した場合も再実行できるよう冪等なジョブ設計にする。ジョブ完走監視はCloud MonitoringのメトリクスをSlack通知し、06:45までに成功しない場合は最終的に前日キャッシュをフォールバック表示することでサービスの空白を防ぐ。  
- **Alternatives considered**:  
  - 1回のみ(06:00)ジョブ実行: 失敗時に手動介入が必要でSLO違反リスクが高い。  
  - 常時稼働の常駐サーバーで逐次処理: コストが跳ね上がり、憲法のコスト最適化に反する。  
  - 07:00公開を目視で確認する手動運用: SLA保証ができず自動化方針と矛盾。
