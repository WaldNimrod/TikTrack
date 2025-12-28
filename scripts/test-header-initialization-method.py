#!/usr/bin/env python3
"""
Script to test header initialization method across all pages
בודק איזה שיטת איתחול header רץ בכל עמוד (מתוכנן או גיבוי)
"""

import os
import subprocess
import json
import re
from pathlib import Path
from collections import defaultdict

# Get project root
project_root = Path(__file__).parent.parent
trading_ui_dir = project_root / 'trading-ui'

# Auth pages to skip
AUTH_PAGES = ['login.html', 'register.html', 'forgot_password.html', 'reset_password.html']

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

def check_page_has_init_system(page_path):
    """Check if page loads init-system or core-systems.js"""
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Check for direct references
            if 'init-system' in content or 'core-systems.js' in content:
                return True
            # Check for package-manifest.js (which loads init-system)
            if 'package-manifest.js' in content:
                return True
            # Check for page-initialization-configs.js (which is part of init-system)
            if 'page-initialization-configs.js' in content:
                return True
            return False
    except Exception as e:
        print(f"Error reading {page_path}: {e}")
        return False

def create_test_report():
    """Create a test HTML page that will check initialization method"""
    test_script = '''
<!DOCTYPE html>
<html>
<head>
    <title>Header Init Test</title>
    <script>
        // Wait for page to fully load
        window.addEventListener('load', function() {
            setTimeout(function() {
                const result = {
                    page: window.location.pathname,
                    initMethod: window.__headerSystemInitMethod || 'unknown',
                    headerInitialized: !!(window.headerSystem && window.headerSystem.isInitialized),
                    hasUnifiedAppInitializer: typeof window.UnifiedAppInitializer !== 'undefined',
                    unifiedAppInitialized: window.globalInitializationState?.unifiedAppInitialized || false
                };
                
                // Send result to parent if in iframe
                if (window.parent !== window) {
                    window.parent.postMessage(result, '*');
                } else {
                    console.log('HEADER_INIT_RESULT:', JSON.stringify(result));
                }
            }, 3000); // Wait 3 seconds for initialization
        });
    </script>
</head>
<body>
    <h1>Testing Header Initialization</h1>
    <p>Check console for HEADER_INIT_RESULT</p>
</body>
</html>
    '''
    return test_script

def main():
    print("🔍 Checking header initialization method across all pages...")
    print("=" * 70)
    
    pages = get_all_html_pages()
    print(f"Found {len(pages)} pages to check\n")
    
    results = {
        'planned': [],
        'fallback': [],
        'unknown': [],
        'no_init_system': []
    }
    
    for page in pages:
        page_name = page.name
        has_init = check_page_has_init_system(page)
        
        if not has_init:
            results['no_init_system'].append(page_name)
            print(f"⚠️  {page_name:40} - No init-system found")
            continue
        
        # For now, we'll mark pages that have init-system as potentially using planned method
        # The actual method will be determined by the logs when pages are loaded
        print(f"✅ {page_name:40} - Has init-system")
        results['planned'].append(page_name)
    
    print("\n" + "=" * 70)
    print("📊 SUMMARY:")
    print("=" * 70)
    print(f"✅ Pages with init-system (likely PLANNED method): {len(results['planned'])}")
    print(f"⚠️  Pages without init-system (will use FALLBACK): {len(results['no_init_system'])}")
    print(f"❓ Unknown method: {len(results['unknown'])}")
    
    print("\n" + "=" * 70)
    print("📋 DETAILS:")
    print("=" * 70)
    
    if results['planned']:
        print(f"\n✅ PLANNED method ({len(results['planned'])} pages):")
        for page in sorted(results['planned']):
            print(f"   - {page}")
    
    if results['no_init_system']:
        print(f"\n⚠️  NO INIT-SYSTEM ({len(results['no_init_system'])} pages):")
        for page in sorted(results['no_init_system']):
            print(f"   - {page}")
    
    # Save results to JSON
    results_file = project_root / 'documentation' / '05-REPORTS' / 'header-init-method-results.json'
    results_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {results_file}")
    
    # Create markdown report
    report_file = project_root / 'documentation' / '05-REPORTS' / 'HEADER_INIT_METHOD_REPORT.md'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("# Header Initialization Method Report\n\n")
        f.write(f"**Generated:** {subprocess.check_output(['date'], text=True).strip()}\n\n")
        f.write("## Summary\n\n")
        f.write(f"- **Planned Method (init-system):** {len(results['planned'])} pages\n")
        f.write(f"- **No init-system:** {len(results['no_init_system'])} pages\n")
        f.write(f"- **Unknown:** {len(results['unknown'])} pages\n\n")
        
        f.write("## Pages with Planned Method (init-system)\n\n")
        for page in sorted(results['planned']):
            f.write(f"- `{page}`\n")
        
        if results['no_init_system']:
            f.write("\n## Pages without init-system (will use fallback)\n\n")
            for page in sorted(results['no_init_system']):
                f.write(f"- `{page}`\n")
    
    print(f"📄 Report saved to: {report_file}")
    
    return results

if __name__ == '__main__':
    main()

