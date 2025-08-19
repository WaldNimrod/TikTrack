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
CREATE INDEX ix_tickers_id ON tickers (id);
CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol);
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
CREATE INDEX ix_accounts_id ON accounts (id);
CREATE TABLE note_relation_types (
	note_relation_type VARCHAR(20) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (note_relation_type)
);
CREATE INDEX ix_note_relation_types_id ON note_relation_types (id);
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
CREATE INDEX ix_trade_plans_id ON trade_plans (id);
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
CREATE INDEX ix_alerts_id ON alerts (id);
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
CREATE INDEX ix_cash_flows_id ON cash_flows (id);
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
CREATE INDEX ix_notes_id ON notes (id);
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
CREATE INDEX ix_trades_id ON trades (id);
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
CREATE INDEX ix_executions_id ON executions (id);
