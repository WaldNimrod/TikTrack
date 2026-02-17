# דוח ראיות — עדכוני תיעוד וניקוי (ADR-015)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-01-30  
**נושא:** דחיית שער ג', ניקוי זנבות בתקשורת, תאימות תיעוד–קוד, עדכוני תיעוד

---

## 1. סיכום ביצוע

| פעולה | סטטוס | מיקום |
|--------|--------|--------|
| דחיית שער ג' (ויזואלי) לשלב מאוחר יותר | ✅ בוצע | Evidence Log §סטטוס, §7 |
| ניקוי קבצים זמניים/לא-תקשורת מתוך _COMMUNICATION | ✅ בוצע | ארכיון + הסרה מ-team_10 |
| תאימות תיעוד ↔ קוד (ADR-015) | ✅ אומתה | טבלה להלן |
| דוח ראיות לעדכוני התיעוד | ✅ מסמך זה | 05-REPORTS/artifacts/ |

---

## 2. עדכוני תיעוד שבוצעו

### 2.1 Evidence Log (ADR-015)

- **קובץ:** `05-REPORTS/artifacts/TEAM_10_ADR_015_BROKER_REFERENCE_EVIDENCE_LOG.md`
- **עדכונים:**
  - **סטטוס:** נוסף — "שער ג' (בדיקות ויזואליות) נדחה לשלב מאוחר יותר — יבוצע יחד עם סבב דיוק עיצוב לפני Batch 3."
  - **§7 "הבא":** עודכן — "שער ג' (Visionary) — **נדחה לשלב מאוחר יותר** (סבב דיוק עיצוב לפני Batch 3). בדיקה ראשונית בוצעה; ניקוי זנבות ותאימות תיעוד–קוד — ראה דוח הראיות."

### 2.2 דחיית שער ג'

- שער ג' (בדיקות ויזואליות / Visionary) לא בוטל — **נדחה** לשלב מאוחר יותר.
- יבוצע יחד עם סבב דיוק עיצוב **לפני Batch 3** (מימוש עמודים נוספים).
- בדיקה ראשונית בוצעה על ידי המשתמש; הדברים בסדר.

---

## 3. ניקוי זנבות — תקשורת

### 3.1 קבצים שהועברו לארכיון (הוסרו מתיקיית התקשורת)

| קובץ | מקור | יעד |
|------|------|------|
| FIX_PhoenixFilterContext.jsx | `_COMMUNICATION/team_10/` | `_COMMUNICATION/99-ARCHIVE/2026-01-30_comm_cleanup/` |
| routes.json | `_COMMUNICATION/team_10/` | `_COMMUNICATION/99-ARCHIVE/2026-01-30_comm_cleanup/` |

**סיבה:** קבצים אלה הם קוד/תצורה (פאטץ' ו-config), לא מסמכי תקשורת בין צוותים. הועברו לארכיון עם README בתיקייה.

### 3.2 תיקיית ארכיון

- **נתיב:** `_COMMUNICATION/99-ARCHIVE/2026-01-30_comm_cleanup/`
- **תוכן:** FIX_PhoenixFilterContext.jsx, routes.json, README.md

---

## 4. תאימות תיעוד ↔ קוד (ADR-015)

אימות מול:

- DDL: `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- API: `api/routers/reference.py`, `api/routers/brokers_fees.py`, `api/schemas/reference.py`, `api/models/brokers_fees.py`, `api/data/defaults_brokers.json`
- UI: `ui/src/views/financial/tradingAccounts/`, `ui/src/views/financial/brokersFees/`, `ui/src/views/financial/shared/fetchReferenceBrokers.js`

| נושא | תיעוד (SSOT / Evidence) | קוד | תאימות |
|------|--------------------------|------|--------|
| טבלת brokers_fees — trading_account_id | DDL: trading_account_id UUID NOT NULL, FK ל-trading_accounts | api/models/brokers_fees.py: trading_account_id, FK | ✅ |
| brokers_fees — ללא broker כ-FK | §3 Evidence: "אין broker כ-FK בעמלות" | מודל ללא שדה broker | ✅ |
| commission_value / minimum | DDL: NUMERIC(20,6); SSOT COMMISSION_VALUE | Numeric(20,6) במודל | ✅ |
| GET /reference/brokers — שדות | ADR-015: value, display_name, is_supported, default_fees, "אחר" | schemas/reference.py: BrokerReferenceItem; defaults_brokers.json כולל "other", display_name "אחר" | ✅ |
| D16 — "אחר" + הודעת משילות | ADR-015 §3: ב-D16 בלבד | tradingAccountsForm.js: broker "other", הודעת משילות | ✅ |
| D18 — עמלות לפי חשבון | ADR-015: trading_account_id, בחירת חשבון | brokersFeesForm/Table: trading_account_id, בורר חשבון, ללא בורר ברוקר | ✅ |
| שימוש ב-display_name ב-UI | fetchReferenceBrokers: display_name / label | value/label מ-API; D18/D16 משתמשים ב-label | ✅ |

**מסקנה:** תאימות מלאה בין התיעוד לבין הקוד בנושאי ADR-015 (רפרנס ברוקרים, עמלות לפי חשבון מסחר, "אחר", הודעת משילות, DDL ו-API).

---

## 5. הפניות

- **Evidence Log ADR-015:** `05-REPORTS/artifacts/TEAM_10_ADR_015_BROKER_REFERENCE_EVIDENCE_LOG.md`
- **נוהל שערים:** `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
- **ארכיון ניקוי:** `_COMMUNICATION/99-ARCHIVE/2026-01-30_comm_cleanup/README.md`

---

**log_entry | TEAM_10 | ADR_015_DOCUMENTATION_EVIDENCE_REPORT | 2026-01-30**
