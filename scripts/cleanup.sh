#!/usr/bin/env bash
# Remove ALL AI-generated artifacts.
# After cleanup, running the orchestrator will regenerate everything.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================="
echo "  Cleanup — Remove AI Artifacts"
echo "================================="
echo ""

# Test cases
echo "==> Removing test cases..."
rm -f test-cases/ui-manual-tests.md
rm -f test-cases/api-manual-tests.md

# UI automation (tests, pages, locators, fixtures, helpers)
echo "==> Removing UI automation code..."
rm -rf automation/ui/tests/
rm -rf automation/ui/pages/
rm -rf automation/ui/locators/
rm -rf automation/ui/fixtures/
rm -rf automation/ui/helpers/
rm -rf automation/ui/test-results/
rm -rf automation/ui/playwright-report/
rm -rf automation/ui/.auth/

# API automation (tests, helpers, schemas)
echo "==> Removing API automation code..."
rm -rf automation/api/tests/
rm -rf automation/api/helpers/
rm -rf automation/api/schemas/
rm -rf automation/api/test-results/
rm -rf automation/api/playwright-report/

# Traceability & risk matrices
echo "==> Removing matrices..."
rm -f traceability-matrix.md
rm -f risk-matrix.md
rm -f review-report.md
rm -f requirements.md

# AI logs
echo "==> Removing AI logs..."
rm -rf ai-logs/*

# Agent artefacts
echo "==> Removing agent artefact copies..."
rm -rf agent-artefacts/prompts/*
rm -rf agent-artefacts/skills/*
rm -f agent-artefacts/instructions.md

echo ""
echo "================================="
echo "  Cleanup complete!"
echo "================================="
echo ""
echo "  Preserved: Docker config, orchestrator code, playwright configs,"
echo "             package.json files, scripts, README, transcription."
echo ""
echo "  To regenerate: ./scripts/run-orchestrator.sh"
