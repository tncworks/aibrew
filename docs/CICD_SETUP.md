# CI/CD セットアップガイド

## GitHub Actions用のGCPサービスアカウント設定

### 1. サービスアカウントの作成

```bash
# サービスアカウントを作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD" \
  --project=aibrew-dev

# 必要なロールを付与
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
```

### 2. サービスアカウントキーの作成

```bash
# キーファイルを作成
gcloud iam service-accounts keys create ./gcp-sa-key.json \
  --iam-account=github-actions@aibrew-dev.iam.gserviceaccount.com \
  --project=aibrew-dev

# キーの内容を表示（GitHubに設定するため）
cat ./gcp-sa-key.json
```

### 3. GitHub Secretsの設定

1. GitHubリポジトリ https://github.com/tncworks/aibrew にアクセス
2. Settings → Secrets and variables → Actions
3. 「New repository secret」をクリック
4. 以下のSecretを追加：

**GCP_SA_KEY**
- Name: `GCP_SA_KEY`
- Value: `gcp-sa-key.json`の内容全体をコピー&ペースト

### 4. セキュリティ

```bash
# キーファイルは必ず削除
rm ./gcp-sa-key.json

# .gitignoreに追加済みか確認
grep "*.json" .gitignore
```

## ワークフローの実行

### 自動実行

`001-ai-news-digest`ブランチにpushすると自動的に実行されます：

```bash
git add .
git commit -m "feat: 001 CI/CDパイプラインを追加"
git push origin 001-ai-news-digest
```

### 手動実行

1. GitHubリポジトリのActionsタブを開く
2. 「Build and Deploy to Cloud Run」ワークフローを選択
3. 「Run workflow」をクリック

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
terraform init
terraform plan -var-file=terraform.tfvars.dev
```

## 現在の状況

✅ GCPプロジェクト: `aibrew-dev`
✅ Firestore: 作成済み
✅ 必要なAPI: 有効化済み
✅ サービスアカウント: `cloud-run-invoker@aibrew-dev.iam.gserviceaccount.com`
⏳ GitHub Actions: サービスアカウント設定待ち
⏳ コンテナイメージ: ビルド待ち
⏳ Cloud Run: デプロイ待ち
