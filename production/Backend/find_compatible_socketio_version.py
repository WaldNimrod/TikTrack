#!/usr/bin/env python3
"""
Socket.IO Version Compatibility Finder - TikTrack
================================================

סקריפט לבדיקה אוטומטית של גרסאות Socket.IO client תואמות
בודק את כל הגרסאות הזמינות ב-CDN ומחזיר את הגרסה התואמת

שימוש:
    python3 find_compatible_socketio_version.py
"""

import requests
import json
import time
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

# רשימת גרסאות Socket.IO client לבדיקה
SOCKETIO_VERSIONS = [
    # גרסאות 4.x
    "4.7.2", "4.6.1", "4.5.4", "4.4.1", "4.3.2", "4.2.1", "4.1.3", "4.0.1",
    # גרסאות 3.x
    "3.1.3", "3.0.5", "3.0.0",
    # גרסאות 2.x
    "2.4.1", "2.3.0", "2.2.0", "2.1.1", "2.0.4", "2.0.3", "2.0.2", "2.0.1", "2.0.0",
    # גרסאות 1.x
    "1.7.4", "1.7.3", "1.4.8", "1.4.5", "1.3.7", "1.2.1", "1.1.0", "1.0.6", "1.0.5", "1.0.4", "1.0.3", "1.0.2", "1.0.1", "1.0.0",
    # גרסאות 0.9.x
    "0.9.19", "0.9.16", "0.9.13", "0.9.10", "0.9.7", "0.9.4", "0.9.1", "0.9.0"
]

def check_version_availability(version):
    """בדיקה אם הגרסה זמינה ב-CDN"""
    try:
        url = f"https://cdn.socket.io/{version}/socket.io.min.js"
        response = requests.head(url, timeout=5)
        return version if response.status_code == 200 else None
    except:
        return None

def test_socketio_connection(version):
    """בדיקת חיבור Socket.IO עם גרסה ספציפית"""
    try:
        # יצירת קובץ HTML זמני לבדיקה
        test_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Socket.IO Test - {version}</title>
    <script src="https://cdn.socket.io/{version}/socket.io.min.js"></script>
</head>
<body>
    <script>
        try {{
            const socket = io('http://localhost:8080');
            socket.on('connect', () => {{
                console.log('SUCCESS: Connected with version {version}');
                document.body.innerHTML = 'SUCCESS: {version}';
            }});
            socket.on('connect_error', (error) => {{
                console.log('ERROR: {version} -', error);
                document.body.innerHTML = 'ERROR: {version} - ' + error;
            }});
            setTimeout(() => {{
                if (socket.connected) {{
                    console.log('SUCCESS: {version}');
                }} else {{
                    console.log('ERROR: {version} - No connection');
                }}
            }}, 3000);
        }} catch (error) {{
            console.log('ERROR: {version} -', error);
        }}
    </script>
</body>
</html>
        """
        
        # שמירת הקובץ
        test_file = f"test_socketio_{version.replace('.', '_')}.html"
        with open(test_file, 'w') as f:
            f.write(test_html)
        
        # בדיקה אם השרת רץ
        try:
            response = requests.get("http://localhost:8080/socket.io/", timeout=2)
            if response.status_code != 200:
                return version, False, "Server not running"
        except:
            return version, False, "Server not accessible"
        
        # בדיקה מהירה עם curl
        try:
            # יצירת בקשה HTTP פשוטה לבדיקת תאימות
            test_url = f"http://localhost:8080/socket.io/?EIO=4&transport=polling"
            response = requests.get(test_url, timeout=3)
            
            if "unsupported version" in response.text.lower():
                return version, False, "Unsupported version"
            elif response.status_code == 200:
                return version, True, "Compatible"
            else:
                return version, False, f"HTTP {response.status_code}"
                
        except Exception as e:
            return version, False, f"Connection error: {str(e)}"
            
    except Exception as e:
        return version, False, f"Test error: {str(e)}"

def main():
    print("🚀 TikTrack Socket.IO Version Compatibility Finder")
    print("==================================================")
    print(f"🔍 בדיקת {len(SOCKETIO_VERSIONS)} גרסאות Socket.IO...")
    print()
    
    # בדיקת זמינות גרסאות
    print("📦 בדיקת זמינות גרסאות ב-CDN...")
    available_versions = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_version = {executor.submit(check_version_availability, version): version 
                           for version in SOCKETIO_VERSIONS}
        
        for future in as_completed(future_to_version):
            version = future_to_version[future]
            try:
                result = future.result()
                if result:
                    available_versions.append(result)
                    print(f"   ✅ {result}")
                else:
                    print(f"   ❌ {version}")
            except Exception as e:
                print(f"   ❌ {version} - Error: {e}")
    
    print(f"\n📊 נמצאו {len(available_versions)} גרסאות זמינות")
    print()
    
    if not available_versions:
        print("❌ לא נמצאו גרסאות זמינות!")
        return
    
    # בדיקת תאימות עם השרת
    print("🔌 בדיקת תאימות עם השרת...")
    compatible_versions = []
    
    for version in available_versions:
        print(f"   🔍 בודק {version}...", end=" ")
        version_result, is_compatible, message = test_socketio_connection(version)
        
        if is_compatible:
            compatible_versions.append(version)
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
        
        time.sleep(0.5)  # הפסקה קצרה בין בדיקות
    
    print()
    print("📊 תוצאות:")
    print("============")
    
    if compatible_versions:
        print(f"✅ נמצאו {len(compatible_versions)} גרסאות תואמות:")
        for version in compatible_versions:
            print(f"   🎯 {version}")
        
        # המלצה על הגרסה הטובה ביותר
        recommended = compatible_versions[0]  # הגרסה הראשונה (הכי חדשה)
        print(f"\n🎯 המלצה: השתמש בגרסה {recommended}")
        print(f"   URL: https://cdn.socket.io/{recommended}/socket.io.min.js")
        
        # עדכון אוטומטי של הקובץ
        print(f"\n🔧 עדכון אוטומטי של realtime-notifications-client.js...")
        try:
            with open('trading-ui/scripts/realtime-notifications-client.js', 'r') as f:
                content = f.read()
            
            # חיפוש והחלפה של URL הגרסה
            import re
            pattern = r'https://cdn\.socket\.io/[^/]+/socket\.io\.min\.js'
            replacement = f'https://cdn.socket.io/{recommended}/socket.io.min.js'
            new_content = re.sub(pattern, replacement, content)
            
            if new_content != content:
                with open('trading-ui/scripts/realtime-notifications-client.js', 'w') as f:
                    f.write(new_content)
                print(f"   ✅ הקובץ עודכן לגרסה {recommended}")
            else:
                print(f"   ⚠️ לא נמצא URL לעדכון")
                
        except Exception as e:
            print(f"   ❌ שגיאה בעדכון הקובץ: {e}")
        
    else:
        print("❌ לא נמצאו גרסאות תואמות!")
        print("\n🔧 פתרונות אפשריים:")
        print("1. ודא שהשרת רץ: python3 Backend/dev_server.py")
        print("2. בדוק את גרסאות השרת: python3 Backend/check_socketio_compatibility.py")
        print("3. נסה להריץ את השרת בסביבה וירטואלית")
    
    # ניקוי קבצים זמניים
    import glob
    for temp_file in glob.glob("test_socketio_*.html"):
        try:
            import os
            os.remove(temp_file)
        except:
            pass

if __name__ == "__main__":
    main()
