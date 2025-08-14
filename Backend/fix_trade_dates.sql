-- סקריפט לתיקון תאריכי טריידים
-- מעדכן את תאריכי הפתיחה של הטריידים כך שיהיו אחרי תאריך יצירת התכנון

-- בדיקה ראשונית - הצגת טריידים עם תאריכים בעייתיים
SELECT 
    t.id as trade_id,
    t.opened_at as trade_opened_at,
    tp.created_at as plan_created_at,
    tp.id as plan_id,
    CASE 
        WHEN t.opened_at < tp.created_at THEN 'בעייתי - טרייד לפני תכנון'
        ELSE 'תקין'
    END as status
FROM trades t
JOIN trade_plans tp ON t.trade_plan_id = tp.id
WHERE t.opened_at IS NOT NULL;

-- עדכון טריידים עם תאריכי פתיחה לפני תאריך יצירת התכנון
-- מוסיף 30 דקות לתאריך יצירת התכנון

UPDATE trades 
SET opened_at = (
    SELECT datetime(tp.created_at, '+30 minutes')
    FROM trade_plans tp 
    WHERE tp.id = trades.trade_plan_id
)
WHERE EXISTS (
    SELECT 1 
    FROM trade_plans tp 
    WHERE tp.id = trades.trade_plan_id 
    AND trades.opened_at < tp.created_at
    AND trades.opened_at IS NOT NULL
);

-- עדכון טריידים עם תאריכי סגירה לפני תאריך הפתיחה
UPDATE trades 
SET closed_at = datetime(opened_at, '+2 hours')
WHERE closed_at IS NOT NULL 
AND closed_at < opened_at;



-- בדיקה סופית - הצגת התוצאות
SELECT 
    t.id as trade_id,
    t.opened_at as trade_opened_at,
    tp.created_at as plan_created_at,
    tp.id as plan_id,
    CASE 
        WHEN t.opened_at >= tp.created_at THEN '✅ תקין'
        ELSE '❌ עדיין בעייתי'
    END as status
FROM trades t
JOIN trade_plans tp ON t.trade_plan_id = tp.id
WHERE t.opened_at IS NOT NULL
ORDER BY t.id;

-- הצגת סיכום התיקונים
SELECT 
    'טריידים שתוקנו' as description,
    COUNT(*) as count
FROM trades t
JOIN trade_plans tp ON t.trade_plan_id = tp.id
WHERE t.opened_at >= tp.created_at;

