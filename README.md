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

```bash
# 1. Clone and setup
git clone https://github.com/RostyslavReshetar/AI_QA_HACKATON.git
cd AI_QA_HACKATON
./scripts/setup.sh

# 2. Run all tests
./scripts/run-tests.sh

# 3. Or run the AI orchestrator to regenerate artifacts
./scripts/run-orchestrator.sh
```

## Prerequisites

- Docker & Docker Compose
- Node.js 22+
- Claude Code CLI (`claude`) — for orchestrator only

## Project Structure

```
├── docker/                     # InvenTree Docker setup
│   ├── docker-compose.yml      # PostgreSQL + Redis + InvenTree + Caddy
│   ├── .env                    # Environment config
│   └── setup-superuser.sh      # Seed test data
├── orchestrator/               # Multi-agent AI orchestrator
│   ├── src/                    # TypeScript source
│   │   ├── index.ts            # CLI entry point
│   │   ├── orchestrator.ts     # Phase coordination
│   │   ├── claude-runner.ts    # claude -p wrapper + logging
│   │   └── agents/             # 7 agent implementations
│   ├── prompts/                # Agent system prompts (MD)
│   └── skills/                 # Best-practice skills (MD)
├── automation/
│   ├── ui/                     # Playwright UI tests
│   │   ├── tests/              # 8 spec files
│   │   ├── pages/              # Page Object Model (6 pages)
│   │   ├── locators/           # Centralized selectors
│   │   ├── fixtures/           # Auth + test data fixtures
│   │   └── helpers/            # Self-healing selectors
│   └── api/                    # Playwright API tests
│       ├── tests/              # 7 spec files (80 tests)
│       ├── helpers/            # API client, auth, schema validator
│       └── schemas/            # JSON Schema for contract testing
├── test-cases/
│   ├── ui-manual-tests.md      # 105 UI test cases
│   └── api-manual-tests.md     # ~90 API test cases
├── agent-artefacts/            # All AI prompts and skills
├── ai-logs/                    # AI interaction logs
├── traceability-matrix.md      # Requirements → test case mapping
├── risk-matrix.md              # Risk-based test prioritization
├── scripts/                    # Setup, run, cleanup scripts
└── .github/workflows/ci.yml   # GitHub Actions CI
```

## Test Coverage

| Area | UI Tests | API Tests | Automation |
|------|----------|-----------|------------|
| Part CRUD | 20 cases | 27 cases | Full |
| Categories | 10 cases | 17 cases | Full |
| Attributes | 14 cases | via CRUD | Partial |
| Parameters | 8 cases | — | Partial |
| Templates/Variants | 6 cases | 4 cases | Full |
| Revisions | 6 cases | 4 cases | Full |
| Stock | 6 cases | — | Partial |
| BOM | 9 cases | 2 cases | Partial |
| Field Validation | 10 cases | 21 cases | Full |
| Filtering/Search | 4 cases | 16 cases | Full |
| Schema Contract | — | 8 cases | Full |
| Edge Cases | 8 cases | 13 cases | Full |

## Differentiating Features

### 1. Multi-Agent Orchestration
Not "I asked Claude to write tests" — a pipeline of 7 specialized agents coordinated by an orchestrator CLI using `claude -p`.

### 2. Requirements Traceability Matrix (RTM)
52 requirements mapped to 195+ test cases with gap analysis and coverage statistics.

### 3. Risk-Based Test Prioritization
4-phase execution order (Critical → Low) based on Likelihood × Business Impact scoring.

### 4. Self-Healing Selectors
Multi-strategy fallback chain: `data-testid → role/aria → text → CSS → XPath`. DOM snapshot + screenshot on failure.

### 5. Contract Testing
JSON Schema validation of every API response using `ajv`. Catches discrepancies between documentation and actual API behavior.

### 6. CI/CD Ready
GitHub Actions workflow: start InvenTree in Docker → run API tests → run UI tests → upload HTML reports.

### 7. Cost Optimization
Uses `claude -p` (local CLI subscription) instead of API calls. All AI interactions logged for transparency.

## Running Tests

```bash
# All tests
./scripts/run-tests.sh

# API tests only
cd automation/api && npx playwright test

# UI tests only (headless)
cd automation/ui && npx playwright test

# UI tests (headed — see the browser)
cd automation/ui && npx playwright test --headed

# View test reports
cd automation/api && npx playwright show-report
cd automation/ui && npx playwright show-report
```

## Orchestrator Usage

```bash
# Full pipeline (all 4 phases)
./scripts/run-orchestrator.sh

# Specific phase
./scripts/run-orchestrator.sh --phase 1    # Research only
./scripts/run-orchestrator.sh --phase 2    # Test design only
./scripts/run-orchestrator.sh --phase 3    # Code generation only

# Preview mode (no AI calls)
./scripts/run-orchestrator.sh --dry-run

# Use Opus model for higher quality
./scripts/run-orchestrator.sh --model opus
```

## Cleanup

```bash
# Remove all AI-generated artifacts
./scripts/cleanup.sh

# Stop InvenTree Docker
docker compose -f docker/docker-compose.yml down -v
```

The cleanup script removes: test cases, automation code (tests/pages/locators/fixtures/helpers), RTM, risk matrix, AI logs, and agent artefact copies. It preserves: Docker config, orchestrator source, playwright configs, package.json files, scripts, and this README.

## Cost Note

This project uses `claude -p` (Claude Code CLI in pipe mode) which runs on your local Claude subscription. No API keys or credits are required.

For API-based execution, replace the `ClaudeRunner` class in `orchestrator/src/claude-runner.ts` with an Anthropic API client. The agent prompts and skills remain the same.

## Team

QAHub AI Hackathon 2026 participants. All code generated by AI agents under human architectural direction.
