/**
 * ===== קובץ העדפות - TikTrack =====
 * 
 * קובץ זה מכיל את כל הפונקציות והלוגיקה עבור עמוד ההעדפות
 * 
 * פונקציות עיקריות:
 * - ניהול הגדרות מערכת
 * - ניהול הגדרות אישיות
 * - ניהול הגדרות אבטחה
 * - ניהול הגדרות תצוגה
 * - שמירה וטעינה של העדפות
 */

// ===== משתנים גלובליים =====

// נתוני העדפות
let preferencesData = {
  defaults: {
    primaryCurrency: 'USD'
  },
  user: {
    primaryCurrency: 'USD'
  }
};

// ===== פונקציות ניהול העדפות =====

/**
 * טוען את כל ההעדפות מהשרת
 */
async function loadAllPreferences() {
  try {
    const response = await fetch('/api/preferences');
    if (response.ok) {
      preferencesData = await response.json();
      console.log('✅ העדפות נטענו בהצלחה מהשרת');
    } else {
      console.error('❌ שגיאה בטעינת העדפות מהשרת');
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת העדפות:', error);
  }
}

/**
 * שומר את כל ההעדפות לשרת
 */
async function saveAllPreferences() {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencesData)
    });
    
    if (response.ok) {
      console.log('✅ העדפות נשמרו בהצלחה לשרת');
      showNotification('העדפות נשמרו בהצלחה', 'success');
    } else {
      console.error('❌ שגיאה בשמירת העדפות לשרת');
      showNotification('שגיאה בשמירת העדפות', 'error');
    }
  } catch (error) {
    console.error('❌ שגיאה בשמירת העדפות:', error);
    showNotification('שגיאה בשמירת העדפות', 'error');
  }
}

/**
 * מאפס את כל ההעדפות לברירות מחדל
 */
async function resetAllPreferences() {
  if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות?')) {
    preferencesData.user = { ...preferencesData.defaults };
    await saveAllPreferences();
    showNotification('כל ההעדפות אופסו', 'success');
  }
}

// ===== פונקציות ניהול העדפות =====

/**
 * שומר הגדרה ספציפית
 */
async function savePreference(key, value) {
  try {
    const response = await fetch(`/api/preferences/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: value })
    });
    
    if (response.ok) {
      preferencesData.user[key] = value;
      console.log(`✅ הגדרה ${key} נשמרה בהצלחה`);
      showNotification(`הגדרה ${key} נשמרה בהצלחה`, 'success');
      return true;
    } else {
      console.error(`❌ שגיאה בשמירת הגדרה ${key}`);
      showNotification(`שגיאה בשמירת הגדרה ${key}`, 'error');
      return false;
    }
  } catch (error) {
    console.error(`❌ שגיאה בשמירת הגדרה ${key}:`, error);
    showNotification(`שגיאה בשמירת הגדרה ${key}`, 'error');
    return false;
  }
}

/**
 * מקבל ערך הגדרה
 */
function getPreference(key) {
  return preferencesData.user[key] || preferencesData.defaults[key];
}

/**
 * מקבל ערך ברירת מחדל
 */
function getDefaultPreference(key) {
  return preferencesData.defaults[key];
}

/**
 * שומר הגדרות מערכת
 */
async function saveSystemPreferences() {
  await saveAllPreferences();
  showNotification('הגדרות מערכת נשמרו', 'success');
}

/**
 * מאפס הגדרות מערכת
 */
async function resetSystemPreferences() {
  if (confirm('האם אתה בטוח שברצונך לאפס את הגדרות המערכת?')) {
    // איפוס הגדרות מערכת לברירות מחדל
    for (const key in preferencesData.defaults) {
      preferencesData.user[key] = preferencesData.defaults[key];
    }
    await saveAllPreferences();
    showNotification('הגדרות מערכת אופסו', 'success');
  }
}

// ===== פונקציות הגדרות אישיות =====

/**
 * שומר הגדרות אישיות
 */
async function savePersonalPreferences() {
  await saveAllPreferences();
  showNotification('הגדרות אישיות נשמרו', 'success');
}

/**
 * מאפס הגדרות אישיות
 */
async function resetPersonalPreferences() {
  if (confirm('האם אתה בטוח שברצונך לאפס את ההגדרות האישיות?')) {
    // איפוס הגדרות אישיות לברירות מחדל
    for (const key in preferencesData.defaults) {
      preferencesData.user[key] = preferencesData.defaults[key];
    }
    await saveAllPreferences();
    showNotification('הגדרות אישיות אופסו', 'success');
  }
}

// ===== פונקציות הגדרות אבטחה =====

/**
 * שומר הגדרות אבטחה
 */
async function saveSecurityPreferences() {
  await saveAllPreferences();
  showNotification('הגדרות אבטחה נשמרו', 'success');
}

/**
 * מאפס הגדרות אבטחה
 */
async function resetSecurityPreferences() {
  if (confirm('האם אתה בטוח שברצונך לאפס את הגדרות האבטחה?')) {
    // איפוס הגדרות אבטחה לברירות מחדל
    for (const key in preferencesData.defaults) {
      preferencesData.user[key] = preferencesData.defaults[key];
    }
    await saveAllPreferences();
    showNotification('הגדרות אבטחה אופסו', 'success');
  }
}

// ===== פונקציות הגדרות תצוגה =====

/**
 * שומר הגדרות תצוגה
 */
async function saveDisplayPreferences() {
  await saveAllPreferences();
  showNotification('הגדרות תצוגה נשמרו', 'success');
}

/**
 * מאפס הגדרות תצוגה
 */
async function resetDisplayPreferences() {
  if (confirm('האם אתה בטוח שברצונך לאפס את הגדרות התצוגה?')) {
    // איפוס הגדרות תצוגה לברירות מחדל
    for (const key in preferencesData.defaults) {
      preferencesData.user[key] = preferencesData.defaults[key];
    }
    await saveAllPreferences();
    showNotification('הגדרות תצוגה אופסו', 'success');
  }
}

// ===== פונקציות עזר =====

/**
 * מציג הודעת התראה
 */
function showNotification(message, type = 'success') {
  try {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#f8d7da' : '#d4edda';
    const textColor = type === 'error' ? '#721c24' : '#155724';
    const borderColor = type === 'error' ? '#f5c6cb' : '#c3e6cb';
    
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
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // הצגת ההודעה
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
    console.error('Error showing notification:', error);
  }
}

/**
 * מעדכן את סיכום ההעדפות - הוסר
 */
// function updatePreferencesSummary() {
//   const summaryContainer = document.getElementById('preferencesSummary');
//   if (summaryContainer) {
//     const systemStatus = preferencesData.system.autoSave ? 'פעילות' : 'לא פעילות';
//     const personalStatus = preferencesData.personal.name ? 'מוגדרות' : 'לא מוגדרות';
//     const securityStatus = preferencesData.security.twoFactorAuth ? 'מוגנות' : 'בסיסיות';
//     const displayStatus = preferencesData.display.theme === 'light' ? 'בהירות' : 'כהות';
//     
//     summaryContainer.innerHTML = `
//       <div class="preferences-summary-content">
//         <div class="summary-item">
//           <span class="summary-icon">🔧</span>
//           <span class="summary-text">הגדרות מערכת: <strong>${systemStatus}</strong></span>
//         </div>
//         <div class="summary-item">
//           <span class="summary-icon">👤</span>
//           <span class="summary-text">הגדרות אישיות: <strong>${personalStatus}</strong></span>
//         </div>
//         <div class="summary-item">
//           <span class="summary-icon">🔒</span>
//           <span class="summary-text">הגדרות אבטחה: <strong>${securityStatus}</strong></span>
//         </div>
//         <div class="summary-item">
//           <span class="summary-icon">🎨</span>
//           <span class="summary-text">הגדרות תצוגה: <strong>${displayStatus}</strong></span>
//         </div>
//       </div>
//     `;
//   }
// }

// ===== אתחול הדף =====

/**
 * אתחול עמוד ההעדפות
 */
async function initializePreferencesPage() {
  console.log('🔄 === אתחול עמוד העדפות ===');
  
  // טעינת העדפות שמורות
  await loadAllPreferences();
  
  // הגדרת אירועים
  setupEventListeners();
  
  console.log('✅ עמוד העדפות אותחל בהצלחה');
}

/**
 * הגדרת אירועי לחיצה
 */
function setupEventListeners() {
  // אירועים יוכנסו כאן בעת הצורך
  console.log('🔄 אירועים הוגדרו');
}

// ===== ייצוא פונקציות =====

// הגדרת הפונקציות כגלובליות
window.loadAllPreferences = loadAllPreferences;
window.saveAllPreferences = saveAllPreferences;
window.resetAllPreferences = resetAllPreferences;
window.savePreference = savePreference;
window.getPreference = getPreference;
window.getDefaultPreference = getDefaultPreference;
window.saveSystemPreferences = saveSystemPreferences;
window.resetSystemPreferences = resetSystemPreferences;
window.savePersonalPreferences = savePersonalPreferences;
window.resetPersonalPreferences = resetPersonalPreferences;
window.saveSecurityPreferences = saveSecurityPreferences;
window.resetSecurityPreferences = resetSecurityPreferences;
window.saveDisplayPreferences = saveDisplayPreferences;
window.resetDisplayPreferences = resetDisplayPreferences;
window.initializePreferencesPage = initializePreferencesPage;

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', function() {
  initializePreferencesPage().catch(error => {
    console.error('שגיאה באתחול עמוד העדפות:', error);
  });
});
