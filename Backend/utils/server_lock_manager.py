#!/usr/bin/env python3
"""
TikTrack Server Lock Manager
============================

Server process detection and management system to prevent multiple server instances.

Purpose: Detect and manage running TikTrack server processes to prevent conflicts
Location: Backend/utils/server_lock_manager.py
Integration: Used by start_server.sh and server management scripts

Features:
- Process detection on port 8080
- TikTrack server identification
- Detailed process information
- Integration with logging system
- Error handling and user guidance
"""

import psutil
import os
import sys
import time
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import logging

# Add Backend directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from config.logging import get_logger

# Initialize logger
logger = get_logger('server_lock_manager')

class ServerLockManager:
    """Manages server process detection and prevention of multiple instances"""
    
    def __init__(self):
        self.port = 8080
        self.server_keywords = ['app.py', 'dev_server', 'tiktrack', 'flask']
        self.logger = logger
    
    def check_existing_processes(self) -> List[Dict]:
        """
        Check for existing Python processes on port 8080
        
        Returns:
            List of process dictionaries with details
        """
        self.logger.info("Checking for existing processes on port 8080...")
        
        processes = []
        
        try:
            # Get all processes listening on port 8080
            # Use a more robust approach to avoid permission errors
            connections = []
            try:
                connections = psutil.net_connections(kind='inet')
            except (psutil.AccessDenied, PermissionError) as e:
                self.logger.warning(f"Permission denied accessing network connections: {e}")
                # Fallback: check if port is in use with socket
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('127.0.0.1', self.port))
                sock.close()
                if result == 0:
                    self.logger.warning("Port 8080 appears to be in use, but cannot identify the process")
                return processes
            
            for conn in connections:
                if conn.laddr.port == self.port and conn.status == 'LISTEN':
                    try:
                        process = psutil.Process(conn.pid)
                        process_info = self.get_process_details(conn.pid)
                        if process_info:
                            processes.append(process_info)
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        # Process might have terminated between scan and access
                        continue
                        
        except Exception as e:
            self.logger.warning(f"Error checking processes: {e}")
            # Continue execution - this is not a critical error
            
        self.logger.info(f"Found {len(processes)} processes on port 8080")
        return processes
    
    def is_tiktrack_server(self, pid: int) -> bool:
        """
        Check if a process is a TikTrack server
        
        Args:
            pid: Process ID to check
            
        Returns:
            True if it's a TikTrack server, False otherwise
        """
        try:
            process = psutil.Process(pid)
            cmdline = ' '.join(process.cmdline()).lower()
            
            # Check for TikTrack server indicators
            for keyword in self.server_keywords:
                if keyword in cmdline:
                    return True
                    
            return False
            
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return False
    
    def get_process_details(self, pid: int) -> Optional[Dict]:
        """
        Get detailed information about a process
        
        Args:
            pid: Process ID
            
        Returns:
            Dictionary with process details or None if not accessible
        """
        try:
            process = psutil.Process(pid)
            
            # Get process information
            cmdline = ' '.join(process.cmdline())
            
            # Skip system processes that are not relevant
            if any(skip_word in cmdline.lower() for skip_word in ['netbiosd', 'system', 'kernel']):
                return None
            
            create_time = process.create_time()
            running_time = time.time() - create_time
            
            # Check if it's a TikTrack server
            is_tiktrack = self.is_tiktrack_server(pid)
            
            return {
                'pid': pid,
                'cmdline': cmdline,
                'create_time': create_time,
                'running_time_seconds': running_time,
                'running_time_formatted': self.format_running_time(running_time),
                'is_tiktrack': is_tiktrack,
                'status': process.status(),
                'memory_info': process.memory_info()._asdict() if hasattr(process, 'memory_info') else None
            }
            
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            # Don't log warnings for system processes
            if not any(skip_word in str(e).lower() for skip_word in ['netbiosd', 'system']):
                self.logger.warning(f"Cannot access process {pid}: {e}")
            return None
    
    def format_running_time(self, seconds: float) -> str:
        """Format running time in human readable format"""
        if seconds < 60:
            return f"{int(seconds)} seconds"
        elif seconds < 3600:
            minutes = int(seconds // 60)
            return f"{minutes} minutes"
        else:
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            return f"{hours}h {minutes}m"
    
    def show_error_and_exit(self, processes: List[Dict]) -> None:
        """
        Display detailed error message and exit
        
        Args:
            processes: List of conflicting processes
        """
        print("\n" + "="*80)
        print("🚫 ERROR: TikTrack Server Already Running")
        print("="*80)
        print()
        
        print("Found existing TikTrack server process(es):")
        print()
        
        for i, proc in enumerate(processes, 1):
            print(f"Process #{i}:")
            print(f"  PID: {proc['pid']}")
            print(f"  Command: {proc['cmdline']}")
            print(f"  Running Time: {proc['running_time_formatted']}")
            print(f"  Status: {proc['status']}")
            print()
        
        print("To resolve this issue:")
        print("1. Stop the existing server:")
        for proc in processes:
            print(f"   kill {proc['pid']}")
        print()
        print("2. Or use Ctrl+C in the terminal where the server is running")
        print()
        print("3. Then run the startup script again:")
        print("   ./start_server.sh")
        print()
        print("="*80)
        
        # Log the error
        self.logger.error(f"Server startup blocked - {len(processes)} existing processes found")
        for proc in processes:
            self.logger.error(f"Conflicting process: PID {proc['pid']}, CMD: {proc['cmdline']}")
        
        sys.exit(1)
    
    def check_and_prevent_conflicts(self) -> bool:
        """
        Main function to check for conflicts and prevent multiple instances
        
        Returns:
            True if no conflicts found, False if conflicts exist
        """
        self.logger.info("Starting server conflict check...")
        
        # Get all processes on port 8080
        processes = self.check_existing_processes()
        
        # Filter for TikTrack servers
        tiktrack_processes = [p for p in processes if p['is_tiktrack']]
        
        if tiktrack_processes:
            self.logger.warning(f"Found {len(tiktrack_processes)} existing TikTrack server processes")
            self.show_error_and_exit(tiktrack_processes)
            return False
        
        self.logger.info("No conflicts found - server can start safely")
        return True

def main():
    """Command line interface for server lock manager"""
    manager = ServerLockManager()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        # Just check and return exit code
        if manager.check_and_prevent_conflicts():
            print("✅ No conflicts found")
            sys.exit(0)
        else:
            print("❌ Conflicts found")
            sys.exit(1)
    else:
        # Interactive mode
        manager.check_and_prevent_conflicts()

if __name__ == "__main__":
    main()
