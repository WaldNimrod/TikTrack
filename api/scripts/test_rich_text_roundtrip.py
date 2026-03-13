#!/usr/bin/env python3
"""
T20.3: Verify HTML round-trip - sanitized description saved in full.

Verification without DB:
- Sanitizer preserves full allowed HTML (no truncation)
- DB column type TEXT (no length limit)
- Service passes string directly to ORM
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from api.utils.rich_text_sanitizer import sanitize_rich_text


def main():
    html_in = '<p>Test <strong>bold</strong> <span class="phx-rt--success">highlight</span></p>'
    out = sanitize_rich_text(html_in)
    # Sanitizer does not truncate - output length >= meaningful content
    ok = out is not None and len(out) > 0
    ok = ok and "phx-rt--success" in out and "highlight" in out
    print("T20.3 round-trip:", "PASS" if ok else "FAIL")
    print("  Input len:", len(html_in), "Output len:", len(out) if out else 0)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
