-- נתוני דמה לבסיס הנתונים SimpleTrade
-- כל טבלה תכיל לפחות 3 רשומות עם קישורים נכונים

-- הוספת חשבונות נוספים
INSERT INTO accounts (name, currency, status, cash_balance, total_value, total_pl, notes) VALUES
('חשבון השקעות ארוך טווח', 'ILS', 'active', 50000.00, 150000.00, 25000.00, 'חשבון להשקעות ארוכות טווח'),
('חשבון ספקולטיבי', 'USD', 'active', 10000.00, 25000.00, 5000.00, 'חשבון לסחר קצר טווח'),
('חשבון פנסיוני', 'ILS', 'active', 20000.00, 80000.00, 15000.00, 'חשבון לחיסכון פנסיוני');

-- הוספת טיקרים נוספים
INSERT INTO tickers (symbol, name, type, exchange) VALUES
('AAPL', 'Apple Inc.', 'stock', 'NASDAQ'),
('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ'),
('MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ'),
('TSLA', 'Tesla Inc.', 'stock', 'NASDAQ'),
('NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ'),
('AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ'),
('META', 'Meta Platforms Inc.', 'stock', 'NASDAQ'),
('NFLX', 'Netflix Inc.', 'stock', 'NASDAQ'),
('CRM', 'Salesforce Inc.', 'stock', 'NYSE'),
('ORCL', 'Oracle Corporation', 'stock', 'NYSE');

-- הוספת תכנוני טריידים נוספים
INSERT INTO trade_plans (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, created_at, canceled_at, cancel_reason) VALUES
(1, 1, 'long', 10000.00, 'מחיר יורד ל-150$', 145.00, 180.00, 'ציפייה לרבעון חזק', '2024-01-15 10:00:00', NULL, NULL),
(2, 2, 'short', 5000.00, 'מחיר עולה ל-2800$', 2850.00, 2600.00, 'תיקון טכני צפוי', '2024-01-10 14:00:00', NULL, NULL),
(3, 3, 'long', 15000.00, 'פריצת התנגדות ב-300$', 295.00, 350.00, 'מגמה חזקה בענף', '2024-01-12 09:00:00', NULL, NULL),
(1, 4, 'long', 8000.00, 'תמיכה ב-200$', 195.00, 250.00, 'התאוששות אחרי ירידה', '2024-01-18 15:00:00', NULL, NULL),
(2, 5, 'short', 3000.00, 'התנגדות ב-400$', 410.00, 350.00, 'תיקון אחרי עלייה חזקה', '2024-01-18 16:00:00', NULL, NULL);

-- הוספת טריידים נוספים
INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, opened_at, closed_at, total_pl, notes) VALUES
(1, 1, 1, 'open', 'long', '2024-01-15 10:30:00', NULL, 1500.00, 'פתיחה לפי תכנון'),
(2, 2, 2, 'closed', 'short', '2024-01-10 14:20:00', '2024-01-20 11:15:00', -200.00, 'סגירה מוקדמת'),
(3, 3, 3, 'open', 'long', '2024-01-12 09:45:00', NULL, 800.00, 'פתיחה בהתאם לתכנון'),
(1, 4, 4, 'pending', 'long', NULL, NULL, 0.00, 'ממתין לתנאי כניסה'),
(2, 5, 5, 'open', 'short', '2024-01-18 16:00:00', NULL, -150.00, 'פתיחה קצרה');

-- הוספת טרנזקציות
INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) VALUES
(1, 'buy', '2024-01-15 10:30:00', 100.0, 150.00, 5.00, 'manual'),
(1, 'buy', '2024-01-16 11:20:00', 50.0, 148.00, 3.00, 'manual'),
(2, 'sell', '2024-01-10 14:20:00', 200.0, 2800.00, 10.00, 'manual'),
(2, 'buy', '2024-01-20 11:15:00', 200.0, 2810.00, 10.00, 'manual'),
(3, 'buy', '2024-01-12 09:45:00', 75.0, 300.00, 7.50, 'manual'),
(5, 'sell', '2024-01-18 16:00:00', 100.0, 400.00, 8.00, 'manual');

-- הוספת התראות
INSERT INTO alerts (account_id, ticker_id, alert_type, condition, status, created_at, triggered_at) VALUES
(1, 1, 'price', 'מחיר יורד מתחת ל-145$', 'active', '2024-01-15 10:00:00', NULL),
(2, 2, 'price', 'מחיר עולה מעל 2850$', 'triggered', '2024-01-10 14:00:00', '2024-01-10 14:30:00'),
(3, 3, 'price', 'מחיר עולה מעל 350$', 'active', '2024-01-12 09:00:00', NULL),
(1, 4, 'price', 'מחיר יורד ל-200$', 'active', '2024-01-18 15:00:00', NULL),
(2, 5, 'price', 'מחיר יורד מתחת ל-350$', 'active', '2024-01-18 16:00:00', NULL);

-- הוספת תזרימי מזומנים
INSERT INTO cash_flows (account_id, date, flow_type, amount, currency, description) VALUES
(1, '2024-01-01', 'deposit', 50000.00, 'ILS', 'הפקדה ראשונית'),
(2, '2024-01-01', 'deposit', 10000.00, 'USD', 'הפקדה ראשונית'),
(3, '2024-01-01', 'deposit', 20000.00, 'ILS', 'הפקדה ראשונית'),
(1, '2024-01-15', 'withdrawal', -5000.00, 'ILS', 'משיכה לצרכים אישיים'),
(2, '2024-01-20', 'dividend', 500.00, 'USD', 'דיבידנד מ-Google'),
(3, '2024-01-25', 'deposit', 10000.00, 'ILS', 'הפקדה נוספת');

-- הוספת הערות
INSERT INTO notes (account_id, trade_id, trade_plan_id, content, created_at, attachment) VALUES
(1, 1, 1, 'פתיחה מוצלחת של פוזיציה ארוכה ב-Apple', '2024-01-15 10:35:00', NULL),
(2, 2, 2, 'סגירה מוקדמת עקב שינוי בתנאי השוק', '2024-01-20 11:20:00', NULL),
(3, 3, 3, 'פתיחה בהתאם לתכנון המקורי', '2024-01-12 09:50:00', NULL),
(1, NULL, 4, 'ממתין לתנאי כניסה טובים יותר', '2024-01-18 15:30:00', NULL),
(2, 5, 5, 'פתיחה קצרה ב-NVIDIA', '2024-01-18 16:05:00', NULL),
(NULL, NULL, NULL, 'הערה כללית על השוק', '2024-01-20 12:00:00', NULL);

-- הוספת תמונת זמן
INSERT INTO performance_snapshots (account_id, date, total_value, open_pl, closed_pl, mtm_value, investment_type) VALUES
(1, '2024-01-15', 150000.00, 1500.00, 0.00, 151500.00, 'mixed'),
(2, '2024-01-20', 25000.00, -150.00, -200.00, 24650.00, 'speculative'),
(3, '2024-01-25', 80000.00, 800.00, 0.00, 80800.00, 'long_term'),
(1, '2024-01-30', 152000.00, 2000.00, 0.00, 154000.00, 'mixed'),
(2, '2024-01-30', 24800.00, -300.00, -200.00, 24300.00, 'speculative'),
(3, '2024-01-30', 81000.00, 1000.00, 0.00, 82000.00, 'long_term');

-- הוספת בקשות ביצוע פתוחות
INSERT INTO open_execution_requests (account_id, ticker_id, action, condition, status, created_at) VALUES
(1, 4, 'buy', 'מחיר יורד ל-200$', 'pending', '2024-01-18 15:00:00'),
(2, 6, 'sell', 'מחיר עולה ל-150$', 'pending', '2024-01-19 10:00:00'),
(3, 7, 'buy', 'מחיר יורד ל-300$', 'pending', '2024-01-20 14:00:00');
