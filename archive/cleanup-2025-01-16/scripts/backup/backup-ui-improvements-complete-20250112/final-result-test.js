/**
 * בדיקת התוצאה הסופית של צבעי כותרות
 * Final result test for header colors
 */

console.clear();
console.log('%c🎨 ===== בדיקת התוצאה הסופית - צבעי כותרות =====', 'font-size: 20px; font-weight: bold; color: #2c3e50; background: linear-gradient(90deg, #3498db, #9b59b6); color: white; padding: 15px; border-radius: 10px;');

// ===== בדיקת כותרות בפועל =====
console.log('\n%c🔍 בדיקת כותרות בפועל בדף:', 'font-size: 18px; font-weight: bold; color: #e74c3c;');

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
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
    console.log(`%cגבול: ${borderColor} (${borderWidth})`, `background: ${borderColor}; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold;`);
    
    // בדיקת מחלקות entity
    const entityMatch = classes.match(/entity-(\w+)-(main|sub)-header/);
    if (entityMatch) {
      const [, entityType, headerType] = entityMatch;
      console.log(`%c✅ זוהתה כותרת ${headerType} של ישות: ${entityType}`, 'color: #27ae60; font-weight: bold; font-size: 14px;');
      
      // בדיקת שקיפות
      if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
        console.log(`%c✅ שקיפות 0.8 מאומתת!`, 'color: #27ae60; font-weight: bold;');
      } else if (bgColor.includes('rgba') && bgColor.includes('0.3')) {
        console.log(`%c⚠️ שקיפות 0.3 - צריך 0.8!`, 'color: #f39c12; font-weight: bold;');
      } else if (!bgColor.includes('rgba')) {
        console.log(`%c❌ אין שקיפות - צריך rgba עם 0.8!`, 'color: #e74c3c; font-weight: bold;');
      }
    } else {
      console.log(`%cℹ️ כותרת רגילה (ללא entity)`, 'color: #3498db;');
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
} else {
  console.log('%c❌ לא נמצאו כותרות בדף הנוכחי', 'color: #e74c3c; font-size: 16px;');
}

// ===== בדיקת unified-header =====
console.log('\n%c📋 בדיקת unified-header:', 'font-size: 18px; font-weight: bold; color: #e74c3c;');

const unifiedHeader = document.getElementById('unified-header');
if (unifiedHeader) {
  const headerStyle = window.getComputedStyle(unifiedHeader);
  console.group('%cunified-header נמצא:', 'font-weight: bold;');
  console.log(`%cרקע: ${headerStyle.backgroundColor}`, `background: ${headerStyle.backgroundColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  console.log(`%cצל: ${headerStyle.boxShadow || 'אין צל'}`, 'background: rgba(0,0,0,0.1); color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold;');
  
  if (headerStyle.backgroundColor.includes('rgb(255, 255, 255)') || headerStyle.backgroundColor === 'white') {
    console.log(`%c✅ רקע לבן מאומת!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c❌ רקע לא לבן: ${headerStyle.backgroundColor}`, 'color: #e74c3c; font-weight: bold;');
  }
  
  console.groupEnd();
} else {
  console.log('%c❌ unified-header לא נמצא', 'color: #e74c3c;');
}

// ===== בדיקת כפתורי העתק לוג =====
console.log('\n%c🔘 בדיקת כפתורי העתק לוג:', 'font-size: 18px; font-weight: bold; color: #e74c3c;');

const copyButtons = document.querySelectorAll('.btn-outline-secondary');
if (copyButtons.length > 0) {
  console.group(`%cנמצאו ${copyButtons.length} כפתורי העתק לוג:`, 'font-weight: bold;');
  copyButtons.forEach((btn, index) => {
    const btnStyle = window.getComputedStyle(btn);
    console.log(`%cכפתור ${index + 1}: רקע ${btnStyle.backgroundColor}`, `background: ${btnStyle.backgroundColor}; color: #333; padding: 4px 8px; border-radius: 4px; margin: 2px;`);
    
    if (btnStyle.backgroundColor.includes('rgb(255, 255, 255)') || btnStyle.backgroundColor === 'white') {
      console.log(`%c✅ רקע לבן מאומת!`, 'color: #27ae60; font-weight: bold; font-size: 12px;');
    }
  });
  console.groupEnd();
} else {
  console.log('%c❌ לא נמצאו כפתורי העתק לוג', 'color: #e74c3c;');
}

// ===== בדיקת CSS Variables =====
console.log('\n%c🎯 בדיקת CSS Variables:', 'font-size: 18px; font-weight: bold; color: #e74c3c;');

const rootStyles = getComputedStyle(document.documentElement);
const executionBg = rootStyles.getPropertyValue('--entity-execution-bg');
const executionColor = rootStyles.getPropertyValue('--entity-execution-color');

console.group('%cCSS Variables של executions:', 'font-weight: bold;');
console.log(`%c--entity-execution-bg: ${executionBg}`, `background: ${executionBg || 'rgba(255,244,230,0.8)'}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
console.log(`%c--entity-execution-color: ${executionColor}`, `background: ${executionColor || '#fd7e14'}; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold;`);

if (executionBg && executionBg.includes('0.8')) {
  console.log(`%c✅ CSS Variable עם שקיפות 0.8 מאומת!`, 'color: #27ae60; font-weight: bold;');
} else {
  console.log(`%c❌ CSS Variable לא מוגדר או ללא שקיפות 0.8`, 'color: #e74c3c; font-weight: bold;');
}
console.groupEnd();

// ===== סיכום התוצאות =====
console.log('\n%c📊 ===== סיכום התוצאות =====', 'font-size: 20px; font-weight: bold; color: #2c3e50; background: linear-gradient(90deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px;');

let successCount = 0;
let totalChecks = 0;

// בדיקת כותרות
if (headers.length > 0) {
  totalChecks += headers.length;
  headers.forEach(header => {
    const computedStyle = window.getComputedStyle(header);
    const bgColor = computedStyle.backgroundColor;
    if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
      successCount++;
    }
  });
}

// בדיקת unified-header
totalChecks++;
if (unifiedHeader) {
  const headerStyle = window.getComputedStyle(unifiedHeader);
  if (headerStyle.backgroundColor.includes('rgb(255, 255, 255)') || headerStyle.backgroundColor === 'white') {
    successCount++;
  }
}

// בדיקת כפתורי העתק לוג
totalChecks++;
if (copyButtons.length > 0) {
  const firstBtn = copyButtons[0];
  const btnStyle = window.getComputedStyle(firstBtn);
  if (btnStyle.backgroundColor.includes('rgb(255, 255, 255)') || btnStyle.backgroundColor === 'white') {
    successCount++;
  }
}

const successRate = Math.round((successCount / totalChecks) * 100);

console.log(`%c✅ בדיקות שעברו: ${successCount}/${totalChecks}`, 'font-size: 16px; font-weight: bold; color: #27ae60;');
console.log(`%c📈 אחוז הצלחה: ${successRate}%`, 'font-size: 16px; font-weight: bold; color: #27ae60;');

if (successRate === 100) {
  console.log(`%c🎉 מעולה! כל הבדיקות עברו בהצלחה!`, 'font-size: 18px; font-weight: bold; color: #27ae60; background: rgba(39, 174, 96, 0.2); padding: 10px; border-radius: 8px;');
} else if (successRate >= 80) {
  console.log(`%c👍 טוב מאוד! רוב הבדיקות עברו.`, 'font-size: 18px; font-weight: bold; color: #f39c12; background: rgba(243, 156, 18, 0.2); padding: 10px; border-radius: 8px;');
} else {
  console.log(`%c⚠️ יש בעיות שצריך לתקן.`, 'font-size: 18px; font-weight: bold; color: #e74c3c; background: rgba(231, 76, 60, 0.2); padding: 10px; border-radius: 8px;');
}

// ===== הוראות להמשך =====
console.log('\n%c💡 הוראות:', 'font-size: 16px; font-weight: bold; color: #3498db;');
console.log('%c• אם יש בעיות, רענן את הדף (Ctrl+F5) לניקוי מטמון', 'color: #34495e;');
console.log('%c• אם עדיין יש בעיות, בדוק שהקובץ _page-headers.css נטען', 'color: #34495e;');
console.log('%c• לבדיקה מחודשת, הרץ שוב את הסקריפט הזה', 'color: #34495e;');

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

