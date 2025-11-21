#!/usr/bin/env python3
"""
Constraint Service – PostgreSQL-native implementation.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Tuple

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from config.database import SessionLocal
from models.constraint import Constraint, EnumValue

logger = logging.getLogger(__name__)


class ConstraintService:
    """Read/write helper around the constraints reference tables."""

    def __init__(self) -> None:
        self._SessionLocal = SessionLocal

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _session(self) -> Session:
        return self._SessionLocal()

    def _serialize_constraint(self, constraint: Constraint) -> Dict[str, Any]:
        data = {
            "id": constraint.id,
            "table_name": constraint.table_name,
            "column_name": constraint.column_name,
            "constraint_type": constraint.constraint_type,
            "constraint_name": constraint.constraint_name,
            "constraint_definition": constraint.constraint_definition,
            "is_active": constraint.is_active,
            "created_at": constraint.created_at,
            "updated_at": constraint.updated_at,
        }

        if constraint.constraint_type == "ENUM":
            data["enum_values"] = [
                {
                    "id": enum.id,
                    "value": enum.value,
                    "display_name": enum.display_name,
                    "is_active": enum.is_active,
                    "sort_order": enum.sort_order,
                }
                for enum in constraint.enum_values
                if enum.is_active
            ]
        return data

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def get_constraints_for_table(self, table_name: str) -> List[Dict[str, Any]]:
        with self._session() as session:
            stmt = (
                select(Constraint)
                .where(Constraint.table_name == table_name, Constraint.is_active.is_(True))
                .order_by(Constraint.column_name, Constraint.constraint_type)
            )
            return [self._serialize_constraint(c) for c in session.scalars(stmt).all()]

    def get_constraints_for_column(self, table_name: str, column_name: str) -> List[Dict[str, Any]]:
        with self._session() as session:
            stmt = (
                select(Constraint)
                .where(
                    Constraint.table_name == table_name,
                    Constraint.column_name == column_name,
                    Constraint.is_active.is_(True),
                )
                .order_by(Constraint.constraint_type)
            )
            return [self._serialize_constraint(c) for c in session.scalars(stmt).all()]

    def validate_field_value(self, table_name: str, column_name: str, value: Any) -> Tuple[bool, str]:
        constraints = self.get_constraints_for_column(table_name, column_name)
        for constraint in constraints:
            is_valid, error = self._validate_constraint(constraint, value)
            if not is_valid:
                return False, error
        return True, "Value is valid"

    def _validate_constraint(self, constraint: Dict[str, Any], value: Any) -> Tuple[bool, str]:
        constraint_type = (constraint.get("constraint_type") or "").upper()

        if constraint_type == "ENUM":
            options = [enum["value"] for enum in constraint.get("enum_values", [])]
            if value is None:
                return True, "Value is null (allowed)"
            if str(value) not in options:
                return False, f"Value '{value}' must be one of {options}"
            return True, "Value is valid"

        if constraint_type == "NOT_NULL":
            if value is None or (isinstance(value, str) and not value.strip()):
                return False, f"{constraint['column_name']} is required"
            return True, "Value is valid"

        if constraint_type in {"CHECK", "RANGE"}:
            definition = constraint.get("constraint_definition") or ""
            if ">" in definition or "<" in definition:
                try:
                    float(value)
                except (TypeError, ValueError):
                    return False, f"Value '{value}' must be numeric"
            return True, "Value is valid"

        # UNIQUE / FOREIGN_KEY / CUSTOM validations are enforced at the DB layer.
        return True, "Value is valid"

    def get_enum_values(self, table_name: str, column_name: str) -> List[Dict[str, Any]]:
        constraints = self.get_constraints_for_column(table_name, column_name)
        enum_constraints = [c for c in constraints if c.get("constraint_type") == "ENUM"]
        if not enum_constraints:
            return []
        return enum_constraints[0].get("enum_values", [])

    def get_enum_values_for_constraint(self, constraint_id: int) -> List[Dict[str, Any]]:
        with self._session() as session:
            stmt = (
                select(EnumValue)
                .where(EnumValue.constraint_id == constraint_id, EnumValue.is_active.is_(True))
                .order_by(EnumValue.sort_order)
            )
            return [
                {
                    "id": ev.id,
                    "value": ev.value,
                    "display_name": ev.display_name,
                    "sort_order": ev.sort_order,
                    "is_active": ev.is_active,
                }
                for ev in session.scalars(stmt).all()
            ]

    # ------------------------------------------------------------------
    # Mutation helpers
    # ------------------------------------------------------------------
    def add_constraint(self, constraint_data: Dict[str, Any]) -> Tuple[bool, str]:
        try:
            with self._session() as session:
                constraint = Constraint(
                    table_name=constraint_data["table_name"],
                    column_name=constraint_data["column_name"],
                    constraint_type=constraint_data["constraint_type"],
                    constraint_name=constraint_data["constraint_name"],
                    constraint_definition=constraint_data["constraint_definition"],
                    is_active=constraint_data.get("is_active", True),
                )
                session.add(constraint)
                session.flush()

                if constraint.constraint_type == "ENUM":
                    for enum_value in constraint_data.get("enum_values", []):
                        session.add(
                            EnumValue(
                                constraint_id=constraint.id,
                                value=enum_value["value"],
                                display_name=enum_value.get("display_name", enum_value["value"]),
                                sort_order=enum_value.get("sort_order", 0),
                                is_active=True,
                            )
                        )

                session.commit()
                return True, f"Constraint {constraint.constraint_name} added successfully"
        except Exception as exc:  # pragma: no cover - safety
            logger.exception("Failed to add constraint")
            return False, f"Error adding constraint: {exc}"

    def update_constraint(self, constraint_id: int, constraint_data: Dict[str, Any]) -> Tuple[bool, str]:
        try:
            with self._session() as session:
                constraint = session.get(Constraint, constraint_id)
                if not constraint:
                    return False, f"Constraint {constraint_id} not found"

                constraint.table_name = constraint_data["table_name"]
                constraint.column_name = constraint_data["column_name"]
                constraint.constraint_type = constraint_data["constraint_type"]
                constraint.constraint_name = constraint_data["constraint_name"]
                constraint.constraint_definition = constraint_data["constraint_definition"]
                constraint.is_active = constraint_data.get("is_active", True)

                if constraint.constraint_type == "ENUM" and "enum_values" in constraint_data:
                    session.query(EnumValue).filter(EnumValue.constraint_id == constraint_id).delete()
                    for enum_value in constraint_data["enum_values"]:
                        session.add(
                            EnumValue(
                                constraint_id=constraint_id,
                                value=enum_value["value"],
                                display_name=enum_value.get("display_name", enum_value["value"]),
                                sort_order=enum_value.get("sort_order", 0),
                                is_active=True,
                            )
                        )

                session.commit()
                return True, f"Constraint {constraint_id} updated successfully"
        except Exception as exc:  # pragma: no cover - safety
            logger.exception("Failed to update constraint %s", constraint_id)
            return False, f"Error updating constraint: {exc}"

    def delete_constraint(self, constraint_id: int) -> Tuple[bool, str]:
        try:
            with self._session() as session:
                constraint = session.get(Constraint, constraint_id)
                if not constraint:
                    return False, f"Constraint {constraint_id} not found"

                constraint.is_active = False
                session.commit()
                return True, f"Constraint {constraint_id} deleted successfully"
        except Exception as exc:  # pragma: no cover - safety
            logger.exception("Failed to delete constraint %s", constraint_id)
            return False, f"Error deleting constraint: {exc}"

    def get_all_constraints(self) -> List[Dict[str, Any]]:
        with self._session() as session:
            stmt = select(Constraint).where(Constraint.is_active.is_(True))
            return [self._serialize_constraint(c) for c in session.scalars(stmt).all()]

    def get_tables_with_constraints(self) -> List[str]:
        with self._session() as session:
            stmt = (
                select(Constraint.table_name)
                .where(Constraint.is_active.is_(True))
                .distinct()
                .order_by(Constraint.table_name)
            )
            return session.scalars(stmt).all()

    # ------------------------------------------------------------------
    # Integrity helpers
    # ------------------------------------------------------------------
    def validate_active_trades_constraint(self) -> Tuple[bool, List[str]]:
        with self._session() as session:
            rows = session.execute(text("SELECT id, symbol, active_trades FROM tickers")).mappings()
            errors: List[str] = []
            for row in rows:
                desired = session.execute(
                    text(
                        """
                        SELECT
                            (EXISTS (SELECT 1 FROM trades WHERE ticker_id = :ticker_id AND status = 'open')) OR
                            (EXISTS (SELECT 1 FROM trade_plans WHERE ticker_id = :ticker_id AND status = 'open'))
                        """
                    ),
                    {"ticker_id": row["id"]},
                ).scalar()
                if bool(row["active_trades"]) != bool(desired):
                    errors.append(
                        f"Ticker {row['symbol']} (ID {row['id']}): active_trades={row['active_trades']} expected={desired}"
                    )
            return len(errors) == 0, errors

    def fix_active_trades_constraint(self) -> Tuple[bool, int]:
        with self._session() as session:
            result = session.execute(
                text(
                    """
                    UPDATE tickers
                    SET active_trades = (
                        (EXISTS (SELECT 1 FROM trades WHERE ticker_id = tickers.id AND status = 'open')) OR
                        (EXISTS (SELECT 1 FROM trade_plans WHERE ticker_id = tickers.id AND status = 'open'))
                    )
                    """
                )
            )
            session.commit()
            return True, result.rowcount or 0

