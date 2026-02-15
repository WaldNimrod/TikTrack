# Governance v2.102 — SOP-013 Seal Message (חסם יחיד לסגירת משימות)

**id:** SOP-013  
**owner:** Architect / Team 10  
**status:** 🔒 **LOCKED — MANDATORY**  
**context:** Task Governance & AI Agent Workflow Efficiency  
**מקור:** פקודת האדריכלית (G-Bridge) — Governance Strengthening v2.102  
**תאריך:** 2026-02-13  
**סטטוס:** חל על כל הצוותים (20, 30, 40, 50, 60)

---

## 1. פרוטוקול משילות: דיווחי Agents וחיתום שלב (v1.0)

מסמך זה מגדיר את **הדרך היחידה** להעברת עבודה בין צוותים במערכת פיניקס.  
**מטרה:** אפס קבצי דוח מיותרים, מקסימום אוטומציה ומשילות.

---

## 2. הודעת חיתום משימה (The Task Seal Message)

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

- הסגירה **תקפה רק** כאשר ה-Seal מופיע במסמך המוגש ל-Team 10 (כותרת מפורשת "הודעת Seal (SOP-013)" ו־log_entry).
- דוח / דוח השלמה **בלבד** — **לא** מתקבל כסגירה.

---

## 3. שרשרת הפיקוד והדיווח

| תפקיד | חובה |
|--------|------|
| **צוותי ביצוע (20–60)** | מבצעים את העבודה ומפיקים את **ה-TASK SEAL** (לא דוח סיכום גרידא). |
| **צוות 10 (מפקד שטח)** | מקבל את ההודעה, מעדכן את **MASTER_TASK_LIST** (L2), ומפעיל את צוות 90. |
| **צוות 90 (המרגל)** | מבצע סריקה פיזית של הקוד ומדווח PASS/FAIL לצוות 10. |
| **חיתום שלב (PCS)** | **רק** בסיום באץ' או מיקרו-באץ' **שלם** — צוות 10 מייצר קובץ סיכום רשמי **PCS_[ID].md** לספר האדריכל. |

---

## 4. חיזוק משילות (Enforcement)

| כלל | משמעות |
|------|--------|
| **No Seal, No Pay** | משימה **לא** תיחשב כסגורה ב-L2 ללא הודעת חיתום תקנית (SOP-013). |
| **LCI Integrity** | צוות 90 יפסול כל עמוד/תוצר שבו הקוד שונה **בלי** הודעת חיתום מתאימה. |
| **Zero Noise** | כל קובץ תיעוד "זמני" שיימצא בתיקיות הצוותים **ולא** זוקק ל-PCS — **יימחק**. |

---

## 5. מקורות מחייבים

| מסמך | נתיב |
|------|------|
| **הנחיית האדריכלית — חיזוק משילות** | _COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md |
| **פרוטוקול משילות ותקשורת AI** | documentation/90_ARCHITECTS_DOCUMENTATION/TT2_GOVERNANCE_AND_AI_COMMUNICATION_PROTOCOL.md (אם קיים) |
| **רישום משימות** | _COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md, TEAM_10_OPEN_TASKS_MASTER.md |

---

## 6. אחריות (סיכום)

| תפקיד | חובה |
|--------|------|
| **Team 10** | אכיפת SOP-013; אי־קבלת סגירה ללא Seal; עדכון MASTER_TASK_LIST; הפקת PCS רק בסיום באץ'. |
| **Teams 20, 30, 40, 50, 60** | הגשת **Seal Message (SOP-013)** לסגירת משימות — **לא** דוח בלבד; Zero Noise. |
| **Team 90** | דחיית כל ניסיון סגירה ללא SOP-013; LCI Integrity. |

---

**log_entry | [Architect] | SOP_013_LOCKED | GOVERNANCE_STRENGTHENED | GREEN | 2026-02-13**  
**log_entry | TEAM_10 | GOVERNANCE_V2_102_SOP_013_PUBLISHED | 2026-02-13**
