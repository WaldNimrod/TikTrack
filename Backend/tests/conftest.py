"""
Pytest configuration and fixtures
"""
import pytest
import tempfile
import os
from pathlib import Path
from app_new import create_app
from config.database import init_db, get_db
from models.base import Base
from sqlalchemy import create_engine

@pytest.fixture
def app():
    """Create application for testing"""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    # Create test app
    app = create_app()
    app.config['TESTING'] = True
    app.config['DATABASE_URL'] = f"sqlite:///{db_path}"
    
    # Create test database
    with app.app_context():
        init_db()
        yield app
    
    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test runner"""
    return app.test_cli_runner()

@pytest.fixture
def db_session(app):
    """Create database session for testing"""
    with app.app_context():
        db_gen = get_db()
        session = next(db_gen)
        yield session
        try:
            next(db_gen)  # Close the generator
        except StopIteration:
            pass

@pytest.fixture
def auth_headers():
    """Create authentication headers for testing"""
    return {
        'Authorization': 'Bearer test_token',
        'Content-Type': 'application/json'
    }
