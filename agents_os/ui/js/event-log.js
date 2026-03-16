/* event-log.js — AOS Event Log Panel — Phase 2
 * Fetches from GET /api/log/events, renders in sidebar. Auto-refresh 10s.
 * Classic script — no ES modules. Uses existing pipeline-config / DOM patterns.
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

  function fetchEvents() {
    var panel = document.getElementById('event-log-panel');
    if (!panel) return;
    var listEl = document.getElementById('event-log-list');
    var domainSelect = document.getElementById('event-log-filter-domain');
    var typeSelect = document.getElementById('event-log-filter-type');
    var limitSelect = document.getElementById('event-log-filter-limit');
    if (!listEl || !domainSelect || !typeSelect || !limitSelect) return;

    var domain = domainSelect.value || '';
    var typeCategory = typeSelect.value || '';
    var limit = parseInt(limitSelect.value || '20', 10) || 20;

    var params = [];
    if (domain) params.push('domain=' + encodeURIComponent(domain));
    params.push('limit=' + encodeURIComponent(Math.min(limit * 2, 100)));
    var url = EVENT_LOG_API + '?' + params.join('&');

    fetch(url, { method: 'GET' })
      .then(function (res) {
        if (!res.ok) throw new Error('Event log fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var arr = Array.isArray(data) ? data : [];
        arr = filterByCategory(arr, typeCategory);
        arr = arr.slice(0, limit);
        if (arr.length === 0) {
          listEl.innerHTML = '<div class="event-log-empty">No events yet</div>';
        } else {
          listEl.innerHTML = arr.map(renderEvent).join('');
        }
      })
      .catch(function (err) {
        listEl.innerHTML = '<div class="event-log-empty event-log-error">Events unavailable</div>';
      });
  }

  function syncDomainFilter() {
    var domainSelect = document.getElementById('event-log-filter-domain');
    var current = (typeof currentDomain !== 'undefined') ? currentDomain : '';
    if (domainSelect && current) {
      var optAll = domainSelect.querySelector('option[value=""]');
      var optAgents = domainSelect.querySelector('option[value="agents_os"]');
      var optTiktrack = domainSelect.querySelector('option[value="tiktrack"]');
      if (optAgents && optTiktrack) {
        if (current === 'agents_os') domainSelect.value = 'agents_os';
        else if (current === 'tiktrack') domainSelect.value = 'tiktrack';
      }
    }
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

    var domainSel = document.getElementById('event-log-filter-domain');
    var typeSel = document.getElementById('event-log-filter-type');
    var limitSel = document.getElementById('event-log-filter-limit');

    if (domainSel) domainSel.addEventListener('change', onFiltersChange);
    if (typeSel) typeSel.addEventListener('change', onFiltersChange);
    if (limitSel) limitSel.addEventListener('change', onFiltersChange);

    syncDomainFilter();
    fetchEvents();
    startAutoRefresh();

    var refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        setTimeout(fetchEvents, 300);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
