#!/usr/bin/env python3
"""
Simple Waitress Server Runner for TikTrack
גרסה פשוטה יותר של השרת
"""

from waitress import serve
from app import app
import os
import sys

def main():
    print("🚀 Starting TikTrack with Simple Waitress Server...")
    print("📍 Server will run on: http://127.0.0.1:8080")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # הפעלת השרת עם Waitress - הגדרות פשוטות
        serve(
            app, 
            host="127.0.0.1", 
            port=8080,
            threads=4,  # פחות threads
            connection_limit=100,  # פחות connections
            cleanup_interval=30,  # יותר זמן בין cleanups
            channel_timeout=120,  # יותר timeout
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
