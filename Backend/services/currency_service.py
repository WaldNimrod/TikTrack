"""
שירות ניהול מטבעות - TikTrack

מודול זה מכיל את כל הלוגיקה העסקית לניהול מטבעות במערכת.
כולל CRUD operations, ולידציה, ועדכון שערי חליפין.

Classes:
    CurrencyService: שירות ראשי לניהול מטבעות

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from sqlalchemy.orm import Session
from models.currency import Currency
from models.ticker import Ticker
from models.account import Account
from models.trade import Trade
from models.trade_plan import TradePlan
from models.cash_flow import CashFlow
from typing import List, Optional, Dict, Any
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class CurrencyService:
    """
    שירות לניהול מטבעות במערכת TikTrack
    
    שירות זה מספק את כל הפונקציונליות הנדרשת לניהול מטבעות:
    - יצירה, קריאה, עדכון ומחיקה (CRUD)
    - ולידציה של נתונים
    - עדכון שערי חליפין
    - בדיקת שימוש במטבעות
    
    Attributes:
        MAX_SYMBOL_LENGTH (int): אורך מקסימלי לסמל מטבע
        MAX_NAME_LENGTH (int): אורך מקסימלי לשם מטבע
        MIN_USD_RATE (Decimal): שער דולר מינימלי
        MAX_USD_RATE (Decimal): שער דולר מקסימלי
        
    Example:
        >>> service = CurrencyService()
        >>> currencies = service.get_all(db_session)
        >>> new_currency = service.create(db_session, {
        ...     'symbol': 'EUR',
        ...     'name': 'אירו',
        ...     'usd_rate': Decimal('0.85')
        ... })
    """
    
    # Constants for validation
    MAX_SYMBOL_LENGTH: int = 10
    MAX_NAME_LENGTH: int = 100
    MIN_USD_RATE: Decimal = Decimal('0.000001')
    MAX_USD_RATE: Decimal = Decimal('1000000.000000')
    
    @staticmethod
    def get_all(db: Session) -> List[Currency]:
        """
        קבלת כל המטבעות מהמערכת
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            
        Returns:
            List[Currency]: רשימת כל המטבעות במערכת
            
        Example:
            >>> currencies = CurrencyService.get_all(db_session)
            >>> print(f"מספר מטבעות במערכת: {len(currencies)}")
        """
        return db.query(Currency).order_by(Currency.symbol).all()
    
    @staticmethod
    def get_by_id(db: Session, currency_id: int) -> Optional[Currency]:
        """
        קבלת מטבע לפי מזהה
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            currency_id (int): מזהה המטבע
            
        Returns:
            Optional[Currency]: המטבע אם נמצא, None אחרת
            
        Example:
            >>> currency = CurrencyService.get_by_id(db_session, 1)
            >>> if currency:
            ...     print(f"נמצא מטבע: {currency.symbol}")
        """
        return db.query(Currency).filter(Currency.id == currency_id).first()
    
    @staticmethod
    def get_by_symbol(db: Session, symbol: str) -> Optional[Currency]:
        """
        קבלת מטבע לפי סמל
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            symbol (str): סמל המטבע
            
        Returns:
            Optional[Currency]: המטבע אם נמצא, None אחרת
            
        Example:
            >>> currency = CurrencyService.get_by_symbol(db_session, 'USD')
            >>> if currency:
            ...     print(f"שער דולר: {currency.usd_rate}")
        """
        return db.query(Currency).filter(Currency.symbol == symbol.upper()).first()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Currency:
        """
        יצירת מטבע חדש
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            data (Dict[str, Any]): נתוני המטבע החדש
            
        Returns:
            Currency: המטבע החדש שנוצר
            
        Raises:
            ValueError: אם הנתונים לא תקינים
            
        Example:
            >>> currency_data = {
            ...     'symbol': 'EUR',
            ...     'name': 'אירו',
            ...     'usd_rate': Decimal('0.85')
            ... }
            >>> new_currency = CurrencyService.create(db_session, currency_data)
        """
        # ולידציה של הנתונים
        CurrencyService._validate_currency_data(data)
        
        # המרת סמל לאותיות גדולות
        data['symbol'] = data['symbol'].upper()
        
        # יצירת המטבע
        currency = Currency(**data)
        db.add(currency)
        db.commit()
        db.refresh(currency)
        
        logger.info(f"Created new currency: {currency.symbol} - {currency.name}")
        return currency
    
    @staticmethod
    def update(db: Session, currency_id: int, data: Dict[str, Any]) -> Currency:
        """
        עדכון מטבע קיים
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            currency_id (int): מזהה המטבע לעדכון
            data (Dict[str, Any]): נתונים לעדכון
            
        Returns:
            Currency: המטבע המעודכן
            
        Raises:
            ValueError: אם המטבע לא נמצא או הנתונים לא תקינים
            
        Example:
            >>> update_data = {'usd_rate': Decimal('0.86')}
            >>> updated_currency = CurrencyService.update(db_session, 1, update_data)
        """
        currency = CurrencyService.get_by_id(db, currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")
        
        # ולידציה של הנתונים אם יש שדות חדשים
        if data:
            CurrencyService._validate_currency_data(data, is_update=True)
        
        # עדכון השדות
        for key, value in data.items():
            if hasattr(currency, key):
                if key == 'symbol':
                    setattr(currency, key, value.upper())
                else:
                    setattr(currency, key, value)
        
        db.commit()
        db.refresh(currency)
        
        logger.info(f"Updated currency {currency_id}: {currency.symbol}")
        return currency
    
    @staticmethod
    def update_rate(db: Session, currency_id: int, usd_rate: Decimal) -> Currency:
        """
        עדכון שער דולר בלבד
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            currency_id (int): מזהה המטבע
            usd_rate (Decimal): שער דולר חדש
            
        Returns:
            Currency: המטבע המעודכן
            
        Raises:
            ValueError: אם המטבע לא נמצא או השער לא תקין
            
        Example:
            >>> new_rate = Decimal('0.87')
            >>> updated_currency = CurrencyService.update_rate(db_session, 1, new_rate)
        """
        currency = CurrencyService.get_by_id(db, currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")
        
        # ולידציה של השער
        if not CurrencyService.MIN_USD_RATE <= usd_rate <= CurrencyService.MAX_USD_RATE:
            raise ValueError(f"USD rate must be between {CurrencyService.MIN_USD_RATE} and {CurrencyService.MAX_USD_RATE}")
        
        currency.usd_rate = usd_rate
        db.commit()
        db.refresh(currency)
        
        logger.info(f"Updated rate for currency {currency_id} ({currency.symbol}): {usd_rate}")
        return currency
    
    @staticmethod
    def delete(db: Session, currency_id: int) -> bool:
        """
        מחיקת מטבע
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            currency_id (int): מזהה המטבע למחיקה
            
        Returns:
            bool: True אם המטבע נמחק בהצלחה
            
        Raises:
            ValueError: אם המטבע לא נמצא או בשימוש
            
        Example:
            >>> success = CurrencyService.delete(db_session, 1)
            >>> if success:
            ...     print("Currency deleted successfully")
        """
        currency = CurrencyService.get_by_id(db, currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")
        
        # בדיקה שהמטבע לא בשימוש
        if CurrencyService.is_currency_in_use(db, currency_id):
            raise ValueError(f"Cannot delete currency {currency.symbol} - it is in use")
        
        db.delete(currency)
        db.commit()
        
        logger.info(f"Deleted currency: {currency.symbol}")
        return True
    
    @staticmethod
    def is_currency_in_use(db: Session, currency_id: int) -> bool:
        """
        בדיקה אם מטבע בשימוש במערכת
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            currency_id (int): מזהה המטבע
            
        Returns:
            bool: True אם המטבע בשימוש
            
        Example:
            >>> in_use = CurrencyService.is_currency_in_use(db_session, 1)
            >>> if in_use:
            ...     print("Cannot delete - currency is in use")
        """
        # בדיקה בטבלת טיקרים
        ticker_count = db.query(Ticker).filter(Ticker.currency == currency_id).count()
        if ticker_count > 0:
            return True
        
        # בדיקה בטבלת חשבונות
        account_count = db.query(Account).filter(Account.currency == currency_id).count()
        if account_count > 0:
            return True
        
        # בדיקה בטבלת עסקאות
        trade_count = db.query(Trade).filter(Trade.currency == currency_id).count()
        if trade_count > 0:
            return True
        
        # בדיקה בטבלת תוכניות מסחר
        plan_count = db.query(TradePlan).filter(TradePlan.currency == currency_id).count()
        if plan_count > 0:
            return True
        
        # בדיקה בטבלת תזרים מזומן
        cash_flow_count = db.query(CashFlow).filter(CashFlow.currency == currency_id).count()
        if cash_flow_count > 0:
            return True
        
        return False
    
    @staticmethod
    def _validate_currency_data(data: Dict[str, Any], is_update: bool = False) -> None:
        """
        ולידציה של נתוני מטבע
        
        Args:
            data (Dict[str, Any]): נתונים לוולידציה
            is_update (bool): האם זו עדכון (לא כל השדות נדרשים)
            
        Raises:
            ValueError: אם הנתונים לא תקינים
        """
        if not is_update:
            # בדיקת שדות חובה
            required_fields = ['symbol', 'name', 'usd_rate']
            for field in required_fields:
                if field not in data or not data[field]:
                    raise ValueError(f"Missing required field: {field}")
        
        # ולידציה של סמל
        if 'symbol' in data:
            symbol = data['symbol']
            if not isinstance(symbol, str):
                raise ValueError("Symbol must be a string")
            if len(symbol.strip()) == 0:
                raise ValueError("Symbol cannot be empty")
            if len(symbol) > CurrencyService.MAX_SYMBOL_LENGTH:
                raise ValueError(f"Symbol too long (max {CurrencyService.MAX_SYMBOL_LENGTH} characters)")
        
        # ולידציה של שם
        if 'name' in data:
            name = data['name']
            if not isinstance(name, str):
                raise ValueError("Name must be a string")
            if len(name.strip()) == 0:
                raise ValueError("Name cannot be empty")
            if len(name) > CurrencyService.MAX_NAME_LENGTH:
                raise ValueError(f"Name too long (max {CurrencyService.MAX_NAME_LENGTH} characters)")
        
        # ולידציה של שער דולר
        if 'usd_rate' in data:
            try:
                usd_rate = Decimal(str(data['usd_rate']))
                if not CurrencyService.MIN_USD_RATE <= usd_rate <= CurrencyService.MAX_USD_RATE:
                    raise ValueError(f"USD rate must be between {CurrencyService.MIN_USD_RATE} and {CurrencyService.MAX_USD_RATE}")
            except (ValueError, TypeError):
                raise ValueError("Invalid USD rate format")
    
    @staticmethod
    def get_currency_usage_summary(db: Session, currency_id: int) -> Dict[str, int]:
        """
        קבלת סיכום שימוש במטבע
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            currency_id (int): מזהה המטבע
            
        Returns:
            Dict[str, int]: סיכום השימוש במטבע
            
        Example:
            >>> usage = CurrencyService.get_currency_usage_summary(db_session, 1)
            >>> print(f"Tickers: {usage['tickers']}, Accounts: {usage['accounts']}")
        """
        return {
            'tickers': db.query(Ticker).filter(Ticker.currency == currency_id).count(),
            'accounts': db.query(Account).filter(Account.currency == currency_id).count(),
            'trades': db.query(Trade).filter(Trade.currency == currency_id).count(),
            'trade_plans': db.query(TradePlan).filter(TradePlan.currency == currency_id).count(),
            'cash_flows': db.query(CashFlow).filter(CashFlow.currency == currency_id).count()
        }
