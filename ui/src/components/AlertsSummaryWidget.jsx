/**
 * AlertsSummaryWidget — S001-P002 WP001
 * -------------------------------------
 * Read-only triggered-unread alerts summary on D15.I home dashboard.
 * Triggered-unread count badge + list of N=5 most recent.
 * Fully hidden when 0 unread.
 * collapsible-container Iron Rule. maskedLog mandatory.
 *
 * @reference TEAM_20_S001_P002_WP001_API_VERIFY
 * @reference implementation_mandates.md §7.2 (field/empty/error contracts)
 */

import React, { useState, useEffect } from 'react';
import sharedServices from './core/sharedServices.js';
import { maskedLog } from '../utils/maskedLog.js';

/** Format triggered_at to relative time (e.g. "לפני 5 דקות") */
function formatRelativeTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffM = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);
    if (diffM < 1) return 'עכשיו';
    if (diffM < 60) return `לפני ${diffM} דקות`;
    if (diffH < 24) return diffH === 1 ? 'לפני שעה' : `לפני ${diffH} שעות`;
    if (diffD < 2) return 'אתמול';
    if (diffD < 7) return `לפני ${diffD} ימים`;
    return d.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** Fetch triggered-unread alerts (N=5). Returns { data, total } or null on auth/error. */
async function fetchTriggeredUnread() {
  try {
    await sharedServices.init();
    const res = await sharedServices.get('/alerts', {
      trigger_status: 'triggered_unread',
      per_page: 5,
      sort: 'triggered_at',
      order: 'desc',
    });
    const data = Array.isArray(res)
      ? res
      : (res?.data ?? res?.alerts ?? []) || [];
    const total = Math.max(data.length, res?.total ?? 0);
    return { data, total };
  } catch (e) {
    const status = e?.status ?? e?.response?.status;
    if (status === 401) return null;
    maskedLog('[AlertsSummaryWidget] Fetch error:', { status });
    return null;
  }
}

/**
 * AlertsSummaryWidget
 * - Empty state (total===0): returns null (fully hidden)
 * - 401/Error: returns null
 * - Non-empty: collapsible section with badge + list
 */
const AlertsSummaryWidget = ({ onData }) => {
  const [payload, setPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertsOpen, setAlertsOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const result = await fetchTriggeredUnread();
      if (cancelled) return;
      setPayload(result);
      onData?.(
        result
          ? { total: result.total, data: result.data }
          : { total: 0, data: [] },
      );
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [onData]);

  if (isLoading) return null;
  if (!payload || payload.total === 0) return null;

  const { data, total } = payload;
  const d34Url = '/alerts.html';
  const d34UnreadUrl = '/alerts.html?trigger_status=triggered_unread';

  return (
    <div className="active-alerts collapsible-container" data-role="container">
      <div className="index-section__header">
        <div className="index-section__header-title">
          <button
            type="button"
            className="active-alerts__title-trigger"
            aria-label="פתח עמוד ההתראות"
            onClick={() => setAlertsOpen((o) => !o)}
          >
            <span className="active-alerts__title-icon" aria-hidden="true">
              🔔
            </span>
            <span className="active-alerts__title-text">התראות פעילות</span>
          </button>
          <a
            href={d34UnreadUrl}
            className="active-alerts__count-badge"
            aria-label={`${total} התראות לא נקראו`}
            aria-live="polite"
          >
            {total}
          </a>
        </div>
        <div className="index-section__header-actions">
          <button
            type="button"
            className="index-section__header-toggle-btn"
            aria-label={alertsOpen ? 'הסתר' : 'הצג'}
            aria-expanded={alertsOpen}
            onClick={() => setAlertsOpen((o) => !o)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6l6 -6"></path>
            </svg>
          </button>
        </div>
      </div>

      {alertsOpen && (
        <div className="index-section__body">
          <div className="active-alerts__list" role="list">
            {data.map((a) => {
              const symbol = a.ticker_symbol ?? a.target_display_name ?? '—';
              const condition = a.condition_summary ?? a.title ?? '—';
              const time = formatRelativeTime(a.triggered_at ?? a.triggeredAt);
              const itemUrl = a.id
                ? `${d34Url}?id=${encodeURIComponent(a.id)}`
                : d34Url;

              return (
                <a
                  key={a.id ?? a.triggered_at ?? Math.random()}
                  href={itemUrl}
                  className="active-alerts__card active-alerts__card--compact"
                  role="listitem"
                >
                  <span className="active-alerts__card-symbol">{symbol}</span>
                  <span className="active-alerts__card-sep"> · </span>
                  <span className="active-alerts__card-condition">
                    {condition}
                  </span>
                  <span className="active-alerts__card-sep"> · </span>
                  <time className="active-alerts__card-time">{time}</time>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsSummaryWidget;
