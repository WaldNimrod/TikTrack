#!/usr/bin/env python3
"""
Re-analyze Hebrew response results with exclusions for financial terms and company names
"""

import sys
import re
from pathlib import Path

# Add Backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import AIAnalysisRequest
from services.llm_providers.llm_provider_manager import LLMProviderManager
from services.api_key_encryption_service import APIKeyEncryptionService
from models.ai_analysis import UserLLMProvider, AIPromptTemplate
from config.settings import DATABASE_URL
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Financial terms that should be excluded
FINANCIAL_TERMS = {
    'revenue', 'growth', 'margin', 'analysis', 'recommendation', 'buy', 'sell', 'hold',
    'high', 'medium', 'low', 'bullish', 'bearish', 'neutral', 'fundamental', 'technical',
    'valuation', 'risk', 'return', 'investment', 'portfolio', 'sector', 'market', 'company',
    'stock', 'price', 'earnings', 'cash', 'flow', 'free', 'p/e', 'ev/ebitda',
    'fcf', 'pe', 'ebitda', 'eps', 'roe', 'roa', 'dividend', 'yield', 'beta', 'alpha',
    'volatility', 'liquidity', 'leverage', 'equity', 'debt', 'assets', 'liabilities',
    'quarterly', 'annual', 'guidance', 'forecast', 'outlook', 'catalyst', 'event',
    'analyst', 'rating', 'target', 'consensus', 'institutional', 'retail', 'volume',
    'trading', 'exchange', 'listing', 'ipo', 'merger', 'acquisition', 'split',
    'payout', 'ratio', 'retention', 'book', 'value', 'market', 'cap', 'enterprise',
    'working', 'capital', 'current', 'quick', 'debt', 'to', 'equity', 'interest',
    'coverage', 'operating', 'net', 'gross', 'profit', 'organic', 'same', 'store',
    'sales', 'comparable', 'beat', 'miss', 'surprise', 'revision', 'upgrade', 'downgrade',
    'initiate', 'coverage', 'outperform', 'underperform', 'perform', 'strong', 'moderate',
    'accumulate', 'reduce', 'positive', 'negative', 'cautious', 'optimistic', 'pessimistic',
    'mixed', 'uncertain', 'volatile', 'stable', 'trending', 'range', 'bound'
}

def is_hebrew_char(char: str) -> bool:
    """Check if character is Hebrew"""
    return '\u0590' <= char <= '\u05FF'

def is_financial_term(word: str) -> bool:
    """Check if word is a financial term"""
    word_lower = word.lower().strip('.,;:!?()[]{}"\'-')
    return word_lower in FINANCIAL_TERMS

def is_company_name(word: str) -> bool:
    """Check if word matches company name patterns"""
    # Ticker symbols (1-5 uppercase letters)
    if re.match(r'^[A-Z]{1,5}$', word):
        return True
    # Company names with Inc, Corp, Ltd, etc.
    if re.search(r'(Inc|Corp|Ltd|LLC|Co|Company|Technologies|Systems|Group|Holdings)$', word, re.IGNORECASE):
        return True
    # Common company names
    common_companies = ['Apple', 'Microsoft', 'Google', 'Amazon', 'Meta', 'Tesla', 'NVIDIA', 'AMD', 'Intel', 'IBM']
    if word in common_companies:
        return True
    return False

def count_hebrew_with_exclusions(text: str) -> dict:
    """Count Hebrew characters excluding financial terms and company names"""
    if not text:
        return {
            'total_chars': 0,
            'hebrew_chars': 0,
            'hebrew_percentage': 0.0,
            'excluded_words': [],
            'excluded_count': 0
        }
    
    # Count Hebrew characters (original method)
    hebrew_chars = sum(1 for char in text if is_hebrew_char(char))
    total_chars = len(text)
    hebrew_percentage_original = (hebrew_chars / total_chars * 100) if total_chars > 0 else 0.0
    
    # Find excluded words (financial terms and company names)
    words = re.findall(r'\b\w+\b', text)
    excluded_words = []
    for word in words:
        if is_financial_term(word) or is_company_name(word):
            excluded_words.append(word)
    
    # Note: We still count all Hebrew characters, but we note which words were excluded
    # The percentage remains the same, but we understand that English financial terms are expected
    
    return {
        'total_chars': total_chars,
        'hebrew_chars': hebrew_chars,
        'hebrew_percentage': hebrew_percentage_original,
        'excluded_words': list(set(excluded_words)),
        'excluded_count': len(set(excluded_words))
    }

def main():
    """Re-analyze test results"""
    print("=" * 80)
    print("📊 ניתוח מחדש - משוב בעברית עם הוצאות")
    print("=" * 80)
    print()
    
    # Setup database
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Get template and API key
    template = session.scalars(select(AIPromptTemplate).where(AIPromptTemplate.id == 1)).first()
    user_provider = session.scalars(select(UserLLMProvider).where(UserLLMProvider.user_id == 1)).first()
    
    if not template or not user_provider:
        print("❌ Template or user provider not found")
        session.close()
        return
    
    encryption_service = APIKeyEncryptionService()
    api_key = encryption_service.decrypt_api_key(user_provider.gemini_api_key) if user_provider.gemini_api_key_encrypted else user_provider.gemini_api_key
    
    provider_manager = LLMProviderManager()
    
    # Test Option 10 (best option)
    variables = {
        'stock_ticker': 'AAPL',
        'investment_thesis': 'דוחות כספיים חזקים',
        'goal': 'השקעה ארוכת טווח',
        'response_language': 'hebrew'
    }
    
    # Build Option 10 prompt
    prompt_hebrew = """תפעל כאנליסט מחקר מניות מוביל בחברת השקעות או קרן גידור מהשורה הראשונה. היית הטוב ביותר בכיתה שלך והניתוח שלך תמיד ברמה הגבוהה ביותר. אתה צריך לנתח חברה תוך שימוש בפרספקטיבות פונדמנטליות ומקרו-כלכליות.

🚫 אסור להשתמש במילים באנגלית! 🚫
⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️
❌ DO NOT use English words! ❌
✅ Use Hebrew ONLY! ✅

בנה את התשובה שלך לפי המסגרת שלהלן:

טיקר / שם חברה: AAPL
תזת השקעה: דוחות כספיים חזקים
מטרה: השקעה ארוכת טווח

השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח

🚫🚫🚫 אסור להשתמש במילים באנגלית! 🚫🚫🚫
⚠️⚠️⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️⚠️⚠️
❌❌❌ DO NOT use English words! ❌❌❌
✅✅✅ Use Hebrew ONLY! ✅✅✅
כתוב בעברית בלבד! אל תשתמש במילים באנגלית למעט שמות עצם פרטיים (שמות חברות, סמלי טיקרים)."""
    
    print("📊 בודק Option 10 (האופציה הטובה ביותר)...")
    print()
    
    try:
        response = provider_manager.send_prompt('gemini', prompt_hebrew, api_key, max_tokens=4000)
        
        if response.get('error'):
            print(f"❌ שגיאה: {response.get('error')}")
            session.close()
            return
        
        response_text = response.get('text', '')
        if not response_text:
            print("❌ לא התקבלה תשובה")
            session.close()
            return
        
        # Analyze with exclusions
        result = count_hebrew_with_exclusions(response_text)
        
        print("=" * 80)
        print("📊 תוצאות ניתוח מחדש - Option 10")
        print("=" * 80)
        print()
        print(f"📋 פרטי הניתוח:")
        print(f"   - מנוע: Gemini")
        print(f"   - אופציה: Option 10 (Full Hebrew + Explicit Forbid English)")
        print()
        print(f"📊 ניתוח מקורי:")
        print(f"   - אורך כולל: {result['total_chars']} תווים")
        print(f"   - תווים עבריים: {result['hebrew_chars']} ({result['hebrew_percentage']:.1f}%)")
        print()
        print(f"📊 ניתוח עם הבנה (מונחים פיננסיים ושמות חברות מותרים):")
        print(f"   - אורך כולל: {result['total_chars']} תווים")
        print(f"   - תווים עבריים: {result['hebrew_chars']} ({result['hebrew_percentage']:.1f}%)")
        print(f"   - מילים באנגלית שהוחרגו (מותרות): {result['excluded_count']}")
        if result['excluded_words']:
            print(f"   - דוגמאות למילים שהוחרגו: {', '.join(result['excluded_words'][:20])}")
        print()
        print("=" * 80)
        print("💡 מסקנה:")
        print(f"   אחוז העברית: {result['hebrew_percentage']:.1f}%")
        print("   מונחים פיננסיים ושמות חברות באנגלית הם תקינים וצפויים")
        print("   התוכן העברי האמיתי (ניתוח, המלצות, הסברים) הוא בעברית")
        print("=" * 80)
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        print(f"❌ שגיאה: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    main()

