# 🕵️ Team 90 → Master Roadmap Approval Package (TT2 v1.0.0)

**id:** `TEAM_90_MASTER_ROADMAP_APPROVAL_PACKAGE`  
**from:** Team 90 (The Spy)  
**to:** Chief Architect (Gemini Bridge) via Team 10  
**date:** 2026-02-13  
**status:** 🔒 **READY FOR ARCHITECT APPROVAL**  

---

## 0) Purpose
מסמך מרוכז ומחייב למפת הדרכים הבאה. לאחר אישור האדריכלית יהפוך למקור אמת יחיד לשלבי העבודה הבאים.  
**כל שלב מבוצע כשער נפרד** לפי נהלי QA, קידום ידע וניקוי שולחן.

---

## 1) החלטות נעולות (SSOT)

**System Version 1.0.0 (ADR‑017):**
- כל שכבה מיושרת ל‑1.x.x. אין 2.x בשום שכבה.

**Account‑Based Fees (ADR‑014/017):**
- עמלות שייכות לחשבון מסחר (`trading_account_fees`).

**Broker “Other” (ADR‑018):**
- “אחר” פותח שדה חופשי. `is_supported=false`. חסימת API/ייבוא. הודעת משילות חובה.

**Auth Model (ADR‑013 + ADR‑017):**
- A/B/C/D; Redirect ל‑Home לכל Non‑Open; User Icon Success/Warning בלבד.

**LEGO Modular Architecture (Final Governance Lock):**
- מבנה קוביות, איסור inline scripts/styles, Fluid design בלבד, Design Tokens ב‑`phoenix-base.css`.

**Page Template Contract (POL‑015):**
- שלד DOM מחייב: `page-wrapper > page-container > main > tt-container > tt-section`.
- סדר טעינה מחייב: CSS (Pico → DNA → Lego → Header → Page‑specific), JS (PageConfig → UAI Boot).
- סקריפטים: `generate-pages.js` + `validate-pages.js` חייבים לפסול חריגות.

**Template Factory Verdict (Architect):**
- מעבר ל‑`.content.html` מאושר כדרך המלך לבאץ' 3.
- הסקריפטים מרוכזים ב‑`ui/scripts/`.
- חריגת Auth: Login/Register מוחרגים בשלב זה.

---

## 2) נהלי ביצוע מחייבים

### 2.1 Closure Cycle אחרי כל באץ'
1. **Consolidation & Knowledge Promotion**
2. **SSOT Consistency Check** (Master Index / Page Tracker / Roadmap / Routes / OpenAPI)
3. **Clean Table** — אין “ממתין” ללא תאריך
4. **Archive & Cleanup** — העברה פיזית + Manifest

**תנאי מעבר:** Gate A/B/C לפי הצורך + אישור Team 90 + G‑Lead (ויזואלי אם נדרש).

### 2.2 Micro‑Batch Policy (חובה)
- כל באץ' מפורק לתת‑באצים של **3–5 עמודים** או **תחום אחד + תשתית אחת**.
- כל Micro‑Batch כולל: UI + Infra + QA + Consolidation.

---

## 3) Stage ‑1 (תלויות חוצות‑מערכת) — חובה לפני Batch 3

**לפי מפת הדרכים הרשמית v2.1** נדרש SSOT מפורט ומאושר לתלויות הבאות בלבד:
- **FOREX_MARKET_SPEC**
- **MARKET_DATA_PIPE**
- **CASH_FLOW_PARSER**

> אין התחלת Batch 3 לפני סגירת Stage‑1 במסמכי SSOT.

### 3.1 Stage ‑1b (Template Factory / Page Contract) — חובה לפני Batch 3
- אישור מסמך `TT2_PAGE_TEMPLATE_CONTRACT.md` כ‑SSOT (POL‑015).
- אימות שה‑Factory פועל לייצור עמודים חדשים על בסיס `.content.html`.
- בדיקות `validate-pages.js` עוברות לכל עמוד חדש (Non‑Auth).

> ללא Stage‑1b אין פתיחת עמודי Batch 3 (UI).

---

## 4) Roadmap v2.1 (Official Scope)

### Batch 3 — Essential Data
- D15_SETTINGS (Preferences)
- ALERTS & NOTES
- USER_TICKERS & TICKERS_MGR

### Batch 4 — Financial Execution
- EXECUTIONS & IMPORT CENTER (Cash Flows)

### Batch 5 — Complex Entities
### Batch 6 — Advanced Analytics

---

## 4.1) Detailed Decomposition (Team 90 Extension — To Be Approved)
**מטרת הסעיף:** פירוט מודולרי ברמת יישום, **אינו SSOT** עד אישור אדריכלית.  

### Batch 3 — Essential Data Layer (Expanded)
**UI:** Alerts, Notes, User Tickers, Tickers Admin.  
**Admin:** `system_management` + Read‑only Lists (Brokers/Statuses) + `admin/design-system`.  
**Prereq:** Market Data Pipeline (Stage‑1) + Template Factory (Stage‑1b).

### Batch 4 — Financial Execution (Expanded)
**UI:** Trading Accounts, Brokers Fees, Executions, Cash Flows.  
**Data Import:** עמוד אחד — Cash Flows + Executions.  
**Infra:** Cash Flow Parser + Precision Engine V2 (אם יאושר).

### Batch 5 — Complex Entities (Expanded)
**UI:** Trade Plans (עמוד משנה), Trades (עמוד משנה), Watch Lists, Tag Management.  
**Dashboards:** Planning Dashboard + Tracking Dashboard (עמודי בסיס ניווט).  
**Infra:** SMTP/SMS + Broker API Sync (Pre‑Online, אם יאושר).

### Batch 6 — Advanced Analytics (Expanded)
**UI:** Trading Journal, Ticker Dashboard, Strategy Analysis, Trades History, Portfolio State, AI Analysis.

---

## 5) Route & Menu Alignment (SSOT Update Required)

חובה ליישר לפני Kickoff של Batch 3:
- `routes.json` כולל את כל עמודי התפריט + tracking/planning/trades dashboards.
- `unified-header.html` כולל דשבורדים Tracking/Planning + כפתורי משנה ל‑Trades/Trade Plans.
- Team 31 Blueprints מכסים **כל העמודים המאושרים**.

---

## 6) Gate Rules (per Batch)

**Gate A:** תקינות UI↔Runtime ועמידה בקריטריונים פונקציונליים.  
**Gate B:** ביקורת Team 90 (אפס סובלנות לסטיות SSOT).  
**Gate C:** QA E2E לפי TEAM_50.  
**Knowledge Promotion:** חובה לאחר כל Gate סגור.

---

## 7) בקשת אישור מהאדריכלית

אישור המסמך כנוסח מחייב יוצר:
- **SSOT יחיד** למפת דרכים.
- **שיטת ביצוע** (Micro‑Batch + Closure Cycle).
- **Stage‑1 Dependencies** כתנאי קשיח.

---

## 8) References (SSOT)
- `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md` (ADR‑017)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md` (ADR‑018)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`
- `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md`
- `documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md`
- `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ROADMAP_NEXT_STEPS.md`

---

**Prepared by:** Team 90 (The Spy)  
**log_entry | TEAM_90 | MASTER_ROADMAP_APPROVAL_PACKAGE | READY | 2026-02-13**
