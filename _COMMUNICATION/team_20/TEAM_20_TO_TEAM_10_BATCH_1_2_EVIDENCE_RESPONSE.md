# Team 20 → Team 10: תשובת Evidence — אודיט Batch 1+2

**מאת:** Team 20 (Backend & DB)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_10_TO_TEAM_20_BATCH_1_2_EVIDENCE_REQUEST.md  

---

## 1. ADR-015 מיגרציה — מיפוי + טיפול בחריגים

### 1.1 מדיניות שנבחרה

**רשומות עמלה ללא חשבון מסחר תואם — נמחקות.** אין fallback ברמת DB.

| שלב | פעולה |
|-----|--------|
| מיפוי | (user_id, broker) → trading_accounts — התאמה לפי created_at |
| התאמה | עדכון trading_account_id |
| **אין התאמה** | **DELETE** + `RAISE NOTICE` עם מספר הרשומות שנמחקו |

### 1.2 תוצאות המיגרציה (דיווח Team 60)

| מדד | ערך |
|-----|-----|
| שורות עודכנו | 3 |
| שורות נמחקו (ללא התאמה) | 14 |
| שורות אחרי מיגרציה | 3 |

### 1.3 טיפול מצד API/Backend

**אין טיפול מיוחד בחריגים לאחר מיגרציה.** הסיבה:

- המיגרציה היא פעולה חד-פעמית — הושלמה.
- אחרי המיגרציה: **כל** שורות `brokers_fees` מכילות `trading_account_id NOT NULL`.
- רשומות ללא התאמה **נמחקו** — הן לא קיימות ב-DB, ולכן לא מגיעות ל-API.

### 1.4 לוגים ותיעוד

| פריט | מיקום |
|------|--------|
| סקריפט מיגרציה | `scripts/migrations/adr_015_brokers_fees_trading_account_id.sql` (שורות 55–67) |
| NOTICE במיגרציה | `RAISE NOTICE 'ADR-015: Deleted % broker fee(s) with no matching trading account.', deleted_count` |
| דוח מיגרציה | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_ADR_015_MIGRATION_COMPLETE.md` |

---

## 2. Rich-Text BE — הוכחת סניטיזציה (SOP-012)

### 2.1 מסלול בקוד

| Endpoint | שירות | שדה | שורה | פעולה |
|----------|--------|------|------|--------|
| `POST /api/v1/cash_flows` | `api/services/cash_flows.py` | `description` | 344–355 | `sanitize_rich_text(description)` לפני יצירת CashFlow |
| `PUT /api/v1/cash_flows/{id}` | `api/services/cash_flows.py` | `description` | 488–489 | `sanitize_rich_text(description)` לפני עדכון |

### 2.2 ציטוט קוד

**Create (שורות 344–355):**
```python
# SOP-012: sanitize rich-text before save (T20.2)
sanitized_description = sanitize_rich_text(description) if description is not None else None

new_flow = CashFlow(
    ...
    description=sanitized_description,
    ...
)
```

**Update (שורות 488–489):**
```python
if description is not None:
    cash_flow.description = sanitize_rich_text(description)
```

### 2.3 שדות נוספים (notes)

**במודלים הנוכחיים:**
- `cash_flows` — יש **רק** `description` (אין `notes`).
- `trades`, `trading_accounts`, `brokers_fees` — אין שדות `description` או `notes` שנושׁמים מ-HTML.

**מסקנה:** `description` ב־`cash_flows` הוא השדה היחיד שמקבל סניטיזציה; הוא ממומש בהתאם.

### 2.4 מקור הסניטיזציה

| קובץ | תיאור |
|------|--------|
| `api/utils/rich_text_sanitizer.py` | פונקציה `sanitize_rich_text()` — bleach, SOP-012 allowlist |
| `api/utils/RICH_TEXT_SANITIZATION_POLICY.md` | תיעוד מדיניות |

### 2.5 אימות — סקריפט בדיקה

```bash
python3 api/scripts/test_rich_text_roundtrip.py
```

**תוצאה (אומת):**
```
T20.3 round-trip: PASS
  Input len: 80 Output len: 80
```

---

## 3. סיכום

| דרישה | סטטוס |
|-------|--------|
| ADR-015 מיפוי + חריגים | ✅ מדיניות: מחיקה; לוג NOTICE; אין fallback — רשומות נמחקו ולא מגיעות ל-API |
| Rich-Text סניטיזציה | ✅ `cash_flows.description` — create/update; מסלול מתועד |

---

**Team 20 (Backend)**  
**log_entry | BATCH_1_2_EVIDENCE | TO_TEAM_10 | 2026-02-12**
