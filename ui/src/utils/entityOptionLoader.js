/**
 * Entity Option Loader — Phase C S002-P003-WP002
 * --------------------------------------------------------
 * Shared utility to load dropdown options for entity-linked fields.
 * Used by D34 (alerts target_id), D35 (notes parent_id).
 *
 * Entity types: account | ticker | trade | trade_plan
 * Backend contract:
 *   - account     → GET /trading_accounts
 *   - ticker      → GET /me/tickers
 *   - trade       → GET /trades (Phase C carryover)
 *   - trade_plan  → GET /trade_plans (Phase C carryover)
 */

import sharedServices from '../components/core/sharedServices.js';
import { maskedLog } from './maskedLog.js';

/**
 * Load trade options (Phase C carryover — GET /trades)
 */
async function loadTradeOptions() {
  try {
    const res = await sharedServices.get('/trades', { limit: 500 });
    const data = res?.data ?? res ?? [];
    const arr = Array.isArray(data) ? data : [];
    return arr.map((t) => ({
      value: String(t.id ?? t.external_ulid ?? ''),
      label: (t.label ?? '').trim() || t.id || '—'
    })).filter((o) => o.value);
  } catch (e) {
    maskedLog('[entityOptionLoader] trades error:', { status: e?.status });
    return [];
  }
}

/**
 * Load trade plan options (Phase C carryover — GET /trade_plans)
 */
async function loadTradePlanOptions() {
  try {
    const res = await sharedServices.get('/trade_plans', { limit: 500 });
    const data = res?.data ?? res ?? [];
    const arr = Array.isArray(data) ? data : [];
    return arr.map((t) => ({
      value: String(t.id ?? t.external_ulid ?? ''),
      label: (t.label ?? '').trim() || t.id || '—'
    })).filter((o) => o.value);
  } catch (e) {
    maskedLog('[entityOptionLoader] trade_plans error:', { status: e?.status });
    return [];
  }
}

/**
 * Load entity options by entity type
 * @param {string} entityType - account | ticker | trade | trade_plan
 * @returns {Promise<Array<{value: string, label: string}>>}
 */
export async function loadEntityOptions(entityType) {
  if (!entityType || typeof entityType !== 'string') return [];
  const type = entityType.toLowerCase().trim();

  try {
    await sharedServices.init();
  } catch (e) {
    maskedLog('[entityOptionLoader] init failed:', { entityType: type });
    return [];
  }

  switch (type) {
    case 'account':
      return loadTradingAccountOptions();
    case 'ticker':
      return loadUserTickerOptions();
    case 'trade':
      return loadTradeOptions();
    case 'trade_plan':
      return loadTradePlanOptions();
    default:
      return [];
  }
}

async function loadTradingAccountOptions() {
  try {
    const res = await sharedServices.get('/trading_accounts', {});
    const data = res?.data ?? res ?? [];
    const arr = Array.isArray(data) ? data : [];
    return arr.map((a) => ({
      value: String(a.id ?? a.external_ulid ?? ''),
      label: (a.account_name ?? a.accountName ?? a.name ?? '').trim() || a.id || '—'
    })).filter((o) => o.value);
  } catch (e) {
    maskedLog('[entityOptionLoader] trading_accounts error:', { status: e?.status });
    return [];
  }
}

async function loadUserTickerOptions() {
  try {
    const res = await sharedServices.get('/me/tickers', {});
    const data = res?.data ?? res ?? [];
    const arr = Array.isArray(data) ? data : [];
    return arr.map((t) => ({
      value: String(t.id ?? t.external_ulid ?? t.ticker_id ?? ''),
      label: (t.symbol ?? t.ticker_symbol ?? t.name ?? '').trim() || t.id || '—'
    })).filter((o) => o.value);
  } catch (e) {
    maskedLog('[entityOptionLoader] me/tickers error:', { status: e?.status });
    return [];
  }
}

/**
 * Load options when parent_type changes (for D35 notes form)
 * @param {string} parentType - account | ticker | trade | trade_plan
 * @returns {Promise<Array<{value: string, label: string}>>}
 */
export async function loadOptionsForParentType(parentType) {
  return loadEntityOptions(parentType);
}
