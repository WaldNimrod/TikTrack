/*
id: TEAM_31_AOS_V3_UI
team: Team 31
domain: agents_os
artifact: app.js
mandate: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0
patch: TEAM_00_TO_TEAM_31_AOS_V3_MOCKUP_AUTHORITY_MODEL_UPDATE_MANDATE_v1.0.0 + TEAM_100_TO_TEAM_31_AOS_V3_UI_IS_CURRENT_ACTOR_REMOVAL_MANDATE_v1.0.0 (AM-01 / §4.13)
date: 2026-03-29
status: ACTIVE
*/
(function () {
  "use strict";

  /* TC-M09-2: exactly 15 types (activation order) */
  var EVENT_TYPES = [
    "RUN_INITIATED",
    "PHASE_PASSED",
    "GATE_PASSED",
    "RUN_COMPLETED",
    "GATE_FAILED_BLOCKING",
    "GATE_FAILED_ADVISORY",
    "GATE_APPROVED",
    "CORRECTION_RESUBMITTED",
    "CORRECTION_ESCALATED",
    "CORRECTION_RESOLVED",
    "RUN_PAUSED",
    "RUN_RESUMED",
    "RUN_RESUMED_WITH_NEW_ASSIGNMENT",
    "PRINCIPAL_OVERRIDE",
    "ROUTING_FAILED",
  ];

  var LS_UI_DOMAIN_SCOPE = "aosv3_ui_data_scope";

  function getUiDomainScope() {
    try {
      var v = localStorage.getItem(LS_UI_DOMAIN_SCOPE);
      if (v === "agents_os" || v === "tiktrack" || v === "all") return v;
    } catch (e0) {
      /* ignore */
    }
    return "all";
  }

  function setUiDomainScope(v) {
    try {
      if (v === "all" || v === "agents_os" || v === "tiktrack") {
        localStorage.setItem(LS_UI_DOMAIN_SCOPE, v);
      }
    } catch (e0) {
      /* ignore */
    }
  }

  function matchesUiDataScope(rowDomainId, domainSlugOpt) {
    var s = getUiDomainScope();
    if (s === "all") return true;
    var rid = String(rowDomainId || "");
    var slug = domainSlugOpt != null ? String(domainSlugOpt) : "";
    if (slug && slug === s) return true;
    return rid === s;
  }

  function historyDomainQueryValue() {
    var s = getUiDomainScope();
    return s === "all" ? "" : s;
  }

  function notifyUiDomainScopeChildren() {
    if (typeof window.__aosv3TeamsRerender === "function") {
      window.__aosv3TeamsRerender();
    }
    if (typeof window.__aosv3HistoryRerender === "function") {
      window.__aosv3HistoryRerender();
    }
    if (typeof window.__aosv3PortfolioRerender === "function") {
      window.__aosv3PortfolioRerender();
    }
  }

  function applyUiDomainScopeControl() {
    var el = document.getElementById("aosv3-ui-domain-scope");
    if (!el) return;
    el.value = getUiDomainScope();
    if (el._aosv3ScopeWired) return;
    el._aosv3ScopeWired = true;
    el.addEventListener("change", function () {
      var v = el.value;
      setUiDomainScope(v);
      if (v === "agents_os" || v === "tiktrack") {
        if (typeof window.AOSV3_onDomainSwitch === "function") {
          window.AOSV3_onDomainSwitch(v);
        }
      }
      notifyUiDomainScopeChildren();
    });
  }

  /** TC-M25-3: 26-char Crockford ULID-style mock run ids */
  var MOCK_RID_PRIMARY = "01JQXYZ123456789ABCDEFWXYZ";
  var MOCK_RID_SECONDARY = "01JR0AB987654321ZYXWVUSQNM";
  /* Exactly 26 chars each — TC-M25-3 / MN-R01 */
  var MOCK_RID_DONE_A = "01JPQRS1111111111111ABCDEF";
  var MOCK_RID_DONE_B = "01JPTUV22222222222222ABCDE";
  /** Stage 8B mock — 26 chars (TC-M25) */
  var MOCK_RID_STAGE8B = "01JRUNMOCK0001ABCDEFGHIJKL";
  var MOCK_RID_STAGE8B_DONE = "01JRUNMOCK0002ZYXWVUTSRQPO";

  var MOCK_PREVIOUS_EVENT_CANON = {
    event_type: "GATE_FAILED_ADVISORY",
    occurred_at: "2026-03-27T14:03:12Z",
    actor_team_id: "team_90",
    gate_id: "GATE_3",
    phase_id: "phase_3_1",
    verdict: "ADVISORY_FAIL",
    reason: "Token budget exceeds recommended threshold (AD-S6-07)",
  };

  var MOCK_BLOCKING_FINDINGS_SAMPLE = [
    {
      id: "BF-01",
      description: "Template not found for GATE_3/phase_3_1",
      evidence: "builder.py:143",
    },
    {
      id: "BF-02",
      description: "Routing gap — no match for agents_os / TRACK_FOCUSED",
      evidence: "routing_rules seed",
    },
  ];

  function curlFeedbackIngest(runId) {
    return (
      "curl -X POST http://localhost:8082/api/v1/runs/" +
      runId +
      "/feedback \\\n" +
      '  -H "Content-Type: application/json" \\\n' +
      '  -d \'{"detection_mode":"OPERATOR_NOTIFY"}\''
    );
  }

  function curlAdvance(runId, summaryJson) {
    return (
      "curl -X POST http://localhost:8082/api/v1/runs/" +
      runId +
      "/advance \\\n" +
      '  -H "Content-Type: application/json" \\\n' +
      "  -d " +
      summaryJson
    );
  }

  var MOCK_STATE_ACTIVE = {
    run_id: MOCK_RID_PRIMARY,
    work_package_id: "S003-P002-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-26T08:00:00Z",
    last_updated: "2026-03-26T14:30:00Z",
    actor: { team_id: "team_61", label: "Team 61", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "PHASE_PASSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: { has_pending: false },
    next_action: {
      type: "AWAIT_FEEDBACK",
      label:
        "Awaiting agent completion for: team_61 · GATE_3 / phase_3_1",
      target_gate: "GATE_3",
      target_phase: "phase_3_1",
      blocking_count: null,
      cli_command: curlFeedbackIngest(MOCK_RID_PRIMARY),
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_IDLE = {
    run_id: null,
    work_package_id: null,
    domain_id: "agents_os",
    process_variant: null,
    status: "IDLE",
    current_gate_id: null,
    current_phase_id: null,
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: null,
    last_updated: null,
    actor: null,
    sentinel: null,
    execution_mode: null,
    is_human_gate: 0,
    escalated: false,
    latest_event_type: null,
    previous_event: null,
    pending_feedback: null,
    next_action: null,
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_PAUSED = {
    run_id: MOCK_RID_PRIMARY,
    work_package_id: "S003-P002-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "PAUSED",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: "2026-03-26T15:00:00Z",
    completed_at: null,
    started_at: "2026-03-26T08:00:00Z",
    last_updated: "2026-03-26T14:05:00Z",
    actor: null,
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "RUN_PAUSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: { has_pending: false },
    next_action: {
      type: "RESUME",
      label: "Run is paused.",
      target_gate: null,
      target_phase: null,
      blocking_count: null,
      cli_command:
        'curl -X POST http://localhost:8082/api/v1/runs/' +
        MOCK_RID_PRIMARY +
        '/resume \\\n  -H "Content-Type: application/json" \\\n  -d \'{}\'',
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_ESCALATED = {
    run_id: MOCK_RID_PRIMARY,
    work_package_id: "S003-P002-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "CORRECTION",
    current_gate_id: "GATE_2",
    current_phase_id: "phase_2_1",
    correction_cycle_count: 3,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-26T08:00:00Z",
    last_updated: "2026-03-26T15:00:00Z",
    actor: { team_id: "team_100", label: "Team 100", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: true,
    latest_event_type: "CORRECTION_ESCALATED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: { has_pending: false },
    next_action: {
      type: "AWAIT_FEEDBACK",
      label:
        "Correction cycle 3 — ingest feedback or RESUBMIT after fixes · GATE_2 / phase_2_1",
      target_gate: "GATE_2",
      target_phase: "phase_2_1",
      blocking_count: null,
      cli_command: curlFeedbackIngest(MOCK_RID_PRIMARY),
    },
    sse_connected: false,
    correction_blocking: {
      last_blocking_at: "2026-03-26T09:12:00Z",
      gate_id: "GATE_3",
      phase_id: "phase_3_1",
      actor_team_id: "team_90",
      findings: MOCK_BLOCKING_FINDINGS_SAMPLE,
      assigned_team_id: "team_21",
      assigned_team_label: "AOS Backend",
      max_correction_cycles: 3,
    },
  };

  var MOCK_STATE_HUMAN_GATE = {
    run_id: MOCK_RID_PRIMARY,
    work_package_id: "S003-P002-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_2",
    current_phase_id: "phase_2_2",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-26T08:00:00Z",
    last_updated: "2026-03-26T12:00:00Z",
    actor: { team_id: "team_00", label: "Team 00", engine: "human" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 1,
    escalated: false,
    latest_event_type: "PHASE_PASSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: { has_pending: false },
    next_action: {
      type: "HUMAN_APPROVE",
      label: "Human gate — your approval required.",
      target_gate: "GATE_2",
      target_phase: "phase_2_2",
      blocking_count: null,
      cli_command:
        'curl -X POST http://localhost:8082/api/v1/runs/' +
        MOCK_RID_PRIMARY +
        '/approve \\\n  -H "Content-Type: application/json" \\\n  -d \'{"approval_notes":"…"}\'',
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_SENTINEL = {
    run_id: MOCK_RID_PRIMARY,
    work_package_id: "S003-P002-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-26T08:00:00Z",
    last_updated: "2026-03-26T14:30:00Z",
    actor: { team_id: "team_30", label: "Team 30", engine: "cursor" },
    sentinel: { active: true, override_team: "team_30" },
    execution_mode: "DASHBOARD",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "GATE_PASSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: { has_pending: false },
    next_action: {
      type: "AWAIT_FEEDBACK",
      label:
        "Awaiting agent completion for: team_30 · GATE_3 / phase_3_1",
      target_gate: "GATE_3",
      target_phase: "phase_3_1",
      blocking_count: null,
      cli_command: curlFeedbackIngest(MOCK_RID_PRIMARY),
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_COMPLETE = {
    run_id: MOCK_RID_PRIMARY,
    work_package_id: null,
    domain_id: "agents_os",
    process_variant: null,
    status: "COMPLETE",
    current_gate_id: null,
    current_phase_id: null,
    correction_cycle_count: 1,
    paused_at: null,
    completed_at: "2026-03-26T18:00:00Z",
    started_at: "2026-03-26T08:00:00Z",
    last_updated: "2026-03-26T18:00:00Z",
    actor: null,
    sentinel: null,
    execution_mode: null,
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "RUN_COMPLETED",
    previous_event: null,
    pending_feedback: null,
    next_action: null,
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_AWAIT_FEEDBACK = {
    run_id: MOCK_RID_STAGE8B,
    work_package_id: "S003-P011-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-27T10:00:00Z",
    last_updated: "2026-03-27T13:00:00Z",
    actor: { team_id: "team_90", label: "team_90", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "PHASE_PASSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: { has_pending: false },
    next_action: {
      type: "AWAIT_FEEDBACK",
      label:
        "Awaiting agent completion for: team_90 · GATE_3 / phase_3_1",
      target_gate: "GATE_3",
      target_phase: "phase_3_1",
      blocking_count: null,
      cli_command: curlFeedbackIngest(MOCK_RID_STAGE8B),
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_FEEDBACK_PASS = {
    run_id: MOCK_RID_STAGE8B,
    work_package_id: "S003-P011-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-27T10:00:00Z",
    last_updated: "2026-03-27T14:05:00Z",
    actor: { team_id: "team_90", label: "team_90", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "PHASE_PASSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: {
      has_pending: true,
      feedback_id: "01JFBK_MOCK_PASS",
      verdict: "PASS",
      confidence: "HIGH",
      proposed_action: "ADVANCE",
      ingested_at: "2026-03-27T14:05:00Z",
      summary: "Team 90 QA review complete — 0 blockers",
      blocking_findings: [],
    },
    next_action: {
      type: "CONFIRM_ADVANCE",
      label: "Feedback ingested — PASS confirmed (confidence: HIGH)",
      target_gate: "GATE_4",
      target_phase: "phase_4_1",
      blocking_count: null,
      cli_command: curlAdvance(
        MOCK_RID_STAGE8B,
        '\'{"verdict":"PASS","summary":"Team 90 QA complete"}\''
      ),
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_FEEDBACK_FAIL = {
    run_id: MOCK_RID_STAGE8B,
    work_package_id: "S003-P011-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-27T10:00:00Z",
    last_updated: "2026-03-27T14:06:00Z",
    actor: { team_id: "team_90", label: "team_90", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "GATE_FAILED_BLOCKING",
    previous_event: {
      event_type: "GATE_FAILED_BLOCKING",
      occurred_at: "2026-03-27T14:02:00Z",
      actor_team_id: "team_90",
      gate_id: "GATE_3",
      phase_id: "phase_3_1",
      verdict: "FAIL",
      reason: "2 blocking findings",
    },
    pending_feedback: {
      has_pending: true,
      feedback_id: "01JFBK_MOCK_FAIL",
      verdict: "FAIL",
      confidence: "HIGH",
      proposed_action: "FAIL",
      ingested_at: "2026-03-27T14:06:00Z",
      summary: null,
      blocking_findings: MOCK_BLOCKING_FINDINGS_SAMPLE,
      route_recommendation: "doc",
    },
    next_action: {
      type: "CONFIRM_FAIL",
      label:
        "Feedback ingested — FAIL (confidence: HIGH · 2 blocking findings)",
      target_gate: "GATE_3",
      target_phase: "phase_3_1",
      blocking_count: 2,
      cli_command:
        "curl -X POST http://localhost:8082/api/v1/runs/" +
        MOCK_RID_STAGE8B +
        '/fail \\\n  -H "Content-Type: application/json" \\\n  -d \'{"reason":"2 blocking findings","route":"doc"}\'',
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_FEEDBACK_LOW = {
    run_id: MOCK_RID_STAGE8B,
    work_package_id: "S003-P011-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "IN_PROGRESS",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 0,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-27T10:00:00Z",
    last_updated: "2026-03-27T14:07:00Z",
    actor: { team_id: "team_90", label: "team_90", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "PHASE_PASSED",
    previous_event: MOCK_PREVIOUS_EVENT_CANON,
    pending_feedback: {
      has_pending: true,
      feedback_id: "01JFBK_MOCK_LOW",
      verdict: "PENDING_REVIEW",
      confidence: "LOW",
      proposed_action: "MANUAL_REVIEW",
      ingested_at: "2026-03-27T14:07:00Z",
      raw_text_preview: "Unstructured agent output — manual verdict required.",
      blocking_findings: [],
    },
    next_action: {
      type: "MANUAL_REVIEW",
      label: "Low confidence (IL-3 raw). Manual verdict required:",
      target_gate: "GATE_3",
      target_phase: "phase_3_1",
      blocking_count: null,
      cli_command: curlFeedbackIngest(MOCK_RID_STAGE8B),
    },
    sse_connected: false,
    correction_blocking: null,
  };

  var MOCK_STATE_CORRECTION_BLOCKING = {
    run_id: MOCK_RID_STAGE8B,
    work_package_id: "S003-P011-WP001",
    domain_id: "agents_os",
    process_variant: "TRACK_FULL",
    status: "CORRECTION",
    current_gate_id: "GATE_3",
    current_phase_id: "phase_3_1",
    correction_cycle_count: 2,
    paused_at: null,
    completed_at: null,
    started_at: "2026-03-27T08:00:00Z",
    last_updated: "2026-03-27T12:00:00Z",
    actor: { team_id: "team_21", label: "Team 21", engine: "cursor" },
    sentinel: { active: false, override_team: null },
    execution_mode: "MANUAL",
    is_human_gate: 0,
    escalated: false,
    latest_event_type: "GATE_FAILED_BLOCKING",
    previous_event: {
      event_type: "GATE_FAILED_BLOCKING",
      occurred_at: "2026-03-26T09:12:00Z",
      actor_team_id: "team_90",
      gate_id: "GATE_3",
      phase_id: "phase_3_1",
      verdict: "FAIL",
      reason: "Template + routing",
    },
    pending_feedback: { has_pending: false },
    next_action: {
      type: "AWAIT_FEEDBACK",
      label:
        "Correction cycle 2 of 3 — ingest feedback or RESUBMIT after fixes",
      target_gate: "GATE_3",
      target_phase: "phase_3_1",
      blocking_count: null,
      cli_command: curlFeedbackIngest(MOCK_RID_STAGE8B),
    },
    sse_connected: false,
    correction_blocking: {
      last_blocking_at: "2026-03-26T09:12:00Z",
      gate_id: "GATE_3",
      phase_id: "phase_3_1",
      actor_team_id: "team_90",
      findings: MOCK_BLOCKING_FINDINGS_SAMPLE,
      assigned_team_id: "team_21",
      assigned_team_label: "AOS Backend",
      max_correction_cycles: 3,
    },
  };

  var MOCK_STATE_SSE_CONNECTED = JSON.parse(
    JSON.stringify(MOCK_STATE_AWAIT_FEEDBACK)
  );
  MOCK_STATE_SSE_CONNECTED.sse_connected = true;

  /** Mode B found no file — TC-16 / §2.2: show C+D (mock: both rows visible). */
  var MOCK_STATE_FEEDBACK_FALLBACK = JSON.parse(
    JSON.stringify(MOCK_STATE_AWAIT_FEEDBACK)
  );
  MOCK_STATE_FEEDBACK_FALLBACK.mock_fallback_required = true;

  var MOCK_ASSEMBLED_PROMPT = {
    run_id: MOCK_RID_PRIMARY,
    gate_id: "GATE_3",
    phase_id: "phase_3_1",
    actor_team_id: "team_61",
    prompt_text:
      "# Team 61 — Session Context\n\n## Layer 1 — Identity\n\n**Team:** Team 61\n**Name:** Cloud Agent / DevOps Automation\n**Engine:** Cursor\n**Domain:** agents_os\n**Group:** implementation\n**Profession:** devops_engineer\n\n## Layer 2 — Governance\n\n**Authority:** Agents_OS V2 infrastructure, CI/CD, quality scans\n**Writes to:** agents_os_v2/, _COMMUNICATION/team_61/\n**Iron Rules:**\n1. Run tests before push\n2. No force push to main\n\n## Layer 3 — Current State\n\n**Active Run:** S003-P002-WP001 (agents_os)\n**Gate:** GATE_3 / phase_3_1\n**Status:** IN_PROGRESS\n**Assignment:** Active (has_active_assignment)\n\n## Layer 4 — Task\n\n**Gate 3 Requirements:** Implementation per LOD400 spec.\n**Deliverables:** Production code + unit tests.\n**Acceptance Criteria:** All tests pass, no linter errors, code review by Team 100.",
    token_count: 247,
    assembled_at: "2026-03-26T14:30:00Z",
    cache_hit: false,
  };

  var MOCK_HISTORY = {
    total: 12,
    limit: 50,
    offset: 0,
    events: [
      {
        id: "01JQABC100000000000001",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 8,
        event_type: "PHASE_PASSED",
        gate_id: "GATE_3",
        phase_id: "phase_3_1",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_61", label: "Team 61", type: "agent" },
        verdict: "PASS",
        reason: null,
        payload_json: null,
        occurred_at: "2026-03-26T14:30:00Z",
      },
      {
        id: "01JQABC100000000000002",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 7,
        event_type: "GATE_FAILED_ADVISORY",
        gate_id: "GATE_2",
        phase_id: "phase_2_3",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_190", label: "Team 190", type: "agent" },
        verdict: "FAIL",
        reason: "Minor doc inconsistency — non-blocking",
        payload_json: {
          findings: [{ id: "F-01", severity: "MINOR" }],
          advisory: true,
        },
        occurred_at: "2026-03-26T13:45:00Z",
      },
      {
        id: "01JQABC100000000000003",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 6,
        event_type: "GATE_APPROVED",
        gate_id: "GATE_2",
        phase_id: "phase_2_2",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_00", label: "Team 00", type: "human" },
        verdict: "PASS",
        reason: null,
        payload_json: { approval_notes: "Spec alignment verified" },
        occurred_at: "2026-03-26T12:00:00Z",
      },
      {
        id: "01JQABC100000000000004",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 5,
        event_type: "CORRECTION_RESUBMITTED",
        gate_id: "GATE_2",
        phase_id: "phase_2_1",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_100", label: "Team 100", type: "agent" },
        verdict: null,
        reason: "Fixed F-01/F-02 per CC1",
        payload_json: { artifacts: { spec_version: "v1.0.1" }, cycle_number: 1 },
        occurred_at: "2026-03-26T11:00:00Z",
      },
      {
        id: "01JQABC100000000000005",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 4,
        event_type: "GATE_FAILED_BLOCKING",
        gate_id: "GATE_2",
        phase_id: "phase_2_1",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_190", label: "Team 190", type: "agent" },
        verdict: "FAIL",
        reason: "Contract inconsistencies in UC-04/05 and UC-09/10",
        payload_json: {
          findings: [
            { id: "F-01", severity: "MAJOR" },
            { id: "F-02", severity: "MAJOR" },
          ],
          cycle_number: 1,
        },
        occurred_at: "2026-03-26T10:00:00Z",
      },
      {
        id: "01JQABC100000000000006",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 3,
        event_type: "PHASE_PASSED",
        gate_id: "GATE_1",
        phase_id: "phase_1_2",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_100", label: "Team 100", type: "agent" },
        verdict: "PASS",
        reason: null,
        payload_json: null,
        occurred_at: "2026-03-26T09:30:00Z",
      },
      {
        id: "01JQABC100000000000007",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 2,
        event_type: "PHASE_PASSED",
        gate_id: "GATE_1",
        phase_id: "phase_1_1",
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_111", label: "Team 111", type: "agent" },
        verdict: "PASS",
        reason: null,
        payload_json: null,
        occurred_at: "2026-03-26T09:00:00Z",
      },
      {
        id: "01JQABC100000000000008",
        run_id: MOCK_RID_PRIMARY,
        sequence_no: 1,
        event_type: "RUN_INITIATED",
        gate_id: "GATE_0",
        phase_id: null,
        domain_id: "agents_os",
        work_package_id: "S003-P002-WP001",
        actor: { team_id: "team_00", label: "Team 00", type: "human" },
        verdict: null,
        reason: "AOS v3 spec program initiated",
        payload_json: null,
        occurred_at: "2026-03-26T08:00:00Z",
      },
      {
        id: "01JQABC100000000000009",
        run_id: MOCK_RID_STAGE8B,
        sequence_no: 3,
        event_type: "PHASE_PASSED",
        gate_id: "GATE_3",
        phase_id: "phase_3_1",
        domain_id: "agents_os",
        work_package_id: "S003-P011-WP001",
        actor: { team_id: "team_90", label: "team_90", type: "agent" },
        verdict: "PASS",
        reason: null,
        payload_json: null,
        occurred_at: "2026-03-27T13:00:00Z",
      },
      {
        id: "01JQABC100000000000010",
        run_id: MOCK_RID_STAGE8B,
        sequence_no: 2,
        event_type: "GATE_PASSED",
        gate_id: "GATE_2",
        phase_id: "phase_2_3",
        domain_id: "agents_os",
        work_package_id: "S003-P011-WP001",
        actor: { team_id: "team_61", label: "Team 61", type: "agent" },
        verdict: "PASS",
        reason: null,
        payload_json: null,
        occurred_at: "2026-03-27T11:00:00Z",
      },
      {
        id: "01JQABC100000000000011",
        run_id: MOCK_RID_STAGE8B,
        sequence_no: 1,
        event_type: "RUN_INITIATED",
        gate_id: "GATE_0",
        phase_id: null,
        domain_id: "agents_os",
        work_package_id: "S003-P011-WP001",
        actor: { team_id: "team_00", label: "Team 00", type: "human" },
        verdict: null,
        reason: "Stage 8B mock run",
        payload_json: null,
        occurred_at: "2026-03-27T10:00:00Z",
      },
      {
        id: "01JQABC200000000000001",
        run_id: MOCK_RID_STAGE8B_DONE,
        sequence_no: 1,
        event_type: "RUN_COMPLETED",
        gate_id: "GATE_5",
        phase_id: "phase_5_1",
        domain_id: "agents_os",
        work_package_id: "S003-P009-WP001",
        actor: { team_id: "team_00", label: "Team 00", type: "human" },
        verdict: "PASS",
        reason: "Program complete (mock completed run)",
        payload_json: null,
        occurred_at: "2026-03-26T18:00:00Z",
      },
    ],
  };

  var MOCK_ROUTING = {
    routing_rules: [
      {
        id: "rr_001",
        gate_id: "GATE_0",
        phase_id: null,
        domain_id: "agents_os",
        variant: null,
        role_id: "constitutional_validator",
        priority: 100,
      },
      {
        id: "rr_002",
        gate_id: "GATE_2",
        phase_id: "phase_2_1",
        domain_id: "agents_os",
        variant: "TRACK_FULL",
        role_id: "domain_architect",
        priority: 100,
      },
      {
        id: "rr_003",
        gate_id: "GATE_3",
        phase_id: "phase_3_1",
        domain_id: "agents_os",
        variant: "TRACK_FULL",
        role_id: "devops_engineer",
        priority: 100,
      },
    ],
  };

  var MOCK_TEMPLATES = {
    templates: [
      {
        id: "tmpl_001",
        gate_id: "GATE_2",
        phase_id: "phase_2_1",
        domain_id: "agents_os",
        name: "Spec Review",
        version: 3,
        is_active: 1,
        body_markdown:
          "## Review {{team_name}}\n\nReview the following spec artifact...",
      },
      {
        id: "tmpl_002",
        gate_id: "GATE_3",
        phase_id: "phase_3_1",
        domain_id: null,
        name: "Implementation Default",
        version: 1,
        is_active: 1,
        body_markdown: "## Build Task\n\nImplement per LOD400 spec...",
      },
    ],
  };

  var MOCK_POLICIES = {
    policies: [
      {
        policy_key: "max_correction_cycles",
        scope_type: "GLOBAL",
        policy_value_json: '{"max": 3}',
      },
      {
        policy_key: "token_budget",
        scope_type: "GLOBAL",
        policy_value_json: '{"L1": 40, "L2": 200, "L3": 100, "L4": 300}',
      },
    ],
  };

  var MOCK_TEAMS = {
    teams: [
      { team_id: "team_00", label: "Team 00 — System Designer", name: "System Designer", engine: "human", group: "cross_domain", profession: "principal", domain_scope: "all", parent_team_id: null, children: ["team_10", "team_11"], has_active_assignment: false },
      { team_id: "team_11", label: "Team 11 — AOS Gateway", name: "AOS Gateway", engine: "cursor", group: "x1_aos", profession: "gateway_lead", domain_scope: "agents_os", parent_team_id: "team_00", children: ["team_21", "team_31", "team_51", "team_61"], has_active_assignment: false },
      { team_id: "team_21", label: "Team 21 — AOS Backend", name: "AOS Backend Implementation", engine: "cursor", group: "x1_aos", profession: "backend_engineer", domain_scope: "agents_os", parent_team_id: "team_11", children: [], has_active_assignment: false },
      { team_id: "team_31", label: "Team 31 — AOS Frontend", name: "AOS Frontend Implementation", engine: "cursor", group: "x1_aos", profession: "frontend_engineer", domain_scope: "agents_os", parent_team_id: "team_11", children: [], has_active_assignment: false },
      { team_id: "team_51", label: "Team 51 — Agents_OS QA", name: "Agents_OS QA Agent", engine: "cursor", group: "x1_aos", profession: "qa_engineer", domain_scope: "agents_os", parent_team_id: "team_11", children: [], has_active_assignment: false },
      { team_id: "team_61", label: "Team 61 — Cloud Agent", name: "Cloud Agent / DevOps Automation", engine: "cursor", group: "x1_aos", profession: "devops_engineer", domain_scope: "agents_os", parent_team_id: "team_11", children: [], has_active_assignment: true },
      { team_id: "team_100", label: "Team 100 — Chief Architect", name: "Chief System Architect", engine: "claude_code", group: "cross_domain", profession: "system_architect", domain_scope: "all", parent_team_id: "team_00", children: [], has_active_assignment: false },
      { team_id: "team_110", label: "Team 110 — AOS Domain Architect", name: "AOS Domain Architect (IDE)", engine: "cursor", group: "x1_aos", profession: "domain_architect", domain_scope: "agents_os", parent_team_id: "team_100", children: [], has_active_assignment: false },
      { team_id: "team_10", label: "Team 10 — TikTrack Gateway", name: "TikTrack Gateway", engine: "cursor", group: "x0_tiktrack", profession: "gateway_lead", domain_scope: "tiktrack", parent_team_id: "team_00", children: ["team_30"], has_active_assignment: false },
      { team_id: "team_30", label: "Team 30 — TikTrack Frontend", name: "TikTrack Frontend Implementation", engine: "cursor", group: "x0_tiktrack", profession: "frontend_engineer", domain_scope: "tiktrack", parent_team_id: "team_10", children: [], has_active_assignment: false },
      { team_id: "team_190", label: "Team 190 — Constitutional Validator", name: "Constitutional Architectural Validator", engine: "claude_code", group: "cross_domain", profession: "validator", domain_scope: "all", parent_team_id: null, children: ["team_191"], has_active_assignment: false },
      { team_id: "team_191", label: "Team 191 — Git Governance", name: "Git Governance Operations", engine: "cursor", group: "cross_domain", profession: "git_governance", domain_scope: "all", parent_team_id: "team_190", children: [], has_active_assignment: false },
    ],
  };

  var PIPELINE_GATES_ORDER = [
    "GATE_0",
    "GATE_1",
    "GATE_2",
    "GATE_3",
    "GATE_4",
    "GATE_5",
  ];

  /** Mock sub-phases per gate — UI only */
  var MOCK_GATE_PHASES = {
    GATE_0: ["phase_0_1"],
    GATE_1: ["phase_1_1", "phase_1_2"],
    GATE_2: ["phase_2_1", "phase_2_2", "phase_2_3"],
    GATE_3: ["phase_3_1", "phase_3_2"],
    GATE_4: ["phase_4_1"],
    GATE_5: ["phase_5_1"],
  };

  var MOCK_ACTIVATABLE_TARGETS = [
    {
      id: "wp:S003-P003-WP001",
      label: "WP — AOS v3 UI BUILD (agents_os)",
    },
    {
      id: "wp:S002-P002-WP001",
      label: "WP — TikTrack Auth Migration (tiktrack)",
    },
    { id: "prog:IDEAS_PIPELINE", label: "Program — Ideas pipeline (mock)" },
    { id: "prog:S005_DRAFT", label: "Program — S005 draft (mock)" },
  ];

  /** Invariant: at most one in-flight run per domain_id (aligns with pipeline SSOT). */
  var MOCK_PORTFOLIO_ACTIVE = {
    total: 2,
    runs: [
      { run_id: MOCK_RID_PRIMARY, work_package_id: "S003-P002-WP001", domain_id: "agents_os", status: "IN_PROGRESS", process_variant: "TRACK_FULL", current_gate_id: "GATE_3", current_phase_id: "phase_3_1", correction_cycle_count: 0, started_at: "2026-03-26T08:00:00Z", completed_at: null, current_actor_team_id: "team_61" },
      { run_id: MOCK_RID_SECONDARY, work_package_id: "S004-P001-WP001", domain_id: "tiktrack", status: "CORRECTION", process_variant: "TRACK_FOCUSED", current_gate_id: "GATE_2", current_phase_id: "phase_2_1", correction_cycle_count: 1, started_at: "2026-03-25T10:00:00Z", completed_at: null, current_actor_team_id: "team_100" },
    ],
  };

  var MOCK_PORTFOLIO_COMPLETED = {
    total: 2,
    runs: [
      { run_id: MOCK_RID_DONE_A, work_package_id: "S001-P001-WP001", domain_id: "agents_os", status: "COMPLETE", started_at: "2026-03-20T08:00:00Z", completed_at: "2026-03-22T16:00:00Z", correction_cycle_count: 2, gates_completed: "5/5 gates · 2 corrections" },
      { run_id: MOCK_RID_DONE_B, work_package_id: "S002-P001-WP001", domain_id: "tiktrack", status: "COMPLETE", started_at: "2026-03-18T09:00:00Z", completed_at: "2026-03-19T14:00:00Z", correction_cycle_count: 0, gates_completed: "5/5 gates · 0 corrections" },
    ],
  };

  var MOCK_WORK_PACKAGES = {
    work_packages: [
      { wp_id: "S003-P002-WP001", label: "AOS v3 Module Map Implementation", domain_id: "agents_os", status: "ACTIVE", linked_run_id: MOCK_RID_PRIMARY, current_gate_id: "GATE_3", current_phase_id: "phase_3_1", linked_run_status: "IN_PROGRESS", linked_actor_team_id: "team_61", linked_run_started_at: "2026-03-26T08:00:00Z", created_at: "2026-03-10T08:00:00Z", updated_at: "2026-03-26T14:00:00Z" },
      { wp_id: "S003-P011-WP003", label: "Event-Driven Watcher + SSE Push", domain_id: "agents_os", status: "PLANNED", linked_run_id: null, current_gate_id: null, current_phase_id: null, linked_run_status: null, linked_actor_team_id: null, created_at: "2026-03-19T08:00:00Z", updated_at: "2026-03-27T12:00:00Z" },
      { wp_id: "S004-P001-WP001", label: "TikTrack Data Import Redesign", domain_id: "tiktrack", status: "ACTIVE", linked_run_id: MOCK_RID_SECONDARY, current_gate_id: "GATE_2", current_phase_id: "phase_2_1", linked_run_status: "CORRECTION", linked_actor_team_id: "team_100", linked_run_started_at: "2026-03-25T10:00:00Z", created_at: "2026-03-01T09:00:00Z", updated_at: "2026-03-25T10:00:00Z" },
      { wp_id: "S003-P003-WP001", label: "AOS v3 UI BUILD", domain_id: "agents_os", status: "PLANNED", linked_run_id: null, current_gate_id: null, current_phase_id: null, linked_run_status: null, linked_actor_team_id: null, created_at: "2026-03-15T10:00:00Z", updated_at: "2026-03-15T10:00:00Z" },
      { wp_id: "S002-P002-WP001", label: "TikTrack Auth Migration", domain_id: "tiktrack", status: "COMPLETE", linked_run_id: null, current_gate_id: null, current_phase_id: null, linked_run_status: null, linked_actor_team_id: null, created_at: "2026-02-01T08:00:00Z", updated_at: "2026-03-01T18:00:00Z" },
    ],
  };

  var MOCK_IDEAS_SEED = [
    { idea_id: "01JR1AA000000000000001", title: "Automated regression test suite for AOS v3", description: null, domain_id: "agents_os", idea_type: "FEATURE", status: "APPROVED", priority: "HIGH", submitted_by: "team_100", submitted_at: "2026-03-24T10:00:00Z", decision_notes: "Approved for S005 program", target_program_id: "S005" },
    { idea_id: "01JR1AA000000000000002", title: "MCP integration for live pipeline state", description: null, domain_id: "agents_os", idea_type: "IMPROVEMENT", status: "EVALUATING", priority: "CRITICAL", submitted_by: "team_61", submitted_at: "2026-03-25T14:00:00Z", decision_notes: null, target_program_id: null },
    { idea_id: "01JR1AA000000000000003", title: "Dark mode toggle in pipeline nav", description: null, domain_id: "tiktrack", idea_type: "FEATURE", status: "NEW", priority: "LOW", submitted_by: "team_31", submitted_at: "2026-03-26T09:00:00Z", decision_notes: null, target_program_id: null },
    { idea_id: "01JR1AA000000000000004", title: "Pipeline health dashboard widget", description: null, domain_id: "agents_os", idea_type: "TECH_DEBT", status: "DEFERRED", priority: "MEDIUM", submitted_by: "team_51", submitted_at: "2026-03-22T11:00:00Z", decision_notes: "Deferred to post-BUILD", target_program_id: null },
    { idea_id: "01JR1AA000000000000005", title: "Legacy gate numbering in exports", description: null, domain_id: "agents_os", idea_type: "BUG", status: "REJECTED", priority: "LOW", submitted_by: "team_110", submitted_at: "2026-03-21T08:00:00Z", decision_notes: "Out of scope for v3", target_program_id: null },
    { idea_id: "01JR1AA000000000000006", title: "SSE push for events", description: "Real-time dashboard", domain_id: "agents_os", idea_type: "FEATURE", status: "NEW", priority: "HIGH", submitted_by: "team_100", submitted_at: "2026-03-27T09:00:00Z", decision_notes: null, target_program_id: null },
    { idea_id: "01JR1AA000000000000007", title: "Fix routing gap", description: null, domain_id: "agents_os", idea_type: "BUG", status: "EVALUATING", priority: "CRITICAL", submitted_by: "team_51", submitted_at: "2026-03-27T08:00:00Z", decision_notes: null, target_program_id: null },
    { idea_id: "01JR1AA000000000000008", title: "Refactor prompt cache", description: null, domain_id: "agents_os", idea_type: "TECH_DEBT", status: "NEW", priority: "MEDIUM", submitted_by: "team_21", submitted_at: "2026-03-26T16:00:00Z", decision_notes: null, target_program_id: null },
  ];

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function aosv3TableSortCompare(va, vb, mul) {
    if (va == null && vb == null) return 0;
    if (va == null) return 1 * mul;
    if (vb == null) return -1 * mul;
    var na = Number(va);
    var nb = Number(vb);
    if (
      !isNaN(na) &&
      !isNaN(nb) &&
      String(va).trim() !== "" &&
      String(vb).trim() !== ""
    ) {
      return mul * (na < nb ? -1 : na > nb ? 1 : 0);
    }
    return mul * String(va).localeCompare(String(vb), undefined, { numeric: true });
  }

  function historyEventSortValue(e, key) {
    if (key === "occurred_at")
      return new Date(e.occurred_at || 0).getTime();
    if (key === "event_type") return e.event_type || "";
    if (key === "gate_phase")
      return (e.gate_id || "") + " " + (e.phase_id || "");
    if (key === "actor") {
      var ac = e.actor || {};
      return ac.team_id || "";
    }
    if (key === "verdict")
      return e.verdict != null ? String(e.verdict) : "";
    if (key === "reason") return e.reason || "";
    return "";
  }

  function historySortEventsList(arr, st) {
    var k = st.key;
    var mul = st.dir;
    var copy = arr.slice();
    copy.sort(function (a, b) {
      var va = historyEventSortValue(a, k);
      var vb = historyEventSortValue(b, k);
      var c = 0;
      if (typeof va === "number" && typeof vb === "number") {
        c = va < vb ? -1 : va > vb ? 1 : 0;
      } else {
        c = String(va).localeCompare(String(vb), undefined, { numeric: true });
      }
      if (c === 0) {
        var ta = new Date(a.occurred_at || 0).getTime();
        var tb = new Date(b.occurred_at || 0).getTime();
        c = ta < tb ? -1 : ta > tb ? 1 : 0;
      }
      return mul * c;
    });
    return copy;
  }

  function wireHistoryTableSort(tableId, renderPage) {
    var tbl = document.getElementById(tableId);
    if (!tbl || tbl._aosv3HistorySortWired) return;
    tbl._aosv3HistorySortWired = true;
    if (!window.__aosv3HistorySort) {
      window.__aosv3HistorySort = { key: "occurred_at", dir: -1 };
    }
    tbl.querySelectorAll("thead th[data-sort-key]").forEach(function (th) {
      th.style.cursor = "pointer";
      th.addEventListener("click", function () {
        var k = th.getAttribute("data-sort-key");
        var st = window.__aosv3HistorySort;
        if (st.key === k) st.dir = -st.dir;
        else {
          st.key = k;
          st.dir = 1;
        }
        tbl.querySelectorAll("thead th[data-sort-key]").forEach(function (h) {
          h.removeAttribute("aria-sort");
        });
        th.setAttribute(
          "aria-sort",
          st.dir > 0 ? "ascending" : "descending"
        );
        renderPage();
      });
    });
  }

  function readMetaAosv3(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    return m ? m.getAttribute("content") : null;
  }

  function aosv3DevUiEnabled() {
    try {
      var q = new URLSearchParams(window.location.search || "");
      if (q.get("dev") === "1") return true;
      if (window.localStorage.getItem("aosv3_dev_ui") === "1") return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function applyDevScenariosVisibility() {
    var card = document.getElementById("aosv3-dev-scenarios-card");
    if (!card) return;
    card.style.display = aosv3DevUiEnabled() ? "" : "none";
  }

  function aosv3UseMock() {
    try {
      if (readMetaAosv3("aosv3-use-mock") === "1") return true;
      var q = new URLSearchParams(window.location.search || "");
      if (q.get("mock") === "1" || q.get("aosv3_mock") === "1") return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function wpMetaById(wpId) {
    if (!wpId || !MOCK_WORK_PACKAGES || !MOCK_WORK_PACKAGES.work_packages)
      return {};
    return (
      MOCK_WORK_PACKAGES.work_packages.filter(function (w) {
        return w.wp_id === wpId;
      })[0] || {}
    );
  }

  function domainDisplayLabel(slugOrId) {
    if (slugOrId == null || slugOrId === "") return "—";
    var s = String(slugOrId);
    var map = {
      agents_os: "Agents OS",
      tiktrack: "TikTrack",
      multi: "Multi",
      all: "All lanes",
    };
    if (map[s]) return map[s];
    var ulidMap = {
      "01JK8AOSV3DOMAIN00000001": "Agents OS",
      "01JK8AOSV3DOMAIN00000002": "TikTrack",
    };
    if (ulidMap[s]) return ulidMap[s];
    if (s.length > 26) return "Domain";
    return s;
  }

  function canonicalProgramFromWpId(wpId) {
    var m = String(wpId || "").match(/^(S\d+-P\d+)-WP\d+$/i);
    return m ? m[1] : "";
  }

  function programTableCell(wpId, programId) {
    var pid = programId != null && String(programId).trim() !== "" ? String(programId).trim() : "";
    var fromWp = canonicalProgramFromWpId(wpId);
    if (pid) {
      var show = fromWp || pid;
      if (show.length > 22) show = runUlidSuffix(pid);
      return (
        '<span title="' +
        esc(pid) +
        '">' +
        esc(show) +
        "</span>"
      );
    }
    if (fromWp)
      return (
        '<span title="Canonical program slice of ' +
        esc(wpId) +
        '">' +
        esc(fromWp) +
        "</span>"
      );
    return "—";
  }

  function domainPillHtml(domainId, titleKey) {
    if (domainId == null || domainId === "") return "—";
    var raw = String(domainId);
    var isTeam = /^team_\d+$/.test(raw);
    var display = isTeam
      ? titleKey != null && titleKey !== ""
        ? String(titleKey)
        : raw
      : domainDisplayLabel(raw);
    var ttitle = isTeam
      ? titleKey
        ? raw + " — " + titleKey
        : raw
      : "domain_id: " + raw;
    return (
      '<span class="aosv3-domain-pill" title="' +
      esc(ttitle) +
      '">' +
      esc(display) +
      "</span>"
    );
  }

  function statusBadgeClass(status) {
    var m = {
      IN_PROGRESS: "aosv3-status--in_progress",
      CORRECTION: "aosv3-status--correction",
      PAUSED: "aosv3-status--paused",
      COMPLETE: "aosv3-status--complete",
      IDLE: "aosv3-status--idle",
      NOT_STARTED: "aosv3-status--not_started",
    };
    return m[status] || "aosv3-status--idle";
  }

  function wpStatusBadgeClass(st) {
    if (st === "ACTIVE") return "aosv3-status--in_progress";
    if (st === "PLANNED") return "aosv3-status--not_started";
    if (st === "COMPLETE") return "aosv3-status--complete";
    return "aosv3-status--idle";
  }

  var pipelineLastState = null;
  var pipelineLiveHistoryCache = null;
  var pipelineLivePollTimer = null;
  var pipelineLiveEs = null;
  var pipelineSseConnected = false;
  var pipelineLiveSseKey = "";
  var flowLiveEs = null;
  var flowLivePollTimer = null;
  var flowPageTransportState = null;

  function findTeamById(tid) {
    if (!tid) return null;
    return (
      MOCK_TEAMS.teams.filter(function (t) {
        return t.team_id === tid;
      })[0] || null
    );
  }

  function buildPoliciesMarkdown() {
    return MOCK_POLICIES.policies
      .map(function (p) {
        return (
          "- **" +
          p.policy_key +
          "** (" +
          p.scope_type +
          "): `" +
          p.policy_value_json +
          "`"
        );
      })
      .join("\n");
  }

  function eventLogBadgeClass(et) {
    if (et === "GATE_FAILED_BLOCKING")
      return "aosv3-event-badge aosv3-event-badge--blocking";
    if (et === "GATE_FAILED_ADVISORY")
      return "aosv3-event-badge aosv3-event-badge--advisory";
    return "aosv3-event-badge aosv3-event-badge--neutral";
  }

  function renderGateMap(currentGateId, currentPhaseId, runStatus) {
    var el = document.getElementById("aosv3-gate-map");
    if (!el) return;
    el.innerHTML = "";
    var row = document.createElement("div");
    row.className = "aosv3-gate-map-row";
    PIPELINE_GATES_ORDER.forEach(function (g) {
      var span = document.createElement("span");
      span.className = "aosv3-gate-chip";
      span.textContent = g.replace("GATE_", "");
      span.title = g;
      if (runStatus === "COMPLETE") {
        span.classList.add("aosv3-gate-chip--complete");
      } else if (!currentGateId || runStatus === "IDLE") {
        span.classList.add("aosv3-gate-chip--muted");
      } else {
        var curIdx = PIPELINE_GATES_ORDER.indexOf(currentGateId);
        var i = PIPELINE_GATES_ORDER.indexOf(g);
        if (g === currentGateId) span.classList.add("aosv3-gate-chip--current");
        else if (curIdx >= 0 && i >= 0) {
          if (i < curIdx) span.classList.add("aosv3-gate-chip--past");
          else span.classList.add("aosv3-gate-chip--future");
        }
      }
      row.appendChild(span);
    });
    el.appendChild(row);
    var showPhases =
      currentGateId &&
      runStatus !== "IDLE" &&
      runStatus !== "COMPLETE" &&
      MOCK_GATE_PHASES[currentGateId];
    if (showPhases) {
      var prow = document.createElement("div");
      prow.className = "aosv3-phase-map-row";
      var lab = document.createElement("div");
      lab.className = "aosv3-phase-map-label";
      lab.textContent = "Phases @ " + currentGateId;
      prow.appendChild(lab);
      var chips = document.createElement("div");
      chips.className = "aosv3-phase-chips";
      MOCK_GATE_PHASES[currentGateId].forEach(function (ph) {
        var sp = document.createElement("span");
        sp.className = "aosv3-phase-chip";
        sp.textContent = ph;
        sp.title = ph;
        if (ph === currentPhaseId) sp.classList.add("aosv3-phase-chip--current");
        chips.appendChild(sp);
      });
      prow.appendChild(chips);
      el.appendChild(prow);
    }
  }

  function renderRunLog(runId) {
    var tb = document.getElementById("aosv3-run-log-tbody");
    if (!tb) return;
    tb.innerHTML = "";
    if (!runId) {
      tb.innerHTML =
        '<tr><td colspan="7" class="aosv3-run-log-empty">— No active run —</td></tr>';
      return;
    }
    var evs;
    if (
      pipelineLiveHistoryCache &&
      pipelineLiveHistoryCache.runId === runId &&
      pipelineLiveHistoryCache.events
    ) {
      evs = pipelineLiveHistoryCache.events;
    } else {
      evs = cloneEvents().filter(function (e) {
        return e.run_id === runId;
      });
    }
    evs.sort(function (a, b) {
      return new Date(b.occurred_at) - new Date(a.occurred_at);
    });
    evs.forEach(function (e) {
      var tr = document.createElement("tr");
      var actorTxt = "—";
      if (e.actor && e.actor.team_id) {
        var albl = e.actor.label;
        if (!albl) {
          var trow = findTeamById(e.actor.team_id);
          if (trow) albl = trow.label;
        }
        actorTxt =
          esc(e.actor.team_id) + (albl ? " · " + esc(albl) : "");
      }
      var rsn = e.reason == null ? "—" : String(e.reason);
      if (rsn.length > 140) rsn = rsn.slice(0, 137) + "...";
      tr.innerHTML =
        "<td>" +
        esc(String(e.sequence_no)) +
        "</td><td class=\"aosv3-mono\">" +
        esc(e.occurred_at) +
        '</td><td><span class="' +
        eventLogBadgeClass(e.event_type) +
        '">' +
        esc(e.event_type) +
        "</span></td><td>" +
        esc(e.gate_id || "—") +
        " / " +
        esc(e.phase_id || "—") +
        "</td><td>" +
        actorTxt +
        "</td><td>" +
        esc(e.verdict != null ? String(e.verdict) : "—") +
        "</td><td>" +
        esc(rsn) +
        "</td>";
      tb.appendChild(tr);
    });
  }

  function renderSseIndicator(state) {
    var el = document.getElementById("aosv3-sse-indicator");
    if (!el) return;
    var flowPage =
      document.body &&
      document.body.getAttribute("data-aosv3-page") === "flow";
    var connected;
    if (flowPage) {
      connected = state && state.sse_connected === true;
    } else {
      connected =
        state &&
        state.run_id &&
        state.status !== "IDLE" &&
        state.status !== "COMPLETE" &&
        state.sse_connected === true;
    }
    el.classList.toggle("aosv3-sse--connected", connected);
    el.classList.toggle("aosv3-sse--polling", !connected);
    el.innerHTML =
      '<span class="aosv3-sse-dot" aria-hidden="true"></span> ' +
      (connected ? "SSE Connected" : "Polling Mode");
  }

  function renderCorrectionBlocking(state) {
    var sec = document.getElementById("aosv3-correction-blocking");
    if (!sec) return;
    var cb = state.correction_blocking;
    var show = state.status === "CORRECTION" && cb && cb.findings;
    sec.hidden = !show;
    if (!show) return;
    var host = document.getElementById("aosv3-correction-blocking-body");
    if (!host) return;
    var findingsHtml = cb.findings
      .map(function (f) {
        return (
          "<li><strong>" +
          esc(f.id) +
          ":</strong> " +
          esc(f.description) +
          (f.evidence
            ? " <span class=\"aosv3-sidebar-hint\">| evidence: " +
              esc(f.evidence) +
              "</span>"
            : "") +
          "</li>"
        );
      })
      .join("");
    host.innerHTML =
      '<p class="aosv3-correction-headline">CORRECTION IN PROGRESS — cycle ' +
      esc(String(state.correction_cycle_count)) +
      " of " +
      esc(String(cb.max_correction_cycles || 3)) +
      "</p>" +
      "<p><strong>Last GATE_FAILED_BLOCKING:</strong><br>" +
      esc(cb.last_blocking_at) +
      " · " +
      esc(cb.gate_id) +
      " / " +
      esc(cb.phase_id) +
      " · " +
      esc(cb.actor_team_id) +
      "</p>" +
      "<ul class=\"aosv3-blocking-list\">" +
      findingsHtml +
      "</ul>" +
      "<p><strong>assigned_team:</strong> " +
      esc(cb.assigned_team_id) +
      " — " +
      esc(cb.assigned_team_label) +
      "<br>" +
      "<strong>correction_cycle_count:</strong> " +
      esc(String(state.correction_cycle_count)) +
      "<br>" +
      "<strong>max_correction_cycles:</strong> " +
      esc(String(cb.max_correction_cycles || 3)) +
      " <span class=\"aosv3-sidebar-hint\">(policy: max_correction_cycles)</span></p>";
  }

  function handoffActionToast(mockMsg, liveMsg) {
    if (aosv3UseMock()) return mockMsg;
    if (liveMsg != null && String(liveMsg).length) return liveMsg;
    return String(mockMsg || "")
      .replace(/\s*—\s*mock\s*$/i, "")
      .replace(/\s*mock\s*$/i, "")
      .trim();
  }

  function handoffBtnHtml(cls, label, mockToast, liveToast) {
    var c = cls ? cls : "";
    var toastMsg = handoffActionToast(mockToast, liveToast);
    if (toastMsg) {
      return (
        '<button type="button" class="btn ' +
        c +
        '" data-mock-toast="' +
        esc(toastMsg) +
        '">' +
        esc(label) +
        "</button>"
      );
    }
    return (
      '<button type="button" class="btn ' + c + '">' + esc(label) + "</button>"
    );
  }

  function handoffNextButtonsHtml(na) {
    var t = na.type;
    if (t === "AWAIT_FEEDBACK") {
      return (
        "<p class=\"aosv3-handoff-next-label\">" +
        esc(na.label) +
        "</p>" +
        '<div class="aosv3-handoff-btn-row">' +
        handoffBtnHtml(
          "btn-primary",
          "Agent Completed",
          "Agent Completed — mock POST /feedback",
          "Agent verdict recorded (POST /feedback when connected)"
        ) +
        handoffBtnHtml("", "Provide File Path", "", "Show file path field") +
        handoffBtnHtml("", "Paste Feedback", "", "Show paste field") +
        "</div>"
      );
    }
    if (t === "CONFIRM_ADVANCE") {
      return (
        "<p class=\"aosv3-handoff-next-label\">" +
        esc(na.label) +
        "</p>" +
        '<div class="aosv3-handoff-btn-row">' +
        handoffBtnHtml(
          "btn-primary",
          "✓ Confirm Advance",
          "Confirm Advance — mock",
          "Confirm advance after feedback"
        ) +
        handoffBtnHtml(
          "",
          "Clear & Re-ingest",
          "Clear pending feedback — mock",
          "Clear pending feedback"
        ) +
        "</div>"
      );
    }
    if (t === "CONFIRM_FAIL") {
      return (
        "<p class=\"aosv3-handoff-next-label\">" +
        esc(na.label) +
        "</p>" +
        '<div class="aosv3-handoff-btn-row">' +
        handoffBtnHtml(
          "btn-warning",
          "✗ Confirm Fail",
          "Confirm Fail — mock",
          "Confirm fail after feedback"
        ) +
        handoffBtnHtml(
          "",
          "Clear & Re-ingest",
          "Clear pending feedback — mock",
          "Clear pending feedback"
        ) +
        "</div>"
      );
    }
    if (t === "MANUAL_REVIEW") {
      return (
        "<p class=\"aosv3-handoff-next-label\">⚠️ " +
        esc(na.label) +
        "</p>" +
        '<div class="aosv3-handoff-btn-row">' +
        handoffBtnHtml(
          "btn-primary",
          "✓ Mark PASS",
          "Mark PASS — mock",
          "Mark manual review as pass"
        ) +
        '<button type="button" class="btn btn-warning" data-handoff-manual-fail="1">✗ Mark FAIL</button>' +
        "</div>" +
        '<label class="aosv3-form-label" for="aosv3-handoff-manual-reason">Reason — <strong>required</strong> for Mark FAIL; optional for Mark PASS</label>' +
        '<textarea id="aosv3-handoff-manual-reason" class="aosv3-textarea" rows="2" aria-describedby="aosv3-handoff-manual-reason-hint" autocomplete="off"></textarea>' +
        '<p id="aosv3-handoff-manual-reason-hint" class="aosv3-sidebar-hint"><code>POST /fail</code> requires a non-empty reason before Mark FAIL.</p>'
      );
    }
    if (t === "HUMAN_APPROVE") {
      return (
        "<p class=\"aosv3-handoff-next-label\">" +
        esc(na.label) +
        "</p>" +
        '<div class="aosv3-handoff-btn-row">' +
        handoffBtnHtml(
          "btn-primary",
          "✓ APPROVE",
          "APPROVE — mock",
          "Approve human gate"
        ) +
        "</div>"
      );
    }
    if (t === "RESUME") {
      return (
        "<p class=\"aosv3-handoff-next-label\">" +
        esc(na.label) +
        "</p>" +
        '<div class="aosv3-handoff-btn-row">' +
        handoffBtnHtml(
          "btn-primary",
          "▶ Resume Run",
          "Resume Run — mock",
          "Resume paused run"
        ) +
        "</div>"
      );
    }
    return "<p class=\"aosv3-sidebar-hint\">No handoff action for this state.</p>";
  }

  function renderHandoffFeedbackForms(state) {
    var wrap = document.getElementById("aosv3-handoff-feedback-forms");
    if (!wrap) return;
    var na = state.next_action;
    var pf = state.pending_feedback || { has_pending: false };
    if (
      !na ||
      (na.type !== "CONFIRM_ADVANCE" && na.type !== "CONFIRM_FAIL")
    ) {
      wrap.hidden = true;
      wrap.innerHTML = "";
      return;
    }
    wrap.hidden = false;
    if (na.type === "CONFIRM_ADVANCE") {
      var sum = pf.summary || "Team 90 QA review complete — 0 blockers";
      wrap.innerHTML =
        '<div class="section-title aosv3-handoff-form-title">Confirm Advance → ' +
        esc(na.target_gate || "") +
        " / " +
        esc(na.target_phase || "") +
        "</div>" +
        '<label class="aosv3-form-label">Summary <input type="text" id="aosv3-handoff-advance-summary" class="aosv3-input" value="' +
        esc(sum) +
        '" /></label>' +
        '<div class="aosv3-handoff-btn-row">' +
        '<button type="button" class="btn" data-mock-toast="' +
        esc(handoffActionToast("Cancel advance — mock", "Close")) +
        '">Cancel</button> ' +
        '<button type="button" class="btn btn-primary" data-mock-toast="' +
        esc(
          handoffActionToast(
            "Confirm Advance — mock",
            "Submit confirm advance"
          )
        ) +
        '">Confirm Advance →</button>' +
        "</div>";
    } else {
      var bfs = pf.blocking_findings || [];
      var bfHtml = bfs
        .map(function (f) {
          return (
            "<li><strong>" +
            esc(f.id) +
            ":</strong> " +
            esc(f.description) +
            (f.evidence
              ? " | evidence: " + esc(f.evidence)
              : "") +
            "</li>"
          );
        })
        .join("");
      var reason =
        "2 blocking findings — template gap + routing rule";
      var route = pf.route_recommendation || "doc";
      wrap.innerHTML =
        '<div class="section-title aosv3-handoff-form-title">Confirm Fail — ' +
        esc(na.target_gate || "") +
        "</div>" +
        "<p><strong>Blocking findings (" +
        String(bfs.length) +
        "):</strong></p><ul>" +
        bfHtml +
        "</ul>" +
        '<label class="aosv3-form-label">Reason <input type="text" id="aosv3-handoff-fail-reason" class="aosv3-input" value="' +
        esc(reason) +
        '" /></label>' +
        '<label class="aosv3-form-label">Route <select id="aosv3-handoff-fail-route" class="aosv3-input"><option value="doc"' +
        (route === "doc" ? " selected" : "") +
        '>doc</option><option value="full"' +
        (route === "full" ? " selected" : "") +
        '>full</option></select></label>' +
        '<div class="aosv3-handoff-btn-row">' +
        '<button type="button" class="btn" data-mock-toast="' +
        esc(handoffActionToast("Cancel fail — mock", "Close")) +
        '">Cancel</button> ' +
        '<button type="button" class="btn btn-warning" data-mock-toast="' +
        esc(
          handoffActionToast("Confirm Fail — mock", "Submit confirm fail")
        ) +
        '">Confirm Fail →</button>' +
        "</div>";
    }
  }

  function renderHandoffIngestionExtra(state) {
    var ex = document.getElementById("aosv3-handoff-ingestion-extra");
    if (!ex) return;
    var na = state.next_action;
    if (!na || na.type !== "AWAIT_FEEDBACK") {
      ex.hidden = true;
      ex.innerHTML = "";
      return;
    }
    ex.hidden = false;
    var fb = state.mock_fallback_required === true;
    var fileHidden = fb ? "" : " hidden";
    var pasteHidden = fb ? "" : " hidden";
    var banner = fb
      ? '<p class="aosv3-sidebar-hint aosv3-fallback-banner">' +
        (aosv3UseMock()
          ? "Mode B: no verdict file at canonical paths — <code>fallback_required: true</code>. Use <strong>file path</strong> or <strong>paste</strong>."
          : "No verdict file at canonical paths (<code>fallback_required</code>). Use <strong>file path</strong> or <strong>paste</strong>.") +
        "</p>"
      : "";
    ex.innerHTML =
      banner +
      '<div id="aosv3-ingest-file-row" class="aosv3-ingest-row"' +
      fileHidden +
      ">" +
      '<label class="aosv3-form-label">File path <input type="text" id="aosv3-ingest-file-path" class="aosv3-input" placeholder="/path/to/verdict.md" /> ' +
      '<button type="button" class="btn" data-mock-toast="' +
      esc(
        handoffActionToast(
          "POST /feedback NATIVE_FILE — mock",
          "Parse feedback from file path"
        )
      ) +
      '">Parse</button></label></div>' +
      '<div id="aosv3-ingest-paste-row" class="aosv3-ingest-row"' +
      pasteHidden +
      ">" +
      '<label class="aosv3-form-label">Paste feedback<textarea id="aosv3-ingest-paste" class="aosv3-textarea" rows="4" maxlength="10000"></textarea></label> ' +
      '<button type="button" class="btn" data-mock-toast="' +
      esc(
        handoffActionToast(
          "POST /feedback RAW_PASTE — mock",
          "Parse pasted feedback"
        )
      ) +
      '">Parse Feedback</button></div>';
  }

  function wireHandoffIngestionToggles() {
    var ex = document.getElementById("aosv3-handoff-ingestion-extra");
    if (!ex || ex.hidden) return;
    var fileRow = document.getElementById("aosv3-ingest-file-row");
    var pasteRow = document.getElementById("aosv3-ingest-paste-row");
    var nextHost = document.getElementById("aosv3-handoff-next");
    if (!nextHost) return;
    var btns = nextHost.querySelectorAll("button");
    btns.forEach(function (btn) {
      var txt = btn.textContent.trim();
      if (txt === "Provide File Path") {
        btn.addEventListener(
          "click",
          function () {
            if (fileRow) {
              fileRow.hidden = false;
              if (pasteRow) pasteRow.hidden = true;
            }
          },
          { once: false }
        );
      }
      if (txt === "Paste Feedback") {
        btn.addEventListener(
          "click",
          function () {
            if (pasteRow) {
              pasteRow.hidden = false;
              if (fileRow) fileRow.hidden = true;
            }
          },
          { once: false }
        );
      }
      if (txt === "Agent Completed") {
        btn.addEventListener(
          "click",
          function () {
            if (fileRow) fileRow.hidden = true;
            if (pasteRow) pasteRow.hidden = true;
          },
          { once: false }
        );
      }
    });
  }

  function renderOperatorHandoff(state) {
    var card = document.getElementById("aosv3-operator-handoff");
    if (!card) return;
    card._toastBound = false;
    if (
      !state.run_id ||
      state.status === "IDLE" ||
      state.status === "COMPLETE"
    ) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    var prev = state.previous_event || MOCK_PREVIOUS_EVENT_CANON;
    var na = state.next_action;
    if (!na) {
      card.hidden = true;
      return;
    }
    var prevHost = document.getElementById("aosv3-handoff-previous");
    if (prevHost) {
      var badgeClass = eventLogBadgeClass(prev.event_type);
      prevHost.innerHTML =
        '<div class="aosv3-handoff-prev-grid">' +
        '<div><span class="sidebar-label">event_type</span><br><span class="' +
        badgeClass +
        '">' +
        esc(prev.event_type) +
        "</span></div>" +
        '<div><span class="sidebar-label">occurred_at</span><br><span class="aosv3-mono">' +
        esc(prev.occurred_at) +
        "</span></div>" +
        '<div><span class="sidebar-label">actor</span><br>' +
        esc(prev.actor_team_id) +
        "</div>" +
        '<div><span class="sidebar-label">gate/phase</span><br>' +
        esc(prev.gate_id) +
        " / " +
        esc(prev.phase_id || "—") +
        "</div>" +
        '<div><span class="sidebar-label">verdict</span><br>' +
        esc(prev.verdict != null ? String(prev.verdict) : "—") +
        "</div>" +
        '<div><span class="sidebar-label">reason</span><br>' +
        esc(prev.reason || "—") +
        "</div></div>";
    }
    var nextHost = document.getElementById("aosv3-handoff-next");
    if (nextHost) {
      nextHost.innerHTML = handoffNextButtonsHtml(na);
    }
    var cliPre = document.getElementById("aosv3-handoff-cli-pre");
    if (cliPre) cliPre.textContent = na.cli_command || "";
    renderHandoffFeedbackForms(state);
    renderHandoffIngestionExtra(state);
    wireHandoffIngestionToggles();
    bindHandoffMockToasts(document.getElementById("aosv3-operator-handoff"));
  }

  function bindHandoffMockToasts(root) {
    if (!root || root._toastBound) return;
    root._toastBound = true;
    root.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-mock-toast]");
      if (!btn) return;
      var msg = btn.getAttribute("data-mock-toast");
      if (msg) showAosv3Toast(msg);
    });
  }

  var _handoffManualFailDocWired = false;
  function wireHandoffManualFailOnce() {
    if (_handoffManualFailDocWired) return;
    _handoffManualFailDocWired = true;
    document.addEventListener(
      "click",
      function (ev) {
        var b = ev.target.closest("[data-handoff-manual-fail]");
        if (!b) return;
        var ta = document.getElementById("aosv3-handoff-manual-reason");
        var v = ta && ta.value.trim();
        if (!v) {
          ev.preventDefault();
          ev.stopPropagation();
          if (ta) {
            ta.setAttribute("aria-invalid", "true");
            ta.focus();
          }
          showAosv3Toast(
            handoffActionToast(
              "Reason is required for Mark FAIL (POST /fail — mock validation)",
              "Reason is required for Mark FAIL (POST /fail)"
            )
          );
          return;
        }
        if (ta) ta.removeAttribute("aria-invalid");
        showAosv3Toast(
          handoffActionToast("Mark FAIL — mock", "Mark FAIL submitted")
        );
      },
      true
    );
    document.addEventListener("input", function (ev) {
      var t = ev.target;
      if (
        t &&
        t.id === "aosv3-handoff-manual-reason" &&
        t.value.trim()
      ) {
        t.removeAttribute("aria-invalid");
      }
    });
  }

  function renderProgramControl(state) {
    var stopBtn = document.getElementById("aosv3-btn-stop-run");
    var idleRow = document.getElementById("aosv3-idle-activate-row");
    var active = !!(
      state.run_id &&
      state.status !== "IDLE" &&
      state.status !== "COMPLETE"
    );
    if (stopBtn) stopBtn.hidden = !active;
    if (idleRow) idleRow.hidden = active;
  }

  function getPipelineViewDomain() {
    try {
      var d = localStorage.getItem("pipeline_domain");
      if (d === "agents_os") return "agents_os";
      return "tiktrack";
    } catch (err) {
      return "tiktrack";
    }
  }

  function updatePipelineDomainButtonStyles() {
    var cur = getPipelineViewDomain();
    document.querySelectorAll("[data-pipeline-domain]").forEach(function (btn) {
      var v = btn.getAttribute("data-pipeline-domain");
      btn.classList.toggle(
        "active-agentsos",
        v === "agents_os" && cur === "agents_os"
      );
      btn.classList.toggle(
        "active-tiktrack",
        v === "tiktrack" && cur === "tiktrack"
      );
    });
  }

  function syncStartRunFormDomainSelect() {
    var form = document.getElementById("aosv3-start-run-form");
    if (!form) return;
    var sel = form.querySelector('select[name="domain_id"]');
    if (!sel) return;
    var d = getPipelineViewDomain();
    if (sel.querySelector('option[value="' + d + '"]')) sel.value = d;
  }

  function onDomainSwitch(domain) {
    localStorage.setItem("pipeline_domain", domain);
    document.documentElement.classList.toggle(
      "theme-tiktrack",
      domain === "tiktrack"
    );
    updatePipelineDomainButtonStyles();
    syncStartRunFormDomainSelect();
    if (typeof window.AOSV3_reapplyPipelinePreset === "function") {
      window.AOSV3_reapplyPipelinePreset();
    }
    try {
      document.dispatchEvent(
        new CustomEvent("aosv3-workspace-domain-changed", {
          detail: { domain: domain },
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  window.AOSV3_onDomainSwitch = onDomainSwitch;

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(ta);
      return Promise.resolve(true);
    } catch (e) {
      document.body.removeChild(ta);
      return Promise.resolve(false);
    }
  }

  window.AOSV3_copyText = function (t) {
    copyToClipboard(t || "");
  };

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {object} [opts]
   * @param {number} [opts.duration]  ms visible (default 2200; errors use 6000)
   * @param {string} [opts.level]     "info" | "error" — adds CSS modifier
   */
  function showAosv3Toast(message, opts) {
    var duration = (opts && opts.duration) || 2200;
    var level = (opts && opts.level) || "info";
    var el = document.getElementById("aosv3-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "aosv3-toast";
      el.className = "aosv3-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = "aosv3-toast aosv3-toast--" + level;
    el.classList.add("aosv3-toast--visible");
    if (el._hideTimer) clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function () {
      el.classList.remove("aosv3-toast--visible");
    }, duration);
  }

  /**
   * Map API error codes to human-readable messages.
   * Returns a string the user can act on.
   */
  function _friendlyErr(code, details, fallback) {
    var d = details || {};
    switch (code) {
      case "DOMAIN_ALREADY_ACTIVE":
        return (
          "דומיין זה כבר מריץ חבילה פעילה" +
          (d.existing_run_id ? " (Run …" + String(d.existing_run_id).slice(-8) + ")" : "") +
          ". עצרו את הריצה הפעילה תחת 'Stop run' ואז הפעילו מחדש."
        );
      case "UNKNOWN_WP":
        return "חבילת עבודה לא נמצאה. בחרו חבילה תקינה מהרשימה.";
      case "DOMAIN_NOT_FOUND":
        return "דומיין לא נמצא — בדקו את בחירת הדומיין.";
      case "DOMAIN_INACTIVE":
        return "הדומיין אינו פעיל — פנו למנהל.";
      case "ROUTING_UNRESOLVED":
        return "אין כלל ניתוב עבור GATE_0. בדקו את הגדרות ה-pipeline.";
      case "WRONG_ACTOR":
        return "צוות שגוי — ה-X-Actor-Team-Id אינו מורשה לפעולה זו.";
      case "INSUFFICIENT_AUTHORITY":
        return "אין הרשאה לפעולה זו — נדרש team_00.";
      case "PHASE_SEQUENCE_ERROR":
        return "שגיאת רצף שלב פנימית — פנו לאדריכל (PHASE_SEQUENCE_ERROR).";
      case "D03_VIOLATION":
        return "team_00 חסר מה-DB — הריצו seed מחדש.";
      default:
        return fallback || (code ? code + ": שגיאה לא צפויה." : "שגיאה לא צפויה.");
    }
  }

  /** Team 00 GATE_3 matrix: gate/phase line tracks current_gate_id / current_phase_id (body placeholder OK). */
  function assembledPromptBodyForState(state) {
    var base = MOCK_ASSEMBLED_PROMPT.prompt_text;
    if (
      !state ||
      !state.run_id ||
      !state.current_gate_id ||
      !state.current_phase_id
    ) {
      return base;
    }
    return base.replace(
      /\*\*Gate:\*\* GATE_\d+ \/ phase_[\w\d_]+/,
      "**Gate:** " + state.current_gate_id + " / " + state.current_phase_id
    );
  }

  function renderPromptSection(state, bustCache) {
    var sec = document.getElementById("aosv3-prompt-section");
    if (!sec) return;
    var show =
      state.run_id &&
      (state.status === "IN_PROGRESS" ||
        state.status === "CORRECTION" ||
        state.status === "PAUSED");
    sec.hidden = !show;
    if (!show) return;

    var runId = state.run_id;
    var url = "/api/runs/" + runId + "/prompt" + (bustCache ? "?bust_cache=true" : "");
    AOSV3_apiJson(url)
      .then(function (data) {
        var pre = document.getElementById("aosv3-prompt-pre");
        var tok = document.getElementById("aosv3-prompt-token-badge");
        var ass = document.getElementById("aosv3-prompt-assembled");
        var cch = document.getElementById("aosv3-prompt-cache");
        var layers = data.layers || {};
        var meta = data.meta || {};
        var parts = [];
        if (layers.L1_template) parts.push(layers.L1_template);
        if (layers.L2_governance) parts.push(layers.L2_governance);
        if (layers.L3_policies_json) parts.push("### Policies\n" + layers.L3_policies_json);
        if (layers.L4_run_json) parts.push("### Run\n" + layers.L4_run_json);
        if (pre) pre.textContent = parts.join("\n\n---\n\n");
        if (tok) tok.textContent = "token count: " + (meta.token_count || "\u2014") + " tokens";
        if (ass) ass.textContent = "assembled_at: " + (meta.assembled_at || new Date().toISOString());
        if (cch) cch.textContent = "cache_hit: " + String(meta.cache_hit || false);
      })
      .catch(function () {
        var p = MOCK_ASSEMBLED_PROMPT;
        var pre = document.getElementById("aosv3-prompt-pre");
        var tok = document.getElementById("aosv3-prompt-token-badge");
        var ass = document.getElementById("aosv3-prompt-assembled");
        var cch = document.getElementById("aosv3-prompt-cache");
        if (pre) pre.textContent = assembledPromptBodyForState(state);
        if (tok) tok.textContent = "token count: " + String(p.token_count) + " tokens";
        if (ass) ass.textContent = "assembled_at: " + p.assembled_at + " (fallback/mock)";
        if (cch) cch.textContent = "cache_hit: " + String(p.cache_hit);
      });
  }

  function renderPipelineState(state) {
    pipelineLastState = state;
    var banner = document.getElementById("aosv3-escalation-banner");
    var showEsc =
      state.escalated === true ||
      state.latest_event_type === "CORRECTION_ESCALATED";
    if (banner) {
      banner.hidden = !showEsc;
    }

    var mainPanel = document.getElementById("aosv3-pipeline-main");
    var emptyEl = document.getElementById("aosv3-empty-state");
    if (!mainPanel || !emptyEl) return;

    if (state.status === "IDLE" || !state.run_id) {
      mainPanel.hidden = true;
      emptyEl.hidden = false;
      renderPromptSection({ run_id: null, status: "IDLE" });
      var approveIdle = document.getElementById("aosv3-btn-approve");
      if (approveIdle) approveIdle.hidden = true;
      var pauseIdle = document.getElementById("aosv3-btn-pause");
      var resumeIdle = document.getElementById("aosv3-btn-resume");
      if (pauseIdle) pauseIdle.hidden = true;
      if (resumeIdle) resumeIdle.hidden = true;
      var viewDom = getPipelineViewDomain();
      var idleDomainEl = document.getElementById("aosv3-domain");
      if (idleDomainEl) idleDomainEl.textContent = viewDom;
      var mainDomIdle = document.getElementById("aosv3-main-domain");
      if (mainDomIdle) mainDomIdle.textContent = viewDom;
      renderGateMap(null, null, "IDLE");
      renderRunLog(null);
      renderProgramControl(state);
      renderSseIndicator(state);
      renderCorrectionBlocking({ status: "IDLE", correction_blocking: null });
      renderOperatorHandoff({
        run_id: null,
        status: "IDLE",
        next_action: null,
      });
      return;
    }
    mainPanel.hidden = false;
    emptyEl.hidden = true;
    renderPromptSection(state);

    var pausedRow = document.getElementById("aosv3-paused-at-row");
    var pausedAt = document.getElementById("aosv3-paused-at");
    if (pausedRow && pausedAt) {
      var isPaused = state.status === "PAUSED";
      pausedRow.hidden = !isPaused;
      pausedAt.textContent =
        isPaused && state.paused_at ? state.paused_at : "—";
    }

    var compRow = document.getElementById("aosv3-completed-at-row");
    var compAt = document.getElementById("aosv3-completed-at");
    if (compRow && compAt) {
      var isComplete = state.status === "COMPLETE";
      compRow.hidden = !isComplete;
      compAt.textContent =
        isComplete && state.completed_at ? state.completed_at : "—";
    }

    var badge = document.getElementById("aosv3-status-badge");
    if (badge) {
      badge.textContent = state.status;
      badge.className = "aosv3-status-badge " + statusBadgeClass(state.status);
    }

    function setText(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text == null ? "—" : text;
    }

    setText("aosv3-run-id", state.run_id);
    setText("aosv3-wp-id", state.work_package_id);
    setText("aosv3-domain", state.domain_id);
    setText("aosv3-main-domain", state.domain_id);
    setText("aosv3-variant", state.process_variant);
    setText("aosv3-gate", state.current_gate_id);
    setText("aosv3-phase", state.current_phase_id);
    setText(
      "aosv3-cc",
      state.correction_cycle_count == null
        ? "—"
        : String(state.correction_cycle_count)
    );
    setText("aosv3-exec-mode", state.execution_mode || "—");
    setText("aosv3-started", state.started_at || "—");
    setText(
      "aosv3-updated",
      state.last_updated || state.completed_at || "—"
    );

    var actorRow = document.getElementById("aosv3-actor-block");
    if (actorRow) {
      if (state.status === "PAUSED" || !state.actor) {
        actorRow.textContent = "—";
        actorRow.setAttribute("data-testid", "actor-null");
      } else {
        actorRow.removeAttribute("data-testid");
        actorRow.textContent =
          state.actor.team_id +
          " · " +
          state.actor.label +
          " · " +
          state.actor.engine;
      }
    }

    var sentEl = document.getElementById("aosv3-sentinel");
    if (sentEl) {
      if (!state.sentinel) {
        sentEl.textContent = "—";
      } else {
        var parts = state.sentinel.active ? ["active"] : ["inactive"];
        if (state.sentinel.override_team) {
          parts.push("override: " + state.sentinel.override_team);
        }
        sentEl.textContent = parts.join(" · ");
      }
    }

    var approveBtn = document.getElementById("aosv3-btn-approve");
    if (approveBtn) {
      var showAppr =
        (state.next_action &&
          state.next_action.type === "HUMAN_APPROVE") ||
        state.is_human_gate === 1;
      approveBtn.hidden = !showAppr;
    }

    var resubmitBtn = document.getElementById("aosv3-btn-resubmit");
    if (resubmitBtn) {
      resubmitBtn.hidden = state.status !== "CORRECTION";
    }

    var pauseBtn = document.getElementById("aosv3-btn-pause");
    var resumeBtn = document.getElementById("aosv3-btn-resume");
    if (pauseBtn && resumeBtn) {
      if (state.status === "COMPLETE") {
        pauseBtn.hidden = true;
        resumeBtn.hidden = true;
      } else if (state.status === "PAUSED") {
        pauseBtn.hidden = true;
        resumeBtn.hidden = false;
      } else if (state.status === "IDLE" || !state.run_id) {
        pauseBtn.hidden = true;
        resumeBtn.hidden = true;
      } else {
        pauseBtn.hidden = false;
        resumeBtn.hidden = true;
      }
    }

    renderGateMap(
      state.current_gate_id,
      state.current_phase_id,
      state.status
    );
    renderRunLog(state.run_id);
    renderProgramControl(state);
    renderSseIndicator(state);
    renderCorrectionBlocking(state);
    renderOperatorHandoff(state);
  }

  function buildPromptCopyPayload() {
    var base = assembledPromptBodyForState(
      pipelineLastState || { run_id: null }
    );
    var parts = [base];
    var inclTeam = document.getElementById("aosv3-prompt-blend-team");
    var inclPol = document.getElementById("aosv3-prompt-blend-policies");
    var actorId =
      pipelineLastState &&
      pipelineLastState.actor &&
      pipelineLastState.actor.team_id;
    var team = findTeamById(actorId || "team_61");
    if (inclTeam && inclTeam.checked && team) {
      var l1 = buildTeamL1(team);
      var l2 = buildTeamL2(team);
      var l3 = buildTeamL3(team);
      var l4 = buildTeamL4(team);
      parts.push(
        "\n\n---\n## Blended — Team context (Teams mock)\n\n### Layer 1\n```\n" +
          l1 +
          "\n```\n\n### Layer 2\n```\n" +
          l2 +
          "\n```\n\n### Layer 3\n```\n" +
          l3 +
          "\n```\n\n### Layer 4\n```\n" +
          l4 +
          "\n```"
      );
    }
    if (inclPol && inclPol.checked) {
      parts.push(
        "\n\n---\n## Blended — Policies (governance mock)\n\n" +
          buildPoliciesMarkdown()
      );
    }
    return parts.join("");
  }

  var PRESETS = {
    active: MOCK_STATE_ACTIVE,
    idle: MOCK_STATE_IDLE,
    paused: MOCK_STATE_PAUSED,
    complete: MOCK_STATE_COMPLETE,
    escalated: MOCK_STATE_ESCALATED,
    human_gate: MOCK_STATE_HUMAN_GATE,
    sentinel: MOCK_STATE_SENTINEL,
    await_feedback: MOCK_STATE_AWAIT_FEEDBACK,
    feedback_fallback: MOCK_STATE_FEEDBACK_FALLBACK,
    feedback_pass: MOCK_STATE_FEEDBACK_PASS,
    feedback_fail: MOCK_STATE_FEEDBACK_FAIL,
    feedback_low: MOCK_STATE_FEEDBACK_LOW,
    correction_blocking: MOCK_STATE_CORRECTION_BLOCKING,
    sse_connected: MOCK_STATE_SSE_CONNECTED,
  };

  function readAosv3QueryParams() {
    try {
      var q = new URLSearchParams(window.location.search || "");
      return {
        preset: q.get("aosv3_preset") || q.get("preset") || "",
        phase: q.get("aosv3_phase") || q.get("phase") || "",
      };
    } catch (e) {
      return { preset: "", phase: "" };
    }
  }

  /** Deep-link tour: force GATE_3 + phase_3_* on any preset (screenshot matrix). */
  function applyGate3PhaseOverride(state, phaseId) {
    if (!state || !state.run_id) return;
    state.current_gate_id = "GATE_3";
    state.current_phase_id = phaseId;
    var na = state.next_action;
    if (na) {
      if (na.type === "CONFIRM_ADVANCE") {
        na.target_gate = "GATE_4";
        na.target_phase = "phase_4_1";
      } else {
        if (na.target_gate != null) na.target_gate = "GATE_3";
        if (na.target_phase != null) na.target_phase = phaseId;
      }
      if (typeof na.label === "string") {
        na.label = na.label.replace(
          /GATE_\d+ \/ phase_[\w\d_]+/g,
          "GATE_3 / " + phaseId
        );
      }
      if (typeof na.cli_command === "string") {
        na.cli_command = na.cli_command
          .replace(/phase_3_1/g, phaseId)
          .replace(/phase_3_2/g, phaseId);
      }
    }
    if (state.previous_event && state.previous_event.phase_id != null) {
      state.previous_event.gate_id = "GATE_3";
      state.previous_event.phase_id = phaseId;
    }
    if (state.correction_blocking) {
      state.correction_blocking.gate_id = "GATE_3";
      state.correction_blocking.phase_id = phaseId;
    }
  }

  function initPipelinePageLive() {
    if (typeof AOSV3_apiJson !== "function") {
      showAosv3Toast("Load api-client.js before app.js");
      return;
    }
    var ps = document.getElementById("aosv3-preset-select");
    if (ps) {
      var mockCard = ps.closest(".sidebar-section-card");
      if (mockCard) mockCard.style.display = "none";
    }
    var liveCard = document.getElementById("aosv3-live-api-card");
    if (liveCard) liveCard.style.display = "";

    var actorIn = document.getElementById("aosv3-live-actor");
    var baseIn = document.getElementById("aosv3-live-api-base");
    if (actorIn) actorIn.value = AOSV3_getActorTeamId();
    if (baseIn) baseIn.value = AOSV3_getApiBase();
    var saveBtn = document.getElementById("aosv3-live-save-settings");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (actorIn) AOSV3_setActorTeamId(actorIn.value);
        if (baseIn) AOSV3_setApiBase(baseIn.value.trim());
        teardownPipelineLiveTransport();
        pipelineLiveSseKey = "";
        loadPipelineStateFromApi(true);
      });
    }

    var actionsHost = document.querySelector(".aosv3-actions");
    if (actionsHost) {
      var acard = actionsHost.closest(".section-card");
      var st0 = acard && acard.querySelector(".section-title");
      if (st0) st0.textContent = "Actions (live API)";
    }

    function teardownPipelineLiveTransport() {
      if (pipelineLivePollTimer) {
        clearInterval(pipelineLivePollTimer);
        pipelineLivePollTimer = null;
      }
      if (pipelineLiveEs) {
        try {
          pipelineLiveEs.close();
        } catch (e1) {
          /* ignore */
        }
        pipelineLiveEs = null;
      }
    }

    function attachSseListeners(es) {
      var refresh = function () {
        loadPipelineStateFromApi(false);
      };
      es.addEventListener("heartbeat", refresh);
      es.addEventListener("pipeline_event", refresh);
      es.addEventListener("run_state_changed", refresh);
      es.addEventListener("feedback_ingested", refresh);
    }

    function maybeStartSse(st) {
      var dom = getPipelineViewDomain();
      var key = (st && st.run_id ? st.run_id : "") + "|" + dom;
      if (key === pipelineLiveSseKey && pipelineLiveEs) return;
      pipelineLiveSseKey = key;
      teardownPipelineLiveTransport();
      var url = AOSV3_buildEventStreamUrl({
        domain_id: dom,
        run_id: st && st.run_id ? st.run_id : undefined,
      });
      try {
        var es = new EventSource(url);
        pipelineLiveEs = es;
        es.onopen = function () {
          pipelineSseConnected = true;
          if (pipelineLastState) {
            pipelineLastState.sse_connected = true;
            renderSseIndicator(pipelineLastState);
          }
        };
        es.onerror = function () {
          pipelineSseConnected = false;
          if (pipelineLastState) {
            pipelineLastState.sse_connected = false;
            renderSseIndicator(pipelineLastState);
          }
        };
        attachSseListeners(es);
      } catch (e2) {
        pipelineSseConnected = false;
      }
      pipelineLivePollTimer = setInterval(function () {
        loadPipelineStateFromApi(false);
      }, 15000);
    }

    function normalizeLiveState(raw) {
      var s = Object.assign({}, raw);
      if (!s.pending_feedback) s.pending_feedback = { has_pending: false };
      if (s.next_action && s.next_action.type === "HUMAN_APPROVE")
        s.is_human_gate = 1;
      else if (s.is_human_gate == null) s.is_human_gate = 0;
      if (s.escalated == null) s.escalated = false;
      if (s.correction_blocking == null) s.correction_blocking = null;
      s.sse_connected = pipelineSseConnected;
      if (s.latest_event_type == null) s.latest_event_type = null;
      return s;
    }

    function loadRunLogFromApi(runId) {
      return AOSV3_apiJson(
        "/api/history?run_id=" +
          encodeURIComponent(runId) +
          "&limit=100&order=desc"
      )
        .then(function (data) {
          var events = (data && data.events) || [];
          var mapped = events.map(function (ev) {
            return {
              sequence_no: ev.sequence_no,
              occurred_at: ev.occurred_at,
              event_type: ev.event_type,
              gate_id: ev.gate_id,
              phase_id: ev.phase_id,
              run_id: ev.run_id,
              actor: ev.actor
                ? {
                    team_id: ev.actor.team_id,
                    label: ev.actor.label || "",
                  }
                : null,
              verdict: ev.verdict,
              reason: ev.reason,
            };
          });
          pipelineLiveHistoryCache = { runId: runId, events: mapped };
          renderRunLog(runId);
        })
        .catch(function () {
          pipelineLiveHistoryCache = null;
          renderRunLog(runId);
        });
    }

    function checkEscalation(runId) {
      return AOSV3_apiJson(
        "/api/history?run_id=" +
          encodeURIComponent(runId) +
          "&limit=20&order=desc"
      )
        .then(function (data) {
          var events = (data && data.events) || [];
          var esc = events.some(function (e) {
            return e.event_type === "CORRECTION_ESCALATED";
          });
          if (pipelineLastState && pipelineLastState.run_id === runId) {
            pipelineLastState.escalated = esc;
            pipelineLastState.latest_event_type =
              events.length && events[0].event_type
                ? events[0].event_type
                : null;
            var banner = document.getElementById("aosv3-escalation-banner");
            if (banner) {
              banner.hidden = !(
                pipelineLastState.escalated ||
                pipelineLastState.latest_event_type ===
                  "CORRECTION_ESCALATED"
              );
            }
          }
        })
        .catch(function () {
          /* ignore */
        });
    }

    function loadPipelineStateFromApi(showErr) {
      var dom = getPipelineViewDomain();
      return AOSV3_apiJson(
        "/api/state?domain_id=" + encodeURIComponent(dom)
      )
        .then(function (data) {
          var st = normalizeLiveState(data);
          pipelineLastState = st;
          renderPipelineState(st);
          if (st.run_id) {
            loadRunLogFromApi(st.run_id);
            checkEscalation(st.run_id);
          } else {
            pipelineLiveHistoryCache = null;
            renderRunLog(null);
          }
          maybeStartSse(st);
        })
        .catch(function (err) {
          if (showErr) showAosv3Toast(err.message || String(err));
        });
    }

    window.AOSV3_reapplyPipelinePreset = function () {
      teardownPipelineLiveTransport();
      pipelineLiveSseKey = "";
      loadPipelineStateFromApi(true);
    };

    function wireLiveAction(btn, fn) {
      if (!btn) return;
      btn.removeAttribute("disabled");
      btn.onclick = fn;
    }

    function postJson(path, body) {
      return AOSV3_apiJson(path, {
        method: "POST",
        body: JSON.stringify(body || {}),
      });
    }

    function rid() {
      return pipelineLastState && pipelineLastState.run_id;
    }

    wireLiveAction(document.getElementById("aosv3-btn-advance"), function () {
      var r = rid();
      if (!r) return;
      var sum = window.prompt("Advance summary", "Phase complete");
      if (sum == null) return;
      postJson("/api/runs/" + encodeURIComponent(r) + "/advance", {
        verdict: "pass",
        summary: sum,
      })
        .then(function () {
          showAosv3Toast("שלב הועבר בהצלחה ✓");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          var code = e.body && e.body.detail && e.body.detail.code;
          showAosv3Toast(_friendlyErr(code, e.body && e.body.detail && e.body.detail.details, e.message), { level: "error", duration: 6000 });
        });
    });

    wireLiveAction(document.getElementById("aosv3-btn-fail"), function () {
      var r = rid();
      if (!r) return;
      var reason = window.prompt("Fail reason", "Blocking issue");
      if (reason == null || !reason.trim()) return;
      postJson("/api/runs/" + encodeURIComponent(r) + "/fail", {
        reason: reason.trim(),
        findings: null,
      })
        .then(function () {
          showAosv3Toast("כישלון שלב נרשם.");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          var code = e.body && e.body.detail && e.body.detail.code;
          showAosv3Toast(_friendlyErr(code, e.body && e.body.detail && e.body.detail.details, e.message), { level: "error", duration: 6000 });
        });
    });

    wireLiveAction(document.getElementById("aosv3-btn-approve"), function () {
      var r = rid();
      if (!r) return;
      var notes = window.prompt("Approval notes (optional)", "") || "";
      postJson("/api/runs/" + encodeURIComponent(r) + "/approve", {
        approval_notes: notes,
      })
        .then(function () {
          showAosv3Toast("אושר ✓");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          var code = e.body && e.body.detail && e.body.detail.code;
          showAosv3Toast(_friendlyErr(code, e.body && e.body.detail && e.body.detail.details, e.message), { level: "error", duration: 6000 });
        });
    });

    wireLiveAction(document.getElementById("aosv3-btn-pause"), function () {
      var r = rid();
      if (!r) return;
      var pr = window.prompt("Pause reason", "operator pause");
      if (pr == null || !pr.trim()) return;
      postJson("/api/runs/" + encodeURIComponent(r) + "/pause", {
        pause_reason: pr.trim(),
      })
        .then(function () {
          showAosv3Toast("ריצה הושהתה.");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          var code = e.body && e.body.detail && e.body.detail.code;
          showAosv3Toast(_friendlyErr(code, e.body && e.body.detail && e.body.detail.details, e.message), { level: "error", duration: 6000 });
        });
    });

    wireLiveAction(document.getElementById("aosv3-btn-resume"), function () {
      var r = rid();
      if (!r) return;
      postJson("/api/runs/" + encodeURIComponent(r) + "/resume", {
        resume_notes: "",
      })
        .then(function () {
          showAosv3Toast("ריצה חודשה ✓");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          var code = e.body && e.body.detail && e.body.detail.code;
          showAosv3Toast(_friendlyErr(code, e.body && e.body.detail && e.body.detail.details, e.message), { level: "error", duration: 6000 });
        });
    });

    wireLiveAction(document.getElementById("aosv3-btn-resubmit"), function () {
      var r = rid();
      if (!r) return;
      var sum = window.prompt("Resubmit summary", "correction applied");
      if (sum == null) return;
      postJson("/api/runs/" + encodeURIComponent(r) + "/advance", {
        verdict: "resubmit",
        summary: sum,
      })
        .then(function () {
          showAosv3Toast("Resubmit sent");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          showAosv3Toast(e.message || String(e));
        });
    });

    wireLiveAction(document.getElementById("aosv3-btn-override"), function () {
      showAosv3Toast("Principal override — use CLI from handoff block");
    });

    // ── Prompt: wire Regenerate button ─────────────────────────────────────
    var regenBtn = document.getElementById("aosv3-prompt-regenerate");
    if (regenBtn) {
      regenBtn.disabled = false;
      regenBtn.onclick = function () {
        if (pipelineLastState && pipelineLastState.run_id) {
          renderPromptSection(pipelineLastState, true);
        }
      };
    }

    // ── Start Run: populate WP select ──────────────────────────────────────
    function populateWpSelect() {
      var sel = document.getElementById("aosv3-wp-select");
      if (!sel) return;
      AOSV3_apiJson("/api/work-packages")
        .then(function (data) {
          var wps = (data && data.work_packages) || [];
          sel.innerHTML = '<option value="">— select work package —</option>';
          wps.forEach(function (wp) {
            var id = wp.wp_id || wp.id;
            var opt = document.createElement("option");
            opt.value = id;
            opt.textContent = id + (wp.label ? " \u2014 " + wp.label : "");
            sel.appendChild(opt);
          });
        })
        .catch(function () {
          var sel2 = document.getElementById("aosv3-wp-select");
          if (sel2) sel2.innerHTML = '<option value="">— failed to load —</option>';
        });
    }
    populateWpSelect();

    document.addEventListener("aosv3-workspace-domain-changed", function () {
      populateWpSelect();
    });

    // ── Start Run: wire button ──────────────────────────────────────────────
    wireLiveAction(document.querySelector(".aosv3-start-run-btn"), function () {
      var form = document.getElementById("aosv3-start-run-form");
      if (!form) return;
      var wpId = (form.querySelector('[name="work_package_id"]').value || "").trim();
      var domainId = form.querySelector('[name="domain_id"]').value;
      var variant = form.querySelector('[name="process_variant"]').value || null;
      if (!wpId) { showAosv3Toast("Work Package ID is required"); return; }
      postJson("/api/runs", {
        work_package_id: wpId,
        domain_id: domainId,
        process_variant: variant || null,
      })
        .then(function () {
          showAosv3Toast("ריצה הופעלה בהצלחה ✓");
          return loadPipelineStateFromApi(true);
        })
        .catch(function (e) {
          var code = e.body && e.body.detail && e.body.detail.code;
          var details = e.body && e.body.detail && e.body.detail.details;
          var msg = _friendlyErr(code, details, e.message || String(e));
          showAosv3Toast(msg, { duration: 8000, level: "error" });
          // For DOMAIN_ALREADY_ACTIVE also force-load pipeline state so the
          // active run and Stop Run button become visible immediately.
          if (code === "DOMAIN_ALREADY_ACTIVE") {
            loadPipelineStateFromApi(true);
          }
        });
    });

    updatePipelineDomainButtonStyles();
    syncStartRunFormDomainSelect();
    loadPipelineStateFromApi(true);
  }


  function initPipelinePage() {
    if (!aosv3UseMock()) {
      initPipelinePageLive();
      return;
    }
    var sel = document.getElementById("aosv3-preset-select");
    var copyBtn = document.getElementById("aosv3-prompt-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var payload = buildPromptCopyPayload();
        var blendTeam = document.getElementById("aosv3-prompt-blend-team");
        var blendPol = document.getElementById("aosv3-prompt-blend-policies");
        var blended =
          (blendTeam && blendTeam.checked) || (blendPol && blendPol.checked);
        copyToClipboard(payload).then(function (ok) {
          showAosv3Toast(
            ok
              ? blended
                ? "Copied (prompt + selected blends)"
                : "Copied to clipboard"
              : "Copy failed"
          );
        });
      });
    }
    var actSel = document.getElementById("aosv3-activate-target");
    if (actSel && !actSel.options.length) {
      MOCK_ACTIVATABLE_TARGETS.forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o.id;
        opt.textContent = o.label;
        actSel.appendChild(opt);
      });
    }
    var stopModal = document.getElementById("aosv3-modal-stop-run");
    function openStopModal() {
      if (stopModal) {
        stopModal.classList.add("open");
        stopModal.setAttribute("aria-hidden", "false");
      }
    }
    function closeStopModal() {
      if (stopModal) {
        stopModal.classList.remove("open");
        stopModal.setAttribute("aria-hidden", "true");
      }
    }
    var stopRun = document.getElementById("aosv3-btn-stop-run");
    if (stopRun) {
      stopRun.addEventListener("click", function () {
        openStopModal();
      });
    }
    if (stopModal) {
      stopModal.addEventListener("click", function (ev) {
        if (ev.target === stopModal) closeStopModal();
      });
      stopModal.querySelectorAll("[data-aosv3-modal-close]").forEach(function (b) {
        b.addEventListener("click", closeStopModal);
      });
    }
    var stopConfirm = document.getElementById("aosv3-modal-stop-confirm");
    if (stopConfirm) {
      stopConfirm.addEventListener("click", function () {
        closeStopModal();
        if (aosv3UseMock()) {
          showAosv3Toast("Stop run confirmed (mock — no API call)");
          return;
        }
        var runId = rid();
        if (!runId) {
          showAosv3Toast("לא נמצאה ריצה פעילה לעצירה.", { level: "error", duration: 5000 });
          return;
        }
        // Principal override FORCE_FAIL — stops the active run (→ CORRECTION, unblocks domain).
        // X-Actor-Team-Id is team_00 for principal overrides.
        AOSV3_apiFetch("/api/runs/" + encodeURIComponent(runId) + "/override", {
          method: "POST",
          body: JSON.stringify({ actor_team_id: "team_00", action: "FORCE_FAIL", reason: "Stopped by operator via UI" }),
          headers: { "Content-Type": "application/json", "X-Actor-Team-Id": "team_00" },
          skipActorHeader: true,
        })
          .then(function (r) { return r.json(); })
          .then(function () {
            showAosv3Toast("ריצה עצורה. ניתן כעת להפעיל חבילה חדשה.");
            return loadPipelineStateFromApi(true);
          })
          .catch(function (e) {
            showAosv3Toast(
              "שגיאה בעצירת הריצה: " + (e.message || String(e)),
              { level: "error", duration: 6000 }
            );
          });
      });
    }
    var cliCopy = document.getElementById("aosv3-handoff-cli-copy");
    if (cliCopy) {
      cliCopy.addEventListener("click", function () {
        var pre = document.getElementById("aosv3-handoff-cli-pre");
        var t = pre ? pre.textContent : "";
        copyToClipboard(t).then(function (ok) {
          showAosv3Toast(ok ? "CLI command copied" : "Copy failed");
        });
      });
    }
    var actBtn = document.getElementById("aosv3-btn-activate-program");
    if (actBtn) {
      actBtn.addEventListener("click", function () {
        var v = actSel && actSel.value;
        showAosv3Toast(
          v ? "Activate — mock selection: " + v : "Select a program or WP"
        );
      });
    }
    function applyPreset() {
      var key = sel ? sel.value : "active";
      var st = JSON.parse(JSON.stringify(PRESETS[key] || PRESETS.active));
      st.domain_id = getPipelineViewDomain();
      var qp = readAosv3QueryParams();
      if (qp.phase === "phase_3_1" || qp.phase === "phase_3_2") {
        applyGate3PhaseOverride(st, qp.phase);
      }
      renderPipelineState(st);
    }
    window.AOSV3_reapplyPipelinePreset = applyPreset;
    if (sel) {
      var iq = readAosv3QueryParams();
      if (iq.preset && PRESETS[iq.preset]) sel.value = iq.preset;
      sel.addEventListener("change", applyPreset);
    }
    wireHandoffManualFailOnce();
    applyDevScenariosVisibility();
    updatePipelineDomainButtonStyles();
    syncStartRunFormDomainSelect();
    applyPreset();
  }

  function cloneEvents() {
    return MOCK_HISTORY.events.map(function (e) {
      return JSON.parse(JSON.stringify(e));
    });
  }

  function initHistoryPageLive() {
    if (typeof AOSV3_apiJson !== "function") {
      showAosv3Toast("Load api-client.js before app.js");
      return;
    }
    var tbody = document.getElementById("aosv3-history-tbody");
    var totalEl = document.getElementById("aosv3-history-total");
    var filterGate = document.getElementById("aosv3-filter-gate");
    var filterType = document.getElementById("aosv3-filter-event-type");
    var filterActor = document.getElementById("aosv3-filter-actor");
    var filterRunId = document.getElementById("aosv3-filter-run-id");
    var limitEl = document.getElementById("aosv3-limit");
    var offsetEl = document.getElementById("aosv3-offset");
    var orderEl = document.getElementById("aosv3-order");
    var prevBtn = document.getElementById("aosv3-page-prev");
    var nextBtn = document.getElementById("aosv3-page-next");
    var runSelect = document.getElementById("aosv3-history-run-select");
    var runApply = document.getElementById("aosv3-history-run-apply");

    if (filterType && filterType.options.length <= 1) {
      EVENT_TYPES.forEach(function (t) {
        var opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        filterType.appendChild(opt);
      });
    }

    function ensureGateOption(gid) {
      if (!filterGate || !gid) return;
      var found = false;
      for (var i = 0; i < filterGate.options.length; i++) {
        if (filterGate.options[i].value === gid) {
          found = true;
          break;
        }
      }
      if (!found) {
        var opt = document.createElement("option");
        opt.value = gid;
        opt.textContent = gid;
        filterGate.appendChild(opt);
      }
    }

    function buildHistoryQuery() {
      var order = orderEl && orderEl.value === "asc" ? "asc" : "desc";
      var limit = parseInt(limitEl && limitEl.value, 10) || 50;
      if (limit > 200) limit = 200;
      var offset = parseInt(offsetEl && offsetEl.value, 10) || 0;
      if (offset < 0) offset = 0;
      var q = new URLSearchParams();
      q.set("limit", String(limit));
      q.set("offset", String(offset));
      q.set("order", order);
      var dScope = historyDomainQueryValue();
      if (dScope === "agents_os")
        q.set("domain_id", "01JK8AOSV3DOMAIN00000001");
      else if (dScope === "tiktrack")
        q.set("domain_id", "01JK8AOSV3DOMAIN00000002");
      if (filterGate && filterGate.value) q.set("gate_id", filterGate.value);
      if (filterType && filterType.value)
        q.set("event_type", filterType.value);
      if (filterActor && filterActor.value.trim())
        q.set("actor_team_id", filterActor.value.trim());
      if (filterRunId && filterRunId.value.trim())
        q.set("run_id", filterRunId.value.trim());
      return "/api/history?" + q.toString();
    }

    function renderRows(events) {
      if (!tbody) return;
      tbody.innerHTML = "";
      (events || []).forEach(function (e) {
        ensureGateOption(e.gate_id);
        var tr = document.createElement("tr");
        if (e.event_type === "GATE_FAILED_ADVISORY") {
          tr.className = "aosv3-row--advisory";
        } else if (e.event_type === "GATE_FAILED_BLOCKING") {
          tr.className = "aosv3-row--blocking";
        }
        var badgeClass = eventLogBadgeClass(e.event_type);
        var act = e.actor || {};
        var actorTxt = act.team_id
          ? esc(act.team_id) + " · " + esc(act.label || "")
          : "—";
        var verdict = e.verdict != null ? esc(e.verdict) : "—";
        tr.innerHTML =
          "<td>" +
          esc(e.occurred_at) +
          '</td><td><span class="' +
          badgeClass +
          '">' +
          esc(e.event_type) +
          "</span></td><td>" +
          esc(e.gate_id || "—") +
          " / " +
          esc(e.phase_id || "—") +
          "</td><td>" +
          actorTxt +
          "</td><td>" +
          verdict +
          "</td><td>" +
          esc(e.reason) +
          "</td>";
        tbody.appendChild(tr);
      });
    }

    function renderTable() {
      AOSV3_apiJson(buildHistoryQuery())
        .then(function (data) {
          if (totalEl) totalEl.textContent = String(data.total || 0);
          (data.events || []).forEach(function (e) {
            ensureGateOption(e.gate_id);
          });
          if (!window.__aosv3HistorySort)
            window.__aosv3HistorySort = { key: "occurred_at", dir: -1 };
          var st = window.__aosv3HistorySort;
          if (st.key === "occurred_at" && orderEl) {
            st.dir = orderEl.value === "asc" ? 1 : -1;
          }
          renderRows(historySortEventsList(data.events || [], st));
        })
        .catch(function (err) {
          showAosv3Toast(err.message || String(err));
        });
    }

    function bind(el, ev, fn) {
      if (el) el.addEventListener(ev, fn);
    }

    bind(filterGate, "change", renderTable);
    bind(filterType, "change", renderTable);
    bind(filterActor, "input", renderTable);
    bind(filterRunId, "input", renderTable);
    bind(limitEl, "change", renderTable);
    bind(orderEl, "change", renderTable);
    bind(offsetEl, "change", renderTable);

    bind(prevBtn, "click", function () {
      var limit = parseInt(limitEl && limitEl.value, 10) || 50;
      if (limit > 200) limit = 200;
      var off = parseInt(offsetEl && offsetEl.value, 10) || 0;
      off = Math.max(0, off - limit);
      if (offsetEl) offsetEl.value = String(off);
      renderTable();
    });
    bind(nextBtn, "click", function () {
      var limit = parseInt(limitEl && limitEl.value, 10) || 50;
      if (limit > 200) limit = 200;
      var off = parseInt(offsetEl && offsetEl.value, 10) || 0;
      off += limit;
      if (offsetEl) offsetEl.value = String(off);
      renderTable();
    });

    if (runSelect && runSelect.options.length === 0) {
      var place = document.createElement("option");
      place.value = "";
      place.textContent = "(loading runs…)";
      runSelect.appendChild(place);
      AOSV3_apiJson("/api/runs?limit=100&offset=0")
        .then(function (d) {
          runSelect.innerHTML = "";
          var o0 = document.createElement("option");
          o0.value = "";
          o0.textContent = "(all runs)";
          runSelect.appendChild(o0);
          (d.runs || []).forEach(function (r) {
            var opt = document.createElement("option");
            opt.value = r.run_id;
            opt.textContent =
              runUlidSuffix(r.run_id) +
              " · " +
              esc(r.work_package_id || "") +
              " · " +
              esc(r.status || "");
            runSelect.appendChild(opt);
          });
        })
        .catch(function () {
          runSelect.innerHTML = "";
          var o0 = document.createElement("option");
          o0.value = "";
          o0.textContent = "(all runs)";
          runSelect.appendChild(o0);
        });
    }
    if (runApply && filterRunId) {
      runApply.addEventListener("click", function () {
        filterRunId.value = runSelect ? runSelect.value : "";
        renderTable();
      });
    }

    var qRun = "";
    try {
      qRun = new URLSearchParams(window.location.search).get("run_id") || "";
    } catch (e1) {
      qRun = "";
    }
    if (qRun && filterRunId) filterRunId.value = qRun;

    document.addEventListener("aosv3-workspace-domain-changed", function (ev) {
      var d = ev.detail && ev.detail.domain;
      if (d !== "agents_os" && d !== "tiktrack") return;
      setUiDomainScope(d);
      var sel = document.getElementById("aosv3-ui-domain-scope");
      if (sel) sel.value = d;
      renderTable();
    });

    window.__aosv3HistoryRerender = renderTable;
    wireHistoryTableSort("aosv3-history-table", renderTable);
    renderTable();
  }

  function initHistoryPage() {
    if (!aosv3UseMock()) {
      initHistoryPageLive();
      return;
    }
    var tbody = document.getElementById("aosv3-history-tbody");
    var totalEl = document.getElementById("aosv3-history-total");
    var filterGate = document.getElementById("aosv3-filter-gate");
    var filterType = document.getElementById("aosv3-filter-event-type");
    var filterActor = document.getElementById("aosv3-filter-actor");
    var filterRunId = document.getElementById("aosv3-filter-run-id");
    var limitEl = document.getElementById("aosv3-limit");
    var offsetEl = document.getElementById("aosv3-offset");
    var orderEl = document.getElementById("aosv3-order");
    var prevBtn = document.getElementById("aosv3-page-prev");
    var nextBtn = document.getElementById("aosv3-page-next");

    if (filterType) {
      EVENT_TYPES.forEach(function (t) {
        var opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        filterType.appendChild(opt);
      });
    }

    function uniqueGates(events) {
      var g = {};
      events.forEach(function (e) {
        if (e.gate_id) g[e.gate_id] = true;
      });
      return Object.keys(g).sort();
    }

    if (filterGate) {
      uniqueGates(MOCK_HISTORY.events).forEach(function (gid) {
        var opt = document.createElement("option");
        opt.value = gid;
        opt.textContent = gid;
        filterGate.appendChild(opt);
      });
    }

    function filterEvents(all) {
      return all.filter(function (e) {
        var dScope = historyDomainQueryValue();
        if (dScope && e.domain_id !== dScope) return false;
        if (filterGate && filterGate.value && e.gate_id !== filterGate.value)
          return false;
        if (filterType && filterType.value && e.event_type !== filterType.value)
          return false;
        if (
          filterActor &&
          filterActor.value &&
          (!e.actor || e.actor.team_id !== filterActor.value)
        )
          return false;
        if (
          filterRunId &&
          filterRunId.value.trim() &&
          e.run_id !== filterRunId.value.trim()
        )
          return false;
        return true;
      });
    }

    function renderTable() {
      var all = cloneEvents();
      var filtered = filterEvents(all);
      if (!window.__aosv3HistorySort)
        window.__aosv3HistorySort = { key: "occurred_at", dir: -1 };
      var st = window.__aosv3HistorySort;
      if (st.key === "occurred_at" && orderEl) {
        st.dir = orderEl.value === "asc" ? 1 : -1;
      }
      var sorted = historySortEventsList(filtered, st);
      var limit = parseInt(limitEl && limitEl.value, 10) || 50;
      if (limit > 200) limit = 200;
      var offset = parseInt(offsetEl && offsetEl.value, 10) || 0;
      if (offset < 0) offset = 0;
      if (offset >= sorted.length && sorted.length > 0) {
        offset = Math.floor((sorted.length - 1) / limit) * limit;
        if (offsetEl) offsetEl.value = String(offset);
      }
      var page = sorted.slice(offset, offset + limit);

      if (totalEl) totalEl.textContent = String(sorted.length);

      if (!tbody) return;
      tbody.innerHTML = "";
      page.forEach(function (e) {
        var tr = document.createElement("tr");
        if (e.event_type === "GATE_FAILED_ADVISORY") {
          tr.className = "aosv3-row--advisory";
        } else if (e.event_type === "GATE_FAILED_BLOCKING") {
          tr.className = "aosv3-row--blocking";
        }
        var badgeClass = eventLogBadgeClass(e.event_type);
        var actorTxt = e.actor
          ? esc(e.actor.team_id) + " · " + esc(e.actor.label)
          : "—";
        var verdict = e.verdict != null ? esc(e.verdict) : "—";
        tr.innerHTML =
          "<td>" +
          esc(e.occurred_at) +
          '</td><td><span class="' +
          badgeClass +
          '">' +
          esc(e.event_type) +
          "</span></td><td>" +
          esc(e.gate_id) +
          " / " +
          esc(e.phase_id || "—") +
          "</td><td>" +
          actorTxt +
          "</td><td>" +
          verdict +
          "</td><td>" +
          esc(e.reason) +
          "</td>";
        tbody.appendChild(tr);
      });
    }

    function bind(el, ev, fn) {
      if (el) el.addEventListener(ev, fn);
    }

    bind(filterGate, "change", renderTable);
    bind(filterType, "change", renderTable);
    bind(filterActor, "input", function () {
      renderTable();
    });
    bind(filterRunId, "input", renderTable);
    bind(limitEl, "change", renderTable);
    bind(orderEl, "change", renderTable);
    bind(offsetEl, "change", renderTable);

    bind(prevBtn, "click", function () {
      var limit = parseInt(limitEl && limitEl.value, 10) || 50;
      if (limit > 200) limit = 200;
      var off = parseInt(offsetEl && offsetEl.value, 10) || 0;
      off = Math.max(0, off - limit);
      if (offsetEl) offsetEl.value = String(off);
      renderTable();
    });
    bind(nextBtn, "click", function () {
      var limit = parseInt(limitEl && limitEl.value, 10) || 50;
      if (limit > 200) limit = 200;
      var off = parseInt(offsetEl && offsetEl.value, 10) || 0;
      var st = window.__aosv3HistorySort || { key: "occurred_at", dir: -1 };
      if (st.key === "occurred_at" && orderEl) {
        st.dir = orderEl.value === "asc" ? 1 : -1;
      }
      var all = historySortEventsList(filterEvents(cloneEvents()), st);
      if (off + limit < all.length) {
        off += limit;
        if (offsetEl) offsetEl.value = String(off);
      }
      renderTable();
    });

    var runSelect = document.getElementById("aosv3-history-run-select");
    var runApply = document.getElementById("aosv3-history-run-apply");
    if (runSelect && runSelect.options.length === 0) {
      [
        { v: "", t: "(all runs)" },
        {
          v: MOCK_RID_STAGE8B,
          t:
            runUlidSuffix(MOCK_RID_STAGE8B) +
            " · S003-P011-WP001 · IN_PROGRESS",
        },
        {
          v: MOCK_RID_STAGE8B_DONE,
          t:
            runUlidSuffix(MOCK_RID_STAGE8B_DONE) +
            " · S003-P009-WP001 · COMPLETE",
        },
      ].forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o.v;
        opt.textContent = o.t;
        runSelect.appendChild(opt);
      });
    }
    if (runApply && filterRunId) {
      runApply.addEventListener("click", function () {
        filterRunId.value = runSelect ? runSelect.value : "";
        renderTable();
      });
    }

    var qRun = "";
    try {
      qRun = new URLSearchParams(window.location.search).get("run_id") || "";
    } catch (e1) {
      qRun = "";
    }
    if (qRun && filterRunId) filterRunId.value = qRun;

    document.addEventListener("aosv3-workspace-domain-changed", function (ev) {
      var d = ev.detail && ev.detail.domain;
      if (d !== "agents_os" && d !== "tiktrack") return;
      setUiDomainScope(d);
      var sel = document.getElementById("aosv3-ui-domain-scope");
      if (sel) sel.value = d;
      renderTable();
    });

    window.__aosv3HistoryRerender = renderTable;
    wireHistoryTableSort("aosv3-history-table", renderTable);
    renderTable();
  }

  function initConfigPageLive() {
    if (typeof AOSV3_apiJson !== "function") {
      showAosv3Toast("Load api-client.js before app.js");
      return;
    }
    Promise.all([
      AOSV3_apiJson("/api/routing-rules"),
      AOSV3_apiJson("/api/policies"),
      AOSV3_apiJson("/api/templates"),
    ])
      .then(function (pack) {
        var rr = pack[0].routing_rules || [];
        var policies = pack[1].policies || [];
        var templates = pack[2].templates || [];
        MOCK_ROUTING.routing_rules = rr.map(function (r) {
          return {
            id: r.id,
            gate_id: r.gate_id,
            phase_id: r.phase_id,
            domain_id: r.domain_id,
            variant: r.variant,
            role_id: r.role_id,
            priority: r.priority,
          };
        });
        MOCK_POLICIES.policies = policies.map(function (p) {
          var v = p.policy_value_json;
          if (v != null && typeof v === "object") v = JSON.stringify(v);
          return {
            policy_key: p.policy_key,
            scope_type: p.scope_type,
            domain_id: p.domain_id || null,
            gate_id: p.gate_id || null,
            policy_value_json: typeof v === "string" ? v : String(v),
          };
        });
        MOCK_TEMPLATES.templates = templates.map(function (t) {
          var ia = t.is_active;
          var active = ia === 1 || ia === "1" || ia === true;
          return {
            id: t.id,
            name: t.name || t.id,
            gate_id: t.gate_id,
            phase_id: t.phase_id,
            domain_id: t.domain_id,
            version: t.version != null ? t.version : 1,
            is_active: active,
            body_markdown: t.body_markdown || "",
          };
        });
        window.__aosv3ConfigPrefetched = true;
        initConfigPage();
      })
      .catch(function (e) {
        showAosv3Toast(e.message || String(e));
      });
  }

  function initConfigPage() {
    if (!aosv3UseMock()) {
      if (!window.__aosv3ConfigPrefetched) {
        initConfigPageLive();
        return;
      }
      window.__aosv3ConfigPrefetched = false;
    }
    var tabs = document.querySelectorAll(".aosv3-tab");
    var panels = document.querySelectorAll(".aosv3-tab-panel");

    function showTab(id) {
      tabs.forEach(function (t) {
        t.classList.toggle("active", t.getAttribute("data-tab") === id);
      });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.id === "aosv3-panel-" + id);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showTab(tab.getAttribute("data-tab"));
      });
    });

    var rrBody = document.getElementById("aosv3-routing-tbody");
    var tmplRoot = document.getElementById("aosv3-templates-list");
    var polBody = document.getElementById("aosv3-policies-tbody");

    if (!window.__aosv3ConfigSort) {
      window.__aosv3ConfigSort = {
        routing: { key: "priority", dir: 1 },
        policies: { key: "policy_key", dir: 1 },
      };
    }
    var configSortState = window.__aosv3ConfigSort;

    function wireConfigTableSort(tableId, scope, rerender) {
      var tbl = document.getElementById(tableId);
      if (!tbl || tbl._aosv3ConfigSortWired) return;
      tbl._aosv3ConfigSortWired = true;
      tbl.querySelectorAll("thead th[data-sort-key]").forEach(function (th) {
        th.style.cursor = "pointer";
        th.addEventListener("click", function () {
          var k = th.getAttribute("data-sort-key");
          var st = configSortState[scope];
          if (st.key === k) st.dir = -st.dir;
          else {
            st.key = k;
            st.dir = 1;
          }
          tbl.querySelectorAll("thead th[data-sort-key]").forEach(function (h) {
            h.removeAttribute("aria-sort");
          });
          th.setAttribute(
            "aria-sort",
            st.dir > 0 ? "ascending" : "descending"
          );
          rerender();
        });
      });
    }

    function renderConfigDomainTables() {
      if (rrBody) {
        rrBody.innerHTML = "";
        var stR = configSortState.routing;
        var rrRows = MOCK_ROUTING.routing_rules.slice().sort(function (a, b) {
          return aosv3TableSortCompare(a[stR.key], b[stR.key], stR.dir);
        });
        var _DOMAIN_SLUG = {
          "01JK8AOSV3DOMAIN00000001": "agents_os",
          "01JK8AOSV3DOMAIN00000002": "tiktrack",
        };
        if (!rrRows.length) {
          rrBody.innerHTML = '<tr><td colspan="7" class="aosv3-empty-state">No routing rules defined</td></tr>';
        } else {
          rrRows.forEach(function (r) {
            var domLabel = r.domain_id
              ? (_DOMAIN_SLUG[r.domain_id] || r.domain_id)
              : "(all domains)";
            var tr = document.createElement("tr");
            tr.innerHTML =
              "<td>" +
              esc(r.id) +
              "</td><td>" +
              esc(r.gate_id) +
              "</td><td>" +
              esc(r.phase_id) +
              "</td><td>" +
              esc(domLabel) +
              "</td><td>" +
              esc(r.variant) +
              "</td><td>" +
              esc(r.role_id) +
              "</td><td>" +
              esc(r.priority) +
              "</td>";
            rrBody.appendChild(tr);
          });
        }
      }
      if (polBody) {
        polBody.innerHTML = "";
        var stP = configSortState.policies;
        var polRows = MOCK_POLICIES.policies.slice().sort(function (a, b) {
          return aosv3TableSortCompare(a[stP.key], b[stP.key], stP.dir);
        });
        var _DOMAIN_SLUG_POL = {
          "01JK8AOSV3DOMAIN00000001": "agents_os",
          "01JK8AOSV3DOMAIN00000002": "tiktrack",
        };
        if (!polRows.length) {
          polBody.innerHTML = '<tr><td colspan="5" class="aosv3-empty-state">No policies defined</td></tr>';
        } else {
          polRows.forEach(function (p) {
            var parsed;
            try {
              parsed = JSON.stringify(JSON.parse(p.policy_value_json), null, 2);
            } catch (e) {
              parsed = p.policy_value_json;
            }
            var domLabel = p.domain_id
              ? (_DOMAIN_SLUG_POL[p.domain_id] || p.domain_id)
              : "—";
            var tr = document.createElement("tr");
            tr.innerHTML =
              "<td>" +
              esc(p.policy_key) +
              "</td><td>" +
              esc(p.scope_type) +
              "</td><td>" +
              esc(domLabel) +
              "</td><td>" +
              esc(p.gate_id || "—") +
              "</td><td><pre class=\"aosv3-json-pre\">" +
              esc(parsed) +
              "</pre></td>" +
              '<td><button type="button" class="btn" disabled title="team_00 only">Edit (team_00 only)</button></td>';
            polBody.appendChild(tr);
          });
        }
      }
      if (tmplRoot) {
        tmplRoot.innerHTML = "";
        if (!MOCK_TEMPLATES.templates.length) {
          tmplRoot.innerHTML = '<p class="aosv3-empty-state">No templates defined</p>';
        }
        MOCK_TEMPLATES.templates.forEach(function (t, i) {
          var div = document.createElement("div");
          div.className = "aosv3-template-item";
          var scope =
            esc(t.gate_id) +
            " / " +
            esc(t.phase_id || "—") +
            " / " +
            esc(t.domain_id || "—");
          div.innerHTML =
            '<div class="aosv3-template-head">' +
            "<strong>" +
            esc(t.name) +
            "</strong>" +
            '<span class="status-pill pill-pending">v' +
            esc(t.version) +
            "</span>" +
            (t.is_active
              ? '<span class="status-pill pill-pass">active</span>'
              : '<span class="status-pill pill-pending">inactive</span>') +
            '<button type="button" class="btn aosv3-template-toggle" data-idx="' +
            i +
            '">Preview body</button>' +
            '<button type="button" class="btn" disabled title="team_00 only">Edit (team_00 only)</button>' +
            "</div>" +
            '<div class="aosv3-kv"><dt>Scope</dt><dd>' +
            scope +
            "</dd></div>" +
            '<div class="aosv3-template-preview" id="aosv3-tmpl-preview-' +
            i +
            '">' +
            esc(t.body_markdown) +
            "</div>";
          tmplRoot.appendChild(div);
        });
      }
    }

    if (tmplRoot && !tmplRoot._aosv3TmplDelegated) {
      tmplRoot._aosv3TmplDelegated = true;
      tmplRoot.addEventListener("click", function (ev) {
        var btn = ev.target.closest(".aosv3-template-toggle");
        if (!btn) return;
        var item = btn.closest(".aosv3-template-item");
        if (item) item.classList.toggle("is-open");
      });
    }

    wireConfigTableSort("aosv3-config-table-routing", "routing", renderConfigDomainTables);
    wireConfigTableSort("aosv3-config-table-policies", "policies", renderConfigDomainTables);
    renderConfigDomainTables();

    showTab("routing");
  }

  function formatRelativeTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    var t = d.getTime();
    if (isNaN(t)) return iso;
    var diff = Math.floor((Date.now() - t) / 1000);
    if (diff < 60) return String(diff) + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  function runUlidSuffix(ulid) {
    if (!ulid || String(ulid).length < 8) return ulid || "—";
    return "…" + String(ulid).slice(-8);
  }

  function teamLabelById(tid) {
    var found = MOCK_TEAMS.teams.filter(function (t) {
      return t.team_id === tid;
    })[0];
    return found ? found.label : tid;
  }

  function activeDomainsWithRuns() {
    var d = {};
    MOCK_PORTFOLIO_ACTIVE.runs.forEach(function (r) {
      if (matchesUiDataScope(r.domain_id, r.domain_slug))
        d[r.domain_id] = true;
    });
    return d;
  }

  function team61L1Dynamic(team) {
    return (
      "Team: team_61\nName: Cloud Agent / DevOps Automation\nEngine: " +
      team.engine +
      "\nDomain: agents_os\nParent: team_11 (AOS Gateway)\nChildren: none"
    );
  }
  var TEAM61_L2 =
    "Authority: Agents_OS V2 infrastructure, CI/CD, quality scans\nWrites to: agents_os_v2/, _COMMUNICATION/team_61/\nIron Rules:\n1. Run tests before push\n2. No force push to main\n3. Verify 0 test failures before push";
  var TEAM61_L4 =
    "Gate 3 Requirements: Implementation per LOD400 spec.\nDeliverables: Production code + unit tests.\nAcceptance Criteria: All tests pass, no linter errors.";

  function recentEventsForActor(teamId, limit) {
    var lim = limit || 5;
    var evs = MOCK_HISTORY.events.filter(function (e) {
      return e.actor && e.actor.team_id === teamId;
    });
    evs.sort(function (a, b) {
      return new Date(b.occurred_at) - new Date(a.occurred_at);
    });
    return evs.slice(0, lim);
  }

  function buildTeamL3(team) {
    var lines = [];
    lines.push(
      "Active Run: " +
        MOCK_STATE_ACTIVE.work_package_id +
        " (" +
        MOCK_STATE_ACTIVE.domain_id +
        ")"
    );
    lines.push(
      "Gate: " +
        MOCK_STATE_ACTIVE.current_gate_id +
        " / " +
        MOCK_STATE_ACTIVE.current_phase_id
    );
    lines.push("Status: " + MOCK_STATE_ACTIVE.status);
    lines.push(
      team.has_active_assignment
        ? "Assignment: Active"
        : "Assignment: None"
    );
    var recent = recentEventsForActor(team.team_id, 5);
    lines.push(
      "Recent events: " +
        (recent.length
          ? recent
              .map(function (e) {
                return e.event_type + " @ " + e.occurred_at;
              })
              .join("; ")
          : "(none in mock ledger for this team)")
    );
    return lines.join("\n");
  }

  function buildTeamL1(team) {
    if (team.team_id === "team_61") return team61L1Dynamic(team);
    var ch =
      team.children && team.children.length
        ? team.children.join(", ")
        : "none";
    var par = team.parent_team_id || "—";
    return (
      "Team: " +
      team.team_id +
      "\nName: " +
      team.name +
      "\nEngine: " +
      team.engine +
      "\nDomain: " +
      team.domain_scope +
      "\nParent: " +
      par +
      "\nChildren: " +
      ch
    );
  }

  function buildTeamL2(team) {
    if (team.team_id === "team_61") return TEAM61_L2;
    return (
      "Authority: (mock — see team mandate)\nWrites to: _COMMUNICATION/" +
      team.team_id +
      "/\nIron Rules:\n1. Follow domain scope: " +
      team.domain_scope
    );
  }

  function buildTeamL4(team) {
    if (team.team_id === "team_61") return TEAM61_L4;
    return "No Layer 4 task in this mock.";
  }

  function initTeamsPageLive() {
    if (typeof AOSV3_apiJson !== "function") {
      showAosv3Toast("Load api-client.js before app.js");
      return;
    }
    AOSV3_apiJson("/api/teams")
      .then(function (d) {
        MOCK_TEAMS.teams = (d.teams || []).map(function (t) {
          return {
            team_id: t.team_id,
            label: t.label,
            name: t.name,
            engine: t.engine,
            group: t.group,
            profession: t.profession,
            domain_scope: t.domain_scope,
            parent_team_id: t.parent_team_id,
            children: t.children || [],
            has_active_assignment: !!t.has_active_assignment,
          };
        });
        window.__aosv3TeamsPrefetched = true;
        initTeamsPage();
      })
      .catch(function (e) {
        showAosv3Toast(e.message || String(e));
      });
  }

  function initTeamsPage() {
    if (!aosv3UseMock()) {
      if (!window.__aosv3TeamsPrefetched) {
        initTeamsPageLive();
        return;
      }
      window.__aosv3TeamsPrefetched = false;
    }
    var listEl = document.getElementById("aosv3-team-list");
    var ctxEl = document.getElementById("aosv3-team-context");
    var detailEl = document.getElementById("aosv3-team-detail");
    var orgEl = document.getElementById("aosv3-org-tree");
    var grp = document.getElementById("aosv3-team-filter-group");
    var curOnly = document.getElementById("aosv3-team-filter-current");
    var selected = "team_61";

    if (!initTeamsPage._workspaceDomainHooked) {
      initTeamsPage._workspaceDomainHooked = true;
      document.addEventListener("aosv3-workspace-domain-changed", function (ev) {
        var d = ev.detail && ev.detail.domain;
        if (d !== "agents_os" && d !== "tiktrack") return;
        setUiDomainScope(d);
        var sel = document.getElementById("aosv3-ui-domain-scope");
        if (sel) sel.value = d;
        if (typeof window.__aosv3TeamsRerender === "function") {
          window.__aosv3TeamsRerender();
        }
      });
    }
    var ENGINE_OPTIONS = [
      "cursor",
      "cursor_composer",
      "claude",
      "claude_code",
      "codex",
      "openai",
      "human",
      "orchestrator",
    ];

    function badgeEngine(eng) {
      return (
        '<span class="aosv3-engine-badge aosv3-engine--' +
        esc(eng) +
        '">' +
        esc(eng) +
        "</span>"
      );
    }

    function filterTeam(t) {
      if (curOnly && curOnly.checked && !t.has_active_assignment) return false;
      var g = grp ? grp.value : "all";
      if (g === "aos") {
        if (t.group !== "x1_aos" && t.group !== "cross_domain") return false;
      } else if (g === "tiktrack") {
        if (t.domain_scope !== "tiktrack" && t.group !== "x0_tiktrack")
          return false;
      } else if (g === "cross") {
        if (t.group !== "cross_domain") return false;
      }
      var d = getUiDomainScope();
      if (d === "agents_os") {
        if (t.domain_scope !== "agents_os" && t.domain_scope !== "all")
          return false;
      } else if (d === "tiktrack") {
        if (t.domain_scope !== "tiktrack" && t.domain_scope !== "all")
          return false;
      }
      return true;
    }

    function renderOrgTree() {
      if (!orgEl) return;
      function buildUl(parentId) {
        var kids = MOCK_TEAMS.teams.filter(function (t) {
          return (t.parent_team_id || null) === parentId;
        });
        kids.sort(function (a, b) {
          return a.team_id.localeCompare(b.team_id);
        });
        if (!kids.length) return "";
        var html = "<ul>";
        kids.forEach(function (t) {
          html +=
            "<li><button type=\"button\" class=\"aosv3-org-node\" data-team-id=\"" +
            esc(t.team_id) +
            "\">" +
            esc(t.team_id) +
            "</button>";
          html += buildUl(t.team_id);
          html += "</li>";
        });
        html += "</ul>";
        return html;
      }
      var roots = MOCK_TEAMS.teams.filter(function (t) {
        return !t.parent_team_id;
      });
      roots.sort(function (a, b) {
        return a.team_id.localeCompare(b.team_id);
      });
      var out = "<ul>";
      roots.forEach(function (t) {
        out +=
          "<li><button type=\"button\" class=\"aosv3-org-node aosv3-org-node--root\" data-team-id=\"" +
          esc(t.team_id) +
          "\">" +
          esc(t.team_id) +
          "</button>";
        out += buildUl(t.team_id);
        out += "</li>";
      });
      out += "</ul>";
      orgEl.innerHTML = out;
      orgEl.querySelectorAll("[data-team-id]").forEach(function (node) {
        node.addEventListener("click", function () {
          selected = node.getAttribute("data-team-id");
          renderRoster();
        });
      });
    }

    function buildEngineOptionsString(team) {
      var engineChoices = ENGINE_OPTIONS.slice();
      if (team.engine && engineChoices.indexOf(team.engine) < 0) {
        engineChoices = engineChoices.concat([team.engine]);
        engineChoices.sort();
      }
      return engineChoices.map(function (e) {
        return (
          '<option value="' +
          esc(e) +
          '"' +
          (team.engine === e ? " selected" : "") +
          ">" +
          esc(e) +
          "</option>"
        );
      }).join("");
    }

    function renderDetail(team) {
      if (!detailEl || !team) return;
      var childrenStr =
        team.children && team.children.length
          ? team.children.join(", ")
          : "—";
      detailEl.innerHTML =
        '<div class="section-title">Roster fields</div>' +
        '<p class="aosv3-sidebar-hint">Engine is edited under <strong>Layer 1 — Identity</strong>.</p>' +
        '<dl class="aosv3-team-detail-grid">' +
        "<dt>team_id</dt><dd>" +
        esc(team.team_id) +
        "</dd>" +
        "<dt>label</dt><dd>" +
        esc(team.label) +
        "</dd>" +
        "<dt>name</dt><dd>" +
        esc(team.name) +
        "</dd>" +
        "<dt>engine</dt><dd>" +
        badgeEngine(team.engine) +
        " <span class=\"aosv3-sidebar-hint\">(see Layer 1)</span></dd>" +
        "<dt>group</dt><dd>" +
        esc(team.group) +
        "</dd>" +
        "<dt>profession</dt><dd>" +
        esc(team.profession) +
        "</dd>" +
        "<dt>domain_scope</dt><dd>" +
        esc(team.domain_scope) +
        "</dd>" +
        "<dt>parent_team_id</dt><dd>" +
        esc(team.parent_team_id || "—") +
        "</dd>" +
        "<dt>children</dt><dd class=\"aosv3-mono\">" +
        esc(childrenStr) +
        "</dd>" +
        "<dt>has_active_assignment</dt><dd>" +
        (team.has_active_assignment
          ? '<span class="aosv3-status-badge aosv3-status--in_progress">yes</span>'
          : '<span class="aosv3-status-badge aosv3-status--idle">no</span>') +
        "</dd>" +
        "</dl>";
    }

    function wireLayer1EngineEditor(team) {
      if (!ctxEl || !team) return;
      var saveEng = ctxEl.querySelector(".aosv3-layer1-card .aosv3-team-engine-save");
      var sel = ctxEl.querySelector(".aosv3-layer1-card .aosv3-team-engine-select");
      if (!saveEng || !sel) return;
      saveEng.addEventListener("click", function () {
        var id = saveEng.getAttribute("data-team-id");
        var tm = MOCK_TEAMS.teams.filter(function (x) {
          return x.team_id === id;
        })[0];
        if (!tm) return;
        var newEng = sel.value;
        if (!aosv3UseMock()) {
          if (typeof AOSV3_apiJson !== "function") return;
          AOSV3_apiJson(
            "/api/teams/" + encodeURIComponent(id) + "/engine",
            {
              method: "PUT",
              body: JSON.stringify({ engine: newEng }),
            }
          )
            .then(function () {
              tm.engine = newEng;
              showAosv3Toast("Engine persisted: " + id + " → " + newEng);
              renderRoster();
              renderDetail(tm);
              renderContext(tm);
            })
            .catch(function (e) {
              showAosv3Toast(e.message || String(e));
            });
          return;
        }
        var prev = tm.engine;
        tm.engine = newEng;
        showAosv3Toast(
          "Engine updated: " + id + " → " + newEng + " (was " + prev + ")"
        );
        renderRoster();
        renderDetail(tm);
        renderContext(tm);
      });
    }

    function renderContext(team) {
      if (!ctxEl) return;
      var l1 = buildTeamL1(team);
      var l2 = buildTeamL2(team);
      var l3 = buildTeamL3(team);
      var l4 = buildTeamL4(team);
      ctxEl.innerHTML =
        '<div class="section-card"><div class="section-title">Context layers</div><p class="aosv3-sidebar-hint">Roster fields are read-only here. Engine is under <strong>Layer 1 — Identity</strong>. Copy L1–L4 below.</p></div>' +
        '<div class="section-card aosv3-layer1-card"><div class="section-title">Layer 1 — Identity</div>' +
        '<div class="aosv3-layer1-engine-row">' +
        '<label class="aosv3-form-label" for="aosv3-layer1-engine-select">engine</label> ' +
        '<select id="aosv3-layer1-engine-select" class="aosv3-input aosv3-team-engine-select" aria-label="Engine" data-team-id="' +
        esc(team.team_id) +
        '">' +
        buildEngineOptionsString(team) +
        '</select> ' +
        '<button type="button" class="btn btn-primary aosv3-team-engine-save" data-team-id="' +
        esc(team.team_id) +
        '">Save</button> ' +
        '<span class="aosv3-sidebar-hint">Principal (team_00) only</span></div>' +
        '<pre class="aosv3-context-pre">' +
        esc(l1) +
        '</pre><button type="button" class="btn" id="aosv3-copy-l1">Copy L1</button></div>' +
        '<div class="section-card"><div class="section-title">Layer 2 — Governance</div><pre class="aosv3-context-pre">' +
        esc(l2) +
        '</pre><button type="button" class="btn" id="aosv3-copy-l2">Copy L2</button></div>' +
        '<div class="section-card"><div class="section-title">Layer 3 — Current State</div><pre class="aosv3-context-pre">' +
        esc(l3) +
        '</pre><button type="button" class="btn" id="aosv3-copy-l3">Copy L3</button></div>' +
        '<div class="section-card"><div class="section-title">Layer 4 — Task</div><pre class="aosv3-context-pre">' +
        esc(l4) +
        '</pre><button type="button" class="btn" id="aosv3-copy-l4">Copy L4</button></div>' +
        '<div class="aosv3-context-actions">' +
        '<button type="button" class="btn btn-primary" id="aosv3-copy-full">Copy Full Context</button> ' +
        '<button type="button" class="btn" id="aosv3-team-refresh">Refresh</button></div>';

      function wireCopy(id, text) {
        var b = document.getElementById(id);
        if (b)
          b.addEventListener("click", function () {
            copyToClipboard(text);
          });
      }
      wireCopy("aosv3-copy-l1", l1);
      wireCopy("aosv3-copy-l2", l2);
      wireCopy("aosv3-copy-l3", l3);
      wireCopy("aosv3-copy-l4", l4);
      wireLayer1EngineEditor(team);
      var teamHeading = team.label || team.team_id;
      var fullMd =
        "# " +
        teamHeading +
        " — Session Context\n\n" +
        "## Layer 1 — Identity\n\n```\n" +
        l1 +
        "\n```\n\n## Layer 2 — Governance\n\n```\n" +
        l2 +
        "\n```\n\n## Layer 3 — Current State\n\n```\n" +
        l3 +
        "\n```\n\n## Layer 4 — Task\n\n```\n" +
        l4 +
        "\n```\n";
      var copyFullBtn = document.getElementById("aosv3-copy-full");
      if (copyFullBtn) {
        copyFullBtn.addEventListener("click", function () {
          copyToClipboard(fullMd).then(function (ok) {
            showAosv3Toast(ok ? "Copied to clipboard" : "Copy failed");
          });
        });
      }
      var ref = document.getElementById("aosv3-team-refresh");
      if (ref)
        ref.addEventListener("click", function () {
          var tm = MOCK_TEAMS.teams.filter(function (x) {
            return x.team_id === selected;
          })[0];
          if (tm) {
            renderDetail(tm);
            renderContext(tm);
          }
        });
    }

    function renderRoster() {
      if (!listEl) return;
      listEl.innerHTML = "";
      var filtered = MOCK_TEAMS.teams.filter(filterTeam);
      filtered.sort(function (a, b) {
        return a.team_id.localeCompare(b.team_id);
      });
      var curSel = filtered.filter(function (x) {
        return x.team_id === selected;
      })[0];
      if (!curSel && filtered.length) {
        selected = filtered[0].team_id;
        renderRoster();
        return;
      }
      filtered.forEach(function (t) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "aosv3-team-row" +
          (t.team_id === selected ? " aosv3-team-row--selected" : "");
        btn.setAttribute("data-team-id", t.team_id);
        var star = t.has_active_assignment
          ? '<span class="aosv3-team-row-star" title="active assignment">★</span>'
          : "";
        var dot = t.has_active_assignment
          ? '<span class="aosv3-assign-dot aosv3-assign-dot--on" title="assignment"></span>'
          : '<span class="aosv3-assign-dot" title="no assignment"></span>';
        btn.innerHTML =
          dot +
          '<span class="aosv3-team-row-id">' +
          esc(t.team_id) +
          "</span>" +
          badgeEngine(t.engine) +
          star;
        btn.addEventListener("click", function () {
          selected = t.team_id;
          renderRoster();
        });
        listEl.appendChild(btn);
      });
      var selTeam = filtered.filter(function (x) {
        return x.team_id === selected;
      })[0];
      if (selTeam) {
        renderDetail(selTeam);
        renderContext(selTeam);
      } else if (detailEl) {
        detailEl.innerHTML =
          '<p class="aosv3-sidebar-hint">No team matches filters.</p>';
        if (ctxEl) ctxEl.innerHTML = "";
      }
    }

    if (grp) grp.addEventListener("change", renderRoster);
    if (curOnly) curOnly.addEventListener("change", renderRoster);
    renderOrgTree();
    renderRoster();
    window.__aosv3TeamsRerender = renderRoster;
  }

  function initPortfolioPageLive() {
    if (typeof AOSV3_apiJson !== "function") {
      showAosv3Toast("Load api-client.js before app.js");
      return;
    }
    Promise.all([
      AOSV3_apiJson(
        "/api/runs?status=IN_PROGRESS,CORRECTION,PAUSED&limit=100&offset=0"
      ),
      AOSV3_apiJson("/api/runs?status=COMPLETE&limit=100&offset=0"),
      AOSV3_apiJson("/api/work-packages"),
      AOSV3_apiJson("/api/ideas?limit=200&offset=0"),
    ])
      .then(function (p) {
        MOCK_PORTFOLIO_ACTIVE = {
          total: p[0].total,
          runs: (p[0].runs || []).map(function (r) {
            return {
              run_id: r.run_id,
              work_package_id: r.work_package_id,
              domain_id: r.domain_id,
              domain_slug: r.domain_slug || null,
              work_package_label: r.work_package_label || null,
              work_package_program_id: r.work_package_program_id || null,
              status: r.status,
              process_variant: r.process_variant,
              current_gate_id: r.current_gate_id,
              current_phase_id: r.current_phase_id,
              correction_cycle_count: r.correction_cycle_count,
              started_at: r.started_at || "",
              completed_at: r.completed_at,
              current_actor_team_id: r.current_actor_team_id,
            };
          }),
        };
        MOCK_PORTFOLIO_COMPLETED = {
          runs: (p[1].runs || []).map(function (r) {
            return {
              run_id: r.run_id,
              work_package_id: r.work_package_id,
              domain_id: r.domain_id,
              domain_slug: r.domain_slug || null,
              work_package_label: r.work_package_label || null,
              work_package_program_id: r.work_package_program_id || null,
              status: r.status,
              current_gate_id: r.current_gate_id,
              current_phase_id: r.current_phase_id,
              correction_cycle_count: r.correction_cycle_count,
              started_at: r.started_at || "",
              completed_at: r.completed_at || "",
              gates_completed: "—",
            };
          }),
        };
        MOCK_WORK_PACKAGES = {
          work_packages: (p[2].work_packages || []).map(function (w) {
            return {
              wp_id: w.wp_id,
              label: w.label,
              domain_id: w.domain_id,
              domain_slug: w.domain_slug || null,
              status: w.status,
              linked_run_id: w.linked_run_id,
              stage_id: w.stage_id || null,
              program_id: w.program_id || null,
              linked_run_status: null,
              current_gate_id: null,
              current_phase_id: null,
              linked_actor_team_id: null,
              linked_run_started_at: null,
              created_at: null,
              updated_at: null,
            };
          }),
        };
        MOCK_IDEAS_SEED = (p[3].ideas || []).map(function (i) {
          return {
            idea_id: i.idea_id,
            title: i.title,
            description: i.description,
            domain_id: i.domain_id || "agents_os",
            domain_slug: i.domain_slug || null,
            idea_type: "FEATURE",
            status: i.status,
            priority: i.priority,
            submitted_by: i.submitted_by,
            submitted_at: i.submitted_at,
            decision_notes: i.decision_notes,
            target_program_id: i.target_program_id,
          };
        });
        window.__aosv3PfPrefetched = true;
        initPortfolioPage();
      })
      .catch(function (e) {
        showAosv3Toast(e.message || String(e));
      });
  }

  function initPortfolioPage() {
    if (!aosv3UseMock()) {
      if (!window.__aosv3PfPrefetched) {
        initPortfolioPageLive();
        return;
      }
      window.__aosv3PfPrefetched = false;
    }
    var ideas = MOCK_IDEAS_SEED.map(function (x) {
      return JSON.parse(JSON.stringify(x));
    });
    ideas.forEach(function (idea) {
      if (!idea.domain_id) idea.domain_id = "agents_os";
      if (!idea.idea_type) idea.idea_type = "FEATURE";
    });
    var completedOffset = 0;
    var completedLimit = 10;
    var selectedPortfolioGate = "";

    var portfolioSortState = window.__aosv3PortfolioSort;
    if (!portfolioSortState) {
      portfolioSortState = {
        active: { key: "started_at", dir: -1 },
        completed: { key: "started_at", dir: -1 },
        ideas: { key: "submitted_at", dir: -1 },
        wp: { key: "label", dir: 1 },
      };
      window.__aosv3PortfolioSort = portfolioSortState;
    }

    function portfolioSortCompare(va, vb, mul) {
      return aosv3TableSortCompare(va, vb, mul);
    }

    function wirePortfolioTableSort(tableId, scope, rerender) {
      var tbl = document.getElementById(tableId);
      if (!tbl || tbl._aosv3PortfolioSortWired) return;
      tbl._aosv3PortfolioSortWired = true;
      tbl.querySelectorAll("thead th[data-sort-key]").forEach(function (th) {
        th.style.cursor = "pointer";
        th.addEventListener("click", function () {
          var k = th.getAttribute("data-sort-key");
          var st = portfolioSortState[scope];
          if (st.key === k) st.dir = -st.dir;
          else {
            st.key = k;
            st.dir = 1;
          }
          tbl.querySelectorAll("thead th[data-sort-key]").forEach(function (h) {
            h.removeAttribute("aria-sort");
          });
          th.setAttribute(
            "aria-sort",
            st.dir > 0 ? "ascending" : "descending"
          );
          rerender();
        });
      });
    }

    function portfolioFilteredCompletedRuns() {
      return MOCK_PORTFOLIO_COMPLETED.runs.filter(function (r) {
        return matchesUiDataScope(r.domain_id, r.domain_slug);
      });
    }

    var gateFilterEl = document.getElementById("aosv3-portfolio-gate-filter");
    var gateApplyBtn = document.getElementById("aosv3-portfolio-gate-apply");
    if (gateApplyBtn && gateFilterEl) {
      gateApplyBtn.addEventListener("click", function () {
        selectedPortfolioGate = gateFilterEl.value || "";
        renderActive();
      });
    }

    var tabs = document.querySelectorAll("[data-portfolio-tab]");
    var panels = document.querySelectorAll("[data-portfolio-panel]");

    function showPortfolioTab(id) {
      tabs.forEach(function (t) {
        t.classList.toggle("active", t.getAttribute("data-portfolio-tab") === id);
      });
      panels.forEach(function (p) {
        p.classList.toggle(
          "active",
          p.getAttribute("data-portfolio-panel") === id
        );
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showPortfolioTab(tab.getAttribute("data-portfolio-tab"));
      });
    });

    function renderActive() {
      var tb = document.getElementById("aosv3-portfolio-active-tbody");
      if (!tb) return;
      tb.innerHTML = "";
      var rows = [];
      MOCK_PORTFOLIO_ACTIVE.runs.forEach(function (r) {
        if (!matchesUiDataScope(r.domain_id, r.domain_slug)) return;
        if (
          selectedPortfolioGate &&
          r.current_gate_id !== selectedPortfolioGate
        )
          return;
        var wp = wpMetaById(r.work_package_id);
        rows.push({
          run_id: r.run_id,
          work_package_id: r.work_package_id,
          wp_label: wp.label || "",
          program_key:
            canonicalProgramFromWpId(r.work_package_id) ||
            String(wp.program_id || ""),
          domain_id: r.domain_id,
          status: r.status,
          current_gate_id: r.current_gate_id,
          current_phase_id: r.current_phase_id,
          phase_key:
            (r.current_gate_id || "") +
            " " +
            (r.current_phase_id || ""),
          correction_cycle_count: r.correction_cycle_count,
          started_at: r.started_at || "",
          current_actor_team_id: r.current_actor_team_id || "",
          __r: r,
        });
      });
      var stA = portfolioSortState.active;
      var skA = stA.key;
      var mulA = stA.dir;
      rows.sort(function (a, b) {
        return portfolioSortCompare(a[skA], b[skA], mulA);
      });
      rows.forEach(function (row) {
        var r = row.__r;
        var tr = document.createElement("tr");
        var actorLbl = teamLabelById(r.current_actor_team_id);
        var wp = wpMetaById(r.work_package_id);
        var wpLab = wp.label || r.work_package_label || "";
        var wpProg =
          wp.program_id != null && String(wp.program_id).trim() !== ""
            ? wp.program_id
            : r.work_package_program_id;
        tr.innerHTML =
          '<td><span title="' +
          esc(r.run_id) +
          '">' +
          esc(runUlidSuffix(r.run_id)) +
          "</span></td><td>" +
          domainPillHtml(r.domain_id) +
          "</td><td><span title=\"" +
          esc(r.work_package_id) +
          '">' +
          esc(wpLab || "—") +
          "</span></td><td>" +
          programTableCell(r.work_package_id, wpProg) +
          '</td><td><span class="aosv3-status-badge ' +
          statusBadgeClass(r.status) +
          "\">" +
          esc(r.status) +
          '</span></td><td><span class="aosv3-gate-pill aosv3-gate-pill--active">' +
          esc(r.current_gate_id || "—") +
          "</span></td><td>" +
          esc(r.current_gate_id) +
          " / " +
          esc(r.current_phase_id) +
          "</td><td>" +
          esc(String(r.correction_cycle_count)) +
          '</td><td class="aosv3-mono" title="' +
          esc(formatRelativeTime(r.started_at)) +
          '">' +
          esc(r.started_at || "—") +
          "</td><td>" +
          domainPillHtml(r.current_actor_team_id, actorLbl) +
          '</td><td class="aosv3-table-actions"><span class="aosv3-table-actions-inner">' +
          '<button type="button" class="btn" disabled>View</button>' +
          '<button type="button" class="btn" disabled>Pause</button>' +
          '<button type="button" class="btn" disabled>Override (team_00)</button>' +
          "</span></td>";
        tb.appendChild(tr);
      });
    }

    function renderCompleted() {
      var tb = document.getElementById("aosv3-portfolio-completed-tbody");
      if (!tb) return;
      var runs = portfolioFilteredCompletedRuns();
      var rows = runs.map(function (r) {
        var wp = wpMetaById(r.work_package_id);
        return {
          run_id: r.run_id,
          work_package_id: r.work_package_id,
          wp_label: wp.label || "",
          program_key:
            canonicalProgramFromWpId(r.work_package_id) ||
            String(wp.program_id || ""),
          domain_id: r.domain_id,
          status: "COMPLETE",
          gates_completed: r.gates_completed || "",
          started_at: r.started_at || "",
          completed_at: r.completed_at || "",
          started_completed:
            (r.started_at || "") + " " + (r.completed_at || ""),
          correction_cycle_count: r.correction_cycle_count,
          __r: r,
        };
      });
      var stC = portfolioSortState.completed;
      rows.sort(function (a, b) {
        return portfolioSortCompare(a[stC.key], b[stC.key], stC.dir);
      });
      var slice = rows.slice(completedOffset, completedOffset + completedLimit);
      tb.innerHTML = "";
      slice.forEach(function (row) {
        var r = row.__r;
        var wp = wpMetaById(r.work_package_id);
        var wpLabC = wp.label || r.work_package_label || "";
        var wpProgC =
          wp.program_id != null && String(wp.program_id).trim() !== ""
            ? wp.program_id
            : r.work_package_program_id;
        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td><span title="' +
          esc(r.run_id) +
          '">' +
          esc(runUlidSuffix(r.run_id)) +
          "</span></td><td>" +
          domainPillHtml(r.domain_id) +
          "</td><td><span title=\"" +
          esc(r.work_package_id) +
          '">' +
          esc(wpLabC || "—") +
          "</span></td><td>" +
          programTableCell(r.work_package_id, wpProgC) +
          "</td><td><span class=\"aosv3-status-badge aosv3-status--complete\">COMPLETE</span></td><td>" +
          esc(r.gates_completed || "5/5 gates") +
          "</td><td>" +
          esc(r.started_at) +
          " → " +
          esc(r.completed_at) +
          "</td><td>" +
          esc(String(r.correction_cycle_count)) +
          '</td><td><a class="btn" href="history.html?run_id=' +
          encodeURIComponent(r.run_id) +
          '">View History</a></td>';
        tb.appendChild(tr);
      });
      var tot = document.getElementById("aosv3-completed-total");
      if (tot) tot.textContent = String(runs.length);
      var offEl = document.getElementById("aosv3-completed-offset");
      if (offEl) offEl.value = String(completedOffset);
    }

    var modalWp = document.getElementById("aosv3-modal-wp-detail");

    function openWpDetailModal(w) {
      var body = document.getElementById("aosv3-wp-detail-body");
      var hist = document.getElementById("aosv3-wp-detail-view-history");
      if (!body || !modalWp) return;
      var actorDisp = w.linked_actor_team_id
        ? esc(w.linked_actor_team_id) +
          " — " +
          esc(teamLabelById(w.linked_actor_team_id) || "")
        : "—";
      body.innerHTML =
        "<p><strong>WP ID:</strong> " +
        esc(w.wp_id) +
        "</p>" +
        "<p><strong>Label:</strong> " +
        esc(w.label) +
        "</p>" +
        "<p><strong>Domain:</strong> " +
        domainPillHtml(w.domain_id) +
        "</p>" +
        "<p><strong>Status:</strong> <span class=\"aosv3-status-badge " +
        wpStatusBadgeClass(w.status) +
        "\">" +
        esc(w.status) +
        "</span></p>" +
        "<hr><p><strong>Linked Run:</strong> " +
        (w.linked_run_id
          ? '<span class="aosv3-mono" title="' +
            esc(w.linked_run_id) +
            '">' +
            esc(runUlidSuffix(w.linked_run_id)) +
            "</span>"
          : "—") +
        "</p>" +
        "<p><strong>Run Status:</strong> " +
        esc(w.linked_run_status || "—") +
        "</p>" +
        "<p><strong>Current:</strong> " +
        esc(w.current_gate_id || "—") +
        " / " +
        esc(w.current_phase_id || "—") +
        "</p>" +
        "<p><strong>Actor:</strong> " +
        actorDisp +
        "</p>" +
        "<p><strong>Started:</strong> " +
        esc(w.linked_run_started_at || "—") +
        "</p>" +
        "<p><strong>Created:</strong> " +
        esc(w.created_at || "—") +
        "</p>" +
        "<p><strong>Updated:</strong> " +
        esc(w.updated_at || "—") +
        "</p>";
      if (hist) {
        if (w.linked_run_id) {
          hist.href =
            "history.html?run_id=" + encodeURIComponent(w.linked_run_id);
          hist.hidden = false;
        } else {
          hist.href = "#";
          hist.hidden = true;
        }
      }
      openModal(modalWp);
    }

    function renderWp() {
      var tb = document.getElementById("aosv3-portfolio-wp-tbody");
      if (!tb) return;
      var activeDom = activeDomainsWithRuns();
      tb.innerHTML = "";

      // Group WPs by stage_id; null stage_id goes to "Other"
      var stageOrder = [];
      var stageMap = {};
      MOCK_WORK_PACKAGES.work_packages
        .filter(function (w) {
          return matchesUiDataScope(w.domain_id, w.domain_slug);
        })
        .forEach(function (w) {
          var key = w.stage_id || "__other__";
          if (!stageMap[key]) {
            stageMap[key] = [];
            stageOrder.push(key);
          }
          stageMap[key].push(w);
        });

      stageOrder.forEach(function (stageKey) {
        // Milestone section header row
        var headerTr = document.createElement("tr");
        headerTr.className = "aosv3-wp-milestone-header";
        var stageLabel = stageKey === "__other__" ? "Other / No Milestone" : stageKey;
        headerTr.innerHTML =
          '<td colspan="8" class="aosv3-wp-milestone-label">' + esc(stageLabel) + "</td>";
        tb.appendChild(headerTr);

        var stW = portfolioSortState.wp;
        var skW = stW.key;
        var mulW = stW.dir;
        stageMap[stageKey].sort(function (a, b) {
          var va =
            skW === "program_key"
              ? canonicalProgramFromWpId(a.wp_id) ||
                String(a.program_id || "")
              : a[skW];
          var vb =
            skW === "program_key"
              ? canonicalProgramFromWpId(b.wp_id) ||
                String(b.program_id || "")
              : b[skW];
          return portfolioSortCompare(va, vb, mulW);
        });
        stageMap[stageKey].forEach(function (w) {
          var canStart = w.status === "PLANNED" && !activeDom[w.domain_id];
          var tr = document.createElement("tr");
          tr.className = "aosv3-wp-row aosv3-wp-row--clickable";
          tr.setAttribute("data-wp-id", w.wp_id);
          tr.title = "Click row for WP details";
          var linkCell = "—";
          if (w.linked_run_id) {
            linkCell =
              '<span class="aosv3-mono" title="' +
              esc(w.linked_run_id) +
              '">' +
              esc(runUlidSuffix(w.linked_run_id)) +
              "</span>";
          }
          var actionsHtml = "";
          if (w.status === "ACTIVE") {
            actionsHtml =
              '<button type="button" class="btn aosv3-wp-stopprop" title="View Run">View Run</button>';
          } else if (w.status === "PLANNED") {
            actionsHtml =
              '<button type="button" class="btn aosv3-wp-stopprop"' +
              (canStart ? "" : " disabled") +
              ' title="' +
              esc(
                canStart
                  ? "Start Run"
                  : "Active run exists for this domain"
              ) +
              '">Start Run</button>';
          } else if (w.status === "COMPLETE") {
            actionsHtml =
              '<button type="button" class="btn aosv3-wp-stopprop" title="View History">View History</button>';
          }
          tr.innerHTML =
            "<td>" +
            esc(w.stage_id || "—") +
            "</td><td><strong>" +
            esc(w.label) +
            '</strong></td><td>' +
            programTableCell(w.wp_id, w.program_id) +
            '</td><td class="aosv3-mono" title="' +
            esc(w.wp_id) +
            '">' +
            esc(runUlidSuffix(w.wp_id)) +
            "</td><td>" +
            domainPillHtml(w.domain_id) +
            '</td><td><span class="aosv3-status-badge ' +
            wpStatusBadgeClass(w.status) +
            '">' +
            esc(w.status) +
            "</span></td><td>" +
            linkCell +
            '</td><td class="aosv3-table-actions"><span class="aosv3-table-actions-inner">' +
            actionsHtml +
            "</span></td>";
          tr.addEventListener("click", function (ev) {
            if (ev.target.closest(".aosv3-wp-stopprop")) return;
            openWpDetailModal(w);
          });
          tb.appendChild(tr);
        });
      });
    }

    function ideaStatusClass(st) {
      var m = {
        APPROVED: "aosv3-status--complete",
        NEW: "aosv3-status--idea-new",
        EVALUATING: "aosv3-status--in_progress",
        DEFERRED: "aosv3-status--paused",
        REJECTED: "aosv3-status--rejected",
      };
      return m[st] || "aosv3-status--idle";
    }

    function ideaTypeBadgeClass(ty) {
      var t = String(ty || "FEATURE").toUpperCase();
      var m = {
        BUG: "aosv3-idea-type aosv3-idea-type--bug",
        FEATURE: "aosv3-idea-type aosv3-idea-type--feature",
        IMPROVEMENT: "aosv3-idea-type aosv3-idea-type--improvement",
        TECH_DEBT: "aosv3-idea-type aosv3-idea-type--tech_debt",
        RESEARCH: "aosv3-idea-type aosv3-idea-type--research",
      };
      return m[t] || m.FEATURE;
    }

    function ideaRowAllowsTransition(idea, action) {
      var s = idea.status;
      if (action === "approve" || action === "reject")
        return s === "NEW" || s === "EVALUATING" || s === "DEFERRED";
      if (action === "defer") return s === "NEW" || s === "EVALUATING";
      return false;
    }

    function renderIdeas() {
      var tb = document.getElementById("aosv3-portfolio-ideas-tbody");
      if (!tb) return;
      tb.innerHTML = "";
      var vis = [];
      ideas.forEach(function (idea, idx) {
        if (!matchesUiDataScope(idea.domain_id, idea.domain_slug)) return;
        vis.push({ idea: idea, idx: idx });
      });
      var stI = portfolioSortState.ideas;
      var skI = stI.key;
      var mulI = stI.dir;
      vis.sort(function (x, y) {
        var a = x.idea;
        var b = y.idea;
        var va = a[skI];
        var vb = b[skI];
        if (skI === "target_program_id") {
          va = a.target_program_id || "";
          vb = b.target_program_id || "";
        }
        return portfolioSortCompare(va, vb, mulI);
      });
      vis.forEach(function (row) {
        var idea = row.idea;
        var idx = row.idx;
        var tr = document.createElement("tr");
        var apEn = ideaRowAllowsTransition(idea, "approve");
        var rjEn = ideaRowAllowsTransition(idea, "reject");
        var dfEn = ideaRowAllowsTransition(idea, "defer");
        var subAt = idea.submitted_at || "";
        tr.innerHTML =
          '<td title="' +
          esc(idea.idea_id) +
          '"><span class="aosv3-mono">' +
          esc(runUlidSuffix(idea.idea_id)) +
          "</span></td><td>" +
          esc(idea.title) +
          "</td><td>" +
          domainPillHtml(idea.domain_id || "agents_os") +
          "</td><td>" +
          programTableCell(null, idea.target_program_id) +
          '</td><td><span class="' +
          ideaTypeBadgeClass(idea.idea_type) +
          '">' +
          esc(idea.idea_type || "FEATURE") +
          '</span></td><td><span class="aosv3-priority-' +
          String(idea.priority).toLowerCase() +
          '">' +
          esc(idea.priority) +
          '</span></td><td><span class="aosv3-status-badge ' +
          ideaStatusClass(idea.status) +
          '">' +
          esc(idea.status) +
          "</span></td><td>" +
          domainPillHtml(
            idea.submitted_by,
            teamLabelById(idea.submitted_by)
          ) +
          '</td><td class="aosv3-mono" title="' +
          esc(formatRelativeTime(subAt)) +
          '">' +
          esc(subAt || "—") +
          '</td><td class="aosv3-table-actions"><span class="aosv3-table-actions-inner">' +
          '<button type="button" class="btn aosv3-idea-edit" data-idx="' +
          idx +
          '">Edit</button>' +
          '<button type="button" class="btn aosv3-idea-approve" data-idx="' +
          idx +
          '"' +
          (apEn ? "" : " disabled") +
          '>Approve</button>' +
          '<button type="button" class="btn aosv3-idea-reject" data-idx="' +
          idx +
          '"' +
          (rjEn ? "" : " disabled") +
          '>Reject</button>' +
          '<button type="button" class="btn aosv3-idea-defer" data-idx="' +
          idx +
          '"' +
          (dfEn ? "" : " disabled") +
          ">Defer</button></span></td>";
        tb.appendChild(tr);
      });
      tb.querySelectorAll(".aosv3-idea-edit").forEach(function (b) {
        b.addEventListener("click", function () {
          var i = parseInt(b.getAttribute("data-idx"), 10);
          openEditModal(ideas[i]);
        });
      });
      function wireIdeaRowAction(selector, nextStatus) {
        tb.querySelectorAll(selector).forEach(function (b) {
          b.addEventListener("click", function () {
            if (b.disabled) return;
            var i = parseInt(b.getAttribute("data-idx"), 10);
            if (ideas[i]) {
              ideas[i].status = nextStatus;
              renderIdeas();
            }
          });
        });
      }
      wireIdeaRowAction(".aosv3-idea-approve", "APPROVED");
      wireIdeaRowAction(".aosv3-idea-reject", "REJECTED");
      wireIdeaRowAction(".aosv3-idea-defer", "DEFERRED");
    }

    var modalNew = document.getElementById("aosv3-modal-new-idea");
    var modalEdit = document.getElementById("aosv3-modal-edit-idea");

    function bindModalBackdrop(overlay) {
      if (!overlay) return;
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay) closeModal(overlay);
      });
    }
    bindModalBackdrop(modalNew);
    bindModalBackdrop(modalEdit);
    bindModalBackdrop(modalWp);

    function openModal(el) {
      if (!el) return;
      el.classList.add("open");
      el.setAttribute("aria-hidden", "false");
    }

    function closeModal(el) {
      if (!el) return;
      el.classList.remove("open");
      el.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll("[data-aosv3-modal-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.closest(".aosv3-modal-overlay");
        closeModal(m);
      });
    });

    var btnNew = document.getElementById("aosv3-btn-new-idea");
    if (btnNew) {
      btnNew.addEventListener("click", function () {
        document.getElementById("aosv3-new-title").value = "";
        document.getElementById("aosv3-new-description").value = "";
        document.getElementById("aosv3-new-priority").value = "MEDIUM";
        var nd = document.getElementById("aosv3-new-domain");
        var nt = document.getElementById("aosv3-new-idea-type");
        if (nd) nd.value = "agents_os";
        if (nt) nt.value = "FEATURE";
        openModal(modalNew);
      });
    }

    var btnSubmitNew = document.getElementById("aosv3-new-submit");
    if (btnSubmitNew) {
      btnSubmitNew.addEventListener("click", function () {
        var title = document.getElementById("aosv3-new-title").value.trim();
        if (!title) return;
        if (!aosv3UseMock()) {
          var dom = document.getElementById("aosv3-new-domain").value;
          var pr = document.getElementById("aosv3-new-priority").value;
          var desc = document
            .getElementById("aosv3-new-description")
            .value.trim();
          AOSV3_apiJson("/api/ideas", {
            method: "POST",
            body: JSON.stringify({
              title: title,
              description: desc || null,
              priority: pr,
              domain_id: dom || null,
            }),
          })
            .then(function (created) {
              ideas.push({
                idea_id: created.idea_id,
                title: created.title,
                description: created.description,
                domain_id: dom || "agents_os",
                idea_type: "FEATURE",
                status: created.status,
                priority: created.priority,
                submitted_by: created.submitted_by,
                submitted_at: created.submitted_at,
                decision_notes: null,
                target_program_id: null,
              });
              closeModal(modalNew);
              renderIdeas();
            })
            .catch(function (e) {
              showAosv3Toast(e.message || String(e));
            });
          return;
        }
        ideas.push({
          idea_id: "01JRNEW" + String(Date.now()).slice(-10),
          title: title,
          domain_id: document.getElementById("aosv3-new-domain").value,
          idea_type: document.getElementById("aosv3-new-idea-type").value,
          status: "NEW",
          priority: document.getElementById("aosv3-new-priority").value,
          submitted_by: "team_31",
          submitted_at: new Date().toISOString(),
          decision_notes: null,
          target_program_id: null,
          description:
            document.getElementById("aosv3-new-description").value.trim(),
        });
        closeModal(modalNew);
        renderIdeas();
      });
    }

    function openEditModal(idea) {
      if (!idea || !modalEdit) return;
      document.getElementById("aosv3-edit-title").value = idea.title;
      document.getElementById("aosv3-edit-description").value =
        idea.description || "";
      document.getElementById("aosv3-edit-priority").value = idea.priority;
      document.getElementById("aosv3-edit-status-display").textContent =
        idea.status;
      document.getElementById("aosv3-edit-notes").value =
        idea.decision_notes || "";
      document.getElementById("aosv3-edit-target-program").value =
        idea.target_program_id || "";
      var edDom = document.getElementById("aosv3-edit-domain");
      var edTy = document.getElementById("aosv3-edit-idea-type");
      if (edDom) edDom.value = idea.domain_id || "agents_os";
      if (edTy) edTy.value = idea.idea_type || "FEATURE";
      var tpRow = document.getElementById("aosv3-edit-target-row");
      if (tpRow) tpRow.hidden = idea.status !== "APPROVED";
      modalEdit.setAttribute("data-idea-id", idea.idea_id);
      openModal(modalEdit);
    }

    document.getElementById("aosv3-edit-save") &&
      document
        .getElementById("aosv3-edit-save")
        .addEventListener("click", function () {
          var id = modalEdit.getAttribute("data-idea-id");
          var idea = ideas.filter(function (x) {
            return x.idea_id === id;
          })[0];
          if (!idea) return;
          if (!aosv3UseMock()) {
            var patch = {
              title: document.getElementById("aosv3-edit-title").value.trim(),
              description: document.getElementById("aosv3-edit-description")
                .value,
              priority: document.getElementById("aosv3-edit-priority").value,
              status: idea.status,
              decision_notes: document.getElementById("aosv3-edit-notes").value,
            };
            if (idea.status === "APPROVED") {
              patch.target_program_id =
                document
                  .getElementById("aosv3-edit-target-program")
                  .value.trim() || null;
            }
            AOSV3_apiJson("/api/ideas/" + encodeURIComponent(id), {
              method: "PUT",
              body: JSON.stringify(patch),
            })
              .then(function (updated) {
                if (updated.title != null) idea.title = updated.title;
                if (updated.description !== undefined)
                  idea.description = updated.description;
                if (updated.priority != null) idea.priority = updated.priority;
                if (updated.status != null) idea.status = updated.status;
                if (updated.decision_notes !== undefined)
                  idea.decision_notes = updated.decision_notes;
                if (updated.target_program_id !== undefined)
                  idea.target_program_id = updated.target_program_id;
                closeModal(modalEdit);
                renderIdeas();
              })
              .catch(function (e) {
                showAosv3Toast(e.message || String(e));
              });
            return;
          }
          idea.title = document.getElementById("aosv3-edit-title").value.trim();
          idea.description = document.getElementById(
            "aosv3-edit-description"
          ).value;
          idea.priority = document.getElementById("aosv3-edit-priority").value;
          idea.domain_id = document.getElementById("aosv3-edit-domain").value;
          idea.idea_type = document.getElementById("aosv3-edit-idea-type").value;
          idea.decision_notes = document.getElementById(
            "aosv3-edit-notes"
          ).value;
          if (idea.status === "APPROVED") {
            idea.target_program_id =
              document.getElementById("aosv3-edit-target-program").value.trim() ||
              null;
          }
          closeModal(modalEdit);
          renderIdeas();
        });

    function setIdeaStatus(st) {
      var id = modalEdit.getAttribute("data-idea-id");
      var idea = ideas.filter(function (x) {
        return x.idea_id === id;
      })[0];
      if (!idea) return;
      idea.status = st;
      var tpRow = document.getElementById("aosv3-edit-target-row");
      if (tpRow) tpRow.hidden = idea.status !== "APPROVED";
      document.getElementById("aosv3-edit-status-display").textContent =
        idea.status;
    }

    document.getElementById("aosv3-edit-approve") &&
      document
        .getElementById("aosv3-edit-approve")
        .addEventListener("click", function () {
          setIdeaStatus("APPROVED");
        });
    document.getElementById("aosv3-edit-reject") &&
      document
        .getElementById("aosv3-edit-reject")
        .addEventListener("click", function () {
          setIdeaStatus("REJECTED");
        });
    document.getElementById("aosv3-edit-defer") &&
      document
        .getElementById("aosv3-edit-defer")
        .addEventListener("click", function () {
          setIdeaStatus("DEFERRED");
        });
    document.getElementById("aosv3-edit-eval") &&
      document
        .getElementById("aosv3-edit-eval")
        .addEventListener("click", function () {
          setIdeaStatus("EVALUATING");
        });

    document.getElementById("aosv3-completed-prev") &&
      document
        .getElementById("aosv3-completed-prev")
        .addEventListener("click", function () {
          completedOffset = Math.max(
            0,
            completedOffset - completedLimit
          );
          renderCompleted();
        });
    document.getElementById("aosv3-completed-next") &&
      document
        .getElementById("aosv3-completed-next")
        .addEventListener("click", function () {
          var cruns = portfolioFilteredCompletedRuns();
          if (completedOffset + completedLimit < cruns.length) {
            completedOffset += completedLimit;
            renderCompleted();
          }
        });

    function portfolioRerenderFromScope() {
      completedOffset = 0;
      renderActive();
      renderCompleted();
      renderWp();
      renderIdeas();
    }
    window.__aosv3PortfolioRerender = portfolioRerenderFromScope;

    wirePortfolioTableSort("aosv3-portfolio-table-active", "active", renderActive);
    wirePortfolioTableSort(
      "aosv3-portfolio-table-completed",
      "completed",
      renderCompleted
    );
    wirePortfolioTableSort("aosv3-portfolio-table-wp", "wp", renderWp);
    wirePortfolioTableSort("aosv3-portfolio-table-ideas", "ideas", renderIdeas);

    showPortfolioTab("active");
    renderActive();
    renderCompleted();
    renderWp();
    renderIdeas();
  }

  function teardownFlowLiveTransport() {
    if (flowLivePollTimer) {
      clearInterval(flowLivePollTimer);
      flowLivePollTimer = null;
    }
    if (flowLiveEs) {
      try {
        flowLiveEs.close();
      } catch (eft) {
        /* ignore */
      }
      flowLiveEs = null;
    }
  }

  function initFlowPage() {
    if (aosv3UseMock()) return;
    if (typeof AOSV3_buildEventStreamUrl !== "function") return;
    flowPageTransportState = {
      run_id: "_flow_",
      status: "IN_PROGRESS",
      sse_connected: false,
    };
    function refreshChip() {
      renderSseIndicator(flowPageTransportState);
    }
    teardownFlowLiveTransport();
    refreshChip();
    var dom = getPipelineViewDomain();
    try {
      var es = new EventSource(
        AOSV3_buildEventStreamUrl({ domain_id: dom })
      );
      flowLiveEs = es;
      es.onopen = function () {
        flowPageTransportState.sse_connected = true;
        refreshChip();
      };
      es.onerror = function () {
        flowPageTransportState.sse_connected = false;
        refreshChip();
      };
      es.addEventListener("heartbeat", function () {
        flowPageTransportState.sse_connected = true;
        refreshChip();
      });
    } catch (eft2) {
      flowPageTransportState.sse_connected = false;
      refreshChip();
    }
    flowLivePollTimer = setInterval(function () {
      if (typeof AOSV3_apiFetch === "function") {
        AOSV3_apiFetch("/api/health", {
          method: "GET",
          skipActorHeader: true,
        }).catch(function () {});
      }
    }, 15000);
  }

  function boot() {
    applyUiDomainScopeControl();
    var page = document.body.getAttribute("data-aosv3-page");
    if (page === "pipeline") initPipelinePage();
    else if (page === "history") initHistoryPage();
    else if (page === "config") initConfigPage();
    else if (page === "teams") initTeamsPage();
    else if (page === "portfolio") initPortfolioPage();
    else if (page === "flow") initFlowPage();
    updatePipelineDomainButtonStyles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
