CREATE TABLE tickers (
	symbol VARCHAR(10) NOT NULL, 
	name VARCHAR(100), 
	type VARCHAR(20), 
	remarks VARCHAR(500), 
	currency VARCHAR(3), 
	active_trades BOOLEAN, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), updated_at DATETIME, 
	PRIMARY KEY (id)
);
CREATE INDEX ix_tickers_id ON tickers (id);
CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol);
CREATE TABLE cash_flows (
	account_id INTEGER NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	amount FLOAT NOT NULL, 
	date DATE, 
	description VARCHAR(500), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), currency VARCHAR(10) DEFAULT 'USD', currency_id INTEGER DEFAULT 1, usd_rate DECIMAL(10,6) DEFAULT 1.000000, source VARCHAR(20) DEFAULT 'manual', external_id VARCHAR(100) DEFAULT '0', 
	PRIMARY KEY (id), 
	FOREIGN KEY(account_id) REFERENCES accounts (id)
);
CREATE INDEX ix_cash_flows_id ON cash_flows (id);
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
CREATE TABLE note_relation_types (
	note_relation_type VARCHAR(20) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (note_relation_type)
);
CREATE INDEX ix_note_relation_types_id ON note_relation_types (id);
CREATE TABLE currencies (
	symbol VARCHAR(10) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	usd_rate NUMERIC(10, 6) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), usd_rate_default NUMERIC(10,6) DEFAULT 1, 
	PRIMARY KEY (id), 
	UNIQUE (symbol)
);
CREATE INDEX ix_currencies_id ON currencies (id);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content VARCHAR(1000) NOT NULL, attachment VARCHAR(500), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, related_type_id INTEGER NOT NULL, related_id INTEGER NOT NULL);
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
CREATE INDEX idx_constraints_table_column ON constraints (table_name, column_name);
CREATE INDEX idx_constraints_type ON constraints (constraint_type);
CREATE INDEX idx_constraints_active ON constraints (is_active);
CREATE TABLE enum_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                value VARCHAR(50) NOT NULL,
                display_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            );
CREATE INDEX idx_enum_constraint_id ON enum_values (constraint_id);
CREATE INDEX idx_enum_active ON enum_values (is_active);
CREATE INDEX idx_enum_sort ON enum_values (sort_order);
CREATE TABLE constraint_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                validation_type VARCHAR(20) NOT NULL,
                validation_rule TEXT NOT NULL,
                error_message TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            );
CREATE INDEX idx_validation_constraint_id ON constraint_validations (constraint_id);
CREATE INDEX idx_validation_type ON constraint_validations (validation_type);
CREATE INDEX idx_validation_active ON constraint_validations (is_active);
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
            status VARCHAR(20) DEFAULT 'open',
            FOREIGN KEY (ticker_id) REFERENCES tickers(id),
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        );
CREATE TABLE accounts (
            name VARCHAR(100) NOT NULL,
            currency VARCHAR(3),
            status VARCHAR(20),
            cash_balance FLOAT,
            total_value FLOAT,
            total_pl FLOAT,
            notes VARCHAR(500),
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , status_default VARCHAR(20) DEFAULT 'open');
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
CREATE TABLE IF NOT EXISTS "trades" (
            account_id INTEGER NOT NULL, ticker_id INTEGER NOT NULL, trade_plan_id INTEGER, status VARCHAR(20), investment_type VARCHAR(20), opened_at DATETIME, closed_at DATETIME, cancelled_at DATETIME, cancel_reason VARCHAR(500), total_pl FLOAT, notes VARCHAR(500), id INTEGER PRIMARY KEY, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, side VARCHAR(10) DEFAULT 'Long'
        );
CREATE TABLE IF NOT EXISTS "alerts" (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INT, ticker_id INT, type TEXT, message TEXT, triggered_at NUM, created_at NUM, status TEXT, is_triggered TEXT, related_type_id INT, related_id INT, type_default TEXT, related_type_id_default INT, condition_attribute TEXT, condition_operator TEXT, condition_number NUM);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered);
CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
