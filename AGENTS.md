# Repository Guidelines

## Project Structure & Module Organization
`.specify/` hosts the constitution, templates, and Bash helpers. Every feature branch must generate `specs/###-short-name/` with `spec.md`, `plan.md`, `tasks.md`, and supporting docs (`research.md`, `data-model.md`, `quickstart.md`, `contracts/`). Runtime code lives in `src/` (add `models/`, `services/`, `cli/` folders as needed), while checks sit in `tests/{unit,integration,contract}`. Store payloads, diagrams, and screenshots inside `specs/.../contracts/` (or an `assets/` child) to keep documentation and artefacts alongside the story.

## Build, Test, and Development Commands
- `bash .specify/scripts/bash/create-new-feature.sh "Add telemetry ingest" --short-name telemetry` scaffolds the numbered spec directory.
- `bash .specify/scripts/bash/setup-plan.sh` copies the latest plan template into `specs/<id>/plan.md`.
- `bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` blocks coding until spec/plan/tasks exist; add it to CI jobs.
- Maintain a thin `Makefile` (or similar) exposing `make deps`, `make build`, and `make test`, each wrapping the real toolchain (`pip`, `npm`, `cargo`, etc.) so contributors run identical commands locally and in CI.

## Coding Style & Naming Conventions
All narrative content—specs, plans, comments, commit messages—must be Japanese. Branches follow `###-short-name` (e.g., `004-observability`); `specs/` directories stay lowercase kebab-case. Code modules use the native language style (`snake_case.py`, `PascalCase.swift`, etc.), while Bash utilities copy `.specify/scripts/bash` (`#!/usr/bin/env bash`, `set -euo pipefail`, four-space indents). Document formatter/linter choices in each plan and surface them through `make lint`.

## Testing Guidelines
Practice strict TDD: create the failing test, observe RED, ship GREEN, then REFACTOR. Target ≥90% coverage and add contract tests for every public interface described in `spec.md`. Use `tests/integration` for flows, `tests/contract` for protocols, and `tests/unit` for fast checks; name files `test_<feature>_<behavior>` with Japanese descriptions. Attach `make test` output to PRs and mark any missing requirements as `NEEDS CLARIFICATION` before coding.

## Commit & Pull Request Guidelines
Commits should resemble `feat: 005 メトリクス収集を追加` (Japanese summary + spec id). PRs must link to `spec.md`, `plan.md`, and `tasks.md`, attach screenshots/logs when UX or CLI output changes, and paste the latest `check-prerequisites` plus `make test` output. Update all touched docs (quickstart, contracts, AGENTS, etc.) in the same branch, rerun `bash .specify/scripts/bash/update-agent-context.sh` when plan metadata changes, and merge only after CI runs build/lint/test and the release workflow promised in the plan.

## Agent Workflow Notes
AGENTS.md is the default onboarding document for automation-friendly contributors. Before editing files, agents should review `.specify/memory/constitution.md`, the active `specs/<id>/plan.md`, and rerun `update-agent-context.sh` so every agent file (Claude, Copilot, Cursor, etc.) reflects the latest stack information and release instructions.
