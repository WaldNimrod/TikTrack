#!/usr/bin/env python3
"""
תיקון showModalSafe - החלפת console.* ב-Logger Service
Fix showModalSafe - Replace console.* with Logger Service
"""

import re
from pathlib import Path

PAGES = [
    "trading-ui/tickers.html",
    "trading-ui/trade_plans.html",
    "trading-ui/alerts.html",
    "trading-ui/notes.html",
    "trading-ui/trading_accounts.html",
    "trading-ui/executions.html",
]

REPLACEMENT = '''        window.showModalSafe = async function(modalId, mode = 'add') {
            try {
                // Use Logger Service if available, fallback to console
                const log = (window.Logger && window.Logger.debug) ? window.Logger.debug.bind(window.Logger) : console.log;
                const warn = (window.Logger && window.Logger.warn) ? window.Logger.warn.bind(window.Logger) : console.warn;
                const error = (window.Logger && window.Logger.error) ? window.Logger.error.bind(window.Logger) : console.error;
                
                log(`🔍 [showModalSafe] Called with:`, { modalId, mode, ModalManagerV2Available: !!window.ModalManagerV2 });
                
                // If ModalManagerV2 is not available, wait for it (up to 2 seconds)
                if (!window.ModalManagerV2) {
                    warn('⚠️ [showModalSafe] ModalManagerV2 not available, waiting...');
                    for (let i = 0; i < 20; i++) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        if (window.ModalManagerV2) {
                            log(`✅ [showModalSafe] ModalManagerV2 became available after ${(i + 1) * 100}ms`);
                            break;
                        }
                    }
                }
                
                if (window.ModalManagerV2 && window.ModalManagerV2.showModal) {
                    log(`✅ [showModalSafe] Calling ModalManagerV2.showModal`);
                    await window.ModalManagerV2.showModal(modalId, mode);
                    log(`✅ [showModalSafe] Modal shown successfully`);
                } else {
                    error('❌ [showModalSafe] ModalManagerV2 not available after wait');
                    if (window.showErrorNotification) {
                        window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
                    }
                }
            } catch (err) {
                const error = (window.Logger && window.Logger.error) ? window.Logger.error.bind(window.Logger) : console.error;
                error('❌ [showModalSafe] Error showing modal:', err);
                if (window.Logger && window.Logger.error) {
                    window.Logger.error('   Error stack:', err.stack);
                } else {
                    console.error('   Error stack:', err.stack);
                }
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה', `שגיאה בפתיחת מודל: ${err.message}`);
                }
            }
        };
        // Use Logger Service if available for initialization log
        if (window.Logger && window.Logger.debug) {
            window.Logger.debug('✅ [showModalSafe] Helper function created in <head> - available immediately');
        } else {
            console.log('✅ [showModalSafe] Helper function created in <head> - available immediately');
        }'''

def fix_page(page_path):
    """תיקון עמוד אחד"""
    path = Path(page_path)
    if not path.exists():
        print(f"❌ קובץ לא נמצא: {page_path}")
        return False
    
    content = path.read_text(encoding='utf-8')
    
    # חיפוש showModalSafe function
    pattern = r'window\.showModalSafe\s*=\s*async\s+function[^}]+?};'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"⚠️  לא נמצא showModalSafe ב-{page_path}")
        return False
    
    # החלפה
    new_content = re.sub(pattern, REPLACEMENT, content, flags=re.DOTALL)
    
    # תיקון console.log אחרון
    new_content = re.sub(
        r'console\.log\(\'✅ \[showModalSafe\] Helper function created in <head> - available immediately\'\);',
        '''// Use Logger Service if available for initialization log
        if (window.Logger && window.Logger.debug) {
            window.Logger.debug('✅ [showModalSafe] Helper function created in <head> - available immediately');
        } else {
            console.log('✅ [showModalSafe] Helper function created in <head> - available immediately');
        }''',
        new_content
    )
    
    path.write_text(new_content, encoding='utf-8')
    print(f"✅ תוקן: {page_path}")
    return True

def main():
    print("🔧 תיקון showModalSafe - החלפת console.* ב-Logger Service\n")
    
    fixed = 0
    for page in PAGES:
        if fix_page(page):
            fixed += 1
    
    print(f"\n✅ הושלם: {fixed}/{len(PAGES)} עמודים תוקנו")

if __name__ == "__main__":
    main()

