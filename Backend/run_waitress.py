#!/usr/bin/env python3
"""
Waitress Server Runner for TikTrack
יציב יותר מ-Flask development server
"""

from waitress import serve
from app import app
import os
import sys
import logging
from datetime import datetime

# הגדרת לוגים מפורטים
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server_detailed.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def main():
    print("🚀 Starting TikTrack with Waitress Server...")
    print("📍 Server will run on: http://127.0.0.1:5002")
    print("⚡ Waitress is more stable than Flask development server")
    print("📝 Detailed logs will be saved to server_detailed.log")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    logger.info("Starting TikTrack server with Waitress")
    
    try:
        # בדיקת תיקיות וקבצים
        if not os.path.exists("db/simpleTrade.db"):
            logger.error("Database file not found!")
            print("❌ Database file not found at db/simpleTrade.db")
            sys.exit(1)
        
        if not os.path.exists("../trading-ui"):
            logger.error("UI directory not found!")
            print("❌ UI directory not found at ../trading-ui")
            sys.exit(1)
        
        logger.info("All required files and directories found")
        print("✅ All required files and directories found")
        
        # הפעלת השרת עם Waitress
        logger.info("Starting Waitress server...")
        serve(
            app, 
            host="127.0.0.1", 
            port=5002, 
            threads=4,
            connection_limit=1000,
            cleanup_interval=30,
            channel_timeout=120,
            log_socket_errors=True,
            log_untrusted_proxy_headers=True
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        print("\n🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
