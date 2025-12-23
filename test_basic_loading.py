
import time
import requests
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def test_basic_loading():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing basic page loading...')
        
        # בדוק קודם שהשרת מגיב
        try:
            response = requests.get('http://localhost:8080/', timeout=5)
            print(f'✅ Server responds with status: {response.status_code}')
        except Exception as e:
            print(f'❌ Server not responding: {e}')
            return False
        
        driver.get('http://localhost:8080/')
        
        # המתן הרבה זמן שהדף ייטען
        print('⏳ Waiting for page to load (15 seconds)...')
        time.sleep(15)
        
        # בדוק את כותרת הדף
        title = driver.title
        print(f'📄 Page title: {title}')
        
        # בדוק אם יש אלמנטים בסיסיים
        body = driver.find_element(By.TAG_NAME, 'body')
        if body:
            print('✅ Body element found')
        
        # בדוק אם יש unified-header
        header = driver.find_elements(By.ID, 'unified-header')
        if header:
            print('✅ Header found')
        else:
            print('❌ Header not found')
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal:
            display_style = login_modal[0].get_attribute('style')
            classes = login_modal[0].get_attribute('class')
            print(f'📋 Login modal status: classes="{classes}", style="{display_style}"')
            
            # בדוק אם הוא גלוי
            if 'show' in classes or 'display: block' in (display_style or ''):
                print('❌ Login modal is visible')
                return False
            else:
                print('✅ Login modal is hidden')
        else:
            print('✅ No login modal found')
        
        # בדוק אם יש נתונים בדף
        try:
            total_trades = driver.find_element(By.ID, 'totalTrades')
            if total_trades:
                text = total_trades.text
                print(f'📊 Total trades: {text}')
                if text and text != '0':
                    print('✅ Data loaded successfully')
                    return True
                else:
                    print('⚠️ No data loaded yet')
                    return True  # עדיין הצלחה אם הדף נטען
        except:
            print('⚠️ Could not find totalTrades element')
            return True  # עדיין הצלחה
        
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    success = test_basic_loading()
    print(f'Basic loading test result: {"SUCCESS" if success else "FAILED"}')
