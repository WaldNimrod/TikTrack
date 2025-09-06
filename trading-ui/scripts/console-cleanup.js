/**
 * Console Cleanup Utility - Updated for Built-in System Integration
 * מנקה את ה-console ומספק פונקציות עזר לניקוי - מעודכן למערכת המובנית
 */

// דגל למניעת ניקוי console במהלך טעינת הדף
let isPageInitializing = true;

// פונקציה לניקוי console - מעודכנת למערכת המובנית
function clearConsole() {
  // אל תבצע ניקוי console במהלך טעינת הדף
  if (isPageInitializing) {
    // console.log('🚫 ניקוי console נחסם במהלך טעינת הדף');
    return;
  }

  // בדוק אם יש מערכת מובנית לניקוי console
  if (window.manualClearConsole) {
    // console.log('ℹ️ ניקוי console מבוצע דרך המערכת המובנית');
    window.manualClearConsole();
  } else {
    // console.log('ℹ️ מערכת מובנית לא זמינה - ניקוי console מבוטל');
  }
}

// פונקציה להסתרת הודעות console בפיתוח
function suppressConsoleMessages() {
  if (typeof console !== 'undefined') {
    const settings = getConsoleSettings();
    const duration = (settings.suppressDuration || 5) * 1000;

    // Store original console methods for potential restoration
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    // Override console methods to use notification system instead
    const logSystem = {
      log: (...args) => {
        if (typeof window.showNotification === 'function') {
          window.showNotification(args.join(' '), 'info');
        }
      },
      warn: (...args) => {
        if (typeof window.showNotification === 'function') {
          window.showNotification(args.join(' '), 'warning');
        }
      },
      error: (...args) => {
        if (typeof window.showNotification === 'function') {
          window.showNotification(args.join(' '), 'error');
        }
      },
    };

    console.log = logSystem.log;
    console.warn = logSystem.warn;
    console.error = logSystem.error;

    // Show notification about console suppression
    if (typeof window.showNotification === 'function') {
      window.showNotification(`הודעות קונסול מוסתרות ל-${duration/1000} שניות`, 'info');
    }

    // החזרת הפונקציות המקוריות אחרי הזמן שהוגדר
    setTimeout(() => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      // Show notification about console restoration
      if (typeof window.showNotification === 'function') {
        window.showNotification('הודעות קונסול הופעלו מחדש', 'info');
      }
    }, duration);
  }
}

// פונקציה להצגת הודעות console בפיתוח
function enableConsoleMessages() {
  if (typeof console !== 'undefined') {
    // console.log('Console messages enabled');
  }
}

// פונקציה לניקוי אוטומטי לפי הגדרות - מעודכנת למערכת המובנית
function autoClearConsole() {
  // אל תפעיל ניקוי אוטומטי במהלך טעינת הדף
  if (isPageInitializing) {
    // console.log('🚫 ניקוי אוטומטי נחסם במהלך טעינת הדף');
    return;
  }

  const settings = getConsoleSettings();
  if (settings.autoClear && settings.clearInterval > 0) {
    // עצור טיימר קיים אם יש
    if (window.consoleClearTimer) {
      clearInterval(window.consoleClearTimer);
    }

    // הפעל טיימר חדש - ללא ניקוי קונסול ישיר
    window.consoleClearTimer = setInterval(() => {
      // console.log('🧹 ניקוי אוטומטי מבוטל - פועל דרך המערכת המובנית - ' + new Date().toLocaleTimeString());

      // בדוק אם יש מערכת מובנית לניקוי console
      if (window.manualClearConsole) {
        window.manualClearConsole();
      }
    }, settings.clearInterval * 1000);

    // console.log('🔄 ניקוי אוטומטי של קונסול מופעל - כל ' + settings.clearInterval + ' שניות');
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
    // console.log('⏹️ ניקוי אוטומטי של קונסול נעצר');
  }
}

// פונקציה לקבלת הגדרות console
function getConsoleSettings() {
  const defaultSettings = {
    autoClear: false, // ברירת מחדל: לא לפעיל ניקוי אוטומטי
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

// אתחול אוטומטי - מעודכן למערכת המובנית
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

  // וודא שהגדרות ברירת המחדל לא מפעילות ניקוי אוטומטי
  const currentSettings = getConsoleSettings();
  if (currentSettings.autoClear) {
    // אם יש הגדרה לשמירת ניקוי אוטומטי, בטל אותה בטעינת הדף
    currentSettings.autoClear = false;
    saveConsoleSettings(currentSettings);
    console.log('⚠️ ניקוי אוטומטי בוטל בטעינת הדף - נדרש הפעלה ידנית');
  }

  // אל תפעיל ניקוי אוטומטי בטעינת הדף - רק אם המשתמש מפעיל במפורש
  console.log('Console cleanup utility loaded - manual control only - integrated with built-in system');

  // המתן קצת לפני שחרור הדגל למניעת ניקוי console
  setTimeout(() => {
    isPageInitializing = false; // סיימנו את טעינת הדף
    console.log('✅ הדגל למניעת ניקוי console שוחרר - מערכת מובנית פעילה');

    // בדוק אם יש מערכת מובנית לניקוי console
    if (window.manualClearConsole) {
      console.log('🔗 מערכת מובנית לניקוי console זמינה (preferences-v2.js)');
    } else {
      console.log('ℹ️ מערכת מובנית לניקוי console לא זמינה - ניקוי ידני בלבד');
    }
  }, 5000); // הגדלתי ל-5 שניות כדי לוודא שכל הסקריפטים נטענו
});

