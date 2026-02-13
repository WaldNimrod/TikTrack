# 🕵️ Team 90 → Roadmap V2 Alignment (Scope + Dependencies)

**id:** `TEAM_90_RDMP_V2_SCOPE_AND_DEPENDENCIES_REPORT`  
**from:** Team 90 (The Spy)  
**to:** Chief Architect (Gemini Bridge) + Team 10 (Gateway)  
**date:** 2026-02-13  
**context:** RDMP‑MASTER‑V2 alignment vs SSOT, menu/routes, blueprints, legacy, LEGO architecture  
**status:** ✅ **READY — WITH REQUIRED SSOT FIXES CALLED OUT**

---

## 0) מקורות אמת שנבדקו (ללא ניחושים)

### SSOT / Architecture
- `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md`
- `documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md`
- `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SYSTEM_OVERVIEW.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_DOMAIN_MODEL_AND_ENTITIES.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ARCHITECTURE_AND_RUNTIME_FLOWS.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SECURITY_AND_AUTH_MODEL.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_UI_SYSTEMS_AND_DESIGN.md`

### Mandates (Architect)
- `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md` (ADR‑017)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md` (ADR‑018)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` (Final Governance Lock)

### UI/Menu/Routes/Blueprints/Legacy
- `ui/src/views/shared/unified-header.html` (Menu)
- `ui/public/routes.json` (Routes SSOT)
- `ui/src/router/AppRouter.jsx` (React routes)
- `ui/src/views/**.html` (HTML pages in code)
- `_COMMUNICATION/team_31/team_31_staging/TEAM_31_WORKFLOW_PROCESS_V2.md` (Blueprints matrix)
- `_COMMUNICATION/Legace_html_for_blueprint/Home.html` (Legacy menu)

> ⚠️ RDMP‑MASTER‑V2 **לא נמצא** בקבצים המקומיים. הבדיקה התבססה על הטקסט שסופק בשיחה. נדרש להניח את המסמך בתקיית האדריכלית כדי להפוך אותו ל‑SSOT.

---

## 1) החלטות מאושרות שנכנסו (קלט מחייב)

1. **Admin V1 (גרסה ראשונה):**
   - `system_management` (דשבורד מנהל)
   - `tickers` (ניהול טיקרים)
   - **Lists (Read‑only)** – כולל *REF_BROKERS_VIEW* + סטטוסים – בתוך `system_management` בלבד (אין עמוד עצמאי).
   - `admin/design-system` קיים (React, Type D).

2. **Tracking / Planning — מבנה תפריט חדש:**
   - Tracking דשבורד ראשי + כפתור משנה ל‑`trades`.
   - Planning דשבורד ראשי + כפתור משנה ל‑`trade_plans`.

3. **Data Import:**
   - עמוד אחד שמכסה **Cash Flows + Executions** (שתי ישויות שונות).

4. **Preferences:**
   - אפיון עמוק לפני ביצוע; Import של העדפות משתמש = עדיפות נמוכה.

---

## 2) כיסוי סקופ בפועל (Menu / Routes / React / HTML / Blueprints / Legacy)

| עמוד/ישות | תפריט | routes.json | React Router | HTML בקוד | Blueprints (Team31) | Legacy | הערה |
|---|---|---|---|---|---|---|---|
| Home (index) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Type B Shared |
| Login/Register/Reset | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | Type A Open |
| Profile | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Type C |
| Trading Accounts (D16) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | HTML קיים |
| Brokers Fees (D18) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | HTML קיים |
| Cash Flows (D21) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | HTML קיים |
| Trade Plans | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | יש להוסיף דשבורד Planning חדש |
| Trades | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר בתפריט/Routes |
| Watch Lists | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Ticker Dashboard | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Trading Journal | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Strategy Analysis | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Trades History | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | routes.json קיים |
| Portfolio State | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Alerts | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Notes | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| User Tickers | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Executions | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Data Import | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | יחיד (Cash Flows + Executions) |
| Tag Management | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | חסר ב‑Routes |
| Preferences | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | אפיון לפני ביצוע |
| System Management (Admin) | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | Admin V1 |
| Management (Admin Dashboard) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | להכריע שימוש |
| Admin Design System | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | Type D (React only) |
| API Keys | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | קיים ב‑Blueprints בלבד |
| Securities | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | קיים ב‑Blueprints בלבד |
| Research (main) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | קיים ב‑Blueprints בלבד |

**מסקנה:** קיימת **חפיפה חלקית בלבד** בין RDMP, תפריט, Routes ו‑Blueprints. חובה ליישר Routes/Menu/Blueprints לפני שמתחילים Batch 3.

---

## 3) התאמות RDMP נדרשות (SSOT Update)

1. **REF_BROKERS_VIEW** – להסיר כעמוד ייעודי ולהגדיר כ‑*תצוגה קטנה בתוך Admin V1*.
2. **Tracking / Planning** – להוסיף דשבורדים ראשיים: `tracking`, `planning`; ולהגדיר `trades` ו־`trade_plans` כעמודי משנה.
3. **Data Import** – להגדיר מפורשות: עמוד אחד ל־Cash Flows + Executions.
4. **Admin V1** – להגדיר רשימת עמודים בסיסית + Lists read‑only (Brokers/Statuses).
5. **Blueprints Scope** – לכלול גם: `api_keys`, `securities`, `research`, `management` או להחליט על ביטול/דחייה רשמית.

---

## 4) התאמה לארכיטקטורת LEGO & Cubes (חובה בתכנון)

**UI LEGO System (SSOT):**
- `TT2_SECTION_ARCHITECTURE_SPEC.md` (TtSection > TtSectionRow > TtSectionCol)
- איסור layout CSS מותאם; שימוש ב‑Logical Properties בלבד.

**Backend LEGO (SSOT):**
- `TT2_BACKEND_LEGO_SPEC.md` (Atoms → Molecules → Organisms)

**Governance Lock (Architect):**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`
  - חלוקה לקוביות (`components/core`, `cubes/shared`, `cubes/{cube}`)
  - Fluid design via `clamp/min/max`
  - **איסור inline scripts/styles**
  - Design Tokens: `phoenix-base.css` בלבד

**השפעה על RDMP:**
- כל עמוד חדש חייב להיבנות על LEGO structure (UI) + גבולות Cubes (logic/data).
- אסור לתכנן עמודים חדשים ללא התאמת קוביות Backend/Frontend ל‑LEGO spec.

---

## 5) אינטגרציות ותשתיות חוצות (לא עמודים) — חובה במפת התלויות

**קיימות ב‑SSOT/Overview Pack:**
- **UAI / PDSC / EFR** — `TT2_ARCHITECTURE_AND_RUNTIME_FLOWS.md`
- **Auth A/B/C/D** — `TT2_SECURITY_AND_AUTH_MODEL.md`
- **Rich‑Text** — `TT2_UI_SYSTEMS_AND_DESIGN.md` + SOP‑012
- **Design System / DNA** — `DNA_BUTTON_SYSTEM.md`, `DNA_PALETTE_SSOT.md`
- **Page Template Contract (POL‑015)** — חוזה תבנית עמוד + Factory scripts (TT2_PAGE_TEMPLATE_CONTRACT.md; Architect verdict)

**קיימות במפת הדרכים הרשמית v2.1 (Stage ‑1):**
- `FOREX_MARKET_SPEC`, `MARKET_DATA_PIPE`, `CASH_FLOW_PARSER`

**תלויות נוספות (לא בשלב ‑1 הרשמי):**
- `PRECISION_ENGINE_V2`, `BROKER_API_SYNC`, `COMMUNICATION_SERVER (SMTP/SMS)` — דורשות החלטה נפרדת אם נכנסות ל‑Stage ‑1 או נשארות לבאצים מתקדמים.

> ⚠️ לא נמצאו קבצי SSOT ייעודיים לשמות אלו. נדרש קידום מסמך/Specs כדי להפוך את התלויות למחייבות.

---

## 6) תלויות וסדר עבודה (מתואם SSOT + RDMP)

**Batch 3 — Essential Data Layer (ACTIVE):**
- **Infrastructure first:** UAI/PDSC contracts + MARKET DATA PIPE (Stage‑1) + Template Factory (Stage‑1b).
- **UI בסיס:** Alerts / Notes / User Tickers / Tickers (Admin) / REF_BROKERS_VIEW (read‑only בתוך Admin).
- **Prereq:** לא מתחילים Ticker Dashboard/Trading Journal לפני Market Data Pipeline.

**Batch 4 — Financial Execution:**
- `CASH_FLOW_PARSER` הוא תנאי Stage‑1 מחייב לפני Data Import (Cash Flows + Executions).
- `PRECISION_ENGINE_V2` — תלוי בהחלטת Stage‑1 הרחבה (אם יאושר).
- D16/D18/D21 קיימים אך כפופים ל‑ADR‑017/018 (Account Fees + Other Rule).

**Batch 5 — Complex Entities:**
- Trade Plans / Trades / Watch Lists — תלוי ב‑Batch 4.
- SMTP/SMS + Broker API Sync — מותנה בהחלטת SSOT נפרדת (לא כלולים בשלב ‑1 הרשמי).

**Batch 6 — Advanced Analytics:**
- Ticker Dashboard / Strategy Analysis / Trade History / Portfolio State / AI Analysis — רק אחרי Batch 3+4 (Data pipeline + Import).

---

## 7) תיקוני SSOT נדרשים לפני התחלת Batch 3

1. **Routes SSOT** — לעדכן `ui/public/routes.json` לכל עמודי התפריט (כולל tracking/planning/trades).
2. **Menu Alignment** — לעדכן `unified-header.html` עם דשבורדי Tracking/Planning + כפתורי משנה.
3. **Blueprints Scope** — להכניס את כל העמודים המאושרים + החלטה על `api_keys`, `securities`, `research`, `management`.
4. **Master Docs Drift:**
   - `TT2_INFRASTRUCTURE_GUIDE.md` — דוגמת routes עודכנה לתצורה הנוכחית (2026‑02‑13).
   - `TT2_MASTER_BLUEPRINT.md` — סטטוס באץ' 2 עודכן ל‑CLOSED + Batch 2.5 (2026‑02‑13).

---

## 8) סטטוס

✅ סקופ מאושר + סדר עבודה מתואם SSOT.  
⏳ נדרשים תיקוני SSOT לפני Kickoff של Batch 3 (סעיף 7).

---

**Prepared by:** Team 90 (The Spy)  
**log_entry | TEAM_90 | RDMP_V2_SCOPE_DEPENDENCY_REPORT | READY | 2026-02-13**
