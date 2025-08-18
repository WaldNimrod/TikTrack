"""
Test Configuration for TikTrack Testing Suite
"""
import os
from pathlib import Path

# Base paths
TESTING_SUITE_DIR = Path(__file__).parent.parent
BACKEND_DIR = TESTING_SUITE_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Test database configuration
TEST_DATABASE_URL = "sqlite:///test_tiktrack.db"
TEST_DATABASE_PATH = TESTING_SUITE_DIR / "logs" / "test_tiktrack.db"

# Test server configuration
TEST_SERVER_HOST = "localhost"
TEST_SERVER_PORT = 8081  # Different from main server
TEST_SERVER_URL = f"http://{TEST_SERVER_HOST}:{TEST_SERVER_PORT}"

# Test data configuration
TEST_DATA_DIR = TESTING_SUITE_DIR / "test_data"
TEST_FIXTURES_DIR = TESTING_SUITE_DIR / "fixtures"

# Logging configuration
TEST_LOG_DIR = TESTING_SUITE_DIR / "logs"
TEST_LOG_LEVEL = "DEBUG"

# Coverage configuration
COVERAGE_DIR = TESTING_SUITE_DIR / "reports" / "htmlcov"
COVERAGE_REPORT_FILE = TESTING_SUITE_DIR / "reports" / "coverage.xml"

# Performance test configuration
PERFORMANCE_TEST_DURATION = 60  # seconds
PERFORMANCE_TEST_USERS = 10
PERFORMANCE_TEST_RAMP_UP = 10  # seconds

# Load test configuration
LOAD_TEST_DURATION = 300  # seconds
LOAD_TEST_USERS = 50
LOAD_TEST_RAMP_UP = 30  # seconds

# Security test configuration
SECURITY_TEST_TIMEOUT = 30  # seconds
SECURITY_TEST_RETRIES = 3

# Test markers
TEST_MARKERS = {
    "unit": "Unit tests",
    "integration": "Integration tests", 
    "e2e": "End-to-end tests",
    "performance": "Performance tests",
    "load": "Load tests",
    "security": "Security tests",
    "slow": "Slow running tests",
    "critical": "Critical tests",
    "smoke": "Smoke tests",
    "regression": "Regression tests"
}

# Test categories
TEST_CATEGORIES = {
    "unit": {
        "path": "unit_tests/",
        "description": "Unit tests for individual components",
        "timeout": 30
    },
    "integration": {
        "path": "integration_tests/",
        "description": "Integration tests for API and database",
        "timeout": 60
    },
    "e2e": {
        "path": "e2e_tests/",
        "description": "End-to-end workflow tests",
        "timeout": 120
    },
    "performance": {
        "path": "performance_tests/",
        "description": "Performance and benchmark tests",
        "timeout": 300
    },
    "load": {
        "path": "load_tests/",
        "description": "Load and stress tests",
        "timeout": 600
    },
    "security": {
        "path": "security_tests/",
        "description": "Security and vulnerability tests",
        "timeout": 180
    }
}

# Environment variables for tests
TEST_ENV_VARS = {
    "FLASK_ENV": "testing",
    "TESTING": "true",
    "DATABASE_URL": TEST_DATABASE_URL,
    "LOG_LEVEL": TEST_LOG_LEVEL,
    "SERVER_HOST": TEST_SERVER_HOST,
    "SERVER_PORT": str(TEST_SERVER_PORT)
}

def setup_test_environment():
    """Setup test environment variables"""
    for key, value in TEST_ENV_VARS.items():
        os.environ[key] = value

def create_test_directories():
    """Create necessary test directories"""
    directories = [
        TEST_LOG_DIR,
        TEST_DATA_DIR,
        TEST_FIXTURES_DIR,
        COVERAGE_DIR.parent,
        TESTING_SUITE_DIR / "reports"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

def get_test_config(category=None):
    """Get test configuration for specific category"""
    if category and category in TEST_CATEGORIES:
        return TEST_CATEGORIES[category]
    return TEST_CATEGORIES

def get_test_paths():
    """Get all test paths"""
    return {
        category: TESTING_SUITE_DIR / config["path"]
        for category, config in TEST_CATEGORIES.items()
    }
