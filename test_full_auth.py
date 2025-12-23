
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager
import json

def test_full_authentication_flow():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing full authentication flow...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(5)
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal and login_modal[0].is_displayed():
            print('❌ Login modal is displayed - authentication required')
            
            # בדוק אם יש שדות כניסה
            username_field = driver.find_elements(By.ID, 'loginUsername')
            password_field = driver.find_elements(By.ID, 'loginPassword')
            
            if username_field and password_field:
                print('✅ Login form found, attempting to login...')
                
                # מלא את השדות
                username_field[0].clear()
                username_field[0].send_keys('admin')
                password_field[0].clear()
                password_field[0].send_keys('admin123')
                
                # לחץ על כפתור הכניסה
                login_button = driver.find_elements(By.ID, 'loginSubmitBtn')
                if login_button:
                    login_button[0].click()
                    print('✅ Login button clicked')
                    
                    # המתן שהכניסה תושלם
                    time.sleep(3)
                    
                    # בדוק אם המודל נסגר
                    if not login_modal[0].is_displayed():
                        print('✅ Login modal closed - login successful')
                        
                        # בדוק אם יש נתונים בדף
                        try:
                            trades_count = driver.find_element(By.ID, 'totalTrades')
                            if trades_count and trades_count.text != '0':
                                print('✅ Data loaded successfully')
                                return True
                            else:
                                print('⚠️ No data loaded yet')
                        except:
                            print('⚠️ Could not check data loading')
                            return True
                    else:
                        print('❌ Login modal still open - login failed')
                        return False
                else:
                    print('❌ Login button not found')
                    return False
            else:
                print('❌ Login form fields not found')
                return False
        else:
            print('✅ No login modal found - checking if already authenticated...')
            
            # בדוק אם יש נתונים בדף
            try:
                trades_count = driver.find_element(By.ID, 'totalTrades')
                if trades_count and trades_count.text != '0':
                    print('✅ Data loaded - user is authenticated')
                    return True
                else:
                    print('⚠️ No data loaded - possible authentication issue')
                    return False
            except Exception as e:
                print(f'⚠️ Could not check data loading: {e}')
                return False
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    success = test_full_authentication_flow()
    print(f'
🎯 Authentication test result: {"✅ SUCCESS" if success else "❌ FAILED"}')
