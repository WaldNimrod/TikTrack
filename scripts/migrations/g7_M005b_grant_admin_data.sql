-- G7 M-005b: Grant TikTrackDbAdmin access to admin_data (app runtime user)
-- Run after M-005 when app uses TikTrackDbAdmin for DB connection
GRANT USAGE ON SCHEMA admin_data TO "TikTrackDbAdmin";
GRANT SELECT, INSERT, UPDATE ON admin_data.job_run_log TO "TikTrackDbAdmin";
