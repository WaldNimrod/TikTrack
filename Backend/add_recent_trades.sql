-- הוספת טריידים חדשים עם תכנונים מתאימים
-- תכנונים וטריידים מהשבוע האחרון

-- תכנון טרייד 1 - השבוע האחרון
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (1, 1, 'long', 5000.00, 'מחיר מתחת ל-150', 140.00, 170.00, 'תנועה טכנית חיובית', '2025-01-08 10:30:00');

-- טרייד 1 - השבוע האחרון
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, notes) 
VALUES (1, 1, (SELECT id FROM trade_plans WHERE created_at = '2025-01-08 10:30:00'), 'open', 'buy', '2025-01-08 11:15:00', 'נכנס על בסיס תכנון טכני');

-- תכנון טרייד 2 - השבוע האחרון
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (2, 2, 'short', 3000.00, 'מחיר מעל 200', 210.00, 180.00, 'התנגדות חזקה', '2025-01-09 14:20:00');

-- טרייד 2 - השבוע האחרון
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, notes) 
VALUES (2, 2, (SELECT id FROM trade_plans WHERE created_at = '2025-01-09 14:20:00'), 'open', 'sell', '2025-01-09 15:45:00', 'פוזיציה קצרה על התנגדות');

-- תכנון טרייד 3 - השבוע האחרון (מבוטל)
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (3, 3, 'swing', 4000.00, 'פריצת תמיכה', 85.00, 110.00, 'תנועה ארוכת טווח', '2025-01-10 09:15:00');

-- טרייד 3 - השבוע האחרון (מבוטל)
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, cancelled_at, cancel_reason, notes) 
VALUES (3, 3, (SELECT id FROM trade_plans WHERE created_at = '2025-01-10 09:15:00'), 'cancelled', 'buy', '2025-01-10 10:30:00', '2025-01-10 16:20:00', 'שינוי בתנאי השוק', 'בוטל עקב שינוי בתנאי השוק');

-- תכנונים וטריידים מהחודש האחרון

-- תכנון טרייד 4 - החודש האחרון
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (1, 4, 'long', 6000.00, 'תמיכה חזקה', 120.00, 150.00, 'תנועה חיובית ארוכת טווח', '2024-12-20 11:00:00');

-- טרייד 4 - החודש האחרון
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, closed_at, total_pl, notes) 
VALUES (1, 4, (SELECT id FROM trade_plans WHERE created_at = '2024-12-20 11:00:00'), 'closed', 'buy', '2024-12-20 12:30:00', '2024-12-28 14:15:00', 1800.00, 'רווח טוב על תנועה חיובית');

-- תכנון טרייד 5 - החודש האחרון
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (2, 5, 'short', 2500.00, 'התנגדות טכנית', 95.00, 75.00, 'תנועה שלילית צפויה', '2024-12-15 13:45:00');

-- טרייד 5 - החודש האחרון
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, closed_at, total_pl, notes) 
VALUES (2, 5, (SELECT id FROM trade_plans WHERE created_at = '2024-12-15 13:45:00'), 'closed', 'sell', '2024-12-15 15:20:00', '2024-12-22 10:30:00', -450.00, 'הפסד קטן על תנועה לא צפויה');

-- תכנון טרייד 6 - החודש האחרון
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (3, 6, 'swing', 3500.00, 'פריצת ערוץ', 60.00, 85.00, 'תנועה טכנית חיובית', '2024-12-10 09:30:00');

-- טרייד 6 - החודש האחרון
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, notes) 
VALUES (3, 6, (SELECT id FROM trade_plans WHERE created_at = '2024-12-10 09:30:00'), 'open', 'buy', '2024-12-10 11:15:00', 'פוזיציה ארוכת טווח על פריצה');

-- תכנונים וטריידים מתחילת 2025

-- תכנון טרייד 7 - תחילת 2025
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (1, 7, 'long', 7000.00, 'תמיכה חזקה', 180.00, 220.00, 'תנועה חיובית בתחילת השנה', '2025-01-02 08:45:00');

-- טרייד 7 - תחילת 2025
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, closed_at, total_pl, notes) 
VALUES (1, 7, (SELECT id FROM trade_plans WHERE created_at = '2025-01-02 08:45:00'), 'closed', 'buy', '2025-01-02 10:20:00', '2025-01-05 16:30:00', 2100.00, 'רווח מהיר על תנועה חזקה');

-- תכנון טרייד 8 - תחילת 2025
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (2, 8, 'short', 4000.00, 'התנגדות חזקה', 250.00, 200.00, 'תנועה שלילית צפויה', '2025-01-01 12:00:00');

-- טרייד 8 - תחילת 2025
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, notes) 
VALUES (2, 8, (SELECT id FROM trade_plans WHERE created_at = '2025-01-01 12:00:00'), 'open', 'sell', '2025-01-01 14:30:00', 'פוזיציה קצרה על התנגדות חזקה');

-- תכנון טרייד 9 - תחילת 2025
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (3, 9, 'swing', 5000.00, 'פריצת תמיכה', 90.00, 120.00, 'תנועה ארוכת טווח חיובית', '2025-01-03 10:15:00');

-- טרייד 9 - תחילת 2025
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, closed_at, total_pl, notes) 
VALUES (3, 9, (SELECT id FROM trade_plans WHERE created_at = '2025-01-03 10:15:00'), 'closed', 'buy', '2025-01-03 11:45:00', '2025-01-07 13:20:00', 1500.00, 'רווח טוב על תנועה טכנית');

-- תכנון טרייד 10 - תחילת 2025 (מבוטל)
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at) 
VALUES (1, 10, 'long', 3000.00, 'תמיכה טכנית', 70.00, 90.00, 'תנועה חיובית צפויה', '2025-01-04 09:00:00');

-- טרייד 10 - תחילת 2025 (מבוטל)
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, cancelled_at, cancel_reason, notes) 
VALUES (1, 10, (SELECT id FROM trade_plans WHERE created_at = '2025-01-04 09:00:00'), 'cancelled', 'buy', '2025-01-04 10:30:00', '2025-01-04 15:45:00', 'שינוי בסיסי בתנאי השוק', 'בוטל עקב שינוי בסיסי בתנאי השוק');

-- הוספת ביצועים לטריידים הסגורים

-- ביצועים לטרייד 4
INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2024-12-20 12:30:00'), 'buy', '2024-12-20 12:30:00', 50, 120.00, 15.00, 'manual');

INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2024-12-20 12:30:00'), 'sell', '2024-12-28 14:15:00', 50, 156.00, 15.00, 'manual');

-- ביצועים לטרייד 5
INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2024-12-15 15:20:00'), 'sell', '2024-12-15 15:20:00', 25, 95.00, 12.50, 'manual');

INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2024-12-15 15:20:00'), 'buy', '2024-12-22 10:30:00', 25, 96.80, 12.50, 'manual');

-- ביצועים לטרייד 7
INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2025-01-02 10:20:00'), 'buy', '2025-01-02 10:20:00', 35, 180.00, 17.50, 'manual');

INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2025-01-02 10:20:00'), 'sell', '2025-01-05 16:30:00', 35, 240.00, 17.50, 'manual');

-- ביצועים לטרייד 9
INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2025-01-03 11:45:00'), 'buy', '2025-01-03 11:45:00', 40, 90.00, 20.00, 'manual');

INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) 
VALUES ((SELECT id FROM trades WHERE opened_at = '2025-01-03 11:45:00'), 'sell', '2025-01-07 13:20:00', 40, 127.50, 20.00, 'manual');
