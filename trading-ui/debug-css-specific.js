/**
 * Debug CSS Specific - TikTrack
 * =============================
 * 
 * בדיקת CSS ספציפי לכפתורי הלוג
 */

// בדוק CSS rules ספציפיים
function debugSpecificCSS() {
    console.log('🎯 בדיקת CSS ספציפי לכפתורי הלוג...\n');
    
    // בדוק את קובץ ה-CSS של הלוגים
    const logCSS = document.querySelector('link[href*="unified-log-display"]');
    if (logCSS) {
        console.log('✅ קובץ CSS של הלוגים נטען:', logCSS.href);
    } else {
        console.log('❌ קובץ CSS של הלוגים לא נטען!');
    }
    
    // בדוק Bootstrap
    const bootstrap = document.querySelector('link[href*="bootstrap"]');
    if (bootstrap) {
        console.log('✅ Bootstrap נטען:', bootstrap.href);
    } else {
        console.log('❌ Bootstrap לא נטען!');
    }
    
    // בדוק משתני CSS
    const root = document.documentElement;
    const computed = window.getComputedStyle(root);
    
    console.log('\n🎨 משתני CSS חשובים:');
    const importantVars = [
        '--apple-blue',
        '--apple-gray-1', 
        '--apple-gray-2',
        '--apple-gray-3',
        '--apple-gray-11'
    ];
    
    importantVars.forEach(varName => {
        const value = computed.getPropertyValue(varName);
        console.log(`   ${varName}: ${value || '❌ לא מוגדר'}`);
    });
    
    // בדוק כפתורים ספציפיים
    console.log('\n🔘 בדיקת כפתורים ספציפיים:');
    
    const selectors = [
        '.unified-log-display .btn',
        '.log-display-controls .btn',
        '.log-export-btn',
        '.log-refresh-btn'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`   ${selector}: ${elements.length} נמצאו`);
        
        if (elements.length > 0) {
            const first = elements[0];
            const style = window.getComputedStyle(first);
            console.log(`      📏 גודל: ${style.width} x ${style.height}`);
            console.log(`      🎨 רקע: ${style.backgroundColor}`);
            console.log(`      📦 padding: ${style.padding}`);
            console.log(`      🔲 border: ${style.border}`);
        }
    });
}

// בדוק CSS conflicts
function debugCSSConflicts() {
    console.log('\n⚠️ בדיקת CSS conflicts...');
    
    const buttons = document.querySelectorAll('.btn');
    if (buttons.length === 0) {
        console.log('❌ לא נמצאו כפתורים כלל');
        return;
    }
    
    const firstButton = buttons[0];
    const style = window.getComputedStyle(firstButton);
    
    console.log('🔍 בדיקת CSS rules שמשפיעים על הכפתור:');
    
    // בדוק כל stylesheet
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            const rules = sheet.cssRules || sheet.rules;
            
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && rule.selectorText.includes('btn')) {
                        console.log(`   📁 ${sheet.href || 'inline'}`);
                        console.log(`      ${rule.selectorText}`);
                        console.log(`      ${rule.style.cssText}`);
                    }
                }
            }
        } catch (e) {
            // Skip cross-origin
        }
    }
}

// הפעל בדיקות
debugSpecificCSS();
debugCSSConflicts();

// הוסף לגלובל
window.debugSpecificCSS = debugSpecificCSS;
window.debugCSSConflicts = debugCSSConflicts;

console.log('\n💡 פונקציות זמינות:');
console.log('   debugSpecificCSS() - בדיקת CSS ספציפי');
console.log('   debugCSSConflicts() - בדיקת CSS conflicts');
