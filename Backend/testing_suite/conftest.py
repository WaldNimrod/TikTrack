"""
Pytest configuration and fixtures for TikTrack Backend tests
"""
import pytest
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import app
from config.database import init_db, SessionLocal

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        yield client

@pytest.fixture
def runner():
    """Create a test CLI runner for the Flask app"""
    return app.test_cli_runner()

@pytest.fixture
def test_db():
    """Create a temporary test database"""
    # Create a temporary database file
    db_fd, db_path = tempfile.mkstemp()
    
    # Initialize the test database
    init_db()
    
    yield db_path
    
    # Clean up
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def db_session(test_db):
    """Create a database session for testing"""
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture
def auth_headers():
    """Return headers for authenticated requests"""
    return {
        'Authorization': 'Bearer test_token',
        'Content-Type': 'application/json'
    }
