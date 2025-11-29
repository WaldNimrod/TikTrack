#!/bin/bash
# Quick Test Script - Multi-User System
# בדיקות מהירות למערכת Multi-User

set -e

echo "=========================================="
echo "Quick Multi-User System Tests"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check server
echo "1. Checking server..."
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    exit 1
fi

# Test login
echo ""
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nimrod","password":"nimw"}' \
  -c /tmp/test_cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q '"status".*"success"'; then
    echo -e "${GREEN}✅ Login successful${NC}"
    USER_ID=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['user']['id'])" 2>/dev/null || echo "N/A")
    echo "   User ID: $USER_ID"
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test authenticated endpoint
echo ""
echo "3. Testing authenticated endpoint (trades)..."
TRADES_RESPONSE=$(curl -s -X GET http://localhost:8080/api/trades/ -b /tmp/test_cookies.txt)
TRADES_COUNT=$(echo "$TRADES_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")

if echo "$TRADES_RESPONSE" | grep -q '"status".*"success"'; then
    echo -e "${GREEN}✅ Trades endpoint works${NC}"
    echo "   Trades count: $TRADES_COUNT"
else
    echo -e "${RED}❌ Trades endpoint failed${NC}"
    echo "   Response: $TRADES_RESPONSE"
fi

# Test user tickers
echo ""
echo "4. Testing user tickers..."
TICKERS_RESPONSE=$(curl -s -X GET http://localhost:8080/api/tickers/my -b /tmp/test_cookies.txt)
TICKERS_COUNT=$(echo "$TICKERS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")

if echo "$TICKERS_RESPONSE" | grep -q '"status".*"success"'; then
    echo -e "${GREEN}✅ User tickers endpoint works${NC}"
    echo "   User tickers count: $TICKERS_COUNT"
else
    echo -e "${RED}❌ User tickers endpoint failed${NC}"
fi

# Test all tickers
echo ""
echo "5. Testing all tickers (shared)..."
ALL_TICKERS_RESPONSE=$(curl -s -X GET http://localhost:8080/api/tickers/ -b /tmp/test_cookies.txt)
ALL_TICKERS_COUNT=$(echo "$ALL_TICKERS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")

if echo "$ALL_TICKERS_RESPONSE" | grep -q '"status".*"success"'; then
    echo -e "${GREEN}✅ All tickers endpoint works${NC}"
    echo "   All tickers count: $ALL_TICKERS_COUNT"
else
    echo -e "${RED}❌ All tickers endpoint failed${NC}"
fi

# Test unauthenticated access
echo ""
echo "6. Testing unauthenticated access protection..."
UNAUTH_RESPONSE=$(curl -s -X GET http://localhost:8080/api/trades/)
if echo "$UNAUTH_RESPONSE" | grep -q '"Authentication required"'; then
    echo -e "${GREEN}✅ Unauthenticated access correctly blocked${NC}"
else
    echo -e "${RED}❌ Unauthenticated access not blocked${NC}"
    echo "   Response: $UNAUTH_RESPONSE"
fi

# Test logout
echo ""
echo "7. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/logout -b /tmp/test_cookies.txt)
if echo "$LOGOUT_RESPONSE" | grep -q '"status".*"success"'; then
    echo -e "${GREEN}✅ Logout successful${NC}"
else
    echo -e "${YELLOW}⚠️ Logout response: $LOGOUT_RESPONSE${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Quick tests completed!${NC}"
echo "=========================================="
echo ""
echo "For comprehensive tests, run:"
echo "  ./Backend/scripts/run_final_tests.sh"
echo ""
echo "For manual testing guide, see:"
echo "  Backend/scripts/FINAL_TESTING_GUIDE.md"

