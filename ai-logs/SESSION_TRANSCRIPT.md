# Development Session Transcript — 2026-04-13

Summary of interactions between the team and Claude (Opus 4.6) while building the multi-agent orchestrator for the QAHub AI Hackathon 2026.

## Initial Brief (Team)

> Team provided GitHub repo URL with:
> - Problem Statement PDF
> - `transcription.md` — voice notes from team discussion about winning the hackathon

Key team requirements (from voice transcription):
- Multi-agent orchestration (not just chat)
- Agent pipeline: Research → Test Design → Code Gen → Review
- RTM (Requirements Traceability Matrix)
- Skills per agent (best-practice markdown files)
- Log every AI request to `ai-logs/` folder
- Push all changes to main branch, logical commits
- TypeScript + Playwright
- Use Superpowers / Claude Code features
- Cost optimization — use `claude -p` (subscription), not API

## Question-Answer Phase

Claude asked 13 clarifying questions. Team answers:
1. InvenTree Docker — set up from scratch
2. Latest stable version
3. Any free port (used 8080)
4. No existing credentials — create superuser via env
5. Orchestrator uses `claude -p` (not API) — cost optimization
6. Add cleanup script that removes all AI-generated files
7. Same as #5 — no API, use local Claude CLI
8. Implement ALL differentiating features
9. Quality > quantity, 100% critical coverage, use preconditions
10. API tests on Playwright (APIRequestContext)
11. Deadline 24h, 12h to execute, don't rush
12. Prepare video scenario after everything done
13. Only Claude pushes to repo

## Plan Mode

Claude wrote comprehensive plan to `/Users/illia/.claude/plans/sunny-cooking-stearns.md`:
- 7 phases
- Project structure with orchestrator/, automation/ui/, automation/api/
- 7 agents, 4 skills, 14 logical commits
- Verification strategy

Team approved, execution began.

## Execution — Multiple Iterations

### Iteration 1 — Initial Build
- Set up InvenTree Docker (postgres + redis + caddy + inventree server/worker)
- Scaffolded orchestrator (TypeScript, claude-runner, 7 agents, prompts, skills)
- Dispatched parallel subagents:
  - Created 105 UI manual test cases
  - Created 97 API manual test cases
  - Built 80 Playwright API tests (all passing)

### Iteration 2 — UI Automation
Subagents hit rate limit — Claude wrote UI automation directly:
- 6 page objects (base, login, parts-list, part-detail, part-create, categories)
- Self-healing selectors with fallback chain
- Auth fixture, test data factory
- 8 spec files

### Iteration 3 — Fix Selectors
Ran UI tests → all failed because:
- URL pattern: `/web/` not `/platform/`
- Login fields use aria label `login-username`, not `name` attribute
- Part detail uses sidebar nav, not `role="tab"` tablist
- Static files needed `invoke static` in Docker

Used Playwright MCP to inspect real DOM, fixed all selectors. Result: 21/21 UI tests passing.

### Iteration 4 — CI/CD Attempts
- Added GitHub Actions workflow
- CI failed: `npm ci` without lock file
- CI failed: static files not collected
- CI failed: global setup got 0 cookies (auth issue in headless CI)
- Tried: API-based auth fallback via Django login endpoint — got 403 (CSRF)
- Tried: HTTP-only session extraction — worked locally but flaky in CI
- Team decision: drop CI (not required by task), focus on local demo

### Iteration 5 — Orchestrator Debugging
First orchestrator run failed: `Not logged in - Please run /login`
- Root cause: `CLAUDE_CODE_SIMPLE=1` in subprocess env broke OAuth
- Fix: removed env override

Second run failed: timeout after 5 min
- Root cause: `--append-system-prompt` with 5KB markdown + stdin prompt too large
- Fix: removed `--append-system-prompt`, kept only stdin prompt

Third run failed: `Error: Reached max turns (1)`
- Root cause: `--max-turns 1` blocked tool use that Claude attempted
- Fix: removed `--max-turns 1`

Fourth run: Claude tried to use Write tool, got permission blocked
- Root cause: Claude in agentic mode tried to write files itself
- Fix: added `--allowedTools ""` to disable all tools

Fifth run: **SUCCESS** — 7/7 agents, 25 files, 12.7 min

## Final State

Repository shipped in clean state. Jury workflow:
```bash
git clone <repo>
./scripts/setup.sh
./scripts/run-orchestrator.sh   # ~13 min, generates everything live
./scripts/run-tests.sh           # run generated Playwright tests
```

## Key Lessons Learned

1. **`claude -p` auth**: subprocess inherits OAuth automatically — don't override env
2. **Shell escaping**: large prompts with quotes break `--append-system-prompt`
3. **Tool control**: use `--allowedTools ""` for pure text output mode
4. **Real DOM inspection**: use Playwright MCP to verify selectors against live app
5. **Cost optimization**: Sonnet model + compact prompts + `claude -p` = no API costs
