#!/usr/bin/env python3
"""
AI Templates Migration Script
================================
Runs seed_ai_prompt_templates.py migration on all databases:
1. Development database
2. Production database  
3. Demo database

Process:
1. Run on development DB
2. Validate results
3. If valid, run on production and demo DBs
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import logging
from typing import Dict, Any, Optional

# Import the migration and seed functions
from migrations.create_ai_analysis_tables import create_ai_analysis_tables
from migrations.seed_ai_prompt_templates import seed_templates

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Database configuration for different environments"""
    
    DEVELOPMENT = {
        'name': 'Development',
        'env_prefix': 'POSTGRES',
        'db_name': 'TikTrack-db-development',
        'user': 'TikTrakDBAdmin',
        'password': 'BigMeZoo1974!?'
    }
    
    PRODUCTION = {
        'name': 'Production',
        'env_prefix': 'POSTGRES_PROD',
        'db_name': 'TikTrack-db-production',
        'user': 'TikTrakDBAdmin',
        'password': 'BigMeZoo1974!?'
    }
    
    DEMO = {
        'name': 'Demo',
        'env_prefix': 'POSTGRES_DEMO',
        'db_name': 'TikTrack-db-cleanup-test',
        'user': 'TikTrakDBAdmin',
        'password': 'BigMeZoo1974!?'
    }


def get_db_connection_string(config: Dict[str, Any]) -> str:
    """
    Get database connection string from environment variables or config defaults
    
    Args:
        config: Database configuration dict
        
    Returns:
        Connection string
    """
    prefix = config['env_prefix']
    
    host = os.getenv(f'{prefix}_HOST', 'localhost')
    port = os.getenv(f'{prefix}_PORT', '5432')
    db_name = os.getenv(f'{prefix}_DB', config['db_name'])
    user = os.getenv(f'{prefix}_USER', config.get('user', 'TikTrakDBAdmin'))
    password = os.getenv(f'{prefix}_PASSWORD', config.get('password', 'BigMeZoo1974!?'))
    
    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"


def validate_templates(db_session) -> tuple[bool, str]:
    """
    Validate that templates were seeded correctly
    
    Args:
        db_session: Database session
        
    Returns:
        Tuple of (is_valid, message)
    """
    try:
        # Check if templates exist
        result = db_session.execute(text("""
            SELECT COUNT(*) as count, 
                   COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
            FROM ai_prompt_templates
        """))
        
        row = result.fetchone()
        total_count = row[0] if row else 0
        active_count = row[1] if row else 0
        
        if total_count == 0:
            return False, "No templates found in database"
        
        # Check for Equity Research template specifically
        result = db_session.execute(text("""
            SELECT id, name, name_he, variables_json
            FROM ai_prompt_templates
            WHERE name = 'Equity Research Analysis'
            LIMIT 1
        """))
        
        template = result.fetchone()
        if not template:
            return False, "Equity Research Analysis template not found"
        
        # Check if variables_json contains the new structure
        import json
        try:
            variables = json.loads(template[3]) if template[3] else {}
            variables_list = variables.get('variables', [])
            
            if not variables_list:
                return False, "Template variables_json is empty"
            
            # Check for stock_ticker variable
            stock_ticker_var = next(
                (v for v in variables_list if v.get('key') == 'stock_ticker'),
                None
            )
            
            if not stock_ticker_var:
                return False, "stock_ticker variable not found in template"
            
            # Check if it's a select type
            if stock_ticker_var.get('type') != 'select':
                return False, f"stock_ticker should be 'select' but is '{stock_ticker_var.get('type')}'"
            
            # Check for investment_thesis variable
            thesis_var = next(
                (v for v in variables_list if v.get('key') == 'investment_thesis'),
                None
            )
            
            if not thesis_var:
                return False, "investment_thesis variable not found in template"
            
            if thesis_var.get('type') != 'select':
                return False, f"investment_thesis should be 'select' but is '{thesis_var.get('type')}'"
            
            # Check for goal variable
            goal_var = next(
                (v for v in variables_list if v.get('key') == 'goal'),
                None
            )
            
            if not goal_var:
                return False, "goal variable not found in template"
            
            if goal_var.get('type') != 'select':
                return False, f"goal should be 'select' but is '{goal_var.get('type')}'"
            
            # Check if goal has options
            if not goal_var.get('options') or len(goal_var.get('options', [])) == 0:
                return False, "goal variable should have options"
            
            logger.info(f"✅ Validation passed: {total_count} templates ({active_count} active)")
            return True, f"Validation passed: {total_count} templates ({active_count} active), Equity Research template updated correctly"
            
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON in variables_json: {e}"
            
    except Exception as e:
        logger.error(f"Validation error: {e}", exc_info=True)
        return False, f"Validation error: {str(e)}"


def run_migration_on_database(config: Dict[str, Any], validate: bool = True) -> tuple[bool, str]:
    """
    Run migration on a specific database
    
    Args:
        config: Database configuration
        validate: Whether to validate after migration
        
    Returns:
        Tuple of (success, message)
    """
    db_name = config['name']
    logger.info(f"🔄 Starting migration on {db_name} database...")
    
    try:
        # Get connection string
        connection_string = get_db_connection_string(config)
        logger.info(f"   Connecting to: {config['db_name']}")
        
        # Create engine and session
        engine = create_engine(connection_string)
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        try:
            # First, ensure tables exist (create if needed)
            logger.info(f"   Checking/creating AI Analysis tables...")
            from sqlalchemy import inspect, text
            
            inspector = inspect(engine)
            
            # Check and create ai_prompt_templates table
            if 'ai_prompt_templates' not in inspector.get_table_names():
                logger.info("   Creating ai_prompt_templates table...")
                db_session.execute(text("""
                    CREATE TABLE ai_prompt_templates (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        name_he VARCHAR(100) NOT NULL,
                        description TEXT,
                        prompt_text TEXT NOT NULL,
                        variables_json TEXT NOT NULL,
                        is_active BOOLEAN DEFAULT TRUE NOT NULL,
                        sort_order INTEGER DEFAULT 0 NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                    )
                """))
                logger.info("   ✅ Created ai_prompt_templates table")
            else:
                logger.info("   ⏭️  ai_prompt_templates table already exists")
            
            db_session.commit()
            
            # Then run seed function with update_existing=True
            seed_templates(db_session, update_existing=True)
            db_session.commit()
            
            logger.info(f"✅ Migration completed on {db_name} database")
            
            # Validate if requested
            if validate:
                is_valid, message = validate_templates(db_session)
                if not is_valid:
                    logger.error(f"❌ Validation failed on {db_name}: {message}")
                    return False, message
                logger.info(f"✅ Validation passed on {db_name}: {message}")
            
            return True, f"Migration and validation successful on {db_name}"
            
        except Exception as e:
            db_session.rollback()
            logger.error(f"❌ Migration failed on {db_name}: {e}", exc_info=True)
            return False, f"Migration failed: {str(e)}"
        finally:
            db_session.close()
            engine.dispose()
            
    except Exception as e:
        logger.error(f"❌ Connection error on {db_name}: {e}", exc_info=True)
        return False, f"Connection error: {str(e)}"


def main():
    """Main migration process"""
    logger.info("=" * 60)
    logger.info("🚀 AI Templates Migration Script")
    logger.info("=" * 60)
    
    results = {}
    
    # Step 1: Run on Development
    logger.info("\n📦 Step 1: Running migration on Development database...")
    success, message = run_migration_on_database(
        DatabaseConfig.DEVELOPMENT,
        validate=True
    )
    results['development'] = (success, message)
    
    if not success:
        logger.error("\n❌ Migration failed on Development database!")
        logger.error("   Stopping process - Production and Demo will not be updated")
        logger.error(f"   Error: {message}")
        sys.exit(1)
    
    logger.info("\n✅ Development migration successful!")
    logger.info("   Proceeding to Production database...")
    
    # Step 2: Run on Production
    logger.info("\n📦 Step 2: Running migration on Production database...")
    success, message = run_migration_on_database(
        DatabaseConfig.PRODUCTION,
        validate=True
    )
    results['production'] = (success, message)
    
    if not success:
        logger.warning(f"\n⚠️  Migration failed on Production: {message}")
        logger.warning("   This may be expected if the table doesn't exist yet")
    
    # Step 3: Run on Demo
    logger.info("\n📦 Step 3: Running migration on Demo database...")
    success, message = run_migration_on_database(
        DatabaseConfig.DEMO,
        validate=True
    )
    results['demo'] = (success, message)
    
    if not success:
        logger.warning(f"\n⚠️  Migration failed on Demo: {message}")
        logger.warning("   This may be expected if the table doesn't exist yet")
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 Migration Summary")
    logger.info("=" * 60)
    
    for db_name, (success, message) in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        logger.info(f"{status} - {db_name.capitalize()}: {message}")
    
    # Exit code
    all_success = all(success for success, _ in results.values())
    if not all_success:
        logger.warning("\n⚠️  Some migrations failed - check logs above")
        sys.exit(1)
    
    logger.info("\n✅ All migrations completed successfully!")
    sys.exit(0)


if __name__ == '__main__':
    main()

