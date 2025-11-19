<!--
Sync Impact Report
- バージョン変更: 0.0.0 → 1.0.0
- 変更されたプリンシプル:
  * なし → 第1条 日本語ナラティブと透明性
  * なし → 第2条 スペック駆動の小さな変更単位
  * なし → 第3条 TDDと90%カバレッジ
  * なし → 第4条 コスト最適化と可観測性
  * なし → 第5条 GitHub自動化と信頼できるリリース
- 追加セクション: Core Principles, 運用・セキュリティ制約, 開発ワークフローと品質ゲート, Governance
- 更新したテンプレート:
  * ✅ .specify/templates/plan-template.md
  * ✅ .specify/templates/spec-template.md
  * ✅ .specify/templates/tasks-template.md
- フォローアップTODO: なし
-->

# AIBrew Constitution

## Core Principles

### 第1条 日本語ナラティブと透明性
- 仕様、計画、研究、タスク、コミットメッセージ、レビューコメントはすべて日本語で記述し、`specs/###-short-name/`以下に計画系ドキュメントを集中管理する。  
- `.specify/scripts/bash/update-agent-context.sh` を更新フェーズごとに実行し、AGENTSや各エージェントファイルへ最新スタック情報を反映させる。  
- 理由: 誰が参画しても判断の経緯が追跡でき、日本語を前提としたレビューラインを維持できるため。

### 第2条 スペック駆動の小さな変更単位
- 新機能着手前に `bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` を通過させ、`spec.md`→`plan.md`→`tasks.md` の順序で合意するまで実装を禁止する。  
- 各ブランチは `###-short-name` 形式で作成し、`specs/###-short-name/` には `research.md`・`data-model.md`・`quickstart.md`・`contracts/` を含めた最小限の成果物を揃える。  
- 理由: 線形な資料チェーンを維持することで計画の逸脱を防ぎ、汎用的なテンプレートで自動検証できるため。

### 第3条 TDDと90%カバレッジ
- `tests/unit`, `tests/integration`, `tests/contract` を使い分け、全ての公開インターフェースには契約テストを追加する。  
- `make test` を常にRED→GREEN→REFACTORの順で回し、PRでは最新の `make test` 出力と不足要件の `NEEDS CLARIFICATION` を添付する。  
- 理由: サービス運用コストを増やさずに品質を証明し、CI/CDでの自動化と監査証跡を確保するため。

### 第4条 コスト最適化と可観測性
- ランタイムコードは `src/`（必要に応じて `models/`, `services/`, `cli/`）へ配置し、不要な常駐サービスやリソースを導入しない。  
- 仕様で定義したメトリクス・ログ・テレメトリーを最小権限で収集し、`specs/.../contracts/` にサンプル payload やダイアグラムを保管してデバッグの再現性を確保する。  
- 理由: ソフトウェア費用とオブザーバビリティ費用を同時に抑制し、運用リスク・MTTR・クラウド課金のバランスを保つため。

### 第5条 GitHub自動化と信頼できるリリース
- `make deps`, `make build`, `make test`, `make lint` の薄いラッパーを整備し、CIとローカルの同一コマンドで検証する。  
- PRには `check-prerequisites` と `make test` の最新結果、関連スクリーンショット/ログ、リリース手順を添付し、GitHub Actions などでリリースとタグ付けを自動化する。  
- 理由: 自動テスト済みの変更のみを本番へ流し、人的手順に依存しないリリースを保証するため。

## 運用・セキュリティ制約
- `.specify/` 配下に憲法・テンプレート・Bashヘルパーを集約し、各機能ブランチが `specs/###-short-name/` を生成して成果物と契約資産を同梱する。  
- ランタイム資産は `src/` と `tests/` に限定し、データやスクリーンショットは `specs/.../contracts/` または `contracts/assets/` に保管する。  
- 依存関係は `make deps` 経由で導入し、セキュリティパッチやライセンス承認を `plan.md` のリスク欄へ明記する。  
- コスト試算やSLO/SLAは `spec.md` の成功指標および `plan.md` の技術背景に必須項目として追加し、レビューで資源増加を承認する。

## 開発ワークフローと品質ゲート
- 研究→設計→タスク→実装→テスト→リリースの順序を崩さず、各フェーズで `update-agent-context.sh` を再実行してエージェントファイルの同期を取る。  
- すべてのコード変更はGitHub上でレビューし、`feat: 005 メトリクス収集を追加` のように spec ID + 日本語サマリでコミットメッセージを付ける。  
- TDDの証跡（失敗→成功ログ）と `NEEDS CLARIFICATION` の未解決項目がないことをレビューチェックリストに含める。  
- リリースはGitHub Actions等のCI/CDを通じて行い、チェックリストには `make build`, `make lint`, `make test`, セキュリティスキャン、リリースワークフローの結果を添付する。

## Governance
- この憲法は作業指針の最上位文書であり、AGENTS.mdやテンプレートは本書を実装する派生ガイドとして定期更新する。  
- 改訂はPRで行い、`spec.md`, `plan.md`, `tasks.md` へ参照リンクを貼ったうえで、バージョン変更理由を Sync Impact Report に記録する。  
- バージョニングはセマンティックバージョニング (MAJOR.MINOR.PATCH) を採用し、原則の削除・再定義はMAJOR、原則追加や重大な追記はMINOR、文言調整や誤植修正はPATCHとする。  
- 準拠審査として、`check-prerequisites` の結果、`make` 系コマンドのログ、テンプレート遵守状況をすべてのPRで確認し、逸脱があれば `NEEDS CLARIFICATION` を付けて解消するまでマージしない。

**Version**: 1.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-19
