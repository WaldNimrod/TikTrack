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
    # Flask development server startup - removed debug prints
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=False  # Disable auto-reload to prevent issues
    )
