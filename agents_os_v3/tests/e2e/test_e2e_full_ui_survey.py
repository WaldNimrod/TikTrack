"""
Full UI survey — every v3 page loads, Type A vs Type B domain controls, all main tabs.

Requires: AOS_V3_E2E_RUN=1, stack (scripts/run_aos_v3_e2e_stack.sh), Selenium + Chrome.
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


# (html file, data-aosv3-page attribute value)
_PAGES = [
    ("index.html", "pipeline"),
    ("flow.html", "flow"),
    ("teams.html", "teams"),
    ("history.html", "history"),
    ("config.html", "config"),
    ("portfolio.html", "portfolio"),
]


@pytest.mark.parametrize("html_name,page_attr", _PAGES)
def test_e2e_page_loads_and_body_marker(
    browser_driver: object,
    e2e_ui_page,
    html_name: str,
    page_attr: str,
) -> None:
    """Each primary route exposes data-aosv3-page for automation and humans."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page(html_name))
    WebDriverWait(d, 25).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, f"[data-aosv3-page='{page_attr}']")
        )
    )
    el = d.find_element(By.CSS_SELECTOR, f"[data-aosv3-page='{page_attr}']")
    assert el.is_displayed()


def test_e2e_type_a_pipeline_and_flow_domain_buttons_not_scope_select(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """Type A: two lane buttons; no All-domains scope select in sidebar."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    for html in ("index.html", "flow.html"):
        d = browser_driver
        d.get(e2e_ui_page(html))
        WebDriverWait(d, 25).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        aside = d.find_element(By.CSS_SELECTOR, "aside.agents-page-sidebar")
        buttons = aside.find_elements(By.CSS_SELECTOR, "button.domain-btn[data-pipeline-domain]")
        assert len(buttons) >= 2, f"{html}: expected 2+ domain buttons in sidebar"
        scopes = aside.find_elements(By.ID, "aosv3-ui-domain-scope")
        assert len(scopes) == 0, f"{html}: Type A must not use aosv3-ui-domain-scope in sidebar"


def test_e2e_type_b_pages_scope_select_no_domain_buttons_in_sidebar(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """Type B: scope select; sidebar must not duplicate Type A domain buttons."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    for html in ("teams.html", "history.html", "portfolio.html"):
        d = browser_driver
        d.get(e2e_ui_page(html))
        WebDriverWait(d, 25).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        aside = d.find_element(By.CSS_SELECTOR, "aside.agents-page-sidebar")
        sel = WebDriverWait(d, 15).until(
            EC.presence_of_element_located((By.ID, "aosv3-ui-domain-scope"))
        )
        assert sel.is_displayed()
        opts = sel.find_elements(By.TAG_NAME, "option")
        values = {o.get_attribute("value") for o in opts}
        assert values == {"all", "agents_os", "tiktrack"}, f"{html}: scope options {values}"
        domain_btns = aside.find_elements(By.CSS_SELECTOR, "button.domain-btn[data-pipeline-domain]")
        assert len(domain_btns) == 0, f"{html}: Type B sidebar must not include domain-btn"


def test_e2e_config_page_solo_main_no_domain_scope(
    browser_driver: object,
    e2e_ui_page,
) -> None:
    """Configuration uses full-width main only; no workspace domain scope control."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("config.html"))
    WebDriverWait(d, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='config']"))
    )
    assert len(d.find_elements(By.ID, "aosv3-ui-domain-scope")) == 0
    main = d.find_element(By.CSS_SELECTOR, "main.aosv3-config-main--solo")
    assert main.is_displayed()


def test_e2e_config_all_tabs_cycle(browser_driver: object, e2e_ui_page) -> None:
    """Configuration: routing → templates → policies panels all become visible."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("config.html"))
    WebDriverWait(d, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='config']"))
    )
    tabs = [
        ("routing", "aosv3-panel-routing"),
        ("templates", "aosv3-panel-templates"),
        ("policies", "aosv3-panel-policies"),
    ]
    for data_tab, panel_id in tabs:
        d.find_element(By.CSS_SELECTOR, f'button.aosv3-tab[data-tab="{data_tab}"]').click()
        panel = WebDriverWait(d, 10).until(
            EC.visibility_of_element_located((By.ID, panel_id))
        )
        assert panel.is_displayed()
        assert "active" in (panel.get_attribute("class") or "")


def test_e2e_portfolio_all_tabs_cycle(browser_driver: object, e2e_ui_page) -> None:
    """Portfolio: Active → Completed → Work packages → Ideas panels."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("portfolio.html"))
    WebDriverWait(d, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='portfolio']"))
    )
    tabs = [
        ("active", "aosv3-portfolio-panel-active"),
        ("completed", "aosv3-portfolio-panel-completed"),
        ("wp", "aosv3-portfolio-panel-wp"),
        ("ideas", "aosv3-portfolio-panel-ideas"),
    ]
    for data_tab, panel_id in tabs:
        d.find_element(
            By.CSS_SELECTOR, f'button.aosv3-tab[data-portfolio-tab="{data_tab}"]'
        ).click()
        panel = WebDriverWait(d, 10).until(
            EC.visibility_of_element_located((By.ID, panel_id))
        )
        assert panel.is_displayed()
        assert "active" in (panel.get_attribute("class") or "")


def test_e2e_pipeline_workspace_title_emphasized(browser_driver: object, e2e_base_url: str) -> None:
    """Type A workspace block uses emphasized title class."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_base_url)
    WebDriverWait(d, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='pipeline']"))
    )
    title_el = d.find_element(
        By.CSS_SELECTOR, ".agents-page-sidebar .aosv3-workspace-panel-title"
    )
    assert title_el.is_displayed()
    assert "active workspace" in title_el.text.lower()


def test_e2e_nav_bar_links_resolve(browser_driver: object, e2e_ui_page) -> None:
    """Top nav links hit expected markers without 404 (relative v3/ paths)."""
    By, EC, WebDriverWait = _by(), _ec(), _wait()
    d = browser_driver
    d.get(e2e_ui_page("index.html"))
    WebDriverWait(d, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='pipeline']"))
    )
    checks = [
        ("a.nav-link[href='teams.html']", "teams"),
        ("a.nav-link[href='history.html']", "history"),
        ("a.nav-link[href='config.html']", "config"),
        ("a.nav-link[href='portfolio.html']", "portfolio"),
        ("a.nav-link[href='flow.html']", "flow"),
    ]
    for sel, marker in checks:
        d.find_element(By.CSS_SELECTOR, sel).click()
        WebDriverWait(d, 20).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, f"[data-aosv3-page='{marker}']")
            )
        )
        d.get(e2e_ui_page("index.html"))
        WebDriverWait(d, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-aosv3-page='pipeline']"))
        )
