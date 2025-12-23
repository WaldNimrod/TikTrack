
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def debug_auth_flow():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Debugging auth flow...')
        driver.get('http://localhost:8080/')
        time.sleep(3)
        
        # Check basic auth availability
        has_auth = driver.execute_script('return typeof window.TikTrackAuth !== "undefined"')
        has_modal_func = driver.execute_script('return typeof window.TikTrackAuth?.showLoginModal === "function"')
        
        print(f'hasTikTrackAuth: {has_auth}')
        print(f'hasShowLoginModal: {has_modal_func}')
        
        if has_modal_func:
            # Call the function
            driver.execute_script('window.TikTrackAuth.showLoginModal()')
            time.sleep(1)
            
            modal_count = driver.execute_script('return document.querySelectorAll("#loginModal").length')
            print(f'modal count after call: {modal_count}')
        else:
            print('showLoginModal not available')
        
        return has_modal_func
        
    except Exception as e:
        print(f'Error: {e}')
        return False
    finally:
        driver.quit()

debug_auth_flow()
