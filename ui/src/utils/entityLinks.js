/**
 * Entity Links — T50-1: קישור למודול פרטים
 * Maps entity type + id to detail page URL for linked-object badges
 */
const ENTITY_LINK_MAP = {
  ticker: (id) =>
    id ? `/ticker_dashboard.html?ticker_id=${encodeURIComponent(id)}` : null,
  account: (id) =>
    id ? `/trading_accounts.html#account-${encodeURIComponent(id)}` : null,
  trading_account: (id) =>
    id ? `/trading_accounts.html#account-${encodeURIComponent(id)}` : null,
  trade: (id) =>
    id ? `/trades.html?trade_id=${encodeURIComponent(id)}` : null,
  trade_plan: (id) =>
    id ? `/trade_plans.html?plan_id=${encodeURIComponent(id)}` : null,
};

/**
 * Get entity detail URL for linked-object display
 * @param {string} entityType - ticker | account | trade | trade_plan
 * @param {string} entityId - Entity ID
 * @returns {string|null} URL or null if no link
 */
export function getEntityDetailUrl(entityType, entityId) {
  if (!entityType || !entityId) return null;
  const fn = ENTITY_LINK_MAP[entityType];
  return fn ? fn(String(entityId).trim()) : null;
}
