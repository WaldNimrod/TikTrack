/**
 * Fetch Reference Brokers - D16, D18 select dropdown
 * --------------------------------------------------------
 * ADR-013: GET /api/v1/reference/brokers for dynamic broker select
 * ADR-015: API returns { value, display_name, label, is_supported, default_fees }
 *          label kept for backwards compat; display_name preferred for display
 */

import sharedServices from '../../../components/core/Shared_Services.js';

/**
 * Fetch broker list for select dropdowns (D16 trading accounts)
 * @returns {Promise<Array<{value: string, label: string, is_supported?: boolean, default_fees?: Array}>>} Broker options
 */
export async function fetchReferenceBrokers() {
  await sharedServices.init();
  const response = await sharedServices.get('/reference/brokers', {});
  const items = response?.data ?? response ?? [];
  const arr = Array.isArray(items) ? items : [];
  return arr.map((item) => ({
    value: item.value ?? item.display_name ?? item.label ?? '',
    label: item.display_name ?? item.displayName ?? item.label ?? item.value ?? '',
    is_supported: item.is_supported ?? item.isSupported ?? true,
    default_fees: item.default_fees ?? item.defaultFees ?? []
  }));
}
