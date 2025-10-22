// בדיקה מעמיקה של מערכת הצבעים - העתק והדבק בקונסולה
console.log('=== בדיקה מעמיקה של מערכת הצבעים ===');

// 1. בדיקת קיום הפונקציות
console.log('setCurrentEntityColorFromPage:', typeof window.setCurrentEntityColorFromPage);
console.log('lightenColor:', typeof window.lightenColor);
console.log('darkenColor:', typeof window.darkenColor);

// 2. בדיקת ENTITY_COLORS
console.log('ENTITY_COLORS:', window.ENTITY_COLORS);

// 3. בדיקת class של העמוד
const pageClass = document.body.className;
console.log('page class:', pageClass);

// 4. בדיקת entity type
const entityType = pageClass.replace('-page', '');
console.log('entity type:', entityType);

// 5. בדיקת צבע הישות
if (window.ENTITY_COLORS && window.ENTITY_COLORS[entityType]) {
    console.log('entity color:', window.ENTITY_COLORS[entityType]);
    
    // 6. בדיקת יצירת וריאנטים
    if (typeof window.lightenColor === 'function' && typeof window.darkenColor === 'function') {
        const entityColor = window.ENTITY_COLORS[entityType];
        const lightColor = window.lightenColor(entityColor, 10);
        const darkColor = window.darkenColor(entityColor, 20);
        
        console.log('calculated light color:', lightColor);
        console.log('calculated dark color:', darkColor);
        
        // 7. הגדרה ידנית של המשתנים
        document.documentElement.style.setProperty('--current-entity-color', entityColor);
        document.documentElement.style.setProperty('--current-entity-color-light', lightColor);
        document.documentElement.style.setProperty('--current-entity-color-dark', darkColor);
        
        console.log('✅ הגדרתי את המשתנים ידנית');
        
        // 8. בדיקה חוזרת
        const style = getComputedStyle(document.documentElement);
        console.log('אחרי הגדרה ידנית:');
        console.log('current-entity-color:', style.getPropertyValue('--current-entity-color'));
        console.log('current-entity-color-light:', style.getPropertyValue('--current-entity-color-light'));
        console.log('current-entity-color-dark:', style.getPropertyValue('--current-entity-color-dark'));
    }
} else {
    console.log('❌ לא נמצא צבע לישות:', entityType);
}

// 9. בדיקת section-header אחרי התיקון
const header = document.querySelector('.section-header');
if (header) {
    const headerStyle = getComputedStyle(header);
    console.log('header background אחרי התיקון:', headerStyle.backgroundColor);
    console.log('header color אחרי התיקון:', headerStyle.color);
}

console.log('=== סיום בדיקה ===');



