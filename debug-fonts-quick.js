// סקריפט בדיקת פונטים מהיר - TikTrack
// להריץ בקונסול הדפדפן בעמוד cache-test.html

console.clear();
console.log('🔍 בדיקת פונטים מהירה - TikTrack');

// בדיקת פונט body
const body = document.body;
const bodyStyles = window.getComputedStyle(body);
console.log('Body font-weight:', bodyStyles.fontWeight);

// בדיקת פונט paragraphs
const paragraphs = document.querySelectorAll('p');
if (paragraphs.length > 0) {
    const pStyles = window.getComputedStyle(paragraphs[0]);
    console.log('Paragraph font-weight:', pStyles.fontWeight);
}

// בדיקת פונט תפריט
const navElements = document.querySelectorAll('.navbar, .nav, .nav-link, .navbar-nav');
if (navElements.length > 0) {
    const navStyles = window.getComputedStyle(navElements[0]);
    console.log('Navigation font-weight:', navStyles.fontWeight);
}

// בדיקת פונט כפתורים
const buttons = document.querySelectorAll('.btn');
if (buttons.length > 0) {
    const btnStyles = window.getComputedStyle(buttons[0]);
    console.log('Button font-weight:', btnStyles.fontWeight);
}

// בדיקת CSS Variables
const root = document.documentElement;
const computedStyle = window.getComputedStyle(root);
console.log('--font-weight-medium:', computedStyle.getPropertyValue('--font-weight-medium'));

console.log('✅ בדיקה מהירה הושלמה!');
