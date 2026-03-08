/**
 * Price Reliability Labels — PHASE_2 (Price Reliability)
 * -----------------------------------------------------
 * Hebrew labels for price_source and formatting for as-of timestamps.
 * Per: TEAM_10_TO_TEAM_30_PRICE_RELIABILITY_PHASE2_MANDATE,
 *      TEAM_20_TO_TEAM_30_PRICE_RELIABILITY_PHASE2_API_READY
 *
 * price_source values: EOD | EOD_STALE | INTRADAY_FALLBACK
 */

const SOURCE_LABELS = {
  EOD: 'סגירה',
  EOD_STALE: 'סגירה (ישן)',
  INTRADAY_FALLBACK: 'תוך־יומי'
};

/**
 * Get Hebrew label for price_source
 * @param {string} source - price_source from API (EOD | EOD_STALE | INTRADAY_FALLBACK)
 * @returns {string} Hebrew label for display
 */
export function getPriceSourceLabel(source) {
  if (!source) return '—';
  return SOURCE_LABELS[source] ?? source;
}

/**
 * Format price_as_of_utc or last_close_as_of_utc for display
 * @param {string|null} iso8601 - ISO8601 timestamp
 * @returns {string} Formatted date or '—'
 */
export function formatPriceAsOf(iso8601) {
  if (!iso8601) return '—';
  try {
    const d = new Date(iso8601);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}

/**
 * Check if price_source indicates stale data (EOD_STALE)
 * @param {string} source - price_source
 * @returns {boolean}
 */
export function isStalePriceSource(source) {
  return source === 'EOD_STALE';
}
