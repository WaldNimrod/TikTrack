#!/usr/bin/env python3
"""
Create sample AI analysis records with cache simulation
This script creates analyses and simulates cache entries that would be created by the frontend
Usage: python3 Backend/scripts/create_sample_ai_analyses_with_cache.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import AIAnalysisRequest, AIPromptTemplate
from models.user import User
from models.note import Note
from config.settings import DATABASE_URL
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_sample_analyses_with_cache():
    """Create sample AI analysis records with cache and notes"""
    logger.info("=" * 70)
    logger.info("Creating sample AI analysis records with cache and notes")
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

        # Sample prompt text
        sample_prompt = template.prompt_text

        # Sample response text
        sample_response = """# ניתוח מחקר מניות - {ticker}

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

        # Create sample analyses
        created_analyses = []
        for i, vars_dict in enumerate(sample_variables):
            # All analyses are completed
            status = 'completed'
            
            # Create response text
            response_text = sample_response.format(ticker=vars_dict['stock_ticker'])
            
            analysis = AIAnalysisRequest(
                user_id=user.id,
                template_id=template.id,
                provider='gemini' if i < 2 else 'perplexity',
                variables_json=json.dumps(vars_dict),
                prompt_text=sample_prompt,
                response_text=response_text,  # This will be saved to cache by frontend
                status=status,
                created_at=datetime.now() - timedelta(hours=i*2)  # Stagger creation times
            )
            
            session.add(analysis)
            session.flush()  # Flush to get the ID
            session.refresh(analysis)
            
            created_analyses.append(analysis)
            logger.info(f"Created sample analysis #{i+1}: {vars_dict['stock_ticker']} - Status: {status}, ID: {analysis.id}")

        session.commit()
        logger.info(f"✅ Successfully created {len(created_analyses)} sample analyses")

        # Create a note for the second analysis (to simulate saved as note)
        if len(created_analyses) >= 2:
            analysis_with_note = created_analyses[1]  # Second analysis (TSLA)
            
            # Create note with markdown content (typical for AI analysis notes)
            note_content = f"""# ניתוח מחקר מניות - {analysis_with_note.variables_json}
            
## ניתוח פונדמנטלי

### צמיחת הכנסות
החברה מציגה צמיחה יציבה בהכנסות עם מגמה חיובית.

### רווחיות
הרווחיות הגולמית והנקייה מציגות שיפור משמעותי.

## אימות תזה

### טיעונים תומכים
1. ביצועים פיננסיים חזקים
2. מיקום תחרותי מוביל
3. צמיחה עתידית מבטיחה

### סיכונים מרכזיים
1. תנודתיות בשוק
2. לחץ תחרותי

## סיכום השקעה

**המלצה:** קנייה
**רמת ביטחון:** גבוהה
**תקופת זמן:** 6-12 חודשים
"""
            
            # Create note linked to a ticker (related_type_id=4 for ticker)
            # We'll use a dummy ticker_id=1, but in real scenario it would be the actual ticker
            note = Note(
                user_id=user.id,
                content=note_content,
                related_type_id=4,  # ticker
                related_id=1,  # dummy ticker ID
                created_at=analysis_with_note.created_at + timedelta(seconds=30)  # Created 30 seconds after analysis
            )
            
            session.add(note)
            session.commit()
            session.refresh(note)
            
            logger.info(f"✅ Created note for analysis ID {analysis_with_note.id}: Note ID {note.id}")
            logger.info(f"   Note created at: {note.created_at}")
            logger.info(f"   Analysis created at: {analysis_with_note.created_at}")
            logger.info(f"   Time difference: {(note.created_at - analysis_with_note.created_at).total_seconds()} seconds")

        logger.info("\n" + "=" * 70)
        logger.info("📋 Summary:")
        logger.info(f"   - Created {len(created_analyses)} analyses (all completed)")
        logger.info(f"   - Analysis 1 (AAPL): Should have cache (response_text in DB)")
        logger.info(f"   - Analysis 2 (TSLA): Should have note (created note)")
        logger.info(f"   - Analysis 3 (MSFT): Should have cache (response_text in DB)")
        logger.info("=" * 70)
        logger.info("\n💡 Note: Frontend will save response_text to UnifiedCacheManager")
        logger.info("   The cache key format is: ai-analysis-response-{analysis_id}")
        logger.info("=" * 70)

    except Exception as e:
        session.rollback()
        logger.error(f"Error creating sample analyses: {e}", exc_info=True)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    try:
        create_sample_analyses_with_cache()
        logger.info("Script finished successfully.")
    except Exception as e:
        logger.error(f"Script failed: {e}", exc_info=True)
        sys.exit(1)















