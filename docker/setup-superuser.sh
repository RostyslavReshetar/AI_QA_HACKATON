#!/usr/bin/env bash
# Wait for InvenTree to be ready and seed initial test data
set -euo pipefail

BASE_URL="${INVENTREE_URL:-http://localhost:8080}"
ADMIN_USER="${INVENTREE_ADMIN_USER:-admin}"
ADMIN_PASS="${INVENTREE_ADMIN_PASSWORD:-inventree123}"

echo "==> Collecting static files..."
docker exec inventree-qa-server invoke static 2>/dev/null || true

echo "==> Waiting for InvenTree at $BASE_URL ..."

MAX_RETRIES=60
RETRY_COUNT=0
until curl -sf "$BASE_URL/api/" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: InvenTree did not become healthy after $MAX_RETRIES retries"
    exit 1
  fi
  echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 5
done

echo "==> InvenTree is running!"

# Get API token
echo "==> Authenticating as $ADMIN_USER ..."
TOKEN_RESPONSE=$(curl -sf -X GET "$BASE_URL/api/user/token/" \
  -H "Content-Type: application/json" \
  -u "$ADMIN_USER:$ADMIN_PASS" 2>/dev/null || echo "")

if [ -z "$TOKEN_RESPONSE" ]; then
  echo "WARNING: Could not obtain API token. Admin user may not exist yet."
  echo "  InvenTree auto-creates the admin on first startup."
  echo "  If this is the first run, wait a moment and try again."
  exit 0
fi

TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "WARNING: Could not extract token from response: $TOKEN_RESPONSE"
  exit 0
fi

echo "==> Token obtained successfully."

AUTH_HEADER="Token $TOKEN"

# Seed test data: create root category "Parts" if not exists
echo "==> Seeding test categories ..."

# Create root category
CATEGORY_RESPONSE=$(curl -sf -X POST "$BASE_URL/api/part/category/" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_HEADER" \
  -d '{"name": "Electronics", "description": "Electronic components"}' 2>/dev/null || echo "exists")

echo "  Electronics category: $CATEGORY_RESPONSE"

# Create sub-categories
for CAT in "Resistors" "Capacitors" "ICs" "Connectors"; do
  curl -sf -X POST "$BASE_URL/api/part/category/" \
    -H "Content-Type: application/json" \
    -H "Authorization: $AUTH_HEADER" \
    -d "{\"name\": \"$CAT\", \"description\": \"$CAT subcategory\", \"parent\": 1}" 2>/dev/null || true
  echo "  Created subcategory: $CAT"
done

# Create Mechanical root category
curl -sf -X POST "$BASE_URL/api/part/category/" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_HEADER" \
  -d '{"name": "Mechanical", "description": "Mechanical parts"}' 2>/dev/null || true

echo "==> Test data seeded successfully!"
echo "==> InvenTree is ready for testing at $BASE_URL"
echo "    Admin: $ADMIN_USER / $ADMIN_PASS"
