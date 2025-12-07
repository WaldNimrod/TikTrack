#!/usr/bin/env python3
"""
Clean all AI analysis data completely - Database + Cache
Usage: python3 scripts/clean_ai_analysis_completely.py
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

def clean_all_ai_analysis():
    """Delete all AI analysis records from database"""
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Count existing records
        count = session.query(AIAnalysisRequest).count()
        logger.info(f"Found {count} analyses to delete")
        
        if count == 0:
            logger.info("No analyses to delete - database is already clean")
            return 0
        
        # Delete all records
        deleted_count = session.query(AIAnalysisRequest).delete(synchronize_session=False)
        session.commit()
        
        logger.info(f"✅ Successfully deleted {deleted_count} analyses from database")
        return deleted_count
        
    except Exception as e:
        logger.error(f"❌ Error deleting analyses: {e}", exc_info=True)
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🧹 Cleaning all AI analysis data...")
    print("=" * 50)
    print("Step 1: Deleting from database...")
    deleted = clean_all_ai_analysis()
    print(f"✅ Deleted {deleted} records from database")
    print("")
    print("Step 2: Cache cleanup")
    print("⚠️  Note: Frontend cache will be cleared when you refresh the page")
    print("   Or run in browser console:")
    print("   window.UnifiedCacheManager?.clearByPattern?.('ai-analysis-response-*')")
    print("   window.UnifiedCacheManager?.invalidate?.('ai-analysis-history')")
    print("")
    print("=" * 50)
    print("✅ Database cleanup complete!")
    print("💡 Refresh the page to clear frontend cache automatically")




