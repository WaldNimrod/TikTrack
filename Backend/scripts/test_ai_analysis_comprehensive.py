#!/usr/bin/env python3
"""
Comprehensive AI Analysis Testing Script
Tests all analysis templates with different tickers and note linking to all object types
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from models.ai_analysis import AIAnalysisRequest
from models.note import Note
from config.database import db
from services.ai_analysis_service import AIAnalysisService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test configuration
ADMIN_USER_ID = 10

# Template IDs and names
TEMPLATES = [
    (1, "ניתוח מחקר הון", "AAPL"),
    (2, "ניתוח טכני מעמיק", "ADBE"),
    (3, "ניתוח ביצועים ופורטפוליו", "AMZN"),
    (4, "ניתוח סיכונים ותנאים", "AXP")
]

# Note relation types and test objects
NOTE_RELATION_TYPES = [
    (1, "חשבון מסחר", 14),  # trading_account_id
    (2, "טרייד", 169),  # trade_id
    (3, "תוכנית השקעה", 364),  # trade_plan_id
    (4, "טיקר", 433)  # ticker_id (AAPL)
]


def get_ticker_id(symbol: str) -> int:
    """Get ticker ID by symbol"""
    from models.ticker import Ticker
    ticker = Ticker.query.filter_by(symbol=symbol).first()
    if not ticker:
        raise ValueError(f"Ticker {symbol} not found")
    return ticker.id


def create_analysis(template_id: int, template_name: str, ticker_symbol: str):
    """Create an AI analysis for testing"""
    logger.info(f"Creating analysis: {template_name} for {ticker_symbol}")
    
    ticker_id = get_ticker_id(ticker_symbol)
    
    # Prepare variables based on template
    variables = {}
    if template_id == 1:  # Equity Research
        variables = {
            "stock_ticker": ticker_symbol,
            "investment_thesis": f"תוכנית swing עבור {ticker_symbol}",
            "goal": "השקעה ארוכת טווח - בניית פורטפוליו יציב"
        }
    elif template_id == 2:  # Technical Analysis
        variables = {
            "stock_ticker": ticker_symbol,
            "timeframe": "3 חודשים",
            "focus": "דפוסי גרף ואינדיקטורים טכניים"
        }
    elif template_id == 3:  # Performance Analysis
        variables = {
            "stock_ticker": ticker_symbol,
            "period": "12 חודשים",
            "focus": "ביצועי מסחר ופורטפוליו"
        }
    elif template_id == 4:  # Risk Analysis
        variables = {
            "stock_ticker": ticker_symbol,
            "focus": "פרופיל סיכונים ויעילות תנאים"
        }
    
    try:
        service = AIAnalysisService()
        result = service.generate_analysis(
            user_id=ADMIN_USER_ID,
            template_id=template_id,
            variables=variables,
            llm_provider="gemini",
            language="hebrew"
        )
        
        if result.get("success"):
            analysis_id = result.get("request_id")
            logger.info(f"✅ Analysis created successfully: ID {analysis_id}")
            return analysis_id
        else:
            logger.error(f"❌ Failed to create analysis: {result.get('error')}")
            return None
    except Exception as e:
        logger.error(f"❌ Error creating analysis: {str(e)}")
        return None


def create_note_from_analysis(analysis_id: int, related_type_id: int, related_type_name: str, related_id: int):
    """Create a note from analysis linked to a specific object type"""
    logger.info(f"Creating note from analysis {analysis_id} linked to {related_type_name} (ID: {related_id})")
    
    # Get analysis with response_text
    analysis = AIAnalysisRequest.query.filter_by(id=analysis_id, user_id=ADMIN_USER_ID).first()
    
    if not analysis:
        logger.error(f"❌ Analysis {analysis_id} not found")
        return None
    
    if not analysis.response_text:
        logger.error(f"❌ Analysis {analysis_id} has no response_text")
        return None
    
    # Create note
    note = Note(
        user_id=ADMIN_USER_ID,
        content=analysis.response_text[:10000],  # Ensure it fits in VARCHAR(10000)
        related_type_id=related_type_id,
        related_id=related_id
    )
    
    try:
        db.session.add(note)
        db.session.commit()
        db.session.refresh(note)
        
        logger.info(f"✅ Note created successfully: ID {note.id}")
        return note.id
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error creating note: {str(e)}")
        return None


def main():
    """Run comprehensive tests"""
    logger.info("=" * 80)
    logger.info("Starting Comprehensive AI Analysis Testing")
    logger.info("=" * 80)
    
    results = {
        "analyses": [],
        "notes": []
    }
    
    with app.app_context():
        # Test 1: Create analyses for all templates
        logger.info("\n" + "=" * 80)
        logger.info("TEST 1: Creating analyses for all templates")
        logger.info("=" * 80)
        
        for template_id, template_name, ticker_symbol in TEMPLATES:
            analysis_id = create_analysis(template_id, template_name, ticker_symbol)
            if analysis_id:
                results["analyses"].append({
                    "template_id": template_id,
                    "template_name": template_name,
                    "ticker": ticker_symbol,
                    "analysis_id": analysis_id
                })
                logger.info(f"✅ Created: {template_name} for {ticker_symbol} → Analysis #{analysis_id}")
            else:
                logger.error(f"❌ Failed: {template_name} for {ticker_symbol}")
        
        logger.info(f"\n✅ Created {len(results['analyses'])} analyses")
        
        # Wait a bit for analyses to complete (they run asynchronously)
        logger.info("\n⏳ Waiting 60 seconds for analyses to complete...")
        import time
        time.sleep(60)
        
        # Test 2: Create notes linked to all object types
        logger.info("\n" + "=" * 80)
        logger.info("TEST 2: Creating notes linked to all object types")
        logger.info("=" * 80)
        
        # Use the first successful analysis for all note types
        if results["analyses"]:
            test_analysis_id = results["analyses"][0]["analysis_id"]
            
            for related_type_id, related_type_name, related_id in NOTE_RELATION_TYPES:
                note_id = create_note_from_analysis(
                    test_analysis_id,
                    related_type_id,
                    related_type_name,
                    related_id
                )
                if note_id:
                    results["notes"].append({
                        "related_type_id": related_type_id,
                        "related_type_name": related_type_name,
                        "related_id": related_id,
                        "note_id": note_id
                    })
                    logger.info(f"✅ Created note #{note_id} linked to {related_type_name} (ID: {related_id})")
                else:
                    logger.error(f"❌ Failed to create note for {related_type_name}")
        
        logger.info(f"\n✅ Created {len(results['notes'])} notes")
        
        # Summary
        logger.info("\n" + "=" * 80)
        logger.info("TEST SUMMARY")
        logger.info("=" * 80)
        logger.info(f"\nAnalyses created: {len(results['analyses'])}")
        for analysis in results["analyses"]:
            logger.info(f"  - {analysis['template_name']} for {analysis['ticker']} → Analysis #{analysis['analysis_id']}")
        
        logger.info(f"\nNotes created: {len(results['notes'])}")
        for note in results["notes"]:
            logger.info(f"  - Note #{note['note_id']} → {note['related_type_name']} (ID: {note['related_id']})")
        
        logger.info("\n" + "=" * 80)
        logger.info("Testing completed!")
        logger.info("=" * 80)
        
        return results


if __name__ == "__main__":
    results = main()
    print(f"\n✅ Test completed: {len(results['analyses'])} analyses, {len(results['notes'])} notes")

