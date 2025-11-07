// בדיקה מהירה - העתק והדבק בקונסולה
console.log('=== בדיקה מהירה ===');

// בדיקת משתנים
const style = getComputedStyle(document.documentElement);
console.log('current-entity-color:', style.getPropertyValue('--current-entity-color'));
console.log('current-entity-color-light:', style.getPropertyValue('--current-entity-color-light'));
console.log('current-entity-color-dark:', style.getPropertyValue('--current-entity-color-dark'));

// בדיקת section-header
const header = document.querySelector('.section-header');
if (header) {
    const headerStyle = getComputedStyle(header);
    console.log('header background:', headerStyle.backgroundColor);
    console.log('header color:', headerStyle.color);
    console.log('header border:', headerStyle.borderBottom);
} else {
    console.log('לא נמצא section-header');
}

// בדיקת class של העמוד
console.log('page class:', document.body.className);