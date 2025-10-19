/**
 * בדיקת צבעי עמוד הבית
 * Check index page colors
 */

console.clear();
console.log('%c🔍 ===== בדיקת צבעי עמוד הבית =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// בדיקת העמוד הנוכחי
const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
console.log(`\n%c📄 עמוד נוכחי: ${currentPage}`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (currentPage === 'index' || currentPage === '') {
  console.log(`%c🎨 עמוד הבית - צבע צפוי: ירוק (#28a745)`, 'color: #27ae60; font-weight: bold;');
  console.log(`%c🎨 רקע צפוי: rgba(40, 167, 69, 0.8)`, 'color: #27ae60; font-weight: bold;');
} else {
  console.log(`%cℹ️ לא עמוד הבית - עמוד: ${currentPage}`, 'color: #3498db; font-weight: bold;');
}

// בדיקת כותרות
console.log('\n%c📋 בדיקת כותרות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

const sectionHeaders = document.querySelectorAll('.section-header');
if (sectionHeaders.length === 0) {
  console.log('%c❌ לא נמצאו כותרות', 'color: #e74c3c; font-weight: bold;');
} else {
  sectionHeaders.forEach((header, index) => {
    const computedStyle = window.getComputedStyle(header);
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    const borderBottom = computedStyle.borderBottom;
    const classes = header.className;
    const text = header.textContent.trim().substring(0, 30);
    
    console.log(`\n%cכותרת ${index + 1}: "${text}..."`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
    console.log(`%cקלייסים: "${classes}"`, 'color: #7f8c8d; font-family: monospace;');
    console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
    console.log(`%cצבע טקסט: ${textColor}`, `color: ${textColor}; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold;`);
    
    // בדיקת התאמה לצבע הצפוי
    if (currentPage === 'index' || currentPage === '') {
      if (bgColor.includes('rgba(40, 167, 69, 0.8)')) {
        console.log(`%c✅ רקע ירוק עם שקיפות 0.8!`, 'color: #27ae60; font-weight: bold;');
      } else if (bgColor.includes('rgba(255, 255, 255)') || bgColor.includes('white')) {
        console.log(`%c⚠️ רקע לבן במקום ירוק`, 'color: #f39c12; font-weight: bold;');
      } else if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
        console.log(`%c⚠️ רקע עם שקיפות 0.8 אבל לא ירוק`, 'color: #f39c12; font-weight: bold;');
      } else {
        console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
      }
    }
  });
}

// בדיקת CSS Variables
console.log('\n%c🎨 CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (currentPage === 'index' || currentPage === '') {
  const cssVars = [
    '--entity-index-color',
    '--entity-index-bg', 
    '--entity-index-text',
    '--entity-index-border'
  ];

  cssVars.forEach(varName => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (value) {
      console.log(`%c${varName}: ${value}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
    } else {
      console.log(`%c${varName}: לא מוגדר`, 'color: #95a5a6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
    }
  });
} else {
  console.log(`%cℹ️ לא עמוד הבית - אין CSS Variables לצבעי index`, 'color: #3498db; font-weight: bold;');
}

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (currentPage === 'index' || currentPage === '') {
  if (sectionHeaders.length > 0) {
    const firstHeader = sectionHeaders[0];
    const firstHeaderStyle = window.getComputedStyle(firstHeader);
    const bgColor = firstHeaderStyle.backgroundColor;
    
    if (bgColor.includes('rgba(40, 167, 69, 0.8)')) {
      console.log(`%c✅ עמוד הבית מקבל את הצבע הירוק הנכון!`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c⚠️ עמוד הבית לא מקבל את הצבע הירוק הנכון`, 'color: #f39c12; font-weight: bold;');
    }
  } else {
    console.log(`%c❌ לא נמצאו כותרות בעמוד הבית`, 'color: #e74c3c; font-weight: bold;');
  }
} else {
  console.log(`%cℹ️ לא עמוד הבית - עמוד: ${currentPage}`, 'color: #3498db; font-weight: bold;');
}

console.log('\n%c💡 המלצה: עבור לעמוד הבית כדי לבדוק את הצבעים', 'color: #3498db; font-weight: bold; background: rgba(52, 152, 219, 0.1); padding: 8px; border-radius: 6px;');
console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

