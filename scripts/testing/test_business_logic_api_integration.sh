#!/bin/bash

# Business Logic API Integration Testing Script
# =============================================
# Tests all Business Logic API endpoints with the running server

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8080"
API_BASE="${BASE_URL}/api/business"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_ENDPOINTS=()

# Test results file
RESULTS_FILE="test_results_$(date +%Y%m%d_%H%M%S).json"
echo "[]" > "$RESULTS_FILE"

# Function to run a test
run_test() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_key=$4
    local expected_value=$5
    local test_name=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    echo "  Endpoint: ${endpoint}"
    echo "  Method: ${method}"
    echo "  Data: ${data}"
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "\n%{http_code}" -X "${method}" \
        -H "Content-Type: application/json" \
        -d "${data}" \
        "${endpoint}" 2>&1)
    local end_time=$(date +%s%N)
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    local duration_ms=$(( (end_time - start_time) / 1000000 ))
    
    # Check HTTP status
    if [ "$http_code" != "200" ]; then
        echo -e "  ${RED}❌ FAILED: HTTP ${http_code}${NC}"
        echo "  Response: ${body}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_ENDPOINTS+=("${test_name} (HTTP ${http_code})")
        
        # Save to results
        jq --arg name "$test_name" \
           --arg endpoint "$endpoint" \
           --arg status "failed" \
           --arg http_code "$http_code" \
           --arg duration "$duration_ms" \
           --arg response "$body" \
           '. += [{
             "test_name": $name,
             "endpoint": $endpoint,
             "status": $status,
             "http_code": $http_code,
             "duration_ms": ($duration | tonumber),
             "response": $response
           }]' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
        return 1
    fi
    
    # Check response structure
    local status=$(echo "$body" | jq -r '.status // "error"' 2>/dev/null || echo "error")
    if [ "$status" != "success" ]; then
        echo -e "  ${RED}❌ FAILED: status is '${status}'${NC}"
        echo "  Response: ${body}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_ENDPOINTS+=("${test_name} (status: ${status})")
        
        # Save to results
        jq --arg name "$test_name" \
           --arg endpoint "$endpoint" \
           --arg status "failed" \
           --arg http_code "$http_code" \
           --arg duration "$duration_ms" \
           --arg response "$body" \
           '. += [{
             "test_name": $name,
             "endpoint": $endpoint,
             "status": $status,
             "http_code": $http_code,
             "duration_ms": ($duration | tonumber),
             "response": $response
           }]' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
        return 1
    fi
    
    # Check expected value if provided
    if [ -n "$expected_key" ] && [ -n "$expected_value" ]; then
        local actual_value=$(echo "$body" | jq -r ".data.${expected_key}" 2>/dev/null || echo "")
        # Compare as numbers if both are numeric
        if [[ "$actual_value" =~ ^-?[0-9]+\.?[0-9]*$ ]] && [[ "$expected_value" =~ ^-?[0-9]+\.?[0-9]*$ ]]; then
            # Use python for numeric comparison (handles floats, no bc dependency)
            local match=$(python3 -c "
import sys
try:
    actual = float('$actual_value')
    expected = float('$expected_value')
    if abs(actual - expected) < 0.0001:
        print('match')
    else:
        print('nomatch')
except:
    print('nomatch')
" 2>/dev/null || echo "nomatch")
            if [ "$match" != "match" ]; then
                echo -e "  ${RED}❌ FAILED: Expected ${expected_key}=${expected_value}, got ${actual_value}${NC}"
                echo "  Response: ${body}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
                FAILED_ENDPOINTS+=("${test_name} (value mismatch)")
                
                # Save to results
                jq --arg name "$test_name" \
                   --arg endpoint "$endpoint" \
                   --arg status "failed" \
                   --arg http_code "$http_code" \
                   --arg duration "$duration_ms" \
                   --arg response "$body" \
                   '. += [{
                     "test_name": $name,
                     "endpoint": $endpoint,
                     "status": $status,
                     "http_code": $http_code,
                     "duration_ms": ($duration | tonumber),
                     "response": $response
                   }]' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
                return 1
            fi
        else
            # String comparison
            if [ "$actual_value" != "$expected_value" ]; then
                echo -e "  ${RED}❌ FAILED: Expected ${expected_key}=${expected_value}, got ${actual_value}${NC}"
                echo "  Response: ${body}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
                FAILED_ENDPOINTS+=("${test_name} (value mismatch)")
                
                # Save to results
                jq --arg name "$test_name" \
                   --arg endpoint "$endpoint" \
                   --arg status "failed" \
                   --arg http_code "$http_code" \
                   --arg duration "$duration_ms" \
                   --arg response "$body" \
                   '. += [{
                     "test_name": $name,
                     "endpoint": $endpoint,
                     "status": $status,
                     "http_code": $http_code,
                     "duration_ms": ($duration | tonumber),
                     "response": $response
                   }]' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
                return 1
            fi
        fi
    fi
    
    # Check response time
    if [ "$duration_ms" -gt 200 ]; then
        echo -e "  ${YELLOW}⚠️  WARNING: Response time ${duration_ms}ms > 200ms${NC}"
    fi
    
    echo -e "  ${GREEN}✅ PASSED${NC} (${duration_ms}ms)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # Save to results
    jq --arg name "$test_name" \
       --arg endpoint "$endpoint" \
       --arg status "passed" \
       --arg http_code "$http_code" \
       --arg duration "$duration_ms" \
       --arg response "$body" \
       '. += [{
         "test_name": $name,
         "endpoint": $endpoint,
         "status": $status,
         "http_code": $http_code,
         "duration_ms": ($duration | tonumber),
         "response": $response
       }]' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
    
    return 0
}

# Check if server is running
echo -e "${BLUE}Checking if server is running...${NC}"
if ! curl -s "${BASE_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on ${BASE_URL}${NC}"
    echo "Please start the server with: ./start_server.sh"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq is not installed. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    else
        echo "Please install jq manually"
        exit 1
    fi
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Business Logic API Integration Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================================
# Trade Business Service Tests
# ============================================================================
echo -e "${BLUE}--- Trade Business Service ---${NC}"

# Test 1: Calculate Stop Price (Long)
run_test \
    "${API_BASE}/trade/calculate-stop-price" \
    "POST" \
    '{"current_price": 100, "stop_percentage": 10, "side": "Long"}' \
    "stop_price" \
    "90" \
    "Trade: Calculate Stop Price (Long)"

# Test 2: Calculate Stop Price (Short)
run_test \
    "${API_BASE}/trade/calculate-stop-price" \
    "POST" \
    '{"current_price": 100, "stop_percentage": 10, "side": "Short"}' \
    "stop_price" \
    "110" \
    "Trade: Calculate Stop Price (Short)"

# Test 3: Calculate Target Price (Long)
run_test \
    "${API_BASE}/trade/calculate-target-price" \
    "POST" \
    '{"current_price": 100, "target_percentage": 2000, "side": "Long"}' \
    "target_price" \
    "2100" \
    "Trade: Calculate Target Price (Long)"

# Test 4: Calculate Target Price (Short) - Using realistic percentage (50% instead of 2000%)
run_test \
    "${API_BASE}/trade/calculate-target-price" \
    "POST" \
    '{"current_price": 100, "target_percentage": 50, "side": "Short"}' \
    "target_price" \
    "50" \
    "Trade: Calculate Target Price (Short)"

# Test 5: Calculate Percentage From Price (Long)
run_test \
    "${API_BASE}/trade/calculate-percentage-from-price" \
    "POST" \
    '{"current_price": 100, "target_price": 110, "side": "Long"}' \
    "percentage" \
    "10" \
    "Trade: Calculate Percentage From Price (Long)"

# Test 6: Calculate Investment (by quantity)
run_test \
    "${API_BASE}/trade/calculate-investment" \
    "POST" \
    '{"price": 100, "quantity": 10}' \
    "amount" \
    "1000" \
    "Trade: Calculate Investment (by quantity)"

# Test 7: Calculate Investment (by amount)
run_test \
    "${API_BASE}/trade/calculate-investment" \
    "POST" \
    '{"price": 100, "amount": 1000}' \
    "quantity" \
    "10" \
    "Trade: Calculate Investment (by amount)"

# Test 8: Validate Trade (valid)
run_test \
    "${API_BASE}/trade/validate" \
    "POST" \
    '{"price": 100, "quantity": 10, "side": "long", "investment_type": "Investment", "status": "open"}' \
    "is_valid" \
    "true" \
    "Trade: Validate (valid)"

echo ""

# ============================================================================
# Execution Business Service Tests
# ============================================================================
echo -e "${BLUE}--- Execution Business Service ---${NC}"

# Test 9: Calculate Execution Values (Buy)
run_test \
    "${API_BASE}/execution/calculate-values" \
    "POST" \
    '{"quantity": 10, "price": 100, "commission": 1, "action": "buy"}' \
    "total" \
    "-1001" \
    "Execution: Calculate Values (Buy)"

# Test 10: Calculate Execution Values (Sell)
run_test \
    "${API_BASE}/execution/calculate-values" \
    "POST" \
    '{"quantity": 10, "price": 100, "commission": 1, "action": "sell"}' \
    "total" \
    "999" \
    "Execution: Calculate Values (Sell)"

# Test 11: Calculate Average Price
run_test \
    "${API_BASE}/execution/calculate-average-price" \
    "POST" \
    '{"executions": [{"quantity": 10, "price": 100}, {"quantity": 5, "price": 110}]}' \
    "average_price" \
    "" \
    "Execution: Calculate Average Price"

# Test 12: Validate Execution (valid)
run_test \
    "${API_BASE}/execution/validate" \
    "POST" \
    '{"price": 100, "quantity": 10, "action": "buy", "status": "completed"}' \
    "is_valid" \
    "true" \
    "Execution: Validate (valid)"

echo ""

# ============================================================================
# Alert Business Service Tests
# ============================================================================
echo -e "${BLUE}--- Alert Business Service ---${NC}"

# Test 13: Validate Condition Value (Price - valid)
run_test \
    "${API_BASE}/alert/validate-condition-value" \
    "POST" \
    '{"condition_attribute": "price", "condition_number": 100}' \
    "is_valid" \
    "true" \
    "Alert: Validate Condition Value (Price - valid)"

# Test 14: Validate Condition Value (Price - invalid) - This should return HTTP 400
# Note: This test expects HTTP 400, not 200 with is_valid=false
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "${BLUE}Testing: Alert: Validate Condition Value (Price - invalid)${NC}"
echo "  Endpoint: ${API_BASE}/alert/validate-condition-value"
echo "  Method: POST"
echo "  Data: {\"condition_attribute\": \"price\", \"condition_number\": -10}"
start_time=$(date +%s%N)
response=$(curl -s -w "\n%{http_code}" -X "POST" \
    -H "Content-Type: application/json" \
    -d '{"condition_attribute": "price", "condition_number": -10}' \
    "${API_BASE}/alert/validate-condition-value" 2>&1)
end_time=$(date +%s%N)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
duration_ms=$(( (end_time - start_time) / 1000000 ))
if [ "$http_code" = "400" ]; then
    echo -e "  ${GREEN}✅ PASSED${NC} (${duration_ms}ms - HTTP 400 as expected)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ${RED}❌ FAILED: Expected HTTP 400, got ${http_code}${NC}"
    echo "  Response: ${body}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_ENDPOINTS+=("Alert: Validate Condition Value (Price - invalid) (HTTP ${http_code})")
fi
echo ""

# Test 15: Validate Alert (valid)
run_test \
    "${API_BASE}/alert/validate" \
    "POST" \
    '{"condition_attribute": "price", "condition_number": 100}' \
    "is_valid" \
    "true" \
    "Alert: Validate (valid)"

echo ""

# ============================================================================
# Statistics Business Service Tests
# ============================================================================
echo -e "${BLUE}--- Statistics Business Service ---${NC}"

# Note: Statistics service uses a unified /statistics/calculate endpoint
# with calculation_type parameter. We'll test the main endpoint.

# Test 16: Calculate Statistics (KPI)
run_test \
    "${API_BASE}/statistics/calculate" \
    "POST" \
    '{"calculation_type": "kpi", "data": [{"amount": 100}, {"amount": 200}, {"amount": 300}], "params": {"field": "amount"}}' \
    "" \
    "" \
    "Statistics: Calculate (KPI)"

echo ""

# ============================================================================
# Cash Flow Business Service Tests
# ============================================================================
echo -e "${BLUE}--- Cash Flow Business Service ---${NC}"

# Test 19: Calculate Account Balance
run_test \
    "${API_BASE}/cash-flow/calculate-balance" \
    "POST" \
    '{"initial_balance": 1000, "cash_flows": [{"type": "income", "amount": 500}, {"type": "expense", "amount": 200}]}' \
    "balance" \
    "1300" \
    "Cash Flow: Calculate Account Balance"

# Test 20: Validate Cash Flow (valid)
run_test \
    "${API_BASE}/cash-flow/validate" \
    "POST" \
    '{"amount": 100, "type": "income", "source": "manual"}' \
    "is_valid" \
    "true" \
    "Cash Flow: Validate (valid)"

echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
    echo ""
    echo -e "${RED}Failed Endpoints:${NC}"
    for endpoint in "${FAILED_ENDPOINTS[@]}"; do
        echo -e "  ${RED}❌ ${endpoint}${NC}"
    done
else
    echo -e "${GREEN}Failed: 0${NC}"
fi
echo ""
echo -e "Results saved to: ${RESULTS_FILE}"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo -e "Success Rate: ${SUCCESS_RATE}%"
    
    if [ $SUCCESS_RATE -eq 100 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ No tests were run${NC}"
    exit 1
fi

