-- הוספת טיקרים לדוגמה עם מטבעות שונים

INSERT INTO tickers (symbol, name, type, remarks, currency) VALUES
('AAPL', 'Apple Inc.', 'stock', 'טכנולוגיה', 'USD'),
('MSFT', 'Microsoft Corporation', 'stock', 'טכנולוגיה', 'USD'),
('GOOGL', 'Alphabet Inc.', 'stock', 'טכנולוגיה', 'USD'),
('TSLA', 'Tesla Inc.', 'stock', 'רכב חשמלי', 'USD'),
('NVDA', 'NVIDIA Corporation', 'stock', 'טכנולוגיה', 'USD'),
('TA35.TA', 'תל אביב 35', 'index', 'מדד תל אביב 35', 'ILS'),
('TA125.TA', 'תל אביב 125', 'index', 'מדד תל אביב 125', 'ILS'),
('TEVA.TA', 'טבע תעשיות', 'stock', 'תרופות', 'ILS'),
('NFLX', 'Netflix Inc.', 'stock', 'מדיה', 'USD'),
('AMZN', 'Amazon.com Inc.', 'stock', 'סחר אלקטרוני', 'USD'),
('EURUSD', 'אירו/דולר', 'forex', 'מטבע חוץ', 'USD'),
('GBPUSD', 'פאונד/דולר', 'forex', 'מטבע חוץ', 'USD'),
('BTCUSD', 'ביטקוין', 'crypto', 'מטבע דיגיטלי', 'USD'),
('ETHUSD', 'אתריום', 'crypto', 'מטבע דיגיטלי', 'USD');
