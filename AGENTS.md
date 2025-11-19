# Repository Guidelines

## Project Structure & Module Organization
`.specify/` hosts the constitution, templates, and Bash helpers. Every feature branch must generate `specs/###-short-name/` with `spec.md`, `plan.md`, `tasks.md`, and supporting docs (`research.md`, `data-model.md`, `quickstart.md`, `contracts/`). Runtimeコードは `src/` 配下に集約し、Next.js App Router は `src/app/`、共有UIは `src/components/`、バッチや品質ゲートは `src/cli/` と `src/services/` に置く。テストは `tests/{unit,integration,contract,performance,e2e}` へ分類し、成果物やスクリーンショットは `specs/.../contracts/` (or `assets/`) に保管する。

## Build, Test, and Development Commands
- `bash .specify/scripts/bash/create-new-feature.sh "Add telemetry ingest" --short-name telemetry` scaffolds the numbered spec directory.
- `bash .specify/scripts/bash/setup-plan.sh` copies the latest plan template into `specs/<id>/plan.md`.
- `bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` blocks coding until spec/plan/tasks exist; add it to CI jobs.
- Maintain a thin `Makefile` exposing `make deps`, `make lint`, `make test`, and `make build` so contributors run identical commands locally/CI. Next.js Lintは `next lint`、テストは `pnpm run test` (Jest + Playwright)、ビルドは `next build` をラップしている。
- Node.js環境では `corepack enable pnpm` → `pnpm install --no-frozen-lockfile` を実行してロックファイルと依存関係を同期する。タグ初期データは `pnpm tsx src/scripts/seed_tag_facets.ts` で投入できる。

## Coding Style & Naming Conventions
All narrative content—specs, plans, comments, commit messages—must be Japanese. Branches follow `###-short-name` (e.g., `004-observability`); `specs/` directories stay lowercase kebab-case. Code modules use the native language style (`snake_case.py`, `PascalCase.swift`, etc.), while Bash utilities copy `.specify/scripts/bash` (`#!/usr/bin/env bash`, `set -euo pipefail`, four-space indents). Document formatter/linter choices in each plan and surface them through `make lint`.

## Testing Guidelines
Practice strict TDD: create the failing test, observe RED, ship GREEN, then REFACTOR. Target ≥90% coverage and add contract tests for every public interface described in `spec.md`. Use `tests/integration` for flows, `tests/contract` for protocols, and `tests/unit` for fast checks; name files `test_<feature>_<behavior>` with Japanese descriptions. Attach `make test` output to PRs and mark any missing requirements as `NEEDS CLARIFICATION` before coding.

## Commit & Pull Request Guidelines
Commits should resemble `feat: 005 メトリクス収集を追加` (Japanese summary + spec id). PRs must link to `spec.md`, `plan.md`, and `tasks.md`, attach screenshots/logs when UX or CLI output changes, and paste the latest `check-prerequisites` plus `make test` output. Update all touched docs (quickstart, contracts, AGENTS, etc.) in the same branch, rerun `bash .specify/scripts/bash/update-agent-context.sh` when plan metadata changes, and merge only after CI runs build/lint/test and the release workflow promised in the plan.

## Agent Workflow Notes
AGENTS.md is the default onboarding document for automation-friendly contributors. Before editing files, agents should review `.specify/memory/constitution.md`, the active `specs/<id>/plan.md`, and rerun `update-agent-context.sh` so every agent file (Claude, Copilot, Cursor, etc.) reflects the latest stack information and release instructions.
