import { toHebrewStatus } from '../../utils/statusAdapter.js';
import {
  formatDailyChange,
  formatDailyChangeFromAbsolute,
} from '../../utils/formatChange.js';

/**
 * tableFormatters - פונקציות עזר לפורמט תצוגה בטבלאות
 * -----------------------------------------------------
 * פונקציות עזר לפורמט תצוגה: מספרים, מטבעות, תאריכים, באגטים, ופורמטים מיוחדים.
 *
 * @description פונקציות עזר לפורמט תצוגה בטבלאות Phoenix
 * @standard JS Standards Protocol ✅ | Clean Slate Rule ✅
 * @legacyReference Legacy.tables.formatters
 *
 * @example
 * // פורמט מטבע
 * const formatted = formatCurrency(1234.56, 'USD');
 * // Returns: "$1,234.56"
 *
 * // פורמט תאריך
 * const formatted = formatDate(new Date());
 * // Returns: "01/02/2026"
 */

/**
 * formatCurrency - פורמט מטבע
 *
 * @description פורמט מספר כמטבע עם סימן מטבע ופסיקים
 * @param {number} amount - הסכום
 * @param {string} currency - קוד מטבע (USD, EUR, ILS, וכו')
 * @param {number} decimals - מספר ספרות אחרי הנקודה (default: 2)
 * @returns {string} מחרוזת מפורמטת
 *
 * @example
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 * formatCurrency(1234.56, 'ILS') // "₪1,234.56"
 */
function formatCurrency(amount, currency = 'USD', decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0.${'0'.repeat(decimals)}`;
  }

  const formattedAmount = Number(amount).toFixed(decimals);
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    ILS: '₪',
    GBP: '£',
    JPY: '¥',
    USDT: '₮',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${parts.join('.')}`;
}

/**
 * formatNumber - פורמט מספר
 *
 * @description פורמט מספר עם פסיקים
 * @param {number} number - המספר
 * @param {number} decimals - מספר ספרות אחרי הנקודה (default: 0)
 * @returns {string} מחרוזת מפורמטת
 *
 * @example
 * formatNumber(1234.56) // "1,235"
 * formatNumber(1234.56, 2) // "1,234.56"
 */
function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  const formatted = Number(number).toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

/**
 * formatDate - פורמט תאריך
 *
 * @description פורמט תאריך לפורמט DD/MM/YY (ברירת מחדל במערכת)
 * @param {Date|string} date - תאריך (Date object או מחרוזת)
 * @returns {string} מחרוזת תאריך בפורמט DD/MM/YY
 *
 * @example
 * formatDate(new Date('2026-02-01')) // "01/02/26"
 * formatDate('2026-02-01') // "01/02/26"
 */
function formatDate(date) {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear()).slice(-2); /* yy */

  return `${day}/${month}/${year}`;
}

/**
 * formatPercentage - פורמט אחוז
 *
 * @description פורמט מספר כאחוז
 * @param {number} value - הערך (0-100 או 0-1)
 * @param {number} decimals - מספר ספרות אחרי הנקודה (default: 1)
 * @param {boolean} isDecimal - האם הערך הוא עשרוני (0-1) או אחוז (0-100) (default: false)
 * @returns {string} מחרוזת אחוז
 *
 * @example
 * formatPercentage(3.5) // "3.5%"
 * formatPercentage(0.035, 2, true) // "3.50%"
 */
function formatPercentage(value, decimals = 1, isDecimal = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * formatCurrentPrice - פורמט מחיר נוכחי עם שינוי יומי
 *
 * @description פורמט מחיר נוכחי בפורמט: $155.34(+3.22%)
 * @param {number} price - המחיר הנוכחי
 * @param {number} changePercent - שינוי יומי באחוזים
 * @param {string} currency - קוד מטבע (default: 'USD')
 * @returns {HTMLElement} אלמנט div עם המחיר והשינוי
 *
 * @example
 * formatCurrentPrice(155.34, 3.22, 'USD')
 * // Returns: <div class="current-price-display">
 * //   <span class="numeric-value-positive" dir="ltr">$155.34</span>
 * //   <span class="numeric-value-positive" dir="ltr" style="font-size: 0.85em;">(+3.22%)</span>
 * // </div>
 */
function formatCurrentPrice(price, changePercent, currency = 'USD') {
  const container = document.createElement('div');
  container.className = 'current-price-display';

  const priceSpan = document.createElement('span');
  priceSpan.className =
    changePercent >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
  priceSpan.setAttribute('dir', 'ltr');
  priceSpan.textContent = formatCurrency(price, currency, 2);

  const changeSpan = document.createElement('span');
  changeSpan.className =
    changePercent >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
  changeSpan.setAttribute('dir', 'ltr');
  changeSpan.style.fontSize = '0.85em';
  changeSpan.textContent = `(${changePercent >= 0 ? '+' : ''}${formatPercentage(changePercent, 2)})`;

  container.appendChild(priceSpan);
  container.appendChild(changeSpan);

  return container;
}

/**
 * formatPL - פורמט P/L עם אחוז
 *
 * @description פורמט P/L בפורמט: +$550.0(+3.5%) (סיפרה אחת אחרי הנקודה)
 * @param {number} plValue - ערך P/L
 * @param {number} plPercent - אחוז P/L
 * @param {string} currency - קוד מטבע (default: 'USD')
 * @returns {HTMLElement} אלמנט div עם P/L והאחוז
 *
 * @example
 * formatPL(550.0, 3.5, 'USD')
 * // Returns: <div class="pl-display">
 * //   <span class="pl-value numeric-value-positive" dir="ltr">+$550.0</span>
 * //   <span class="pl-percentage numeric-value-positive" dir="ltr">(+3.5%)</span>
 * // </div>
 */
function formatPL(plValue, plPercent, currency = 'USD') {
  const container = document.createElement('div');
  container.className = 'pl-display';

  const valueSpan = document.createElement('span');
  valueSpan.className = `pl-value ${plValue >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}`;
  valueSpan.setAttribute('dir', 'ltr');
  valueSpan.textContent = `${plValue >= 0 ? '+' : ''}${formatCurrency(plValue, currency, 1)}`;

  const percentSpan = document.createElement('span');
  percentSpan.className = `pl-percentage ${plPercent >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}`;
  percentSpan.setAttribute('dir', 'ltr');
  percentSpan.textContent = `(${plPercent >= 0 ? '+' : ''}${formatPercentage(plPercent, 1)})`;

  container.appendChild(valueSpan);
  container.appendChild(percentSpan);

  return container;
}

/**
 * formatStatusBadge - פורמט באגט סטטוס
 *
 * @description יצירת באגט סטטוס עם עיצוב סטנדרטי
 * @param {string} status - טקסט הסטטוס
 * @param {string} statusCategory - קטגוריית סטטוס (active, inactive, long, short)
 * @returns {HTMLElement} אלמנט span עם באגט סטטוס
 *
 * @example
 * formatStatusBadge('פעיל', 'active')
 * // Returns: <span class="phoenix-table__status-badge phoenix-table__status-badge--active">פעיל</span>
 */
function formatStatusBadge(status, statusCategory = 'active') {
  const badge = document.createElement('span');
  badge.className = `phoenix-table__status-badge phoenix-table__status-badge--${statusCategory}`;
  badge.textContent = status;
  badge.setAttribute('data-status-category', statusCategory);
  return badge;
}

/**
 * formatStatusBadgeFromCanonical - באגט סטטוס מערך קנוני (SSOT)
 * @param {string} canonicalValue - ערך קנוני (active|inactive|pending|cancelled)
 * @param {string} statusCategory - קטגוריה לעיצוב (default: same as value)
 * @returns {HTMLElement} אלמנט span עם באגט סטטוס
 */
function formatStatusBadgeFromCanonical(canonicalValue, statusCategory = null) {
  const category = statusCategory ?? canonicalValue ?? 'active';
  const label = toHebrewStatus(canonicalValue || '');
  return formatStatusBadge(label, category);
}

/**
 * formatOperationTypeBadge - פורמט באגט סוג פעולה
 *
 * @description יצירת באגט סוג פעולה עם מניפת צבעים
 * @param {string} operationType - סוג פעולה (deposit, withdrawal, transfer, execution)
 * @param {boolean} isPositive - האם הפעולה חיובית (default: true)
 * @returns {HTMLElement} אלמנט span עם באגט סוג פעולה
 *
 * @example
 * formatOperationTypeBadge('deposit', true)
 * // Returns: <span class="operation-type-badge" data-operation-type="deposit" data-type-positive="true">הפקדה</span>
 */
function formatOperationTypeBadge(operationType, isPositive = true) {
  const badge = document.createElement('span');
  badge.className = 'operation-type-badge';
  badge.setAttribute('data-operation-type', operationType);
  badge.setAttribute('data-type-positive', String(isPositive));

  const operationLabels = {
    deposit: 'הפקדה',
    withdrawal: 'משיכה',
    transfer: 'העברה',
    execution: 'ביצוע',
  };

  badge.textContent = operationLabels[operationType] || operationType;
  return badge;
}

/**
 * formatNumericValue - פורמט ערך מספרי עם צבע
 *
 * @description פורמט ערך מספרי עם צבע חיובי/שלילי/אפס
 * @param {number} value - הערך המספרי
 * @param {string} currency - קוד מטבע (אופציונלי)
 * @param {number} decimals - מספר ספרות אחרי הנקודה (default: 2)
 * @returns {HTMLElement} אלמנט span עם הערך המפורמט
 *
 * @example
 * formatNumericValue(1234.56, 'USD')
 * // Returns: <span class="numeric-value-positive" dir="ltr">$1,234.56</span>
 */
function formatNumericValue(value, currency = null, decimals = 2) {
  const span = document.createElement('span');

  if (value > 0) {
    span.className = 'numeric-value-positive';
  } else if (value < 0) {
    span.className = 'numeric-value-negative';
  } else {
    span.className = 'numeric-value-zero';
  }

  span.setAttribute('dir', 'ltr');

  if (currency) {
    span.textContent = formatCurrency(value, currency, decimals);
  } else {
    span.textContent = formatNumber(value, decimals);
  }

  return span;
}

/**
 * formatCommissionValue - פורמט ערך עמלה
 *
 * @description פורמט ערך עמלה לפי סוג העמלה (Tiered, Flat, Percentage, Fixed)
 * @param {string|number} value - ערך העמלה (מחרוזת או מספר)
 * @param {string} commissionType - סוג עמלה (tiered, flat, percentage, fixed)
 * @returns {string} מחרוזת מפורמטת
 *
 * @example
 * formatCommissionValue('0.0035', 'tiered') // "0.0035 $ / Share"
 * formatCommissionValue('0.02', 'flat') // "0.02 % / Volume"
 * formatCommissionValue(10, 'fixed') // "$10.00"
 */
function formatCommissionValue(value, commissionType = '') {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const type = (commissionType || '').toLowerCase();

  // Convert to number if it's a string (for backward compatibility)
  // commission_value is now NUMERIC(20,6) - should be a number from API
  const numValue =
    typeof value === 'string' &&
    (value.includes('/') || value.includes('%') || value.includes('$'))
      ? value // Already formatted string - return as is (backward compatibility)
      : Number(value) || 0;

  // Format based on commission type
  if (type === 'tiered') {
    return `${numValue} $ / Share`;
  } else if (type === 'flat') {
    return `${numValue} % / Volume`;
  } else if (type === 'percentage') {
    return `${numValue} % / Volume`;
  } else if (type === 'fixed') {
    return formatCurrency(numValue, 'USD', 2);
  }

  // Default: return as string with value
  return String(numValue);
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    formatCurrentPrice,
    formatPL,
    formatStatusBadge,
    formatStatusBadgeFromCanonical,
    formatOperationTypeBadge,
    formatNumericValue,
    formatCommissionValue,
    formatDailyChange,
    formatDailyChangeFromAbsolute,
  };
}

// Global export for use in HTML files
window.tableFormatters = {
  formatCurrency,
  formatNumber,
  formatDate,
  formatPercentage,
  formatCurrentPrice,
  formatPL,
  formatStatusBadge,
  formatStatusBadgeFromCanonical,
  formatOperationTypeBadge,
  formatNumericValue,
  formatCommissionValue,
  formatDailyChange,
  formatDailyChangeFromAbsolute,
};
