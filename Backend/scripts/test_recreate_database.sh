#!/bin/bash
# Test script for recreate_database_with_base_data.py
# This script safely tests the database recreation without affecting the active database

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Configuration
SOURCE_DB="Backend/db/tiktrack.db"
TEST_DB="Backend/db/tiktrack_test_recreate.db"
BACKUP_DB="Backend/db/tiktrack_backup_for_test_$(date +%Y%m%d_%H%M%S).db"

echo "🧪 TikTrack Database Recreation Test Script"
echo "=========================================="
echo ""

# Step 1: Verify source database exists
if [ ! -f "$SOURCE_DB" ]; then
    echo "❌ Error: Source database not found: $SOURCE_DB"
    exit 1
fi

echo "✅ Source database found: $SOURCE_DB"

# Step 2: Create backup of source database
echo ""
echo "📦 Creating backup of source database..."
cp "$SOURCE_DB" "$BACKUP_DB"
echo "✅ Backup created: $BACKUP_DB"

# Step 3: Remove test database if exists
if [ -f "$TEST_DB" ]; then
    echo ""
    echo "🗑️  Removing existing test database..."
    rm "$TEST_DB"
    echo "✅ Test database removed"
fi

# Step 4: Run the recreation script on test database
echo ""
echo "🚀 Running recreation script on test database..."
echo "   Source: $SOURCE_DB"
echo "   Target: $TEST_DB"
echo ""

python3 Backend/scripts/recreate_database_with_base_data.py \
    --source-db "$SOURCE_DB" \
    --db-path "$TEST_DB" <<< "yes"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Script failed!"
    echo "💾 Backup available at: $BACKUP_DB"
    exit 1
fi

# Step 5: Verify test database was created
if [ ! -f "$TEST_DB" ]; then
    echo ""
    echo "❌ Error: Test database was not created!"
    exit 1
fi

echo ""
echo "✅ Test database created: $TEST_DB"

# Step 6: Run verification checks
echo ""
echo "🔍 Running verification checks..."
echo ""

# Check table counts
echo "📊 Table counts comparison:"
echo "----------------------------"

# Function to get table count
get_table_count() {
    local db_file=$1
    sqlite3 "$db_file" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('tickers_backup', 'tickers_new', 'tag_categories', 'user_preferences_v3');" 2>/dev/null || echo "0"
}

# Function to get row count for a table
get_row_count() {
    local db_file=$1
    local table=$2
    sqlite3 "$db_file" "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "0"
}

SOURCE_TABLES=$(get_table_count "$SOURCE_DB")
TEST_TABLES=$(get_table_count "$TEST_DB")

echo "Source database tables: $SOURCE_TABLES"
echo "Test database tables: $TEST_TABLES"

if [ "$SOURCE_TABLES" -eq "$TEST_TABLES" ]; then
    echo "✅ Table count matches"
else
    echo "⚠️  Warning: Table count mismatch!"
fi

# Check key tables
echo ""
echo "📋 Key tables verification:"
echo "----------------------------"

check_table() {
    local table=$1
    local source_count=$(get_row_count "$SOURCE_DB" "$table")
    local test_count=$(get_row_count "$TEST_DB" "$table")
    
    if [ "$source_count" = "$test_count" ]; then
        echo "✅ $table: $test_count rows (matches source)"
    else
        echo "⚠️  $table: $test_count rows (source: $source_count)"
    fi
}

# Check base data tables
echo ""
echo "Base data tables:"
check_table "currencies"
check_table "users"
check_table "note_relation_types"
check_table "external_data_providers"
check_table "trading_methods"
check_table "method_parameters"
check_table "preference_groups"
check_table "preference_types"
check_table "preference_profiles"
check_table "constraints"
check_table "enum_values"

# Check special tables
echo ""
echo "Special tables:"
check_table "user_preferences"
check_table "tickers"

# Check empty tables
echo ""
echo "Empty tables (should be 0):"
check_table "trades"
check_table "trade_plans"
check_table "executions"
check_table "cash_flows"
check_table "trading_accounts"
check_table "alerts"

# Verify specific requirements
echo ""
echo "🎯 Specific requirements verification:"
echo "-------------------------------------"

# Check nimrod user exists
NIMROD_COUNT=$(sqlite3 "$TEST_DB" "SELECT COUNT(*) FROM users WHERE id = 1 AND username = 'nimrod';" 2>/dev/null || echo "0")
if [ "$NIMROD_COUNT" -eq "1" ]; then
    echo "✅ nimrod user (id=1) exists"
else
    echo "❌ Error: nimrod user not found or multiple users exist"
fi

# Check only one user
USER_COUNT=$(get_row_count "$TEST_DB" "users")
if [ "$USER_COUNT" -eq "1" ]; then
    echo "✅ Only 1 user in database (as expected)"
else
    echo "⚠️  Warning: Expected 1 user, found $USER_COUNT"
fi

# Check SPY ticker exists
SPY_COUNT=$(sqlite3 "$TEST_DB" "SELECT COUNT(*) FROM tickers WHERE id = 9 AND symbol = 'SPY';" 2>/dev/null || echo "0")
if [ "$SPY_COUNT" -eq "1" ]; then
    echo "✅ SPY ticker (id=9) exists"
else
    echo "❌ Error: SPY ticker not found"
fi

# Check only one ticker
TICKER_COUNT=$(get_row_count "$TEST_DB" "tickers")
if [ "$TICKER_COUNT" -eq "1" ]; then
    echo "✅ Only 1 ticker in database (SPY)"
else
    echo "⚠️  Warning: Expected 1 ticker, found $TICKER_COUNT"
fi

# Check preference profiles
PROFILE_COUNT=$(get_row_count "$TEST_DB" "preference_profiles")
echo "✅ Preference profiles: $PROFILE_COUNT"

# Check user preferences for nimrod
NIMROD_PREFS=$(sqlite3 "$TEST_DB" "SELECT COUNT(*) FROM user_preferences WHERE user_id = 1;" 2>/dev/null || echo "0")
echo "✅ User preferences for nimrod: $NIMROD_PREFS"

# Check excluded tables don't exist
echo ""
echo "🚫 Excluded tables verification:"
echo "---------------------------------"

if sqlite3 "$TEST_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='tag_categories';" 2>/dev/null | grep -q "tag_categories"; then
    echo "❌ Error: tag_categories should not exist!"
else
    echo "✅ tag_categories correctly excluded"
fi

if sqlite3 "$TEST_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences_v3';" 2>/dev/null | grep -q "user_preferences_v3"; then
    echo "❌ Error: user_preferences_v3 should not exist!"
else
    echo "✅ user_preferences_v3 correctly excluded"
fi

# Summary
echo ""
echo "=========================================="
echo "✅ Test completed successfully!"
echo ""
echo "📁 Test database: $TEST_DB"
echo "💾 Backup available: $BACKUP_DB"
echo ""
echo "💡 Next steps:"
echo "   1. Review the test database: $TEST_DB"
echo "   2. If everything looks good, you can use the script on production"
echo "   3. To clean up test files: rm $TEST_DB $BACKUP_DB"
echo ""

