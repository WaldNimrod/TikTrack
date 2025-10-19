/**
 * כפיית רענון מטמון לכפתור העתק לוג מפורט
 * Force cache refresh for Copy Detailed Log button
 */

console.clear();
console.log('%c🔄 ===== כפיית רענון מטמון =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// בדיקת קובץ CSS
console.log('\n%c📁 בדיקת קובץ CSS:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

fetch('/styles-new/06-components/_unified-log-display.css?v=20251001_2')
  .then(response => response.text())
  .then(css => {
    if (css.includes('סגנון כללי לכפתורי העתק לוג מפורט')) {
      console.log('%c✅ קובץ CSS נטען נכון עם הכלל שלנו', 'color: #27ae60; font-weight: bold;');
    } else {
      console.log('%c❌ קובץ CSS לא מכיל את הכלל שלנו', 'color: #e74c3c; font-weight: bold;');
    }
  })
  .catch(error => {
    console.log('%c❌ שגיאה בטעינת קובץ CSS:', 'color: #e74c3c; font-weight: bold;');
    console.error(error);
  });

// כפיית רענון מטמון
console.log('\n%c🔄 כפיית רענון מטמון:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

// רענון דף
setTimeout(() => {
  console.log('%c🔄 מרענן את הדף...', 'color: #f39c12; font-weight: bold;');
  window.location.reload(true);
}, 2000);

console.log('\n%c💡 אם הבעיה נמשכת, נסה:', 'color: #3498db; font-weight: bold;');
console.log('%c1. Ctrl+F5 (רענון מלא)', 'color: #95a5a6; font-weight: bold;');
console.log('%c2. פתח DevTools → Network → Disable cache', 'color: #95a5a6; font-weight: bold;');
console.log('%c3. נקה מטמון הדפדפן', 'color: #95a5a6; font-weight: bold;');

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

