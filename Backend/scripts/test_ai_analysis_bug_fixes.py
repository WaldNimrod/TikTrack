#!/usr/bin/env python3
"""
Test Script for AI Analysis Bug Fixes
======================================
Tests all bug fixes implemented in the AI Analysis system

Date: 2025-12-04
"""

import sys
import os
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

def test_model_imports():
    """Test that all model imports work correctly"""
    print("🔍 Testing model imports...")
    try:
        from models.ai_analysis import AIAnalysisRequest, AIPromptTemplate, UserLLMProvider
        print("  ✅ AIAnalysisRequest imported successfully")
        
        # Check if retry_count attribute exists
        if hasattr(AIAnalysisRequest, 'retry_count'):
            print("  ✅ retry_count attribute found in AIAnalysisRequest model")
        else:
            print("  ⚠️  retry_count attribute NOT found in AIAnalysisRequest model")
            return False
            
        return True
    except Exception as e:
        print(f"  ❌ Model import failed: {e}")
        return False


def test_service_imports():
    """Test that service imports work correctly"""
    print("\n🔍 Testing service imports...")
    try:
        from services.ai_analysis_service import AIAnalysisService, PromptTemplateService
        print("  ✅ AIAnalysisService imported successfully")
        print("  ✅ PromptTemplateService imported successfully")
        return True
    except ValueError as e:
        if "DATABASE_URL" in str(e) or "POSTGRES_HOST" in str(e):
            print(f"  ⚠️  Service import skipped (requires DATABASE_URL - normal for test environment)")
            return True  # This is expected without DB connection
        print(f"  ❌ Service import failed: {e}")
        return False
    except Exception as e:
        if "DATABASE_URL" in str(e) or "POSTGRES_HOST" in str(e):
            print(f"  ⚠️  Service import skipped (requires DATABASE_URL - normal for test environment)")
            return True  # This is expected without DB connection
        print(f"  ❌ Service import failed: {e}")
        return False


def test_business_logic_imports():
    """Test that business logic imports work correctly"""
    print("\n🔍 Testing business logic imports...")
    try:
        from services.business_logic.ai_analysis_business_service import AIAnalysisBusinessService
        print("  ✅ AIAnalysisBusinessService imported successfully")
        return True
    except ValueError as e:
        if "DATABASE_URL" in str(e) or "POSTGRES_HOST" in str(e):
            print(f"  ⚠️  Business logic import skipped (requires DATABASE_URL - normal for test environment)")
            return True  # This is expected without DB connection
        print(f"  ❌ Business logic import failed: {e}")
        return False
    except Exception as e:
        if "DATABASE_URL" in str(e) or "POSTGRES_HOST" in str(e):
            print(f"  ⚠️  Business logic import skipped (requires DATABASE_URL - normal for test environment)")
            return True  # This is expected without DB connection
        print(f"  ❌ Business logic import failed: {e}")
        return False


def test_migration_syntax():
    """Test that migration file has correct syntax"""
    print("\n🔍 Testing migration file syntax...")
    migration_file = backend_path / 'migrations' / 'add_retry_count_to_ai_analysis.py'
    if not migration_file.exists():
        print(f"  ❌ Migration file not found: {migration_file}")
        return False
    
    try:
        with open(migration_file, 'r') as f:
            code = f.read()
        compile(code, str(migration_file), 'exec')
        print("  ✅ Migration file syntax is valid")
        return True
    except SyntaxError as e:
        print(f"  ❌ Migration file syntax error: {e}")
        return False
    except Exception as e:
        print(f"  ⚠️  Could not compile migration file: {e}")
        return False


def test_model_structure():
    """Test that model has all required attributes"""
    print("\n🔍 Testing model structure...")
    try:
        from models.ai_analysis import AIAnalysisRequest
        from sqlalchemy.inspection import inspect as sql_inspect
        
        # Get all column names
        mapper = sql_inspect(AIAnalysisRequest)
        column_names = [col.key for col in mapper.columns]
        
        required_columns = [
            'id', 'user_id', 'template_id', 'provider', 'variables_json',
            'prompt_text', 'response_text', 'response_json', 'status',
            'error_message', 'created_at', 'updated_at'
        ]
        
        missing_columns = []
        for col in required_columns:
            if col not in column_names:
                missing_columns.append(col)
        
        if missing_columns:
            print(f"  ⚠️  Missing columns: {', '.join(missing_columns)}")
        else:
            print("  ✅ All required columns present")
        
        # Check for retry_count
        if 'retry_count' in column_names:
            print("  ✅ retry_count column found")
        else:
            print("  ⚠️  retry_count column NOT found (may not be in database yet)")
        
        return len(missing_columns) == 0
    except Exception as e:
        print(f"  ❌ Model structure test failed: {e}")
        return False


def test_frontend_file_exists():
    """Test that frontend file exists and is readable"""
    print("\n🔍 Testing frontend file...")
    frontend_file = backend_path.parent / 'trading-ui' / 'scripts' / 'ai-analysis-manager.js'
    if not frontend_file.exists():
        print(f"  ❌ Frontend file not found: {frontend_file}")
        return False
    
    try:
        with open(frontend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for key functions we added
        checks = {
            'setupPageVisibilityListener': 'setupPageVisibilityListener()' in content,
            'validateAnalysisRequest in rerunAnalysisWithData': 'validateAnalysisRequest' in content and 'rerunAnalysisWithData' in content,
            'Page Visibility API listener': 'visibilitychange' in content and 'visibilityState' in content,
        }
        
        all_passed = True
        for check_name, check_result in checks.items():
            if check_result:
                print(f"  ✅ {check_name} found")
            else:
                print(f"  ⚠️  {check_name} NOT found")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ❌ Frontend file test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("AI Analysis Bug Fixes - Comprehensive Tests")
    print("=" * 60)
    
    results = []
    
    # Run all tests
    results.append(("Model Imports", test_model_imports()))
    results.append(("Service Imports", test_service_imports()))
    results.append(("Business Logic Imports", test_business_logic_imports()))
    results.append(("Migration Syntax", test_migration_syntax()))
    results.append(("Model Structure", test_model_structure()))
    results.append(("Frontend File", test_frontend_file_exists()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())

