/**
 * תיקון מיידי של צבעי execution
 * Immediate fix for execution colors
 */

console.clear();
console.log('%c🔧 מתחיל תיקון מיידי של צבעי execution...', 'font-size: 16px; font-weight: bold; color: #e74c3c;');

// 1. עדכון CSS Variables
console.log('\n1. מעדכן CSS Variables...');
document.documentElement.style.setProperty('--entity-execution-color', '#fd7e14');
document.documentElement.style.setProperty('--entity-execution-bg', 'rgba(255, 244, 230, 0.8)');
document.documentElement.style.setProperty('--entity-execution-text', '#e55a00');
document.documentElement.style.setProperty('--entity-execution-border', '#e55a00');

console.log('✅ CSS Variables עודכנו');

// 2. עדכון ישיר של הכותרות
console.log('\n2. מעדכן כותרות ישירות...');
const mainHeaders = document.querySelectorAll('.entity-execution-main-header');
const subHeaders = document.querySelectorAll('.entity-execution-sub-header');

mainHeaders.forEach((header, index) => {
  header.style.backgroundColor = 'rgba(255, 244, 230, 0.8)';
  header.style.borderBottom = '2px solid #fd7e14';
  header.style.color = '#e55a00';
  console.log(`✅ כותרת ראשית ${index + 1} תוקנה`);
});

subHeaders.forEach((header, index) => {
  header.style.backgroundColor = 'rgba(255, 244, 230, 0.8)';
  header.style.borderBottom = '2px solid #fd7e14';
  header.style.color = '#e55a00';
  console.log(`✅ כותרת משנית ${index + 1} תוקנה`);
});

// 3. בדיקת התוצאה
console.log('\n3. בודק התוצאה...');
const testHeader = document.querySelector('.entity-execution-main-header');
if (testHeader) {
  const computedStyle = window.getComputedStyle(testHeader);
  console.log(`רקע: ${computedStyle.backgroundColor}`);
  console.log(`צבע טקסט: ${computedStyle.color}`);
  console.log(`גבול: ${computedStyle.borderBottom}`);
  
  if (computedStyle.backgroundColor.includes('rgba(255, 244, 230, 0.8)')) {
    console.log('✅ תיקון הצליח!');
  } else {
    console.log('❌ תיקון נכשל');
  }
}

// 4. בדיקת CSS Variables
console.log('\n4. בודק CSS Variables...');
const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--entity-execution-bg').trim();
console.log(`--entity-execution-bg: ${cssVar}`);

if (cssVar === 'rgba(255, 244, 230, 0.8)') {
  console.log('✅ CSS Variable תוקן!');
} else {
  console.log('❌ CSS Variable לא תוקן');
}

console.log('\n%c🎉 תיקון הושלם!', 'font-size: 16px; font-weight: bold; color: #27ae60; background: rgba(39, 174, 96, 0.2); padding: 10px; border-radius: 8px;');

