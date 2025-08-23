#!/usr/bin/env python3
"""
Quick Server Check - Fast function for checking server availability
For use in Cursor instead of complex curl

📋 Purpose:
- Solve the problem of curl tests getting stuck in loops
- Provide fast and reliable server availability check
- Adapt for daily use in Cursor

🚀 Usage:
- python3 quick_server_check.py - quick check
- quick_server_check() - function for use in code

📝 History:
- Created in 2024 to solve performance issues in Cursor
- Replaces complex curl tests that get stuck
- Adapted for TikTrack project (port 8080)

🔧 Dependencies:
- requests
- socket
- time
"""

import requests
import socket
import time

def quick_server_check(host='localhost', port=8080, timeout=2.0):
    """
    Quick server availability check
    
    Args:
        host (str): Server address (default: localhost)
        port (int): Server port (default: 8080 - TikTrack)
        timeout (float): Timeout in seconds (default: 2.0)
    
    Returns:
        bool: True if server is available, False otherwise
    
    Note:
        - Quick port check before HTTP request
        - Short timeout to prevent loops
        - Adapted for TikTrack project
    """
    try:
        # Quick port check
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result != 0:
            return False
        
        # Quick response check
        response = requests.get(f"http://{host}:{port}/api/health", timeout=timeout)
        return response.status_code == 200
        
    except Exception:
        return False

def server_status():
    """
    Returns detailed server status
    
    Returns:
        dict: Server status information including:
            - running (bool): Whether the server is running
            - status (str): Server status
            - database (str): Database status
            - timestamp (str): Check time
            - error (str): Error message if any
    
    Note:
        - Uses TikTrack's /api/health endpoint
        - Returns JSON response from server
        - 2 second timeout to prevent loops
    """
    try:
        response = requests.get("http://localhost:8080/api/health", timeout=2.0)
        if response.status_code == 200:
            data = response.json()
            return {
                "running": True,
                "status": data.get("status", "unknown"),
                "database": data.get("database", "unknown"),
                "timestamp": data.get("timestamp", "unknown")
            }
        else:
            return {"running": False, "error": f"Status: {response.status_code}"}
    except Exception as e:
        return {"running": False, "error": str(e)}

if __name__ == "__main__":
    # Quick check
    if quick_server_check():
        print("✅ Server is available")
        status = server_status()
        print(f"📊 Status: {status}")
    else:
        print("❌ Server is not available")
        print("💡 Try: ./run_monitored.sh or ./run_stable.sh")
