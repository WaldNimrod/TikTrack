// ===== קובץ JavaScript לדף מטבעות =====
/*
 * Currencies.js - Currencies Page Management
 * =========================================
 *
 * This file contains all currencies management functionality for the TikTrack application.
 * It handles currencies CRUD operations, table updates, and user interactions.
 *
 * Note: This file is preserved for potential future use, but the currencies page
 * has been removed from the main navigation menu.
 *
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 *
 * File: trading-ui/scripts/currencies.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// משתנים גלובליים
if (!window.currenciesData) {
  window.currenciesData = [];
}
let currenciesData = window.currenciesData;

// פונקציות בסיסיות
function openCurrencyDetails(_id) {

  showAddCurrencyModal();
}

function editCurrency(id) {

  showEditCurrencyModal(id);
}

function deleteCurrency(id) {

  showDeleteCurrencyModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים

/**
 * הצגת מודל עריכת מטבע
 */
function showEditCurrencyModal(id) {

  const currency = currenciesData.find(c => c.id === id);
  if (!currency) {
    handleElementNotFound('showEditCurrencyModal', `מטבע לא נמצא: ${id}`);
    return;
  }

  // מילוי הטופס באמצעות DataCollectionService
  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setFormData) {
    const fieldMap = {
      id: { id: 'editCurrencyId', type: 'int' },
      symbol: { id: 'editCurrencySymbol', type: 'text' },
      name: { id: 'editCurrencyName', type: 'text' },
      usd_rate: { id: 'editCurrencyUsdRate', type: 'number' }
    };
    const values = {
      id: currency.id,
      symbol: currency.symbol,
      name: currency.name,
      usd_rate: currency.usd_rate
    };
    window.DataCollectionService.setFormData(fieldMap, values);
  } else {
    // Fallback if DataCollectionService is not available
    // Use DataCollectionService to set values if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue('editCurrencyId', currency.id, 'int');
        window.DataCollectionService.setValue('editCurrencySymbol', currency.symbol, 'text');
        window.DataCollectionService.setValue('editCurrencyName', currency.name, 'text');
        window.DataCollectionService.setValue('editCurrencyUsdRate', currency.usd_rate, 'number');
    } else {
        const editIdEl = document.getElementById('editCurrencyId');
        const editSymbolEl = document.getElementById('editCurrencySymbol');
        const editNameEl = document.getElementById('editCurrencyName');
        const editRateEl = document.getElementById('editCurrencyUsdRate');
        if (editIdEl) editIdEl.value = currency.id;
        if (editSymbolEl) editSymbolEl.value = currency.symbol;
        if (editNameEl) editNameEl.value = currency.name;
        if (editRateEl) editRateEl.value = currency.usd_rate;
    }
  }

  // הצגת המודל
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
    window.ModalManagerV2.showModal('editCurrencyModal', 'edit', currency).catch(error => {
      window.Logger?.error('Error showing edit currency modal via ModalManagerV2', { error, modalId: 'editCurrencyModal', page: 'currencies' });
      // Fallback to bootstrap if ModalManagerV2 fails
      if (bootstrap?.Modal) {
        const modal = new bootstrap.Modal(document.getElementById('editCurrencyModal'));
        modal.show();
      }
    });
  } else if (bootstrap?.Modal) {
    const modal = new bootstrap.Modal(document.getElementById('editCurrencyModal'));
    modal.show();
  }
}

/**
 * הצגת מודל מחיקת מטבע
 */
function showDeleteCurrencyModal(id) {

  const currency = currenciesData.find(c => c.id === id);
  if (!currency) {
    handleElementNotFound('showDeleteCurrencyModal', `מטבע לא נמצא: ${id}`);
    return;
  }

  // מילוי פרטי המחיקה
  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
    window.DataCollectionService.setValue('deleteCurrencyId', currency.id, 'int');
  } else {
    // Fallback if DataCollectionService is not available
    // Use DataCollectionService to set value if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue('deleteCurrencyId', currency.id, 'int');
    } else {
        const deleteIdEl = document.getElementById('deleteCurrencyId');
        if (deleteIdEl) deleteIdEl.value = currency.id;
    }
  }
  document.getElementById('deleteCurrencyName').textContent = `${currency.symbol} - ${currency.name}`;

  // הצגת המודל
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
    window.ModalManagerV2.showModal('deleteCurrencyModal', 'delete', currency).catch(error => {
      window.Logger?.error('Error showing delete currency modal via ModalManagerV2', { error, modalId: 'deleteCurrencyModal', page: 'currencies' });
      // Fallback to bootstrap if ModalManagerV2 fails
      if (bootstrap?.Modal) {
        const modal = new bootstrap.Modal(document.getElementById('deleteCurrencyModal'));
        modal.show();
      }
    });
  } else if (bootstrap?.Modal) {
    const modal = new bootstrap.Modal(document.getElementById('deleteCurrencyModal'));
    modal.show();
  }
}

// ========================================
// פונקציות API
// ========================================

/**
 * טעינת מטבעות מהשרת
 */
async function loadCurrencies() {
  try {

    // Use relative URL to work with both development (8080) and production (5001)
    const response = await fetch('/api/currencies/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      currenciesData = result.data;

      renderCurrenciesTable();
      updateCurrenciesPageSummaryStats();
    } else {
      handleApiError(new Error(result.error), 'טעינת מטבעות');
      // הצגת שגיאה למשתמש
      const tbody = document.querySelector('#currenciesTable tbody');
      if (tbody) {
        tbody.textContent = '';
        const errorRow = document.createElement('tr');
        const errorCell = document.createElement('td');
        errorCell.colSpan = 6;
        errorCell.className = 'text-center text-danger';
        errorCell.textContent = 'שגיאה בטעינת נתונים: ' + result.error;
        errorRow.appendChild(errorCell);
        tbody.appendChild(errorRow);
      }
    }
  } catch (error) {
    handleApiError(error, 'טעינת מטבעות');
    // הצגת שגיאה למשתמש
    const tbody = document.querySelector('#currenciesTable tbody');
    if (tbody) {
      tbody.textContent = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'text-center text-danger';
      cell.textContent = 'שגיאה בטעינת נתונים: ' + error.message;
      row.appendChild(cell);
      tbody.appendChild(row);
    }
  }
}

// saveCurrency function removed - not used

// updateCurrency function removed - not used

/**
 * מחיקת מטבע
 */
async function confirmDeleteCurrency() {
  try {
    // Use DataCollectionService to get value if available
    let id;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
        id = parseInt(window.DataCollectionService.getValue('deleteCurrencyId', 'int', 0));
    } else {
        const deleteIdEl = document.getElementById('deleteCurrencyId');
        id = deleteIdEl ? parseInt(deleteIdEl.value) : 0;
    }

    // בדיקת פריטים מקושרים לפני מחיקה
    if (typeof window.checkLinkedItemsBeforeDelete === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeDelete(id);
      if (hasLinkedItems) {
        return; // הפונקציה תטפל בהצגת המודול
      }
    }

    // Use relative URL to work with both development (8080) and production (5001)
    const response = await fetch(`/api/currencies/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.status === 'success') {

      // סגירת המודל
      if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
        window.ModalManagerV2.hideModal('deleteCurrencyModal');
      } else if (bootstrap?.Modal) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCurrencyModal'));
        if (modal) {
          modal.hide();
        }
      }

      // טעינה מחדש של הנתונים
      await loadCurrencies();
    } else {
      handleApiError(new Error(result.error), 'מחיקת מטבע');
      window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת מטבע');
    }
  } catch (error) {
    handleDeleteError(error, 'מחיקת מטבע');
    window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת מטבע');
  }
}

// ========================================
// פונקציות תצוגה
// ========================================

/**
 * בדיקת פריטים מקושרים לפני מחיקה
 */
async function checkLinkedItemsBeforeDelete(currencyId) {
  try {
    const response = await fetch(`/api/linked-items/currency/${currencyId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם המחיקה
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    // parent entities הם פריטים שהמטבע מקושר אליהם - לא רלוונטי למחיקה

    // בדיקה רק אם יש פריטים שמקושרים אל המטבע (child entities)
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        window.showLinkedItemsModal(linkedItemsData, 'currency', currencyId);
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('אזהרה', 'יש פריטים מקושרים למטבע זה', 'warning');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים');
    return false;
  }
}

/**
 * רינדור טבלת מטבעות
 */
function renderCurrenciesTable() {
  const tbody = document.querySelector('#currenciesTable tbody');
  if (!tbody) {return;}

  tbody.textContent = '';

  currenciesData.forEach(currency => {
    const row = document.createElement('tr');
    const rowHTML = `
            <td>${currency.id}</td>
            <td><strong>${currency.symbol}</strong></td>
            <td>${currency.name}</td>
            <td>${parseFloat(currency.usd_rate).toFixed(6)}</td>
            <td>${formatDateTime(currency.created_at)}</td>
            <td>
                <button data-button-type="EDIT" data-onclick="editCurrency(${currency.id})"></button>
                <button data-button-type="DELETE" data-onclick="deleteCurrency(${currency.id})"></button>
            </td>
        `;
    row.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<table><tbody><tr>${rowHTML}</tr></tbody></table>`, 'text/html');
    const tempRow = doc.body.querySelector('tr');
    if (tempRow) {
        Array.from(tempRow.children).forEach(cell => {
            row.appendChild(cell.cloneNode(true));
        });
    }
    tbody.appendChild(row);
  });

  // עדכון מספר הפריטים - משתמש בפונקציה הגנרית לקבלת סך כל הרשומות
  if (window.updateTableCount) {
    window.updateTableCount('.table-count', 'currencies', 'מטבעות', currenciesData.length);
  } else {
    // Fallback
    const countElement = document.querySelector('.table-count');
    if (countElement) {
      countElement.textContent = `${currenciesData.length} מטבעות`;
    }
  }
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updateCurrenciesPageSummaryStats() {
  const totalCurrencies = currenciesData.length;
  const rates = currenciesData.map(c => parseFloat(c.usd_rate));
  const maxRate = rates.length > 0 ? Math.max(...rates) : 1.0;
  const minRate = rates.length > 0 ? Math.min(...rates) : 1.0;

  const totalCurrenciesEl = document.getElementById('totalCurrencies');
  const baseCurrencyEl = document.getElementById('baseCurrency');
  const maxRateEl = document.getElementById('maxRate');
  const minRateEl = document.getElementById('minRate');
  
  if (totalCurrenciesEl) totalCurrenciesEl.textContent = totalCurrencies;
  if (baseCurrencyEl) baseCurrencyEl.textContent = 'USD';
  if (maxRateEl) maxRateEl.textContent = maxRate.toFixed(6);
  if (minRateEl) minRateEl.textContent = minRate.toFixed(6);
}

/**
 * פורמט תאריך ושעה
 */
// פונקציות formatDateTime מוגדרות כעת ב-main.js

// ========================================
// פונקציות אתחול
// ========================================

/**
 * אתחול דף מטבעות
 */
async function initializeCurrenciesPage() {

  // טעינת נתונים
  await loadCurrencies();

  // שחזור מצב הסגירה
  if (typeof restoreCurrenciesSectionState === 'function') {
    restoreCurrenciesSectionState();
  } else if (typeof window.restoreCurrenciesSectionState === 'function') {
    window.restoreCurrenciesSectionState();
  }
  // If function doesn't exist, silently skip - not critical

}

// ========================================
// ייצוא פונקציות
// ========================================

// אתחול הדף
// document.addEventListener('DOMContentLoaded', function () {
//   // === DOM CONTENT LOADED (CURRENCIES) ===

  // שחזור מצב הסקשנים
  if (typeof window.restoreCurrenciesSectionState === 'function') {
    window.restoreCurrenciesSectionState();
  } else if (typeof handleFunctionNotFound === 'function') {
    handleFunctionNotFound('restoreCurrenciesSectionState', 'פונקציית שחזור מצב מטבעות לא נמצאה');
  } else {
    // Silent fallback if handleFunctionNotFound is not available
    window.Logger?.warn?.('⚠️ restoreCurrenciesSectionState function not available', { page: 'currencies' });
  }

  // טעינת נתונים
  if (typeof window.loadCurrenciesData === 'function') {
    window.loadCurrenciesData();
  } else if (typeof handleFunctionNotFound === 'function') {
    handleFunctionNotFound('loadCurrenciesData', 'פונקציית טעינת נתוני מטבעות לא נמצאה');
  } else {
    // Silent fallback if handleFunctionNotFound is not available
    window.Logger?.warn?.('⚠️ loadCurrenciesData function not available', { page: 'currencies' });
  }

//   // Currencies page initialization completed
// });

// ייצוא פונקציות גלובליות
window.openCurrencyDetails = openCurrencyDetails;
window.editCurrency = editCurrency;
window.deleteCurrency = deleteCurrency;
window.showDeleteCurrencyModal = showDeleteCurrencyModal;
window.confirmDeleteCurrency = confirmDeleteCurrency;
window.checkLinkedItemsBeforeDelete = checkLinkedItemsBeforeDelete;  // בדיקת אובייקטים מקושרים למחיקה
// Wrapper function for backward compatibility - uses global toggleSection
window.toggleCurrenciesSection = function() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('currencies');
    } else {
        console.error('toggleSection not available');
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת הסתרת סקשנים לא זמינה. אנא רענן את הדף.');
        }
    }
};
// restoreCurrenciesSectionState - function is provided by restoreAnyTableSort or similar system
window.restoreCurrenciesSectionState = function() {
    // Use general restore function if available
    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('currencies');
    } else if (typeof window.Logger?.debug === 'function') {
        window.Logger.debug('restoreCurrenciesSectionState: restoreAnyTableSort not available', { page: 'currencies' });
    }
};
window.renderCurrenciesTable = renderCurrenciesTable;
window.updateCurrenciesPageSummaryStats = updateCurrenciesPageSummaryStats;
window.initializeCurrenciesPage = initializeCurrenciesPage;
