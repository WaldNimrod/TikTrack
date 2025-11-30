-- TikTrack PostgreSQL infra initialization (idempotent)
-- Creates role TikTrakDBAdmin with password and CREATEDB
-- Creates databases: "TikTrack-db-development", "TikTrack-db-production"
-- Safe to re-run

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'TikTrakDBAdmin') THEN
        EXECUTE 'CREATE ROLE "TikTrakDBAdmin" LOGIN PASSWORD ''BigMeZoo1974!?''';
    END IF;
END
$$;

ALTER ROLE "TikTrakDBAdmin" WITH CREATEDB;

-- Create databases using psql \gexec to stay outside function context
SELECT 'CREATE DATABASE "TikTrack-db-development" OWNER "TikTrakDBAdmin"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'TikTrack-db-development')
\gexec

SELECT 'CREATE DATABASE "TikTrack-db-production" OWNER "TikTrakDBAdmin"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'TikTrack-db-production')
\gexec

-- verification output
SELECT 'ROLE_EXISTS:' || EXISTS(SELECT FROM pg_roles WHERE rolname = 'TikTrakDBAdmin') AS role_exists;
SELECT 'DB_EXISTS:' || datname AS db_exists
FROM pg_database
WHERE datname IN ('TikTrack-db-development','TikTrack-db-production')
ORDER BY datname;


