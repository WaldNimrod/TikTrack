#!/bin/bash

#
# Run Integration Analysis - TikTrack
# ===================================
#
# סקריפט ראשי להרצת כל בדיקות האינטגרציה
#
# Usage: ./scripts/run-integration-analysis.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANALYSIS_DIR="$SCRIPT_DIR/analysis"
REPORTS_DIR="$PROJECT_ROOT/reports/integration-analysis"

echo "🚀 Starting Integration Analysis..."
echo "=================================="
echo ""

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Step 1: Static dependency scan
echo "📊 Step 1: Running static dependency scan..."
node "$ANALYSIS_DIR/system-integration-scanner.js" || {
    echo "⚠️  Static scan had issues, continuing..."
}
echo ""

# Step 2: File analysis (sample files)
echo "📄 Step 2: Running file analysis..."
# Analyze a few key files as examples
if [ -f "$PROJECT_ROOT/trading-ui/scripts/services/data-collection-service.js" ]; then
    node "$ANALYSIS_DIR/system-file-analyzer.js" "$PROJECT_ROOT/trading-ui/scripts/services/data-collection-service.js" > "$REPORTS_DIR/data-collection-service-analysis.json" 2>/dev/null || true
fi
if [ -f "$PROJECT_ROOT/trading-ui/scripts/services/crud-response-handler.js" ]; then
    node "$ANALYSIS_DIR/system-file-analyzer.js" "$PROJECT_ROOT/trading-ui/scripts/services/crud-response-handler.js" > "$REPORTS_DIR/crud-response-handler-analysis.json" 2>/dev/null || true
fi
echo ""

# Step 3: Runtime integration check
echo "🔄 Step 3: Running runtime integration check..."
node "$ANALYSIS_DIR/runtime-integration-checker.js" || {
    echo "⚠️  Runtime check had issues, continuing..."
}
echo ""

# Step 4: Initialization order validation
echo "📋 Step 4: Validating initialization order..."
node "$ANALYSIS_DIR/initialization-order-validator.js" || {
    echo "⚠️  Initialization validation had issues..."
}
echo ""

# Step 5: Generate integration matrix
echo "📊 Step 5: Generating integration matrix..."
node "$ANALYSIS_DIR/generate-integration-matrix.js" || {
    echo "⚠️  Matrix generation had issues..."
}
echo ""

# Step 6: Generate dependency graph
echo "🕸️  Step 6: Generating dependency graph..."
node "$ANALYSIS_DIR/generate-dependency-graph.js" || {
    echo "⚠️  Graph generation had issues..."
}
echo ""

# Step 7: Generate comprehensive report
echo "📝 Step 7: Generating comprehensive report..."
node "$ANALYSIS_DIR/generate-report.js" || {
    echo "⚠️  Report generation had issues..."
}
echo ""

echo "✅ Integration Analysis Complete!"
echo "=================================="
echo ""
echo "📁 Results saved to: $REPORTS_DIR"
echo ""
echo "Files generated:"
ls -lh "$REPORTS_DIR" 2>/dev/null | tail -n +2 | awk '{print "   - " $9 " (" $5 ")"}'
echo ""
echo "Next steps:"
echo "1. Review integration-scan-results.json"
echo "2. Check integration-matrix.md"
echo "3. Review SYSTEM_INTEGRATION_ANALYSIS_REPORT.md"
echo "4. Open runtime-integration-test.html in browser for runtime checks"
echo ""


