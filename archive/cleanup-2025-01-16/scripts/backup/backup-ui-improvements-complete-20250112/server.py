#!/usr/bin/env python3
"""
Simple HTTP server for TikTrack trading-ui
Handles HTML files without extension automatically
"""

import http.server
import socketserver
import os
import urllib.parse

class TikTrackHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]
        
        # If path is empty, serve index.html
        if not path:
            path = 'index.html'
        
        # If path doesn't end with .html and the file doesn't exist, try adding .html
        if not path.endswith('.html') and not os.path.exists(path):
            html_path = path + '.html'
            if os.path.exists(html_path):
                path = html_path
        
        # Update the path
        self.path = '/' + path
        
        # Call the parent method
        super().do_GET()

if __name__ == "__main__":
    PORT = 8080
    
    with socketserver.TCPServer(("", PORT), TikTrackHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
