
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

def test_auth_with_js():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing authentication with JavaScript execution...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(5)
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal and login_modal[0].is_displayed():
            print('❌ Login modal is displayed - authentication required')
            
            # השתמש ב-JavaScript כדי לבצע כניסה ישירה
            js_login = """
            // מלא את השדות
            const usernameField = document.getElementById('username');
            const passwordField = document.getElementById('password');
            
            if (usernameField && passwordField) {
                usernameField.value = 'admin';
                passwordField.value = 'admin123';
                
                // שלח את הטופס
                const form = document.getElementById('loginForm');
                if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true }));
                    return true;
                }
            }
            return false;
            """
            
            result = driver.execute_script(js_login)
            if result:
                print('✅ JavaScript login executed')
                
                # המתן שהכניסה תושלם
                time.sleep(3)
                
                # בדוק אם המודל נסגר
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
                            return True
                    except Exception as e:
                        print(f'⚠️ Could not check data loading: {e}')
                        return True
                else:
                    print('❌ Login modal still open - login failed')
                    
                    # בדוק אם יש הודעת שגיאה
                    error_msg = driver.find_elements(By.ID, 'loginError')
                    if error_msg and error_msg[0].text:
                        print(f'❌ Login error: {error_msg[0].text}')
                    
                    return False
            else:
                print('❌ JavaScript login failed - form not found')
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
    success = test_auth_with_js()
    print(f'Authentication test result: {"SUCCESS" if success else "FAILED"}')
