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

  console.log('🧹 מנקה console...');
  
  // בדוק אם יש מערכת מובנית לניקוי console
  if (window.manualClearConsole) {
    window.manualClearConsole();
    console.log('✅ ניקוי console בוצע בהצלחה');
    if (typeof window.showNotification === 'function') {
      window.showNotification('ניקוי console בוצע בהצלחה', 'success', 'ניקוי זיכרון', 2000, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: ניקוי console בוצע בהצלחה');
    }
  } else {
    console.log('⚠️ מערכת ניקוי console לא זמינה');
    if (typeof window.showNotification === 'function') {
      window.showNotification('מערכת ניקוי console לא זמינה', 'warning', 'ניקוי זיכרון', 3000, 'system');
    } else {
      console.log('🔔 הודעת אזהרה: מערכת ניקוי console לא זמינה');
    }
  }
}

// פונקציה להסתרת הודעות console בפיתוח - מבוטלת זמנית לצורך פיתוח
function suppressConsoleMessages() {
  // ❌ פונקציה מבוטלת זמנית לצורך פיתוח
  console.log('⚠️ suppressConsoleMessages מבוטלת - הקונסולה פעילה לצורך פיתוח');
  return;
  
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
          window.showNotification(args.join(' '), 'info', 'מידע', 4000, 'system');
        }
      },
      warn: (...args) => {
        if (typeof window.showNotification === 'function') {
          window.showNotification(args.join(' '), 'warning', 'אזהרה', 5000, 'system');
        }
      },
      error: (...args) => {
        if (typeof window.showNotification === 'function') {
          window.showNotification(args.join(' '), 'error', 'שגיאה', 6000, 'system');
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
async function getConsoleSettings() {
  const defaultSettings = {
    autoClear: false, // ברירת מחדל: לא לפעיל ניקוי אוטומטי
    clearInterval: 60, // שניות
    suppressMessages: false, // ❌ מבוטל זמנית לצורך פיתוח
    suppressDuration: 5, // שניות
  };

  let savedSettings = null;
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    savedSettings = await window.UnifiedCacheManager.get('consoleSettings');
  } else {
    savedSettings = localStorage.getItem('consoleSettings'); // fallback
  }
  return savedSettings ? { ...defaultSettings, ...(typeof savedSettings === 'string' ? JSON.parse(savedSettings) : savedSettings) } : defaultSettings;
}

// פונקציה לשמירת הגדרות console
async function saveConsoleSettings(settings) {
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    await window.UnifiedCacheManager.save('consoleSettings', settings, {
      layer: 'localStorage',
      ttl: null, // persistent
      syncToBackend: false
    });
  } else {
    localStorage.setItem('consoleSettings', JSON.stringify(settings)); // fallback
  }
}

// אתחול אוטומטי - מעודכן למערכת המובנית
// DOMContentLoaded removed - exports and initialization done immediately

// Export functions to global scope immediately (no need to wait for DOM)
window.clearConsole = clearConsole;
window.suppressConsoleMessages = suppressConsoleMessages;
window.enableConsoleMessages = enableConsoleMessages;
window.autoClearConsole = autoClearConsole;
window.stopAutoClearConsole = stopAutoClearConsole;
window.getConsoleSettings = getConsoleSettings;
window.saveConsoleSettings = saveConsoleSettings;

// Stop any auto-clear on load
stopAutoClearConsole();

// Ensure default settings don't enable auto-clear
const currentSettings = getConsoleSettings();
if (currentSettings.autoClear) {
  currentSettings.autoClear = false;
  saveConsoleSettings(currentSettings);
  console.log('⚠️ ניקוי אוטומטי בוטל בטעינת הדף - נדרש הפעלה ידנית');
}

console.log('Console cleanup utility loaded - manual control only');

