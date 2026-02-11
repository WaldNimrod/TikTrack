/**
 * Fetch Reference Brokers - D16, D18 select dropdown
 * --------------------------------------------------------
 * ADR-013: GET /api/v1/reference/brokers for dynamic broker select
 * Team 20 API: { data: [{ value, label }], total }
 */

import sharedServices from '../../../components/core/Shared_Services.js';

/**
 * Fetch broker list for select dropdowns (D16 trading accounts, D18 brokers fees)
 * @returns {Promise<Array<{value: string, label: string}>>} Broker options for select
 */
export async function fetchReferenceBrokers() {
  await sharedServices.init();
  const response = await sharedServices.get('/reference/brokers', {});
  const items = response?.data ?? response ?? [];
  return Array.isArray(items) ? items : [];
}
