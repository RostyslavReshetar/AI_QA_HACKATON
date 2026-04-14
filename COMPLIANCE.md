# Compliance Checklist — QAHub AI Hackathon 2026

Verification of all requirements from the Problem Statement PDF.

## Section 3 — Problem Statement

### Phase 1 — Requirements Analysis & Test Case Generation (UI)

| Requirement | Status | Location |
|-------------|--------|----------|
| Ingest InvenTree Parts documentation | ✅ | Research Agent (`orchestrator/prompts/research.md`) |
| Include sub-pages (Views, Parameters, Templates, Revisions, Creating) | ✅ | Research Agent covers all modules |
| Part creation — manual entry and import flows | ✅ | UI Test Design Agent covers both |
| Part detail view — all tabs | ✅ | Stock, BOM, Allocated, Build Orders, Parameters, Variants, Revisions, Attachments, Related Parts, Test Templates |
| Part categories — hierarchy, filtering, parametric tables | ✅ | UI Test Design Agent |
| Part attributes — Virtual, Template, Assembly, Component, Trackable, Purchaseable, Salable, Active/Inactive | ✅ | UI Test Design Agent |
| Units of measure configuration | ✅ | UI Test Design Agent |
| Part revisions — creation, constraints | ✅ | UI Test Design Agent |
| Negative and boundary scenarios | ✅ | UI Test Design Agent |

### Phase 2 — API Specification Analysis & API Test Generation

| Requirement | Status | Location |
|-------------|--------|----------|
| Ingest API schema from InvenTree docs | ✅ | Research Agent + API Test Design Agent |
| CRUD on Parts and Categories | ✅ | API Test Design Agent |
| Filtering, pagination, search | ✅ | API Test Design Agent |
| Field-level validation (required, max lengths, nullable, read-only) | ✅ | API Test Design Agent |
| Relational integrity (category, default_location, supplier) | ✅ | API Test Design Agent |
| Edge cases (invalid payloads, unauthorized, conflicts) | ✅ | API Test Design Agent |
| Executable against running InvenTree (Docker) | ✅ | `docker/docker-compose.yml` |
| Positive, negative, boundary scenarios | ✅ | API Code Gen Agent |
| Assertions on status codes, response schema, business logic | ✅ | Contract testing via JSON Schema + ajv |
| Data-driven/parameterized testing | ✅ | API Code Gen Agent skill |

### Phase 3 — UI Automation Scripts

| Requirement | Status | Location |
|-------------|--------|----------|
| Framework choice (Playwright) | ✅ | TypeScript + Playwright |
| Core Part CRUD workflows | ✅ | UI Code Gen Agent |
| Validate UI elements, navigation, form behavior | ✅ | UI Code Gen Agent |
| Cross-functional flow (create part → parameters → stock → category verify) | ✅ | `cross-functional-flow.spec.ts` |
| Robust waits, selectors, assertions | ✅ | Self-healing selectors skill |

## Section 5 — Expected Deliverables

### A. Test Artefacts

| Deliverable | Format Required | Status | Location |
|-------------|----------------|--------|----------|
| UI manual test cases | Spreadsheet/Markdown | ✅ Markdown | Generated → `test-cases/ui-manual-tests.md` |
| API manual test cases | Spreadsheet/Markdown | ✅ Markdown | Generated → `test-cases/api-manual-tests.md` |
| UI automation scripts | Runnable project | ✅ Playwright TS | Generated → `automation/ui/` |
| API automation scripts | Runnable project | ✅ Playwright TS | Generated → `automation/api/` |

**Note:** Test artefacts are generated live by the orchestrator (not pre-committed) to demonstrate the agentic workflow. Jury runs `./scripts/run-orchestrator.sh` to create them.

### B. Agent Artefacts

| Deliverable | Status | Location |
|-------------|--------|----------|
| Agent prompts & instructions | ✅ | `agent-artefacts/prompts/` (7 files) + `orchestrator/prompts/` |
| Skills/markdown files | ✅ | `agent-artefacts/skills/` (4 files) + `orchestrator/skills/` |
| Conversation logs (optional) | ✅ | `ai-logs/` (12 JSON logs + `SESSION_TRANSCRIPT.md`) |

### C. Video Recording

| Deliverable | Status | Location |
|-------------|--------|----------|
| Screen recording of end-to-end flow | ⏳ To be recorded | Script ready at `video/scenario.md` |
| Show: agent generating test cases from requirements | ⏳ | Scene 3 in scenario |
| Show: agent generating automation scripts from API spec | ⏳ | Scene 3 in scenario |

## Section 6 — Rules & Guidelines

| Rule | Status | Evidence |
|------|--------|----------|
| Use AI-agentic tool | ✅ | Claude Code CLI (`claude -p` pipe mode) |
| Choose automation framework | ✅ | Playwright + TypeScript |
| Code reviewable and runnable | ✅ | All code generated, TypeScript, Playwright configs included |
| Document any manual fixes | ✅ | `ai-logs/SESSION_TRANSCRIPT.md` documents all iterations |
| Agent artefacts demonstrate workflow (prompts + logs) | ✅ | Full prompts + conversation logs present |
| NOT hand-written tests disguised as agent-generated | ✅ | Orchestrator generates everything live |

## Section 7 — Submission

| Requirement | Status |
|-------------|--------|
| Single Git repository | ✅ https://github.com/RostyslavReshetar/AI_QA_HACKATON |
| Contains all deliverables | ✅ See above |

## Differentiating Features Added Beyond Requirements

1. **Multi-agent orchestration** — 7 specialized agents, not a single chat prompt
2. **Requirements Traceability Matrix (RTM)** — 150+ requirements mapped to test cases
3. **Risk-based test prioritization** — 4-phase execution order by business impact
4. **Self-healing selectors** — multi-strategy fallback chain for robust UI tests
5. **Contract testing** — JSON Schema validation of every API response via `ajv`
6. **Full AI logging** — complete transparency of every agent interaction
7. **Cost optimization** — runs on local Claude CLI subscription, no API costs
8. **Reproducibility** — one command (`./scripts/run-orchestrator.sh`) regenerates everything
9. **Clean-state submission** — jury verifies the orchestrator actually works, not just reads pre-generated files

## Verification

To verify compliance, run:

```bash
./scripts/setup.sh              # ~3 min — Start InvenTree
./scripts/run-orchestrator.sh   # ~13 min — 7 agents generate all artefacts
./scripts/run-tests.sh          # ~2 min — Execute tests

# Artefacts to check after run:
ls test-cases/                  # ui-manual-tests.md + api-manual-tests.md
ls automation/ui/tests/         # Playwright UI spec files
ls automation/api/tests/        # Playwright API spec files
cat traceability-matrix.md      # RTM with coverage gaps
cat risk-matrix.md              # Risk-based prioritization
cat review-report.md            # AI-generated quality review
ls ai-logs/                     # Full agent interaction logs
```
