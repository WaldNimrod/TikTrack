#!/usr/bin/env python3
"""
Flask Simple Development Server
Simple Flask development server with detailed logs

🎯 Purpose: Simple development server with Flask and detailed logs
⚡ Features: 
  - Flask development server
  - Debug mode enabled
  - Detailed logs
  - Suitable for development only
"""

import logging
from app import app

# Configure detailed logs
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    """
    Start Flask development server
    """
    print("🚀 Starting Flask development server...")
    print("📍 Development server running on http://127.0.0.1:8080")
    print("⚡ Debug mode enabled")
    print("📝 Detailed logs enabled")
    print("🎯 Notification messages enabled")
    print("🔗 Routes without .html available")
    print("-" * 50)
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=False  # Disable auto-reload to prevent issues
    )
