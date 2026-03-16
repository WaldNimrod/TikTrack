/* event-log.js — AOS Event Log Panel — Phase 2
 * Dashboard: main panel, always shows active program in displayed domain.
 * Fetches from GET /api/log/events with domain + work_package_id. Auto-refresh 10s.
 */
(function () {
  'use strict';

  var EVENT_LOG_API = '/api/log/events';
  var REFRESH_INTERVAL_MS = 10000;
  var timerId = null;

  function eventTypeColor(type) {
    if (!type) return '';
    var t = String(type).toUpperCase();
    if (t === 'GATE_PASS') return 'event-badge--pass';
    if (t === 'GATE_FAIL' || t === 'GATE_BLOCK' || t === 'GATE_ADVANCE_BLOCKED') return 'event-badge--fail';
    if (t === 'DRIFT_DETECTED') return 'event-badge--drift';
    if (t === 'INIT_PIPELINE') return 'event-badge--init';
    if (t === 'WSM_UPDATE' || t === 'SNAPSHOT_GENERATED') return 'event-badge--wsm';
    if (t.indexOf('SERVER_') === 0) return 'event-badge--server';
    return 'event-badge--default';
  }

  function formatTime(ts) {
    if (!ts) return '—';
    try {
      var d = new Date(ts);
      return isNaN(d.getTime()) ? ts : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) { return ts; }
  }

  function renderEvent(evt) {
    var badgeClass = eventTypeColor(evt.event_type);
    var time = formatTime(evt.timestamp);
    var domain = evt.domain || '—';
    var gate = evt.gate || '';
    var team = evt.agent_team || '—';
    var desc = evt.description || '—';
    return '<div class="event-log-item">' +
      '<span class="event-log-time">' + escapeHtml(time) + '</span> ' +
      '<span class="event-badge ' + badgeClass + '">' + escapeHtml(String(evt.event_type || '—')) + '</span> ' +
      '<span class="event-log-domain">' + escapeHtml(domain) + '</span>' +
      (gate ? ' <span class="event-log-gate">' + escapeHtml(gate) + '</span>' : '') +
      ' <span class="event-log-team">' + escapeHtml(team) + '</span> ' +
      '<div class="event-log-desc">' + escapeHtml(desc) + '</div>' +
      '</div>';
  }

  function escapeHtml(s) {
    if (s == null || s === undefined) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatTickerEvent(evt) {
    var t = String(evt.event_type || '').toUpperCase();
    var cls = eventTypeColor(evt.event_type);
    var time = formatTime(evt.timestamp);
    return '<span class="event-badge ' + cls + '" style="margin-right:4px">' + escapeHtml(t) + '</span>' + escapeHtml(time);
  }

  var TYPE_CATEGORIES = {
    Gate: ['GATE_PASS', 'GATE_FAIL', 'GATE_BLOCK', 'GATE_ADVANCE_BLOCKED', 'PIPELINE_APPROVE', 'PASS_WITH_ACTION', 'OVERRIDE'],
    State: ['SNAPSHOT_GENERATED', 'DRIFT_DETECTED', 'DRIFT_RESOLVED', 'WSM_UPDATE'],
    System: ['INIT_PIPELINE', 'PHASE_TRANSITION', 'ARTIFACT_STORE', 'SERVER_START', 'SERVER_STOP', 'SERVER_ERROR', 'ERROR']
  };

  function filterByCategory(events, category) {
    if (!category) return events;
    var allowed = TYPE_CATEGORIES[category];
    if (!allowed) return events;
    return events.filter(function (e) {
      var t = String(e.event_type || '').toUpperCase();
      return allowed.some(function (a) { return t === a; });
    });
  }

  function getWorkPackageFilter() {
    var ps = (typeof window !== 'undefined' && window.pipelineState) ? window.pipelineState : null;
    var wp = ps && ps.work_package_id ? String(ps.work_package_id).trim() : '';
    if (!wp || wp === 'NONE') return '';
    var parts = wp.split('-');
    if (parts.length >= 2) return parts[0] + '-' + parts[1];
    return wp;
  }

  function getDomain() {
    return (typeof currentDomain !== 'undefined') ? currentDomain : '';
  }

  function updateTickerAndBadge(arr) {
    var tickerEl = document.getElementById('event-log-ticker-events');
    var countEl = document.getElementById('event-log-ticker-count');
    var badgeEl = document.getElementById('event-log-count-badge');
    var recent = (arr || []).slice(0, 3);
    var tickerHtml = recent.length
      ? recent.map(formatTickerEvent).join(' · ')
      : '—';
    if (tickerEl) tickerEl.innerHTML = tickerHtml;
    if (countEl) countEl.textContent = (arr || []).length;
    if (badgeEl) badgeEl.textContent = (arr || []).length + ' events';
  }

  function fetchEvents() {
    var panel = document.getElementById('event-log-panel');
    if (!panel) return;
    var listEl = document.getElementById('event-log-list');
    var typeSelect = document.getElementById('event-log-filter-type');
    var limitSelect = document.getElementById('event-log-filter-limit');
    if (!listEl || !typeSelect || !limitSelect) return;

    var domain = getDomain();
    var workPackage = getWorkPackageFilter();
    var typeCategory = typeSelect.value || '';
    var limit = parseInt(limitSelect.value || '20', 10) || 20;

    var params = [];
    if (domain) params.push('domain=' + encodeURIComponent(domain));
    if (workPackage) params.push('work_package_id=' + encodeURIComponent(workPackage));
    params.push('limit=' + encodeURIComponent(Math.min(limit * 2, 100)));
    var url = EVENT_LOG_API + '?' + params.join('&');

    function renderResult(data, isFallback) {
      var arr = Array.isArray(data) ? data : [];
      arr = filterByCategory(arr, typeCategory);
      arr = arr.slice(0, limit);
      if (arr.length === 0) {
        listEl.innerHTML = '<div class="event-log-empty">No events for this program in ' + escapeHtml(domain || 'domain') + '.</div>';
      } else {
        var html = arr.map(renderEvent).join('');
        if (isFallback) html = '<div class="event-log-empty" style="margin-bottom:8px;font-size:10px">Showing system-wide (domain had no events)</div>' + html;
        listEl.innerHTML = html;
      }
      updateTickerAndBadge(arr);
    }

    fetch(url, { method: 'GET' })
      .then(function (res) {
        if (!res.ok) throw new Error('Event log fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var arr = Array.isArray(data) ? data : [];
        arr = filterByCategory(arr, typeCategory);
        if (arr.length > 0) {
          renderResult(data, false);
          return;
        }
        if (domain || workPackage) {
          var fallbackUrl = EVENT_LOG_API + '?limit=' + encodeURIComponent(Math.min(limit * 2, 100));
          fetch(fallbackUrl, { method: 'GET' })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (fallbackData) {
              renderResult(fallbackData, true);
            })
            .catch(function () { renderResult([], false); });
        } else {
          renderResult([], false);
        }
      })
      .catch(function (err) {
        listEl.innerHTML = '<div class="event-log-empty event-log-error">Events unavailable (start AOS server?)</div>';
        updateTickerAndBadge([]);
      });
  }

  function startAutoRefresh() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(fetchEvents, REFRESH_INTERVAL_MS);
  }

  function onFiltersChange() {
    fetchEvents();
  }

  function init() {
    var panel = document.getElementById('event-log-panel');
    if (!panel) return;

    var typeSel = document.getElementById('event-log-filter-type');
    var limitSel = document.getElementById('event-log-filter-limit');

    if (typeSel) typeSel.addEventListener('change', onFiltersChange);
    if (limitSel) limitSel.addEventListener('change', onFiltersChange);

    fetchEvents();
    startAutoRefresh();

    var refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        setTimeout(fetchEvents, 300);
      });
    }

    window.eventLogRefresh = fetchEvents;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
