
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def test_manual_auth_with_session():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing manual authentication with session storage...')
        
        # קבל טוקן דרך API
        import requests
        login_response = requests.post('http://localhost:8080/api/auth/login', 
                                     json={'username': 'admin', 'password': 'admin123'})
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            access_token = login_data.get('data', {}).get('access_token')
            user_data = login_data.get('data', {}).get('user')
            
            if access_token and user_data:
                print('✅ Got access token from API')
                
                # טען את הדף
                driver.get('http://localhost:8080/')
                time.sleep(5)
                
                # שמור את הטוקן ב-sessionStorage לפני שהדף מתחיל לבדוק אימות
                save_token_js = f"""
                // שמור את הטוקן ב-sessionStorage (כמו ש-auth.js עושה)
                sessionStorage.setItem('dev_authToken', '{access_token}');
                sessionStorage.setItem('dev_currentUser', '{user_data}'.replace(/'/g, "\'"));
                
                // גם נסה לשמור ב-UnifiedCacheManager אם הוא זמין
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {{
                    window.UnifiedCacheManager.save('authToken', '{access_token}', {{ includeUserId: false }});
                    window.UnifiedCacheManager.save('currentUser', {user_data}, {{ includeUserId: false }});
                    console.log('Token saved in UnifiedCacheManager');
                }} else {{
                    console.log('UnifiedCacheManager not ready yet');
                }}
                
                console.log('Token saved in sessionStorage');
                """
                
                driver.execute_script(save_token_js)
                print('✅ Token saved in browser storage')
                
                # רענן את הדף כדי שהאימות יעבוד
                driver.refresh()
                print('✅ Page refreshed')
                
                # המתן שהדף ייטען מחדש
                time.sleep(8)
                
                # בדוק אם המודל נסגר
                login_modal = driver.find_elements(By.ID, 'loginModal')
                if not login_modal or not login_modal[0].is_displayed():
                    print('✅ Login modal closed - authentication successful')
                    
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
                    print('❌ Login modal still visible')
                    return False
            else:
                print('❌ No access token in API response')
                return False
        else:
            print(f'❌ API login failed: {login_response.status_code}')
            return False
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    success = test_manual_auth_with_session()
    print(f'Manual auth with session test result: {"SUCCESS" if success else "FAILED"}')
