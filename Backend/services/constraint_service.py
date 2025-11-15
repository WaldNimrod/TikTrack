#!/usr/bin/env python3
"""
Constraint Service – dual backend (SQLite legacy + PostgreSQL via SQLAlchemy).

The legacy dynamic constraint system stored metadata inside SQLite tables
(`constraints`, `enum_values`, `constraint_validations`). During the PostgreSQL
migration we still need to read that metadata for validation while gradually
moving the records themselves into Postgres. This service therefore supports
both modes:

* Legacy/SQLite mode – when `db_path` is provided (and exists). Mutation helper
  methods such as `add_constraint` remain available only in this mode.
* Postgres mode – default; reads from the ORM models so validations continue to
  work after migration.
"""

from __future__ import annotations

import logging
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from config.database import SessionLocal
from models.constraint import Constraint

logger = logging.getLogger(__name__)


class ConstraintService:
    """Read/write helper around the constraints reference tables."""

    def __init__(self, db_path: Optional[str] = None):
        self._SessionLocal = SessionLocal
        self._sqlite_path = Path(db_path) if db_path else None
        self._use_sqlite = bool(self._sqlite_path and self._sqlite_path.exists())

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _session(self) -> Session:
        return self._SessionLocal()

    def _sqlite_conn(self) -> sqlite3.Connection:
        if not self._use_sqlite:
            raise RuntimeError("SQLite connection requested but no db_path was provided")
        conn = sqlite3.connect(str(self._sqlite_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _serialize_sqlite_row(self, row: sqlite3.Row) -> Dict[str, Any]:
        data = dict(row)
        data["is_active"] = bool(data.get("is_active", True))
        if data["constraint_type"] == "ENUM":
            data["enum_values"] = self.get_enum_values_for_constraint(data["id"])
        return data

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

    def _fetch_sqlite_constraints(
        self, table_name: str, column_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        conn = self._sqlite_conn()
        try:
            query = """
                SELECT id, table_name, column_name, constraint_type,
                       constraint_name, constraint_definition,
                       is_active, created_at, updated_at
                FROM constraints
                WHERE table_name = ? AND is_active = 1
            """
            params: List[Any] = [table_name]
            if column_name:
                query += " AND column_name = ?"
                params.append(column_name)
            query += " ORDER BY column_name, constraint_type"

            cursor = conn.execute(query, params)
            return [self._serialize_sqlite_row(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def _fetch_sqlalchemy_constraints(
        self, table_name: str, column_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        with self._session() as session:
            stmt = select(Constraint).where(
                Constraint.table_name == table_name, Constraint.is_active.is_(True)
            )
            if column_name:
                stmt = stmt.where(Constraint.column_name == column_name)
            stmt = stmt.order_by(Constraint.column_name, Constraint.constraint_type)
            constraints = session.scalars(stmt).all()
            return [self._serialize_constraint(c) for c in constraints]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def get_constraints_for_table(self, table_name: str) -> List[Dict[str, Any]]:
        if self._use_sqlite:
            return self._fetch_sqlite_constraints(table_name)
        return self._fetch_sqlalchemy_constraints(table_name)

    def get_constraints_for_column(self, table_name: str, column_name: str) -> List[Dict[str, Any]]:
        if self._use_sqlite:
            return self._fetch_sqlite_constraints(table_name, column_name)
        return self._fetch_sqlalchemy_constraints(table_name, column_name)

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
                    numeric_value = float(value)
                except (TypeError, ValueError):
                    return False, f"Value '{value}' must be numeric"
                # Minimal validation – business logic is enforced in DB as well
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
        if not self._use_sqlite:
            with self._session() as session:
                constraint = session.get(Constraint, constraint_id)
                if not constraint:
                    return []
                return [
                    {
                        "id": enum.id,
                        "value": enum.value,
                        "display_name": enum.display_name,
                        "sort_order": enum.sort_order,
                        "is_active": enum.is_active,
                    }
                    for enum in constraint.enum_values
                    if enum.is_active
                ]

        conn = self._sqlite_conn()
        try:
            cursor = conn.execute(
                """
                SELECT id, value, display_name, sort_order, is_active
                FROM enum_values
                WHERE constraint_id = ? AND is_active = 1
                ORDER BY sort_order
                """,
                (constraint_id,),
            )
            return [
                {
                    "id": row["id"],
                    "value": row["value"],
                    "display_name": row["display_name"],
                    "sort_order": row["sort_order"],
                    "is_active": bool(row["is_active"]),
                }
                for row in cursor.fetchall()
            ]
        finally:
            conn.close()

    def get_db_connection(self) -> sqlite3.Connection:
        """Legacy helper – only available in SQLite mode (used by migration scripts)."""
        return self._sqlite_conn()

    # ------------------------------------------------------------------
    # Legacy mutation helpers (SQLite only)
    # ------------------------------------------------------------------
    def add_constraint(self, constraint_data: Dict[str, Any]) -> Tuple[bool, str]:
        if not self._use_sqlite:
            return False, "add_constraint is supported only in SQLite mode"

        conn = self._sqlite_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO constraints (
                    table_name, column_name, constraint_type,
                    constraint_name, constraint_definition, is_active,
                    created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """,
                (
                    constraint_data["table_name"],
                    constraint_data["column_name"],
                    constraint_data["constraint_type"],
                    constraint_data["constraint_name"],
                    constraint_data["constraint_definition"],
                ),
            )
            constraint_id = cursor.lastrowid

            if constraint_data.get("constraint_type") == "ENUM":
                for enum_value in constraint_data.get("enum_values", []):
                    cursor.execute(
                        """
                        INSERT INTO enum_values (constraint_id, value, display_name, sort_order, is_active)
                        VALUES (?, ?, ?, ?, 1)
                        """,
                        (
                            constraint_id,
                            enum_value["value"],
                            enum_value.get("display_name", enum_value["value"]),
                            enum_value.get("sort_order", 0),
                        ),
                    )

            conn.commit()
            return True, f"Constraint {constraint_data['constraint_name']} added successfully"
        except Exception as exc:  # pragma: no cover - legacy path
            conn.rollback()
            logger.exception("Failed to add constraint")
            return False, f"Error adding constraint: {exc}"
        finally:
            conn.close()

    def update_constraint(self, constraint_id: int, constraint_data: Dict[str, Any]) -> Tuple[bool, str]:
        if not self._use_sqlite:
            return False, "update_constraint is supported only in SQLite mode"

        conn = self._sqlite_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE constraints
                SET table_name = ?, column_name = ?, constraint_type = ?,
                    constraint_name = ?, constraint_definition = ?, is_active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (
                    constraint_data["table_name"],
                    constraint_data["column_name"],
                    constraint_data["constraint_type"],
                    constraint_data["constraint_name"],
                    constraint_data["constraint_definition"],
                    constraint_data.get("is_active", True),
                    constraint_id,
                ),
            )

            if constraint_data["constraint_type"] == "ENUM":
                cursor.execute("DELETE FROM enum_values WHERE constraint_id = ?", (constraint_id,))
                for enum_value in constraint_data.get("enum_values", []):
                    cursor.execute(
                        """
                        INSERT INTO enum_values (constraint_id, value, display_name, sort_order, is_active)
                        VALUES (?, ?, ?, ?, 1)
                        """,
                        (
                            constraint_id,
                            enum_value["value"],
                            enum_value.get("display_name", enum_value["value"]),
                            enum_value.get("sort_order", 0),
                        ),
                    )

            conn.commit()
            return True, f"Constraint {constraint_id} updated successfully"
        except Exception as exc:  # pragma: no cover - legacy path
            conn.rollback()
            logger.exception("Failed to update constraint %s", constraint_id)
            return False, f"Error updating constraint: {exc}"
        finally:
            conn.close()

    def delete_constraint(self, constraint_id: int) -> Tuple[bool, str]:
        if not self._use_sqlite:
            return False, "delete_constraint is supported only in SQLite mode"

        conn = self._sqlite_conn()
        try:
            conn.execute(
                """
                UPDATE constraints
                SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (constraint_id,),
            )
            conn.commit()
            return True, f"Constraint {constraint_id} deleted successfully"
        except Exception as exc:  # pragma: no cover - legacy path
            conn.rollback()
            logger.exception("Failed to delete constraint %s", constraint_id)
            return False, f"Error deleting constraint: {exc}"
        finally:
            conn.close()

    def get_all_constraints(self) -> List[Dict[str, Any]]:
        if not self._use_sqlite:
            with self._session() as session:
                stmt = select(Constraint).where(Constraint.is_active.is_(True))
                constraints = session.scalars(stmt).all()
                return [self._serialize_constraint(c) for c in constraints]

        conn = self._sqlite_conn()
        try:
            cursor = conn.execute(
                """
                SELECT id, table_name, column_name, constraint_type,
                       constraint_name, constraint_definition,
                       is_active, created_at, updated_at
                FROM constraints
                WHERE is_active = 1
                ORDER BY table_name, column_name, constraint_type
                """
            )
            return [self._serialize_sqlite_row(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def get_tables_with_constraints(self) -> List[str]:
        if not self._use_sqlite:
            with self._session() as session:
                stmt = (
                    select(Constraint.table_name)
                    .where(Constraint.is_active.is_(True))
                    .distinct()
                    .order_by(Constraint.table_name)
                )
                return session.scalars(stmt).all()

        conn = self._sqlite_conn()
        try:
            cursor = conn.execute(
                "SELECT DISTINCT table_name FROM constraints WHERE is_active = 1 ORDER BY table_name"
            )
            return [row[0] for row in cursor.fetchall()]
        finally:
            conn.close()

    def validate_active_trades_constraint(self) -> Tuple[bool, List[str]]:
        if not self._use_sqlite:
            logger.warning("validate_active_trades_constraint is not implemented for PostgreSQL mode")
            return True, []

        conn = self._sqlite_conn()
        try:
            cursor = conn.execute("SELECT id, symbol, active_trades FROM tickers")
            errors: List[str] = []
            for ticker_id, symbol, current_value in cursor.fetchall():
                inner = conn.execute(
                    """
                    SELECT
                        (SELECT COUNT(*) FROM trades WHERE ticker_id = ? AND status = 'open') > 0 OR
                        (SELECT COUNT(*) FROM trade_plans WHERE ticker_id = ? AND status = 'open') > 0
                    """,
                    (ticker_id, ticker_id),
                ).fetchone()[0]
                desired = bool(inner)
                if bool(current_value) != desired:
                    errors.append(
                        f"Ticker {symbol} (ID {ticker_id}) active_trades={current_value} expected={desired}"
                    )
            return len(errors) == 0, errors
        finally:
            conn.close()

    def fix_active_trades_constraint(self) -> Tuple[bool, int]:
        if not self._use_sqlite:
            logger.warning("fix_active_trades_constraint is not implemented for PostgreSQL mode")
            return False, 0

        conn = self._sqlite_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE tickers
                SET active_trades = (
                    SELECT (
                        (SELECT COUNT(*) FROM trades WHERE ticker_id = tickers.id AND status = 'open') > 0
                    ) OR (
                        (SELECT COUNT(*) FROM trade_plans WHERE ticker_id = tickers.id AND status = 'open') > 0
                    )
                )
                """
            )
            affected = cursor.rowcount
            conn.commit()
            return True, affected
        finally:
            conn.close()


