#!/usr/bin/env bash
# Run all automation tests (API + UI)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================="
echo "  Running All Tests"
echo "================================="

# Run API tests
echo ""
echo "==> Running API tests..."
cd automation/api
npx playwright test 2>&1
API_EXIT=$?
cd ../..

echo ""
echo "==> Running UI tests..."
cd automation/ui
npx playwright test 2>&1
UI_EXIT=$?
cd ../..

echo ""
echo "================================="
if [ $API_EXIT -eq 0 ] && [ $UI_EXIT -eq 0 ]; then
  echo "  All tests PASSED"
else
  echo "  Some tests FAILED"
  echo "  API: exit code $API_EXIT"
  echo "  UI:  exit code $UI_EXIT"
fi
echo "================================="
echo ""
echo "View reports:"
echo "  API: cd automation/api && npx playwright show-report"
echo "  UI:  cd automation/ui && npx playwright show-report"

exit $((API_EXIT + UI_EXIT))
