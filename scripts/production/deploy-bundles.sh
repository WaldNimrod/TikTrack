#!/bin/bash
# Full deployment script for production bundles
# Usage: ./scripts/production/deploy-bundles.sh

set -e

echo "🚀 Starting Production Bundles Deployment"
echo "=========================================="
echo ""

# Check environment
CURRENT_DIR=$(basename "$(pwd)")
if [[ ! "$CURRENT_DIR" == *"Production"* ]]; then
    echo "⚠️  WARNING: Not in Production directory!"
    echo "   Current directory: $CURRENT_DIR"
    echo "   Expected: TikTrackApp-Production"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Build bundles
echo "📦 Step 1: Building bundles..."
npm run build:bundles
if [ $? -ne 0 ]; then
    echo "❌ Failed to build bundles"
    exit 1
fi
echo "✅ Bundles built successfully"
echo ""

# Step 2: Test bundles
echo "🧪 Step 2: Testing bundles..."
npm run test:bundles
if [ $? -ne 0 ]; then
    echo "❌ Bundle tests failed"
    exit 1
fi
echo "✅ Bundle tests passed"
echo ""

# Step 3: Update pages
echo "📝 Step 3: Updating pages to production mode..."
node scripts/update-all-pages-to-bundles.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to update pages"
    exit 1
fi
echo "✅ Pages updated successfully"
echo ""

# Step 4: Validate setup
echo "🔍 Step 4: Validating production setup..."
node scripts/production/validate-production-setup.js
if [ $? -ne 0 ]; then
    echo "❌ Validation failed"
    exit 1
fi
echo "✅ Validation passed"
echo ""

# Step 5: Run Selenium tests
echo "✅ Step 5: Running Selenium tests..."
python3 scripts/test_pages_console_errors.py
if [ $? -ne 0 ]; then
    echo "⚠️  Selenium tests found errors (check console_errors_report.json)"
    # Don't fail - just warn
fi
echo "✅ Selenium tests completed"
echo ""

echo "=========================================="
echo "✅ Deployment complete!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "   1. Review console_errors_report.json"
echo "   2. Test pages manually"
echo "   3. Create deployment report"
echo "   4. Merge back to main if needed"


