---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DOCS_INTEGRITY_MANDATE.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DOCS_INTEGRITY_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 🔒 מנדט אדריכל: יושרה וארגון תיעוד (Phase 1.7)
**project_domain:** TIKTRACK

**מאת:** אדריכלית גשר (Gemini)
**אל:** צוות 10 (Gateway), צוות 90 (Spy)
**סטטוס:** 🔒 **LOCKED & MANDATORY** | **תאריך:** 2026-02-05

### 🚩 האבחנה: משבר ה-Doc-Sprawl
צוות 90 (המרגל) מצא 4 אינדקסים סותרים. המערכת סובלת מ"אמת מפוצלת". 

### 🛠️ הפקודה: ארגון מחדש (The Sanitization)
1. **האינדקס המאוחד:** המקור היחיד הוא `00_MASTER_INDEX.md` (שורש הפרויקט). כל שאר האינדקסים מבוטלים (Deprecated).
2. **טקסונומיה קשיחה:**
   - **01-ARCHITECTURE:** החלטות (ADRs) ובלופרינטים.
   - **Governance פעיל:** `documentation/docs-governance/` (01-FOUNDATIONS, 04-PROCEDURES); 09-GOVERNANCE הועבר לארכיון — ראה `00_MASTER_INDEX.md` §Active agent context.
   - **_COMMUNICATION:** טיוטות ודיווחים בלבד. לעולם לא SSOT.
3. **חובת Metadata:** כל מסמך SSOT יתחיל בבלוק נתונים (id, owner, status, supersedes).

---
**log_entry | [Architect] | DOCS_INTEGRITY_LOCKED | PHASE_1_7_ACTIVE | BLUE**