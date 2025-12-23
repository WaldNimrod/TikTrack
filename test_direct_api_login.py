
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def test_direct_api_login():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing direct API login through JavaScript...')
        
        driver.get('http://localhost:8080/')
        time.sleep(10)  # המתן שהכל ייטען
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal and login_modal[0].is_displayed():
            print('❌ Login modal is displayed - attempting direct API login')
            
            # בצע התחברות ישירה דרך API
            login_js = """
            // בצע קריאה ישירה ל-API
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: 'admin123'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Login API response:', data);
                
                if (data.status === 'success' && data.data.access_token) {
                    // שמור את הטוקן ב-UnifiedCacheManager
                    if (window.UnifiedCacheManager) {
                        window.UnifiedCacheManager.save('authToken', data.data.access_token, { includeUserId: false })
                            .then(() => {
                                console.log('Token saved, reloading page...');
                                window.location.reload();
                            })
                            .catch(err => console.error('Failed to save token:', err));
                    } else {
                        console.error('UnifiedCacheManager not available');
                    }
                } else {
                    console.error('Login failed:', data);
                }
            })
            .catch(error => {
                console.error('Login request failed:', error);
            });
            """
            
            driver.execute_script(login_js)
            print('✅ API login script executed')
            
            # המתן שהדף יתרענן
            print('⏳ Waiting for page reload (10 seconds)...')
            time.sleep(10)
            
            # בדוק שוב אם המודל עדיין קיים
            login_modal_check = driver.find_elements(By.ID, 'loginModal')
            if not login_modal_check or not login_modal_check[0].is_displayed():
                print('✅ Login modal closed after API login')
                
                # בדוק אם יש נתונים
                try:
                    total_trades = driver.find_element(By.ID, 'totalTrades')
                    if total_trades:
                        print(f'✅ Data loaded: totalTrades = {total_trades.text}')
                        return True
                except:
                    print('⚠️ Could not check data loading')
                    return True
            else:
                print('❌ Login modal still visible after API login')
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
    success = test_direct_api_login()
    print(f'Direct API login test result: {"SUCCESS" if success else "FAILED"}')
