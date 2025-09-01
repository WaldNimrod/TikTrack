/**
 * Console Cleanup Utility
 * מנקה את ה-console ומספק פונקציות עזר לניקוי
 */

// פונקציה לניקוי console
function clearConsole() {
  if (typeof console !== 'undefined') {
    console.clear();
  }
}

// פונקציה להסתרת הודעות console בפיתוח
function suppressConsoleMessages() {
  if (typeof console !== 'undefined') {
    const settings = getConsoleSettings();
    const duration = (settings.suppressDuration || 5) * 1000;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};

    console.log('🔇 הודעות קונסול מוסתרות ל-' + duration/1000 + ' שניות');

    // החזרת הפונקציות המקוריות אחרי הזמן שהוגדר
    setTimeout(() => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.log('🔊 הודעות קונסול הופעלו מחדש');
    }, duration);
  }
}

// פונקציה להצגת הודעות console בפיתוח
function enableConsoleMessages() {
  if (typeof console !== 'undefined') {
    console.log('Console messages enabled');
  }
}

// פונקציה לניקוי אוטומטי לפי הגדרות
function autoClearConsole() {
  const settings = getConsoleSettings();
  if (settings.autoClear && settings.clearInterval > 0) {
    // עצור טיימר קיים אם יש
    if (window.consoleClearTimer) {
      clearInterval(window.consoleClearTimer);
    }

    // הפעל טיימר חדש
    window.consoleClearTimer = setInterval(() => {
      clearConsole();
      console.log('🧹 ניקוי אוטומטי של קונסול - ' + new Date().toLocaleTimeString());
    }, settings.clearInterval * 1000);

    console.log('🔄 ניקוי אוטומטי של קונסול מופעל - כל ' + settings.clearInterval + ' שניות');
  } else {
    // עצור ניקוי אוטומטי אם לא מופעל
    stopAutoClearConsole();
  }
}

// פונקציה לעצירת ניקוי אוטומטי
function stopAutoClearConsole() {
  if (window.consoleClearTimer) {
    clearInterval(window.consoleClearTimer);
    window.consoleClearTimer = null;
    console.log('⏹️ ניקוי אוטומטי של קונסול נעצר');
  }
}

// פונקציה לקבלת הגדרות console
function getConsoleSettings() {
  const defaultSettings = {
    autoClear: false,
    clearInterval: 60, // שניות
    suppressMessages: false,
    suppressDuration: 5, // שניות
  };

  const savedSettings = localStorage.getItem('consoleSettings');
  return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
}

// פונקציה לשמירת הגדרות console
function saveConsoleSettings(settings) {
  localStorage.setItem('consoleSettings', JSON.stringify(settings));
}

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
  // הוספת פונקציות ל-global scope
  window.clearConsole = clearConsole;
  window.suppressConsoleMessages = suppressConsoleMessages;
  window.enableConsoleMessages = enableConsoleMessages;
  window.autoClearConsole = autoClearConsole;
  window.stopAutoClearConsole = stopAutoClearConsole;
  window.getConsoleSettings = getConsoleSettings;
  window.saveConsoleSettings = saveConsoleSettings;

  // עצור כל ניקוי אוטומטי קיים בטעינת הדף
  stopAutoClearConsole();

  // אל תפעיל ניקוי אוטומטי בטעינת הדף - רק אם המשתמש מפעיל במפורש
  console.log('Console cleanup utility loaded - manual control only');
});

