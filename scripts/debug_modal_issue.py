#!/usr/bin/env python3
"""Debug modal opening issue"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    driver.get('http://localhost:8080/login.html')
    time.sleep(2)
    driver.execute_script('document.getElementById("username").value = "admin"; document.getElementById("password").value = "admin123"; document.querySelector("button[type=\\"submit\\"]").click();')
    time.sleep(3)
    
    driver.get('http://localhost:8080/watch-list.html')
    time.sleep(10)
    
    print('=== Checking Modal Configuration ===')
    config_status = driver.execute_script('''
        return {
            watchListModalConfig: typeof window.watchListModalConfig !== "undefined",
            addTickerModalConfig: typeof window.addTickerModalConfig !== "undefined",
            modalRegistered: window.ModalManagerV2?.modals?.has?.("watchListModal") || false
        };
    ''')
    print(f'Config status: {json.dumps(config_status, indent=2)}')
    
    print('\n=== Checking Modal in DOM ===')
    modal_dom = driver.execute_script('''
        const m = document.getElementById("watchListModal");
        return {
            exists: !!m,
            inBody: m ? document.body.contains(m) : false,
            classes: m ? m.className : null,
            display: m ? window.getComputedStyle(m).display : null,
            visibility: m ? window.getComputedStyle(m).visibility : null
        };
    ''')
    print(f'Modal DOM: {json.dumps(modal_dom, indent=2)}')
    
    print('\n=== Calling showModal ===')
    call_result = driver.execute_script('''
        if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {
            return window.ModalManagerV2.showModal("watchListModal", "add").then(() => {
                return {called: true, resolved: true};
            }).catch((e) => {
                return {called: true, resolved: false, error: e.message};
            });
        }
        return {called: false};
    ''')
    print(f'Call result: {json.dumps(call_result, indent=2)}')
    time.sleep(3)
    
    print('\n=== After showModal ===')
    after_status = driver.execute_script('''
        const m = document.getElementById("watchListModal");
        const bsInstance = bootstrap?.Modal?.getInstance?.(m);
        return {
            modalExists: !!m,
            modalVisible: m ? (m.offsetParent !== null) : false,
            hasShowClass: m ? m.classList.contains("show") : false,
            hasBootstrapInstance: !!bsInstance,
            display: m ? window.getComputedStyle(m).display : null,
            zIndex: m ? window.getComputedStyle(m).zIndex : null,
            ariaHidden: m ? m.getAttribute("aria-hidden") : null
        };
    ''')
    print(f'After status: {json.dumps(after_status, indent=2)}')
    
    print('\n=== Console Errors ===')
    logs = driver.get_log('browser')
    errors = [log for log in logs if log['level'] in ['SEVERE', 'ERROR']]
    modal_errors = [e for e in errors if 'modal' in e.get('message', '').lower() or 'ModalManagerV2' in e.get('message', '')]
    for err in modal_errors[:5]:
        print(f'  {err.get("message", "")[:200]}')
        
finally:
    driver.quit()

