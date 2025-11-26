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
  const modal = new bootstrap.Modal(document.getElementById('editCurrencyModal'));
  modal.show();
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
  const modal = new bootstrap.Modal(document.getElementById('deleteCurrencyModal'));
  modal.show();
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
      updatePageSummaryStats();
    } else {
      handleApiError(new Error(result.error), 'טעינת מטבעות');
      // הצגת שגיאה למשתמש
      const tbody = document.querySelector('#currenciesTable tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים: ' + result.error + '</td></tr>';
      }
    }
  } catch (error) {
    handleApiError(error, 'טעינת מטבעות');
    // הצגת שגיאה למשתמש
    const tbody = document.querySelector('#currenciesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
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
      const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCurrencyModal'));
      modal.hide();

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

  tbody.innerHTML = '';

  currenciesData.forEach(currency => {
    const row = document.createElement('tr');
    row.innerHTML = `
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
function updatePageSummaryStats() {
  const totalCurrencies = currenciesData.length;
  const rates = currenciesData.map(c => parseFloat(c.usd_rate));
  const maxRate = rates.length > 0 ? Math.max(...rates) : 1.0;
  const minRate = rates.length > 0 ? Math.min(...rates) : 1.0;

  document.getElementById('totalCurrencies').textContent = totalCurrencies;
  document.getElementById('baseCurrency').textContent = 'USD';
  document.getElementById('maxRate').textContent = maxRate.toFixed(6);
  document.getElementById('minRate').textContent = minRate.toFixed(6);
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
  restoreCurrenciesSectionState();

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
  } else {
    handleFunctionNotFound('restoreCurrenciesSectionState', 'פונקציית שחזור מצב מטבעות לא נמצאה');
  }

  // טעינת נתונים
  if (typeof window.loadCurrenciesData === 'function') {
    window.loadCurrenciesData();
  } else {
    handleFunctionNotFound('loadCurrenciesData', 'פונקציית טעינת נתוני מטבעות לא נמצאה');
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
window.restoreCurrenciesSectionState = restoreCurrenciesSectionState;
window.renderCurrenciesTable = renderCurrenciesTable;
window.updatePageSummaryStats = updatePageSummaryStats;
window.initializeCurrenciesPage = initializeCurrenciesPage;
