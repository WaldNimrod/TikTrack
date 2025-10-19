/**
 * בדיקת CSS Variables בזמן אמת
 * Check CSS Variables in real time
 */

console.clear();
console.log('%c🔍 ===== בדיקת CSS Variables בזמן אמת =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// בדיקת CSS Variables
console.log('\n%c🎨 CSS Variables נוכחיים:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
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

// בדיקת כותרות
console.log('\n%c📋 כותרות נוכחיות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
const sectionHeaders = document.querySelectorAll('.section-header');
sectionHeaders.forEach((header, index) => {
  const computedStyle = window.getComputedStyle(header);
  const bgColor = computedStyle.backgroundColor;
  const textColor = computedStyle.color;
  const classes = header.className;
  const text = header.textContent.trim().substring(0, 30);
  
  console.log(`\n%cכותרת ${index + 1}: "${text}..."`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
  console.log(`%cקלייסים: "${classes}"`, 'color: #7f8c8d; font-family: monospace;');
  console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  console.log(`%cצבע טקסט: ${textColor}`, `color: ${textColor}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
});

// בדיקת מהירות CSS Variables
console.log('\n%c⚡ בדיקת מהירות CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

// עדכון CSS Variables
console.log('%c🔄 מעדכן CSS Variables...', 'color: #3498db;');
document.documentElement.style.setProperty('--entity-execution-bg', 'rgba(255, 244, 230, 0.8)');

// בדיקה אחרי העדכון
console.log('%c🎨 CSS Variables אחרי העדכון:', 'color: #34495e;');
const newValue = getComputedStyle(document.documentElement).getPropertyValue('--entity-execution-bg').trim();
console.log(`%c--entity-execution-bg: ${newValue}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');

// בדיקת כותרות אחרי העדכון
console.log('\n%c📋 כותרות אחרי העדכון:', 'color: #34495e;');
sectionHeaders.forEach((header, index) => {
  const computedStyle = window.getComputedStyle(header);
  const bgColor = computedStyle.backgroundColor;
  const text = header.textContent.trim().substring(0, 30);
  
  console.log(`%cכותרת ${index + 1}: "${text}..." - רקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
});

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (newValue === 'rgba(255, 244, 230, 0.8)') {
  console.log('%c✅ CSS Variables מתעדכנים בזמן אמת', 'color: #27ae60; font-weight: bold;');
} else {
  console.log('%c❌ CSS Variables לא מתעדכנים', 'color: #e74c3c; font-weight: bold;');
}

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

