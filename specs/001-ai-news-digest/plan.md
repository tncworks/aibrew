# 実装計画: 生成AIニュースダイジェスト

**ブランチ**: `001-ai-news-digest` | **作成日**: 2025-11-19 | **仕様**: `specs/001-ai-news-digest/spec.md`  
**入力**: `/specs/001-ai-news-digest/spec.md` にあるフィーチャー仕様

**備考**: 本テンプレートは CLI（例: `/speckit.plan`）または手動編集時の共通フォーマットであり、生成後も日本語で更新して最新スタック情報を保持する。

## サマリー

生成AIトレンドを5分で把握できる日次ダイジェストを、Qiita/Zenn/ITメディアなどのホワイトリストソースから収集し、LLM要約とタグ付けを経て最大10件の露出に整形する。ベースラインとしてCloud Scheduler→Cloud Run Jobs→Firestore→Next.js 14 (app router) の構成を採用し、要約にはVertex AI (Text Bison/Gemini) を利用、UIはSSG/ISR＋Cloud CDNで高速に配信する。  
ユーザー追加要望として「朝7時までに更新を完了させて通勤時間帯の読者に届ける」ことをSLOに組み込み、既存仕様の「朝9時まで完了」前提を更新する。再要約を含めた品質ゲートを自動化し、タグフィルタ/検索や監査ログをFireStoreで一元管理する。観測はCloud Monitoring+Logging、コスト上限$40/月のガードレールを設ける。

## 技術コンテキスト

> ⚠️ 以下のフィールドは実装に着手する前に必ず埋める。未確定の場合は `NEEDS CLARIFICATION` を明記すること。

**言語/バージョン**: TypeScript (Node.js 20.x) / Next.js 14 (App Router)  
**主要依存**: Next.js, pnpm, Firebase Admin SDK, Google Cloud SDK, Vertex AI SDK, Playwright, Jest, Terraform (またはgcloudスクリプト)  
**ストレージ**: Firestore (Native mode) + Cloud Storage (ロゴ/アセット), Cloud Logging/Monitoring, optional BigQuery Export  
**テスト基盤**: Jest + Firestore Emulator, Playwright, contract tests via `schemathesis`/`pactum`, `make test`で統合  
**対象プラットフォーム**: GCP (Cloud Run Jobs/Services, Cloud Scheduler, Vertex AI), Webクライアント (SSR/SSG)  
**プロジェクト種別**: 単一リポジトリ (API + Web + バッチ)  
**性能目標**: `/v1/digests` p95 < 800ms @ 50並列、SSGページ初回描画 < 1.5s、クロール+要約+公開 pipeline を 06:30 JST まで完走 (07:00配信猶予)  
**制約**: Cloud Run 0.25vCPU/512MiB, Vertex AI 1日30要約, Firestoreドキュメント<=1KB要約, CDNキャッシュ5分, 月額コスト <= $40, SLA: 平日07:00 JSTダイジェスト公開  
**規模/スコープ**: 1日最大10 featured + 5 read-more 記事、タグ5種類、3環境(dev/stg/prod)、読者想定: 平日ユニーク2k〜5k

## 憲法遵守チェック

*ゲート: フェーズ0（リサーチ）開始前にすべてYESであることを確認し、フェーズ1（設計）後にも再確認する。*

1. **日本語ナラティブ**: YES — `spec.md`/`plan.md`/`tasks.md`/`research.md` など全ドキュメントを `specs/001-ai-news-digest/` に配置し日本語で記述する運用を維持。  
2. **スペック駆動の順序**: YES — `spec.md`→`plan.md`→`tasks.md` を揃え、`.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` をCI必須ジョブに追加予定。  
3. **TDDと品質**: YES — Jest/Playwright/契約テストをRED→GREEN→REFACTORフローで実行し、90%カバレッジ維持を `make test` ラッパーに統合。  
4. **コストと可観測性**: YES — Cloud Run/Vertex AI/Firestoreの使用量上限と監視メトリクス (ジョブ完走時間、要約成功率、タグ利用率、07:00公開SLA) をQuickstart/planに明記し、計測payloadは `specs/001-ai-news-digest/contracts/` に格納。  
5. **GitHub自動化/リリース**: YES — Makefileに `deps/build/test/lint`、CIに `check-prerequisites`/`make test`/Playwright/E2E、GitHub Actionsによる dev→stg→prod デプロイを定義する。

> 設計ドキュメント (research/data-model/contracts/quickstart) 更新後も全ゲートは YES を維持 (2025-11-19 再確認)。

## プロジェクト構成

### ドキュメント配置（このフィーチャー）

```text
specs/[###-feature]/
├── plan.md              # 本ファイル
├── research.md          # フェーズ0: /speckit.plan
├── data-model.md        # フェーズ1: /speckit.plan
├── quickstart.md        # フェーズ1: /speckit.plan
├── contracts/           # フェーズ1: /speckit.plan
└── tasks.md             # フェーズ2: /speckit.tasks
```

### ソース配置（リポジトリルート）

```text
src/
├── models/              # Firestoreスキーマ/型
├── services/            # Firestore/LLM/観測/設定ヘルパー
├── cli/                 # Cloud Run Jobs / cronエントリポイント
├── web/                 # Next.js app router (app/, components/, api/)
└── lib/                 # 共有ユーティリティ

tests/
├── unit/                # Jest (ピュアロジック)
├── integration/         # Firestore emulator + Playwright API
└── contract/            # OpenAPI/プロトコル検証

config/
├── environments/        # dev/stg/prod JSON
└── workflows/           # GitHub Actions再利用テンプレ

infra/
└── terraform/           # Cloud Run, Scheduler, Monitoring, Secrets
```

**構成判断**: 単一リポジトリ内にAPI/バッチ/Next.js Webを共存させるモノレポ構成を採用する。`src/` 直下に `models/` `services/` `cli/` `web/` を配置することでCloud Run Jobs/SSR/API Routesが同じ型定義を共有でき、テストも `tests/{unit,integration,contract}` で横断的に走らせやすい。将来のモバイル/別バックエンド構成は不要なためオプション2/3は削除。

## 複雑性トラッキング

> 憲法チェックで違反が発生し、やむを得ない場合のみ記載する。

| 違反内容 | 必要理由 | 却下した単純案 |
|----------|----------|----------------|
| なし | - | - |
