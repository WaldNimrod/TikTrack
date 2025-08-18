#!/usr/bin/env python3
"""
Stable Server Runner for TikTrack
גרסה יציבה יותר של השרת
"""

from app import app
import os
import sys
import signal
import time

def signal_handler(signum, frame):
    print(f"\n🛑 Received signal {signum}, shutting down gracefully...")
    sys.exit(0)

def main():
    print("🚀 Starting TikTrack with Stable Server...")
    print("📍 Server will run on: http://127.0.0.1:8080")
    print("🛡️  Stable configuration - less memory usage")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # הגדרת signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # הפעלת השרת עם הגדרות יציבות
        app.run(
            host="127.0.0.1", 
            port=8080,
            debug=False,  # בלי debug mode - פחות זיכרון
            use_reloader=False,  # בלי auto-reload - פחות threads
            threaded=True,  # multi-threaded
            processes=1,  # רק process אחד
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
