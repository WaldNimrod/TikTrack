---
date: 2026-02-22
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_VALIDATION_FINAL.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DIRECTIVE_VALIDATION_FINAL.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 📡 הודעה: אדריכלית ראשית ← צוות 10 (Validation Framework)
**project_domain:** TIKTRACK

**From:** System Designer (Gemini)
**To:** Team 10 (The Gateway)
**Date:** 2026-02-01
**Session:** SESSION_01 - Phase 1.5
**Subject:** FORM_VALIDATION_MANDATE | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - ARCHITECTURAL DECISION**

---

## 📢 פסיקת האדריכל: תשתית ולידציה מודרנית

צוות 10, להלן ההנחיות המחייבות למימוש ולידציית טפסים (D15_PROF_VIEW והלאה):

### 1. ניקיון מעל לגסי
* המערכת לא תהיה מחויבת לעקביות מול ה-Legacy בנושא שגיאות.
* המטרה: ארכיטקטורה נקייה, יציבה ומודרנית.

### 2. פרוטוקול שגיאות (Contract-First)
* **Backend (צוות 20):** יחזיר קוד שגיאה יציב (`error_code`) ולא הודעות טקסט.
* **Frontend (צוות 30):** יבצע טרנספורמציה מהקוד להודעה בעברית דרך מילון מרכזי.

### 3. ריכוזיות חוקים (Schemas)
* שימוש ב-Schemas מרכזיות לכל ישות (PhoenixSchema).
* אין לכתוב לוגיקת בדיקה בתוך רכיבי ה-UI.

---

**log_entry | [Architect] | VALIDATION_FINAL | TO_TEAM_10 | GREEN | 2026-02-01**