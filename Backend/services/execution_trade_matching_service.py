"""
Execution Trade Matching Service
Service for suggesting trades to match with executions

This service provides intelligent trade suggestions for executions based on:
- Ticker match (required)
- Trading account match (if execution has account)
- Date range match (execution date within trade date range)
"""

import logging
from collections import defaultdict
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

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

    @staticmethod
    def get_execution_trade_creation_clusters(
        db: Session,
        max_items: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Cluster executions (ticker/account/action) for quick trade creation."""

        pending_executions = ExecutionTradeMatchingService.get_pending_executions(db)
        clusters: Dict[Tuple[int, Optional[int], str], Dict[str, Any]] = {}

        for execution in pending_executions:
            side = ExecutionTradeMatchingService._map_execution_action_to_trade_side(execution.action)
            normalized_action = (execution.action or 'buy').lower()
            account_id = execution.trading_account_id
            cluster_key = (execution.ticker_id, account_id, side)

            if cluster_key not in clusters:
                ticker = execution.ticker
                trading_account = execution.trading_account
                cluster = {
                    "cluster_id": f"{execution.ticker_id}-{account_id or 'none'}-{side}",
                    "ticker": {
                        "id": execution.ticker_id,
                        "symbol": ticker.symbol if ticker else None,
                        "name": ticker.name if ticker else None,
                        "type": ticker.type if ticker else None
                    },
                    "trading_account": {
                        "id": account_id,
                        "name": trading_account.name if trading_account else None,
                        "currency_id": trading_account.currency_id if trading_account else None
                    },
                    "action": normalized_action,
                    "side": side,
                    "executions": [],
                    "execution_ids": [],
                    "stats": {
                        "total_quantity": 0.0,
                        "total_value": 0.0,
                        "total_fee": 0.0,
                        "earliest_date": None,
                        "latest_date": None
                    },
                    "meta": {
                        "source_counts": defaultdict(int),
                        "notes": []
                    }
                }
                clusters[cluster_key] = cluster

            cluster = clusters[cluster_key]
            stats = cluster["stats"]
            meta = cluster["meta"]

            execution_dict = execution.to_dict()
            quantity = execution.quantity or 0
            price = execution.price or 0
            execution_value = quantity * price
            fee = execution.fee or 0
            execution_dict["value"] = execution_value
            execution_dict["side"] = side
            execution_dict["normalized_action"] = normalized_action
            execution_dict["selected"] = True

            cluster["executions"].append(execution_dict)
            cluster["execution_ids"].append(execution.id)

            stats["total_quantity"] += quantity
            stats["total_value"] += execution_value
            stats["total_fee"] += fee or 0

            execution_date = execution.date
            if execution_date:
                if stats["earliest_date"] is None or execution_date < stats["earliest_date"]:
                    stats["earliest_date"] = execution_date
                if stats["latest_date"] is None or execution_date > stats["latest_date"]:
                    stats["latest_date"] = execution_date

            source_value = (execution.source or 'manual').lower()
            meta["source_counts"][source_value] += 1

            if execution.notes:
                note_text = execution.notes.strip()
                if note_text:
                    meta["notes"].append(note_text)

        clusters_list: List[Dict[str, Any]] = []
        for cluster in clusters.values():
            stats = cluster["stats"]
            meta = cluster.pop("meta", {"source_counts": defaultdict(int), "notes": []})

            total_quantity = stats["total_quantity"]
            total_value = stats["total_value"]
            stats["average_price"] = round(total_value / total_quantity, 4) if total_quantity else None
            stats["total_value"] = round(total_value, 2)
            stats["total_fee"] = round(stats["total_fee"], 2)
            stats["execution_count"] = len(cluster["executions"])

            earliest_date = stats.pop("earliest_date", None)
            latest_date = stats.pop("latest_date", None)
            stats["date_range"] = {
                "start": earliest_date,
                "end": latest_date
            }

            source_counts = meta.get("source_counts", defaultdict(int))
            distinct_sources = list(source_counts.keys())

            cluster["flags"] = {
                "multiple_executions": stats["execution_count"] > 1,
                "has_notes": len(meta.get("notes", [])) > 0,
                "has_multiple_sources": len(distinct_sources) > 1
            }

            cluster["stats"]["distinct_sources"] = distinct_sources

            notes_summary = ExecutionTradeMatchingService._build_notes_summary(meta.get("notes", []))
            primary_source = ExecutionTradeMatchingService._get_primary_source(source_counts)

            cluster["suggested_trade"] = {
                "ticker_id": cluster["ticker"]["id"],
                "ticker_symbol": cluster["ticker"].get("symbol"),
                "trading_account_id": cluster["trading_account"]["id"],
                "side": cluster["side"],
                "action": cluster["action"],
                "entry_price": stats["average_price"],
                "entry_date": earliest_date,
                "last_execution_date": latest_date,
                "quantity": total_quantity,
                "amount": stats["total_value"],
                "fee": stats["total_fee"],
                "source": primary_source,
                "execution_ids": cluster["execution_ids"],
                "notes": notes_summary,
                "default_selected_execution_ids": cluster["execution_ids"]
            }

            clusters_list.append(cluster)

        clusters_list.sort(
            key=lambda item: (
                item["stats"].get("date_range", {}).get("end") or datetime.min,
                item["stats"].get("total_value", 0)
            ),
            reverse=True
        )

        if max_items and max_items > 0:
            clusters_list = clusters_list[:max_items]

        return clusters_list

    @staticmethod
    def _map_execution_action_to_trade_side(action: Optional[str]) -> str:
        if not action:
            return 'long'
        normalized = action.lower()
        if normalized in {"sell", "sale", "short"}:
            return 'short'
        return 'long'

    @staticmethod
    def _get_primary_source(source_counts: Dict[str, int]) -> str:
        if not source_counts:
            return 'manual'
        return max(source_counts.items(), key=lambda item: item[1])[0]

    @staticmethod
    def _build_notes_summary(notes: List[str]) -> Optional[str]:
        if not notes:
            return None
        first_note = notes[0]
        remaining = len(notes) - 1
        if remaining <= 0:
            return first_note
        return f"{first_note} (+{remaining} הערות נוספות)"

