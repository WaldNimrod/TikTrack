#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from routes.api.trade_plans import trade_plans_bp
from config.database import get_db
import json

def test_trade_plans_api():
    """Test trade_plans API endpoint"""
    try:
        # Create Flask app
        app = Flask(__name__)
        app.register_blueprint(trade_plans_bp)
        
        with app.test_client() as client:
            # Check trade_plans endpoint
            response = client.get('/api/v1/trade_plans/')
            print(f"✅ Trade Plans Status: {response.status_code}")
            print(f"✅ Trade Plans Response: {response.data.decode()}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_trade_plans_api()
