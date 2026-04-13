#!/usr/bin/env bash
# Full setup: start Docker, install deps, seed data
set -euo pipefail
cd "$(dirname "$0")/.."

echo "================================="
echo "  QAHub AI Hackathon 2026 Setup"
echo "================================="

# 1. Start InvenTree Docker
echo ""
echo "==> Starting InvenTree Docker containers..."
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d

# 2. Wait for InvenTree to be ready
echo "==> Waiting for InvenTree to be ready..."
MAX_RETRIES=60
for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf http://localhost:8080/api/ > /dev/null 2>&1; then
    echo "  InvenTree is ready!"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "ERROR: InvenTree did not start in time."
    exit 1
  fi
  echo "  Waiting... ($i/$MAX_RETRIES)"
  sleep 5
done

# 3. Seed test data
echo ""
echo "==> Seeding test data..."
bash docker/setup-superuser.sh

# 4. Install dependencies
echo ""
echo "==> Installing orchestrator dependencies..."
cd orchestrator && npm install && cd ..

echo ""
echo "==> Installing API test dependencies..."
cd automation/api && npm install && cd ../..

echo ""
echo "==> Installing UI test dependencies..."
cd automation/ui && npm install && npx playwright install chromium && cd ../..

echo ""
echo "================================="
echo "  Setup complete!"
echo "================================="
echo ""
echo "  InvenTree: http://localhost:8080"
echo "  Login:     admin / inventree123"
echo ""
echo "  Run tests:       ./scripts/run-tests.sh"
echo "  Run orchestrator: ./scripts/run-orchestrator.sh"
echo "  Cleanup:         ./scripts/cleanup.sh"
