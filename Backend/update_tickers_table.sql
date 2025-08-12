-- סקריפט לעדכון טבלת tickers
-- החלפת שדה exchange בשדה remarks

-- יצירת טבלה זמנית עם המבנה החדש
CREATE TABLE tickers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    type TEXT,
    remarks TEXT
);

-- העתקת הנתונים הקיימים (ללא שדה exchange)
INSERT INTO tickers_new (id, symbol, name, type)
SELECT id, symbol, name, type FROM tickers;

-- מחיקת הטבלה הישנה
DROP TABLE tickers;

-- שינוי שם הטבלה החדשה
ALTER TABLE tickers_new RENAME TO tickers;

-- הערה: שדה remarks יישאר ריק עד שיוכנסו נתונים אמיתיים
