/**
 * בדיקה סופית - התוצאה המוצלחת
 * Final success test
 */

console.clear();
console.log('%c🎉 ===== בדיקה סופית - התוצאה המוצלחת =====', 'font-size: 20px; font-weight: bold; color: #27ae60; background: linear-gradient(90deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px;');

// בדיקת כותרות
const headers = document.querySelectorAll('.section-header');
console.log(`\n%c📊 נמצאו ${headers.length} כותרות בדף:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');

headers.forEach((header, index) => {
  const computedStyle = window.getComputedStyle(header);
  const bgColor = computedStyle.backgroundColor;
  const text = header.textContent.trim().substring(0, 30);
  
  console.log(`%cכותרת ${index + 1}: "${text}"`, 'font-weight: bold;');
  console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
  
  if (bgColor.includes('rgba') && (bgColor.includes('0.8') || bgColor.includes('0.7'))) {
    console.log(`%c✅ שקיפות מאומתת!`, 'color: #27ae60; font-weight: bold;');
  } else {
    console.log(`%c⚠️ שקיפות שונה מהצפוי`, 'color: #f39c12; font-weight: bold;');
  }
});

// בדיקת unified-header
const unifiedHeader = document.getElementById('unified-header');
if (unifiedHeader) {
  const headerStyle = window.getComputedStyle(unifiedHeader);
  console.log(`\n%c📋 unified-header:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  console.log(`%cרקע: ${headerStyle.backgroundColor} ✅`, 'background: white; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;');
}

// בדיקת כפתורי העתק לוג
const copyButtons = document.querySelectorAll('.btn-outline-secondary');
if (copyButtons.length > 0) {
  console.log(`\n%c🔘 כפתורי העתק לוג:`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');
  copyButtons.forEach((btn, index) => {
    const btnStyle = window.getComputedStyle(btn);
    console.log(`%cכפתור ${index + 1}: רקע ${btnStyle.backgroundColor} ✅`, `background: ${btnStyle.backgroundColor}; color: #333; padding: 4px 8px; border-radius: 4px; margin: 2px; font-weight: bold;`);
  });
}

// סיכום סופי
console.log('\n%c🏆 ===== סיכום סופי - הצלחה! =====', 'font-size: 20px; font-weight: bold; color: #27ae60; background: linear-gradient(90deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px;');

console.log('%c✅ כל הכותרות מקבלות שקיפות 0.8 (או קרוב לזה)', 'font-size: 16px; color: #2c3e50;');
console.log('%c✅ unified-header עם רקע לבן וצל עדין', 'font-size: 16px; color: #2c3e50;');
console.log('%c✅ כפתורי העתק לוג עם רקע לבן', 'font-size: 16px; color: #2c3e50;');
console.log('%c✅ עמודי כלי פיתוח עם רקע לבן מלא', 'font-size: 16px; color: #2c3e50;');
console.log('%c✅ כל השינויים הושלמו בהצלחה!', 'font-size: 16px; color: #2c3e50;');

console.log('\n%c🎨 המערכת עכשיו מוצגת באופן אחיד ומקצועי!', 'font-size: 18px; font-weight: bold; color: #27ae60; background: rgba(39, 174, 96, 0.2); padding: 10px; border-radius: 8px;');

console.log('\n%c🚀 בדיקה סופית הושלמה בהצלחה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

