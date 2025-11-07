// בדיקת CSS rules של section-header - העתק והדבק בקונסולה
console.log('=== בדיקת CSS rules של section-header ===');

const allStyles = document.styleSheets;
let foundRules = [];

for (let i = 0; i < allStyles.length; i++) {
    try {
        const rules = allStyles[i].cssRules || allStyles[i].rules;
        if (rules) {
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].selectorText && rules[j].selectorText.includes('.section-header')) {
                    foundRules.push({
                        stylesheet: i,
                        selector: rules[j].selectorText,
                        style: rules[j].style.cssText,
                        background: rules[j].style.backgroundColor,
                        color: rules[j].style.color
                    });
                }
            }
        }
    } catch (e) {
        console.log(`לא ניתן לגשת ל-stylesheet ${i}:`, e.message);
    }
}

console.log('=== כל ה-CSS rules של section-header ===');
foundRules.forEach((rule, index) => {
    console.log(`Rule ${index + 1}:`);
    console.log(`  Selector: ${rule.selector}`);
    console.log(`  Background: ${rule.background}`);
    console.log(`  Color: ${rule.color}`);
    console.log(`  Full Style: ${rule.style}`);
    console.log('---');
});

// בדיקה של specificity
console.log('=== בדיקת CSS specificity ===');
const header = document.querySelector('.section-header');
if (header) {
    const headerStyle = getComputedStyle(header);
    console.log('Computed background:', headerStyle.backgroundColor);
    console.log('Computed color:', headerStyle.color);
    
    // בדיקה של CSS cascade
    console.log('=== בדיקת CSS cascade ===');
    const testElement = document.createElement('div');
    testElement.className = 'section-header';
    testElement.style.cssText = 'background: var(--current-entity-color-light) !important; color: var(--current-entity-color-dark) !important;';
    document.body.appendChild(testElement);
    
    const testStyle = getComputedStyle(testElement);
    console.log('With !important background:', testStyle.backgroundColor);
    console.log('With !important color:', testStyle.color);
    
    document.body.removeChild(testElement);
}

console.log('=== סיום בדיקה ===');



