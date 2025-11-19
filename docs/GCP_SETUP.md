# GCP検証環境セットアップガイド

## 構築済みリソース（2025年11月19日時点）

以下のリソースが`aibrew-dev`プロジェクトに構築されています：

### GCPプロジェクト

- **プロジェクトID**: `aibrew-dev`
- **プロジェクト番号**: `504959440756`
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
- Artifact Registry API
- Cloud Build API

### Firestore

- **データベース名**: `(default)`
- **タイプ**: Firestore Native
- **ロケーション**: `asia-northeast1`
- **状態**: 作成済み（手動作成、Terraform管理外）

### Artifact Registry

- **リポジトリ名**: `aibrew`
- **ロケーション**: `asia-northeast1`
- **フォーマット**: Docker
- **URL**: `asia-northeast1-docker.pkg.dev/aibrew-dev/aibrew`

### Cloud Run (Terraform管理)

#### Web Service

- **サービス名**: `digest-web-dev`
- **URL**: <https://digest-web-dev-5ekn6nnj7q-an.a.run.app>
- **イメージ**: `asia-northeast1-docker.pkg.dev/aibrew-dev/aibrew/digest-web:latest`
- **リソース**: CPU 1.0, Memory 512Mi
- **スケーリング**: min=0, max=10
- **認証**: パブリックアクセス許可（開発環境のみ）

#### Jobs

- **digest-crawler-dev**: 記事収集ジョブ
- **digest-summarize-dev**: AI要約ジョブ
- **digest-publish-dev**: 記事公開ジョブ

### Cloud Scheduler

- **digest-slot0530-dev**: 05:30 JST実行
- **digest-slot0600-dev**: 06:00 JST実行
- **digest-slot0630-dev**: 06:30 JST実行

### Secret Manager

- **digest-slack-webhook-dev**: Slack通知用Webhook URL

### サービスアカウント

#### cloud-run-invoker

- **アカウント**: `cloud-run-invoker@aibrew-dev.iam.gserviceaccount.com`
- **用途**: Cloud Run Service/Jobsの実行
- **権限**:
  - `roles/run.invoker` - Cloud Run Jobsの実行
  - `roles/datastore.user` - Firestoreへのアクセス
  - `roles/aiplatform.user` - Vertex AIの使用

#### github-actions

- **アカウント**: `github-actions@aibrew-dev.iam.gserviceaccount.com`
- **用途**: GitHub ActionsからのCI/CDデプロイ
- **権限**:
  - `roles/run.admin` - Cloud Run管理
  - `roles/storage.admin` - GCS管理
  - `roles/cloudscheduler.admin` - Cloud Scheduler管理
  - `roles/iam.serviceAccountUser` - サービスアカウント使用
  - `roles/artifactregistry.writer` - Artifact Registryへのpush
  - `roles/secretmanager.admin` - Secret Manager管理
  - `roles/serviceusage.serviceUsageAdmin` - API管理
  - `roles/datastore.owner` - Firestore管理
  - `roles/monitoring.alertPolicyEditor` - アラートポリシー管理

### Terraform State管理

- **GCS Bucket**: `aibrew-dev-terraform-state`
- **ロケーション**: `asia-northeast1`
- **バージョニング**: 有効化
- **用途**: Terraform state fileの永続化

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

### 初期化

```bash
cd infra/terraform
tofu init -reconfigure
```

### プランの確認

```bash
tofu plan -var-file=terraform.tfvars.dev
```

### インフラのデプロイ

```bash
# 注意: GitHub Actionsで自動実行されるため、通常は手動実行不要
tofu apply -var-file=terraform.tfvars.dev
```

### 既存リソースのインポート（初回のみ実行済み）

```bash
# Secret Manager
tofu import -var-file=terraform.tfvars.dev \
  'google_secret_manager_secret.slack_webhook' \
  'projects/aibrew-dev/secrets/digest-slack-webhook-dev'

# Cloud Run Service
tofu import -var-file=terraform.tfvars.dev \
  'google_cloud_run_v2_service.digest_web' \
  'projects/aibrew-dev/locations/asia-northeast1/services/digest-web-dev'

# Cloud Run Jobs
tofu import -var-file=terraform.tfvars.dev \
  'google_cloud_run_v2_job.digest_jobs["crawler"]' \
  'projects/aibrew-dev/locations/asia-northeast1/jobs/digest-crawler-dev'

# Cloud Scheduler Jobs
tofu import -var-file=terraform.tfvars.dev \
  'google_cloud_scheduler_job.digest_slots["slot0530"]' \
  'projects/aibrew-dev/locations/asia-northeast1/jobs/digest-slot0530-dev'
```

## CI/CDパイプライン

### GitHub Actions

ブランチ: `001-ai-news-digest`

ワークフロー: `.github/workflows/deploy-dev.yml`

実行トリガー: `001-ai-news-digest`ブランチへのpush

処理フロー:

1. ソースコードチェックアウト
2. pnpm依存関係インストール
3. Docker Imageビルド（Web + Jobs）
4. Artifact Registryへpush
5. OpenTofu（Terraform）でインフラデプロイ

### デプロイ確認

```bash
# Cloud Run Serviceの確認
gcloud run services describe digest-web-dev \
  --region=asia-northeast1 \
  --project=aibrew-dev

# Cloud Run Jobsの確認
gcloud run jobs list \
  --region=asia-northeast1 \
  --project=aibrew-dev

# Cloud Schedulerの確認
gcloud scheduler jobs list \
  --location=asia-northeast1 \
  --project=aibrew-dev
```

## 次のステップ

1. ✅ **インフラ構築**: 完了
2. ✅ **CI/CDパイプライン**: 構築完了
3. ⏳ **アプリケーション実装**: `src/`配下のコード実装
4. ⏳ **ローカルテスト**: Firestoreエミュレータを使用
5. ⏳ **本番デプロイ**: 動作確認後にmainブランチへマージ

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

### Docker Imageのpushエラー

```bash
# Artifact Registryへの認証
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

## コスト管理

- 月次コスト目標: $40
- Cloud Monitoring アラートの設定: monitoring.tf（一時無効化中）
- 使用しない場合はリソースを削除

```bash
# リソースの削除（必要に応じて）
tofu destroy -var-file=terraform.tfvars.dev
```

## リソース情報

- [GCPコンソール - aibrew-dev](https://console.cloud.google.com/home/dashboard?project=aibrew-dev)
- [Firestoreコンソール](https://console.cloud.google.com/firestore/databases/-default-/data?project=aibrew-dev)
- [Cloud Runコンソール](https://console.cloud.google.com/run?project=aibrew-dev)
- [Artifact Registryコンソール](https://console.cloud.google.com/artifacts/docker/aibrew-dev/asia-northeast1/aibrew?project=aibrew-dev)
- [GitHub Actions](https://github.com/tncworks/aibrew/actions)

