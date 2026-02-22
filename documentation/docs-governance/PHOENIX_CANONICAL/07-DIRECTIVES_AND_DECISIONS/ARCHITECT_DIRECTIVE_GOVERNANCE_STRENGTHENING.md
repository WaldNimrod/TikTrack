---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# הנחיית האדריכלית — חיזוק משילות (SOP-013)
**project_domain:** TIKTRACK

**id:** SOP-013  
**owner:** Architect / Team 10  
**status:** 🔒 **LOCKED — MANDATORY**  
**context:** Task Governance & AI Agent Workflow Efficiency  
**תאריך:** 2026-02-13

---

## פסיקה

יש לטפל בנושא **המשילות** הזה באופן **מלא**. הנוהל הבא הוא הדרך היחידה להעברת עבודה בין צוותים במערכת פיניקס.  
**מטרה:** אפס קבצי דוח מיותרים, מקסימום אוטומציה ומשילות.

---

## 1. הודעת חיתום משימה (The Task Seal Message)

**חל איסור** על צוותי הביצוע (20–60) **לייצר קבצי Markdown לדיווח על סיום משימה** כסגירה.  
במקום זאת — **יש להפיק הודעה מובנית** המועברת לצוות 10:

```
--- PHOENIX TASK SEAL ---
TASK_ID: [L2-XXX]
STATUS: COMPLETED
FILES_MODIFIED:
  - [Path/to/file]
PRE_FLIGHT: [PASS/FAIL] (Validation scripts check)
HANDOVER_PROMPT: "צוות 90, המשימה מוכנה לבדיקת יושרה. ודא תאימות ל-routes.json."
--- END SEAL ---
```

---

## 2. שרשרת הפיקוד והדיווח

- **צוותי ביצוע (20–60):** מבצעים את העבודה ומפיקים את **ה-TASK SEAL**.
- **צוות 10 (מפקד שטח):** מקבל את ההודעה, מעדכן את **MASTER_TASK_LIST (L2)**, ומפעיל את צוות 90.
- **צוות 90 (המרגל):** מבצע סריקה פיזית של הקוד ומדווח PASS/FAIL לצוות 10.
- **חיתום שלב (PCS):** **רק** בסיום באץ' או מיקרו-באץ' **שלם** — צוות 10 מייצר קובץ סיכום רשמי **PCS_[ID].md** לספר האדריכל.

---

## 3. חיזוק משילות (Enforcement)

| כלל | משמעות |
|------|--------|
| **No Seal, No Pay** | משימה **לא** תיחשב כסגורה ב-L2 ללא הודעת חיתום תקנית. |
| **LCI Integrity** | צוות 90 יפסול כל עמוד/תוצר שבו הקוד שונה **בלי** הודעת חיתום מתאימה. |
| **Zero Noise** | כל קובץ תיעוד "זמני" שיימצא בתיקיות הצוותים **ולא** זוקק ל-PCS — **יימחק**. |

---

## מקור נוהל מלא

**מסמך מחייב (קנון יחיד):** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` (מסמך זה). אין קובץ policy נפרד בנתיב 07-POLICIES — הועבר לארכיון.

חובה על **כל** הצוותים לאמץ את הנוהל במלואו — לא דוח לבד, לא קבצי סיכום מיותרים; Seal Message בלבד לסגירה; PCS רק בסיום באץ'; Zero Noise.

---

**log_entry | [Architect] | SOP_013_LOCKED | GOVERNANCE_STRENGTHENED | GREEN | 2026-02-13**
