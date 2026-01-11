# データ取得確認方法 - ユーザーガイド

## はじめに

「データが取得できているか確認したい」というご要望に対応し、Firestore Emulatorなしで即座にデータ取得の動作を確認できる機能を実装しました。

## 🚀 最も簡単な確認方法（推奨）

### 必要な準備

1. Node.js 20.x がインストールされている
2. pnpm がインストールされている（`corepack enable pnpm`）

### 実行手順

```bash
# 1. リポジトリのルートディレクトリへ移動
cd /path/to/aibrew

# 2. 依存関係をインストール（初回のみ）
pnpm install --no-frozen-lockfile

# 3. データ取得をDRY-RUNモードで実行
pnpm tsx src/cli/cron/jobs/fetch_sources.ts --dry-run
```

### 実行結果の例

```
[2026-01-11T08:30:32.294Z] [INFO] fetch_sources_start {"slot":"0530","dryRun":true}

========== データ取得開始 (slot: 0530) ==========
⚠️  DRY-RUN モード: 実際のデータ保存は行いません

フィード処理中: Qiita (qiita)
  [DRY-RUN] source_feedsコレクションに保存する予定: qiita
  記事数: 1件
  [DRY-RUN] article_candidatesに保存する予定:
    - ID: 0095333c-24a6-4502-878e-dd976d6a9040
    - タイトル: Qiita で話題の生成AIアップデート
    - URL: https://qiita.com/tags/generative-ai/feed?id=...
    - タグ: model-update

フィード処理中: Zenn (zenn)
  [DRY-RUN] source_feedsコレクションに保存する予定: zenn
  記事数: 1件
  [DRY-RUN] article_candidatesに保存する予定:
    - ID: c630165a-2e67-4673-84ed-5dc15a5651f0
    - タイトル: Zenn で話題の生成AIアップデート
    - URL: https://zenn.dev/topics/generative-ai/feed?id=...
    - タグ: model-update

========== データ取得完了 ==========
処理フィード数: 2件

[2026-01-11T08:30:32.296Z] [INFO] fetch_sources_complete {"slot":"0530","feeds":2,"dryRun":true}
[2026-01-11T08:30:32.296Z] [METRIC] fetch_sources.count=2 labels={"slot":"0530","dryRun":"true"}
✓ 処理が正常に完了しました
```

### 確認ポイント ✅

上記の出力から以下を確認できます：

1. **データソース**: QiitaとZennの2つのフィードから取得
2. **記事数**: 各フィードから1件ずつ、合計2件
3. **記事情報**: タイトル、URL、タグが正しく設定されている
4. **処理完了**: エラーなく正常に完了

## 📊 パイプライン全体の確認

データ取得だけでなく、要約生成、ダイジェスト公開までの全パイプラインを確認したい場合：

```bash
pnpm tsx src/cli/cron/digest_pipeline.ts --slot=0530 --dry-run
```

これにより以下の3つのステージが順次実行されます：

1. **fetch_sources**: データ取得
2. **summarize_articles**: 要約生成（DRY-RUNではスキップ）
3. **publish_digest**: ダイジェスト公開（DRY-RUNではスキップ）

## ❓ よくある質問

### Q1: DRY-RUNモードとは何ですか？

**A**: 実際のデータベース接続や外部API呼び出しを行わず、処理内容をコンソールに表示するモードです。動作確認やデバッグに便利です。

### Q2: 実際にデータを保存したい場合は？

**A**: Firestore Emulatorを起動し、`.env`ファイルで`FIRESTORE_EMULATOR_HOST=localhost:8080`を設定してから、`--dry-run`フラグなしで実行してください。詳細は`docs/local-dev-guide.md`を参照してください。

### Q3: エラーが出た場合は？

**A**: 以下を確認してください：
- Node.js 20.x がインストールされている
- `pnpm install`が正常に完了している
- リポジトリのルートディレクトリで実行している

それでも解決しない場合は、`docs/local-dev-guide.md`のトラブルシューティングセクションを参照してください。

### Q4: 本番環境への影響は？

**A**: ありません。すべての変更は後方互換性を保っており、本番環境では従来通りの動作を継続します。DRY-RUNモードはローカル開発時のみ使用されます。

## 📚 さらに詳しく知りたい場合

- **ローカル開発ガイド**: `docs/local-dev-guide.md`
- **実装の詳細**: `docs/data-retrieval-improvement.md`
- **完全なサマリー**: `docs/IMPLEMENTATION_SUMMARY.md`

## 💬 フィードバック

この機能について質問や改善提案がありましたら、GitHubのIssueまたはPull Requestでお知らせください。

---

**更新日**: 2026-01-11  
**対応Issue**: データ取得確認機能の実装
