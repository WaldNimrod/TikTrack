# Rich-Text Sanitization Policy (SOP-012, T20.2)

**מקור:** `SOP_012_DOMPURIFY_ALLOWLIST.md`, `ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`  
**מימוש:** `api/utils/rich_text_sanitizer.py`

---

## 1. מדיניות

כל תוכן Rich-Text (HTML) בשדות `description` / `notes` עובר **סניטיזציה בשרת** לפני שמירה ל-DB.

## 2. חוקים

- **תגיות מותרות:** `p`, `br`, `strong`, `em`, `u`, `a`, `ul`, `ol`, `li`, `span`, `h3`, `h4`
- **`p`, `h3`, `h4`:** `dir` (rtl, ltr, auto), `style` (רק text-align)
- **`a`:** `href` (רק http, https, mailto), `target`, `rel`
- **`span`:** רק `class` — וערך ה-class **חייב** להתחיל ב-`phx-rt--` (למשל `phx-rt--success`, `phx-rt--warning`, `phx-rt--danger`, `phx-rt--highlight`)
- **אסור:** `style`, `on*`, `script`, `iframe`, וכל תגית/attribute שלא ברשימה

## 3. שדות מושפעים

| Endpoint | שדה |
|----------|-----|
| cash_flows (POST/PUT) | description |
| notes (POST/PUT) — D35 | content |

## 4. אימות T20.3

ה-HTML המסונן נשמר **במלואו** ל-DB:
- עמודה `TEXT` — ללא הגבלת אורך
- אין חיתוך; אין שיבוש encoding
- Round-trip: שמירה → קריאה → תצוגה זהה

**בדיקה:** `api/scripts/test_rich_text_roundtrip.py`
