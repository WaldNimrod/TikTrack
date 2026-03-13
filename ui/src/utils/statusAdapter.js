/**
 * Status Adapter — Single point of use for system status values.
 * SSOT: documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md
 * Source: ui/src/utils/statusValues.js
 *
 * כל מקום שמציג/מסנן סטטוסים חייב להשתמש ב-Adapter בלבד (Header filter, DataLoaders, badges, PhoenixFilterBridge).
 */

import { STATUS_VALUES } from './statusValues.js';

const valueToLabel = new Map(STATUS_VALUES.map((s) => [s.value, s.label]));
const labelToValue = new Map(STATUS_VALUES.map((s) => [s.label, s.value]));

/**
 * @param {string} label - עברית (פתוח / סגור / ממתין / מבוטל)
 * @returns {string|null} ערך קנוני (active|inactive|pending|cancelled) או null אם לא נמצא
 */
export function toCanonicalStatus(label) {
  if (label == null || label === '' || label === 'הכול' || label === 'כל סטטוס')
    return null;
  return labelToValue.get(label) ?? null;
}

/**
 * Normalize status to canonical — accepts Hebrew or canonical, returns canonical
 * @param {string} value - עברית או קנוני
 * @returns {string|null}
 */
export function normalizeToCanonicalStatus(value) {
  if (value == null || value === '' || value === 'הכול' || value === 'כל סטטוס')
    return null;
  if (valueToLabel.has(value)) return value; // already canonical
  return labelToValue.get(value) ?? null;
}

/**
 * @param {string} value - ערך קנוני (active|inactive|pending|cancelled)
 * @returns {string} תרגום עברית לתצוגה
 */
export function toHebrewStatus(value) {
  if (value == null || value === '') return '';
  return valueToLabel.get(value) ?? value;
}

/**
 * @returns {Array<{value: string, label: string}>} אופציות לסינון/תצוגה (כולל לכולם: הכול מנוהל בנפרד ב-UI)
 */
export function getStatusOptions() {
  return [...STATUS_VALUES];
}

export { STATUS_VALUES } from './statusValues.js';

/* Expose to window for Vanilla JS (phoenixFilterBridge, etc.) */
if (typeof window !== 'undefined') {
  window.statusAdapter = {
    toCanonicalStatus,
    toHebrewStatus,
    getStatusOptions,
    normalizeToCanonicalStatus,
  };
}
