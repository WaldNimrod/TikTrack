/**
 * תיקון כפוי של צבעי כותרות
 * Force fix for header colors
 */

console.log('%c🔧 מתחיל תיקון כפוי של צבעי כותרות...', 'font-size: 16px; font-weight: bold; color: #e74c3c; background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 8px;');

// 1. תיקון CSS Variables
console.log('%c1. מתקן CSS Variables...', 'font-weight: bold; color: #2c3e50;');

document.documentElement.style.setProperty('--entity-execution-bg', 'rgba(255, 244, 230, 0.8)', 'important');
document.documentElement.style.setProperty('--entity-execution-color', '#fd7e14', 'important');
document.documentElement.style.setProperty('--entity-execution-text', '#e55a00', 'important');
document.documentElement.style.setProperty('--entity-execution-border', '#e55a00', 'important');

console.log(`%c✅ CSS Variables עודכנו:`, 'color: #27ae60; font-weight: bold;');
console.log(`%c--entity-execution-bg: rgba(255, 244, 230, 0.8)`, 'background: rgba(255, 244, 230, 0.8); color: #333; padding: 4px 8px; border-radius: 4px;');

// 2. תיקון ישיר של הכותרות
console.log('\n%c2. מתקן כותרות ישירות...', 'font-weight: bold; color: #2c3e50;');

const headers = document.querySelectorAll('.entity-execution-main-header, .entity-execution-sub-header');
headers.forEach((header, index) => {
  // הסרת כל הסגנונות הקיימים
  header.style.removeProperty('background-color');
  header.style.removeProperty('background');
  
  // הוספת הסגנון החדש
  header.style.setProperty('background-color', 'rgba(255, 244, 230, 0.8)', 'important');
  header.style.setProperty('border-bottom', '2px solid #fd7e14', 'important');
  header.style.setProperty('color', '#e55a00', 'important');
  
  const text = header.textContent.trim().substring(0, 30);
  console.log(`%c✅ כותרת ${index + 1}: "${text}" תוקנה`, 'color: #27ae60;');
});

// 3. תיקון כפתורי העתק לוג
console.log('\n%c3. מתקן כפתורי העתק לוג...', 'font-weight: bold; color: #2c3e50;');

const copyButtons = document.querySelectorAll('.btn-outline-secondary');
copyButtons.forEach((btn, index) => {
  btn.style.setProperty('background', 'white', 'important');
  btn.style.setProperty('color', '#495057', 'important');
  btn.style.setProperty('border-color', '#6c757d', 'important');
  console.log(`%c✅ כפתור ${index + 1} תוקן`, 'color: #27ae60;');
});

// 4. בדיקת התוצאה
console.log('\n%c4. בודק התוצאה...', 'font-weight: bold; color: #2c3e50;');

setTimeout(() => {
  const headers = document.querySelectorAll('.section-header');
  let successCount = 0;
  
  headers.forEach((header, index) => {
    const computedStyle = window.getComputedStyle(header);
    const bgColor = computedStyle.backgroundColor;
    const text = header.textContent.trim().substring(0, 30);
    
    console.log(`%cכותרת ${index + 1}: "${text}"`, 'font-weight: bold;');
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 4px 8px; border-radius: 4px; border: 2px solid #ddd;`);
    
    if (bgColor.includes('rgba(255, 244, 230, 0.8)')) {
      console.log(`%c✅ תיקון הצליח!`, 'color: #27ae60; font-weight: bold;');
      successCount++;
    } else if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
      console.log(`%c✅ שקיפות 0.8 מאומתת!`, 'color: #27ae60; font-weight: bold;');
      successCount++;
    } else {
      console.log(`%c❌ עדיין לא תקין: ${bgColor}`, 'color: #e74c3c; font-weight: bold;');
    }
  });
  
  const successRate = Math.round((successCount / headers.length) * 100);
  
  if (successRate === 100) {
    console.log(`\n%c🎉 מעולה! כל הכותרות תוקנו בהצלחה! (${successRate}%)`, 'font-size: 16px; font-weight: bold; color: #27ae60; background: rgba(39, 174, 96, 0.2); padding: 10px; border-radius: 8px;');
  } else if (successRate >= 50) {
    console.log(`\n%c👍 טוב! רוב הכותרות תוקנו. (${successRate}%)`, 'font-size: 16px; font-weight: bold; color: #f39c12; background: rgba(243, 156, 18, 0.2); padding: 10px; border-radius: 8px;');
  } else {
    console.log(`\n%c⚠️ יש עדיין בעיות. (${successRate}%)`, 'font-size: 16px; font-weight: bold; color: #e74c3c; background: rgba(231, 76, 60, 0.2); padding: 10px; border-radius: 8px;');
  }
  
  console.log('\n%c💡 אם התיקון עבד, הכותרות אמורות להציג כתום בהיר עם שקיפות 0.8', 'color: #3498db; font-weight: bold;');
  
}, 200);

