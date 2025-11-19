# GCP検証環境セットアップガイド

## 構築済みリソース

以下のリソースが`aibrew-dev`プロジェクトに構築されています：

### GCPプロジェクト
- **プロジェクトID**: `aibrew-dev`
- **リージョン**: `asia-northeast1` (東京)
- **課金アカウント**: リンク済み

### 有効化済みAPI
- Cloud Run API
- Cloud Scheduler API
- Secret Manager API
- Firestore API
- Cloud Logging API
- Cloud Monitoring API
- Vertex AI API
- Compute Engine API

### Firestore
- **データベース名**: `(default)`
- **タイプ**: Firestore Native
- **ロケーション**: `asia-northeast1`
- **状態**: 作成済み

### サービスアカウント
- **アカウント**: `cloud-run-invoker@aibrew-dev.iam.gserviceaccount.com`
- **権限**:
  - `roles/run.invoker` - Cloud Run Jobsの実行
  - `roles/datastore.user` - Firestoreへのアクセス
  - `roles/aiplatform.user` - Vertex AIの使用

## ローカル開発環境のセットアップ

### 1. Google Cloud SDK認証

```bash
# アカウント認証（既に完了）
gcloud auth login

# アプリケーションデフォルト認証情報の設定（既に完了）
gcloud auth application-default login

# プロジェクトの設定
gcloud config set project aibrew-dev
```

### 2. 環境変数の設定

```bash
# .env.devファイルをコピー
cp .env.dev .env

# または直接環境変数を設定
export GOOGLE_CLOUD_PROJECT=aibrew-dev
export FIRESTORE_PROJECT_ID=aibrew-dev
export VERTEX_AI_PROJECT=aibrew-dev
export VERTEX_AI_LOCATION=asia-northeast1
```

### 3. 依存関係のインストール

```bash
# pnpmを使用
corepack enable pnpm
pnpm install
```

### 4. Firestoreへの接続確認

```bash
# Firestoreへの接続テスト
gcloud firestore databases describe --database="(default)" --project=aibrew-dev
```

## Terraformでのインフラ管理

### 初期化（既に完了）

```bash
cd infra/terraform
tofu init
```

### プランの確認

```bash
tofu plan -var-file=terraform.tfvars.dev
```

### インフラのデプロイ（Cloud Run ServicesとJobsは後で実行）

```bash
# 注意: コンテナイメージが必要なため、アプリケーション開発後に実行
tofu apply -var-file=terraform.tfvars.dev
```

## 次のステップ

1. **アプリケーション開発**: `src/`配下のコードを実装
2. **ローカルテスト**: Firestoreエミュレータを使用
3. **コンテナイメージのビルド**: Docker/Cloud Buildでビルド
4. **Cloud Runへのデプロイ**: Terraformまたはgcloudコマンドでデプロイ
5. **動作確認**: デプロイしたサービスの動作をテスト

## トラブルシューティング

### 認証エラーが出る場合

```bash
gcloud auth application-default login
```

### プロジェクトが見つからない場合

```bash
gcloud config set project aibrew-dev
```

### Firestoreへのアクセスエラー

```bash
# IAMロールの確認
gcloud projects get-iam-policy aibrew-dev
```

## コスト管理

- 月次コスト上限: $40
- Cloud Monitoring アラートの設定を推奨
- 使用しない場合はリソースを削除

```bash
# リソースの削除（必要に応じて）
tofu destroy -var-file=terraform.tfvars.dev
```

## リソース情報

- [GCPコンソール - aibrew-dev](https://console.cloud.google.com/home/dashboard?project=aibrew-dev)
- [Firestoreコンソール](https://console.cloud.google.com/firestore/databases/-default-/data?project=aibrew-dev)
- [Cloud Runコンソール](https://console.cloud.google.com/run?project=aibrew-dev)
