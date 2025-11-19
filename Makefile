SHELL := /bin/bash
PNPM ?= pnpm
TSX := $(PNPM) exec tsx
ENV ?= dev

.PHONY: deps build lint format test dev-web dev-api emu-firestore job-crawl job-summarize job-publish infra deploy clean

deps:
	corepack $(PNPM) install

build:
	$(PNPM) run build:web

lint:
	$(PNPM) run lint

format:
	$(PNPM) exec prettier --write .

test:
	$(PNPM) run test

# Local dev servers
.dev-warning:
	@echo "⚠️  開発サーバーはまだスタブです。必要に応じて src/cli/ 以下にエントリポイントを実装してください。"

dev-web: .dev-warning
	$(PNPM) run dev:web

dev-api: .dev-warning
	$(TSX) src/cli/dev-api-server.ts

emu-firestore:
	gcloud beta emulators firestore start --host-port=localhost:8080

# Cloud Run job stages
job-crawl: .dev-warning
	$(TSX) src/cli/cron/jobs/fetch_sources.ts --env $(ENV)

job-summarize: .dev-warning
	$(TSX) src/cli/cron/jobs/summarize_articles.ts --env $(ENV)

job-publish: .dev-warning
	$(TSX) src/cli/cron/jobs/publish_digest.ts --env $(ENV)

infra:
	@[ -n "$(ENV)" ]
	terraform -chdir=infra/terraform init
	terraform -chdir=infra/terraform apply -var="environment=$(ENV)"

deploy:
	@[ -n "$(ENV)" ]
	$(PNPM) exec ts-node --esm src/cli/deploy.ts --env $(ENV)

clean:
	rm -rf node_modules .turbo .next dist build
