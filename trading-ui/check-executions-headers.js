/**
 * בדיקת צבעי כותרות הסקשנים בעמוד executions
 * Check section headers colors in executions page
 */

console.clear();
console.log('%c🔍 ===== בדיקת צבעי כותרות הסקשנים בעמוד executions =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// בדיקת כותרות סקשנים
const sectionHeaders = document.querySelectorAll('.section-header');
console.log(`\n%c📋 נמצאו ${sectionHeaders.length} כותרות סקשנים:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');

sectionHeaders.forEach((header, index) => {
  const computedStyle = window.getComputedStyle(header);
  const bgColor = computedStyle.backgroundColor;
  const textColor = computedStyle.color;
  const borderBottom = computedStyle.borderBottom;
  const classes = header.className;
  const text = header.textContent.trim().substring(0, 40);
  
  console.log(`\n%cכותרת ${index + 1}:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
  console.log(`%cטקסט: "${text}..."`, 'color: #34495e;');
  console.log(`%cקלייסים: "${classes}"`, 'color: #7f8c8d; font-family: monospace;');
  console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  console.log(`%cצבע טקסט: ${textColor}`, `color: ${textColor}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
  console.log(`%cגבול תחתון: ${borderBottom}`, 'color: #95a5a6; font-family: monospace;');
  
  // בדיקת שקיפות
  if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
    console.log(`%c✅ שקיפות 0.8 מאומתת!`, 'color: #27ae60; font-weight: bold;');
  } else if (bgColor.includes('rgba') && (bgColor.includes('0.7') || bgColor.includes('0.75'))) {
    console.log(`%c⚠️ שקיפות קרובה ל-0.8`, 'color: #f39c12; font-weight: bold;');
  } else if (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('white')) {
    console.log(`%cℹ️ רקע לבן מלא`, 'color: #3498db; font-weight: bold;');
  } else {
    console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
  }
});

// בדיקת CSS Variables
console.log(`\n%c🎨 CSS Variables רלוונטיים:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');
const cssVars = [
  '--entity-execution-color',
  '--entity-execution-bg', 
  '--entity-execution-text',
  '--entity-execution-border'
];

cssVars.forEach(varName => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  console.log(`%c${varName}: ${value}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
});

// בדיקת unified-header
const unifiedHeader = document.getElementById('unified-header');
if (unifiedHeader) {
  const headerStyle = window.getComputedStyle(unifiedHeader);
  console.log(`\n%c📋 unified-header:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
  console.log(`%cרקע: ${headerStyle.backgroundColor}`, `background: ${headerStyle.backgroundColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  console.log(`%cגבול תחתון: ${headerStyle.borderBottom}`, 'color: #95a5a6; font-family: monospace;');
  console.log(`%cצל: ${headerStyle.boxShadow}`, 'color: #95a5a6; font-family: monospace;');
}

// בדיקת העדפות נוכחיות
console.log(`\n%c⚙️ העדפות נוכחיות:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
if (window.currentPreferences) {
  console.log(`%c✅ העדפות נטענו: ${Object.keys(window.currentPreferences).length} העדפות`, 'color: #27ae60;');
  
  // בדיקת צבעי execution
  if (window.currentPreferences.entityExecutionColor) {
    console.log(`%c🎨 צבע execution: ${window.currentPreferences.entityExecutionColor}`, 'color: #3498db; font-family: monospace;');
  }
  if (window.currentPreferences.entityExecutionColorLight) {
    console.log(`%c🎨 צבע בהיר: ${window.currentPreferences.entityExecutionColorLight}`, 'color: #3498db; font-family: monospace;');
  }
} else {
  console.log(`%c⚠️ העדפות לא נטענו`, 'color: #f39c12;');
}

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (sectionHeaders.length > 0) {
  const firstHeader = sectionHeaders[0];
  const firstHeaderStyle = window.getComputedStyle(firstHeader);
  const bgColor = firstHeaderStyle.backgroundColor;
  
  if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
    console.log(`%c✅ כותרות מקבלות שקיפות 0.8 של צבע הישות`, 'color: #27ae60; font-weight: bold;');
  } else if (bgColor.includes('rgb(255, 255, 255)')) {
    console.log(`%cℹ️ כותרות עם רקע לבן מלא`, 'color: #3498db; font-weight: bold;');
  } else {
    console.log(`%c❓ כותרות עם רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
  }
} else {
  console.log(`%c❌ לא נמצאו כותרות סקשנים`, 'color: #e74c3c; font-weight: bold;');
}

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

