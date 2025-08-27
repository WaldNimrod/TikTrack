PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE tickers (
	symbol VARCHAR(10) NOT NULL, 
	name VARCHAR(100), 
	type VARCHAR(20), 
	remarks VARCHAR(500), 
	currency VARCHAR(3), 
	active_trades BOOLEAN, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id)
);
INSERT INTO tickers VALUES('AAPL','Apple Inc.','stock','טכנולוגיה','USD',0,1,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('GOOGL','Alphabet Inc.','stock','טכנולוגיה','USD',0,2,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('MSFT','Microsoft Corporation','stock','טכנולוגיה','USD',0,3,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('TSLA','Tesla Inc.','stock','רכב חשמלי','USD',0,4,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('NVDA','NVIDIA Corporation','stock','צ''יפים','USD',0,5,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('AMZN','Amazon.com Inc.','stock','מסחר אלקטרוני','USD',0,6,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('META','Meta Platforms Inc.','stock','מדיה חברתית','USD',0,7,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('NFLX','Netflix Inc.','stock','סטרימינג','USD',0,8,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('SPY','SPDR S&P 500 ETF','etf','ETF מדד S&P 500','USD',0,9,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('QQQ','Invesco QQQ Trust','etf','ETF טכנולוגיה','USD',0,10,'2025-08-18 20:16:00');
INSERT INTO tickers VALUES('TEST_AAPL_1755552000',NULL,'stock','Test ticker','USD',0,11,'2025-08-18 21:20:00');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552000',NULL,'stock','Test ticker for dict','USD',0,12,'2025-08-18 21:20:00');
INSERT INTO tickers VALUES('TEST_ALERT_1755552000',NULL,'stock','Test ticker for alert','USD',0,13,'2025-08-18 21:20:00');
INSERT INTO tickers VALUES('TEST_AAPL_1755552057',NULL,'stock','Test ticker','USD',0,14,'2025-08-18 21:20:57');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552057',NULL,'stock','Test ticker for dict','USD',0,15,'2025-08-18 21:20:57');
INSERT INTO tickers VALUES('TEST_TRADE_1755552057',NULL,'stock','Test ticker for trade','USD',0,16,'2025-08-18 21:20:57');
INSERT INTO tickers VALUES('TEST_ALERT_1755552057',NULL,'stock','Test ticker for alert','USD',0,17,'2025-08-18 21:20:57');
INSERT INTO tickers VALUES('TEST_AAPL_1755552074',NULL,'stock','Test ticker','USD',0,18,'2025-08-18 21:21:14');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552074',NULL,'stock','Test ticker for dict','USD',0,19,'2025-08-18 21:21:14');
INSERT INTO tickers VALUES('TEST_TRADE_1755552074',NULL,'stock','Test ticker for trade','USD',0,20,'2025-08-18 21:21:14');
INSERT INTO tickers VALUES('TEST_ALERT_1755552074',NULL,'stock','Test ticker for alert','USD',0,21,'2025-08-18 21:21:14');
INSERT INTO tickers VALUES('TEST_AAPL_1755552081',NULL,'stock','Test ticker','USD',0,22,'2025-08-18 21:21:21');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552081',NULL,'stock','Test ticker for dict','USD',0,23,'2025-08-18 21:21:21');
INSERT INTO tickers VALUES('TEST_TRADE_1755552081',NULL,'stock','Test ticker for trade','USD',0,24,'2025-08-18 21:21:21');
INSERT INTO tickers VALUES('TEST_ALERT_1755552081',NULL,'stock','Test ticker for alert','USD',0,25,'2025-08-18 21:21:21');
INSERT INTO tickers VALUES('TEST_AAPL_1755552106',NULL,'stock','Test ticker','USD',0,26,'2025-08-18 21:21:46');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552106',NULL,'stock','Test ticker for dict','USD',0,27,'2025-08-18 21:21:46');
INSERT INTO tickers VALUES('TEST_TRADE_1755552106',NULL,'stock','Test ticker for trade','USD',0,28,'2025-08-18 21:21:46');
INSERT INTO tickers VALUES('TEST_ALERT_1755552106',NULL,'stock','Test ticker for alert','USD',0,29,'2025-08-18 21:21:46');
INSERT INTO tickers VALUES('TEST_AAPL_1755552112',NULL,'stock','Test ticker','USD',0,30,'2025-08-18 21:21:52');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552112',NULL,'stock','Test ticker for dict','USD',0,31,'2025-08-18 21:21:52');
INSERT INTO tickers VALUES('TEST_TRADE_1755552112',NULL,'stock','Test ticker for trade','USD',0,32,'2025-08-18 21:21:52');
INSERT INTO tickers VALUES('TEST_ALERT_1755552112',NULL,'stock','Test ticker for alert','USD',0,33,'2025-08-18 21:21:52');
INSERT INTO tickers VALUES('TEST_AAPL_1755552407',NULL,'stock','Test ticker','USD',0,34,'2025-08-18 21:26:47');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552407',NULL,'stock','Test ticker for dict','USD',0,35,'2025-08-18 21:26:47');
INSERT INTO tickers VALUES('TEST_TRADE_1755552407',NULL,'stock','Test ticker for trade','USD',0,36,'2025-08-18 21:26:47');
INSERT INTO tickers VALUES('TEST_ALERT_1755552407',NULL,'stock','Test ticker for alert','USD',0,37,'2025-08-18 21:26:47');
INSERT INTO tickers VALUES('TEST_AAPL_1755552467',NULL,'stock','Test ticker','USD',0,38,'2025-08-18 21:27:47');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552467',NULL,'stock','Test ticker for dict','USD',0,39,'2025-08-18 21:27:47');
INSERT INTO tickers VALUES('TEST_TRADE_1755552467',NULL,'stock','Test ticker for trade','USD',0,40,'2025-08-18 21:27:47');
INSERT INTO tickers VALUES('TEST_ALERT_1755552467',NULL,'stock','Test ticker for alert','USD',0,41,'2025-08-18 21:27:47');
INSERT INTO tickers VALUES('TEST_AAPL_1755552574',NULL,'stock','Test ticker','USD',0,42,'2025-08-18 21:29:34');
INSERT INTO tickers VALUES('TEST_GOOGL_1755552574',NULL,'stock','Test ticker for dict','USD',0,43,'2025-08-18 21:29:34');
INSERT INTO tickers VALUES('TEST_TRADE_1755552574',NULL,'stock','Test ticker for trade','USD',0,44,'2025-08-18 21:29:34');
INSERT INTO tickers VALUES('TEST_ALERT_1755552574',NULL,'stock','Test ticker for alert','USD',0,45,'2025-08-18 21:29:34');
INSERT INTO tickers VALUES('TEST_AAPL_1755555404',NULL,'stock','Test ticker','USD',0,46,'2025-08-18 22:16:44');
INSERT INTO tickers VALUES('TEST_GOOGL_1755555404',NULL,'stock','Test ticker for dict','USD',0,47,'2025-08-18 22:16:44');
INSERT INTO tickers VALUES('TEST_TRADE_1755555404',NULL,'stock','Test ticker for trade','USD',0,48,'2025-08-18 22:16:44');
INSERT INTO tickers VALUES('TEST_ALERT_1755555404',NULL,'stock','Test ticker for alert','USD',0,49,'2025-08-18 22:16:44');
INSERT INTO tickers VALUES('TEST_AAPL_1755556372',NULL,'stock','Test ticker','USD',0,50,'2025-08-18 22:32:52');
INSERT INTO tickers VALUES('TEST_GOOGL_1755556372',NULL,'stock','Test ticker for dict','USD',0,51,'2025-08-18 22:32:52');
INSERT INTO tickers VALUES('TEST_TRADE_1755556372',NULL,'stock','Test ticker for trade','USD',0,52,'2025-08-18 22:32:52');
INSERT INTO tickers VALUES('TEST_ALERT_1755556372',NULL,'stock','Test ticker for alert','USD',0,53,'2025-08-18 22:32:52');
INSERT INTO tickers VALUES('TEST_AAPL_1755556391',NULL,'stock','Test ticker','USD',0,54,'2025-08-18 22:33:11');
INSERT INTO tickers VALUES('TEST_GOOGL_1755556391',NULL,'stock','Test ticker for dict','USD',0,55,'2025-08-18 22:33:11');
INSERT INTO tickers VALUES('TEST_TRADE_1755556391',NULL,'stock','Test ticker for trade','USD',0,56,'2025-08-18 22:33:11');
INSERT INTO tickers VALUES('TEST_ALERT_1755556391',NULL,'stock','Test ticker for alert','USD',0,57,'2025-08-18 22:33:11');
INSERT INTO tickers VALUES('TEST_AAPL_1755556438',NULL,'stock','Test ticker','USD',0,58,'2025-08-18 22:33:58');
INSERT INTO tickers VALUES('TEST_GOOGL_1755556438',NULL,'stock','Test ticker for dict','USD',0,59,'2025-08-18 22:33:58');
INSERT INTO tickers VALUES('TEST_TRADE_1755556438',NULL,'stock','Test ticker for trade','USD',0,60,'2025-08-18 22:33:58');
INSERT INTO tickers VALUES('TEST_ALERT_1755556438',NULL,'stock','Test ticker for alert','USD',0,61,'2025-08-18 22:33:58');
CREATE TABLE accounts (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	currency VARCHAR(3), 
	status VARCHAR(20), 
	cash_balance FLOAT, 
	total_value FLOAT, 
	total_pl FLOAT, 
	notes VARCHAR(500), 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id)
);
INSERT INTO accounts VALUES(1,'חשבון ראשי','USD','open',50000.0,75000.0,25000.0,'החשבון הראשי שלי','2025-08-18 20:16:00');
INSERT INTO accounts VALUES(2,'חשבון טכנולוגיה','USD','open',25000.0,35000.0,10000.0,'מתמקד במניות טכנולוגיה','2025-08-18 20:16:00');
INSERT INTO accounts VALUES(3,'חשבון ETF','USD','closed',15000.0,18000.0,3000.0,'השקעות ב-ETF','2025-08-18 20:16:00');
INSERT INTO accounts VALUES(4,'חשבון ניסיוני','USD','cancelled',5000.0,5000.0,0.0,'חשבון לניסויים','2025-08-18 20:16:00');
INSERT INTO accounts VALUES(5,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:20:57');
INSERT INTO accounts VALUES(6,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:20:57');
INSERT INTO accounts VALUES(7,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:21:14');
INSERT INTO accounts VALUES(8,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:21:14');
INSERT INTO accounts VALUES(9,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:21:21');
INSERT INTO accounts VALUES(10,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:21:21');
INSERT INTO accounts VALUES(11,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:21:46');
INSERT INTO accounts VALUES(12,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:21:46');
INSERT INTO accounts VALUES(13,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:21:52');
INSERT INTO accounts VALUES(14,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:21:52');
INSERT INTO accounts VALUES(15,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:26:47');
INSERT INTO accounts VALUES(16,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:26:47');
INSERT INTO accounts VALUES(17,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:27:47');
INSERT INTO accounts VALUES(18,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:27:47');
INSERT INTO accounts VALUES(19,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 21:29:34');
INSERT INTO accounts VALUES(20,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 21:29:34');
INSERT INTO accounts VALUES(21,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 22:16:44');
INSERT INTO accounts VALUES(22,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 22:16:44');
INSERT INTO accounts VALUES(23,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 22:32:52');
INSERT INTO accounts VALUES(24,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 22:32:52');
INSERT INTO accounts VALUES(25,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 22:33:11');
INSERT INTO accounts VALUES(26,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 22:33:11');
INSERT INTO accounts VALUES(27,'Test Account','USD','open',0.0,0.0,0.0,'Test account for unit tests','2025-08-18 22:33:58');
INSERT INTO accounts VALUES(28,'Test Account for Trade','USD','open',0.0,0.0,0.0,'Test account for trade tests','2025-08-18 22:33:58');
CREATE TABLE note_relation_types (
	note_relation_type VARCHAR(20) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (note_relation_type)
);
INSERT INTO note_relation_types VALUES('account',1,'2025-08-18 20:16:00');
INSERT INTO note_relation_types VALUES('trade',2,'2025-08-18 20:16:00');
INSERT INTO note_relation_types VALUES('trade_plan',3,'2025-08-18 20:16:00');
INSERT INTO note_relation_types VALUES('ticker',4,'2025-08-18 20:16:00');
CREATE TABLE trade_plans (
	account_id INTEGER NOT NULL, 
	ticker_id INTEGER NOT NULL, 
	investment_type VARCHAR(20), 
	status VARCHAR(20), 
	planned_amount FLOAT, 
	entry_conditions VARCHAR(500), 
	stop_price FLOAT, 
	target_price FLOAT, 
	reasons VARCHAR(500), 
	canceled_at DATETIME, 
	cancel_reason VARCHAR(500), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), side VARCHAR(10) DEFAULT 'Long', 
	PRIMARY KEY (id), 
	FOREIGN KEY(account_id) REFERENCES accounts (id), 
	FOREIGN KEY(ticker_id) REFERENCES tickers (id)
);
INSERT INTO trade_plans VALUES(1,1,'swing','open',10000.0,'מחיר מתחת ל-150$',140.0,180.0,'חברה חזקה עם מוצרים איכותיים',NULL,NULL,1,'2025-08-18 20:16:00','Long');
INSERT INTO trade_plans VALUES(2,2,'swing','open',8000.0,'מחיר מתחת ל-120$',110.0,150.0,'דומיננטיות בחיפוש ופרסום',NULL,NULL,2,'2025-08-18 20:16:00','Long');
INSERT INTO trade_plans VALUES(2,9,'swing','open',5000.0,'מחיר מתחת ל-400$',380.0,450.0,'השקעה במדד S&P 500',NULL,NULL,3,'2025-08-18 20:16:00','Long');
CREATE TABLE alerts (
	type VARCHAR(50) NOT NULL, 
	status VARCHAR(20), 
	condition VARCHAR(500) NOT NULL, 
	message VARCHAR(500), 
	triggered_at DATETIME, 
	is_triggered VARCHAR(20), 
	related_type_id INTEGER NOT NULL, 
	related_id INTEGER NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(related_type_id) REFERENCES note_relation_types (id)
);
INSERT INTO alerts VALUES('price_alert','open','מחיר > 160$','Apple הגיע ליעד המחיר',NULL,'false',1,1,1,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('stop_loss','open','מחיר < 110$','Google הגיע לעצירת הפסד',NULL,'false',1,2,2,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('price_alert','closed','מחיר > 170$','Apple הגיע ליעד מחיר חדש',NULL,'true',4,1,3,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('volume_alert','closed','נפח > 50M','נפח מסחר גבוה ב-Google',NULL,'true',4,2,4,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('price_alert','closed','מחיר > 400$','Microsoft הגיע ליעד מחיר',NULL,'new',4,3,5,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('stop_loss','closed','מחיר < 200$','Tesla הגיע לעצירת הפסד',NULL,'true',4,4,6,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('price_alert','closed','מחיר > 500$','NVIDIA הגיע ליעד מחיר',NULL,'true',4,5,7,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('volume_alert','closed','נפח > 100M','נפח מסחר גבוה ב-SPY',NULL,'new',1,1,8,'2025-08-18 20:16:00');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,17,9,'2025-08-18 21:20:57');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,21,10,'2025-08-18 21:21:14');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,25,11,'2025-08-18 21:21:21');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,29,12,'2025-08-18 21:21:46');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,33,13,'2025-08-18 21:21:52');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,37,14,'2025-08-18 21:26:47');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,41,15,'2025-08-18 21:27:47');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,45,16,'2025-08-18 21:29:34');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,49,17,'2025-08-18 22:16:44');
INSERT INTO alerts VALUES('price_alert','open','price > 200.0','Test alert for price above 200',NULL,'false',4,61,18,'2025-08-18 22:33:58');
CREATE TABLE cash_flows (
	account_id INTEGER NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	amount FLOAT NOT NULL, 
	date DATE, 
	description VARCHAR(500), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(account_id) REFERENCES accounts (id)
);
INSERT INTO cash_flows VALUES(1,'deposit',50000.0,'2025-06-19','הפקדה ראשונית',1,'2025-08-18 20:16:00');
INSERT INTO cash_flows VALUES(1,'dividend',500.0,'2025-08-03','דיבידנד מ-Apple',2,'2025-08-18 20:16:00');
INSERT INTO cash_flows VALUES(2,'deposit',25000.0,'2025-07-04','הפקדה לחשבון טכנולוגיה',3,'2025-08-18 20:16:00');
INSERT INTO cash_flows VALUES(1,'withdrawal',-2000.0,'2025-07-29','משיכה לצרכים אישיים',4,'2025-08-18 20:16:00');
CREATE TABLE notes (
	content VARCHAR(1000) NOT NULL, 
	attachment VARCHAR(500), 
	related_type_id INTEGER NOT NULL, 
	related_id INTEGER NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(related_type_id) REFERENCES note_relation_types (id)
);
INSERT INTO notes VALUES('Apple נראית כמו השקעה טובה לטווח ארוך. החברה ממשיכה לחדש ולשמור על דומיננטיות בשוק',NULL,1,1,1,'2025-08-18 20:16:00');
INSERT INTO notes VALUES('Google עם AI חזק ועתיד מבטיח. כדאי לעקוב אחרי התפתחויות ב-Gemini',NULL,3,1,2,'2025-08-18 20:16:00');
INSERT INTO notes VALUES('השקעה ב-ETF היא דרך טובה לפיזור סיכונים. כדאי לשקול הוספת ETF נוספים',NULL,1,3,3,'2025-08-18 20:16:00');
INSERT INTO notes VALUES('Apple עם iPhone 15 Pro Max מציגה ביצועים מעולים. החברה ממשיכה לחדש בתחום ה-AI',NULL,4,1,4,'2025-08-18 20:16:00');
INSERT INTO notes VALUES('Google עם Gemini מתקדם מאוד. החברה מחזקת את הדומיננטיות בחיפוש ו-AI',NULL,4,2,5,'2025-08-18 20:16:00');
CREATE TABLE trades (
	account_id INTEGER NOT NULL, 
	ticker_id INTEGER NOT NULL, 
	trade_plan_id INTEGER, 
	status VARCHAR(20), 
	type VARCHAR(20), 
	closed_at DATETIME, 
	cancelled_at DATETIME, 
	cancel_reason VARCHAR(500), 
	total_pl FLOAT, 
	notes VARCHAR(500), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), side VARCHAR(10) DEFAULT 'Long', 
	PRIMARY KEY (id), 
	FOREIGN KEY(account_id) REFERENCES accounts (id), 
	FOREIGN KEY(ticker_id) REFERENCES tickers (id), 
	FOREIGN KEY(trade_plan_id) REFERENCES trade_plans (id)
);
INSERT INTO trades VALUES(1,1,1,'open','swing',NULL,NULL,NULL,2500.0,'קנייה של Apple',1,'2025-08-18 20:16:00','Long');
INSERT INTO trades VALUES(2,2,NULL,'closed','swing','2025-08-13 23:16:00.804082',NULL,NULL,1500.0,'טרייד מוצלח ב-Google',2,'2025-07-19 23:16:00.804074','Long');
INSERT INTO trades VALUES(1,9,NULL,'open','swing',NULL,NULL,NULL,800.0,'השקעה ב-ETF',3,'2025-08-08 23:16:00.804083','Long');
INSERT INTO trades VALUES(8,20,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',4,'2025-08-18 21:21:14','Long');
INSERT INTO trades VALUES(10,24,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',5,'2025-08-18 21:21:21','Long');
INSERT INTO trades VALUES(12,28,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',6,'2025-08-18 21:21:46','Long');
INSERT INTO trades VALUES(14,32,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',7,'2025-08-18 21:21:52','Long');
INSERT INTO trades VALUES(16,36,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',8,'2025-08-18 21:26:47','Long');
INSERT INTO trades VALUES(18,40,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',9,'2025-08-18 21:27:47','Long');
INSERT INTO trades VALUES(20,44,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',10,'2025-08-18 21:29:34','Long');
INSERT INTO trades VALUES(22,48,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',11,'2025-08-18 22:16:44','Long');
INSERT INTO trades VALUES(24,52,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',12,'2025-08-18 22:32:52','Long');
INSERT INTO trades VALUES(26,56,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',13,'2025-08-18 22:33:11','Long');
INSERT INTO trades VALUES(28,60,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',14,'2025-08-18 22:33:58','Long');
CREATE TABLE executions (
	trade_id INTEGER NOT NULL, 
	action VARCHAR(20) NOT NULL, 
	date DATETIME, 
	quantity FLOAT NOT NULL, 
	price FLOAT NOT NULL, 
	fee FLOAT, 
	source VARCHAR(50), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(trade_id) REFERENCES trades (id)
);
INSERT INTO executions VALUES(1,'buy','2025-08-13 23:16:00.812447',100.0,155.5,9.99000000000000021,'manual',1,'2025-08-18 20:16:00');
INSERT INTO executions VALUES(2,'buy','2025-07-19 23:16:00.812452',50.0,120.0,9.99000000000000021,'manual',2,'2025-08-18 20:16:00');
INSERT INTO executions VALUES(2,'sell','2025-08-13 23:16:00.812453',50.0,150.0,9.99000000000000021,'manual',3,'2025-08-18 20:16:00');
INSERT INTO executions VALUES(3,'buy','2025-08-08 23:16:00.812454',25.0,400.0,9.99000000000000021,'manual',4,'2025-08-18 20:16:00');
CREATE INDEX ix_tickers_id ON tickers (id);
CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol);
CREATE INDEX ix_accounts_id ON accounts (id);
CREATE INDEX ix_note_relation_types_id ON note_relation_types (id);
CREATE INDEX ix_trade_plans_id ON trade_plans (id);
CREATE INDEX ix_alerts_id ON alerts (id);
CREATE INDEX ix_cash_flows_id ON cash_flows (id);
CREATE INDEX ix_notes_id ON notes (id);
CREATE INDEX ix_trades_id ON trades (id);
CREATE INDEX ix_executions_id ON executions (id);
COMMIT;
