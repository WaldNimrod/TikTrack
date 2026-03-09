from __future__ import annotations

"""
Response Parser — extracts structured gate decisions from LLM responses.
"""

import re


def parse_gate_decision(content: str) -> tuple[str, str]:
    """Parse structured decision block from LLM response.
    
    Looks for:
        ## Gate Decision
        STATUS: PASS | FAIL | CONDITIONAL_PASS | APPROVED | REJECTED
        REASON: ...
    
    Returns (status, reason). Falls back to keyword search.
    """
    block_match = re.search(
        r"##\s*Gate\s*Decision\s*\n.*?STATUS:\s*(PASS|FAIL|CONDITIONAL_PASS|APPROVED|REJECTED)",
        content, re.IGNORECASE | re.DOTALL
    )
    if block_match:
        raw_status = block_match.group(1).upper()
        status = "PASS" if raw_status in ("PASS", "APPROVED") else \
                 "CONDITIONAL_PASS" if raw_status == "CONDITIONAL_PASS" else "FAIL"
        reason_match = re.search(r"REASON:\s*(.+?)(\n|$)", content)
        reason = reason_match.group(1).strip() if reason_match else ""
        return status, reason
    
    # Fallback: keyword search
    upper = content.upper()
    if "APPROVED" in upper or ("PASS" in upper and "BLOCK" not in upper and "FAIL" not in upper):
        return "PASS", "(fallback keyword match)"
    return "FAIL", "(fallback keyword match)"
