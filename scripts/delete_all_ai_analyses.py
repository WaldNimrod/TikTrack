#!/usr/bin/env python3
"""
Delete all AI analysis records directly from database
Usage: python3 scripts/delete_all_ai_analyses.py
"""

import sys
import os

# Set PostgreSQL environment variables (same as start_server.sh)
workspace_name = os.path.basename(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if workspace_name == 'TikTrackApp-Production':
    os.environ.setdefault('POSTGRES_HOST', 'localhost')
    os.environ.setdefault('POSTGRES_DB', 'TikTrack-db-production')
    os.environ.setdefault('POSTGRES_USER', 'TikTrakDBAdmin')
    os.environ.setdefault('POSTGRES_PASSWORD', 'BigMeZoo1974!?')
else:
    # Development environment
    os.environ.setdefault('POSTGRES_HOST', 'localhost')
    os.environ.setdefault('POSTGRES_DB', 'TikTrack-db-development')
    os.environ.setdefault('POSTGRES_USER', 'TikTrakDBAdmin')
    os.environ.setdefault('POSTGRES_PASSWORD', 'BigMeZoo1974!?')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import AIAnalysisRequest
from config.settings import DATABASE_URL
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def delete_all_analyses():
    """Delete all AI analysis records"""
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Count existing records
        count = session.query(AIAnalysisRequest).count()
        logger.info(f"Found {count} analyses to delete")
        
        if count == 0:
            logger.info("No analyses to delete")
            return
        
        # Delete all records
        deleted_count = session.query(AIAnalysisRequest).delete(synchronize_session=False)
        session.commit()
        
        logger.info(f"✅ Successfully deleted {deleted_count} analyses")
        
    except Exception as e:
        logger.error(f"❌ Error deleting analyses: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🗑️  Deleting all AI analysis records...")
    delete_all_analyses()
    print("✅ Done!")
