#!/usr/bin/env python3
"""
Create sample AI analysis records for testing
Usage: python3 Backend/scripts/create_sample_ai_analyses.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import AIAnalysisRequest, AIPromptTemplate
from models.user import User
from config.settings import DATABASE_URL
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_sample_analyses():
    """Create sample AI analysis records"""
    logger.info("=" * 70)
    logger.info("Creating sample AI analysis records")
    logger.info("=" * 70)

    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Get user (default to user_id=1)
        user = session.scalars(select(User).where(User.id == 1)).first()
        if not user:
            logger.error("User with ID 1 not found. Please create a user first.")
            return

        # Get first active template
        template = session.scalars(
            select(AIPromptTemplate).where(AIPromptTemplate.is_active == True)
        ).first()
        
        if not template:
            logger.error("No active template found. Please seed templates first.")
            return

        logger.info(f"Using template: {template.name} (ID: {template.id})")
        logger.info(f"Using user: {user.username} (ID: {user.id})")

        # Sample variables for different analyses
        sample_variables = [
            {
                "stock_ticker": "AAPL",
                "goal": "ניתוח פונדמנטלי מעמיק",
                "investment_thesis": "דוחות כספיים חזקים - צמיחה בהכנסות וברווחיות",
                "response_language": "hebrew"
            },
            {
                "stock_ticker": "TSLA",
                "goal": "ניתוח טכני ומגמות",
                "investment_thesis": "שיפור בתחזיות - עלייה בהערכות אנליסטים",
                "response_language": "hebrew"
            },
            {
                "stock_ticker": "MSFT",
                "goal": "ניתוח תחרותי ומיקום שוק",
                "investment_thesis": "חדשות חיוביות - השקת מוצר/שירות חדש או חוזה גדול",
                "response_language": "english"
            }
        ]

        # Sample prompt text (simplified)
        sample_prompt = template.prompt_text

        # Create sample analyses
        created_count = 0
        for i, vars_dict in enumerate(sample_variables):
            # Create analysis with different statuses
            status = 'completed' if i < 2 else 'pending'
            
            # Create sample response text (only for completed)
            response_text = None
            if status == 'completed':
                response_text = f"""# ניתוח מחקר מניות - {vars_dict['stock_ticker']}

## 1. ניתוח פונדמנטלי

### צמיחת הכנסות
החברה מציגה צמיחה יציבה בהכנסות עם מגמה חיובית.

### רווחיות
הרווחיות הגולמית והנקייה מציגות שיפור משמעותי.

## 2. אימות תזה

### טיעונים תומכים
1. ביצועים פיננסיים חזקים
2. מיקום תחרותי מוביל
3. צמיחה עתידית מבטיחה

### סיכונים מרכזיים
1. תנודתיות בשוק
2. לחץ תחרותי

## 3. סיכום השקעה

**המלצה:** קנייה
**רמת ביטחון:** גבוהה
**תקופת זמן:** 6-12 חודשים
"""

            analysis = AIAnalysisRequest(
                user_id=user.id,
                template_id=template.id,
                provider='gemini' if i < 2 else 'perplexity',
                variables_json=json.dumps(vars_dict),
                prompt_text=sample_prompt,
                response_text=response_text,
                status=status,
                created_at=datetime.now() - timedelta(hours=i*2)  # Stagger creation times
            )
            
            session.add(analysis)
            created_count += 1
            
            logger.info(f"Created sample analysis #{i+1}: {vars_dict['stock_ticker']} - Status: {status}")

        session.commit()
        logger.info(f"✅ Successfully created {created_count} sample analyses")

        # Create one analysis saved as note (simulate)
        logger.info("\n" + "=" * 70)
        logger.info("Note: To create an analysis saved as note, you need to:")
        logger.info("1. Run an analysis through the UI")
        logger.info("2. Click 'Save as Note' in the results modal")
        logger.info("=" * 70)

    except Exception as e:
        session.rollback()
        logger.error(f"Error creating sample analyses: {e}", exc_info=True)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    try:
        create_sample_analyses()
        logger.info("Script finished successfully.")
    except Exception as e:
        logger.error(f"Script failed: {e}", exc_info=True)
        sys.exit(1)















