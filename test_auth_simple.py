
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

def test_authentication():
    options = Options()
    options.add_argument('--headless')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing authentication on http://localhost:8080/')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(3)
        
        # בדוק אם יש מודל כניסה
        login_modal = driver.find_elements(By.ID, 'loginModal')
        if login_modal:
            print('❌ Login modal found - authentication issue')
            return False
        else:
            print('✅ No login modal - user authenticated')
            return True
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    test_authentication()
