/**
 * בדיקת Bootstrap Override
 * Test Bootstrap Override
 */

console.clear();
console.log('%c🔍 ===== בדיקת Bootstrap Override =====', 'font-size: 20px; font-weight: bold; color: #e74c3c; background: linear-gradient(90deg, #e74c3c, #c0392b); color: white; padding: 15px; border-radius: 10px;');

// חיפוש הכפתור
const copyButton = document.querySelector('button[title*="העתק לוג מפורט"]');

if (!copyButton) {
  console.log('%c❌ לא נמצא כפתור העתק לוג מפורט', 'color: #e74c3c; font-weight: bold;');
} else {
  console.log('%c✅ נמצא כפתור העתק לוג מפורט', 'color: #27ae60; font-weight: bold;');
  
  // בדיקת סגנונות מחושבים
  const computedStyle = window.getComputedStyle(copyButton);
  console.log(`%cרקע מחושב: ${computedStyle.backgroundColor}`, 'color: #7f8c8d; font-family: monospace;');
  
  // בדיקת Bootstrap CSS
  console.log('\n%c🔵 בדיקת Bootstrap CSS:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  
  // נסה לזהות איזה כלל Bootstrap פעיל
  const testElement = document.createElement('button');
  testElement.className = 'btn btn-outline-secondary';
  document.body.appendChild(testElement);
  
  const testStyle = window.getComputedStyle(testElement);
  console.log(`%cBootstrap רקע: ${testStyle.backgroundColor}`, 'color: #007bff; font-family: monospace;');
  
  document.body.removeChild(testElement);
  
  // בדיקת CSS Variables
  console.log('\n%c🎨 CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  const rootStyle = getComputedStyle(document.documentElement);
  console.log(`%c--primary-color: ${rootStyle.getPropertyValue('--primary-color')}`, 'color: #3498db;');
  
  // נסה לעדכן CSS Variable ישירות
  console.log('\n%c🔧 ניסיון עדכון CSS Variable:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  
  // עדכון ישיר
  document.documentElement.style.setProperty('--test-color', 'red');
  console.log(`%c✅ הוספתי --test-color: red`, 'color: #27ae60;');
  
  // נסה לעדכן רקע ישירות
  copyButton.style.backgroundColor = 'yellow';
  console.log(`%c✅ הוספתי רקע צהוב ישירות`, 'color: #27ae60;');
  
  // בדיקה אחרי העדכון
  const newStyle = window.getComputedStyle(copyButton);
  console.log(`%cרקע אחרי העדכון: ${newStyle.backgroundColor}`, 'color: #7f8c8d; font-family: monospace;');
  
  // סיכום
  console.log('\n%c🏆 ===== סיכום Bootstrap Override =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');
  
  const bgColor = newStyle.backgroundColor;
  if (bgColor.includes('yellow')) {
    console.log(`%c✅ עדכון ישיר עבד!`, 'color: #27ae60; font-weight: bold;');
  } else if (bgColor.includes('rgba(0, 0, 0, 0)')) {
    console.log(`%c❌ עדיין שקוף - Bootstrap דורס חזק!`, 'color: #e74c3c; font-weight: bold;');
  } else {
    console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
  }
}

console.log('\n%c🚀 בדיקת Bootstrap Override הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

