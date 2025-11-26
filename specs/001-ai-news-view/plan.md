# 実装計画: 生成AIニュース閲覧画面

**ブランチ**: `001-ai-news-view` | **作成日**: 2025-11-19 | **仕様**: [spec.md](./spec.md)  
**入力**: `/specs/001-ai-news-view/spec.md` にあるフィーチャー仕様

**備考**: 本テンプレートは CLI（例: `/speckit.plan`）または手動編集時の共通フォーマットであり、生成後も日本語で更新して最新スタック情報を保持する。

## サマリー

生成AI関連のニュースを「5分で読める」形式で提供する閲覧画面を実装する。
モダンでスタイリッシュなデザイン（ヒーロー、進捗バー、CTA）と、レスポンシブ対応、読了時間計算ロジックを含む。

## 技術コンテキスト

> ⚠️ 以下のフィールドは実装に着手する前に必ず埋める。未確定の場合は `NEEDS CLARIFICATION` を明記すること。

**言語/バージョン**: TypeScript 5.3 / Node.js (v20+)  
**主要依存**: Next.js 14, React 18, Zod, Vanilla CSS (CSS Modules)  
**ストレージ**: Firestore (記事データ取得用)  
**テスト基盤**: Jest (Unit/Integration), Playwright (E2E)  
**対象プラットフォーム**: Web (Modern Browsers, Mobile/Desktop)  
**プロジェクト種別**: web  
**性能目標**: Core Web Vitals (LCP < 2.5s, CLS < 0.1)  
**制約**: レスポンシブ (320px - 1440px), アクセシビリティ (WCAG準拠)  
**規模/スコープ**: 1画面 (ニュース詳細), コンポーネント数 5-10

## 憲法遵守チェック

*ゲート: フェーズ0（リサーチ）開始前にすべてYESであることを確認し、フェーズ1（設計）後にも再確認する。*

1. **日本語ナラティブ**: 仕様・計画・研究・タスクが全て日本語かつ `specs/001-ai-news-view/` に揃っている。 (YES)
2. **スペック駆動の順序**: `spec.md`, `plan.md`, `tasks.md`、必要な `research.md` / `data-model.md` / `quickstart.md` / `contracts/` が更新済みで `check-prerequisites` がPASSしている。 (YES - 進行中)
3. **TDDと品質**: 追加するテスト (unit/integration/contract) と `make test` の実行タイミングを計画し、90%以上のカバレッジ維持策と `NEEDS CLARIFICATION` 項目を記載した。 (YES)
4. **コストと可観測性**: ランタイムコスト、SLO/SLA、計測項目、ロギング方針を spec/plan に反映し、`specs/.../contracts/` へ必要アセットの配置計画を示した。 (YES)
5. **GitHub自動化/リリース**: `make deps/build/test/lint` の完走、CIの必須ジョブ、GitHub Actions 等のリリース手順が明記されている。 (YES)

## プロジェクト構成

### ドキュメント配置（このフィーチャー）

```text
specs/001-ai-news-view/
├── plan.md              # 本ファイル
├── research.md          # フェーズ0: 完了
├── data-model.md        # フェーズ1: 作成予定
├── quickstart.md        # フェーズ1: 作成予定
├── contracts/           # フェーズ1: 作成予定
└── tasks.md             # フェーズ2: 作成予定
```

### ソース配置（リポジトリルート）

```text
src/
├── app/
│   └── news/
│       └── [id]/
│           └── page.tsx       # ニュース詳細ページ
├── components/
│   └── news/
│       ├── NewsHero.tsx       # ヒーローセクション
│       ├── NewsBody.tsx       # 本文・進捗バー
│       └── NewsCTA.tsx        # 共有・関連リンク
├── styles/
│   └── news.module.css        # スタイル定義
└── lib/
    └── news/
        ├── calculator.ts      # 読了時間計算ロジック
        └── fetcher.ts         # データ取得
```

**構成判断**: Next.js App Routerを採用。コンポーネントは機能単位で分割し、スタイルはCSS Modulesで管理してモダンなデザインを実現する。

## 複雑性トラッキング

> 憲法チェックで違反が発生し、やむを得ない場合のみ記載する。

| 違反内容 | 必要理由 | 却下した単純案 |
|----------|----------|----------------|
| なし | - | - |
