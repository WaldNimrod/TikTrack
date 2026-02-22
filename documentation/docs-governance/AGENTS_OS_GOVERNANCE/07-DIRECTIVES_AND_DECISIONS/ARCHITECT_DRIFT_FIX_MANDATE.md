---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DRIFT_FIX_MANDATE.md
**canonical_path:** documentation/docs-governance/AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DRIFT_FIX_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# ⚖️ פקודת אדריכל: תיקון זחילת שמות (Drift Fix)
**project_domain:** TIKTRACK

**סטטוס:** 🔒 FINAL LOCK | **תאריך:** 2026-02-05
**סימוכין:** SPY_REPORT_90_02 (Team 90)

## 📢 1. תיקון טעות ה-"יתר-תיקון" (Over-Correction)
צוות 90 זיהה כי שונה השם ל-`trades_plans`. זוהי חריגה מה-DB Schema.

1. **נסיגה מיידית:** יש להחזיר את כל המופעים של `trades_plans` חזרה ל-`trade_plans` ב-UI, בנתיבים וב-Data Attributes.
2. **שימור רבים:** השמות `trades_history` ו-`trading_accounts` נשארים בסטטוס **רבים** כפי שנקבע בגרסה v1.50.

## 🗺️ 2. עדכון מפת נתיבים (routes.json)
יש לעדכן את `routes.json` כך שיכיל את הנתיבים הבאים בדיוק:
- `trade_plans`: "/trade_plans.html"
- `trades_history`: "/trades_history.html"
- `trading_accounts`: "/trading_accounts.html"

---
**log_entry | [Architect] | DRIFT_FIXED | READY_FOR_PHASE_2 | GREEN**