# データ取得確認機能の改善

## 問題点

ユーザーから「データが取得できていない気がする。ちゃんと動いているか確認したい」という報告がありました。

調査の結果、以下の問題が判明しました：

1. **ログがコンソールに出力されない**: Cloud Loggingにのみ送信され、ローカル開発時に何が起きているか分からない
2. **Firestore接続に失敗**: Google Cloud認証がない環境では接続エラーが発生し、実行が止まる
3. **エミュレータが必須**: ローカルでの動作確認にFirestore Emulatorのセットアップが必須だが、手間がかかる
4. **`.env.example`が存在しない**: quickstart.mdで言及されているが実際のファイルがなかった

## 実装した解決策

### 1. ローカル開発時のログ可視化

`src/services/observability/logging.ts`と`metrics.ts`を改善し、ローカル開発時（`NODE_ENV=development`または`FIRESTORE_EMULATOR_HOST`が設定されている場合）は、Cloud LoggingやCloud Monitoringではなくコンソールに出力するようにしました。

**変更前**:
- すべてのログはCloud Loggingに送信
- ローカルでは何も見えない

**変更後**:
- ローカル開発時はコンソールに出力
- タイムスタンプ、ログレベル、メッセージ、データをフォーマットして表示

### 2. DRY-RUNモード

Firestore Emulatorなしでも動作確認できるよう、すべてのジョブにDRY-RUNモードを追加しました。

**使い方**:
```bash
# 個別ジョブ
pnpm tsx src/cli/cron/jobs/fetch_sources.ts --dry-run

# パイプライン全体
pnpm tsx src/cli/cron/digest_pipeline.ts --slot=0530 --dry-run
```

**DRY-RUNモードの動作**:
- 実際のFirestore接続は行わない
- 取得・保存されるデータをコンソールに詳細表示
- ログとメトリクスは通常通り記録
- エラーなく完了まで実行可能

### 3. 詳細なコンソールログ

`fetch_sources.ts`に以下の情報を追加：
- 処理中のフィード名とID
- 取得した記事数
- 各記事の詳細（ID、タイトル、URL、タグ）
- 処理完了のサマリー

### 4. スタンドアロン実行対応

各ジョブファイルにエントリポイントを追加し、単独で実行可能にしました：
- `fetch_sources.ts`: データ取得のみをテスト
- `FIRESTORE_EMULATOR_HOST`未設定時は自動的にDRY-RUNモードで実行

### 5. データ確認スクリプト

`src/scripts/verify_data.ts`を追加：
- Firestoreに保存されたデータを確認
- コレクション別にドキュメント数と内容を表示
- Firestore Emulator使用時の動作確認に便利

### 6. 環境設定ファイル

`.env.example`を作成：
- quickstart.mdで言及されていたが存在しなかった
- 必要な環境変数をコメント付きで記載
- Firestore Emulatorはデフォルトでコメントアウト（DRY-RUN推奨）

### 7. ローカル開発ガイド

`docs/local-dev-guide.md`を作成：
- Firestore Emulatorのセットアップ手順
- DRY-RUNモードの使い方
- データ確認方法
- トラブルシューティング

## 使用例

### 最も簡単な確認方法（DRY-RUN）

```bash
# 依存関係をインストール
pnpm install --no-frozen-lockfile

# データ取得をDRY-RUNで確認
pnpm tsx src/cli/cron/jobs/fetch_sources.ts --dry-run
```

出力:
```
[2026-01-11T08:24:49.162Z] [INFO] fetch_sources_start {"slot":"0530","dryRun":true}

========== データ取得開始 (slot: 0530) ==========
⚠️  DRY-RUN モード: 実際のデータ保存は行いません

フィード処理中: Qiita (qiita)
  [DRY-RUN] source_feedsコレクションに保存する予定: qiita
  記事数: 1件
  [DRY-RUN] article_candidatesに保存する予定:
    - ID: db51d37c-8e7c-4dc4-a717-9f34f385968a
    - タイトル: Qiita で話題の生成AIアップデート
    - URL: https://qiita.com/tags/generative-ai/feed?id=ab419aaa-b8c4-46de-b7c2-540754c1cc68
    - タグ: model-update

...

========== データ取得完了 ==========
処理フィード数: 2件

✓ 処理が正常に完了しました
```

### Firestore Emulatorを使った実際のデータ保存

```bash
# Firestore Emulatorを起動（別ターミナル）
make emu-firestore

# .envファイルを作成
cp .env.example .env
# FIRESTORE_EMULATOR_HOST=localhost:8080 のコメントを外す

# データ取得を実行
pnpm tsx src/cli/cron/jobs/fetch_sources.ts

# データを確認
pnpm tsx src/scripts/verify_data.ts
```

## テスト結果

すべての既存テストが正常にパス：
```bash
pnpm run test:jest
# Test Suites: 6 passed, 6 total
# Tests:       9 passed, 9 total
```

Linterも問題なし：
```bash
pnpm run lint
# ✔ No ESLint warnings or errors
```

## 影響範囲

### 変更されたファイル

- `src/services/observability/logging.ts` - ローカル開発時のコンソール出力を追加
- `src/services/observability/metrics.ts` - ローカル開発時のコンソール出力を追加
- `src/cli/cron/jobs/fetch_sources.ts` - DRY-RUNモード、詳細ログ、スタンドアロン実行対応
- `src/cli/cron/jobs/summarize_articles.ts` - DRY-RUNモード対応
- `src/cli/cron/jobs/publish_digest.ts` - DRY-RUNモード対応
- `src/cli/cron/digest_pipeline.ts` - DRY-RUNモード対応

### 追加されたファイル

- `.env.example` - 環境変数のサンプル
- `src/scripts/verify_data.ts` - データ確認スクリプト
- `docs/local-dev-guide.md` - ローカル開発ガイド

### 後方互換性

- すべての変更は後方互換性を保っています
- 既存の関数シグネチャは変更されていません（オプショナルパラメータのみ追加）
- 本番環境では従来通りCloud LoggingとCloud Monitoringを使用
- DRY-RUNモードは明示的に指定した場合のみ有効

## まとめ

この改善により、ユーザーは以下が可能になりました：

1. ✅ **Firestore Emulatorなしで動作確認**: DRY-RUNモードで即座に確認可能
2. ✅ **詳細なログ出力**: 何が起きているか明確に分かる
3. ✅ **簡単なセットアップ**: `.env.example`をコピーするだけで開始可能
4. ✅ **トラブルシューティング**: 問題発生時の原因特定が容易

「データが取得できているか確認したい」という要望に対して、複数の確認方法を提供し、ローカル開発体験を大幅に改善しました。
