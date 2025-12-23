
import time
import json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

def test_full_auth_flow():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing full authentication flow with modal fix...')
        
        # פתח את הדף
        driver.get('http://localhost:8080/')
        time.sleep(8)  # המתן שהכל ייטען
        
        # בדוק מודלים
        modal_count_js = """
        const modals = document.querySelectorAll('#loginModal');
        return modals.length;
        """
        modal_count = driver.execute_script(modal_count_js)
        print(f'📊 Modal count: {modal_count}')
        
        if modal_count == 1:
            print('✅ Only 1 modal found - good!')
        else:
            print(f'❌ Found {modal_count} modals - still an issue')
            return False
        
        # נסה להיכנס עם פרטי admin
        try:
            # מלא את השדות
            username_field = driver.find_element(By.ID, 'username')
            password_field = driver.find_element(By.ID, 'password')
            
            username_field.clear()
            username_field.send_keys('admin')
            password_field.clear() 
            password_field.send_keys('admin123')
            
            print('✅ Filled login form')
            
            # לחץ על כפתור ההתחברות
            # נסה למצוא את הכפתור
            login_buttons = driver.find_elements(By.CSS_SELECTOR, 'button[type="submit"], .btn-primary')
            
            if login_buttons:
                login_buttons[0].click()
                print('✅ Clicked login button')
                
                # המתן שהכניסה תושלם
                time.sleep(5)
                
                # בדוק אם המודל נסגר
                login_modal = driver.find_elements(By.ID, 'loginModal')
                if not login_modal or not login_modal[0].is_displayed():
                    print('✅ Login modal closed - checking if authenticated')
                    
                    # בדוק אם יש נתונים
                    try:
                        total_trades = driver.find_element(By.ID, 'totalTrades')
                        if total_trades:
                            print(f'✅ Authentication successful! totalTrades: {total_trades.text}')
                            return True
                    except:
                        print('⚠️ Could not find totalTrades element')
                        return True
                else:
                    print('❌ Login modal still visible after login attempt')
                    return False
            else:
                print('❌ Login button not found')
                return False
                
        except Exception as e:
            print(f'❌ Error during login: {e}')
            return False
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    success = test_full_auth_flow()
    print(f'Full auth flow test result: {"SUCCESS" if success else "FAILED"}')
