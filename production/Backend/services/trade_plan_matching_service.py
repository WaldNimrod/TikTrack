"""
Trade Plan Matching Service - TikTrack
======================================

Business logic for matching trades without plans to existing trade plans
and generating creation suggestions for new plans.

Documentation reference:
`documentation/02-ARCHITECTURE/BACKEND/TRADE_PLAN_MATCHING_SERVICE.md`
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session, joinedload

from models.trade import Trade
from models.trade_plan import TradePlan
from models.execution import Execution
from services.trade_service import TradeService

logger = logging.getLogger(__name__)


class TradePlanMatchingService:
    """Service for producing trade-plan matching recommendations."""

    ASSIGNMENT_MIN_SCORE = 50
    CREATION_BASE_SCORE = 70
    CREATION_ASSIGNMENT_PENALTY = 40
    DATE_MATCH_WINDOW_DAYS = 7

    # ------------------------------------------------------------------ #
    # Assignment suggestions
    # ------------------------------------------------------------------ #
    @staticmethod
    def get_assignment_suggestions(
        db: Session,
        *,
        max_items: Optional[int] = None,
        max_suggestions_per_trade: int = 3,
        status_filter: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Build ranked suggestions for linking trades to existing trade plans.

        Args:
            db: Database session.
            max_items: Optional limit on returned trades.
            max_suggestions_per_trade: Limit for plan suggestions per trade.
            status_filter: Optional list of trade statuses to include.
        """
        trades = TradeService.get_trades_without_plan(
            db,
            status_filter=status_filter or ["open"],
            load_relationships=True,
        )

        if not trades:
            return []

        ticker_ids = {trade.ticker_id for trade in trades if trade.ticker_id}
        plans = TradePlanMatchingService._load_open_plans_for_tickers(db, ticker_ids)
        plans_by_ticker: Dict[int, List[TradePlan]] = defaultdict(list)
        for plan in plans:
            plans_by_ticker[plan.ticker_id].append(plan)

        results: List[Dict[str, Any]] = []

        for trade in trades:
            if not trade.ticker_id:
                continue

            candidate_plans = plans_by_ticker.get(trade.ticker_id, [])
            suggestions = TradePlanMatchingService._build_assignment_suggestions_for_trade(
                trade,
                candidate_plans,
                max_suggestions=max_suggestions_per_trade,
            )

            if not suggestions:
                continue

            primary = suggestions[0]
            payload = {
                "trade_id": trade.id,
                "trade": TradePlanMatchingService._serialize_trade(trade),
                "primary_suggestion": primary,
                "suggestions": suggestions,
                "suggestion_count": len(suggestions),
                "best_score": primary.get("score"),
            }
            results.append(payload)

        results.sort(key=lambda item: item.get("best_score") or 0, reverse=True)

        if max_items:
            results = results[: max_items]

        return results

    @staticmethod
    def _build_assignment_suggestions_for_trade(
        trade: Trade,
        candidate_plans: List[TradePlan],
        *,
        max_suggestions: int,
    ) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []

        for plan in candidate_plans:
            score, reasons = TradePlanMatchingService._calculate_assignment_score(trade, plan)
            if score < TradePlanMatchingService.ASSIGNMENT_MIN_SCORE:
                continue

            suggestion = {
                "trade_plan_id": plan.id,
                "score": score,
                "match_reasons": reasons,
                "plan": TradePlanMatchingService._serialize_plan(plan),
            }
            results.append(suggestion)

        results.sort(key=lambda item: item.get("score") or 0, reverse=True)
        return results[:max_suggestions]

    @staticmethod
    def _calculate_assignment_score(trade: Trade, plan: TradePlan) -> Tuple[int, List[str]]:
        score = 50  # Base score for ticker match (guaranteed at this point)
        reasons: List[str] = ["טיקר תואם"]

        if trade.trading_account_id and trade.trading_account_id == plan.trading_account_id:
            score += 25
            reasons.append("חשבון מסחר תואם")

        trade_side = TradePlanMatchingService._normalize_side(trade.side)
        plan_side = TradePlanMatchingService._normalize_side(plan.side)
        if trade_side and plan_side and trade_side == plan_side:
            score += 10
            reasons.append("צד מסחר תואם")

        if plan.status == "open":
            score += 5
            reasons.append("תוכנית פתוחה")

        trade_date = TradePlanMatchingService._safe_datetime(trade.created_at)
        plan_date = TradePlanMatchingService._safe_datetime(plan.created_at)
        if trade_date and plan_date:
            delta_days = abs((trade_date - plan_date).days)
            if delta_days <= TradePlanMatchingService.DATE_MATCH_WINDOW_DAYS:
                score += 10
                reasons.append(f"תאריכים קרובים ({delta_days} ימים)")

        score = min(score, 100)
        return score, reasons

    # ------------------------------------------------------------------ #
    # Creation suggestions
    # ------------------------------------------------------------------ #
    @staticmethod
    def get_creation_suggestions(
        db: Session,
        *,
        max_items: Optional[int] = None,
        status_filter: Optional[List[str]] = None,
        assignment_index: Optional[Dict[int, int]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Produce recommendations for creating new trade plans from trades.

        Args:
            db: Database session.
            max_items: Optional limit on returned trades.
            status_filter: Optional list of trade statuses to include.
            assignment_index: Optional mapping of trade_id -> best assignment score
                              used to reduce priority for trades already suggested
                              for assignment.
        """
        trades = TradeService.get_trades_without_plan(
            db,
            status_filter=status_filter or ["open"],
            load_relationships=True,
        )

        if not trades:
            return []

        suggestions: List[Dict[str, Any]] = []

        for trade in trades:
            metrics = TradePlanMatchingService._aggregate_trade_metrics(trade)
            prefill = TradePlanMatchingService._build_creation_prefill(trade, metrics)

            score = TradePlanMatchingService._calculate_creation_score(trade, metrics)
            has_assignment = assignment_index and trade.id in assignment_index
            if has_assignment:
                score = max(10, score - TradePlanMatchingService.CREATION_ASSIGNMENT_PENALTY)

            suggestion = {
                "trade_id": trade.id,
                "trade": TradePlanMatchingService._serialize_trade(trade),
                "prefill": prefill,
                "metrics": metrics,
                "score": score,
                "has_assignment_suggestion": bool(has_assignment),
            }
            suggestions.append(suggestion)

        suggestions.sort(key=lambda item: item.get("score") or 0, reverse=True)

        if max_items:
            suggestions = suggestions[: max_items]

        return suggestions

    @staticmethod
    def _calculate_creation_score(trade: Trade, metrics: Dict[str, Any]) -> int:
        score = TradePlanMatchingService.CREATION_BASE_SCORE

        if metrics.get("buy_execution_count", 0) > 1:
            score += 10
        if metrics.get("has_notes"):
            score += 5
        if TradePlanMatchingService._normalize_side(trade.side):
            score += 5

        return min(score, 95)

    @staticmethod
    def _aggregate_trade_metrics(trade: Trade) -> Dict[str, Any]:
        buy_quantity = 0.0
        buy_value = 0.0
        buy_fees = 0.0
        sell_quantity = 0.0
        executions: List[Execution] = getattr(trade, "executions", []) or []
        earliest_execution: Optional[datetime] = None

        for execution in executions:
            action = (execution.action or "").lower()
            quantity = execution.quantity or 0
            price = execution.price or 0
            fee = execution.fee or 0
            execution_date = TradePlanMatchingService._safe_datetime(execution.date)

            if earliest_execution is None or (
                execution_date and execution_date < earliest_execution
            ):
                earliest_execution = execution_date

            if action == "buy":
                buy_quantity += quantity
                buy_value += quantity * price
                buy_fees += fee
            elif action == "sell":
                sell_quantity += quantity

        net_quantity = buy_quantity - sell_quantity
        average_price = buy_value / buy_quantity if buy_quantity else None

        return {
            "buy_execution_count": sum(
                1 for execution in executions if (execution.action or "").lower() == "buy"
            ),
            "buy_quantity": buy_quantity,
            "sell_quantity": sell_quantity,
            "net_quantity": net_quantity,
            "gross_investment": buy_value + buy_fees,
            "average_price": average_price,
            "first_execution_at": earliest_execution,
            "has_notes": bool(getattr(trade, "notes", None)),
        }

    @staticmethod
    def _build_creation_prefill(trade: Trade, metrics: Dict[str, Any]) -> Dict[str, Any]:
        normalized_side = TradePlanMatchingService._normalize_side(trade.side)
        entry_date = metrics.get("first_execution_at") or TradePlanMatchingService._safe_datetime(
            trade.created_at
        )

        quantity = metrics.get("net_quantity") or metrics.get("buy_quantity") or 0
        planned_amount = metrics.get("gross_investment") or 0
        average_price = metrics.get("average_price")

        prefill = {
            "ticker_id": trade.ticker_id,
            "trading_account_id": trade.trading_account_id,
            "side": normalized_side or "long",
            "investment_type": TradePlanMatchingService._normalize_investment_type(
                trade.investment_type
            ),
            "entry_price": average_price,
            "entry_date": entry_date,
            "quantity": quantity,
            "planned_amount": planned_amount,
            "notes": getattr(trade, "notes", None),
        }

        return prefill

    # ------------------------------------------------------------------ #
    # Linking helper
    # ------------------------------------------------------------------ #
    @staticmethod
    def link_trade_to_plan(db: Session, trade_id: int, plan_id: int) -> Dict[str, Any]:
        """
        Link a trade to a trade plan while validating business constraints.
        Returns a serialized representation of the updated trade.
        """
        trade = TradeService.assign_plan(db, trade_id, plan_id, validate_ticker=True)
        if not trade:
            raise ValueError("Trade not found")

        # Reload relationships for serialization if not already loaded
        db.refresh(trade)
        trade = (
            db.query(Trade)
            .options(joinedload(Trade.ticker), joinedload(Trade.account))
            .filter(Trade.id == trade_id)
            .first()
        )
        return TradePlanMatchingService._serialize_trade(trade)

    # ------------------------------------------------------------------ #
    # Utilities
    # ------------------------------------------------------------------ #
    @staticmethod
    def _load_open_plans_for_tickers(db: Session, ticker_ids: set[int]) -> List[TradePlan]:
        if not ticker_ids:
            return []

        return (
            db.query(TradePlan)
            .options(joinedload(TradePlan.account), joinedload(TradePlan.ticker))
            .filter(
                TradePlan.ticker_id.in_(ticker_ids),  # type: ignore[arg-type]
                TradePlan.status == "open",
            )
            .all()
        )

    @staticmethod
    def _serialize_trade(trade: Optional[Trade]) -> Dict[str, Any]:
        if not trade:
            return {}

        ticker_symbol = getattr(trade.ticker, "symbol", None) if hasattr(trade, "ticker") else None
        account_name = getattr(trade.account, "name", None) if hasattr(trade, "account") else None

        return {
            "id": trade.id,
            "ticker_id": trade.ticker_id,
            "ticker_symbol": ticker_symbol,
            "trading_account_id": trade.trading_account_id,
            "account_name": account_name,
            "status": trade.status,
            "side": trade.side,
            "investment_type": trade.investment_type,
            "created_at": TradePlanMatchingService._safe_datetime(trade.created_at),
            "closed_at": TradePlanMatchingService._safe_datetime(trade.closed_at),
            "notes": getattr(trade, "notes", None),
            "executions_count": len(getattr(trade, "executions", []) or []),
        }

    @staticmethod
    def _serialize_plan(plan: Optional[TradePlan]) -> Dict[str, Any]:
        if not plan:
            return {}

        ticker_symbol = getattr(plan.ticker, "symbol", None) if hasattr(plan, "ticker") else None
        account_name = getattr(plan.account, "name", None) if hasattr(plan, "account") else None

        return {
            "id": plan.id,
            "ticker_id": plan.ticker_id,
            "ticker_symbol": ticker_symbol,
            "trading_account_id": plan.trading_account_id,
            "account_name": account_name,
            "status": plan.status,
            "side": plan.side,
            "investment_type": plan.investment_type,
            "planned_amount": plan.planned_amount,
            "entry_price": plan.entry_price,
            "created_at": TradePlanMatchingService._safe_datetime(plan.created_at),
            "cancelled_at": TradePlanMatchingService._safe_datetime(plan.cancelled_at),
        }

    @staticmethod
    def _normalize_side(value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        normalized = value.lower()
        if normalized in {"long", "short"}:
            return normalized
        return None

    @staticmethod
    def _normalize_investment_type(value: Optional[str]) -> str:
        if not value:
            return "swing"
        return value.lower()

    @staticmethod
    def _safe_datetime(value: Any) -> Optional[datetime]:
        if isinstance(value, datetime):
            return value
        return None






