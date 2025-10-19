/**
 * בדיקת כותרות בפועל בדף
 * Test actual headers in the page
 */

console.log('%c🔍 בדיקת כותרות בפועל בדף', 'font-size: 18px; font-weight: bold; color: #2c3e50; background: rgba(44, 62, 80, 0.1); padding: 10px; border-radius: 8px;');

const headers = document.querySelectorAll('.section-header');
if (headers.length > 0) {
  console.group(`%cנמצאו ${headers.length} כותרות בדף:`, 'font-weight: bold; font-size: 16px;');
  
  headers.forEach((header, index) => {
    const computedStyle = window.getComputedStyle(header);
    const bgColor = computedStyle.backgroundColor;
    const borderColor = computedStyle.borderBottomColor;
    const borderWidth = computedStyle.borderBottomWidth;
    const classes = header.className;
    const text = header.textContent.trim().substring(0, 50);
    
    console.group(`%cכותרת ${index + 1}: "${text}"`, 'font-weight: bold;');
    console.log(`מחלקות: ${classes}`);
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;`);
    console.log(`%cגבול: ${borderColor} (${borderWidth})`, `background: ${borderColor}; color: white; padding: 4px 8px; border-radius: 4px;`);
    
    // בדיקת מחלקות entity
    const entityMatch = classes.match(/entity-(\w+)-(main|sub)-header/);
    if (entityMatch) {
      const [, entityType, headerType] = entityMatch;
      console.log(`%c✅ זוהתה כותרת ${headerType} של ישות: ${entityType}`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%cℹ️ כותרת רגילה (ללא entity)`, 'color: #3498db;');
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
} else {
  console.log('%c❌ לא נמצאו כותרות בדף הנוכחי', 'color: #e74c3c; font-size: 16px;');
}

// בדיקת unified-header
const unifiedHeader = document.getElementById('unified-header');
if (unifiedHeader) {
  const headerStyle = window.getComputedStyle(unifiedHeader);
  console.group('%c📋 unified-header:', 'font-weight: bold;');
  console.log(`%cרקע: ${headerStyle.backgroundColor}`, `background: ${headerStyle.backgroundColor}; color: #333; padding: 4px 8px; border-radius: 4px;`);
  console.log(`%cצל: ${headerStyle.boxShadow}`, 'background: rgba(0,0,0,0.1); color: white; padding: 4px 8px; border-radius: 4px;');
  console.groupEnd();
}

// בדיקת כפתורי העתק לוג
const copyButtons = document.querySelectorAll('.btn-outline-secondary');
if (copyButtons.length > 0) {
  console.group(`%c🔘 נמצאו ${copyButtons.length} כפתורי העתק לוג:`, 'font-weight: bold;');
  copyButtons.forEach((btn, index) => {
    const btnStyle = window.getComputedStyle(btn);
    console.log(`כפתור ${index + 1}: רקע ${btnStyle.backgroundColor}`);
  });
  console.groupEnd();
}

console.log('\n%c🎉 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #27ae60; background: rgba(39, 174, 96, 0.2); padding: 8px; border-radius: 6px;');

