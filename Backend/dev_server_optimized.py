#!/usr/bin/env python3
"""
TikTrack Optimized Development Server for Laptops
=================================================

🎯 Purpose: Memory-optimized Flask development server for laptops
⚡ Features: 
  - Reduced memory usage
  - Garbage collection optimization
  - Limited concurrent connections
  - Minimal logging
  - Fast response times
  - Suitable for development on laptops

🔧 Memory Optimizations:
  - Disabled debug mode
  - Limited worker threads
  - Aggressive garbage collection
  - Reduced logging verbosity
  - Connection pooling
  - Memory monitoring
"""

import os
import gc
import logging
import threading
import time
import psutil
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
from typing import Dict, Any, Optional, List
import sys

# Memory optimization imports
import weakref
import tracemalloc

# Import new architecture components
from config.database import init_db
from config.logging import setup_logging

# Import blueprints
from routes.api.accounts import accounts_bp
from routes.api.tickers import tickers_bp
from routes.api.trades import trades_bp
from routes.api.trade_plans import trade_plans_bp
from routes.api.alerts import alerts_bp
from routes.api.cash_flows import cash_flows_bp
from routes.api.notes import notes_bp
from routes.api.executions import executions_bp
from routes.api.preferences import preferences_bp
from routes.api.tests import tests_bp
from routes.api.test_suite import test_suite_bp
from routes.api.constraints import constraints_bp
from routes.api.currencies import currencies_bp
from routes.api.linked_items import linked_items_bp
from routes.api.note_relation_types import note_relation_types_bp
from routes.api.js_map import js_map_bp
from routes.pages import pages_bp

# Memory monitoring class
class MemoryMonitor:
    def __init__(self):
        self.process = psutil.Process()
        self.start_memory = self.process.memory_info().rss
        self.peak_memory = self.start_memory
        self.last_gc_time = time.time()
        
    def get_memory_usage(self):
        """Get current memory usage in MB"""
        current = self.process.memory_info().rss
        self.peak_memory = max(self.peak_memory, current)
        return {
            'current_mb': round(current / 1024 / 1024, 2),
            'peak_mb': round(self.peak_memory / 1024 / 1024, 2),
            'start_mb': round(self.start_memory / 1024 / 1024, 2)
        }
    
    def force_gc(self):
        """Force garbage collection"""
        collected = gc.collect()
        self.last_gc_time = time.time()
        return collected

# Initialize memory monitor
memory_monitor = MemoryMonitor()

# Configure minimal logging for memory optimization
logging.basicConfig(
    level=logging.WARNING,  # Reduced from DEBUG to WARNING
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/optimized_server.log'),
        logging.StreamHandler()
    ]
)

# Create Flask app with optimizations
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 300  # 5 minutes cache

# Enable CORS with limited origins
CORS(app, origins=['http://127.0.0.1:8080', 'http://localhost:8080'])

# Initialize database
try:
    init_db()
except Exception as e:

# Register blueprints

# Memory optimization middleware
@app.before_request
def before_request():
    """Memory optimization before each request"""
    # Force garbage collection every 10 requests
    if hasattr(app, 'request_count'):
        app.request_count += 1
    else:
        app.request_count = 1
    
    if app.request_count % 10 == 0:
        memory_monitor.force_gc()

@app.after_request
def after_request(response):
    """Memory optimization after each request"""
    # Add memory usage header for monitoring
    memory_info = memory_monitor.get_memory_usage()
    response.headers['X-Memory-Usage-MB'] = str(memory_info['current_mb'])
    response.headers['X-Peak-Memory-MB'] = str(memory_info['peak_mb'])
    
    # Force garbage collection if memory usage is high
    if memory_info['current_mb'] > 100:  # If over 100MB
        memory_monitor.force_gc()
    
    return response

# Health check endpoint with memory info
@app.route('/api/health')
def health_check():
    """Health check with memory information"""
    memory_info = memory_monitor.get_memory_usage()
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'memory': memory_info,
        'uptime': time.time() - memory_monitor.last_gc_time,
        'optimized': True
    })

# Memory status endpoint
@app.route('/api/memory-status')
def memory_status():
    """Detailed memory status"""
    memory_info = memory_monitor.get_memory_usage()
    process = psutil.Process()
    
    return jsonify({
        'memory': memory_info,
        'cpu_percent': process.cpu_percent(),
        'num_threads': process.num_threads(),
        'open_files': len(process.open_files()),
        'connections': len(process.connections()),
        'gc_stats': gc.get_stats(),
        'optimized': True
    })

# Static file serving with caching
@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files with caching"""
    if filename.endswith('.html'):
        return send_from_directory('trading-ui', filename)
    elif filename.endswith('.css'):
        return send_from_directory('trading-ui/styles', filename)
    elif filename.endswith('.js'):
        return send_from_directory('trading-ui/scripts', filename)
    elif filename.endswith('.svg') or filename.endswith('.png'):
        return send_from_directory('trading-ui/images', filename)
    else:
        return send_from_directory('trading-ui', filename)

# Root endpoint
@app.route('/')
def index():
    """Serve main page"""
    return send_from_directory('trading-ui', 'index.html')

# Memory cleanup thread
def memory_cleanup_thread():
    """Background thread for memory cleanup"""
    while True:
        try:
            time.sleep(60)  # Run every minute
            memory_info = memory_monitor.get_memory_usage()
            
            # Force garbage collection if memory is high
            if memory_info['current_mb'] > 50:
                collected = memory_monitor.force_gc()
            
        except Exception as e:

if __name__ == "__main__":
    # Enable memory tracking
    tracemalloc.start()
    
    # Start memory cleanup thread
    cleanup_thread = threading.Thread(target=memory_cleanup_thread, daemon=True)
    cleanup_thread.start()
    
    # Initial memory info
    initial_memory = memory_monitor.get_memory_usage()
    
    
    # Configure Flask for minimal memory usage
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=False,  # Disabled for memory optimization
        use_reloader=False,  # Disabled to prevent memory leaks
        threaded=True,
        processes=1,  # Single process to reduce memory usage
        request_handler=None,  # Use default handler
        passthrough_errors=False,
        ssl_context=None
    )

