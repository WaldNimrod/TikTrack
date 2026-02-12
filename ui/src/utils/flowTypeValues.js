/**
 * Flow Type Values — SSOT for cash flow types (D21)
 * Ref: documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md
 * Team 20: CURRENCY_CONVERSION — identifier for currency conversion (not OTHER)
 */

export const FLOW_TYPE_VALUES = [
  { value: 'DEPOSIT', label: 'הפקדה' },
  { value: 'WITHDRAWAL', label: 'משיכה' },
  { value: 'DIVIDEND', label: 'דיבידנד' },
  { value: 'INTEREST', label: 'ריבית' },
  { value: 'FEE', label: 'עמלה' },
  { value: 'CURRENCY_CONVERSION', label: 'המרת מטבע' },
  { value: 'OTHER', label: 'אחר' }
];

/** Map: value → label (UI display) */
const valueToLabel = new Map(FLOW_TYPE_VALUES.map(f => [f.value, f.label]));
const valueToLabelLower = new Map(FLOW_TYPE_VALUES.map(f => [f.value.toLowerCase(), f.label]));

/**
 * Get Hebrew label for flow_type (case-insensitive)
 * @param {string} value - flow_type (DEPOSIT, CURRENCY_CONVERSION, etc.)
 * @returns {string}
 */
export function toFlowTypeLabel(value) {
  if (!value || typeof value !== 'string') return '';
  return valueToLabel.get(value) ?? valueToLabelLower.get(value.toLowerCase()) ?? value;
}

/** Get all options for dropdowns (order preserved) */
export function getFlowTypeOptions() {
  return [...FLOW_TYPE_VALUES];
}
