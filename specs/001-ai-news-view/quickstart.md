# Quickstart: 生成AIニュース閲覧画面

## 概要

この機能は、生成AI関連のニュース記事を「5分で読める」形式で表示する画面です。

## 開発の始め方

1. **依存関係のインストール**:
   ```bash
   make deps
   ```

2. **開発サーバーの起動**:
   ```bash
   make dev
   ```

3. **画面へのアクセス**:
   ブラウザで `http://localhost:3000/news/mock-id` にアクセスしてください。
   (現在はモックデータが表示されます)

## テスト

- **ユニットテスト**:
  ```bash
  make test
  ```

- **E2Eテスト**:
  ```bash
  make test:e2e
  ```

## 主要コマンド

| コマンド | 説明 |
|---|---|
| `make dev` | 開発サーバー起動 |
| `make build` | ビルド |
| `make lint` | Lintチェック |
| `make test` | テスト実行 |
