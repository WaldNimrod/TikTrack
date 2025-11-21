// קוד debug לבדיקת כפתור מחיקה ספציפי
console.log('🔍 בודק מה שונה בכפתור מחיקה...');

// בדוק את הכפתורים בתפריט
const firstMenu = document.querySelector('.actions-menu-wrapper');
if (firstMenu) {
    const popup = firstMenu.querySelector('.actions-menu-popup');
    const buttons = popup.querySelectorAll('button');
    
    console.log(`📋 נמצאו ${buttons.length} כפתורים בתפריט`);
    
    // בדוק כל כפתור בנפרד
    buttons.forEach((btn, index) => {
        const buttonType = btn.getAttribute('data-button-type');
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        
        console.log(`\n🔘 כפתור ${index + 1} (${buttonType}):`);
        console.log('  📏 מידות:', {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom
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
        
        console.log('  🏷️ Classes:', btn.className);
        console.log('  📋 Attributes:', {
            'data-button-type': btn.getAttribute('data-button-type'),
            'data-variant': btn.getAttribute('data-variant'),
            'data-button-processed': btn.getAttribute('data-button-processed'),
            'id': btn.getAttribute('id')
        });
        
        // בדוק CSS rules ספציפיים
        console.log('  🎨 CSS Rules ספציפיים:');
        const rules = [];
        for (let sheet of document.styleSheets) {
            try {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText && btn.matches(rule.selectorText)) {
                        rules.push({
                            selector: rule.selectorText,
                            cssText: rule.cssText
                        });
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        }
        
        rules.forEach((rule, index) => {
            console.log(`    ${index + 1}. ${rule.selector}:`, rule.cssText);
        });
    });
    
    // השווה בין כפתור ביטול למחיקה
    const cancelBtn = popup.querySelector('[data-button-type="CANCEL"]');
    const deleteBtn = popup.querySelector('[data-button-type="DELETE"]');
    
    if (cancelBtn && deleteBtn) {
        console.log('\n⚖️ השוואה בין ביטול למחיקה:');
        
        const cancelRect = cancelBtn.getBoundingClientRect();
        const deleteRect = deleteBtn.getBoundingClientRect();
        const cancelStyle = window.getComputedStyle(cancelBtn);
        const deleteStyle = window.getComputedStyle(deleteBtn);
        
        console.log('📏 השוואת מידות:', {
            'ביטול width': cancelRect.width,
            'מחיקה width': deleteRect.width,
            'ביטול height': cancelRect.height,
            'מחיקה height': deleteRect.height,
            'ביטול top': cancelRect.top,
            'מחיקה top': deleteRect.top
        });
        
        console.log('🎨 השוואת CSS רווחים:', {
            'ביטול marginBottom': cancelStyle.marginBottom,
            'מחיקה marginBottom': deleteStyle.marginBottom,
            'ביטול paddingBottom': cancelStyle.paddingBottom,
            'מחיקה paddingBottom': deleteStyle.paddingBottom
        });
        
        // בדוק אם יש CSS rules שונים
        const cancelRules = [];
        const deleteRules = [];
        
        for (let sheet of document.styleSheets) {
            try {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText) {
                        if (cancelBtn.matches(rule.selectorText)) {
                            cancelRules.push(rule.selectorText);
                        }
                        if (deleteBtn.matches(rule.selectorText)) {
                            deleteRules.push(rule.selectorText);
                        }
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        }
        
        const uniqueToCancel = cancelRules.filter(rule => !deleteRules.includes(rule));
        const uniqueToDelete = deleteRules.filter(rule => !cancelRules.includes(rule));
        
        if (uniqueToCancel.length > 0) {
            console.log('🎨 CSS Rules ייחודיים לביטול:', uniqueToCancel);
        }
        if (uniqueToDelete.length > 0) {
            console.log('🎨 CSS Rules ייחודיים למחיקה:', uniqueToDelete);
        }
    }
}

