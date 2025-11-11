// קוד debug מקיף לבדיקת רווחים בין כפתורים
console.log('🔍 מתחיל בדיקת רווחים בין כפתורים...');

// פונקציה לבדיקת רווחים בין כפתורים
function debugButtonSpacing() {
    console.log('📏 בודק רווחים בין כפתורים...');
    
    const firstMenu = document.querySelector('.actions-menu-wrapper');
    if (!firstMenu) {
        console.log('❌ לא נמצא תפריט פעולות');
        return;
    }
    
    const popup = firstMenu.querySelector('.actions-menu-popup');
    if (!popup) {
        console.log('❌ לא נמצא popup');
        return;
    }
    
    const buttons = popup.querySelectorAll('button');
    console.log(`📋 נמצאו ${buttons.length} כפתורים בתפריט`);
    
    // בדוק את הרווחים בין הכפתורים
    buttons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        const buttonType = btn.getAttribute('data-button-type');
        
        console.log(`\n🔘 כפתור ${index + 1} (${buttonType}):`);
        console.log('  📏 מידות:', {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right
        });
        
        console.log('  🎨 CSS רווחים:', {
            marginTop: style.marginTop,
            marginBottom: style.marginBottom,
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight
        });
        
        // בדוק את הרווח לכפתור הבא
        if (index < buttons.length - 1) {
            const nextBtn = buttons[index + 1];
            const nextRect = nextBtn.getBoundingClientRect();
            const gap = nextRect.top - rect.bottom;
            
            console.log(`  📐 רווח לכפתור הבא: ${gap}px`);
        }
    });
    
    // בדוק את הרווחים בין כפתורים ספציפיים
    const cancelBtn = popup.querySelector('[data-button-type="CANCEL"]');
    const deleteBtn = popup.querySelector('[data-button-type="DELETE"]');
    
    if (cancelBtn && deleteBtn) {
        const cancelRect = cancelBtn.getBoundingClientRect();
        const deleteRect = deleteBtn.getBoundingClientRect();
        const gap = deleteRect.top - cancelRect.bottom;
        
        console.log('\n🎯 רווח ספציפי בין ביטול למחיקה:');
        console.log('  📏 רווח:', gap + 'px');
        console.log('  📍 מיקום ביטול:', {
            top: cancelRect.top,
            bottom: cancelRect.bottom
        });
        console.log('  📍 מיקום מחיקה:', {
            top: deleteRect.top,
            bottom: deleteRect.bottom
        });
        
        // בדוק אם הרווח תקין
        if (gap < 4) {
            console.log('  ❌ רווח קטן מדי!');
        } else if (gap > 12) {
            console.log('  ❌ רווח גדול מדי!');
        } else {
            console.log('  ✅ רווח תקין');
        }
    }
}

// פונקציה לבדיקת CSS שמשפיע על רווחים
function debugSpacingCSS() {
    console.log('\n🎨 בודק CSS שמשפיע על רווחים...');
    
    const testButton = document.querySelector('.actions-menu-item');
    if (!testButton) {
        console.log('❌ לא נמצא כפתור לבדיקה');
        return;
    }
    
    // בדוק CSS rules שמשפיעים על רווחים
    const rules = [];
    for (let sheet of document.styleSheets) {
        try {
            for (let rule of sheet.cssRules) {
                if (rule.selectorText && testButton.matches(rule.selectorText)) {
                    if (rule.cssText.includes('margin') || rule.cssText.includes('padding')) {
                        rules.push({
                            selector: rule.selectorText,
                            cssText: rule.cssText
                        });
                    }
                }
            }
        } catch (e) {
            // Skip cross-origin stylesheets
        }
    }
    
    console.log('📋 CSS rules שמשפיעים על רווחים:');
    rules.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.selector}:`, rule.cssText);
    });
}

// פונקציה לבדיקת כיוון הטקסט
function debugTextDirection() {
    console.log('\n📝 בודק כיוון הטקסט...');
    
    const html = document.documentElement;
    const body = document.body;
    
    console.log('🌍 כיוון הטקסט:', {
        htmlDir: html.getAttribute('dir'),
        bodyDir: body.getAttribute('dir'),
        computedDir: window.getComputedStyle(html).direction,
        lang: html.getAttribute('lang')
    });
    
    // בדוק אם יש תמיכה ב-RTL
    const firstMenu = document.querySelector('.actions-menu-wrapper');
    if (firstMenu) {
        const popup = firstMenu.querySelector('.actions-menu-popup');
        if (popup) {
            const style = window.getComputedStyle(popup);
            console.log('📋 תמיכה ב-RTL:', {
                direction: style.direction,
                textAlign: style.textAlign,
                justifyContent: style.justifyContent
            });
        }
    }
}

// הרץ את כל הבדיקות
function runSpacingDebug() {
    console.log('🚀 מתחיל בדיקה מקיפה של רווחים...\n');
    
    debugButtonSpacing();
    debugSpacingCSS();
    debugTextDirection();
    
    console.log('\n✅ בדיקה מקיפה הושלמה!');
}

// הפעל את הבדיקה
runSpacingDebug();

// הוסף פונקציות גלובליות
window.debugButtonSpacing = debugButtonSpacing;
window.debugSpacingCSS = debugSpacingCSS;
window.debugTextDirection = debugTextDirection;
window.runSpacingDebug = runSpacingDebug;

console.log('\n🔧 פונקציות debug זמינות:');
console.log('  - debugButtonSpacing() - בדיקת רווחים בין כפתורים');
console.log('  - debugSpacingCSS() - בדיקת CSS רווחים');
console.log('  - debugTextDirection() - בדיקת כיוון הטקסט');
console.log('  - runSpacingDebug() - בדיקה מקיפה');

