#!/usr/bin/env python3
"""
Test API Keys for LLM Providers
Tests Gemini and Perplexity API keys to ensure they are valid and working
"""

import sys
import os
from pathlib import Path
from typing import cast, Optional

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import UserLLMProvider
from models.user import User
from config.settings import DATABASE_URL
from services.llm_providers.gemini_provider import GeminiProvider
from services.llm_providers.perplexity_provider import PerplexityProvider
from services.api_key_encryption_service import APIKeyEncryptionService
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_gemini_key(api_key: str) -> dict:
    """Test Gemini API key"""
    try:
        provider = GeminiProvider()
        is_valid = provider.validate_api_key(api_key)
        
        if is_valid:
            # Try a simple prompt
            result = provider.send_prompt("Say hello in one word: hello", api_key)
            if result.get('text'):
                return {
                    'valid': True,
                    'model_used': result.get('metadata', {}).get('model', 'unknown'),
                    'test_response': result.get('text', '')[:100],
                    'message': 'Gemini API key is valid and working'
                }
            else:
                return {
                    'valid': False,
                    'error': 'API key validated but prompt failed',
                    'message': str(result.get('error', 'Unknown error'))
                }
        else:
            return {
                'valid': False,
                'error': 'API key validation failed',
                'message': 'Gemini API key is not valid'
            }
    except Exception as e:
        logger.error(f"Error testing Gemini key: {e}", exc_info=True)
        return {
            'valid': False,
            'error': str(e),
            'message': f'Error testing Gemini API key: {e}'
        }


def test_perplexity_key(api_key: str) -> dict:
    """Test Perplexity API key"""
    try:
        provider = PerplexityProvider()
        is_valid = provider.validate_api_key(api_key)
        
        if is_valid:
            # Try a simple prompt
            result = provider.send_prompt("Say hello", api_key)
            if result.get('text'):
                return {
                    'valid': True,
                    'model_used': result.get('metadata', {}).get('model', 'unknown'),
                    'test_response': result.get('text', '')[:100],
                    'message': 'Perplexity API key is valid and working'
                }
            else:
                return {
                    'valid': False,
                    'error': 'API key validated but prompt failed',
                    'message': str(result.get('error', 'Unknown error'))
                }
        else:
            return {
                'valid': False,
                'error': 'API key validation failed',
                'message': 'Perplexity API key is not valid'
            }
    except Exception as e:
        logger.error(f"Error testing Perplexity key: {e}", exc_info=True)
        return {
            'valid': False,
            'error': str(e),
            'message': f'Error testing Perplexity API key: {e}'
        }


def main():
    """Main function to test API keys for admin user"""
    try:
        # Validate DATABASE_URL is not None (type checker safety)
        if not DATABASE_URL:
            print("❌ DATABASE_URL is not configured")
            return None
        
        # Connect to database
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Get admin user
        admin_user = session.scalars(select(User).where(User.username == 'admin')).first()
        if not admin_user:
            print("❌ Admin user not found")
            return
        
        print(f"✅ Found admin user (ID: {admin_user.id})")
        
        # Get LLM provider settings
        provider_settings = session.scalars(
            select(UserLLMProvider).where(UserLLMProvider.user_id == admin_user.id)
        ).first()
        
        if not provider_settings:
            print("❌ No LLM provider settings found for admin user")
            return
        
        print(f"✅ Found LLM provider settings for admin user")
        
        # Initialize encryption service
        encryption_service = APIKeyEncryptionService()
        
        results = {
            'user_id': admin_user.id,
            'username': admin_user.username,
            'gemini': None,
            'perplexity': None
        }
        
        # Test Gemini API key
        gemini_api_key_value: Optional[str] = cast(Optional[str], provider_settings.gemini_api_key)
        if gemini_api_key_value is not None and gemini_api_key_value:
            print("\n🔍 Testing Gemini API key...")
            try:
                decrypted_key = encryption_service.decrypt_api_key(gemini_api_key_value)
                gemini_result = test_gemini_key(decrypted_key)
                results['gemini'] = gemini_result
                
                if gemini_result['valid']:
                    print(f"✅ Gemini API key is valid")
                    print(f"   Model used: {gemini_result.get('model_used', 'unknown')}")
                    print(f"   Test response: {gemini_result.get('test_response', '')[:50]}...")
                else:
                    print(f"❌ Gemini API key is invalid: {gemini_result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ Error decrypting/testing Gemini key: {e}")
                results['gemini'] = {'valid': False, 'error': str(e)}
        else:
            print("\n⚠️  No Gemini API key found for admin user")
            results['gemini'] = {'valid': False, 'error': 'No API key configured'}
        
        # Test Perplexity API key
        perplexity_api_key_value: Optional[str] = cast(Optional[str], provider_settings.perplexity_api_key)
        if perplexity_api_key_value is not None and perplexity_api_key_value:
            print("\n🔍 Testing Perplexity API key...")
            try:
                decrypted_key = encryption_service.decrypt_api_key(perplexity_api_key_value)
                perplexity_result = test_perplexity_key(decrypted_key)
                results['perplexity'] = perplexity_result
                
                if perplexity_result['valid']:
                    print(f"✅ Perplexity API key is valid")
                    print(f"   Model used: {perplexity_result.get('model_used', 'unknown')}")
                    print(f"   Test response: {perplexity_result.get('test_response', '')[:50]}...")
                else:
                    print(f"❌ Perplexity API key is invalid: {perplexity_result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ Error decrypting/testing Perplexity key: {e}")
                results['perplexity'] = {'valid': False, 'error': str(e)}
        else:
            print("\n⚠️  No Perplexity API key found for admin user")
            results['perplexity'] = {'valid': False, 'error': 'No API key configured'}
        
        # Summary
        print("\n" + "="*80)
        print("📊 SUMMARY")
        print("="*80)
        print(f"User: {results['username']} (ID: {results['user_id']})")
        print(f"Gemini: {'✅ Valid' if results['gemini'] and results['gemini'].get('valid') else '❌ Invalid'}")
        print(f"Perplexity: {'✅ Valid' if results['perplexity'] and results['perplexity'].get('valid') else '❌ Invalid'}")
        
        session.close()
        
        return results
        
    except Exception as e:
        logger.error(f"Error in main: {e}", exc_info=True)
        print(f"❌ Error: {e}")
        return None


if __name__ == "__main__":
    main()

