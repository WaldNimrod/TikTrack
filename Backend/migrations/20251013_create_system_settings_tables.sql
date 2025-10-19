-- Create system settings tables (groups/types/values)
-- Author: TikTrack Development Team
-- Date: 2025-10-13

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS system_setting_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_setting_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    key VARCHAR(150) NOT NULL UNIQUE,
    data_type VARCHAR(20) NOT NULL,
    description TEXT,
    default_value TEXT,
    is_active BOOLEAN DEFAULT 1,
    constraints_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES system_setting_groups(id)
);

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES system_setting_types(id)
);

-- Seed external data settings group and types (system-level defaults)
INSERT OR IGNORE INTO system_setting_groups (name, description)
VALUES ('external_data_settings', 'System-level external data refresh policies and scheduler settings');

-- TTL defaults (seconds)
INSERT OR IGNORE INTO system_setting_types (group_id, key, data_type, description, default_value, is_active)
SELECT id, 'ttlActiveSeconds', 'integer', 'TTL for active tickers (seconds)', '300', 1
FROM system_setting_groups WHERE name='external_data_settings';

INSERT OR IGNORE INTO system_setting_types (group_id, key, data_type, description, default_value, is_active)
SELECT id, 'ttlOpenSeconds', 'integer', 'TTL for open tickers (seconds)', '900', 1
FROM system_setting_groups WHERE name='external_data_settings';

INSERT OR IGNORE INTO system_setting_types (group_id, key, data_type, description, default_value, is_active)
SELECT id, 'ttlClosedSeconds', 'integer', 'TTL for closed tickers (seconds)', '3600', 1
FROM system_setting_groups WHERE name='external_data_settings';

INSERT OR IGNORE INTO system_setting_types (group_id, key, data_type, description, default_value, is_active)
SELECT id, 'ttlCancelledSeconds', 'integer', 'TTL for cancelled tickers (seconds)', '86400', 1
FROM system_setting_groups WHERE name='external_data_settings';

-- Scheduler toggle and batch
INSERT OR IGNORE INTO system_setting_types (group_id, key, data_type, description, default_value, is_active)
SELECT id, 'externalDataSchedulerEnabled', 'boolean', 'Enable Data Refresh Scheduler', 'true', 1
FROM system_setting_groups WHERE name='external_data_settings';

INSERT OR IGNORE INTO system_setting_types (group_id, key, data_type, description, default_value, is_active)
SELECT id, 'externalDataMaxBatchSize', 'integer', 'Max batch size for provider requests', '50', 1
FROM system_setting_groups WHERE name='external_data_settings';

COMMIT;


