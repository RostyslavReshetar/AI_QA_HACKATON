# Agent Artefacts — QAHub AI Hackathon 2026

Per Deliverable B: "All prompts, system instructions, and markdown files used to guide the AI agent."

## Architecture

7 specialized agents coordinated by a TypeScript orchestrator. Each agent runs via `claude -p` (Claude CLI pipe mode).

```
Phase 1 — Research
  └── Research Agent → requirements.md

Phase 2 — Test Design (sequential)
  ├── UI Test Design Agent → test-cases/ui-manual-tests.md
  ├── API Test Design Agent → test-cases/api-manual-tests.md
  └── RTM Agent → traceability-matrix.md + risk-matrix.md

Phase 3 — Code Generation (sequential, depends on Phase 2)
  ├── UI Code Gen Agent → automation/ui/ (pages, fixtures, helpers, specs)
  └── API Code Gen Agent → automation/api/ (helpers, schemas, specs)

Phase 4 — Review
  └── Review Agent → review-report.md
```

## Files

### prompts/ — Agent system prompts
- `research.md` — Requirements extraction from InvenTree docs
- `test-design-ui.md` — UI test case generator
- `test-design-api.md` — API test case generator
- `rtm.md` — Traceability & risk matrix builder
- `code-gen-ui.md` — Playwright UI automation generator (POM pattern)
- `code-gen-api.md` — Playwright API automation generator (contract testing)
- `reviewer.md` — Quality review of all generated artifacts

### skills/ — Best-practice reference docs
- `playwright-pom.md` — Page Object Model patterns
- `api-testing.md` — API testing with Playwright APIRequestContext
- `test-case-format.md` — Manual test case format standard
- `self-healing-selectors.md` — Multi-strategy selector fallback

## Orchestrator Implementation

TypeScript CLI: `orchestrator/src/`
- `index.ts` — CLI entry with `--phase`, `--dry-run`, `--verbose`, `--model` flags
- `orchestrator.ts` — Phase coordination and agent execution
- `claude-runner.ts` — Wrapper around `claude -p` with full logging
- `agents/*.ts` — 7 agent classes, each with a `buildPrompt(context)` method

## Conversation Logs

See `../ai-logs/` directory:
- Per-agent JSON logs (prompt + response + metadata)
- `SESSION_TRANSCRIPT.md` — full team-Claude development session

## How to Reproduce

```bash
./scripts/setup.sh              # Start InvenTree Docker
./scripts/run-orchestrator.sh   # Run all 7 agents via claude -p
./scripts/run-tests.sh          # Execute generated Playwright tests
```

Time to generate everything: ~13 minutes (all 7 agents sequentially).
