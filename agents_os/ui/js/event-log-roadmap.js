/* event-log-roadmap.js — Event Log on Roadmap. Default: program-scoped. Option: system-wide. */
(function () {
  'use strict';

  var API = '/api/log/events';
  var INTERVAL = 10000;
  var timerId = null;

  function esc(s) {
    if (s == null || s === undefined) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function badgeClass(type) {
    var t = String(type || '').toUpperCase();
    if (t === 'GATE_PASS') return 'event-badge--pass';
    if (['GATE_FAIL','GATE_BLOCK','GATE_ADVANCE_BLOCKED'].indexOf(t) >= 0) return 'event-badge--fail';
    if (t === 'DRIFT_DETECTED') return 'event-badge--drift';
    if (t === 'INIT_PIPELINE') return 'event-badge--init';
    if (['WSM_UPDATE','SNAPSHOT_GENERATED'].indexOf(t) >= 0) return 'event-badge--wsm';
    if (t.indexOf('SERVER_') === 0) return 'event-badge--server';
    return 'event-badge--default';
  }

  function fmtTime(ts) {
    if (!ts) return '—';
    try {
      var d = new Date(ts);
      return isNaN(d.getTime()) ? ts : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) { return ts; }
  }

  function render(evt) {
    var cls = badgeClass(evt.event_type);
    return '<div class="event-log-item" style="padding:6px 8px;border-bottom:1px solid var(--border);line-height:1.4"><span style="font-family:var(--mono);font-size:10px;color:var(--text-muted)">' + fmtTime(evt.timestamp) + '</span> <span class="event-badge ' + cls + '">' + esc(evt.event_type || '—') + '</span> ' + esc(evt.domain || '') + ' ' + esc(evt.gate || '') + ' <span style="font-size:10px">' + esc(evt.agent_team || '') + '</span><div style="font-size:11px;margin-top:2px">' + esc(evt.description || '') + '</div></div>';
  }

  function fetchEvents() {
    var listEl = document.getElementById('event-log-roadmap-list');
    var badgeEl = document.getElementById('event-log-roadmap-badge');
    if (!listEl) return;

    var sysWide = document.getElementById('event-log-system-wide') && document.getElementById('event-log-system-wide').checked;
    var domain = (document.getElementById('event-log-roadmap-domain') && document.getElementById('event-log-roadmap-domain').value) || '';
    var limit = parseInt((document.getElementById('event-log-roadmap-limit') && document.getElementById('event-log-roadmap-limit').value) || '20', 10) || 20;
    var progSel = document.getElementById('prog-select');
    var workPackage = '';
    if (!sysWide && progSel && progSel.value) workPackage = progSel.value.trim();

    var params = [];
    if (domain) params.push('domain=' + encodeURIComponent(domain));
    if (workPackage) params.push('work_package_id=' + encodeURIComponent(workPackage));
    params.push('limit=' + Math.min(limit, 100));
    var url = API + '?' + params.join('&');

    fetch(url, { method: 'GET' })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (arr) {
        if (!Array.isArray(arr)) arr = [];
        if (arr.length === 0) {
          listEl.innerHTML = '<div style="padding:12px;color:var(--text-muted);font-style:italic">No events' + (workPackage ? ' for ' + esc(workPackage) : '') + '.</div>';
        } else {
          listEl.innerHTML = arr.map(render).join('');
        }
        if (badgeEl) badgeEl.textContent = arr.length + ' events' + (workPackage ? ' (' + workPackage + ')' : '');
      })
      .catch(function () {
        listEl.innerHTML = '<div style="padding:12px;color:var(--danger)">Events unavailable (start AOS server?)</div>';
        if (badgeEl) badgeEl.textContent = '—';
      });
  }

  window.eventLogRoadmapRefresh = fetchEvents;

  function init() {
    if (!document.getElementById('event-log-roadmap-panel')) return;
    fetchEvents();
    timerId = setInterval(fetchEvents, INTERVAL);
    var progSel = document.getElementById('prog-select');
    if (progSel) progSel.addEventListener('change', fetchEvents);
    var refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', function () { setTimeout(fetchEvents, 300); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
