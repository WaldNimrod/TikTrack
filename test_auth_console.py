
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

def test_auth_and_console():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing authentication and checking console errors...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(5)
        
        # בדוק שגיאות בקונסול
        console_logs = driver.get_log('browser')
        if console_logs:
            print('📋 Console errors:')
            for log in console_logs[:10]:  # הצג עד 10 שגיאות
                print(f'  {log["level"]}: {log["message"]}')
        else:
            print('✅ No console errors found')
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal and login_modal[0].is_displayed():
            print('❌ Login modal is displayed - authentication required')
            
            # נסה לבצע כניסה דרך API ישירות
            api_login_js = """
            // בדוק אם יש פונקציית login ב-TikTrackAuth
            if (window.TikTrackAuth && window.TikTrackAuth.login) {
                console.log('Attempting API login...');
                window.TikTrackAuth.login('admin', 'admin123')
                    .then(result => {
                        console.log('Login result:', result);
                        return result;
                    })
                    .catch(error => {
                        console.error('Login error:', error);
                        return null;
                    });
            } else {
                console.error('TikTrackAuth.login not found');
            }
            """
            
            driver.execute_script(api_login_js)
            print('✅ API login attempted')
            
            # המתן שהכניסה תושלם
            time.sleep(3)
            
            # בדוק שוב את הקונסול
            console_logs_after = driver.get_log('browser')
            new_logs = console_logs_after[len(console_logs):]
            if new_logs:
                print('📋 New console logs after login attempt:')
                for log in new_logs:
                    print(f'  {log["level"]}: {log["message"]}')
            
            # בדוק אם המודל נסגר
            login_modal_check = driver.find_elements(By.ID, 'loginModal')
            if not login_modal_check or not login_modal_check[0].is_displayed():
                print('✅ Login modal closed - login successful')
                return True
            else:
                print('❌ Login modal still open - login failed')
                return False
        else:
            print('✅ No login modal found - user already authenticated')
            return True
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    success = test_auth_and_console()
    print(f'Authentication test result: {"SUCCESS" if success else "FAILED"}')
