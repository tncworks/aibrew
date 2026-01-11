# ローカル開発環境でのデータ取得確認ガイド

このガイドでは、Firestore Emulatorを使用してローカル環境でデータ取得が正しく動作しているか確認する方法を説明します。

## 前提条件

- Node.js 20.x がインストールされていること
- pnpm がインストールされていること (`corepack enable pnpm`)
- Google Cloud CLI がインストールされていること

## セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install --no-frozen-lockfile
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

`.env`ファイルの内容を確認し、必要に応じて編集します。ローカル開発では以下の設定が重要です：

```env
FIRESTORE_EMULATOR_HOST=localhost:8080
FIRESTORE_PROJECT_ID=aibrew-dev
AIBREW_ENV=dev
NODE_ENV=development
```

### 3. Firestore Emulatorの起動

別のターミナルウィンドウで：

```bash
make emu-firestore
# または
gcloud beta emulators firestore start --host-port=localhost:8080
```

エミュレータが起動すると、`localhost:8080` でFirestoreエミュレータが利用可能になります。

## データ取得の確認

### 方法1: fetch_sourcesジョブを直接実行

```bash
pnpm tsx src/cli/cron/jobs/fetch_sources.ts
```

成功すると、以下のような出力が表示されます：

```
[2025-01-11T08:00:00.000Z] [INFO] fetch_sources_start {"slot":"0530"}

========== データ取得開始 (slot: 0530) ==========

フィード処理中: Qiita (qiita)
  ✓ source_feedsコレクションに保存: qiita
  記事数: 1件
  ✓ article_candidatesに保存:
    - ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    - タイトル: Qiita で話題の生成AIアップデート
    - URL: https://qiita.com/tags/generative-ai/feed?id=...
    - タグ: model-update

フィード処理中: Zenn (zenn)
  ✓ source_feedsコレクションに保存: zenn
  記事数: 1件
  ✓ article_candidatesに保存:
    - ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    - タイトル: Zenn で話題の生成AIアップデート
    - URL: https://zenn.dev/topics/generative-ai/feed?id=...
    - タグ: model-update

========== データ取得完了 ==========
処理フィード数: 2件

[2025-01-11T08:00:00.000Z] [INFO] fetch_sources_complete {"slot":"0530","feeds":2}
[2025-01-11T08:00:00.000Z] [METRIC] fetch_sources.count=2 labels={"slot":"0530"}
```

### 方法2: 完全なダイジェストパイプラインを実行

```bash
pnpm tsx src/cli/cron/digest_pipeline.ts --slot=0530
```

これは以下の3つのステージを順次実行します：
1. fetch_sources (データ取得)
2. summarize_articles (要約生成)
3. publish_digest (ダイジェスト公開)

### 方法3: Makefileコマンドを使用

```bash
make job-crawl
```

## データの確認

データが正しく保存されたか確認するスクリプトを実行：

```bash
pnpm tsx src/scripts/verify_data.ts
```

出力例：

```
========== Firestore データ確認 ==========

環境: dev
Firestoreプロジェクト: aibrew-dev
エミュレータ: localhost:8080

--- source_feeds コレクション ---
ドキュメント数: 2件
  - qiita: Qiita (active)
  - zenn: Zenn (active)

--- article_candidates コレクション ---
ドキュメント数: 2件 (最大10件表示)
  - 12345678...
    タイトル: Qiita で話題の生成AIアップデート
    ソース: qiita
    ステータス: pending
    タグ: model-update
  - 87654321...
    タイトル: Zenn で話題の生成AIアップデート
    ソース: zenn
    ステータス: pending
    タグ: model-update

========== 確認完了 ==========
```

## トラブルシューティング

### エラー: "Could not load the default credentials"

**原因**: Firestore Emulatorが起動していない、または環境変数が設定されていない

**解決方法**:
1. Firestore Emulatorが起動していることを確認
2. `.env`ファイルに `FIRESTORE_EMULATOR_HOST=localhost:8080` が設定されていることを確認
3. エミュレータのポート（8080）が他のプロセスで使用されていないか確認

### エラー: "環境ファイルが見つかりません"

**原因**: 環境設定ファイルが存在しない

**解決方法**:
- `config/environments/dev.json` が存在することを確認
- 環境変数 `AIBREW_ENV` が正しく設定されているか確認

### ログが表示されない

**原因**: ローカル開発モードが検出されていない

**解決方法**:
- `.env`ファイルで `NODE_ENV=development` が設定されているか確認
- または `FIRESTORE_EMULATOR_HOST` が設定されていることを確認

## ログ出力の仕組み

ローカル開発時（`FIRESTORE_EMULATOR_HOST`が設定されている、または`NODE_ENV=development`の場合）：
- すべてのログはコンソールに出力されます
- Cloud Loggingへの送信は行われません
- メトリクスもコンソールに出力されます

本番環境：
- ログはGoogle Cloud Loggingに送信されます
- メトリクスはCloud Monitoringに送信されます

## 次のステップ

データ取得が確認できたら：

1. **要約生成**: `pnpm tsx src/cli/cron/jobs/summarize_articles.ts`
2. **ダイジェスト公開**: `pnpm tsx src/cli/cron/jobs/publish_digest.ts`
3. **Webサーバー起動**: `make dev-web` でNext.jsサーバーを起動し、http://localhost:3000 でダイジェストを確認

## 参考資料

- [quickstart.md](../../specs/001-ai-news-digest/quickstart.md) - プロジェクト全体のセットアップ
- [data-model.md](../../specs/001-ai-news-digest/data-model.md) - データモデルの詳細
- [spec.md](../../specs/001-ai-news-digest/spec.md) - 機能仕様
