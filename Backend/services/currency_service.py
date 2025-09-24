"""
Currency Management Service - TikTrack

This module contains all business logic for managing currencies in the system.
Includes CRUD operations, validation, and exchange rate updates.

Classes:
    CurrencyService: Main service for currency management

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from sqlalchemy.orm import Session
from models.currency import Currency
from models.ticker import Ticker
from models.trading_account import TradingAccount
from models.trade import Trade
from models.trade_plan import TradePlan
from models.cash_flow import CashFlow
from services.validation_service import ValidationService
from typing import List, Optional, Dict, Any
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class CurrencyService:
    """
    Service for managing currencies in the TikTrack system
    
    This service provides all required functionality for currency management:
    - Create, Read, Update, Delete (CRUD)
    - Data validation
    - Exchange rate updates
    - Currency usage checking
    
    Attributes:
        MAX_SYMBOL_LENGTH (int): Maximum length for currency symbol
        MAX_NAME_LENGTH (int): Maximum length for currency name
        MIN_USD_RATE (Decimal): Minimum USD rate
        MAX_USD_RATE (Decimal): Maximum USD rate
        
    Example:
        >>> service = CurrencyService()
        >>> currencies = service.get_all(db_session)
        >>> new_currency = service.create(db_session, {
        ...     'symbol': 'EUR',
        ...     'name': 'Euro',
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
        Get all currencies from the system
        
        Args:
            db (Session): Database connection
            
        Returns:
            List[Currency]: List of all currencies in the system
            
        Example:
            >>> currencies = CurrencyService.get_all(db_session)
        """
        return db.query(Currency).order_by(Currency.symbol).all()
    
    @staticmethod
    def get_by_id(db: Session, currency_id: int) -> Optional[Currency]:
        """
        Get currency by ID
        
        Args:
            db (Session): Database connection
            currency_id (int): Currency ID
            
        Returns:
            Optional[Currency]: Currency if found, None otherwise
            
        Example:
            >>> currency = CurrencyService.get_by_id(db_session, 1)
            >>> if currency:
        """
        return db.query(Currency).filter(Currency.id == currency_id).first()
    
    @staticmethod
    def get_by_symbol(db: Session, symbol: str) -> Optional[Currency]:
        """
        Get currency by symbol
        
        Args:
            db (Session): Database connection
            symbol (str): Currency symbol
            
        Returns:
            Optional[Currency]: Currency if found, None otherwise
            
        Example:
            >>> currency = CurrencyService.get_by_symbol(db_session, 'USD')
            >>> if currency:
        """
        return db.query(Currency).filter(Currency.symbol == symbol.upper()).first()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Currency:
        """
        Create a new currency
        
        Args:
            db (Session): Database connection
            data (Dict[str, Any]): New currency data
            
        Returns:
            Currency: The newly created currency
            
        Raises:
            ValueError: If data is invalid
            
        Example:
            >>> currency_data = {
            ...     'symbol': 'EUR',
            ...     'name': 'Euro',
            ...     'usd_rate': Decimal('0.85')
            ... }
            >>> new_currency = CurrencyService.create(db_session, currency_data)
        """
        # Data validation
        CurrencyService._validate_currency_data(data)
        
        # Validate data against constraints
        logger.info("Validating currency data before creation")
        is_valid, errors = ValidationService.validate_data(db, 'currencies', data)
        if not is_valid:
            error_message = "; ".join(errors)
            logger.error(f"Currency validation failed: {error_message}")
            raise ValueError(f"Currency validation failed: {error_message}")
        
        # Convert symbol to uppercase
        data['symbol'] = data['symbol'].upper()
        
        # Create currency
        currency = Currency(**data)
        db.add(currency)
        db.commit()
        db.refresh(currency)
        
        logger.info(f"Created new currency: {currency.symbol} - {currency.name}")
        return currency
    
    @staticmethod
    def update(db: Session, currency_id: int, data: Dict[str, Any]) -> Currency:
        """
        Update existing currency
        
        Args:
            db (Session): Database connection
            currency_id (int): Currency ID to update
            data (Dict[str, Any]): Data to update
            
        Returns:
            Currency: Updated currency
            
        Raises:
            ValueError: If currency not found or data is invalid
            
        Example:
            >>> update_data = {'usd_rate': Decimal('0.86')}
            >>> updated_currency = CurrencyService.update(db_session, 1, update_data)
        """
        currency = CurrencyService.get_by_id(db, currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")
        
        # הגנה על רשומת הבסיס (מזהה 1)
        if currency_id == 1:
            raise ValueError("Cannot update base currency record (ID=1)")
        
        # Validate data if there are new fields
        if data:
            CurrencyService._validate_currency_data(data, is_update=True)
            
            # Validate data against constraints
            logger.info("Validating currency data before update")
            is_valid, errors = ValidationService.validate_data(db, 'currencies', data, exclude_id=currency_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Currency validation failed: {error_message}")
                raise ValueError(f"Currency validation failed: {error_message}")
        
        # Update fields
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
        Update USD rate only
        
        Args:
            db (Session): Database connection
            currency_id (int): Currency ID
            usd_rate (Decimal): New USD rate
            
        Returns:
            Currency: Updated currency
            
        Raises:
            ValueError: If currency not found or rate is invalid
            
        Example:
            >>> new_rate = Decimal('0.87')
            >>> updated_currency = CurrencyService.update_rate(db_session, 1, new_rate)
        """
        currency = CurrencyService.get_by_id(db, currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")
        
        # הגנה על רשומת הבסיס (מזהה 1)
        if currency_id == 1:
            raise ValueError("Cannot update base currency record (ID=1)")
        
        # Rate validation
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
        Delete currency
        
        Args:
            db (Session): Database connection
            currency_id (int): Currency ID to delete
            
        Returns:
            bool: True if currency deleted successfully
            
        Raises:
            ValueError: If currency not found or in use
            
        Example:
            >>> success = CurrencyService.delete(db_session, 1)
            >>> if success:
        """
        currency = CurrencyService.get_by_id(db, currency_id)
        if not currency:
            raise ValueError(f"Currency with ID {currency_id} not found")
        
        # הגנה על רשומת הבסיס (מזהה 1)
        if currency_id == 1:
            raise ValueError("Cannot delete base currency record (ID=1)")
        
        # Check if currency is in use
        if CurrencyService.is_currency_in_use(db, currency_id):
            raise ValueError(f"Cannot delete currency {currency.symbol} - it is in use")
        
        db.delete(currency)
        db.commit()
        
        logger.info(f"Deleted currency: {currency.symbol}")
        return True
    
    @staticmethod
    def is_currency_in_use(db: Session, currency_id: int) -> bool:
        """
        Check if currency is in use in the system
        
        Args:
            db (Session): Database connection
            currency_id (int): Currency ID
            
        Returns:
            bool: True if currency is in use
            
        Example:
            >>> in_use = CurrencyService.is_currency_in_use(db_session, 1)
            >>> if in_use:
        """
        # Check in tickers table
        ticker_count = db.query(Ticker).filter(Ticker.currency == currency_id).count()
        if ticker_count > 0:
            return True
        
        # Check in accounts table
        account_count = db.query(TradingAccount).filter(TradingAccount.currency == currency_id).count()
        if account_count > 0:
            return True
        
        # Check in trades table
        trade_count = db.query(Trade).filter(Trade.currency == currency_id).count()
        if trade_count > 0:
            return True
        
        # Check in trade plans table
        plan_count = db.query(TradePlan).filter(TradePlan.currency == currency_id).count()
        if plan_count > 0:
            return True
        
        # Check in cash flows table
        cash_flow_count = db.query(CashFlow).filter(CashFlow.currency == currency_id).count()
        if cash_flow_count > 0:
            return True
        
        return False
    
    @staticmethod
    def _validate_currency_data(data: Dict[str, Any], is_update: bool = False) -> None:
        """
        Validate currency data
        
        Args:
            data (Dict[str, Any]): Data to validate
            is_update (bool): Whether this is an update (not all fields required)
            
        Raises:
            ValueError: If data is invalid
        """
        if not is_update:
            # Check required fields
            required_fields = ['symbol', 'name', 'usd_rate']
            for field in required_fields:
                if field not in data or not data[field]:
                    raise ValueError(f"Missing required field: {field}")
        
        # Symbol validation
        if 'symbol' in data:
            symbol = data['symbol']
            if not isinstance(symbol, str):
                raise ValueError("Symbol must be a string")
            if len(symbol.strip()) == 0:
                raise ValueError("Symbol cannot be empty")
            if len(symbol) > CurrencyService.MAX_SYMBOL_LENGTH:
                raise ValueError(f"Symbol too long (max {CurrencyService.MAX_SYMBOL_LENGTH} characters)")
        
        # Name validation
        if 'name' in data:
            name = data['name']
            if not isinstance(name, str):
                raise ValueError("Name must be a string")
            if len(name.strip()) == 0:
                raise ValueError("Name cannot be empty")
            if len(name) > CurrencyService.MAX_NAME_LENGTH:
                raise ValueError(f"Name too long (max {CurrencyService.MAX_NAME_LENGTH} characters)")
        
        # USD rate validation
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
        Get currency usage summary
        
        Args:
            db (Session): Database connection
            currency_id (int): Currency ID
            
        Returns:
            Dict[str, int]: Currency usage summary
            
        Example:
            >>> usage = CurrencyService.get_currency_usage_summary(db_session, 1)
        """
        return {
            'tickers': db.query(Ticker).filter(Ticker.currency == currency_id).count(),
            'accounts': db.query(TradingAccount).filter(TradingAccount.currency == currency_id).count(),
            'trades': db.query(Trade).filter(Trade.currency == currency_id).count(),
            'trade_plans': db.query(TradePlan).filter(TradePlan.currency == currency_id).count(),
            'cash_flows': db.query(CashFlow).filter(CashFlow.currency == currency_id).count()
        }
    
    @staticmethod
    def get_currencies_for_dropdown(db: Session) -> List[Dict[str, Any]]:
        """
        Get all currencies for dropdown display with symbol and name
        
        Args:
            db (Session): Database connection
            
        Returns:
            List[Dict[str, Any]]: List of currencies with id, symbol, and name
            
        Example:
            >>> currencies = CurrencyService.get_currencies_for_dropdown(db_session)
            >>> for currency in currencies:
        """
        currencies = db.query(Currency).order_by(Currency.symbol).all()
        return [
            {
                'id': currency.id,
                'symbol': currency.symbol,
                'name': currency.name
            }
            for currency in currencies
        ]
