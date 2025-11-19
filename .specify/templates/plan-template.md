# 実装計画: [FEATURE]

**ブランチ**: `[###-feature-name]` | **作成日**: [DATE] | **仕様**: [link]  
**入力**: `/specs/[###-feature-name]/spec.md` にあるフィーチャー仕様

**備考**: 本テンプレートは CLI（例: `/speckit.plan`）または手動編集時の共通フォーマットであり、生成後も日本語で更新して最新スタック情報を保持する。

## サマリー

[仕様から抽出した主要要件と技術アプローチを記載]

## 技術コンテキスト

> ⚠️ 以下のフィールドは実装に着手する前に必ず埋める。未確定の場合は `NEEDS CLARIFICATION` を明記すること。

**言語/バージョン**: [例: Python 3.11 or NEEDS CLARIFICATION]  
**主要依存**: [例: FastAPI, React or NEEDS CLARIFICATION]  
**ストレージ**: [例: PostgreSQL, SQLite, S3 or N/A]  
**テスト基盤**: [例: pytest, Jest, cargo test or NEEDS CLARIFICATION]  
**対象プラットフォーム**: [例: Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]  
**プロジェクト種別**: [single/web/mobile など]  
**性能目標**: [例: 1000 req/s or NEEDS CLARIFICATION]  
**制約**: [例: <200ms p95, <100MB memory or NEEDS CLARIFICATION]  
**規模/スコープ**: [例: 10k users, 50 screens or NEEDS CLARIFICATION]

## 憲法遵守チェック

*ゲート: フェーズ0（リサーチ）開始前にすべてYESであることを確認し、フェーズ1（設計）後にも再確認する。*

1. **日本語ナラティブ**: 仕様・計画・研究・タスクが全て日本語かつ `specs/###-short-name/` に揃っている。  
2. **スペック駆動の順序**: `spec.md`, `plan.md`, `tasks.md`、必要な `research.md` / `data-model.md` / `quickstart.md` / `contracts/` が更新済みで `check-prerequisites` がPASSしている。  
3. **TDDと品質**: 追加するテスト (unit/integration/contract) と `make test` の実行タイミングを計画し、90%以上のカバレッジ維持策と `NEEDS CLARIFICATION` 項目を記載した。  
4. **コストと可観測性**: ランタイムコスト、SLO/SLA、計測項目、ロギング方針を spec/plan に反映し、`specs/.../contracts/` へ必要アセットの配置計画を示した。  
5. **GitHub自動化/リリース**: `make deps/build/test/lint` の完走、CIの必須ジョブ、GitHub Actions 等のリリース手順が明記されている。

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

> ACTION: 実際の構成に合わせて不要なオプションを削除し、利用するディレクトリを具体的に追記すること。

```text
# 【未使用なら削除】オプション1: 単一プロジェクト（デフォルト）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# 【未使用なら削除】オプション2: Web（フロント+バック）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# 【未使用なら削除】オプション3: Mobile + API
api/
└── [backend同様]

ios/ or android/
└── [プラットフォーム固有構成]
```

**構成判断**: [採用した構成の理由と対象ディレクトリ]

## 複雑性トラッキング

> 憲法チェックで違反が発生し、やむを得ない場合のみ記載する。

| 違反内容 | 必要理由 | 却下した単純案 |
|----------|----------|----------------|
| 例: 4つ目のプロジェクト | 現在の要件 | 3構成では [理由] |
| 例: Repository パターン | [理由] | 直接DBアクセスは [理由] |
