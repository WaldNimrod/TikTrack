#!/usr/bin/env python3
"""
Add/Update dynamic ENUM constraints for cash_flows.type and cash_flows.source

This script is idempotent:
- Creates the constraints if missing
- Updates enum_values to match the required sets
- Deactivates enum_values not in the required sets

Usage:
  python Backend/scripts/add_cashflow_constraints.py
"""

import sys
import os
import sqlite3
from typing import List, Dict

# Allow running from repo root or script dir
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
sys.path.append(os.path.join(REPO_ROOT, 'Backend', 'services'))

from constraint_service import ConstraintService  # type: ignore


def ensure_enum_constraint(service: ConstraintService, table_name: str, column_name: str,
                           constraint_name: str, values: List[Dict[str, str]]) -> None:
    """Ensure ENUM constraint and values exist and are up to date.

    values: list of {value: 'en_value', display_name: 'Hebrew', sort_order: int}
    """
    constraints = service.get_constraints_for_column(table_name, column_name)
    enum_constraints = [c for c in constraints if c.get('constraint_type') == 'ENUM']

    conn = service.get_db_connection()
    try:
        cur = conn.cursor()

        if not enum_constraints:
            # Create new constraint with enum values
            payload = {
                'table_name': table_name,
                'column_name': column_name,
                'constraint_type': 'ENUM',
                'constraint_name': constraint_name,
                'constraint_definition': f"ENUM values for {table_name}.{column_name}",
                'enum_values': values,
            }
            ok, msg = service.add_constraint(payload)
            if not ok:
                raise RuntimeError(f"Failed to add constraint {constraint_name}: {msg}")
            return

        # Use first existing ENUM constraint
        enum_c = enum_constraints[0]
        constraint_id = enum_c['id']

        # Fetch existing enum values
        existing = service.get_enum_values_for_constraint(constraint_id)
        existing_by_value = {ev['value']: ev for ev in existing}
        required_values = {v['value']: v for v in values}

        # Insert missing values
        for value_key, v in required_values.items():
            if value_key not in existing_by_value:
                cur.execute(
                    """
                    INSERT INTO enum_values (constraint_id, value, display_name, sort_order, is_active)
                    VALUES (?, ?, ?, ?, 1)
                    """,
                    (constraint_id, v['value'], v.get('display_name', v['value']), v.get('sort_order', 0))
                )
            else:
                # Ensure display_name, sort_order and is_active are correct
                ev = existing_by_value[value_key]
                updates = []
                params = []
                if ev.get('display_name') != v.get('display_name', v['value']):
                    updates.append('display_name = ?')
                    params.append(v.get('display_name', v['value']))
                if ev.get('sort_order') != v.get('sort_order', 0):
                    updates.append('sort_order = ?')
                    params.append(v.get('sort_order', 0))
                if not ev.get('is_active', True):
                    updates.append('is_active = 1')
                if updates:
                    params.extend([constraint_id, value_key])
                    cur.execute(f"UPDATE enum_values SET {', '.join(updates)} WHERE constraint_id = ? AND value = ?", params)

        # Deactivate values not in required set
        for value_key, ev in existing_by_value.items():
            if value_key not in required_values and ev.get('is_active', True):
                cur.execute(
                    "UPDATE enum_values SET is_active = 0 WHERE constraint_id = ? AND value = ?",
                    (constraint_id, value_key)
                )

        conn.commit()
    finally:
        conn.close()


def main() -> None:
    service = ConstraintService()

    # Cash flow type values (saved in English, UI Hebrew in display_name)
    type_values = [
        {'value': 'deposit',        'display_name': 'הפקדה',              'sort_order': 10},
        {'value': 'withdrawal',     'display_name': 'משיכה',               'sort_order': 20},
        {'value': 'fee',            'display_name': 'עמלה',                'sort_order': 30},
        {'value': 'dividend',       'display_name': 'דיבידנד',             'sort_order': 40},
        {'value': 'transfer_in',    'display_name': 'העברה מחשבון מסחר אחר',    'sort_order': 50},
    {'value': 'transfer_out',   'display_name': 'העברה לחשבון מסחר אחר',    'sort_order': 60},
        {'value': 'other_positive', 'display_name': 'אחר חיובי',           'sort_order': 70},
        {'value': 'other_negative', 'display_name': 'אחר שלילי',           'sort_order': 80},
    ]

    # Cash flow source values
    source_values = [
        {'value': 'manual',       'display_name': 'ידני',      'sort_order': 10},
        {'value': 'file_import',  'display_name': 'יבוא קובץ',  'sort_order': 20},
        {'value': 'direct_import','display_name': 'יבוא ישיר',  'sort_order': 30},
        {'value': 'api',          'display_name': 'API',       'sort_order': 40},
    ]

    ensure_enum_constraint(service, 'cash_flows', 'type', 'cash_flows_type_enum', type_values)
    ensure_enum_constraint(service, 'cash_flows', 'source', 'cash_flows_source_enum', source_values)

    print('✅ Cash flow ENUM constraints ensured successfully')


if __name__ == '__main__':
    main()


