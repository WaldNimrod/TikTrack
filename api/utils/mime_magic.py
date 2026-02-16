"""
D35 MIME validation by magic-bytes (לא רק סיומת)
TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE
Allowed: jpg, png, webp, pdf, xls, xlsx, doc, docx
"""

from typing import Optional, Tuple

# Magic byte signatures (prefix) -> (MIME type, allowed extension)
# D35 LOCK: jpg, png, webp, pdf, xls, xlsx, doc, docx
_MAGIC_SIGS: list[Tuple[bytes, str, tuple]] = [
    (b"\xff\xd8\xff", "image/jpeg", ("jpg", "jpeg")),
    (b"\x89PNG\r\n\x1a\n", "image/png", ("png",)),
    (b"RIFF", "image/webp", ("webp",)),  # WebP: RIFF....WEBP — check at offset 8
    (b"%PDF", "application/pdf", ("pdf",)),
    (b"\xd0\xcf\x11\xe0", "application/vnd.ms-excel", ("xls",)),  # OLE (Excel 97-2003)
    (b"\xd0\xcf\x11\xe0", "application/msword", ("doc",)),  # OLE (Word 97-2003) — same magic
    (b"PK\x03\x04", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ("xlsx",)),  # ZIP
    (b"PK\x03\x04", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ("docx",)),  # ZIP
    (b"PK\x05\x06", "application/zip", ("xlsx", "docx")),  # ZIP empty/minimal
]

# For RIFF/WebP: bytes 8-11 must be "WEBP"
_WEBP_OFFSET = 8
_WEBP_MARKER = b"WEBP"


def detect_mime_and_extension(data: bytes) -> Optional[Tuple[str, str]]:
    """
    Detect MIME type and primary extension from file content (magic-bytes).
    Returns (mime_type, extension) or None if not recognized/allowed.
    """
    if not data or len(data) < 4:
        return None

    for magic, mime, exts in _MAGIC_SIGS:
        if data.startswith(magic):
            if magic == b"RIFF":
                if len(data) >= 12 and data[_WEBP_OFFSET : _WEBP_OFFSET + 4] == _WEBP_MARKER:
                    return ("image/webp", "webp")
                return None
            if magic == b"\xd0\xcf\x11\xe0":
                # OLE: xls and doc share magic; both allowed per D35
                return ("application/vnd.ms-excel", "xls")
            if magic == b"PK\x03\x04" or magic == b"PK\x05\x06":
                # ZIP: peek for xlsx vs docx via [Content_Types].xml
                if b"word/" in data or b"wordprocessingml" in data[:2048]:
                    return ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx")
                if b"xl/" in data or b"spreadsheetml" in data[:2048]:
                    return ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx")
                # Default ZIP to xlsx for Office Open XML (could be either)
                return ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx")
            return (mime, exts[0])

    return None


_ALLOWED_MIMES = frozenset({
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
})


def validate_mime_magic(data: bytes, claimed_content_type: Optional[str] = None) -> Tuple[bool, str]:
    """
    Validate file by magic-bytes. Returns (ok, detected_content_type or error_msg).
    """
    result = detect_mime_and_extension(data)
    if not result:
        return (False, "Unsupported file type (magic-bytes)")
    mime, _ = result
    if mime not in _ALLOWED_MIMES:
        return (False, "Unsupported file type (magic-bytes)")
    return (True, mime)
