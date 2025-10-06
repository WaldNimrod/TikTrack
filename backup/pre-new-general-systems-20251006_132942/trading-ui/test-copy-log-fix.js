/**
 * בדיקת תיקון כפתור העתק לוג מפורט
 * Test Copy Detailed Log button fix
 */

console.clear();
console.log('%c🔍 ===== בדיקת תיקון כפתור העתק לוג מפורט =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// חיפוש כפתור העתק לוג מפורט
const copyLogButtons = document.querySelectorAll('button[title*="העתק"], button[title*="Copy"], .btn[title*="העתק"], .btn[title*="Copy"]');

if (copyLogButtons.length === 0) {
  console.log('%c❌ לא נמצאו כפתורי העתק לוג מפורט', 'color: #e74c3c; font-weight: bold;');
} else {
  copyLogButtons.forEach((button, index) => {
    console.log(`\n%c🔍 כפתור ${index + 1}:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');
    
    // מידע בסיסי
    const title = button.getAttribute('title') || button.textContent.trim();
    console.log(`%cכותרת: "${title}"`, 'color: #7f8c8d; font-family: monospace;');
    console.log(`%cקלייסים: "${button.className}"`, 'color: #7f8c8d; font-family: monospace;');
    
    // בדיקת סגנונות מחושבים
    const computedStyle = window.getComputedStyle(button);
    const bgColor = computedStyle.backgroundColor;
    const border = computedStyle.border;
    const color = computedStyle.color;
    
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
    console.log(`%cגבול: ${border}`, 'color: #95a5a6; font-family: monospace;');
    console.log(`%cצבע טקסט: ${color}`, `color: ${color}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
    
    // בדיקת שקיפות
    if (bgColor.includes('rgba') && bgColor.includes('0')) {
      console.log(`%c⚠️ רקע שקוף! (${bgColor})`, 'color: #f39c12; font-weight: bold;');
    } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
      console.log(`%c✅ רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
    }
  });
}

// בדיקת CSS Variables
console.log('\n%c🎨 CSS Variables רלוונטיים:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
const cssVars = [
  '--apple-gray-7',
  '--apple-gray-4',
  '--apple-gray-2',
  '--apple-gray-11'
];

cssVars.forEach(varName => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (value) {
    console.log(`%c${varName}: ${value}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
  } else {
    console.log(`%c${varName}: לא מוגדר`, 'color: #95a5a6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
  }
});

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (copyLogButtons.length > 0) {
  const firstButton = copyLogButtons[0];
  const firstButtonStyle = window.getComputedStyle(firstButton);
  const bgColor = firstButtonStyle.backgroundColor;
  
  if (bgColor.includes('rgba') && bgColor.includes('0')) {
    console.log(`%c⚠️ כפתור העתק לוג מפורט עדיין שקוף!`, 'color: #f39c12; font-weight: bold;');
    console.log(`%c💡 צריך לחזק עוד יותר את הכלל`, 'color: #3498db; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c✅ כפתור העתק לוג מפורט עם רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❓ כפתור העתק לוג מפורט עם רקע אחר`, 'color: #95a5a6; font-weight: bold;');
  }
} else {
  console.log(`%c❌ לא נמצאו כפתורי העתק לוג מפורט`, 'color: #e74c3c; font-weight: bold;');
}

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

