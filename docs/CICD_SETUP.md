# CI/CD セットアップガイド

## 構築完了（2025年11月19日時点）

✅ GitHub Actionsによる自動デプロイパイプラインが稼働中

## GitHub Actions用のGCPサービスアカウント設定

### 1. サービスアカウントの作成（完了）

```bash
# サービスアカウントを作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD" \
  --project=aibrew-dev
```

### 2. 必要な権限の付与（完了）

以下のIAMロールが付与済み:

- `roles/run.admin` - Cloud Run Service/Jobsの管理
- `roles/storage.admin` - GCS（Terraform State）の管理
- `roles/cloudscheduler.admin` - Cloud Schedulerの管理
- `roles/iam.serviceAccountUser` - サービスアカウントの使用
- `roles/artifactregistry.writer` - Artifact Registryへのイメージpush
- `roles/secretmanager.admin` - Secret Managerの管理
- `roles/serviceusage.serviceUsageAdmin` - GCP APIの管理
- `roles/datastore.owner` - Firestoreの管理
- `roles/monitoring.alertPolicyEditor` - モニタリングアラートの管理

```bash
gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/cloudscheduler.admin"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageAdmin"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/datastore.owner"

gcloud projects add-iam-policy-binding aibrew-dev \
  --member="serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com" \
  --role="roles/monitoring.alertPolicyEditor"
```

### 3. サービスアカウントキーの作成（完了）

```bash
# キーファイルを作成
gcloud iam service-accounts keys create ./gcp-sa-key.json \
  --iam-account=github-actions@aibrew-dev.iam.gserviceaccount.com \
  --project=aibrew-dev

# キーの内容を表示（GitHubに設定するため）
cat ./gcp-sa-key.json

# セキュリティのため削除
rm ./gcp-sa-key.json
```

### 4. GitHub Secretsの設定（完了）

GitHubリポジトリ: <https://github.com/tncworks/aibrew>

設定済みSecret:

- **GCP_SA_KEY**: サービスアカウントキーのJSON（完全版）

## デプロイパイプライン

### ワークフロー概要

ファイル: `.github/workflows/deploy-dev.yml`

トリガー: `001-ai-news-digest`ブランチへのpush

### デプロイフロー

1. **環境準備**
   - Node.js 20セットアップ
   - pnpm 10.22.0インストール
   - 依存関係インストール

2. **GCP認証**
   - サービスアカウントキー（GCP_SA_KEY）で認証
   - gcloud CLIセットアップ
   - Artifact Registryへの認証設定

3. **Docker Imageビルド**
   - `Dockerfile.web`: Next.js 14アプリケーション
   - `Dockerfile.jobs`: TypeScript バッチジョブ
   - イメージタグ: `$GITHUB_SHA`および`latest`

4. **Artifact Registryへpush**
   - リポジトリ: `asia-northeast1-docker.pkg.dev/aibrew-dev/aibrew`
   - イメージ:
     - `digest-web:$GITHUB_SHA`
     - `digest-web:latest`
     - `digest-jobs:$GITHUB_SHA`
     - `digest-jobs:latest`

5. **インフラデプロイ（OpenTofu）**
   - GCS backend初期化: `aibrew-dev-terraform-state`
   - Terraform plan実行
   - Terraform apply実行
   - 作成リソース:
     - Secret Manager: `digest-slack-webhook-dev`
     - Cloud Run Service: `digest-web-dev`
     - Cloud Run Jobs: 3つ（crawler, summarize, publish）
     - Cloud Scheduler Jobs: 3スロット（05:30, 06:00, 06:30 JST）

### Terraform State管理

- **Backend**: GCS
- **Bucket**: `aibrew-dev-terraform-state`
- **パス**: `terraform/state/default.tfstate`
- **バージョニング**: 有効
- **利点**:
  - 状態の永続化（GitHub Actions実行間で共有）
  - 冪等性（繰り返し実行しても409エラーなし）
  - 履歴管理（変更の追跡）

## ワークフローの実行

### 自動実行

`001-ai-news-digest`ブランチにpushすると自動的に実行されます：

```bash
git add .
git commit -m "feat: 001 新機能追加"
git push origin 001-ai-news-digest
```

### 手動実行

1. GitHubリポジトリのActionsタブを開く: <https://github.com/tncworks/aibrew/actions>
2. 「Build and Deploy to Cloud Run」ワークフローを選択
3. 「Run workflow」をクリック

### デプロイ結果確認

```bash
# デプロイされたサービスのURL取得
gcloud run services describe digest-web-dev \
  --region=asia-northeast1 \
  --project=aibrew-dev \
  --format="value(status.url)"

# 出力: https://digest-web-dev-5ekn6nnj7q-an.a.run.app
```

## デプロイ済みリソース

### Cloud Run Service

- **名前**: `digest-web-dev`
- **URL**: <https://digest-web-dev-5ekn6nnj7q-an.a.run.app>
- **イメージ**: `asia-northeast1-docker.pkg.dev/aibrew-dev/aibrew/digest-web:latest`
- **リソース**: CPU 1.0, Memory 512Mi
- **認証**: パブリックアクセス（開発環境）

### Cloud Run Jobs

- **digest-crawler-dev**: 記事収集
- **digest-summarize-dev**: AI要約
- **digest-publish-dev**: 記事公開

### Cloud Scheduler

- **digest-slot0530-dev**: 05:30 JST
- **digest-slot0600-dev**: 06:00 JST
- **digest-slot0630-dev**: 06:30 JST

## トラブルシューティング

### 権限エラーが出る場合

```bash
# サービスアカウントの権限を確認
gcloud projects get-iam-policy aibrew-dev \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@aibrew-dev.iam.gserviceaccount.com"
```

### ビルドエラーが出る場合

```bash
# ローカルでDockerビルドをテスト
docker build -t test-web -f Dockerfile.web .
docker build -t test-jobs -f Dockerfile.jobs .
```

### Terraformエラーが出る場合

```bash
# ローカルでTerraformプランを確認
cd infra/terraform
tofu init -reconfigure
tofu plan -var-file=terraform.tfvars.dev
```

### 409エラー（Already Exists）が出る場合

Terraform State管理により解決済み。GCS上のstate fileが正しく参照されていることを確認:

```bash
# State fileの存在確認
gsutil ls gs://aibrew-dev-terraform-state/terraform/state/

# State fileの内容確認
cd infra/terraform
tofu show
```

## 現在の状況（2025年11月19日時点）

✅ GCPプロジェクト: `aibrew-dev`
✅ Firestore: 作成済み（手動、Terraform管理外）
✅ 必要なAPI: すべて有効化済み
✅ サービスアカウント: `cloud-run-invoker`および`github-actions`
✅ GitHub Actions: 稼働中
✅ Artifact Registry: `aibrew`リポジトリ作成済み
✅ Docker Image: ビルド・push成功
✅ Cloud Run: デプロイ完了
✅ Terraform State: GCSで永続化済み
✅ 冪等性: 繰り返しデプロイ可能

## 次のステップ

1. ✅ インフラ構築完了
2. ✅ CI/CDパイプライン構築完了
3. ⏳ アプリケーション機能実装
4. ⏳ テストの充実
5. ⏳ 本番環境へのデプロイ準備

