#!/usr/bin/env python3
"""
TikTrack Demo Data Generation Script
====================================

Generates comprehensive demo data for the TikTrack system to enable impressive
demonstrations of all system capabilities, including full and correct links between all entities.

This script creates realistic demo data with proper relationships, date distributions,
and logical connections between all entities in the system.

Usage:
    python3 Backend/scripts/generate_demo_data.py [--dry-run] [--verbose]

Options:
    --dry-run: Validate schema only, don't create data
    --verbose: Show detailed progress information

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
    See documentation/05-REPORTS/DEMO_DATA_GENERATION_GUIDE.md for full guide
"""

import sys
import os
import random
import argparse
import json
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Tuple, Any
from decimal import Decimal
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

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
from models.user_ticker import UserTicker
from models.watch_list import WatchList, WatchListItem

# ============================================================================
# Configuration
# ============================================================================

DEMO_CONFIG = {
    'trading_accounts': {
        'count': 2,
        'primary_account_activity_percent': 70,
        'primary_account_swing_only': True
    },
    'tickers': {
        'count': 50,
        'usd_percent': 90,
        'other_currencies': ['ILS', 'EUR']
    },
    'trade_plans': {
        'count': 120,
        'swing_percent': 50,
        'long_percent': 90
    },
    'trades': {
        'count': 80,
        'from_plans_percent': 70  # 70% מהטריידים מתוכניות
    },
    'time_distribution': {
        'last_6_months_percent': 40,
        'last_3_months_of_6_percent': 70,  # 70% מתוך ה-40%
        'total_years_back': 2
    }
}

# Symbol mappings for European tickers (Yahoo Finance format)
# Maps internal symbol to provider symbol (Yahoo Finance)
EUROPEAN_SYMBOL_MAPPINGS = {
    'SAN': 'SAN.PA',      # Banco Santander - Paris Exchange
    'SIE': 'SIE.F',       # Siemens AG - Frankfurt Exchange
    'SAP': 'SAP.F',       # SAP SE - Frankfurt Exchange
    'BMW': 'BMW.F',       # Bayerische Motoren Werke - Frankfurt Exchange
    'ASML': 'ASML.AS',    # ASML Holding - Amsterdam Exchange
    'UL': 'ULVR.L',       # Unilever PLC - London Stock Exchange
    'NOVN': 'NOVN.SW',    # Novartis AG - Swiss Exchange
}

# Sample ticker symbols and names
# NOTE: Only use major, liquid tickers with available market data
# Exception: TIPU and 500X are kept even without data (as per requirements)
SAMPLE_TICKERS = [
    # Tech Stocks (USD) - Major companies
    ('AAPL', 'Apple Inc.', 'stock', 'USD'),
    ('MSFT', 'Microsoft Corporation', 'stock', 'USD'),
    ('GOOGL', 'Alphabet Inc. Class A', 'stock', 'USD'),
    ('AMZN', 'Amazon.com Inc.', 'stock', 'USD'),
    ('TSLA', 'Tesla Inc.', 'stock', 'USD'),
    ('META', 'Meta Platforms Inc.', 'stock', 'USD'),
    ('NVDA', 'NVIDIA Corporation', 'stock', 'USD'),
    ('NFLX', 'Netflix Inc.', 'stock', 'USD'),
    ('AMD', 'Advanced Micro Devices', 'stock', 'USD'),
    ('INTC', 'Intel Corporation', 'stock', 'USD'),
    ('ORCL', 'Oracle Corporation', 'stock', 'USD'),
    ('CRM', 'Salesforce Inc.', 'stock', 'USD'),
    ('ADBE', 'Adobe Inc.', 'stock', 'USD'),
    ('IBM', 'International Business Machines', 'stock', 'USD'),
    ('AVGO', 'Broadcom Inc.', 'stock', 'USD'),
    ('QCOM', 'Qualcomm Incorporated', 'stock', 'USD'),
    ('TXN', 'Texas Instruments Incorporated', 'stock', 'USD'),
    ('MU', 'Micron Technology Inc.', 'stock', 'USD'),
    
    # Finance (USD) - Major banks and financial services
    ('JPM', 'JPMorgan Chase & Co.', 'stock', 'USD'),
    ('BAC', 'Bank of America Corp.', 'stock', 'USD'),
    ('WFC', 'Wells Fargo & Company', 'stock', 'USD'),
    ('GS', 'Goldman Sachs Group Inc.', 'stock', 'USD'),
    ('MS', 'Morgan Stanley', 'stock', 'USD'),
    ('V', 'Visa Inc.', 'stock', 'USD'),
    ('MA', 'Mastercard Incorporated', 'stock', 'USD'),
    ('AXP', 'American Express Company', 'stock', 'USD'),
    ('C', 'Citigroup Inc.', 'stock', 'USD'),
    
    # Consumer & Retail (USD) - Major companies
    ('WMT', 'Walmart Inc.', 'stock', 'USD'),
    ('HD', 'Home Depot Inc.', 'stock', 'USD'),
    ('DIS', 'Walt Disney Company', 'stock', 'USD'),
    ('NKE', 'Nike Inc.', 'stock', 'USD'),
    ('SBUX', 'Starbucks Corporation', 'stock', 'USD'),
    ('MCD', 'McDonald\'s Corporation', 'stock', 'USD'),
    ('COST', 'Costco Wholesale Corporation', 'stock', 'USD'),
    ('TGT', 'Target Corporation', 'stock', 'USD'),
    ('LOW', 'Lowe\'s Companies Inc.', 'stock', 'USD'),
    
    # Healthcare (USD)
    ('JNJ', 'Johnson & Johnson', 'stock', 'USD'),
    ('UNH', 'UnitedHealth Group Incorporated', 'stock', 'USD'),
    ('PFE', 'Pfizer Inc.', 'stock', 'USD'),
    ('ABBV', 'AbbVie Inc.', 'stock', 'USD'),
    ('TMO', 'Thermo Fisher Scientific Inc.', 'stock', 'USD'),
    
    # ETFs (USD) - Major, liquid ETFs
    ('SPY', 'SPDR S&P 500 ETF Trust', 'etf', 'USD'),
    ('QQQ', 'Invesco QQQ Trust', 'etf', 'USD'),
    ('VTI', 'Vanguard Total Stock Market ETF', 'etf', 'USD'),
    ('VOO', 'Vanguard S&P 500 ETF', 'etf', 'USD'),
    ('IWM', 'iShares Russell 2000 ETF', 'etf', 'USD'),
    ('DIA', 'SPDR Dow Jones Industrial Average ETF', 'etf', 'USD'),
    ('GLD', 'SPDR Gold Trust', 'etf', 'USD'),
    ('TLT', 'iShares 20+ Year Treasury Bond ETF', 'etf', 'USD'),
    ('IVV', 'iShares Core S&P 500 ETF', 'etf', 'USD'),
    ('IJH', 'iShares Core S&P Mid-Cap ETF', 'etf', 'USD'),
    
    # Crypto (USD) - Major cryptocurrencies
    ('BTC', 'Bitcoin', 'crypto', 'USD'),
    ('ETH', 'Ethereum', 'crypto', 'USD'),
    
    # Israeli stocks (ILS) - Major Israeli companies
    ('TEVA', 'Teva Pharmaceutical Industries Ltd.', 'stock', 'ILS'),
    ('WIX', 'Wix.com Ltd.', 'stock', 'ILS'),
    ('NICE', 'NICE Ltd.', 'stock', 'ILS'),
    ('CHKP', 'Check Point Software Technologies Ltd.', 'stock', 'ILS'),
    
    # European stocks (EUR) - Major European companies
    ('ASML', 'ASML Holding N.V.', 'stock', 'EUR'),
    ('SAP', 'SAP SE', 'stock', 'EUR'),
    ('SAN', 'Banco Santander S.A.', 'stock', 'EUR'),
    ('BMW', 'Bayerische Motoren Werke AG', 'stock', 'EUR'),
    ('SIE', 'Siemens AG', 'stock', 'EUR'),
    ('UL', 'Unilever PLC', 'stock', 'EUR'),
    ('NOVN', 'Novartis AG', 'stock', 'EUR'),
]

# Sample cash flow types
CASH_FLOW_TYPES = [
    'deposit',
    'withdrawal',
    'fee',
    'dividend',
    'interest',
    'transfer_in',
    'transfer_out',
    'currency_exchange_from',  # המרת מטבע - יציאה (מצמדים)
    'currency_exchange_to'     # המרת מטבע - כניסה (מצמדים)
]

# Alert related types
ALERT_RELATED_TYPES = {
    'trading_account': 1,
    'trade': 2,
    'trade_plan': 3,
    'ticker': 4
}

# Note related types (same as alerts)
NOTE_RELATED_TYPES = {
    'trading_account': 1,
    'trade': 2,
    'trade_plan': 3,
    'ticker': 4
}

# Investment types - Valid values per system constraints: swing, investment, passive
INVESTMENT_TYPES = ['swing', 'investment', 'passive']

# Trade sides
TRADE_SIDES = ['Long', 'Short']

# Trade statuses
TRADE_STATUSES = ['open', 'closed', 'cancelled']

# Execution actions
EXECUTION_ACTIONS = ['buy', 'sell', 'short', 'cover']

# ============================================================================
# Exception Classes
# ============================================================================

class SchemaValidationError(Exception):
    """שגיאה במבנה בסיס הנתונים"""
    
    def __init__(self, table_name: str, missing_field: Optional[str] = None, 
                 error_type: Optional[str] = None, details: Optional[str] = None):
        self.table_name = table_name
        self.missing_field = missing_field
        self.error_type = error_type
        self.details = details
        
        # Build clear Hebrew error message
        if error_type == 'missing_table':
            msg = f"❌ טבלה חסרה: '{table_name}' לא נמצאה בבסיס הנתונים"
            msg += f"\n📍 מיקום: בדיקת מבנה DB לפני יצירת נתוני דוגמה"
            msg += f"\n💡 פתרון: ודא שהטבלה קיימת ורוץ את migration המתאים"
        elif error_type == 'missing_field':
            msg = f"❌ שדה חסר: '{missing_field}' לא נמצא בטבלה '{table_name}'"
            msg += f"\n📍 מיקום: טבלה: {table_name}, שדה: {missing_field}"
            msg += f"\n💡 פתרון: בדוק את מודל {table_name} וודא שהשדה קיים"
        elif error_type == 'foreign_key':
            msg = f"❌ בעיית Foreign Key: בטבלה '{table_name}'"
            msg += f"\n📍 פרטים: {details or 'Foreign key constraint failed'}"
            msg += f"\n💡 פתרון: ודא שהטבלה המקושרת קיימת ומכילה את הנתונים הנדרשים"
        else:
            msg = f"❌ שגיאת אימות מבנה: '{table_name}'"
            if details:
                msg += f"\n📍 פרטים: {details}"
        
        super().__init__(msg)


class DataGenerationError(Exception):
    """שגיאה ביצירת נתוני דוגמה"""
    
    def __init__(self, entity_type: str, reason: str, details: Optional[str] = None):
        self.entity_type = entity_type
        self.reason = reason
        self.details = details
        
        msg = f"❌ שגיאה ביצירת {entity_type}: {reason}"
        if details:
            msg += f"\n📍 פרטים: {details}"
        msg += f"\n💡 פתרון: בדוק את הקונפיגורציה והנתונים הקיימים"
        
        super().__init__(msg)


# ============================================================================
# Database Validator
# ============================================================================

class DatabaseValidator:
    """בודק את מבנה בסיס הנתונים לפני יצירת נתוני דוגמה"""
    
    REQUIRED_TABLES = [
        'users',
        'currencies',
        'tickers',
        'trading_accounts',
        'trade_plans',
        'trades',
        'executions',
        'cash_flows',
        'alerts',
        'notes',
        'note_relation_types'
    ]
    
    REQUIRED_FIELDS = {
        'tickers': ['id', 'symbol', 'name', 'type', 'currency_id', 'status', 'created_at'],
        'trading_accounts': ['id', 'name', 'currency_id', 'status', 'created_at'],
        'trade_plans': ['id', 'trading_account_id', 'ticker_id', 'investment_type', 
                       'side', 'status', 'planned_amount', 'entry_price', 'created_at'],
        'trades': ['id', 'trading_account_id', 'ticker_id', 'status', 'investment_type',
                  'side', 'created_at'],
        'executions': ['id', 'ticker_id', 'action', 'date', 'quantity', 'price', 'created_at'],
        'cash_flows': ['id', 'trading_account_id', 'type', 'amount', 'date', 'created_at'],
        'alerts': ['id', 'related_type_id', 'status', 'created_at'],
        'notes': ['id', 'content', 'related_type_id', 'related_id', 'created_at'],
        'currencies': ['id', 'symbol', 'name', 'usd_rate'],
        'users': ['id', 'username', 'is_active']
    }
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.inspector = inspect(db_session.bind)
    
    def validate(self) -> None:
        """בודק את כל הדרישות"""
        print("🔍 בודק מבנה בסיס הנתונים...")
        
        try:
            # Check tables exist
            self._check_tables_exist()
            
            # Check required fields
            self._check_required_fields()
            
            # Check required data
            self._check_required_data()
            
            print("✅ מבנה בסיס הנתונים תקין")
            
        except SchemaValidationError:
            raise
        except Exception as e:
            raise SchemaValidationError(
                'unknown',
                error_type='validation_error',
                details=f"שגיאה לא צפויה באימות: {str(e)}"
            )
    
    def _check_tables_exist(self) -> None:
        """בודק שכל הטבלאות הנדרשות קיימות"""
        existing_tables = self.inspector.get_table_names()
        
        for table in self.REQUIRED_TABLES:
            if table not in existing_tables:
                raise SchemaValidationError(
                    table,
                    error_type='missing_table',
                    details=f"הטבלה {table} לא נמצאה. הטבלאות הקיימות: {', '.join(existing_tables[:10])}"
                )
    
    def _check_required_fields(self) -> None:
        """בודק שכל השדות הנדרשים קיימים"""
        for table_name, required_fields in self.REQUIRED_FIELDS.items():
            try:
                columns = [col['name'] for col in self.inspector.get_columns(table_name)]
                
                for field in required_fields:
                    if field not in columns:
                        raise SchemaValidationError(
                            table_name,
                            missing_field=field,
                            error_type='missing_field',
                            details=f"השדה {field} חסר. השדות הקיימים: {', '.join(columns[:10])}"
                        )
            except Exception as e:
                if isinstance(e, SchemaValidationError):
                    raise
                raise SchemaValidationError(
                    table_name,
                    error_type='validation_error',
                    details=f"שגיאה בבדיקת שדות: {str(e)}"
                )
    
    def _check_required_data(self) -> None:
        """בודק שקיימים נתוני בסיס נדרשים"""
        # Check for at least one user (any user - no full user system yet)
        user_count = self.db.query(User).count()
        if user_count == 0:
            raise SchemaValidationError(
                'users',
                error_type='missing_data',
                details="לא נמצא משתמש במערכת. יש ליצור משתמש ידנית בבסיס הנתונים לפני יצירת נתוני דוגמה"
            )
        
        # Check for at least USD currency
        usd_currency = self.db.query(Currency).filter(Currency.symbol == 'USD').first()
        if not usd_currency:
            raise SchemaValidationError(
                'currencies',
                error_type='missing_data',
                details="לא נמצא מטבע USD. יש לוודא שמטבע USD קיים במערכת"
            )
        
        # Check for SPY ticker (should exist after phase 1)
        spy_ticker = self.db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        if not spy_ticker:
            raise SchemaValidationError(
                'tickers',
                error_type='missing_data',
                details="לא נמצא טיקר SPY. ודא ששלב 1 (ניקוי נתונים) הושלם בהצלחה"
            )
        
        # Check for AI templates (optional but recommended)
        try:
            from models.ai_analysis import AIPromptTemplate
            template_count = self.db.query(AIPromptTemplate).filter(
                AIPromptTemplate.is_active == True
            ).count()
            if template_count == 0:
                print("   ⚠️  אין תבניות AI פעילות - ניתוחי AI לא יווצרו")
        except ImportError:
            # AI Analysis models might not exist - that's okay
            pass


# ============================================================================
# Date Distribution Helper
# ============================================================================

class DateDistributionGenerator:
    """מייצר תאריכים לפי הדרישות של פיזור נתונים"""
    
    def __init__(self):
        self.now = datetime.now()
        self.six_months_ago = self.now - timedelta(days=180)
        self.three_months_ago = self.now - timedelta(days=90)
        self.two_years_ago = self.now - timedelta(days=730)
    
    def generate_date(self, distribution_type: str = 'random') -> datetime:
        """
        יוצר תאריך לפי הפיזור הנדרש
        
        Args:
            distribution_type: 'random' (40% חצי שנה), 'recent' (70% מתוך החצי שנה = 3 חודשים)
        
        Returns:
            datetime: תאריך שנוצר
        """
        rand = random.random()
        
        if distribution_type == 'recent':
            # 70% בשלושת החודשים האחרונים, 30% בשלושת החודשים לפני
            if rand < 0.7:
                # שלושת החודשים האחרונים
                days_back = random.randint(0, 90)
            else:
                # שלושת החודשים לפני (90-180 ימים)
                days_back = random.randint(90, 180)
            return self.now - timedelta(days=days_back)
        
        else:  # random - 40% בחצי שנה, 60% בשנה וחצי הקודמת
            if rand < 0.4:
                # 40% בחצי שנה האחרונה
                days_back = random.randint(0, 180)
            else:
                # 60% בשנה וחצי הקודמת (180-730 ימים)
                days_back = random.randint(180, 730)
            return self.now - timedelta(days=days_back)
    
    def generate_date_in_range(self, start_date: datetime, end_date: datetime) -> datetime:
        """יוצר תאריך בטווח מסוים"""
        delta = end_date - start_date
        days = random.randint(0, max(0, delta.days))
        return start_date + timedelta(days=days)


# ============================================================================
# Data Relationship Manager
# ============================================================================

class DataRelationshipManager:
    """מנהל את הקשרים בין ישויות שונות"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.tickers: List[Ticker] = []
        self.accounts: List[TradingAccount] = []
        self.trade_plans: List[TradePlan] = []
        self.trades: List[Trade] = []
    
    def get_random_ticker(self, currency_id: Optional[int] = None) -> Ticker:
        """מחזיר טיקר אקראי (או לפי מטבע)"""
        available = self.tickers
        if currency_id:
            available = [t for t in self.tickers if t.currency_id == currency_id]
        if not available:
            available = self.tickers
        
        return random.choice(available) if available else None
    
    def get_random_account(self, currency_id: Optional[int] = None) -> TradingAccount:
        """מחזיר חשבון אקראי (או לפי מטבע)"""
        available = self.accounts
        if currency_id:
            available = [a for a in self.accounts if a.currency_id == currency_id]
        if not available:
            available = self.accounts
        
        return random.choice(available) if available else None
    
    def get_primary_account(self) -> TradingAccount:
        """מחזיר את החשבון הראשי (הראשון)"""
        return self.accounts[0] if self.accounts else None


# ============================================================================
# Demo Data Generator
# ============================================================================

class DemoDataGenerator:
    """יוצר נתוני דוגמה מלאים למערכת"""
    
    def __init__(self, db_session: Session, config: Dict[str, Any], dry_run: bool = False, verbose: bool = False, username: Optional[str] = None):
        self.db = db_session
        self.config = config
        self.dry_run = dry_run
        self.verbose = verbose
        self.username = username
        self.date_gen = DateDistributionGenerator()
        self.relationship_manager = DataRelationshipManager(db_session)
        self.created_count = {
            'tickers': 0,
            'user_tickers': 0,
            'accounts': 0,
            'trade_plans': 0,
            'trades': 0,
            'executions': 0,
            'cash_flows': 0,
            'alerts': 0,
            'notes': 0,
            'ai_analysis': 0,
            'watch_lists': 0,
            'watch_list_items': 0
        }
        
        # Cache for lookup
        self.currency_cache: Dict[str, Currency] = {}
        self.user_cache: Optional[User] = None
        self.note_relation_types_cache: Dict[str, int] = {}
        self.created_tickers_in_this_run: List[Ticker] = []  # Track tickers created in this run
    
    def generate_all(self) -> Dict[str, int]:
        """יוצר את כל נתוני הדוגמה"""
        if self.dry_run:
            print("🔍 DRY RUN - רק אימות, ללא יצירת נתונים")
            return self.created_count
        
        print("🚀 מתחיל ליצור נתוני דוגמה...")
        
        try:
            # Load caches
            self._load_caches()
            
            # Create in order (respecting dependencies)
            self._create_tickers()
            self._create_user_tickers()  # Create user_tickers associations
            self._create_trading_accounts()
            self._create_trade_plans()
            self._create_trades()
            self._create_executions()
            self._create_cash_flows()
            self._create_alerts()
            self._create_notes()
            self._create_watch_lists()  # Create watch lists with items
            
            # Try to create AI analysis - if retry_count column doesn't exist, skip it
            try:
                self._create_ai_analysis()  # Create AI analysis requests
            except Exception as e:
                if 'retry_count' in str(e) or 'UndefinedColumn' in str(e):
                    print(f"\n   ⚠️  לא ניתן ליצור ניתוחי AI - שדה retry_count לא קיים בטבלה")
                    print(f"   💡 הערה: יש לעדכן את הטבלה ai_analysis_requests להוסיף את השדה retry_count")
                    self.db.rollback()  # Rollback any partial AI analysis creation
                    self.created_count['ai_analysis'] = 0
                else:
                    raise
            
            # Commit all
            self.db.commit()
            
            print(f"\n✅ יצירת נתוני דוגמה הושלמה בהצלחה!")
            print(f"📊 סיכום:")
            for entity, count in self.created_count.items():
                print(f"   - {entity}: {count}")
            
            return self.created_count
            
        except Exception as e:
            self.db.rollback()
            print(f"\n❌ שגיאה ביצירת נתוני דוגמה: {str(e)}")
            raise
    
    def _load_caches(self) -> None:
        """טוען נתונים נדרשים למטמון"""
        # Load currencies
        currencies = self.db.query(Currency).all()
        for currency in currencies:
            self.currency_cache[currency.symbol] = currency
        
        # Load user - by username if provided, otherwise first user (backward compatibility)
        if self.username:
            self.user_cache = self.db.query(User).filter_by(username=self.username).first()
            if not self.user_cache:
                raise DataGenerationError('users', f"משתמש '{self.username}' לא נמצא במערכת. יש ליצור משתמש זה בבסיס הנתונים")
            if self.verbose:
                print(f"   👤 יוצר נתונים עבור משתמש: {self.username} (ID: {self.user_cache.id})")
        else:
            # Backward compatibility - use first user
            self.user_cache = self.db.query(User).first()
            if not self.user_cache:
                raise DataGenerationError('users', "לא נמצא משתמש במערכת. יש ליצור משתמש ידנית בבסיס הנתונים")
            if self.verbose:
                print(f"   👤 יוצר נתונים עבור משתמש: {self.user_cache.username} (ID: {self.user_cache.id}) - משתמש ראשון שנמצא")
        
        # Load note relation types
        note_types = self.db.query(NoteRelationType).all()
        for nt in note_types:
            self.note_relation_types_cache[nt.note_relation_type] = nt.id
    
    def _create_tickers(self) -> None:
        """יוצר טיקרים - רק טיקרים תקינים עם נתונים חיצוניים זמינים"""
        print(f"\n📈 יוצר {self.config['tickers']['count']} טיקרים...")
        
        count = self.config['tickers']['count']
        usd_percent = self.config['tickers']['usd_percent']
        usd_count = int(count * usd_percent / 100)
        
        # Get USD currency
        usd_currency = self.currency_cache.get('USD')
        if not usd_currency:
            raise DataGenerationError('tickers', "מטבע USD לא נמצא")
        
        # Get other currencies
        other_currencies = {}
        for symbol in self.config['tickers']['other_currencies']:
            currency = self.currency_cache.get(symbol)
            if currency:
                other_currencies[symbol] = currency
        
        # Get existing ticker symbols to avoid duplicates
        existing_symbols = {t.symbol for t in self.db.query(Ticker.symbol).all()}
        
        # Filter SAMPLE_TICKERS by currency and exclude existing ones
        # CRITICAL: Only use tickers from SAMPLE_TICKERS - these have real market data available
        available_usd_tickers = [t for t in SAMPLE_TICKERS 
                                 if t[3] == 'USD' and t[0] not in existing_symbols]
        available_other_tickers = {curr: [t for t in SAMPLE_TICKERS 
                                          if t[3] == curr and t[0] not in existing_symbols]
                                  for curr in set(t[3] for t in SAMPLE_TICKERS) if curr != 'USD'}
        
        # Shuffle to randomize selection
        random.shuffle(available_usd_tickers)
        for curr in available_other_tickers:
            random.shuffle(available_other_tickers[curr])
        
        # Check if we have enough valid tickers
        max_available_usd = len(available_usd_tickers)
        max_available_other = sum(len(tickers) for tickers in available_other_tickers.values())
        max_available_total = max_available_usd + max_available_other
        
        if max_available_total < count:
            print(f"   ⚠️  אזהרה: מבוקשים {count} טיקרים, אבל רק {max_available_total} טיקרים תקינים זמינים")
            print(f"      יווצרו רק {max_available_total} טיקרים תקינים (לא יווצרו טיקרים 'DEMO' ללא נתונים)")
            count = max_available_total
            usd_count = min(usd_count, max_available_usd)
        
        if max_available_usd < usd_count:
            print(f"   ⚠️  אזהרה: מבוקשים {usd_count} טיקרים USD, אבל רק {max_available_usd} זמינים")
            print(f"      יווצרו רק {max_available_usd} טיקרים USD")
            usd_count = max_available_usd
        
        created = 0
        
        # Create USD tickers - ONLY from SAMPLE_TICKERS
        for i in range(min(usd_count, len(available_usd_tickers))):
            symbol, name, ticker_type, currency = available_usd_tickers[i]
            ticker = Ticker(
                symbol=symbol,
                name=name,
                type=ticker_type,
                currency_id=usd_currency.id,
                status='open',
                active_trades=False
            )
            self.db.add(ticker)
            created += 1
        
        # Create other currency tickers - ONLY from SAMPLE_TICKERS
        other_count = count - usd_count
        for i in range(other_count):
            if not other_currencies:
                # If no other currencies configured, use remaining USD tickers
                if i < len(available_usd_tickers) - usd_count:
                    symbol, name, ticker_type, _ = available_usd_tickers[usd_count + i]
                    currency = usd_currency
                else:
                    # No more valid tickers available
                    break
            else:
                # Find ticker with matching currency
                currency_symbol = random.choice(list(other_currencies.keys()))
                currency = other_currencies[currency_symbol]
                
                # Get available tickers for this currency
                currency_tickers = available_other_tickers.get(currency_symbol, [])
                if not currency_tickers:
                    # Try other currencies or fallback to USD
                    other_currency_symbols = [c for c in other_currencies.keys() 
                                            if c in available_other_tickers and available_other_tickers[c]]
                    if other_currency_symbols:
                        currency_symbol = random.choice(other_currency_symbols)
                        currency = other_currencies[currency_symbol]
                        currency_tickers = available_other_tickers[currency_symbol]
                    elif i < len(available_usd_tickers) - usd_count:
                        # Fallback to USD
                        symbol, name, ticker_type, _ = available_usd_tickers[usd_count + i]
                        currency = usd_currency
                    else:
                        # No more valid tickers available
                        break
                
                if currency_tickers:
                    symbol, name, ticker_type, _ = currency_tickers.pop(0)
                elif i < len(available_usd_tickers) - usd_count:
                    # Fallback to USD
                    symbol, name, ticker_type, _ = available_usd_tickers[usd_count + i]
                    currency = usd_currency
                else:
                    # No more valid tickers available
                    break
            
            ticker = Ticker(
                symbol=symbol,
                name=name,
                type=ticker_type,
                currency_id=currency.id,
                status='open',
                active_trades=False
            )
            self.db.add(ticker)
            created += 1
        
        self.db.flush()  # Flush to get IDs
        
        # Store created tickers for this run
        self.created_tickers_in_this_run = []
        for ticker in self.db.query(Ticker).order_by(Ticker.id.desc()).limit(created).all():
            self.created_tickers_in_this_run.append(ticker)
        
        # Reload for relationship manager (all tickers for other uses)
        self.relationship_manager.tickers = self.db.query(Ticker).filter(
            Ticker.symbol != 'SPY'  # Exclude SPY that should already exist
        ).all()
        
        # Add SPY if exists
        spy = self.db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        if spy and spy not in self.relationship_manager.tickers:
            self.relationship_manager.tickers.append(spy)
        
        self.created_count['tickers'] = created
        print(f"   ✅ נוצרו {created} טיקרים תקינים (רק טיקרים עם נתונים חיצוניים זמינים)")
        
        # Create symbol mappings for European tickers
        self._create_symbol_mappings()
    
    def _create_symbol_mappings(self) -> None:
        """יוצר symbol mappings לטיקרים אירופאיים"""
        print(f"\n🔗 יוצר symbol mappings לטיקרים אירופאיים...")
        
        try:
            from models.external_data import ExternalDataProvider
            from services.ticker_symbol_mapping_service import TickerSymbolMappingService
            
            # Get Yahoo Finance provider
            yahoo_provider = self.db.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not yahoo_provider:
                print("   ⚠️  Yahoo Finance provider לא נמצא - דילוג על יצירת mappings")
                return
            
            mappings_created = 0
            
            # Create mappings for all created tickers that need them
            for ticker in self.created_tickers_in_this_run:
                if ticker.symbol in EUROPEAN_SYMBOL_MAPPINGS:
                    provider_symbol = EUROPEAN_SYMBOL_MAPPINGS[ticker.symbol]
                    
                    # Check if mapping already exists
                    existing = TickerSymbolMappingService.get_provider_symbol(
                        self.db, ticker.id, yahoo_provider.id
                    )
                    
                    if not existing or existing != provider_symbol:
                        TickerSymbolMappingService.set_provider_symbol(
                            self.db,
                            ticker.id,
                            yahoo_provider.id,
                            provider_symbol,
                            is_primary=True
                        )
                        mappings_created += 1
                        if self.verbose:
                            print(f"      ✅ {ticker.symbol} -> {provider_symbol}")
            
            if mappings_created > 0:
                self.db.flush()
                print(f"   ✅ נוצרו {mappings_created} symbol mappings")
            else:
                print(f"   ℹ️  כל ה-mappings כבר קיימים")
                
        except Exception as e:
            print(f"   ⚠️  שגיאה ביצירת symbol mappings: {e}")
            if self.verbose:
                import traceback
                traceback.print_exc()
            # Don't raise - allow data generation to continue
    
    def _create_user_tickers(self) -> None:
        """יוצר שיוכי טיקרים למשתמש דרך user_tickers"""
        print(f"\n🔗 יוצר שיוכי טיקרים למשתמש...")
        
        if not self.user_cache:
            raise DataGenerationError('user_tickers', "משתמש לא נמצא")
        
        # Get only tickers created in this run for this user
        # This ensures we only associate tickers created for this specific user
        tickers_to_associate = self.created_tickers_in_this_run.copy() if self.created_tickers_in_this_run else []
        
        # Add SPY if exists (it's a system ticker, should be available to all users)
        spy = self.db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        if spy:
            # Check if SPY association already exists
            existing_spy = self.db.query(UserTicker).filter(
                UserTicker.user_id == self.user_cache.id,
                UserTicker.ticker_id == spy.id
            ).first()
            if not existing_spy and spy not in tickers_to_associate:
                tickers_to_associate.append(spy)
        
        if not tickers_to_associate:
            print("   ⚠️  אין טיקרים לשיוך")
            return
        
        created = 0
        for ticker in tickers_to_associate:
            try:
                # Check if association already exists
                existing = self.db.query(UserTicker).filter(
                    UserTicker.user_id == self.user_cache.id,
                    UserTicker.ticker_id == ticker.id
                ).first()
                
                if not existing:
                    from sqlalchemy.sql import func
                    user_ticker = UserTicker(
                        user_id=self.user_cache.id,
                        ticker_id=ticker.id,
                        status='open',
                        created_at=func.now()
                    )
                    self.db.add(user_ticker)
                    created += 1
            except Exception as e:
                if self.verbose:
                    print(f"   ⚠️  שגיאה ביצירת שיוך טיקר {ticker.symbol}: {e}")
                continue
        
        self.db.flush()
        self.created_count['user_tickers'] = created
        print(f"   ✅ נוצרו {created} שיוכי טיקרים למשתמש")
    
    def _create_trading_accounts(self) -> None:
        """יוצר חשבונות מסחר"""
        print(f"\n💼 יוצר {self.config['trading_accounts']['count']} חשבונות מסחר...")
        
        usd_currency = self.currency_cache.get('USD')
        if not usd_currency:
            raise DataGenerationError('trading_accounts', "מטבע USD לא נמצא")
        
        # Get other currency (ILS or EUR)
        other_currency = None
        for symbol in ['ILS', 'EUR']:
            if symbol in self.currency_cache:
                other_currency = self.currency_cache[symbol]
                break
        
        if not other_currency:
            other_currency = usd_currency  # Fallback
        
        if not self.user_cache:
            raise DataGenerationError('trading_accounts', "משתמש לא נמצא")
        
        # Account 1: Primary (70% activity, all swing)
        # CRITICAL: Primary account MUST be in USD currency
        account1 = TradingAccount(
            user_id=self.user_cache.id,
            name="חשבון מסחר ראשי",
            currency_id=usd_currency.id,  # MUST be USD - never use other_currency here!
            status='open',
            opening_balance=100000.0,
            cash_balance=50000.0,
            total_value=150000.0
        )
        self.db.add(account1)
        
        # Account 2: Other currency (long-term investments)
        account2 = TradingAccount(
            user_id=self.user_cache.id,
            name=f"חשבון מסחר {other_currency.symbol}",
            currency_id=other_currency.id,
            status='open',
            opening_balance=200000.0,
            cash_balance=180000.0,
            total_value=220000.0
        )
        self.db.add(account2)
        
        self.db.flush()
        
        # CRITICAL: Verify primary account is in USD
        if account1.currency_id != usd_currency.id:
            raise DataGenerationError(
                'trading_accounts',
                f"חשבון ראשי נוצר במטבע שגוי! (ID: {account1.currency_id} במקום USD ID: {usd_currency.id})",
                "החשבון הראשי חייב להיות תמיד ב-USD"
            )
        
        # Verify account1 is indeed in USD (double-check from database)
        account1_currency = self.db.execute(text('''
            SELECT c.symbol FROM currencies c 
            WHERE c.id = :currency_id
        '''), {'currency_id': account1.currency_id}).scalar()
        
        if account1_currency != 'USD':
            raise DataGenerationError(
                'trading_accounts',
                f"חשבון ראשי נוצר במטבע {account1_currency} במקום USD!",
                "החשבון הראשי חייב להיות תמיד ב-USD"
            )
        
        self.relationship_manager.accounts = [account1, account2]
        self.created_count['accounts'] = 2
        print(f"   ✅ נוצרו 2 חשבונות מסחר")
        print(f"   ✅ החשבון הראשי במטבע USD (ID: {usd_currency.id})")
    
    def _create_trade_plans(self) -> None:
        """יוצר תוכניות טרייד"""
        print(f"\n📋 יוצר {self.config['trade_plans']['count']} תוכניות טרייד...")
        
        count = self.config['trade_plans']['count']
        swing_percent = self.config['trade_plans']['swing_percent']
        long_percent = self.config['trade_plans']['long_percent']
        primary_account_activity_percent = self.config['trading_accounts']['primary_account_activity_percent']
        
        swing_count = int(count * swing_percent / 100)
        long_count = int(count * long_percent / 100)
        primary_account_count = int(count * primary_account_activity_percent / 100)
        
        # Primary account gets all swing plans + additional plans to reach 70%
        primary_account = self.relationship_manager.get_primary_account()
        other_accounts = [acc for acc in self.relationship_manager.accounts if acc.id != primary_account.id]
        
        # Create shuffled lists for distribution to ensure correct percentages
        # Assign account distribution - primary gets 70%
        primary_plan_indices = list(range(count))
        random.shuffle(primary_plan_indices)
        primary_plan_indices_set = set(primary_plan_indices[:primary_account_count])
        
        # Prepare side distribution - first long_count will be Long
        side_indices = list(range(count))
        random.shuffle(side_indices)
        
        # Prepare date distribution - 40% in last 6 months, 70% of those in last 3 months
        date_indices = list(range(count))
        random.shuffle(date_indices)
        last_6m_count = int(count * 0.4)
        last_3m_count = int(last_6m_count * 0.7)
        
        created = 0
        
        for i in range(count):
            # Determine account - primary gets 70% of all plans
            # Check if this plan index should go to primary account
            is_primary_plan = (i in primary_plan_indices_set)
            
            # Determine investment type and account
            if created < swing_count and is_primary_plan:
                # All swing plans go to primary account
                investment_type = 'swing'
                account = primary_account
            elif is_primary_plan:
                # Additional plans for primary account (non-swing)
                investment_type = random.choice(['investment', 'passive'])
                account = primary_account
            else:
                # Plans for other accounts
                investment_type = random.choice(['investment', 'passive'])
                account = random.choice(other_accounts) if other_accounts else primary_account
            
            # Determine side using shuffled indices - ensure 90% Long
            side_index = side_indices[i]
            side = 'Long' if side_index < long_count else 'Short'
            
            # Get ticker from account's currency
            ticker = self.relationship_manager.get_random_ticker(account.currency_id)
            if not ticker:
                ticker = self.relationship_manager.get_random_ticker()
            
            # Generate date using shuffled indices
            date_index = date_indices[i]
            if date_index < last_3m_count:
                # 28% (70% of 40%) in last 3 months - use precise range
                plan_date = self.date_gen.generate_date_in_range(
                    self.date_gen.three_months_ago,
                    self.date_gen.now
                )
            elif date_index < last_6m_count:
                # 12% (remaining of 40%) in months 3-6 (between 3-6 months ago)
                plan_date = self.date_gen.generate_date_in_range(
                    self.date_gen.six_months_ago,
                    self.date_gen.three_months_ago
                )
            else:
                # 60% in previous 1.5 years (before 6 months, up to 1.5 years ago)
                from datetime import timedelta
                one_and_half_years_ago = self.date_gen.now - timedelta(days=730)
                plan_date = self.date_gen.generate_date_in_range(
                    one_and_half_years_ago,
                    self.date_gen.six_months_ago
                )
            
            # Generate realistic entry price (50-500 range)
            entry_price = round(random.uniform(50, 500), 2)
            planned_amount = round(random.uniform(5000, 50000), 2)
            
            # Calculate stop and target (5-10% stop, 10-30% target)
            stop_percentage = round(random.uniform(5, 10), 2)
            target_percentage = round(random.uniform(10, 30), 2)
            stop_price = round(entry_price * (1 - stop_percentage / 100), 2)
            target_price = round(entry_price * (1 + target_percentage / 100), 2)
            
            # Status (mostly open, some cancelled)
            status = 'open' if random.random() > 0.15 else 'cancelled'
            cancelled_at = self.date_gen.generate_date_in_range(
                plan_date,
                self.date_gen.now
            ) if status == 'cancelled' else None
            
            trade_plan = TradePlan(
                user_id=self.user_cache.id,
                trading_account_id=account.id,
                ticker_id=ticker.id,
                investment_type=investment_type,
                side=side,
                status=status,
                planned_amount=planned_amount,
                entry_price=entry_price,
                stop_price=stop_price,
                target_price=target_price,
                stop_percentage=stop_percentage,
                target_percentage=target_percentage,
                cancelled_at=cancelled_at,
                cancel_reason="תוכנית בוטלה" if cancelled_at else None,
                reasons=f"תוכנית {investment_type} עבור {ticker.symbol}",
                notes=f"תוכנית מסחר מסוג {investment_type}"
            )
            
            # Set created_at manually to match the plan date
            trade_plan.created_at = plan_date
            
            self.db.add(trade_plan)
            created += 1
        
        self.db.flush()
        
        self.relationship_manager.trade_plans = self.db.query(TradePlan).all()
        self.created_count['trade_plans'] = created
        print(f"   ✅ נוצרו {created} תוכניות טרייד")
    
    def _create_trades(self) -> None:
        """יוצר טריידים"""
        print(f"\n💹 יוצר {self.config['trades']['count']} טריידים...")
        
        count = self.config['trades']['count']
        from_plans_percent = self.config['trades']['from_plans_percent']
        
        from_plans_count = int(count * from_plans_percent / 100)
        independent_count = count - from_plans_count
        
        created = 0
        
        # Trades from plans
        available_plans = [p for p in self.relationship_manager.trade_plans if p.status == 'open']
        random.shuffle(available_plans)
        
        for i in range(min(from_plans_count, len(available_plans))):
            plan = available_plans[i]
            
            # Trade date after plan date
            trade_date = self.date_gen.generate_date_in_range(
                plan.created_at,
                self.date_gen.now
            )
            
            # Status - ensure variety: open, closed, cancelled
            status_rand = random.random()
            if status_rand > 0.7:
                status = 'open'
                closed_at = None
                cancelled_at = None
            elif status_rand > 0.15:
                status = 'closed'
                closed_at = self.date_gen.generate_date_in_range(
                    trade_date,
                    self.date_gen.now
                )
                cancelled_at = None
            else:
                status = 'cancelled'
                closed_at = None
                cancelled_at = self.date_gen.generate_date_in_range(
                    trade_date,
                    self.date_gen.now
                )
            
            # Calculate P/L if closed
            total_pl = None
            if status == 'closed':
                # Random P/L between -20% to +40%
                pl_percent = random.uniform(-20, 40)
                total_pl = round(plan.planned_amount * pl_percent / 100, 2)
            
            trade = Trade(
                user_id=self.user_cache.id,
                trading_account_id=plan.trading_account_id,
                ticker_id=plan.ticker_id,
                trade_plan_id=plan.id,
                status=status,
                investment_type=plan.investment_type,
                side=plan.side,
                planned_quantity=round(plan.planned_amount / plan.entry_price, 2),
                planned_amount=plan.planned_amount,
                entry_price=plan.entry_price,
                closed_at=closed_at,
                cancelled_at=cancelled_at,
                total_pl=total_pl,
                notes=f"טרייד מתוכנית {plan.id}"
            )
            
            trade.created_at = trade_date
            
            self.db.add(trade)
            created += 1
        
        # Independent trades - ensure 90% Long using shuffled indices
        long_percent = self.config['trade_plans']['long_percent']
        independent_long_count = int(independent_count * long_percent / 100)
        
        # Create shuffled indices for side distribution
        independent_indices = list(range(independent_count))
        random.shuffle(independent_indices)
        
        for i in range(independent_count):
            account = random.choice(self.relationship_manager.accounts)
            ticker = self.relationship_manager.get_random_ticker(account.currency_id)
            if not ticker:
                ticker = self.relationship_manager.get_random_ticker()
            
            trade_date = self.date_gen.generate_date('random')
            
            # Status - ensure variety: open, closed, cancelled
            status_rand = random.random()
            if status_rand > 0.7:
                status = 'open'
                closed_at = None
                cancelled_at = None
            elif status_rand > 0.15:
                status = 'closed'
                closed_at = self.date_gen.generate_date_in_range(
                    trade_date,
                    self.date_gen.now
                )
                cancelled_at = None
            else:
                status = 'cancelled'
                closed_at = None
                cancelled_at = self.date_gen.generate_date_in_range(
                    trade_date,
                    self.date_gen.now
                )
            
            investment_type = random.choice(INVESTMENT_TYPES)
            # Ensure 90% Long for independent trades using shuffled indices
            side_index = independent_indices[i]
            side = 'Long' if side_index < independent_long_count else 'Short'
            
            entry_price = round(random.uniform(50, 500), 2)
            planned_amount = round(random.uniform(5000, 50000), 2)
            planned_quantity = round(planned_amount / entry_price, 2)
            
            total_pl = None
            if status == 'closed':
                closed_at = self.date_gen.generate_date_in_range(trade_date, self.date_gen.now)
                pl_percent = random.uniform(-20, 40)
                total_pl = round(planned_amount * pl_percent / 100, 2)
            
            trade = Trade(
                user_id=self.user_cache.id,
                trading_account_id=account.id,
                ticker_id=ticker.id,
                trade_plan_id=None,
                status=status,
                investment_type=investment_type,
                side=side,
                planned_quantity=planned_quantity,
                planned_amount=planned_amount,
                entry_price=entry_price,
                closed_at=closed_at,
                cancelled_at=cancelled_at,
                total_pl=total_pl,
                notes="טרייד עצמאי"
            )
            
            trade.created_at = trade_date
            
            self.db.add(trade)
            created += 1
        
        self.db.flush()
        
        self.relationship_manager.trades = self.db.query(Trade).all()
        self.created_count['trades'] = created
        print(f"   ✅ נוצרו {created} טריידים")
    
    def _create_executions(self) -> None:
        """יוצר ביצועים לכל טרייד"""
        print(f"\n📊 יוצר ביצועים...")
        
        created = 0
        
        for trade in self.relationship_manager.trades:
            # Each trade needs at least 2 executions (open + close)
            # For open trades, just opening execution
            
            # Opening execution
            if trade.side == 'Long':
                open_action = 'buy'
            else:  # Short
                open_action = 'short'
            
            open_execution = Execution(
                user_id=self.user_cache.id,
                ticker_id=trade.ticker_id,
                trading_account_id=trade.trading_account_id,
                trade_id=trade.id,
                action=open_action,
                date=trade.created_at,
                quantity=trade.planned_quantity,
                price=trade.entry_price,
                fee=round(random.uniform(0, 50), 2),
                source='manual',
                notes=f"פתיחת טרייד {trade.id}"
            )
            self.db.add(open_execution)
            created += 1
            
            # Closing execution (if trade is closed)
            if trade.status == 'closed' and trade.closed_at:
                if trade.side == 'Long':
                    close_action = 'sell'
                else:  # Short
                    close_action = 'cover'
                
                # Calculate closing price based on P/L
                if trade.total_pl:
                    closing_price = trade.entry_price * (1 + (trade.total_pl / trade.planned_amount))
                else:
                    closing_price = trade.entry_price * random.uniform(0.8, 1.4)
                closing_price = round(closing_price, 2)
                
                realized_pl = int(trade.total_pl) if trade.total_pl else None
                
                close_execution = Execution(
                    user_id=self.user_cache.id,
                    ticker_id=trade.ticker_id,
                    trading_account_id=trade.trading_account_id,
                    trade_id=trade.id,
                    action=close_action,
                    date=trade.closed_at,
                    quantity=trade.planned_quantity,
                    price=closing_price,
                    fee=round(random.uniform(0, 50), 2),
                    realized_pl=realized_pl,
                    source='manual',
                    notes=f"סגירת טרייד {trade.id}"
                )
                self.db.add(close_execution)
                created += 1
            
            # Add partial executions for open trades to demonstrate capabilities
            # 40% of open trades get partial executions (to show UI capabilities)
            if trade.status == 'open' and random.random() > 0.6:
                # Add 1-2 partial executions to show progressive execution capability
                num_partial = random.randint(1, 2) if random.random() > 0.5 else 1
                
                remaining_quantity = trade.planned_quantity
                
                for partial_idx in range(num_partial):
                    partial_date = self.date_gen.generate_date_in_range(
                        trade.created_at,
                        self.date_gen.now
                    )
                    
                    # Calculate partial quantity (distribute remaining quantity)
                    if partial_idx == num_partial - 1:
                        # Last partial execution takes remaining quantity
                        partial_quantity = remaining_quantity
                    else:
                        # Take 20-40% of remaining quantity
                        partial_quantity = round(remaining_quantity * random.uniform(0.2, 0.4), 2)
                        remaining_quantity -= partial_quantity
                    
                    partial_execution = Execution(
                        user_id=self.user_cache.id,
                        ticker_id=trade.ticker_id,
                        trading_account_id=trade.trading_account_id,
                        trade_id=trade.id,
                        action=open_action,
                        date=partial_date,
                        quantity=partial_quantity,
                        price=round(trade.entry_price * random.uniform(0.95, 1.05), 2),
                        fee=round(random.uniform(0, 30), 2),
                        source='manual',
                        notes=f"ביצוע חלקי #{partial_idx + 1} לטרייד {trade.id}"
                    )
                    self.db.add(partial_execution)
                    created += 1
            
            # Sometimes add additional executions for closed trades (scale in/out scenarios)
            if trade.status == 'closed' and random.random() > 0.8:
                # 20% of closed trades get additional executions (scale in/out)
                # Add an intermediate execution between open and close
                intermediate_date = self.date_gen.generate_date_in_range(
                    trade.created_at,
                    trade.closed_at
                )
                
                intermediate_quantity = round(trade.planned_quantity * random.uniform(0.3, 0.7), 2)
                
                # For intermediate executions:
                # - Long: can be buy (scale in) or sell (partial close/scale out)
                # - Short: can be short (scale in) or cover (partial close/scale out)
                if random.random() > 0.5:
                    # Scale in - add more to position (same as open_action)
                    intermediate_action = open_action
                    intermediate_notes = f"ביצוע ביניים (scale in) לטרייד {trade.id}"
                else:
                    # Scale out - partial close (opposite of open_action)
                    if trade.side == 'Long':
                        intermediate_action = 'sell'  # Partial sell for long
                    else:  # Short
                        intermediate_action = 'cover'  # Partial cover for short
                    intermediate_quantity = round(trade.planned_quantity * random.uniform(0.2, 0.5), 2)  # Smaller quantity for partial close
                    intermediate_notes = f"ביצוע ביניים (scale out - סגירה חלקית) לטרייד {trade.id}"
                
                intermediate_execution = Execution(
                    user_id=self.user_cache.id,
                    ticker_id=trade.ticker_id,
                    trading_account_id=trade.trading_account_id,
                    trade_id=trade.id,
                    action=intermediate_action,
                    date=intermediate_date,
                    quantity=intermediate_quantity,
                    price=round(trade.entry_price * random.uniform(0.97, 1.03), 2),
                    fee=round(random.uniform(0, 30), 2),
                    source='manual',
                    notes=intermediate_notes
                )
                self.db.add(intermediate_execution)
                created += 1
        
        self.created_count['executions'] = created
        
        # Count executions by type for reporting
        if not self.dry_run:
            self.db.flush()
            buy_count = self.db.execute(text("SELECT COUNT(*) FROM executions WHERE action = 'buy'")).scalar()
            sell_count = self.db.execute(text("SELECT COUNT(*) FROM executions WHERE action = 'sell'")).scalar()
            short_count = self.db.execute(text("SELECT COUNT(*) FROM executions WHERE action = 'short'")).scalar()
            cover_count = self.db.execute(text("SELECT COUNT(*) FROM executions WHERE action = 'cover'")).scalar()
            with_trade = self.db.execute(text("SELECT COUNT(*) FROM executions WHERE trade_id IS NOT NULL")).scalar()
        else:
            buy_count = sell_count = short_count = cover_count = with_trade = 0
        
        print(f"   ✅ נוצרו {created} ביצועים")
        if not self.dry_run:
            print(f"      - buy: {buy_count}, sell: {sell_count}, short: {short_count}, cover: {cover_count}")
            print(f"      - מקושרים לטריידים: {with_trade}/{created}")
    
    def _create_cash_flows(self) -> None:
        """יוצר תזרימי מזומן עם מגוון מייצג של סוגים"""
        print(f"\n💰 יוצר תזרימי מזומן...")
        
        created = 0
        cash_flow_types_created = {
            'deposit': 0,
            'withdrawal': 0,
            'dividend': 0,
            'fee': 0,
            'interest': 0,
            'transfer_in': 0,
            'transfer_out': 0,
            'currency_exchange_from': 0,
            'currency_exchange_to': 0
        }
        
        for account in self.relationship_manager.accounts:
            # Initial deposit
            deposit = CashFlow(
                user_id=self.user_cache.id,
                trading_account_id=account.id,
                type='deposit',
                amount=account.opening_balance or 100000,
                date=self.date_gen.two_years_ago,
                currency_id=account.currency_id,
                usd_rate=1.0,
                source='manual',
                description=f"הפקדה ראשונית לחשבון {account.name}"
            )
            self.db.add(deposit)
            created += 1
            cash_flow_types_created['deposit'] += 1
            
            # Random deposits and withdrawals over time
            for _ in range(random.randint(3, 8)):
                flow_type = random.choice(['deposit', 'withdrawal'])
                flow_date = self.date_gen.generate_date('random')
                amount = round(random.uniform(1000, 20000), 2)
                
                cash_flow = CashFlow(
                    user_id=self.user_cache.id,
                    trading_account_id=account.id,
                    type=flow_type,
                    amount=amount if flow_type == 'deposit' else -amount,
                    date=flow_date,
                    currency_id=account.currency_id,
                    usd_rate=1.0,
                    source='manual',
                    description=f"{'הפקדה' if flow_type == 'deposit' else 'משיכה'}"
                )
                self.db.add(cash_flow)
                created += 1
                cash_flow_types_created[flow_type] += 1
            
            # Dividends from closed trades
            closed_trades = [t for t in self.relationship_manager.trades 
                           if t.trading_account_id == account.id and t.status == 'closed']
            
            for trade in random.sample(closed_trades, min(len(closed_trades), random.randint(0, 5))):
                if trade.closed_at:
                    dividend_date = self.date_gen.generate_date_in_range(
                        trade.closed_at,
                        self.date_gen.now
                    )
                    
                    dividend = CashFlow(
                        user_id=self.user_cache.id,
                        trading_account_id=account.id,
                        type='dividend',
                        amount=round(random.uniform(100, 1000), 2),
                        date=dividend_date,
                        currency_id=account.currency_id,
                        usd_rate=1.0,
                        trade_id=trade.id,
                        source='manual',
                        description=f"דיבידנד מטרייד {trade.id}"
                    )
                    self.db.add(dividend)
                    created += 1
                    cash_flow_types_created['dividend'] += 1
            
            # Fees
            for _ in range(random.randint(2, 5)):
                fee_date = self.date_gen.generate_date('random')
                
                fee = CashFlow(
                    user_id=self.user_cache.id,
                    trading_account_id=account.id,
                    type='fee',
                    amount=-round(random.uniform(5, 50), 2),
                    date=fee_date,
                    currency_id=account.currency_id,
                    usd_rate=1.0,
                    source='manual',
                    description="עמלת מסחר"
                )
                self.db.add(fee)
                created += 1
                cash_flow_types_created['fee'] += 1
            
            # Interest (for accounts with positive balance)
            for _ in range(random.randint(1, 3)):
                interest_date = self.date_gen.generate_date('random')
                
                interest = CashFlow(
                    user_id=self.user_cache.id,
                    trading_account_id=account.id,
                    type='interest',
                    amount=round(random.uniform(10, 200), 2),
                    date=interest_date,
                    currency_id=account.currency_id,
                    usd_rate=1.0,
                    source='manual',
                    description="ריבית על יתרה"
                )
                self.db.add(interest)
                created += 1
                cash_flow_types_created['interest'] += 1
            
            # Transfer in (from another account)
            if len(self.relationship_manager.accounts) > 1:
                for _ in range(random.randint(0, 2)):
                    transfer_date = self.date_gen.generate_date('random')
                    other_account = random.choice([a for a in self.relationship_manager.accounts if a.id != account.id])
                    
                    transfer_in = CashFlow(
                        user_id=self.user_cache.id,
                        trading_account_id=account.id,
                        type='transfer_in',
                        amount=round(random.uniform(5000, 15000), 2),
                        date=transfer_date,
                        currency_id=account.currency_id,
                        usd_rate=1.0,
                        source='manual',
                        description=f"העברה מחשבון {other_account.name}"
                    )
                    self.db.add(transfer_in)
                    created += 1
                    cash_flow_types_created['transfer_in'] += 1
            
            # Transfer out (to another account)
            if len(self.relationship_manager.accounts) > 1:
                for _ in range(random.randint(0, 2)):
                    transfer_date = self.date_gen.generate_date('random')
                    other_account = random.choice([a for a in self.relationship_manager.accounts if a.id != account.id])
                    
                    transfer_out = CashFlow(
                        user_id=self.user_cache.id,
                        trading_account_id=account.id,
                        type='transfer_out',
                        amount=-round(random.uniform(5000, 15000), 2),
                        date=transfer_date,
                        currency_id=account.currency_id,
                        usd_rate=1.0,
                        source='manual',
                        description=f"העברה לחשבון {other_account.name}"
                    )
                    self.db.add(transfer_out)
                    created += 1
                    cash_flow_types_created['transfer_out'] += 1
            
            # Currency exchange pairs (המרות מטבע - נוצרות מצמדים)
            # Only create if we have multiple currencies available
            all_available_currencies = list(self.currency_cache.values())
            
            # Create currency exchange pairs if we have at least 2 different currencies
            if len(all_available_currencies) >= 2:
                # Create currency exchange pairs - from one currency to another
                for _ in range(random.randint(1, 3)):
                    exchange_date = self.date_gen.generate_date('random')
                    
                    # Get two different currencies
                    from_currency = random.choice(all_available_currencies)
                    to_currency = random.choice([c for c in all_available_currencies if c.id != from_currency.id])
                    
                    if from_currency and to_currency:
                            # Exchange amount in from_currency
                            from_amount = round(random.uniform(1000, 10000), 2)
                            # Simple exchange rate (in real system this would come from market data)
                            exchange_rate = round(random.uniform(0.8, 1.2), 6)
                            to_amount = round(from_amount * exchange_rate, 2)
                            fee_amount = round(random.uniform(5, 25), 2)
                            
                            # FROM flow: negative amount, represents money leaving in from_currency
                            exchange_from = CashFlow(
                                user_id=self.user_cache.id,
                                trading_account_id=account.id,
                                type='currency_exchange_from',
                                amount=-from_amount,  # Negative - money leaving
                                fee_amount=fee_amount,
                                date=exchange_date,
                                currency_id=from_currency.id,
                                usd_rate=1.0,  # Would be actual rate in real system
                                source='manual',
                                description=f"המרת מטבע מ-{from_currency.symbol} ל-{to_currency.symbol}",
                                external_id=f"EXCHANGE_{exchange_date.strftime('%Y%m%d')}_{account.id}_{from_currency.id}_{to_currency.id}"
                            )
                            self.db.add(exchange_from)
                            created += 1
                            cash_flow_types_created['currency_exchange_from'] += 1
                            
                            # TO flow: positive amount, represents money entering in to_currency
                            exchange_to = CashFlow(
                                user_id=self.user_cache.id,
                                trading_account_id=account.id,
                                type='currency_exchange_to',
                                amount=to_amount,  # Positive - money entering
                                fee_amount=0,  # Fee is stored in FROM flow
                                date=exchange_date,
                                currency_id=to_currency.id,
                                usd_rate=1.0,  # Would be actual rate in real system
                                source='manual',
                                description=f"המרת מטבע מ-{from_currency.symbol} ל-{to_currency.symbol}",
                                external_id=f"EXCHANGE_{exchange_date.strftime('%Y%m%d')}_{account.id}_{from_currency.id}_{to_currency.id}"
                            )
                            self.db.add(exchange_to)
                            created += 1
                            cash_flow_types_created['currency_exchange_to'] += 1
        
        self.created_count['cash_flows'] = created
        
        # Report cash flow types created
        types_summary = ", ".join([f"{k}: {v}" for k, v in cash_flow_types_created.items() if v > 0])
        print(f"   ✅ נוצרו {created} תזרימי מזומן")
        if self.verbose:
            print(f"      - סוגים: {types_summary}")
    
    def _load_external_market_data(self) -> None:
        """טוען נתוני שוק חיצוניים ראשוניים לכל הטיקרים שנוצרו"""
        print(f"\n📡 טוען נתוני שוק חיצוניים ראשוניים...")
        
        try:
            from scripts.load_market_data_for_tickers import MarketDataLoader
            
            # Get all tickers created in this run (or all tickers if none were created)
            if self.created_tickers_in_this_run:
                ticker_symbols = [t.symbol for t in self.created_tickers_in_this_run if t.symbol]
            else:
                # If no tickers were created in this run, load for all open tickers
                ticker_symbols = None
            
            if not ticker_symbols:
                print("   ℹ️  אין טיקרים לטעינת נתונים חיצוניים")
                return
            
            print(f"   טוען נתונים עבור {len(ticker_symbols)} טיקרים...")
            
            # Create loader and load data
            loader = MarketDataLoader(self.db, dry_run=self.dry_run)
            loader.load_data_for_all_tickers(ticker_symbols)
            loader.print_summary()
            
        except ImportError as e:
            print(f"   ⚠️  לא ניתן לייבא את MarketDataLoader: {e}")
            print(f"      ודא שהסקריפט load_market_data_for_tickers.py קיים")
        except Exception as e:
            print(f"   ⚠️  שגיאה בטעינת נתונים חיצוניים: {e}")
            if self.verbose:
                import traceback
                traceback.print_exc()
            # Don't raise - allow data generation to complete even if external data loading fails
    
    def _create_alerts(self) -> None:
        """יוצר התראות מרשימות ומפורטות"""
        print(f"\n🔔 יוצר התראות...")
        
        created = 0
        
        # Realistic alert messages templates
        price_alert_messages = [
            "{symbol} הגיע למחיר {price} - אופציה ליציאה",
            "מחיר {symbol} עלה מעל {price} - סימן חיובי",
            "{symbol} חוצה את קו ההתנגדות {price} - הזדמנות",
            "מחיר {symbol} מתקרב ל-{price} - מומלץ לבדוק",
            "{symbol} עובר את {price} - פוטנציאל לרווח",
        ]
        
        stop_loss_messages = [
            "{symbol} הגיע ל-stop loss של {price} - סגירה מומלצת",
            "מחיר {symbol} ירד מתחת ל-{price} - נקודת יציאה",
        ]
        
        take_profit_messages = [
            "{symbol} הגיע ל-target של {price} - רווח הושג",
            "מחיר {symbol} עלה ל-{price} - אפשר לקחת רווח",
        ]
        
        # Alerts on tickers (price alerts)
        ticker_sample_size = min(len(self.relationship_manager.tickers), 15)
        for ticker in random.sample(self.relationship_manager.tickers, ticker_sample_size):
            # Price alert
            target_price = round(random.uniform(50, 500), 2)
            alert_msg = random.choice(price_alert_messages).format(
                symbol=ticker.symbol,
                price=f"${target_price:.2f}"
            )
            
            alert = Alert(
                user_id=self.user_cache.id,
                ticker_id=ticker.id,
                message=alert_msg,
                status='open' if random.random() > 0.2 else 'closed',
                is_triggered='false',
                related_type_id=ALERT_RELATED_TYPES['ticker'],
                related_id=ticker.id,
                condition_attribute='price',
                condition_operator='more_than' if random.random() > 0.5 else 'less_than',
                condition_number=str(target_price),
                triggered_at=self.date_gen.generate_date('random') if random.random() > 0.3 else None
            )
            self.db.add(alert)
            created += 1
        
        # Alerts on trades (stop loss / take profit)
        trade_sample_size = min(len(self.relationship_manager.trades), 20)
        for trade in random.sample(self.relationship_manager.trades, trade_sample_size):
            if trade.entry_price:
                # Stop loss alert
                if random.random() > 0.3:  # 70% have stop loss
                    stop_price = round(trade.entry_price * (0.92 if trade.side == 'Long' else 1.08), 2)
                    alert_msg = random.choice(stop_loss_messages).format(
                        symbol=trade.ticker.symbol if hasattr(trade, 'ticker') and trade.ticker else 'טיקר',
                        price=f"${stop_price:.2f}"
                    )
                    
                    alert = Alert(
                        user_id=self.user_cache.id,
                        ticker_id=trade.ticker_id,
                        message=alert_msg,
                        status='open' if random.random() > 0.4 else 'closed',
                        is_triggered='true' if random.random() > 0.6 else 'false',
                        related_type_id=ALERT_RELATED_TYPES['trade'],
                        related_id=trade.id,
                        condition_attribute='price',
                        condition_operator='less_than' if trade.side == 'Long' else 'more_than',
                        condition_number=str(stop_price),
                        triggered_at=self.date_gen.generate_date('random') if random.random() > 0.5 else None
                    )
                    self.db.add(alert)
                    created += 1
                
                # Take profit alert
                if random.random() > 0.4:  # 60% have take profit
                    profit_price = round(trade.entry_price * (1.15 if trade.side == 'Long' else 0.85), 2)
                    alert_msg = random.choice(take_profit_messages).format(
                        symbol=trade.ticker.symbol if hasattr(trade, 'ticker') and trade.ticker else 'טיקר',
                        price=f"${profit_price:.2f}"
                    )
                    
                    alert = Alert(
                        user_id=self.user_cache.id,
                        ticker_id=trade.ticker_id,
                        message=alert_msg,
                        status='open' if random.random() > 0.5 else 'closed',
                        is_triggered='true' if random.random() > 0.5 else 'false',
                        related_type_id=ALERT_RELATED_TYPES['trade'],
                        related_id=trade.id,
                        condition_attribute='price',
                        condition_operator='more_than' if trade.side == 'Long' else 'less_than',
                        condition_number=str(profit_price),
                        triggered_at=self.date_gen.generate_date('random') if random.random() > 0.4 else None
                    )
                    self.db.add(alert)
                    created += 1
        
        # Alerts on trade plans (entry price alerts)
        plan_sample_size = min(len(self.relationship_manager.trade_plans), 15)
        for plan in random.sample(self.relationship_manager.trade_plans, plan_sample_size):
            if plan.entry_price:
                target_price = round(plan.entry_price * random.uniform(0.95, 1.05), 2)
                alert_msg = f"תוכנית {plan.id}: {plan.ticker.symbol if hasattr(plan, 'ticker') and plan.ticker else 'טיקר'} הגיע למחיר כניסה {target_price:.2f}"
                
                alert = Alert(
                    user_id=self.user_cache.id,
                    ticker_id=plan.ticker_id,
                    message=alert_msg,
                    status='open',
                    is_triggered='false',
                    related_type_id=ALERT_RELATED_TYPES['trade_plan'],
                    related_id=plan.id,
                    condition_attribute='price',
                    condition_operator='more_than' if random.random() > 0.5 else 'less_than',
                    condition_number=str(target_price)
                )
                self.db.add(alert)
                created += 1
        
        # Create at least 4 active alerts (is_triggered='new') for home page display
        # CRITICAL: These alerts are displayed on the homepage via <active-alerts> component
        active_alerts_min = 4
        active_alerts_created = 0
        
        # Get recent tickers and trades for active alerts
        recent_tickers = random.sample(self.relationship_manager.tickers, min(active_alerts_min, len(self.relationship_manager.tickers))) if self.relationship_manager.tickers else []
        open_trades = [t for t in self.relationship_manager.trades if t.status == 'open']
        
        active_alert_messages = [
            "⚡ התראה חדשה: מחיר {symbol} הגיע ל-{price} - הזדמנות לקנייה",
            "🔔 התראה: {symbol} חוצה קו התנגדות {price} - אפשר לקחת רווח",
            "📈 התראה: {symbol} עלה מעל {price} - סימן חיובי",
            "⚠️ התראה: {symbol} מתקרב ל-{price} - מומלץ לבדוק",
            "💡 התראה: {symbol} במגמת עלייה - נקודת כניסה פוטנציאלית",
            "🎯 התראה: {symbol} הגיע למטרת מחיר {price} - נקודת יציאה",
        ]
        
        # Ensure we create exactly active_alerts_min active alerts
        for i in range(active_alerts_min):
            if not recent_tickers:
                # Fallback to any ticker if we don't have enough
                ticker = self.relationship_manager.get_random_ticker()
            else:
                ticker = recent_tickers[i % len(recent_tickers)] if recent_tickers else self.relationship_manager.get_random_ticker()
            
            if not ticker:
                continue
            
            # Use a trade if available for more context
            related_trade = None
            if open_trades:
                trades_for_ticker = [t for t in open_trades if t.ticker_id == ticker.id]
                related_trade = random.choice(trades_for_ticker) if trades_for_ticker else random.choice(open_trades[:1])
            
            target_price = round(random.uniform(100, 400), 2)
            alert_msg = random.choice(active_alert_messages).format(
                symbol=ticker.symbol,
                price=f"${target_price:.2f}"
            )
            
            # Create active alert (is_triggered='new') - these are displayed on homepage
            triggered_at = self.date_gen.generate_date_in_range(
                self.date_gen.now - timedelta(days=2),
                self.date_gen.now
            )
            
            alert = Alert(
                user_id=self.user_cache.id,
                ticker_id=ticker.id,
                message=alert_msg,
                status='open',
                is_triggered='new',  # CRITICAL: 'new' status means active alert for homepage
                related_type_id=ALERT_RELATED_TYPES['ticker'],
                related_id=ticker.id,
                condition_attribute='price',
                condition_operator='more_than',
                condition_number=str(target_price),
                triggered_at=triggered_at
            )
            
            # If we have a related trade, link to it
            if related_trade:
                alert.related_type_id = ALERT_RELATED_TYPES['trade']
                alert.related_id = related_trade.id
            
            self.db.add(alert)
            created += 1
            active_alerts_created += 1
        
        self.created_count['alerts'] = created
        active_count = active_alerts_created if active_alerts_created > 0 else 0
        print(f"   ✅ נוצרו {created} התראות (מתוכן {active_count} התראות פעילות)")
    
    def _load_external_market_data(self) -> None:
        """טוען נתוני שוק חיצוניים ראשוניים לכל הטיקרים שנוצרו"""
        print(f"\n📡 טוען נתוני שוק חיצוניים ראשוניים...")
        
        try:
            # Import here to avoid circular dependencies
            import sys
            import os
            scripts_dir = os.path.dirname(os.path.abspath(__file__))
            if scripts_dir not in sys.path:
                sys.path.insert(0, scripts_dir)
            
            from load_market_data_for_tickers import MarketDataLoader
            
            # Get all tickers created in this run (or all tickers if none were created)
            if self.created_tickers_in_this_run:
                ticker_symbols = [t.symbol for t in self.created_tickers_in_this_run if t.symbol]
            else:
                # If no tickers were created in this run, load for all open tickers
                ticker_symbols = None
            
            if not ticker_symbols:
                print("   ℹ️  אין טיקרים לטעינת נתונים חיצוניים")
                return
            
            print(f"   טוען נתונים עבור {len(ticker_symbols)} טיקרים...")
            
            # Create loader and load data
            loader = MarketDataLoader(self.db, dry_run=self.dry_run)
            loader.load_data_for_all_tickers(ticker_symbols)
            loader.print_summary()
            
        except ImportError as e:
            print(f"   ⚠️  לא ניתן לייבא את MarketDataLoader: {e}")
            print(f"      ודא שהסקריפט load_market_data_for_tickers.py קיים")
        except Exception as e:
            print(f"   ⚠️  שגיאה בטעינת נתונים חיצוניים: {e}")
            if self.verbose:
                import traceback
                traceback.print_exc()
            # Don't raise - allow data generation to complete even if external data loading fails
    
    def _create_notes(self) -> None:
        """יוצר הערות מרשימות ומפורטות"""
        print(f"\n📝 יוצר הערות...")
        
        created = 0
        
        # Realistic note templates for tickers
        ticker_notes_templates = [
            "<p><strong>{symbol} - ניתוח טכני:</strong><br>הטיקר נמצא במגמת עליה עם תמיכה חזקה ב-${support}. התנגדות ראשית ב-${resistance}. מומלץ להמתין לpullback לפני כניסה.</p>",
            "<p><strong>{symbol} - אסטרטגיה:</strong><br>מומלץ להשתמש באסטרטגיית breakout מעל ${resistance}. Stop loss ב-${support}. Target ראשון ב-${target}.</p>",
            "<p><strong>{symbol} - חדשות:</strong><br>החברה הודיעה על תוצאות טובות מהצפוי. נראה שיש פוטנציאל לעלייה נוספת. מעקב אחר התנהגות ה-VOLUME חשוב.</p>",
            "<p><strong>{symbol} - מעקב:</strong><br>הטיקר מטפס בצורה איטית ויציבה. RSI ב-{rsi} - עדיין מקום לעלייה. היציאה ב-${exit_price}.</p>",
            "<p><strong>{symbol} - התרעות:</strong><br>יש סיכון לנסיגה קלה בגלל התנגדות חזקה. מומלץ לקחת חלק מהרווחים ולשמור על stop loss הדוק.</p>",
        ]
        
        # Notes on tickers (30% of tickers get notes)
        ticker_sample_size = min(len(self.relationship_manager.tickers), max(15, int(len(self.relationship_manager.tickers) * 0.3)))
        for ticker in random.sample(self.relationship_manager.tickers, ticker_sample_size):
            template = random.choice(ticker_notes_templates)
            content = template.format(
                symbol=ticker.symbol,
                support=f"{random.uniform(50, 200):.2f}",
                resistance=f"{random.uniform(250, 500):.2f}",
                target=f"{random.uniform(300, 600):.2f}",
                rsi=random.randint(45, 75),
                exit_price=f"{random.uniform(100, 400):.2f}"
            )
            
            note = Note(
                user_id=self.user_cache.id,
                content=content,
                related_type_id=NOTE_RELATED_TYPES['ticker'],
                related_id=ticker.id
            )
            self.db.add(note)
            created += 1
        
        # Realistic note templates for trades
        trade_notes_templates = [
            "<p><strong>ניהול טרייד {trade_id}:</strong><br>נכנסתי ב-${entry} במחיר טוב. Stop loss ב-${stop_loss}, target ראשון ב-${target}. Risk/Reward של 1:{rr}.</p>",
            "<p><strong>מעקב טרייד {trade_id}:</strong><br>הטרייד מתפתח יפה, מחיר עובר את נקודת ה-entry. עודכן stop loss ל-${new_stop} כדי להגן על הרווחים.</p>",
            "<p><strong>עדכון טרייד {trade_id}:</strong><br>הגעתי ל-target הראשון, לקחתי 50% מהפוזיציה. השארתי את השאר ל-target שני ב-${target2}.</p>",
            "<p><strong>טרייד {trade_id} - לקח לקח:</strong><br>יצאתי מוקדם מדי מהטרייד. צריך להיות יותר סבלני. המחיר המשיך לעלות עוד {percent}%.</p>",
        ]
        
        # Notes on trades (40% of trades get notes)
        trade_sample_size = min(len(self.relationship_manager.trades), max(20, int(len(self.relationship_manager.trades) * 0.4)))
        for trade in random.sample(self.relationship_manager.trades, trade_sample_size):
            entry_price = trade.entry_price if trade.entry_price else random.uniform(100, 300)
            template = random.choice(trade_notes_templates)
            content = template.format(
                trade_id=trade.id,
                entry=f"{entry_price:.2f}",
                stop_loss=f"{entry_price * 0.95:.2f}",
                target=f"{entry_price * 1.15:.2f}",
                target2=f"{entry_price * 1.25:.2f}",
                new_stop=f"{entry_price * 1.02:.2f}",
                rr=random.randint(2, 4),
                percent=random.randint(5, 15)
            )
            
            note = Note(
                user_id=self.user_cache.id,
                content=content,
                related_type_id=NOTE_RELATED_TYPES['trade'],
                related_id=trade.id
            )
            self.db.add(note)
            created += 1
        
        # Realistic note templates for trade plans
        plan_notes_templates = [
            "<p><strong>תוכנית {plan_id} - הכנה:</strong><br>ממתין למחיר כניסה ב-${entry}. תנאים: מחיר מעל MA50, volume גבוה, breakout מהתנגדות.</p>",
            "<p><strong>תוכנית {plan_id} - אסטרטגיה:</strong><br>תוכנית swing trade לטווח 2-4 שבועות. Target ב-${target}, stop loss ב-${stop}. Position size: ${size}.</p>",
            "<p><strong>תוכנית {plan_id} - עדכון:</strong><br>התנאים עדיין לא התקיימו. ממשיך לעקוב. אם מחיר לא יגיע ל-target השבוע, אשקול לבטל את התוכנית.</p>",
        ]
        
        # Notes on trade plans (30% of plans get notes)
        plan_sample_size = min(len(self.relationship_manager.trade_plans), max(20, int(len(self.relationship_manager.trade_plans) * 0.3)))
        for plan in random.sample(self.relationship_manager.trade_plans, plan_sample_size):
            entry_price = plan.entry_price if plan.entry_price else random.uniform(100, 300)
            template = random.choice(plan_notes_templates)
            content = template.format(
                plan_id=plan.id,
                entry=f"{entry_price:.2f}",
                target=f"{entry_price * 1.2:.2f}",
                stop=f"{entry_price * 0.93:.2f}",
                size=f"{plan.planned_amount:.0f}"
            )
            
            note = Note(
                user_id=self.user_cache.id,
                content=content,
                related_type_id=NOTE_RELATED_TYPES['trade_plan'],
                related_id=plan.id
            )
            self.db.add(note)
            created += 1
        
        # Notes on accounts
        account_notes_templates = [
            "<p><strong>חשבון {account_name}:</strong><br>חשבון פעיל עם אסטרטגיה מגוונת. משלב swing trades עם השקעות ארוכות טווח. ביצועים טובים בשנה האחרונה.</p>",
            "<p><strong>חשבון {account_name} - אסטרטגיה:</strong><br>החשבון מתמקד בעיקר ב-tech stocks ו-ETFs. Diversification טוב בין סקטורים שונים. Risk management הדוק.</p>",
            "<p><strong>חשבון {account_name} - מטרות:</strong><br>החשבון מיועד להשקעות ארוכות טווח עם focus על צמיחה. Rebalancing רבעוני. מעקב אחר ביצועים מול benchmark.</p>",
        ]
        
        for account in self.relationship_manager.accounts:
            template = random.choice(account_notes_templates)
            content = template.format(account_name=account.name)
            
            note = Note(
                user_id=self.user_cache.id,
                content=content,
                related_type_id=NOTE_RELATED_TYPES['trading_account'],
                related_id=account.id
            )
            self.db.add(note)
            created += 1
        
        self.created_count['notes'] = created
        print(f"   ✅ נוצרו {created} הערות")
    
    def _create_watch_lists(self) -> None:
        """יוצר רשימות צפייה עם פריטים"""
        print(f"\n📋 יוצר רשימות צפייה...")
        
        if not self.user_cache:
            raise DataGenerationError('watch_lists', "משתמש לא נמצא")
        
        # Get watch lists count from config (default: 0)
        watch_lists_count = self.config.get('watch_lists', {}).get('count', 0)
        
        if watch_lists_count == 0:
            print("   ⏭️  אין רשימות צפייה ליצירה (count=0)")
            return
        
        # Watch list names templates (define before checking existing lists)
        watch_list_names = [
            "מעקב יומי",
            "תיק השקעות",
            "מניות טכנולוגיה",
            "דיבידנדים",
            "מעקב שבועי",
            "סקטור אנרגיה",
            "מניות צמיחה",
            "ETF מעקב",
            "מניות ערך",
            "מעקב אישי"
        ]
        
        # Check if watch lists already exist for this user
        existing_lists = self.db.query(WatchList).filter_by(user_id=self.user_cache.id).all()
        existing_count = len(existing_lists)
        
        if existing_count >= watch_lists_count:
            print(f"   ⚠️  נמצאו {existing_count} רשימות קיימות (נדרשות {watch_lists_count}) - מדלג על יצירה")
            # Count existing items
            existing_items_count = 0
            for wl in existing_lists:
                items = self.db.query(WatchListItem).filter_by(watch_list_id=wl.id).all()
                existing_items_count += len(items)
            self.created_count['watch_lists'] = existing_count
            self.created_count['watch_list_items'] = existing_items_count
            print(f"   ✅ משתמש רשימות קיימות: {existing_count} רשימות, {existing_items_count} פריטים")
            return
        
        # Need to create additional lists
        if existing_count > 0:
            print(f"   ℹ️  נמצאו {existing_count} רשימות קיימות, יוצר עוד {watch_lists_count - existing_count} רשימות")
            # Get existing list names to avoid duplicates
            existing_names = {wl.name for wl in existing_lists}
            # Filter out existing names from available names
            available_names = [name for name in watch_list_names if name not in existing_names]
        else:
            existing_names = set()
            available_names = watch_list_names
        
        # Adjust count to create only missing lists
        lists_to_create = watch_lists_count - existing_count
        
        # Available icons for watch lists
        available_icons = [
            'chart-line', 'eye', 'flame', 'coins', 'table', 'cards', 
            'bookmark', 'tag', 'activity', 'wallet', 'calendar', 'star'
        ]
        
        # Available colors (using logo colors and common colors)
        available_colors = [
            '#26baac',  # Primary logo color (Turquoise-Green)
            '#fc5a06',  # Secondary logo color (Orange-Red)
            '#3b82f6',  # Blue
            '#8b5cf6',  # Purple
            '#ef4444',  # Red
            '#10b981',  # Green
            '#f59e0b',  # Amber
            '#6366f1',  # Indigo
        ]
        
        # Available view modes
        view_modes = ['table', 'cards', 'compact']
        
        # Available sort columns
        sort_columns = ['symbol', 'name', 'price', 'change_percent', None]
        sort_directions = ['asc', 'desc']
        
        # Available flag colors for items
        flag_colors = [
            '#26baac', '#fc5a06', '#3b82f6', '#8b5cf6', 
            '#ef4444', '#10b981', '#f59e0b', '#6366f1',
            '#ec4899', '#14b8a6', '#f97316', '#84cc16'
        ]
        
        created_lists = 0
        created_items = 0
        lists_with_icons = 0
        lists_with_colors = 0
        items_with_flags = 0
        
        # Get user's tickers for watch list items
        user_tickers = self.relationship_manager.tickers
        if not user_tickers:
            print("   ⚠️  אין טיקרים למשתמש - לא ניתן ליצור רשימות צפייה")
            return
        
        for i in range(lists_to_create):
            # Select name from available names (avoiding duplicates)
            if i < len(available_names):
                list_name = available_names[i]
            else:
                # Generate unique name if we run out of templates
                counter = len(existing_lists) + i + 1
                list_name = f"רשימה {counter}"
            
            # Select random properties
            has_icon = random.random() > 0.2  # 80% chance for icon
            has_color = random.random() > 0.3  # 70% chance for color
            
            icon = random.choice(available_icons) if has_icon else None
            color_hex = random.choice(available_colors) if has_color else None
            view_mode = random.choice(view_modes)
            default_sort_column = random.choice(sort_columns)
            default_sort_direction = random.choice(sort_directions) if default_sort_column else 'asc'
            
            watch_list = WatchList(
                user_id=self.user_cache.id,
                name=list_name,
                icon=icon,
                color_hex=color_hex,
                display_order=i,
                view_mode=view_mode,
                default_sort_column=default_sort_column,
                default_sort_direction=default_sort_direction
            )
            
            watch_list.created_at = self.date_gen.generate_date('random')
            
            self.db.add(watch_list)
            self.db.flush()  # Flush to get the ID
            
            if has_icon:
                lists_with_icons += 1
            if has_color:
                lists_with_colors += 1
            
            # Add items to watch list (5-15 items per list)
            items_count = random.randint(5, 15)
            selected_tickers = random.sample(user_tickers, min(items_count, len(user_tickers)))
            
            for item_idx, ticker in enumerate(selected_tickers):
                # 60% chance for flag color
                has_flag = random.random() > 0.4
                flag_color = random.choice(flag_colors) if has_flag else None
                
                if has_flag:
                    items_with_flags += 1
                
                # 30% chance for notes
                notes = None
                if random.random() > 0.7:
                    notes_templates = [
                        "לעקוב אחרי",
                        "מעניין לקנייה",
                        "לבדוק בעתיד",
                        "מעקב יומי",
                        "להמתין לירידה"
                    ]
                    notes = random.choice(notes_templates)
                
                item = WatchListItem(
                    watch_list_id=watch_list.id,
                    ticker_id=ticker.id,
                    flag_color=flag_color,
                    display_order=item_idx,
                    notes=notes
                )
                
                item.created_at = self.date_gen.generate_date('random')
                
                self.db.add(item)
                created_items += 1
            
            created_lists += 1
        
        self.db.flush()
        
        self.created_count['watch_lists'] = created_lists
        self.created_count['watch_list_items'] = created_items
        
        print(f"   ✅ נוצרו {created_lists} רשימות צפייה עם {created_items} פריטים")
        if not self.dry_run:
            print(f"      - רשימות עם איקונים: {lists_with_icons}")
            print(f"      - רשימות עם צבעים: {lists_with_colors}")
            print(f"      - פריטים עם דגלי צבע: {items_with_flags}")
    
    def _create_ai_analysis(self) -> None:
        """יוצר ניתוחי AI לדוגמה"""
        print(f"\n🤖 יוצר ניתוחי AI לדוגמה...")
        
        if not self.user_cache:
            raise DataGenerationError('ai_analysis', "משתמש לא נמצא")
        
        # Get AI templates
        try:
            from models.ai_analysis import AIAnalysisRequest, AIPromptTemplate
            from sqlalchemy.exc import OperationalError
            from sqlalchemy import inspect as sqlalchemy_inspect
            
            # Check if retry_count column exists in the table
            try:
                inspector = sqlalchemy_inspect(self.db.bind)
                columns = [col['name'] for col in inspector.get_columns('ai_analysis_requests')]
                if 'retry_count' not in columns:
                    print("   ⚠️  שדה retry_count לא קיים בטבלה - מדלג על יצירת ניתוחי AI")
                    print("   💡 הערה: יש לעדכן את הטבלה ai_analysis_requests להוסיף את השדה retry_count")
                    self.created_count['ai_analysis'] = 0
                    return
            except Exception as check_error:
                # If we can't check, try to create anyway and catch the error
                pass
            
            templates = self.db.query(AIPromptTemplate).filter(
                AIPromptTemplate.is_active == True
            ).limit(5).all()
            
            if not templates:
                print("   ⚠️  אין תבניות AI פעילות - מדלג על יצירת ניתוחי AI")
                return
            
            # Create 5-10 AI analysis requests
            count = min(10, len(templates) * 2)
            created = 0
            
            # Get some entities for context
            trades = self.relationship_manager.trades[:5] if self.relationship_manager.trades else []
            tickers = self.relationship_manager.tickers[:5] if self.relationship_manager.tickers else []
            trade_plans = self.relationship_manager.trade_plans[:5] if self.relationship_manager.trade_plans else []
            
            for i in range(count):
                template = random.choice(templates)
                
                # Generate variables based on template
                variables = {}
                try:
                    template_vars = json.loads(template.variables_json) if template.variables_json else {}
                    for var_name, var_def in template_vars.items():
                        if isinstance(var_def, dict) and 'type' in var_def:
                            var_type = var_def.get('type', 'string')
                            if var_type == 'string':
                                variables[var_name] = f"דוגמה {i+1}"
                            elif var_type == 'number':
                                variables[var_name] = random.randint(1, 100)
                            elif var_type == 'ticker_id' and tickers:
                                variables[var_name] = random.choice(tickers).id
                            elif var_type == 'trade_id' and trades:
                                variables[var_name] = random.choice(trades).id
                            elif var_type == 'trade_plan_id' and trade_plans:
                                variables[var_name] = random.choice(trade_plans).id
                            else:
                                variables[var_name] = f"דוגמה {i+1}"
                except (json.JSONDecodeError, TypeError):
                    variables = {"example": f"דוגמה {i+1}"}
                
                # Generate prompt text (simplified)
                prompt_text = template.prompt_text
                for key, value in variables.items():
                    prompt_text = prompt_text.replace(f"{{{key}}}", str(value))
                
                # Generate response text (simulated)
                response_text = f"זהו ניתוח AI לדוגמה #{i+1} עבור תבנית {template.name_he or template.name}. הניתוח כולל הערכה של המצב הנוכחי והמלצות לפעולה."
                
                # Random status
                status = random.choice(['completed', 'completed', 'completed', 'pending', 'failed'])
                error_message = None
                if status == 'failed':
                    error_message = "שגיאה לדוגמה בניתוח AI"
                
                # Random provider
                provider = random.choice(['gemini', 'perplexity'])
                
                # Generate date
                analysis_date = self.date_gen.generate_date_in_range(
                    self.date_gen.now - timedelta(days=30),
                    self.date_gen.now
                )
                
                # Create AI analysis request (retry_count not in DB yet, so we don't set it)
                ai_analysis = AIAnalysisRequest(
                    user_id=self.user_cache.id,
                    template_id=template.id,
                    provider=provider,
                    variables_json=json.dumps(variables, ensure_ascii=False),
                    prompt_text=prompt_text,
                    response_text=response_text if status == 'completed' else None,
                    response_json=None,
                    status=status,
                    error_message=error_message,
                    created_at=analysis_date
                )
                # Note: retry_count is defined in model but not in DB table yet
                # SQLAlchemy will use default value if column exists, otherwise ignore
                
                self.db.add(ai_analysis)
                created += 1
            
            # Flush AI analysis
            self.db.flush()
            self.created_count['ai_analysis'] = created
            print(f"   ✅ נוצרו {created} ניתוחי AI")
            
        except ImportError:
            # AI Analysis models might not exist - skip
            if self.verbose:
                print(f"   ⚠️  AI Analysis models לא נמצאו - מדלג על יצירת ניתוחי AI")
        except Exception as e:
            if self.verbose:
                print(f"   ⚠️  שגיאה ביצירת ניתוחי AI: {e}")


# ============================================================================
# Main Entry Point
# ============================================================================

def _build_engine_kwargs():
    """בונה פרמטרים ל-engine"""
    kwargs = {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }
    # PostgreSQL only - no SQLite support
    return kwargs


def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='Generate demo data for TikTrack system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate schema only, do not create data'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    parser.add_argument(
        '--username',
        type=str,
        help='Username to create data for (if not provided, uses first user for backward compatibility)'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🎨 TikTrack - יצירת נתוני דוגמה")
    print("=" * 70)
    print()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Validate schema
        validator = DatabaseValidator(db)
        validator.validate()
        
        if args.dry_run:
            print("\n✅ אימות הצליח - מבנה DB תקין")
            return
        
        # Generate data
        generator = DemoDataGenerator(db, DEMO_CONFIG, dry_run=args.dry_run, verbose=args.verbose, username=args.username)
        results = generator.generate_all()
        
        print("\n" + "=" * 70)
        print("✅ יצירת נתוני דוגמה הושלמה בהצלחה!")
        print("=" * 70)
        
    except SchemaValidationError as e:
        print(f"\n❌ שגיאת אימות מבנה:")
        print(str(e))
        sys.exit(1)
    except DataGenerationError as e:
        print(f"\n❌ שגיאת יצירת נתונים:")
        print(str(e))
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ שגיאה לא צפויה: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()

