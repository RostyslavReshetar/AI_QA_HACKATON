#!/usr/bin/env bash
# Run the AI orchestrator to generate all QA artifacts
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================="
echo "  QA Orchestrator — AI Pipeline"
echo "================================="
echo ""
echo "This orchestrator uses 'claude -p' (Claude CLI pipe mode)"
echo "to coordinate multiple AI agents for QA engineering."
echo ""
echo "Agents:"
echo "  1. Research     — Parse docs, extract requirements"
echo "  2. Test Design  — Generate UI/API test cases"
echo "  3. RTM          — Build traceability & risk matrices"
echo "  4. Code Gen     — Generate Playwright automation"
echo "  5. Review       — Quality review of all artifacts"
echo ""

# Check prerequisites
if ! command -v claude &> /dev/null; then
  echo "ERROR: 'claude' CLI not found. Install Claude Code first."
  echo "       https://claude.ai/claude-code"
  exit 1
fi

# Pass all arguments to the orchestrator
cd orchestrator
npx tsx src/index.ts "$@"
