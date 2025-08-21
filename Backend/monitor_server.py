#!/usr/bin/env python3
"""
TikTrack Server Monitor
Monitors the server and restarts it if it crashes
"""

import subprocess
import time
import requests
import signal
import sys
import os
from datetime import datetime

class ServerMonitor:
    def __init__(self):
        self.server_process = None
        self.is_running = True
        self.restart_count = 0
        self.max_restarts = 10
        
        # Set signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        print(f"\n🛑 Received signal {signum}, shutting down gracefully...")
        self.is_running = False
        if self.server_process:
            self.server_process.terminate()
        sys.exit(0)
    
    def check_server_health(self):
        """Checks if the server is working"""
        try:
            response = requests.get("http://127.0.0.1:8080/api/health", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def start_server(self):
        """Starts the server"""
        try:
            print(f"🚀 Starting server (attempt {self.restart_count + 1}/{self.max_restarts})...")
            self.server_process = subprocess.Popen(
                ["python3", "run_waitress.py"],
                cwd=os.path.dirname(os.path.abspath(__file__)),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            return True
        except Exception as e:
            print(f"❌ Failed to start server: {e}")
            return False
    
    def stop_server(self):
        """Stops the server"""
        if self.server_process:
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.server_process.kill()
            except:
                pass
            self.server_process = None
    
    def monitor(self):
        """Main monitor loop"""
        print("🔍 TikTrack Server Monitor Started")
        print("📍 Monitoring server at http://127.0.0.1:8080")
        print("🔄 Auto-restart enabled")
        print("-" * 50)
        
        while self.is_running and self.restart_count < self.max_restarts:
            # Check if server is running
            if self.server_process and self.server_process.poll() is None:
                # Server is running, check health
                if self.check_server_health():
                    print(f"✅ Server healthy at {datetime.now().strftime('%H:%M:%S')}")
                    time.sleep(15)  # Check every 15 seconds
                    continue
                else:
                    print(f"⚠️  Server not responding at {datetime.now().strftime('%H:%M:%S')}")
            
            # Server is not running or not responding
            print(f"🔄 Server down, restarting...")
            self.stop_server()
            time.sleep(2)  # Short wait
            
            if self.start_server():
                self.restart_count += 1
                print(f"✅ Server restarted successfully")
                time.sleep(10)  # Wait for server to start
            else:
                print(f"❌ Failed to restart server")
                time.sleep(30)  # Longer wait
        
        if self.restart_count >= self.max_restarts:
            print(f"❌ Maximum restart attempts ({self.max_restarts}) reached")
            print("🔧 Please check server logs and restart manually")
        
        self.stop_server()
        print("🛑 Monitor stopped")

if __name__ == "__main__":
    monitor = ServerMonitor()
    monitor.monitor()
