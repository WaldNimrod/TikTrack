-- ============================================
-- QA Test User Seed Script (SQL)
-- Team 60 (DevOps & Platform)
-- Created: 2026-02-07
-- Purpose: Create permanent QA test user for Gate B Runtime/E2E testing
-- ============================================

-- QA Test User credentials (permanent for Gate B)
-- Username: TikTrackAdmin
-- Password: 4181
-- Email: qatest@tiktrack.com
-- Role: ADMIN

-- Password hash for "4181" (bcrypt)
-- Generated using: python3 -c "from passlib.context import CryptContext; ctx = CryptContext(schemes=['bcrypt']); print(ctx.hash('4181'))"
-- Hash: $2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG

DO $$
DECLARE
    qa_username TEXT := 'TikTrackAdmin';
    qa_password_hash TEXT := '$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG';
    qa_email TEXT := 'qatest@tiktrack.com';
    qa_role TEXT := 'ADMIN';
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM user_data.users WHERE username = qa_username) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'QA test user "%" already exists. Updating password and ensuring active status...', qa_username;
        
        -- Always update password hash to ensure it's correct (idempotent)
        -- Also ensure user is active and email verified
        UPDATE user_data.users
        SET 
            password_hash = qa_password_hash,
            is_active = TRUE,
            is_email_verified = TRUE,
            email_verified_at = COALESCE(email_verified_at, NOW()),
            updated_at = NOW()
        WHERE username = qa_username;
        
        RAISE NOTICE 'QA test user "%" password updated and verified successfully.', qa_username;
    ELSE
        RAISE NOTICE 'Creating QA test user "%"...', qa_username;
        
        -- Create QA test user
        INSERT INTO user_data.users (
            id,
            username,
            email,
            password_hash,
            role,
            is_active,
            is_email_verified,
            email_verified_at,
            phone_verified,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            qa_username,
            qa_email,
            qa_password_hash,
            qa_role::user_data.user_role,
            TRUE,
            TRUE,
            NOW(),
            FALSE,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'QA test user "%" created successfully.', qa_username;
    END IF;
END $$;

-- Verify user was created/updated
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    is_email_verified,
    created_at
FROM user_data.users
WHERE username = 'TikTrackAdmin';
