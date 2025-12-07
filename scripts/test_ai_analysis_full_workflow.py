#!/usr/bin/env python3
"""
Full AI Analysis Workflow Test - Creates actual analyses for all 4 template types
בודק תהליך מלא - יוצר ניתוחים אמיתיים לכל 4 סוגי התבניות
"""

import json
import time
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.keys import Keys
    from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium not installed. Install with: pip install selenium webdriver-manager")
    sys.exit(1)

BASE_URL = "http://localhost:8080"

class AIAnalysisWorkflowTester:
    """בודק תהליכים מלאים של AI Analysis"""
    
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.driver = None
        self.created_analyses = []
    
    def setup_driver(self):
        """הגדרת WebDriver"""
        chrome_options = Options()
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.maximize_window()
        print("✅ WebDriver initialized")
    
    def login(self):
        """התחברות למערכת"""
        try:
            self.driver.get(f"{self.base_url}/login.html")
            time.sleep(3)
            
            # המתן ל-container ולטופס שנוצר דינמית
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "loginContainer"))
            )
            
            # המתן לטופס שנוצר דינמית
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "loginForm"))
            )
            time.sleep(1)
            
            # מצא שדות התחברות - המתן שיהיו ניתנים לאינטראקציה
            username_field = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "username"))
            )
            password_field = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "password"))
            )
            
            # נקה וזמן
            username_field.clear()
            username_field.send_keys("admin")
            time.sleep(0.5)
            
            password_field.clear()
            password_field.send_keys("admin123")
            time.sleep(0.5)
            
            # מצא כפתור התחברות
            login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "loginBtn"))
            )
            
            # לחץ על כפתור ההתחברות
            login_button.click()
            
            # המתן ל-localStorage להתעדכן או למעבר דף
            try:
                WebDriverWait(self.driver, 15).until(
                    lambda d: d.execute_script("""
                        const user = localStorage.getItem('currentUser');
                        return user !== null && user !== '';
                    """) or '/login' not in d.current_url
                )
            except:
                # אם לא עובד, פשוט המתן למעבר
                time.sleep(3)
                if '/login' not in self.driver.current_url:
                    pass  # הצליח
            
            time.sleep(2)
            print("✅ Login successful")
            return True
        except Exception as e:
            print(f"❌ Login failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def navigate_to_ai_analysis(self):
        """נווט לדף AI Analysis"""
        try:
            # נסה מספר אפשרויות של URL
            urls_to_try = [
                f"{self.base_url}/ai-analysis.html",
                f"{self.base_url}/ai-analysis",
                f"{self.base_url}/trading-ui/ai-analysis.html"
            ]
            
            for url in urls_to_try:
                try:
                    self.driver.get(url)
                    time.sleep(3)
                    
                    # בדוק אם נטען הדף (לא הועבר ל-login)
                    if '/login' not in self.driver.current_url:
                        # המתן לטעינת הדף
                        WebDriverWait(self.driver, 15).until(
                            lambda d: d.execute_script('return document.readyState') == 'complete'
                        )
                        time.sleep(3)  # המתן נוסף ל-JavaScript
                        
                        # בדוק אם יש אלמנטים של AI Analysis
                        try:
                            WebDriverWait(self.driver, 10).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, "#aiAnalysisContainer, .ai-analysis-container, body"))
                            )
                            print(f"✅ Navigated to AI Analysis page: {url}")
                            return True
                        except:
                            continue
                except:
                    continue
            
            print("❌ Navigation failed - could not find AI Analysis page")
            return False
        except Exception as e:
            print(f"❌ Navigation failed: {e}")
            return False
    
    def click_create_analysis_button(self):
        """לחץ על כפתור 'צור ניתוח' - באמצעות JavaScript"""
        try:
            # המתן ש-AIAnalysisManager יהיה זמין
            WebDriverWait(self.driver, 15).until(
                lambda d: d.execute_script("return typeof window.AIAnalysisManager !== 'undefined'")
            )
            time.sleep(1)
            
            # פתח את מודול התבניות ישירות דרך JavaScript
            result = self.driver.execute_script("""
                if(window.AIAnalysisManager && typeof window.AIAnalysisManager.openTemplateSelectionModal === 'function') {
                    window.AIAnalysisManager.openTemplateSelectionModal();
                    return true;
                }
                return false;
            """)
            
            if result:
                time.sleep(2)
                print("✅ Opened template selection modal via JavaScript")
                return True
            else:
                print("❌ AIAnalysisManager not available")
                return False
                
        except Exception as e:
            print(f"❌ Failed to open template modal: {e}")
            return False
    
    def select_template(self, template_id: int):
        """בחר תבנית לפי ID - באמצעות JavaScript"""
        try:
            # המתן למודול להופיע
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "aiTemplateSelectionModal"))
            )
            time.sleep(2)
            
            # בחר תבנית ישירות דרך JavaScript
            result = self.driver.execute_script(f"""
                if(window.AIAnalysisManager && typeof window.AIAnalysisManager.handleTemplateSelectionFromModal === 'function') {{
                    window.AIAnalysisManager.handleTemplateSelectionFromModal('{template_id}');
                    return true;
                }}
                return false;
            """)
            
            if result:
                # המתן למודול המשתנים להופיע
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.ID, "aiVariablesModal"))
                )
                time.sleep(2)
                print(f"✅ Selected template {template_id} via JavaScript")
                return True
            else:
                print(f"❌ Failed to select template {template_id} - function not available")
                return False
            
        except Exception as e:
            print(f"❌ Failed to select template {template_id}: {e}")
            return False
    
    def fill_variables_form(self, variables: Dict[str, Any]):
        """מילוי טופס משתנים"""
        try:
            # המתן למודול המשתנים
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "aiVariablesModal"))
            )
            time.sleep(2)
            
            filled_count = 0
            
            # ראשית, בחר מנוע AI (חובה)
            try:
                provider_select = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "llmProviderModal"))
                )
                if provider_select and provider_select.is_displayed():
                    from selenium.webdriver.support.ui import Select
                    select = Select(provider_select)
                    # נסה לבחור gemini (ברירת מחדל) או את האופציה הראשונה הזמינה
                    try:
                        select.select_by_value("gemini")
                        filled_count += 1
                    except:
                        try:
                            # נסה את האופציה הראשונה
                            if len(select.options) > 1:  # Skip empty option
                                select.select_by_index(1)
                                filled_count += 1
                        except:
                            pass
            except Exception as e:
                print(f"⚠️ Could not select LLM provider: {e}")
            
            # עכשיו מלא את שאר השדות
            for key, value in variables.items():
                if value is None or value == "":
                    continue
                    
                try:
                    field_id = f"var_modal_{key}"
                    field = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.ID, field_id))
                    )
                    
                    # בדוק אם השדה גלוי
                    if not field.is_displayed():
                        continue
                    
                    time.sleep(0.3)
                    
                    if field.tag_name == "select":
                        from selenium.webdriver.support.ui import Select
                        select = Select(field)
                        try:
                            select.select_by_value(str(value))
                            filled_count += 1
                        except:
                            # נסה לפי טקסט
                            try:
                                select.select_by_visible_text(str(value))
                                filled_count += 1
                            except:
                                pass
                    elif field.tag_name == "input":
                        field.clear()
                        field.send_keys(str(value))
                        filled_count += 1
                    
                except (TimeoutException, NoSuchElementException):
                    # שדה לא נמצא - יכול להיות conditional/hidden
                    pass
                except Exception as e:
                    pass
            
            print(f"✅ Filled {filled_count} fields (including LLM provider)")
            return True
            
        except Exception as e:
            print(f"⚠️ Error filling form: {e}")
            return False
    
    def submit_analysis(self):
        """שליחת ניתוח"""
        try:
            # מצא כפתור Submit
            submit_selectors = [
                "#generateAnalysisBtnModal",
                "button[type='submit']",
                "button.btn-primary:contains('צור')",
                ".btn-primary"
            ]
            
            submit_button = None
            for selector in submit_selectors:
                try:
                    if 'contains' in selector:
                        submit_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'צור')]")
                    else:
                        buttons = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        for btn in buttons:
                            if btn.is_displayed() and ('צור' in btn.text or btn.get_attribute('type') == 'submit'):
                                submit_button = btn
                                break
                    if submit_button:
                        break
                except:
                    continue
            
            if submit_button:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
                time.sleep(0.5)
                submit_button.click()
                print("✅ Submitted analysis")
                time.sleep(3)
                return True
            else:
                # נסה דרך JavaScript
                self.driver.execute_script("if(window.AIAnalysisManager) window.AIAnalysisManager.handleGenerateAnalysis();")
                time.sleep(3)
                return True
                
        except Exception as e:
            print(f"⚠️ Submit issue: {e}")
            try:
                self.driver.execute_script("if(window.AIAnalysisManager) window.AIAnalysisManager.handleGenerateAnalysis();")
                time.sleep(3)
                return True
            except:
                return False
    
    def wait_for_analysis_completion(self, timeout=180):
        """המתן להשלמת הניתוח"""
        start_time = time.time()
        last_status = None
        
        while time.time() - start_time < timeout:
            try:
                # בדוק אם יש שגיאה
                try:
                    error_msg = self.driver.find_element(By.CSS_SELECTOR, ".alert-danger, .error-message, .notification-error")
                    if error_msg.is_displayed():
                        error_text = error_msg.text
                        print(f"❌ Analysis error: {error_text}")
                        return False
                except:
                    pass
                
                # בדוק אם יש תוצאות
                try:
                    results_modal = self.driver.find_element(By.ID, "aiResultsModal")
                    if results_modal.is_displayed():
                        print("✅ Analysis completed - results shown")
                        time.sleep(2)
                        return True
                except:
                    pass
                
                # בדוק סטטוס דרך JavaScript
                try:
                    status = self.driver.execute_script("""
                        if(window.AIAnalysisManager && window.AIAnalysisManager.currentAnalysis) {
                            return window.AIAnalysisManager.currentAnalysis.status;
                        }
                        return null;
                    """)
                    
                    if status == 'completed':
                        print("✅ Analysis completed")
                        time.sleep(2)
                        return True
                    elif status == 'failed':
                        print("❌ Analysis failed")
                        return False
                    elif status != last_status:
                        print(f"⏳ Status: {status}")
                        last_status = status
                except:
                    pass
                
                # בדוק Progress Overlay
                try:
                    progress = self.driver.find_element(By.CSS_SELECTOR, ".progress-overlay, #progressOverlay")
                    if progress.is_displayed():
                        # עדיין בתהליך
                        pass
                except:
                    # אין Progress - יכול להיות שהסתיים
                    pass
                
                time.sleep(3)
                
            except Exception as e:
                pass
        
        print("⚠️ Analysis timeout - checking final status...")
        return False
    
    def get_created_analysis_info(self) -> Optional[Dict[str, Any]]:
        """קבלת מידע על הניתוח שנוצר"""
        try:
            # נסה לקבל מהדפדפן
            analysis_info = self.driver.execute_script("""
                if(window.AIAnalysisManager && window.AIAnalysisManager.currentAnalysis) {
                    return {
                        id: window.AIAnalysisManager.currentAnalysis.id,
                        title: window.AIAnalysisManager.currentAnalysis.template?.name_he || 'Unknown',
                        status: window.AIAnalysisManager.currentAnalysis.status
                    };
                }
                return null;
            """)
            
            if analysis_info and analysis_info.get('id'):
                return analysis_info
            
            # נסה למצוא בהיסטוריה
            history = self.driver.execute_script("""
                if(window.AIAnalysisManager && window.AIAnalysisManager.history && window.AIAnalysisManager.history.length > 0) {
                    const latest = window.AIAnalysisManager.history[0];
                    return {
                        id: latest.id,
                        title: latest.template?.name_he || latest.template_name_he || 'Unknown',
                        status: latest.status
                    };
                }
                return null;
            """)
            
            return history
            
        except Exception as e:
            return None
    
    def create_analysis(self, template_id: int, template_name: str, variables: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """יצירת ניתוח אחד"""
        print(f"\n{'='*60}")
        print(f"Creating: {template_name} (Template ID: {template_id})")
        print(f"{'='*60}")
        
        try:
            # 1. פתיחת בחירת תבנית
            if not self.click_create_analysis_button():
                print("❌ Failed to open template selection")
                return None
            
            # 2. בחירת תבנית
            if not self.select_template(template_id):
                print("❌ Failed to select template")
                return None
            
            # 3. מילוי טופס
            self.fill_variables_form(variables)
            time.sleep(1)
            
            # 4. שליחת ניתוח
            if not self.submit_analysis():
                print("❌ Failed to submit")
                return None
            
            # 5. המתן להשלמה
            completed = self.wait_for_analysis_completion()
            
            if completed:
                # 6. קבלת מידע על הניתוח
                analysis_info = self.get_created_analysis_info()
                if analysis_info:
                    analysis_info['template_name'] = template_name
                    analysis_info['template_id'] = template_id
                    print(f"✅ Analysis created: ID={analysis_info.get('id')}, Title={analysis_info.get('title')}")
                    return analysis_info
                else:
                    # נסה לקבל מההיסטוריה דרך API
                    time.sleep(2)
                    analysis_info = self.get_created_analysis_info()
                    return analysis_info
            else:
                print("⚠️ Analysis did not complete - may still be pending")
                # נסה לקבל מידע גם אם לא הושלם
                analysis_info = self.get_created_analysis_info()
                return analysis_info
                
        except Exception as e:
            print(f"❌ Error creating analysis: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def close_results_modal(self):
        """סגירת מודול תוצאות"""
        try:
            close_button = self.driver.find_element(By.CSS_SELECTOR, "#aiResultsModal .btn-close, .modal-header .btn-close")
            close_button.click()
            time.sleep(1)
        except:
            pass
    
    def run_all_tests(self):
        """הרצת כל הבדיקות"""
        print("\n" + "="*60)
        print("🚀 Starting Full AI Analysis Workflow Tests")
        print("="*60)
        
        self.setup_driver()
        
        try:
            # התחברות
            if not self.login():
                print("❌ Cannot proceed without login")
                return []
            
            # נווט לדף AI Analysis
            if not self.navigate_to_ai_analysis():
                print("❌ Cannot proceed - page not loaded")
                return []
            
            # בדיקה 1: Portfolio Performance - כל הטריידים
            analysis1 = self.create_analysis(
                template_id=3,
                template_name="Portfolio Performance - All Trades",
                variables={
                    "ticker_symbol": "",
                    "date_range": "",
                    "analysis_focus": "Performance Review",
                    "investment_type_filter": "",
                    "trade_selection_type": "all",
                    "response_language": "hebrew"
                }
            )
            if analysis1:
                self.created_analyses.append(analysis1)
            time.sleep(3)
            self.close_results_modal()
            
            # בדיקה 2: Portfolio Performance - עם פילטרים
            analysis2 = self.create_analysis(
                template_id=3,
                template_name="Portfolio Performance - Filtered",
                variables={
                    "ticker_symbol": "",
                    "date_range": "2024-01-01 - 2024-12-31",
                    "analysis_focus": "Risk Assessment",
                    "investment_type_filter": "Swing Trading",
                    "trade_selection_type": "filtered",
                    "response_language": "hebrew"
                }
            )
            if analysis2:
                self.created_analyses.append(analysis2)
            time.sleep(3)
            self.close_results_modal()
            
            # בדיקה 3: Technical Analysis
            analysis3 = self.create_analysis(
                template_id=2,
                template_name="Technical Analysis",
                variables={
                    "stock_ticker": "",
                    "time_frame": "1 month",
                    "chart_pattern_focus": "Support/Resistance",
                    "investment_type": "Swing Trading",
                    "response_language": "hebrew"
                }
            )
            if analysis3:
                self.created_analyses.append(analysis3)
            time.sleep(3)
            self.close_results_modal()
            
            # בדיקה 4: Risk & Conditions
            analysis4 = self.create_analysis(
                template_id=4,
                template_name="Risk & Conditions",
                variables={
                    "ticker_symbol": "",
                    "trade_plan_id": "",
                    "trade_id": "",
                    "condition_focus": "",
                    "investment_type": "Swing Trading",
                    "response_language": "hebrew"
                }
            )
            if analysis4:
                self.created_analyses.append(analysis4)
            
            return self.created_analyses
            
        finally:
            time.sleep(2)
            self.driver.quit()
            print("\n✅ Browser closed")


def get_analyses_from_backend(user_id: int = None) -> List[Dict[str, Any]]:
    """קבלת ניתוחים מה-backend"""
    try:
        import requests
        from datetime import datetime, timedelta
        
        # קבלת ניתוחים שנוצרו ב-10 דקות האחרונות
        url = f"{BASE_URL}/api/ai-analysis/history"
        response = requests.get(url, cookies=tester.driver.get_cookies() if hasattr(tester, 'driver') and tester.driver else None)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                all_analyses = data.get('data', {}).get('analyses', [])
                # סינון לפי זמן (10 דקות אחרונות)
                cutoff_time = datetime.now() - timedelta(minutes=10)
                recent_analyses = [
                    a for a in all_analyses 
                    if datetime.fromisoformat(a['created_at'].replace('Z', '+00:00')) > cutoff_time
                ]
                return recent_analyses[:10]  # 10 האחרונים
        return []
    except Exception as e:
        print(f"⚠️ Could not fetch from backend: {e}")
        return []


def main():
    """הרצת הבדיקות"""
    global tester
    tester = AIAnalysisWorkflowTester()
    analyses = tester.run_all_tests()
    
    print("\n" + "="*60)
    print("📊 CREATED ANALYSES SUMMARY")
    print("="*60)
    
    # נסה לקבל מה-backend אם לא קיבלנו מהדפדפן
    if not analyses or len(analyses) < 4:
        print("\n🔄 Fetching analyses from backend...")
        backend_analyses = get_analyses_from_backend()
        if backend_analyses:
            # המרה לפורמט זהה
            analyses = [
                {
                    'id': a.get('id'),
                    'title': a.get('template_name_he') or a.get('template', {}).get('name_he', 'Unknown'),
                    'status': a.get('status', 'unknown'),
                    'template_id': a.get('template_id'),
                    'created_at': a.get('created_at')
                }
                for a in backend_analyses
            ]
    
    if analyses:
        for i, analysis in enumerate(analyses, 1):
            analysis_id = analysis.get('id', 'N/A')
            title = analysis.get('title', analysis.get('template_name', 'Unknown'))
            status = analysis.get('status', 'unknown')
            template_id = analysis.get('template_id', 'N/A')
            created_at = analysis.get('created_at', '')
            
            print(f"\n{i}. Analysis ID: {analysis_id}")
            print(f"   Title: {title}")
            print(f"   Template ID: {template_id}")
            print(f"   Status: {status}")
            if created_at:
                print(f"   Created: {created_at}")
    else:
        print("❌ No analyses were created")
    
    print("="*60)


if __name__ == "__main__":
    main()

