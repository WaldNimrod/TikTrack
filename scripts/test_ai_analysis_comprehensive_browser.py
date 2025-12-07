#!/usr/bin/env python3
"""
Comprehensive Browser Testing for AI Analysis System
בודק את כל 4 סוגי הניתוחים עם אפשרויות פילטר וניתוח שונות
"""

import os
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime

# Add Backend to path for imports
backend_path = Path(__file__).resolve().parent.parent / "Backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.ai_analysis import AIPromptTemplate
from models.user import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIAnalysisBrowserTester:
    """בודק מקיף של מערכת AI Analysis בדפדפן"""
    
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.driver = None
        self.results = {
            "test_date": datetime.now().isoformat(),
            "tests": [],
            "summary": {}
        }
    
    def setup_driver(self):
        """הגדרת WebDriver"""
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.maximize_window()
        logger.info("✅ WebDriver initialized")
    
    def login(self, username="admin", password="admin123"):
        """התחברות למערכת"""
        try:
            self.driver.get(f"{self.base_url}/login")
            time.sleep(2)
            
            # מצא שדות התחברות והתחבר
            username_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            password_field = self.driver.find_element(By.ID, "password")
            
            username_field.send_keys(username)
            password_field.send_keys(password)
            
            # לחץ על כפתור התחברות
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            
            # המתן למעבר לדף הבית
            WebDriverWait(self.driver, 10).until(
                EC.url_changes(f"{self.base_url}/login")
            )
            
            logger.info("✅ Login successful")
            return True
        except Exception as e:
            logger.error(f"❌ Login failed: {e}")
            return False
    
    def navigate_to_ai_analysis(self):
        """נווט לדף AI Analysis"""
        try:
            self.driver.get(f"{self.base_url}/ai-analysis")
            time.sleep(3)
            
            # בדוק שהדף נטען
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "aiAnalysisContainer"))
            )
            
            logger.info("✅ Navigated to AI Analysis page")
            return True
        except Exception as e:
            logger.error(f"❌ Navigation failed: {e}")
            return False
    
    def open_template_selection(self):
        """פתיחת מודול בחירת תבנית"""
        try:
            # מצא כפתור "צור ניתוח" או פתח מודול
            create_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button:contains('צור ניתוח'), .btn-primary"))
            )
            create_button.click()
            time.sleep(2)
            
            # בדוק שמודול התבניות נפתח
            template_modal = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "aiTemplateSelectionModal"))
            )
            
            logger.info("✅ Template selection modal opened")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to open template selection: {e}")
            return False
    
    def select_template(self, template_id):
        """בחר תבנית לפי ID"""
        try:
            # מצא את התבנית ולחץ עליה
            template_card = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f"[data-template-id='{template_id}'], .template-card"))
            )
            template_card.click()
            time.sleep(2)
            
            logger.info(f"✅ Selected template {template_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to select template {template_id}: {e}")
            return False
    
    def fill_variables_form(self, variables_data):
        """מילוי טופס משתנים"""
        try:
            # המתן למודול המשתנים
            variables_modal = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "aiVariablesModal"))
            )
            time.sleep(2)
            
            filled_fields = []
            
            for key, value in variables_data.items():
                try:
                    # מצא שדה לפי ID
                    field_id = f"var_modal_{key}"
                    field = self.driver.find_element(By.ID, field_id)
                    
                    # בדוק אם זה select או input
                    if field.tag_name == "select":
                        from selenium.webdriver.support.ui import Select
                        select = Select(field)
                        select.select_by_value(str(value))
                        filled_fields.append(key)
                    elif field.tag_name == "input":
                        field.clear()
                        field.send_keys(str(value))
                        filled_fields.append(key)
                    
                    time.sleep(0.5)
                except NoSuchElementException:
                    logger.warning(f"⚠️ Field {key} not found (might be conditional/hidden)")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to fill {key}: {e}")
            
            logger.info(f"✅ Filled {len(filled_fields)} fields")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to fill variables form: {e}")
            return False
    
    def submit_analysis(self):
        """שליחת בקשה לניתוח"""
        try:
            # מצא כפתור "צור ניתוח" במודול
            submit_button = WebDriverWait(self.driver, 15).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "#aiVariablesModal button[type='submit'], #generateAnalysisBtnModal"))
            )
            submit_button.click()
            
            # המתן לתהליך להתחיל (מחפש Progress Overlay או loading state)
            time.sleep(3)
            
            logger.info("✅ Analysis submitted")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to submit analysis: {e}")
            return False
    
    def wait_for_analysis_completion(self, timeout=120):
        """המתן להשלמת הניתוח"""
        try:
            # המתן להיעלמות Progress Overlay או הופעת תוצאות
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                # בדוק אם יש שגיאה
                try:
                    error_msg = self.driver.find_element(By.CSS_SELECTOR, ".alert-danger, .error-message")
                    if error_msg.is_displayed():
                        error_text = error_msg.text
                        logger.error(f"❌ Analysis error: {error_text}")
                        return False
                except NoSuchElementException:
                    pass
                
                # בדוק אם יש תוצאות
                try:
                    results_modal = self.driver.find_element(By.ID, "aiResultsModal")
                    if results_modal.is_displayed():
                        logger.info("✅ Analysis completed - results modal shown")
                        return True
                except NoSuchElementException:
                    pass
                
                # בדוק אם יש Progress Overlay
                try:
                    progress_overlay = self.driver.find_element(By.CSS_SELECTOR, ".progress-overlay, #progressOverlay")
                    if progress_overlay.is_displayed():
                        logger.info("⏳ Analysis in progress...")
                except NoSuchElementException:
                    # אין Progress Overlay - יכול להיות שהסתיים או לא התחיל
                    pass
                
                time.sleep(2)
            
            logger.warning("⚠️ Analysis timeout - checking status...")
            return False
            
        except Exception as e:
            logger.error(f"❌ Error waiting for analysis: {e}")
            return False
    
    def verify_analysis_saved(self):
        """וידוא שהניתוח נשמר בהיסטוריה"""
        try:
            # סגור מודול תוצאות אם פתוח
            try:
                close_button = self.driver.find_element(By.CSS_SELECTOR, "#aiResultsModal .btn-close")
                close_button.click()
                time.sleep(1)
            except:
                pass
            
            # בדוק את רשימת ההיסטוריה
            history_items = self.driver.find_elements(By.CSS_SELECTOR, ".history-item, .ai-analysis-history-item")
            
            if len(history_items) > 0:
                logger.info(f"✅ Found {len(history_items)} analysis(es) in history")
                return True
            else:
                logger.warning("⚠️ No history items found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to verify analysis saved: {e}")
            return False
    
    def test_analysis_template(self, template_name, template_id, test_variables, test_name):
        """בדיקת תבנית ניתוח אחת"""
        logger.info(f"\n{'='*60}")
        logger.info(f"🧪 Testing: {test_name}")
        logger.info(f"{'='*60}")
        
        test_result = {
            "test_name": test_name,
            "template_name": template_name,
            "template_id": template_id,
            "status": "failed",
            "errors": [],
            "duration": 0
        }
        
        start_time = time.time()
        
        try:
            # 1. פתיחת בחירת תבנית
            if not self.open_template_selection():
                test_result["errors"].append("Failed to open template selection")
                return test_result
            
            # 2. בחירת תבנית
            if not self.select_template(template_id):
                test_result["errors"].append(f"Failed to select template {template_id}")
                return test_result
            
            # 3. מילוי טופס משתנים
            if not self.fill_variables_form(test_variables):
                test_result["errors"].append("Failed to fill variables form")
                return test_result
            
            # 4. שליחת ניתוח
            if not self.submit_analysis():
                test_result["errors"].append("Failed to submit analysis")
                return test_result
            
            # 5. המתן להשלמה
            if not self.wait_for_analysis_completion():
                test_result["errors"].append("Analysis did not complete within timeout")
                return test_result
            
            # 6. בדיקה שהניתוח נשמר
            if not self.verify_analysis_saved():
                test_result["errors"].append("Analysis not found in history")
            
            test_result["status"] = "passed"
            logger.info(f"✅ Test '{test_name}' PASSED")
            
        except Exception as e:
            test_result["errors"].append(str(e))
            logger.error(f"❌ Test '{test_name}' FAILED: {e}")
        
        test_result["duration"] = time.time() - start_time
        self.results["tests"].append(test_result)
        return test_result
    
    def run_all_tests(self):
        """הרצת כל הבדיקות"""
        logger.info("\n" + "="*60)
        logger.info("🚀 Starting Comprehensive AI Analysis Tests")
        logger.info("="*60)
        
        # הגדרת WebDriver
        self.setup_driver()
        
        try:
            # התחברות
            if not self.login():
                logger.error("❌ Login failed - cannot continue tests")
                return self.results
            
            # נווט לדף AI Analysis
            if not self.navigate_to_ai_analysis():
                logger.error("❌ Navigation failed - cannot continue tests")
                return self.results
            
            # בדיקות לכל תבנית
            
            # 1. Portfolio Performance - כל הטריידים
            self.test_analysis_template(
                template_name="Portfolio Performance",
                template_id=3,
                test_variables={
                    "ticker_symbol": "",
                    "date_range": "",
                    "analysis_focus": "Performance Review",
                    "investment_type_filter": "",
                    "trade_selection_type": "all",
                    "response_language": "hebrew"
                },
                test_name="Portfolio Performance - All Trades"
            )
            
            time.sleep(3)  # הפסקה בין בדיקות
            
            # 2. Portfolio Performance - עם פילטרים
            self.test_analysis_template(
                template_name="Portfolio Performance",
                template_id=3,
                test_variables={
                    "ticker_symbol": "",
                    "date_range": "2024-01-01 - 2024-12-31",
                    "analysis_focus": "Risk Assessment",
                    "investment_type_filter": "Swing Trading",
                    "trade_selection_type": "filtered",
                    "response_language": "hebrew"
                },
                test_name="Portfolio Performance - Filtered"
            )
            
            time.sleep(3)
            
            # 3. Technical Analysis
            self.test_analysis_template(
                template_name="Technical Analysis",
                template_id=2,
                test_variables={
                    "stock_ticker": "",
                    "time_frame": "1 month",
                    "technical_indicators": "",
                    "chart_pattern_focus": "Support/Resistance",
                    "investment_type": "Swing Trading",
                    "response_language": "hebrew"
                },
                test_name="Technical Analysis - Basic"
            )
            
            time.sleep(3)
            
            # 4. Risk & Conditions
            self.test_analysis_template(
                template_name="Risk & Conditions",
                template_id=4,
                test_variables={
                    "ticker_symbol": "",
                    "trade_plan_id": "",
                    "trade_id": "",
                    "condition_focus": "",
                    "investment_type": "Swing Trading",
                    "response_language": "hebrew"
                },
                test_name="Risk & Conditions - Basic"
            )
            
            # סיכום
            self.generate_summary()
            
        finally:
            self.driver.quit()
            logger.info("\n✅ Browser closed")
        
        return self.results
    
    def generate_summary(self):
        """יצירת סיכום תוצאות"""
        total_tests = len(self.results["tests"])
        passed_tests = sum(1 for t in self.results["tests"] if t["status"] == "passed")
        failed_tests = total_tests - passed_tests
        total_duration = sum(t["duration"] for t in self.results["tests"])
        
        self.results["summary"] = {
            "total_tests": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
            "total_duration_seconds": round(total_duration, 2)
        }
        
        logger.info("\n" + "="*60)
        logger.info("📊 TEST SUMMARY")
        logger.info("="*60)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"✅ Passed: {passed_tests}")
        logger.info(f"❌ Failed: {failed_tests}")
        logger.info(f"Success Rate: {self.results['summary']['success_rate']}")
        logger.info(f"Total Duration: {total_duration:.2f} seconds")
        logger.info("="*60)
    
    def save_results(self, filename="ai_analysis_test_results.json"):
        """שמירת תוצאות לקובץ"""
        output_path = Path(__file__).parent / filename
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        logger.info(f"📄 Results saved to: {output_path}")


def main():
    """הרצת הבדיקות"""
    tester = AIAnalysisBrowserTester()
    results = tester.run_all_tests()
    tester.save_results()
    
    # הדפסת סיכום
    print("\n" + "="*60)
    print("✅ Testing completed!")
    print(f"Results: {results['summary']}")
    print("="*60)


if __name__ == "__main__":
    main()

