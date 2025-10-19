/**
 * בדיקת עמודת הפעולה בטבלת executions
 * Test of actions column in executions table
 */

console.clear();
console.log('%c🔍 ===== בדיקת עמודת הפעולה בטבלת executions =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// בדיקת עמודת הפעולה
const actionCells = document.querySelectorAll('.type-cell');
console.log(`\n%c📊 נמצאו ${actionCells.length} תאים בעמודת הפעולה:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');

actionCells.forEach((cell, index) => {
  const computedStyle = window.getComputedStyle(cell);
  const bgColor = computedStyle.backgroundColor;
  const span = cell.querySelector('span');
  const spanStyle = span ? window.getComputedStyle(span) : null;
  
  console.log(`\n%cתא ${index + 1}:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
  console.log(`%cתוכן: "${cell.textContent.trim()}"`, 'color: #34495e;');
  console.log(`%cרקע תא: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  
  if (span && spanStyle) {
    const spanBgColor = spanStyle.backgroundColor;
    const spanTextColor = spanStyle.color;
    console.log(`%cרקע span: ${spanBgColor}`, `background: ${spanBgColor}; color: #333; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold; margin-left: 20px;`);
    console.log(`%cצבע טקסט: ${spanTextColor}`, `color: ${spanTextColor}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold; margin-left: 20px;`);
    
    if (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('rgba(0, 0, 0, 0)')) {
      console.log(`%c✅ התא עצמו ללא רקע צבעוני`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c⚠️ התא עדיין עם רקע צבעוני`, 'color: #f39c12; font-weight: bold;');
    }
  }
});

// בדיקת הטבלה הכללית
const table = document.querySelector('#executionsTable');
if (table) {
  const tableStyle = window.getComputedStyle(table);
  console.log(`\n%c📋 טבלת executions:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
  console.log(`%cרקע טבלה: ${tableStyle.backgroundColor}`, `background: ${tableStyle.backgroundColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
}

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (actionCells.length > 0) {
  const firstCell = actionCells[0];
  const firstCellStyle = window.getComputedStyle(firstCell);
  const hasBackground = !firstCellStyle.backgroundColor.includes('rgb(255, 255, 255)') && 
                       !firstCellStyle.backgroundColor.includes('rgba(0, 0, 0, 0)');
  
  if (!hasBackground) {
    console.log(`%c✅ עמודת הפעולה ללא רקע צבעוני לתאים`, 'color: #27ae60; font-weight: bold;');
    console.log(`%c🎨 הטקסט מקבל צבע דרך קלייסים profit-positive/negative`, 'color: #3498db;');
  } else {
    console.log(`%c⚠️ עמודת הפעולה עדיין עם רקע צבעוני`, 'color: #f39c12; font-weight: bold;');
  }
} else {
  console.log(`%c❌ לא נמצאו תאים בעמודת הפעולה`, 'color: #e74c3c; font-weight: bold;');
}

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

