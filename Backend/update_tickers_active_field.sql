-- סקריפט להוספת שדה active_trades לטבלת tickers
-- שדה זה יציין אם יש לטיקר תכנונים או טריידים פעילים

-- הוספת השדה החדש
ALTER TABLE tickers ADD COLUMN active_trades BOOLEAN DEFAULT FALSE;

-- עדכון ערכים ראשוניים
UPDATE tickers SET active_trades = (
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM trade_plans 
            WHERE trade_plans.ticker_id = tickers.id 
            AND (trade_plans.canceled_at IS NULL OR trade_plans.canceled_at = '')
        ) OR EXISTS (
            SELECT 1 FROM trades 
            WHERE trades.ticker_id = tickers.id 
            AND trades.status IN ('open', 'pending', 'פתוח', 'ממתין')
        ) THEN TRUE
        ELSE FALSE
    END
);
