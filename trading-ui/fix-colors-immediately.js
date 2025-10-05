/**
 * תיקון מיידי של צבעי כותרות
 * Immediate fix for header colors
 */

console.log('%c🔧 מתחיל תיקון מיידי של צבעי כותרות...', 'font-size: 16px; font-weight: bold; color: #e74c3c;');

// תיקון CSS Variables
console.log('%c1. מתקן CSS Variables...', 'font-weight: bold;');

// המרת #fff4e6 ל-rgba עם שקיפות 0.8
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// הגדרת CSS Variables
document.documentElement.style.setProperty('--entity-execution-bg', hexToRgba('#fff4e6', 0.8));
document.documentElement.style.setProperty('--entity-execution-color', '#fd7e14');
document.documentElement.style.setProperty('--entity-execution-text', '#e55a00');
document.documentElement.style.setProperty('--entity-execution-border', '#e55a00');

console.log(`%c✅ CSS Variables עודכנו:`, 'color: #27ae60; font-weight: bold;');
console.log(`%c--entity-execution-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--entity-execution-bg')}`, 
  `background: ${getComputedStyle(document.documentElement).getPropertyValue('--entity-execution-bg')}; color: #333; padding: 4px 8px; border-radius: 4px;`);

// תיקון כפתורי העתק לוג
console.log('\n%c2. מתקן כפתורי העתק לוג...', 'font-weight: bold;');

const copyButtons = document.querySelectorAll('.btn-outline-secondary');
copyButtons.forEach((btn, index) => {
  btn.style.setProperty('background', 'white', 'important');
  btn.style.setProperty('color', '#495057', 'important');
  btn.style.setProperty('border-color', '#6c757d', 'important');
  console.log(`%c✅ כפתור ${index + 1} תוקן`, 'color: #27ae60;');
});

// בדיקת התוצאה
console.log('\n%c3. בודק התוצאה...', 'font-weight: bold;');

setTimeout(() => {
  const headers = document.querySelectorAll('.section-header');
  headers.forEach((header, index) => {
    const computedStyle = window.getComputedStyle(header);
    const bgColor = computedStyle.backgroundColor;
    const text = header.textContent.trim().substring(0, 30);
    
    console.log(`%cכותרת ${index + 1}: "${text}"`, 'font-weight: bold;');
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 4px 8px; border-radius: 4px;`);
    
    if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
      console.log(`%c✅ שקיפות 0.8 מאומתת!`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c❌ עדיין לא תקין: ${bgColor}`, 'color: #e74c3c; font-weight: bold;');
    }
  });
  
  console.log('\n%c🎉 תיקון הושלם! רענן את הדף אם צריך.', 'font-size: 16px; font-weight: bold; color: #27ae60; background: rgba(39, 174, 96, 0.2); padding: 10px; border-radius: 8px;');
}, 100);

