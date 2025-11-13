-- TikTrack Trigger Validation Script
-- ----------------------------------
-- Usage:
--   sqlite3 Backend/db/simpleTrade_new.db < Backend/tools/db_trigger_validation.sql
--
-- The script wraps all actions in a transaction and rolls them back automatically.
-- It exercises the database triggers in the following order:
--   1. Baseline trigger inventory
--   2. Trade plan and trade lifecycle to verify ticker status propagation
--   3. Cancelled ticker guard rails
--   4. Entity relation bridge triggers
--   5. Manual protection-trigger validation steps (base currency / last account)

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- 1. Inventory current triggers
SELECT 'Trigger Inventory' AS section, name, tbl_name
FROM sqlite_master
WHERE type = 'trigger'
ORDER BY name;

-- 2. Trade plan & trade lifecycle
INSERT INTO accounts (name, currency_id, status) VALUES ('_trigger_validation_account', 1, 'open');
INSERT INTO tickers (id, symbol, name, status, active_trades)
VALUES (9001, 'TRG9001', 'Trigger Validation Ticker', 'closed', 0);

INSERT INTO trade_plans (trading_account_id, ticker_id, status, planned_amount)
VALUES ((SELECT id FROM accounts WHERE name = '_trigger_validation_account'), 9001, 'open', 5000);

INSERT INTO trades (trading_account_id, ticker_id, status, investment_type)
VALUES ((SELECT id FROM accounts WHERE name = '_trigger_validation_account'), 9001, 'open', 'swing');

SELECT 'After Inserts' AS checkpoint, status, active_trades
FROM tickers WHERE id = 9001;

UPDATE trades SET status = 'closed'
WHERE ticker_id = 9001;

SELECT 'After Trade Close' AS checkpoint, status, active_trades
FROM tickers WHERE id = 9001;

UPDATE trade_plans SET status = 'closed'
WHERE ticker_id = 9001;

SELECT 'After Plan Close' AS checkpoint, status, active_trades
FROM tickers WHERE id = 9001;

DELETE FROM trades WHERE ticker_id = 9001;
DELETE FROM trade_plans WHERE ticker_id = 9001;

SELECT 'After Cleanup' AS checkpoint, status, active_trades
FROM tickers WHERE id = 9001;

-- 3. Cancelled ticker safeguard
INSERT OR IGNORE INTO tickers (id, symbol, name, status, active_trades)
VALUES (9002, 'TRG9002', 'Cancelled Trigger Ticker', 'cancelled', 0);

INSERT INTO trade_plans (trading_account_id, ticker_id, status, planned_amount)
VALUES ((SELECT id FROM accounts WHERE name = '_trigger_validation_account'), 9002, 'open', 1500);

SELECT 'Cancelled Ticker Check' AS checkpoint, status, active_trades
FROM tickers WHERE id = 9002;

DELETE FROM trade_plans WHERE ticker_id = 9002;

-- 4. Entity relation bridge triggers
INSERT INTO entity_relation_types (relation_type) VALUES ('trigger_validation_relation');
SELECT 'Bridge Insert' AS checkpoint, relation_type
FROM entity_relation_types WHERE relation_type = 'trigger_validation_relation';

UPDATE entity_relation_types
SET relation_type = 'trigger_validation_relation_updated'
WHERE relation_type = 'trigger_validation_relation';

SELECT 'Bridge Update' AS checkpoint, note_relation_type
FROM note_relation_types WHERE note_relation_type = 'trigger_validation_relation_updated';

DELETE FROM entity_relation_types WHERE relation_type = 'trigger_validation_relation_updated';

SELECT 'Bridge Delete' AS checkpoint,
       COUNT(*) AS remaining
FROM note_relation_types
WHERE note_relation_type LIKE 'trigger_validation_relation%';

-- 5. Protection trigger validations must be executed manually to observe the raised errors.
SELECT 'Protection Trigger Manual Steps' AS section,
       'Run UPDATE currencies SET name = ''Test'' WHERE id = 1; -- expect abort' AS instruction
UNION ALL
SELECT 'Protection Trigger Manual Steps',
       'Run DELETE FROM currencies WHERE id = 1; -- expect abort'
UNION ALL
SELECT 'Protection Trigger Manual Steps',
       'Run DELETE FROM accounts WHERE id = (SELECT id FROM accounts ORDER BY id LIMIT 1); -- expect abort when only one account remains';

-- All actions are rolled back to keep the database untouched.
ROLLBACK;

