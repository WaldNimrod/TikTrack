#!/usr/bin/env python3
"""
Simple E2E Test for AI Analysis - Creates multiple analyses and verifies they are saved
בדיקה פשוטה - יוצר ניתוחים ומאמת שמירה בבסיס הנתונים
"""

import os
import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent / "Backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.ai_analysis import AIAnalysisRequest, AIPromptTemplate
from models.user import User
from services.ai_analysis_service import AIAnalysisService
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def get_test_user(db: Session):
    """מצא משתמש לבדיקה"""
    user = db.query(User).first()
    if not user:
        logger.error("❌ No users found in database")
        return None
    return user


def test_create_portfolio_analysis_all_trades(db: Session, user_id: int, service: AIAnalysisService):
    """בדיקת יצירת ניתוח Portfolio - כל הטריידים"""
    logger.info("\n" + "="*60)
    logger.info("Test 1: Portfolio Performance - All Trades")
    logger.info("="*60)
    
    try:
        variables = {
            "version": "2.0",
            "prompt_variables": {
                "ticker_symbol": "",
                "date_range": "",
                "analysis_focus": "Performance Review",
                "investment_type_filter": "",
                "response_language": "hebrew"
            },
            "filters": {},
            "trade_selection": {
                "type": "all"
            },
            "metadata": {
                "analysis_scope": "portfolio_performance",
                "trade_selection_type": "all"
            }
        }
        
        # רק ליצור את הרשומה ב-pending - לא לשלוח למנוע
        template = db.query(AIPromptTemplate).filter(AIPromptTemplate.id == 3).first()
        if not template:
            logger.error("❌ Template 3 not found")
            return False
        
        from models.ai_analysis import AIAnalysisRequest as Request
        request = Request(
            user_id=user_id,
            template_id=3,
            provider='gemini',
            variables_json=json.dumps(variables, ensure_ascii=False),
            prompt_text="Test prompt",
            status='pending'
        )
        db.add(request)
        db.commit()
        db.refresh(request)
        
        logger.info(f"✅ Created analysis request ID: {request.id}")
        logger.info(f"   Variables: {json.dumps(variables, indent=2, ensure_ascii=False)}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}", exc_info=True)
        db.rollback()
        return False


def test_create_portfolio_analysis_filtered(db: Session, user_id: int):
    """בדיקת יצירת ניתוח Portfolio - עם פילטרים"""
    logger.info("\n" + "="*60)
    logger.info("Test 2: Portfolio Performance - Filtered")
    logger.info("="*60)
    
    try:
        variables = {
            "version": "2.0",
            "prompt_variables": {
                "ticker_symbol": "",
                "date_range": "2024-01-01 - 2024-12-31",
                "analysis_focus": "Risk Assessment",
                "investment_type_filter": "Swing Trading",
                "response_language": "hebrew"
            },
            "filters": {
                "trading_account_id": None  # Not set
            },
            "trade_selection": {
                "type": "filtered"
            },
            "metadata": {
                "analysis_scope": "portfolio_performance",
                "trade_selection_type": "filtered"
            }
        }
        
        from models.ai_analysis import AIAnalysisRequest
        request = AIAnalysisRequest(
            user_id=user_id,
            template_id=3,
            provider='gemini',
            variables_json=json.dumps(variables, ensure_ascii=False),
            prompt_text="Test prompt filtered",
            status='pending'
        )
        db.add(request)
        db.commit()
        db.refresh(request)
        
        logger.info(f"✅ Created analysis request ID: {request.id}")
        logger.info(f"   Trade selection type: {variables['trade_selection']['type']}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}", exc_info=True)
        db.rollback()
        return False


def test_create_technical_analysis(db: Session, user_id: int):
    """בדיקת יצירת ניתוח Technical"""
    logger.info("\n" + "="*60)
    logger.info("Test 3: Technical Analysis")
    logger.info("="*60)
    
    try:
        variables = {
            "version": "2.0",
            "prompt_variables": {
                "stock_ticker": "",
                "time_frame": "1 month",
                "technical_indicators": "",
                "chart_pattern_focus": "Support/Resistance",
                "investment_type": "Swing Trading",
                "response_language": "hebrew"
            },
            "filters": {},
            "trade_selection": {},
            "metadata": {
                "analysis_scope": "technical_analysis"
            }
        }
        
        from models.ai_analysis import AIAnalysisRequest
        request = AIAnalysisRequest(
            user_id=user_id,
            template_id=2,
            provider='gemini',
            variables_json=json.dumps(variables, ensure_ascii=False),
            prompt_text="Test technical prompt",
            status='pending'
        )
        db.add(request)
        db.commit()
        db.refresh(request)
        
        logger.info(f"✅ Created analysis request ID: {request.id}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}", exc_info=True)
        db.rollback()
        return False


def test_create_risk_analysis(db: Session, user_id: int):
    """בדיקת יצירת ניתוח Risk & Conditions"""
    logger.info("\n" + "="*60)
    logger.info("Test 4: Risk & Conditions Analysis")
    logger.info("="*60)
    
    try:
        variables = {
            "version": "2.0",
            "prompt_variables": {
                "ticker_symbol": "",
                "trade_plan_id": "",
                "trade_id": "",
                "condition_focus": "",
                "investment_type": "Swing Trading",
                "response_language": "hebrew"
            },
            "filters": {},
            "trade_selection": {},
            "metadata": {
                "analysis_scope": "risk_conditions"
            }
        }
        
        from models.ai_analysis import AIAnalysisRequest
        request = AIAnalysisRequest(
            user_id=user_id,
            template_id=4,
            provider='gemini',
            variables_json=json.dumps(variables, ensure_ascii=False),
            prompt_text="Test risk prompt",
            status='pending'
        )
        db.add(request)
        db.commit()
        db.refresh(request)
        
        logger.info(f"✅ Created analysis request ID: {request.id}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}", exc_info=True)
        db.rollback()
        return False


def verify_analyses_saved(db: Session, user_id: int):
    """אימות שהניתוחים נשמרו"""
    logger.info("\n" + "="*60)
    logger.info("Verifying Saved Analyses")
    logger.info("="*60)
    
    analyses = db.query(AIAnalysisRequest).filter(
        AIAnalysisRequest.user_id == user_id
    ).order_by(AIAnalysisRequest.created_at.desc()).limit(10).all()
    
    logger.info(f"📊 Found {len(analyses)} analyses for user {user_id}")
    
    for analysis in analyses:
        try:
            vars_data = json.loads(analysis.variables_json) if isinstance(analysis.variables_json, str) else analysis.variables_json
            template = db.query(AIPromptTemplate).filter(AIPromptTemplate.id == analysis.template_id).first()
            template_name = template.name_he if template else f"Template {analysis.template_id}"
            
            logger.info(f"\n  Analysis ID: {analysis.id}")
            logger.info(f"    Template: {template_name}")
            logger.info(f"    Status: {analysis.status}")
            logger.info(f"    Version: {vars_data.get('version', 'legacy')}")
            logger.info(f"    Trade Selection: {vars_data.get('trade_selection', {}).get('type', 'N/A')}")
            logger.info(f"    Created: {analysis.created_at}")
            
        except Exception as e:
            logger.warning(f"  ⚠️ Error parsing analysis {analysis.id}: {e}")
    
    return len(analyses) > 0


def main():
    """הרצת כל הבדיקות"""
    db: Session = SessionLocal()
    
    try:
        user = get_test_user(db)
        if not user:
            return
        
        user_id = user.id
        logger.info(f"🧪 Testing with user_id: {user_id}")
        
        service = AIAnalysisService()
        
        # הרצת בדיקות
        tests = [
            lambda: test_create_portfolio_analysis_all_trades(db, user_id, service),
            lambda: test_create_portfolio_analysis_filtered(db, user_id),
            lambda: test_create_technical_analysis(db, user_id),
            lambda: test_create_risk_analysis(db, user_id)
        ]
        
        results = []
        for test in tests:
            try:
                result = test()
                results.append(result)
            except Exception as e:
                logger.error(f"❌ Test crashed: {e}", exc_info=True)
                results.append(False)
        
        # אימות שמירה
        verify_analyses_saved(db, user_id)
        
        # סיכום
        logger.info("\n" + "="*60)
        logger.info("Test Summary")
        logger.info("="*60)
        passed = sum(results)
        total = len(results)
        logger.info(f"✅ Passed: {passed}/{total}")
        
        if passed == total:
            logger.info("🎉 All tests passed!")
        else:
            logger.warning(f"⚠️ {total - passed} test(s) failed")
        
    except Exception as e:
        logger.error(f"❌ Test suite failed: {e}", exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()


