-- הוספת שני תכנונים סגורים עם טריידים מקושרים
-- תכנון סגור הוא תכנון שהפך לטרייד ולכן חייב להיות טרייד מקושר אליו

-- 1. הוספת תכנון סגור ראשון - AAPL
INSERT INTO trade_plans (
    account_id,
    ticker_id,
    investment_type,
    planned_amount,
    entry_conditions,
    stop_price,
    target_price,
    reasons,
    created_at,
    canceled_at,
    cancel_reason
) VALUES (
    1,  -- חשבון ראשי
    1,  -- AAPL
    'investment',
    25000.00,
    'כניסה במחיר 180$ עם נפח גבוה',
    170.00,
    200.00,
    'AAPL מראה סימני התאוששות עם השקת מוצרים חדשים',
    '2025-01-15 09:30:00',
    '2025-01-20 14:45:00',
    'התכנית הומרה לטרייד'
);

-- 2. הוספת תכנון סגור שני - TSLA
INSERT INTO trade_plans (
    account_id,
    ticker_id,
    investment_type,
    planned_amount,
    entry_conditions,
    stop_price,
    target_price,
    reasons,
    created_at,
    canceled_at,
    cancel_reason
) VALUES (
    1,  -- חשבון ראשי
    2,  -- TSLA
    'swing',
    30000.00,
    'כניסה במחיר 220$ עם איתות טכני חיובי',
    200.00,
    250.00,
    'TSLA מראה מומנטום חיובי עם דוחות רבעוניים טובים',
    '2025-01-10 10:15:00',
    '2025-01-18 11:30:00',
    'התכנית הומרה לטרייד'
);

-- 3. הוספת טרייד מקושר לתכנון AAPL
INSERT INTO trades (
    account_id,
    ticker_id,
    trade_plan_id,
    status,
    type,
    opened_at,
    closed_at,
    total_pl,
    notes
) VALUES (
    1,  -- חשבון ראשי
    1,  -- AAPL
    1,  -- מזהה התכנון הראשון שנוסף
    'closed',
    'buy',
    '2025-01-20 14:45:00',  -- תאריך זהה ל-canceled_at של התכנון
    '2025-01-25 15:30:00',
    3500.00,  -- רווח חיובי
    'טרייד AAPL שהתחיל מתכנון - נסגר ברווח של 14%'
);

-- 4. הוספת טרייד מקושר לתכנון TSLA
INSERT INTO trades (
    account_id,
    ticker_id,
    trade_plan_id,
    status,
    type,
    opened_at,
    closed_at,
    total_pl,
    notes
) VALUES (
    1,  -- חשבון ראשי
    2,  -- TSLA
    2,  -- מזהה התכנון השני שנוסף
    'closed',
    'buy',
    '2025-01-18 11:30:00',  -- תאריך זהה ל-canceled_at של התכנון
    '2025-01-22 13:15:00',
    -1200.00,  -- הפסד
    'טרייד TSLA שהתחיל מתכנון - נסגר בהפסד של 4%'
);

-- 5. הוספת ביצועים לטרייד AAPL
INSERT INTO executions (
    trade_id,
    action,
    date,
    quantity,
    price,
    fee,
    source
) VALUES 
(1, 'buy', '2025-01-20 14:45:00', 100, 180.00, 9.99, 'manual'),
(1, 'sell', '2025-01-25 15:30:00', 100, 205.00, 9.99, 'manual');

-- 6. הוספת ביצועים לטרייד TSLA
INSERT INTO executions (
    trade_id,
    action,
    date,
    quantity,
    price,
    fee,
    source
) VALUES 
(2, 'buy', '2025-01-18 11:30:00', 120, 220.00, 9.99, 'manual'),
(2, 'sell', '2025-01-22 13:15:00', 120, 211.00, 9.99, 'manual');

-- עדכון סטטוס התכנונים ל'closed' (אם יש עמודה כזו)
-- הערה: אם אין עמודת status בטבלת trade_plans, התכנון נחשב סגור כשיש canceled_at

-- בדיקה שהנתונים נוספו בהצלחה
SELECT 
    tp.id as plan_id,
    tp.investment_type,
    tp.planned_amount,
    tp.canceled_at,
    tp.cancel_reason,
    t.id as trade_id,
    t.status as trade_status,
    t.total_pl,
    t.opened_at,
    t.closed_at
FROM trade_plans tp
LEFT JOIN trades t ON tp.id = t.trade_plan_id
WHERE tp.canceled_at IS NOT NULL
ORDER BY tp.created_at DESC;
