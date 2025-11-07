// בדיקה מהירה של התיקון - העתק והדבק בקונסולה
console.log('=== בדיקת תיקון הצבעים ===');

// בדיקת משתני CSS
const rootStyle = getComputedStyle(document.documentElement);
console.log('--entity-ticker-color:', rootStyle.getPropertyValue('--entity-ticker-color'));
console.log('--entity-ticker-color-light:', rootStyle.getPropertyValue('--entity-ticker-color-light'));
console.log('--entity-ticker-color-dark:', rootStyle.getPropertyValue('--entity-ticker-color-dark'));

// בדיקת הכפתור
const addButton = document.querySelector('button[data-button-type="ADD"]');
if (addButton) {
    const computedStyle = getComputedStyle(addButton);
    console.log('=== סגנונות מחושבים של הכפתור ===');
    console.log('background-color:', computedStyle.backgroundColor);
    console.log('color:', computedStyle.color);
    console.log('border-color:', computedStyle.borderColor);
    
    // בדיקה אם הצבעים השתנו
    if (computedStyle.color === 'rgb(32, 201, 151)' || computedStyle.color === '#20c997') {
        console.log('✅ הצבעים תוקנו! הכפתור עכשיו ירוק');
    } else {
        console.log('❌ הצבעים עדיין לא תוקנו');
    }
} else {
    console.log('❌ לא נמצא כפתור הוספה');
}

console.log('=== סיום בדיקה ===');



