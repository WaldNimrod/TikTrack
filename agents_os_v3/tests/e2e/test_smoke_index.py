"""Smoke: load Pipeline View in a real browser (Remediation Phase 3a)."""

from __future__ import annotations

import os

import pytest

# Skip entire module unless operator explicitly enables browser E2E (default CI / pytest agents_os_v3/tests/).
pytestmark = [
    pytest.mark.aos_v3_e2e_browser,
    pytest.mark.skipif(
        os.environ.get("AOS_V3_E2E_RUN", "").lower() not in ("1", "true", "yes"),
        reason="Set AOS_V3_E2E_RUN=1; start stack via scripts/run_aos_v3_e2e_stack.sh",
    ),
]


def test_index_loads_pipeline_view(browser_driver: object, e2e_base_url: str) -> None:
    # Late import so `pytest agents_os_v3/tests/` collects without selenium installed.
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.support.ui import WebDriverWait

    driver = browser_driver
    driver.get(e2e_base_url)

    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    title = driver.title
    assert "Agents OS" in title, f"unexpected title: {title!r}"

    pipeline = driver.find_element(By.CSS_SELECTOR, "[data-aosv3-page='pipeline']")
    assert pipeline.is_displayed()

    heading = driver.find_element(By.CSS_SELECTOR, "h1.agents-header-title")
    assert heading.is_displayed()
    assert "Pipeline" in heading.text or "Agents OS" in heading.text
