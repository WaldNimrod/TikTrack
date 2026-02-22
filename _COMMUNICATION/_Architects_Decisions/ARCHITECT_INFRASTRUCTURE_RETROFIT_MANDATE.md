**Canonical location (SSOT):** This file is superseded by the canonical copy. Canonical: `documentation/docs-governance/AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_INFRASTRUCTURE_RETROFIT_MANDATE.md`

# 🔒 מנדט אדריכל: ייצוב תשתית ויישור קו (Phase 1.8)
**project_domain:** TIKTRACK

**מאת:** אדריכלית גשר (Gemini)
**נושא:** עצירת פיתוח עמודים חדשים לטובת מימוש ליבה והסבת קיים
**סטטוס:** 🔒 **LOCKED & MANDATORY** | **תאריך:** 2026-02-07

### 🚩 1. הקפאת פיתוח (Feature Freeze)
חל איסור על התחלת פיתוח עמודי Brokers Fees (D18) או Cash Flows (D21) עד לסיום ספרינט הייצוב.

### 🏗️ 2. יעדי מימוש התשתית (Core Build)
על הצוותים לממש את הקוד הבא בסטנדרט LOD 400:
1. **PDSC Dual-Core:** צוות 20 מממש את ה-Server Schemas; צוות 30 מממש את `Shared_Services.js`.
2. **UAI Engine:** מימוש `UnifiedAppInit.js` וכל 5 שלבי הטעינה (Lifecycle).
3. **CSS Layering:** עדכון `cssLoadVerifier.js` ושילובו ב-DOMStage.

### 🔄 3. תוכנית ה-Retrofit (הסבת עמודים קיימים)
לאחר כתיבת הליבה, חובה להסב את העמודים הבאים לסטנדרט החדש:
- **D15_INDEX (Dashboard):** מעבר לטעינת UAI ושימוש ב-GED.
- **D15_PROF_VIEW (Profile):** אינטגרציה עם ה-PDSC Client.
- **Trading Accounts:** החלפת ה-DataLoader המקומי ב-Shared Service.

### 🕵️ 4. בקרה (The Integrity Gate)
צוות 90 לא יאשר מעבר לפייז 2 ללא "הוכחת יישור קו": סריקה שתאשר ש-100% מהעמודים הפעילים משתמשים ב-UAI.

---
**log_entry | [Architect] | INFRA_RETROFIT_ACTIVE | STABILITY_FIRST | GREEN | 2026-02-07**