import os
import sqlite3
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from migrations import create_conditions_system_tables  # noqa: E402
from migrations.seed_conditions_master_data import seed_methods  # noqa: E402


def _create_in_memory_db():
    connection = sqlite3.connect(":memory:")
    create_conditions_system_tables.upgrade(connection)
    return connection


def test_seed_methods_idempotent():
    connection = _create_in_memory_db()
    try:
        seed_methods(connection)

        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM trading_methods")
        first_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM method_parameters")
        first_param_count = cursor.fetchone()[0]

        assert first_count == 6
        assert first_param_count > 0

        # Run again to confirm idempotency
        seed_methods(connection)
        cursor.execute("SELECT COUNT(*) FROM trading_methods")
        second_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM method_parameters")
        second_param_count = cursor.fetchone()[0]

        assert second_count == first_count
        assert second_param_count == first_param_count

    finally:
        connection.close()

