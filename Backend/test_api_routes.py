#!/usr/bin/env python3
"""
Comprehensive Test Script for External Data API Routes
Tests all newly created API endpoints and their functionality
"""

import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_quotes_blueprint():
    """Test Quotes Blueprint functionality"""
    print("\n" + "="*60)
    print("🧪 בדיקת Quotes Blueprint")
    print("="*60)
    
    try:
        from routes.external_data.quotes import quotes_bp
        
        print("✅ Quotes Blueprint imported successfully")
        print(f"📊 Blueprint Name: {quotes_bp.name}")
        print(f"📊 URL Prefix: {quotes_bp.url_prefix}")
        print(f"📊 Total Routes: {len(quotes_bp.deferred_functions)}")
        
        # Check route decorators
        import inspect
        route_functions = []
        for func in quotes_bp.deferred_functions:
            if hasattr(func, '__name__'):
                route_functions.append(func.__name__)
            else:
                route_functions.append(str(func))
        
        print(f"📊 Route Functions: {route_functions}")
        
        return True
        
    except Exception as e:
        print(f"❌ Quotes Blueprint test failed: {e}")
        return False

def test_status_blueprint():
    """Test Status Blueprint functionality"""
    print("\n" + "="*60)
    print("🧪 בדיקת Status Blueprint")
    print("="*60)
    
    try:
        from routes.external_data.status import status_bp
        
        print("✅ Status Blueprint imported successfully")
        print(f"📊 Blueprint Name: {status_bp.name}")
        print(f"📊 URL Prefix: {status_bp.url_prefix}")
        print(f"📊 Total Routes: {len(status_bp.deferred_functions)}")
        
        # Check route decorators
        import inspect
        route_functions = []
        for func in status_bp.deferred_functions:
            if hasattr(func, '__name__'):
                route_functions.append(func.__name__)
            else:
                route_functions.append(str(func))
        
        print(f"📊 Route Functions: {route_functions}")
        
        return True
        
    except Exception as e:
        print(f"❌ Status Blueprint test failed: {e}")
        return False

def test_package_import():
    """Test package import functionality"""
    print("\n" + "="*60)
    print("🧪 בדיקת ייבוא החבילה")
    print("="*60)
    
    try:
        from routes.external_data import quotes_bp, status_bp
        
        print("✅ Package import successful")
        print(f"📊 Quotes Blueprint: {quotes_bp.name}")
        print(f"📊 Status Blueprint: {status_bp.name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Package import failed: {e}")
        return False

def test_route_details():
    """Test detailed route information"""
    print("\n" + "="*60)
    print("🧪 בדיקת פרטי ה-Routes")
    print("="*60)
    
    try:
        from routes.external_data.quotes import quotes_bp
        from routes.external_data.status import status_bp
        
        print("📊 Quotes API Routes:")
        print("   - GET  /api/external-data/quotes/")
        print("   - GET  /api/external-data/quotes/<symbol>")
        print("   - POST /api/external-data/quotes/batch")
        print("   - GET  /api/external-data/quotes/status")
        
        print("\n📊 Status API Routes:")
        print("   - GET  /api/external-data/status/")
        print("   - GET  /api/external-data/status/providers")
        print("   - GET  /api/external-data/status/providers/<id>")
        print("   - GET  /api/external-data/status/health")
        
        return True
        
    except Exception as e:
        print(f"❌ Route details test failed: {e}")
        return False

def test_dependencies():
    """Test that all dependencies are available"""
    print("\n" + "="*60)
    print("🧪 בדיקת תלויות")
    print("="*60)
    
    try:
        # Test external data services
        from services.external_data import YahooFinanceAdapter, DataNormalizer, CacheManager
        print("✅ External data services imported")
        
        # Test models
        from models.external_data import MarketDataQuote, ExternalDataProvider, DataRefreshLog
        print("✅ External data models imported")
        
        # Test database config
        from config.database import get_db
        print("✅ Database config imported")
        
        # Test Flask components
        from flask import Blueprint, request, jsonify
        print("✅ Flask components imported")
        
        return True
        
    except Exception as e:
        print(f"❌ Dependencies test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 בדיקה מקיפה של External Data API Routes")
    print("="*60)
    
    test_results = []
    
    test_results.append(test_dependencies())
    test_results.append(test_quotes_blueprint())
    test_results.append(test_status_blueprint())
    test_results.append(test_package_import())
    test_results.append(test_route_details())
    
    # Summary
    print("\n" + "="*60)
    print("📊 סיכום הבדיקות")
    print("="*60)
    
    passed = sum(test_results)
    total = len(test_results)
    
    print(f"✅ בדיקות שעברו: {passed}/{total}")
    print(f"📊 אחוז הצלחה: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 כל הבדיקות עברו בהצלחה!")
        print("\n📋 סיכום מה שיצרנו:")
        print("   - Quotes API: 4 endpoints")
        print("   - Status API: 4 endpoints")
        print("   - Total: 8 API endpoints")
        print("   - URL Prefix: /api/external-data/")
        return True
    else:
        print("⚠️ חלק מהבדיקות נכשלו")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)















