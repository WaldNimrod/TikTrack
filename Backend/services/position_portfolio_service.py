"""
Position & Portfolio Service - TikTrack
מערכת חישוב פוזיציות ופורטפוליו

תאריך: ינואר 2025
גרסה: 1.0.0
מטרה: חישוב פוזיציות לפי ticker+account (כולל פוזיציות ספונטניות) ופורטפוליו מלא

Documentation: documentation/02-ARCHITECTURE/BACKEND/POSITION_PORTFOLIO_SERVICE.md
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timezone
import logging

from models.execution import Execution
from models.trading_account import TradingAccount
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.external_data import MarketDataQuote
from services.account_activity_service import AccountActivityService

logger = logging.getLogger(__name__)


class PositionPortfolioService:
    """
    Service for calculating positions by ticker+account and portfolio summaries
    
    Features:
    - Calculate positions by ticker+account (including spontaneous positions)
    - Support multiple trades per position
    - Calculate all required metrics (market value, P/L, percentages)
    - Get market prices from MarketDataQuote
    - Portfolio aggregation across accounts
    """
    
    @staticmethod
    def get_market_price(db: Session, ticker_id: int) -> Optional[Dict[str, Any]]:
        """
        Get latest market price for a ticker
        
        Args:
            db: Database session
            ticker_id: Ticker ID
            
        Returns:
            Dict with price data or None if not available
            Format: {'price': float, 'is_stale': bool, 'fetched_at': datetime}
        """
        try:
            quote = db.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.is_stale == False
                )
            ).order_by(desc(MarketDataQuote.fetched_at)).first()
            
            if not quote:
                return None
            
            return {
                'price': float(quote.price),
                'is_stale': quote.is_stale,
                'fetched_at': quote.fetched_at,
                'asof_utc': quote.asof_utc,
                'change_pct_day': quote.change_pct_day,
                'change_amount_day': quote.change_amount_day,
                # Open price data
                'open_price': quote.open_price,
                'change_pct_from_open': quote.change_pct_from_open,
                'change_amount_from_open': quote.change_amount_from_open
            }
        except Exception as e:
            logger.error(f"Error getting market price for ticker {ticker_id}: {str(e)}")
            return None
    
    @staticmethod
    def calculate_position_by_ticker_account(
        db: Session,
        trading_account_id: int,
        ticker_id: int,
        include_market_data: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Calculate position for a specific ticker+account combination
        
        Includes both trade-linked and spontaneous executions
        
        Args:
            db: Database session
            trading_account_id: Trading account ID
            ticker_id: Ticker ID
            include_market_data: Whether to include market price data
            
        Returns:
            Dict with complete position data or None if no executions
        """
        try:
            # Get all executions for this ticker+account combination
            # Include both trade-linked and spontaneous (ticker_id + trading_account_id only)
            executions = db.query(Execution).filter(
                and_(
                    Execution.ticker_id == ticker_id,
                    Execution.trading_account_id == trading_account_id
                )
            ).order_by(Execution.date.asc(), Execution.created_at.asc()).all()
            
            if not executions:
                logger.debug(f"No executions found for account {trading_account_id}, ticker {ticker_id}")
                return None
            
            # Calculate position metrics
            total_bought_quantity = 0.0
            total_sold_quantity = 0.0
            total_bought_amount = 0.0
            total_sold_amount = 0.0
            total_cost = 0.0
            total_fees = 0.0
            realized_pl = 0.0
            last_execution_date = None
            
            # Track linked trades and plans
            linked_trade_ids = set()
            linked_trade_plan_ids = set()
            
            for execution in executions:
                action = execution.action
                quantity = float(execution.quantity)
                price = float(execution.price)
                fee = float(execution.fee or 0)
                exec_date = execution.date or execution.created_at
                
                # Track linked trades and plans
                if execution.trade_id:
                    linked_trade_ids.add(execution.trade_id)
                    # Get trade to find trade_plan_id
                    trade = db.query(Trade).filter(Trade.id == execution.trade_id).first()
                    if trade and trade.trade_plan_id:
                        linked_trade_plan_ids.add(trade.trade_plan_id)
                
                if last_execution_date is None or exec_date > last_execution_date:
                    last_execution_date = exec_date
                
                if action == 'buy':
                    total_bought_quantity += quantity
                    total_bought_amount += quantity * price
                    total_cost += (quantity * price) + fee
                    total_fees += fee
                elif action == 'sell':
                    total_sold_quantity += quantity
                    total_sold_amount += quantity * price
                    total_fees += fee  # Fees from sells also count
                    # Realized P/L from execution if available
                    if execution.realized_pl is not None:
                        realized_pl += float(execution.realized_pl)
            
            # Calculate net position
            net_quantity = total_bought_quantity - total_sold_quantity
            
            # Calculate average price (only for bought shares)
            if total_bought_quantity > 0:
                average_price_gross = total_bought_amount / total_bought_quantity
                average_price_net = total_cost / total_bought_quantity
            else:
                average_price_gross = 0.0
                average_price_net = 0.0
            
            # Determine position side
            if net_quantity > 0:
                side = 'long'
            elif net_quantity < 0:
                side = 'short'
            else:
                side = 'closed'
            
            # Get market price if requested
            market_price_data = None
            market_value = None
            unrealized_pl = None
            unrealized_pl_percent = None
            
            if include_market_data:
                market_price_data = PositionPortfolioService.get_market_price(db, ticker_id)
                if market_price_data and net_quantity != 0:
                    market_price = market_price_data['price']
                    market_value = abs(net_quantity) * market_price
                    
                    # Calculate unrealized P/L
                    current_cost = abs(net_quantity) * average_price_net
                    if side == 'long':
                        unrealized_pl = market_value - current_cost
                    else:  # short
                        unrealized_pl = current_cost - market_value
                    
                    # Calculate unrealized P/L percentage
                    if current_cost > 0:
                        unrealized_pl_percent = (unrealized_pl / current_cost) * 100
            
            # Calculate current position cost
            current_position_cost = abs(net_quantity) * average_price_net if net_quantity != 0 else 0.0
            
            # Get ticker and account info
            ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
            account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
            
            position_data = {
                # Basic identifiers
                'trading_account_id': trading_account_id,
                'account_name': account.name if account else f'Account_{trading_account_id}',
                'ticker_id': ticker_id,
                'ticker_symbol': ticker.symbol if ticker else f'Ticker_{ticker_id}',
                'ticker_name': ticker.name if ticker else None,
                
                # Position metrics
                'quantity': net_quantity,
                'side': side,
                'average_price_gross': average_price_gross,
                'average_price_net': average_price_net,
                
                # Trade/plan links
                'linked_trade_ids': list(linked_trade_ids),
                'linked_trade_plan_ids': list(linked_trade_plan_ids),
                'is_spontaneous': len(linked_trade_ids) == 0,
                
                # Amounts
                'total_bought_quantity': total_bought_quantity,
                'total_bought_amount': total_bought_amount,
                'total_sold_quantity': total_sold_quantity,
                'total_sold_amount': total_sold_amount,
                'total_cost': total_cost,
                'total_fees': total_fees,
                'current_position_cost': current_position_cost,
                
                # P/L
                'realized_pl': realized_pl,
                'realized_pl_percent': (realized_pl / total_cost * 100) if total_cost > 0 else 0.0,
                
                # Market data
                'market_price': market_price_data['price'] if market_price_data else None,
                'market_price_available': market_price_data is not None,
                'market_value': market_value,
                'unrealized_pl': unrealized_pl,
                'unrealized_pl_percent': unrealized_pl_percent,
                
                # Metadata
                'last_execution_date': last_execution_date.isoformat() if last_execution_date and hasattr(last_execution_date, 'isoformat') else str(last_execution_date) if last_execution_date else None,
                'executions_count': len(executions)
            }
            
            logger.info(f"Calculated position for account {trading_account_id}, ticker {ticker_id}: quantity={net_quantity}, side={side}")
            return position_data
            
        except Exception as e:
            logger.error(f"Error calculating position for account {trading_account_id}, ticker {ticker_id}: {str(e)}")
            return None
    
    @staticmethod
    def _calculate_all_account_positions_internal(
        db: Session,
        trading_account_id: int,
        include_closed: bool = False,
        include_market_data: bool = True
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Internal helper that calculates positions and returns diagnostics metadata
        """
        diagnostics = {
            'account_id': trading_account_id,
            'include_closed': include_closed,
            'include_market_data': include_market_data,
            'execution_pairs_count': 0,
            'positions_count': 0
        }
        try:
            # Get all unique ticker+account combinations that have executions
            ticker_account_pairs = db.query(
                Execution.ticker_id,
                Execution.trading_account_id
            ).filter(
                Execution.trading_account_id == trading_account_id
            ).distinct().all()
            diagnostics['execution_pairs_count'] = len(ticker_account_pairs)
            
            positions = []
            for ticker_id, account_id in ticker_account_pairs:
                position = PositionPortfolioService.calculate_position_by_ticker_account(
                    db, account_id, ticker_id, include_market_data
                )
                
                if position:
                    # Filter closed positions if needed
                    if include_closed or position['quantity'] != 0:
                        positions.append(position)
            
            # Calculate percent_of_account for each position
            # Get account cash balance
            try:
                activity_data = AccountActivityService.get_account_activity(
                    db=db,
                    account_id=trading_account_id,
                    start_date=None,
                    end_date=None
                )
                cash_balance = activity_data.get('base_currency_total', 0.0) or 0.0
            except Exception as e:
                logger.warning(f"Error getting account balance for account {trading_account_id}: {str(e)}")
                cash_balance = 0.0
            
            # Sum market value of all positions for this account
            account_positions_value = sum(p.get('market_value', 0) or 0 for p in positions)
            
            # Total account value = cash balance + positions value
            account_total_value = cash_balance + account_positions_value
            
            # Calculate percent_of_account for each position
            # Use absolute value to handle negative balances
            account_total_value_abs = abs(account_total_value)
            for position in positions:
                market_value = position.get('market_value', 0) or 0
                if account_total_value_abs > 0:
                    percent = (market_value / account_total_value_abs) * 100
                    position['percent_of_account'] = percent
                else:
                    position['percent_of_account'] = 0.0
            
            diagnostics['positions_count'] = len(positions)
            diagnostics['has_positions'] = len(positions) > 0
            logger.info(f"Calculated {len(positions)} positions for account {trading_account_id}")
            return positions, diagnostics
            
        except Exception as e:
            logger.error(f"Error calculating all positions for account {trading_account_id}: {str(e)}")
            diagnostics['error'] = str(e)
            return [], diagnostics
    
    @staticmethod
    def calculate_all_account_positions(
        db: Session,
        trading_account_id: int,
        include_closed: bool = False,
        include_market_data: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Calculate all positions for a specific account (without diagnostics)
        """
        positions, _ = PositionPortfolioService._calculate_all_account_positions_internal(
            db=db,
            trading_account_id=trading_account_id,
            include_closed=include_closed,
            include_market_data=include_market_data
        )
        return positions
    
    @staticmethod
    def calculate_all_account_positions_with_metadata(
        db: Session,
        trading_account_id: int,
        include_closed: bool = False,
        include_market_data: bool = True
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Calculate all positions for a specific account and return diagnostics metadata
        """
        return PositionPortfolioService._calculate_all_account_positions_internal(
            db=db,
            trading_account_id=trading_account_id,
            include_closed=include_closed,
            include_market_data=include_market_data
        )
    
    @staticmethod
    def calculate_portfolio_summary(
        db: Session,
        account_id_filter: Optional[int] = None,
        include_closed: bool = False,
        unify_accounts: bool = False,
        side_filter: Optional[str] = None  # 'long', 'short', or None for all
    ) -> Dict[str, Any]:
        """
        Calculate portfolio summary across all accounts
        
        Args:
            db: Database session
            account_id_filter: Optional filter by specific account ID (None = all accounts)
            include_closed: Whether to include closed positions
            unify_accounts: If True, merge positions with same ticker across accounts
            side_filter: Filter by side ('long', 'short', or None for all)
            
        Returns:
            Dict with portfolio summary and positions list
        """
        try:
            # Get accounts (filtered or all)
            if account_id_filter:
                accounts = db.query(TradingAccount).filter(TradingAccount.id == account_id_filter).all()
            else:
                accounts = db.query(TradingAccount).all()
            
            all_positions = []
            positions_by_key = {} if unify_accounts else None
            diagnostics = {
                'accounts_processed': len(accounts),
                'accounts_with_executions': [],
                'accounts_without_executions': []
            }
            
            for account in accounts:
                account_positions, metadata = PositionPortfolioService.calculate_all_account_positions_with_metadata(
                    db=db,
                    trading_account_id=account.id,
                    include_closed=include_closed,
                    include_market_data=True
                )
                
                if metadata.get('execution_pairs_count', 0) == 0:
                    diagnostics['accounts_without_executions'].append(account.id)
                else:
                    diagnostics['accounts_with_executions'].append(account.id)
                
                for position in account_positions:
                    # Apply side filter
                    if side_filter and position['side'] != side_filter:
                        continue
                    
                    if unify_accounts:
                        # Unify positions by ticker
                        key = position['ticker_id']
                        if key in positions_by_key:
                            # Merge positions
                            existing = positions_by_key[key]
                            existing['quantity'] += position['quantity']
                            existing['total_bought_quantity'] += position['total_bought_quantity']
                            existing['total_bought_amount'] += position['total_bought_amount']
                            existing['total_sold_quantity'] += position['total_sold_quantity']
                            existing['total_sold_amount'] += position['total_sold_amount']
                            existing['total_cost'] += position['total_cost']
                            existing['total_fees'] += position['total_fees']
                            existing['realized_pl'] += position['realized_pl']
                            existing['market_value'] = (existing['market_value'] or 0) + (position['market_value'] or 0)
                            existing['linked_trade_ids'].extend(position['linked_trade_ids'])
                            existing['linked_trade_plan_ids'].extend(position['linked_trade_plan_ids'])
                            # Recalculate average prices
                            if existing['total_bought_quantity'] > 0:
                                existing['average_price_gross'] = existing['total_bought_amount'] / existing['total_bought_quantity']
                                existing['average_price_net'] = existing['total_cost'] / existing['total_bought_quantity']
                            # Recalculate current position cost
                            existing['current_position_cost'] = abs(existing['quantity']) * existing['average_price_net'] if existing['quantity'] != 0 else 0.0
                            # Recalculate unrealized P/L if market value available
                            if existing['market_value'] and existing['quantity'] != 0:
                                if existing['quantity'] > 0:
                                    existing['unrealized_pl'] = existing['market_value'] - existing['current_position_cost']
                                else:
                                    existing['unrealized_pl'] = existing['current_position_cost'] - existing['market_value']
                                if existing['current_position_cost'] > 0:
                                    existing['unrealized_pl_percent'] = (existing['unrealized_pl'] / existing['current_position_cost']) * 100
                        else:
                            positions_by_key[key] = position.copy()
                    else:
                        all_positions.append(position)
            
            if unify_accounts:
                all_positions = list(positions_by_key.values())
                # Recalculate side for unified positions
                for position in all_positions:
                    if position['quantity'] > 0:
                        position['side'] = 'long'
                    elif position['quantity'] < 0:
                        position['side'] = 'short'
                    else:
                        position['side'] = 'closed'
            
            # Calculate portfolio totals
            total_market_value = sum(p.get('market_value', 0) or 0 for p in all_positions)
            total_cost = sum(p.get('total_cost', 0) for p in all_positions)
            total_realized_pl = sum(p.get('realized_pl', 0) for p in all_positions)
            total_unrealized_pl = sum(p.get('unrealized_pl', 0) or 0 for p in all_positions)
            total_fees = sum(p.get('total_fees', 0) for p in all_positions)
            
            # Calculate percentages for each position
            for position in all_positions:
                market_value = position.get('market_value', 0) or 0
                
                # Percentage of total portfolio
                if total_market_value > 0:
                    position['percent_of_portfolio'] = (market_value / total_market_value) * 100
                else:
                    position['percent_of_portfolio'] = 0.0
                
                # Percentage of account
                # Total account value = cash balance + market value of all positions
                account_id = position['trading_account_id']
                
                # Get account cash balance (base currency total)
                try:
                    activity_data = AccountActivityService.get_account_activity(
                        db=db,
                        account_id=account_id,
                        start_date=None,
                        end_date=None
                    )
                    cash_balance = activity_data.get('base_currency_total', 0.0) or 0.0
                except Exception as e:
                    logger.warning(f"Error getting account balance for account {account_id}: {str(e)}")
                    cash_balance = 0.0
                
                # Sum market value of all positions for this account
                account_positions = [p for p in all_positions if p['trading_account_id'] == account_id]
                account_positions_value = sum(p.get('market_value', 0) or 0 for p in account_positions)
                
                # Total account value = cash balance + positions value
                account_total_value = cash_balance + account_positions_value
                
                # Use absolute value to handle negative balances
                account_total_value_abs = abs(account_total_value)
                if account_total_value_abs > 0:
                    position['percent_of_account'] = (market_value / account_total_value_abs) * 100
                else:
                    position['percent_of_account'] = 0.0
                
                # Percentage of same investment type (only if has trade_plan)
                if position['linked_trade_plan_ids']:
                    # Get investment types from trade plans
                    trade_plans = db.query(TradePlan).filter(
                        TradePlan.id.in_(position['linked_trade_plan_ids'])
                    ).all()
                    
                    if trade_plans:
                        investment_types = set(tp.investment_type for tp in trade_plans)
                        
                        # Find all positions with same investment type
                        # Need to get all trade plans once and check membership
                        all_trade_plan_ids_with_types = {}
                        for tp in db.query(TradePlan).filter(
                            TradePlan.id.in_([plan_id for p in all_positions for plan_id in p.get('linked_trade_plan_ids', [])])
                        ).all():
                            all_trade_plan_ids_with_types[tp.id] = tp.investment_type
                        
                        same_type_positions = [
                            p for p in all_positions
                            if p['linked_trade_plan_ids'] and any(
                                all_trade_plan_ids_with_types.get(plan_id) in investment_types
                                for plan_id in p['linked_trade_plan_ids']
                            )
                        ]
                        
                        same_type_total = sum(p.get('market_value', 0) or 0 for p in same_type_positions)
                        if same_type_total > 0:
                            position['percent_of_same_type'] = (market_value / same_type_total) * 100
                        else:
                            position['percent_of_same_type'] = None
                    else:
                        position['percent_of_same_type'] = None
                else:
                    position['percent_of_same_type'] = None
            
            diagnostics['positions_count'] = len(all_positions)
            summary = {
                'positions': all_positions,
                'summary': {
                    'total_positions': len(all_positions),
                    'total_market_value': total_market_value,
                    'total_cost': total_cost,
                    'total_realized_pl': total_realized_pl,
                    'total_unrealized_pl': total_unrealized_pl,
                    'total_pl': total_realized_pl + total_unrealized_pl,
                    'total_fees': total_fees,
                    'total_pl_percent': ((total_realized_pl + total_unrealized_pl) / total_cost * 100) if total_cost > 0 else 0.0
                }
            }
            
            summary['diagnostics'] = diagnostics
            
            logger.info(f"Calculated portfolio summary: {len(all_positions)} positions, total value: {total_market_value}")
            return summary
            
        except Exception as e:
            logger.error(f"Error calculating portfolio summary: {str(e)}")
            return {
                'positions': [],
                'summary': {
                    'total_positions': 0,
                    'total_market_value': 0,
                    'total_cost': 0,
                    'total_realized_pl': 0,
                    'total_unrealized_pl': 0,
                    'total_pl': 0,
                    'total_fees': 0,
                    'total_pl_percent': 0.0
                }
            }
    
    @staticmethod
    def get_position_details(
        db: Session,
        trading_account_id: int,
        ticker_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed position information including linked executions
        
        Args:
            db: Database session
            trading_account_id: Trading account ID
            ticker_id: Ticker ID
            
        Returns:
            Dict with position details including executions list
        """
        try:
            position = PositionPortfolioService.calculate_position_by_ticker_account(
                db, trading_account_id, ticker_id, include_market_data=True
            )
            
            if not position:
                return None
            
            # Get all executions for this position
            executions = db.query(Execution).filter(
                and_(
                    Execution.ticker_id == ticker_id,
                    Execution.trading_account_id == trading_account_id
                )
            ).order_by(Execution.date.asc(), Execution.created_at.asc()).all()
            
            position['executions'] = [exec.to_dict() for exec in executions]
            
            return position
            
        except Exception as e:
            logger.error(f"Error getting position details for account {trading_account_id}, ticker {ticker_id}: {str(e)}")
            return None

