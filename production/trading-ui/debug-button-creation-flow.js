// קוד debug מקיף לעקוב אחרי תהליך יצירת הכפתורים
console.log('🔍 מתחיל מעקב אחרי תהליך יצירת הכפתורים...');

// פונקציה לבדיקת כפתור בודד עם כל הפרטים
function debugButtonCreation(button, buttonName) {
    console.log(`\n🔘 מעקב אחרי ${buttonName}:`);
    
    // בדוק את ה-HTML המקורי
    console.log('📝 HTML מקורי:', button.outerHTML);
    
    // בדוק את ה-classes
    console.log('🏷️ Classes:', button.className);
    
    // בדוק את ה-attributes
    const attributes = {};
    for (let attr of button.attributes) {
        attributes[attr.name] = attr.value;
    }
    console.log('📋 Attributes:', attributes);
    
    // בדוק את ה-computed styles
    const computedStyle = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    
    console.log('📏 מידות:', {
        width: rect.width,
        height: rect.height,
        minWidth: computedStyle.minWidth,
        minHeight: computedStyle.minHeight
    });
    
    console.log('🎨 CSS חשוב:', {
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        padding: computedStyle.padding,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom,
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        display: computedStyle.display,
        alignItems: computedStyle.alignItems,
        justifyContent: computedStyle.justifyContent
    });
    
    // בדוק את התוכן
    console.log('📄 תוכן:', {
        textContent: button.textContent,
        innerHTML: button.innerHTML,
        iconLength: button.textContent.length,
        iconCodePoints: Array.from(button.textContent).map(char => char.codePointAt(0))
    });
    
    // בדוק CSS rules שמשפיעים על הכפתור
    console.log('🎨 CSS Rules שמשפיעים:');
    const rules = [];
    for (let sheet of document.styleSheets) {
        try {
            for (let rule of sheet.cssRules) {
                if (rule.selectorText && button.matches(rule.selectorText)) {
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
        console.log(`  ${index + 1}. ${rule.selector}:`, rule.cssText);
    });
}

// פונקציה להשוואה בין שני כפתורים
function compareButtons(button1, button2, name1, name2) {
    console.log(`\n⚖️ השוואה בין ${name1} ו-${name2}:`);
    
    const rect1 = button1.getBoundingClientRect();
    const rect2 = button2.getBoundingClientRect();
    const style1 = window.getComputedStyle(button1);
    const style2 = window.getComputedStyle(button2);
    
    console.log('📏 השוואת מידות:', {
        [`${name1} width`]: rect1.width,
        [`${name2} width`]: rect2.width,
        [`width difference`]: rect2.width - rect1.width,
        [`${name1} height`]: rect1.height,
        [`${name2} height`]: rect2.height,
        [`height difference`]: rect2.height - rect1.height
    });
    
    console.log('🎨 השוואת CSS:', {
        [`${name1} fontSize`]: style1.fontSize,
        [`${name2} fontSize`]: style2.fontSize,
        [`${name1} padding`]: style1.padding,
        [`${name2} padding`]: style2.padding,
        [`${name1} lineHeight`]: style1.lineHeight,
        [`${name2} lineHeight`]: style2.lineHeight
    });
    
    console.log('📄 השוואת תוכן:', {
        [`${name1} text`]: button1.textContent,
        [`${name2} text`]: button2.textContent,
        [`${name1} textLength`]: button1.textContent.length,
        [`${name2} textLength`]: button2.textContent.length
    });
    
    // בדוק אם יש CSS rules שונים
    const rules1 = [];
    const rules2 = [];
    
    for (let sheet of document.styleSheets) {
        try {
            for (let rule of sheet.cssRules) {
                if (rule.selectorText) {
                    if (button1.matches(rule.selectorText)) {
                        rules1.push(rule.selectorText);
                    }
                    if (button2.matches(rule.selectorText)) {
                        rules2.push(rule.selectorText);
                    }
                }
            }
        } catch (e) {
            // Skip cross-origin stylesheets
        }
    }
    
    const uniqueTo1 = rules1.filter(rule => !rules2.includes(rule));
    const uniqueTo2 = rules2.filter(rule => !rules1.includes(rule));
    
    if (uniqueTo1.length > 0) {
        console.log(`🎨 CSS Rules ייחודיים ל-${name1}:`, uniqueTo1);
    }
    if (uniqueTo2.length > 0) {
        console.log(`🎨 CSS Rules ייחודיים ל-${name2}:`, uniqueTo2);
    }
}

// הרץ את הבדיקה
function runButtonCreationDebug() {
    console.log('🚀 מתחיל מעקב מקיף אחרי יצירת הכפתורים...\n');
    
    // חפש כפתורי מחיקה וביטול
    const deleteButtons = document.querySelectorAll('[data-button-type="DELETE"]');
    const cancelButtons = document.querySelectorAll('[data-button-type="CANCEL"]');
    
    console.log(`🔍 נמצאו ${deleteButtons.length} כפתורי מחיקה`);
    console.log(`🔍 נמצאו ${cancelButtons.length} כפתורי ביטול`);
    
    if (deleteButtons.length > 0 && cancelButtons.length > 0) {
        // בדוק את הכפתור הראשון מכל סוג
        const deleteBtn = deleteButtons[0];
        const cancelBtn = cancelButtons[0];
        
        debugButtonCreation(deleteBtn, 'כפתור מחיקה');
        debugButtonCreation(cancelBtn, 'כפתור ביטול');
        compareButtons(deleteBtn, cancelBtn, 'מחיקה', 'ביטול');
    } else {
        console.log('❌ לא נמצאו כפתורים להשוואה');
    }
    
    // בדוק גם כפתורים אחרים לתמונה מלאה
    const allActionButtons = document.querySelectorAll('[data-button-type]');
    console.log(`\n📊 סיכום כל הכפתורים (${allActionButtons.length}):`);
    
    allActionButtons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        console.log(`${index + 1}. ${btn.getAttribute('data-button-type')}: ${rect.width}x${rect.height}px, fontSize: ${style.fontSize}, padding: ${style.padding}`);
    });
}

// הפעל את הבדיקה
runButtonCreationDebug();

// הוסף פונקציות גלובליות
window.debugButtonCreation = debugButtonCreation;
window.compareButtons = compareButtons;
window.runButtonCreationDebug = runButtonCreationDebug;

console.log('\n🔧 פונקציות debug זמינות:');
console.log('  - debugButtonCreation(button, name) - בדיקת כפתור בודד');
console.log('  - compareButtons(btn1, btn2, name1, name2) - השוואת כפתורים');
console.log('  - runButtonCreationDebug() - בדיקה מקיפה');

