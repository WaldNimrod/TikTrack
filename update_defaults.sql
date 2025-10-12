-- ============================================================================
-- Update Default Values in preference_types from Active Profile
-- ============================================================================
-- File: update_defaults.sql
-- Description: Updates all default_value entries in preference_types table
--              to match the current saved values in profile 1 (ברירת מחדל)
-- Date: 2025-01-12
-- ============================================================================

-- Step 1: Show current state (for verification)
.mode column
.headers on
SELECT 'BEFORE UPDATE - Sample of current defaults:' as status;
SELECT preference_name, default_value 
FROM preference_types 
WHERE preference_name IN ('primaryColor', 'secondaryColor', 'timezone', 'primaryCurrency')
ORDER BY preference_name;

-- Step 2: Update all default values based on profile 1
UPDATE preference_types
SET default_value = (
    SELECT up.saved_value
    FROM user_preferences up
    WHERE up.preference_id = preference_types.id
    AND up.user_id = 1
    AND up.profile_id = 1
    ORDER BY up.updated_at DESC
    LIMIT 1
),
updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1
    FROM user_preferences up
    WHERE up.preference_id = preference_types.id
    AND up.user_id = 1
    AND up.profile_id = 1
)
AND is_active = 1;

-- Step 3: Show results
SELECT 'UPDATE COMPLETE - Updated ' || changes() || ' preferences' as status;

-- Step 4: Verify sample of updated values
SELECT 'AFTER UPDATE - Sample of new defaults:' as status;
SELECT preference_name, default_value 
FROM preference_types 
WHERE preference_name IN ('primaryColor', 'secondaryColor', 'timezone', 'primaryCurrency')
ORDER BY preference_name;

-- Step 5: Show all color defaults
SELECT 'ALL COLOR DEFAULTS:' as status;
SELECT preference_name, default_value 
FROM preference_types 
WHERE preference_name LIKE '%Color%'
AND is_active = 1
ORDER BY preference_name;

