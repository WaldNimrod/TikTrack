---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TABLES_V2_FINAL.md
**canonical_path:** documentation/docs-governance/AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DIRECTIVE_TABLES_V2_FINAL.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 📡 הודעה: אדריכלית ראשית ← צוותי הפיתוח (Unified Tables & Filter Context)
**project_domain:** TIKTRACK

**From:** Chief Architect (Gemini)
**To:** Team 10 (Gateway), Team 30 (Frontend), Team 31 (Blueprint)
**Date:** 2026-02-01
**Session:** SESSION_01 - Phase 1.5
**Subject:** TABLES_FILTER_ARCHITECTURE_LOCK | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - BREAKING CLEAN SLATE**

---

## 📢 פסיקת האדריכל: ארכיטקטורת נתונים מאוחדת

בעקבות ניתוח צרכי המערכת והמשוב המקצועי, הוחלט על נעילת התשתית לטבלאות ופילטרים:

### 1. אינטגרציית פילטרים (The Context Decision)
* **החלטה:** רכיב ה-`TtGlobalFilter` יעבור Refactor מלא לשימוש ב-**React Context API** (`PhoenixFilterContext`).
* **נימוק:** מכיוון שהפילטר הוא בלופרינט חדש, אין טעם לייצר "גשרים" או Events. עדכון הפילטר לארכיטקטורה המודרנית יבטיח SSOT (מקור אמת יחיד) לכל הטבלאות בעמוד מבלי לסחוב חוב טכני.

### 2. מערכת הטבלאות (React-Native LEGO)
* **מבנה:** הטבלאות ימומשו כרכיבי React מלאים, אך ישמרו על ה-Skeleton הויזואלי של ה-LEGO (`tt-section`).
* **לוגיקה:** שימוש ב-Hooks ייעודיים (`usePhoenixTableSort`, `usePhoenixTableFilter`).
* **JS Standards:** חובה להשתמש ב-`js-` prefixed selectors בכל אלמנט אינטראקטיבי לצורך ולידציה ואוטומציה.

### 3. ארכיטקטורת CSS (Modular Tables)
* **החלטה:** יצירת קובץ נפרד `styles/phoenix-tables.css`.
* **נימוק:** מניעת ניפוח של קובץ הקומפוננטות הכללי ושמירה על היררכיה נקייה שתאפשר ניהול סטנדרטים עתידי בצורה מבוקרת.

### 4. דגשי ביצוע (LOD 400)
* **Transformation Layer:** חובה לכל נתון (API snake_case ↔ UI camelCase).
* **Fidelity:** אכיפת `tabular-nums` ו-`clamp()` לריווחים.
* **Audit Trail:** תיעוד כל פעולת מיון/סינון תחת `?debug`.

---

**log_entry | [Architect] | TABLES_V2_LOCK | TO_TEAM_10 | GREEN | 2026-02-01**