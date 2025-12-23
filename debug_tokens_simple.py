
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def debug_auth_tokens():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Debugging auth tokens...')
        driver.get('http://localhost:8080/')
        time.sleep(3)
        
        # Check tokens
        current_user = driver.execute_script('return !!window.currentUser')
        auth_token = driver.execute_script('return !!window.authToken')
        dev_token = driver.execute_script('return sessionStorage.getItem("dev_authToken") ? "present" : "missing"')
        dev_user = driver.execute_script('return sessionStorage.getItem("dev_currentUser") ? "present" : "missing"')
        
        print(f'currentUser: {current_user}')
        print(f'authToken: {auth_token}')
        print(f'devToken: {dev_token}')
        print(f'devUser: {dev_user}')
        
        return True
        
    except Exception as e:
        print(f'Error: {e}')
        return False
    finally:
        driver.quit()

debug_auth_tokens()
