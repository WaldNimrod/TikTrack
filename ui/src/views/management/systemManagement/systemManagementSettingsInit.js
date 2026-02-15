/**
 * System Management Settings Init — Market Data Settings (MD-SETTINGS)
 * TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE
 * TEAM_20_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_COORDINATION
 *
 * GET /settings/market-data — טעינה
 * PATCH /settings/market-data — שמירה (Admin-only)
 * הצגת שגיאות 400/403/422; state reload אחרי שמירה.
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const FIELDS = [
  { key: 'max_active_tickers', label: 'מקסימום טיקרים פעילים (Intraday)', type: 'number', min: 1, max: 500, default: 50 },
  { key: 'intraday_interval_minutes', label: 'מרווח Intraday (דקות)', type: 'number', min: 5, max: 240, default: 15 },
  { key: 'provider_cooldown_minutes', label: 'זמן Cooldown אחרי 429 (דקות)', type: 'number', min: 5, max: 120, default: 15 },
  { key: 'max_symbols_per_request', label: 'מקסימום סימבולים לבקשה', type: 'number', min: 1, max: 50, default: 5 },
  { key: 'delay_between_symbols_seconds', label: 'רווח (שניות) בין סימבולים', type: 'number', min: 0, max: 30, default: 0 },
  { key: 'intraday_enabled', label: 'הפעלת רענון Intraday', type: 'boolean', default: true },
];

const ERROR_MESSAGES = {
  403: 'אין הרשאה — נדרש תפקיד Admin.',
  500: 'שגיאה בשמירה. נסה שוב.',
  503: 'הגדרות עדיין לא זמינות. יש לתאם עם DevOps.',
};

let currentValues = {};

async function loadSettings() {
  const container = document.getElementById('marketDataSettingsValues');
  const errorEl = document.getElementById('marketDataSettingsError');
  const successEl = document.getElementById('marketDataSettingsSuccess');
  if (!container) return;

  if (errorEl) errorEl.textContent = '';
  if (successEl) successEl.textContent = '';

  try {
    await sharedServices.init();
    const res = await sharedServices.get('/settings/market-data', {});
    const data = res?.data ?? res;
    if (!data || typeof data !== 'object') throw new Error('No data');

    currentValues = { ...data };
    renderForm(container, data);
  } catch (e) {
    maskedLog('[System Management] Failed to load market-data settings:', e);
    const msg = e.status === 403 ? ERROR_MESSAGES[403] : (e.status === 503 ? ERROR_MESSAGES[503] : 'לא ניתן לטעון הגדרות. יש לבדוק חיבור ל-Backend.');
    container.innerHTML = `<p class="settings-error">${msg}</p>`;
  }
}

function renderForm(container, data) {
  container.innerHTML = '';
  const form = document.createElement('form');
  form.className = 'market-data-settings-form';
  form.id = 'marketDataSettingsForm';

  FIELDS.forEach((f) => {
    const row = document.createElement('div');
    row.className = 'settings-row settings-row--editable';

    if (f.type === 'boolean') {
      const checked = data[f.key] === true || data[f.key] === 'true';
      row.innerHTML = `
        <label class="settings-row__label" for="md-${f.key}">${f.label}</label>
        <div class="settings-row__input-wrap">
          <input type="checkbox" id="md-${f.key}" name="${f.key}" data-key="${f.key}" ${checked ? 'checked' : ''} class="js-market-data-input" />
        </div>
      `;
    } else {
      const val = data[f.key] ?? f.default;
      row.innerHTML = `
        <label class="settings-row__label" for="md-${f.key}">${f.label} <span class="settings-row__hint">(${f.min}–${f.max})</span></label>
        <div class="settings-row__input-wrap">
          <input type="number" id="md-${f.key}" name="${f.key}" data-key="${f.key}" 
            min="${f.min}" max="${f.max}" value="${Number(val) ?? f.default}" 
            class="js-market-data-input" />
        </div>
      `;
    }
    form.appendChild(row);
  });

  const actions = document.createElement('div');
  actions.className = 'settings-actions';
  actions.innerHTML = `<button type="submit" class="btn btn-primary js-save-market-data">שמור הגדרות</button>`;
  form.appendChild(actions);

  form.addEventListener('submit', handleSave);
  container.appendChild(form);
}

async function handleSave(ev) {
  ev.preventDefault();
  const form = document.getElementById('marketDataSettingsForm');
  const errorEl = document.getElementById('marketDataSettingsError');
  const successEl = document.getElementById('marketDataSettingsSuccess');
  const btn = form?.querySelector('.js-save-market-data');
  if (!form || !btn) return;

  if (errorEl) errorEl.textContent = '';
  if (successEl) successEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'שומר...';

  const payload = {};
  const inputs = form.querySelectorAll('.js-market-data-input');
  inputs.forEach((input) => {
    const key = input.dataset.key;
    const field = FIELDS.find((f) => f.key === key);
    if (!field) return;
    if (field.type === 'boolean') {
      if (input.checked !== (currentValues[key] === true || currentValues[key] === 'true')) {
        payload[key] = input.checked;
      }
    } else {
      const num = Number(input.value);
      if (!Number.isNaN(num) && num !== Number(currentValues[key])) payload[key] = num;
    }
  });

  if (Object.keys(payload).length === 0) {
    if (errorEl) errorEl.textContent = 'לא בוצעו שינויים.';
    btn.disabled = false;
    btn.textContent = 'שמור הגדרות';
    return;
  }

  try {
    await sharedServices.init();
    const res = await sharedServices.patch('/settings/market-data', payload);
    const data = res?.data ?? res;
    if (data && typeof data === 'object') {
      currentValues = { ...currentValues, ...data };
    }
    if (successEl) successEl.textContent = 'נשמר בהצלחה.';
    renderForm(document.getElementById('marketDataSettingsValues'), currentValues);
    const newForm = document.getElementById('marketDataSettingsForm');
    if (newForm) newForm.addEventListener('submit', handleSave);
  } catch (e) {
    maskedLog('[System Management] PATCH market-data failed:', e);
    let msg = ERROR_MESSAGES[e.status] ?? 'שגיאה בשמירה. נסה שוב.';
    if (e.status === 422 && e.validation_errors?.length) {
      msg = e.validation_errors.map((v) => `${v.key}: ${v.error}`).join('; ');
    } else if (e.status === 422 && e.detail) {
      const d = typeof e.detail === 'string' ? e.detail : e.detail?.message ?? JSON.stringify(e.detail);
      msg = d;
    }
    if (errorEl) errorEl.textContent = msg;
  } finally {
    btn.disabled = false;
    btn.textContent = 'שמור הגדרות';
  }
}

(async function initSystemManagementSettings() {
  'use strict';

  const panel = document.getElementById('marketDataSettingsPanel');
  if (!panel) return;

  const errorEl = document.createElement('div');
  errorEl.id = 'marketDataSettingsError';
  errorEl.className = 'settings-error';
  errorEl.setAttribute('aria-live', 'polite');
  panel.insertBefore(errorEl, panel.querySelector('.settings-note'));

  const successEl = document.createElement('div');
  successEl.id = 'marketDataSettingsSuccess';
  successEl.className = 'settings-success';
  successEl.setAttribute('aria-live', 'polite');
  panel.insertBefore(successEl, panel.querySelector('.settings-note'));

  await loadSettings();
})();
