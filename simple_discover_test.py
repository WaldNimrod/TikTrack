#!/usr/bin/env python3
"""
Simple test for file discovery without Flask-SocketIO
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route("/api/file-scanner/files", methods=["GET"])
def discover_files():
    """Discover all project files dynamically - simple version"""
    try:
        import os
        
        # Get project root directory
        project_root = os.path.dirname(os.path.abspath(__file__))
        
        # Simple file discovery using os.walk
        discovered_files = {
            'js': [],
            'html': [],
            'css': [],
            'python': [],
            'other': []
        }
        
        # Exclude directories
        exclude_dirs = {
            'node_modules', '.git', '__pycache__', '.pytest_cache', 
            'venv', 'env', 'dist', 'build', 'coverage', 'backup', 
            'backups', 'temp', 'tmp'
        }
        
        # Walk through directory tree
        for root, dirs, files in os.walk(project_root):
            # Remove excluded directories from dirs list
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Skip hidden files and system files
                if file.startswith('.') or file in ['Thumbs.db']:
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, project_root)
                
                # Categorize by extension
                if file.endswith('.js'):
                    discovered_files['js'].append(rel_path)
                elif file.endswith(('.html', '.htm')):
                    discovered_files['html'].append(rel_path)
                elif file.endswith('.css'):
                    discovered_files['css'].append(rel_path)
                elif file.endswith('.py'):
                    discovered_files['python'].append(rel_path)
                elif file.endswith(('.md', '.json', '.txt', '.yml', '.yaml', '.xml', '.sql', '.sh', '.bat')):
                    discovered_files['other'].append(rel_path)
        
        # Sort all lists
        for file_type in discovered_files:
            discovered_files[file_type].sort()
        
        return jsonify({
            "success": True,
            "files": discovered_files,
            "total_files": sum(len(files) for files in discovered_files.values()),
            "discovery_timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "files": {},
            "total_files": 0
        }), 500

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8081, debug=True)





