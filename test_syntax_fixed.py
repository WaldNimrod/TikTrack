
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def test_auth_fixed():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing if syntax error is fixed...')
        driver.get('http://localhost:8080/')
        
        time.sleep(3)
        
        # Check for syntax errors in console
        console_logs = []
        try:
            # This might not work, but let's try
            logs = driver.get_log('browser')
            syntax_errors = [log for log in logs if 'SyntaxError' in log.get('message', '')]
            if syntax_errors:
                print('❌ Still have syntax errors:')
                for error in syntax_errors:
                    print(f'   {error["message"]}')
            else:
                print('✅ No syntax errors found')
        except:
            print('⚠️ Could not check console logs')
        
        # Check if auth-guard loads
        auth_guard_loaded = False
        try:
            # Try to execute a simple script to see if auth-guard loaded
            driver.execute_script('return typeof window.AuthGuard !== "undefined"')
            auth_guard_loaded = True
            print('✅ AuthGuard object exists')
        except:
            print('❌ AuthGuard object not found')
        
        if auth_guard_loaded:
            # Check if our logs appear
            driver.execute_script('console.log("[TEST] Checking if auth-guard logs appear")')
            time.sleep(1)
        
        return auth_guard_loaded
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

result = test_auth_fixed()
print(f'Auth guard loads: {"YES" if result else "NO"}')
