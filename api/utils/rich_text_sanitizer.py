"""
Rich-Text Sanitizer (SOP-012, T20.2)
Server-side HTML sanitization for description, notes, and notes.content (D35) fields.

Rules:
- Tags: p, br, strong, em, u, a, ul, ol, li, span, h3, h4
- a: href (http/https/mailto), target, rel
- span: only class with values starting phx-rt--
- p, h3, h4: dir (rtl, ltr, auto), style (text-align only)
"""

import re
from typing import Optional

try:
    import bleach
except ImportError:
    bleach = None
try:
    from bleach.css_sanitizer import CSSSanitizer
except ImportError:
    CSSSanitizer = None

# SOP-012 allowlist
SOP012_TAGS = {'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span', 'h3', 'h4'}
SOP012_ATTRIBUTES = {
    'a': ['href', 'target', 'rel'],
    'span': ['class'],
    'p': ['dir', 'style'],
    'h3': ['dir', 'style'],
    'h4': ['dir', 'style'],
}
SOP012_DIR_VALUES = frozenset({'rtl', 'ltr', 'auto'})
SOP012_PROTOCOLS = {'http', 'https', 'mailto'}
PHX_RT_PREFIX = 'phx-rt--'

# Regex to find span with class attribute for post-processing (double or single quotes)
_SPAN_CLASS_RE = re.compile(
    r'<span\s+class=(["\'])([^"\']*)\1\s*>',
    re.IGNORECASE | re.DOTALL
)


def _allowed_p_dir(tag: str, name: str, value: str) -> Optional[str]:
    """Allow dir on p only if value is rtl, ltr, or auto."""
    if tag == 'p' and name == 'dir' and value:
        v = value.strip().lower()
        return v if v in SOP012_DIR_VALUES else None
    return None


def _attributes_filter(tag: str, name: str, value: str):
    """
    Attribute filter for bleach. Returns value to keep, or True to keep as-is, or None to drop.
    Handles p[dir] (rtl/ltr/auto only); others use default allowlist.
    """
    if tag == 'p' and name == 'dir':
        return _allowed_p_dir(tag, name, value)
    if tag in SOP012_ATTRIBUTES and name in SOP012_ATTRIBUTES[tag]:
        return True
    return None


def _filter_span_class(match: re.Match) -> str:
    """Keep only class tokens starting with phx-rt--."""
    class_val = match.group(2)  # group 1 is quote, group 2 is value
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
    - p, h3, h4: dir (rtl/ltr/auto), style (text-align only)
    """
    if html is None or not isinstance(html, str):
        return html
    s = html.strip()
    if not s:
        return html
    
    if bleach is None:
        raise RuntimeError("bleach package required for rich-text sanitization. pip install bleach")
    
    css_sanitizer = CSSSanitizer(allowed_css_properties=['text-align']) if CSSSanitizer else None
    
    cleaned = bleach.clean(
        s,
        tags=SOP012_TAGS,
        attributes=_attributes_filter,
        protocols=SOP012_PROTOCOLS,
        strip=True,
        strip_comments=True,
        css_sanitizer=css_sanitizer,
    )
    # Post-process: filter span class to only phx-rt--*
    cleaned = _SPAN_CLASS_RE.sub(_filter_span_class, cleaned)
    return cleaned


def is_rich_text_field(field_name: str) -> bool:
    """Check if field receives sanitization (description, notes, content for D35 notes)."""
    return field_name in ('description', 'notes', 'content')
