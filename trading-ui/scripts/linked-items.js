/**
 * Linked Items - TikTrack Linked Items Management
 * ===============================================
 * 
 * This file contains all linked items functionality including:
 * - Viewing linked items
 * - Loading linked items data
 * - Creating linked items modals
 * - Item details management
 * 
 * This module handles the display and management of relationships between
 * different entities in the TikTrack system (trades, accounts, tickers, etc.)
 * 
 * @version 1.0
 * @lastUpdated August 24, 2025
 */

// ===== מערכת פריטים מקושרים =====
// Linked items system

/**
 * פונקציה לצפייה באלמנטים מקושרים
 * Global function for viewing linked items
 * 
 * @param {number|string} itemId - מזהה האלמנט
 * @param {string} itemType - סוג האלמנט (optional)
 */
function viewLinkedItems(itemId, itemType = null) {
  console.log('🔄 צפייה באלמנטים מקושרים:', { itemId, itemType });

  // זיהוי סוג האלמנט לפי הדף הנוכחי אם לא צוין
  if (!itemType) {
    const currentPath = window.location.pathname;
    console.log('📍 נתיב נוכחי:', currentPath);
    if (currentPath.includes('/accounts')) itemType = 'account';
    else if (currentPath.includes('/trades') || currentPath.includes('trades.html')) itemType = 'trade';
    else if (currentPath.includes('/tickers')) itemType = 'ticker';
    else if (currentPath.includes('/alerts')) itemType = 'alert';
    else if (currentPath.includes('/cash_flows')) itemType = 'cash_flow';
    else if (currentPath.includes('/notes')) itemType = 'note';
    else if (currentPath.includes('/trade_plans')) itemType = 'trade_plan';
    else if (currentPath.includes('/executions')) itemType = 'execution';
  }

  console.log('🎯 סוג אלמנט שנבחר:', itemType);

  // טעינת הנתונים המקושרים
  loadLinkedItemsData(itemId, itemType);
}

/**
 * פונקציה לטעינת נתונים מקושרים
 * Load linked items data from server
 * 
 * @param {number|string} itemId - מזהה האלמנט
 * @param {string} itemType - סוג האלמנט
 */
async function loadLinkedItemsData(itemId, itemType) {
  try {
    console.log(`🔄 טעינת נתונים מקושרים ל-${itemType} ${itemId}`);

    // קריאה ל-API לקבלת נתונים מקושרים
    const response = await fetch(`/api/v1/linked-items/${itemType}/${itemId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 נתונים מקושרים נטענו:', data);

    // הצגת המודל עם הנתונים
    showLinkedItemsModal(data, itemType, itemId);

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים מקושרים:', error);

    // הצגת הודעה למשתמש
    if (typeof window.showNotification === 'function') {
      window.showNotification('מציג נתונים לדוגמה - API בפיתוח', 'info');
    }

    // הצגת מודל עם נתונים לדוגמה (לפיתוח)
    showLinkedItemsModal(getMockLinkedData(itemType, itemId), itemType, itemId);
  }
}

/**
 * פונקציה להצגת מודל פרטים מקושרים
 * Show linked items modal with data
 * 
 * @param {Object} data - הנתונים להצגה
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 */
function showLinkedItemsModal(data, itemType, itemId) {
  console.log('🔄 הצגת מודל פרטים מקושרים:', { data, itemType, itemId });

  // יצירת תוכן המודל
  const modalContent = createLinkedItemsModalContent(data, itemType, itemId);

  // יצירת המודל
  const modal = createModal('linkedItemsModal', 'פרטים מקושרים', modalContent);

  // הצגת המודל
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    console.log('🚀 הצגת מודל Bootstrap');
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  } else {
    console.log('⚠️ Bootstrap לא זמין, מציג fallback');
    // fallback למודל פשוט
    modal.style.display = 'block';
    modal.classList.add('show');
  }
}

/**
 * פונקציה ליצירת תוכן המודל
 * Create modal content for linked items
 * 
 * @param {Object} data - הנתונים להצגה
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 * @returns {string} HTML content
 */
function createLinkedItemsModalContent(data, itemType, itemId) {
  const itemTypeNames = {
    'trade': 'טרייד',
    'account': 'חשבון',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'cash_flow': 'תזרים מזומנים',
    'note': 'הערה',
    'trade_plan': 'תוכנית טרייד',
    'execution': 'ביצוע'
  };

  const itemTypeName = itemTypeNames[itemType] || itemType;

  let content = `
    <div class="modal-header">
      <h5 class="modal-title">פרטים מקושרים - ${itemTypeName} ${itemId}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <!-- הודעת פיתוח -->
      <div class="development-notice">
        <div class="development-header">
          <h6>🚧 מערכת בפיתוח</h6>
          <p>מערכת הפרטים המקושרים נמצאת בפיתוח. להלן דוגמה של הנתונים שיוצגו:</p>
        </div>
      </div>
      
      <div class="linked-items-container">
        <div class="linked-items-section">
          <h6>🔗 ישויות בנות (Child Entities)</h6>
          <div class="linked-items-list" id="childEntitiesList">
            ${createLinkedItemsList(data.childEntities || [])}
          </div>
        </div>
        
        <div class="linked-items-section">
          <h6>📋 ישויות אם (Parent Entities)</h6>
          <div class="linked-items-list" id="parentEntitiesList">
            ${createLinkedItemsList(data.parentEntities || [])}
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
      <button type="button" class="btn btn-primary" onclick="exportLinkedItemsData('${itemType}', ${itemId})">ייצא נתונים</button>
    </div>
  `;

  return content;
}

/**
 * פונקציה ליצירת רשימת אלמנטים מקושרים
 * Create linked items list HTML
 * 
 * @param {Array} items - רשימת האלמנטים
 * @returns {string} HTML content
 */
function createLinkedItemsList(items) {
  console.log('🔄 יצירת רשימת אלמנטים מקושרים:', items);
  
  if (!items || items.length === 0) {
    return '<div class="no-linked-items">אין אלמנטים מקושרים</div>';
  }

  return items.map(item => {
    console.log('🔄 עיבוד אלמנט:', item);
    const detailedInfo = createDetailedItemInfo(item);
    console.log('🔄 פרטים מפורטים:', detailedInfo);
    
    return `
      <div class="linked-item-card">
        <div class="linked-item-header">
          <span class="linked-item-type">${getItemTypeIcon(item.type)} ${getItemTypeDisplayName(item.type)}</span>
          <span class="linked-item-id">#${item.id}</span>
        </div>
        <div class="linked-item-content">
          <div class="linked-item-title">${item.title || item.name || `אלמנט ${item.id}`}</div>
          <div class="linked-item-details">
            ${detailedInfo}
          </div>
          <div class="linked-item-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})" title="צפייה בפרטים">
              👁️ צפייה
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="editItem('${item.type}', ${item.id})" title="עריכה">
              ✏️ ערוך
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item.type}', ${item.id})" title="מחיקה">
              🗑️ מחק
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * פונקציה לקבלת אייקון לסוג אלמנט
 * Get icon for item type
 * 
 * @param {string} type - סוג האלמנט
 * @returns {string} אייקון
 */
function getItemTypeIcon(type) {
  const icons = {
    'trade': '📈',
    'account': '💰',
    'ticker': '📊',
    'alert': '🔔',
    'cash_flow': '💸',
    'note': '📝',
    'trade_plan': '📋',
    'execution': '⚡'
  };
  return icons[type] || '📄';
}

/**
 * פונקציה לקבלת שם תצוגה לסוג אלמנט
 * Get display name for item type
 * 
 * @param {string} type - סוג האלמנט
 * @returns {string} שם תצוגה
 */
function getItemTypeDisplayName(type) {
  const displayNames = {
    'trade': 'טרייד',
    'account': 'חשבון',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'cash_flow': 'תזרים מזומנים',
    'note': 'הערה',
    'trade_plan': 'תוכנית טרייד',
    'execution': 'ביצוע'
  };
  return displayNames[type] || type;
}

/**
 * פונקציה ליצירת מידע מפורט על אלמנט
 * Create detailed item information
 * 
 * @param {Object} item - האלמנט
 * @returns {string} HTML עם פרטים מפורטים
 */
function createDetailedItemInfo(item) {
  console.log('🔄 יצירת פרטים מפורטים עבור:', item);
  let details = '';

  // הוספת תיאור כללי
  if (item.description || item.notes) {
    details += `<div class="item-description">${item.description || item.notes}</div>`;
  }

  // הוספת פרטים ספציפיים לפי סוג
  switch (item.type) {
    case 'trade':
      console.log('🔄 יצירת פרטי טרייד');
      details += createTradeDetails(item);
      break;
    case 'account':
      console.log('🔄 יצירת פרטי חשבון');
      details += createAccountDetails(item);
      break;
    case 'ticker':
      console.log('🔄 יצירת פרטי טיקר');
      details += createTickerDetails(item);
      break;
    case 'alert':
      console.log('🔄 יצירת פרטי התראה');
      details += createAlertDetails(item);
      break;
    case 'cash_flow':
      console.log('🔄 יצירת פרטי תזרים מזומנים');
      details += createCashFlowDetails(item);
      break;
    case 'note':
      console.log('🔄 יצירת פרטי הערה');
      details += createNoteDetails(item);
      break;
    case 'trade_plan':
      console.log('🔄 יצירת פרטי תוכנית טרייד');
      details += createTradePlanDetails(item);
      break;
    case 'execution':
      console.log('🔄 יצירת פרטי ביצוע');
      details += createExecutionDetails(item);
      break;
    default:
      console.log('🔄 יצירת פרטים כלליים');
      details += createGenericDetails(item);
  }

  console.log('🔄 פרטים סופיים:', details);
  return details;
}

/**
 * פונקציות ליצירת פרטים ספציפיים לכל סוג אלמנט
 */

function createTradeDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג השקעה:</span>
        <span class="detail-value">${item.investment_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">צד:</span>
        <span class="detail-value">${item.side || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">רווח/הפסד:</span>
        <span class="detail-value ${item.total_pl >= 0 ? 'positive' : 'negative'}">${item.total_pl ? `$${item.total_pl.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createAccountDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">מטבע:</span>
        <span class="detail-value">${item.currency || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">יתרה במזומן:</span>
        <span class="detail-value">${item.cash_balance ? `$${item.cash_balance.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">ערך כולל:</span>
        <span class="detail-value">${item.total_value ? `$${item.total_value.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">רווח/הפסד כולל:</span>
        <span class="detail-value ${item.total_pl >= 0 ? 'positive' : 'negative'}">${item.total_pl ? `$${item.total_pl.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createTickerDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סוג:</span>
        <span class="detail-value">${item.type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">מטבע:</span>
        <span class="detail-value">${item.currency || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">טריידים פעילים:</span>
        <span class="detail-value">${item.active_trades ? 'כן' : 'לא'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך עדכון:</span>
        <span class="detail-value">${item.updated_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createAlertDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג התראה:</span>
        <span class="detail-value">${item.alert_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">הופעלה:</span>
        <span class="detail-value">${item.is_triggered ? 'כן' : 'לא'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createCashFlowDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג:</span>
        <span class="detail-value">${item.flow_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סכום:</span>
        <span class="detail-value ${item.amount >= 0 ? 'positive' : 'negative'}">${item.amount ? `$${item.amount.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך:</span>
        <span class="detail-value">${item.flow_date || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createNoteDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג הערה:</span>
        <span class="detail-value">${item.note_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createTradePlanDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג השקעה:</span>
        <span class="detail-value">${item.investment_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">צד:</span>
        <span class="detail-value">${item.side || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createExecutionDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">פעולה:</span>
        <span class="detail-value">${item.action || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">כמות:</span>
        <span class="detail-value">${item.quantity || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">מחיר:</span>
        <span class="detail-value">${item.price ? `$${item.price.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך ביצוע:</span>
        <span class="detail-value">${item.execution_date || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createGenericDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

/**
 * פונקציה ליצירת מודל
 * Create modal element
 * 
 * @param {string} id - מזהה המודל
 * @param {string} title - כותרת המודל
 * @param {string} content - תוכן המודל
 * @returns {HTMLElement} אלמנט המודל
 */
function createModal(id, title, content) {
  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById(id);
  if (existingModal) {
    existingModal.remove();
  }

  // יצירת המודל החדש עם מבנה Bootstrap נכון
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal fade';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', `${id}Label`);
  modal.setAttribute('aria-hidden', 'true');

  // הוספת מבנה Bootstrap נכון
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;

  // הוספה לדף
  document.body.appendChild(modal);

  return modal;
}

/**
 * פונקציה לקבלת נתונים לדוגמה (לפיתוח)
 * Get mock data for development
 * 
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 * @returns {Object} נתונים לדוגמה
 */
function getMockLinkedData(itemType, itemId) {
  console.log(`🎭 יצירת נתונים לדוגמה עבור ${itemType} ${itemId}`);

  const mockData = {
    childEntities: [
      {
        id: 1,
        type: 'execution',
        title: 'ביצוע קנייה AAPL',
        description: 'קניית 100 מניות AAPL במחיר $150',
        status: 'completed',
        action: 'buy',
        quantity: 100,
        price: 150.00,
        execution_date: '2025-08-24 10:30:00',
        created_at: '2025-08-24 10:30:00'
      },
      {
        id: 2,
        type: 'alert',
        title: 'התראה מחיר AAPL',
        description: 'התראה על מחיר $150',
        status: 'active',
        alert_type: 'price',
        is_triggered: false,
        created_at: '2025-08-24 09:00:00'
      },
      {
        id: 3,
        type: 'note',
        title: 'הערה על הטרייד',
        description: 'טרייד ארוך טווח על Apple',
        status: 'active',
        note_type: 'trade_note',
        created_at: '2025-08-24 08:15:00'
      }
    ],
    parentEntities: [
      {
        id: 1,
        type: 'account',
        title: 'חשבון ראשי',
        description: 'חשבון המסחר הראשי',
        status: 'active',
        currency: 'USD',
        cash_balance: 50000.00,
        total_value: 125000.00,
        total_pl: 2500.00,
        created_at: '2025-01-01 00:00:00'
      },
      {
        id: 1,
        type: 'trade_plan',
        title: 'תוכנית AAPL',
        description: 'תוכנית מסחר על Apple לטווח ארוך',
        status: 'open',
        investment_type: 'swing',
        side: 'Long',
        created_at: '2025-08-20 14:30:00'
      },
      {
        id: 1,
        type: 'ticker',
        title: 'AAPL - Apple Inc.',
        description: 'מניה של Apple Inc.',
        status: 'active',
        type: 'stock',
        currency: 'USD',
        active_trades: true,
        updated_at: '2025-08-24 10:00:00',
        created_at: '2025-01-01 00:00:00'
      }
    ]
  };

  return mockData;
}

/**
 * פונקציה לייצוא נתונים מקושרים
 * Export linked items data
 * 
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 */
function exportLinkedItemsData(itemType, itemId) {
  console.log(`🔄 ייצוא נתונים מקושרים ל-${itemType} ${itemId}`);

  // כאן תהיה לוגיקת הייצוא
  if (typeof window.showNotification === 'function') {
    window.showNotification('ייצוא נתונים תפותח בקרוב', 'info');
  }
}

/**
 * פונקציה לצפייה בפרטי אלמנט
 * View item details
 * 
 * @param {string} type - סוג האלמנט
 * @param {string|number} id - מזהה האלמנט
 */
function viewItemDetails(type, id) {
  console.log(`🔄 צפייה בפרטי ${type} ${id}`);

  // ניווט לדף המתאים
  const pageMap = {
    'trade': '/trades',
    'account': '/accounts',
    'ticker': '/tickers',
    'alert': '/alerts',
    'cash_flow': '/cash_flows',
    'note': '/notes',
    'trade_plan': '/trade_plans',
    'execution': '/executions'
  };

  const targetPage = pageMap[type];
  if (targetPage) {
    window.location.href = targetPage;
  }
}

/**
 * פונקציה לעריכת אלמנט
 * Edit item
 * 
 * @param {string} type - סוג האלמנט
 * @param {string|number} id - מזהה האלמנט
 */
function editItem(type, id) {
  console.log(`🔄 עריכת ${type} ${id}`);

  // קריאה לפונקציית העריכה המתאימה
  const editFunctions = {
    'trade': 'editTradeRecord',
    'account': 'editAccount',
    'ticker': 'editTicker',
    'alert': 'editAlert',
    'cash_flow': 'editCashFlow',
    'note': 'editNote',
    'trade_plan': 'editTradePlan',
    'execution': 'editExecution'
  };

  const editFunction = editFunctions[type];
  if (editFunction && typeof window[editFunction] === 'function') {
    window[editFunction](id);
  }
}

/**
 * פונקציה למחיקת אלמנט
 * Delete item
 * 
 * @param {string} type - סוג האלמנט
 * @param {string|number} id - מזהה האלמנט
 */
function deleteItem(type, id) {
  console.log(`🔄 מחיקת ${type} ${id}`);

  // קריאה לפונקציית המחיקה המתאימה
  const deleteFunctions = {
    'trade': 'deleteTradeRecord',
    'account': 'deleteAccount',
    'ticker': 'deleteTicker',
    'alert': 'deleteAlert',
    'cash_flow': 'deleteCashFlow',
    'note': 'deleteNote',
    'trade_plan': 'deleteTradePlan',
    'execution': 'deleteExecution'
  };

  const deleteFunction = deleteFunctions[type];
  if (deleteFunction && typeof window[deleteFunction] === 'function') {
    window[deleteFunction](id);
  }
}

// ===== ייצוא פונקציות גלובליות =====
// Export global functions

window.viewLinkedItems = viewLinkedItems;
window.loadLinkedItemsData = loadLinkedItemsData;
window.showLinkedItemsModal = showLinkedItemsModal;
window.createLinkedItemsModalContent = createLinkedItemsModalContent;
window.createLinkedItemsList = createLinkedItemsList;
window.getItemTypeIcon = getItemTypeIcon;
window.getItemTypeDisplayName = getItemTypeDisplayName;
window.createDetailedItemInfo = createDetailedItemInfo;
window.createModal = createModal;
window.getMockLinkedData = getMockLinkedData;
window.exportLinkedItemsData = exportLinkedItemsData;
window.viewItemDetails = viewItemDetails;
window.editItem = editItem;
window.deleteItem = deleteItem;

console.log('✅ Linked Items module loaded successfully');
