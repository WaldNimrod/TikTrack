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
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    try:
        driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)
        driver.get(f"{BASE_URL}/crud_testing_dashboard")

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
            print("✅ Found executions test button")
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
            else:
                print("No executions-related buttons found")
            driver.quit()
            return False

        test_button.click()
        print("✅ Clicked executions test button")

        # Wait for test to complete (look for results in the table)
        print("⏳ Waiting for test results...")
        try:
            WebDriverWait(driver, 30).until(
                lambda driver: len(driver.find_elements(By.CSS_SELECTOR, "[data-section='test-results'] tbody tr")) > 0
            )
            print("✅ Test results found")
        except TimeoutException:
            print("❌ Timeout waiting for test results")
            # Debug: check what we have
            test_results_section = driver.find_element(By.CSS_SELECTOR, "[data-section='test-results']")
            print(f"Test results section display: {test_results_section.get_attribute('style')}")

            # Check if there are any table rows
            all_rows = driver.find_elements(By.CSS_SELECTOR, "tbody tr")
            print(f"Total table rows found: {len(all_rows)}")

            driver.quit()
            return False

        # Check the test results
        result_rows = driver.find_elements(By.CSS_SELECTOR, "[data-section='test-results'] tbody tr")

        account_test_found = False
        account_test_passed = False

        for row in result_rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 4:
                test_name = cells[0].text.strip()
                status = cells[1].text.strip()

                if "חשבון מסחר" in test_name:
                    account_test_found = True
                    if status == "success":
                        account_test_passed = True
                        print("✅ Account test PASSED")
                    else:
                        print(f"❌ Account test FAILED - Status: {status}")
                        # Print the details
                        if len(cells) >= 4:
                            details = cells[3].text.strip()
                            print(f"   Details: {details}")
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
    success = test_executions_defaults()
    if success:
        print("🎉 Executions defaults test PASSED - Account field gets correct default value")
        exit(0)
    else:
        print("💥 Executions defaults test FAILED - Account field does not get correct default value")
        exit(1)
