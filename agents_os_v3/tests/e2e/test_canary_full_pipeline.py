"""
Canary: Full Pipeline E2E — UI + API, IDLE → GATE_0 → … → GATE_5 → COMPLETE.

Simulates the complete operator experience end-to-end:
  - Drives a real browser (Selenium) for UI assertions.
  - Validates live assembled prompts at every gate (GET /api/runs/{id}/prompt).
  - Uses dummy advance/approve — no real agents required.
  - Isolated: inserts canary WPs per domain (tiktrack + agents_os), purges after each module.

Requirements:
  AOS_V3_E2E_RUN=1         — enable browser tests (skip by default)
  AOS_V3_E2E_UI_MOCK=0     — use live API (not mock state)
  AOS_V3_E2E_HEADLESS=1    — headless Chrome (0 = visible for debugging)
  AOS_V3_DATABASE_URL       — live Postgres connection

Run:
  AOS_V3_E2E_RUN=1 AOS_V3_E2E_UI_MOCK=0 \\
    pytest agents_os_v3/tests/e2e/test_canary_full_pipeline.py -v
"""

from __future__ import annotations

import os
import time
from typing import Any, Generator

import pytest
import requests

# ── Constants ────────────────────────────────────────────────────────────────

BASE_URL = "http://127.0.0.1:8090"
PIPELINE_URL = BASE_URL + "/v3/index.html"
TIKTRACK_DOMAIN = "01JK8AOSV3DOMAIN00000002"
TIKTRACK_SLUG = "tiktrack"
AGENTS_OS_DOMAIN = "01JK8AOSV3DOMAIN00000001"
AGENTS_OS_SLUG = "agents_os"
ACTOR_HDR = {"X-Actor-Team-Id": "team_10"}
AOS_ACTOR_HDR = {"X-Actor-Team-Id": "team_11"}
PRINCIPAL_HDR = {"X-Actor-Team-Id": "team_00"}
SELENIUM_TIMEOUT = 20

# Module-level state — separate dicts so tiktrack vs agents_os canaries never share run_id
_STATE: dict[str, Any] = {"run_id": None}
_STATE_AOS: dict[str, Any] = {"run_id": None}

# ── Markers ──────────────────────────────────────────────────────────────────

pytestmark = pytest.mark.aos_v3_e2e_browser

_requires_e2e = pytest.mark.skipif(
    os.environ.get("AOS_V3_E2E_RUN", "").lower() not in ("1", "true", "yes"),
    reason="AOS_V3_E2E_RUN not set",
)
_requires_db = pytest.mark.skipif(
    not (os.environ.get("AOS_V3_DATABASE_URL") or "").strip(),
    reason="AOS_V3_DATABASE_URL not set",
)


# ── Module-scoped DB connection ───────────────────────────────────────────────

@pytest.fixture(scope="module")
def canary_db() -> Generator[Any, None, None]:
    """Module-scoped Postgres connection for canary WP lifecycle (autocommit)."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    url = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not url:
        pytest.skip("AOS_V3_DATABASE_URL not set")
    conn = psycopg2.connect(url, cursor_factory=RealDictCursor)
    conn.autocommit = True
    try:
        yield conn
    finally:
        conn.close()


# ── Canary WP fixture ─────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def canary_wp(canary_db: Any) -> Generator[str, None, None]:
    """Insert a canary WP, clear any active tiktrack runs, yield wp_id, then purge."""
    import ulid as _ulid_mod

    try:
        wp_id = str(_ulid_mod.new())
    except AttributeError:
        wp_id = str(_ulid_mod.ULID())

    with canary_db.cursor() as cur:
        cur.execute(
            """INSERT INTO work_packages (id, label, domain_id, status, linked_run_id,
               stage_id, program_id, created_at, updated_at)
               VALUES (%s, %s, %s, 'PLANNED', NULL, NULL, NULL, NOW(), NOW())""",
            (wp_id, "CANARY — full pipeline E2E test", TIKTRACK_DOMAIN),
        )

    yield wp_id

    # Teardown: remove events, assignments, run, wp (same order as purge_work_package)
    with canary_db.cursor() as cur:
        cur.execute(
            "DELETE FROM events WHERE run_id IN "
            "(SELECT id FROM runs WHERE work_package_id = %s)",
            (wp_id,),
        )
        cur.execute("DELETE FROM assignments WHERE work_package_id = %s", (wp_id,))
        cur.execute("DELETE FROM runs WHERE work_package_id = %s", (wp_id,))
        cur.execute("DELETE FROM work_packages WHERE id = %s", (wp_id,))


@pytest.fixture(scope="module")
def canary_wp_aos(canary_db: Any) -> Generator[str, None, None]:
    """Insert agents_os canary WP; teardown deletes only this wp_id (tiktrack WP untouched)."""
    import ulid as _ulid_mod

    try:
        wp_id = str(_ulid_mod.new())
    except AttributeError:
        wp_id = str(_ulid_mod.ULID())

    with canary_db.cursor() as cur:
        cur.execute(
            """INSERT INTO work_packages (id, label, domain_id, status, linked_run_id,
               stage_id, program_id, created_at, updated_at)
               VALUES (%s, %s, %s, 'PLANNED', NULL, NULL, NULL, NOW(), NOW())""",
            (wp_id, "CANARY-AOS — full pipeline E2E test", AGENTS_OS_DOMAIN),
        )

    yield wp_id

    with canary_db.cursor() as cur:
        cur.execute(
            "DELETE FROM events WHERE run_id IN "
            "(SELECT id FROM runs WHERE work_package_id = %s)",
            (wp_id,),
        )
        cur.execute("DELETE FROM assignments WHERE work_package_id = %s", (wp_id,))
        cur.execute("DELETE FROM runs WHERE work_package_id = %s", (wp_id,))
        cur.execute("DELETE FROM work_packages WHERE id = %s", (wp_id,))


# ── Module-scoped browser ─────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def live_browser() -> Generator[Any, None, None]:
    """Module-scoped Chrome driver — all canary tests share one session."""
    pytest.importorskip("selenium")
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    opts = Options()
    headless = os.environ.get("AOS_V3_E2E_HEADLESS", "1").lower() not in (
        "0", "false", "no",
    )
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--disable-gpu")
    driver = webdriver.Chrome(options=opts)
    try:
        yield driver
    finally:
        driver.quit()


# ── Selenium helpers ──────────────────────────────────────────────────────────

def _wait(driver: Any, condition: Any, timeout: int = SELENIUM_TIMEOUT) -> Any:
    from selenium.webdriver.support.ui import WebDriverWait
    return WebDriverWait(driver, timeout).until(condition)


def _wait_status(driver: Any, css_class: str, timeout: int = SELENIUM_TIMEOUT) -> None:
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support import expected_conditions as EC
    _wait(driver, EC.presence_of_element_located(
        (By.CSS_SELECTOR, f".{css_class}")), timeout)


def _wait_gate(driver: Any, gate_id: str, timeout: int = SELENIUM_TIMEOUT) -> None:
    from selenium.webdriver.common.by import By
    _wait(driver,
          lambda d: gate_id in (d.find_element(By.ID, "aosv3-gate").text or ""),
          timeout)


# ── API helpers ───────────────────────────────────────────────────────────────

def _advance(
    run_id: str,
    *,
    headers: dict[str, str] | None = None,
) -> dict[str, Any]:
    hdr = headers or ACTOR_HDR
    r = requests.post(
        f"{BASE_URL}/api/runs/{run_id}/advance",
        headers=hdr,
        json={"verdict": "pass", "summary": "Canary dummy advance — no real agent"},
    )
    assert r.status_code == 200, f"advance({run_id}) → {r.status_code}: {r.text}"
    return r.json()


def _advance_to_gate(
    run_id: str,
    target_gate: str,
    max_advances: int = 5,
    *,
    headers: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Advance (up to max_advances times) until current_gate_id == target_gate."""
    result: dict[str, Any] = {}
    for _i in range(max_advances):
        result = _advance(run_id, headers=headers)
        if result["current_gate_id"] == target_gate:
            return result
    raise AssertionError(
        f"Could not reach {target_gate} after {max_advances} advances. "
        f"Last state: {result}"
    )


def _approve(run_id: str) -> dict[str, Any]:
    r = requests.post(
        f"{BASE_URL}/api/runs/{run_id}/approve",
        headers=PRINCIPAL_HDR,
        json={"approval_notes": "Canary GATE_4 approval — human-gate sim"},
    )
    assert r.status_code == 200, f"approve({run_id}) → {r.status_code}: {r.text}"
    return r.json()


def _get_run_json(run_id: str) -> dict[str, Any]:
    """GET /api/runs/{run_id} — route has no actor dependency."""
    r = requests.get(f"{BASE_URL}/api/runs/{run_id}")
    assert r.status_code == 200, f"get_run({run_id}) → {r.status_code}: {r.text}"
    return r.json()


def _assert_l1_template_quality(
    l1: str,
    expected_gate: str,
    l1_domain: str,
) -> None:
    """Mandate AC-8: ORCHESTRATOR / HITL language; no executor phrasing; domain team hints."""
    low = l1.lower()
    assert "your task: implement" not in low, (
        f"L1 at {expected_gate} uses executor language — expected coordinator routing"
    )
    if expected_gate == "GATE_4":
        assert (
            "human" in low or "hitl" in low or "approve" in low or "principal" in low
        ), f"GATE_4 L1 should describe human gate; got head: {l1[:200]!r}"
    else:
        assert "orchestrator" in low, (
            f"L1 at {expected_gate} should identify ORCHESTRATOR; head: {l1[:200]!r}"
        )
    if l1_domain == "agents_os":
        if expected_gate == "GATE_0":
            assert "agents_os" in low and "track_focused" in low, (
                "agents_os GATE_0 L1 should describe agents_os → TRACK_FOCUSED lane"
            )
        if expected_gate == "GATE_3":
            assert "TRACK_FOCUSED" in l1 or "team 61" in low, (
                "agents_os GATE_3 L1 should reference TRACK_FOCUSED / Team 61"
            )
    elif l1_domain == "tiktrack":
        if expected_gate == "GATE_0":
            assert "team 10" in low or "teams 10" in low or "tiktrack" in low, (
                "tiktrack GATE_0 L1 should reference Team 10 / tiktrack lane"
            )
        if expected_gate == "GATE_3":
            assert "TRACK_FULL" in l1 or "team 20" in low or "team 50" in low, (
                "tiktrack GATE_3 L1 should reference TRACK_FULL / implementation lane"
            )


def _assert_prompt(
    run_id: str,
    expected_gate: str,
    *,
    headers: dict[str, str] | None = None,
    l1_domain: str | None = None,
) -> None:
    """Call real prompt API and verify all 4 layers are non-empty."""
    hdr = headers or ACTOR_HDR
    r = requests.get(
        f"{BASE_URL}/api/runs/{run_id}/prompt?bust_cache=true",
        headers=hdr,
    )
    assert r.status_code == 200, f"Prompt API failed at {expected_gate}: {r.text}"
    d = r.json()
    layers, meta = d["layers"], d["meta"]
    assert layers.get("L1_template"), f"L1 empty at {expected_gate}"
    assert layers.get("L2_governance"), f"L2 empty at {expected_gate}"
    assert layers.get("L3_policies_json"), f"L3 empty at {expected_gate}"
    assert layers.get("L4_run_json"), f"L4 empty at {expected_gate}"
    assert expected_gate in layers["L4_run_json"], (
        f"L4 JSON doesn't contain {expected_gate}: {layers['L4_run_json'][:100]}"
    )
    assert meta.get("actor_team_id"), f"No actor resolved at {expected_gate}"
    assert len(layers["L1_template"] or "") > 30, (
        f"L1 template too short at {expected_gate} — likely empty placeholder"
    )
    if l1_domain:
        _assert_l1_template_quality(layers["L1_template"], expected_gate, l1_domain)


# ── Tests ──────────────────────────────────────────────────────────────────────

@_requires_e2e
@_requires_db
class TestCanaryFullPipeline:
    """Full pipeline canary: IDLE → GATE_0–5 → COMPLETE via Selenium + live API."""

    def test_01_wp_dropdown_is_populated(self, live_browser: Any, canary_wp: str) -> None:
        """UI: WP dropdown populated from /api/work-packages; canary WP is present."""
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import Select

        live_browser.get(PIPELINE_URL)
        _wait(live_browser, lambda d: d.find_element(By.ID, "aosv3-wp-select"))
        sel = Select(live_browser.find_element(By.ID, "aosv3-wp-select"))
        values = [o.get_attribute("value") for o in sel.options]
        assert len(values) > 1, (
            "WP dropdown empty — populateWpSelect() not running in initPipelinePageLive()"
        )
        assert canary_wp in values, (
            f"Canary WP {canary_wp} not in dropdown. First 5: {values[:5]}"
        )

    def test_02_start_run_button_wired_and_starts_run(
        self, live_browser: Any, canary_wp: str
    ) -> None:
        """UI: Start Run button enabled, submits form, pipeline → IN_PROGRESS GATE_0."""
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.support.ui import Select

        # Switch the sidebar domain to tiktrack first (so loadPipelineStateFromApi
        # fetches tiktrack state after the run starts)
        tiktrack_btn = live_browser.find_element(
            By.CSS_SELECTOR, f'[data-pipeline-domain="{TIKTRACK_SLUG}"]'
        )
        tiktrack_btn.click()
        time.sleep(0.5)

        # Verify button is enabled and wired (key canary check for the JS wiring bug)
        start_btn = live_browser.find_element(By.CSS_SELECTOR, ".aosv3-start-run-btn")
        assert not start_btn.get_attribute("disabled"), (
            "Start Run button is disabled — wireLiveAction not running in initPipelinePageLive()"
        )

        # Select canary WP
        wp_sel = Select(live_browser.find_element(By.ID, "aosv3-wp-select"))
        wp_sel.select_by_value(canary_wp)

        # Confirm domain in form matches tiktrack
        domain_el = live_browser.find_element(By.NAME, "domain_id")
        domain_val = Select(domain_el).first_selected_option.get_attribute("value")
        if domain_val != TIKTRACK_SLUG:
            Select(domain_el).select_by_value(TIKTRACK_SLUG)

        # Click Start Run
        start_btn.click()

        # Wait for IN_PROGRESS badge
        _wait_status(live_browser, "aosv3-status--in_progress")

        # Verify gate shows GATE_0 (wait a bit for async render)
        _wait_gate(live_browser, "GATE_0")
        gate_text = live_browser.find_element(By.ID, "aosv3-gate").text
        assert "GATE_0" in gate_text, f"Expected GATE_0 after start, got: {gate_text!r}"

        # Read run_id from API
        state = requests.get(
            f"{BASE_URL}/api/state",
            headers=ACTOR_HDR,
            params={"domain_id": TIKTRACK_SLUG},
        ).json()
        run_id = state.get("run_id")
        assert run_id, f"run_id not in pipeline state. State: {state}"
        _STATE["run_id"] = run_id

    def test_03_gate0_prompt_is_live_not_mock(self) -> None:
        """API: GATE_0 prompt has real L1–L4 layers; all non-empty."""
        run_id = _STATE.get("run_id")
        assert run_id, "run_id not set — test_02 must pass first"
        _assert_prompt(run_id, "GATE_0", l1_domain="tiktrack")

    def test_04_browser_prompt_panel_shows_live_data(self, live_browser: Any) -> None:
        """UI: prompt panel shows live API data — not the stale mock (2026-03-26)."""
        from selenium.webdriver.common.by import By

        live_browser.refresh()
        time.sleep(1.5)  # allow async AOSV3_apiJson fetch to complete

        pre_text = live_browser.find_element(By.ID, "aosv3-prompt-pre").text or ""
        assembled_text = live_browser.find_element(By.ID, "aosv3-prompt-assembled").text or ""

        assert "Team 61" not in pre_text, (
            "Prompt panel shows MOCK team_61 context — renderPromptSection still uses MOCK_ASSEMBLED_PROMPT"
        )
        assert "2026-03-26T14:30:00Z" not in assembled_text, (
            f"Prompt panel showing STALE mock assembled_at: {assembled_text}"
        )
        assert len(pre_text) > 80, (
            f"Prompt text too short ({len(pre_text)} chars) — API may have failed"
        )

    def test_05_advance_gate0_to_gate1(self, live_browser: Any) -> None:
        """API+UI: advance through GATE_0 phases → UI shows GATE_1; prompt valid."""
        run_id = _STATE["run_id"]
        # GATE_0 has 2 phases (0.1 → 0.2 → GATE_1); advance until GATE_1
        r = _advance_to_gate(run_id, "GATE_1")
        assert r["current_gate_id"] == "GATE_1"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_1")
        _assert_prompt(run_id, "GATE_1", l1_domain="tiktrack")

    def test_06_advance_gate1_to_gate2(self, live_browser: Any) -> None:
        """API+UI: advance GATE_1 → UI shows GATE_2; prompt valid."""
        run_id = _STATE["run_id"]
        r = _advance_to_gate(run_id, "GATE_2")
        assert r["current_gate_id"] == "GATE_2"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_2")
        _assert_prompt(run_id, "GATE_2", l1_domain="tiktrack")

    def test_07_advance_gate2_to_gate3(self, live_browser: Any) -> None:
        """API+UI: advance GATE_2 → UI shows GATE_3; prompt valid."""
        run_id = _STATE["run_id"]
        r = _advance_to_gate(run_id, "GATE_3")
        assert r["current_gate_id"] == "GATE_3"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_3")
        _assert_prompt(run_id, "GATE_3", l1_domain="tiktrack")

    def test_08_advance_gate3_to_gate4_approve_visible(self, live_browser: Any) -> None:
        """API+UI: advance to GATE_4; APPROVE button visible (human gate); prompt valid."""
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as EC

        run_id = _STATE["run_id"]
        r = _advance_to_gate(run_id, "GATE_4")
        assert r["current_gate_id"] == "GATE_4"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_4")
        _assert_prompt(run_id, "GATE_4", l1_domain="tiktrack")

        # APPROVE button must become visible at the human gate
        approve_btn = _wait(
            live_browser,
            EC.visibility_of_element_located((By.ID, "aosv3-btn-approve")),
            timeout=10,
        )
        assert approve_btn.is_displayed(), (
            "APPROVE button not visible at GATE_4 — next_action.type not HUMAN_APPROVE"
        )

    def test_09_approve_gate4_advance_gate5_to_complete(self, live_browser: Any) -> None:
        """API+UI: APPROVE GATE_4 → GATE_5 with valid prompt → advance → COMPLETE."""
        from selenium.webdriver.common.by import By

        run_id = _STATE["run_id"]

        # Approve the human gate (as Principal)
        apr = _approve(run_id)
        assert apr.get("current_gate_id") == "GATE_5", (
            f"Expected GATE_5 after approve, got {apr}"
        )
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_5")
        _assert_prompt(run_id, "GATE_5", l1_domain="tiktrack")

        # Final advance at GATE_5 (terminal) → COMPLETE
        r = _advance(run_id)
        assert r.get("status") == "COMPLETE", (
            f"Expected COMPLETE after GATE_5 advance, got {r}"
        )
        live_browser.refresh()
        _wait_status(live_browser, "aosv3-status--complete")
        badge = live_browser.find_element(By.CLASS_NAME, "aosv3-status--complete")
        assert badge.is_displayed(), "COMPLETE badge not visible in UI after terminal advance"

    def test_10_run_log_has_all_events(self) -> None:
        """API: run history: RUN_INITIATED + ≥5 PHASE_PASSED + GATE_APPROVED + RUN_COMPLETED."""
        run_id = _STATE.get("run_id")
        assert run_id, "run_id not set"
        r = requests.get(
            f"{BASE_URL}/api/history",
            headers=ACTOR_HDR,
            params={"run_id": run_id, "limit": 50},
        )
        assert r.status_code == 200
        events = [e["event_type"] for e in r.json()["events"]]

        assert "RUN_INITIATED" in events, f"Missing RUN_INITIATED: {events}"
        assert "RUN_COMPLETED" in events, f"Missing RUN_COMPLETED: {events}"
        assert "GATE_APPROVED" in events, (
            f"Missing GATE_APPROVED (GATE_4 human gate): {events}"
        )
        phase_passed = [e for e in events if e == "PHASE_PASSED"]
        assert len(phase_passed) >= 5, (
            f"Expected ≥5 PHASE_PASSED (gates 0→3 + gate 5), got {len(phase_passed)}: {events}"
        )


@_requires_e2e
@_requires_db
class TestCanaryFullPipelineAgentsOS:
    """agents_os mirror: IDLE → GATE_0–5 → COMPLETE (team_11 actor; isolated WP + run_id)."""

    def test_01_wp_dropdown_is_populated(self, live_browser: Any, canary_wp_aos: str) -> None:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import Select

        live_browser.get(PIPELINE_URL)
        _wait(live_browser, lambda d: d.find_element(By.ID, "aosv3-wp-select"))
        live_browser.find_element(
            By.CSS_SELECTOR, f'[data-pipeline-domain="{AGENTS_OS_SLUG}"]'
        ).click()
        time.sleep(0.5)
        sel = Select(live_browser.find_element(By.ID, "aosv3-wp-select"))
        values = [o.get_attribute("value") for o in sel.options]
        assert len(values) > 1, "WP dropdown empty after switching to agents_os"
        assert canary_wp_aos in values, (
            f"Canary AOS WP {canary_wp_aos} not in dropdown. Sample: {values[:8]}"
        )

    def test_02_start_run_agents_os(self, live_browser: Any, canary_wp_aos: str) -> None:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import Select

        live_browser.find_element(
            By.CSS_SELECTOR, f'[data-pipeline-domain="{AGENTS_OS_SLUG}"]'
        ).click()
        time.sleep(0.5)
        start_btn = live_browser.find_element(By.CSS_SELECTOR, ".aosv3-start-run-btn")
        assert not start_btn.get_attribute("disabled"), "Start Run disabled on agents_os lane"
        Select(live_browser.find_element(By.ID, "aosv3-wp-select")).select_by_value(
            canary_wp_aos
        )
        domain_el = live_browser.find_element(By.NAME, "domain_id")
        if Select(domain_el).first_selected_option.get_attribute("value") != AGENTS_OS_SLUG:
            Select(domain_el).select_by_value(AGENTS_OS_SLUG)
        start_btn.click()
        _wait_status(live_browser, "aosv3-status--in_progress")
        _wait_gate(live_browser, "GATE_0")
        gate_text = live_browser.find_element(By.ID, "aosv3-gate").text
        assert "GATE_0" in gate_text, f"Expected GATE_0 after start, got: {gate_text!r}"
        state = requests.get(
            f"{BASE_URL}/api/state",
            headers=AOS_ACTOR_HDR,
            params={"domain_id": AGENTS_OS_SLUG},
        ).json()
        run_id = state.get("run_id")
        assert run_id, f"run_id not in agents_os state: {state}"
        _STATE_AOS["run_id"] = run_id

    def test_03_gate0_prompt_live_aos(self) -> None:
        run_id = _STATE_AOS.get("run_id")
        assert run_id, "run_id not set — test_02 must pass first"
        _assert_prompt(
            run_id,
            "GATE_0",
            headers=AOS_ACTOR_HDR,
            l1_domain="agents_os",
        )
        pr_meta = requests.get(
            f"{BASE_URL}/api/runs/{run_id}/prompt?bust_cache=true",
        )
        assert pr_meta.status_code == 200, pr_meta.text
        aid = (pr_meta.json().get("meta") or {}).get("actor_team_id")
        assert aid == "team_11", (
            f"agents_os orchestrator in prompt meta must be team_11, got {aid!r}"
        )
        run_data = _get_run_json(run_id)
        assert str(run_data.get("domain_id")) == AGENTS_OS_DOMAIN, (
            f"Run domain_id must be agents_os ULID; got {run_data.get('domain_id')}"
        )

    def test_04_browser_prompt_not_stale_aos(self, live_browser: Any) -> None:
        from selenium.webdriver.common.by import By

        live_browser.get(PIPELINE_URL)
        live_browser.find_element(
            By.CSS_SELECTOR, f'[data-pipeline-domain="{AGENTS_OS_SLUG}"]'
        ).click()
        time.sleep(0.5)
        live_browser.refresh()
        time.sleep(1.5)
        pre_text = live_browser.find_element(By.ID, "aosv3-prompt-pre").text or ""
        assembled_text = live_browser.find_element(By.ID, "aosv3-prompt-assembled").text or ""
        # Real agents_os L1 may mention Team 61 — do not forbid; only reject known mock markers.
        assert "MOCK_ASSEMBLED_PROMPT" not in (pre_text + assembled_text).upper(), (
            "Prompt panel still using mock assembled payload"
        )
        assert "2026-03-26T14:30:00Z" not in assembled_text, (
            f"Stale mock assembled_at in agents_os view: {assembled_text}"
        )
        assert len(pre_text) > 80, f"Prompt text too short ({len(pre_text)})"

    def test_05_advance_gate0_to_gate1_aos(self, live_browser: Any) -> None:
        run_id = _STATE_AOS["run_id"]
        r = _advance_to_gate(run_id, "GATE_1", headers=AOS_ACTOR_HDR)
        assert r["current_gate_id"] == "GATE_1"
        run_data = _get_run_json(run_id)
        pv = run_data.get("process_variant")
        if pv is not None:
            assert pv == "TRACK_FOCUSED", (
                f"agents_os run should use TRACK_FOCUSED, got process_variant={pv!r}"
            )
        else:
            pr = requests.get(
                f"{BASE_URL}/api/runs/{run_id}/prompt?bust_cache=true",
            )
            assert pr.status_code == 200
            l4 = pr.json()["layers"].get("L4_run_json") or ""
            assert "TRACK_FOCUSED" in l4, (
                "TRACK_FOCUSED must appear in L4 when process_variant column absent"
            )
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_1")
        _assert_prompt(
            run_id,
            "GATE_1",
            headers=AOS_ACTOR_HDR,
            l1_domain="agents_os",
        )

    def test_06_advance_gate1_to_gate2_aos(self, live_browser: Any) -> None:
        run_id = _STATE_AOS["run_id"]
        r = _advance_to_gate(run_id, "GATE_2", headers=AOS_ACTOR_HDR)
        assert r["current_gate_id"] == "GATE_2"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_2")
        _assert_prompt(
            run_id,
            "GATE_2",
            headers=AOS_ACTOR_HDR,
            l1_domain="agents_os",
        )

    def test_07_advance_gate2_to_gate3_aos(self, live_browser: Any) -> None:
        run_id = _STATE_AOS["run_id"]
        r = _advance_to_gate(run_id, "GATE_3", headers=AOS_ACTOR_HDR)
        assert r["current_gate_id"] == "GATE_3"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_3")
        _assert_prompt(
            run_id,
            "GATE_3",
            headers=AOS_ACTOR_HDR,
            l1_domain="agents_os",
        )

    def test_08_advance_gate3_to_gate4_approve_visible_aos(self, live_browser: Any) -> None:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as EC

        run_id = _STATE_AOS["run_id"]
        r = _advance_to_gate(run_id, "GATE_4", headers=AOS_ACTOR_HDR)
        assert r["current_gate_id"] == "GATE_4"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_4")
        _assert_prompt(
            run_id,
            "GATE_4",
            headers=AOS_ACTOR_HDR,
            l1_domain="agents_os",
        )
        approve_btn = _wait(
            live_browser,
            EC.visibility_of_element_located((By.ID, "aosv3-btn-approve")),
            timeout=10,
        )
        assert approve_btn.is_displayed(), "APPROVE not visible at GATE_4 (agents_os)"

    def test_09_approve_gate4_advance_gate5_complete_aos(self, live_browser: Any) -> None:
        from selenium.webdriver.common.by import By

        run_id = _STATE_AOS["run_id"]
        apr = _approve(run_id)
        assert apr.get("current_gate_id") == "GATE_5", f"Expected GATE_5 after approve: {apr}"
        live_browser.refresh()
        _wait_gate(live_browser, "GATE_5")
        _assert_prompt(
            run_id,
            "GATE_5",
            headers=AOS_ACTOR_HDR,
            l1_domain="agents_os",
        )
        r = _advance(run_id, headers=AOS_ACTOR_HDR)
        assert r.get("status") == "COMPLETE", f"Expected COMPLETE: {r}"
        live_browser.refresh()
        _wait_status(live_browser, "aosv3-status--complete")
        badge = live_browser.find_element(By.CLASS_NAME, "aosv3-status--complete")
        assert badge.is_displayed(), "COMPLETE badge not visible (agents_os)"

    def test_10_run_log_events_aos(self) -> None:
        run_id = _STATE_AOS.get("run_id")
        assert run_id, "run_id not set"
        r = requests.get(
            f"{BASE_URL}/api/history",
            headers=AOS_ACTOR_HDR,
            params={"run_id": run_id, "limit": 50},
        )
        assert r.status_code == 200
        events = [e["event_type"] for e in r.json()["events"]]
        assert "RUN_INITIATED" in events, f"Missing RUN_INITIATED: {events}"
        assert "RUN_COMPLETED" in events, f"Missing RUN_COMPLETED: {events}"
        assert "GATE_APPROVED" in events, f"Missing GATE_APPROVED: {events}"
        phase_passed = [e for e in events if e == "PHASE_PASSED"]
        assert len(phase_passed) >= 5, (
            f"Expected ≥5 PHASE_PASSED, got {len(phase_passed)}: {events}"
        )
