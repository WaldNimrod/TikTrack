---
date: 2026-02-22
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TABLES_REACT.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DIRECTIVE_TABLES_REACT.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 📡 הודעה: אדריכלית ראשית ← צוות 10, צוות 30, צוות 31 (React Tables Framework)
**project_domain:** TIKTRACK

**From:** System Designer (Gemini)
**To:** Team 10 (The Gateway), Team 30 (Frontend), Team 31 (Blueprint)
**Date:** 2026-02-01
**Session:** SESSION_01 - Phase 1.5
**Subject:** UNIFIED_TABLES_REACT_MANDATE | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - ARCHITECTURAL LOCK**

---

## 📢 פסיקת האדריכל: מערכת טבלאות מבוססת React

בעקבות הביקורת המקצועית של צוות 30, הוחלט לעדכן את אסטרטגיית הטבלאות. המערכת תמומש כ-React Framework מלא תוך שמירה על ה-HTML סקלטון של ה-LEGO.

### 1. אינטגרציית React (Non-Negotiable)
* **Components:** הטבלאות ימומשו כרכיבי React (למשל `PhoenixTable.jsx`).
* **Hooks:** הלוגיקה תרוכז ב-Hooks ייעודיים: `usePhoenixTableSort` ו-`usePhoenixTableFilter`.
* **State Management:** ניהול הנתונים יתבצע ב-State המקומי של הרכיב לאחר טרנספורמציה.

### 2. אכיפת JS Standards Protocol
* **Selectors:** למרות השימוש ב-React, חובה להוסיף Class עם תחילית `js-` לכל אלמנט אינטראקטיבי (סידור, פילטרים, כפתורי פעולה) לצורך ולידציית G-Bridge ובדיקות Selenium.
* **Transformation Layer:** * **Backend (API):** `snake_case` (למשל `available_amounts`).
    * **Frontend (React):** `camelCase` (למשל `availableAmounts`).

### 3. אינטגרציה עם TtGlobalFilter
* הטבלה תאזין לשינויים ברכיב ה-`TtGlobalFilter` המרכזי.
* המידע המסונן יעבור דרך ה-`Transformation Layer` לפני הרינדור בטבלה.

### 4. דגשי Fidelity (LOD 400)
* **Typography:** שימוש ב-`tabular-nums` לכל שדה מספרי.
* **Fluid Spacing:** שימוש ב-`clamp()` ו-`min() / max()` עבור ריווחים וגדלי פונט בטבלה.
* **Audit Trail:** כל פעולת מיון או סינון תתועד ב-`PhoenixAudit` (תחת ?debug).

---

**log_entry | [Architect] | TABLES_REACT_FINAL | TO_TEAM_10 | GREEN | 2026-02-01**