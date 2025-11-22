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

import os
import sys
from typing import Dict, List

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

    payload = {
        'table_name': table_name,
        'column_name': column_name,
        'constraint_type': 'ENUM',
        'constraint_name': constraint_name,
        'constraint_definition': f"ENUM values for {table_name}.{column_name}",
        'enum_values': values,
        'is_active': True,
    }

    if not enum_constraints:
        ok, msg = service.add_constraint(payload)
        if not ok:
            raise RuntimeError(f"Failed to add constraint {constraint_name}: {msg}")
        return

    constraint_id = enum_constraints[0]['id']
    ok, msg = service.update_constraint(constraint_id, payload)
    if not ok:
        raise RuntimeError(f"Failed to update constraint {constraint_name}: {msg}")


def main() -> None:
    service = ConstraintService()

    # Cash flow type values (saved in English, UI Hebrew in display_name)
    type_values = [
        {'value': 'deposit',        'display_name': 'הפקדה',              'sort_order': 10},
        {'value': 'withdrawal',     'display_name': 'משיכה',               'sort_order': 20},
        {'value': 'fee',            'display_name': 'עמלה',                'sort_order': 30},
        {'value': 'dividend',       'display_name': 'דיבידנד',             'sort_order': 40},
        {'value': 'transfer_in',            'display_name': 'העברה מחשבון אחר',    'sort_order': 50},
        {'value': 'transfer_out',           'display_name': 'העברה לחשבון אחר',    'sort_order': 60},
        {'value': 'currency_exchange_from', 'display_name': 'המרת מט\"ח - יציאה',   'sort_order': 65},
        {'value': 'currency_exchange_to',   'display_name': 'המרת מט\"ח - כניסה',   'sort_order': 66},
        {'value': 'other_positive',         'display_name': 'אחר חיובי',           'sort_order': 70},
        {'value': 'other_negative',         'display_name': 'אחר שלילי',           'sort_order': 80},
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


