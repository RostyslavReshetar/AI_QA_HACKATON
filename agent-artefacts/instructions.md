# Agent Artefacts — QAHub AI Hackathon 2026

## Overview

This directory contains all prompts, skills, and instructions used to guide the AI agents in our multi-agent QA orchestration pipeline.

## Architecture

```
Orchestrator (TypeScript CLI)
    │
    ├── Phase 1: Research Agent
    │   ├── Prompt: prompts/research.md
    │   └── Output: requirements.md
    │
    ├── Phase 2: Test Design
    │   ├── UI Test Design Agent (prompts/test-design-ui.md)
    │   │   └── Output: test-cases/ui-manual-tests.md
    │   ├── API Test Design Agent (prompts/test-design-api.md)
    │   │   └── Output: test-cases/api-manual-tests.md
    │   └── RTM Agent (prompts/rtm.md)
    │       └── Output: traceability-matrix.md, risk-matrix.md
    │
    ├── Phase 3: Code Generation
    │   ├── UI Code Gen Agent (prompts/code-gen-ui.md)
    │   │   ├── Skill: skills/playwright-pom.md
    │   │   ├── Skill: skills/self-healing-selectors.md
    │   │   └── Output: automation/ui/**
    │   └── API Code Gen Agent (prompts/code-gen-api.md)
    │       ├── Skill: skills/api-testing.md
    │       └── Output: automation/api/**
    │
    └── Phase 4: Review
        ├── Reviewer Agent (prompts/reviewer.md)
        └── Output: review-report.md
```

## How It Works

1. The orchestrator (`orchestrator/src/index.ts`) is a TypeScript CLI
2. Each agent is defined as a class with a system prompt and a prompt builder
3. The orchestrator runs each agent via `claude -p` (Claude CLI pipe mode)
4. Each agent receives context from previous agents' outputs
5. All interactions are logged to `ai-logs/` with full prompts and responses

## Running the Orchestrator

```bash
# Full pipeline
./scripts/run-orchestrator.sh

# Specific phase only
./scripts/run-orchestrator.sh --phase 1

# Dry run (preview prompts)
./scripts/run-orchestrator.sh --dry-run

# Verbose output
./scripts/run-orchestrator.sh --verbose
```

## Cost Optimization

- Uses `claude -p` (local Claude CLI subscription) instead of API calls
- Can be replaced with Anthropic API calls by swapping `ClaudeRunner` implementation
- Uses Sonnet model by default for cost efficiency (`--model sonnet`)
- Prompts are designed to be concise while comprehensive

## Skills

Skills are markdown documents containing best practices that are appended to agent prompts:

- **playwright-pom.md**: Page Object Model patterns for Playwright
- **api-testing.md**: API testing best practices with Playwright
- **test-case-format.md**: Standardized test case format with preconditions
- **self-healing-selectors.md**: Multi-strategy selector fallback patterns

## AI Tools Used

- **Claude Code** (CLI, `claude -p` pipe mode) — primary agent runtime
- **Claude Opus 4.6** — for complex analysis and code generation
- **Claude Sonnet** — for routine generation tasks (cost optimization)
