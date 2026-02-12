/**
 * System Status Values — Single Source (SSOT → Code)
 * SSOT: documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md
 *
 * ⛔ אסור: רשימות מקומיות במודולים; תרגום עברי ידני; חריגים ללא אישור SSOT.
 * ✅ חובה: כל שימוש בסטטוס עובר דרך statusAdapter.js בלבד.
 */

export const STATUS_VALUES = [
  { value: 'pending', label: 'ממתין' },
  { value: 'active', label: 'פתוח' },
  { value: 'inactive', label: 'סגור' },
  { value: 'cancelled', label: 'מבוטל' }
];

/** Canonical values only (for API/DB) */
export const STATUS_CANONICAL = STATUS_VALUES.map(s => s.value);

/** Hebrew labels only (for display/filter UI) */
export const STATUS_LABELS_HE = STATUS_VALUES.map(s => s.label);
