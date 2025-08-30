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
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), updated_at DATETIME, currency_id INTEGER, status TEXT DEFAULT 'open', 
	PRIMARY KEY (id)
);
INSERT INTO tickers VALUES('AAPL','Apple Inc. - UPDATED','stock','טיקר מעודכן','USD',1,1,'2025-08-15 03:51:43',NULL,1,'open');
INSERT INTO tickers VALUES('GOOGL','Alphabet Inc.','stock','טכנולוגיה','USD',0,2,'2025-08-15 03:51:43',NULL,1,'closed');
INSERT INTO tickers VALUES('MSFT','Microsoft Corporation','stock','טכנולוגיה','USD',0,3,'2025-08-15 03:51:43',NULL,1,'closed');
INSERT INTO tickers VALUES('TSLA','Tesla Inc.','stock','רכב חשמלי','USD',0,4,'2025-08-15 03:51:43',NULL,1,'closed');
INSERT INTO tickers VALUES('NVDA','NVIDIA Corporation','stock','צ''יפים','USD',0,5,'2025-08-15 03:51:43',NULL,1,'closed');
INSERT INTO tickers VALUES('AMZN','Amazon.com Inc.','stock','מסחר אלקטרוני','USD',0,6,'2025-08-15 03:51:43',NULL,1,'open');
INSERT INTO tickers VALUES('META','Meta Platforms Inc.','stock','מדיה חברתית','USD',0,7,'2025-08-15 03:51:43',NULL,1,'open');
INSERT INTO tickers VALUES('NFLX','Netflix Inc.','stock','סטרימינג','USD',0,8,'2025-08-15 03:51:43',NULL,1,'open');
INSERT INTO tickers VALUES('SPY','SPDR S&P 500 ETF','etf','ETF מדד S&P 500','USD',0,9,'2025-08-15 03:51:43',NULL,1,'open');
INSERT INTO tickers VALUES('INVALID','Test Ticker',NULL,NULL,NULL,0,10,'2025-08-29 08:26:26.727870',NULL,1,'closed');
INSERT INTO tickers VALUES('TEST123','Test Company',NULL,NULL,NULL,0,11,'2025-08-29 08:27:12.603103',NULL,1,'closed');
INSERT INTO tickers VALUES('TEST456','Test',NULL,NULL,NULL,0,12,'2025-08-29 08:40:27.120151',NULL,1,'closed');
INSERT INTO tickers VALUES('DDD','גגגגג','bond',NULL,NULL,0,13,'2025-08-29 20:23:54.849048',NULL,1,'closed');
INSERT INTO tickers VALUES('SDDD','גגגגגג','crypto',NULL,NULL,0,14,'2025-08-29 21:30:23.912803',NULL,1,'canceled');
INSERT INTO tickers VALUES('DDDS','dddd','crypto',NULL,NULL,0,15,'2025-08-29 21:49:27.146255',NULL,1,'canceled');
CREATE TABLE cash_flows (
	account_id INTEGER NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	amount FLOAT NOT NULL, 
	date DATE, 
	description VARCHAR(500), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), currency_id INTEGER DEFAULT 1, usd_rate DECIMAL(10,6) DEFAULT 1.000000, source VARCHAR(20) DEFAULT 'manual', external_id VARCHAR(100) DEFAULT '0', 
	PRIMARY KEY (id), 
	FOREIGN KEY(account_id) REFERENCES accounts (id)
);
INSERT INTO cash_flows VALUES(2,'dividend',1200.0,'2025-07-22','דיבידנדים מ-ETF',6,'2025-08-15 23:33:33',1,1,'IBKR-tradelog-csv','777');
INSERT INTO cash_flows VALUES(3,'deposit',15000.0,'2025-07-27','הפקדה חודשית',7,'2025-08-15 23:33:33',1,1,'manual','0');
INSERT INTO cash_flows VALUES(1,'withdrawal',-3000.0,'2025-08-01','משיכה לצרכים אישיים',8,'2025-08-15 23:33:33',1,1,'manual','0');
INSERT INTO cash_flows VALUES(1,'fee',100.0,'2025-08-26','test',12,'2025-08-26 01:55:16',1,1,'manual','0');
INSERT INTO cash_flows VALUES(1,'withdrawal',33.0,'2025-08-29','',13,'2025-08-29 10:48:45',2,1,'IBKR-api','666');
INSERT INTO cash_flows VALUES(2,'deposit',444.0,'2025-08-29','',14,'2025-08-29 11:29:31',2,1,'manual','0');
INSERT INTO cash_flows VALUES(2,'withdrawal',77.0,'2025-08-29','',15,'2025-08-29 11:39:24',3,1,'manual','0');
INSERT INTO cash_flows VALUES(2,'withdrawal',666.0,'2025-08-29','',16,'2025-08-29 11:48:22',3,1,'manual','0');
INSERT INTO cash_flows VALUES(3,'withdrawal',878.0,'2025-08-29','',17,'2025-08-29 12:02:10',3,1,'manual','0');
CREATE TABLE executions (
	trade_id INTEGER NOT NULL, 
	action VARCHAR(20) NOT NULL, 
	date DATETIME, 
	quantity FLOAT NOT NULL, 
	price FLOAT NOT NULL, 
	fee FLOAT, 
	source VARCHAR(50), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), external_id VARCHAR(100), notes VARCHAR(500), 
	PRIMARY KEY (id), 
	FOREIGN KEY(trade_id) REFERENCES trades (id)
);
INSERT INTO executions VALUES(2,'sell','2025-08-12 14:45:00',50.0,165.75,7.5,'TD Ameritrade',2,'2025-08-22 16:47:06',NULL,NULL);
INSERT INTO executions VALUES(1,'buy',NULL,100.0,150.0,5.0,'manual',4,'2025-08-29 09:26:18',NULL,'בדיקה');
INSERT INTO executions VALUES(4,'sale','2025-08-29 08:55:00.000000',100.0,333.0,9.99000000000000021,'manual',6,'2025-08-29 11:57:12',NULL,NULL);
INSERT INTO executions VALUES(5,'sale','2025-08-29 09:04:00.000000',100.0,33.0,9.99000000000000021,'manual',7,'2025-08-29 12:05:53',NULL,NULL);
INSERT INTO executions VALUES(2,'buy','2025-08-29 09:14:00.000000',100.0,333.0,9.99000000000000021,'manual',8,'2025-08-29 12:14:48',NULL,NULL);
CREATE TABLE note_relation_types (
	note_relation_type VARCHAR(20) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (note_relation_type)
);
INSERT INTO note_relation_types VALUES('account',1,'2025-08-22 06:32:06');
INSERT INTO note_relation_types VALUES('trade',2,'2025-08-22 06:32:06');
INSERT INTO note_relation_types VALUES('trade_plan',3,'2025-08-22 06:32:06');
INSERT INTO note_relation_types VALUES('ticker',4,'2025-08-22 06:32:06');
CREATE TABLE currencies (
	symbol VARCHAR(10) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	usd_rate NUMERIC(10, 6) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), usd_rate_default NUMERIC(10,6) DEFAULT 1, 
	PRIMARY KEY (id), 
	UNIQUE (symbol)
);
INSERT INTO currencies VALUES('USD','US Dollar',1,1,'2025-08-23 00:30:04',1);
INSERT INTO currencies VALUES('EUR','Euro',0.8499999999999999778,2,'2025-08-23 00:30:04',1);
INSERT INTO currencies VALUES('ILS','Israeli Shekel',3.649999999999999912,3,'2025-08-23 00:30:04',1);
CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content VARCHAR(1000) NOT NULL, attachment VARCHAR(500), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, related_type_id INTEGER NOT NULL, related_id INTEGER NOT NULL);
INSERT INTO notes VALUES(6,'הערה על טרייד 1 - רווח של 15%',NULL,'2025-08-22 20:33:35',2,1);
INSERT INTO notes VALUES(7,'הערה על טרייד 2 - סגירה מוקדמת',NULL,'2025-08-22 20:33:35',2,2);
INSERT INTO notes VALUES(8,'הערה על תוכנית 1 - אסטרטגיה ארוכת טווח',NULL,'2025-08-22 20:33:35',3,1);
CREATE TABLE constraints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name VARCHAR(50) NOT NULL,
                column_name VARCHAR(50) NOT NULL,
                constraint_type VARCHAR(20) NOT NULL,
                constraint_name VARCHAR(100) NOT NULL,
                constraint_definition TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
INSERT INTO constraints VALUES(1,'trades','investment_type','ENUM','valid_investment_type','investment_type IN (swing, investment, passive)',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(2,'trades','status','ENUM','valid_trade_status','status IN (open, closed, cancelled)',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(3,'trades','side','ENUM','valid_trade_side','side IN (Long, Short)',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(4,'trades','account_id','NOT_NULL','account_required','account_id IS NOT NULL',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(5,'trades','ticker_id','NOT_NULL','ticker_required','ticker_id IS NOT NULL',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(6,'trade_plans','investment_type','ENUM','valid_plan_investment_type','investment_type IN (swing, investment, passive)',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(7,'trade_plans','side','ENUM','valid_plan_side','side IN (Long, Short)',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(8,'trade_plans','planned_amount','RANGE','positive_planned_amount','planned_amount > 0',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(9,'trade_plans','target_price','RANGE','positive_target_price','target_price > 0',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(10,'trade_plans','stop_price','RANGE','positive_stop_price','stop_price > 0',1,'2025-08-23 00:57:31','2025-08-23 00:57:31');
INSERT INTO constraints VALUES(11,'alerts','is_triggered','ENUM','valid_alert_triggered','is_triggered IN (new, true, false)',0,'2025-08-23 00:57:31','2025-08-23 15:00:15');
INSERT INTO constraints VALUES(14,'accounts','status','ENUM','valid_account_status','status IN (open, closed, cancelled)',0,'2025-08-23 00:57:31','2025-08-23 13:20:40');
INSERT INTO constraints VALUES(15,'trade_plans','ticker_id','NOT_NULL','ticker_required_for_plans','ticker_id IS NOT NULL',1,'2025-08-23 03:14:01','2025-08-23 03:14:01');
INSERT INTO constraints VALUES(16,'trade_plans','cancelled_at','CHECK','cancelled_after_created','cancelled_at IS NULL OR cancelled_at > created_at',1,'2025-08-23 03:14:06','2025-08-23 03:14:06');
INSERT INTO constraints VALUES(17,'trade_plans','created_at','NOT_NULL','created_at_required','created_at IS NOT NULL',1,'2025-08-23 03:14:11','2025-08-23 03:14:11');
INSERT INTO constraints VALUES(18,'trade_plans','status','ENUM','valid_plan_status','status IN (open, closed, cancelled)',1,'2025-08-23 03:14:23','2025-08-23 03:14:23');
INSERT INTO constraints VALUES(19,'trades','trade_plan_id','NOT_NULL','trade_plan_required_for_trades','trade_plan_id IS NOT NULL',1,'2025-08-23 13:11:12','2025-08-23 13:11:12');
INSERT INTO constraints VALUES(20,'trades','opened_at','CHECK','opened_at_required_for_open_trades','(status = "open" AND opened_at IS NOT NULL) OR (status != "open")',1,'2025-08-23 13:13:28','2025-08-23 13:13:28');
INSERT INTO constraints VALUES(21,'trades','closed_at','CHECK','closed_at_required_for_closed_trades','(status = "closed" AND closed_at IS NOT NULL) OR (status != "closed")',0,'2025-08-23 13:13:31','2025-08-23 13:14:30');
INSERT INTO constraints VALUES(22,'trades','closed_at','CHECK','closed_at_after_opened_at','closed_at IS NULL OR closed_at > opened_at',1,'2025-08-23 13:13:36','2025-08-23 13:13:36');
INSERT INTO constraints VALUES(23,'accounts','id','NOT_NULL','account_id_required','id IS NOT NULL',1,'2025-08-23 13:17:38','2025-08-23 13:17:38');
INSERT INTO constraints VALUES(24,'accounts','name','CHECK','account_name_min_length','LENGTH(name) >= 3',1,'2025-08-23 13:17:43','2025-08-23 13:17:43');
INSERT INTO constraints VALUES(25,'accounts','name','NOT_NULL','account_name_required','name IS NOT NULL',1,'2025-08-23 13:17:48','2025-08-23 13:17:48');
INSERT INTO constraints VALUES(26,'accounts','currency_id','NOT_NULL','account_currency_required','currency_id IS NOT NULL',1,'2025-08-23 13:17:53','2025-08-23 13:17:53');
INSERT INTO constraints VALUES(27,'accounts','created_at','NOT_NULL','account_created_at_required','created_at IS NOT NULL',1,'2025-08-23 13:17:58','2025-08-23 13:17:58');
INSERT INTO constraints VALUES(28,'accounts','status','ENUM','valid_account_status','status IN (active, inactive, suspended)',0,'2025-08-23 13:20:46','2025-08-23 13:21:26');
INSERT INTO constraints VALUES(29,'accounts','status','ENUM','valid_account_status','status IN (open, closed, cancelled)',1,'2025-08-23 13:21:32','2025-08-23 13:21:32');
INSERT INTO constraints VALUES(30,'tickers','id','NOT_NULL','ticker_id_required','id IS NOT NULL',1,'2025-08-23 13:28:08','2025-08-23 13:28:08');
INSERT INTO constraints VALUES(31,'tickers','symbol','NOT_NULL','ticker_symbol_required','symbol IS NOT NULL',1,'2025-08-23 13:28:14','2025-08-23 13:28:14');
INSERT INTO constraints VALUES(32,'tickers','name','CHECK','ticker_name_max_length','LENGTH(name) <= 100',1,'2025-08-23 13:28:19','2025-08-23 13:28:19');
INSERT INTO constraints VALUES(34,'tickers','active_trades','CHECK','active_trades_boolean','active_trades IN (0, 1) OR active_trades IS NULL',1,'2025-08-23 13:28:31','2025-08-23 13:28:31');
INSERT INTO constraints VALUES(35,'tickers','created_at','NOT_NULL','ticker_created_at_required','created_at IS NOT NULL',1,'2025-08-23 13:28:36','2025-08-23 13:28:36');
INSERT INTO constraints VALUES(36,'tickers','updated_at','CHECK','updated_at_not_future','updated_at IS NULL OR updated_at <= datetime("now")',1,'2025-08-23 13:28:42','2025-08-23 13:28:42');
INSERT INTO constraints VALUES(37,'executions','id','NOT_NULL','execution_id_required','id IS NOT NULL',1,'2025-08-23 14:38:58','2025-08-23 14:38:58');
INSERT INTO constraints VALUES(38,'executions','trade_id','CHECK','trade_id_valid','trade_id >= 0',1,'2025-08-23 14:39:04','2025-08-23 14:39:04');
INSERT INTO constraints VALUES(39,'executions','action','ENUM','valid_execution_action','action IN (buy, sale)',1,'2025-08-23 14:39:10','2025-08-23 14:39:10');
INSERT INTO constraints VALUES(40,'executions','date','NOT_NULL','execution_date_required','date IS NOT NULL',1,'2025-08-23 14:39:15','2025-08-23 14:39:15');
INSERT INTO constraints VALUES(41,'executions','quantity','CHECK','quantity_positive','quantity > 0',1,'2025-08-23 14:39:22','2025-08-23 14:39:22');
INSERT INTO constraints VALUES(42,'executions','price','CHECK','price_positive','price > 0',1,'2025-08-23 14:39:32','2025-08-23 14:39:32');
INSERT INTO constraints VALUES(43,'executions','created_at','NOT_NULL','execution_created_at_required','created_at IS NOT NULL',1,'2025-08-23 14:39:38','2025-08-23 14:39:38');
INSERT INTO constraints VALUES(44,'cash_flows','id','NOT_NULL','cash_flow_id_required','id IS NOT NULL',1,'2025-08-23 14:49:11','2025-08-23 14:49:11');
INSERT INTO constraints VALUES(45,'cash_flows','account_id','NOT_NULL','cash_flow_account_required','account_id IS NOT NULL',1,'2025-08-23 14:49:17','2025-08-23 14:49:17');
INSERT INTO constraints VALUES(46,'cash_flows','type','ENUM','valid_cash_flow_type','type IN (deposit, withdrawal, dividend, tax, other)',1,'2025-08-23 14:49:24','2025-08-23 14:49:24');
INSERT INTO constraints VALUES(47,'cash_flows','amount','NOT_NULL','cash_flow_amount_required','amount IS NOT NULL',1,'2025-08-23 14:49:30','2025-08-23 14:49:30');
INSERT INTO constraints VALUES(48,'cash_flows','date','NOT_NULL','cash_flow_date_required','date IS NOT NULL',1,'2025-08-23 14:49:35','2025-08-23 14:49:35');
INSERT INTO constraints VALUES(49,'cash_flows','created_at','NOT_NULL','cash_flow_created_at_required','created_at IS NOT NULL',1,'2025-08-23 14:49:42','2025-08-23 14:49:42');
INSERT INTO constraints VALUES(50,'cash_flows','currency','NOT_NULL','cash_flow_currency_required','currency IS NOT NULL',1,'2025-08-23 14:49:48','2025-08-23 14:49:48');
INSERT INTO constraints VALUES(51,'cash_flows','currency_id','NOT_NULL','cash_flow_currency_id_required','currency_id IS NOT NULL',1,'2025-08-23 14:49:54','2025-08-23 14:49:54');
INSERT INTO constraints VALUES(52,'cash_flows','source','ENUM','valid_cash_flow_source','source IN (manual, IBKR-tradelog-csv, IBKR-api)',1,'2025-08-23 14:50:01','2025-08-23 14:50:01');
INSERT INTO constraints VALUES(53,'cash_flows','external_id','CHECK','external_id_required_for_non_manual','(source != "manual" AND external_id IS NOT NULL) OR source = "manual"',1,'2025-08-23 14:50:06','2025-08-23 14:50:06');
INSERT INTO constraints VALUES(54,'alerts','id','NOT_NULL','alert_id_required','id IS NOT NULL',1,'2025-08-23 15:00:21','2025-08-23 15:00:21');
INSERT INTO constraints VALUES(58,'alerts','status','ENUM','valid_alert_status','status IN (open, closed, cancelled)',1,'2025-08-23 15:00:49','2025-08-23 15:00:49');
INSERT INTO constraints VALUES(59,'alerts','is_triggered','ENUM','valid_alert_triggered','is_triggered IN (new, true, false)',1,'2025-08-23 15:00:59','2025-08-23 15:00:59');
INSERT INTO constraints VALUES(60,'alerts','related_type_id','NOT_NULL','alert_related_type_required','related_type_id IS NOT NULL',1,'2025-08-23 15:01:05','2025-08-23 15:01:05');
INSERT INTO constraints VALUES(61,'alerts','related_id','NOT_NULL','alert_related_id_required','related_id IS NOT NULL',1,'2025-08-23 15:01:11','2025-08-23 15:01:11');
INSERT INTO constraints VALUES(62,'notes','id','NOT_NULL','note_id_required','id IS NOT NULL',1,'2025-08-23 15:15:20','2025-08-23 15:15:20');
INSERT INTO constraints VALUES(63,'notes','content','CHECK','note_content_min_length','LENGTH(content) >= 1',1,'2025-08-23 15:15:24','2025-08-23 15:15:24');
INSERT INTO constraints VALUES(64,'notes','related_id','CHECK','note_related_id_positive','related_id > 0',1,'2025-08-23 15:15:28','2025-08-23 15:15:28');
INSERT INTO constraints VALUES(65,'notes','created_at','CHECK','note_created_at_not_future','created_at IS NULL OR created_at <= datetime("now")',1,'2025-08-23 15:15:34','2025-08-23 15:15:34');
INSERT INTO constraints VALUES(66,'notes','related_type_id','FOREIGN_KEY','note_related_type_fk','FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)',1,'2025-08-23 15:16:34','2025-08-23 15:16:34');
INSERT INTO constraints VALUES(67,'currencies','symbol','CHECK','currency_symbol_format','LENGTH(symbol) = 3 AND symbol = UPPER(symbol) AND symbol GLOB "[A-Z][A-Z][A-Z]"',1,'2025-08-23 15:19:29','2025-08-23 15:19:29');
INSERT INTO constraints VALUES(68,'currencies','name','CHECK','currency_name_length','LENGTH(name) <= 25',1,'2025-08-23 15:19:34','2025-08-23 15:19:34');
INSERT INTO constraints VALUES(69,'currencies','usd_rate','CHECK','currency_usd_rate_positive','usd_rate > 0',1,'2025-08-23 15:19:38','2025-08-23 15:19:38');
INSERT INTO constraints VALUES(70,'currencies','created_at','CHECK','currency_created_at_not_future','created_at IS NULL OR created_at <= datetime("now")',1,'2025-08-23 15:19:43','2025-08-23 15:19:43');
INSERT INTO constraints VALUES(71,'currencies','symbol','UNIQUE','currency_symbol_unique','UNIQUE(symbol)',1,'2025-08-23 15:19:48','2025-08-23 15:19:48');
INSERT INTO constraints VALUES(72,'currencies','name','UNIQUE','currency_name_unique','UNIQUE(name)',1,'2025-08-23 15:19:52','2025-08-23 15:19:52');
INSERT INTO constraints VALUES(73,'accounts','name','UNIQUE','account_name_unique','UNIQUE(name)',1,'2025-08-23 15:20:22','2025-08-23 15:20:22');
INSERT INTO constraints VALUES(74,'note_relation_types','note_relation_type','CHECK','note_relation_type_length','LENGTH(note_relation_type) <= 20',1,'2025-08-23 15:22:52','2025-08-23 15:22:52');
INSERT INTO constraints VALUES(75,'note_relation_types','created_at','CHECK','note_relation_created_at_not_future','created_at IS NULL OR created_at <= datetime("now")',1,'2025-08-23 15:22:58','2025-08-23 15:22:58');
INSERT INTO constraints VALUES(76,'note_relation_types','note_relation_type','UNIQUE','note_relation_type_unique','UNIQUE(note_relation_type)',1,'2025-08-23 15:23:05','2025-08-23 15:23:05');
INSERT INTO constraints VALUES(77,'note_relation_types','note_relation_type','ENUM','valid_note_relation_types','note_relation_type IN (account, trade, trade_plan, ticker)',1,'2025-08-23 15:23:11','2025-08-23 15:23:11');
INSERT INTO constraints VALUES(78,'accounts','currency_id','FOREIGN_KEY','account_currency_fk','FOREIGN KEY (currency_id) REFERENCES currencies(id)',1,'2025-08-23 15:42:15','2025-08-23 15:42:15');
INSERT INTO constraints VALUES(79,'alerts','related_type_id','FOREIGN_KEY','alert_related_type_fk','FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)',1,'2025-08-23 15:42:33','2025-08-23 15:42:33');
INSERT INTO constraints VALUES(80,'tickers','type','ENUM','ticker_type_enum','type IN ("stock", "etf", "bond", "crypto", "forex", "commodity", "other")',1,'2025-08-29 20:51:35','2025-08-29 20:51:35');
INSERT INTO constraints VALUES(81,'tickers','status','ENUM','ticker_status_enum','status IN ("open", "closed", "cancelled")',1,'2025-08-29 20:51:39','2025-08-29 20:51:39');
INSERT INTO constraints VALUES(82,'tickers','currency_id','FOREIGN_KEY','ticker_currency_fk','currency_id REFERENCES currencies(id)',1,'2025-08-29 20:51:44','2025-08-29 20:51:44');
INSERT INTO constraints VALUES(83,'tickers','active_trades','CHECK','active_trades_consistency','(active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open")) OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open")) OR active_trades IS NULL',1,'2025-08-29 20:55:33','2025-08-29 20:55:33');
INSERT INTO constraints VALUES(84,'tickers','status','CHECK','ticker_status_auto_update','(status = "cancelled") OR (status = "open" AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open") OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = "open"))) OR (status = "closed" AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open") AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = "open"))',1,'2025-08-29 21:05:27','2025-08-29 21:05:27');
CREATE TABLE enum_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                value VARCHAR(50) NOT NULL,
                display_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            );
INSERT INTO enum_values VALUES(1,1,'swing','סווינג',1,1);
INSERT INTO enum_values VALUES(2,1,'investment','השקעה',1,2);
INSERT INTO enum_values VALUES(3,1,'passive','פאסיבי',1,3);
INSERT INTO enum_values VALUES(7,3,'Long','קנייה',1,1);
INSERT INTO enum_values VALUES(8,3,'Short','מכירה',1,2);
INSERT INTO enum_values VALUES(9,6,'swing','סווינג',1,1);
INSERT INTO enum_values VALUES(10,6,'investment','השקעה',1,2);
INSERT INTO enum_values VALUES(11,6,'passive','פאסיבי',1,3);
INSERT INTO enum_values VALUES(12,7,'Long','קנייה',1,1);
INSERT INTO enum_values VALUES(13,7,'Short','מכירה',1,2);
INSERT INTO enum_values VALUES(14,11,'new','חדש',1,1);
INSERT INTO enum_values VALUES(15,11,'true','הופעל',1,2);
INSERT INTO enum_values VALUES(16,11,'false','לא הופעל',1,3);
INSERT INTO enum_values VALUES(17,12,'price','מחיר',1,1);
INSERT INTO enum_values VALUES(18,12,'time','זמן',1,2);
INSERT INTO enum_values VALUES(19,12,'custom','מותאם אישית',1,3);
INSERT INTO enum_values VALUES(20,13,'above','מעל',1,1);
INSERT INTO enum_values VALUES(21,13,'below','מתחת',1,2);
INSERT INTO enum_values VALUES(22,13,'equals','שווה',1,3);
INSERT INTO enum_values VALUES(23,14,'active','פעיל',1,1);
INSERT INTO enum_values VALUES(24,14,'inactive','לא פעיל',1,2);
INSERT INTO enum_values VALUES(25,14,'suspended','מושעה',1,3);
INSERT INTO enum_values VALUES(26,2,'open','פתוח',1,1);
INSERT INTO enum_values VALUES(27,2,'closed','סגור',1,2);
INSERT INTO enum_values VALUES(28,2,'cancelled','בוטל',1,3);
INSERT INTO enum_values VALUES(29,18,'open','פתוח',1,1);
INSERT INTO enum_values VALUES(30,18,'closed','סגור',1,2);
INSERT INTO enum_values VALUES(31,18,'cancelled','בוטל',1,3);
INSERT INTO enum_values VALUES(32,28,'active','פעיל',1,1);
INSERT INTO enum_values VALUES(33,28,'inactive','לא פעיל',1,2);
INSERT INTO enum_values VALUES(34,28,'suspended','מושעה',1,3);
INSERT INTO enum_values VALUES(35,29,'open','פתוח',1,1);
INSERT INTO enum_values VALUES(36,29,'closed','סגור',1,2);
INSERT INTO enum_values VALUES(37,29,'cancelled','מבוטל',1,3);
INSERT INTO enum_values VALUES(38,39,'buy','קנייה',1,1);
INSERT INTO enum_values VALUES(39,39,'sale','מכירה',1,2);
INSERT INTO enum_values VALUES(40,46,'deposit','הפקדה',1,1);
INSERT INTO enum_values VALUES(41,46,'withdrawal','משיכה',1,2);
INSERT INTO enum_values VALUES(42,46,'dividend','דיבידנד',1,3);
INSERT INTO enum_values VALUES(43,46,'tax','מס',1,4);
INSERT INTO enum_values VALUES(44,46,'other','אחר',1,5);
INSERT INTO enum_values VALUES(45,52,'manual','ידני',1,1);
INSERT INTO enum_values VALUES(46,52,'IBKR-tradelog-csv','IBKR CSV',1,2);
INSERT INTO enum_values VALUES(47,52,'IBKR-api','IBKR API',1,3);
INSERT INTO enum_values VALUES(48,55,'price','מחיר',1,1);
INSERT INTO enum_values VALUES(49,55,'volume','נפח',1,2);
INSERT INTO enum_values VALUES(50,55,'stop','סטופ',1,3);
INSERT INTO enum_values VALUES(51,55,'ma','ממוצע נע',1,4);
INSERT INTO enum_values VALUES(52,55,'custom','מותאם אישית',1,5);
INSERT INTO enum_values VALUES(53,58,'open','פתוח',1,1);
INSERT INTO enum_values VALUES(54,58,'closed','סגור',1,2);
INSERT INTO enum_values VALUES(55,58,'cancelled','מבוטל',1,3);
INSERT INTO enum_values VALUES(56,59,'new','חדש',1,1);
INSERT INTO enum_values VALUES(57,59,'true','הופעל',1,2);
INSERT INTO enum_values VALUES(58,59,'false','לא הופעל',1,3);
INSERT INTO enum_values VALUES(59,46,'fee','עמלה',1,6);
INSERT INTO enum_values VALUES(60,46,'interest','ריבית',1,7);
INSERT INTO enum_values VALUES(61,80,'stock','מניה',1,1);
INSERT INTO enum_values VALUES(62,80,'etf','ETF',1,2);
INSERT INTO enum_values VALUES(63,80,'bond','אגרת חוב',1,3);
INSERT INTO enum_values VALUES(64,80,'crypto','קריפטו',1,4);
INSERT INTO enum_values VALUES(65,80,'forex','מטבע חוץ',1,5);
INSERT INTO enum_values VALUES(66,80,'commodity','סחורה',1,6);
INSERT INTO enum_values VALUES(67,80,'other','אחר',1,7);
INSERT INTO enum_values VALUES(68,81,'open','פתוח',1,1);
INSERT INTO enum_values VALUES(69,81,'closed','סגור',1,2);
INSERT INTO enum_values VALUES(70,81,'cancelled','מבוטל',1,3);
CREATE TABLE constraint_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                validation_type VARCHAR(20) NOT NULL,
                validation_rule TEXT NOT NULL,
                error_message TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            );
CREATE TABLE trades_backup(
  account_id INT,
  ticker_id INT,
  trade_plan_id INT,
  status TEXT,
  type TEXT,
  opened_at NUM,
  closed_at NUM,
  cancelled_at NUM,
  cancel_reason TEXT,
  total_pl REAL,
  notes TEXT,
  id INT,
  created_at NUM,
  side TEXT
);
INSERT INTO trades_backup VALUES(1,1,1,'closed','swing','2025-08-10 06:51:43.985107','2025-08-22 06:36:04.507510',NULL,NULL,2500.0,'קנייה של Apple',1,'2025-08-15 03:51:43','Long');
INSERT INTO trades_backup VALUES(2,2,NULL,'closed','investment','2025-07-16 06:51:43.985116','2025-08-10 06:51:43.985117',NULL,NULL,1500.0,'טרייד מוצלח ב-Google',2,'2025-08-15 03:51:43','Long');
INSERT INTO trades_backup VALUES(3,9,NULL,'cancelled','passive','2025-08-05 06:51:43.985118',NULL,'2025-08-22 06:50:57.949407','בדיקת ביטול',800.0,'השקעה ב-ETF',3,'2025-08-15 03:51:43','Long');
CREATE TABLE trade_plans_backup(
  account_id INT,
  ticker_id INT,
  investment_type TEXT,
  planned_amount REAL,
  entry_conditions TEXT,
  stop_price REAL,
  target_price REAL,
  reasons TEXT,
  cancelled_at NUM,
  cancel_reason TEXT,
  id INT,
  created_at NUM,
  side TEXT,
  status TEXT
);
INSERT INTO trade_plans_backup VALUES(1,1,'long',10000.0,'מחיר מתחת ל-150$',140.0,180.0,'חברה חזקה עם מוצרים איכותיים','2025-08-22 04:55:44.597017','תוכנית בוטלה לבדיקה',1,'2025-08-15 03:51:43','Long','open');
INSERT INTO trade_plans_backup VALUES(2,2,'long',8000.0,'מחיר מתחת ל-120$',110.0,150.0,'דומיננטיות בחיפוש ופרסום','2025-08-22 04:57:17.798886','תוכנית בוטלה לבדיקה נוספת',2,'2025-08-15 03:51:43','Long','open');
INSERT INTO trade_plans_backup VALUES(3,9,'long',5000.0,'מחיר מתחת ל-400$',380.0,450.0,'השקעה במדד S&P 500','2025-08-22 04:59:30.501464','בדיקה סופית',3,'2025-08-15 03:51:43','Long','canceled');
INSERT INTO trade_plans_backup VALUES(1,1,'long',9892.0,'תנאי כניסה לתכנון 1',71.50169205075540902,177.2904842759099893,'סיבה לתכנון 1','2025-08-22 05:03:15.741213','בדיקה עם cancelled נכון',4,'2025-08-14 06:52:13.106359','Long','cancelled');
INSERT INTO trade_plans_backup VALUES(2,2,'short',18125.0,'תנאי כניסה לתכנון 2',197.7197523943105751,163.7720080468272385,'סיבה לתכנון 2','2025-08-22 05:13:32.532590','בדיקה סופית עם cancelled נכון',5,'2025-08-12 06:52:13.106364','Long','cancelled');
INSERT INTO trade_plans_backup VALUES(3,3,'swing',8851.0,'תנאי כניסה לתכנון 3',192.7381572107135525,147.393376861668969,'סיבה לתכנון 3','2025-08-22 05:38:03.140731','בדיקה סופית - כל התיקונים עובדים',6,'2025-08-08 06:52:13.106365','Long','cancelled');
INSERT INTO trade_plans_backup VALUES(1,4,'long',10727.0,'תנאי כניסה לתכנון 4',162.6327879381840092,192.6597392111895033,'סיבה לתכנון 4','2025-08-22 06:53:19.927459','Cancelled by user',7,'2025-07-31 06:52:13.106365','Long','cancelled');
INSERT INTO trade_plans_backup VALUES(2,5,'short',11568.0,'תנאי כניסה לתכנון 5',189.7630619208715074,244.4453869314440339,'סיבה לתכנון 5',NULL,NULL,8,'2025-07-16 06:52:13.106366','Long','open');
INSERT INTO trade_plans_backup VALUES(3,6,'swing',9275.0,'תנאי כניסה לתכנון 6',69.07536281372267694,286.2996283406395151,'סיבה לתכנון 6',NULL,NULL,9,'2025-06-16 06:52:13.106366','Long','open');
INSERT INTO trade_plans_backup VALUES(1,7,'long',21550.0,'תנאי כניסה לתכנון 7',189.5632825352795691,184.0174752707459617,'סיבה לתכנון 7',NULL,NULL,10,'2025-05-17 06:52:13.106367','Long','open');
INSERT INTO trade_plans_backup VALUES(2,8,'short',16283.0,'תנאי כניסה לתכנון 8',98.5045190253343889,247.6383767532324498,'סיבה לתכנון 8',NULL,NULL,11,'2025-02-16 06:52:13.106367','Long','open');
INSERT INTO trade_plans_backup VALUES(3,9,'swing',15157.0,'תנאי כניסה לתכנון 9',168.7726408590472715,209.7659681474873423,'סיבה לתכנון 9',NULL,NULL,12,'2024-08-15 06:52:13.106368','Long','open');
CREATE TABLE alerts_backup(
  account_id INT,
  ticker_id INT,
  type TEXT,
  condition TEXT,
  message TEXT,
  is_active NUM,
  triggered_at NUM,
  id INT,
  created_at NUM,
  status TEXT,
  is_triggered TEXT,
  related_type_id INT,
  related_id INT
);
INSERT INTO alerts_backup VALUES(2,2,'stop_loss','מחיר < 110$','Google הגיע לעצירת הפסד',1,NULL,2,'2025-08-15 03:51:43','open','false',4,1);
INSERT INTO alerts_backup VALUES(3,9,'volume_alert','נפח > 100M','נפח מסחר גבוה ב-SPY',0,NULL,3,'2025-08-15 03:51:43','open','false',4,1);
INSERT INTO alerts_backup VALUES(1,1,'price_alert','מחיר > 180$','אפל הגיעה ליעד המחיר',1,NULL,4,'2025-08-15 23:33:33','open','false',4,1);
INSERT INTO alerts_backup VALUES(2,2,'stop_loss','מחיר < 120$','טסלה ירדה מתחת לסטופ לוס',1,NULL,5,'2025-08-15 23:33:33','open','false',4,1);
INSERT INTO alerts_backup VALUES(3,3,'volume_alert','נפח > 50M','נפח מסחר גבוה ב-NVIDIA',0,NULL,6,'2025-08-15 23:33:33','open','false',4,1);
INSERT INTO alerts_backup VALUES(1,4,'price_alert','מחיר > 3500$','אמזון הגיעה ליעד המחיר',1,NULL,7,'2025-08-15 23:33:33','open','false',4,1);
INSERT INTO alerts_backup VALUES(2,5,'earnings_alert','דוחות רווחים','דוחות רווחים של מיקרוסופט',1,NULL,8,'2025-08-15 23:33:33','open','false',4,1);
CREATE TABLE accounts_backup(
  name TEXT,
  currency TEXT,
  status TEXT,
  cash_balance REAL,
  total_value REAL,
  total_pl REAL,
  notes TEXT,
  id INT,
  created_at NUM
);
INSERT INTO accounts_backup VALUES('חשבון מעודכן','USD','active',50000.0,75000.0,25000.0,'החשבון הראשי שלי',1,'2025-08-15 03:51:43');
INSERT INTO accounts_backup VALUES('חשבון טכנולוגיה','USD','active',25000.0,35000.0,10000.0,'מתמקד במניות טכנולוגיה',2,'2025-08-15 03:51:43');
INSERT INTO accounts_backup VALUES('חשבון ETF','USD','active',15000.0,18000.0,3000.0,'השקעות ב-ETF',3,'2025-08-15 03:51:43');
INSERT INTO accounts_backup VALUES('חשבון ניסיוני','USD','inactive',5000.0,5000.0,0.0,'חשבון לניסויים',4,'2025-08-15 03:51:43');
INSERT INTO accounts_backup VALUES('חשבון חדש','USD','active',0.0,0.0,0.0,NULL,5,'2025-08-16 01:08:13');
INSERT INTO accounts_backup VALUES('חשבון בדיקה','USD','active',0.0,0.0,0.0,NULL,6,'2025-08-16 01:57:15');
INSERT INTO accounts_backup VALUES('חשבון בדיקה','USD','active',0.0,0.0,0.0,NULL,7,'2025-08-16 01:57:30');
INSERT INTO accounts_backup VALUES('חשבון בדיקה','USD','active',0.0,0.0,0.0,NULL,8,'2025-08-16 01:57:48');
INSERT INTO accounts_backup VALUES('חשבון בדיקה','USD','active',0.0,0.0,0.0,NULL,9,'2025-08-16 01:58:15');
CREATE TABLE trade_plans (
            account_id INTEGER NOT NULL,
            ticker_id INTEGER NOT NULL,
            investment_type VARCHAR(20),
            planned_amount FLOAT,
            entry_conditions VARCHAR(500),
            stop_price FLOAT,
            target_price FLOAT,
            reasons VARCHAR(500),
            cancelled_at DATETIME,
            cancel_reason VARCHAR(500),
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            side VARCHAR(10) DEFAULT 'Long',
            status VARCHAR(20) DEFAULT 'open', stop_percentage FLOAT DEFAULT 0.1, target_percentage FLOAT DEFAULT 2000, current_price FLOAT DEFAULT 0,
            FOREIGN KEY (ticker_id) REFERENCES tickers(id),
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        );
INSERT INTO trade_plans VALUES(1,1,'swing',10000.0,'מחיר מתחת ל-150$',140.0,180.0,'חברה חזקה עם מוצרים איכותיים','2025-08-22 04:55:44.597017','תוכנית בוטלה לבדיקה',1,'2025-08-15 03:51:43','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(2,2,'swing',8000.0,'מחיר מתחת ל-120$',110.0,150.0,'דומיננטיות בחיפוש ופרסום','2025-08-22 04:57:17.798886','תוכנית בוטלה לבדיקה נוספת',2,'2025-08-15 03:51:43','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(3,9,'swing',5000.0,'מחיר מתחת ל-400$',380.0,450.0,'השקעה במדד S&P 500','2025-08-22 04:59:30.501464','בדיקה סופית',3,'2025-08-15 03:51:43','Long','cancelled',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(1,1,'swing',9892.0,'תנאי כניסה לתכנון 1',71.50169205075540902,177.2904842759099893,'סיבה לתכנון 1','2025-08-22 05:03:15.741213','בדיקה עם cancelled נכון',4,'2025-08-14 06:52:13.106359','Long','closed',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(2,2,'swing',18125.0,'תנאי כניסה לתכנון 2',197.7197523943105751,163.7720080468272385,'סיבה לתכנון 2','2025-08-22 05:13:32.532590','בדיקה סופית עם cancelled נכון',5,'2025-08-12 06:52:13.106364','Long','closed',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(3,3,'swing',8851.0,'תנאי כניסה לתכנון 3',192.7381572107135525,147.393376861668969,'סיבה לתכנון 3','2025-08-22 05:38:03.140731','בדיקה סופית - כל התיקונים עובדים',6,'2025-08-08 06:52:13.106365','Long','cancelled',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(1,4,'swing',10727.0,'תנאי כניסה לתכנון 4',162.6327879381840092,192.6597392111895033,'סיבה לתכנון 4','2025-08-22 06:53:19.927459','Cancelled by user',7,'2025-07-31 06:52:13.106365','Long','cancelled',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(2,5,'swing',11568.0,'תנאי כניסה לתכנון 5',189.7630619208715074,244.4453869314440339,'סיבה לתכנון 5',NULL,NULL,8,'2025-07-16 06:52:13.106366','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(3,6,'swing',9275.0,'תנאי כניסה לתכנון 6',69.07536281372267694,286.2996283406395151,'סיבה לתכנון 6',NULL,NULL,9,'2025-06-16 06:52:13.106366','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(1,7,'swing',21550.0,'תנאי כניסה לתכנון 7',189.5632825352795691,184.0174752707459617,'סיבה לתכנון 7',NULL,NULL,10,'2025-05-17 06:52:13.106367','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(2,8,'swing',16283.0,'תנאי כניסה לתכנון 8',98.5045190253343889,247.6383767532324498,'סיבה לתכנון 8',NULL,NULL,11,'2025-02-16 06:52:13.106367','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(3,9,'swing',15157.0,'תנאי כניסה לתכנון 9',168.7726408590472715,209.7659681474873423,'סיבה לתכנון 9',NULL,NULL,12,'2024-08-15 06:52:13.106368','Long','open',0.1000000000000000055,2000.0,0.0);
INSERT INTO trade_plans VALUES(1,1,'swing',1000.0,NULL,NULL,NULL,NULL,NULL,NULL,13,'2025-08-29 08:54:00','Long','open',0.1000000000000000055,2000.0,0.0);
CREATE TABLE trades_backup_investment_type(
  account_id INT,
  ticker_id INT,
  trade_plan_id INT,
  status TEXT,
  type TEXT,
  opened_at NUM,
  closed_at NUM,
  cancelled_at NUM,
  cancel_reason TEXT,
  total_pl REAL,
  notes TEXT,
  id INT,
  created_at NUM,
  side TEXT
);
INSERT INTO trades_backup_investment_type VALUES(1,1,1,'closed','swing','2025-08-10 06:51:43.985107','2025-08-22 06:36:04.507510',NULL,NULL,2500.0,'קנייה של Apple',1,'2025-08-15 03:51:43','Long');
INSERT INTO trades_backup_investment_type VALUES(2,2,NULL,'closed','investment','2025-07-16 06:51:43.985116','2025-08-10 06:51:43.985117',NULL,NULL,1500.0,'טרייד מוצלח ב-Google',2,'2025-08-15 03:51:43','Long');
INSERT INTO trades_backup_investment_type VALUES(3,9,NULL,'cancelled','passive','2025-08-05 06:51:43.985118',NULL,'2025-08-22 06:50:57.949407','בדיקת ביטול',800.0,'השקעה ב-ETF',3,'2025-08-15 03:51:43','Long');
CREATE TABLE IF NOT EXISTS "trades" (
            account_id INTEGER NOT NULL, ticker_id INTEGER NOT NULL, trade_plan_id INTEGER, status VARCHAR(20), investment_type VARCHAR(20), opened_at DATETIME, closed_at DATETIME, cancelled_at DATETIME, cancel_reason VARCHAR(500), total_pl FLOAT, notes VARCHAR(500), id INTEGER PRIMARY KEY, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, side VARCHAR(10) DEFAULT 'Long'
        );
INSERT INTO trades VALUES(1,1,1,'closed','swing','2025-08-10 06:51:43.985107','2025-08-22 06:36:04.507510',NULL,NULL,2500.0,'קנייה של Apple',1,'2025-08-15 03:51:43','Long');
INSERT INTO trades VALUES(2,2,NULL,'closed','investment','2025-07-16 06:51:43.985116','2025-08-10 06:51:43.985117',NULL,NULL,1500.0,'טרייד מוצלח ב-Google',2,'2025-08-15 03:51:43','Long');
INSERT INTO trades VALUES(3,9,NULL,'cancelled','passive','2025-08-05 06:51:43.985118',NULL,'2025-08-22 06:50:57.949407','בדיקת ביטול',800.0,'השקעה ב-ETF',3,'2025-08-15 03:51:43','Long');
INSERT INTO trades VALUES(1,1,NULL,'open','swing','2025-08-26 00:13:21',NULL,NULL,NULL,NULL,NULL,4,'2025-08-26 00:13:21','Long');
CREATE TABLE tickers_backup(
  symbol TEXT,
  name TEXT,
  type TEXT,
  remarks TEXT,
  currency TEXT,
  active_trades NUM,
  id INT,
  created_at NUM,
  updated_at NUM
);
INSERT INTO tickers_backup VALUES('AAPL','Apple Inc. - UPDATED','stock','טיקר מעודכן','USD',0,1,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('GOOGL','Alphabet Inc.','stock','טכנולוגיה','USD',0,2,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('MSFT','Microsoft Corporation','stock','טכנולוגיה','USD',0,3,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('TSLA','Tesla Inc.','stock','רכב חשמלי','USD',0,4,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('NVDA','NVIDIA Corporation','stock','צ''יפים','USD',0,5,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('AMZN','Amazon.com Inc.','stock','מסחר אלקטרוני','USD',1,6,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('META','Meta Platforms Inc.','stock','מדיה חברתית','USD',0,7,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('NFLX','Netflix Inc.','stock','סטרימינג','USD',0,8,'2025-08-15 03:51:43','2025-08-15 03:51:43');
INSERT INTO tickers_backup VALUES('SPY','SPDR S&P 500 ETF','etf','ETF מדד S&P 500','USD',0,9,'2025-08-15 03:51:43','2025-08-15 03:51:43');
CREATE TABLE cash_flows_backup(
  account_id INT,
  type TEXT,
  amount REAL,
  date NUM,
  description TEXT,
  id INT,
  created_at NUM,
  currency TEXT,
  currency_id INT,
  usd_rate NUM,
  source TEXT,
  external_id TEXT
);
INSERT INTO cash_flows_backup VALUES(1,'deposit',50000.0,'2025-06-16','הפקדה ראשונית',1,'2025-08-15 03:51:43','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(1,'dividend',500.0,'2025-07-31','דיבידנד מ-Apple',2,'2025-08-15 03:51:43','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(2,'deposit',25000.0,'2025-07-01','הפקדה לחשבון טכנולוגיה',3,'2025-08-15 03:51:43','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(3,'withdrawal',-2000.0,'2025-07-26','משיכה לצרכים אישיים',4,'2025-08-15 03:51:43','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(1,'dividend',750.0,'2025-07-17','דיבידנדים מאפל',5,'2025-08-15 23:33:33','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(2,'dividend',1200.0,'2025-07-22','דיבידנדים מ-ETF',6,'2025-08-15 23:33:33','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(3,'deposit',15000.0,'2025-07-27','הפקדה חודשית',7,'2025-08-15 23:33:33','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(1,'withdrawal',-3000.0,'2025-08-01','משיכה לצרכים אישיים',8,'2025-08-15 23:33:33','USD',1,1,'manual','0');
INSERT INTO cash_flows_backup VALUES(2,'dividend',850.0,'2025-08-06','דיבידנדים מטסלה',9,'2025-08-15 23:33:33','USD',1,1,'manual','0');
CREATE TABLE tickers_new (
                id INTEGER NOT NULL,
                symbol VARCHAR(10) NOT NULL,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                currency_id INTEGER NOT NULL,
                active_trades BOOLEAN,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                updated_at DATETIME,
                PRIMARY KEY (id),
                FOREIGN KEY (currency_id) REFERENCES currencies(id)
            );
CREATE TABLE cash_flows_new (
                id INTEGER NOT NULL,
                account_id INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                amount FLOAT NOT NULL,
                date DATE,
                description VARCHAR(500),
                currency_id INTEGER NOT NULL,
                usd_rate DECIMAL(10,6) DEFAULT 1.000000,
                source VARCHAR(20) DEFAULT 'manual',
                external_id VARCHAR(100) DEFAULT '0',
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id),
                FOREIGN KEY (account_id) REFERENCES accounts (id),
                FOREIGN KEY (currency_id) REFERENCES currencies(id)
            );
CREATE TABLE IF NOT EXISTS "alerts" (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INT,
                ticker_id INT,
                message TEXT,
                triggered_at NUM,
                created_at NUM,
                status TEXT,
                is_triggered TEXT,
                related_type_id INT,
                related_id INT,
                condition_attribute TEXT,
                condition_operator TEXT,
                condition_number NUM
            );
INSERT INTO alerts VALUES(2,NULL,'stop_loss',NULL,NULL,'2025-08-24 20:27:42','open','false',2,1,'price','less_than',150);
INSERT INTO alerts VALUES(3,NULL,'volume_alert',NULL,NULL,'2025-08-24 18:27:42','open','false',4,5,'volume','more_than',1000000);
INSERT INTO alerts VALUES(4,NULL,'custom_alert',NULL,NULL,'2025-08-24 16:27:42','open','false',3,1,'change','more_than',5);
INSERT INTO alerts VALUES(5,NULL,'price_alert',NULL,NULL,'2025-08-24 14:27:42','open','false',4,2,'ma','cross_up',200);
INSERT INTO alerts VALUES(6,NULL,'custom_alert',NULL,NULL,'2025-08-24 12:27:42','open','false',1,1,'price','equals',100);
INSERT INTO alerts VALUES(7,NULL,'price_alert',NULL,NULL,'2025-08-24 00:27:42','closed','true',4,3,'price','more_than',350);
INSERT INTO alerts VALUES(8,NULL,'stop_loss',NULL,NULL,'2025-08-24 23:27:42','closed','new',2,2,'price','less_than',120);
INSERT INTO alerts VALUES(9,NULL,'custom_alert',NULL,NULL,'2025-08-23 00:27:42','cancelled','false',3,2,'volume','less_than',500000);
INSERT INTO alerts VALUES(10,NULL,'price_alert',NULL,NULL,'2025-08-24 21:27:42','open','false',4,4,'price','more_than',250);
INSERT INTO alerts VALUES(11,NULL,NULL,'test',NULL,NULL,'open','false',4,1,'price','more_than',200);
INSERT INTO alerts VALUES(12,NULL,NULL,NULL,NULL,NULL,'open','false',3,1,'price','more_than',1);
INSERT INTO alerts VALUES(13,NULL,NULL,NULL,NULL,NULL,'open','false',3,1,'price','more_than',1);
INSERT INTO alerts VALUES(14,NULL,NULL,NULL,NULL,NULL,'open','false',3,1,'change','more_than',6);
INSERT INTO alerts VALUES(15,NULL,1,'Test Alert',NULL,NULL,'open','false',4,NULL,'price','less_than',100);
CREATE TABLE IF NOT EXISTS "accounts" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    currency_id INTEGER NOT NULL,
                    status VARCHAR(20),
                    cash_balance FLOAT,
                    total_value FLOAT,
                    total_pl FLOAT,
                    notes VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status_default VARCHAR(20) DEFAULT 'open',
                    FOREIGN KEY (currency_id) REFERENCES currencies(id)
                );
INSERT INTO accounts VALUES(1,'חשבון מעודכן',1,'open',50000.0,75000.0,25000.0,'החשבון הראשי שלי','2025-08-15 03:51:43','open');
INSERT INTO accounts VALUES(2,'חשבון טכנולוגיה',1,'open',25000.0,35000.0,10000.0,'מתמקד במניות טכנולוגיה','2025-08-15 03:51:43','open');
INSERT INTO accounts VALUES(3,'חשבון ETF',1,'open',15000.0,18000.0,3000.0,'השקעות ב-ETF','2025-08-15 03:51:43','open');
INSERT INTO accounts VALUES(4,'חשבון ניסיוני',1,'closed',5000.0,5000.0,0.0,'חשבון לניסויים','2025-08-15 03:51:43','open');
INSERT INTO accounts VALUES(5,'חשבון חדש',1,'open',0.0,0.0,0.0,NULL,'2025-08-16 01:08:13','open');
INSERT INTO accounts VALUES(6,'חשבון בדיקה',1,'open',0.0,0.0,0.0,NULL,'2025-08-16 01:57:15','open');
INSERT INTO accounts VALUES(7,'חשבון בדיקה',1,'open',0.0,0.0,0.0,NULL,'2025-08-16 01:57:30','open');
INSERT INTO accounts VALUES(8,'חשבון בדיקה',1,'open',0.0,0.0,0.0,NULL,'2025-08-16 01:57:48','open');
INSERT INTO accounts VALUES(9,'חשבון בדיקה',1,'open',0.0,0.0,0.0,NULL,'2025-08-16 01:58:15','open');
INSERT INTO accounts VALUES(10,'Test Account',1,'open',10000.0,0.0,0.0,NULL,'2025-08-29 08:27:44','open');
INSERT INTO accounts VALUES(11,'Test Account 2',1,'open',-1000.0,0.0,0.0,NULL,'2025-08-29 08:28:48','open');
INSERT INTO accounts VALUES(12,'Test Account 3',1,'open',5000.0,0.0,0.0,NULL,'2025-08-29 08:33:56','open');
INSERT INTO accounts VALUES(13,'Test Account 4',999,'open',5000.0,0.0,0.0,NULL,'2025-08-29 08:34:06','open');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('notes',13);
INSERT INTO sqlite_sequence VALUES('constraints',84);
INSERT INTO sqlite_sequence VALUES('enum_values',70);
INSERT INTO sqlite_sequence VALUES('trade_plans',13);
INSERT INTO sqlite_sequence VALUES('alerts',15);
INSERT INTO sqlite_sequence VALUES('accounts',13);
CREATE INDEX ix_tickers_id ON tickers (id);
CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol);
CREATE INDEX ix_cash_flows_id ON cash_flows (id);
CREATE INDEX ix_executions_id ON executions (id);
CREATE INDEX ix_note_relation_types_id ON note_relation_types (id);
CREATE INDEX ix_currencies_id ON currencies (id);
CREATE INDEX idx_constraints_table_column ON constraints (table_name, column_name);
CREATE INDEX idx_constraints_type ON constraints (constraint_type);
CREATE INDEX idx_constraints_active ON constraints (is_active);
CREATE INDEX idx_enum_constraint_id ON enum_values (constraint_id);
CREATE INDEX idx_enum_active ON enum_values (is_active);
CREATE INDEX idx_enum_sort ON enum_values (sort_order);
CREATE INDEX idx_validation_constraint_id ON constraint_validations (constraint_id);
CREATE INDEX idx_validation_type ON constraint_validations (validation_type);
CREATE INDEX idx_validation_active ON constraint_validations (is_active);
CREATE TRIGGER protect_base_currency_update BEFORE UPDATE ON currencies BEGIN SELECT CASE WHEN NEW.id = 1 THEN RAISE(ABORT, 'Cannot update base currency record (ID=1)') END; END;
CREATE TRIGGER protect_base_currency_delete BEFORE DELETE ON currencies BEGIN SELECT CASE WHEN OLD.id = 1 THEN RAISE(ABORT, 'Cannot delete base currency record (ID=1)') END; END;
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered);
CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE TRIGGER protect_last_account_delete 
                BEFORE DELETE ON accounts 
                BEGIN 
                    SELECT CASE 
                        WHEN (SELECT COUNT(*) FROM accounts) = 1 
                        THEN RAISE(ABORT, 'Cannot delete the last account in the system') 
                    END; 
                END;
COMMIT;
