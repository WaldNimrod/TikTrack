// סקריפט לבדיקת דריסות בכפתורים - העתק והדבק בקונסולה
console.log('=== בדיקת דריסות בכפתורים ===');

// מצא את הכפתור "הוסף טיקר"
const addButton = document.querySelector('button[data-button-type="ADD"]');
if (!addButton) {
    console.log('❌ לא נמצא כפתור הוספה');
} else {
    console.log('✅ נמצא כפתור הוספה:', addButton);
    
    // בדיקת סגנונות מחושבים
    const computedStyle = getComputedStyle(addButton);
    console.log('=== סגנונות מחושבים ===');
    console.log('background-color:', computedStyle.backgroundColor);
    console.log('color:', computedStyle.color);
    console.log('border-color:', computedStyle.borderColor);
    console.log('border-style:', computedStyle.borderStyle);
    console.log('border-width:', computedStyle.borderWidth);
    
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
                        rule.selectorText.includes('[data-button-type="ADD"]')
                    )) {
                        foundRules.push({
                            stylesheet: i,
                            selector: rule.selectorText,
                            background: rule.style.backgroundColor,
                            color: rule.style.color,
                            borderColor: rule.style.borderColor,
                            fullStyle: rule.style.cssText
                        });
                    }
                }
            }
        } catch (e) {
            console.log(`לא ניתן לגשת ל-stylesheet ${i}:`, e.message);
        }
    }
    
    console.log('=== כל ה-CSS rules של כפתורים ===');
    foundRules.forEach((rule, index) => {
        console.log(`Rule ${index + 1}:`);
        console.log(`  Selector: ${rule.selector}`);
        console.log(`  Background: ${rule.background}`);
        console.log(`  Color: ${rule.color}`);
        console.log(`  Border: ${rule.borderColor}`);
        console.log(`  Full Style: ${rule.fullStyle}`);
        console.log('---');
    });
    
    // בדיקת משתני CSS
    console.log('=== בדיקת משתני CSS ===');
    const rootStyle = getComputedStyle(document.documentElement);
    console.log('--current-entity-color:', rootStyle.getPropertyValue('--current-entity-color'));
    console.log('--current-entity-color-light:', rootStyle.getPropertyValue('--current-entity-color-light'));
    console.log('--current-entity-color-dark:', rootStyle.getPropertyValue('--current-entity-color-dark'));
    console.log('--entity-ticker-color:', rootStyle.getPropertyValue('--entity-ticker-color'));
    console.log('--entity-ticker-color-light:', rootStyle.getPropertyValue('--entity-ticker-color-light'));
    console.log('--entity-ticker-color-dark:', rootStyle.getPropertyValue('--entity-ticker-color-dark'));
    
    // בדיקת inline styles
    console.log('=== בדיקת inline styles ===');
    console.log('style attribute:', addButton.getAttribute('style'));
    
    // בדיקת classes
    console.log('=== בדיקת classes ===');
    console.log('classList:', addButton.classList.toString());
    
    // בדיקת data attributes
    console.log('=== בדיקת data attributes ===');
    console.log('data-entity-type:', addButton.getAttribute('data-entity-type'));
    console.log('data-button-type:', addButton.getAttribute('data-button-type'));
    console.log('data-variant:', addButton.getAttribute('data-variant'));
}

console.log('=== סיום בדיקה ===');



