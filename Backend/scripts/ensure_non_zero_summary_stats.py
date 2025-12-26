#!/usr/bin/env python3
"""
TikTrack - Ensure Non-Zero Summary Stats
=========================================

This script ensures that all summary statistics across all pages show non-zero values
by checking current data and adding missing records as needed.

Usage:
    python3 Backend/scripts/ensure_non_zero_summary_stats.py [--dry-run] [--verbose]

Options:
    --dry-run: Show what would be added without actually adding data
    --verbose: Show detailed progress information
"""

import sys
import os
import argparse
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import DATABASE_URL
from models.ticker import Ticker
from models.trading_account import TradingAccount
from models.trade_plan import TradePlan
from models.trade import Trade
from models.execution import Execution
from models.cash_flow import CashFlow
from models.alert import Alert
from models.note import Note
from models.currency import Currency
from models.user import User
from models.note_relation_type import NoteRelationType

# ============================================================================
# Configuration - Minimum counts for each statistic
# ============================================================================

# Use admin user (ID=2) since that's what the tests use
ADMIN_USER_ID = 2

MINIMUM_COUNTS = {
    'trades': {
        'total': 5,
        'open': 3,
        'closed': 2
    },
    'executions': {
        'total': 10,
        'buy': 5,
        'sell': 5
    },
    'trade_plans': {
        'total': 5
    },
    'cash_flows': {
        'total': 5,
        'income': 3,
        'expense': 2
    },
    'alerts': {
        'total': 5,
        'active': 2,
        'triggered': 2,
        'resolved': 1
    },
    'notes': {
        'total': 5,
        'recent': 2,  # Created in last 7 days
        'with_attachments': 1,
        'with_links': 3  # Notes with related_id (for totalLinks stat)
    },
    'tickers': {
        'total': 10,
        'active': 8,
        'stock': 7,
        'crypto': 3
    },
    'trading_accounts': {
        'total': 2,
        'open': 2,
        'closed': 1
    },
    'ai_analysis': {
        'total': 5,
        'completed': 3,
        'pending': 1,
        'failed': 1,
        'with_notes': 2  # Completed analyses that should have notes (for analysesWithNote stat)
    }
}

# ============================================================================
# Data Generator
# ============================================================================

class SummaryStatsEnsurer:
    def __init__(self, db_session: Session, dry_run: bool = False, verbose: bool = False):
        self.db = db_session
        self.dry_run = dry_run
        self.verbose = verbose
        self.added_count = {}
        
    def check_and_add_data(self):
        """Check current data and add missing records"""
        print("🔍 Checking current data counts...")
        
        # Get current counts
        current_counts = self._get_current_counts()
        
        # Print current counts
        if self.verbose:
            print("\n📊 Current counts:")
            print(f"  Trades: {current_counts['trades_total']} (open: {current_counts['trades_open']}, closed: {current_counts['trades_closed']})")
            print(f"  Executions: {current_counts['executions_total']} (buy: {current_counts['executions_buy']}, sell: {current_counts['executions_sell']})")
            print(f"  Trade Plans: {current_counts['trade_plans_total']}")
            print(f"  Cash Flows: {current_counts['cash_flows_total']} (income: {current_counts['cash_flows_income']}, expense: {current_counts['cash_flows_expense']})")
            print(f"  Alerts: {current_counts['alerts_total']} (active: {current_counts['alerts_active']}, triggered: {current_counts['alerts_triggered']}, resolved: {current_counts['alerts_resolved']})")
            print(f"  Notes: {current_counts['notes_total']} (recent: {current_counts['notes_recent']}, with attachments: {current_counts['notes_with_attachments']}, with links: {current_counts['notes_with_links']})")
            print(f"  Tickers: {current_counts['tickers_total']} (active: {current_counts['tickers_active']}, stock: {current_counts['tickers_stock']}, crypto: {current_counts['tickers_crypto']})")
            print(f"  Trading Accounts: {current_counts['trading_accounts_total']} (open: {current_counts['trading_accounts_open']}, closed: {current_counts['trading_accounts_closed']})")
            print(f"  AI Analysis: {current_counts['ai_analysis_total']} (completed: {current_counts['ai_analysis_completed']}, pending: {current_counts['ai_analysis_pending']})")
            print()
        
        # Check and add for each entity type
        self._ensure_trades(current_counts)
        self._ensure_executions(current_counts)
        self._ensure_trade_plans(current_counts)
        self._ensure_cash_flows(current_counts)
        self._ensure_alerts(current_counts)
        self._ensure_notes(current_counts)
        self._ensure_tickers(current_counts)
        self._ensure_trading_accounts(current_counts)
        self._ensure_ai_analysis(current_counts)
        
        # Commit if not dry run
        if not self.dry_run:
            self.db.commit()
            print("\n✅ All data added successfully!")
        else:
            print("\n🔍 DRY RUN - No data was actually added")
        
        # Print summary
        self._print_summary()
        
    def _get_current_counts(self) -> Dict[str, Any]:
        """Get current record counts from database"""
        counts = {}
        
        # Trades
        counts['trades_total'] = self.db.query(Trade).count()
        counts['trades_open'] = self.db.query(Trade).filter(Trade.status == 'open').count()
        counts['trades_closed'] = self.db.query(Trade).filter(Trade.status == 'closed').count()
        
        # Executions
        counts['executions_total'] = self.db.query(Execution).count()
        counts['executions_buy'] = self.db.query(Execution).filter(Execution.action == 'buy').count()
        counts['executions_sell'] = self.db.query(Execution).filter(Execution.action == 'sell').count()
        
        # Trade Plans
        counts['trade_plans_total'] = self.db.query(TradePlan).count()
        
        # Cash Flows - income types: deposit, dividend, transfer_in, currency_exchange_to, other_positive
        # expense types: withdrawal, fee, transfer_out, currency_exchange_from, other_negative
        counts['cash_flows_total'] = self.db.query(CashFlow).count()
        income_types = ['deposit', 'dividend', 'transfer_in', 'currency_exchange_to', 'other_positive']
        expense_types = ['withdrawal', 'fee', 'transfer_out', 'currency_exchange_from', 'other_negative']
        counts['cash_flows_income'] = self.db.query(CashFlow).filter(CashFlow.type.in_(income_types)).count()
        counts['cash_flows_expense'] = self.db.query(CashFlow).filter(CashFlow.type.in_(expense_types)).count()
        
        # Alerts - status can be 'open' (active), 'triggered', 'resolved', 'closed'
        counts['alerts_total'] = self.db.query(Alert).count()
        counts['alerts_active'] = self.db.query(Alert).filter(Alert.status == 'open').count()
        counts['alerts_triggered'] = self.db.query(Alert).filter(Alert.status == 'triggered').count()
        counts['alerts_resolved'] = self.db.query(Alert).filter(Alert.status == 'resolved').count()
        
        # Notes
        counts['notes_total'] = self.db.query(Note).count()
        recent_date = datetime.now() - timedelta(days=7)
        counts['notes_recent'] = self.db.query(Note).filter(Note.created_at >= recent_date).count()
        counts['notes_with_attachments'] = self.db.query(Note).filter(Note.attachment.isnot(None)).count()
        counts['notes_with_links'] = self.db.query(Note).filter(Note.related_id.isnot(None)).count()
        
        # Tickers
        counts['tickers_total'] = self.db.query(Ticker).count()
        counts['tickers_active'] = self.db.query(Ticker).filter(Ticker.status == 'open').count()
        counts['tickers_stock'] = self.db.query(Ticker).filter(Ticker.type == 'stock').count()
        counts['tickers_crypto'] = self.db.query(Ticker).filter(Ticker.type == 'crypto').count()
        
        # Trading Accounts
        counts['trading_accounts_total'] = self.db.query(TradingAccount).count()
        counts['trading_accounts_open'] = self.db.query(TradingAccount).filter(TradingAccount.status == 'open').count()
        counts['trading_accounts_closed'] = self.db.query(TradingAccount).filter(TradingAccount.status == 'closed').count()
        
        # AI Analysis (if table exists)
        try:
            result = self.db.execute(text("SELECT COUNT(*) FROM ai_analysis_requests"))
            counts['ai_analysis_total'] = result.fetchone()[0]
            result = self.db.execute(text("SELECT COUNT(*) FROM ai_analysis_requests WHERE status = 'completed'"))
            counts['ai_analysis_completed'] = result.fetchone()[0]
            result = self.db.execute(text("SELECT COUNT(*) FROM ai_analysis_requests WHERE status = 'pending'"))
            counts['ai_analysis_pending'] = result.fetchone()[0]
            result = self.db.execute(text("SELECT COUNT(*) FROM ai_analysis_requests WHERE status = 'failed'"))
            counts['ai_analysis_failed'] = result.fetchone()[0]
            # Count completed analyses with response_text (for has_db check)
            result = self.db.execute(text("SELECT COUNT(*) FROM ai_analysis_requests WHERE status = 'completed' AND response_text IS NOT NULL"))
            counts['ai_analysis_with_response'] = result.fetchone()[0]
        except Exception:
            counts['ai_analysis_total'] = 0
            counts['ai_analysis_completed'] = 0
            counts['ai_analysis_pending'] = 0
            counts['ai_analysis_failed'] = 0
            counts['ai_analysis_with_response'] = 0
        
        return counts
    
    def _ensure_trades(self, counts: Dict[str, Any]):
        """Ensure trades have minimum counts"""
        min_counts = MINIMUM_COUNTS['trades']
        
        # Get required entities
        accounts = self.db.query(TradingAccount).all()
        tickers = self.db.query(Ticker).all()
        
        if not accounts or not tickers:
            print("⚠️  Cannot add trades - missing accounts or tickers")
            return
        
        # Total trades
        needed_total = max(0, min_counts['total'] - counts['trades_total'])
        needed_open = max(0, min_counts['open'] - counts['trades_open'])
        needed_closed = max(0, min_counts['closed'] - counts['trades_closed'])
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} trades...")
            self._add_trades(needed_total, needed_open, needed_closed, accounts, tickers)
    
    def _add_trades(self, total: int, open_count: int, closed_count: int, accounts: List, tickers: List):
        """Add trades to database"""
        added = 0
        
        # Add open trades
        for i in range(open_count):
            if added >= total:
                break
            trade = Trade(
                user_id=ADMIN_USER_ID,  # Add user_id
                trading_account_id=accounts[0].id,
                ticker_id=tickers[i % len(tickers)].id,
                status='open',
                investment_type='swing',
                side='buy',
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            if not self.dry_run:
                self.db.add(trade)
            added += 1
        
        # Add closed trades
        for i in range(closed_count):
            if added >= total:
                break
            trade = Trade(
                user_id=ADMIN_USER_ID,  # Add user_id
                trading_account_id=accounts[0].id,
                ticker_id=tickers[i % len(tickers)].id,
                status='closed',
                investment_type='swing',
                side='buy',
                closed_at=datetime.now() - timedelta(days=random.randint(1, 60)),
                created_at=datetime.now() - timedelta(days=random.randint(60, 90))
            )
            if not self.dry_run:
                self.db.add(trade)
            added += 1
        
        self.added_count['trades'] = added
    
    def _ensure_executions(self, counts: Dict[str, Any]):
        """Ensure executions have minimum counts"""
        min_counts = MINIMUM_COUNTS['executions']
        
        # Get required entities
        trades = self.db.query(Trade).all()
        if not trades:
            print("⚠️  Cannot add executions - no trades exist")
            return
        
        needed_total = max(0, min_counts['total'] - counts['executions_total'])
        needed_buy = max(0, min_counts['buy'] - counts['executions_buy'])
        needed_sell = max(0, min_counts['sell'] - counts['executions_sell'])
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} executions...")
            self._add_executions(needed_total, needed_buy, needed_sell, trades)
    
    def _add_executions(self, total: int, buy_count: int, sell_count: int, trades: List):
        """Add executions to database"""
        added = 0
        
        # Add buy executions
        for i in range(buy_count):
            if added >= total:
                break
            execution = Execution(
                user_id=ADMIN_USER_ID,  # Add user_id
                trade_id=trades[i % len(trades)].id,
                action='buy',
                quantity=100.0,
                price=150.0 + (i * 10),
                amount=15000.0 + (i * 1000),
                date=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            if not self.dry_run:
                self.db.add(execution)
            added += 1
        
        # Add sell executions
        for i in range(sell_count):
            if added >= total:
                break
            execution = Execution(
                user_id=ADMIN_USER_ID,  # Add user_id
                trade_id=trades[i % len(trades)].id,
                action='sell',
                quantity=50.0,
                price=160.0 + (i * 10),
                amount=8000.0 + (i * 500),
                date=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            if not self.dry_run:
                self.db.add(execution)
            added += 1
        
        self.added_count['executions'] = added
    
    def _ensure_trade_plans(self, counts: Dict[str, Any]):
        """Ensure trade plans have minimum counts"""
        min_counts = MINIMUM_COUNTS['trade_plans']
        
        accounts = self.db.query(TradingAccount).all()
        tickers = self.db.query(Ticker).all()
        
        if not accounts or not tickers:
            print("⚠️  Cannot add trade plans - missing accounts or tickers")
            return
        
        needed = max(0, min_counts['total'] - counts['trade_plans_total'])
        
        if needed > 0:
            print(f"📊 Adding {needed} trade plans...")
            self._add_trade_plans(needed, accounts, tickers)
    
    def _add_trade_plans(self, count: int, accounts: List, tickers: List):
        """Add trade plans to database"""
        added = 0
        
        for i in range(count):
            plan = TradePlan(
                user_id=ADMIN_USER_ID,  # Add user_id
                trading_account_id=accounts[0].id,
                ticker_id=tickers[i % len(tickers)].id,
                investment_type='swing',
                side='buy',
                status='open',
                planned_amount=10000.0 + (i * 1000),
                entry_price=150.0 + (i * 5),
                created_at=datetime.now() - timedelta(days=random.randint(1, 60))
            )
            if not self.dry_run:
                self.db.add(plan)
            added += 1
        
        self.added_count['trade_plans'] = added
    
    def _ensure_cash_flows(self, counts: Dict[str, Any]):
        """Ensure cash flows have minimum counts"""
        min_counts = MINIMUM_COUNTS['cash_flows']
        
        accounts = self.db.query(TradingAccount).all()
        currencies = self.db.query(Currency).all()
        
        if not accounts or not currencies:
            print("⚠️  Cannot add cash flows - missing accounts or currencies")
            return
        
        needed_total = max(0, min_counts['total'] - counts['cash_flows_total'])
        needed_income = max(0, min_counts['income'] - counts['cash_flows_income'])
        needed_expense = max(0, min_counts['expense'] - counts['cash_flows_expense'])
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} cash flows...")
            self._add_cash_flows(needed_total, needed_income, needed_expense, accounts, currencies)
    
    def _add_cash_flows(self, total: int, income_count: int, expense_count: int, accounts: List, currencies: List):
        """Add cash flows to database"""
        added = 0
        
        # Add income (deposit, dividend, etc.)
        income_types = ['deposit', 'dividend', 'transfer_in']
        for i in range(income_count):
            if added >= total:
                break
            cash_flow = CashFlow(
                user_id=ADMIN_USER_ID,  # Add user_id
                trading_account_id=accounts[0].id,
                type=income_types[i % len(income_types)],
                amount=1000.0 + (i * 100),
                date=datetime.now() - timedelta(days=random.randint(1, 30)),
                description=f'Income {i+1}',
                currency_id=currencies[0].id,
                usd_rate=1.0,
                source='manual'
            )
            if not self.dry_run:
                self.db.add(cash_flow)
            added += 1
        
        # Add expenses (withdrawal, fee, etc.)
        expense_types = ['withdrawal', 'fee', 'transfer_out']
        for i in range(expense_count):
            if added >= total:
                break
            cash_flow = CashFlow(
                user_id=ADMIN_USER_ID,  # Add user_id
                trading_account_id=accounts[0].id,
                type=expense_types[i % len(expense_types)],
                amount=-(100.0 + (i * 10)),
                date=datetime.now() - timedelta(days=random.randint(1, 30)),
                description=f'Expense {i+1}',
                currency_id=currencies[0].id,
                usd_rate=1.0,
                source='manual'
            )
            if not self.dry_run:
                self.db.add(cash_flow)
            added += 1
        
        self.added_count['cash_flows'] = added
    
    def _ensure_alerts(self, counts: Dict[str, Any]):
        """Ensure alerts have minimum counts"""
        min_counts = MINIMUM_COUNTS['alerts']
        
        accounts = self.db.query(TradingAccount).all()
        tickers = self.db.query(Ticker).all()
        
        if not accounts or not tickers:
            print("⚠️  Cannot add alerts - missing accounts or tickers")
            return
        
        needed_active = max(0, min_counts['active'] - counts['alerts_active'])
        needed_triggered = max(0, min_counts['triggered'] - counts['alerts_triggered'])
        needed_resolved = max(0, min_counts['resolved'] - counts['alerts_resolved'])
        needed_total = needed_active + needed_triggered + needed_resolved
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} alerts (active: {needed_active}, triggered: {needed_triggered}, resolved: {needed_resolved})...")
            self._add_alerts(needed_total, needed_active, needed_triggered, needed_resolved, accounts, tickers)
    
    def _add_alerts(self, total: int, active_count: int, triggered_count: int, resolved_count: int, accounts: List, tickers: List):
        """Add alerts to database"""
        added = 0
        
        # Add active alerts (status='open')
        for i in range(active_count):
            if added >= total:
                break
            alert = Alert(
                user_id=ADMIN_USER_ID,  # Add user_id
                ticker_id=tickers[i % len(tickers)].id,
                message=f'Active alert {i+1}',
                status='open',
                is_triggered='false',
                related_type_id=4,  # ticker relation type
                related_id=tickers[i % len(tickers)].id,
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            if not self.dry_run:
                self.db.add(alert)
            added += 1
        
        # Add triggered alerts
        for i in range(triggered_count):
            if added >= total:
                break
            alert = Alert(
                user_id=ADMIN_USER_ID,  # Add user_id
                ticker_id=tickers[i % len(tickers)].id,
                message=f'Triggered alert {i+1}',
                status='triggered',
                is_triggered='true',
                related_type_id=4,  # ticker relation type
                related_id=tickers[i % len(tickers)].id,
                triggered_at=datetime.now() - timedelta(days=random.randint(1, 10)),
                created_at=datetime.now() - timedelta(days=random.randint(10, 30))
            )
            if not self.dry_run:
                self.db.add(alert)
            added += 1
        
        # Add resolved alerts
        for i in range(resolved_count):
            if added >= total:
                break
            alert = Alert(
                user_id=ADMIN_USER_ID,  # Add user_id
                ticker_id=tickers[i % len(tickers)].id,
                message=f'Resolved alert {i+1}',
                status='resolved',
                is_triggered='true',
                related_type_id=4,  # ticker relation type
                related_id=tickers[i % len(tickers)].id,
                triggered_at=datetime.now() - timedelta(days=random.randint(10, 20)),
                created_at=datetime.now() - timedelta(days=random.randint(20, 30))
            )
            if not self.dry_run:
                self.db.add(alert)
            added += 1
        
        self.added_count['alerts'] = added
    
    def _ensure_notes(self, counts: Dict[str, Any]):
        """Ensure notes have minimum counts"""
        min_counts = MINIMUM_COUNTS['notes']
        
        relation_types = self.db.query(NoteRelationType).all()
        trades = self.db.query(Trade).all()
        
        if not relation_types or not trades:
            print("⚠️  Cannot add notes - missing relation types or trades")
            return
        
        needed_recent = max(0, min_counts['recent'] - counts['notes_recent'])
        needed_with_attachments = max(0, min_counts['with_attachments'] - counts['notes_with_attachments'])
        needed_with_links = max(0, min_counts['with_links'] - counts['notes_with_links'])
        needed_total = max(0, min_counts['total'] - counts['notes_total'], needed_recent + needed_with_attachments, needed_with_links)
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} notes (recent: {needed_recent}, with attachments: {needed_with_attachments}, with links: {needed_with_links})...")
            self._add_notes(needed_total, needed_recent, needed_with_attachments, needed_with_links, relation_types, trades)
    
    def _add_notes(self, total: int, recent_count: int, with_attachments_count: int, with_links_count: int, relation_types: List, trades: List):
        """Add notes to database"""
        added = 0
        
        # Add recent notes (within last 7 days) - these will have links
        for i in range(recent_count):
            if added >= total:
                break
            note = Note(
                user_id=ADMIN_USER_ID,
                content=f'Recent note {i+1}',
                related_type_id=relation_types[0].id,
                related_id=trades[i % len(trades)].id if trades else 1,
                created_at=datetime.now() - timedelta(days=random.randint(1, 7))
            )
            if not self.dry_run:
                self.db.add(note)
            added += 1
        
        # Add notes with attachments - these will have links
        for i in range(with_attachments_count):
            if added >= total:
                break
            note = Note(
                user_id=ADMIN_USER_ID,
                content=f'Note with attachment {i+1}',
                attachment='test_file.pdf',
                related_type_id=relation_types[0].id,
                related_id=trades[i % len(trades)].id if trades else 1,
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            if not self.dry_run:
                self.db.add(note)
            added += 1
        
        # Add notes with links (for totalLinks stat) - ensure we have enough linked notes
        needed_linked = max(0, with_links_count - (recent_count + with_attachments_count))
        for i in range(needed_linked):
            if added >= total:
                break
            note = Note(
                user_id=ADMIN_USER_ID,
                content=f'Linked note {i+1}',
                related_type_id=relation_types[0].id,
                related_id=trades[i % len(trades)].id if trades else 1,
                created_at=datetime.now() - timedelta(days=random.randint(8, 60))
            )
            if not self.dry_run:
                self.db.add(note)
            added += 1
        
        # Add remaining notes (may or may not have links)
        remaining = total - added
        for i in range(remaining):
            # Alternate between linked and unlinked notes
            has_link = (i % 2 == 0) and trades
            note = Note(
                user_id=ADMIN_USER_ID,
                content=f'Note {i+1}',
                related_type_id=relation_types[0].id if has_link else relation_types[0].id,
                related_id=trades[i % len(trades)].id if (has_link and trades) else 1,
                created_at=datetime.now() - timedelta(days=random.randint(8, 60))
            )
            if not self.dry_run:
                self.db.add(note)
            added += 1
        
        self.added_count['notes'] = added
    
    def _ensure_tickers(self, counts: Dict[str, Any]):
        """Ensure tickers have minimum counts"""
        min_counts = MINIMUM_COUNTS['tickers']
        
        currencies = self.db.query(Currency).all()
        if not currencies:
            print("⚠️  Cannot add tickers - missing currencies")
            return
        
        needed_total = max(0, min_counts['total'] - counts['tickers_total'])
        needed_active = max(0, min_counts['active'] - counts['tickers_active'])
        needed_stock = max(0, min_counts['stock'] - counts['tickers_stock'])
        needed_crypto = max(0, min_counts['crypto'] - counts['tickers_crypto'])
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} tickers...")
            self._add_tickers(needed_total, needed_active, needed_stock, needed_crypto, currencies)
    
    def _add_tickers(self, total: int, active_count: int, stock_count: int, crypto_count: int, currencies: List):
        """Add tickers to database"""
        added = 0
        
        # Add stock tickers
        stock_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX']
        for i in range(stock_count):
            if added >= total:
                break
            symbol = stock_symbols[i % len(stock_symbols)] + f'_{i}'
            ticker = Ticker(
                symbol=symbol,
                name=f'{symbol} Stock',
                type='stock',
                status='open' if i < active_count else 'closed',
                currency_id=currencies[0].id,
                created_at=datetime.now() - timedelta(days=random.randint(1, 90))
            )
            if not self.dry_run:
                self.db.add(ticker)
            added += 1
        
        # Add crypto tickers
        crypto_symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL']
        for i in range(crypto_count):
            if added >= total:
                break
            symbol = crypto_symbols[i % len(crypto_symbols)] + f'_{i}'
            ticker = Ticker(
                symbol=symbol,
                name=f'{symbol} Crypto',
                type='crypto',
                status='open' if i < active_count else 'closed',
                currency_id=currencies[0].id,
                created_at=datetime.now() - timedelta(days=random.randint(1, 90))
            )
            if not self.dry_run:
                self.db.add(ticker)
            added += 1
        
        self.added_count['tickers'] = added
    
    def _ensure_trading_accounts(self, counts: Dict[str, Any]):
        """Ensure trading accounts have minimum counts"""
        min_counts = MINIMUM_COUNTS['trading_accounts']
        
        currencies = self.db.query(Currency).all()
        if not currencies:
            print("⚠️  Cannot add trading accounts - missing currencies")
            return
        
        needed_open = max(0, min_counts['open'] - counts['trading_accounts_open'])
        needed_closed = max(0, min_counts['closed'] - counts['trading_accounts_closed'])
        needed_total = needed_open + needed_closed
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} trading accounts (open: {needed_open}, closed: {needed_closed})...")
            self._add_trading_accounts(needed_total, needed_open, needed_closed, currencies)
    
    def _add_trading_accounts(self, total: int, open_count: int, closed_count: int, currencies: List):
        """Add trading accounts to database"""
        added = 0
        
        # Add open accounts
        for i in range(open_count):
            if added >= total:
                break
            account = TradingAccount(
                user_id=ADMIN_USER_ID,  # Add user_id
                name=f'Account {i+1}',
                currency_id=currencies[0].id,
                status='open',
                cash_balance=10000.0 + (i * 1000),
                opening_balance=10000.0 + (i * 1000),
                total_value=10000.0 + (i * 1000),
                created_at=datetime.now() - timedelta(days=random.randint(1, 90))
            )
            if not self.dry_run:
                self.db.add(account)
            added += 1
        
        # Add closed accounts
        for i in range(closed_count):
            if added >= total:
                break
            account = TradingAccount(
                user_id=ADMIN_USER_ID,  # Add user_id
                name=f'Closed Account {i+1}',
                currency_id=currencies[0].id,
                status='closed',
                cash_balance=0,
                opening_balance=5000.0,
                total_value=0,
                created_at=datetime.now() - timedelta(days=random.randint(90, 180))
            )
            if not self.dry_run:
                self.db.add(account)
            added += 1
        
        self.added_count['trading_accounts'] = added
    
    def _ensure_ai_analysis(self, counts: Dict[str, Any]):
        """Ensure AI analysis requests have minimum counts"""
        min_counts = MINIMUM_COUNTS['ai_analysis']
        
        # Check if table exists
        try:
            self.db.execute(text("SELECT 1 FROM ai_analysis_requests LIMIT 1"))
        except Exception:
            print("⚠️  AI analysis table does not exist - skipping")
            return
        
        needed_total = max(0, min_counts['total'] - counts['ai_analysis_total'])
        needed_completed = max(0, min_counts['completed'] - counts['ai_analysis_completed'])
        needed_pending = max(0, min_counts['pending'] - counts['ai_analysis_pending'])
        needed_failed = max(0, min_counts['failed'] - counts['ai_analysis_failed'])
        needed_with_response = max(0, min_counts['completed'] - counts['ai_analysis_with_response'])
        needed_with_notes = min_counts.get('with_notes', 0)
        
        if needed_total > 0:
            print(f"📊 Adding {needed_total} AI analysis requests (completed: {needed_completed}, pending: {needed_pending}, failed: {needed_failed})...")
            self._add_ai_analysis(needed_total, needed_completed, needed_pending, needed_failed, needed_with_response, needed_with_notes)
    
    def _add_ai_analysis(self, total: int, completed_count: int, pending_count: int, failed_count: int, with_response_count: int, with_notes_count: int):
        """Add AI analysis requests to database"""
        added = 0
        completed_ids = []  # Track completed analysis IDs for note creation
        
        # Get template_id (use 1 if exists, otherwise we'll handle error)
        try:
            template_result = self.db.execute(text("SELECT id FROM ai_prompt_templates LIMIT 1"))
            template_row = template_result.fetchone()
            template_id = template_row[0] if template_row else 1
        except Exception:
            template_id = 1
        
        # Add completed analyses with response_text (for has_db check)
        for i in range(completed_count):
            if added >= total:
                break
            created_at = datetime.now() - timedelta(days=random.randint(1, 30))
            completed_at = datetime.now() - timedelta(days=random.randint(1, 29))
            
            # Include response_text for analyses that should have it
            has_response = i < with_response_count
            response_text = None
            if has_response:
                response_text = f"""## Analysis Result {i+1}

### Summary
This is a test AI analysis result with markdown formatting.

### Key Points
- **Point 1**: Important information
- **Point 2**: More details
- **Point 3**: Additional insights

### Conclusion
This analysis provides valuable insights for trading decisions.
"""
            
            result = self.db.execute(text("""
                INSERT INTO ai_analysis_requests 
                (template_id, status, created_at, completed_at, user_id, response_text, provider, variables_json, prompt_text)
                VALUES (:template_id, 'completed', :created_at, :completed_at, 1, :response_text, 'gemini', '{}', 'Test prompt')
                RETURNING id
            """), {
                'template_id': template_id,
                'created_at': created_at,
                'completed_at': completed_at,
                'response_text': response_text
            })
            analysis_id = result.fetchone()[0]
            completed_ids.append(analysis_id)
            added += 1
        
        # Add pending analyses
        for i in range(pending_count):
            if added >= total:
                break
            self.db.execute(text("""
                INSERT INTO ai_analysis_requests 
                (template_id, status, created_at, user_id, provider, variables_json, prompt_text)
                VALUES (:template_id, 'pending', :created_at, 1, 'gemini', '{}', 'Test prompt')
            """), {
                'template_id': template_id,
                'created_at': datetime.now() - timedelta(days=random.randint(1, 7))
            })
            added += 1
        
        # Add failed analyses
        for i in range(failed_count):
            if added >= total:
                break
            self.db.execute(text("""
                INSERT INTO ai_analysis_requests 
                (template_id, status, created_at, user_id, error_message, provider, variables_json, prompt_text)
                VALUES (:template_id, 'failed', :created_at, 1, 'Test error message', 'gemini', '{}', 'Test prompt')
            """), {
                'template_id': template_id,
                'created_at': datetime.now() - timedelta(days=random.randint(1, 30))
            })
            added += 1
        
        # Create notes linked to completed analyses (for analysesWithNote stat)
        # Notes with markdown content will be detected as AI analysis notes by the frontend
        if completed_ids and with_notes_count > 0:
            relation_types = self.db.query(NoteRelationType).all()
            if relation_types:
                # Use ticker relation type (id=4) as a placeholder, frontend will detect by content
                relation_type_id = 4  # ticker relation type
                for i, analysis_id in enumerate(completed_ids[:with_notes_count]):
                    note_content = f"""## AI Analysis Result

### Analysis ID: {analysis_id}

**Summary**: This is a test note created from an AI analysis result.

### Key Findings
- Finding 1: Important insight
- Finding 2: Additional information
- Finding 3: More details

### Recommendations
1. Action item 1
2. Action item 2
3. Action item 3

---
*Generated from AI Analysis Request #{analysis_id}*
"""
                    note = Note(
                        user_id=ADMIN_USER_ID,
                        content=note_content,
                        related_type_id=relation_type_id,
                        related_id=analysis_id,  # Link to analysis ID (frontend will detect by content)
                        created_at=datetime.now() - timedelta(days=random.randint(1, 7))
                    )
                    if not self.dry_run:
                        self.db.add(note)
                        self.added_count['ai_analysis_notes'] = self.added_count.get('ai_analysis_notes', 0) + 1
        
        self.added_count['ai_analysis'] = added
    
    def _print_summary(self):
        """Print summary of added data"""
        print("\n📊 Summary:")
        print("=" * 50)
        for entity, count in self.added_count.items():
            print(f"  {entity}: {count} records")
        print("=" * 50)

# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Ensure non-zero summary statistics')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be added without actually adding')
    parser.add_argument('--verbose', action='store_true', help='Show detailed progress')
    args = parser.parse_args()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, poolclass=QueuePool)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        ensurer = SummaryStatsEnsurer(db, dry_run=args.dry_run, verbose=args.verbose)
        ensurer.check_and_add_data()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

