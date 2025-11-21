// TikTrack Badge Styles Comparison Tool
// קוד לבדיקת סגנונות badges בעמוד

console.log('🔍 TikTrack Badge Styles Comparison Tool');
console.log('=====================================');

// פונקציה לבדיקת סגנונות badge
function analyzeBadgeStyles() {
    const badgeSelectors = [
        '.status-badge',
        '.badge-long', 
        '.badge-short',
        '.badge-type',
        '.priority-badge',
        '.triggered-badge',
        '.development-badge'
    ];
    
    const results = {};
    
    badgeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`\n📊 ${selector}: ${elements.length} elements found`);
        
        if (elements.length > 0) {
            const firstElement = elements[0];
            const computedStyle = window.getComputedStyle(firstElement);
            
            const styles = {
                display: computedStyle.display,
                padding: computedStyle.padding,
                borderRadius: computedStyle.borderRadius,
                fontSize: computedStyle.fontSize,
                fontWeight: computedStyle.fontWeight,
                textAlign: computedStyle.textAlign,
                border: computedStyle.border,
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                position: computedStyle.position,
                overflow: computedStyle.overflow
            };
            
            results[selector] = styles;
            
            console.log(`   Display: ${styles.display}`);
            console.log(`   Padding: ${styles.padding}`);
            console.log(`   Border Radius: ${styles.borderRadius}`);
            console.log(`   Font Size: ${styles.fontSize}`);
            console.log(`   Font Weight: ${styles.fontWeight}`);
            console.log(`   Text Align: ${styles.textAlign}`);
            console.log(`   Border: ${styles.border}`);
            console.log(`   Background: ${styles.backgroundColor}`);
            console.log(`   Color: ${styles.color}`);
        }
    });
    
    return results;
}

// פונקציה להשוואת סגנונות
function compareBadgeStyles() {
    const results = analyzeBadgeStyles();
    
    console.log('\n🔄 Badge Styles Comparison:');
    console.log('============================');
    
    const baseStyles = results['.status-badge'];
    if (!baseStyles) {
        console.log('❌ No status-badge found as reference');
        return;
    }
    
    Object.keys(results).forEach(selector => {
        if (selector === '.status-badge') return;
        
        const styles = results[selector];
        const differences = [];
        
        Object.keys(baseStyles).forEach(property => {
            if (baseStyles[property] !== styles[property]) {
                differences.push({
                    property,
                    base: baseStyles[property],
                    current: styles[property]
                });
            }
        });
        
        if (differences.length > 0) {
            console.log(`\n⚠️  ${selector} has differences:`);
            differences.forEach(diff => {
                console.log(`   ${diff.property}:`);
                console.log(`     Base: ${diff.base}`);
                console.log(`     Current: ${diff.current}`);
            });
        } else {
            console.log(`\n✅ ${selector} matches base styles`);
        }
    });
}

// פונקציה לבדיקת CSS rules
function checkCSSRules() {
    console.log('\n📋 CSS Rules Analysis:');
    console.log('======================');
    
    const badgeSelectors = [
        '.status-badge',
        '.badge-long', 
        '.badge-short',
        '.badge-type',
        '.priority-badge',
        '.triggered-badge',
        '.development-badge'
    ];
    
    badgeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            const firstElement = elements[0];
            const rules = [];
            
            // בדיקת CSS rules
            for (let i = 0; i < document.styleSheets.length; i++) {
                try {
                    const sheet = document.styleSheets[i];
                    if (sheet.cssRules) {
                        for (let j = 0; j < sheet.cssRules.length; j++) {
                            const rule = sheet.cssRules[j];
                            if (rule.selectorText && rule.selectorText.includes(selector.replace('.', ''))) {
                                rules.push({
                                    selector: rule.selectorText,
                                    styles: rule.style.cssText
                                });
                            }
                        }
                    }
                } catch (e) {
                    // Skip cross-origin stylesheets
                }
            }
            
            console.log(`\n${selector} CSS Rules:`);
            if (rules.length > 0) {
                rules.forEach(rule => {
                    console.log(`   ${rule.selector}: ${rule.styles}`);
                });
            } else {
                console.log('   No specific CSS rules found');
            }
        }
    });
}

// פונקציה לבדיקת גודל ורווח
function checkBadgeDimensions() {
    console.log('\n📏 Badge Dimensions Analysis:');
    console.log('=============================');
    
    const badgeSelectors = [
        '.status-badge',
        '.badge-long', 
        '.badge-short',
        '.badge-type',
        '.priority-badge',
        '.triggered-badge',
        '.development-badge'
    ];
    
    badgeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            const firstElement = elements[0];
            const rect = firstElement.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(firstElement);
            
            console.log(`\n${selector}:`);
            console.log(`   Width: ${rect.width}px`);
            console.log(`   Height: ${rect.height}px`);
            console.log(`   Padding: ${computedStyle.padding}`);
            console.log(`   Margin: ${computedStyle.margin}`);
            console.log(`   Border: ${computedStyle.border}`);
            console.log(`   Box Model: ${computedStyle.boxSizing}`);
        }
    });
}

// פונקציה לבדיקת צבעים
function checkBadgeColors() {
    console.log('\n🎨 Badge Colors Analysis:');
    console.log('==========================');
    
    const badgeSelectors = [
        '.status-badge',
        '.badge-long', 
        '.badge-short',
        '.badge-type',
        '.priority-badge',
        '.triggered-badge',
        '.development-badge'
    ];
    
    badgeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            const firstElement = elements[0];
            const computedStyle = window.getComputedStyle(firstElement);
            
            console.log(`\n${selector}:`);
            console.log(`   Background: ${computedStyle.backgroundColor}`);
            console.log(`   Color: ${computedStyle.color}`);
            console.log(`   Border Color: ${computedStyle.borderColor}`);
            
            // בדיקת CSS variables
            const bgColor = computedStyle.getPropertyValue('--current-entity-color');
            const textColor = computedStyle.getPropertyValue('--user-status-positive-color');
            if (bgColor) console.log(`   CSS Var Background: ${bgColor}`);
            if (textColor) console.log(`   CSS Var Text: ${textColor}`);
        }
    });
}

// פונקציה ראשית
function runBadgeAnalysis() {
    console.log('🚀 Starting Badge Analysis...');
    
    analyzeBadgeStyles();
    compareBadgeStyles();
    checkCSSRules();
    checkBadgeDimensions();
    checkBadgeColors();
    
    console.log('\n✅ Badge Analysis Complete!');
    console.log('\n📝 Available Functions:');
    console.log('  analyzeBadgeStyles()  - ניתוח סגנונות badges');
    console.log('  compareBadgeStyles() - השוואת סגנונות');
    console.log('  checkCSSRules()      - בדיקת CSS rules');
    console.log('  checkBadgeDimensions() - בדיקת גדלים');
    console.log('  checkBadgeColors()   - בדיקת צבעים');
    console.log('  runBadgeAnalysis()   - הרצת כל הבדיקות');
}

// הרצה אוטומטית
runBadgeAnalysis();

