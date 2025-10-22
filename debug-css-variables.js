// בדיקת משתני CSS ב-section-header - העתק והדבק בקונסולה
console.log('=== בדיקת משתני CSS ב-section-header ===');

const header = document.querySelector('.section-header');
if (header) {
    const headerStyle = getComputedStyle(header);
    
    console.log('=== סגנונות מחושבים של section-header ===');
    console.log('background:', headerStyle.backgroundColor);
    console.log('color:', headerStyle.color);
    console.log('border-bottom:', headerStyle.borderBottom);
    console.log('border-inline-start:', headerStyle.borderInlineStart);
    
    console.log('=== בדיקת משתני CSS ===');
    const rootStyle = getComputedStyle(document.documentElement);
    console.log('--current-entity-color:', rootStyle.getPropertyValue('--current-entity-color'));
    console.log('--current-entity-color-light:', rootStyle.getPropertyValue('--current-entity-color-light'));
    console.log('--current-entity-color-dark:', rootStyle.getPropertyValue('--current-entity-color-dark'));
    
    console.log('=== בדיקת CSS rules ===');
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
    
    console.log('=== בדיקת inline styles ===');
    console.log('section-header style attribute:', header.getAttribute('style'));
    
    console.log('=== בדיקת computed styles עם משתנים ===');
    console.log('background (computed):', headerStyle.backgroundColor);
    console.log('color (computed):', headerStyle.color);
    
    // בדיקה ידנית של המשתנים
    console.log('=== בדיקה ידנית של המשתנים ===');
    const testColor = rootStyle.getPropertyValue('--current-entity-color-light');
    const testDark = rootStyle.getPropertyValue('--current-entity-color-dark');
    
    if (testColor && testDark) {
        console.log('✅ המשתנים קיימים, בואו נבדוק למה הם לא נטענים');
        
        // בדיקה של CSS specificity
        console.log('=== בדיקת CSS specificity ===');
        const testElement = document.createElement('div');
        testElement.className = 'section-header';
        testElement.style.cssText = 'background: var(--current-entity-color-light); color: var(--current-entity-color-dark);';
        document.body.appendChild(testElement);
        
        const testStyle = getComputedStyle(testElement);
        console.log('test background:', testStyle.backgroundColor);
        console.log('test color:', testStyle.color);
        
        document.body.removeChild(testElement);
    }
    
} else {
    console.log('לא נמצא section-header');
}

console.log('=== סיום בדיקה ===');



