#!/bin/bash
# Heavy Context Test - simulating heavy chat with lots of history

echo "🔥 Heavy Context Test - Simulating long chat"
echo "=============================================="
echo ""

# Test 1: Very large output (like git diff)
echo "Test 1: Very large output (500+ lines)"
find /Users/nimrod/Documents/TikTrack/TikTrackApp -type f -name "*.py" | head -100
echo "✓ Test 1 passed"
echo ""

# Test 2: Git operations (common in development)
echo "Test 2: Git status (with lots of files)"
git status
echo "✓ Test 2 passed"
echo ""

# Test 3: Multiple rapid commands (like AI doing many operations)
echo "Test 3: Rapid fire commands"
for i in {1..10}; do
  echo "Command $i" && sleep 0.1
done
echo "✓ Test 3 passed"
echo ""

# Test 4: Complex pipe operations
echo "Test 4: Complex pipe operations"
find /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts -name "*.js" -type f | wc -l
echo "✓ Test 4 passed"
echo ""

# Test 5: Long running command with continuous output
echo "Test 5: Continuous output (5 seconds)"
for i in {1..50}; do
  echo "Line $i of continuous output"
  sleep 0.1
done
echo "✓ Test 5 passed"
echo ""

# Test 6: Command that produces JSON (like API calls)
echo "Test 6: JSON output simulation"
echo '{"test":"data","array":[1,2,3,4,5],"nested":{"key":"value"}}'
echo "✓ Test 6 passed"
echo ""

# Test 7: Multiple background processes
echo "Test 7: Multiple background jobs"
(sleep 1 && echo "Job 1 done") &
(sleep 1.5 && echo "Job 2 done") &
(sleep 2 && echo "Job 3 done") &
wait
echo "✓ Test 7 passed"
echo ""

echo "=============================================="
echo "✅ All heavy context tests passed!"
echo "=============================================="

