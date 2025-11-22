CREATE TABLE import_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                provider VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                total_records INTEGER NOT NULL DEFAULT 0,
                imported_records INTEGER NOT NULL DEFAULT 0,
                skipped_records INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL DEFAULT 'analyzing',
                summary_data TEXT,
                created_at DATETIME,
                completed_at DATETIME,
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id)
            );
CREATE INDEX ix_import_sessions_trading_account_id ON import_sessions(trading_account_id);
CREATE INDEX ix_import_sessions_status ON import_sessions(status);
CREATE INDEX ix_import_sessions_provider ON import_sessions(provider);
CREATE INDEX ix_import_sessions_created_at ON import_sessions(created_at);
