// בדיקת רקע הכפתור - העתק והדבק בקונסולה
console.log('=== בדיקת רקע הכפתור ===');

const addButton = document.querySelector('button[data-button-type="ADD"]');
if (addButton) {
    const computedStyle = getComputedStyle(addButton);
    console.log('=== סגנונות מחושבים ===');
    console.log('background-color:', computedStyle.backgroundColor);
    console.log('background:', computedStyle.background);
    console.log('background-image:', computedStyle.backgroundImage);
    console.log('background-size:', computedStyle.backgroundSize);
    console.log('background-position:', computedStyle.backgroundPosition);
    console.log('background-repeat:', computedStyle.backgroundRepeat);
    
    // בדיקת CSS rules
    console.log('=== בדיקת CSS rules ===');
    const allStyles = document.styleSheets;
    let foundRules = [];
    
    for (let i = 0; i < allStyles.length; i++) {
        try {
            const rules = allStyles[i].cssRules || allStyles[i].rules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && (
                        rule.selectorText.includes('.btn') || 
                        rule.selectorText.includes('button') ||
                        rule.selectorText.includes('[data-button-type="ADD"]') ||
                        rule.selectorText.includes('[data-entity-type="ticker"]')
                    )) {
                        if (rule.style.backgroundColor || rule.style.background) {
                            foundRules.push({
                                stylesheet: i,
                                selector: rule.selectorText,
                                backgroundColor: rule.style.backgroundColor,
                                background: rule.style.background,
                                fullStyle: rule.style.cssText
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.log(`לא ניתן לגשת ל-stylesheet ${i}:`, e.message);
        }
    }
    
    console.log('=== כל ה-CSS rules של רקע כפתורים ===');
    foundRules.forEach((rule, index) => {
        console.log(`Rule ${index + 1}:`);
        console.log(`  Selector: ${rule.selector}`);
        console.log(`  Background Color: ${rule.backgroundColor}`);
        console.log(`  Background: ${rule.background}`);
        console.log(`  Full Style: ${rule.fullStyle}`);
        console.log('---');
    });
    
    // בדיקת משתני CSS
    console.log('=== בדיקת משתני CSS ===');
    const rootStyle = getComputedStyle(document.documentElement);
    console.log('--current-entity-color:', rootStyle.getPropertyValue('--current-entity-color'));
    console.log('--current-entity-color-light:', rootStyle.getPropertyValue('--current-entity-color-light'));
    console.log('--entity-ticker-color:', rootStyle.getPropertyValue('--entity-ticker-color'));
    console.log('--entity-ticker-color-light:', rootStyle.getPropertyValue('--entity-ticker-color-light'));
    
    // בדיקת inline styles
    console.log('=== בדיקת inline styles ===');
    console.log('style attribute:', addButton.getAttribute('style'));
    
    // בדיקת classes
    console.log('=== בדיקת classes ===');
    console.log('classList:', addButton.classList.toString());
    
} else {
    console.log('❌ לא נמצא כפתור הוספה');
}

console.log('=== סיום בדיקה ===');
