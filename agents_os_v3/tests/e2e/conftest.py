"""Pytest fixtures for AOS v3 browser E2E (Selenium)."""

from __future__ import annotations

import os
from collections.abc import Callable, Generator
from urllib.parse import urlparse, urlunparse

import pytest


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line(
        "markers",
        "aos_v3_e2e_browser: real-browser test; requires AOS_V3_E2E_RUN=1 and stack (see tests/e2e/README.md)",
    )


def _e2e_ui_dir_from_base_page(raw: str) -> str:
    """Derive directory URL (trailing slash) for sibling *.html from a full page URL.

    Examples:
    - ``http://127.0.0.1:8090/v3/index.html`` → ``http://127.0.0.1:8090/v3/``
    - ``http://127.0.0.1:8090/`` (Pipeline served at root) → ``http://127.0.0.1:8090/v3/``
    - ``http://127.0.0.1:8778/agents_os_v3/ui/index.html`` → ``http://127.0.0.1:8778/agents_os_v3/ui/``
    """
    page = raw.strip().split("?", 1)[0]
    p = urlparse(page)
    path = p.path or "/"
    if path in ("/", ""):
        path = "/v3/"
    elif path.endswith(".html"):
        path = path.rsplit("/", 1)[0] + "/"
    elif not path.endswith("/"):
        path += "/"
    return urlunparse((p.scheme, p.netloc, path, "", "", ""))


def _e2e_ui_mock_query_enabled() -> bool:
    """Separate-origin static stack (8778) cannot call API without CORS → default mock.

    On **same origin** (v3 FastAPI on 8090 with ``/v3/*`` UI), set ``AOS_V3_E2E_UI_MOCK=0`` for live API.
    """
    return os.environ.get("AOS_V3_E2E_UI_MOCK", "1").lower() not in (
        "0",
        "false",
        "no",
    )


@pytest.fixture(scope="session")
def e2e_ui_mock_query() -> str:
    """Query fragment without leading ``?`` (e.g. ``aosv3_mock=1``), or empty."""
    if not _e2e_ui_mock_query_enabled():
        return ""
    return "aosv3_mock=1"


@pytest.fixture(scope="session")
def e2e_ui_dir() -> str:
    """Directory URL for ``agents_os_v3/ui/`` pages (no query string)."""
    raw = os.environ.get(
        "AOS_V3_E2E_BASE_URL",
        "http://127.0.0.1:8090/v3/index.html",
    ).strip()
    return _e2e_ui_dir_from_base_page(raw)


@pytest.fixture(scope="session")
def e2e_ui_page(e2e_ui_dir: str, e2e_ui_mock_query: str) -> Callable[[str], str]:
    """Build URL for a sibling page (e.g. ``config.html``) with optional mock query."""

    def _page(html_name: str) -> str:
        u = e2e_ui_dir + html_name
        if not e2e_ui_mock_query:
            return u
        if "aosv3_mock=" in u:
            return u
        sep = "&" if "?" in u else "?"
        return f"{u}{sep}{e2e_ui_mock_query}"

    return _page


@pytest.fixture(scope="session")
def e2e_base_url(e2e_ui_page: Callable[[str], str]) -> str:
    """Full URL to Pipeline View (index.html), mock mode by default unless disabled."""
    return e2e_ui_page("index.html")


@pytest.fixture(scope="session")
def e2e_ui_base_url(e2e_ui_dir: str) -> str:
    """Directory only (no mock). Prefer ``e2e_ui_page('name.html')`` for navigations."""
    return e2e_ui_dir


@pytest.fixture
def browser_driver() -> Generator[object, None, None]:
    """Chrome WebDriver; headless by default for CI-like runs."""
    pytest.importorskip("selenium")
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    opts = Options()
    headless = os.environ.get("AOS_V3_E2E_HEADLESS", "1").lower() not in (
        "0",
        "false",
        "no",
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
