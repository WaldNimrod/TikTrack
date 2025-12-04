#!/usr/bin/env python3
"""
Script to check header initialization method across all pages
בודק בפועל איזה שיטת איתחול header רץ בכל עמוד
"""

import os
import json
import time
import subprocess
from pathlib import Path
from collections import defaultdict

# Try to import selenium
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("⚠️  Selenium not available. Will create manual check script instead.")

# Get project root
project_root = Path(__file__).parent.parent
trading_ui_dir = project_root / 'trading-ui'

# Auth pages to skip
AUTH_PAGES = ['login.html', 'register.html', 'forgot-password.html', 'reset-password.html']

def get_all_html_pages():
    """Get all HTML pages except auth pages and test pages"""
    pages = []
    for html_file in trading_ui_dir.glob('*.html'):
        filename = html_file.name
        
        # Skip auth pages
        if any(auth in filename for auth in AUTH_PAGES):
            continue
        
        # Skip test pages and smart pages
        if filename.startswith('test-') or filename.endswith('-smart.html'):
            continue
        
        # Skip mockups
        if 'mockup' in filename.lower():
            continue
        
        pages.append(html_file)
    
    return sorted(pages)

def check_with_selenium(page_path, base_url='http://localhost:8080'):
    """Check header initialization method using Selenium"""
    if not SELENIUM_AVAILABLE:
        return None
    
    try:
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        # Create driver
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            # Navigate to page
            page_name = page_path.name
            url = f"{base_url}/{page_name}"
            print(f"  Loading: {url}")
            driver.get(url)
            
            # Wait for page to load (wait for console logs)
            time.sleep(5)  # Wait for initialization
            
            # Get console logs
            logs = driver.get_log('browser')
            
            # Check for initialization method in logs
            method = None
            for log in logs:
                message = log.get('message', '')
                if 'HEADER INIT' in message:
                    if 'PLANNED' in message:
                        method = 'planned'
                        break
                    elif 'FALLBACK' in message:
                        method = 'fallback'
                        break
            
            # Also check localStorage
            if not method:
                try:
                    init_logs = driver.execute_script("return localStorage.getItem('__headerInitLogs');")
                    if init_logs:
                        logs_data = json.loads(init_logs)
                        if logs_data:
                            last_log = logs_data[-1]
                            if last_log.get('page', '').endswith(page_name):
                                method = last_log.get('method', 'unknown')
                except:
                    pass
            
            return method
            
        finally:
            driver.quit()
            
    except Exception as e:
        print(f"  Error: {e}")
        return None

def create_manual_check_script(pages):
    """Create a script that can be run manually in browser console"""
    script_content = f"""
// Manual Header Init Method Checker
// Run this in browser console on each page

(function() {{
    'use strict';
    
    const pages = {json.dumps([p.name for p in pages], indent=2)};
    
    function checkCurrentPage() {{
        const pageName = window.location.pathname.split('/').pop();
        const initLogs = JSON.parse(localStorage.getItem('__headerInitLogs') || '[]');
        const pageLog = initLogs.find(log => log.page.endsWith(pageName));
        
        const result = {{
            page: pageName,
            method: window.__headerSystemInitMethod || pageLog?.method || 'unknown',
            headerInitialized: !!(window.headerSystem && window.headerSystem.isInitialized),
            timestamp: new Date().toISOString()
        }};
        
        console.log('📊 HEADER INIT RESULT:', JSON.stringify(result, null, 2));
        return result;
    }}
    
    // Check current page
    const result = checkCurrentPage();
    
    // Store result
    if (!window.__headerInitResults) {{
        window.__headerInitResults = [];
    }}
    window.__headerInitResults.push(result);
    
    console.log('✅ Result stored in window.__headerInitResults');
    console.log('📋 To see all results: console.log(JSON.stringify(window.__headerInitResults, null, 2))');
    
    return result;
}})();
"""
    
    script_file = project_root / 'scripts' / 'manual-header-check.js'
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    return script_file

def main():
    print("🔍 Checking header initialization method across all pages...")
    print("=" * 70)
    
    pages = get_all_html_pages()
    print(f"Found {len(pages)} pages to check\n")
    
    results = {
        'planned': [],
        'fallback': [],
        'unknown': [],
        'errors': []
    }
    
    # Check if server is running
    try:
        import urllib.request
        urllib.request.urlopen('http://localhost:8080', timeout=2)
        server_running = True
        print("✅ Server is running on http://localhost:8080\n")
    except:
        server_running = False
        print("⚠️  Server is not running. Cannot check pages automatically.")
        print("   Please start the server with: ./start_server.sh\n")
    
    if server_running and SELENIUM_AVAILABLE:
        print("Using Selenium to check pages...\n")
        for page in pages:
            page_name = page.name
            print(f"Checking {page_name}...", end=' ')
            method = check_with_selenium(page)
            
            if method:
                results[method].append(page_name)
                print(f"✅ {method.upper()}")
            else:
                results['unknown'].append(page_name)
                print("❓ UNKNOWN")
    else:
        # Create manual check script
        print("Creating manual check script...\n")
        script_file = create_manual_check_script(pages)
        print(f"✅ Created manual check script: {script_file}")
        print("\nTo use it:")
        print("1. Open each page in your browser")
        print("2. Open browser console (F12)")
        print("3. Copy and paste the content of the script")
        print("4. Check the result in console\n")
        
        # For now, just show which pages have init-system
        print("Based on file analysis:\n")
        for page in pages:
            page_name = page.name
            has_init = 'package-manifest.js' in page.read_text(encoding='utf-8') or \
                      'page-initialization-configs.js' in page.read_text(encoding='utf-8')
            
            if has_init:
                results['planned'].append(page_name)
                print(f"✅ {page_name:40} - Has init-system (likely PLANNED)")
            else:
                results['fallback'].append(page_name)
                print(f"🔄 {page_name:40} - No init-system (will use FALLBACK)")
    
    print("\n" + "=" * 70)
    print("📊 SUMMARY:")
    print("=" * 70)
    print(f"✅ PLANNED method: {len(results['planned'])} pages")
    print(f"🔄 FALLBACK method: {len(results['fallback'])} pages")
    print(f"❓ UNKNOWN: {len(results['unknown'])} pages")
    if results['errors']:
        print(f"❌ ERRORS: {len(results['errors'])} pages")
    
    # Save results
    results_file = project_root / 'documentation' / '05-REPORTS' / 'header-init-actual-results.json'
    results_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {results_file}")
    
    return results

if __name__ == '__main__':
    main()

