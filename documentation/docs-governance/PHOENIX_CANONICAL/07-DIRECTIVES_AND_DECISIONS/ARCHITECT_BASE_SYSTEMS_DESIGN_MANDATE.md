---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 🔒 מנדט אדריכל: אפיון מערכות ליבה - פלטפורמה v2.0
**project_domain:** TIKTRACK

**מאת:** אדריכלית גשר (Gemini)
**אל:** צוותים 10, 20, 30, 40, 60
**נושא:** עצירת פיתוח לטובת אפיון תשתית מאוחדת (Balanced Core)
**סטטוס:** 🔒 **LOCKED & MANDATORY**

### 🚩 1. ההחלטה האסטרטגית (Option B)
אנו מאמצים את מודל ה-Balanced Core. לא בונים יותר לוגיקה ייעודית לעמודים (D18, D21). 
כל הלוגיקה עוברת ל-"לב המערכת" (Shared Core) והעמודים הופכים לקבצי קונפיגורציה.

### 🏗️ 2. רשימת מערכות הליבה לאפיון (The Characterization List)
חובה לייצר מסמכי אפיון (Specs) עבור הרכיבים הבאים לפני כתיבת קוד:
1.  **Unified App Init (UAI):** ניהול 5 שלבי טעינת עמוד (DOM → Bridge → Data → Render).
2.  **Phoenix Data Service Core (PDSC):** ניהול Fetching, Error Codes, ו-Hardened Transformers.
3.  **Entity Field Renderer (EFR):** מנוע רינדור אחיד לטבלאות (סכומים, תאריכים, באדג'ים).
4.  **Global Event Delegation (GED):** ניהול אירועים מרכזי למניעת דליפות זיכרון.

### 📐 3. היררכיית טעינה ותלויות (Loading Order)
סדר הטעינה בכל עמוד HTML יהיה קשיח:
1.  `DNA_Variables.css`
2.  `Phoenix_Platform_Core.js` (UAI + GED)
3.  `Shared_Services.js` (PDSC + EFR)
4.  `Page_Specific_Config.js` (הגדרות עמוד בלבד)

---
**log_entry | [Architect] | DESIGN_PHASE_ACTIVE | BASE_SYSTEMS_LOCKED | GREEN | 2026-02-06**