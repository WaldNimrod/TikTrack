#!/usr/bin/env python3
"""
Script to test volume data on tickers page
Uses Selenium to check what data is received and displayed
"""

import json
import time
from datetime import datetime
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"

def test_tickers_volume():
    """Test volume data on tickers page"""
    print("=" * 60)
    print("🔍 בדיקת נתוני נפח בעמוד טיקרים")
    print("=" * 60)
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    driver = None
    try:
        # Initialize driver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(30)
        
        # Navigate to tickers page
        print(f"\n📄 Navigating to: {BASE_URL}/tickers.html")
        driver.get(f"{BASE_URL}/tickers.html")
        
        # Wait for page to load and data to be fetched
        print("⏳ Waiting for page to load...")
        time.sleep(8)  # Give more time for data to load
        
        # Wait for table to appear
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "tickersTable"))
            )
            print("✅ Table found")
        except TimeoutException:
            print("⚠️  Table not found, continuing anyway...")
        
        # Check API response - use Promise to wait for result
        print("\n📡 Checking API response...")
        api_data = driver.execute_script("""
            return new Promise((resolve) => {
                fetch('/api/tickers/?_t=' + Date.now(), {
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'error') {
                        resolve({ error: data.error, status: data.status });
                        return;
                    }
                    
                    const tickers = data.data || [];
                    const firstTicker = tickers.length > 0 ? tickers[0] : null;
                    
                    resolve({
                        status: data.status,
                        totalTickers: tickers.length,
                        firstTicker: firstTicker ? {
                            id: firstTicker.id,
                            symbol: firstTicker.symbol,
                            volume: firstTicker.volume,
                            volumeType: typeof firstTicker.volume,
                            volumeIsNull: firstTicker.volume === null,
                            volumeIsUndefined: firstTicker.volume === undefined,
                            current_price: firstTicker.current_price,
                            change_percent: firstTicker.change_percent,
                            hasVolume: 'volume' in firstTicker,
                            allKeys: Object.keys(firstTicker).filter(k => k.includes('volume') || k.includes('Volume'))
                        } : null,
                        allTickersVolume: tickers.slice(0, 5).map(t => ({
                            symbol: t.symbol,
                            volume: t.volume,
                            volumeType: typeof t.volume,
                            volumeIsNull: t.volume === null,
                            volumeIsUndefined: t.volume === undefined
                        }))
                    });
                })
                .catch(err => {
                    resolve({ error: err.message });
                });
            });
        """)
        
        if api_data:
            print(f"✅ API Response Status: {api_data.get('status', 'unknown')}")
            print(f"📊 Total Tickers: {api_data.get('totalTickers', 0)}")
            
            if api_data.get('firstTicker'):
                ft = api_data['firstTicker']
                print(f"\n📋 First Ticker: {ft.get('symbol', 'N/A')}")
                print(f"   Volume: {ft.get('volume')}")
                print(f"   Volume Type: {ft.get('volumeType')}")
                print(f"   Volume is Null: {ft.get('volumeIsNull')}")
                print(f"   Volume is Undefined: {ft.get('volumeIsUndefined')}")
                print(f"   Has Volume Key: {ft.get('hasVolume')}")
                print(f"   Volume-related Keys: {ft.get('allKeys', [])}")
            
            print(f"\n📊 Sample Tickers Volume Data:")
            for ticker in api_data.get('allTickersVolume', [])[:5]:
                print(f"   {ticker.get('symbol')}: volume={ticker.get('volume')}, type={ticker.get('volumeType')}, null={ticker.get('volumeIsNull')}, undefined={ticker.get('volumeIsUndefined')}")
        else:
            print("❌ Could not get API data")
        
        # Check frontend data
        print("\n💻 Checking frontend data...")
        frontend_data = driver.execute_script("""
            return {
                tickersDataLength: window.tickersData ? window.tickersData.length : 0,
                firstTickerData: window.tickersData && window.tickersData.length > 0 ? {
                    symbol: window.tickersData[0].symbol,
                    volume: window.tickersData[0].volume,
                    volumeType: typeof window.tickersData[0].volume,
                    hasVolume: 'volume' in window.tickersData[0]
                } : null
            };
        """)
        
        if frontend_data:
            print(f"📊 Frontend Tickers Data Length: {frontend_data.get('tickersDataLength', 0)}")
            if frontend_data.get('firstTickerData'):
                ftd = frontend_data['firstTickerData']
                print(f"   First Ticker: {ftd.get('symbol', 'N/A')}")
                print(f"   Volume: {ftd.get('volume')}")
                print(f"   Volume Type: {ftd.get('volumeType')}")
                print(f"   Has Volume Key: {ftd.get('hasVolume')}")
        
        # Check table display
        print("\n📋 Checking table display...")
        table_data = driver.execute_script("""
            const rows = Array.from(document.querySelectorAll('#tickersTable tbody tr'));
            if (rows.length === 0) {
                return { error: 'No rows in table', rowCount: 0 };
            }
            
            const firstRow = rows[0];
            const cells = Array.from(firstRow.querySelectorAll('td'));
            
            // Find volume cell (should be 4th cell: symbol, price, change, volume, status, ...)
            const volumeCell = cells[3]; // Index 3 = 4th cell (volume)
            
            return {
                totalRows: rows.length,
                firstRowCells: cells.length,
                volumeCellText: volumeCell ? volumeCell.textContent.trim() : 'NOT FOUND',
                volumeCellHTML: volumeCell ? volumeCell.innerHTML.substring(0, 200) : 'NOT FOUND',
                allCells: cells.map((cell, idx) => ({
                    index: idx,
                    text: cell.textContent.trim().substring(0, 50),
                    classes: cell.className
                }))
            };
        """)
        
        if table_data:
            print(f"📊 Table Rows: {table_data.get('totalRows', 0)}")
            print(f"📊 First Row Cells: {table_data.get('firstRowCells', 0)}")
            print(f"📊 Volume Cell Text: {table_data.get('volumeCellText', 'N/A')}")
            print(f"📊 Volume Cell HTML: {table_data.get('volumeCellHTML', 'N/A')[:100]}...")
            print(f"\n📊 All Cells:")
            for cell in table_data.get('allCells', [])[:6]:
                print(f"   [{cell.get('index')}] {cell.get('text')} (classes: {cell.get('classes')})")
        
        # Check console logs
        print("\n📝 Console Logs (last 20):")
        logs = driver.get_log('browser')
        for log in logs[-20:]:
            if 'volume' in log.get('message', '').lower() or 'נפח' in log.get('message', ''):
                print(f"   [{log.get('level')}] {log.get('message')}")
        
        print("\n" + "=" * 60)
        print("✅ בדיקה הושלמה")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    test_tickers_volume()

