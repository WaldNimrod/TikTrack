/**
 * ========================================
 * טריידים - Trades Management
 * ========================================
 * 
 * קובץ ייעודי לניהול טריידים (trades.js)
 * משמש גם בדף "מעקב" (tracking.html) וגם בדף "דאטאבייס" (database.html)
 * מכיל את כל הפונקציות הספציפיות לטריידים
 * 
 * דפים שמשתמשים בקובץ זה:
 * - tracking.html - דף מעקב טריידים
 * - database.html - דף דאטאבייס (טבלת טריידים)
 * 
 * פונקציות עיקריות:
 * - loadTradesData() - טעינת נתוני טריידים
 * - updateTradesTable() - עדכון טבלת הטריידים
 * - filterTradesData() - פילטור נתוני טריידים
 * - showAddTradeModal() - הצגת מודל הוספת טרייד
 * - saveNewTradeRecord() - שמירת טרייד חדש
 * - editTradeRecord() - עריכת טרייד
 * - cancelTradeRecord() - ביטול טרייד
 * - deleteTradeRecord() - מחיקת טרייד
 * - validateTradeForm() - ולידציה של טופס
 * 
 * תכונות חדשות:
 * - ולידציה מלאה של טופס הוספת טרייד
 * - שמירה לשרת עם API
 * - טעינת נתונים למודל (חשבונות, תוכניות)
 * - הודעות שגיאה והצלחה
 * - עיצוב אחיד עם שאר המודלים
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025-08-20
 * ========================================
 */

// משתנים גלובליים לדף המעקב
let tradesData = [];
window.tradesData = tradesData;

/**
 * טעינת נתוני טריידים מהשרת
 * 
 * פונקציה זו טוענת את כל הטריידים מהשרת ומעדכנת את הטבלה
 * כולל טיפול בשגיאות ועדכון המשתנה הגלובלי
 * 
 * תכונות:
 * - קריאה ל-API `/api/v1/trades/`
 * - טיפול בפורמט נתונים שונה
 * - עדכון משתנה גלובלי
 * - עדכון ישיר של הטבלה
 * - טיפול בשגיאות עם הודעה למשתמש
 * 
 * @returns {Promise<void>}
 */
async function loadTradesData() {
  try {
    console.log('🔄 === LOAD TRADES DATA ===');
    console.log('🔄 Starting to load trades data...');
    console.log('🔄 Current URL:', window.location.href);
    console.log('🔄 API URL:', '/api/v1/trades/');

    // קריאה מה-API
    console.log('🔄 Fetching from API...');
    const response = await fetch('/api/v1/trades/');
    console.log('🔄 Response status:', response.status);
    console.log('🔄 Response headers:', response.headers);

    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let apiData = await response.json();
    console.log('🔄 Raw API response:', apiData);

    // בדיקה שהנתונים בפורמט הנכון
    if (apiData && apiData.data && Array.isArray(apiData.data)) {
      apiData = apiData.data;
    }

    console.log('📡 נתונים מה-API:', apiData);
    console.log('📡 אורך הנתונים:', apiData ? apiData.length : 'null');

    // עדכון הנתונים המקומיים
    tradesData = apiData.map(trade => ({
      id: trade.id,
      account_id: trade.account_id,
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
      status: trade.status,
      type: trade.type,
      opened_at: trade.created_at,
      closed_at: trade.closed_at,
      total_pl: trade.total_pl,
      notes: trade.notes
    }));

    // עדכון המשתנה הגלובלי
    window.tradesData = tradesData;

    console.log('📊 נתונים מעודכנים:', tradesData.length, 'trades');

    // עדכון ישיר של הטבלה - ללא פילטרים מורכבים
    console.log('🔄 Updating trades table directly with', tradesData.length, 'trades');
    updateTradesTable(tradesData);

  } catch (error) {
    console.error('❌ Error loading trades data:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);

    const tbody = document.querySelector('#tradesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
    } else {
      console.error('❌ Table body not found for error display');
    }
  }
}

/**
 * פילטור נתוני טריידים
 * 
 * פונקציה זו מסננת את נתוני הטריידים לפי הפרמטרים שהועברו
 * כרגע מחזירה את כל הנתונים ללא פילטור (כמו בדף database)
 * 
 * @param {Array} selectedStatuses - מערך סטטוסים נבחרים
 * @param {Array} selectedTypes - מערך סוגים נבחרים
 * @param {Array} selectedAccounts - מערך חשבונות נבחרים
 * @param {Object} selectedDateRange - טווח תאריכים נבחר
 * @param {string} searchTerm - מונח חיפוש
 */
function filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
  console.log('🔄 === FILTER TRADES DATA (SIMPLE) ===');

  // החזרת כל הנתונים ללא פילטור - כמו בדף database
  const globalTradesData = window.tradesData || [];
  console.log('🔄 Returning all trades without filtering:', globalTradesData.length, 'trades');

  updateTradesTable(globalTradesData);
}

/**
 * פונקציה לעדכון טבלת הטריידים
 */
function updateTradesTable(trades) {
  console.log('🔄 === UPDATE TRADES TABLE ===');
  console.log('🔄 Trades to display:', trades ? trades.length : 'null');

  // בדיקה שהנתונים תקינים
  if (!trades || !Array.isArray(trades)) {
    console.error('❌ Invalid trades data:', trades);
    return;
  }

  const tbody = document.querySelector('#tradesTable tbody');
  if (!tbody) {
    console.error('❌ Table body not found - looking for #tradesTable tbody');
    return;
  }
  console.log('✅ Table body found, updating with', trades.length, 'trades');

  const tableHTML = trades.map(trade => {
    const statusDisplay = trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח';
    const typeDisplay = getTypeDisplay(trade.type);

    return `
    <tr>
      <td><strong>${trade.account_name || trade.account_id || 'חשבון לא ידוע'}</strong></td>
      <td><strong><a href="#" onclick="viewTickerDetails('${trade.ticker_id}')" class="ticker-link">${trade.ticker_symbol || 'טיקר לא ידוע'}</a></strong></td>
      <td>${trade.trade_plan_id ? `תוכנית ${trade.trade_plan_id}` : '-'}</td>
      <td><span class="status-badge status-${trade.status || 'open'}">${statusDisplay}</span></td>
      <td>${typeDisplay}</td>
      <td>${trade.side || 'Long'}</td>
      <td>${trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'לא מוגדר'}</td>
      <td>${trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : ''}</td>
      <td class="${trade.total_pl >= 0 ? 'text-success' : 'text-danger'}">${trade.total_pl ? `$${trade.total_pl.toFixed(2)}` : '$0.00'}</td>
      <td>${trade.notes || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editTradeRecord('${trade.id}')" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-secondary" onclick="cancelTradeRecord('${trade.id}')" title="ביטול">X</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTradeRecord('${trade.id}')" title="מחק">🗑️</button>
      </td>
    </tr>
  `;
  }).join('');

  tbody.innerHTML = tableHTML;
  console.log('✅ Table updated successfully');

  // עדכון ספירת רשומות
  const countElement = document.querySelector('.section-header .table-title');
  if (countElement) {
    countElement.textContent = `📋 מעקב טריידים (${trades.length})`;
  }
}

/**
 * פונקציה לתרגום סוג לעברית
 */
function getTypeDisplay(type) {
  const typeMap = {
    'swing': 'סווינג',
    'investment': 'השקעה',
    'passive': 'פאסיבי',
    'buy': 'קנייה',
    'sell': 'מכירה'
  };
  return typeMap[type] || type;
}

/**
 * פונקציות נוספות
 */
function viewTickerDetails(tickerId) {
  console.log('צפייה בפרטי טיקר:', tickerId);
  // כאן יוכנס קוד לצפייה בפרטי טיקר
}

function editTradeRecord(tradeId) {
  console.log('עריכת טרייד:', tradeId);
  // מציאת הטרייד במערך
  const trade = tradesData.find(t => t.id == tradeId);
  if (trade) {
    showEditTradeModal(trade);
  } else {
    console.error('❌ Trade not found:', tradeId);
    alert('טרייד לא נמצא');
  }
}

function cancelTradeRecord(tradeId) {
  console.log('ביטול טרייד:', tradeId);
  if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
    // TODO: Implement cancel trade API call
    alert('פונקציית ביטול טרייד תתווסף בקרוב');
  }
}

function deleteTradeRecord(tradeId) {
  console.log('מחיקת טרייד:', tradeId);
  if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה?')) {
    // TODO: Implement delete trade API call
    alert('פונקציית מחיקת טרייד תתווסף בקרוב');
  }
}

// פונקציה להצגת מודל עריכת טרייד
function showEditTradeModal(trade) {
  console.log('הצגת מודל עריכת טרייד:', trade);
  // TODO: Implement edit trade modal
  alert(`עריכת טרייד ${trade.id} - ${trade.ticker_symbol} תתווסף בקרוב`);
}

/**
 * הצגת מודל הוספת טרייד
 * 
 * פונקציה זו פותחת את מודל ההוספה ומכינה אותו לשימוש
 * 
 * תכונות:
 * - טעינת נתונים למודל (חשבונות, תוכניות טרייד)
 * - ניקוי טופס ההוספה
 * - הגדרת תאריך נוכחי אוטומטי
 * - הצגת המודל עם Bootstrap
 * 
 * תלויות:
 * - loadModalData() - טעינת נתונים למודל
 * - Bootstrap Modal
 */
function showAddTradeModal() {
  console.log('🔄 === SHOW ADD TRADE MODAL ===');

  // טעינת נתונים למודל
  loadModalData();

  // ניקוי הטופס
  const form = document.getElementById('addTradeForm');
  if (form) {
    form.reset();
  }

  // הגדרת תאריך נוכחי
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  const dateInput = document.getElementById('addTradeOpenedAt');
  if (dateInput) dateInput.value = todayStr;

  // הצגת המודל
  const modalElement = document.getElementById('addTradeModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    console.error('Modal element not found');
  }
}

/**
 * ולידציה של טופס הוספת טרייד
 * 
 * פונקציה זו בודקת את תקינות הטופס לפני שליחה לשרת
 * 
 * תכונות:
 * - בדיקת שדות חובה
 * - הצגת הודעות שגיאה מתאימות
 * - ניקוי שגיאות קודמות
 * - החזרת תוצאה בוליאנית
 * 
 * שדות נבדקים:
 * - סוג טרייד (type)
 * - צד (side)
 * - חשבון (account_id)
 * 
 * @returns {boolean} true אם הטופס תקין, false אם לא
 */
function validateTradeForm() {
  console.log('🔄 === VALIDATE TRADE FORM ===');

  const form = document.getElementById('addTradeForm');
  if (!form) {
    console.error('Form element not found');
    return false;
  }

  // ניקוי שגיאות קודמות
  clearTradeValidationErrors();

  let isValid = true;

  // בדיקת סוג טרייד
  const typeElement = document.getElementById('addTradeType');
  if (!typeElement.value) {
    showTradeValidationError('typeError', 'יש לבחור סוג טרייד');
    isValid = false;
  }

  // בדיקת צד
  const sideElement = document.getElementById('addTradeSide');
  if (!sideElement.value) {
    showTradeValidationError('sideError', 'יש לבחור צד');
    isValid = false;
  }

  // בדיקת חשבון
  const accountElement = document.getElementById('addTradeAccountId');
  if (!accountElement.value) {
    showTradeValidationError('accountError', 'יש לבחור חשבון');
    isValid = false;
  }

  if (!isValid) {
    showErrorNotification('שדות חובה חסרים', 'יש למלא את כל השדות החובה');
  }

  return isValid;
}

/**
 * הצגת שגיאת ולידציה
 * 
 * פונקציה זו מציגה הודעת שגיאה מתחת לשדה המתאים
 * 
 * @param {string} errorId - מזהה אלמנט השגיאה
 * @param {string} message - הודעת השגיאה
 */
function showTradeValidationError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

/**
 * ניקוי שגיאות ולידציה
 * 
 * פונקציה זו מסתירה את כל הודעות השגיאה בטופס
 */
function clearTradeValidationErrors() {
  const errorIds = ['typeError', 'sideError', 'accountError', 'tradePlanError'];
  errorIds.forEach(id => {
    const errorElement = document.getElementById(id);
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  });
}

/**
 * שמירת טרייד חדש
 * 
 * פונקציה זו שומרת טרייד חדש לשרת
 * כולל ולידציה, איסוף נתונים וטיפול בשגיאות
 * 
 * תכונות:
 * - ולידציה של טופס לפני שליחה
 * - איסוף נתונים מכל שדות הטופס
 * - שליחה לשרת עם API
 * - טיפול בשגיאות והודעות למשתמש
 * - סגירת המודל ורענון הטבלה
 * 
 * מבנה הנתונים הנשלח:
 * - account_id: מזהה החשבון
 * - ticker_id: מזהה הטיקר (אופציונלי)
 * - trade_plan_id: מזהה תוכנית טרייד (אופציונלי)
 * - type: סוג הטרייד (swing, investment, passive)
 * - side: צד הטרייד (Long, Short)
 * - status: סטטוס (open)
 * - created_at: תאריך יצירה
 * - closed_at: תאריך סגירה (אופציונלי)
 * - notes: הערות (אופציונלי)
 * 
 * @returns {Promise<void>}
 */
async function saveNewTradeRecord() {
  console.log('🔄 === SAVE NEW TRADE RECORD ===');

  // בדיקת ולידציה
  if (!validateTradeForm()) {
    return;
  }

  // איסוף נתונים מהטופס
  const formData = {
    account_id: parseInt(document.getElementById('addTradeAccountId').value),
    ticker_id: parseInt(document.getElementById('addTradeTickerId').value) || null,
    trade_plan_id: parseInt(document.getElementById('addTradeTradePlanId').value) || null,
    type: document.getElementById('addTradeType').value,
    side: document.getElementById('addTradeSide').value,
    status: 'open',
    created_at: document.getElementById('addTradeOpenedAt').value,
    closed_at: document.getElementById('addTradeClosedAt').value || null,
    notes: document.getElementById('addTradeNotes').value || null
  };

  console.log('שולח טרייד חדש:', formData);

  try {
    const response = await fetch('/api/v1/trades/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const newTrade = await response.json();
      console.log('טרייד נשמר בהצלחה:', newTrade);

      showSuccessNotification('טרייד נשמר בהצלחה', 'הטרייד החדש נוסף למערכת');

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addTradeModal'));
      modal.hide();

      // רענון הטבלה
      loadTradesData();

    } else {
      const errorData = await response.json();
      console.error('שגיאה בשמירת טרייד:', errorData);
      showErrorNotification('שגיאה בשמירת טרייד', errorData.message || 'שגיאה לא ידועה');
    }

  } catch (error) {
    console.error('שגיאה בשמירת טרייד:', error);
    showErrorNotification('שגיאה בשמירת טרייד', 'שגיאה בתקשורת עם השרת');
  }
}

/**
 * טעינת נתונים למודל
 * 
 * פונקציה זו טוענת את הנתונים הנדרשים למודל ההוספה
 * 
 * תכונות:
 * - טעינת חשבונות מ-API
 * - טעינת תוכניות טרייד מ-API
 * - מילוי רשימות בחירה במודל
 * - טיפול בשגיאות
 * 
 * נתונים נטענים:
 * - חשבונות: שם וסוג מטבע
 * - תוכניות טרייד: סמל טיקר וסוג השקעה
 * 
 * @returns {Promise<void>}
 */
async function loadModalData() {
  try {
    console.log('🔄 טוען נתונים למודל...');

    // טעינת חשבונות
    const accountsResponse = await fetch('/api/v1/accounts/');
    const accounts = await accountsResponse.json();

    // טעינת תוכניות טרייד
    const tradePlansResponse = await fetch('/api/v1/trade_plans/');
    const tradePlans = await tradePlansResponse.json();

    // מילוי רשימת חשבונות
    const accountSelect = document.getElementById('addTradeAccountId');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
      accounts.data.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.currency})`;
        accountSelect.appendChild(option);
      });
    }

    // מילוי רשימת תוכניות טרייד
    const tradePlanSelect = document.getElementById('addTradeTradePlanId');
    if (tradePlanSelect) {
      tradePlanSelect.innerHTML = '<option value="">ללא תוכנית</option>';
      tradePlans.data.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        option.textContent = `${plan.ticker_symbol} - ${plan.investment_type}`;
        tradePlanSelect.appendChild(option);
      });
    }

    console.log('✅ נתונים נטענו למודל');

  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל:', error);
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף המעקב
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (tracking) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // שמירת הפילטרים
  window.selectedStatusesForFilter = selectedStatuses || [];
  window.selectedTypesForFilter = selectedTypes || [];
  window.selectedDateRangeForFilter = selectedDateRange || null;
  window.searchTermForFilter = searchTerm || '';

  // טעינת נתונים מחדש עם הפילטרים החדשים
  if (typeof window.loadTradesData === 'function') {
    console.log('🔄 Calling loadTradesData with new filters');
    window.loadTradesData();
  } else {
    console.error('❌ loadTradesData function not found');
  }
};

// ========================================
// ייצוא פונקציות לגלובל
// ========================================
// 
// פונקציות יסוד:
window.loadTradesData = loadTradesData;                    // טעינת נתוני טריידים
window.updateTradesTable = updateTradesTable;              // עדכון טבלת טריידים
window.filterTradesData = filterTradesData;                // פילטור נתוני טריידים

// פונקציות פעולות:
window.viewTickerDetails = viewTickerDetails;              // צפייה בפרטי טיקר
window.editTradeRecord = editTradeRecord;                  // עריכת טרייד
window.cancelTradeRecord = cancelTradeRecord;              // ביטול טרייד
window.deleteTradeRecord = deleteTradeRecord;              // מחיקת טרייד

// פונקציות מודלים:
window.showAddTradeModal = showAddTradeModal;              // הצגת מודל הוספה
window.showEditTradeModal = showEditTradeModal;            // הצגת מודל עריכה
window.saveNewTradeRecord = saveNewTradeRecord;            // שמירת טרייד חדש

// פונקציות ולידציה:
window.validateTradeForm = validateTradeForm;              // ולידציה של טופס
window.showTradeValidationError = showTradeValidationError; // הצגת שגיאת ולידציה
window.clearTradeValidationErrors = clearTradeValidationErrors; // ניקוי שגיאות ולידציה

// פונקציות עזר:
window.loadModalData = loadModalData;                      // טעינת נתונים למודל

// קריאה לטעינת נתונים כשהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === TRADES.JS DOM CONTENT LOADED ===');
    setTimeout(() => {
      if (typeof window.loadTradesData === 'function') {
        console.log('🔄 Calling loadTradesData from trades.js');
        window.loadTradesData();
      }
    }, 1000);
  });
} else {
  // הדף כבר נטען
  console.log('🔄 === TRADES.JS PAGE ALREADY LOADED ===');
  setTimeout(() => {
    if (typeof window.loadTradesData === 'function') {
      console.log('🔄 Calling loadTradesData from trades.js (already loaded)');
      window.loadTradesData();
    }
  }, 1000);
}
