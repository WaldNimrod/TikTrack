# 🕵️ Team 90 — Batch 1+2 Decision Audit (Status & Gaps)

**id:** `TEAM_90_BATCH_1_2_DECISION_AUDIT_REPORT`  
**owner:** Team 90 (The Spy)  
**date:** 2026-02-12  
**status:** 🟡 **IN_REVIEW — EVIDENCE REQUESTED**  
**scope:** החלטות שננעלו במהלך Batch 1+2 (להצלבה מול SSOT + קוד בפועל)

---

## ✅ Sources (Architect SSOT / Mandates)

- `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_DATA_MANAGEMENT_SOP_011.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_HEADER_UNIFICATION_MANDATE.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR-013)
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md` (SOP-012)
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_SLA_TEAMS_30_40_OFFICIAL.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSIONING_POLICY.md` + `TT2_VERSION_MATRIX.md` (ADR-016)
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (ADR-015 changes)

---

## 🔎 Findings by Topic (Status / Evidence / Gaps)

### 1) טבלאות ורספונסיב (Option D)
**SSOT:** `ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`  
**Evidence (code):** `ui/src/styles/phoenix-components.css` (col-broker/col-trade/col-date sticky)  
**Evidence (mapping):** `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md` (archive)  
**Status:** 🟡 *Partially verified* — CSS נמצא, אבל נדרש אימות שכל הטבלאות (D16/D18/D21) אכן מיושמות עם Sticky Start/End + Fluid לפי ה-SSOT.
**Action:** בקשת הוכחות מ-Team 30/40: צילומי קוד/רשימת קבצי CSS ו-HTML לכל טבלה + בדיקות responsive.

---

### 2) עמוד תצוגת צבעים דינאמיים (Design System Page)
**SSOT:** SOP-012 — `ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`  
**Evidence (code):** `/admin/design-system` קיים (`ui/src/router/AppRouter.jsx`, `DesignSystemDashboard.jsx`, `DesignSystemColorsTable.jsx`)  
**Status:** 🟢 *Implemented in React* (Type D).  
**Gap:** נדרש לוודא: (א) Type D guard עובד לפי JWT role, (ב) כל צבעים מחוברים ל-CSS variables בלבד (ללא inline styles מלבד swatches).  
**Action:** בקשת הוכחות מ-Team 30 + Team 50 (Gate B) שהעמוד מאומת ב-Admin בלבד ושהטבלה מציגה את כל המשתנים בהתאם ל-DNA.

---

### 3) נתוני בסיס / נתוני ניסיון / נתוני פרזנטציה
**SSOT:** SOP-011 — `ARCHITECT_DATA_MANAGEMENT_SOP_011.md` (is_test_data + seeders)  
**Evidence:** `scripts/seed_qa_test_user.py`, `make db-test-fill/clean` (לפי SOP)  
**Status:** 🟡 *Policy exists* — **אין מיפוי מלא** של אילו נתונים Base/Presentation קיימים בכל טבלה ואיך הם מסומנים.  
**Action:** בקשה ל-Team 60/20 למיפוי טבלאות + שדות + ערכי seed עם `is_test_data`, ודוח `make db-test-clean` בפועל.

---

### 4) עיצוב מודולים + תיקוני עיצוב בתפריט ראשי
**SSOT:** לא נמצא מסמך החלטה ברור באדריכלית לגבי *סדר כפתורים RTL, צבע כותרת מודול, עיצוב מודולים*.  
**Status:** 🔴 *SSOT missing / ambiguous*.  
**Action:** נדרש לאתר מסמך החלטה רשמי או לקבל החלטה חדשה; עד אז — לא ניתן לאשר סגירה.

---

### 5) בעיות תצוגה תפריט ראשי
**SSOT / Mandate:** `ARCHITECT_HEADER_UNIFICATION_MANDATE.md` (Header Unified, Loader)  
**Evidence (code):** `ui/src/components/core/headerLoader.js`, `unified-header.html`, `headerLinksUpdater.js`  
**Status:** 🟡 *Known historical failures* — נדרש אישור שה-Header נטען תמיד בכל עמודי C/B, ושאינו נשבר בחזרה מה-Login (בעיה ידועה).  
**Action:** בקשת Evidence + בדיקות סריקה ל-Team 30/50.

---

### 6) ולידציה / Auth Types A/B/C/D (+ Admin)
**SSOT:** ADR-013 + `TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md`  
**Evidence:** Gate A tests (`tests/gate-a-e2e.test.js`) + AppRouter route guards  
**Status:** 🟢 *Verified in Gate A* — סוגי עמודים קיימים והוגדרו (כולל Type D).  
**Gap:** נדרש לוודא שכל Routes ממשיכים לציית ל-A/B/C/D לאחר שינויי Batch 2 (לא רק בדיקה חד-פעמית).

---

### 7) טקסט עשיר (TipTap) + Sanitization
**SSOT:** SOP-012 — `ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`  
**Evidence (FE):** `ui/src/components/shared/phoenixRichTextEditor.js`, `ui/src/utils/dompurifyRichText.js`  
**Evidence (BE):** `api/utils/rich_text_sanitizer.py`, `api/scripts/test_rich_text_roundtrip.py`  
**Status:** 🟢 *Implemented* (FE+BE)  
**Action:** בקשת הוכחות ל-Team 20 + Team 50: סניטיזציה בשרת בפועל + בדיקת Round-trip על השדות הרלוונטיים (description/notes).

---

### 8) עמלות / ברוקרים (Fees per Trading Account)
**SSOT:** ADR-015 + DDL `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`  
**Evidence:** מסמכי ADR-015 + DDL update (trading_account_id, commission_value NUMERIC(20,6))  
**Status:** 🟡 *SSOT aligned* — אבל נדרש אימות מיגרציה בפועל (טבלת brokers_fees) + UI (D18).  
**Action:** בקשה ל-Team 20: דוח מיגרציה + לוגים; ל-Team 30: UI D18 לפי trading_account_id.

---

### 9) ניהול גרסאות
**SSOT:** ADR-016 — `TT2_VERSIONING_POLICY.md` + `TT2_VERSION_MATRIX.md`  
**Evidence:** עדכון מדיניות SV‑Prefixed + מטריצות  
**Status:** 🟢 *Aligned & verified* (API version unified, matrix updated).  
**Action:** אין.

---

## 📥 Evidence Requests (Teams)

**Team 20**
- מיגרציית ADR‑015: דוח מיפוי → trading_account_id (כמה שורות עודכנו/לא עודכנו + fallback handling).
- Rich‑Text BE: הוכחת סניטיזציה לפני save (שדות description/notes).

**Team 30**
- Responsive Option D: הוכחת Sticky Start/End + Fluid (D16/D18/D21) מול CSS + HTML בפועל.
- Header: הוכחת persistence אחרי Login (בעיית חזרה ל-Home).
- D18 Fees UI: trading_account_id בלבד.

**Team 40**
- DNA Button System + DNA Palette: לוודא שהמסמכים הארכיוניים הם SSOT מעודכן ולציין path רשמי להפצה.
- Module styling (אם קיים מסמך החלטה רשמי — לספק נתיב).

**Team 50**
- Gate B evidence עבור TipTap / Design System Page / auth types (אם כבר בוצעו).

---

## ✅ Summary
יש כיסוי SSOT כמעט מלא, אבל **נדרשת הוכחה מלאה** לשני תחומים רגישים לפני סגירה:
1) Responsive tables בפועל (D16/D18/D21)  
2) Module/menu UI decisions (חסר SSOT ברור)

המלצה: להוציא בקשות evidence ממוקדות לצוותים לפי הרשימה לעיל.

---

**Prepared by:** Team 90 (The Spy)
