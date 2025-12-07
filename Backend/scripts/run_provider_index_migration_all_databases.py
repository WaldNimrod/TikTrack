#!/usr/bin/env python3
"""
Provider Index Migration - All Databases
=========================================
Runs the add_provider_index migration on all configured databases:
1. Development database (TikTrack-db-development)
2. Production database (TikTrack-db-production)
3. Cleanup-Test database (TikTrack-db-cleanup-test)

This script ensures the 'provider' index is added to the 'ai_analysis_requests'
table in all relevant environments.
"""

import sys
import os
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import logging
from typing import Dict, Any

# Import the specific migration function
from migrations.add_provider_index_to_ai_analysis import add_provider_index

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Database configuration for different environments"""

    DEVELOPMENT = {
        'name': 'development',
        'db_name': 'TikTrack-db-development',
        'user': 'TikTrakDBAdmin',
        'password': 'BigMeZoo1974!?'
    }

    PRODUCTION = {
        'name': 'production',
        'db_name': 'TikTrack-db-production',
        'user': 'TikTrakDBAdmin',
        'password': 'BigMeZoo1974!?'
    }

    CLEANUP_TEST = {
        'name': 'cleanup-test',
        'db_name': 'TikTrack-db-cleanup-test',
        'user': 'TikTrakDBAdmin',
        'password': 'BigMeZoo1974!?'
    }


def get_db_connection_string(config: Dict[str, Any]) -> str:
    """
    Get database connection string from environment variables or config defaults.
    Assumes Docker setup where host is 'localhost' for scripts run outside Docker
    but connecting to Docker-exposed ports.
    """
    host = os.getenv('POSTGRES_HOST', 'localhost')
    port = os.getenv('POSTGRES_PORT', '5432')
    db_name = config['db_name']
    user = config['user']
    password = config['password']

    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"


def run_migration_on_database(config: Dict[str, Any]) -> tuple[bool, str]:
    """
    Runs the add_provider_index migration on a specific database.
    """
    db_name = config['db_name']
    logger.info(f"\n============================================================")
    logger.info(f"📦 Running migration on: {config['name']} ({db_name})")
    logger.info(f"============================================================")

    db_url = get_db_connection_string(config)
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db: Session = SessionLocal()

    try:
        logger.info(f"✅ Connected to {db_name}")
        add_provider_index(db, db_name)
        return True, f"Migration successful on {db_name}"
    except Exception as e:
        logger.error(f"❌ Migration failed on {db_name}: {e}", exc_info=True)
        return False, f"Migration failed on {db_name}: {e}"
    finally:
        db.close()


def main():
    """Main migration process to run on all databases."""
    logger.info("=" * 60)
    logger.info("🚀 Provider Index Migration - All Databases")
    logger.info("=" * 60)

    databases_to_migrate = [
        DatabaseConfig.DEVELOPMENT,
        DatabaseConfig.PRODUCTION,
        DatabaseConfig.CLEANUP_TEST
    ]

    results = {}
    for db_config in databases_to_migrate:
        success, message = run_migration_on_database(db_config)
        results[db_config['name']] = (success, message)

    logger.info(f"\n============================================================")
    logger.info(f"📊 Migration Summary")
    logger.info(f"============================================================")

    all_passed = True
    for db_name, (success, message) in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"  {status}: {db_name} - {message}")
        if not success:
            all_passed = False

    total_databases = len(databases_to_migrate)
    passed_databases = sum(1 for db_name, (success, _) in results.items() if success)

    logger.info(f"\nTotal: {passed_databases}/{total_databases} databases migrated successfully")

    if all_passed:
        logger.info("\n🎉 All migrations completed successfully!")
        sys.exit(0)
    else:
        logger.error("\n❌ Some migrations failed. Please check logs for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()


