#!/usr/bin/env python3
"""
Test Option 10 implementation with all providers and languages
Tests Gemini and Perplexity with Hebrew and English responses
"""

import sys
import os
from pathlib import Path

# Add Backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import AIPromptTemplate, UserLLMProvider
from services.llm_providers.llm_provider_manager import LLMProviderManager
from services.api_key_encryption_service import APIKeyEncryptionService
from services.ai_analysis_service import PromptTemplateService
from config.settings import DATABASE_URL
import json
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_hebrew_char(char: str) -> bool:
    """Check if character is Hebrew"""
    return '\u0590' <= char <= '\u05FF'

def count_hebrew_chars(text: str) -> int:
    """Count Hebrew characters in text"""
    return sum(1 for char in text if is_hebrew_char(char))

def calculate_hebrew_percentage(text: str) -> float:
    """Calculate percentage of Hebrew characters"""
    if not text:
        return 0.0
    hebrew_count = count_hebrew_chars(text)
    total_chars = len(text)
    return (hebrew_count / total_chars * 100) if total_chars > 0 else 0.0

def test_provider_language(provider_name: str, language: str, template: AIPromptTemplate, 
                          provider_manager: LLMProviderManager, api_key: str):
    """Test a specific provider and language combination"""
    logger.info(f"Testing {provider_name} with {language}...")
    
    try:
        # Prepare variables
        variables = {
            'stock_ticker': 'AAPL',
            'investment_thesis': 'דוחות כספיים חזקים' if language == 'hebrew' else 'Strong financial reports',
            'goal': 'השקעה ארוכת טווח' if language == 'hebrew' else 'Long-term investment',
            'response_language': language
        }
        
        # Build prompt using Option 10
        prompt = PromptTemplateService.build_prompt(template, variables)
        
        # Send to LLM
        response = provider_manager.send_prompt(provider_name, prompt, api_key, max_tokens=4000)
        
        if response.get('error'):
            logger.error(f"{provider_name} + {language} failed: {response.get('error')}")
            return {
                'provider': provider_name,
                'language': language,
                'success': False,
                'error': response.get('error'),
                'hebrew_percentage': 0.0,
                'response_length': 0
            }
        
        response_text = response.get('text', '')
        if not response_text:
            logger.error(f"{provider_name} + {language} failed: No response text")
            return {
                'provider': provider_name,
                'language': language,
                'success': False,
                'error': 'No response text',
                'hebrew_percentage': 0.0,
                'response_length': 0
            }
        
        # Calculate Hebrew percentage
        hebrew_percentage = calculate_hebrew_percentage(response_text)
        hebrew_count = count_hebrew_chars(response_text)
        total_chars = len(response_text)
        
        logger.info(f"{provider_name} + {language} completed: {hebrew_percentage:.1f}% Hebrew")
        
        return {
            'provider': provider_name,
            'language': language,
            'success': True,
            'hebrew_percentage': hebrew_percentage,
            'hebrew_count': hebrew_count,
            'total_chars': total_chars,
            'response_preview': response_text[:500],
            'meets_target': hebrew_percentage >= 70.0 if language == 'hebrew' else True
        }
        
    except Exception as e:
        logger.error(f"{provider_name} + {language} failed with exception: {e}", exc_info=True)
        return {
            'provider': provider_name,
            'language': language,
            'success': False,
            'error': str(e),
            'hebrew_percentage': 0.0,
            'response_length': 0
        }

def main():
    """Run all tests"""
    print("=" * 80)
    print("🧪 בדיקת Option 10 - כל המנועים והשפות")
    print("=" * 80)
    print()
    
    # Setup database
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Get template
    template = session.scalars(select(AIPromptTemplate).where(AIPromptTemplate.id == 1)).first()
    if not template:
        print("❌ Template not found")
        session.close()
        return
    
    # Get user provider settings
    user_provider = session.scalars(select(UserLLMProvider).where(UserLLMProvider.user_id == 1)).first()
    if not user_provider:
        print("❌ User LLM provider settings not found")
        session.close()
        return
    
    encryption_service = APIKeyEncryptionService()
    provider_manager = LLMProviderManager()
    
    # Get API keys
    gemini_key = None
    if user_provider.gemini_api_key:
        gemini_key = encryption_service.decrypt_api_key(user_provider.gemini_api_key) if user_provider.gemini_api_key_encrypted else user_provider.gemini_api_key
    
    perplexity_key = None
    if user_provider.perplexity_api_key:
        perplexity_key = encryption_service.decrypt_api_key(user_provider.perplexity_api_key) if user_provider.perplexity_api_key_encrypted else user_provider.perplexity_api_key
    
    results = []
    
    # Test all combinations
    if gemini_key:
        print("📊 Testing Gemini + Hebrew...")
        results.append(test_provider_language('gemini', 'hebrew', template, provider_manager, gemini_key))
        
        print("\n📊 Testing Gemini + English...")
        results.append(test_provider_language('gemini', 'english', template, provider_manager, gemini_key))
    else:
        print("⚠️ Gemini API key not configured, skipping Gemini tests")
    
    if perplexity_key:
        print("\n📊 Testing Perplexity + Hebrew...")
        results.append(test_provider_language('perplexity', 'hebrew', template, provider_manager, perplexity_key))
        
        print("\n📊 Testing Perplexity + English...")
        results.append(test_provider_language('perplexity', 'english', template, provider_manager, perplexity_key))
    else:
        print("⚠️ Perplexity API key not configured, skipping Perplexity tests")
    
    session.close()
    
    # Print results
    print("\n" + "=" * 80)
    print("📊 תוצאות הבדיקות")
    print("=" * 80)
    print()
    
    for result in results:
        print(f"📋 {result['provider'].upper()} + {result['language'].upper()}:")
        if result['success']:
            print(f"   ✅ הצלחה!")
            if result['language'] == 'hebrew':
                print(f"   - אחוז עברית: {result['hebrew_percentage']:.1f}%")
                print(f"   - תווים עבריים: {result['hebrew_count']} מתוך {result['total_chars']}")
                print(f"   - עומד ביעד (70%+): {'✅ כן' if result['meets_target'] else '❌ לא'}")
            else:
                print(f"   - אורך תשובה: {result['total_chars']} תווים")
            print(f"   - תצוגה מקדימה (200 תווים):")
            print(f"     {result['response_preview'][:200]}...")
        else:
            print(f"   ❌ נכשל: {result.get('error', 'Unknown error')}")
        print()
    
    # Summary
    successful_results = [r for r in results if r['success']]
    hebrew_results = [r for r in successful_results if r['language'] == 'hebrew']
    
    if hebrew_results:
        avg_hebrew = sum(r['hebrew_percentage'] for r in hebrew_results) / len(hebrew_results)
        print("=" * 80)
        print(f"📈 סיכום - משוב בעברית")
        print("=" * 80)
        print(f"   - ממוצע אחוז עברית: {avg_hebrew:.1f}%")
        print(f"   - מספר בדיקות מוצלחות: {len(hebrew_results)}")
        print("=" * 80)
    
    if successful_results:
        print("\n" + "=" * 80)
        print("✅ כל הבדיקות הושלמו")
        print("=" * 80)

if __name__ == "__main__":
    main()

