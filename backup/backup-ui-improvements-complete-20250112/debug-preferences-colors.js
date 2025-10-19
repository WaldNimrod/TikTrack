/**
 * בדיקת העדפות וצבעים - ללא תיקון קבוע!
 * Debug preferences and colors - no fixed updates!
 */

console.clear();
console.log('%c🔍 ===== בדיקת העדפות וצבעים =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// 1. בדיקת העדפות נוכחיות
console.log('\n%c📋 1. בדיקת העדפות נוכחיות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (window.currentPreferences) {
  console.log(`%c✅ העדפות נטענו: ${Object.keys(window.currentPreferences).length} העדפות`, 'color: #27ae60;');
  console.log('%c📊 תוכן ההעדפות:', 'color: #34495e;');
  
  // בדיקת צבעי execution
  const execColor = window.currentPreferences.entityExecutionColor;
  const execColorLight = window.currentPreferences.entityExecutionColorLight;
  const execColorDark = window.currentPreferences.entityExecutionColorDark;
  
  console.log(`%c🎨 entityExecutionColor: ${execColor || 'לא מוגדר'}`, 'color: #3498db; font-family: monospace;');
  console.log(`%c🎨 entityExecutionColorLight: ${execColorLight || 'לא מוגדר'}`, 'color: #3498db; font-family: monospace;');
  console.log(`%c🎨 entityExecutionColorDark: ${execColorDark || 'לא מוגדר'}`, 'color: #3498db; font-family: monospace;');
  
} else {
  console.log(`%c❌ העדפות לא נטענו - window.currentPreferences לא קיים`, 'color: #e74c3c;');
}

// 2. בדיקת CSS Variables
console.log('\n%c🎨 2. בדיקת CSS Variables:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
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

// 3. בדיקת פונקציות זמינות
console.log('\n%c🔧 3. בדיקת פונקציות זמינות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

const functions = [
  'updateCSSVariablesFromPreferences',
  'loadEntityColorsFromPreferences', 
  'loadColorPreferences',
  'applyEntityColorsToHeaders'
];

functions.forEach(funcName => {
  if (window[funcName]) {
    console.log(`%c✅ ${funcName} זמין`, 'color: #27ae60;');
  } else {
    console.log(`%c❌ ${funcName} לא זמין`, 'color: #e74c3c;');
  }
});

// 4. בדיקת כותרות נוכחיות
console.log('\n%c📋 4. בדיקת כותרות נוכחיות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

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

// 5. ניסיון לטעון העדפות מחדש
console.log('\n%c🔄 5. ניסיון לטעון העדפות מחדש:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (window.loadColorPreferences) {
  console.log('%c🔄 קורא ל-loadColorPreferences...', 'color: #3498db;');
  try {
    window.loadColorPreferences().then(() => {
      console.log('%c✅ loadColorPreferences הושלם', 'color: #27ae60;');
    }).catch(error => {
      console.log(`%c❌ שגיאה ב-loadColorPreferences: ${error.message}`, 'color: #e74c3c;');
    });
  } catch (error) {
    console.log(`%c❌ שגיאה ב-loadColorPreferences: ${error.message}`, 'color: #e74c3c;');
  }
} else {
  console.log('%c❌ loadColorPreferences לא זמין', 'color: #e74c3c;');
}

// 6. ניסיון לעדכן CSS Variables מהעדפות
console.log('\n%c🎨 6. ניסיון לעדכן CSS Variables מהעדפות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');

if (window.currentPreferences && window.updateCSSVariablesFromPreferences) {
  console.log('%c🔄 קורא ל-updateCSSVariablesFromPreferences...', 'color: #3498db;');
  try {
    window.updateCSSVariablesFromPreferences(window.currentPreferences);
    console.log('%c✅ updateCSSVariablesFromPreferences הושלם', 'color: #27ae60;');
    
    // בדיקת CSS Variables אחרי העדכון
    console.log('\n%c🎨 CSS Variables אחרי העדכון:', 'color: #34495e;');
    cssVars.forEach(varName => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      console.log(`%c${varName}: ${value}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; margin-left: 20px;');
    });
    
  } catch (error) {
    console.log(`%c❌ שגיאה ב-updateCSSVariablesFromPreferences: ${error.message}`, 'color: #e74c3c;');
  }
} else {
  console.log('%c❌ לא ניתן לעדכן CSS Variables - העדפות או פונקציה לא זמינים', 'color: #e74c3c;');
}

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

console.log('%c📝 המלצות:', 'font-size: 14px; font-weight: bold; color: #e67e22;');
console.log('%c1. בדוק שההעדפות נטענו נכון', 'color: #2c3e50; margin-left: 20px;');
console.log('%c2. בדוק שהפונקציות זמינות', 'color: #2c3e50; margin-left: 20px;');
console.log('%c3. בדוק שהפונקציות נקראות בזמן הנכון', 'color: #2c3e50; margin-left: 20px;');
console.log('%c4. אל תעדכן צבעים קבועים - השתמש בהעדפות!', 'color: #e74c3c; margin-left: 20px; font-weight: bold;');

console.log('\n%c🚀 בדיקה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');
