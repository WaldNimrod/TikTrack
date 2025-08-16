"""
Account Service - Business Logic Layer for Account Management

This module contains the business logic for account operations, implementing
the service layer pattern from the new backend architecture.

Responsibilities:
- Account CRUD operations
- Business rule validation
- Data aggregation and statistics
- Transaction management
- Logging and error handling

The service layer acts as an intermediary between the API routes (Presentation Layer)
and the data models (Data Access Layer), ensuring proper separation of concerns.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16

🚨 CRITICAL REMINDERS:
- This is the SERVICE LAYER - business logic only
- Never write database queries here - use models
- Never write API routes here - use blueprints
- Always follow: Models → Services → Routes → App architecture
"""

from sqlalchemy.orm import Session
from models.account import Account
from typing import List, Optional, Dict, Any
import logging

# Configure logging for this module
logger = logging.getLogger(__name__)

class AccountService:
    """
    Service class for account management operations.
    
    This class implements the business logic layer for account operations,
    providing a clean interface between the API routes and the data models.
    All methods are static to avoid state management complexity.
    """
    
    @staticmethod
    def get_all(db: Session) -> List[Account]:
        """
        קבלת כל החשבונות במערכת
        
        Args:
            db (Session): SQLAlchemy database session
            
        Returns:
            List[Account]: List of all accounts in the system
            
        Note:
            This method returns all accounts regardless of status.
            For filtered results, use additional query parameters.
        """
        return db.query(Account).all()
    
    @staticmethod
    def get_by_id(db: Session, account_id: int) -> Optional[Account]:
        """
        קבלת חשבון ספציפי לפי מזהה
        
        Args:
            db (Session): SQLAlchemy database session
            account_id (int): מזהה החשבון המבוקש
            
        Returns:
            Optional[Account]: Account object if found, None otherwise
            
        Note:
            Returns None if account doesn't exist, allowing the API layer
            to handle the 404 response appropriately.
        """
        return db.query(Account).filter(Account.id == account_id).first()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Account:
        """
        יצירת חשבון חדש במערכת
        
        Args:
            db (Session): SQLAlchemy database session
            data (Dict[str, Any]): Dictionary containing account data
                Required fields: name, currency, status
                Optional fields: cash_balance, total_value, total_pl, notes
                
        Returns:
            Account: The newly created account object
            
        Raises:
            SQLAlchemyError: If database operation fails
            ValidationError: If required fields are missing
            
        Note:
            - Validates required fields before creation
            - Sets default values for optional fields
            - Logs successful account creation
        """
        # Validate required fields
        required_fields = ['name', 'currency', 'status']
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"Required field '{field}' is missing or empty")
        
        # Set default values for optional fields
        defaults = {
            'cash_balance': 0.0,
            'total_value': 0.0,
            'total_pl': 0.0
        }
        
        # Merge provided data with defaults
        account_data = {**defaults, **data}
        
        # Create new account instance
        account = Account(**account_data)
        
        # Add to database and commit transaction
        db.add(account)
        db.commit()
        db.refresh(account)
        
        # Log successful creation
        logger.info(f"Created account: {account.name} (ID: {account.id})")
        return account
    
    @staticmethod
    def update(db: Session, account_id: int, data: Dict[str, Any]) -> Optional[Account]:
        """
        עדכון חשבון קיים
        
        Args:
            db (Session): SQLAlchemy database session
            account_id (int): מזהה החשבון לעדכון
            data (Dict[str, Any]): Dictionary containing fields to update
                Supported fields: name, currency, status, cash_balance, 
                                total_value, total_pl, notes
                
        Returns:
            Optional[Account]: Updated account object if found, None otherwise
            
        Note:
            - Supports partial updates (only provided fields are updated)
            - Validates field existence before updating
            - Logs successful updates
        """
        # Find the account to update
        account = db.query(Account).filter(Account.id == account_id).first()
        
        if account:
            # Update only provided fields
            for key, value in data.items():
                if hasattr(account, key):
                    setattr(account, key, value)
                else:
                    logger.warning(f"Attempted to update non-existent field '{key}' on account {account_id}")
            
            # Commit changes to database
            db.commit()
            db.refresh(account)
            
            # Log successful update
            logger.info(f"Updated account: {account.name} (ID: {account.id})")
            return account
        
        # Account not found
        logger.warning(f"Attempted to update non-existent account: {account_id}")
        return None
    
    @staticmethod
    def delete(db: Session, account_id: int) -> bool:
        """
        מחיקת חשבון מהמערכת
        
        Args:
            db (Session): SQLAlchemy database session
            account_id (int): מזהה החשבון למחיקה
            
        Returns:
            bool: True if account was deleted, False if not found
            
        Note:
            - Currently allows deletion of any account
            - Future enhancement: Add business rule validation
              (e.g., prevent deletion of accounts with active trades)
            - Logs successful deletions
        """
        # Find the account to delete
        account = db.query(Account).filter(Account.id == account_id).first()
        
        if account:
            # TODO: Add business rule validation
            # Example: Check if account has active trades
            # from models.trade import Trade
            # active_trades = db.query(Trade).filter(
            #     Trade.account_id == account_id,
            #     Trade.status == 'open'
            # ).count()
            # if active_trades > 0:
            #     raise ValueError("Cannot delete account with active trades")
            
            # Delete the account
            db.delete(account)
            db.commit()
            
            # Log successful deletion
            logger.info(f"Deleted account: {account.name} (ID: {account_id})")
            return True
        
        # Account not found
        logger.warning(f"Attempted to delete non-existent account: {account_id}")
        return False
    
    @staticmethod
    def get_stats(db: Session, account_id: int) -> Dict[str, Any]:
        """
        קבלת סטטיסטיקות מפורטות של חשבון
        
        Calculates comprehensive account statistics including:
        - Trade counts (total, open, closed)
        - P&L breakdown (total, realized, unrealized)
        - Cash flow statistics
        - Performance metrics
        
        Args:
            db (Session): SQLAlchemy database session
            account_id (int): מזהה החשבון לסטטיסטיקות
            
        Returns:
            Dict[str, Any]: Dictionary containing account statistics
                Returns empty dict if account not found
                
        Note:
            - Aggregates data from multiple related tables
            - Provides both raw counts and calculated metrics
            - Handles missing data gracefully
        """
        # Import related models for statistics calculation
        from models.trade import Trade
        from models.cash_flow import CashFlow
        
        # Verify account exists
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            logger.warning(f"Attempted to get stats for non-existent account: {account_id}")
            return {}
        
        # Get all trades for this account
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        
        # Categorize trades by status
        open_trades = [t for t in trades if t.status == 'open']
        closed_trades = [t for t in trades if t.status == 'closed']
        
        # Get cash flows for this account
        cash_flows = db.query(CashFlow).filter(CashFlow.account_id == account_id).all()
        
        # Calculate P&L metrics
        total_pl = sum(trade.total_pl for trade in trades)
        realized_pl = sum(trade.total_pl for trade in closed_trades)
        unrealized_pl = sum(trade.total_pl for trade in open_trades)
        
        # Calculate cash flow metrics
        total_cash_flow = sum(cf.amount for cf in cash_flows)
        
        # Build comprehensive statistics dictionary
        stats = {
            'account_id': account_id,
            'account_name': account.name,
            'account_status': account.status,
            
            # Trade statistics
            'total_trades': len(trades),
            'open_trades': len(open_trades),
            'closed_trades': len(closed_trades),
            
            # P&L statistics
            'total_pl': total_pl,
            'realized_pl': realized_pl,
            'unrealized_pl': unrealized_pl,
            
            # Cash flow statistics
            'cash_flows_count': len(cash_flows),
            'total_cash_flow': total_cash_flow,
            
            # Performance metrics
            'win_rate': len([t for t in closed_trades if t.total_pl > 0]) / len(closed_trades) if closed_trades else 0,
            'average_trade_pl': total_pl / len(trades) if trades else 0
        }
        
        logger.info(f"Generated statistics for account {account_id}: {len(trades)} trades, {total_pl} total P&L")
        return stats
    
    @staticmethod
    def update_account_values(db: Session, account_id: int) -> bool:
        """
        עדכון ערכי החשבון (total_pl, total_value) מחדש
        
        Recalculates account values based on current trade data.
        This method is typically called after trade updates to ensure
        account values remain synchronized.
        
        Args:
            db (Session): SQLAlchemy database session
            account_id (int): מזהה החשבון לעדכון
            
        Returns:
            bool: True if update successful, False if account not found
            
        Note:
            - Recalculates total_pl from all trades
            - Updates total_value based on cash_balance + total_pl
            - Should be called after trade modifications
        """
        # Import Trade model for calculations
        from models.trade import Trade
        
        # Find the account to update
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            logger.warning(f"Attempted to update values for non-existent account: {account_id}")
            return False
        
        # Get all trades for this account
        trades = db.query(Trade).filter(Trade.account_id == account_id).all()
        
        # Recalculate total P&L from all trades
        total_pl = sum(trade.total_pl for trade in trades)
        
        # Update account values
        account.total_pl = total_pl
        account.total_value = account.cash_balance + total_pl
        
        # Commit changes to database
        db.commit()
        
        # Log successful update
        logger.info(f"Updated account values for account {account_id}: total_pl={total_pl}, total_value={account.total_value}")
        return True
