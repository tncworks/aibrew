# quickstart: 生成AIニュースダイジェスト

## 1. 依存ツール
- Node.js 20.x + pnpm 8.x
- Google Cloud CLI (`gcloud`), Firestore Emulator, Cloud Run Emulator
- Docker Desktop (Cloud Runローカル実行用)
- Make (GNU make)

## 2. 初期セットアップ
```bash
corepack enable pnpm
pnpm install --no-frozen-lockfile  # CIと同じロックファイルを生成
make deps            # pnpm install + gcloud components update
cp .env.example .env # Vertex AI API key / Firestoreエミュレータ設定を記入
pnpm tsx src/scripts/seed_tag_facets.ts # タグ初期データ投入 (初回のみ)
```

`.env` 主要変数:
- `FIRESTORE_EMULATOR_HOST=localhost:8080`
- `VERTEXAI_PROJECT=your-gcp-project`
- `VERTEXAI_LOCATION=asia-northeast1`
- `VERTEXAI_MODEL=text-bison@002`

## 3. ローカル実行
```bash
make dev-api         # Cloud Run emulatorでAPI/cronを起動 (port 8081)
make dev-web         # Next.js dev server (port 3000)
make emu-firestore   # Firestore emulator + UI (port 8080)
```

## 4. バッチ/ジョブ実行
```bash
make job-crawl       # Scheduler(05:30/06:00/06:30)相当。記事取得→Firestoreへ保存
make job-summarize   # Vertex AIで要約&タグ生成
make job-publish     # 承認済み候補をDigestEntryへ昇格しDigestRun更新
```

## 5. テスト戦略 (TDD)
1. **Unit (Jest)**: `make test-unit` でmodels/servicesのピュアロジックとLLMプロンプト整形をテスト。  
2. **Integration (Firestore emulator)**: `make test-integration` でクロール→要約→承認フローをRED→GREEN。  
3. **Contract (OpenAPI)**: `make test-contract` が `contracts/digest-api.yaml` とAPIレスポンスを突き合わせる。  
4. **E2E (Playwright)**: `make test-e2e` でタグフィルタ/読了時間などUXを確認。  
5. すべてをまとめた `make test` をPRで実行しログを添付。

## 6. Lint/Format
```bash
make lint     # eslint + prettier + markdownlint
make format   # 自動整形
```

## 7. デプロイ
1. `make build` でNext.js静的出力とCloud Run OCIイメージを作成。  
2. `make deploy` が以下を自動化:  
   - `gcloud run deploy digest-web --min-instances=0 --cpu=0.25 --memory=512Mi`
   - `gcloud run jobs deploy digest-crawler`
   - `gcloud run jobs deploy digest-summarize`
   - `gcloud run jobs deploy digest-publish`
   - `gcloud scheduler jobs update http digest-crawler-0530 --schedule="30 5 * * *"`
   - `gcloud scheduler jobs update http digest-crawler-0600 --schedule="0 6 * * *"`
   - `gcloud scheduler jobs update http digest-crawler-0630 --schedule="30 6 * * *"`
3. Firestoreインデックスを `firebase firestore:indexes` で同期。

## 8. コストガードレール
- Cloud Run: 最大インスタンス10、リクエストタイムアウト300s。  
- Vertex AI呼び出し: Configで1日30件まで、超過時は翌日へ繰り越し。  
- Firestore: `digest_date+order` 以外の複合インデックスは必要最小限に。  
- Cloud Monitoring請求アラート: $40/月でアラート→Slack Webhook。

## 9. 観測
- Cloud Loggingで`resource.type=cloud_run_revision`をモニタし、`severity>=ERROR`をError Reportingへ集約。  
- カスタムメトリクス: ジョブの収集件数、要約成功率、レビュー待ち件数を `gcloud metrics` で送信し、SLOダッシュボードをMonitorsで可視化。  
- 週次でBigQueryエクスポートを実行し、人気タグや読了率を確認。
- 07:00 JST公開SLO: `DigestRun` ドキュメントをCloud Monitoringにエクスポートし、06:45時点で成功スロットが無い場合Slackへ `#alerts` 通知、Fallback UI (前日ダイジェスト＋バナー) を自動適用。Terraformの `monitoring.tf` でSLO/コストアラートも管理する。

## 10. 環境構築 (dev/stg/prod)
1. **プロジェクト作成**  
   ```bash
   gcloud projects create aibrew-dev
   gcloud projects create aibrew-stg
   gcloud projects create aibrew-prod
   ```
   各プロジェクトで Billing と Firestore (Native, asia-northeast1) を有効化。

2. **共通リソースデプロイ**  
   ```bash
   make infra ENV=dev    # Terraform or gcloud scriptsでCloud Run/Jobs/Scheduler/Secret Managerをまとめて作成
   make infra ENV=stg
   make infra ENV=prod
   ```

3. **環境変数/Secret**  
   - `.env.dev`, `.env.stg`, `.env.prod` を `config/environments/` に配置し、`VERTEXAI_PROJECT`, `FIRESTORE_PROJECT`, `CLOUD_RUN_SERVICE` などを環境別に設定。  
   - GitHub Actions は Secret Manager から `ENVIRONMENT` ごとのトークンを取得し `gcloud auth workload-identity-federation` で権限付与。

4. **デプロイフロー**  
   ```bash
   make deploy ENV=dev   # プレビュー
   gh workflow run staging-deploy.yml --ref 001-ai-news-digest
   gh workflow run production-deploy.yml --ref main
   ```
   - dev: 開発者が手動実行し、Firestore emulator + Cloud Run dev環境へ反映。  
   - stg: GitHub Actionsの手動承認後、Cloud Run stg + Firestore stg にデプロイし、Playwright/E2Eを自動実行。  
   - prod: mainマージ後にCloud Deployでカナリア (50%→100%) ロールアウトし、完了通知をSlackへ送信。

5. **データ分離**  
   - Firestoreインデックスとセキュリティルールを `firebase deploy --only firestore:indexes,firestore:rules --project $PROJECT` で各環境に同期。  
   - Vertex AI endpoint は `aibrew-{env}` 名称で作成し、要約ジョブは環境別サービスアカウントを使用。

## 11. CIチェックリスト
- `make lint` (Next.js ESLint + Prettier + MarkdownLint)  
- `make test` (Jest + Playwright。RED→GREENの結果をPRへ記録)  
- `make build` (Next.js App Router `src/app` 配下のコードをビルドし Cloud Run イメージへ組み込み)
