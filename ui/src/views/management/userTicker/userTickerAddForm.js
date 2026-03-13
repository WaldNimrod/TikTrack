/**
 * User Ticker Add Form - הוספת טיקר לרשימה שלי
 * Supports: add existing ticker (select) + add new ticker inline (symbol → POST)
 * Per brief: provider failure → show error, do NOT create ticker in UI
 * Per TEAM_10_TO_TEAM_30_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE:
 * - סוג נכס (STOCK/CRYPTO)
 * - Market (קריפטו בלבד)
 * - בורסה/סיומת (מניות אירופאיות, TASE)
 */

import {
  createModal,
  closeModal,
} from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { reactToApi } from '../../../cubes/shared/utils/transformers.js';

const PROVIDER_ERROR_MSG =
  'אין נתונים זמינים מהספק עבור טיקר זה. לא ניתן ליצור טיקר.';
const GENERIC_ERROR_MSG = 'שגיאה בהוספת הטיקר. נסה שוב.';

/** Exchange suffixes (Yahoo format) — SSOT: WP_20_09, TEAM_10 corrective */
const EXCHANGE_OPTIONS = [
  { value: '', label: '— ברירת מחדל (NASDAQ/NYSE) —' },
  { value: '.TA', label: 'תל אביב (TASE)' },
  { value: '.MI', label: 'מילאנו (Milan)' },
  { value: '.L', label: 'לונדון (LSE)' },
];

/** Build form HTML with two modes: add existing (select) + add new (inline symbol + type + market + exchange) */
function createAddFormHTML(availableTickers, userTickerIds) {
  const existingOptions = (availableTickers || [])
    .filter((t) => {
      const id = t.id ?? t.external_ulid;
      return id && !userTickerIds.includes(id);
    })
    .map((t) => {
      const id = t.id ?? t.external_ulid;
      const sym = t.symbol ?? '';
      const name = t.company_name ?? t.companyName ?? '';
      return `<option value="${id}">${sym}${name ? ` — ${name}` : ''}</option>`;
    })
    .join('');

  const exchangeOptionsHtml = EXCHANGE_OPTIONS.map(
    (o) => `<option value="${o.value}">${o.label}</option>`,
  ).join('');

  return `
    <form id="userTickerAddForm" class="phoenix-form phoenix-form--two-col">
      <div class="form-row">
        <div class="form-group">
          <label>הוסף טיקר קיים</label>
          <select id="userTickerExistingSelect" class="phoenix-form__select">
            <option value="">— לבחור טיקר —</option>
            ${existingOptions}
          </select>
        </div>
      </div>
      <div class="form-row form-row--divider">
        <span class="form-divider-text">או</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="userTickerNewSymbol">טיקר חדש — הזן סמל</label>
          <input 
            type="text" 
            id="userTickerNewSymbol" 
            name="symbol" 
            maxlength="20"
            placeholder="AAPL"
          />
          <span class="form-error" id="userTickerNewSymbolError"></span>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="userTickerAssetType">סוג נכס</label>
          <select id="userTickerAssetType" class="phoenix-form__select" name="ticker_type">
            <option value="STOCK" selected>מניה (STOCK)</option>
            <option value="CRYPTO">קריפטו (CRYPTO)</option>
            <option value="ETF">ETF</option>
          </select>
        </div>
        <div class="form-group" id="userTickerMarketGroup" style="display:none;">
          <label for="userTickerMarket">Market (קריפטו)</label>
          <select id="userTickerMarket" class="phoenix-form__select" name="market">
            <option value="USD" selected>USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <div class="form-row" id="userTickerExchangeRow">
        <div class="form-group">
          <label for="userTickerExchange">בורסה / סיומת</label>
          <select id="userTickerExchange" class="phoenix-form__select" name="exchange_suffix">
            ${exchangeOptionsHtml}
          </select>
        </div>
      </div>
      <div class="form-row" id="userTickerFormError" style="display:none;">
        <div class="form-error form-error--block" id="userTickerFormErrorText"></div>
      </div>
    </form>
  `;
}

/**
 * Show add ticker modal
 * @param {Object} options
 * @param {Array} options.availableTickers - Tickers from GET /tickers (for "add existing")
 * @param {Array<string>} options.userTickerIds - IDs already in user's list (to filter select)
 * @param {Function} options.onSuccess - Callback after successful add
 */
export function showUserTickerAddModal(options = {}) {
  const {
    availableTickers = [],
    userTickerIds = [],
    onSuccess = null,
  } = options;

  const formHTML = createAddFormHTML(availableTickers, userTickerIds);

  createModal({
    title: 'הוסף טיקר לרשימה שלי',
    content: formHTML,
    entity: 'user_tickers',
    showSaveButton: true,
    saveButtonText: 'הוספה',
    cancelButtonText: 'ביטול',
    onSave: async function () {
      const form = document.getElementById('userTickerAddForm');
      if (!form) return;

      const existingSelect = document.getElementById(
        'userTickerExistingSelect',
      );
      const newSymbolInput = document.getElementById('userTickerNewSymbol');
      const assetTypeSelect = document.getElementById('userTickerAssetType');
      const marketSelect = document.getElementById('userTickerMarket');
      const exchangeSelect = document.getElementById('userTickerExchange');
      const errBlock = document.getElementById('userTickerFormError');
      const errText = document.getElementById('userTickerFormErrorText');
      const symbolErr = document.getElementById('userTickerNewSymbolError');

      if (errBlock) errBlock.style.display = 'none';
      if (errText) errText.textContent = '';
      if (symbolErr) symbolErr.textContent = '';

      const existingId = existingSelect?.value?.trim() || null;
      let newSymbol = newSymbolInput?.value?.trim().toUpperCase() || null;
      const tickerType = assetTypeSelect?.value || 'STOCK';
      const market = marketSelect?.value || 'USD';
      const exchangeSuffix = exchangeSelect?.value?.trim() || '';

      // Append exchange suffix to symbol when adding new ticker (e.g. ANAU + .MI → ANAU.MI)
      if (newSymbol && exchangeSuffix) {
        newSymbol = newSymbol + exchangeSuffix;
      }

      if (!existingId && !newSymbol) {
        if (symbolErr)
          symbolErr.textContent = 'לבחור טיקר קיים או להזין סמל לטיקר חדש';
        return;
      }

      if (existingId && newSymbol) {
        if (symbolErr)
          symbolErr.textContent =
            'לבחור אפשרות אחת בלבד — טיקר קיים או טיקר חדש';
        return;
      }

      let payload = {};
      if (existingId) {
        payload = { ticker_id: existingId };
      } else {
        payload = {
          symbol: newSymbol,
          ticker_type: tickerType,
          market: tickerType === 'CRYPTO' ? market : undefined,
        };
        // Remove undefined for query params
        if (payload.market === undefined) delete payload.market;
      }

      try {
        await sharedServices.init();
        const apiPayload = reactToApi(payload);
        await sharedServices.post('/me/tickers', apiPayload, {
          useQueryParams: true,
        });
        closeModal();
        if (typeof onSuccess === 'function') onSuccess();
      } catch (error) {
        maskedLog('[UserTicker Add] Error:', {
          status: error?.status,
          code: error?.code,
          detail: error?.detail,
        });
        const status = error?.status;
        const detail = String(
          error?.detail ??
            error?.message ??
            error?.message_i18n ??
            error?.details ??
            '',
        ).toLowerCase();
        const isProviderFailure =
          status >= 400 &&
          status < 500 &&
          (detail.includes('provider') ||
            detail.includes('ספק') ||
            detail.includes('data') ||
            detail.includes('אין נתונים') ||
            detail.includes('no data') ||
            detail.includes('failed') ||
            detail.includes('fetch') ||
            detail.includes('unavailable') ||
            detail.includes('לא זמין'));
        const apiMsg = (
          error?.message ??
          error?.message_i18n ??
          error?.detail ??
          ''
        ).trim();
        const msg = isProviderFailure
          ? PROVIDER_ERROR_MSG
          : apiMsg || GENERIC_ERROR_MSG;

        if (errBlock && errText) {
          errText.textContent = msg;
          errBlock.style.display = 'block';
        } else if (symbolErr) {
          symbolErr.textContent = msg;
        } else {
          createModal({
            title: 'שגיאה',
            content: `<p>${msg.replace(/</g, '&lt;')}</p>`,
            showSaveButton: false,
            cancelButtonText: 'ביטול',
          });
        }
      }
    },
    onClose: function () {},
  });

  // Bind asset-type change → show/hide Market field (CRYPTO only)
  const assetTypeEl = document.getElementById('userTickerAssetType');
  const marketGroupEl = document.getElementById('userTickerMarketGroup');
  const exchangeRowEl = document.getElementById('userTickerExchangeRow');
  if (assetTypeEl && marketGroupEl) {
    const toggle = () => {
      const isCrypto = assetTypeEl.value === 'CRYPTO';
      marketGroupEl.style.display = isCrypto ? 'block' : 'none';
      // Show exchange for STOCK/ETF when adding new; hide for CRYPTO (market handles it)
      if (exchangeRowEl)
        exchangeRowEl.style.display = isCrypto ? 'none' : 'block';
    };
    assetTypeEl.addEventListener('change', toggle);
    toggle(); // initial
  }
}
