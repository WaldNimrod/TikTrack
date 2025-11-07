// קוד בדיקה ל-section-header - העתק והדבק בקונסולה
console.log('=== בדיקת section-header ===');

// 1. בדיקת קיום האלמנט
const sectionHeaders = document.querySelectorAll('.section-header');
console.log(`מספר section-header שנמצאו: ${sectionHeaders.length}`);

if (sectionHeaders.length > 0) {
    const firstHeader = sectionHeaders[0];
    console.log('הכותרת הראשונה:', firstHeader);
    
    // 2. בדיקת משתני CSS
    const computedStyle = getComputedStyle(document.documentElement);
    console.log('=== משתני CSS ===');
    console.log('--current-entity-color:', computedStyle.getPropertyValue('--current-entity-color'));
    console.log('--current-entity-color-light:', computedStyle.getPropertyValue('--current-entity-color-light'));
    console.log('--current-entity-color-dark:', computedStyle.getPropertyValue('--current-entity-color-dark'));
    
    // 3. בדיקת סגנונות מחושבים של הכותרת
    const headerStyle = getComputedStyle(firstHeader);
    console.log('=== סגנונות מחושבים של הכותרת ===');
    console.log('background:', headerStyle.backgroundColor);
    console.log('color:', headerStyle.color);
    console.log('border-bottom:', headerStyle.borderBottom);
    console.log('border-inline-start:', headerStyle.borderInlineStart);
    
    // 4. בדיקת class של העמוד
    const pageClass = document.body.className;
    console.log('=== class של העמוד ===');
    console.log('body class:', pageClass);
    
    // 5. בדיקת משתני ישות ספציפיים
    console.log('=== משתני ישות ספציפיים ===');
    console.log('--entity-ticker-color:', computedStyle.getPropertyValue('--entity-ticker-color'));
    console.log('--entity-ticker-color-light:', computedStyle.getPropertyValue('--entity-ticker-color-light'));
    console.log('--entity-ticker-color-dark:', computedStyle.getPropertyValue('--entity-ticker-color-dark'));
    
    // 6. בדיקת CSS rules
    console.log('=== CSS Rules ===');
    const allStyles = document.styleSheets;
    let foundRules = [];
    
    for (let i = 0; i < allStyles.length; i++) {
        try {
            const rules = allStyles[i].cssRules || allStyles[i].rules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].selectorText && rules[j].selectorText.includes('.section-header')) {
                        foundRules.push({
                            selector: rules[j].selectorText,
                            style: rules[j].style.cssText
                        });
                    }
                }
            }
        } catch (e) {
            console.log(`לא ניתן לגשת ל-stylesheet ${i}:`, e.message);
        }
    }
    
    console.log('CSS Rules שנמצאו:', foundRules);
    
    // 7. בדיקת היררכיית ה-classes
    console.log('=== היררכיית classes ===');
    console.log('section-header classes:', firstHeader.className);
    console.log('section-header parent:', firstHeader.parentElement);
    console.log('section-header parent classes:', firstHeader.parentElement?.className);
    
    // 8. בדיקת inline styles
    console.log('=== Inline styles ===');
    console.log('section-header style attribute:', firstHeader.getAttribute('style'));
    
} else {
    console.log('לא נמצאו section-header בעמוד!');
}

// 9. בדיקת כל המשתנים הקיימים
console.log('=== כל המשתנים הקיימים ===');
const allVars = [];
for (let i = 0; i < document.styleSheets.length; i++) {
    try {
        const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
        if (rules) {
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].type === CSSRule.STYLE_RULE) {
                    const cssText = rules[j].cssText;
                    const varMatches = cssText.match(/--[a-zA-Z-]+/g);
                    if (varMatches) {
                        allVars.push(...varMatches);
                    }
                }
            }
        }
    } catch (e) {
        // ignore
    }
}

const uniqueVars = [...new Set(allVars)].filter(v => v.includes('entity') || v.includes('current'));
console.log('משתנים רלוונטיים:', uniqueVars);

console.log('=== סיום בדיקה ===');



