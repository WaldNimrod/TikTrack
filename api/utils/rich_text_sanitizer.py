"""
Rich-Text Sanitizer (SOP-012, T20.2)
Server-side HTML sanitization for description/notes fields.

Rules (from SOP_012_DOMPURIFY_ALLOWLIST.md):
- Tags: p, br, strong, em, u, a, ul, ol, li, span
- a: href (http/https/mailto), target, rel
- span: only class with values starting phx-rt--
"""

import re
from typing import Optional

try:
    import bleach
except ImportError:
    bleach = None

# SOP-012 allowlist
SOP012_TAGS = {'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span'}
SOP012_ATTRIBUTES = {
    'a': ['href', 'target', 'rel'],
    'span': ['class'],
}
SOP012_PROTOCOLS = {'http', 'https', 'mailto'}
PHX_RT_PREFIX = 'phx-rt--'

# Regex to find span with class attribute for post-processing
_SPAN_CLASS_RE = re.compile(r'<span\s+class="([^"]*)"\s*>', re.IGNORECASE | re.DOTALL)


def _filter_span_class(match: re.Match) -> str:
    """Keep only class tokens starting with phx-rt--."""
    class_val = match.group(1)
    if not class_val:
        return '<span>'
    allowed = [t.strip() for t in class_val.split() if t.strip().startswith(PHX_RT_PREFIX)]
    if not allowed:
        return '<span>'
    return f'<span class="{" ".join(allowed)}">'


def sanitize_rich_text(html: Optional[str]) -> Optional[str]:
    """
    Sanitize Rich-Text HTML per SOP-012.
    
    - Only allowed tags and attributes
    - span class: only phx-rt--* values
    - a href: only http, https, mailto
    """
    if html is None or not isinstance(html, str):
        return html
    s = html.strip()
    if not s:
        return html
    
    if bleach is None:
        raise RuntimeError("bleach package required for rich-text sanitization. pip install bleach")
    
    cleaned = bleach.clean(
        s,
        tags=SOP012_TAGS,
        attributes=SOP012_ATTRIBUTES,
        protocols=SOP012_PROTOCOLS,
        strip=True,
        strip_comments=True,
    )
    # Post-process: filter span class to only phx-rt--*
    cleaned = _SPAN_CLASS_RE.sub(_filter_span_class, cleaned)
    return cleaned


def is_rich_text_field(field_name: str) -> bool:
    """Check if field receives sanitization (description, notes)."""
    return field_name in ('description', 'notes')
