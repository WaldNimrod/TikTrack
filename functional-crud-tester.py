#!/usr/bin/env python3
"""
בדיקות CRUD פונקציונליות ללא תלות בשרתר
בודק את המבנה הפונקציונלי של העמודים
"""

import os
import re
from datetime import datetime
from pathlib import Path

class FunctionalCRUDTester:
    def __init__(self):
        self.trading_ui_path = Path("/workspace/trading-ui")
        self.results = {}
        
        # מיפוי פונקציות CRUD צפויות לכל עמוד
        self.expected_functions = {
            'trades.html': {
                'create': ['showAddTradeModal', 'saveNewTrade', 'addTrade'],
                'read': ['loadTradesData', 'updateTradesTable', 'refreshTrades'],
                'update': ['editTradeRecord', 'saveEditTrade', 'updateTrade'],
                'delete': ['deleteTradeRecord', 'confirmDeleteTrade'],
                'extra': ['cancelTradeRecord', 'reactivateTrade', 'viewLinkedItems']
            },
            'accounts.html': {
                'create': ['showAddAccountModal', 'saveAccount', 'addAccount'],
                'read': ['loadAccountsData', 'updateAccountsTable'],
                'update': ['editAccount', 'updateAccount'],
                'delete': ['deleteAccount', 'confirmDeleteAccount'],
                'extra': ['viewAccountDetails']
            },
            'alerts.html': {
                'create': ['showAddAlertModal', 'saveAlert', 'addAlert'],
                'read': ['loadAlertsData', 'updateAlertsTable'],
                'update': ['editAlert', 'updateAlert'],
                'delete': ['deleteAlert', 'confirmDeleteAlert'],
                'extra': ['checkAlertCondition', 'toggleAlert']
            },
            'tickers.html': {
                'create': ['showAddTickerModal', 'saveTicker', 'addTicker'],
                'read': ['loadTickersData', 'refreshYahooFinanceData'],
                'update': ['editTicker', 'updateTicker'],
                'delete': ['deleteTicker', 'confirmDeleteTicker'],
                'extra': ['viewTickerDetails', 'refreshTickerData']
            },
            'executions.html': {
                'create': ['openExecutionDetails', 'saveExecution', 'addExecution'],
                'read': ['loadExecutionsData', 'updateExecutionsTable'],
                'update': ['editExecution', 'updateExecution'],
                'delete': ['deleteExecution', 'confirmDeleteExecution'],
                'extra': ['linkExistingExecution', 'goToLinkedTrade']
            },
            'cash_flows.html': {
                'create': ['showAddCashFlowModal', 'saveCashFlow'],
                'read': ['loadCashFlowsData', 'updateCashFlowsTable'],
                'update': ['editCashFlow', 'updateCashFlow'],
                'delete': ['deleteCashFlow', 'confirmDeleteCashFlow'],
                'extra': ['calculateBalance']
            },
            'trade_plans.html': {
                'create': ['showAddTradePlanModal', 'saveNewTradePlan'],
                'read': ['loadTradePlansData'],
                'update': ['editTradePlan', 'saveEditTradePlan'],
                'delete': ['deleteTradePlan', 'confirmDeleteTradePlan'],
                'extra': ['executeTradePlan', 'copyTradePlan']
            },
            'notes.html': {
                'create': ['openNoteDetails', 'saveNote', 'addNote'],
                'read': ['loadNotesData'],
                'update': ['editNote', 'updateNote'],
                'delete': ['deleteNote', 'confirmDeleteNote'],
                'extra': ['uploadFile', 'downloadFile', 'viewLinkedItems']
            }
        }

    def check_functions_exist(self, filename):
        """בדיקת קיום פונקציות CRUD בקובץ"""
        file_path = self.trading_ui_path / filename
        
        if not file_path.exists():
            return {'error': 'קובץ לא קיים'}
        
        print(f"🔧 בודק פונקציות CRUD: {filename}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            expected = self.expected_functions.get(filename, {})
            found_functions = {
                'create': [],
                'read': [],
                'update': [],
                'delete': [],
                'extra': []
            }
            
            # חיפוש כל הפונקציות הצפויות
            for crud_type, functions_list in expected.items():
                for func_name in functions_list:
                    # חיפוש הפונקציה בקובץ (onclick, function declaration, או קריאה)
                    patterns = [
                        f'onclick="[^"]*{func_name}[^"]*"',
                        f'onclick=\'[^\']*{func_name}[^\']*\'',
                        f'function\\s+{func_name}\\s*\\(',
                        f'{func_name}\\s*\\(',
                        f'window\\.{func_name}\\s*='
                    ]
                    
                    found = False
                    for pattern in patterns:
                        if re.search(pattern, content, re.IGNORECASE):
                            found_functions[crud_type].append(func_name)
                            found = True
                            break
                    
                    if not found:
                        # חיפוש גם בסקריפטי JavaScript נפרדים
                        js_pattern = f'{func_name.split("Modal")[0].lower()}.js'
                        js_file = self.trading_ui_path / 'scripts' / js_pattern
                        if js_file.exists():
                            try:
                                with open(js_file, 'r', encoding='utf-8') as js_f:
                                    js_content = js_f.read()
                                if func_name in js_content:
                                    found_functions[crud_type].append(f"{func_name} (JS)")
                            except:
                                pass
            
            # חישוב ציון פונקציונליות
            total_expected = sum(len(funcs) for funcs in expected.values())
            total_found = sum(len(funcs) for funcs in found_functions.values())
            
            if total_expected > 0:
                functionality_score = (total_found / total_expected) * 100
            else:
                functionality_score = 100
            
            # בדיקות נוספות
            has_modals = bool(re.search(r'<div[^>]*class=[^>]*modal', content))
            has_tables = bool(re.search(r'<table[^>]*>', content))
            has_forms = bool(re.search(r'<form[^>]*>', content))
            
            # ציון כללי
            crud_weight = 0.6
            structure_weight = 0.4
            
            structure_score = (
                (has_modals * 40) +   # מודלים = 40%
                (has_tables * 40) +   # טבלאות = 40%
                (has_forms * 20)      # טפסים = 20%
            )
            
            final_score = (functionality_score * crud_weight) + (structure_score * structure_weight)
            final_score = min(final_score, 100)
            
            print(f"   🔧 פונקציות CRUD: {total_found}/{total_expected}")
            print(f"   📝 מודלים: {'✅' if has_modals else '❌'}")
            print(f"   📋 טבלאות: {'✅' if has_tables else '❌'}")
            print(f"   📄 טפסים: {'✅' if has_forms else '❌'}")
            print(f"   🎯 ציון פונקציונלי: {final_score:.1f}%")
            
            # רמת דירוג
            if final_score >= 90:
                grade = 'מצוין - מוכן לשימוש'
            elif final_score >= 80:
                grade = 'טוב מאוד - בעיות קלות'
            elif final_score >= 70:
                grade = 'טוב - דרוש שיפור קל'
            elif final_score >= 60:
                grade = 'בעייתי - דרוש תיקון'
            else:
                grade = 'שבור - דרוש תיקון מיידי'
            
            print(f"   🏆 דירוג: {grade}")
            
            # פירוט פונקציות שנמצאו
            if total_found > 0:
                print(f"   ✅ פונקציות נמצאו:")
                for crud_type, funcs in found_functions.items():
                    if funcs:
                        print(f"      {crud_type}: {', '.join(funcs[:3])}" + (f" +{len(funcs)-3}" if len(funcs) > 3 else ""))
            
            # פונקציות חסרות
            missing_functions = []
            for crud_type, expected_funcs in expected.items():
                found_funcs = found_functions[crud_type]
                missing = [f for f in expected_funcs if f not in [ff.split(' (')[0] for ff in found_funcs]]
                missing_functions.extend([(crud_type, f) for f in missing])
            
            if missing_functions and len(missing_functions) <= 5:
                print(f"   ❌ פונקציות חסרות:")
                for crud_type, func in missing_functions[:3]:
                    print(f"      {crud_type}: {func}")
                if len(missing_functions) > 3:
                    print(f"      ועוד {len(missing_functions)-3} פונקציות...")
            
            return {
                'functionality_score': functionality_score,
                'structure_score': structure_score,
                'final_score': final_score,
                'grade': grade,
                'found_functions': found_functions,
                'missing_functions': missing_functions,
                'has_modals': has_modals,
                'has_tables': has_tables,
                'has_forms': has_forms,
                'total_found': total_found,
                'total_expected': total_expected
            }
            
        except Exception as e:
            print(f"   ❌ שגיאה בבדיקת פונקציות: {e}")
            return {'error': str(e)}

    def run_functional_test(self):
        """הרצת בדיקה פונקציונלית מלאה"""
        print("🎯 בודק פונקציונליות CRUD - כל העמודים")
        print("=" * 45)
        
        critical_pages = [
            'trades.html',
            'accounts.html', 
            'alerts.html',
            'tickers.html',
            'executions.html',
            'cash_flows.html',
            'trade_plans.html',
            'notes.html'
        ]
        
        for filename in critical_pages:
            result = self.check_functions_exist(filename)
            page_name = filename.replace('.html', '').replace('_', ' ').title()
            
            self.results[filename] = {
                'name': page_name,
                'result': result,
                'tested_at': datetime.now().isoformat()
            }
        
        self.generate_functional_summary()

    def generate_functional_summary(self):
        """יצירת סיכום פונקציונלי"""
        print("\n" + "=" * 50)
        print("📊 סיכום בדיקות פונקציונליות CRUD")
        print("=" * 50)
        
        if not self.results:
            print("❌ לא נמצאו תוצאות")
            return
        
        # ספירת תוצאות
        excellent = sum(1 for r in self.results.values() 
                       if r['result'].get('final_score', 0) >= 90)
        very_good = sum(1 for r in self.results.values() 
                       if 80 <= r['result'].get('final_score', 0) < 90)
        good = sum(1 for r in self.results.values() 
                  if 70 <= r['result'].get('final_score', 0) < 80)
        poor = sum(1 for r in self.results.values() 
                  if r['result'].get('final_score', 0) < 70)
        
        avg_score = sum(r['result'].get('final_score', 0) for r in self.results.values()) / len(self.results)
        
        print(f"📈 תוצאות כלליות:")
        print(f"   📄 עמודים נבדקו: {len(self.results)}")
        print(f"   🏆 מצוינים: {excellent}")
        print(f"   🌟 טוב מאוד: {very_good}")
        print(f"   ✅ טובים: {good}")
        print(f"   ⚠️ בעייתיים: {poor}")
        print(f"   📊 ממוצע פונקציונלי: {avg_score:.1f}%")
        
        # תוצאות מפורטות
        print(f"\n📋 דירוג פונקציונלי:")
        
        sorted_results = sorted(
            self.results.items(),
            key=lambda x: x[1]['result'].get('final_score', 0),
            reverse=True
        )
        
        for filename, data in sorted_results:
            page_name = data['name']
            result = data['result']
            
            if 'error' in result:
                print(f"   ❌ {page_name}: שגיאה ({result['error']})")
                continue
            
            score = result.get('final_score', 0)
            grade = result.get('grade', 'לא ידוע')
            total_found = result.get('total_found', 0)
            total_expected = result.get('total_expected', 0)
            
            grade_icon = '🏆' if score >= 90 else '🌟' if score >= 80 else '✅' if score >= 70 else '⚠️'
            
            print(f"   {grade_icon} {page_name}: {score:.1f}% - {grade}")
            print(f"      📊 פונקציות CRUD: {total_found}/{total_expected}")
            
            # מבנה
            structure_indicators = []
            if result.get('has_modals'): structure_indicators.append('מודלים')
            if result.get('has_tables'): structure_indicators.append('טבלאות')
            if result.get('has_forms'): structure_indicators.append('טפסים')
            
            if structure_indicators:
                print(f"      🏗️ מבנה: {', '.join(structure_indicators)}")
        
        # המלצות תיקון
        self.generate_functional_recommendations()

    def generate_functional_recommendations(self):
        """המלצות תיקון פונקציונליות"""
        print(f"\n🛠️ המלצות תיקון פונקציונליות:")
        
        poor_pages = [(f, d) for f, d in self.results.items() 
                     if d['result'].get('final_score', 100) < 80]
        
        if not poor_pages:
            print(f"   🎉 כל העמודים עובדים בצורה פונקציונלית מצוינת!")
            print(f"   ✅ אין תיקונים נדרשים בפונקציונליות CRUD")
        else:
            for filename, data in poor_pages:
                page_name = data['name']
                result = data['result']
                score = result.get('final_score', 0)
                
                print(f"\n📄 {page_name} ({score:.1f}%):")
                
                missing = result.get('missing_functions', [])
                if missing:
                    print(f"   🔧 פונקציות חסרות לתיקון:")
                    for crud_type, func in missing[:5]:
                        print(f"      - {crud_type}: {func}")
                
                if not result.get('has_modals'):
                    print(f"   🔧 הוסף מודלים לפעולות CRUD")
                if not result.get('has_tables'):
                    print(f"   🔧 הוסף טבלת נתונים")
                if not result.get('has_forms'):
                    print(f"   🔧 הוסף טפסי קלט")

def main():
    """בדיקה פונקציונלית ללא שרתר"""
    print("🎯 בודק פונקציונליות CRUD - TikTrack")
    print("=" * 35)
    
    tester = FunctionalCRUDTester()
    tester.run_functional_test()

if __name__ == "__main__":
    main()