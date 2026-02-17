# דוח תגובה לאודיט Batch 1+2 + פערים (Team 10)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_90_BATCH_1_2_DECISION_AUDIT_REPORT.md  
**מטרה:** תשובות במקום מידע ברור, הפניות לדרישות Evidence, וסיכום פערים

---

## דוח מסכם להצגה (Executive Summary)

**בוצע:**
1. **בחינת הדרישות** — נענו בכל מקום שיש מידע ברור (ראה §1).
2. **הודעות דרישה** — נשלחו ארבע הודעות מפורטות: Team 20, 30, 40, 50 (נתיבים ב-§2).
3. **ריכוז פערים** — טבלת פערים ב-§3.

**פערים עיקריים (חוסמי סגירה / דורשים השלמה):**

| פער | סטטוס | פעולה נדרשת |
|-----|--------|-------------|
| **Module/Menu Styling** | 🔴 חסר SSOT | איתור החלטה אדריכלית או קבלת החלטה חדשה |
| **Responsive Tables** | 🟡 Evidence חלקי | Team 30: רשימת קבצים + selectors לכל D16/D18/D21 |
| **DNA Button + Palette** | 🟡 בארכיון | Team 40 + Team 10: קביעת SSOT פעיל + עדכון אינדקס |
| **ADR-015 מיפוי/חריגים** | 🟡 | Team 20: דוח מיפוי + טיפול בחריגים |
| **Rich-Text BE Evidence** | 🟡 | Team 20: מסמך מסלול סניטיזציה בשרת |
| **Header Persistence** | 🟡 | Team 30/50: Evidence אחרי Login→Home |
| **Gate B paths** | 🟢 קיים | Team 50: ריכוז נתיבי Evidence במסמך אחד |

---

## 1. תשובות במקום מידע ברור וחד‑משמעי

### 1.1 ADR-015 מיגרציה (טבלת brokers_fees)

**מידע קיים:**  
- דוח מיגרציה מלא נמסר: `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_ADR_015_MIGRATION_COMPLETE.md`.  
- תוצאה: 3 שורות עודכנו, 14 נמחקו (ללא התאמה ל-trading_account_id); עמודת `broker` הוסרה, `trading_account_id` נוספה; אימות מבנה טבלה עבר.  
- **חסר לדרישת Team 90:** דוח מיפוי מפורש (שורה-שורה) + טיפול בחריגים/לוגים מצד **Team 20** (Backend) — למשל איך ה-API מטפל ב־fallback או ב־records שלא עברו מיפוי. נדרשת הודעת דרישה ל-Team 20.

### 1.2 Rich-Text BE — סניטיזציה בשרת

**מידע קיים:**  
- **מסלול בקוד:** `api/utils/rich_text_sanitizer.py` — `sanitize_rich_text()` (SOP-012, allowlist tags/attributes).  
- **שימוש לפני שמירה:** `api/services/cash_flows.py` — שורות 344–345 (create), 488–489 (update): `sanitized_description = sanitize_rich_text(description)` לפני שמירה ל-DB.  
- **שדות:** כרגע **description** ב-cash_flows מקבל סניטיזציה; אין שדות `description`/`notes` ב-brokers_fees API.  
- **בדיקת Round-trip:** `api/scripts/test_rich_text_roundtrip.py` קיים.  
- **חסר:** הוכחה פורמלית (מסמך/לוג) שסניטיזציה רצה בפועל בכל מסלול create/update — נדרשת הודעת דרישה ל-Team 20 (+ אופציונלי Team 50 להרצת round-trip ו-Evidence).

### 1.3 Responsive Option D — טבלאות D16/D18/D21

**מידע קיים:**  
- **SSOT:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md` — Option D (Sticky Start/End + Fluid).  
- **קוד CSS:** `ui/src/styles/phoenix-components.css` — קיימות כיתות sticky: `col-broker`, `col-trade`, `col-date` (למשל שורות 1363–1412), כולל `#accountActivityTable`, `#currencyConversionsTable`, `#brokersTable`.  
- **חסר:** רשימה מפורשת **לכל** טבלה (D16/D18/D21) של קבצי HTML + CSS + selectors שמממשים Sticky+Fluid; ואימות שכל הטבלאות הרלוונטיות מכוסות. נדרשת הודעת דרישה ל-Team 30 (ול-Team 40 אם יש שותפות ב-CSS).

### 1.4 Header Persistence (Login → Home)

**מידע קיים:**  
- **מנדט:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_HEADER_UNIFICATION_MANDATE.md`.  
- **קוד:** `ui/src/components/core/headerLoader.js`, `unified-header.html`, `headerLinksUpdater.js`.  
- **חסר:** Evidence/בדיקה שה-Header לא נעלם לאחר Login→Home (בעיה היסטורית שצוינה). נדרשת הודעת דרישה ל-Team 30 + Team 50 (בדיקה/תיעוד).

### 1.5 D18 Fees UI — trading_account_id בלבד (אין Broker)

**מידע קיים:**  
- **API:** `api/schemas/brokers_fees.py` — create/update דורשים `trading_account_id`; אין שדה broker ב-body.  
- **UI:** `ui/src/views/financial/brokersFees/brokersFeesForm.js` — טופס לפי trading_account_id (בורר חשבון); אין בורר broker.  
- **הערה:** ב-API יש **פילטר** אופציונלי `broker` (Query) לחיפוש לפי שם ברוקר (דרך חשבון) — זה לא סותר ADR-015 (עמלות שייכות לחשבון; פילטר לחוויית משתמש).  
- **מסקנה:** יישום D18 עומד בדרישה — יצירה/עריכה לפי `trading_account_id` בלבד. ניתן לציין זאת בדוח; אופציונלי לבקש מ-Team 30 מסמך אישור קצר.

### 1.6 DNA Button System + Palette — מיקום SSOT

**מידע קיים:**  
- **בארכיון:** `_COMMUNICATION/99-ARCHIVE/2026-02-12/team_40/DNA_BUTTON_SYSTEM.md`, `DNA_PALETTE_SSOT.md`.  
- **חסר:** מיקום SSOT **פעיל ונגיש** (לא רק ארכיון). נדרש: להעביר ל-documentation (למשל 04-DESIGN_UX_UI או 09-GOVERNANCE) או להכריז רשמית שהארכיון הוא ה-SSOT עם נתיב קבוע — ולעדכן את 00_MASTER_INDEX. נדרשת הודעת דרישה ל-Team 40 + משימת Team 10 (קביעת מיקום + עדכון אינדקס).

### 1.7 עיצוב מודולים + תפריט ראשי (Module/Menu Styling)

**מידע קיים:**  
- **סריקה:** לא נמצא מסמך החלטה אדריכלית ברור ל**סדר כפתורים RTL, צבע כותרת מודול, עיצוב מודולים/תפריט**.  
- **מסקנה:** **חסר SSOT** — נדרש לאתר מסמך החלטה רשמי או לקבל החלטה חדשה מהאדריכלית/G-Lead. עד אז — **נקודת חסימה לסגירה**.

### 1.8 Gate B Evidence — TipTap / Design System / Auth Types

**מידע קיים:**  
- **נתיבי Evidence:**  
  - `documentation/05-REPORTS/artifacts_SESSION_01/gate-b-artifacts/GATE_B_E2E_RESULTS.json` — כולל Admin/design-system, Guest redirect, Rich-Text.  
  - `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_RICH_TEXT_T30_2_TO_T30_5_EVIDENCE.md` — TipTap, Design System route.  
  - `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_B_RE_RUN_EVIDENCE.md`, `phase2-e2e-artifacts/` (screenshots, test_summary).  
- **מסקנה:** Evidence קיים; נדרש מ-Team 50 לצרף במפורש את הנתיבים בדוח/תשובה (או לעדכן מסמך אחד עם כל ה-paths).

---

## 2. הודעות דרישה שנשלחו לצוותים

- **Team 20:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_BATCH_1_2_EVIDENCE_REQUEST.md`  
- **Team 30:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_BATCH_1_2_EVIDENCE_REQUEST.md`  
- **Team 40:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_BATCH_1_2_EVIDENCE_REQUEST.md`  
- **Team 50:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_BATCH_1_2_EVIDENCE_REQUEST.md`

---

## 3. פערים שהתגלו (סיכום להצגה)

| # | נושא | סטטוס | פער / פעולה נדרשת |
|---|------|--------|-------------------|
| 1 | **Module/Menu Styling** | 🔴 חסום | אין SSOT — יש לאתר החלטה אדריכלית או לקבל החלטה חדשה. |
| 2 | **Responsive Tables (Option D)** | 🟡 חלקי | CSS קיים; חסר Evidence מלא לכל טבלאות D16/D18/D21 (קבצים + selectors + אימות). |
| 3 | **DNA Button + Palette** | 🟡 בארכיון | מסמכים בארכיון; חסר מיקום SSOT פעיל ונגיש + הפניה באינדקס. |
| 4 | **ADR-015 מיפוי + חריגים** | 🟡 | מיגרציה תועדה (Team 60); חסר דוח מיפוי/חריגים Team 20. |
| 5 | **Rich-Text BE Evidence** | 🟡 | קוד סניטיזציה קיים; חסר מסמך/הוכחה שמסלול create/update מרץ סניטיזציה. |
| 6 | **Header Persistence** | 🟡 | קוד קיים; חסר Evidence שהבעיה (Login→Home) נפתרה. |
| 7 | **Gate B Evidence paths** | 🟢 קיים | נתיבים קיימים; נדרש ריכוז מפורש בדוח Team 50. |

---

## 4. המלצות

1. **לנעול SSOT ל-DNA Button/Palette** — Team 10 + Team 40: להעביר ל-documentation או להכריז על נתיב ארכיון רשמי ולעדכן 00_MASTER_INDEX.  
2. **להשלים SSOT ל-Module/Menu Styling** — להעלות לאדריכלית/G-Lead: האם קיימת החלטה? אם לא — לקבל החלטה ולפרסם.  
3. **לעקוב אחרי הודעות הדרישה** — עד קבלת Evidence וסגירת הפערים.

---

**log_entry | TEAM_10 | BATCH_1_2_AUDIT_RESPONSE_AND_GAPS | 2026-02-12**
