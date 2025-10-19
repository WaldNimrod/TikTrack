/**
 * Debug Log Styles - TikTrack
 * ===========================
 * 
 * קוד מקיף לבדיקת הסיגנונות המשפיעים על הכפתורים בלוג
 * 
 * שימוש:
 * 1. העתק את הקוד הזה לקונסולה
 * 2. הפעל: debugLogStyles()
 * 3. בדוק את התוצאות
 */

function debugLogStyles() {
    console.clear();
    console.log('🚀 מתחיל בדיקה מקיפה של סיגנונות כפתורי הלוג...\n');
    
    // === 1. בדיקת מערכת הלוגים ===
    console.log('📊 === 1. בדיקת מערכת הלוגים ===');
    console.log(`   UnifiedLogManager: ${typeof window.UnifiedLogManager !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   UnifiedLogDisplay: ${typeof window.UnifiedLogDisplay !== 'undefined' ? '❌' : '❌'}`);
    console.log(`   UnifiedLogAPI: ${typeof window.UnifiedLogAPI !== 'undefined' ? '✅' : '❌'}`);
    
    // === 2. בדיקת CSS files ===
    console.log('\n📁 === 2. בדיקת קבצי CSS ===');
    const cssFiles = [
        'unified-log-display',
        'bootstrap',
        'variables',
        'colors-dynamic'
    ];
    
    cssFiles.forEach(fileName => {
        const link = document.querySelector(`link[href*="${fileName}"]`);
        if (link) {
            console.log(`   ✅ ${fileName}: ${link.href}`);
        } else {
            console.log(`   ❌ ${fileName}: לא נטען`);
        }
    });
    
    // === 3. בדיקת משתני CSS ===
    console.log('\n🎨 === 3. בדיקת משתני CSS ===');
    const root = document.documentElement;
    const computed = window.getComputedStyle(root);
    
    const cssVars = [
        '--apple-blue',
        '--apple-gray-1',
        '--apple-gray-2', 
        '--apple-gray-3',
        '--apple-gray-11',
        '--spacing-md',
        '--spacing-sm',
        '--color-primary',
        '--color-background-primary'
    ];
    
    cssVars.forEach(varName => {
        const value = computed.getPropertyValue(varName);
        if (value && value.trim() !== '') {
            console.log(`   ✅ ${varName}: ${value}`);
        } else {
            console.log(`   ❌ ${varName}: לא מוגדר`);
        }
    });
    
    // === 4. בדיקת כפתורים ===
    console.log('\n🔘 === 4. בדיקת כפתורים ===');
    
    const buttonSelectors = [
        '.unified-log-display .btn',
        '.log-display-controls .btn', 
        '.log-export-btn',
        '.log-refresh-btn',
        '.btn',
        '.btn-sm'
    ];
    
    let totalButtons = 0;
    buttonSelectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        if (buttons.length > 0) {
            console.log(`   📍 ${selector}: ${buttons.length} כפתורים`);
            totalButtons += buttons.length;
            
            // בדוק את הכפתור הראשון
            const firstBtn = buttons[0];
            const style = window.getComputedStyle(firstBtn);
            
            console.log(`      📏 גודל: ${style.width} x ${style.height}`);
            console.log(`      🎨 רקע: ${style.backgroundColor}`);
            console.log(`      📝 צבע: ${style.color}`);
            console.log(`      📦 padding: ${style.padding}`);
            console.log(`      🔲 border: ${style.border}`);
            console.log(`      📐 border-radius: ${style.borderRadius}`);
            console.log(`      👁️ display: ${style.display}`);
            console.log(`      📍 position: ${style.position}`);
            
            // בדוק בעיות
            const issues = [];
            if (style.width === '0px' || style.width === 'auto') issues.push('רוחב בעייתי');
            if (style.height === '0px' || style.height === 'auto') issues.push('גובה בעייתי');
            if (style.display === 'none') issues.push('מוסתר');
            if (style.visibility === 'hidden') issues.push('נסתר');
            if (style.opacity === '0') issues.push('שקוף');
            if (style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent') issues.push('רקע שקוף');
            
            if (issues.length > 0) {
                console.log(`      ⚠️ בעיות: ${issues.join(', ')}`);
            } else {
                console.log(`      ✅ נראה תקין`);
            }
        }
    });
    
    console.log(`\n   📊 סה"כ כפתורים: ${totalButtons}`);
    
    // === 5. בדיקת containers ===
    console.log('\n📦 === 5. בדיקת containers ===');
    const containers = [
        '.unified-log-display',
        '#unified-logs-container',
        '.log-display-content',
        '.log-display-controls'
    ];
    
    containers.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach((el, i) => {
                const style = window.getComputedStyle(el);
                console.log(`   📍 ${selector} ${i+1}:`);
                console.log(`      📏 גודל: ${el.offsetWidth}x${el.offsetHeight}`);
                console.log(`      👁️ נראה: ${el.offsetParent !== null ? 'כן' : 'לא'}`);
                console.log(`      🎨 רקע: ${style.backgroundColor}`);
                console.log(`      📦 padding: ${style.padding}`);
                console.log(`      🔲 border: ${style.border}`);
            });
        } else {
            console.log(`   ❌ ${selector}: לא נמצא`);
        }
    });
    
    // === 6. בדיקת CSS rules ===
    console.log('\n📋 === 6. בדיקת CSS rules ===');
    
    // בדוק rules ספציפיים
    const importantSelectors = [
        '.unified-log-display .btn',
        '.log-display-controls .btn',
        '.btn-sm',
        '.btn-outline-primary'
    ];
    
    importantSelectors.forEach(selector => {
        console.log(`\n   🎯 ${selector}:`);
        
        // בדוק אם יש elements
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`      📍 ${elements.length} elements נמצאו`);
            
            // בדוק CSS rules
            let rulesFound = 0;
            for (let i = 0; i < document.styleSheets.length; i++) {
                try {
                    const sheet = document.styleSheets[i];
                    const rules = sheet.cssRules || sheet.rules;
                    
                    if (rules) {
                        for (let j = 0; j < rules.length; j++) {
                            const rule = rules[j];
                            if (rule.selectorText && rule.selectorText.includes(selector.replace('.', ''))) {
                                rulesFound++;
                                console.log(`      📁 ${sheet.href || 'inline'}`);
                                console.log(`         ${rule.selectorText}`);
                                console.log(`         ${rule.style.cssText}`);
                            }
                        }
                    }
                } catch (e) {
                    // Skip cross-origin
                }
            }
            
            if (rulesFound === 0) {
                console.log(`      ⚠️ לא נמצאו CSS rules`);
            }
        } else {
            console.log(`      ❌ לא נמצאו elements`);
        }
    });
    
    // === 7. סיכום ===
    console.log('\n📊 === 7. סיכום ===');
    
    const issues = [];
    
    // בדוק בעיות עיקריות
    if (typeof window.UnifiedLogDisplay === 'undefined') {
        issues.push('UnifiedLogDisplay לא נטען');
    }
    
    if (!document.querySelector('link[href*="unified-log-display"]')) {
        issues.push('קובץ CSS של הלוגים לא נטען');
    }
    
    if (!document.querySelector('link[href*="bootstrap"]')) {
        issues.push('Bootstrap לא נטען');
    }
    
    const cssVarsMissing = cssVars.filter(v => !computed.getPropertyValue(v));
    if (cssVarsMissing.length > 0) {
        issues.push(`משתני CSS חסרים: ${cssVarsMissing.join(', ')}`);
    }
    
    if (totalButtons === 0) {
        issues.push('לא נמצאו כפתורים בלוג');
    }
    
    if (issues.length > 0) {
        console.log('   ⚠️ בעיות שנמצאו:');
        issues.forEach(issue => console.log(`      - ${issue}`));
    } else {
        console.log('   ✅ הכל נראה תקין!');
    }
    
    console.log('\n💡 טיפים:');
    console.log('   - אם כפתורים לא נראים, בדוק את משתני ה-CSS');
    console.log('   - אם יש בעיות גודל, בדוק את Bootstrap');
    console.log('   - אם המערכת לא נטענה, רענן את הדף');
    console.log('   - השתמש ב: quickDebug() לבדיקה מהירה');
    
    console.log('\n✅ בדיקה הושלמה!');
}

// פונקציה לבדיקה מהירה
function quickDebug() {
    console.clear();
    console.log('🔍 בדיקה מהירה של כפתורי הלוג...\n');
    
    const buttons = document.querySelectorAll('.unified-log-display .btn, .log-display-controls .btn');
    console.log(`📊 נמצאו ${buttons.length} כפתורים`);
    
    if (buttons.length === 0) {
        console.log('❌ לא נמצאו כפתורים!');
        console.log('💡 נסה: debugLogStyles() לבדיקה מקיפה');
        return;
    }
    
    buttons.forEach((btn, i) => {
        const style = window.getComputedStyle(btn);
        console.log(`\n🔘 כפתור ${i+1}: "${btn.textContent.trim()}"`);
        console.log(`   📏 ${style.width} x ${style.height}`);
        console.log(`   🎨 ${style.backgroundColor}`);
        console.log(`   📦 ${style.padding}`);
        
        const issues = [];
        if (style.width === '0px') issues.push('רוחב 0');
        if (style.height === '0px') issues.push('גובה 0');
        if (style.display === 'none') issues.push('מוסתר');
        
        if (issues.length > 0) {
            console.log(`   ⚠️ ${issues.join(', ')}`);
        } else {
            console.log(`   ✅ תקין`);
        }
    });
}

// הפעל בדיקה מהירה
quickDebug();

// הוסף לגלובל
window.debugLogStyles = debugLogStyles;
window.quickDebug = quickDebug;

console.log('\n🔧 פונקציות זמינות:');
console.log('   debugLogStyles() - בדיקה מקיפה');
console.log('   quickDebug() - בדיקה מהירה');
