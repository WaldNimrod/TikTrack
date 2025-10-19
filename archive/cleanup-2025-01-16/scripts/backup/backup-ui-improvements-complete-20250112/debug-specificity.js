/**
 * בדיקת ספציפיות CSS
 * CSS Specificity Debug
 */

console.clear();
console.log('%c🔍 ===== בדיקת ספציפיות CSS =====', 'font-size: 20px; font-weight: bold; color: #e74c3c; background: linear-gradient(90deg, #e74c3c, #c0392b); color: white; padding: 15px; border-radius: 10px;');

// חיפוש הכפתור
const copyButton = document.querySelector('button[title*="העתק לוג מפורט"]');

if (!copyButton) {
  console.log('%c❌ לא נמצא כפתור העתק לוג מפורט', 'color: #e74c3c; font-weight: bold;');
} else {
  console.log('%c✅ נמצא כפתור העתק לוג מפורט', 'color: #27ae60; font-weight: bold;');
  
  // בדיקת כללי CSS פעילים
  console.log('\n%c🎨 כללי CSS פעילים:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  
  // בדיקת סגנונות מחושבים
  const computedStyle = window.getComputedStyle(copyButton);
  console.log(`%cרקע מחושב: ${computedStyle.backgroundColor}`, 'color: #7f8c8d; font-family: monospace;');
  console.log(`%cגבול מחושב: ${computedStyle.borderColor}`, 'color: #7f8c8d; font-family: monospace;');
  console.log(`%cצבע מחושב: ${computedStyle.color}`, 'color: #7f8c8d; font-family: monospace;');
  
  // בדיקת CSS Variables
  console.log('\n%c🎨 CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  const rootStyle = getComputedStyle(document.documentElement);
  const primaryColor = rootStyle.getPropertyValue('--primary-color');
  console.log(`%c--primary-color: ${primaryColor}`, 'color: #3498db;');
  
  // בדיקת Bootstrap
  console.log('\n%c🔵 בדיקת Bootstrap:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  if (copyButton.classList.contains('btn-outline-secondary')) {
    console.log(`%c✅ הכפתור מכיל btn-outline-secondary`, 'color: #27ae60;');
  }
  if (copyButton.classList.contains('btn')) {
    console.log(`%c✅ הכפתור מכיל btn`, 'color: #27ae60;');
  }
  if (copyButton.classList.contains('btn-sm')) {
    console.log(`%c✅ הכפתור מכיל btn-sm`, 'color: #27ae60;');
  }
  
  // בדיקת קלייסים נוספים
  console.log('\n%c🏷️ כל הקלייסים:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  console.log(`%c"${copyButton.className}"`, 'color: #7f8c8d; font-family: monospace; background: rgba(127, 140, 141, 0.1); padding: 8px; border-radius: 4px;');
  
  // בדיקת קבצי CSS שנטענו
  console.log('\n%c📁 קבצי CSS שנטענו:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  let bootstrapLoaded = false;
  let ourCssLoaded = false;
  
  cssLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes('bootstrap')) {
      console.log(`%c🔵 Bootstrap: ${href}`, 'color: #007bff;');
      bootstrapLoaded = true;
    }
    if (href && href.includes('unified-log-display')) {
      console.log(`%c✅ שלנו: ${href}`, 'color: #27ae60;');
      ourCssLoaded = true;
    }
  });
  
  // סיכום
  console.log('\n%c🏆 ===== סיכום ספציפיות =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');
  
  if (bootstrapLoaded && ourCssLoaded) {
    console.log(`%c✅ Bootstrap וקובץ שלנו נטענו`, 'color: #27ae60;');
  } else {
    console.log(`%c⚠️ בעיה בטעינת קבצי CSS`, 'color: #f39c12;');
  }
  
  const bgColor = computedStyle.backgroundColor;
  if (bgColor.includes('rgba(0, 0, 0, 0)')) {
    console.log(`%c❌ רקע שקוף - Bootstrap דורס!`, 'color: #e74c3c; font-weight: bold;');
  } else if (bgColor.includes('rgba(255, 255, 255') || bgColor.includes('white')) {
    console.log(`%c✅ רקע לבן - הכלל שלנו עובד!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
  }
}

console.log('\n%c🚀 בדיקת ספציפיות הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

