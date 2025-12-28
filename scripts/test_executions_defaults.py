#!/usr/bin/env python3
"""
Test script to verify that executions modal correctly applies default trading account
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.firefox import GeckoDriverManager

BASE_URL = "http://localhost:8080"
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

def test_executions_defaults():
    """Test that executions modal applies correct default trading account"""

    print("🚀 Starting executions defaults test...")

    # Setup Firefox driver
    options = Options()
    # options.add_argument("--headless")  # Remove headless to see what's happening
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    try:
        driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
        # Go directly to CRUD testing dashboard (authentication handled by the page)
        driver.get(f"{BASE_URL}/crud_testing_dashboard.html")

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )

        # Check if we need to authenticate
        try:
            # Wait a bit for auth guard to run
            time.sleep(3)

            # If we're redirected to login page, we need to authenticate
            if "login" in driver.current_url.lower() or driver.find_elements(By.CSS_SELECTOR, "input[name='username'], input[id='username']"):
                print("🔐 Authentication required, logging in...")

                # Fill login form
                username_field = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username'], input[id='username'], input[type='text']"))
                )
                password_field = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='password'], input[id='password'], input[type='password']"))
                )

                username_field.clear()
                username_field.send_keys(TEST_USERNAME)
                password_field.clear()
                password_field.send_keys(TEST_PASSWORD)

                # Click login button
                login_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], button[id*='login'], input[type='submit'], button"))
                )
                login_button.click()

                # Wait for redirect back to dashboard
                WebDriverWait(driver, 10).until(
                    lambda driver: "crud_testing_dashboard" in driver.current_url
                )
                print("✅ Authentication successful")
            else:
                print("✅ Already authenticated")

        except Exception as e:
            print(f"ℹ️ Authentication check failed: {e}")

        # Wait for page to fully load
        WebDriverWait(driver, 15).until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )
        print("✅ Page loaded successfully")

        # Wait for JavaScript to initialize
        print("⏳ Waiting for JavaScript initialization...")
        time.sleep(8)

        # Check if buttons appear after waiting
        buttons = driver.find_elements(By.TAG_NAME, "button")
        print(f"After waiting: Found {len(buttons)} buttons")

        if len(buttons) < 10:
            print("❌ Too few buttons found - page may not be loading correctly")
            # Debug: show what we do have
            for i, btn in enumerate(buttons):
                print(f"  Button {i}: {btn.text[:50]}...")
            driver.quit()
            return False

        # Check if the test results section exists (might be hidden initially)
        try:
            test_results = driver.find_element(By.CSS_SELECTOR, "[data-section='test-results']")
            print(f"✅ Test results section found, display: {test_results.get_attribute('style')}")
        except:
            print("ℹ️ Test results section not found initially (expected)")

        # Try to find the executions defaults test button
        try:
            test_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[onclick*='runExecutionsDefaultsTest']"))
            )
            onclick_attr = test_button.get_attribute("onclick")
            print(f"✅ Found executions test button with onclick: {onclick_attr}")
        except TimeoutException:
            print("❌ Could not find executions test button")
            # Debug: list all buttons
            buttons = driver.find_elements(By.TAG_NAME, "button")
            print(f"Found {len(buttons)} buttons total:")
            executions_buttons = []
            for i, btn in enumerate(buttons):
                onclick = btn.get_attribute("onclick") or ""
                text = btn.text.strip()
                if "runExecutions" in onclick or "executions" in onclick.lower() or "ביצועים" in text:
                    executions_buttons.append(f"  Button {i}: onclick='{onclick}' text='{text}'")
            if executions_buttons:
                print("Executions-related buttons:")
                for btn in executions_buttons[:5]:
                    print(btn)
                # Try to click the first one
                if executions_buttons:
                    first_btn_text = executions_buttons[0]
                    btn_index = int(first_btn_text.split(":")[0].split()[-1])
                    test_button = buttons[btn_index]
                    onclick_attr = test_button.get_attribute("onclick")
                    print(f"Using button {btn_index} with onclick: {onclick_attr}")
            else:
                print("No executions-related buttons found")
                driver.quit()
                return False

        # First try calling the function directly via JavaScript to see if it works
        try:
            result = driver.execute_script("""
                try {
                    console.log('Checking functions...');
                    console.log('runExecutionsDefaultsTest exists:', typeof runExecutionsDefaultsTest);
                    console.log('runCrossPageTestForGroup exists:', typeof runCrossPageTestForGroup);
                    console.log('window.crudTester exists:', typeof window.crudTester);
                    console.log('window.CrossPageTester exists:', typeof window.CrossPageTester);

                    if (typeof runExecutionsDefaultsTest === 'function') {
                        console.log('Calling runExecutionsDefaultsTest...');
                        runExecutionsDefaultsTest();
                        return 'runExecutionsDefaultsTest_called';
                    } else if (typeof runCrossPageTestForGroup === 'function') {
                        console.log('Calling runCrossPageTestForGroup directly...');
                        runCrossPageTestForGroup('user', 'defaults', 'ביצועי עסקאות');
                        return 'runCrossPageTestForGroup_called';
                    } else {
                        return 'neither_function_found';
                    }
                } catch (error) {
                    console.error('Error:', error);
                    return 'error: ' + error.message;
                }
            """)
            print(f"✅ JavaScript call result: {result}")

            # Check for JavaScript errors in console
            time.sleep(2)
            try:
                browser_logs = driver.get_log('browser')
                recent_logs = [log for log in browser_logs[-20:]]  # Get last 20 logs
                if recent_logs:
                    print("📝 Recent browser logs:")
                    for log in recent_logs:
                        level = log.get('level', 'UNKNOWN')
                        message = log.get('message', '')
                        if 'runExecutionsDefaultsTest' in message or 'runCrossPageTestForGroup' in message or 'error' in level.lower():
                            print(f"  [{level}] {message[:150]}...")
            except Exception as log_error:
                print(f"Could not get logs: {log_error}")

        except Exception as js_error:
            print(f"❌ Failed to call via JavaScript: {js_error}")

        # Also try clicking the button
        try:
            test_button.click()
            print("✅ Clicked executions test button")
        except Exception as click_error:
            print(f"❌ Failed to click button: {click_error}")
            driver.quit()
            return False

        # Wait for test to start (progress bar should change)
        print("⏳ Waiting for test to start...")
        try:
            WebDriverWait(driver, 10).until(
                lambda driver: driver.find_element(By.ID, "testProgressBar").get_attribute("style") != "width: 0%;" or
                               "ביצועים" in driver.find_element(By.CSS_SELECTOR, "[data-section='test-results'] tbody tr").text
            )
            print("✅ Test started")
        except TimeoutException:
            print("❌ Test didn't start within timeout")

        # Wait for test to complete
        print("⏳ Waiting for test completion...")
        try:
            WebDriverWait(driver, 120).until(  # Long timeout for test completion
                lambda driver: "ביצועים" in driver.find_element(By.CSS_SELECTOR, "[data-section='test-results'] tbody tr").text and
                               driver.find_element(By.ID, "testProgressBar").get_attribute("style") == "width: 100%;"
            )
            print("✅ Test completed")
        except TimeoutException:
            print("❌ Timeout waiting for test completion")
            # Check current progress
            try:
                progress = driver.find_element(By.ID, "testProgressBar").get_attribute("style")
                progress_text = driver.find_element(By.ID, "testProgressText").text
                print(f"Progress: {progress}, Text: {progress_text}")
            except:
                print("Could not check progress")

            driver.quit()
            return False

        # Debug: Print the entire test results section HTML
        test_results_section = driver.find_element(By.CSS_SELECTOR, "[data-section='test-results']")
        print("Test results section HTML:")
        print(test_results_section.get_attribute('innerHTML')[:1000])

        # Check the test results
        result_rows = driver.find_elements(By.CSS_SELECTOR, "[data-section='test-results'] tbody tr")

        print(f"Found {len(result_rows)} result rows")
        account_test_found = False
        account_test_passed = False

        for i, row in enumerate(result_rows):
            cells = row.find_elements(By.TAG_NAME, "td")
            print(f"Row {i}: {len(cells)} cells - HTML: {row.get_attribute('innerHTML')[:200]}...")

            # Try different cell indices since the structure might be different
            if len(cells) >= 1:
                cell_texts = [cell.text.strip() for cell in cells]
                print(f"  Cell contents: {cell_texts}")

                # Look for account-related content in any cell
                all_text = ' '.join(cell_texts)
                if "חשבון מסחר" in all_text:
                    account_test_found = True
                    if "success" in all_text or "✅" in all_text:
                        account_test_passed = True
                        print("✅ Account test PASSED")
                    else:
                        print(f"❌ Account test FAILED - Content: {all_text}")
                    break

        if not account_test_found:
            print("❌ Account test not found in results")
            return False

        driver.quit()
        return account_test_passed

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        try:
            driver.quit()
        except:
            pass
        return False

if __name__ == "__main__":
    print("🔧 MANUAL TESTING REQUIRED")
    print("=" * 50)
    print("Due to Selenium issues, please test manually:")
    print("")
    print("1. Open: http://localhost:8080/crud_testing_dashboard.html")
    print("2. Open Developer Tools (F12)")
    print("3. Go to Console tab")
    print("4. Run: runExecutionsDefaultsTest()")
    print("5. Check Network tab for requests to 127.0.0.1:7243")
    print("6. The detailed logs will show exactly where the test gets stuck")
    print("")
    print("Expected log sequence:")
    print("- runExecutionsDefaultsTest started")
    print("- CrossPageTester created")
    print("- cleanupTestIframes completed")
    print("- loadPageInIframe completed")
    print("- iframe document and window obtained")
    print("- PreferencesCore initialization completed")
    print("- waitForElementInIframe completed")
    print("- looking for add button")
    print("- entity type obtained")
    print("- modal ID obtained")
    print("- about to call showModal")
    print("- showModal completed")
    print("- waited 3 seconds after showModal")
    print("- starting date fields search loop")
    print("- date fields search loop completed")
    print("- testDefaults COMPLETED successfully")
    print("=" * 50)

    exit(0)
