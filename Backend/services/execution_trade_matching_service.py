"""
Execution Trade Matching Service
Service for suggesting trades to match with executions

This service provides intelligent trade suggestions for executions based on:
- Ticker match (required)
- Trading account match (if execution has account)
- Date range match (execution date within trade date range)
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from models.execution import Execution
from models.trade import Trade

logger = logging.getLogger(__name__)


class ExecutionTradeMatchingService:
    """Service for matching executions to trades"""
    
    @staticmethod
    def suggest_trades_for_execution(
        db: Session,
        execution: Execution,
        max_suggestions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Suggest trades for an execution based on matching criteria
        
        Scoring system:
        - Score 100: Perfect match (ticker + account + date in range)
        - Score 70: Good match (ticker + account + date close)
        - Score 50: Basic match (ticker only)
        
        Args:
            db: Database session
            execution: Execution object to find matches for
            max_suggestions: Maximum number of suggestions to return
            
        Returns:
            List of trade suggestions with scores, sorted by score descending
        """
        if not execution.ticker_id:
            logger.warning(f"Execution {execution.id} has no ticker_id - cannot suggest trades")
            return []
        
        logger.info(f"Finding trade suggestions for execution {execution.id} (ticker_id={execution.ticker_id})")
        
        # Base query: trades with matching ticker
        query = db.query(Trade).options(
            joinedload(Trade.ticker),
            joinedload(Trade.account)
        ).filter(
            Trade.ticker_id == execution.ticker_id
        )
        
        # Get all matching trades
        matching_trades = query.all()
        logger.info(f"Found {len(matching_trades)} trades with matching ticker")
        
        if not matching_trades:
            return []
        
        # Score each trade
        suggestions = []
        for trade in matching_trades:
            score = ExecutionTradeMatchingService._calculate_match_score(
                execution, trade
            )
            
            # Only include trades with score >= 50
            if score >= 50:
                suggestion = {
                    'trade_id': trade.id,
                    'score': score,
                    'ticker_id': trade.ticker_id,
                    'ticker_symbol': trade.ticker.symbol if trade.ticker else None,
                    'trading_account_id': trade.trading_account_id,
                    'account_name': trade.account.name if trade.account else None,
                    'status': trade.status,
                    'side': trade.side,
                    'investment_type': trade.investment_type,
                    'created_at': trade.created_at,
                    'trade_created_at': trade.created_at,
                    'closed_at': trade.closed_at,
                    'trade_closed_at': trade.closed_at,
                    'execution_date': execution.date,
                    'match_reasons': ExecutionTradeMatchingService._get_match_reasons(
                        execution, trade, score
                    )
                }
                suggestions.append(suggestion)
        
        # Sort by score descending
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top suggestions
        return suggestions[:max_suggestions]
    
    @staticmethod
    def _calculate_match_score(execution: Execution, trade: Trade) -> int:
        """
        Calculate match score between execution and trade
        
        Scoring:
        - Ticker match: base requirement (always present if we got here)
        - Account match: +30 points (if execution has account and matches)
        - Date in range: +20 points (execution date within trade date range)
        - Date close: +10 points (execution date within 7 days of trade range)
        
        Args:
            execution: Execution object
            trade: Trade object
            
        Returns:
            Score (50-100)
        """
        score = 50  # Base score for ticker match
        
        # Account match (if execution has account)
        if execution.trading_account_id and execution.trading_account_id == trade.trading_account_id:
            score += 30
            logger.debug(f"Account match: execution.account={execution.trading_account_id}, trade.account={trade.trading_account_id}")
        
        # Date range check
        execution_date = execution.date
        trade_start = trade.created_at if trade.created_at else datetime.min
        trade_end = trade.closed_at if trade.closed_at else datetime.max
        
        if execution_date >= trade_start and execution_date <= trade_end:
            # Perfect date match
            score += 20
            logger.debug(f"Date in range: execution.date={execution_date}, trade range=[{trade_start}, {trade_end}]")
        else:
            # Check if date is close (within 7 days)
            date_diff_start = abs((execution_date - trade_start).days)
            date_diff_end = abs((execution_date - trade_end).days) if trade.closed_at else float('inf')
            min_diff = min(date_diff_start, date_diff_end)
            
            if min_diff <= 7:
                score += 10
                logger.debug(f"Date close: execution.date={execution_date}, closest trade date diff={min_diff} days")
        
        return score
    
    @staticmethod
    def _get_match_reasons(execution: Execution, trade: Trade, score: int) -> List[str]:
        """
        Get human-readable reasons for the match
        
        Args:
            execution: Execution object
            trade: Trade object
            score: Match score
            
        Returns:
            List of match reason strings
        """
        reasons = []
        
        # Ticker match (always present)
        reasons.append("טיקר תואם")
        
        # Account match
        if execution.trading_account_id and execution.trading_account_id == trade.trading_account_id:
            reasons.append("חשבון מסחר תואם")
        
        # Date match
        execution_date = execution.date
        trade_start = trade.created_at if trade.created_at else datetime.min
        trade_end = trade.closed_at if trade.closed_at else datetime.max
        
        if execution_date >= trade_start and execution_date <= trade_end:
            reasons.append("תאריך בטווח הטרייד")
        else:
            date_diff_start = abs((execution_date - trade_start).days)
            date_diff_end = abs((execution_date - trade_end).days) if trade.closed_at else float('inf')
            min_diff = min(date_diff_start, date_diff_end)
            
            if min_diff <= 7:
                reasons.append(f"תאריך קרוב ({min_diff} ימים)")
        
        return reasons
    
    @staticmethod
    def get_pending_executions(db: Session) -> List[Execution]:
        """
        Get all executions without trade assignment
        
        Args:
            db: Database session
            
        Returns:
            List of executions with ticker_id but no trade_id
        """
        executions = db.query(Execution).options(
            joinedload(Execution.ticker),
            joinedload(Execution.trading_account)
        ).filter(
            Execution.trade_id.is_(None)
        ).order_by(Execution.date.desc()).all()
        
        logger.info(f"Found {len(executions)} executions pending trade assignment")
        return executions
    
    @staticmethod
    def suggest_trades_for_all_pending(
        db: Session,
        max_suggestions_per_execution: int = 5
    ) -> Dict[int, List[Dict[str, Any]]]:
        """
        Get trade suggestions for all pending executions
        
        Args:
            db: Database session
            max_suggestions_per_execution: Maximum suggestions per execution
            
        Returns:
            Dictionary mapping execution_id to list of suggestions
        """
        pending_executions = ExecutionTradeMatchingService.get_pending_executions(db)
        
        result = {}
        for execution in pending_executions:
            suggestions = ExecutionTradeMatchingService.suggest_trades_for_execution(
                db, execution, max_suggestions_per_execution
            )
            if suggestions:
                result[execution.id] = suggestions
        
        logger.info(f"Generated suggestions for {len(result)} executions")
        return result

    @staticmethod
    def get_pending_execution_highlights(
        db: Session,
        max_items: int = 5,
        max_suggestions_per_execution: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Build highlight data for pending executions with best trade suggestions.

        Args:
            db: Database session
            max_items: Maximum number of highlight cards to return
            max_suggestions_per_execution: Suggestions evaluated per execution

        Returns:
            List of highlight dictionaries sorted by score (descending)
        """
        pending_executions = ExecutionTradeMatchingService.get_pending_executions(db)
        highlights: List[Dict[str, Any]] = []

        for execution in pending_executions:
            suggestions = ExecutionTradeMatchingService.suggest_trades_for_execution(
                db,
                execution,
                max_suggestions=max_suggestions_per_execution
            )

            if not suggestions:
                continue

            primary_suggestion = suggestions[0]
            highlight: Dict[str, Any] = {
                "execution_id": execution.id,
                "execution": execution.to_dict(),
                "primary_suggestion": primary_suggestion,
                "suggestions": suggestions,
                "suggestion_count": len(suggestions),
                "additional_suggestions": max(len(suggestions) - 1, 0),
                "best_score": primary_suggestion.get("score"),
            }
            highlights.append(highlight)

        highlights.sort(key=lambda item: item.get("best_score", 0) or 0, reverse=True)

        if max_items and max_items > 0:
            return highlights[:max_items]
        return highlights

