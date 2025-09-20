/**
 * Trades.js - TikTrack Frontend
 * =============================
 *
 * This file contains all trade management functionality for the TikTrack application.
 * It handles trade CRUD operations, table updates, filtering, and user interactions.
 *
 * TABLE STRUCTURE FIXES (August 24, 2025):
 * =======================================
 *
 * ISSUE: Table headers and data columns were inconsistent
 * - HTML had 10 columns but data rendering had 11 columns
 * - Column order mismatch between headers and data
 * - Sorting failed due to incorrect column mappings
 *
 * FIXES APPLIED:
 * - Updated tableHTML generation to match 11-column structure
 * - Fixed column order: account_name, ticker_symbol, trade_plan_id, status, etc.
 * - Updated "Show Linked Details" button onclick to use viewLinkedItemsForTrade()
 * - Fixed sortTable function to call window.sortTableData correctly
 * - Updated colspan from 10 to 11 in HTML loading row
 *
 * SORTING IMPROVEMENTS:
 * - Fixed sortTable function to use global window.sortTableData
 * - Corrected function parameters: (columnIndex, data, tableType, updateFunction)
 * - Integrated with global sorting system for consistency
 *
 * Usage:
 * - Used in trades.html (trades/tracking page)
 * - Used in database.html (database page - trades table)
 *
 * Features:
 * - Trade data loading and management
 * - Trade table updates and display

 * - Trade creation, editing, and deletion
 * - Integration with global translation system
 * - "Show Linked Details" button for viewing related entities
 *
 * Architecture:
 * - Modular function organization by responsibility
 * - Integration with global translation system
 * - Comprehensive error handling and user feedback
 * - State management for trade operations
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)

 * - linked-items.js (linked items modal functionality)
 *
 * Table Mapping:
 * - Uses 'trades' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * @version 1.9.9
 * @lastUpdated August 26, 2025
 * @tableStructureFixes August 24, 2025 - Fixed column structure and sorting
 *
 * פונקציות עיקריות:
 * - cancelTradeRecord() - ביטול טרייד
 * - deleteTradeRecord() - מחיקת טרייד
 * - validateTradeForm() - ולידציה של טופס
 * - viewLinkedItemsForTrade() - הצגת פריטים מקושרים לטרייד
 *
 * תכונות חדשות:
 * - ולידציה מלאה של טופס הוספת טרייד
 * - שמירה לשרת עם API
 * - טעינת נתונים למודל (חשבונות, תוכניות)
 * - הודעות שגיאה והצלחה
 * - עיצוב אחיד עם שאר המודלים
 * - כפתור "הצג פרטים מקושרים" בכל שורה
 *
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025-08-24
 * ========================================
 */

// בדיקה שהפונקציות הנדרשות נטענו
if (typeof showErrorNotification === 'undefined') {
  // console.error('showErrorNotification לא נטענה!');
}
if (typeof showSuccessNotification === 'undefined') {
  // console.error('showSuccessNotification לא נטענה!');
}
if (typeof handleFunctionNotFound === 'undefined') {
  // console.error('handleFunctionNotFound לא נטענה!');
}

// משתנים גלובליים לדף המעקב
if (typeof window.tradesData === 'undefined') {
  const tradesData = [];
  window.tradesData = tradesData;
}

/**
 * עיצוב שינוי יומי עם צבעים לפי העדפות
 * @param {number} dailyChange - השינוי היומי באחוזים
 * @returns {string} - HTML מעוצב עם צבעים
 */
function formatDailyChange(dailyChange) {
  if (dailyChange === undefined || dailyChange === null) {
    return '-';
  }
  
  const changeValue = parseFloat(dailyChange);
  const isPositive = changeValue >= 0;
  const sign = isPositive ? '+' : '';
  const formattedValue = `${sign}${changeValue.toFixed(2)}%`;
  
  // קבלת צבעים מהעדפות או ברירת מחדל
  const colors = window.getTableColors ? window.getTableColors() : { 
    positive: '#28a745', 
    negative: '#dc3545' 
  };
  
  const color = isPositive ? colors.positive : colors.negative;
  
  return `<span style="color: ${color}; font-weight: bold;">${formattedValue}</span>`;
}

/**
 * קביעת צבע לפי סוג השקעה
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} - קוד הצבע
 */
function getInvestmentTypeColor(investmentType) {
  // השתמש במערכת הצבעים הכללית אם היא זמינה
  if (window.getInvestmentTypeColor && window.getInvestmentTypeColor !== getInvestmentTypeColor) {
    return window.getInvestmentTypeColor(investmentType);
  }

  // ברירת מחדל אם המערכת הכללית לא זמינה
  if (!investmentType) {return '#6c757d';} // אפור לנתונים חסרים

  // השתמש במערכת הצבעים הכללית אם היא זמינה
  const typeColors = {
    'swing': window.getEntityColor ? window.getEntityColor('trade') : '#007bff',
    'investment': window.getEntityColor ? window.getEntityColor('account') : '#28a745',
    'passive': window.getEntityColor ? window.getEntityColor('note') : '#6f42c1',
  };

  const normalizedType = investmentType.toLowerCase().trim();
  return typeColors[normalizedType] || '#6c757d'; // ברירת מחדל אפור
}

/**
 * הוספת סולם צבעים לעמודת סוג השקעה
 */
function addInvestmentTypeColorLegend() {
  const tableContainer = document.querySelector('#tradesTable').closest('.table-container') ||
                        document.querySelector('#tradesTable').parentElement;

  if (!tableContainer) {return;}

  // בדיקה אם כבר קיים סולם צבעים
  const existingLegend = tableContainer.querySelector('.investment-type-legend');
  if (existingLegend) {
    existingLegend.remove();
  }

  const legendContainer = document.createElement('div');
  legendContainer.className = 'investment-type-legend';
  legendContainer.style.cssText = `
    margin: 10px 0;
    padding: 8px 12px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 0.85em;
  `;

  const legendTitle = document.createElement('div');
  legendTitle.textContent = '🎨 סולם צבעים - סוגי השקעה:';
  legendTitle.style.cssText = `
    font-weight: bold;
    margin-bottom: 8px;
    color: #495057;
  `;

  const legendItems = document.createElement('div');
  legendItems.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  `;

  // השתמש במערכת הצבעים הכללית אם היא זמינה
  const typeLabels = window.INVESTMENT_TYPE_LABELS || {
    'swing': 'סווינג',
    'investment': 'השקעה',
    'passive': 'פאסיבי',
  };

  // השתמש במערכת הצבעים הכללית אם היא זמינה
  if (window.createInvestmentTypeLegend) {
    const globalLegend = window.createInvestmentTypeLegend({
      title: '🎨 סולם צבעים - סוגי השקעה:',
      containerClass: 'investment-type-legend',
      showDescriptions: false,
      compact: false,
    });

    // החלף את התוכן הקיים
    legendContainer.innerHTML = '';
    legendContainer.appendChild(globalLegend);
  } else {
    // ברירת מחדל אם המערכת הכללית לא זמינה
    Object.entries(typeLabels).forEach(([type, label]) => {
      const color = getInvestmentTypeColor(type);
      const legendItem = document.createElement('span');
      legendItem.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 4px;
        background: white;
        border: 1px solid #dee2e6;
        font-size: 0.8em;
      `;

      const colorDot = document.createElement('span');
      colorDot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${color};
        border: 1px solid #dee2e6;
      `;

      const labelText = document.createElement('span');
      labelText.textContent = label;

      legendItem.appendChild(colorDot);
      legendItem.appendChild(labelText);
      legendItems.appendChild(legendItem);
    });
  }

  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(legendItems);

  // הוספה לפני הטבלה
  const table = document.querySelector('#tradesTable');
  tableContainer.insertBefore(legendContainer, table);
}

/**
 * טעינת נתוני טריידים מהשרת
 *
 * פונקציה זו טוענת את כל הטריידים מהשרת ומעדכנת את הטבלה
 * כולל טיפול בשגיאות ועדכון המשתנה הגלובלי
 *
 * תכונות:
 * - קריאה ל-API `/api/v1/trades/`
 * - טיפול בשגיאות רשת
 * - עדכון המשתנה הגלובלי window.tradesData
 * - עדכון הטבלה עם הנתונים החדשים
 * - תמיכה בפילטרים מקומיים
 *
 * @returns {Promise<void>}
 */
async function loadTradesData() {
  try {


    const response = await fetch('/api/v1/trades/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('📊 loadTradesData: Received data:', responseData?.data?.length || 0, 'trades');

    if (responseData.status !== 'success') {
      throw new Error(`API error: ${responseData.message || 'Unknown error'}`);
    }

    // בדיקה שהנתונים בפורמט הנכון
    const apiData = responseData.data || responseData;

    // עדכון הנתונים המקומיים - שימוש בשמות אחידים מה-API
    const localTradesData = apiData.map(trade => ({
      id: trade.id,
      account_id: trade.account_id,
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
      trade_plan_created_at: trade.trade_plan_created_at, // תאריך יצירה של התוכנית
      status: trade.status,
      investment_type: trade.investment_type,
      side: trade.side,
      created_at: trade.created_at,
      closed_at: trade.closed_at,
      cancelled_at: trade.cancelled_at,
      total_pl: trade.total_pl,
      notes: trade.notes,
    }));

    // עדכון המשתנה הגלובלי
    window.tradesData = localTradesData;
    console.log('💾 loadTradesData: Stored', localTradesData.length, 'trades in window.tradesData');

    console.log('🔄 loadTradesData: Calling updateTradesTable...');
    updateTradesTable(localTradesData);

    // עדכון סטטיסטיקות
    updateTableStats();

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'נתוני טריידים');
    } else {
      // console.error('Error loading trades data:', error);
    }

    const tbody = document.querySelector('#tradesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
    } else {
      if (typeof handleElementNotFound === 'function') {
        handleElementNotFound('#tradesTable tbody', 'CRITICAL');
      } else {
        // console.error('#tradesTable tbody element not found');
      }
    }
  }
}

/**
 * פונקציה לעדכון טבלת הטריידים
 */
/**
 * Update trades table with provided data
 *
 * This function updates the trades table display with the provided trade data.
 * It handles HTML generation, data formatting, and table state management.
 *
 * @param {Array} trades - Array of trade objects to display
 * @returns {void}
 *
 * Features:
 * - Dynamic HTML generation for trade rows
 * - Integration with translation system for type display
 * - Currency formatting and color coding for P&L values
 * - Action buttons for edit, cancel, and delete operations
 * - Automatic row count updates
 */
function updateTradesTable(trades) {
  console.log('🔍 updateTradesTable called with:', trades?.length || 0, 'trades');
  
  // בדיקה שהנתונים תקינים
  if (!trades || !Array.isArray(trades)) {
    console.error('❌ Invalid trades data:', trades);
    handleValidationError('trades data', 'נתוני טריידים לא תקינים');
    return;
  }

  // בדיקה אם אנחנו בדף הנכון
  const tradesTable = document.querySelector('#tradesTable');
  if (!tradesTable) {
    console.warn('⚠️ #tradesTable not found - not on trades page');
    return;
  }
  
  console.log('✅ Found #tradesTable, proceeding with update');

  const tbody = document.querySelector('#tradesTable tbody');
  console.log('🔍 Looking for tbody:', tbody);
  if (!tbody) {
    console.error('❌ tbody not found!');
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('#tradesTable tbody', 'CRITICAL');
    } else {
      // console.error('#tradesTable tbody element not found');
    }
    return;
  }
  console.log('✅ Found tbody, proceeding with HTML generation');

  const tableHTML = trades.map(trade => {
    const statusDisplay = trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח';
    const typeDisplay = window.translateTradeType ?
      window.translateTradeType(trade.investment_type) :
      trade.investment_type;

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = trade.investment_type || '';

    // קביעת צבע לפי סוג השקעה
    const typeColor = getInvestmentTypeColor(trade.investment_type);

    return `
    <tr>
      <td class="ticker-cell">
        <div class="d-flex align-items-center gap-2">
          <strong><a href="#" onclick="editTradeRecord('${trade.id}')" class="ticker-link">${trade.ticker_symbol || getTickerSymbol(trade.ticker_id) || 'טיקר לא ידוע'}</a></strong>
          <button class="btn btn-sm btn-outline-secondary" onclick="viewTickerDetails('${trade.ticker_id}')" title="פרטי טיקר" style="padding: 2px 6px; font-size: 12px;">
            🔗
          </button>
        </div>
      </td>
      <td class="price-cell">${trade.current_price ? `$${parseFloat(trade.current_price).toFixed(2)}` : '-'}</td>
      <td class="change-cell">${formatDailyChange(trade.daily_change)}</td>
      <td class="status-cell" data-status="${trade.status || ''}"><span class="status-badge status-${trade.status || 'open'}">${statusDisplay}</span></td>
      <td class="type-cell" data-type="${typeForFilter}">
        <span class='investment-type-badge' 
          style='background-color: ${typeColor}; color: white; padding: 2px 8px; 
            border-radius: 12px; font-size: 0.85em; font-weight: 500;'>
          ${typeDisplay || trade.investment_type || '-'}
        </span>
      </td>
      <td class="side-cell" data-side="${trade.side || 'Long'}">
        <span class="side-badge ${trade.side === 'Long' ? 'side-long' : 'side-short'}">${trade.side || 'Long'}</span>
      </td>
      <td class="plan-cell">${trade.trade_plan_id ? `<a href="#" onclick="viewTradePlanDetails('${trade.trade_plan_id}')" class="plan-link" data-plan-id="${trade.trade_plan_id}">טוען...</a>` : '-'}</td>
      <td class="pl-cell">${window.colorAmountByValue(trade.total_pl || 0, trade.total_pl ? `$${trade.total_pl.toFixed(2)}` : '$0.00')}</td>
      <td data-date="${trade.created_at}">${trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'לא מוגדר'}</td>
      <td>${trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : trade.cancelled_at ? new Date(trade.cancelled_at).toLocaleDateString('he-IL') : ''}</td>
      <td><strong><a href="#" onclick="viewAccountDetails('${trade.account_id}')" class="account-link">${trade.account_name || trade.account_id || 'חשבון לא ידוע'}</a></strong></td>
      <td>${trade.notes || ''}</td>
      <td class="actions-cell">
        <div class="d-flex gap-1 justify-content-center align-items-center" style="flex-wrap: nowrap;">
          ${createLinkButton(`viewLinkedItemsForTrade(${trade.id})`)}
          ${createEditButton(`editTradeRecord('${trade.id}')`)}
          ${createCancelButton('trade', trade.id, trade.status, 'sm')}
          ${createDeleteButton(`deleteTradeRecord('${trade.id}')`)}
        </div>
      </td>
    </tr>
  `;
  }).join('');

  tbody.innerHTML = tableHTML;

  // עדכון ספירת רשומות - רק בדף תכנון
  if (window.location.pathname === '/trade_plans' || window.location.pathname === '/trade_plans.html') {
    const countElement = document.querySelector('.section-header .table-title');
    if (countElement) {
      countElement.textContent = `📋 תכנון (${trades.length})`;
    }
  }

  // טעינת תאריכי יצירה של תוכניות
  loadTradePlanDates();

  // הוספת סולם צבעים לעמודת סוג השקעה
  addInvestmentTypeColorLegend();
}

// פונקציות נוספות

function viewTickerDetails(tickerId) {
  // צפייה בפרטי טיקר באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('ticker', tickerId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי טיקר תהיה זמינה בקרוב');
    }
  }
}

function viewAccountDetails(accountId) {
  // צפייה בפרטי חשבון באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('account', accountId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי חשבון תהיה זמינה בקרוב');
    }
  }
}

function viewTradePlanDetails(tradePlanId) {
  // צפייה בפרטי תוכנית טרייד באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('trade_plan', tradePlanId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', `פונקציונליות צפייה בתוכנית טרייד #${tradePlanId} תהיה זמינה בקרוב`);
    }
  }
}

function editTradeRecord(tradeId) {
  // עריכת טרייד
  // מציאת הטרייד במערך
  const trade = tradesData.find(t => t.id === tradeId);
  if (trade) {
    showEditTradeModal(trade);
  } else {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('trade', 'CRITICAL');
    } else {
      // console.error('trade not found');
    }
    window.showErrorNotification('שגיאה', 'טרייד לא נמצא');
  }
}

/**
 * ביטול טרייד - גרסה משופרת
 */
async function cancelTradeRecord(tradeId) {
  try {
    // קבלת פרטי הטרייד לצורך הודעת האישור
    let tradeDetails = '';
    try {
      const response = await fetch(`/api/v1/trades/${tradeId}`);
      if (response.ok) {
        const tradeData = await response.json();
        const trade = tradeData.data;
        tradeDetails = `\n\nפרטי הטרייד:\n• טיקר: ${trade.ticker_symbol || 'לא מוגדר'}\n• צד: ${trade.side || 'לא מוגדר'}\n• סטטוס: ${trade.status || 'לא מוגדר'}`;
      }
    } catch {
      // console.warn('לא ניתן לטעון פרטי טרייד:');
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול טרייד',
        `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע הביטול
          await checkLinkedItemsAndCancel(tradeId);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ביטול טרייד',
            `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'ביטול טרייד',
              `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
              () => resolve(true),
              () => resolve(false),
            );
          });
          if (!confirmed) {return;}
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          const confirmed = typeof showConfirmationDialog === 'function' ? 
            await new Promise(resolve => {
              showConfirmationDialog(
                `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
                () => resolve(true),
                () => resolve(false),
                'ביטול טרייד',
                'בטל',
                'חזור'
              );
            }) : 
            window.confirm(`האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`);
          if (!confirmed) {
            return;
          }
        }
      }
      await checkLinkedItemsAndCancel(tradeId);
    }

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'ביטול טרייד');
    } else {
      // console.error('Error canceling trade:', error);
    }
    window.showErrorNotification('שגיאה', error.message);
  }
}

/**
 * בדיקת מקושרים וביצוע ביטול
 */
async function checkLinkedItemsAndCancel(tradeId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני ביטול
    if (typeof window.checkLinkedItemsBeforeCancel === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeCancel(tradeId);
      if (hasLinkedItems) {
        return; // הפונקציה תטפל בהצגת המודול
      }
    }

    // אין מקושרים - ביצוע הביטול
    await performTradeCancellation(tradeId);

  } catch (error) {
    if (typeof handleSystemError === 'function') {
      handleSystemError(error, 'בדיקת מקושרים');
    } else {
      // console.error('Error checking linked items:', error);
    }
    window.showErrorNotification('שגיאה', error.message);
  }
}

/**
 * ביצוע הביטול בפועל
 */
async function performTradeCancellation(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - ביטול
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trades', 'cancel');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/v1/trades/${tradeId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'שגיאה בביטול הטרייד');
    }

    // שימוש במערכת הריענון המרכזית
    if (window.centralRefresh) {
      await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד בוטל בהצלחה!');
    } else {
      // Fallback למערכת הישנה
      // הצלחה
      window.showSuccessNotification('הצלחה', 'טרייד בוטל בהצלחה!');
      // רענון הטבלה
      await loadTradesData();
    }

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'ביטול טרייד');
    } else {
      // console.error('Error canceling trade:', error);
    }
    window.showErrorNotification('שגיאה', error.message);
  }
}

/**
 * מחיקת טרייד - גרסה פשוטה
 */
async function deleteTradeRecord(tradeId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני מחיקה
    if (typeof window.checkLinkedItemsBeforeDelete === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeDelete(tradeId);
      if (hasLinkedItems) {
        return; // הפונקציה תטפל בהצגת המודול
      }
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showDeleteWarning === 'function') {
      window.showDeleteWarning('trade', tradeId, 'טרייד',
        async () => {
          // המשתמש אישר - ביצוע המחיקה
          await performTradeDeletion(tradeId);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'מחיקת טרייד',
            'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.',
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'מחיקת טרייד',
              'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.',
              () => resolve(true),
              () => resolve(false),
            );
          });
          if (!confirmed) {return;}
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          if (!window.confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
            return;
          }
        }
      }
      await performTradeDeletion(tradeId);
    }

  } catch (error) {
    if (typeof handleDeleteError === 'function') {
      handleDeleteError(error, 'טרייד');
    } else {
      // console.error('Error deleting trade:', error);
    }
    window.showErrorNotification('שגיאה', error.message);
  }
}

/**
 * ביצוע המחיקה בפועל
 */
async function performTradeDeletion(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - מחיקה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trades', 'delete');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/v1/trades/${tradeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'שגיאה במחיקת הטרייד');
    }

    // שימוש במערכת הריענון המרכזית
    if (window.centralRefresh) {
      await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד נמחק בהצלחה!');
    } else {
      // Fallback למערכת הישנה
      // הצלחה
      window.showSuccessNotification('הצלחה', 'טרייד נמחק בהצלחה!');
      // רענון הטבלה
      await loadTradesData();
    }

  } catch (error) {
    if (typeof handleDeleteError === 'function') {
      handleDeleteError(error, 'טרייד');
    } else {
      // console.error('Error deleting trade:', error);
    }
    window.showErrorNotification('שגיאה', error.message);
  }
}

/**
 * פונקציות עזר למודל העריכה
 */
function addEditImportantNote() {
  if (typeof window.showNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר הערות עשירות לטרייד');
  }
}

function addEditReminder() {
  if (typeof window.showNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר התראות לטרייד');
  }
}

/**
 * פונקציה להצגת מודל עריכת טרייד
 */
async function showEditTradeModal(trade) {

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('editTradeForm');
  }

  // ניקוי סימונים
  const tradePlanSelect = document.getElementById('editTradeTradePlanId');
  if (tradePlanSelect) {
    tradePlanSelect.removeAttribute('data-restored');
    tradePlanSelect.removeAttribute('data-cleared');
  }

  // טעינת נתונים למודל עריכת טרייד
  await loadEditTradeModalData(trade);

  // טעינת נתוני העסקאות
  if (typeof window.loadTradeExecutions === 'function') {
    try {
      window.loadTradeExecutions(trade.id);
    } catch {
      if (typeof handleFunctionNotFound === 'function') {
        handleFunctionNotFound('loadTradeExecutions');
      } else {
        // console.warn('loadTradeExecutions function not found');
      }
    }
  } else {
    if (typeof handleFunctionNotFound === 'function') {
      handleFunctionNotFound('loadTradeExecutions');
    } else {
      // console.warn('loadTradeExecutions function not found');
    }
  }

  // שמירת הטרייד המקורי לבדיקות
  window.currentEditTrade = trade;

  // הגדרת ולידציה של שדות תאריך - מושבת זמנית
  // setTimeout(() => {
  //   setupDateValidation();
  // }, 100);

  // שמירת הטרייד המקורי לבדיקות
  window.currentEditTrade = trade;

  // הגדרת ולידציה של שדות תאריך - מושבת זמנית
  // setTimeout(() => {
  //   setupDateValidation();
  // }, 100);

  // Show the modal
  const modalElement = document.getElementById('editTradeModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('editTradeModal', 'CRITICAL');
    } else {
      // console.error('editTradeModal element not found');
    }
  }
}

/**
 * טעינת נתונים למודל עריכת טרייד
 */
async function loadEditTradeModalData(trade) {
  try {
    // טעינת חשבונות, תוכניות טרייד וטיקרים
    const [accountsResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/'),
      fetch('/api/v1/trade_plans/'),
      fetch('/api/v1/tickers/'),
    ]);

    if (!accountsResponse.ok || !tradePlansResponse.ok || !tickersResponse.ok) {
      throw new Error('שגיאה בטעינת נתונים');
    }

    const accounts = await accountsResponse.json();
    const tradePlans = await tradePlansResponse.json();
    const tickers = await tickersResponse.json();

    // מילוי רשימת חשבונות - רק חשבונות פתוחים
    const accountSelect = document.getElementById('editTradeAccountId');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
      const openAccounts = accounts.data.filter(account => account.status === 'open');
      openAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.currency})`;
        accountSelect.appendChild(option);
      });
    }

    // מילוי רשימת טיקרים - רק טיקרים פעילים
    const tickerSelect = document.getElementById('editTradeTickerId');
    if (tickerSelect) {
      tickerSelect.innerHTML = '<option value="">בחר טיקר</option>';
      const activeTickers = tickers.data.filter(ticker => ticker.status === 'open');
      activeTickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        option.textContent = `${ticker.symbol} - ${ticker.name || 'ללא שם'}`;
        tickerSelect.appendChild(option);
      });
    }

    // מילוי רשימת תוכניות טרייד - כולל תוכניות סגורות לעריכה
    const tradePlanSelect = document.getElementById('editTradeTradePlanId');
    if (tradePlanSelect) {
      tradePlanSelect.innerHTML = '<option value="">בחר תוכנית טרייד</option>';
      // ניקוי סימונים
      tradePlanSelect.removeAttribute('data-restored');
      tradePlanSelect.removeAttribute('data-cleared');
      // לכלול גם תוכניות סגורות לעריכה
      const allPlans = tradePlans.data;
      allPlans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        // הצגת: סימבול | צד | סוג השקעה | תאריך | סטטוס
        const createdDate = new Date(plan.created_at).toLocaleDateString('he-IL');
        const side = plan.side || 'לא מוגדר';
        const investmentType = plan.investment_type || 'לא מוגדר';
        const status = plan.status || 'לא מוגדר';

        // קבלת סימבול הטיקר - בדיקה אם יש אובייקט ticker או שדה ישיר
        let tickerSymbol = 'לא מוגדר';
        let tickerId = null;

        if (plan.ticker && plan.ticker.symbol) {
          tickerSymbol = plan.ticker.symbol;
          tickerId = plan.ticker.id;
        } else if (plan.ticker_symbol) {
          tickerSymbol = plan.ticker_symbol;
          tickerId = plan.ticker_id;
        }

        // יצירת טקסט עם הסימבול בבולד וסטטוס
        const statusText = status === 'open' ? 'פתוח' : status === 'closed' ? 'סגור' : status;
        const boldSymbol = `<strong>${tickerSymbol}</strong>`;
        option.innerHTML = `${boldSymbol} | ${side} | ${investmentType} | ${createdDate} | ${statusText}`;
        option.setAttribute('data-ticker-symbol', tickerSymbol);
        option.setAttribute('data-ticker-id', tickerId);
        tradePlanSelect.appendChild(option);
      });
    }

    // מילוי השדות עם נתוני הטרייד (אחרי טעינת הנתונים)
    if (trade) {
      const editForm = document.getElementById('editTradeForm');
      if (editForm) {
        // Set form values - using correct field IDs from HTML
        const editTradeId = document.getElementById('editTradeId');
        if (editTradeId) {editTradeId.value = trade.id;}

        const editTradeType = document.getElementById('editTradeType');
        if (editTradeType) {editTradeType.value = trade.investment_type || '';}

        const editTradeSide = document.getElementById('editTradeSide');
        if (editTradeSide) {editTradeSide.value = trade.side || '';}

        const editTradeAccountId = document.getElementById('editTradeAccountId');
        if (editTradeAccountId) {
          editTradeAccountId.value = trade.account_id || '';
        }

        const editTradeNotes = document.getElementById('editTradeNotes');
        if (editTradeNotes) {editTradeNotes.value = trade.notes || '';}

        // Set ticker display and ID - הטרייד מקבל את הטיקר של התוכנית שלו
        const tickerDisplay = document.getElementById('editTradeTickerDisplay');
        const tickerIdInput = document.getElementById('editTradeTickerId');

        // אם יש תוכנית, הטרייד מקבל את הטיקר של התוכנית
        let displayTickerSymbol = 'לא מוגדר';
        let displayTickerId = '';

        if (trade.trade_plan_id) {
          // חיפוש הטיקר של התוכנית
          const editTradePlanSelectForTicker = document.getElementById('editTradeTradePlanId');
          if (editTradePlanSelectForTicker) {
            const selectedOption = editTradePlanSelectForTicker.querySelector(`option[value="${trade.trade_plan_id}"]`);
            if (selectedOption) {
              const planTickerId = selectedOption.getAttribute('data-ticker-id');
              const planTickerSymbol = selectedOption.getAttribute('data-ticker-symbol');
              if (planTickerId && planTickerSymbol) {
                displayTickerId = planTickerId;
                displayTickerSymbol = planTickerSymbol;
              }
            }
          }
        }

        if (tickerDisplay) {
          tickerDisplay.textContent = displayTickerSymbol;
        }
        if (tickerIdInput) {
          tickerIdInput.value = displayTickerId;

          // טעינת מחיר נוכחי ושינוי יומי לטיקר
          if (displayTickerId) {
            updateEditTradePriceFromTicker(displayTickerId);
          }
        }

        // Set trade plan ID - חשוב מאוד!
        const editTradePlanSelect = document.getElementById('editTradeTradePlanId');
        if (editTradePlanSelect) {
          if (trade.trade_plan_id) {
            const selectedOption = editTradePlanSelect.querySelector(`option[value="${trade.trade_plan_id}"]`);
            if (selectedOption) {
              // התוכנית נמצאת ברשימה - הכל תקין
              editTradePlanSelect.value = trade.trade_plan_id;
            } else {
              // התוכנית לא נמצאת ברשימה (כנראה סגורה או מבוטלת)
              // console.warn('⚠️ Trade plan not found in list - clearing plan link');
              editTradePlanSelect.setAttribute('data-cleared', 'true');
              editTradePlanSelect.value = '';

              // הצגת הודעת אזהרה למשתמש
              window.showErrorNotification(
                'נתונים לא תקינים',
                'התוכנית המקושרת לטרייד לא נמצאת ברשימה. הקישור לתוכנית הוסר.',
              );
            }
          } else {
            editTradePlanSelect.value = '';
          }
        }

        // Set dates if they exist - שימוש ב-created_at במקום opened_at
        if (trade.created_at) {
          const createdDate = new Date(trade.created_at);
          const dateStr = createdDate.toISOString().slice(0, 16);
          const openedAtInput = document.getElementById('editTradeOpenedAt');
          if (openedAtInput) {
            openedAtInput.value = dateStr;
          }
        }

        if (trade.closed_at) {
          const closedDate = new Date(trade.closed_at);
          const dateStr = closedDate.toISOString().slice(0, 16);
          const closedAtInput = document.getElementById('editTradeClosedAt');
          if (closedAtInput) {
            closedAtInput.value = dateStr;
          }
        }

        // Set status
        const statusSelect = document.getElementById('editTradeStatus');
        if (statusSelect) {
          statusSelect.value = trade.status || 'open';
        }

        // בדיקה נוספת - אם השדות לא התמלאו, ננסה שוב אחרי זמן קצר
        setTimeout(() => {
          const accountValue = document.getElementById('editTradeAccountId')?.value;
          const tradePlanValue = document.getElementById('editTradeTradePlanId')?.value;

          // אם השדות עדיין ריקים, ננסה למלא שוב
          if (!accountValue && trade.account_id) {
            const editAccountSelect = document.getElementById('editTradeAccountId');
            if (editAccountSelect) {
              editAccountSelect.value = trade.account_id;
            }
          }

          if (!tradePlanValue && trade.trade_plan_id) {
            const editTradePlanSelectInner = document.getElementById('editTradeTradePlanId');
            if (editTradePlanSelectInner) {
              editTradePlanSelectInner.value = trade.trade_plan_id;
            }
          }
        }, 100);

      }
    }

    // הוספת event listeners למודל העריכה
    const editTradePlanSelect = document.getElementById('editTradeTradePlanId');
    if (editTradePlanSelect) {
      editTradePlanSelect.addEventListener('change', function() {
        updateEditTradeTickerFromPlan(this.value);
      });
    }

    const editTradeTickerSelect = document.getElementById('editTradeTickerId');
    if (editTradeTickerSelect) {
      editTradeTickerSelect.addEventListener('change', function() {
        updateEditTradePriceFromTicker(this.value);
      });
    }

    // הוספת event listener לשדה הסטטוס
    const editTradeStatusSelect = document.getElementById('editTradeStatus');
    if (editTradeStatusSelect) {
      editTradeStatusSelect.addEventListener('change', function() {
        const closedAtInput = document.getElementById('editTradeClosedAt');
        if (this.value === 'closed' && closedAtInput && !closedAtInput.value) {
          // אם הסטטוס 'closed' ואין תאריך סגירה, נשים תאריך נוכחי
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const dd = String(now.getDate()).padStart(2, '0');
          const hh = String(now.getHours()).padStart(2, '0');
          const min = String(now.getMinutes()).padStart(2, '0');
          closedAtInput.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        }
      });
    }

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'נתונים למודל עריכת טרייד');
    } else {
      // console.error('Error loading edit modal data:', error);
    }
    if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתונים', 'שגיאה בטעינת נתונים למודל העריכה');
    }
  }
}

/**
 * שמירת עריכת טרייד - גרסה פשוטה
 */
async function saveEditTradeData() {
  try {
    // ניקוי מטמון לפני פעולת CRUD - עריכה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trades', 'edit');
    }
    
    // איסוף נתונים מהטופס
    const formData = {
      id: document.getElementById('editTradeId').value,
      investment_type: document.getElementById('editTradeType').value,
      side: document.getElementById('editTradeSide').value,
      account_id: document.getElementById('editTradeAccountId').value,
      trade_plan_id: document.getElementById('editTradeTradePlanId').value || null,
      notes: document.getElementById('editTradeNotes').value,
      opened_at: document.getElementById('editTradeOpenedAt').value,
      status: document.getElementById('editTradeStatus').value,
      ticker_id: document.getElementById('editTradeTickerId').value,
      ticker_symbol: document.getElementById('editTradeTickerDisplay').textContent,
    };

    // עדכון הטיקר לפי התוכנית הנבחרת
    if (formData.trade_plan_id) {
      const tradePlanSelect = document.getElementById('editTradeTradePlanId');
      const selectedOption = tradePlanSelect.options[tradePlanSelect.selectedIndex];

      if (selectedOption) {
        const planTickerId = selectedOption.getAttribute('data-ticker-id');
        const planTickerSymbol = selectedOption.getAttribute('data-ticker-symbol');

        if (planTickerId && planTickerSymbol) {
          formData.ticker_id = planTickerId;
          formData.ticker_symbol = planTickerSymbol;
        }
      }
    }

    // בדיקת שינוי תוכנית עם טיקר שונה - רק אם השדה באמת השתנה
    const originalTrade = window.currentEditTrade;
    const newTradePlanId = formData.trade_plan_id;
    const originalTradePlanId = originalTrade?.trade_plan_id;
    const tradePlanSelect = document.getElementById('editTradeTradePlanId');

    // בדיקה אם השדה הוחזר למצב מקורי
    const isRestored = tradePlanSelect?.getAttribute('data-restored') === 'true';

    // בדיקה אם יש שינוי אמיתי בתוכנית (לא רק החזרה למצב מקורי)
    if (newTradePlanId && newTradePlanId !== originalTradePlanId && !isRestored) {
      const selectedOption = tradePlanSelect.options[tradePlanSelect.selectedIndex];

      if (selectedOption) {
        const newTickerId = selectedOption.getAttribute('data-ticker-id');
        const currentTickerId = originalTrade?.ticker_id;

        // בדיקה אם יש טיקר נוכחי והטיקר של התוכנית החדשה שונה
        if (currentTickerId && newTickerId && newTickerId !== currentTickerId.toString()) {
          // שינוי תוכנית עם טיקר שונה - לא נתמך
          window.showErrorNotification(
            'פיצר לא נתמך',
            'שינוי תוכנית טרייד לטיקר שונה עדיין לא נתמך במערכת. אנא בחר תוכנית עם אותו טיקר או הסר את הקישור לתוכנית.',
          );

          // החזרת שדה התוכנית למצבו המקורי
          if (originalTradePlanId) {
            tradePlanSelect.value = originalTradePlanId;
          } else {
            tradePlanSelect.value = '';
          }

          // עדכון formData עם הערך המקורי
          formData.trade_plan_id = originalTradePlanId || null;

          return; // עצירת התהליך
        }
      }
    }

    // ניקוי סימון החזרה למצב מקורי
    if (tradePlanSelect) {
      tradePlanSelect.removeAttribute('data-restored');
    }

    // ניקוי הסימון אם השדה לא הוחזר
    if (tradePlanSelect) {
      tradePlanSelect.removeAttribute('data-restored');
    }

    // טיפול בתאריך סגירה
    const closedAtInput = document.getElementById('editTradeClosedAt');
    if (closedAtInput && closedAtInput.value) {
      formData.closed_at = closedAtInput.value;
    } else if (formData.status === 'closed') {
      // אם הסטטוס 'closed' ואין תאריך, נשים תאריך נוכחי
      const now = new Date();
      formData.closed_at = now.toISOString().slice(0, 16);
    }

    // שליחה לשרת
    const response = await fetch(`/api/v1/trades/${formData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'שגיאה בעדכון הטרייד');
    }

    // שימוש במערכת הריענון המרכזית
    if (window.centralRefresh) {
      await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד עודכן בהצלחה!');
    } else {
      // Fallback למערכת הישנה
      // הצלחה
      window.showSuccessNotification('הצלחה', 'טרייד עודכן בהצלחה!');
      // רענון הטבלה
      await loadTradesData();
    }

    // סגירת המודל
    bootstrap.Modal.getInstance(document.getElementById('editTradeModal')).hide();

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'עדכון טרייד');
    } else {
      // console.error('Error updating trade:', error);
    }
    window.showErrorNotification('שגיאה', error.message);
  }
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
  // טעינת נתונים למודל
  loadModalData();

  // ניקוי הטופס
  const form = document.getElementById('addTradeForm');
  if (form) {
    form.reset();
  }

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('addTradeForm');
  }

  // ניטרול כל השדות חוץ מתוכנית טרייד
  disableTradeFormFields();

  // הגדרת תאריך נוכחי
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  const dateInput = document.getElementById('addTradeOpenedAt');
  if (dateInput) {dateInput.value = todayStr;}

  // הצגת המודל
  const modalElement = document.getElementById('addTradeModal');
  if (modalElement) {
    if (typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      if (typeof handleSystemError === 'function') {
        handleSystemError(new Error('Bootstrap is not loaded'), 'מערכת מודלים');
      } else {
        // console.error('Bootstrap is not loaded');
      }
      // נסיון חלופי להצגת המודל
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      document.body.classList.add('modal-open');
    }
  } else {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('addTradeModal', 'CRITICAL');
    } else {
      // console.error('addTradeModal element not found');
    }
  }
}

/**
 * ניטרול שדות הטופס (חוץ מתוכנית טרייד)
 */
function disableTradeFormFields() {
  const fieldsToDisable = [
    'addTradeType',
    'addTradeSide',
    'addTradeAccountId',
    'addTradeOpenedAt',
    'addTradeNotes',
  ];

  fieldsToDisable.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = true;
    }
  });

  // ניקוי שדות הטיקר
  const tickerDisplay = document.getElementById('addTradeTickerDisplay');
  const tickerId = document.getElementById('addTradeTickerId');
  if (tickerDisplay) {tickerDisplay.textContent = 'לא נבחר';}
  if (tickerId) {tickerId.value = '';}
}

/**
 * הפעלת שדות הטופס אחרי בחירת תוכנית
 */
function enableTradeFormFields() {
  const fieldsToEnable = [
    'addTradeType',
    'addTradeSide',
    'addTradeAccountId',
    'addTradeOpenedAt',
    'addTradeNotes',
  ];

  fieldsToEnable.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = false;
    }
  });
}

/**
 * ולידציה של טופס הוספת טרייד לפי אילוצי בסיס הנתונים
 *
 * משתמשת בפונקציות הכלליות מ-validation-utils.js
 *
 * @returns {boolean} true אם הטופס תקין, false אם לא
 */
function validateTradeForm() {
  // הגדרת כללי הוולידציה לפי אילוצי בסיס הנתונים
  const validationRules = {
    'addTradeAccountId': { required: true, type: 'select' },
    'addTradeTickerId': { required: true, type: 'select' },
    'addTradeTradePlanId': { required: true, type: 'select' },
    'addTradeStatus': {
      required: false,
      type: 'select',
      enum: ['open', 'closed', 'cancelled'],
    },
    'addTradeType': {
      required: false,
      type: 'select',
      enum: ['swing', 'investment', 'passive'],
    },
    'addTradeSide': {
      required: false,
      type: 'select',
      enum: ['Long', 'Short'],
    },
    'addTradeOpenedAt': {
      required: false,
      type: 'datetime-local',
      conditionalRequired: {
        field: 'addTradeStatus',
        value: 'open',
        message: 'תאריך פתיחה הוא חובה עבור טריידים פתוחים',
      },
    },
    'addTradeClosedAt': {
      required: false,
      type: 'datetime-local',
      conditionalRequired: {
        field: 'addTradeStatus',
        value: 'closed',
        message: 'תאריך סגירה הוא חובה עבור טריידים סגורים',
      },
      customValidation(value, formData) {
        const openedAt = formData['addTradeOpenedAt'];
        if (value && openedAt) {
          const openedDate = new Date(openedAt);
          const closedDate = new Date(value);
          if (closedDate <= openedDate) {
            return { isValid: false, message: 'תאריך סגירה חייב להיות אחרי תאריך פתיחה' };
          }
        }
        return { isValid: true };
      },
    },
  };

  // שימוש בפונקציה הכללית לוולידציה
  if (typeof window.validateForm === 'function') {
    return window.validateForm('addTradeForm', validationRules);
  } else {
    // console.warn('⚠️ validateForm function not found - validation-utils.js not loaded, skipping validation');
    return { isValid: true, errors: {}, errorMessages: [] };
  }
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
  // ניקוי מטמון לפני פעולת CRUD - הוספה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('trades', 'add');
  }
  
  // שמירת טרייד חדש...

  // בדיקת אלמנטים לפני שמירה

  // בדיקת ולידציה
  if (!validateTradeForm()) {
    return;
  }

  // איסוף נתונים מהטופס
  const accountElement = document.getElementById('addTradeAccountId');
  const tickerElement = document.getElementById('addTradeTickerId');
  const tradePlanElement = document.getElementById('addTradeTradePlanId');
  const typeElement = document.getElementById('addTradeType');
  const sideElement = document.getElementById('addTradeSide');
  const openedAtElement = document.getElementById('addTradeOpenedAt');
  const closedAtElement = document.getElementById('addTradeClosedAt');
  const notesElement = document.getElementById('addTradeNotes');

  // בדיקה שכל האלמנטים קיימים
  if (!accountElement || !tickerElement || !tradePlanElement || !typeElement || !sideElement || !openedAtElement) {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('form elements', 'CRITICAL');
    } else {
      // console.error('form elements not found');
    }

    // בדיקה אם המודל פתוח
    window.showErrorNotification('שגיאה בטופס', 'חלק מהשדות בטופס לא נמצאו. אנא סגור ופתח מחדש את המודל.');
    return;
  }

  const formData = {
    account_id: parseInt(accountElement.value),
    ticker_id: parseInt(tickerElement.value), // NOT NULL - לא יכול להיות null
    trade_plan_id: parseInt(tradePlanElement.value), // NOT NULL - לא יכול להיות null
    investment_type: typeElement.value, // תיקון שם השדה
    side: sideElement.value,
    status: 'open',
    created_at: openedAtElement.value, // NOT NULL - לא יכול להיות null
    closed_at: closedAtElement ? closedAtElement.value || null : null,
    notes: notesElement ? notesElement.value || null : null,
  };

  try {
    const response = await fetch('/api/v1/trades/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await response.json(); // newTrade not used
      
      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד נשמר בהצלחה!');
      } else {
        // Fallback למערכת הישנה
        window.showSuccessNotification('הצלחה', 'טרייד נשמר בהצלחה!');
        // רענון הטבלה
        loadTradesData();
      }

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addTradeModal'));
      modal.hide();

    } else {
      const errorData = await response.json();
      if (typeof handleSaveError === 'function') {
        handleSaveError(new Error(`Status: ${response.status} - ${errorData.error?.message || errorData.message || 'שגיאה לא ידועה'}`), 'שמירת טרייד');
      } else {
        // console.error('Error saving trade:', errorData);
      }

      window.showErrorNotification('שגיאה', `שגיאה בשמירת טרייד: ${errorData.error?.message || errorData.message || 'שגיאה לא ידועה'}`);
    }

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'שמירת טרייד');
    } else {
      // console.error('Error saving trade:', error);
    }
    window.showErrorNotification('שגיאה', 'שגיאה בתקשורת עם השרת');
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

    // טעינת חשבונות
    const accountsResponse = await fetch('/api/v1/accounts/');
    const accounts = await accountsResponse.json();

    // טעינת תוכניות טרייד
    const tradePlansResponse = await fetch('/api/v1/trade_plans/');
    const tradePlans = await tradePlansResponse.json();

    // מילוי רשימת חשבונות - רק חשבונות פתוחים
    const accountSelect = document.getElementById('addTradeAccountId');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
      const openAccounts = accounts.data.filter(account => account.status === 'open');
      openAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.currency})`;
        accountSelect.appendChild(option);
      });
    }

    // מילוי רשימת תוכניות טרייד - הצג רק תוכניות פתוחות כברירת מחדל
    const tradePlanSelect = document.getElementById('addTradeTradePlanId');
    if (tradePlanSelect) {
      tradePlanSelect.innerHTML = '<option value="">בחר תוכנית טרייד</option>';

      // בדיקה אם הפילטר "הצג תכנונים סגורים" פעיל
      const showClosedCheckbox = document.getElementById('addTradeShowClosedTrades');
      const showClosed = showClosedCheckbox ? showClosedCheckbox.checked : false;

      // סינון התוכניות לפי הפילטר
      let filteredPlans = tradePlans.data;
      if (!showClosed) {
        // הצג רק תוכניות פתוחות
        filteredPlans = tradePlans.data.filter(plan => plan.status === 'open');
      }

      filteredPlans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        // הצגת: סימבול | צד | סוג השקעה | תאריך
        const createdDate = new Date(plan.created_at).toLocaleDateString('he-IL');
        const side = plan.side || 'לא מוגדר';
        const investmentType = plan.investment_type || 'לא מוגדר';

        // קבלת סימבול הטיקר - בדיקה אם יש אובייקט ticker או שדה ישיר
        let tickerSymbol = 'לא מוגדר';
        let tickerId = null;

        if (plan.ticker && plan.ticker.symbol) {
          tickerSymbol = plan.ticker.symbol;
          tickerId = plan.ticker.id;
        } else if (plan.ticker_symbol) {
          tickerSymbol = plan.ticker_symbol;
          tickerId = plan.ticker_id;
        }

        // יצירת טקסט עם הסימבול בבולד ואינדיקציה לסטטוס
        const boldSymbol = `<strong>${tickerSymbol}</strong>`;
        const statusIndicator = plan.status === 'open' ? '🟢' : '🔴';
        const statusText = plan.status === 'open' ? 'פתוח' : 'סגור';
        const part1 = `${statusIndicator} ${boldSymbol} | ${side} | ${investmentType}`;
        const part2 = ` | ${createdDate} (${statusText})`;
        const optionText = part1 + part2;
        option.innerHTML = optionText;
        option.setAttribute('data-ticker-symbol', tickerSymbol);
        option.setAttribute('data-ticker-id', tickerId);
        option.setAttribute('data-plan-status', plan.status);
        tradePlanSelect.appendChild(option);
      });
    }

    // בדיקת אלמנטים אחרי מילוי

    // הוספת אירוע לשינוי תוכנית טרייד
    const tradePlanSelectElement = document.getElementById('addTradeTradePlanId');
    if (tradePlanSelectElement) {
      tradePlanSelectElement.addEventListener('change', function () {
        updateTickerFromTradePlan(this.value);

        // הפעלת השדות אם נבחרה תוכנית
        if (this.value) {
          enableTradeFormFields();
        } else {
          disableTradeFormFields();
        }
      });
    }

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'נתונים למודל');
    } else {
      // console.error('Error loading modal data:', error);
    }
  }
}

/**
 * עדכון טיקר ומחיר לפי תוכנית טרייד נבחרת
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 */
async function updateTickerFromTradePlan(tradePlanId) {
  if (!tradePlanId) {
    // ניקוי שדות אם לא נבחרה תוכנית
    document.getElementById('addTradeTickerDisplay').textContent = 'לא נבחר';
    document.getElementById('addTradeTickerId').value = '';
    document.getElementById('addTradeCurrentPrice').textContent = '-';
    document.getElementById('addTradeDailyChange').textContent = '-';

    // ניטרול השדות
    disableTradeFormFields();
    return;
  }

  try {
    // קבלת פרטי התוכנית
    const tradePlanSelect = document.getElementById('addTradeTradePlanId');
    const selectedOption = tradePlanSelect.options[tradePlanSelect.selectedIndex];

    if (selectedOption) {
      const tickerSymbol = selectedOption.getAttribute('data-ticker-symbol');
      const tickerId = selectedOption.getAttribute('data-ticker-id');
      const planStatus = selectedOption.getAttribute('data-plan-status');

      // עדכון שדות הטיקר
      document.getElementById('addTradeTickerDisplay').textContent = tickerSymbol;
      document.getElementById('addTradeTickerId').value = tickerId;

      // הוספת אינדיקציה לסטטוס התוכנית
      const tickerDisplayElement = document.getElementById('addTradeTickerDisplay');
      if (tickerDisplayElement) {
        const statusIndicator = planStatus === 'open' ? '🟢' : '🔴';
        tickerDisplayElement.textContent = `${statusIndicator} ${tickerSymbol}`;
      }

      // טעינת מחיר נוכחי ושינוי יומי מהשרת
      if (tickerId) {
        // טוען מחיר לטיקר ID
        try {
          const tickerResponse = await fetch(`/api/v1/tickers/${tickerId}`);
          // תגובת API
          if (tickerResponse.ok) {
            const tickerData = await tickerResponse.json();
            const ticker = tickerData.data;
            // נתוני טיקר

            // עדכון מחיר נוכחי
            const currentPriceElement = document.getElementById('addTradeCurrentPrice');
            if (currentPriceElement && ticker.current_price) {
              currentPriceElement.textContent = `$${parseFloat(ticker.current_price).toFixed(2)}`;
            }

            // עדכון שינוי יומי
            const dailyChangeElement = document.getElementById('addTradeDailyChange');
            if (dailyChangeElement && ticker.daily_change !== undefined) {
              const dailyChange = parseFloat(ticker.daily_change);
              const dailyChangeValue = dailyChange >= 0 ? `+${dailyChange.toFixed(2)}%` : `${dailyChange.toFixed(2)}%`;
              dailyChangeElement.textContent = dailyChangeValue;

              // צביעה לפי ערך באמצעות המערכת הגלובלית
              const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', negative: '#dc3545' };
              if (dailyChange >= 0) {
                dailyChangeElement.style.color = colors.positive;
                dailyChangeElement.style.fontWeight = 'bold';
              } else {
                dailyChangeElement.style.color = colors.negative;
                dailyChangeElement.style.fontWeight = 'bold';
              }
            }
          } else {
            // ערכי ברירת מחדל אם לא ניתן לטעון מהשרת
            document.getElementById('addTradeCurrentPrice').textContent = 'לא זמין';
            document.getElementById('addTradeDailyChange').textContent = 'לא זמין';
          }
        } catch (error) {
          if (typeof handleDataLoadError === 'function') {
            handleDataLoadError(error, 'נתוני טיקר');
          } else {
            // console.error('Error loading ticker data:', error);
          }
          // ערכי ברירת מחדל
          document.getElementById('addTradeCurrentPrice').textContent = 'לא זמין';
          document.getElementById('addTradeDailyChange').textContent = 'לא זמין';
        }
      } else {
        // אם אין טיקר, ניקוי השדות
        document.getElementById('addTradeCurrentPrice').textContent = '-';
        document.getElementById('addTradeDailyChange').textContent = '-';
      }
    }

    // הפעלת השדות אחרי טעינת נתוני הטיקר
    enableTradeFormFields();
  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון טיקר');
    } else {
      // console.error('Error updating ticker:', error);
    }
  }
}

/**
 * עדכון רשימת טיקרים לפי פילטר "הצג טריידים סגורים"
 * פונקציה זו מתעדכנת כשהמשתמש מסמן/מבטל את הפילטר
 * @param {boolean} showClosed - האם להציג טריידים סגורים
 */
function updateTickersListForClosedTrades(showClosed) {
  // עדכון רשימת התוכניות במודל הוספת טרייד
  if (showClosed) {
    // טעינה מחדש של נתוני המודל כדי לכלול תוכניות סגורות
    loadModalData();
  } else {
    // טעינה מחדש של נתוני המודל
    loadModalData();
  }
}

/**
 * פונקציה גלובלית לעדכון רשימת טיקרים לפי פילטר
 * פונקציה זו נקראת ממערכת הפילטרים הגלובלית
 * @param {boolean} showClosed - האם להציג טריידים סגורים
 */
window.updateTickersForClosedTradesFilter = function (showClosed) {
  updateTickersListForClosedTrades(showClosed);
};

/**
 * פונקציה לעדכון רשימת טיקרים לפי פילטר "הצג טריידים סגורים"
 * פונקציה זו נקראת כשהמשתמש מסמן/מבטל את הפילטר
 * @param {Event} event - אירוע השינוי
 */
function onShowClosedTradesChange(_event) {
  // const showClosed = _event.target.checked; // Not used
  // טעינה מחדש של נתוני המודל כדי לעדכן את רשימת התוכניות
  loadModalData();
}

// ייצוא הפונקציה לגלובל
window.onShowClosedTradesChange = onShowClosedTradesChange;

/**
 * הוספת הערה חשובה
 */
function addImportantNote() {
  // הצגת הודעה למשתמש
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית');
  }
}

/**
 * הוספת תזכורת
 */
function addReminder() {
  // הצגת הודעה למשתמש
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification('אזהרה', 'המודול יאפשר בקרוב לייצר התראות לתוכנית');
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף המעקב
window.updateGridFromComponent = function (_selectedStatuses, _selectedTypes, _selectedDateRange, _searchTerm) {
  // שמירת הפילטרים

  // טעינת נתונים מחדש עם הפילטרים החדשים
  if (typeof window.loadTradesData === 'function') {
    window.loadTradesData();
  } else {
    if (typeof handleFunctionNotFound === 'function') {
      handleFunctionNotFound('loadTradesData');
    } else {
      // console.warn('loadTradesData function not found');
    }
  }
};

/**
 * בדיקת פוזיציה בעדכון סטטוס
 */
function validateTradeStatusChange(newStatus, tradeData) {
  if (newStatus === 'closed') {
    // בדיקה אם יש פוזיציה פתוחה
    const currentPosition = getCurrentPosition(tradeData.id);

    if (currentPosition && currentPosition.quantity > 0) {
      // הודעת אזהרה ראשונה
      let firstWarning = false;
      if (window.showWarningNotification) {
        window.showWarningNotification(
          'אזהרה: פוזיציה פתוחה',
          'במערכת מופיע שיש פוזיציה פתוחה.\n' +
          'האם אתה בטוח שברצונך לסגור את הטרייד?\n\n' +
          'פוזיציה נוכחית: ' + currentPosition.quantity + ' מניות',
        );
        firstWarning = true; // נניח שהמשתמש אישר
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'אזהרה ראשונה',
            'האם אתה בטוח שברצונך לשנות את הסטטוס של הטרייד?',
            () => { firstWarning = true; },
            () => { firstWarning = false; },
          );
        } else {
          if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
              'אזהרה: פוזיציה פתוחה',
              '⚠️ אזהרה: במערכת מופיע שיש פוזיציה פתוחה.\n' +
            'האם אתה בטוח שברצונך לסגור את הטרייד?\n\n' +
            'פוזיציה נוכחית: ' + currentPosition.quantity + ' מניות',
              () => { firstWarning = true; },
              () => { firstWarning = false; },
            );
          } else {
            // Fallback למקרה שמערכת התראות לא זמינה
            firstWarning = window.confirm(
              '⚠️ אזהרה: במערכת מופיע שיש פוזיציה פתוחה.\n' +
                    'האם אתה בטוח שברצונך לסגור את הטרייד?\n\n' +
                    'פוזיציה נוכחית: ' + currentPosition.quantity + ' מניות',
            );
          }
        }
      }

      if (firstWarning) {
        // הודעת אזהרה שנייה
        let secondWarning = false;
        if (window.showWarningNotification) {
          window.showWarningNotification(
            'אזהרה: ממשק בפיתוח',
            'ממשק הסגירה המלא כולל סגירת פוזיציה נמצא בפיתוח.\n\n' +
            'כרגע ניתן לסגור את הטרייד אך יש לזכור לעדכן עסקה לסגירת פוזיציה.\n\n' +
            'האם אתה בטוח שברצונך להמשיך?',
          );
          secondWarning = true; // נניח שהמשתמש אישר
        } else {
          if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
              'אזהרה שנייה',
              '🔒 ממשק הסגירה המלא כולל סגירת פוזיציה נמצא בפיתוח.\n\n' +
          'כרגע ניתן לסגור את הטרייד אך יש לזכור לעדכן עסקה לסגירת פוזיציה.\n\n' +
          'האם אתה בטוח שברצונך להמשיך?',
              () => { secondWarning = true; },
              () => { secondWarning = false; },
            );
          } else {
            if (typeof window.showConfirmationDialog === 'function') {
              window.showConfirmationDialog(
                'אזהרה: ממשק בפיתוח',
                '🔒 ממשק הסגירה המלא כולל סגירת פוזיציה נמצא בפיתוח.\n\n' +
                'כרגע ניתן לסגור את הטרייד אך יש לזכור לעדכן עסקה לסגירת פוזיציה.\n\n' +
                'האם אתה בטוח שברצונך להמשיך?',
                () => { secondWarning = true; },
                () => { secondWarning = false; },
              );
            } else {
              // Fallback למקרה שמערכת התראות לא זמינה
              secondWarning = window.confirm(
                '🔒 ממשק הסגירה המלא כולל סגירת פוזיציה נמצא בפיתוח.\n\n' +
                          'כרגע ניתן לסגור את הטרייד אך יש לזכור לעדכן עסקה לסגירת פוזיציה.\n\n' +
                          'האם אתה בטוח שברצונך להמשיך?',
              );
            }
          }
        }

        if (!secondWarning) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * קבלת פוזיציה נוכחית לטרייד
 */
function getCurrentPosition(_tradeId) {
  // כאן תהיה קריאה לשרת לקבלת הפוזיציה הנוכחית
  // כרגע נחזיר נתוני דוגמה
  return {
    quantity: 100,
    averagePrice: 45.25,
    side: 'Long',
  };
}

// ========================================
// אתחול וולידציה
// ========================================

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  // שחזור מצב הסגירה
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  }

  // יישום צבעי ישות על כותרות
  if (window.applyEntityColorsToHeaders) {
    window.applyEntityColorsToHeaders('trade');
  }

  // אתחול וולידציה עם כללים מותאמים לטריידים
  if (window.initializeValidation) {
    // כללי וולידציה מותאמים לטופס הוספת טרייד
    const addTradeValidationRules = {
      ticker_id: {
        required: true,
        message: 'יש לבחור טיקר',
      },
      account_id: {
        required: true,
        message: 'יש לבחור חשבון',
      },
      investment_type: {
        required: true,
        enum: ['swing', 'investment', 'passive'],
        message: 'יש לבחור סוג השקעה תקין',
      },
      side: {
        required: true,
        enum: ['Long', 'Short'],
        message: 'יש לבחור צד תקין',
      },
    };

    // כללי וולידציה מותאמים לטופס עריכת טרייד
    const editTradeValidationRules = {
      ticker_id: {
        required: true,
        message: 'יש לבחור טיקר',
      },
      account_id: {
        required: true,
        message: 'יש לבחור חשבון',
      },
      investment_type: {
        required: true,
        enum: ['swing', 'investment', 'passive'],
        message: 'יש לבחור סוג השקעה תקין',
      },
      side: {
        required: true,
        enum: ['Long', 'Short'],
        message: 'יש לבחור צד תקין',
      },
    };

    window.initializeValidation('addTradeForm', addTradeValidationRules);
    window.initializeValidation('editTradeForm', editTradeValidationRules);
  }

  // שמירת סטטוס סקשנים
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  }

  // שחזור מצב הסקשנים הספציפי לדף הטריידים
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    if (typeof handleFunctionNotFound === 'function') {
      handleFunctionNotFound('restoreAllSectionStates');
    } else {
      // console.warn('restoreAllSectionStates function not found');
    }
  }

  // טעינת נתוני טריידים
  loadTradesData();

});

// ========================================
// ייצוא פונקציות לגלובל
// ========================================
//
// פונקציות יסוד:
window.loadTradesData = loadTradesData;                    // טעינת נתוני טריידים
window.updateTradesTable = updateTradesTable;              // עדכון טבלת טריידים

// פונקציות פעולות:
window.viewTickerDetails = viewTickerDetails;              // צפייה בפרטי טיקר
window.viewAccountDetails = viewAccountDetails;              // צפייה בפרטי חשבון
window.viewTradePlanDetails = viewTradePlanDetails;        // צפייה בפרטי תוכנית טרייד
window.editTradeRecord = editTradeRecord;                  // עריכת טרייד
window.cancelTradeRecord = cancelTradeRecord;              // ביטול טרייד
window.reactivateTrade = reactivateTrade;                  // הפעלה מחדש של טרייד
window.deleteTradeRecord = deleteTradeRecord;              // מחיקת טרייד

/**
 * בדיקת פריטים מקושרים לפני מחיקה
 */
async function checkLinkedItemsBeforeDelete(tradeId) {
  try {
    const response = await fetch(`/api/v1/linked-items/trade/${tradeId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם המחיקה
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    // const parentEntities = linkedItemsData.parent_entities || []; // Not used

    // בדיקה רק אם יש פריטים שמקושרים אל הטרייד (child entities)
    // parent entities הם פריטים שהטרייד מקושר אליהם (חשבון, טיקר, תוכנית) - לא רלוונטי למחיקה
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        window.showLinkedItemsModal(linkedItemsData, 'trade', tradeId);
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('אזהרה', 'יש פריטים מקושרים לטרייד זה', 'warning');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    if (typeof handleSystemError === 'function') {
      handleSystemError(error, 'בדיקת פריטים מקושרים');
    } else {
      // console.error('Error checking linked items:', error);
    }
    return false;
  }
}

/**
 * בדיקת פריטים מקושרים לפני ביטול
 */
async function checkLinkedItemsBeforeCancel(tradeId) {
  try {
    const response = await fetch(`/api/v1/linked-items/trade/${tradeId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם הביטול
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    // const parentEntities = linkedItemsData.parent_entities || []; // Not used

    // בדיקה רק אם יש פריטים שמקושרים אל הטרייד (child entities)
    // parent entities הם פריטים שהטרייד מקושר אליהם (חשבון, טיקר, תוכנית) - לא רלוונטי לביטול
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        window.showLinkedItemsModal(linkedItemsData, 'trade', tradeId);
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('אזהרה', 'יש פריטים מקושרים לטרייד זה', 'warning');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    if (typeof handleSystemError === 'function') {
      handleSystemError(error, 'בדיקת פריטים מקושרים');
    } else {
      // console.error('Error checking linked items:', error);
    }
    return false;
  }
}

window.checkLinkedItemsBeforeDelete = checkLinkedItemsBeforeDelete;  // בדיקת אובייקטים מקושרים למחיקה
window.checkLinkedItemsBeforeCancel = checkLinkedItemsBeforeCancel;  // בדיקת אובייקטים מקושרים לביטול
window.checkLinkedItemsAndCancel = checkLinkedItemsAndCancel;  // בדיקת מקושרים וביצוע ביטול
window.performTradeCancellation = performTradeCancellation;  // ביצוע ביטול

// פונקציות מודלים:
window.showAddTradeModal = showAddTradeModal;              // הצגת מודל הוספה
window.showEditTradeModal = showEditTradeModal;            // הצגת מודל עריכה
window.disableTradeFormFields = disableTradeFormFields;    // ניטרול שדות טופס
window.enableTradeFormFields = enableTradeFormFields;      // הפעלת שדות טופס
window.saveEditTrade = saveEditTradeData;                      // שמירת עריכת טרייד
window.saveNewTradeRecord = saveNewTradeRecord;            // שמירת טרייד חדש

// פונקציות ולידציה:
window.validateTradeForm = validateTradeForm;              // ולידציה של טופס
// ולידציה - משתמשת בפונקציות הכלליות מ-validation-utils.js

// פונקציות עזר:
window.loadModalData = loadModalData;                      // טעינת נתונים למודל
window.loadEditModalData = loadEditTradeModalData;              // טעינת נתונים למודל עריכה
window.updateTickerFromTradePlan = updateTickerFromTradePlan; // עדכון טיקר מתוכנית
window.updateTickersListForClosedTrades = updateTickersListForClosedTrades; // עדכון רשימת טיקרים
// window.updateTickersForClosedTradesFilter = window.updateTickersForClosedTradesFilter;
// פונקציה גלובלית לעדכון טיקרים - מושבתת עקב self-assignment
window.onShowClosedTradesChange = onShowClosedTradesChange; // פונקציה לשינוי פילטר טריידים סגורים

// פונקציות כפתורים חדשות
window.addImportantNote = addImportantNote;                // הוספת הערה חשובה
window.addReminder = addReminder;                          // הוספת תזכורת
window.addEditImportantNote = addEditImportantNote;        // הוספת הערה חשובה במודל עריכה
window.addEditReminder = addEditReminder;                  // הוספת תזכורת במודל עריכה

window.validateTradeStatusChange = validateTradeStatusChange; // בדיקת פוזיציה בעדכון סטטוס
window.getCurrentPosition = getCurrentPosition;            // קבלת פוזיציה נוכחית
window.validateTradePlanChange = validateTradePlanChange;  // בדיקת התאמת תוכנית טרייד
window.validateTradeChanges = validateTradeChanges;        // בדיקת שינויים בטרייד
window.validateTickerChange = validateTickerChange;        // בדיקת שינוי טיקר
// window.setupDateValidation = setupDateValidation;          // הגדרת ולידציה של תאריכים - מושבת זמנית
window.validateDateFields = validateDateFields;            // בדיקת ולידציה של שדות תאריך
window.setupDateValidation = setupDateValidation;          // הגדרת ולידציה של תאריכים
window.showDateValidationError = showDateValidationError;  // הצגת הודעת שגיאה לולידציה
window.clearDateValidationMessages = clearDateValidationMessages; // ניקוי הודעות ולידציה

// פונקציות סידור - משתמשות בפונקציות הגלובליות מ-tables.js
// Sort functions - using global functions from tables.js

/**
 * ולידציה בזמן אמת של שדות תאריך
 */
function setupDateValidation() {
  const openedAtField = document.getElementById('editTradeOpenedAt');
  const closedAtField = document.getElementById('editTradeClosedAt');

  if (openedAtField && closedAtField) {
    // ולידציה בעת שינוי תאריך יצירה
    openedAtField.addEventListener('change', function () {
      validateDateFields();
    });

    // ולידציה בעת שינוי תאריך סגירה
    closedAtField.addEventListener('change', function () {
      validateDateFields();
    });
  }
}

/**
 * בדיקת ולידציה של שדות תאריך
 */
function validateDateFields() {
  const openedAtField = document.getElementById('editTradeOpenedAt');
  const closedAtField = document.getElementById('editTradeClosedAt');

  if (!openedAtField || !closedAtField) {return;}

  const openedAt = openedAtField.value;
  const closedAt = closedAtField.value;

  // הסרת הודעות שגיאה קודמות
  clearDateValidationMessages();

  if (openedAt && closedAt) {
    const openedDate = new Date(openedAt);
    const closedDate = new Date(closedAt);

    if (closedDate < openedDate) {
      showDateValidationError('תאריך סגירה לא יכול להיות לפני תאריך יצירה');
      closedAtField.classList.add('is-invalid');
    } else {
      closedAtField.classList.remove('is-invalid');
      closedAtField.classList.add('is-valid');
    }
  }
}

/**
 * הצגת הודעת שגיאה לולידציה
 */
function showDateValidationError(message) {
  const closedAtField = document.getElementById('editTradeClosedAt');
  if (!closedAtField) {return;}

  // הסרת הודעות קודמות
  const existingError = closedAtField.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }

  // הוספת הודעת שגיאה
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  closedAtField.parentNode.appendChild(errorDiv);
}

/**
 * ניקוי הודעות ולידציה
 */
function clearDateValidationMessages() {
  const closedAtField = document.getElementById('editTradeClosedAt');
  if (!closedAtField) {return;}

  const existingError = closedAtField.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }

  closedAtField.classList.remove('is-invalid', 'is-valid');
}

// הפונקציה הוסרה - קיימת כבר בשורה 558

// הפונקציה הוסרה - קיימת כבר בשורה 657

// פונקציה addEditImportantNote כבר מוגדרת בשורה 689

// פונקציה addEditReminder כבר מוגדרת בשורה 695

function addEditBuySell() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציונליות זו תהיה זמינה בקרוב');
  }
}

// ייצוא פונקציות גלובליות
window.loadTradesData = loadTradesData;
window.updateTradesTable = updateTradesTable;
window.editTradeRecord = editTradeRecord;
window.cancelTradeRecord = cancelTradeRecord;
window.deleteTradeRecord = deleteTradeRecord;
window.formatDailyChange = formatDailyChange;

// ייצוא פונקציות נוספות
window.performTradeDeletion = performTradeDeletion;        // ביצוע מחיקה
window.addEditImportantNote = addEditImportantNote;        // הוספת הערה חשובה במודל עריכה
window.addEditReminder = addEditReminder;                  // הוספת תזכורת במודל עריכה
window.addEditBuySell = addEditBuySell;                    // הוספת עסקה במודל עריכה

// פונקציות toggle - משתמשות בפונקציות הגלובליות
function updateTableStats() {
  // בדיקה אם אנחנו בדף הנכון
  if (!document.querySelector('#tradesTable')) {
    // Not on trades page, skipping stats update
    return;
  }

  const tradesData = window.tradesData || [];
  // עדכון ספירת טריידים
  const tradesCountElement = document.getElementById('tradesCount');
  if (tradesCountElement) {
    tradesCountElement.textContent = `סה"כ טריידים: ${tradesData.length}`;
  } else {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('tradesCount', 'CRITICAL');
    } else {
      // console.error('tradesCount element not found');
    }
  }

  // חישוב סטטיסטיקות
  const openTrades = tradesData.filter(trade => trade.status === 'open').length;
  const closedTrades = tradesData.filter(trade => trade.status === 'closed').length;
  const cancelledTrades = tradesData.filter(trade => trade.status === 'cancelled').length;

  const totalPL = tradesData.reduce((sum, trade) => sum + (trade.total_pl || 0), 0);
  const positivePL = tradesData.filter(trade => (trade.total_pl || 0) > 0).length;
  const negativePL = tradesData.filter(trade => (trade.total_pl || 0) < 0).length;

  // עדכון סטטיסטיקות סיכום
  const summaryStatsElement = document.getElementById('summaryStats');
  if (summaryStatsElement) {
    summaryStatsElement.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">פתוחים:</span>
          <span class="stat-value">${openTrades}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">סגורים:</span>
          <span class="stat-value">${closedTrades}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">מבוטלים:</span>
          <span class="stat-value">${cancelledTrades}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">רווח כולל:</span>
          <span class="stat-value ${totalPL >= 0 ? 'positive' : 'negative'}">$${totalPL.toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">רווחיים:</span>
          <span class="stat-value positive">${positivePL}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">מפסידים:</span>
          <span class="stat-value negative">${negativePL}</span>
        </div>
      </div>
    `;
  } else {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('summaryStats', 'CRITICAL');
    } else {
      // console.error('summaryStats element not found');
    }
  }

  // טעינת תאריכי יצירה של תוכניות
  loadTradePlanDates();
}

/**
 * טעינת תאריכי יצירה של תוכניות טרייד
 */
async function loadTradePlanDates() {
  const planLinks = document.querySelectorAll('.plan-link[data-plan-id]');
  for (const link of planLinks) {
    const planId = link.getAttribute('data-plan-id');
    if (planId) {
      try {
        const response = await fetch(`/api/v1/trade_plans/${planId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            const plan = data.data;
            const createdDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : 'תאריך לא ידוע';
            link.textContent = createdDate;
          } else {
            link.textContent = 'תוכנית קיימת';
          }
        } else {
          link.textContent = 'תוכנית קיימת';
        }
      } catch (error) {
        link.textContent = 'תוכנית קיימת';
        if (typeof handleDataLoadError === 'function') {
          handleDataLoadError(error, `תוכנית ${planId}`);
        } else {
          // console.error(`Error loading plan ${planId}:`, error);
        }
      }
    }
  }

}

// ייצוא פונקציה לעדכון סטטיסטיקות
window.updateTableStats = updateTableStats;

// פונקציה לפילטור נתוני טריידים - משתמשת בפונקציה הגלובלית
function filterTradesData(_selectedStatuses, _selectedTypes, _selectedAccounts, _selectedDateRange, _searchTerm) {
  if (typeof window.filterDataByFilters === 'function') {
    window.filterDataByFilters(window.tradesData || [], 'trades');
  } else {
    if (typeof handleFunctionNotFound === 'function') {
      handleFunctionNotFound('filterDataByFilters');
    } else {
      // console.warn('filterDataByFilters function not found');
    }
  }

  // עדכון סטטיסטיקות אחרי פילטור
  updateTableStats();
}

// ייצוא פונקציה לפילטור נתונים
window.filterTradesData = filterTradesData;

// הוספת event listeners לכפתורי המיון - משתמש בפונקציות הגלובליות
function setupSortEventListeners() {
  const sortButtons = document.querySelectorAll('.sortable-header[data-sort-column]');
  sortButtons.forEach(button => {
    button.addEventListener('click', function () {
      const columnIndex = parseInt(this.getAttribute('data-sort-column'));
      if (typeof window.sortTable === 'function') {
        window.sortTable(columnIndex, window.tradesData || [], 'trades', window.updateTradesTable);
      } else {
        if (typeof handleFunctionNotFound === 'function') {
          handleFunctionNotFound('sortTable');
        } else {
          // console.warn('sortTable function not found');
        }
      }
    });
  });
}

// קריאה לטעינת נתונים כשהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    // הוספת event listeners
    setupSortEventListeners();
    setTimeout(() => {
      if (typeof window.loadTradesData === 'function') {
        window.loadTradesData();
      }
    }, 1000);
  });
} else {
  // הדף כבר נטען
  // טעינת מצב הסידור השמור
  loadTradesSortState();
  // הוספת event listeners
  setupSortEventListeners();
  setTimeout(() => {
    if (typeof window.loadTradesData === 'function') {
      window.loadTradesData();
    }
  }, 1000);
}

/**
 * בדיקת התאמת תוכנית טרייד לטרייד
 */
async function validateTradePlanChange(newTradePlanId, tradeData) {
  if (!newTradePlanId) {
    return { isValid: true, message: '' }; // ללא תוכנית - תקין
  }

  try {
    // קבלת פרטי התוכנית החדשה
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const url = `${base}/api/v1/trade_plans/${newTradePlanId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('שגיאה בטעינת פרטי התוכנית');
    }

    const tradePlan = await response.json();
    // בדיקה 1: התאמת טיקר
    if (tradePlan.data.ticker_id !== tradeData.ticker_id) {
      const errorMessage = `התוכנית החדשה מקושרת לטיקר ${tradePlan.data.ticker?.symbol || 'שונה'} ואילו הטרייד מקושר לטיקר ${tradeData.ticker_symbol || 'שונה'}. לא ניתן לקשר תוכנית לטיקר אחר.`;
      return {
        isValid: false,
        message: errorMessage,
      };
    }

    // בדיקה 2: התאמת צד (Long/Short)
    if (tradePlan.data.side !== tradeData.side) {
      return {
        isValid: false,
        message: `התוכנית החדשה היא ${tradePlan.data.side === 'Long' ? 'Long' : 'Short'} ואילו הטרייד הוא ${tradeData.side === 'Long' ? 'Long' : 'Short'}. לא ניתן לקשר תוכנית לצד אחר.`,
      };
    }

    // בדיקה 3: תאריך יצירת התוכנית לא מאוחר מתאריך פתיחת הטרייד
    if (tradePlan.data.created_at && tradeData.opened_at) {
      const planCreatedAt = new Date(tradePlan.data.created_at);
      const tradeOpenedAt = new Date(tradeData.opened_at);

      if (planCreatedAt > tradeOpenedAt) {
        return {
          isValid: false,
          message: `תאריך יצירת התוכנית (${planCreatedAt.toLocaleDateString('he-IL')}) מאוחר מתאריך פתיחת הטרייד (${tradeOpenedAt.toLocaleDateString('he-IL')}). לא ניתן לקשר תוכנית שנוצרה אחרי פתיחת הטרייד.`,
        };
      }
    }

    return { isValid: true, message: '' };

  } catch {
    handleValidationError('trade plan', 'שגיאה בבדיקת התוכנית');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת התוכנית. אנא נסה שוב.',
    };
  }
}

/**
 * בדיקת שינויים בטרייד לפני שמירה
 */
async function validateTradeChanges(originalTrade, updatedTrade) {
  const validations = [];

  // בדיקת שינוי תוכנית טרייד
  const originalPlanId = originalTrade.trade_plan_id ? parseInt(originalTrade.trade_plan_id) : null;
  const updatedPlanId = updatedTrade.trade_plan_id ? parseInt(updatedTrade.trade_plan_id) : null;

  // בדיקה אם יש שינוי אמיתי (לא רק null vs null)
  if (originalPlanId !== updatedPlanId && (originalPlanId !== null || updatedPlanId !== null)) {
    // בדיקת ולידציה של תוכנית טרייד
    const planValidation = await validateTradePlanChange(updatedPlanId, updatedTrade);
    if (!planValidation.isValid) {
      validations.push(planValidation.message);
    }

    // בדיקת תאריך תוכנית טרייד
    const dateValidation = await validateTradePlanDate(updatedPlanId, originalTrade);
    if (!dateValidation.isValid) {
      validations.push(dateValidation.message);
    }
  }

  // בדיקת שינוי טיקר
  const originalTickerId = originalTrade.ticker_id ? parseInt(originalTrade.ticker_id) : null;
  const updatedTickerId = updatedTrade.ticker_id ? parseInt(updatedTrade.ticker_id) : null;

  if (originalTickerId !== updatedTickerId && (originalTickerId !== null || updatedTickerId !== null)) {
    const tickerValidation = await validateTickerChange(updatedTickerId, originalTrade);
    if (!tickerValidation.isValid) {
      validations.push(tickerValidation.message);
    }
  }

  // בדיקת פוזיציה בעדכון סטטוס
  if (updatedTrade.status === 'closed' && originalTrade.status !== 'closed') {
    const positionValidation = validateTradeStatusChange(updatedTrade.status, updatedTrade);
    if (!positionValidation) {
      validations.push('ביטול שמירה עקב בדיקת פוזיציה');
    }
  }

  // בדיקת תאריכים - תאריך סגירה לא יכול להיות לפני תאריך יצירה
  if (updatedTrade.opened_at && updatedTrade.closed_at) {
    const openedAt = new Date(updatedTrade.opened_at);
    const closedAt = new Date(updatedTrade.closed_at);

    if (closedAt < openedAt) {
      validations.push(`תאריך סגירה (${closedAt.toLocaleDateString('he-IL')}) לא יכול להיות לפני תאריך יצירה (${openedAt.toLocaleDateString('he-IL')})`);
    }
  }

  return validations;
}

// ולידציה של תאריכים - משתמשת בפונקציות הכלליות מ-validation-utils.js

// ===== פונקציות פילטר לטבלת טריידים =====

/**
 * פונקציה לטיפול בפילטר סטטוס לטבלת טריידים
 */
function applyStatusFilterToTrades(selectedStatuses) {
  if (!window.tradesData || !Array.isArray(window.tradesData)) {
    // console.warn('⚠️ No trades data available for filtering');
    return;
  }

  let filteredTrades = [...window.tradesData];

  // אם יש בחירות ספציפיות (לא "הכול")
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('הכול')) {
    // המרת ערכים עבריים לאנגלית
    const statusMapping = {
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled',
    };

    const englishStatuses = selectedStatuses.map(status => statusMapping[status] || status);

    filteredTrades = filteredTrades.filter(trade => {
      const tradeStatus = trade.status || 'open';
      return englishStatuses.includes(tradeStatus);
    });

    // Status filter applied
  }

  // עדכון הטבלה עם הנתונים המסוננים
  updateTradesTable(filteredTrades);
}

// ייצוא פונקציות פילטר לגלובל
window.applyStatusFilterToTrades = applyStatusFilterToTrades;
// ייצוא פונקציות ולידציה חדשות
window.validateTickerChange = validateTickerChange;
window.validateTradePlanDate = validateTradePlanDate;
window.showTickerChangeConfirmation = showTickerChangeConfirmation;

// ייצוא פונקציות עדכון מחירים
window.updateEditTradeTickerFromPlan = updateEditTradeTickerFromPlan;
window.updateEditTradePriceFromTicker = updateEditTradePriceFromTicker;

/**
 * בדיקת שינוי טיקר בטרייד
 * @param {string} newTickerId - מזהה הטיקר החדש
 * @param {object} tradeData - נתוני הטרייד הנוכחי
 * @returns {Promise<object>} תוצאות הוולידציה
 */
async function validateTickerChange(newTickerId, tradeData) {
  if (!newTickerId || !tradeData.ticker_id) {
    return { isValid: true, message: '' };
  }

  const originalTickerId = parseInt(tradeData.ticker_id);
  const updatedTickerId = parseInt(newTickerId);

  // בדיקה אם הטיקר השתנה
  if (originalTickerId === updatedTickerId) {
    return { isValid: true, message: '' };
  }

  try {
    // קבלת פרטי הטיקר המקורי והחדש
    const [originalTickerResponse, newTickerResponse] = await Promise.all([
      fetch(`/api/v1/tickers/${originalTickerId}`),
      fetch(`/api/v1/tickers/${updatedTickerId}`),
    ]);

    if (!originalTickerResponse.ok || !newTickerResponse.ok) {
      throw new Error('שגיאה בקבלת פרטי טיקרים');
    }

    const originalTicker = await originalTickerResponse.json();
    const newTicker = await newTickerResponse.json();

    const originalSymbol = originalTicker.data?.symbol || 'לא ידוע';
    const newSymbol = newTicker.data?.symbol || 'לא ידוע';

    // הצגת דיאלוג אישור
    const confirmed = await showTickerChangeConfirmation(originalSymbol, newSymbol);

    return {
      isValid: confirmed,
      message: confirmed ? '' : 'המשתמש ביטל את שינוי הטיקר',
    };

  } catch {
    handleValidationError('ticker change', 'שגיאה בבדיקת שינוי טיקר');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת הטיקר. אנא נסה שוב.',
    };
  }
}

/**
 * הצגת דיאלוג אישור לשינוי טיקר
 * @param {string} originalSymbol - סימבול הטיקר המקורי
 * @param {string} newSymbol - סימבול הטיקר החדש
 * @returns {Promise<boolean>} האם המשתמש אישר את השינוי
 */
function showTickerChangeConfirmation(originalSymbol, newSymbol) {
  return new Promise(resolve => {
    const message = 'האם אתה בטוח שברצונך לשנות את הטיקר מ-' + originalSymbol + ' ל-' + newSymbol + '?\n\n' +
      'שינוי טיקר בטרייד קיים עלול להשפיע על:\n' +
      '• חישובי רווח/הפסד\n' +
      '• קישור לתוכניות טרייד\n' +
      '• נתוני מעקב היסטוריים\n\n' +
      'האם להמשיך בשינוי?';

    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'שינוי טיקר בטרייד',
        message,
        'אשר שינוי',
        'ביטול',
        () => resolve(true),
        () => resolve(false),
      );
    } else {
      // Fallback לדיאלוג פשוט
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'אישור',
          message,
          confirmed => resolve(confirmed),
          () => resolve(false),
        );
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'אישור',
            message,
            confirmed => resolve(confirmed),
            () => resolve(false),
          );
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          const confirmed = window.confirm(message);
          resolve(confirmed);
        }
        resolve(confirmed);
      }
    }
  });
}

/**
 * בדיקת תאריך תוכנית טרייד לעומת תאריך הטרייד
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 * @param {object} tradeData - נתוני הטרייד
 * @returns {Promise<object>} תוצאות הוולידציה
 */
async function validateTradePlanDate(tradePlanId, tradeData) {
  if (!tradePlanId || !tradeData.created_at) {
    return { isValid: true, message: '' };
  }

  try {
    // קבלת פרטי תוכנית הטרייד
    const response = await fetch(`/api/v1/trade_plans/${tradePlanId}`);
    if (!response.ok) {
      throw new Error('שגיאה בקבלת פרטי תוכנית טרייד');
    }

    const tradePlan = await response.json();
    const planCreatedAt = new Date(tradePlan.data.created_at);
    const tradeCreatedAt = new Date(tradeData.created_at);

    // בדיקה אם תאריך יצירת התוכנית מאוחר מתאריך יצירת הטרייד
    if (planCreatedAt > tradeCreatedAt) {
      return {
        isValid: false,
        message: `לא ניתן לקשר תוכנית טרייד שנוצרה בתאריך ${planCreatedAt.toLocaleDateString('he-IL')} לטרייד שנוצר בתאריך ${tradeCreatedAt.toLocaleDateString('he-IL')}. תאריך יצירת התוכנית לא יכול להיות מאוחר מתאריך יצירת הטרייד.`,
      };
    }

    return { isValid: true, message: '' };

  } catch {
    handleValidationError('trade plan date', 'שגיאה בבדיקת תאריך תוכנית טרייד');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת תאריך התוכנית. אנא נסה שוב.',
    };
  }
}

/**
 * עדכון טיקר במודל העריכה לפי תוכנית טרייד נבחרת
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 */
async function updateEditTradeTickerFromPlan(tradePlanId) {
  if (!tradePlanId) {
    return;
  }

  // בדיקה אם השדה נוקה על ידי המערכת
  const tradePlanSelect = document.getElementById('editTradeTradePlanId');
  if (tradePlanSelect && tradePlanSelect.getAttribute('data-cleared') === 'true') {
    // השדה נוקה על ידי המערכת - לא לבצע עדכון
    tradePlanSelect.removeAttribute('data-cleared');
    return;
  }

  try {
    // קבלת פרטי התוכנית
    const response = await fetch(`/api/v1/trade_plans/${tradePlanId}`);
    if (!response.ok) {
      throw new Error('שגיאה בקבלת פרטי תוכנית טרייד');
    }

    const tradePlan = await response.json();
    const plan = tradePlan.data;

    // בדיקה אם הטיקר שונה מהמקורי
    const originalTrade = window.currentEditTrade;
    const originalTickerId = originalTrade?.ticker_id;


    // בדיקה אם יש טיקר מקורי והטיקר של התוכנית החדשה שונה
    if (originalTickerId && plan.ticker_id && plan.ticker_id.toString() !== originalTickerId.toString()) {
      // שינוי תוכנית עם טיקר שונה - לא נתמך
      window.showErrorNotification(
        'פיצר לא נתמך',
        'שינוי תוכנית טרייד לטיקר שונה עדיין לא נתמך במערכת. אנא בחר תוכנית עם אותו טיקר או הסר את הקישור לתוכנית.',
      );

      // החזרת שדה התוכנית למצבו המקורי
      const editTradePlanSelect = document.getElementById('editTradeTradePlanId');
      if (editTradePlanSelect && originalTrade) {
        if (originalTrade.trade_plan_id) {
          tradePlanSelect.value = originalTrade.trade_plan_id;
        } else {
          tradePlanSelect.value = '';
        }

        // סימון שהשדה הוחזר למצב מקורי
        tradePlanSelect.setAttribute('data-restored', 'true');
      }

      return; // עצירת התהליך
    }

    // עדכון שדות הטיקר - רק אם הטיקר זהה או אם אין טיקר נוכחי
    const tickerDisplay = document.getElementById('editTradeTickerDisplay');
    const tickerIdInput = document.getElementById('editTradeTickerId');

    if (tickerDisplay && plan.ticker_symbol) {
      tickerDisplay.textContent = plan.ticker_symbol;
    }

    if (tickerIdInput && plan.ticker_id) {
      tickerIdInput.value = plan.ticker_id;

      // עדכון מחיר מהטיקר החדש
      await updateEditTradePriceFromTicker(plan.ticker_id);
    }

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון טיקר במודל העריכה');
    } else {
      // console.error('Error updating ticker in edit modal:', error);
    }
  }
}

/**
 * עדכון מחיר במודל העריכה לפי טיקר נבחר
 * @param {string} tickerId - מזהה הטיקר
 */
async function updateEditTradePriceFromTicker(tickerId) {
  if (!tickerId) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/tickers/${tickerId}`);
    if (response.ok) {
      const tickerData = await response.json();
      const ticker = tickerData.data;

      // עדכון מחיר נוכחי
      const currentPriceElement = document.getElementById('editTradeCurrentPrice');
      if (currentPriceElement && ticker.current_price) {
        currentPriceElement.textContent = `$${parseFloat(ticker.current_price).toFixed(2)}`;
      }

      // עדכון שינוי יומי
      const dailyChangeElement = document.getElementById('editTradeDailyChange');
      if (dailyChangeElement && ticker.daily_change !== undefined) {
        const dailyChange = parseFloat(ticker.daily_change);
        const dailyChangeValue = dailyChange >= 0 ? `+${dailyChange.toFixed(2)}%` : `${dailyChange.toFixed(2)}%`;
        dailyChangeElement.textContent = dailyChangeValue;

        // צביעה לפי ערך באמצעות המערכת הגלובלית
        const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', negative: '#dc3545' };
        if (dailyChange >= 0) {
          dailyChangeElement.style.color = colors.positive;
          dailyChangeElement.style.fontWeight = 'bold';
        } else {
          dailyChangeElement.style.color = colors.negative;
          dailyChangeElement.style.fontWeight = 'bold';
        }
      }
    }
  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון מחיר במודל העריכה');
    } else {
      // console.error('Error updating price in edit modal:', error);
    }
  }
}

/**
 * הפעלה מחדש של טרייד מבוטל
 *
 * @param {string|number} tradeId - מזהה הטרייד
 */
async function reactivateTrade(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - עריכה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trades', 'edit');
    }
    
    // מציאת הטרייד בנתונים
    const trade = tradesData.find(t => t.id === tradeId);
    if (!trade) {
      if (typeof handleElementNotFound === 'function') {
        handleElementNotFound('trade', 'CRITICAL');
      } else {
        // console.error('trade not found');
      }
      throw new Error('טרייד לא נמצא');
    }

    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/v1/trades/${tradeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // שימוש במערכת הריענון המרכזית
    if (window.centralRefresh) {
      await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד הופעל מחדש בהצלחה!');
    } else {
      // Fallback למערכת הישנה
      // הצגת הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('טרייד הופעל מחדש בהצלחה!');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('טרייד הופעל מחדש בהצלחה!', 'success');
      }
    }

    // רענון הטבלה
    await loadTradesData();

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'הפעלה מחדש של טרייד');
    } else {
      // console.error('Error reactivating trade:', error);
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהפעלה מחדש', 'error');
    }
  }
}

/**
 * רענון נתוני טריידים
 * טוען מחדש את כל נתוני הטריידים מהשרת
 */
function refreshTrades() {
  try {
    console.log('🔄 מרענן נתוני טריידים...');
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showNotification('מרענן נתוני טריידים...', 'info');
    }
    
    // טעינת נתונים מחדש
    loadTradesData();
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('נתוני טריידים רוענו בהצלחה');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('נתוני טריידים רוענו בהצלחה', 'success');
    }
    
  } catch (error) {
    console.error('שגיאה ברענון טריידים:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון טריידים', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה ברענון טריידים', 'error');
    }
  }
}

/**
 * עדכון טרייד קיים
 * @param {number} tradeId - מזהה הטרייד
 * @param {Object} tradeData - נתוני הטרייד החדשים
 */
function updateTrade(tradeId, tradeData) {
  try {
    console.log('📝 מעדכן טרייד:', tradeId, tradeData);
    
    // ולידציה בסיסית
    if (!tradeId || !tradeData) {
      throw new Error('נתונים חסרים לעדכון טרייד');
    }
    
    // שליחה לשרת
    fetch('/api/trades/' + tradeId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בעדכון טרייד');
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ טרייד עודכן בהצלחה:', data);
      
      // רענון הטבלה
      loadTradesData();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('טרייד עודכן בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('טרייד עודכן בהצלחה', 'success');
      }
    })
    .catch(error => {
      console.error('שגיאה בעדכון טרייד:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון טרייד', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון טרייד', 'error');
      }
    });
    
  } catch (error) {
    console.error('שגיאה בעדכון טרייד:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טרייד', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון טרייד', 'error');
    }
  }
}

/**
 * אישור מחיקת טרייד
 * מציג חלון אישור לפני מחיקת טרייד
 * @param {number} tradeId - מזהה הטרייד למחיקה
 */
function confirmDeleteTrade(tradeId) {
  try {
    console.log('🗑️ מאשר מחיקת טרייד:', tradeId);
    
    // חיפוש הטרייד בנתונים
    const trade = window.tradesData.find(t => t.id === tradeId);
    if (!trade) {
      throw new Error('טרייד לא נמצא');
    }
    
    // יצירת הודעת אישור
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את הטרייד?\n\n` +
      `חשבון: ${trade.account_name || 'לא ידוע'}\n` +
      `טיקר: ${trade.ticker_symbol || 'לא ידוע'}\n` +
      `סכום: ${trade.amount || 'לא ידוע'}`;
    
    // הצגת חלון אישור
    if (confirm(confirmMessage)) {
      // ביצוע המחיקה
      deleteTradeRecord(tradeId);
    }
    
  } catch (error) {
    console.error('שגיאה באישור מחיקת טרייד:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באישור מחיקת טרייד', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה באישור מחיקת טרייד', 'error');
    }
  }
}

