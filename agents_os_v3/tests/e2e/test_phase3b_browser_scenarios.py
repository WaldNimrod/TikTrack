"""
Remediation Phase 3b — browser E2E scenarios (Team 51).

Mandate: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md
Stack: Selenium 4 + Chrome (Team 61 infra). Not TestClient / API integration.

These tests are **local / CI-ready Selenium** (not MCP browser). Run only with AOS_V3_E2E_RUN=1.
"""

from __future__ import annotations

import os

import pytest

pytestmark = [
    pytest.mark.aos_v3_e2e_browser,
    pytest.mark.skipif(
        os.environ.get("AOS_V3_E2E_RUN", "").lower() not in ("1", "true", "yes"),
        reason="Set AOS_V3_E2E_RUN=1; bash scripts/run_aos_v3_e2e_stack.sh",
    ),
]


def _wait():
    from selenium.webdriver.support.ui import WebDriverWait

    return WebDriverWait


def _by():
    from selenium.webdriver.common.by import By

    return By


def _ec():
    from selenium.webdriver.support import expected_conditions as EC

    return EC


@pytest.mark.parametrize(
    "preset,expect_substr",
    [
        ("sse_connected", "SSE Connected"),
        ("feedback_pass", "Confirm Advance"),
    ],
)
def test_e2e_3_1_pipeline_preset_updates_handoff_and_sse_chip(
    browser_driver: object,
    e2e_base_url: str,
    preset: str,
    expect_substr: str,
) -> None:
    """3.1 — Pipeline: mock preset drives operator handoff / SSE indicator (UI contract)."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    driver = browser_driver
    sep = "&" if "?" in e2e_base_url else "?"
    driver.get(f"{e2e_base_url}{sep}aosv3_preset={preset}")

    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    ind = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.ID, "aosv3-sse-indicator"))
    )
    if preset == "sse_connected":
        assert "SSE Connected" in ind.text
    else:
        assert expect_substr in driver.page_source


def test_e2e_3_1_pipeline_nav_links_roundtrip(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """3.1 — Sidebar nav: open Pipeline from another page."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("history.html"))
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='history']"))
    )
    d.find_element(By.CSS_SELECTOR, 'a.nav-link[href="index.html"]').click()
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='pipeline']"))
    )


def test_e2e_3_2_config_tabs_routing_templates_policies(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """3.2 — Configuration: tabs switch panels."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("config.html"))
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='config']"))
    )
    d.find_element(By.CSS_SELECTOR, 'button.aosv3-tab[data-tab="templates"]').click()
    panel = WebDriverWait(d, 10).until(
        EC.visibility_of_element_located((By.ID, "aosv3-panel-templates"))
    )
    assert panel.is_displayed()
    d.find_element(By.CSS_SELECTOR, 'button.aosv3-tab[data-tab="policies"]').click()
    WebDriverWait(d, 10).until(
        EC.visibility_of_element_located((By.ID, "aosv3-panel-policies"))
    )


def test_e2e_3_3_teams_list_and_filters(browser_driver: object, e2e_ui_page) -> None:
    """3.3 — Teams: roster chrome + list host (mock roster when ``aosv3_mock=1``)."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("teams.html"))
    WebDriverWait(d, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='teams']"))
    )
    host = WebDriverWait(d, 20).until(
        EC.presence_of_element_located((By.ID, "aosv3-team-list"))
    )
    assert host.is_displayed()
    filt = d.find_element(By.ID, "aosv3-ui-domain-scope")
    assert filt.is_displayed()


def test_e2e_3_4_portfolio_tabs_and_new_idea_modal(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """3.4 — Portfolio: Ideas tab + New Idea modal open/close."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("portfolio.html"))
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='portfolio']"))
    )
    d.find_element(By.CSS_SELECTOR, 'button.aosv3-tab[data-portfolio-tab="ideas"]').click()
    WebDriverWait(d, 10).until(
        EC.element_to_be_clickable((By.ID, "aosv3-btn-new-idea"))
    ).click()
    modal = WebDriverWait(d, 10).until(
        EC.visibility_of_element_located((By.ID, "aosv3-modal-new-idea"))
    )
    assert modal.get_attribute("aria-hidden") in ("false", None)
    d.find_element(By.CSS_SELECTOR, "#aosv3-modal-new-idea [data-aosv3-modal-close]").click()

    def _modal_closed(drv: object) -> bool:
        el = drv.find_element(By.ID, "aosv3-modal-new-idea")
        return el.get_attribute("aria-hidden") == "true"

    WebDriverWait(d, 5).until(_modal_closed)


def test_e2e_3_5_history_run_selector_and_timeline(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """3.5 — History: run selector + timeline region."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("history.html"))
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='history']"))
    )
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.ID, "aosv3-history-run-select"))
    )
    tl = d.find_element(By.ID, "aosv3-history-timeline")
    assert tl.is_displayed()


def test_e2e_3_6_system_map_section_nav(browser_driver: object, e2e_ui_page) -> None:
    """3.6 — System Map: gates section + subnav anchor."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("flow.html"))
    WebDriverWait(d, 25).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    gates = WebDriverWait(d, 20).until(EC.presence_of_element_located((By.ID, "gates")))
    assert gates.is_displayed()
    sub = d.find_elements(By.CSS_SELECTOR, ".flow-subnav a[href='#gates']")
    assert sub, "System Map subnav must link to #gates"
    sub[0].click()
    # Hash navigation is the contract; is_displayed() after scroll can be flaky in headless Chrome.
    WebDriverWait(d, 5).until(
        lambda drv: drv.execute_script("return window.location.hash || ''") == "#gates"
    )
