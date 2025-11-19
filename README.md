# 生成AIニュースダイジェスト

Next.js(App Router) + Cloud Run Jobs で毎朝07:00 JSTにダイジェストを発行するリポジトリです。設計/実装手順は `specs/001-ai-news-digest` 以下のドキュメントを参照してください。

## ディレクトリ概要

```
src/
├─ app/                 # Next.js App Router (public digest, admin review, API routes)
├─ components/         # 共通UI (TagFilterなど)
├─ cli/cron/           # Cloud Run Jobs entrypoints
├─ services/           # Firestore, Vertex AI, 品質ゲートなど
└─ models/             # Firestoreスキーマ (Zod)

infra/terraform/       # Cloud Run/Jobs/Scheduler/Monitoring定義
specs/001-ai-news-digest/ # spec/plan/tasks/research/data-model/quickstart/contracts
```

## よく使うコマンド

| コマンド            | 役割 |
|---------------------|------|
| `make deps`         | `pnpm install` + gcloud更新 |
| `make dev-web`      | Next.js開発サーバー (http://localhost:3000) |
| `make dev-api`      | Cloud Run Jobsスタブ (http://localhost:8081) |
| `make job-*`        | クロール/要約/公開バッチをローカル実行 |
| `make lint`         | Next.js ESLint + Prettier + Markdownlint |
| `make test`         | Jest (unit/integration/contract/perf) + Playwright E2E |
| `make build`        | Next.jsビルド + Cloud Runコンテナ生成 |

詳細なセットアップや運用ランブックは `specs/001-ai-news-digest/quickstart.md` を参照してください。
