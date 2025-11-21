// קוד debug מקיף לבדיקת כפתורי התפריט
console.log('🔍 מתחיל בדיקת כפתורי התפריט...');

// פונקציה לבדיקת כפתור בודד
function debugSingleButton(button, index) {
    const rect = button.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(button);
    
    console.log(`📊 כפתור ${index + 1}:`, {
        element: button,
        buttonType: button.getAttribute('data-button-type'),
        classes: button.className,
        text: button.textContent.trim(),
        icon: button.textContent.trim(),
        
        // מידות
        width: rect.width,
        height: rect.height,
        minWidth: computedStyle.minWidth,
        minHeight: computedStyle.minHeight,
        
        // ריווח
        padding: computedStyle.padding,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom,
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        
        // גופן
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        fontFamily: computedStyle.fontFamily,
        
        // מיקום
        display: computedStyle.display,
        alignItems: computedStyle.alignItems,
        justifyContent: computedStyle.justifyContent,
        
        // צבעים
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        borderColor: computedStyle.borderColor,
        
        // CSS variables
        currentButtonColor: computedStyle.getPropertyValue('--current-button-color'),
        currentButtonHover: computedStyle.getPropertyValue('--current-button-hover'),
        
        // מיקום יחסי
        rect: {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right
        }
    });
}

// פונקציה לבדיקת כל הכפתורים בתפריט
function debugAllActionButtons() {
    console.log('🔍 מחפש כפתורי תפריט...');
    
    // חפש כל התפריטים
    const actionMenus = document.querySelectorAll('.actions-menu-wrapper');
    console.log(`📋 נמצאו ${actionMenus.length} תפריטי פעולות`);
    
    actionMenus.forEach((menu, menuIndex) => {
        console.log(`\n📋 תפריט ${menuIndex + 1}:`);
        
        // בדוק את כפתור הטריגר
        const trigger = menu.querySelector('.actions-trigger');
        if (trigger) {
            console.log('🎯 כפתור טריגר:');
            debugSingleButton(trigger, 0);
        }
        
        // בדוק את הכפתורים בתפריט
        const buttons = menu.querySelectorAll('.actions-menu-item');
        console.log(`🔘 נמצאו ${buttons.length} כפתורים בתפריט`);
        
        buttons.forEach((button, buttonIndex) => {
            console.log(`\n🔘 כפתור ${buttonIndex + 1} בתפריט:`);
            debugSingleButton(button, buttonIndex);
        });
    });
}

// פונקציה להשוואת כפתורים
function compareButtons() {
    console.log('⚖️ משווה בין כפתורים...');
    
    const allButtons = document.querySelectorAll('.actions-menu-item');
    if (allButtons.length < 2) {
        console.log('❌ לא מספיק כפתורים להשוואה');
        return;
    }
    
    const firstButton = allButtons[0];
    const firstRect = firstButton.getBoundingClientRect();
    const firstStyle = window.getComputedStyle(firstButton);
    
    console.log('📏 השוואת מידות:');
    allButtons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const style = window.getComputedStyle(button);
        
        const widthDiff = rect.width - firstRect.width;
        const heightDiff = rect.height - firstRect.height;
        
        console.log(`🔘 כפתור ${index + 1} (${button.getAttribute('data-button-type')}):`, {
            width: `${rect.width}px (${widthDiff > 0 ? '+' : ''}${widthDiff.toFixed(1)}px)`,
            height: `${rect.height}px (${heightDiff > 0 ? '+' : ''}${heightDiff.toFixed(1)}px)`,
            fontSize: style.fontSize,
            padding: style.padding,
            icon: button.textContent.trim()
        });
    });
}

// פונקציה לבדיקת CSS rules
function debugCSSRules() {
    console.log('🎨 בודק CSS rules...');
    
    const testButton = document.querySelector('.actions-menu-item');
    if (!testButton) {
        console.log('❌ לא נמצא כפתור לבדיקה');
        return;
    }
    
    // בדוק את כל ה-CSS rules שמשפיעים על הכפתור
    const rules = [];
    for (let sheet of document.styleSheets) {
        try {
            for (let rule of sheet.cssRules) {
                if (rule.selectorText && testButton.matches(rule.selectorText)) {
                    rules.push({
                        selector: rule.selectorText,
                        cssText: rule.cssText,
                        style: rule.style
                    });
                }
            }
        } catch (e) {
            // Skip cross-origin stylesheets
        }
    }
    
    console.log('📋 CSS rules שמשפיעים על הכפתור:');
    rules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.selector}:`, rule.cssText);
    });
}

// פונקציה לבדיקת איקונים
function debugIcons() {
    console.log('🎭 בודק איקונים...');
    
    const buttons = document.querySelectorAll('.actions-menu-item');
    buttons.forEach((button, index) => {
        const text = button.textContent.trim();
        const buttonType = button.getAttribute('data-button-type');
        
        console.log(`🎭 כפתור ${index + 1} (${buttonType}):`, {
            icon: text,
            iconLength: text.length,
            iconCodePoints: Array.from(text).map(char => char.codePointAt(0)),
            iconBytes: new TextEncoder().encode(text).length
        });
    });
}

// הרץ את כל הבדיקות
function runFullDebug() {
    console.log('🚀 מתחיל בדיקה מקיפה של כפתורי התפריט...\n');
    
    debugAllActionButtons();
    console.log('\n' + '='.repeat(50) + '\n');
    
    compareButtons();
    console.log('\n' + '='.repeat(50) + '\n');
    
    debugCSSRules();
    console.log('\n' + '='.repeat(50) + '\n');
    
    debugIcons();
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('✅ בדיקה מקיפה הושלמה!');
}

// הפעל את הבדיקה
runFullDebug();

// הוסף פונקציות גלובליות
window.debugActionButtons = debugAllActionButtons;
window.compareActionButtons = compareButtons;
window.debugActionCSS = debugCSSRules;
window.debugActionIcons = debugIcons;
window.runFullActionDebug = runFullDebug;

console.log('🔧 פונקציות debug זמינות:');
console.log('  - debugActionButtons() - בדיקת כל הכפתורים');
console.log('  - compareActionButtons() - השוואת כפתורים');
console.log('  - debugActionCSS() - בדיקת CSS rules');
console.log('  - debugActionIcons() - בדיקת איקונים');
console.log('  - runFullActionDebug() - בדיקה מקיפה');

