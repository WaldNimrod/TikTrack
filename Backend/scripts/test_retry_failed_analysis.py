#!/usr/bin/env python3
"""
Test Retry Failed Analysis
==========================
Test script to retry a failed AI analysis and verify the retry mechanism works

Date: 2025-12-04
"""

import sys
import os
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.ai_analysis_service import AIAnalysisService
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_retry_analysis(request_id: int, user_id: int):
    """Test retrying a failed analysis"""
    db: Session = SessionLocal()
    service = AIAnalysisService()
    
    try:
        logger.info(f"🔍 Testing retry for analysis {request_id} (user {user_id})")
        
        # Get analysis before retry
        analysis_before = service.get_analysis_by_id(db, request_id, user_id)
        if not analysis_before:
            logger.error(f"❌ Analysis {request_id} not found")
            return False
        
        logger.info(f"📊 Analysis before retry:")
        logger.info(f"   Status: {analysis_before.status}")
        logger.info(f"   Error: {analysis_before.error_message}")
        logger.info(f"   Retry count: {getattr(analysis_before, 'retry_count', 0)}")
        
        if analysis_before.status != 'failed':
            logger.warning(f"⚠️  Analysis {request_id} is not in 'failed' status (current: {analysis_before.status})")
            return False
        
        # Retry the analysis
        logger.info(f"🔄 Retrying analysis {request_id}...")
        analysis_after = service.retry_failed_analysis(
            db=db,
            request_id=request_id,
            user_id=user_id,
            max_retries=3,
            use_fallback_provider=True
        )
        
        logger.info(f"📊 Analysis after retry:")
        logger.info(f"   Status: {analysis_after.status}")
        logger.info(f"   Error: {analysis_after.error_message}")
        logger.info(f"   Retry count: {getattr(analysis_after, 'retry_count', 0)}")
        logger.info(f"   Provider: {analysis_after.provider}")
        
        if analysis_after.status == 'completed':
            logger.info(f"✅ Retry successful! Analysis {request_id} completed")
            return True
        elif analysis_after.status == 'failed':
            logger.warning(f"⚠️  Retry failed. Error: {analysis_after.error_message}")
            return False
        else:
            logger.info(f"⏳ Analysis is in '{analysis_after.status}' status (may still be processing)")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error testing retry: {e}", exc_info=True)
        return False
    finally:
        db.close()


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test retry failed analysis')
    parser.add_argument('--request-id', type=int, required=True, help='Analysis request ID to retry')
    parser.add_argument('--user-id', type=int, required=True, help='User ID')
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("Test Retry Failed Analysis")
    logger.info("=" * 60)
    
    success = test_retry_analysis(args.request_id, args.user_id)
    
    if success:
        logger.info("\n🎉 Test completed successfully!")
        return 0
    else:
        logger.error("\n❌ Test failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())

