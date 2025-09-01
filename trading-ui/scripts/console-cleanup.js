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
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};

    // החזרת הפונקציות המקוריות אחרי 5 שניות
    setTimeout(() => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }, 5000);
  }
}

// פונקציה להצגת הודעות console בפיתוח
function enableConsoleMessages() {
  if (typeof console !== 'undefined') {
    console.log('Console messages enabled');
  }
}

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
  // ניקוי console בטעינת הדף
  clearConsole();

  // הוספת פונקציות ל-global scope
  window.clearConsole = clearConsole;
  window.suppressConsoleMessages = suppressConsoleMessages;
  window.enableConsoleMessages = enableConsoleMessages;

  console.log('Console cleanup utility loaded');
});

