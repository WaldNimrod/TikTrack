# Evidence: עורך טקסט עשיר — כפתורים באנגלית, H3/H4, יישור, RTL/LTR
**Session:** SESSION_01 | **Date:** 2026-01-31

## דרישות
1. כפתורים באנגלית — תווית משקפת את התוצאה (Bold, Italic, וכו')
2. H3 + H4
3. יישור: שמאל, מרכז, ימין, justify + כיוון RTL/LTR
4. רשימות: bullet (לא ממוספרת) + ordered (ממוספרת)

## יישום

### 1. Toolbar Config
| קובץ | שינוי |
|------|-------|
| `phoenixRichTextToolbarConfig.js` | כפתורים באנגלית: Bold, Italic, Underline, Success, Warning, Danger, Highlight, H3, H4, Align Left/Center/Right/Justify, LTR/RTL, Bullet List, Ordered List |

### 2. TipTap Extensions
| קובץ | שינוי |
|------|-------|
| `phoenixRichTextEditor.js` | Heading (levels 3,4), TextAlign (left, center, right, justify), textDirection: 'auto' |
| | טיפול ב־heading3, heading4, alignLeft/Center/Right/Justify, dirLtr, dirRtl |

### 3. Sanitizers
| קובץ | שינוי |
|------|-------|
| `dompurifyRichText.js` | תגיות: h3, h4; attr: dir, style; ולידציה ל־text-align, dir |
| `rich_text_sanitizer.py` | תגיות: h3, h4; p/h3/h4: dir, style; CSSSanitizer (text-align) |
| `requirements.txt` | bleach[css] |

### 4. CSS
| קובץ | שינוי |
|------|-------|
| `phoenix-components.css` | עיצוב h3, h4 ב־ProseMirror; toolbar padding/font |
