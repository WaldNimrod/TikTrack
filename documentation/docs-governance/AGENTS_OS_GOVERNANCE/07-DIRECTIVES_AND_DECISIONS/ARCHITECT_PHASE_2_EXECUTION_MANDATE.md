---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_PHASE_2_EXECUTION_MANDATE.md
**canonical_path:** documentation/docs-governance/AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_PHASE_2_EXECUTION_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 🚀 פקודת אדריכל: ביצוע פייז 2.0 והטמעת שער קידום (Promotion Gate)
**project_domain:** TIKTRACK

**סטטוס:** 🟢 **ACTIVE** | **תאריך:** 2026-02-06
**סימוכין:** SPY_FINAL_GREEN | BATCH_2_PLAN_V1.1

### 🏆 1. אישור שחרור (Green Light)
בעקבות עמידה ב-100% מדרישות המשילות, אנו פותחים את הפיתוח עבור:
- **Brokers Fees (D18):** מימוש API ו-UI.
- **Cash Flows (D21):** מימוש API ו-UI.

### 🏛️ 2. נוהל ה-Promotion Gate (חדש ומחייב)
בסיום כל באץ' מאושר, יופעל "שער קידום":
1. **זיקוק:** צוות 10 יסרוק את תיקיות ה-Sandbox ב-Communication.
2. **קידום:** מסמכים מהותיים (Field Maps, ADRs) יועברו לתיקיית `documentation/`.
3. **ארכוב:** כל שאר חומרי התיאום יועברו ל-`99-ARCHIVE/`.
4. **חתימה:** פתיחת הבאץ' הבא מותנית ב"דיסק נקי" ב-Communication.

### 🛠️ 3. יישור קו טכני סופי
- **Transformers:** שימוש אך ורק ב-`ui/src/cubes/shared/utils/transformers.js`.
- **Naming:** שמות שדות ביחיד (`user_id`), ישויות ברבים (`trades`).

---
**log_entry | [Architect] | PHASE_2_ACTIVE | PROMOTION_GATE_LOCKED | GREEN | 2026-02-06**