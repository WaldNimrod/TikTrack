/**
 * formatChange — SSOT for daily-change display across the system
 * -----------------------------------------------------
 * תמיד: אחוז ואז בסוגריים מספר — לדוגמה 5%(34$) או -0.01%(0.02$)
 */

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  ILS: '₪',
  GBP: '£',
  JPY: '¥',
  USDT: '₮',
};

function formatAmount(amount, currency = 'USD') {
  if (amount == null || isNaN(amount)) return '0.00';
  const sym = CURRENCY_SYMBOLS[currency?.toUpperCase?.()] ?? currency ?? '$';
  const n = Number(amount);
  return `${sym}${Math.abs(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format daily change — אחוז ואז בסוגריים סכום: 5%(34$) או -0.01%(0.02$)
 * SSOT לכל מקום שמציג שינוי יומי במערכת
 *
 * @param {number|null} pct - אחוז שינוי (daily_change_pct)
 * @param {number|null} currentPrice - מחיר נוכחי (או null כשמשתמשים ב־absoluteAmount)
 * @param {number|null} lastClosePrice - מחיר סגירה קודם (או absoluteAmount כש־currentPrice הוא null)
 * @param {string} [currency='USD'] - מטבע
 * @returns {string}
 */
export function formatDailyChange(
  pct,
  currentPrice,
  lastClosePrice,
  currency = 'USD',
) {
  const pctNum = pct != null ? Number(pct) : null;
  const curr = currentPrice != null ? Number(currentPrice) : null;
  const last = lastClosePrice != null ? Number(lastClosePrice) : null;
  let absAmount = null;
  if (curr != null && last != null) absAmount = curr - last;
  else if (pctNum != null && last != null) absAmount = (pctNum / 100) * last;
  if (pctNum == null && absAmount == null) return '—';
  const sign = (pctNum ?? (absAmount >= 0 ? 0 : -0)) >= 0 ? '+' : '';
  const pctStr = pctNum != null ? `${sign}${pctNum.toFixed(2)}%` : '—';
  const amountStr = absAmount != null ? formatAmount(absAmount, currency) : '';
  return amountStr ? `${pctStr}(${amountStr})` : pctStr;
}

/**
 * Format daily change when absolute amount is known (e.g. positions)
 * @param {number|null} pct - אחוז שינוי
 * @param {number|null} absoluteAmount - שינוי מוחלט במטבע
 * @param {string} [currency='USD'] - מטבע
 */
export function formatDailyChangeFromAbsolute(
  pct,
  absoluteAmount,
  currency = 'USD',
) {
  const pctNum = pct != null ? Number(pct) : null;
  const abs = absoluteAmount != null ? Number(absoluteAmount) : null;
  if (pctNum == null && abs == null) return '—';
  const sign = (pctNum ?? (abs >= 0 ? 0 : -0)) >= 0 ? '+' : '';
  const pctStr = pctNum != null ? `${sign}${pctNum.toFixed(2)}%` : '—';
  const amountStr = abs != null ? formatAmount(abs, currency) : '';
  return amountStr ? `${pctStr}(${amountStr})` : pctStr;
}
