import os
import sys
import uuid
from unittest.mock import patch

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
from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from models.base import Base  # noqa: E402
from models.ai_analysis import UserLLMProvider  # noqa: E402


@pytest.fixture(scope="session")
def db_engine():
    """Create PostgreSQL engine for session-scoped operations."""
    engine = create_engine(DATABASE_URL)
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def test_schema(db_engine):
    """Create schema per test session."""
    schema_name = f"test_{uuid.uuid4().hex[:8]}"

    with db_engine.begin() as conn:
        # Create schema
        conn.execute(text(f'CREATE SCHEMA "{schema_name}"'))

    yield schema_name

    # Clean up schema after all tests in session
    with db_engine.begin() as conn:
        conn.execute(text(f'DROP SCHEMA "{schema_name}" CASCADE'))


@pytest.fixture
def db_session(db_engine, test_schema):
    """Create database session with schema isolation."""
    # Create engine with schema in URL
    schema_url = f"{DATABASE_URL}?options=-csearch_path%3D{test_schema}"
    schema_engine = create_engine(schema_url)

    # Create tables in the schema
    Base.metadata.create_all(schema_engine)

    Session = sessionmaker(bind=schema_engine)
    session = Session()

    try:
        yield session
    finally:
        session.rollback()
        session.close()
        schema_engine.dispose()


@pytest.fixture
def auth_client(client):
    """Create authenticated client by patching g.user_id."""
    def mock_getattr(obj, attr, default=None):
        if attr == 'user_id' and hasattr(obj, '__class__') and obj.__class__.__name__ == '_AppCtxGlobals':
            return 1  # Mock user ID
        return getattr(obj, attr, default)

    # Patch getattr in all route modules that use @require_authentication
    patches = []
    route_modules = [
        'routes.api.base_entity_decorators.getattr',
        'routes.api.trading_accounts.getattr',
        'routes.api.ai_analysis.getattr',
        'routes.api.trade_plans.getattr',
        'routes.api.trades.getattr',
        'routes.api.preferences.getattr',
        'routes.external_data.quotes.getattr',
        'routes.api.eod_metrics.getattr',
        'routes.api.user_preferences_list.getattr',
        'routes.external_data.status.getattr',
        'routes.api.preferences_v4.getattr',
        'routes.api.tickers.getattr',
        'routes.api.watch_lists.getattr',
        'routes.api.tags.getattr',
        'routes.api.auth.getattr',
        # Add more modules as needed
    ]

    for module_path in route_modules:
        p = patch(module_path, side_effect=mock_getattr)
        patches.append(p)
        p.start()

    client._patches = patches  # Keep reference to avoid garbage collection
    yield client

    # Stop patches
    for p in patches:
        p.stop()




@pytest.fixture(autouse=True)
def reset_database_binding():
    """
    Guarantee that each test starts and ends with the default project database
    binding. This prevents tests that temporarily rebind to a test database
    from affecting subsequent tests that expect the full schema.
    """
    create_app({"SQLALCHEMY_DATABASE_URI": DATABASE_URL})
    db.ensure()
    yield
    create_app({"SQLALCHEMY_DATABASE_URI": DATABASE_URL})
    db.ensure()
