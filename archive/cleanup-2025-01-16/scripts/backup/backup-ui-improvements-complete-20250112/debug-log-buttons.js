/**
 * Debug Log Buttons Styles - TikTrack
 * ===================================
 * 
 * קוד לקונסולה לבדיקת הסיגנונות המשפיעים על הכפתורים בלוג
 */

console.log('🔍 מתחיל בדיקת סיגנונות כפתורי הלוג...');

// פונקציה לבדיקת כפתורים בלוג
function debugLogButtons() {
    console.log('\n📊 === בדיקת כפתורי הלוג ===');
    
    // מצא את כל הכפתורים בלוג
    const logButtons = document.querySelectorAll('.unified-log-display .btn, .log-display-controls .btn, .log-export-btn, .log-refresh-btn');
    
    console.log(`🔍 נמצאו ${logButtons.length} כפתורים בלוג`);
    
    if (logButtons.length === 0) {
        console.log('⚠️ לא נמצאו כפתורים בלוג. בדוק אם מערכת הלוגים נטענה.');
        return;
    }
    
    // בדוק כל כפתור
    logButtons.forEach((button, index) => {
        console.log(`\n🔘 כפתור ${index + 1}:`);
        console.log(`   📍 Element:`, button);
        console.log(`   📝 Text: "${button.textContent.trim()}"`);
        console.log(`   🏷️ Classes: "${button.className}"`);
        
        // בדוק סיגנונות מחושבים
        const computedStyles = window.getComputedStyle(button);
        console.log(`   🎨 סיגנונות מחושבים:`);
        console.log(`      📏 Width: ${computedStyles.width}`);
        console.log(`      📏 Height: ${computedStyles.height}`);
        console.log(`      🎨 Background: ${computedStyles.backgroundColor}`);
        console.log(`      🎨 Color: ${computedStyles.color}`);
        console.log(`      📦 Padding: ${computedStyles.padding}`);
        console.log(`      🔲 Border: ${computedStyles.border}`);
        console.log(`      📐 Border-radius: ${computedStyles.borderRadius}`);
        console.log(`      📝 Font-size: ${computedStyles.fontSize}`);
        console.log(`      ⚖️ Font-weight: ${computedStyles.fontWeight}`);
        console.log(`      👁️ Display: ${computedStyles.display}`);
        console.log(`      📍 Position: ${computedStyles.position}`);
        console.log(`      🔄 Transition: ${computedStyles.transition}`);
        
        // בדוק אם יש בעיות
        const issues = [];
        if (computedStyles.width === '0px' || computedStyles.height === '0px') {
            issues.push('גודל 0px');
        }
        if (computedStyles.display === 'none') {
            issues.push('מוסתר (display: none)');
        }
        if (computedStyles.visibility === 'hidden') {
            issues.push('מוסתר (visibility: hidden)');
        }
        if (computedStyles.opacity === '0') {
            issues.push('שקוף (opacity: 0)');
        }
        
        if (issues.length > 0) {
            console.log(`   ⚠️ בעיות: ${issues.join(', ')}`);
        } else {
            console.log(`   ✅ נראה תקין`);
        }
    });
}

// פונקציה לבדיקת CSS rules
function debugCSSRules() {
    console.log('\n📋 === בדיקת CSS Rules ===');
    
    // בדוק את כל ה-CSS rules שמשפיעים על כפתורים
    const selectors = [
        '.unified-log-display .btn',
        '.log-display-controls .btn',
        '.log-export-btn',
        '.log-refresh-btn',
        '.btn',
        '.btn-sm',
        '.btn-outline-primary',
        '.btn-outline-secondary',
        '.btn-success',
        '.btn-info',
        '.btn-warning'
    ];
    
    selectors.forEach(selector => {
        console.log(`\n🎯 Selector: ${selector}`);
        
        // בדוק אם יש rules עבור ה-selector הזה
        const rules = [];
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const sheet = document.styleSheets[i];
                if (sheet.cssRules) {
                    for (let j = 0; j < sheet.cssRules.length; j++) {
                        const rule = sheet.cssRules[j];
                        if (rule.selectorText && rule.selectorText.includes(selector.replace('.', ''))) {
                            rules.push({
                                selector: rule.selectorText,
                                styles: rule.style.cssText,
                                source: sheet.href || 'inline'
                            });
                        }
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        }
        
        if (rules.length > 0) {
            console.log(`   📝 נמצאו ${rules.length} rules:`);
            rules.forEach((rule, index) => {
                console.log(`      ${index + 1}. ${rule.selector}`);
                console.log(`         🎨 ${rule.styles}`);
                console.log(`         📁 ${rule.source}`);
            });
        } else {
            console.log(`   ⚠️ לא נמצאו rules`);
        }
    });
}

// פונקציה לבדיקת משתני CSS
function debugCSSVariables() {
    console.log('\n🎨 === בדיקת משתני CSS ===');
    
    const root = document.documentElement;
    const computedStyles = window.getComputedStyle(root);
    
    // משתנים חשובים לכפתורים
    const importantVars = [
        '--apple-blue',
        '--apple-gray-1',
        '--apple-gray-2',
        '--apple-gray-3',
        '--apple-gray-4',
        '--apple-gray-11',
        '--spacing-md',
        '--spacing-sm',
        '--spacing-xs',
        '--color-primary',
        '--color-background-primary',
        '--color-border-light',
        '--border-radius-md',
        '--border-radius-sm',
        '--transition-fast'
    ];
    
    console.log('🔍 בדיקת משתני CSS חשובים:');
    importantVars.forEach(varName => {
        const value = computedStyles.getPropertyValue(varName);
        if (value) {
            console.log(`   ✅ ${varName}: ${value}`);
        } else {
            console.log(`   ❌ ${varName}: לא מוגדר`);
        }
    });
}

// פונקציה לבדיקת מערכת הלוגים
function debugLogSystem() {
    console.log('\n🔧 === בדיקת מערכת הלוגים ===');
    
    // בדוק אם מערכת הלוגים נטענה
    console.log('🔍 בדיקת זמינות מערכת הלוגים:');
    console.log(`   UnifiedLogManager: ${typeof window.UnifiedLogManager !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   UnifiedLogDisplay: ${typeof window.UnifiedLogDisplay !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   UnifiedLogAPI: ${typeof window.UnifiedLogAPI !== 'undefined' ? '✅' : '❌'}`);
    
    // בדוק אם יש containers ללוגים
    const logContainers = document.querySelectorAll('.unified-log-display, #unified-logs-container, .log-display-content');
    console.log(`   Log Containers: ${logContainers.length} נמצאו`);
    
    logContainers.forEach((container, index) => {
        console.log(`      ${index + 1}. ${container.tagName}#${container.id || 'no-id'}.${container.className}`);
        console.log(`         📏 Size: ${container.offsetWidth}x${container.offsetHeight}`);
        console.log(`         👁️ Visible: ${container.offsetParent !== null ? 'כן' : 'לא'}`);
    });
}

// פונקציה לבדיקת Bootstrap
function debugBootstrap() {
    console.log('\n🎨 === בדיקת Bootstrap ===');
    
    // בדוק אם Bootstrap נטען
    const bootstrapCSS = document.querySelector('link[href*="bootstrap"]');
    const bootstrapJS = document.querySelector('script[src*="bootstrap"]');
    
    console.log(`   Bootstrap CSS: ${bootstrapCSS ? '✅' : '❌'}`);
    console.log(`   Bootstrap JS: ${bootstrapJS ? '✅' : '❌'}`);
    
    if (bootstrapCSS) {
        console.log(`   CSS Source: ${bootstrapCSS.href}`);
    }
    if (bootstrapJS) {
        console.log(`   JS Source: ${bootstrapJS.src}`);
    }
    
    // בדוק אם יש Bootstrap classes
    const bootstrapButtons = document.querySelectorAll('.btn, .btn-sm, .btn-outline-primary');
    console.log(`   Bootstrap Buttons: ${bootstrapButtons.length} נמצאו`);
}

// פונקציה ראשית
function debugAll() {
    console.clear();
    console.log('🚀 מתחיל בדיקה מקיפה של כפתורי הלוג...\n');
    
    debugLogSystem();
    debugBootstrap();
    debugCSSVariables();
    debugCSSRules();
    debugLogButtons();
    
    console.log('\n✅ בדיקה הושלמה!');
    console.log('\n💡 טיפים:');
    console.log('   - אם כפתורים לא נראים, בדוק את ה-CSS variables');
    console.log('   - אם יש בעיות גודל, בדוק את ה-Bootstrap classes');
    console.log('   - אם המערכת לא נטענה, רענן את הדף');
}

// הפעל את הבדיקה
debugAll();

// הוסף לפונקציות גלובליות
window.debugLogButtons = debugLogButtons;
window.debugCSSRules = debugCSSRules;
window.debugCSSVariables = debugCSSVariables;
window.debugLogSystem = debugLogSystem;
window.debugBootstrap = debugBootstrap;
window.debugAll = debugAll;

console.log('\n🔧 פונקציות זמינות:');
console.log('   debugLogButtons() - בדיקת כפתורים');
console.log('   debugCSSRules() - בדיקת CSS rules');
console.log('   debugCSSVariables() - בדיקת משתני CSS');
console.log('   debugLogSystem() - בדיקת מערכת הלוגים');
console.log('   debugBootstrap() - בדיקת Bootstrap');
console.log('   debugAll() - בדיקה מקיפה');
