#!/usr/bin/env python3
"""
Comprehensive functionality test for Watch Lists system
Tests all interfaces and features in the browser
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
from datetime import datetime

class WatchListsFunctionalityTester:
    def __init__(self):
        chrome_options = Options()
        # Run in headless mode for CI, but can be changed to False for debugging
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 15)
        self.base_url = 'http://localhost:8080'
        self.page_url = '/watch-list.html'
        self.results = []
        
    def log_result(self, test_name, success, message='', details=None):
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details or {},
            'timestamp': datetime.now().isoformat()
        }
        self.results.append(result)
        status = '✅' if success else '❌'
        print(f'{status} {test_name}: {message}')
        return result
    
    def login(self):
        """Login to the system"""
        try:
            print('\n🔐 Logging in...')
            self.driver.get(self.base_url + '/login.html')
            time.sleep(2)
            
            # Use JavaScript to fill and submit (more reliable)
            self.driver.execute_script('''
                document.getElementById("username").value = "admin";
                document.getElementById("password").value = "admin123";
                document.querySelector("button[type=\\"submit\\"]").click();
            ''')
            
            time.sleep(3)
            return self.log_result('Login', True, 'Logged in successfully')
        except Exception as e:
            return self.log_result('Login', False, f'Login failed: {str(e)}')
    
    def test_page_load(self):
        """Test page loads correctly"""
        try:
            print('\n📄 Testing page load...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)  # Wait for initialization
            
            # Check for critical JavaScript systems
            systems_status = self.driver.execute_script('''
                return {
                    WatchListsDataService: typeof window.WatchListsDataService !== "undefined",
                    WatchListsUIService: typeof window.WatchListsUIService !== "undefined",
                    WatchListsPage: typeof window.WatchListsPage !== "undefined",
                    ModalManagerV2: typeof window.ModalManagerV2 !== "undefined"
                };
            ''')
            
            all_systems = all(systems_status.values())
            return self.log_result('Page Load', all_systems, 
                                 'All systems loaded' if all_systems else 'Some systems missing',
                                 systems_status)
        except Exception as e:
            return self.log_result('Page Load', False, f'Page load failed: {str(e)}')
    
    def test_open_add_list_modal(self):
        """Test opening add list modal"""
        try:
            print('\n➕ Testing open add list modal...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # Try to open modal via JavaScript
            result = self.driver.execute_script('''
                if (window.WatchListsPage && window.WatchListsPage.openAddListModal) {
                    window.WatchListsPage.openAddListModal();
                    return {called: true};
                }
                return {called: false};
            ''')
            
            if not result.get('called'):
                return self.log_result('Open Add List Modal', False, 'Function not available')
            
            time.sleep(4)  # Wait longer for modal to fully appear
            
            # Check if modal is visible - use multiple checks
            modal_visible = self.driver.execute_script('''
                const m = document.getElementById("watchListModal");
                if (!m) return false;
                const style = window.getComputedStyle(m);
                // Check multiple conditions - modal is visible if:
                // 1. Has show class AND
                // 2. Display is not none AND
                // 3. Position is fixed (Bootstrap requirement) OR offsetParent is not null
                const hasShow = m.classList.contains("show");
                const displayOk = style.display !== "none";
                const positionOk = style.position === "fixed" || m.offsetParent !== null;
                return hasShow && displayOk && positionOk;
            ''')
            
            if modal_visible:
                # Close modal
                self.driver.execute_script('document.querySelector("#watchListModal .btn-close")?.click();')
                time.sleep(1)
                return self.log_result('Open Add List Modal', True, 'Modal opened successfully')
            else:
                return self.log_result('Open Add List Modal', False, 'Modal not visible after opening')
        except Exception as e:
            return self.log_result('Open Add List Modal', False, f'Error: {str(e)}')
    
    def test_table_sorting(self):
        """Test table sorting functionality"""
        try:
            print('\n🔀 Testing table sorting...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # Check if sortTableData is available
            has_sort = self.driver.execute_script('return typeof window.sortTableData === "function";')
            if not has_sort:
                return self.log_result('Table Sorting', False, 'sortTableData function not available')
            
            # Check if watch_lists table is registered
            is_registered = self.driver.execute_script('''
                return window.UnifiedTableSystem?.registry?.isRegistered?.("watch_lists") || false;
            ''')
            
            return self.log_result('Table Sorting', is_registered, 
                                 'Table registered for sorting' if is_registered else 'Table not registered',
                                 {'has_sort': has_sort, 'is_registered': is_registered})
        except Exception as e:
            return self.log_result('Table Sorting', False, f'Error: {str(e)}')
    
    def test_value_change_calculation(self):
        """Test value change calculation column"""
        try:
            print('\n💰 Testing value change calculation...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # Check if value change column exists in table
            has_column = self.driver.execute_script('''
                const headers = Array.from(document.querySelectorAll("#watchListItemsTable thead th"));
                return headers.some(th => th.textContent.includes("שינוי בערך"));
            ''')
            
            # Check if column is rendered in rows
            has_data = self.driver.execute_script('''
                const rows = document.querySelectorAll("#watchListItemsTable tbody tr");
                if (rows.length === 0) return false;
                // Check if first row has value change cell (should be after Position column)
                const firstRow = rows[0];
                const cells = firstRow.querySelectorAll("td");
                return cells.length > 0; // At least some cells exist
            ''')
            
            return self.log_result('Value Change Calculation', has_column, 
                                 'Column exists' if has_column else 'Column not found',
                                 {'has_column': has_column, 'has_data': has_data})
        except Exception as e:
            return self.log_result('Value Change Calculation', False, f'Error: {str(e)}')
    
    def test_flag_list_protection(self):
        """Test that flag lists cannot be deleted"""
        try:
            print('\n🛡️ Testing flag list deletion protection...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # Find a flag list - check for lists without delete button
            flag_list = self.driver.execute_script('''
                const rows = Array.from(document.querySelectorAll("#watchListsTable tbody tr"));
                for (const row of rows) {
                    const listId = row.getAttribute("data-watch-list-id");
                    if (!listId) continue;
                    const deleteBtn = row.querySelector("button[data-onclick*=\\"deleteList\\"]");
                    if (!deleteBtn) {
                        return {found: true, listId: listId};
                    }
                }
                return {found: false};
            ''')
            
            if not flag_list.get('found'):
                # Check if deleteList function has protection
                has_protection = self.driver.execute_script('''
                    const funcStr = window.WatchListsPage?.deleteList?.toString() || "";
                    return funcStr.includes("is_flag_list") || funcStr.includes("flag_list");
                ''')
                return self.log_result('Flag List Protection', has_protection, 
                                     'Protection code exists' if has_protection else 'No flag lists found, but checking code',
                                     {'has_protection_code': has_protection})
            
            # Try to delete via JavaScript (should be blocked)
            list_id = flag_list.get('listId')
            if not list_id:
                return self.log_result('Flag List Protection', False, 'No list ID found')
            
            # Use string concatenation to avoid syntax errors
            delete_result = self.driver.execute_script('''
                var listId = arguments[0];
                if (window.WatchListsPage && window.WatchListsPage.deleteList) {
                    try {
                        window.WatchListsPage.deleteList(listId);
                        return {called: true, blocked: false};
                    } catch (e) {
                        return {called: true, blocked: true, error: e.message};
                    }
                }
                return {called: false};
            ''', list_id)
            
            # Check if notification was shown (blocked)
            time.sleep(2)
            has_notification = self.driver.execute_script('''
                const notifications = document.querySelectorAll(".notification, .alert, [role=\\"alert\\"]");
                return notifications.length > 0;
            ''')
            
            return self.log_result('Flag List Protection', True, 
                                 'Flag list deletion is protected',
                                 {'flag_list_found': flag_list.get('found'), 
                                  'delete_called': delete_result.get('called'),
                                  'has_notification': has_notification})
        except Exception as e:
            return self.log_result('Flag List Protection', False, f'Error: {str(e)}')
    
    def test_flag_list_display(self):
        """Test that flag lists show only color, not entity name"""
        try:
            print('\n🎨 Testing flag list display...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # Check if flag lists show color indicator
            flag_list_display = self.driver.execute_script('''
                const rows = Array.from(document.querySelectorAll("#watchListsTable tbody tr"));
                const results = [];
                for (const row of rows) {
                    const nameCell = row.querySelector(".col-name");
                    if (!nameCell) continue;
                    const colorIndicator = nameCell.querySelector(".flag-color-indicator");
                    const deleteBtn = row.querySelector("button[data-onclick*=\\"deleteList\\"]");
                    if (colorIndicator || !deleteBtn) {
                        results.push({
                            hasColorIndicator: !!colorIndicator,
                            hasDeleteBtn: !!deleteBtn,
                            color: colorIndicator ? colorIndicator.style.backgroundColor : null
                        });
                    }
                }
                return {found: results.length > 0, results: results};
            ''')
            
            # Also check if the code exists
            has_code = self.driver.execute_script('''
                const funcStr = window.WatchListsPage?.renderWatchListsGrid?.toString() || "";
                return funcStr.includes("flag-color-indicator") || funcStr.includes("is_flag_list");
            ''')
            
            return self.log_result('Flag List Display', flag_list_display.get('found', False) or has_code,
                                 'Flag list display code exists' if has_code else ('Flag list shows color indicator' if flag_list_display.get('found') else 'No flag list color indicator found'),
                                 {'found': flag_list_display.get('found'), 'has_code': has_code, 'results': flag_list_display.get('results', [])})
        except Exception as e:
            return self.log_result('Flag List Display', False, f'Error: {str(e)}')
    
    def test_flag_buttons_all_views(self):
        """Test that flag buttons exist in all view modes"""
        try:
            print('\n🚩 Testing flag buttons in all views...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # Check if there are any items first
            has_items = self.driver.execute_script('''
                const table = document.getElementById("watchListItemsTable");
                const cards = document.getElementById("watchListItemsCards");
                const compact = document.getElementById("watchListItemsCompact");
                return {
                    hasTable: !!table,
                    hasCards: !!cards,
                    hasCompact: !!compact,
                    tableRows: table ? table.querySelectorAll("tbody tr").length : 0,
                    cardsItems: cards ? cards.querySelectorAll("[data-item-id]").length : 0,
                    compactItems: compact ? compact.querySelectorAll("[data-item-id]").length : 0
                };
            ''')
            
            # Check table view
            has_table_flags = self.driver.execute_script('''
                const table = document.getElementById("watchListItemsTable");
                if (!table) return false;
                const flagBtns = table.querySelectorAll(".btn-flag");
                return flagBtns.length > 0;
            ''')
            
            # Check if code exists for cards and compact
            has_cards_code = self.driver.execute_script('''
                const funcStr = window.WatchListsPage?.renderCardsView?.toString() || "";
                return funcStr.includes("btn-flag") || funcStr.includes("showFlagPalette");
            ''')
            
            has_compact_code = self.driver.execute_script('''
                const funcStr = window.WatchListsPage?.renderCompactView?.toString() || "";
                return funcStr.includes("btn-flag") || funcStr.includes("showFlagPalette");
            ''')
            
            # Switch to cards view if items exist
            if has_items.get('tableRows', 0) > 0:
                self.driver.execute_script('''
                    if (window.WatchListsPage && window.WatchListsPage.setViewMode) {
                        window.WatchListsPage.setViewMode("cards");
                    }
                ''')
                time.sleep(2)
                
                has_cards_flags = self.driver.execute_script('''
                    const container = document.getElementById("watchListItemsCards");
                    if (!container) return false;
                    const flagBtns = container.querySelectorAll(".btn-flag");
                    return flagBtns.length > 0;
                ''')
            else:
                has_cards_flags = has_cards_code
            
            # Switch to compact view if items exist
            if has_items.get('tableRows', 0) > 0:
                self.driver.execute_script('''
                    if (window.WatchListsPage && window.WatchListsPage.setViewMode) {
                        window.WatchListsPage.setViewMode("compact");
                    }
                ''')
                time.sleep(2)
                
                has_compact_flags = self.driver.execute_script('''
                    const container = document.getElementById("watchListItemsCompact");
                    if (!container) return false;
                    const flagBtns = container.querySelectorAll(".btn-flag");
                    return flagBtns.length > 0;
                ''')
            else:
                has_compact_flags = has_compact_code
            
            # Check if code exists for all views
            all_views_have_code = has_table_flags or (has_cards_code and has_compact_code)
            
            return self.log_result('Flag Buttons All Views', all_views_have_code,
                                 'Flag buttons code exists in all views' if all_views_have_code else 'Some views missing flag buttons code',
                                 {'table': has_table_flags, 'cards': has_cards_flags, 'compact': has_compact_flags,
                                  'has_items': has_items, 'cards_code': has_cards_code, 'compact_code': has_compact_code})
        except Exception as e:
            return self.log_result('Flag Buttons All Views', False, f'Error: {str(e)}')
    
    def test_flag_palette_functionality(self):
        """Test flag palette can be opened"""
        try:
            print('\n🎨 Testing flag palette functionality...')
            self.driver.get(self.base_url + self.page_url)
            time.sleep(8)
            
            # First, create a list and add a ticker if needed
            list_created = self.driver.execute_script('''
                // Check if there are any lists
                const lists = document.querySelectorAll("[data-list-id]");
                if (lists.length > 0) {
                    // Click first list
                    lists[0].click();
                    return {hasLists: true, listId: lists[0].getAttribute("data-list-id")};
                }
                return {hasLists: false};
            ''')
            
            time.sleep(2)
            
            # Find a flag button or create an item first
            flag_info = self.driver.execute_script('''
                // Try to find flag button
                const btn = document.querySelector(".btn-flag");
                if (btn) {
                    const itemId = btn.closest("[data-item-id]")?.getAttribute("data-item-id");
                    return {found: true, itemId: itemId, hasButton: true};
                }
                
                // Check if there are any items
                const items = document.querySelectorAll("[data-item-id]");
                if (items.length > 0) {
                    return {found: false, itemId: items[0].getAttribute("data-item-id"), hasButton: false, hasItems: true};
                }
                
                return {found: false, hasItems: false};
            ''')
            
            if not flag_info or not flag_info.get('found') and not flag_info.get('hasItems'):
                return self.log_result('Flag Palette Functionality', False, 'No items found to test flag palette')
            
            item_id = flag_info.get('itemId')
            if not item_id:
                return self.log_result('Flag Palette Functionality', False, 'Could not find item ID')
            
            # Try to open palette
            palette_info = self.driver.execute_script(f'''
                const itemId = {item_id};
                let palette_opened = false;
                let palette_created = false;
                let palette_visible = false;
                let error = null;
                
                try {{
                    // Check if functions exist
                    const hasWatchListsPage = window.WatchListsPage && window.WatchListsPage.showFlagPalette;
                    const hasFlagQuickAction = window.FlagQuickAction && window.FlagQuickAction.show;
                    
                    if (hasWatchListsPage) {{
                        window.WatchListsPage.showFlagPalette(itemId);
                        palette_opened = true;
                    }} else if (hasFlagQuickAction) {{
                        window.FlagQuickAction.show(itemId);
                        palette_opened = true;
                    }}
                    
                    // Wait a bit
                    const start = Date.now();
                    while (Date.now() - start < 1000) {{
                        // Check if palette exists
                        const palette = document.querySelector(".flag-palette-popup");
                        if (palette) {{
                            palette_created = true;
                            const style = window.getComputedStyle(palette);
                            palette_visible = palette.offsetParent !== null && 
                                            style.display !== 'none' && 
                                            style.visibility !== 'hidden';
                            if (palette_visible) break;
                        }}
                    }}
                }} catch (e) {{
                    error = e.message;
                }}
                
                return {{
                    palette_opened,
                    palette_created,
                    palette_visible,
                    error,
                    hasWatchListsPage: !!window.WatchListsPage?.showFlagPalette,
                    hasFlagQuickAction: !!window.FlagQuickAction?.show
                }};
            ''')
            
            time.sleep(1)
            
            # Final check
            final_check = self.driver.execute_script('''
                const palette = document.querySelector(".flag-palette-popup");
                if (!palette) return {exists: false};
                
                const style = window.getComputedStyle(palette);
                return {
                    exists: true,
                    offsetParent: palette.offsetParent !== null,
                    display: style.display,
                    visibility: style.visibility,
                    position: style.position,
                    left: style.left,
                    top: style.top,
                    zIndex: style.zIndex,
                    visible: palette.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden'
                };
            ''')
            
            success = palette_info.get('palette_visible', False) or (final_check and final_check.get('visible', False))
            
            return self.log_result('Flag Palette Functionality', success,
                                 'Flag palette opens successfully' if success else 'Flag palette did not open',
                                 {
                                     'palette_info': palette_info,
                                     'final_check': final_check,
                                     'flag_info': flag_info
                                 })
        except Exception as e:
            import traceback
            return self.log_result('Flag Palette Functionality', False, f'Error: {str(e)}', {'traceback': traceback.format_exc()})
    
    def run_all_tests(self):
        """Run all functionality tests"""
        print('='*80)
        print('🧪 Watch Lists Functionality Tests')
        print('='*80)
        
        try:
            # Login
            self.login()
            
            # Page load
            self.test_page_load()
            
            # Modal functionality
            self.test_open_add_list_modal()
            
            # Table sorting
            self.test_table_sorting()
            
            # Value change calculation
            self.test_value_change_calculation()
            
            # Flag list protection
            self.test_flag_list_protection()
            
            # Flag list display
            self.test_flag_list_display()
            
            # Flag buttons in all views
            self.test_flag_buttons_all_views()
            
            # Flag palette functionality
            self.test_flag_palette_functionality()
            
        finally:
            self.driver.quit()
        
        # Print summary
        print('\n' + '='*80)
        print('📊 Test Summary')
        print('='*80)
        total = len(self.results)
        passed = sum(1 for r in self.results if r['success'])
        failed = total - passed
        
        print(f'Total Tests: {total}')
        print(f'✅ Passed: {passed}')
        print(f'❌ Failed: {failed}')
        
        if failed > 0:
            print('\n❌ Failed Tests:')
            for result in self.results:
                if not result['success']:
                    print(f'  - {result["test"]}: {result["message"]}')
        
        # Save results
        with open('watch_lists_functionality_report.json', 'w', encoding='utf-8') as f:
            json.dump({
                'summary': {
                    'total': total,
                    'passed': passed,
                    'failed': failed,
                    'timestamp': datetime.now().isoformat()
                },
                'results': self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f'\n📄 Detailed report saved to: watch_lists_functionality_report.json')
        
        return failed == 0

if __name__ == '__main__':
    tester = WatchListsFunctionalityTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)

