
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def debug_with_logs():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing with debug logs...')
        driver.get('http://localhost:8080/')
        time.sleep(5)
        
        # Manually call showLoginModal and capture console logs
        driver.execute_script('window.TikTrackAuth.showLoginModal()')
        
        # Wait a bit
        time.sleep(2)
        
        # Check modal count
        modal_count = driver.execute_script('return document.querySelectorAll("#loginModal").length')
        print(f'Modal count: {modal_count}')
        
        return modal_count > 0
        
    except Exception as e:
        print(f'Error: {e}')
        return False
    finally:
        driver.quit()

debug_with_logs()
