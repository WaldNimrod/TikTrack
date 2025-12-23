
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

def test_modal_loop():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing modal loop issue...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(8)
        
        # ספור כמה מודלים יש
        login_modals = driver.find_elements(By.ID, 'loginModal')
        print(f'📊 Found {len(login_modals)} login modals')
        
        for i, modal in enumerate(login_modals):
            classes = modal.get_attribute('class')
            style = modal.get_attribute('style')
            display = modal.value_of_css_property('display')
            visibility = modal.value_of_css_property('visibility')
            
            print(f'  Modal {i+1}: class="{classes}", display="{display}", visibility="{visibility}"')
            if 'show' in classes:
                print(f'    ❌ Modal {i+1} is visible!')
            else:
                print(f'    ✅ Modal {i+1} is hidden')
        
        # בדוק אם יש stacking (z-index)
        modal_z_indexes = []
        for modal in login_modals:
            try:
                z_index = modal.value_of_css_property('z-index')
                modal_z_indexes.append(z_index)
            except:
                modal_z_indexes.append('auto')
        
        print(f'📊 Z-index values: {modal_z_indexes}')
        
        # בדוק אם יש JavaScript errors
        js_check_modal_count = """
        const modals = document.querySelectorAll('#loginModal');
        const visibleModals = Array.from(modals).filter(m => m.classList.contains('show') || m.style.display === 'block');
        return {
            totalModals: modals.length,
            visibleModals: visibleModals.length,
            modalClasses: Array.from(modals).map(m => m.className),
            modalDisplays: Array.from(modals).map(m => m.style.display)
        };
        """
        
        modal_info = driver.execute_script(js_check_modal_count)
        print(f'📊 JavaScript modal info: {modal_info}')
        
        # בדוק אם יש sessionStorage עם טוקן
        session_check = """
        return {
            hasDevAuthToken: sessionStorage.getItem('dev_authToken') !== null,
            hasDevCurrentUser: sessionStorage.getItem('dev_currentUser') !== null,
            tokenValue: sessionStorage.getItem('dev_authToken') ? 'present' : 'missing'
        };
        """
        
        session_info = driver.execute_script(session_check)
        print(f'📊 Session storage: {session_info}')
        
        return len(login_modals) > 1 or any('show' in modal.get_attribute('class') for modal in login_modals)
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return True
    finally:
        driver.quit()

if __name__ == '__main__':
    has_issue = test_modal_loop()
    print(f'Modal loop issue detected: {"YES" if has_issue else "NO"}')
