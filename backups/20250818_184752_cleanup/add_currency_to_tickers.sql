-- סקריפט להוספת שדה מטבע לטבלת tickers
-- הוספת שדה currency עם ערכי ברירת מחדל

-- יצירת טבלה זמנית עם המבנה החדש
CREATE TABLE tickers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    type TEXT,
    remarks TEXT,
    currency TEXT DEFAULT 'USD'
);

-- העתקת הנתונים הקיימים
INSERT INTO tickers_new (id, symbol, name, type, remarks)
SELECT id, symbol, name, type, remarks FROM tickers;

-- מחיקת הטבלה הישנה
DROP TABLE tickers;

-- שינוי שם הטבלה החדשה
ALTER TABLE tickers_new RENAME TO tickers;

-- עדכון מטבעות לפי סוג הטיקר
UPDATE tickers SET currency = 'USD' WHERE type = 'stock' OR type IS NULL;
UPDATE tickers SET currency = 'ILS' WHERE symbol LIKE '%.TA' OR symbol LIKE '%.TL';
UPDATE tickers SET currency = 'EUR' WHERE symbol LIKE '%.AS' OR symbol LIKE '%.MI';

-- הערה: שדה currency יקבל ערך ברירת מחדל USD לכל הטיקרים הקיימים
