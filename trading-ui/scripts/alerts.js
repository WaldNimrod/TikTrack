/* ===== מערכת התראות ===== */

// פונקציה לטעינת התראות
function loadAlerts() {
  const alertsContainer = document.getElementById('alertsContainer');
  if (!alertsContainer) return;
  
  // קביעת סוג הדף לפי URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const isDesignsPage = window.location.pathname.includes('designs');
  const isDatabasePage = window.location.pathname.includes('database');
  const isTrackingPage = window.location.pathname.includes('tracking');
  
  // קביעת פונקציית פתיחת פרטים לפי סוג הדף
  let openDetailsFunction = 'openTradeDetails';
  if (isPlanningPage) {
    openDetailsFunction = 'openPlanDetails';
  } else if (isDesignsPage) {
    openDetailsFunction = 'openDesignDetails';
  } else if (isDatabasePage) {
    openDetailsFunction = 'openDatabaseDetails';
  }
  
  // נתוני דמה להתראות - בהמשך יוחלפו בנתונים אמיתיים מהשרת
  const alerts = [
    { ticker: 'AAPL', message: 'מחיר חצה את 180$', price: '$184.32 (+1.2%)' },
    { ticker: 'TSLA', message: 'מחיר ירד מתחת ל-700$', price: '$688.90 (-2.1%)' },
    { ticker: 'MSFT', message: 'תזכורת לכניסה ביום שלישי', price: '$342.00 (+2.4%)' }
  ];
  
  const alertsHtml = alerts.map(alert => `
    <div class="alert-card">
      <strong onclick="${openDetailsFunction}('${alert.ticker}')">${alert.ticker}</strong><br />
      ${alert.message}<br />
      <span class="price">נוכחי: ${alert.price}</span>
      <button class="btn btn-secondary" onclick="markAlertAsRead(this, '${alert.ticker}')">סמן כנקרא</button>
    </div>
  `).join('');
  
  alertsContainer.innerHTML = alertsHtml;
  
  // עדכון מונה ההתראות
  const alertsCount = document.getElementById('alertsCount');
  if (alertsCount) {
    alertsCount.textContent = alerts.length;
  }
  
  console.log('🔄 === ALERTS LOADED ===');
  console.log('🔄 Page type:', isPlanningPage ? 'planning' : isDesignsPage ? 'designs' : isDatabasePage ? 'database' : 'tracking');
  console.log('🔄 Alerts count:', alerts.length);
}

// פונקציה לסמן התראה כנקראה
function markAlertAsRead(button, ticker) {
  const alertCard = button.closest('.alert-card');
  if (alertCard) {
    alertCard.classList.add('read');
    button.textContent = 'נקרא';
    button.disabled = true;
    console.log(`התראה עבור ${ticker} סומנה כנקראה`);
  }
}

// פונקציה לטעינת התראות מהשרת (לעתיד)
async function loadAlertsFromServer() {
  try {
    const response = await fetch('/api/alerts');
    if (response.ok) {
      const alerts = await response.json();
      // כאן יוכנס קוד לעיבוד הנתונים מהשרת
      console.log('🔄 Alerts loaded from server:', alerts);
    } else {
      console.error('🔄 Failed to load alerts from server');
    }
  } catch (error) {
    console.error('🔄 Error loading alerts from server:', error);
  }
}

// פונקציה לפתיחת פרטי עיצוב (לשימוש בדף עיצובים)
function openDesignDetails(ticker) {
  console.log('🔄 Opening design details for:', ticker);
  // כאן יוכנס קוד לפתיחת מודל פרטי עיצוב
}

// פונקציה לפתיחת פרטי תכנון (לשימוש בדף תכנון)
function openPlanDetails(ticker) {
  console.log('🔄 Opening plan details for:', ticker);
  // כאן יוכנס קוד לפתיחת מודל פרטי תכנון
}

// פונקציה לפתיחת פרטי מסד נתונים (לשימוש בדף מסד נתונים)
function openDatabaseDetails(ticker) {
  console.log('🔄 Opening database details for:', ticker);
  // כאן יוכנס קוד לפתיחת מודל פרטי מסד נתונים
}

// פונקציה לפתיחת פרטי מסחר (ברירת מחדל)
function openTradeDetails(ticker) {
  console.log('🔄 Opening trade details for:', ticker);
  // כאן יוכנס קוד לפתיחת מודל פרטי מסחר
}

// ייצוא הפונקציות לשימוש גלובלי
window.loadAlerts = loadAlerts;
window.markAlertAsRead = markAlertAsRead;
window.loadAlertsFromServer = loadAlertsFromServer;
window.openDesignDetails = openDesignDetails;
window.openPlanDetails = openPlanDetails;
window.openDatabaseDetails = openDatabaseDetails;
window.openTradeDetails = openTradeDetails;
