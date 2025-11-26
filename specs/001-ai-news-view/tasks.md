---
description: "生成AIニュース閲覧画面の実装タスクリスト"
---

# タスク: 生成AIニュース閲覧画面

**入力**: `/specs/001-ai-news-view/` 直下の設計ドキュメント  
**前提**: plan.md, spec.md, research.md, data-model.md, contracts/

## フェーズ1: セットアップ

- [x] T001 [P] プランに従ってディレクトリ構造を作成 (specs/001-ai-news-view/tasks.md)
- [x] T002 [P] 必要なnpmパッケージのインストール (zod, etc.)

## フェーズ2: 基盤整備

- [x] T003 [P] データ取得ユーティリティ (`src/lib/news/fetcher.ts`) の実装
- [x] T004 [P] 読了時間計算ロジック (`src/lib/news/calculator.ts`) の実装
- [x] T005 [P] スタイル定義 (`src/styles/news.module.css`) の作成

## フェーズ3: ユーザーストーリー1 - 一目で概要と所要時間を理解したい (P1)

### 実装

- [x] T006 [US1] ニュース詳細ページ (`src/app/news/[id]/page.tsx`) のスケルトン作成
- [x] T007 [US1] ヒーローコンポーネント (`src/components/news/NewsHero.tsx`) の実装
- [x] T008 [US1] ヒーローセクションへのデータ組み込みとスタイリング

## フェーズ4: ユーザーストーリー2 - 5分で読み切れる本文体験が欲しい (P2)

### 実装

- [x] T009 [US2] 本文コンポーネント (`src/components/news/NewsBody.tsx`) の実装
- [x] T010 [US2] スクロール進捗バーの実装
- [x] T011 [US2] 本文のスタイリング (Typography, Spacing)

## フェーズ5: ユーザーストーリー3 - 次のアクションをスマートに取りたい (P3)

### 実装

- [x] T012 [US3] CTAコンポーネント (`src/components/news/NewsCTA.tsx`) の実装
- [x] T013 [US3] 共有ボタンと関連リンクの実装

## フェーズ6: 仕上げ

- [x] T014 [P] レスポンシブデザインの調整 (Mobile/Desktop)
- [x] T015 [P] アクセシビリティチェック (WCAG)
- [x] T016 [P] `make test` の実行と確認
