"""
Trade Aggregation Service - TikTrack
מערכת כללית לאגרגציית נתוני טריידים

תאריך: 06/12/2025
גרסה: 1.0.0
מטרה: מערכת כללית לאגרגציית נתוני טריידים מלאים לשימושים שונים
      (AI Analysis, דוחות, סטטיסטיקות, וכו')
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from models.trade import Trade
from models.execution import Execution
from models.trade_plan import TradePlan
from models.trade_condition import TradeCondition
from models.plan_condition import PlanCondition
from services.position_calculator_service import PositionCalculatorService
from services.position_portfolio_service import PositionPortfolioService
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)


class TradeAggregationService:
    """
    Service for aggregating comprehensive trade data
    
    This service provides a unified interface for collecting complete trade information
    including executions, trade plans, conditions, and position data.
    
    Used for:
    - AI Analysis (portfolio performance, technical analysis, risk assessment)
    - Reports and statistics
    - Future dashboard widgets
    """
    
    def __init__(self):
        self.position_calculator = PositionCalculatorService()
        self.logger = logger
    
    @staticmethod
    def aggregate_trades(
        db: Session,
        user_id: int,
        trade_id: Optional[int] = None,
        trade_ids: Optional[List[int]] = None,
        ticker_id: Optional[int] = None,
        ticker_symbol: Optional[str] = None,
        trading_account_id: Optional[int] = None,
        investment_type: Optional[str] = None,
        trading_method_id: Optional[int] = None,
        status: Optional[str] = None,
        status_list: Optional[List[str]] = None,
        side: Optional[str] = None,
        date_range_start: Optional[datetime] = None,
        date_range_end: Optional[datetime] = None,
        date_field: str = 'created_at',  # 'created_at' or 'closed_at'
        include_closed: bool = True,
        include_cancelled: bool = False,
        enrich_with_position: bool = True,
        enrich_with_market_data: bool = False
    ) -> Dict[str, Any]:
        """
        Aggregate trades with all related data based on filters
        
        Args:
            db: Database session
            user_id: User ID (required)
            trade_ids: Specific trade IDs to include
            ticker_id: Filter by ticker ID
            ticker_symbol: Filter by ticker symbol
            trading_account_id: Filter by trading account
            investment_type: Filter by investment type
            trading_method_id: Filter by trading method (via conditions)
            status: Filter by single status
            status_list: Filter by multiple statuses
            side: Filter by side (Long/Short)
            date_range_start: Start date for date range filter
            date_range_end: End date for date range filter
            date_field: Which date field to use for filtering ('created_at' or 'closed_at')
            include_closed: Include closed trades
            include_cancelled: Include cancelled trades
            enrich_with_position: Calculate position data for each trade
            enrich_with_market_data: Include market price data in positions
            
        Returns:
            Dict with enriched trades and aggregate summary
        """
        try:
            # Build base query with eager loading
            query = db.query(Trade).options(
                joinedload(Trade.account),
                joinedload(Trade.ticker),
                joinedload(Trade.trade_plan).joinedload(TradePlan.conditions).joinedload(PlanCondition.method),
                joinedload(Trade.executions),
                joinedload(Trade.conditions).joinedload(TradeCondition.method)
            )
            
            # Always filter by user_id
            query = query.filter(Trade.user_id == user_id)
            
            # Apply filters
            # Handle single trade_id or multiple trade_ids
            if trade_id:
                query = query.filter(Trade.id == trade_id)
            elif trade_ids:
                query = query.filter(Trade.id.in_(trade_ids))
            
            if ticker_id:
                query = query.filter(Trade.ticker_id == ticker_id)
            
            if ticker_symbol:
                # Need to join with ticker to filter by symbol
                from models.ticker import Ticker
                query = query.join(Ticker).filter(Ticker.symbol == ticker_symbol)
            
            if trading_account_id:
                query = query.filter(Trade.trading_account_id == trading_account_id)
            
            if investment_type:
                query = query.filter(Trade.investment_type == investment_type)
            
            if side:
                query = query.filter(Trade.side == side)
            
            # Status filtering
            if status:
                query = query.filter(Trade.status == status)
            elif status_list:
                query = query.filter(Trade.status.in_(status_list))
            else:
                statuses = ['open']
                if include_closed:
                    statuses.append('closed')
                if include_cancelled:
                    statuses.append('cancelled')
                query = query.filter(Trade.status.in_(statuses))
            
            # Date range filtering
            if date_range_start:
                if date_field == 'closed_at':
                    query = query.filter(Trade.closed_at >= date_range_start)
                else:
                    query = query.filter(Trade.created_at >= date_range_start)
            
            if date_range_end:
                if date_field == 'closed_at':
                    query = query.filter(Trade.closed_at <= date_range_end)
                else:
                    query = query.filter(Trade.created_at <= date_range_end)
            
            # Execute query
            trades = query.order_by(Trade.created_at.desc()).all()
            
            # Filter by trading_method_id if provided (must check conditions)
            if trading_method_id and trades:
                filtered_trades = []
                for trade in trades:
                    # Check trade conditions
                    has_method = False
                    if trade.conditions:
                        for condition in trade.conditions:
                            if condition.method_id == trading_method_id:
                                has_method = True
                                break
                    
                    # Also check trade plan conditions
                    if not has_method and trade.trade_plan and trade.trade_plan.conditions:
                        for condition in trade.trade_plan.conditions:
                            if condition.method_id == trading_method_id:
                                has_method = True
                                break
                    
                    if has_method:
                        filtered_trades.append(trade)
                trades = filtered_trades
            
            logger.info(f"Aggregated {len(trades)} trades for user {user_id}")
            
            # Enrich trades with additional data
            enriched_trades = []
            for trade in trades:
                enriched = TradeAggregationService._enrich_trade_data(
                    db, trade, enrich_with_position, enrich_with_market_data
                )
                enriched_trades.append(enriched)
            
            # Calculate aggregate summary
            summary = TradeAggregationService._calculate_aggregate_summary(enriched_trades)
            
            # Build filters_applied dict for tracking
            filters_applied = {}
            if ticker_id:
                filters_applied['ticker_id'] = ticker_id
            if ticker_symbol:
                filters_applied['ticker_symbol'] = ticker_symbol
            if trading_account_id:
                filters_applied['trading_account_id'] = trading_account_id
            if investment_type:
                filters_applied['investment_type'] = investment_type
            if trading_method_id:
                filters_applied['trading_method_id'] = trading_method_id
            if date_range_start:
                filters_applied['date_range_start'] = date_range_start.isoformat()
            if date_range_end:
                filters_applied['date_range_end'] = date_range_end.isoformat()
            
            return {
                'trades': enriched_trades,
                'aggregate_summary': summary,
                'filters_applied': filters_applied,
                'total_trades': len(enriched_trades)
            }
            
        except Exception as e:
            logger.error(f"Error aggregating trades: {str(e)}", exc_info=True)
            return {
                'trades': [],
                'aggregate_summary': {},
                'filters_applied': {},
                'total_trades': 0,
                'error': str(e)
            }
    
    @staticmethod
    def _enrich_trade_data(
        db: Session,
        trade: Trade,
        include_position: bool = True,
        include_market_data: bool = False
    ) -> Dict[str, Any]:
        """
        Enrich a single trade with all related data
        
        Args:
            db: Database session
            trade: Trade object (should have relationships loaded)
            include_position: Calculate position data
            include_market_data: Include market price in position
            
        Returns:
            Enriched trade data dict
        """
        try:
            # Basic trade data
            trade_dict = {
                'trade': {
                    'id': trade.id,
                    'ticker': {
                        'id': trade.ticker_id,
                        'symbol': trade.ticker.symbol if trade.ticker else f'Ticker_{trade.ticker_id}',
                        'name': trade.ticker.name if trade.ticker and hasattr(trade.ticker, 'name') else None
                    } if trade.ticker else {'id': trade.ticker_id, 'symbol': f'Ticker_{trade.ticker_id}'},
                    'account': {
                        'id': trade.trading_account_id,
                        'name': trade.account.name if trade.account else f'Account_{trade.trading_account_id}'
                    } if trade.account else {'id': trade.trading_account_id, 'name': f'Account_{trade.trading_account_id}'},
                    'status': trade.status,
                    'investment_type': trade.investment_type,
                    'side': trade.side,
                    'planned_quantity': trade.planned_quantity,
                    'planned_amount': trade.planned_amount,
                    'entry_price': trade.entry_price,
                    'total_pl': trade.total_pl or 0.0,
                    'opened_at': trade.created_at.isoformat() if trade.created_at else None,
                    'closed_at': trade.closed_at.isoformat() if trade.closed_at else None,
                    'cancelled_at': trade.cancelled_at.isoformat() if trade.cancelled_at else None,
                    'cancel_reason': trade.cancel_reason,
                    'notes': trade.notes
                },
                'executions': [],
                'trade_plan': None,
                'conditions': [],
                'position': None,
                'summary': {}
            }
            
            # Executions
            if trade.executions:
                executions = sorted(trade.executions, key=lambda e: (e.date or e.created_at) if e.date else e.created_at)
                trade_dict['executions'] = [
                    {
                        'id': exec.id,
                        'action': exec.action,
                        'date': exec.date.isoformat() if exec.date else (exec.created_at.isoformat() if exec.created_at else None),
                        'quantity': float(exec.quantity),
                        'price': float(exec.price),
                        'fee': float(exec.fee or 0),
                        'realized_pl': float(exec.realized_pl) if exec.realized_pl is not None else None,
                        'mtm_pl': float(exec.mtm_pl) if exec.mtm_pl is not None else None,
                        'notes': exec.notes,
                        'source': exec.source
                    }
                    for exec in executions
                ]
            
            # Trade Plan
            if trade.trade_plan:
                plan = trade.trade_plan
                plan_conditions = []
                if plan.conditions:
                    for condition in plan.conditions:
                        method_dict = None
                        if condition.method:
                            method_dict = {
                                'id': condition.method.id,
                                'name_en': condition.method.name_en if hasattr(condition.method, 'name_en') else None,
                                'name_he': condition.method.name_he if hasattr(condition.method, 'name_he') else None
                            }
                        
                        plan_conditions.append({
                            'id': condition.id,
                            'method': method_dict,
                            'parameters': condition.get_parameters() if hasattr(condition, 'get_parameters') else {},
                            'trigger_action': condition.trigger_action if hasattr(condition, 'trigger_action') else None,
                            'is_active': condition.is_active if hasattr(condition, 'is_active') else True
                        })
                
                trade_dict['trade_plan'] = {
                    'id': plan.id,
                    'planned_amount': float(plan.planned_amount) if plan.planned_amount else None,
                    'entry_price': float(plan.entry_price) if plan.entry_price else None,
                    'target_price': float(plan.target_price) if plan.target_price else None,
                    'stop_price': float(plan.stop_price) if plan.stop_price else None,
                    'target_percentage': float(plan.target_percentage) if plan.target_percentage else None,
                    'stop_percentage': float(plan.stop_percentage) if plan.stop_percentage else None,
                    'reasons': plan.reasons,
                    'entry_conditions': plan.entry_conditions,
                    'notes': plan.notes,
                    'status': plan.status,
                    'conditions': plan_conditions
                }
            
            # Trade Conditions
            if trade.conditions:
                for condition in trade.conditions:
                    method_dict = None
                    if condition.method:
                        method_dict = {
                            'id': condition.method.id,
                            'name_en': condition.method.name_en if hasattr(condition.method, 'name_en') else None,
                            'name_he': condition.method.name_he if hasattr(condition.method, 'name_he') else None
                        }
                    
                    trade_dict['conditions'].append({
                        'id': condition.id,
                        'method': method_dict,
                        'parameters': condition.get_parameters() if hasattr(condition, 'get_parameters') else {},
                        'trigger_action': condition.trigger_action if hasattr(condition, 'trigger_action') else None,
                        'is_active': condition.is_active if hasattr(condition, 'is_active') else True,
                        'auto_generate_alerts': condition.auto_generate_alerts if hasattr(condition, 'auto_generate_alerts') else False
                    })
            
            # Position data
            if include_position:
                position = PositionCalculatorService().calculate_position(db, trade.id)
                if position and include_market_data:
                    # Enhance with market data
                    position_data = PositionPortfolioService.calculate_position_by_ticker_account(
                        db, trade.trading_account_id, trade.ticker_id, include_market_data=True
                    )
                    if position_data:
                        position.update({
                            'current_price': position_data.get('market_price'),
                            'market_value': position_data.get('market_value'),
                            'unrealized_pl': position_data.get('unrealized_pl'),
                            'unrealized_pl_percent': position_data.get('unrealized_pl_percent')
                        })
                trade_dict['position'] = position
            
            # Summary
            trade_dict['summary'] = TradeAggregationService._calculate_trade_summary(trade_dict)
            
            return trade_dict
            
        except Exception as e:
            logger.error(f"Error enriching trade {trade.id}: {str(e)}", exc_info=True)
            return {
                'trade': {'id': trade.id, 'error': str(e)},
                'executions': [],
                'trade_plan': None,
                'conditions': [],
                'position': None,
                'summary': {}
            }
    
    @staticmethod
    def _calculate_trade_summary(trade_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate summary statistics for a single trade"""
        executions = trade_dict.get('executions', [])
        position = trade_dict.get('position', {})
        trade = trade_dict.get('trade', {})
        
        total_executions = len(executions)
        total_fees = sum(float(e.get('fee', 0)) for e in executions)
        
        # Calculate holding period
        holding_period_days = None
        opened_at = trade.get('opened_at')
        closed_at = trade.get('closed_at')
        if opened_at:
            try:
                opened = datetime.fromisoformat(opened_at.replace('Z', '+00:00'))
                end_date = datetime.fromisoformat(closed_at.replace('Z', '+00:00')) if closed_at else datetime.now()
                holding_period_days = (end_date - opened).days
            except:
                pass
        
        # Average entry price from executions
        buy_executions = [e for e in executions if e.get('action') in ['buy', 'short']]
        avg_entry_price = None
        if buy_executions:
            total_qty = sum(float(e.get('quantity', 0)) for e in buy_executions)
            total_cost = sum(float(e.get('quantity', 0)) * float(e.get('price', 0)) + float(e.get('fee', 0)) for e in buy_executions)
            if total_qty > 0:
                avg_entry_price = total_cost / total_qty
        
        # Current exit price (from last sell or position)
        current_exit_price = None
        sell_executions = [e for e in executions if e.get('action') in ['sell', 'cover']]
        if sell_executions:
            last_sell = max(sell_executions, key=lambda e: e.get('date', ''))
            current_exit_price = float(last_sell.get('price', 0))
        elif position and position.get('current_price'):
            current_exit_price = float(position.get('current_price'))
        
        return {
            'total_executions': total_executions,
            'total_fees': total_fees,
            'holding_period_days': holding_period_days,
            'avg_entry_price': avg_entry_price,
            'current_exit_price': current_exit_price
        }
    
    @staticmethod
    def _calculate_aggregate_summary(enriched_trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate aggregate summary statistics"""
        if not enriched_trades:
            return {
                'total_trades': 0,
                'total_pl': 0.0,
                'realized_pl': 0.0,
                'unrealized_pl': 0.0,
                'total_fees': 0.0,
                'win_rate': 0.0,
                'avg_holding_period': 0.0
            }
        
        total_trades = len(enriched_trades)
        total_pl = sum(float(t.get('trade', {}).get('total_pl', 0) or 0) for t in enriched_trades)
        
        # Separate realized and unrealized
        closed_trades = [t for t in enriched_trades if t.get('trade', {}).get('status') == 'closed']
        open_trades = [t for t in enriched_trades if t.get('trade', {}).get('status') == 'open']
        
        realized_pl = sum(float(t.get('trade', {}).get('total_pl', 0) or 0) for t in closed_trades)
        unrealized_pl = sum(float(t.get('position', {}).get('unrealized_pl', 0) or 0) for t in open_trades if t.get('position'))
        
        total_fees = sum(t.get('summary', {}).get('total_fees', 0) for t in enriched_trades)
        
        # Win rate (from closed trades)
        winning_trades = [t for t in closed_trades if (t.get('trade', {}).get('total_pl', 0) or 0) > 0]
        win_rate = len(winning_trades) / len(closed_trades) if closed_trades else 0.0
        
        # Average holding period
        holding_periods = [t.get('summary', {}).get('holding_period_days') for t in enriched_trades if t.get('summary', {}).get('holding_period_days')]
        avg_holding_period = sum(holding_periods) / len(holding_periods) if holding_periods else 0.0
        
        return {
            'total_trades': total_trades,
            'total_pl': total_pl,
            'realized_pl': realized_pl,
            'unrealized_pl': unrealized_pl,
            'total_fees': total_fees,
            'win_rate': win_rate,
            'avg_holding_period': avg_holding_period,
            'closed_trades_count': len(closed_trades),
            'open_trades_count': len(open_trades),
            'winning_trades_count': len(winning_trades)
        }
    
    @staticmethod
    def format_trades_for_ai(enriched_data: Dict[str, Any]) -> str:
        """
        Format enriched trade data for AI analysis (readable text format)
        
        Args:
            enriched_data: Result from aggregate_trades()
            
        Returns:
            Formatted string for AI prompt
        """
        trades = enriched_data.get('trades', [])
        summary = enriched_data.get('aggregate_summary', {})
        filters = enriched_data.get('filters_applied', {})
        
        if not trades:
            return "No trades found matching the specified criteria."
        
        lines = []
        # Note: "=== TRADING DATA ===" header is already in the template
        
        # Add filter info if present
        if filters:
            lines.append("Filters Applied:")
            for key, value in filters.items():
                lines.append(f"- {key}: {value}")
            lines.append("")
        
        lines.append(f"Total Trades Analyzed: {summary.get('total_trades', 0)}")
        
        # Add date range if available
        if filters.get('date_range_start') or filters.get('date_range_end'):
            start = filters.get('date_range_start', 'All time')
            end = filters.get('date_range_end', 'Present')
            lines.append(f"Period: {start} to {end}")
        
        lines.append("")
        
        # Format each trade
        for idx, trade_data in enumerate(trades, 1):
            trade = trade_data.get('trade', {})
            ticker = trade.get('ticker', {})
            executions = trade_data.get('executions', [])
            trade_plan = trade_data.get('trade_plan')
            conditions = trade_data.get('conditions', [])
            position = trade_data.get('position', {})
            trade_summary = trade_data.get('summary', {})
            
            lines.append(f"Trade #{idx} (ID: {trade.get('id')}):")
            lines.append(f"- Status: {trade.get('status', 'Unknown')}")
            lines.append(f"- Ticker: {ticker.get('symbol', 'N/A')} ({ticker.get('name', '')})")
            lines.append(f"- Investment Type: {trade.get('investment_type', 'N/A')}")
            lines.append(f"- Side: {trade.get('side', 'N/A')}")
            
            # Planned vs actual
            if trade.get('entry_price'):
                lines.append(f"- Planned Entry: ${trade.get('entry_price'):.2f}")
            
            if trade_summary.get('avg_entry_price'):
                lines.append(f"- Actual Entry: ${trade_summary.get('avg_entry_price'):.2f} (via {trade_summary.get('total_executions', 0)} executions)")
            
            # Position
            if position:
                qty = position.get('quantity', 0)
                avg_cost = position.get('average_price', 0)
                lines.append(f"- Current Position: {qty:.2f} shares @ ${avg_cost:.2f} avg cost")
                
                if position.get('current_price'):
                    current_price = position.get('current_price')
                    unrealized = position.get('unrealized_pl', 0)
                    unrealized_pct = position.get('unrealized_pl_percent', 0)
                    lines.append(f"- Current Price: ${current_price:.2f}")
                    lines.append(f"- Unrealized P/L: ${unrealized:.2f} ({unrealized_pct:+.2f}%)")
            
            if trade.get('total_pl') is not None:
                lines.append(f"- Total P/L: ${trade.get('total_pl'):.2f}")
            
            if trade_summary.get('total_fees'):
                lines.append(f"- Total Fees: ${trade_summary.get('total_fees'):.2f}")
            
            # Executions
            if executions:
                lines.append("")
                lines.append("Executions:")
                for exec in executions:
                    action = exec.get('action', '').upper()
                    date = exec.get('date', 'N/A')
                    qty = exec.get('quantity', 0)
                    price = exec.get('price', 0)
                    fee = exec.get('fee', 0)
                    lines.append(f"  {date}: {action} {qty:.2f} shares @ ${price:.2f} (Fee: ${fee:.2f})")
            
            # Trade Plan
            if trade_plan:
                lines.append("")
                lines.append("Trade Plan:")
                if trade_plan.get('target_price'):
                    entry = trade_plan.get('entry_price') or trade.get('entry_price') or 0
                    target = trade_plan.get('target_price')
                    if entry > 0:
                        pct = ((target - entry) / entry) * 100
                        lines.append(f"- Target Price: ${target:.2f} ({pct:+.1f}% from entry)")
                
                if trade_plan.get('stop_price'):
                    entry = trade_plan.get('entry_price') or trade.get('entry_price') or 0
                    stop = trade_plan.get('stop_price')
                    if entry > 0:
                        pct = ((stop - entry) / entry) * 100
                        lines.append(f"- Stop Price: ${stop:.2f} ({pct:+.1f}% from entry)")
                
                if trade_plan.get('reasons'):
                    lines.append(f"- Reasons: {trade_plan.get('reasons')}")
                
                if trade_plan.get('entry_conditions'):
                    lines.append(f"- Entry Conditions: {trade_plan.get('entry_conditions')}")
                
                # Plan conditions
                if trade_plan.get('conditions'):
                    lines.append("- Plan Conditions:")
                    for cond in trade_plan.get('conditions', []):
                        method = cond.get('method', {})
                        method_name = method.get('name_en') or method.get('name_he') or 'Unknown'
                        params = cond.get('parameters', {})
                        lines.append(f"  - {method_name}: {params}")
            
            # Trade conditions
            if conditions:
                lines.append("")
                lines.append("Trade Conditions:")
                for cond in conditions:
                    method = cond.get('method', {})
                    method_name = method.get('name_en') or method.get('name_he') or 'Unknown'
                    params = cond.get('parameters', {})
                    action = cond.get('trigger_action', 'N/A')
                    lines.append(f"  - {method_name} ({action}): {params}")
            
            lines.append("")
            lines.append("---")
            lines.append("")
        
        # Add summary
        lines.append("Summary:")
        lines.append(f"- Total Trades: {summary.get('total_trades', 0)}")
        if summary.get('closed_trades_count', 0) > 0:
            lines.append(f"- Winning Trades: {summary.get('winning_trades_count', 0)} ({summary.get('win_rate', 0) * 100:.1f}% win rate)")
        lines.append(f"- Total P/L: ${summary.get('total_pl', 0):.2f}")
        lines.append(f"- Realized P/L: ${summary.get('realized_pl', 0):.2f}")
        lines.append(f"- Unrealized P/L: ${summary.get('unrealized_pl', 0):.2f}")
        lines.append(f"- Total Fees: ${summary.get('total_fees', 0):.2f}")
        if summary.get('avg_holding_period'):
            lines.append(f"- Average Holding Period: {summary.get('avg_holding_period', 0):.1f} days")
        
        return "\n".join(lines)

