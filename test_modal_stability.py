
import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

def test_modal_behavior():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
    
    try:
        print('🔍 Testing modal behavior with console logs...')
        driver.get('http://localhost:8080/')
        
        # המתן שהדף ייטען
        time.sleep(10)
        
        # בדוק מודלים בהתחלה
        modal_check_js = """
        const modals = document.querySelectorAll('#loginModal');
        console.log('Initial modal count:', modals.length);
        modals.forEach((modal, i) => {
            console.log(`Modal ${i+1}: class='${modal.className}', display='${modal.style.display}'`);
        });
        return modals.length;
        """
        
        initial_count = driver.execute_script(modal_check_js)
        print(f'📊 Initial modal count: {initial_count}')
        
        # המתן עוד קצת וספור שוב
        time.sleep(5)
        
        final_count = driver.execute_script("""
        const modals = document.querySelectorAll('#loginModal');
        console.log('Final modal count:', modals.length);
        modals.forEach((modal, i) => {
            console.log(`Modal ${i+1}: class='${modal.className}', display='${modal.style.display}'`);
        });
        return modals.length;
        """)
        
        print(f'📊 Final modal count: {final_count}')
        
        # בדוק אם יש שינויים במודלים לאורך זמן
        if initial_count != final_count:
            print('❌ Modal count changed over time!')
            return False
        elif final_count > 1:
            print('❌ Multiple modals exist!')
            return False
        elif final_count == 1:
            print('✅ Single modal exists - checking if it stays stable...')
            
            # בדוק אם המודל נשאר יציב
            for i in range(3):
                time.sleep(2)
                current_count = driver.execute_script("return document.querySelectorAll('#loginModal').length;")
                if current_count != 1:
                    print(f'❌ Modal count changed to {current_count} after {i*2+2} seconds!')
                    return False
            
            print('✅ Modal count remained stable at 1')
            return True
        else:
            print('✅ No modals - user might be authenticated')
            return True
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        driver.quit()

if __name__ == '__main__':
    stable = test_modal_behavior()
    print(f'Modal stability test: {"PASS" if stable else "FAIL"}')
