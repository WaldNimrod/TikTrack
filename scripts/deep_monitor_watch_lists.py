#!/usr/bin/env python3
"""
Deep Monitoring Script for Watch Lists System
Comprehensive monitoring of all processes and issues
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import json

# Setup driver
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Login
    print('🔐 Logging in...')
    driver.get('http://localhost:8080/login.html')
    time.sleep(2)
    driver.execute_script('document.getElementById("username").value = "admin";')
    driver.execute_script('document.getElementById("password").value = "admin123";')
    driver.execute_script('document.querySelector("button[type=\\"submit\\"]").click();')
    time.sleep(3)
    
    # Go to watch lists page
    print('📄 Navigating to watch_list.html...')
    driver.get('http://localhost:8080/watch_list.html')
    time.sleep(10)
    
    print('\n' + '='*80)
    print('📊 ניטור מעמיק - Watch Lists System')
    print('='*80)
    
    # Test 1: Check all systems
    print('\n1. בדיקת מערכות JavaScript:')
    systems = driver.execute_script('''
        return {
            WatchListsDataService: typeof window.WatchListsDataService !== "undefined",
            WatchListsUIService: typeof window.WatchListsUIService !== "undefined",
            WatchListsPage: typeof window.WatchListsPage !== "undefined",
            ModalManagerV2: typeof window.ModalManagerV2 !== "undefined",
            FlagQuickAction: typeof window.FlagQuickAction !== "undefined",
            showModalSafe: typeof window.showModalSafe !== "undefined"
        };
    ''')
    for sys, available in systems.items():
        print(f'   {"✅" if available else "❌"} {sys}')
    
    # Test 2: Check modals
    print('\n2. בדיקת מודלים:')
    modals = driver.execute_script('''
        const wlModal = document.getElementById("watchListModal");
        const atModal = document.getElementById("addTickerModal");
        return {
            watchListModal: {
                exists: !!wlModal,
                visible: wlModal ? (wlModal.offsetParent !== null) : false
            },
            addTickerModal: {
                exists: !!atModal,
                visible: atModal ? (atModal.offsetParent !== null) : false
            }
        };
    ''')
    print(f'   watchListModal: {"קיים" if modals["watchListModal"]["exists"] else "לא קיים"}, {"גלוי" if modals["watchListModal"]["visible"] else "מוסתר"}')
    print(f'   addTickerModal: {"קיים" if modals["addTickerModal"]["exists"] else "לא קיים"}, {"גלוי" if modals["addTickerModal"]["visible"] else "מוסתר"}')
    
    # Test 3: Check ModalManagerV2
    print('\n3. בדיקת ModalManagerV2:')
    mm2_info = driver.execute_script('''
        if (!window.ModalManagerV2) return {exists: false};
        const modals = window.ModalManagerV2.modals ? Array.from(window.ModalManagerV2.modals.keys()) : [];
        return {
            exists: true,
            hasShowModal: typeof window.ModalManagerV2.showModal === "function",
            registeredModals: modals,
            watchListModalRegistered: modals.includes("watchListModal"),
            addTickerModalRegistered: modals.includes("addTickerModal")
        };
    ''')
    print(f'   ModalManagerV2 exists: {mm2_info.get("exists", False)}')
    if mm2_info.get('exists'):
        print(f'   hasShowModal: {mm2_info.get("hasShowModal", False)}')
        print(f'   Registered modals: {mm2_info.get("registeredModals", [])}')
        print(f'   watchListModal registered: {mm2_info.get("watchListModalRegistered", False)}')
        print(f'   addTickerModal registered: {mm2_info.get("addTickerModalRegistered", False)}')
    
    # Test 4: Test openAddListModal
    print('\n4. בדיקת openAddListModal:')
    try:
        result = driver.execute_script('''
            if (window.WatchListsPage && window.WatchListsPage.openAddListModal) {
                window.WatchListsPage.openAddListModal();
                return {called: true};
            }
            return {called: false};
        ''')
        print(f'   Function called: {result.get("called", False)}')
        time.sleep(3)
        modal_visible = driver.execute_script('''
            const m = document.getElementById("watchListModal");
            return m && m.offsetParent !== null;
        ''')
        print(f'   {"✅" if modal_visible else "❌"} Modal visible: {modal_visible}')
        if modal_visible:
            driver.execute_script('document.querySelector("#watchListModal .btn-close")?.click();')
            time.sleep(1)
    except Exception as e:
        print(f'   ❌ Error: {e}')
    
    # Test 5: Check active list
    print('\n5. בדיקת רשימה פעילה:')
    active_info = driver.execute_script('''
        return {
            activeListId: window.WatchListsPage?.activeListId || null,
            listsCount: window.WatchListsPage?.watchListsData?.length || 0
        };
    ''')
    print(f'   Active List ID: {active_info["activeListId"]}')
    print(f'   Total Lists: {active_info["listsCount"]}')
    
    # Test 6: Test addTicker
    if active_info['activeListId']:
        print('\n6. בדיקת addTicker:')
        try:
            driver.execute_script('if(window.WatchListsPage && window.WatchListsPage.addTicker) { window.WatchListsPage.addTicker(); }')
            time.sleep(3)
            modal_visible = driver.execute_script('''
                const m = document.getElementById("addTickerModal");
                return m && m.offsetParent !== null;
            ''')
            print(f'   {"✅" if modal_visible else "❌"} Modal opened: {modal_visible}')
            if modal_visible:
                driver.execute_script('document.querySelector("#addTickerModal .btn-close, #addTickerModal [data-bs-dismiss]")?.click();')
                time.sleep(1)
        except Exception as e:
            print(f'   ❌ Error: {e}')
    else:
        print('\n5. דילוג - אין רשימה פעילה')
    
    # Test 7: Console errors
    print('\n7. שגיאות קונסול:')
    logs = driver.get_log('browser')
    errors = [log for log in logs if log['level'] in ['SEVERE', 'ERROR']]
    print(f'   סך הכל שגיאות: {len(errors)}')
    for err in errors[:5]:
        msg = err.get('message', '')
        if any(k in msg for k in ['Modal', 'modal', 'showModal', 'addTicker', 'openAddListModal']):
            print(f'   🔴 {msg[:150]}')
    
    print('\n' + '='*80)
    print('✅ ניטור הושלם')
    print('='*80)
        
finally:
    driver.quit()

