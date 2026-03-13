/**
 * Flow Type Values — SSOT for cash flow types (D21)
 * Ref: documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md
 * Team 20: CURRENCY_CONVERSION — identifier for currency conversion (not OTHER)
 *
 * Flow Type → Entity Color Mapping (סוג תנועה → צבע ישות):
 * SSOT for badge styling — each flow type uses an entity color from DNA scale.
 */

export const FLOW_TYPE_VALUES = [
  { value: 'DEPOSIT', label: 'הפקדה' },
  { value: 'WITHDRAWAL', label: 'משיכה' },
  { value: 'DIVIDEND', label: 'דיבידנד' },
  { value: 'INTEREST', label: 'ריבית' },
  { value: 'FEE', label: 'עמלה' },
  { value: 'CURRENCY_CONVERSION', label: 'המרת מטבע' },
  { value: 'OTHER', label: 'אחר' },
];

/**
 * Flow Type → Entity mapping for badge colors (סוג → ישות)
 * Used by operation-type-badge for consistent entity-scale styling.
 */
export const FLOW_TYPE_ENTITY_MAP = {
  DEPOSIT: 'trading_account', // הפקדה → חשבון מסחר
  WITHDRAWAL: 'alert', // משיכה → אזהרה/יציאה
  DIVIDEND: 'ticker', // דיבידנד → מניות/השקעות
  INTEREST: 'research', // ריבית → פאסיבי/מחקר
  FEE: 'alert', // עמלה → עלות
  CURRENCY_CONVERSION: 'execution', // המרת מטבע → ביצוע טכני
  OTHER: 'note', // אחר → ניטרלי
  // Legacy/alias
  TRANSFER: 'execution',
};

/** Map: value → label (UI display) */
const valueToLabel = new Map(FLOW_TYPE_VALUES.map((f) => [f.value, f.label]));
const valueToLabelLower = new Map(
  FLOW_TYPE_VALUES.map((f) => [f.value.toLowerCase(), f.label]),
);

/**
 * Get Hebrew label for flow_type (case-insensitive)
 * @param {string} value - flow_type (DEPOSIT, CURRENCY_CONVERSION, etc.)
 * @returns {string}
 */
export function toFlowTypeLabel(value) {
  if (!value || typeof value !== 'string') return '';
  return (
    valueToLabel.get(value) ??
    valueToLabelLower.get(value.toLowerCase()) ??
    value
  );
}

/**
 * Get entity name for flow_type (for badge data-entity attribute)
 * @param {string} value - flow_type (DEPOSIT, CURRENCY_CONVERSION, etc.)
 * @returns {string} entity name (trading_account, alert, ticker, research, execution, note)
 */
export function getFlowTypeEntity(value) {
  if (!value || typeof value !== 'string') return 'note';
  const key = value.toUpperCase().replace(/-/g, '_');
  return FLOW_TYPE_ENTITY_MAP[key] ?? FLOW_TYPE_ENTITY_MAP[value] ?? 'note';
}

/** Get all options for dropdowns (order preserved) */
export function getFlowTypeOptions() {
  return [...FLOW_TYPE_VALUES];
}
