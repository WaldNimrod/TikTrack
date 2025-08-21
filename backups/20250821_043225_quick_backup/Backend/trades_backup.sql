PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
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
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(account_id) REFERENCES accounts (id), 
	FOREIGN KEY(ticker_id) REFERENCES tickers (id), 
	FOREIGN KEY(trade_plan_id) REFERENCES trade_plans (id)
);
INSERT INTO trades VALUES(1,1,1,'open','swing',NULL,NULL,NULL,2500.0,'קנייה של Apple',1,'2025-08-18 20:16:00');
INSERT INTO trades VALUES(2,2,NULL,'closed','swing','2025-08-13 23:16:00.804082',NULL,NULL,1500.0,'טרייד מוצלח ב-Google',2,'2025-07-19 23:16:00.804074');
INSERT INTO trades VALUES(1,9,NULL,'open','swing',NULL,NULL,NULL,800.0,'השקעה ב-ETF',3,'2025-08-08 23:16:00.804083');
INSERT INTO trades VALUES(8,20,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',4,'2025-08-18 21:21:14');
INSERT INTO trades VALUES(10,24,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',5,'2025-08-18 21:21:21');
INSERT INTO trades VALUES(12,28,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',6,'2025-08-18 21:21:46');
INSERT INTO trades VALUES(14,32,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',7,'2025-08-18 21:21:52');
INSERT INTO trades VALUES(16,36,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',8,'2025-08-18 21:26:47');
INSERT INTO trades VALUES(18,40,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',9,'2025-08-18 21:27:47');
INSERT INTO trades VALUES(20,44,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',10,'2025-08-18 21:29:34');
INSERT INTO trades VALUES(22,48,NULL,'open','swing',NULL,NULL,NULL,0.0,'Test trade',11,'2025-08-18 22:16:44');
INSERT INTO trades VALUES(24,52,NULL,'open','buy',NULL,NULL,NULL,0.0,'Test trade',12,'2025-08-18 22:32:52');
INSERT INTO trades VALUES(26,56,NULL,'open','buy',NULL,NULL,NULL,0.0,'Test trade',13,'2025-08-18 22:33:11');
INSERT INTO trades VALUES(28,60,NULL,'open','buy',NULL,NULL,NULL,0.0,'Test trade',14,'2025-08-18 22:33:58');
COMMIT;
