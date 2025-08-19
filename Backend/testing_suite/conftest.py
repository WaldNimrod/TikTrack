"""
Pytest configuration and fixtures for TikTrack testing suite
"""
import pytest
import tempfile
import shutil
import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Import the app after setting up test environment
from app import app

@pytest.fixture(scope="session")
def test_database():
    """
    Create a temporary test database that is a copy of the production database.
    This ensures tests run on real data structure but don't affect production data.
    """
    # Get the production database path
    production_db_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 
        'db', 
        'simpleTrade_new.db'
    )
    
    # Create a temporary database file
    temp_db_fd, temp_db_path = tempfile.mkstemp(suffix='.db')
    os.close(temp_db_fd)
    
    try:
        # Copy the production database to the temporary location
        if os.path.exists(production_db_path):
            shutil.copy2(production_db_path, temp_db_path)
            print(f"✅ Test database created from production: {temp_db_path}")
        else:
            print(f"⚠️ Production database not found at {production_db_path}")
            # Create a minimal test database if production doesn't exist
            conn = sqlite3.connect(temp_db_path)
            conn.close()
        
        # Set environment variable for the test database
        os.environ['TEST_DATABASE_PATH'] = temp_db_path
        
        yield temp_db_path
        
    finally:
        # Clean up the temporary database
        if os.path.exists(temp_db_path):
            os.unlink(temp_db_path)
            print(f"🧹 Test database cleaned up: {temp_db_path}")

@pytest.fixture(scope="function")
def db_session(test_database):
    """
    Create a database session for each test function.
    Uses the temporary test database to ensure isolation.
    """
    # Create engine for the test database
    engine = create_engine(
        f'sqlite:///{test_database}',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool
    )
    
    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create session
    session = SessionLocal()
    
    try:
        yield session
    finally:
        # Rollback any uncommitted changes
        session.rollback()
        session.close()

@pytest.fixture(scope="function")
def client():
    """
    Create a test client for the Flask app.
    """
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        yield client

@pytest.fixture(scope="function")
def app_context():
    """
    Create an application context for testing.
    """
    with app.app_context():
        yield app

@pytest.fixture
def runner():
    """Create a test CLI runner for the Flask app"""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers():
    """Return headers for authenticated requests"""
    return {
        'Authorization': 'Bearer test_token',
        'Content-Type': 'application/json'
    }
