# QAHub AI Hackathon 2026 — Multi-Agent QA Orchestrator

AI-powered end-to-end quality engineering for InvenTree's Parts module, driven by a multi-agent orchestrator.

## Architecture

```
                    ┌─────────────────────┐
                    │   QA Orchestrator    │
                    │   (TypeScript CLI)   │
                    └────────┬────────────┘
                             │ claude -p
        ┌────────────────────┼────────────────────┐
        │                    │                     │
   Phase 1              Phase 2               Phase 3
   Research            Test Design           Code Generation
        │                    │                     │
  ┌─────┴─────┐    ┌────────┴────────┐    ┌──────┴──────┐
  │ Research   │    │ UI Test Design  │    │ UI CodeGen  │
  │ Agent      │    │ API Test Design │    │ API CodeGen │
  │            │    │ RTM Agent       │    │             │
  └─────┬─────┘    └────────┬────────┘    └──────┬──────┘
        │                    │                     │
        ▼                    ▼                     ▼
  requirements.md    test-cases/           automation/
                     traceability-matrix   ui/ + api/
                     risk-matrix
                                      ┌──────────────┐
                              ───────▶│ Review Agent  │
                              Phase 4 │              │
                                      └──────────────┘
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+
- Claude Code CLI (`claude`) — for the orchestrator

### 1. Start InvenTree

```bash
cd AI_QA_HACKATON
./scripts/setup.sh
```

This will:
- Start InvenTree v1.3.0 in Docker (PostgreSQL + Redis + Caddy + server + worker)
- Collect static files for the web UI
- Create admin user (`admin` / `inventree123`)
- Seed test categories (Electronics, Resistors, Capacitors, ICs, Connectors, Mechanical)
- Install all npm dependencies
- Install Chromium for Playwright

InvenTree will be available at **http://localhost:8080**

### 2. Run the AI Orchestrator (generates everything)

```bash
./scripts/run-orchestrator.sh
```

The orchestrator uses `claude -p` (Claude CLI pipe mode) to coordinate 7 specialized AI agents that generate all QA artifacts:

| Phase | Agent | Output |
|-------|-------|--------|
| 1 | Research Agent | `requirements.md` — structured requirements from InvenTree docs |
| 2 | UI Test Design Agent | `test-cases/ui-manual-tests.md` — 100+ UI test cases |
| 2 | API Test Design Agent | `test-cases/api-manual-tests.md` — 90+ API test cases |
| 2 | RTM Agent | `traceability-matrix.md` + `risk-matrix.md` |
| 3 | UI Code Gen Agent | `automation/ui/` — Playwright UI tests (POM, self-healing) |
| 3 | API Code Gen Agent | `automation/api/` — Playwright API tests (contract testing) |
| 4 | Review Agent | `review-report.md` — quality review |

**Note:** This repository is shipped in a **clean state** — all test artifacts have been removed. Running the orchestrator regenerates everything from scratch. This demonstrates that the AI agents can produce all QA artifacts autonomously.

### 3. Run Tests

```bash
# All tests (API + UI)
./scripts/run-tests.sh

# API tests only (80 tests, ~10s)
cd automation/api && npx playwright test

# UI tests only (21 tests, ~1min)
cd automation/ui && npx playwright test

# UI tests with visible browser
cd automation/ui && npx playwright test --headed

# View HTML reports
cd automation/api && npx playwright show-report
cd automation/ui && npx playwright show-report
```

### 4. Cleanup (remove all AI-generated artifacts)

```bash
./scripts/cleanup.sh
```

Removes all AI-generated files (test cases, automation code, matrices, logs, artefacts). Preserves infrastructure (Docker, orchestrator, configs, scripts).

### 5. Stop InvenTree

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env down -v
```

## What the Orchestrator Generates

When you run `./scripts/run-orchestrator.sh`, the AI agents create:

### Test Cases
- **105 UI manual test cases** — Part CRUD, categories, attributes, parameters, templates/variants, revisions, units, images, negative/boundary scenarios
- **~90 API manual test cases** — CRUD, filtering, pagination, field validation, relational integrity, schema contract, edge cases

### Automation
- **80 Playwright API tests** across 7 suites: parts-crud, parts-filtering, parts-validation, parts-categories, parts-relations, schema-contract, edge-cases
- **21 Playwright UI tests** across 8 suites: part-crud, part-categories, part-parameters, part-variants, part-revisions, part-bom, part-stock, cross-functional-flow

### Quality Artifacts
- **Requirements Traceability Matrix** — 52 requirements mapped to 195+ test cases with gap analysis
- **Risk-Based Prioritization Matrix** — 4-phase execution order by business impact
- **AI Interaction Logs** — full prompt/response logs in `ai-logs/`

## Project Structure

```
├── docker/                     # InvenTree Docker setup
│   ├── docker-compose.yml      # PostgreSQL + Redis + InvenTree + Caddy
│   ├── .env                    # Environment config
│   └── setup-superuser.sh      # Seed test data
├── orchestrator/               # Multi-agent AI orchestrator
│   ├── src/                    # TypeScript source (7 agents + CLI)
│   ├── prompts/                # Agent system prompts
│   └── skills/                 # Best-practice reference docs
├── automation/
│   ├── ui/                     # Playwright UI tests (generated by AI)
│   │   ├── playwright.config.ts
│   │   └── package.json
│   └── api/                    # Playwright API tests (generated by AI)
│       ├── playwright.config.ts
│       └── package.json
├── test-cases/                 # Manual test cases (generated by AI)
├── agent-artefacts/            # Copies of all AI prompts/skills
├── ai-logs/                    # Full AI interaction logs
├── scripts/
│   ├── setup.sh                # One-command setup
│   ├── run-orchestrator.sh     # Run AI agent pipeline
│   ├── run-tests.sh            # Run all automation tests
│   └── cleanup.sh              # Remove all AI artifacts
├── traceability-matrix.md      # RTM (generated by AI)
├── risk-matrix.md              # Risk matrix (generated by AI)
└── video/scenario.md           # Video demo script
```

## Differentiating Features

1. **Multi-Agent Orchestration** — 7 specialized AI agents coordinated by a TypeScript CLI, not copy-paste from chat
2. **Requirements Traceability Matrix** — every requirement linked to test cases with gap analysis
3. **Risk-Based Prioritization** — tests ordered by Likelihood x Business Impact scoring
4. **Self-Healing Selectors** — multi-strategy fallback: data-testid > role/aria > text > CSS
5. **Contract Testing** — JSON Schema validation of every API response via `ajv`
6. **Page Object Model** — strict POM with separate locators, pages, fixtures, helpers
7. **Full AI Logging** — every agent interaction logged with timestamps and token estimates

## Orchestrator Options

```bash
./scripts/run-orchestrator.sh                    # Full pipeline (all 4 phases)
./scripts/run-orchestrator.sh --phase 1          # Research only
./scripts/run-orchestrator.sh --phase 2          # Test design only
./scripts/run-orchestrator.sh --phase 3          # Code generation only
./scripts/run-orchestrator.sh --dry-run           # Preview prompts without calling Claude
./scripts/run-orchestrator.sh --model opus        # Use Opus for higher quality
./scripts/run-orchestrator.sh --verbose           # Show full AI output
```

## Cost Note

This project uses `claude -p` (Claude Code CLI pipe mode) which runs on a local Claude subscription. **No API keys or credits required.** For API-based execution, swap the `ClaudeRunner` class in `orchestrator/src/claude-runner.ts` with an Anthropic API client — the agent prompts and skills remain identical.

## Verified Results (Local)

| Suite | Tests | Status | Duration |
|-------|-------|--------|----------|
| API Automation | 80 | All passing | ~10s |
| UI Automation | 21 | All passing | ~1.1min |

## Team

QAHub AI Hackathon 2026. All test artifacts generated by AI agents under human architectural direction.
