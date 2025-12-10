#!/usr/bin/env python3
"""
Debug InfoSummarySystem loading
Check if info-summary-system.js is loaded and why InfoSummarySystem is not available
"""

import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:8080"
PAGE_URL = f"{BASE_URL}/portfolio-state"

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_script_timeout(60)
    return driver

def debug_info_summary_loading(driver):
    """Debug why InfoSummarySystem is not loaded"""
    print("🔍 Debugging InfoSummarySystem loading...")

    driver.get(PAGE_URL)

    # Wait for page to load
    WebDriverWait(driver, 30).until(
        lambda d: d.execute_script('return document.readyState') == 'complete'
    )

    time.sleep(5)  # Wait for scripts to load

    # Check if the script file was loaded
    script_loaded = driver.execute_script("""
        const scripts = Array.from(document.querySelectorAll('script'));
        const infoSummaryScript = scripts.find(s => s.src && s.src.includes('info-summary-system.js'));
        return {
            scriptFound: !!infoSummaryScript,
            scriptSrc: infoSummaryScript ? infoSummaryScript.src : null,
            scriptLoaded: infoSummaryScript ? !infoSummaryScript.error : null
        };
    """)

    print(f"📄 Script file loaded: {script_loaded}")

    # Check if window.InfoSummarySystem exists
    system_status = driver.execute_script("""
        return {
            infoSummarySystem: typeof window.InfoSummarySystem,
            infoSummarySystemExists: !!window.InfoSummarySystem,
            infoSummaryConfigs: typeof window.INFO_SUMMARY_CONFIGS,
            infoSummaryConfigsExists: !!window.INFO_SUMMARY_CONFIGS
        };
    """)

    print(f"⚙️ System status: {system_status}")

    # Check package manifest
    manifest_status = driver.execute_script("""
        return {
            packageManifest: typeof window.PACKAGE_MANIFEST,
            packageManifestExists: !!window.PACKAGE_MANIFEST,
            infoSummaryPackage: window.PACKAGE_MANIFEST ? window.PACKAGE_MANIFEST['info-summary'] : null
        };
    """)

    print(f"📦 Package manifest: {manifest_status}")

    # Check console errors related to info-summary
    logs = driver.get_log('browser')
    info_summary_errors = [log for log in logs if 'info-summary' in log.get('message', '').lower() or 'InfoSummary' in log.get('message', '')]

    if info_summary_errors:
        print("🚨 InfoSummary related errors:")
        for error in info_summary_errors:
            print(f"  - {error.get('message', '')}")
    else:
        print("✅ No InfoSummary related errors found")

    # Check if the package was supposed to load
    package_check = driver.execute_script("""
        if (window.PACKAGE_MANIFEST && window.PACKAGE_MANIFEST['info-summary']) {
            const pkg = window.PACKAGE_MANIFEST['info-summary'];
            return {
                packageExists: true,
                loadOrder: pkg.loadOrder,
                loadingStrategy: pkg.loadingStrategy,
                dependencies: pkg.dependencies,
                scripts: pkg.scripts ? pkg.scripts.length : 0
            };
        }
        return { packageExists: false };
    """)

    print(f"📋 Package configuration: {package_check}")

    # Check page configuration
    page_config = driver.execute_script("""
        if (window.PAGE_CONFIGS && window.PAGE_CONFIGS['portfolio-state']) {
            const config = window.PAGE_CONFIGS['portfolio-state'];
            return {
                packages: config.packages || [],
                hasInfoSummary: config.packages ? config.packages.includes('info-summary') : false,
                requiredGlobals: config.requiredGlobals || []
            };
        }
        return { configExists: false };
    """)

    print(f"📄 Page configuration: {page_config}")

    return {
        'script_loaded': script_loaded,
        'system_status': system_status,
        'manifest_status': manifest_status,
        'package_check': package_check,
        'page_config': page_config,
        'errors': info_summary_errors
    }

def main():
    print("🚀 InfoSummarySystem Loading Debug")
    print("=" * 50)

    driver = setup_driver()

    try:
        result = debug_info_summary_loading(driver)

        # Save debug report
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        report_file = f"reports/qa/info_summary_debug_{timestamp}.json"

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\n📄 Debug report saved: {report_file}")

        # Analysis
        print("\n🔍 ANALYSIS:")
        if not result['script_loaded'].get('scriptFound'):
            print("❌ Problem: info-summary-system.js script not found in DOM")
        elif not result['system_status'].get('infoSummarySystemExists'):
            print("❌ Problem: InfoSummarySystem not defined on window despite script loading")
        elif not result['page_config'].get('hasInfoSummary'):
            print("❌ Problem: info-summary package not included in page packages")
        else:
            print("✅ Script loading appears correct, issue may be in initialization")

    finally:
        driver.quit()

if __name__ == '__main__':
    main()

