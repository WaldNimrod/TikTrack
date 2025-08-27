-- הוספת שדה active_trades לטבלת tickers

-- יצירת טבלה זמנית עם המבנה החדש
CREATE TABLE tickers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    type TEXT,
    remarks TEXT,
    currency TEXT DEFAULT 'USD',
    active_trades BOOLEAN DEFAULT 0
);

-- העתקת הנתונים הקיימים
INSERT INTO tickers_new (id, symbol, name, type, remarks, currency)
SELECT id, symbol, name, type, remarks, currency FROM tickers;

-- מחיקת הטבלה הישנה
DROP TABLE tickers;

-- שינוי שם הטבלה החדשה
ALTER TABLE tickers_new RENAME TO tickers;

-- הערה: שדה active_trades יקבל ערך ברירת מחדל 0 (false) לכל הטיקרים הקיימים
