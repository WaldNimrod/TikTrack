---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_PHASE_2_KICKOFF_MANDATE.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_PHASE_2_KICKOFF_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# ⚠️ DEPRECATED - מידע סותר - אין להשתמש!
**project_domain:** TIKTRACK

**סטטוס:** ⚠️ **DEPRECATED**  
**תאריך Deprecation:** 2026-02-06  
**SSOT Location:** `ARCHITECT_PHASE_2_REFINED_MANDATE.md`

**⚠️ זהו מנדט ישן עם מידע סותר - הוחלף במנדט מעודכן!**

**בעיות שזוהו:**
- מזכיר `FIX_transformers.js` במקום `transformers.js`
- מזכיר D21 כ-"Trades History" במקום "Cash Flows"

---

## 📜 תוכן היסטורי (למטרות ארכיון בלבד)

**תאריך מקורי:** 2026-02-05  
**סימוכין:** SPY_REPORT_90_03 (PASS)

### 📢 1. הכרזת ניצחון: באץ' 1.6 ננעל
צוות 90 אישר כי הקוד המקומי מיושר ב-100% מול הארכיטקטורה ההיברידית. 
- פורט 7246 הוסר.
- ניווט MPA דרך Bridge מאומת.
- Naming Convention (Entity Plural / ID Singular) מיושם.

### 💰 2. יעדי פייז 2.0 (Financial Core)
אנו פותחים את הפיתוח עבור:
1. **D16 - Trading Accounts:** טבלאות ניהול חשבונות עם Sticky Columns.
2. **D18 - Cash Flows:** תזרימי מזומנים בסטנדרט LOD 400.
3. **D21 - Trades History:** היסטוריית טריידים מלאה. ⚠️ **שגוי - צריך להיות "Cash Flows"**

### 🛠️ 3. הנחיות טכניות קשיחות
- כל טבלה פיננסית חייבת להשתמש ב-`FIX_transformers.js` להבטחת Type Safety. ⚠️ **שגוי - צריך להיות `transformers.js`**
- שימוש בלעדי ב-`routes.json` v1.1.2 לניווט.
- איסור מוחלט על הוספת ספריות חיצוניות ללא אישור צוות 60.

---

**log_entry | [Architect] | PHASE_2_KICKOFF | DEPRECATED | 2026-02-06**
