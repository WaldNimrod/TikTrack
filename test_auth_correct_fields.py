
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

def test_auth_with_correct_fields():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing authentication with correct field names...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(5)
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal and login_modal[0].is_displayed():
            print('❌ Login modal is displayed - authentication required')
            
            # בדוק אם יש שדות כניסה עם השמות הנכונים (לפי auth.js)
            username_field = driver.find_elements(By.ID, 'username')
            password_field = driver.find_elements(By.ID, 'password')
            
            if username_field and password_field:
                print('✅ Login form found with correct field names, attempting to login...')
                
                # מלא את השדות
                username_field[0].clear()
                username_field[0].send_keys('admin')
                password_field[0].clear()
                password_field[0].send_keys('admin123')
                
                # לחץ על כפתור הכניסה - חפש לפי טקסט או class
                submit_buttons = driver.find_elements(By.CSS_SELECTOR, 'button[type="submit"], .btn-primary, #loginSubmitBtn')
                
                if submit_buttons:
                    submit_buttons[0].click()
                    print('✅ Submit button clicked')
                    
                    # המתן שהכניסה תושלם
                    time.sleep(3)
                    
                    # בדוק אם המודל נסגר
                    try:
                        # בדוק אם המודל עדיין קיים וגלוי
                        login_modal_check = driver.find_elements(By.ID, 'loginModal')
                        if not login_modal_check or not login_modal_check[0].is_displayed():
                            print('✅ Login modal closed - login successful')
                            
                            # בדוק אם יש נתונים בדף
                            try:
                                trades_count = driver.find_element(By.ID, 'totalTrades')
                                if trades_count:
                                    print(f'✅ Found totalTrades element: {trades_count.text}')
                                    return True
                                else:
                                    print('⚠️ totalTrades element not found')
                                    return True  # עדיין הצלחה שהמודל נסגר
                            except Exception as e:
                                print(f'⚠️ Could not check data loading: {e}')
                                return True
                        else:
                            print('❌ Login modal still open - login failed')
                            return False
                    except:
                        print('❌ Could not check modal status')
                        return False
                else:
                    print('❌ Submit button not found')
                    return False
            else:
                print('❌ Login form fields not found (username/password)')
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
    success = test_auth_with_correct_fields()
    print(f'Authentication test result: {"SUCCESS" if success else "FAILED"}')
