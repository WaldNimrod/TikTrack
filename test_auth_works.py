
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def test_auth_still_works():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing if authentication still works after modal fix...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(8)
        
        # בדוק אם יש מודל כלל
        modals = driver.find_elements(By.ID, 'loginModal')
        print(f'📊 Modal count: {len(modals)}')
        
        if len(modals) == 0:
            print('❌ No login modal found - authentication may not be working')
            return False
        elif len(modals) == 1:
            print('✅ One login modal found - authentication should work')
            return True
        else:
            print(f'❌ Multiple modals found ({len(modals)}) - issue still exists')
            return False
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    works = test_auth_still_works()
    print(f'Authentication works: {"YES" if works else "NO"}')
