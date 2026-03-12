"""
Parses LLD400 spec documents to extract API and Page contracts.
Input: spec document content (string)
Output: list[APIContract] + list[PageContract]
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class APIContract:
    endpoint: str
    method: str
    request_shape: str
    response_shape: str
    auth_required: bool


@dataclass
class PageContract:
    page_id: str
    route: str
    components: list[str]


def parse_api_contracts(spec_content: str) -> list[APIContract]:
    """Extract API contracts from ## API Contracts section."""
    if not spec_content or "## API Contracts" not in spec_content:
        return []

    section_match = re.search(
        r"## API Contracts\s*\n(.*?)(?=##\s|\Z)",
        spec_content,
        re.DOTALL,
    )
    if not section_match:
        return []

    section = section_match.group(1)
    # Match table: | Endpoint | Method | Request | Response | Auth |
    # Table rows: | /api/v1/... | GET | — | {...} | Required |
    lines = section.strip().split("\n")
    contracts: list[APIContract] = []

    header_found = False
    for line in lines:
        line = line.strip()
        if not line or not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if len(cells) < 5:
            continue
        # Header row: Endpoint, Method, Request, Response, Auth
        if cells[0].lower() == "endpoint" and cells[1].lower() == "method":
            header_found = True
            continue
        if not header_found:
            continue
        if cells[0].strip("-").strip() == "" or cells[1].strip("-").strip() == "":
            continue  # Skip separator row |---|---|
        endpoint, method, request_shape, response_shape, auth_val = (
            cells[0], cells[1], cells[2], cells[3], cells[4]
        )
        auth_required = auth_val.lower() in ("required", "yes", "true", "1")
        contracts.append(
            APIContract(
                endpoint=endpoint,
                method=method,
                request_shape=request_shape or "—",
                response_shape=response_shape or "—",
                auth_required=auth_required,
            )
        )

    return contracts


def parse_page_contracts(spec_content: str) -> list[PageContract]:
    """Extract Page contracts from ## Page Contracts section."""
    if not spec_content or "## Page Contracts" not in spec_content:
        return []

    section_match = re.search(
        r"## Page Contracts\s*\n(.*?)(?=##\s|\Z)",
        spec_content,
        re.DOTALL,
    )
    if not section_match:
        return []

    section = section_match.group(1)
    lines = section.strip().split("\n")
    contracts: list[PageContract] = []

    header_found = False
    for line in lines:
        line = line.strip()
        if not line or not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if len(cells) < 3:
            continue
        first_lower = cells[0].lower().replace(" ", "")
        if first_lower == "pageid" and len(cells) >= 3:
            header_found = True
            continue
        if not header_found:
            continue
        if cells[0].strip("-").strip() == "" or cells[1].strip("-").strip() == "":
            continue  # Skip separator row
        page_id, route, components_str = cells[0], cells[1], cells[2]
        components = [c.strip() for c in components_str.split(",") if c.strip()]
        contracts.append(
            PageContract(
                page_id=page_id,
                route=route,
                components=components,
            )
        )

    return contracts
