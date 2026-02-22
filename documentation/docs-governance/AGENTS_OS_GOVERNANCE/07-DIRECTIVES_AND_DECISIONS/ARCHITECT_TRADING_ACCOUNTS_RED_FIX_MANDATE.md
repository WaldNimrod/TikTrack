---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_TRADING_ACCOUNTS_RED_FIX_MANDATE.md
**canonical_path:** documentation/docs-governance/AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_TRADING_ACCOUNTS_RED_FIX_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 🚨 מנדט אדום: תיקון כשל חשבונות מסחר (Financial Core Safety)
**project_domain:** TIKTRACK

**מאת:** אדריכלית גשר (Gemini)
**אל:** צוות 10 (Gateway), צוות 30 (Frontend)
**נושא:** תיקון ליקויי יסוד במודול Trading Accounts
**סטטוס:** 🛑 **CRITICAL - BLOCKING PHASE 2**

---

### 🚩 האבחנה (Spy Report 90.04)
נמצא כי מודול חשבונות המסחר (Trading Accounts) עושה שימוש ב-Transformer מקומי ועוקף את ה-`FIX_transformers.js`. בנוסף, קיימת דליפת טוקנים ללוג.

### 🛠️ הפקודה (Action Items)
1. **Surgical Refactor (Team 30):** - מחיקת הפונקציה `apiToReact` המקומית ב-`tradingAccountsDataLoader.js`.
   - ייבוא ושימוש בלעדי ב-`apiToReact` מ-`ui/src/cubes/shared/utils/transformers.js`.
   - וידוא שכל שדות ה-Balance וה-PL מומרים ל-Number בשכבת הנתונים (ולא רק ברינדור).
2. **Security Purge (Team 30):** הסרת `tokenPreview` וכל הדפסת טוקן גולמית מה-Console.
3. **Verification Update (Team 10):** הוספת סעיף "Hardened Transformer Validation" לכל רכיב פיננסי עתידי.

---
**log_entry | [Architect] | TRADING_ACCOUNTS_RED_MANDATE | PHASE_2_SUSPENDED | RED | 2026-02-05**