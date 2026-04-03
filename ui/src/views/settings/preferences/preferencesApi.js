/**
 * Preferences API Client — D39 User Preferences
 * S003-P003-WP001 LLD400 §2.1
 * GET/PATCH /api/v1/me/preferences
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

export async function getPreferences() {
  await sharedServices.init();
  const res = await sharedServices.get('/me/preferences', {});
  return res?.data ?? res;
}

export async function patchPreferences(payload) {
  await sharedServices.init();
  const res = await sharedServices.patch('/me/preferences', payload);
  return res?.data ?? res;
}
