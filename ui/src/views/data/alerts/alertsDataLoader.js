/**
 * Alerts Data Loader — D34 (MB3A)
 * --------------------------------------------------------
 * טעינת נתונים לעמוד התראות
 * מקור: TEAM_20_TO_TEAM_30_MB3A_ALERTS_API_IMPLEMENTATION_COMPLETE, TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

/**
 * Fetch Alerts Summary
 * GET /api/v1/alerts/summary
 */
async function fetchAlertsSummary() {
  try {
    await sharedServices.init();
    const response = await sharedServices.get('/alerts/summary');
    return {
      totalAlerts: (response.total_alerts != null ? response.total_alerts : response.totalAlerts) || 0,
      activeAlerts: (response.active_alerts != null ? response.active_alerts : response.activeAlerts) || 0,
      newAlerts: (response.new_alerts != null ? response.new_alerts : response.newAlerts) || 0,
      triggeredAlerts: (response.triggered_alerts != null ? response.triggered_alerts : response.triggeredAlerts) || 0
    };
  } catch (error) {
    maskedLog('[Alerts Data Loader] Error fetching summary:', { errorCode: (error && error.code), status: (error && error.status) });
    return {
      totalAlerts: 0,
      activeAlerts: 0,
      newAlerts: 0,
      triggeredAlerts: 0
    };
  }
}

/**
 * Fetch Alerts
 * GET /api/v1/alerts?target_type=...&page=...&per_page=...&sort=...&order=...
 */
async function fetchAlerts(filters = {}) {
  try {
    await sharedServices.init();
    const params = {};
    if (filters.targetType && filters.targetType !== 'all') {
      params.target_type = filters.targetType;
    }
    if (filters.page != null) params.page = filters.page;
    if (filters.per_page != null) params.per_page = filters.per_page;
    if (filters.sort) params.sort = filters.sort;
    if (filters.order) params.order = filters.order;
    const response = await sharedServices.get('/alerts', params);
    const data = Array.isArray(response) ? response : (response?.data ?? response?.alerts ?? response?.results ?? response?.items ?? []) || [];
    const total = Math.max(data.length, (response.total != null ? response.total : response.total_count) || 0);
    return { data, total };
  } catch (error) {
    maskedLog('[Alerts Data Loader] Error fetching alerts:', { errorCode: (error && error.code), status: (error && error.status) });
    return { data: [], total: 0 };
  }
}

/**
 * Load all data for Alerts View
 */
async function loadAlertsData(filters = {}) {
  try {
    const [summary, alertsData] = await Promise.all([
      fetchAlertsSummary(),
      fetchAlerts(filters)
    ]);
    return {
      summary,
      alerts: alertsData
    };
  } catch (error) {
    maskedLog('[Alerts Data Loader] Error loading:', { errorCode: (error && error.code) });
    return {
      summary: { totalAlerts: 0, activeAlerts: 0, newAlerts: 0, triggeredAlerts: 0 },
      alerts: { data: [], total: 0 }
    };
  }
}

export { fetchAlertsSummary, fetchAlerts, loadAlertsData };
