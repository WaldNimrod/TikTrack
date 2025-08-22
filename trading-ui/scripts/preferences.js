/**
 * ===== TikTrack Preferences Management System =====
 * 
 * This file contains all client-side functionality for the TikTrack preferences page.
 * It provides a comprehensive system for managing user preferences, section states,
 * change tracking, and API communication.
 * 
 * Architecture:
 * - Clean separation from HTML structure
 * - Modular function organization
 * - Comprehensive error handling
 * - Real-time change tracking
 * - State persistence via localStorage
 * 
 * @file preferences.js
 * @version 1.0
 * @author TikTrack Development Team
 * @since August 2025
 */

/**
 * Updates the primary currency setting in the system
 * 
 * This function is called when the user changes the primary currency selection.
 * It enforces the USD-only restriction and provides user feedback.
 * 
 * @param {string} value - The new currency value (restricted to USD only)
 * @returns {Promise<void>}
 * 
 * @example
 * // Update primary currency (only USD allowed)
 * updatePrimaryCurrency('USD');
 * 
 * @example
 * // Attempt to update to non-USD currency (will be rejected)
 * updatePrimaryCurrency('EUR'); // Shows error message and reverts
 */
async function updatePrimaryCurrency(value) {
  console.log('🔄 עדכון מטבע ראשי:', value);

  // בדיקה - רק USD מותר
  if (value !== 'USD') {
    showNotification('❌ לא ניתן לשנות את המטבע הראשי. המערכת תומכת רק ב-USD (דולר אמריקאי)', 'error');

    // החזרת הערך ל-USD
    const selectElement = document.getElementById('primaryCurrencySelect');
    if (selectElement) {
      selectElement.value = 'USD';
    }

    return;
  }

  // מסמן שיש שינויים
  markAsChanged();

  // מציאת אלמנטי הממשק
  const selectElement = document.getElementById('primaryCurrencySelect');
  const preferenceItem = selectElement.closest('.preference-item');

  // הוספת מצב טעינה לממשק
  preferenceItem.classList.add('loading');

  try {
    // שמירת ההגדרה החדשה לשרת
    const success = await savePreference('primaryCurrency', value);

    if (success) {
      // עדכון התצוגה עם הערך החדש
      selectElement.value = value;
      showNotification(`מטבע ראשי עודכן ל-${value}`, 'success');
      console.log('✅ מטבע ראשי עודכן בהצלחה');
    } else {
      // אם השמירה נכשלה, החזרת הערך הקודם
      const currentValue = await getCurrentPreference('primaryCurrency');
      selectElement.value = currentValue;
      showNotification('שגיאה בעדכון מטבע ראשי', 'error');
    }
  } catch (error) {
    console.error('❌ שגיאה בעדכון מטבע ראשי:', error);
    showNotification('שגיאה בעדכון מטבע ראשי', 'error');
  } finally {
    // הסרת מצב הטעינה מהממשק
    preferenceItem.classList.remove('loading');
  }
}

/**
       * מעדכן את אזור הזמן במערכת
       * 
       * פונקציה זו נקראת כאשר המשתמש משנה את אזור הזמן
       * היא שומרת את ההגדרה החדשה לשרת ומציגה משוב למשתמש
       * 
       * @param {string} value - אזור הזמן החדש (למשל: 'Asia/Jerusalem')
       * @returns {Promise<void>}
       * 
       * @example
       * // עדכון אזור זמן לישראל
       * updateTimezone('Asia/Jerusalem');
       */
async function updateTimezone(value) {
  console.log('🔄 עדכון אזור זמן:', value);

  // מסמן שיש שינויים
  markAsChanged();

  // מציאת אלמנטי הממשק
  const selectElement = document.getElementById('timezoneSelect');
  const preferenceItem = selectElement.closest('.preference-item');

  // הוספת מצב טעינה לממשק
  preferenceItem.classList.add('loading');

  try {
    // שמירת ההגדרה החדשה לשרת
    const success = await savePreference('timezone', value);

    if (success) {
      // עדכון התצוגה עם הערך החדש
      selectElement.value = value;
      showNotification(`אזור זמן עודכן ל-${value}`, 'success');
      console.log('✅ אזור זמן עודכן בהצלחה');
    } else {
      // אם השמירה נכשלה, החזרת הערך הקודם
      const currentValue = await getCurrentPreference('timezone');
      selectElement.value = currentValue;
      showNotification('שגיאה בעדכון אזור זמן', 'error');
    }
  } catch (error) {
    console.error('❌ שגיאה בעדכון אזור זמן:', error);
    showNotification('שגיאה בעדכון אזור זמן', 'error');
  } finally {
    // הסרת מצב הטעינה מהממשק
    preferenceItem.classList.remove('loading');
  }
}

/**
 * מעדכן את זמן ניקוי הקונסולה במערכת
 * 
 * פונקציה זו נקראת כאשר המשתמש משנה את זמן ניקוי הקונסולה
 * היא שומרת את ההגדרה החדשה לשרת ומציגה משוב למשתמש
 * 
 * @param {string} value - זמן הניקוי החדש במילישניות (למשל: '60000' לדקה אחת)
 * @returns {Promise<void>}
 * 
 * @example
 * // עדכון זמן ניקוי לדקה אחת
 * updateConsoleCleanupInterval('60000');
 * 
 * @example
 * // ביטול ניקוי אוטומטי
 * updateConsoleCleanupInterval('0');
 */
async function updateConsoleCleanupInterval(value) {
  console.log('🔄 עדכון זמן ניקוי קונסולה:', value);

  // וידוא שהערך תקין
  const numValue = parseInt(value);
  if (isNaN(numValue) || numValue < 0) {
    showNotification('זמן ניקוי הקונסולה חייב להיות מספר חיובי או 0', 'error');
    return;
  }

  // מסמן שיש שינויים
  markAsChanged();

  // מציאת אלמנטי הממשק
  const selectElement = document.getElementById('consoleCleanupIntervalSelect');
  const preferenceItem = selectElement.closest('.preference-item');

  // הוספת מצב טעינה לממשק
  preferenceItem.classList.add('loading');

  try {
    // שמירת ההגדרה החדשה לשרת
    const success = await savePreference('consoleCleanupInterval', numValue);

    if (success) {
      // עדכון התצוגה עם הערך החדש
      selectElement.value = value;

      // עדכון המערכת הגלובלית
      if (typeof window.updateConsoleCleanupInterval === 'function') {
        await window.updateConsoleCleanupInterval(numValue);
      }

      // הצגת הודעה מתאימה
      if (numValue === 0) {
        showNotification('ניקוי אוטומטי של הקונסולה בוטל', 'success');
      } else {
        const seconds = Math.floor(numValue / 1000);
        showNotification(`זמן ניקוי קונסולה עודכן ל-${seconds} שניות`, 'success');
      }

      console.log('✅ זמן ניקוי קונסולה עודכן בהצלחה');
    } else {
      // אם השמירה נכשלה, החזרת הערך הקודם
      const currentValue = await getCurrentPreference('consoleCleanupInterval');
      selectElement.value = currentValue;
      showNotification('שגיאה בעדכון זמן ניקוי קונסולה', 'error');
    }
  } catch (error) {
    console.error('❌ שגיאה בעדכון זמן ניקוי קונסולה:', error);
    showNotification('שגיאה בעדכון זמן ניקוי קונסולה', 'error');
  } finally {
    // הסרת מצב הטעינה מהממשק
    preferenceItem.classList.remove('loading');
  }
}

/**
       * מעדכן את הסטופ לוס ברירת המחדל במערכת
       * 
       * פונקציה זו נקראת כאשר המשתמש משנה את אחוז הסטופ לוס ברירת המחדל
       * היא שומרת את ההגדרה החדשה לשרת ומציגה משוב למשתמש
       * 
       * @param {number} value - אחוז הסטופ לוס החדש (0-100)
       * @returns {Promise<void>}
       * 
       * @example
       * // עדכון סטופ לוס ברירת מחדל ל-15%
       * updateDefaultStopLoss(15);
       */
async function updateDefaultStopLoss(value) {
  console.log('🔄 עדכון סטופ לוס ברירת מחדל:', value);

  // וידוא שהערך תקין
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    showNotification('אחוז הסטופ לוס חייב להיות בין 0 ל-100', 'error');
    return;
  }

  // מסמן שיש שינויים
  markAsChanged();

  // מציאת אלמנטי הממשק
  const inputElement = document.getElementById('defaultStopLossInput');
  const preferenceItem = inputElement.closest('.preference-item');

  // הוספת מצב טעינה לממשק
  preferenceItem.classList.add('loading');

  try {
    // שמירת ההגדרה החדשה לשרת
    const success = await savePreference('defaultStopLoss', numValue);

    if (success) {
      // עדכון התצוגה עם הערך החדש
      inputElement.value = numValue;
      showNotification(`סטופ לוס ברירת מחדל עודכן ל-${numValue}%`, 'success');
      console.log('✅ סטופ לוס ברירת מחדל עודכן בהצלחה');
    } else {
      // אם השמירה נכשלה, החזרת הערך הקודם
      const currentValue = await getCurrentPreference('defaultStopLoss');
      inputElement.value = currentValue;
      showNotification('שגיאה בעדכון סטופ לוס ברירת מחדל', 'error');
    }
  } catch (error) {
    console.error('❌ שגיאה בעדכון סטופ לוס ברירת מחדל:', error);
    showNotification('שגיאה בעדכון סטופ לוס ברירת מחדל', 'error');
  } finally {
    // הסרת מצב הטעינה מהממשק
    preferenceItem.classList.remove('loading');
  }
}

/**
       * מעדכן את מחיר היעד ברירת המחדל במערכת
       * 
       * פונקציה זו נקראת כאשר המשתמש משנה את אחוז מחיר היעד ברירת המחדל
       * היא שומרת את ההגדרה החדשה לשרת ומציגה משוב למשתמש
       * 
       * @param {number} value - אחוז מחיר היעד החדש (0-100)
       * @returns {Promise<void>}
       * 
       * @example
       * // עדכון מחיר יעד ברירת מחדל ל-20%
       * updateDefaultTargetPrice(20);
       */
async function updateDefaultTargetPrice(value) {
  console.log('🔄 עדכון מחיר יעד ברירת מחדל:', value);

  // וידוא שהערך תקין
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    showNotification('אחוז מחיר היעד חייב להיות בין 0 ל-100', 'error');
    return;
  }

  // מסמן שיש שינויים
  markAsChanged();

  // מציאת אלמנטי הממשק
  const inputElement = document.getElementById('defaultTargetPriceInput');
  const preferenceItem = inputElement.closest('.preference-item');

  // הוספת מצב טעינה לממשק
  preferenceItem.classList.add('loading');

  try {
    // שמירת ההגדרה החדשה לשרת
    const success = await savePreference('defaultTargetPrice', numValue);

    if (success) {
      // עדכון התצוגה עם הערך החדש
      inputElement.value = numValue;
      showNotification(`מחיר יעד ברירת מחדל עודכן ל-${numValue}%`, 'success');
      console.log('✅ מחיר יעד ברירת מחדל עודכן בהצלחה');
    } else {
      // אם השמירה נכשלה, החזרת הערך הקודם
      const currentValue = await getCurrentPreference('defaultTargetPrice');
      inputElement.value = currentValue;
      showNotification('שגיאה בעדכון מחיר יעד ברירת מחדל', 'error');
    }
  } catch (error) {
    console.error('❌ שגיאה בעדכון מחיר יעד ברירת מחדל:', error);
    showNotification('שגיאה בעדכון מחיר יעד ברירת מחדל', 'error');
  } finally {
    // הסרת מצב הטעינה מהממשק
    preferenceItem.classList.remove('loading');
  }
}

/**
 * טוען את ההעדפות מהשרת ומעדכן את ממשק המשתמש
 * 
 * פונקציה זו נקראת בעת טעינת הדף ומעדכנת את כל אלמנטי הממשק
 * עם הערכים הנוכחיים של ההעדפות מהשרת
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // טעינת העדפות לממשק
 * await loadPreferencesToUI();
 */
async function loadPreferencesToUI() {
  try {
    console.log('🔄 טוען העדפות לממשק...');

    // טעינת העדפות מהשרת
    const response = await fetch('/api/preferences');
    if (response.ok) {
      const preferences = await response.json();

      // עדכון ממשק המשתמש עם הערכים הנוכחיים
      const currencySelect = document.getElementById('primaryCurrencySelect');
      if (currencySelect) {
        // שימוש בהגדרת המשתמש או ברירת המחדל
        const currentCurrency = preferences.user.primaryCurrency || preferences.defaults.primaryCurrency;
        currencySelect.value = currentCurrency;
        console.log('✅ מטבע ראשי נטען:', currentCurrency);
      }

      // עדכון אזור זמן
      const timezoneSelect = document.getElementById('timezoneSelect');
      if (timezoneSelect) {
        // שימוש בהגדרת המשתמש או ברירת המחדל
        const currentTimezone = preferences.user.timezone || preferences.defaults.timezone;
        timezoneSelect.value = currentTimezone;
        console.log('✅ אזור זמן נטען:', currentTimezone);
      }

      // עדכון זמן ניקוי קונסולה
      const consoleCleanupSelect = document.getElementById('consoleCleanupIntervalSelect');
      if (consoleCleanupSelect) {
        // שימוש בהגדרת המשתמש או ברירת המחדל
        const currentCleanupInterval = preferences.user.consoleCleanupInterval || preferences.defaults.consoleCleanupInterval || 60000;
        consoleCleanupSelect.value = currentCleanupInterval;
        console.log('✅ זמן ניקוי קונסולה נטען:', currentCleanupInterval);
      }

      // עדכון סטופ לוס ברירת מחדל
      const stopLossInput = document.getElementById('defaultStopLossInput');
      if (stopLossInput) {
        const currentStopLoss = preferences.user.defaultStopLoss || preferences.defaults.defaultStopLoss;
        stopLossInput.value = currentStopLoss;
        console.log('✅ סטופ לוס ברירת מחדל נטען:', currentStopLoss);
      }

      // עדכון מחיר יעד ברירת מחדל
      const targetPriceInput = document.getElementById('defaultTargetPriceInput');
      if (targetPriceInput) {
        const currentTargetPrice = preferences.user.defaultTargetPrice || preferences.defaults.defaultTargetPrice;
        targetPriceInput.value = currentTargetPrice;
        console.log('✅ מחיר יעד ברירת מחדל נטען:', currentTargetPrice);
      }

      // עדכון הגדרות תצוגה
      const statusFilterSelect = document.getElementById('defaultStatusFilterSelect');
      if (statusFilterSelect) {
        const currentStatusFilter = preferences.user.defaultStatusFilter || preferences.defaults.defaultStatusFilter || 'all';
        statusFilterSelect.value = currentStatusFilter;
        console.log('✅ פילטר סטטוס ברירת מחדל נטען:', currentStatusFilter);
      }

      const typeFilterSelect = document.getElementById('defaultTypeFilterSelect');
      if (typeFilterSelect) {
        const currentTypeFilter = preferences.user.defaultTypeFilter || preferences.defaults.defaultTypeFilter || 'all';
        typeFilterSelect.value = currentTypeFilter;
        console.log('✅ פילטר סוג ברירת מחדל נטען:', currentTypeFilter);
      }

      const accountFilterSelect = document.getElementById('defaultAccountFilterSelect');
      if (accountFilterSelect) {
        const currentAccountFilter = preferences.user.defaultAccountFilter || preferences.defaults.defaultAccountFilter || 'all';
        accountFilterSelect.value = currentAccountFilter;
        console.log('✅ פילטר חשבון ברירת מחדל נטען:', currentAccountFilter);
      }

      const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilterSelect');
      if (dateRangeFilterSelect) {
        const currentDateRangeFilter = preferences.user.defaultDateRangeFilter || preferences.defaults.defaultDateRangeFilter || 'all';
        dateRangeFilterSelect.value = currentDateRangeFilter;
        console.log('✅ פילטר טווח תאריכים ברירת מחדל נטען:', currentDateRangeFilter);
      }

      const searchFilterInput = document.getElementById('defaultSearchFilterInput');
      if (searchFilterInput) {
        const currentSearchFilter = preferences.user.defaultSearchFilter || preferences.defaults.defaultSearchFilter || '';
        searchFilterInput.value = currentSearchFilter;
        console.log('✅ פילטר חיפוש ברירת מחדל נטען:', currentSearchFilter);
      }

      console.log('✅ העדפות נטענו לממשק בהצלחה');
    } else {
      console.error('❌ שגיאה בטעינת העדפות מהשרת:', response.status);
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת העדפות לממשק:', error);
  }
}

/**
 * שומר את כל ההעדפות לשרת
 * 
 * פונקציה זו שומרת את כל ההעדפות הנוכחיות לשרת
 * נקראת בעת לחיצה על כפתור "שמור הכל"
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // שמירת כל ההעדפות
 * await saveAllPreferences();
 */
async function saveAllPreferences() {
  console.log('🔄 שומר את כל ההעדפות...');

  try {
    let allSaved = true;
    const savedPreferences = [];

    // שמירת הגדרות מערכת
    const primaryCurrencySelect = document.getElementById('primaryCurrencySelect');
    if (primaryCurrencySelect) {
      const success = await savePreference('primaryCurrency', primaryCurrencySelect.value);
      if (success) {
        savedPreferences.push('מטבע ראשי');
      } else {
        allSaved = false;
      }
    }

    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) {
      const success = await savePreference('timezone', timezoneSelect.value);
      if (success) {
        savedPreferences.push('אזור זמן');
      } else {
        allSaved = false;
      }
    }

    // שמירת הגדרות אישיות
    const stopLossInput = document.getElementById('defaultStopLossInput');
    if (stopLossInput) {
      const success = await savePreference('defaultStopLoss', parseFloat(stopLossInput.value));
      if (success) {
        savedPreferences.push('סטופ ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    const targetPriceInput = document.getElementById('defaultTargetPriceInput');
    if (targetPriceInput) {
      const success = await savePreference('defaultTargetPrice', parseFloat(targetPriceInput.value));
      if (success) {
        savedPreferences.push('מחיר יעד ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    // שמירת הגדרות תצוגה
    const statusFilterSelect = document.getElementById('defaultStatusFilterSelect');
    if (statusFilterSelect) {
      const success = await savePreference('defaultStatusFilter', statusFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר סטטוס ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    const typeFilterSelect = document.getElementById('defaultTypeFilterSelect');
    if (typeFilterSelect) {
      const success = await savePreference('defaultTypeFilter', typeFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר סוג ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    const accountFilterSelect = document.getElementById('defaultAccountFilterSelect');
    if (accountFilterSelect) {
      const success = await savePreference('defaultAccountFilter', accountFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר חשבונות ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilterSelect');
    if (dateRangeFilterSelect) {
      const success = await savePreference('defaultDateRangeFilter', dateRangeFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר טווח תאריכים ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    const searchFilterInput = document.getElementById('defaultSearchFilterInput');
    if (searchFilterInput) {
      const success = await savePreference('defaultSearchFilter', searchFilterInput.value);
      if (success) {
        savedPreferences.push('פילטר חיפוש ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    if (allSaved) {
      showNotification(`✅ כל ההגדרות נשמרו בהצלחה! (${savedPreferences.length} הגדרות)`, 'success');
      console.log('✅ כל ההגדרות נשמרו בהצלחה:', savedPreferences);
      markAsSaved(); // מסמן שכל השינויים נשמרו
    } else {
      showNotification('⚠️ חלק מההגדרות לא נשמרו. בדוק את הקונסול לפרטים.', 'error');
      console.error('❌ חלק מההגדרות לא נשמרו');
    }

  } catch (error) {
    console.error('❌ שגיאה בשמירת ההגדרות:', error);
    showNotification('❌ שגיאה בשמירת ההגדרות', 'error');
  }
}

/**
 * שומר הגדרה ספציפית לשרת
 * 
 * פונקציה זו שולחת בקשה לשרת לשמירת הגדרה ספציפית
 * ומחזירה true אם השמירה הצליחה, false אם נכשלה
 * 
 * @param {string} key - מפתח ההגדרה (למשל: 'primaryCurrency')
 * @param {any} value - ערך ההגדרה החדש
 * @returns {Promise<boolean>} - true אם השמירה הצליחה, false אם נכשלה
 * 
 * @example
 * // שמירת מטבע ראשי
 * const success = await savePreference('primaryCurrency', 'ILS');
 * if (success) {
 *   console.log('המטבע נשמר בהצלחה');
 * }
 */
async function savePreference(key, value) {
  try {
    console.log(`🔄 שומר הגדרה: ${key} = ${value}`);

    // שליחת בקשה לשרת
    const response = await fetch(`/api/preferences/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: value })
    });

    if (response.ok) {
      console.log(`✅ הגדרה ${key} נשמרה בהצלחה`);
      return true;
    } else {
      console.error(`❌ שגיאה בשמירת הגדרה ${key}:`, response.status);
      return false;
    }
  } catch (error) {
    console.error(`❌ שגיאה בשמירת הגדרה ${key}:`, error);
    return false;
  }
}

/**
 * מקבל את הערך הנוכחי של הגדרה מהשרת
 * 
 * פונקציה זו שולחת בקשה לשרת לקבלת הערך הנוכחי של הגדרה ספציפית
 * 
 * @param {string} key - מפתח ההגדרה
 * @returns {Promise<any>} - ערך ההגדרה הנוכחי
 * 
 * @example
 * // קבלת מטבע ראשי נוכחי
 * const currency = await getCurrentPreference('primaryCurrency');
 * console.log('מטבע נוכחי:', currency);
 */
async function getCurrentPreference(key) {
  try {
    const response = await fetch('/api/preferences');
    if (response.ok) {
      const preferences = await response.json();
      return preferences.user[key] || preferences.defaults[key];
    }
    return null;
  } catch (error) {
    console.error(`❌ שגיאה בקבלת הגדרה ${key}:`, error);
    return null;
  }
}

/**
 * מציג הודעת התראה למשתמש
 * 
 * פונקציה זו יוצרת הודעת התראה זמנית בפינה הימנית העליונה של המסך
 * ההודעה נעלמת אוטומטית אחרי 3 שניות
 * 
 * @param {string} message - טקסט ההודעה להצגה
 * @param {string} type - סוג ההודעה: 'success' (ירוק) או 'error' (אדום)
 * 
 * @example
 * // הצגת הודעת הצלחה
 * showNotification('הגדרות נשמרו בהצלחה', 'success');
 * 
 * // הצגת הודעת שגיאה
 * showNotification('שגיאה בשמירת הגדרות', 'error');
*/
function showNotification(message, type = 'success') {
  try {
    // יצירת אלמנט ההודעה
    const notification = document.createElement('div');

    // הגדרת צבעים לפי סוג ההודעה
    const bgColor = type === 'error' ? '#f8d7da' : '#d4edda';
    const textColor = type === 'error' ? '#721c24' : '#155724';
    const borderColor = type === 'error' ? '#f5c6cb' : '#c3e6cb';

    // הגדרת סגנונות ההודעה
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 20px;
      border-radius: 8px;
      background-color: ${bgColor};
      color: ${textColor};
      border: 1px solid ${borderColor};
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s ease;
      opacity: 0;
    `;

    // הוספת הטקסט להודעה
    notification.textContent = message;
    document.body.appendChild(notification);

    // הצגת ההודעה עם אנימציה
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 100);

    // הסתרת ההודעה אחרי 3 שניות
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);

  } catch (error) {
    console.error('❌ שגיאה בהצגת הודעה:', error);
  }
}

async function resetSystemPreferences() {
  console.log('🔄 איפוס הגדרות מערכת לברירות מחדל');

  // איפוס מטבע ראשי - תמיד USD
  const primaryCurrencySelect = document.getElementById('primaryCurrencySelect');
  if (primaryCurrencySelect) {
    primaryCurrencySelect.value = 'USD';
    await savePreference('primaryCurrency', 'USD');
    showNotification('מטבע ראשי אופס ל-USD (דולר אמריקאי)', 'success');
  }

  // איפוס אזור זמן - ברירת מחדל ישראל
  const timezoneSelect = document.getElementById('timezoneSelect');
  if (timezoneSelect) {
    timezoneSelect.value = 'Asia/Jerusalem';
    await savePreference('timezone', 'Asia/Jerusalem');
    showNotification('אזור זמן אופס לישראל', 'success');
  }

  showNotification('הגדרות מערכת אופסו ונשמרו לברירות מחדל', 'success');
  markAsSaved(); // מסמן שכל השינויים נשמרו
}

async function saveSystemPreferences() {
  console.log('🔄 שומר הגדרות מערכת...');

  try {
    let allSaved = true;
    const savedPreferences = [];

    // שמירת מטבע ראשי
    const primaryCurrencySelect = document.getElementById('primaryCurrencySelect');
    if (primaryCurrencySelect) {
      const success = await savePreference('primaryCurrency', primaryCurrencySelect.value);
      if (success) {
        savedPreferences.push('מטבע ראשי');
      } else {
        allSaved = false;
      }
    }

    // שמירת אזור זמן
    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) {
      const success = await savePreference('timezone', timezoneSelect.value);
      if (success) {
        savedPreferences.push('אזור זמן');
      } else {
        allSaved = false;
      }
    }

    if (allSaved) {
      showNotification(`✅ הגדרות מערכת נשמרו בהצלחה! (${savedPreferences.length} הגדרות)`, 'success');
      markAsSaved(); // מסמן שכל השינויים נשמרו
    } else {
      showNotification('⚠️ חלק מהגדרות המערכת לא נשמרו', 'error');
    }

  } catch (error) {
    console.error('❌ שגיאה בשמירת הגדרות מערכת:', error);
    showNotification('❌ שגיאה בשמירת הגדרות מערכת', 'error');
  }
}

async function resetPersonalPreferences() {
  console.log('🔄 איפוס הגדרות אישיות לברירות מחדל');

  // איפוס סטופ ברירת מחדל - 5%
  const stopLossInput = document.getElementById('defaultStopLossInput');
  if (stopLossInput) {
    stopLossInput.value = '5';
    await savePreference('defaultStopLoss', 5);
    showNotification('סטופ ברירת מחדל אופס ל-5%', 'success');
  }

  // איפוס מחיר יעד ברירת מחדל - 10%
  const targetPriceInput = document.getElementById('defaultTargetPriceInput');
  if (targetPriceInput) {
    targetPriceInput.value = '10';
    await savePreference('defaultTargetPrice', 10);
    showNotification('מחיר יעד ברירת מחדל אופס ל-10%', 'success');
  }

  showNotification('הגדרות אישיות אופסו ונשמרו לברירות מחדל', 'success');
  markAsSaved(); // מסמן שכל השינויים נשמרו
}

async function savePersonalPreferences() {
  console.log('🔄 שומר הגדרות אישיות...');

  try {
    let allSaved = true;
    const savedPreferences = [];

    // שמירת סטופ ברירת מחדל
    const stopLossInput = document.getElementById('defaultStopLossInput');
    if (stopLossInput) {
      const success = await savePreference('defaultStopLoss', parseFloat(stopLossInput.value));
      if (success) {
        savedPreferences.push('סטופ ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    // שמירת מחיר יעד ברירת מחדל
    const targetPriceInput = document.getElementById('defaultTargetPriceInput');
    if (targetPriceInput) {
      const success = await savePreference('defaultTargetPrice', parseFloat(targetPriceInput.value));
      if (success) {
        savedPreferences.push('מחיר יעד ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    if (allSaved) {
      showNotification(`✅ הגדרות אישיות נשמרו בהצלחה! (${savedPreferences.length} הגדרות)`, 'success');
      markAsSaved(); // מסמן שכל השינויים נשמרו
    } else {
      showNotification('⚠️ חלק מהגדרות האישיות לא נשמרו', 'error');
    }

  } catch (error) {
    console.error('❌ שגיאה בשמירת הגדרות אישיות:', error);
    showNotification('❌ שגיאה בשמירת הגדרות אישיות', 'error');
  }
}

function resetSecurityPreferences() {
  console.log('🔄 איפוס הגדרות אבטחה לברירות מחדל');

  // שאלת המשתמש על ברירות מחדל לאבטחה
  const userChoice = confirm('אין ברירות מחדל מוגדרות להגדרות אבטחה.\nהאם תרצה להגדיר ברירות מחדל עכשיו?');

  if (userChoice) {
    // כאן אפשר להוסיף לוגיקה להגדרת ברירות מחדל
    showNotification('הגדרות אבטחה - נדרש הגדרת ברירות מחדל', 'info');
  } else {
    showNotification('הגדרות אבטחה נשארו ללא שינוי', 'info');
  }
}

function saveSecurityPreferences() {
  console.log('שמירת הגדרות אבטחה');
  // כאן יוכנס קוד לשמירת הגדרות אבטחה
}

async function resetDisplayPreferences() {
  console.log('🔄 איפוס הגדרות תצוגה לברירות מחדל');

  // איפוס פילטר סטטוס ברירת מחדל - "הכול"
  const statusFilterSelect = document.getElementById('defaultStatusFilterSelect');
  if (statusFilterSelect) {
    statusFilterSelect.value = 'all';
    await savePreference('defaultStatusFilter', 'all');
    showNotification('פילטר סטטוס ברירת מחדל אופס ל"הכול"', 'success');
  }

  // איפוס פילטר סוג ברירת מחדל - "הכול"
  const typeFilterSelect = document.getElementById('defaultTypeFilterSelect');
  if (typeFilterSelect) {
    typeFilterSelect.value = 'all';
    await savePreference('defaultTypeFilter', 'all');
    showNotification('פילטר סוג ברירת מחדל אופס ל"הכול"', 'success');
  }

  // איפוס פילטר חשבונות ברירת מחדל - "הכול"
  const accountFilterSelect = document.getElementById('defaultAccountFilterSelect');
  if (accountFilterSelect) {
    accountFilterSelect.value = 'all';
    await savePreference('defaultAccountFilter', 'all');
    showNotification('פילטר חשבונות ברירת מחדל אופס ל"הכול"', 'success');
  }

  // איפוס פילטר טווח תאריכים ברירת מחדל - "כל זמן"
  const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilterSelect');
  if (dateRangeFilterSelect) {
    dateRangeFilterSelect.value = 'all';
    await savePreference('defaultDateRangeFilter', 'all');
    showNotification('פילטר טווח תאריכים ברירת מחדל אופס ל"כל זמן"', 'success');
  }

  // איפוס פילטר חיפוש ברירת מחדל - ריק
  const searchFilterInput = document.getElementById('defaultSearchFilterInput');
  if (searchFilterInput) {
    searchFilterInput.value = '';
    await savePreference('defaultSearchFilter', '');
    showNotification('פילטר חיפוש ברירת מחדל אופס', 'success');
  }

  showNotification('הגדרות תצוגה אופסו ונשמרו לברירות מחדל', 'success');
  markAsSaved(); // מסמן שכל השינויים נשמרו
}

async function saveDisplayPreferences() {
  console.log('🔄 שומר הגדרות תצוגה...');

  try {
    let allSaved = true;
    const savedPreferences = [];

    // שמירת פילטר סטטוס ברירת מחדל
    const statusFilterSelect = document.getElementById('defaultStatusFilterSelect');
    if (statusFilterSelect) {
      const success = await savePreference('defaultStatusFilter', statusFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר סטטוס ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    // שמירת פילטר סוג ברירת מחדל
    const typeFilterSelect = document.getElementById('defaultTypeFilterSelect');
    if (typeFilterSelect) {
      const success = await savePreference('defaultTypeFilter', typeFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר סוג ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    // שמירת פילטר חשבונות ברירת מחדל
    const accountFilterSelect = document.getElementById('defaultAccountFilterSelect');
    if (accountFilterSelect) {
      const success = await savePreference('defaultAccountFilter', accountFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר חשבונות ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    // שמירת פילטר טווח תאריכים ברירת מחדל
    const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilterSelect');
    if (dateRangeFilterSelect) {
      const success = await savePreference('defaultDateRangeFilter', dateRangeFilterSelect.value);
      if (success) {
        savedPreferences.push('פילטר טווח תאריכים ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    // שמירת פילטר חיפוש ברירת מחדל
    const searchFilterInput = document.getElementById('defaultSearchFilterInput');
    if (searchFilterInput) {
      const success = await savePreference('defaultSearchFilter', searchFilterInput.value);
      if (success) {
        savedPreferences.push('פילטר חיפוש ברירת מחדל');
      } else {
        allSaved = false;
      }
    }

    if (allSaved) {
      showNotification(`✅ הגדרות תצוגה נשמרו בהצלחה! (${savedPreferences.length} הגדרות)`, 'success');
      markAsSaved(); // מסמן שכל השינויים נשמרו
    } else {
      showNotification('⚠️ חלק מהגדרות התצוגה לא נשמרו', 'error');
    }

  } catch (error) {
    console.error('❌ שגיאה בשמירת הגדרות תצוגה:', error);
    showNotification('❌ שגיאה בשמירת הגדרות תצוגה', 'error');
  }
}

// ===== Change Tracking System =====

/**
 * Global state management for tracking unsaved changes
 * 
 * This system provides real-time tracking of user modifications and prevents
 * accidental data loss by warning users before navigation.
 * 
 * @namespace ChangeTracking
 */

/**
 * Global flag indicating whether there are unsaved changes
 * @type {boolean}
 */
let hasUnsavedChanges = false;

/**
 * Stores original form values for comparison
 * @type {Object}
 */
let originalValues = {};

/**
 * מסמן שיש שינויים שלא נשמרו
 */
function markAsChanged() {
  hasUnsavedChanges = true;
  console.log('🔄 שינוי זוהה - יש שינויים שלא נשמרו');
  updatePageTitle();
}

/**
 * מסמן שכל השינויים נשמרו
 */
function markAsSaved() {
  hasUnsavedChanges = false;
  console.log('✅ כל השינויים נשמרו');
  updatePageTitle();
}

/**
 * מעדכן את כותרת הדף עם סימן אזהרה
 */
function updatePageTitle() {
  const originalTitle = 'העדפות והגדרות';
  if (hasUnsavedChanges) {
    document.title = `⚠️ ${originalTitle} - יש שינויים שלא נשמרו`;
  } else {
    document.title = originalTitle;
  }
}

/**
 * בודק אם יש שינויים שלא נשמרו
 */
function checkForUnsavedChanges() {
  if (!hasUnsavedChanges) return false;

  const userChoice = confirm(
    '⚠️ יש שינויים שלא נשמרו!\n\n' +
    'האם תרצה לחזור לדף ולשמור את השינויים?\n\n' +
    'לחץ "אישור" כדי לחזור לדף\n' +
    'לחץ "ביטול" כדי לצאת ללא שמירה'
  );

  return userChoice; // true = חזור לדף, false = צא ללא שמירה
}

/**
 * שומר את הערכים המקוריים לטעינה
 */
function saveOriginalValues() {
  originalValues = {
    primaryCurrency: document.getElementById('primaryCurrencySelect')?.value,
    timezone: document.getElementById('timezoneSelect')?.value,
    defaultStopLoss: document.getElementById('defaultStopLossInput')?.value,
    defaultTargetPrice: document.getElementById('defaultTargetPriceInput')?.value,
    defaultStatusFilter: document.getElementById('defaultStatusFilterSelect')?.value,
    defaultTypeFilter: document.getElementById('defaultTypeFilterSelect')?.value,
    defaultAccountFilter: document.getElementById('defaultAccountFilterSelect')?.value,
    defaultDateRangeFilter: document.getElementById('defaultDateRangeFilterSelect')?.value,
    defaultSearchFilter: document.getElementById('defaultSearchFilterInput')?.value
  };
  console.log('💾 שמירת ערכים מקוריים:', originalValues);
}

/**
 * בודק אם יש שינויים מהערכים המקוריים
 */
function checkForChanges() {
  const currentValues = {
    primaryCurrency: document.getElementById('primaryCurrencySelect')?.value,
    timezone: document.getElementById('timezoneSelect')?.value,
    defaultStopLoss: document.getElementById('defaultStopLossInput')?.value,
    defaultTargetPrice: document.getElementById('defaultTargetPriceInput')?.value,
    defaultStatusFilter: document.getElementById('defaultStatusFilterSelect')?.value,
    defaultTypeFilter: document.getElementById('defaultTypeFilterSelect')?.value,
    defaultAccountFilter: document.getElementById('defaultAccountFilterSelect')?.value,
    defaultDateRangeFilter: document.getElementById('defaultDateRangeFilterSelect')?.value,
    defaultSearchFilter: document.getElementById('defaultSearchFilterInput')?.value
  };

  const hasChanges = Object.keys(originalValues).some(key => {
    return originalValues[key] !== currentValues[key];
  });

  if (hasChanges && !hasUnsavedChanges) {
    markAsChanged();
  } else if (!hasChanges && hasUnsavedChanges) {
    markAsSaved();
  }

  return hasChanges;
}

// ===== מערכת חדשה לניהול מצב סקשנים =====

/**
 * מערכת פשוטה לניהול מצב סקשנים
 * שומרת את המצב ב-localStorage עם מפתח פשוט
 */

// פונקציה לסגירה/פתיחה של כל הסקשנים
/**
 * Section Management System
 * 
 * Provides comprehensive section state management with persistence
 * and smooth user interaction for collapsible content areas.
 * 
 * @namespace SectionManagement
 */

/**
 * Toggles all sections between open and closed states
 * 
 * This function provides a master toggle that opens all sections if any are closed,
 * or closes all sections if all are currently open. It also updates the main
 * toggle button text and saves the state changes.
 * 
 * @function toggleAllSections
 * @returns {void}
 * 
 * @example
 * // Toggle all sections (called by main toggle button)
 * toggleAllSections();
 */
function toggleAllSections() {
  const allSections = document.querySelectorAll('.section-body');
  const isAnyOpen = Array.from(allSections).some(section => section.style.display !== 'none');

  allSections.forEach(section => {
    const sectionContainer = section.closest('.content-section, .top-section');
    const toggleBtn = sectionContainer.querySelector('.filter-toggle-btn');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (isAnyOpen) {
      // סגירת כל הסקשנים
      section.style.display = 'none';
      if (icon) icon.textContent = '▼';
      saveSectionState(sectionContainer, true);
    } else {
      // פתיחת כל הסקשנים
      section.style.display = 'block';
      if (icon) icon.textContent = '▲';
      saveSectionState(sectionContainer, false);
    }
  });

  // עדכון כפתור הראשי
  const mainButton = document.querySelector('button[onclick="toggleAllSections()"]');
  if (mainButton) {
    const buttonIcon = mainButton.querySelector('.filter-icon');
    if (buttonIcon) {
      buttonIcon.textContent = isAnyOpen ? '▼' : '▲';
    }
  }
}

// פונקציה כללית לסגירה/פתיחה של סקשן
function toggleSection(sectionContainer) {
  const section = sectionContainer.querySelector('.section-body');
  const toggleBtn = sectionContainer.querySelector('.filter-toggle-btn');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.style.display === 'none';

    if (isCollapsed) {
      section.style.display = 'block';
      if (icon) icon.textContent = '▲';
      saveSectionState(sectionContainer, false);
    } else {
      section.style.display = 'none';
      if (icon) icon.textContent = '▼';
      saveSectionState(sectionContainer, true);
    }
  }
}

// פונקציה לשמירת מצב סקשן
function saveSectionState(sectionContainer, isCollapsed) {
  const sectionId = getSectionId(sectionContainer);
  if (sectionId) {
    localStorage.setItem(`preferences_${sectionId}`, isCollapsed ? 'collapsed' : 'expanded');
  }
}

// פונקציה לקבלת מזהה סקשן
function getSectionId(sectionContainer) {
  const title = sectionContainer.querySelector('.table-title');
  if (!title) return null;

  const titleText = title.textContent.trim();

  if (titleText.includes('הגדרות מערכת')) return 'system';
  if (titleText.includes('הגדרות אישיות')) return 'personal';
  if (titleText.includes('הגדרות אבטחה')) return 'security';
  if (titleText.includes('הגדרות תצוגה')) return 'display';
  if (titleText.includes('ניהול בדיקות')) return 'testing';
  if (sectionContainer.classList.contains('top-section')) return 'top';

  return null;
}

// פונקציה לשחזור מצב כל הסקשנים
function restoreAllSectionsState() {
  console.log('🔄 משחזר מצב סקשנים...');

  const allSections = document.querySelectorAll('.content-section, .top-section');
  console.log(`📋 נמצאו ${allSections.length} סקשנים`);

  allSections.forEach((sectionContainer, index) => {
    const sectionId = getSectionId(sectionContainer);
    console.log(`🔍 סקשן ${index + 1}: ID = ${sectionId}`);

    if (sectionId) {
      const savedState = localStorage.getItem(`preferences_${sectionId}`);
      console.log(`💾 מצב שמור עבור ${sectionId}: ${savedState}`);

      const section = sectionContainer.querySelector('.section-body');
      const toggleBtn = sectionContainer.querySelector('.filter-toggle-btn');
      const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

      if (section && toggleBtn && icon) {
        if (savedState === 'collapsed') {
          section.style.display = 'none';
          icon.textContent = '▼';
          console.log(`📁 סקשן ${sectionId} נסגר`);
        } else {
          // ברירת מחדל - סגור אם אין מצב שמור
          if (savedState === null) {
            section.style.display = 'none';
            icon.textContent = '▼';
            localStorage.setItem(`preferences_${sectionId}`, 'collapsed');
            console.log(`📁 סקשן ${sectionId} נסגר (ברירת מחדל)`);
          } else {
            section.style.display = 'block';
            icon.textContent = '▲';
            console.log(`📂 סקשן ${sectionId} נפתח`);
          }
        }
      } else {
        console.log(`⚠️ לא נמצאו אלמנטים לסקשן ${sectionId}`);
      }
    } else {
      console.log(`⚠️ לא זוהה מזהה לסקשן ${index + 1}`);
    }
  });

  console.log('✅ שחזור מצב סקשנים הושלם');
}

// פונקציה לניקוי כל המצבים השמורים
function clearAllSectionsState() {
  console.log('🧹 מנקה מצבי סקשנים...');

  const keys = Object.keys(localStorage);
  const preferencesKeys = keys.filter(key => key.startsWith('preferences_'));

  preferencesKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ נמחק: ${key}`);
  });

  console.log('✅ ניקוי מצבי סקשנים הושלם');
  showNotification('מצבי הסקשנים אופסו', 'success');
}

// פונקציות ספציפיות לכל סקשן (לשימוש ב-onclick)
function toggleTopSection() {
  const topSection = document.querySelector('.top-section');
  if (topSection) toggleSection(topSection);
}

function toggleSystemSection() {
  const systemSection = Array.from(document.querySelectorAll('.content-section')).find(section => {
    const title = section.querySelector('.table-title');
    return title && title.textContent.includes('הגדרות מערכת');
  });
  if (systemSection) toggleSection(systemSection);
}

function togglePersonalSection() {
  const personalSection = Array.from(document.querySelectorAll('.content-section')).find(section => {
    const title = section.querySelector('.table-title');
    return title && title.textContent.includes('הגדרות אישיות');
  });
  if (personalSection) toggleSection(personalSection);
}

function toggleSecuritySection() {
  const securitySection = Array.from(document.querySelectorAll('.content-section')).find(section => {
    const title = section.querySelector('.table-title');
    return title && title.textContent.includes('הגדרות אבטחה');
  });
  if (securitySection) toggleSection(securitySection);
}

function toggleDisplaySection() {
  const displaySection = Array.from(document.querySelectorAll('.content-section')).find(section => {
    const title = section.querySelector('.table-title');
    return title && title.textContent.includes('הגדרות תצוגה');
  });
  if (displaySection) toggleSection(displaySection);
}

function toggleTestingSection() {
  const testingSection = Array.from(document.querySelectorAll('.content-section')).find(section => {
    const title = section.querySelector('.table-title');
    return title && title.textContent.includes('ניהול בדיקות');
  });
  if (testingSection) toggleSection(testingSection);
}

// פונקציה לבדיקת מצב הסקשנים (לבדיקה)
function debugSectionsState() {
  console.log('🔍 === בדיקת מצב סקשנים ===');

  const allSections = document.querySelectorAll('.content-section, .top-section');
  console.log(`📋 נמצאו ${allSections.length} סקשנים`);

  allSections.forEach((sectionContainer, index) => {
    const sectionId = getSectionId(sectionContainer);
    const savedState = localStorage.getItem(`preferences_${sectionId}`);
    const section = sectionContainer.querySelector('.section-body');
    const isVisible = section && section.style.display !== 'none';

    console.log(`📊 סקשן ${index + 1}:`);
    console.log(`   - ID: ${sectionId}`);
    console.log(`   - מצב שמור: ${savedState}`);
    console.log(`   - נראה: ${isVisible}`);
    console.log(`   - אלמנטים: section=${!!section}, toggleBtn=${!!sectionContainer.querySelector('.filter-toggle-btn')}`);
  });

  console.log('🔍 === סיום בדיקת מצב ===');
}

// הגדרת הפונקציה כגלובלית
window.debugSectionsState = debugSectionsState;

// הגדרת הפונקציות כגלובליות
window.saveAllPreferences = saveAllPreferences;
window.savePreference = savePreference;
window.getCurrentPreference = getCurrentPreference;
window.showNotification = showNotification;
window.updatePrimaryCurrency = updatePrimaryCurrency;
window.updateTimezone = updateTimezone;
window.updateDefaultStopLoss = updateDefaultStopLoss;
window.updateDefaultTargetPrice = updateDefaultTargetPrice;
window.updateDefaultStatusFilter = updateDefaultStatusFilter;
window.updateDefaultTypeFilter = updateDefaultTypeFilter;
window.updateDefaultAccountFilter = updateDefaultAccountFilter;
window.updateDefaultDateRangeFilter = updateDefaultDateRangeFilter;
window.updateDefaultSearchFilter = updateDefaultSearchFilter;
window.loadPreferencesToUI = loadPreferencesToUI;
window.resetSystemPreferences = resetSystemPreferences;
window.saveSystemPreferences = saveSystemPreferences;
window.resetPersonalPreferences = resetPersonalPreferences;
window.savePersonalPreferences = savePersonalPreferences;
window.resetSecurityPreferences = resetSecurityPreferences;
window.saveSecurityPreferences = saveSecurityPreferences;
window.resetDisplayPreferences = resetDisplayPreferences;
window.saveDisplayPreferences = saveDisplayPreferences;

// פונקציות ניהול סקשנים
window.toggleAllSections = toggleAllSections;
window.toggleTopSection = toggleTopSection;
window.toggleSystemSection = toggleSystemSection;
window.togglePersonalSection = togglePersonalSection;
window.toggleSecuritySection = toggleSecuritySection;
window.toggleDisplaySection = toggleDisplaySection;
window.toggleTestingSection = toggleTestingSection;
window.restoreAllSectionsState = restoreAllSectionsState;
window.clearAllSectionsState = clearAllSectionsState;

// ===== פונקציות עדכון הגדרות ברירת מחדל =====

// פונקציות עדכון הגדרות תצוגה
function updateDefaultStatusFilter(value) {
  console.log('🔄 עדכון פילטר סטטוס ברירת מחדל:', value);
  markAsChanged(); // מסמן שיש שינויים
  savePreference('defaultStatusFilter', value);
}

function updateDefaultTypeFilter(value) {
  console.log('🔄 עדכון פילטר סוג ברירת מחדל:', value);
  markAsChanged(); // מסמן שיש שינויים
  savePreference('defaultTypeFilter', value);
}

function updateDefaultAccountFilter(value) {
  console.log('🔄 עדכון פילטר חשבון ברירת מחדל:', value);
  markAsChanged(); // מסמן שיש שינויים
  savePreference('defaultAccountFilter', value);
}

function updateDefaultDateRangeFilter(value) {
  console.log('🔄 עדכון פילטר טווח תאריכים ברירת מחדל:', value);
  markAsChanged(); // מסמן שיש שינויים
  savePreference('defaultDateRangeFilter', value);
}

function updateDefaultSearchFilter(value) {
  console.log('🔄 עדכון פילטר חיפוש ברירת מחדל:', value);
  markAsChanged(); // מסמן שיש שינויים
  savePreference('defaultSearchFilter', value);
}

// הגדרת הפונקציות כגלובליות
window.updateDefaultStatusFilter = updateDefaultStatusFilter;
window.updateDefaultTypeFilter = updateDefaultTypeFilter;
window.updateDefaultAccountFilter = updateDefaultAccountFilter;
window.updateDefaultDateRangeFilter = updateDefaultDateRangeFilter;
window.updateDefaultSearchFilter = updateDefaultSearchFilter;

// ===== פונקציות ניהול בדיקות =====

// Global variables for test management
let testPreferences = {};
let testSettings = {};

/**
 * Load test preferences from localStorage or use defaults
 */
function loadTestPreferences() {
  const savedPreferences = localStorage.getItem('testPreferences');
  const savedSettings = localStorage.getItem('testSettings');

  if (savedPreferences) {
    testPreferences = JSON.parse(savedPreferences);
  } else {
    // Default preferences - all tests enabled
    testPreferences = {
      unit_tests: {
        active: true,
        tests: {
          test_models: {
            active: true,
            tests: {
              test_ticker_creation: true,
              test_ticker_to_dict: true,
              test_account_creation: true,
              test_user_creation: true,
              test_trade_creation: true,
              test_alert_creation: true,
              test_trade_plan_creation: true,
              test_trade_side_values: true,
              test_trade_plan_side_values: true,
              test_side_default_values: true
            }
          },
          test_relationships: {
            active: true,
            tests: {
              test_trade_ticker_relationship: true,
              test_trade_plan_relationships: true,
              test_alert_entity_relationships: true,
              test_business_rules_trade_types: true,
              test_business_rules_trade_sides: true,
              test_business_rules_status_values: true,
              test_data_integrity_constraints: true,
              test_cross_entity_consistency: true
            }
          }
        }
      },
      integration_tests: {
        active: true,
        tests: {
          test_api: {
            active: true,
            tests: {
              test_get_tickers: true,
              test_get_ticker_by_id: true,
              test_get_accounts: true,
              test_get_account_by_id: true,
              test_get_trades: true,
              test_get_trade_by_id: true,
              test_health_check: true,
              test_main_page: true,
              test_api_response_format: true,
              test_cors_headers: true
            }
          }
        }
      },
      e2e_tests: {
        active: true,
        tests: {
          test_basic_workflow: {
            active: true,
            tests: {
              test_main_page_loads: true,
              test_api_endpoints_respond: true,
              test_tickers_data_structure: true,
              test_trades_data_structure: true,
              test_static_files_accessible: true,
              test_error_handling: true,
              test_cors_headers: true,
              test_response_time: true,
              test_database_connectivity: true
            }
          }
        }
      },
      performance_tests: {
        active: true,
        tests: {
          test_smoke: {
            active: true,
            tests: {
              test_performance_smoke: true
            }
          }
        }
      },
      load_tests: {
        active: true,
        tests: {
          test_smoke: {
            active: true,
            tests: {
              test_load_smoke: true
            }
          }
        }
      },
      security_tests: {
        active: true,
        tests: {
          test_smoke: {
            active: true,
            tests: {
              test_security_smoke: true
            }
          }
        }
      }
    };
  }

  if (savedSettings) {
    testSettings = JSON.parse(savedSettings);
  } else {
    // Default settings
    testSettings = {
      database: {
        use_temp_database: true,
        backup_before_tests: true,
        cleanup_after_tests: true
      },
      execution: {
        parallel_tests: false,
        stop_on_failure: false,
        verbose_output: true
      },
      reporting: {
        generate_html_report: true,
        save_test_logs: true,
        notify_on_failure: false
      }
    };
  }

  applyTestPreferencesToUI();
}

/**
 * Apply loaded preferences to the UI
 */
function applyTestPreferencesToUI() {
  console.log('🔄 מפעיל העדפות בדיקות לממשק...');

  // Apply test preferences - רק אם האלמנטים קיימים
  Object.keys(testPreferences).forEach(category => {
    const categoryData = testPreferences[category];
    Object.keys(categoryData.tests || {}).forEach(group => {
      const groupData = categoryData.tests[group];
      Object.keys(groupData.tests || {}).forEach(test => {
        const testKey = `${category}.${group}.${test}`;
        const checkbox = document.querySelector(`[data-test="${testKey}"]`);
        if (checkbox) {
          checkbox.checked = groupData.tests[test];
        }
      });
    });
  });

  console.log('✅ העדפות בדיקות הופעלו לממשק');
}

/**
 * Update preferences from UI changes
 */
function updateTestPreferencesFromUI() {
  // פונקציה זו הוסרה כי אלמנטי הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ updateTestPreferencesFromUI - אלמנטי בדיקות הוסרו מהדף');
}

/**
 * Update settings from UI changes
 */
function updateTestSettingsFromUI() {
  // פונקציה זו הוסרה כי האלמנטים לא קיימים יותר בדף
  console.log('ℹ️ updateTestSettingsFromUI - אלמנטי הגדרות בדיקות הוסרו מהדף');
}

/**
 * Update the summary statistics
 */
function updateTestSummary() {
  let totalTests = 0;
  let activeTests = 0;
  let inactiveTests = 0;
  let testCategories = 0;

  Object.keys(testPreferences).forEach(category => {
    const categoryData = testPreferences[category];
    if (categoryData.tests) {
      testCategories++;
      Object.keys(categoryData.tests).forEach(group => {
        const groupData = categoryData.tests[group];
        if (groupData.tests) {
          Object.keys(groupData.tests).forEach(test => {
            totalTests++;
            if (groupData.tests[test]) {
              activeTests++;
            } else {
              inactiveTests++;
            }
          });
        }
      });
    }
  });

  // עדכון אלמנטי הסיכום - רק אם הם קיימים
  const totalTestsEl = document.getElementById('totalTests');
  const activeTestsEl = document.getElementById('activeTests');
  const inactiveTestsEl = document.getElementById('inactiveTests');
  const testCategoriesEl = document.getElementById('testCategories');

  if (totalTestsEl) totalTestsEl.textContent = totalTests;
  if (activeTestsEl) activeTestsEl.textContent = activeTests;
  if (inactiveTestsEl) inactiveTestsEl.textContent = inactiveTests;
  if (testCategoriesEl) testCategoriesEl.textContent = testCategories;

  console.log(`📊 סיכום בדיקות: ${totalTests} סה"כ, ${activeTests} פעילות, ${inactiveTests} לא פעילות, ${testCategories} קטגוריות`);
}

/**
 * Save test preferences to localStorage
 */
function saveTestPreferences() {
  updateTestPreferencesFromUI();
  updateTestSettingsFromUI();

  localStorage.setItem('testPreferences', JSON.stringify(testPreferences));
  localStorage.setItem('testSettings', JSON.stringify(testSettings));

  showNotification('העדפות בדיקות נשמרו בהצלחה!', 'success');
}

/**
 * Reset test preferences to defaults
 */
function resetTestPreferences() {
  if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות הבדיקות לברירות מחדל?')) {
    localStorage.removeItem('testPreferences');
    localStorage.removeItem('testSettings');
    loadTestPreferences();
    updateTestSummary();
    updateCategoryButtonStates(); // עדכון מצב כפתורי הקטגוריות
    showNotification('העדפות בדיקות אופסו לברירות מחדל', 'info');
  }
}

/**
 * Run selected tests
 */
function runSelectedTests() {
  updateTestPreferencesFromUI();
  updateTestSettingsFromUI();

  // Get active tests
  const activeTests = getActiveTests();

  if (activeTests.length === 0) {
    showNotification('לא נבחרו בדיקות להרצה', 'warning');
    return;
  }

  // Show confirmation
  const testList = activeTests.slice(0, 5).join(', ');
  const moreTests = activeTests.length > 5 ? ` ועוד ${activeTests.length - 5} בדיקות` : '';

  if (confirm(`האם להריץ את הבדיקות הבאות?\n${testList}${moreTests}`)) {
    executeTests(activeTests);
  }
}

/**
 * Get list of active tests
 */
function getActiveTests() {
  // פונקציה זו הוסרה כי אלמנטי הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ getActiveTests - אלמנטי בדיקות הוסרו מהדף');
  return [];
}

/**
 * Execute the selected tests
 */
function executeTests(testList) {
  // פונקציה זו הוסרה כי אלמנטי הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ executeTests - אלמנטי בדיקות הוסרו מהדף');
  showNotification('פונקציונליות בדיקות הוסרה מהדף', 'info');
}

/**
 * Show test results area
 */
function showTestResults() {
  // פונקציה זו הוסרה כי אלמנטי תוצאות הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ showTestResults - אלמנטי תוצאות בדיקות הוסרו מהדף');
}

/**
 * Display test results in the results area
 */
function displayTestResults(result) {
  // פונקציה זו הוסרה כי אלמנטי תוצאות הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ displayTestResults - אלמנטי תוצאות בדיקות הוסרו מהדף');
}

/**
 * Display test error in the results area
 */
function displayTestError(error) {
  // פונקציה זו הוסרה כי אלמנטי תוצאות הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ displayTestError - אלמנטי תוצאות בדיקות הוסרו מהדף');
}

/**
 * Hide test results area
 */
function hideTestResults() {
  // פונקציה זו הוסרה כי אלמנטי תוצאות הבדיקות לא קיימים יותר בדף
  console.log('ℹ️ hideTestResults - אלמנטי תוצאות בדיקות הוסרו מהדף');
}

/**
 * Toggle all tests in a specific category
 * @param {string} category - The test category (e.g., 'unit_tests', 'integration_tests')
 */
function toggleAllTestsInCategory(category) {
  // פונקציה זו הוסרה כי אלמנטי כפתורי הקטגוריות לא קיימים יותר בדף
  console.log(`ℹ️ toggleAllTestsInCategory - אלמנטי כפתורי קטגוריות הוסרו מהדף (קטגוריה: ${category})`);
}

/**
 * Get display name for test category
 * @param {string} category - The test category
 * @returns {string} Display name
 */
function getCategoryDisplayName(category) {
  const categoryNames = {
    'unit_tests': 'יחידה',
    'integration_tests': 'אינטגרציה',
    'e2e_tests': 'End-to-End',
    'performance_tests': 'ביצועים',
    'security_tests': 'אבטחה',
    'load_tests': 'עומס'
  };
  return categoryNames[category] || category;
}

/**
 * Update category button states based on current test selections
 */
function updateCategoryButtonStates() {
  // פונקציה זו הוסרה כי אלמנטי כפתורי הקטגוריות לא קיימים יותר בדף
  console.log('ℹ️ updateCategoryButtonStates - אלמנטי כפתורי קטגוריות הוסרו מהדף');
}

/**
 * Toggle testing section visibility
 */
function toggleTestingSection() {
  // מציאת סקשן הבדיקות לפי הכותרת
  const testingSectionElement = Array.from(document.querySelectorAll('.main-content .content-section')).find(section => {
    const title = section.querySelector('.table-title');
    return title && title.textContent.includes('ניהול בדיקות');
  });

  const section = testingSectionElement ? testingSectionElement.querySelector('.section-body') : null;
  const toggleBtn = testingSectionElement ? testingSectionElement.querySelector('button[onclick="toggleTestingSection()"]') : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.style.display === 'none';

    if (isCollapsed) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('preferencesTestingSectionCollapsed', !isCollapsed);
  }
}

// הגדרת הפונקציות כגלובליות
window.saveTestPreferences = saveTestPreferences;
window.resetTestPreferences = resetTestPreferences;
window.runSelectedTests = runSelectedTests;
window.toggleTestingSection = toggleTestingSection;
window.toggleAllTestsInCategory = toggleAllTestsInCategory;
window.updateCategoryButtonStates = updateCategoryButtonStates;

/**
 * Initialize preferences page
 */
function initializePreferences() {
  console.log('🔄 === INITIALIZING PREFERENCES PAGE ===');

  try {
    // שחזור מצב הסגירה
    restoreAllSectionsState();

    // טעינת העדפות לממשק
    loadPreferencesToUI();

    // שמירת ערכים מקוריים למעקב אחרי שינויים
    setTimeout(() => {
      saveOriginalValues();
    }, 1000); // המתנה קצרה לטעינת הערכים

    // טעינת העדפות בדיקות
    loadTestPreferences();
    updateTestSummary();

    // Setup event listeners for test checkboxes - הוסר כי אלמנטי הבדיקות לא קיימים
    console.log('ℹ️ אלמנטי בדיקות הוסרו מהדף - לא מוסיפים event listeners');

    // Setup event listeners for test settings - הוסר כי אלמנטי ההגדרות לא קיימים
    console.log('ℹ️ אלמנטי הגדרות בדיקות הוסרו מהדף - לא מוסיפים event listeners');

    // עדכון מצב כפתורי הקטגוריות
    updateCategoryButtonStates();

    // הוספת event listener לבדיקה לפני יציאה מהדף
    window.addEventListener('beforeunload', function (e) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'יש שינויים שלא נשמרו. האם אתה בטוח שברצונך לעזוב?';
        return e.returnValue;
      }
    });

    // הוספת event listener לבדיקה לפני ניווט
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (link && link.href && !link.href.includes('preferences') && hasUnsavedChanges) {
        const userChoice = checkForUnsavedChanges();
        if (userChoice) {
          e.preventDefault();
          return false;
        }
      }
    });

    console.log('✅ Preferences page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing preferences page:', error);
    throw error;
  }
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED - PREFERENCES ===');

  try {
    initializePreferences();
  } catch (error) {
    console.error('❌ Failed to initialize preferences page:', error);
    // Show error to user
    const body = document.body;
    if (body) {
      body.innerHTML = `
              <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <h2>שגיאה בטעינת הדף</h2>
                <p>אירעה שגיאה בטעינת דף ההעדפות. אנא רענן את הדף או פנה למנהל המערכת.</p>
                <p style="color: #666; font-size: 0.9em;">שגיאה: ${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  רענן דף
                </button>
              </div>
            `;
    }
  }
});

// פונקציה לטעינת סיכום העדפות - הוסרה
// function loadPreferencesSummary() {
//   const summaryContainer = document.getElementById('preferencesSummary');
//   if (summaryContainer) {
//     summaryContainer.innerHTML = `
//       <div class="preferences-summary-content">
//         <div class="summary-item">
//           <span class="summary-icon">🔧</span>
//           <span class="summary-text">הגדרות מערכת: <strong>פעילות</strong></span>
//         </div>
//         <div class="summary-item">
//           <span class="summary-icon">👤</span>
//           <span class="summary-text">הגדרות אישיות: <strong>נטענו</strong></span>
//         </div>
//         <div class="summary-item">
//           <span class="summary-icon">🔒</span>
//           <span class="summary-text">הגדרות אבטחה: <strong>מוגדרות</strong></span>
//         </div>
//         <div class="summary-item">
//           <span class="summary-icon">🎨</span>
//           <span class="summary-text">הגדרות תצוגה: <strong>מותאמות</strong></span>
//         </div>
//       </div>
//     `;
//   }
// }
