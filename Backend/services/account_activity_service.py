"""
Account Activity Service - TikTrack

This service handles calculation of account activity including:
- Cash flows aggregation
- Executions aggregation
- Balance calculation by currency
- Multi-currency support

Author: TikTrack Development Team
Version: 1.0.0
Date: November 2025
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import Dict, List, Any, Optional
from datetime import date, datetime
from decimal import Decimal
import logging

from models.trading_account import TradingAccount
from models.cash_flow import CashFlow
from models.execution import Execution
from models.currency import Currency
from models.ticker import Ticker

logger = logging.getLogger(__name__)


class AccountActivityService:
    """
    Service for calculating and aggregating account activity data
    """
    
    @staticmethod
    def get_account_activity(
        db: Session,
        account_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Get all account activity (cash flows + executions) grouped by currency
        
        Args:
            db: Database session
            account_id: Trading account ID
            start_date: Optional start date filter
            end_date: Optional end date filter
            
        Returns:
            Dictionary with account info and currencies data
        """
        try:
            # Get account with currency
            account = db.query(TradingAccount).options(
                joinedload(TradingAccount.currency)
            ).filter(TradingAccount.id == account_id).first()
            
            if not account:
                raise ValueError(f"Trading account {account_id} not found")
            
            # Get all cash flows for this account
            cash_flows_query = db.query(CashFlow).options(
                joinedload(CashFlow.currency)
            ).filter(CashFlow.trading_account_id == account_id)
            
            if start_date:
                cash_flows_query = cash_flows_query.filter(CashFlow.date >= start_date)
            if end_date:
                cash_flows_query = cash_flows_query.filter(CashFlow.date <= end_date)
            
            cash_flows = cash_flows_query.order_by(CashFlow.date.desc(), CashFlow.created_at.desc()).all()
            
            # Get all executions for this account
            executions_query = db.query(Execution).options(
                joinedload(Execution.ticker),
                joinedload(Execution.trading_account)
            ).filter(Execution.trading_account_id == account_id)
            
            if start_date:
                executions_query = executions_query.filter(Execution.date >= datetime.combine(start_date, datetime.min.time()))
            if end_date:
                executions_query = executions_query.filter(Execution.date <= datetime.combine(end_date, datetime.max.time()))
            
            executions = executions_query.order_by(Execution.date.desc(), Execution.created_at.desc()).all()
            
            # Group by currency
            currencies_dict = {}
            
            # Process cash flows
            for cf in cash_flows:
                currency_id = cf.currency_id or 1  # Default to USD
                currency_symbol = cf.currency.symbol if cf.currency else 'USD'
                
                if currency_id not in currencies_dict:
                    currencies_dict[currency_id] = {
                        'currency_id': currency_id,
                        'currency_symbol': currency_symbol,
                        'currency_name': cf.currency.name if cf.currency else 'US Dollar',
                        'movements': [],
                        'balance': 0.0
                    }
                
                # Add cash flow as movement
                movement = {
                    'id': cf.id,
                    'type': 'cash_flow',
                    'sub_type': cf.type,
                    'date': cf.date.isoformat() if cf.date else None,
                    'amount': float(cf.amount),
                    'description': cf.description,
                    'ticker_symbol': None,
                    'created_at': cf.created_at.isoformat() if cf.created_at else None
                }
                
                currencies_dict[currency_id]['movements'].append(movement)
                
                # Calculate balance (positive for deposits, negative for withdrawals)
                if cf.type in ['deposit', 'dividend', 'interest']:
                    currencies_dict[currency_id]['balance'] += float(cf.amount)
                elif cf.type in ['withdrawal', 'fee']:
                    currencies_dict[currency_id]['balance'] -= float(cf.amount)
                # Transfer handled separately if needed
            
            # Process executions
            for ex in executions:
                # Get currency from ticker or account base currency
                if ex.ticker and ex.ticker.currency_id:
                    currency_id = ex.ticker.currency_id
                    currency = ex.ticker.currency
                elif account.currency_id:
                    currency_id = account.currency_id
                    currency = account.currency
                else:
                    currency_id = 1  # Default to USD
                    currency = None
                
                currency_symbol = currency.symbol if currency else 'USD'
                
                if currency_id not in currencies_dict:
                    currencies_dict[currency_id] = {
                        'currency_id': currency_id,
                        'currency_symbol': currency_symbol,
                        'currency_name': currency.name if currency else 'US Dollar',
                        'movements': [],
                        'balance': 0.0
                    }
                
                # Calculate execution amount (negative for buy, positive for sell)
                execution_amount = -float(ex.price * ex.quantity + (ex.fee or 0)) if ex.action == 'buy' else float(ex.price * ex.quantity - (ex.fee or 0))
                
                # Add execution as movement
                movement = {
                    'id': ex.id,
                    'type': 'execution',
                    'sub_type': ex.action,
                    'date': ex.date.isoformat() if ex.date else None,
                    'amount': execution_amount,
                    'description': ex.notes,
                    'ticker_symbol': ex.ticker.symbol if ex.ticker else None,
                    'quantity': float(ex.quantity),
                    'price': float(ex.price),
                    'fee': float(ex.fee) if ex.fee else 0.0,
                    'created_at': ex.created_at.isoformat() if ex.created_at else None
                }
                
                currencies_dict[currency_id]['movements'].append(movement)
                
                # Update balance
                currencies_dict[currency_id]['balance'] += execution_amount
            
            # Sort movements by date (newest first)
            for currency_data in currencies_dict.values():
                currency_data['movements'].sort(
                    key=lambda x: x['date'] or '',
                    reverse=True
                )
            
            # Convert to list and prepare response
            currencies_list = list(currencies_dict.values())
            
            # Get base currency info
            base_currency_symbol = account.currency.symbol if account.currency else 'USD'
            base_currency_id = account.currency_id if account.currency_id else 1
            
            # Calculate base currency total (using existing usd_rate from currencies table)
            base_currency_total = 0.0
            exchange_rates_used = {}
            
            for curr_data in currencies_list:
                if curr_data['currency_id'] == base_currency_id:
                    base_currency_total += curr_data['balance']
                else:
                    # Convert to base currency using rate from database
                    # For now, we use the usd_rate from currencies table
                    # Later, this will use the currency rates API
                    currency_obj = db.query(Currency).filter(Currency.id == curr_data['currency_id']).first()
                    base_currency_obj = db.query(Currency).filter(Currency.id == base_currency_id).first()
                    
                    if currency_obj and base_currency_obj:
                        # Convert via USD: balance_usd = balance * usd_rate
                        # Then to base: balance_base = balance_usd / base_usd_rate
                        balance_usd = curr_data['balance'] * float(currency_obj.usd_rate)
                        balance_base = balance_usd / float(base_currency_obj.usd_rate)
                        base_currency_total += balance_base
                        exchange_rates_used[curr_data['currency_symbol']] = float(currency_obj.usd_rate)
            
            return {
                'account_id': account.id,
                'account_name': account.name,
                'base_currency_id': base_currency_id,
                'base_currency': base_currency_symbol,
                'currencies': currencies_list,
                'base_currency_total': round(base_currency_total, 2),
                'exchange_rates_used': exchange_rates_used
            }
            
        except Exception as e:
            logger.error(f"Error getting account activity for account {account_id}: {str(e)}")
            raise
    
    @staticmethod
    def calculate_balance_by_currency(
        db: Session,
        account_id: int,
        currency_id: int
    ) -> float:
        """
        Calculate balance for specific currency in account
        
        Args:
            db: Database session
            account_id: Trading account ID
            currency_id: Currency ID
            
        Returns:
            Balance amount in the specified currency
        """
        balance = 0.0
        
        # Sum cash flows
        cash_flows = db.query(CashFlow).filter(
            and_(
                CashFlow.trading_account_id == account_id,
                CashFlow.currency_id == currency_id
            )
        ).all()
        
        for cf in cash_flows:
            if cf.type in ['deposit', 'dividend', 'interest']:
                balance += float(cf.amount)
            elif cf.type in ['withdrawal', 'fee']:
                balance -= float(cf.amount)
        
        # Sum executions (need to check ticker currency)
        # This is simplified - in practice, we need to check ticker currency
        executions = db.query(Execution).options(
            joinedload(Execution.ticker).joinedload(Ticker.currency)
        ).filter(
            Execution.trading_account_id == account_id
        ).all()
        
        for ex in executions:
            if ex.ticker and ex.ticker.currency_id == currency_id:
                execution_amount = -float(ex.price * ex.quantity + (ex.fee or 0)) if ex.action == 'buy' else float(ex.price * ex.quantity - (ex.fee or 0))
                balance += execution_amount
        
        return balance
    
    @staticmethod
    def get_movements_timeline(
        db: Session,
        account_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Get chronological timeline of all movements (cash flows + executions)
        
        Args:
            db: Database session
            account_id: Trading account ID
            start_date: Optional start date filter
            end_date: Optional end date filter
            
        Returns:
            List of movements sorted chronologically
        """
        movements = []
        
        # Get cash flows
        cash_flows_query = db.query(CashFlow).options(
            joinedload(CashFlow.currency)
        ).filter(CashFlow.trading_account_id == account_id)
        
        if start_date:
            cash_flows_query = cash_flows_query.filter(CashFlow.date >= start_date)
        if end_date:
            cash_flows_query = cash_flows_query.filter(CashFlow.date <= end_date)
        
        cash_flows = cash_flows_query.all()
        
        for cf in cash_flows:
            movements.append({
                'id': cf.id,
                'type': 'cash_flow',
                'sub_type': cf.type,
                'date': cf.date.isoformat() if cf.date else None,
                'amount': float(cf.amount),
                'currency_id': cf.currency_id,
                'currency_symbol': cf.currency.symbol if cf.currency else 'USD',
                'description': cf.description
            })
        
        # Get executions
        executions_query = db.query(Execution).options(
            joinedload(Execution.ticker).joinedload(Ticker.currency),
            joinedload(Execution.trading_account)
        ).filter(Execution.trading_account_id == account_id)
        
        if start_date:
            executions_query = executions_query.filter(Execution.date >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            executions_query = executions_query.filter(Execution.date <= datetime.combine(end_date, datetime.max.time()))
        
        executions = executions_query.all()
        
        for ex in executions:
            currency_id = ex.ticker.currency_id if ex.ticker and ex.ticker.currency_id else (ex.trading_account.currency_id if ex.trading_account else 1)
            currency_symbol = ex.ticker.currency.symbol if ex.ticker and ex.ticker.currency else (ex.trading_account.currency.symbol if ex.trading_account and ex.trading_account.currency else 'USD')
            
            execution_amount = -float(ex.price * ex.quantity + (ex.fee or 0)) if ex.action == 'buy' else float(ex.price * ex.quantity - (ex.fee or 0))
            
            movements.append({
                'id': ex.id,
                'type': 'execution',
                'sub_type': ex.action,
                'date': ex.date.isoformat() if ex.date else None,
                'amount': execution_amount,
                'currency_id': currency_id,
                'currency_symbol': currency_symbol,
                'ticker_symbol': ex.ticker.symbol if ex.ticker else None,
                'quantity': float(ex.quantity),
                'price': float(ex.price),
                'description': ex.notes
            })
        
        # Sort by date
        movements.sort(key=lambda x: x['date'] or '', reverse=True)
        
        return movements


