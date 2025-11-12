import os
import sys

import pytest

# Ensure the project root is on sys.path for imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "Backend")
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from Backend.app import create_app, db  # noqa: E402
from Backend.config.settings import DATABASE_URL  # noqa: E402


@pytest.fixture(autouse=True)
def reset_database_binding():
    """
    Guarantee that each test starts and ends with the default project database
    binding. This prevents tests that temporarily rebind to in-memory SQLite
    from affecting subsequent tests that expect the full schema.
    """
    create_app({"SQLALCHEMY_DATABASE_URI": DATABASE_URL})
    db.ensure()
    yield
    create_app({"SQLALCHEMY_DATABASE_URI": DATABASE_URL})
    db.ensure()
