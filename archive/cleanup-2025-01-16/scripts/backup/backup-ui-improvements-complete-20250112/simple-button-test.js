/**
 * בדיקה פשוטה של כפתור העתק לוג מפורט
 * Simple test for Copy Detailed Log button
 */

console.clear();
console.log('%c🔍 ===== בדיקה פשוטה של כפתור =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// חיפוש הכפתור הספציפי
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
    console.log(`%c⚠️ רקע שקוף!`, 'color: #f39c12; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c✅ רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
  }
  
  // בדיקת CSS Variables
  console.log('\n%c🎨 CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  const cssVars = ['--apple-gray-7', '--apple-gray-4', '--apple-gray-2', '--apple-gray-11'];
  
  cssVars.forEach(varName => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (value) {
      console.log(`%c${varName}: ${value}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
    } else {
      console.log(`%c${varName}: לא מוגדר`, 'color: #95a5a6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
    }
  });
}

// סיכום
console.log('\n%c🏆 ===== סיכום =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (copyButton) {
  const style = window.getComputedStyle(copyButton);
  const bgColor = style.backgroundColor;
  
  if (bgColor.includes('rgba(0, 0, 0, 0)')) {
    console.log(`%c⚠️ הכפתור עדיין שקוף!`, 'color: #f39c12; font-weight: bold;');
    console.log(`%c💡 נסה Ctrl+F5 לרענון מלא`, 'color: #3498db; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c✅ הכפתור עם רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❓ הכפתור עם רקע אחר`, 'color: #95a5a6; font-weight: bold;');
  }
}

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

