/**
 * בדיקת תיקון ספציפיות
 * Specificity Fix Test
 */

console.clear();
console.log('%c🎯 ===== בדיקת תיקון ספציפיות =====', 'font-size: 20px; font-weight: bold; color: #e74c3c; background: linear-gradient(90deg, #e74c3c, #c0392b); color: white; padding: 15px; border-radius: 10px;');

// חיפוש הכפתור
const copyButton = document.querySelector('button[title*="העתק לוג מפורט"]');

if (!copyButton) {
  console.log('%c❌ לא נמצא כפתור העתק לוג מפורט', 'color: #e74c3c; font-weight: bold;');
} else {
  console.log('%c✅ נמצא כפתור העתק לוג מפורט', 'color: #27ae60; font-weight: bold;');
  
  // מידע על הכפתור
  console.log(`%cקלייסים: "${copyButton.className}"`, 'color: #7f8c8d; font-family: monospace;');
  
  // בדיקת סגנונות מחושבים
  const style = window.getComputedStyle(copyButton);
  const bgColor = style.backgroundColor;
  const borderColor = style.borderColor;
  const color = style.color;
  
  console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  console.log(`%cגבול: ${borderColor}`, 'color: #95a5a6; font-family: monospace;');
  console.log(`%cצבע טקסט: ${color}`, `color: ${color}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
  
  // בדיקת שקיפות
  if (bgColor.includes('rgba(0, 0, 0, 0)')) {
    console.log(`%c❌ רקע עדיין שקוף!`, 'color: #e74c3c; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c✅ רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
  }
  
  // בדיקת ספציפיות
  console.log('\n%c🔍 בדיקת ספציפיות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  
  // נסה לזהות איזה כלל פעיל
  const testElement = document.createElement('button');
  testElement.className = 'btn btn-outline-secondary';
  testElement.style.display = 'none';
  document.body.appendChild(testElement);
  
  const testStyle = window.getComputedStyle(testElement);
  console.log(`%cBootstrap רקע: ${testStyle.backgroundColor}`, 'color: #007bff; font-family: monospace;');
  
  document.body.removeChild(testElement);
  
  // בדיקת CSS Variables
  console.log('\n%c🎨 CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  const rootStyle = getComputedStyle(document.documentElement);
  console.log(`%c--primary-color: ${rootStyle.getPropertyValue('--primary-color')}`, 'color: #3498db;');
}

// בדיקת קבצי CSS שנטענו
console.log('\n%c📁 קבצי CSS שנטענו:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
cssLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.includes('unified-log-display')) {
    console.log(`%c✅ ${href}`, 'color: #27ae60; font-weight: bold;');
  }
});

// סיכום
console.log('\n%c🏆 ===== סיכום תיקון ספציפיות =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (copyButton) {
  const style = window.getComputedStyle(copyButton);
  const bgColor = style.backgroundColor;
  
  if (bgColor.includes('rgba(0, 0, 0, 0)')) {
    console.log(`%c❌ הכפתור עדיין שקוף!`, 'color: #e74c3c; font-weight: bold;');
    console.log(`%c💡 נסה Ctrl+F5 לרענון מלא של הדפדפן`, 'color: #3498db; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c🎉 SUCCESS! הכפתור עם רקע לבן מלא!`, 'color: #27ae60; font-weight: bold; background: rgba(39, 174, 96, 0.2); padding: 8px; border-radius: 6px;');
  } else {
    console.log(`%c❓ הכפתור עם רקע אחר`, 'color: #95a5a6; font-weight: bold;');
  }
}

console.log('\n%c🚀 בדיקת תיקון ספציפיות הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

