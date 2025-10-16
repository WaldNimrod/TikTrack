/**
 * בדיקת צבעי כותרות בכל העמודים
 * Check header colors across all pages
 */

console.clear();
console.log('%c🔍 ===== בדיקת צבעי כותרות בכל העמודים =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// רשימת כל העמודים עם הצבעים שלהם
const pagesColors = {
  'executions': { color: '#fd7e14', name: 'כתום', bg: 'rgba(255, 244, 230, 0.8)' },
  'trades': { color: '#28a745', name: 'ירוק', bg: 'rgba(40, 167, 69, 0.8)' },
  'trading_accounts': { color: '#007bff', name: 'כחול', bg: 'rgba(0, 123, 255, 0.8)' },
  'tickers': { color: '#6f42c1', name: 'סגול', bg: 'rgba(111, 66, 193, 0.8)' },
  'trade_plans': { color: '#20c997', name: 'טורקיז', bg: 'rgba(32, 201, 151, 0.8)' },
  'alerts': { color: '#dc3545', name: 'אדום', bg: 'rgba(220, 53, 69, 0.8)' },
  'cash_flows': { color: '#17a2b8', name: 'כחול בהיר', bg: 'rgba(23, 162, 184, 0.8)' },
  'notes': { color: '#6c757d', name: 'אפור', bg: 'rgba(108, 117, 125, 0.8)' },
  'research': { color: '#fd7e14', name: 'כתום', bg: 'rgba(255, 244, 230, 0.8)' }
};

// בדיקת העמוד הנוכחי
const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
console.log(`\n%c📄 עמוד נוכחי: ${currentPage}`, 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (pagesColors[currentPage]) {
  const expectedColor = pagesColors[currentPage];
  console.log(`%c🎨 צבע צפוי: ${expectedColor.name} (${expectedColor.color})`, 'color: #27ae60; font-weight: bold;');
  console.log(`%c🎨 רקע צפוי: ${expectedColor.bg}`, 'color: #27ae60; font-weight: bold;');
} else {
  console.log(`%cℹ️ עמוד כלי פיתוח - רקע לבן מלא`, 'color: #3498db; font-weight: bold;');
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
    if (pagesColors[currentPage]) {
      const expectedColor = pagesColors[currentPage];
      if (bgColor.includes('rgba(255, 255, 255)') || bgColor.includes('white')) {
        console.log(`%c⚠️ רקע לבן במקום ${expectedColor.name}`, 'color: #f39c12; font-weight: bold;');
      } else if (bgColor.includes(expectedColor.bg.replace('0.8', '0.8'))) {
        console.log(`%c✅ רקע ${expectedColor.name} עם שקיפות 0.8!`, 'color: #27ae60; font-weight: bold;');
      } else if (bgColor.includes('rgba') && bgColor.includes('0.8')) {
        console.log(`%c⚠️ רקע עם שקיפות 0.8 אבל לא ${expectedColor.name}`, 'color: #f39c12; font-weight: bold;');
      } else {
        console.log(`%c❓ רקע אחר: ${bgColor}`, 'color: #95a5a6; font-weight: bold;');
      }
    } else {
      // עמוד כלי פיתוח - צריך רקע לבן
      if (bgColor.includes('rgba(255, 255, 255)') || bgColor.includes('white')) {
        console.log(`%c✅ רקע לבן מלא לעמוד כלי פיתוח!`, 'color: #27ae60; font-weight: bold;');
      } else {
        console.log(`%c⚠️ עמוד כלי פיתוח צריך רקע לבן מלא`, 'color: #f39c12; font-weight: bold;');
      }
    }
  });
}

// בדיקת CSS Variables
console.log('\n%c🎨 CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (pagesColors[currentPage]) {
  const entityType = currentPage.replace('_', '');
  const cssVars = [
    `--entity-${entityType}-color`,
    `--entity-${entityType}-bg`, 
    `--entity-${entityType}-text`,
    `--entity-${entityType}-border`
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
  console.log(`%cℹ️ עמוד כלי פיתוח - אין CSS Variables לצבעי ישות`, 'color: #3498db; font-weight: bold;');
}

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (sectionHeaders.length > 0) {
  const firstHeader = sectionHeaders[0];
  const firstHeaderStyle = window.getComputedStyle(firstHeader);
  const bgColor = firstHeaderStyle.backgroundColor;
  
  if (pagesColors[currentPage]) {
    const expectedColor = pagesColors[currentPage];
    if (bgColor.includes(expectedColor.bg.replace('0.8', '0.8'))) {
      console.log(`%c✅ עמוד ${currentPage} מקבל את הצבע הנכון!`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c⚠️ עמוד ${currentPage} לא מקבל את הצבע הנכון`, 'color: #f39c12; font-weight: bold;');
    }
  } else {
    if (bgColor.includes('rgba(255, 255, 255)') || bgColor.includes('white')) {
      console.log(`%c✅ עמוד כלי פיתוח מקבל רקע לבן מלא!`, 'color: #27ae60; font-weight: bold;');
    } else {
      console.log(`%c⚠️ עמוד כלי פיתוח צריך רקע לבן מלא`, 'color: #f39c12; font-weight: bold;');
    }
  }
} else {
  console.log(`%c❌ לא נמצאו כותרות`, 'color: #e74c3c; font-weight: bold;');
}

console.log('\n%c💡 המלצה: בדוק כל עמוד בנפרד כדי לוודא שהצבעים נכונים', 'color: #3498db; font-weight: bold; background: rgba(52, 152, 219, 0.1); padding: 8px; border-radius: 6px;');
console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

