-- Migration: Add indexes for Import System optimization
-- Created: 2025-01-27
-- Purpose: Optimize database queries for the new import system architecture

-- Indexes for ImportSession table
CREATE INDEX IF NOT EXISTS idx_import_session_trading_account_id ON import_sessions(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_import_session_status ON import_sessions(status);
CREATE INDEX IF NOT EXISTS idx_import_session_created_at ON import_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_import_session_provider ON import_sessions(provider);
CREATE INDEX IF NOT EXISTS idx_import_session_file_hash ON import_sessions(file_hash);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_import_session_account_status ON import_sessions(trading_account_id, status);
CREATE INDEX IF NOT EXISTS idx_import_session_account_created ON import_sessions(trading_account_id, created_at DESC);

-- Indexes for Execution table (for duplicate detection optimization)
CREATE INDEX IF NOT EXISTS idx_execution_account_date ON executions(trading_account_id, date);
CREATE INDEX IF NOT EXISTS idx_execution_ticker_date ON executions(ticker_id, date);
CREATE INDEX IF NOT EXISTS idx_execution_date_symbol ON executions(date, ticker_id);

-- Indexes for Ticker table (for validation optimization)
CREATE INDEX IF NOT EXISTS idx_ticker_symbol ON tickers(symbol);
CREATE INDEX IF NOT EXISTS idx_ticker_active ON tickers(is_active);

-- Indexes for TradingAccount table
CREATE INDEX IF NOT EXISTS idx_trading_account_active ON trading_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_trading_account_name ON trading_accounts(name);

-- Indexes for ImportReport table (if exists)
CREATE INDEX IF NOT EXISTS idx_import_report_session_id ON import_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_import_report_created_at ON import_reports(created_at);

-- Analyze tables to update statistics
ANALYZE import_sessions;
ANALYZE executions;
ANALYZE tickers;
ANALYZE trading_accounts;

