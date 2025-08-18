#!/usr/bin/env python3
"""
Flask Development Server Runner for TikTrack
שרת פיתוח עם Flask ו-auto-reload
"""

from app import app
import os
import sys

def main():
    print("🚀 Starting TikTrack with Flask Development Server...")
    print("📍 Server will run on: http://127.0.0.1:8080")
    print("🔄 Auto-reload enabled")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # הפעלת השרת עם Flask development server
        app.run(
            host="127.0.0.1", 
            port=8080,
            debug=True,  # auto-reload
            use_reloader=True,  # auto-reload on file changes
            threaded=True,  # multi-threaded
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
