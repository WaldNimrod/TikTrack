/**
 * בדיקת כפתור העתק לוג מפורט - איזה מחלקה באמת משפיעה
 * Check Copy Detailed Log button - which class really affects it
 */

console.clear();
console.log('%c🔍 ===== בדיקת כפתור העתק לוג מפורט =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

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
    const padding = computedStyle.padding;
    const borderRadius = computedStyle.borderRadius;
    
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
    console.log(`%cגבול: ${border}`, 'color: #95a5a6; font-family: monospace;');
    console.log(`%cצבע טקסט: ${color}`, `color: ${color}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
    console.log(`%cריפוד: ${padding}`, 'color: #95a5a6; font-family: monospace;');
    console.log(`%cפינות מעוגלות: ${borderRadius}`, 'color: #95a5a6; font-family: monospace;');
    
    // בדיקת שקיפות
    if (bgColor.includes('rgba') && bgColor.includes('0')) {
      console.log(`%c⚠️ רקע שקוף! (${bgColor})`, 'color: #f39c12; font-weight: bold;');
    } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
      console.log(`%c✅ רקע לבן מלא`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
    }
    
    // בדיקת CSS Variables
    console.log(`\n%c🎨 CSS Variables רלוונטיים:`, 'color: #2c3e50; font-weight: bold;');
    const cssVars = [
      '--primary-color',
      '--primary-color-light',
      '--primary-color-dark',
      '--apple-gray-2',
      '--apple-gray-7',
      '--apple-gray-4'
    ];
    
    cssVars.forEach(varName => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (value) {
        console.log(`%c${varName}: ${value}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
      }
    });
    
    // בדיקת כללי CSS שפועלים על הכפתור
    console.log(`\n%c📋 כללי CSS שפועלים:`, 'color: #2c3e50; font-weight: bold;');
    
    // בדיקת כללי Bootstrap
    if (button.classList.contains('btn-outline-secondary')) {
      console.log(`%c🔵 Bootstrap: .btn-outline-secondary`, 'color: #007bff; font-weight: bold;');
    }
    if (button.classList.contains('btn')) {
      console.log(`%c🔵 Bootstrap: .btn`, 'color: #007bff; font-weight: bold;');
    }
    
    // בדיקת כללי מותאמים אישית
    const customClasses = button.className.split(' ').filter(cls => 
      !cls.startsWith('btn') && cls !== ''
    );
    
    if (customClasses.length > 0) {
      console.log(`%c🎨 כללים מותאמים אישית:`, 'color: #e67e22; font-weight: bold;');
      customClasses.forEach(cls => {
        console.log(`%c  - .${cls}`, 'color: #e67e22; font-family: monospace; margin-left: 20px;');
      });
    }
    
    // בדיקת סגנונות inline
    if (button.style.cssText) {
      console.log(`%c📝 סגנונות inline:`, 'color: #8e44ad; font-weight: bold;');
      console.log(`%c  ${button.style.cssText}`, 'color: #8e44ad; font-family: monospace; margin-left: 20px;');
    }
  });
}

// בדיקת CSS files שנטענו
console.log('\n%c📁 קבצי CSS שנטענו:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
cssLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.includes('unified-log-display')) {
    console.log(`%c✅ ${href}`, 'color: #27ae60; font-weight: bold;');
  } else if (href && (href.includes('bootstrap') || href.includes('btn'))) {
    console.log(`%c🔵 ${href}`, 'color: #007bff; font-weight: bold;');
  } else if (href) {
    console.log(`%c📄 ${href}`, 'color: #95a5a6; font-weight: bold;');
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
    console.log(`%c💡 צריך לתקן את המחלקה שמשפיעה עליו`, 'color: #3498db; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c✅ כפתור העתק לוג מפורט עם רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❓ כפתור העתק לוג מפורט עם רקע אחר`, 'color: #95a5a6; font-weight: bold;');
  }
} else {
  console.log(`%c❌ לא נמצאו כפתורי העתק לוג מפורט`, 'color: #e74c3c; font-weight: bold;');
}

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

