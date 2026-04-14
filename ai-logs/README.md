# AI Interaction Logs

This directory contains the full interaction logs between our multi-agent QA orchestrator and Claude (via `claude -p`).

## Per-Agent Logs

Each `*.json` file is one invocation of an agent. Format:

```json
{
  "timestamp": "ISO-8601",
  "agentName": "research | test-design-ui | ...",
  "phase": 1-4,
  "prompt": "the user prompt sent via stdin",
  "systemPrompt": "full system prompt from orchestrator/prompts/",
  "response": "the full Claude response",
  "durationMs": 12345,
  "success": true,
  "estimatedTokens": { "input": N, "output": N }
}
```

## Orchestrator Run (2026-04-13)

Full pipeline — 7 agents, 25 files generated, 12.7 min total:

| Agent | Duration | Files | Log |
|-------|----------|-------|-----|
| research | 49s | 1 | 2026-04-13T22-45-38-research.json |
| test-design-ui | 93s | 1 | 2026-04-13T22-46-27-test-design-ui.json |
| test-design-api | 110s | 1 | 2026-04-13T22-48-00-test-design-api.json |
| rtm | 98s | 2 | 2026-04-13T22-49-50-rtm.json |
| code-gen-ui | 173s | 9 | 2026-04-13T22-51-29-code-gen-ui.json |
| code-gen-api | 159s | 10 | 2026-04-13T22-54-21-code-gen-api.json |
| reviewer | 83s | 1 | 2026-04-13T22-57-00-reviewer.json |

## Team-Claude Development Chat

See `SESSION_TRANSCRIPT.md` for the full conversation between the team (human) and Claude during orchestrator development. This shows the prompts, decisions, and iterations that built the pipeline itself.
