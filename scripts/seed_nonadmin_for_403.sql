-- ============================================
-- Non-Admin User Seed for 403 Testing (MD-SETTINGS Gate-B)
-- Team 50 (QA & Fidelity) — TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_403_EVIDENCE_REQUEST
-- Purpose: Create USER-role user for 403 non-admin verification
-- ============================================
-- Username: qa_nonadmin
-- Password: qa403test
-- Role: USER (non-admin)
-- Password hash for "qa403test" (bcrypt)
-- ============================================

DO $$
DECLARE
    u_username TEXT := 'qa_nonadmin';
    u_password_hash TEXT := '$2b$12$iY0hgXtQazqyv3JoVZQP.ui9bmsUZkrRC1u0pjNTSeZh37JNAgON.';
    u_email TEXT := 'qa_nonadmin_403@tiktrack.com';
    u_role TEXT := 'USER';
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM user_data.users WHERE username = u_username) INTO user_exists;

    IF user_exists THEN
        RAISE NOTICE 'Non-admin user "%" exists. Updating password...', u_username;
        UPDATE user_data.users
        SET password_hash = u_password_hash, is_active = TRUE, updated_at = NOW()
        WHERE username = u_username;
    ELSE
        RAISE NOTICE 'Creating non-admin user "%"...', u_username;
        INSERT INTO user_data.users (
            id, username, email, password_hash, role, is_active, is_email_verified,
            email_verified_at, phone_verified, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), u_username, u_email, u_password_hash,
            u_role::user_data.user_role, TRUE, TRUE, NOW(), FALSE, NOW(), NOW()
        );
    END IF;
END $$;
