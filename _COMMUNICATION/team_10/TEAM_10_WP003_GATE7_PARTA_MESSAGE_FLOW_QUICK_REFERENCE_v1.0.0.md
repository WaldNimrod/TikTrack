# Team 10 | WP003 GATE_7 Part A — סדר העברת הודעות (Quick Reference)

**project_domain:** TIKTRACK  
**id:** TEAM_10_WP003_GATE7_PARTA_MESSAGE_FLOW_QUICK_REFERENCE  
**date:** 2026-03-12  

---

## סדר העברה — צעד אחר צעד

| # | ממנו | אליו | מסמך/פעולה | תוכן מינימלי |
|---|------|------|-------------|--------------|
| **1** | Team 90 | Team 10 | `TEAM_90_TO_TEAM_10_..._REVALIDATION_RESPONSE_v*.md` | PASS/BLOCK; אם BLOCK — מנדט ממוקד יחיד |
| **2** | Team 10 | Team 60 | `TEAM_10_TO_TEAM_60_..._ACTIVATION_v*.md` | תפקיד; דרישות; דליברבל; העברה ל־50; איסורים |
| **3** | Team 10 | Team 50 | `TEAM_10_TO_TEAM_50_..._ACTIVATION_v*.md` | תפקיד; shared run; corroboration; העברה ל־10; איסורים |
| **4** | Team 60 | Team 50 | Handoff / העברת נתונים | log_path; run_id; verdicts (pass_01, pass_02, pass_04) |
| **5** | Team 50 | Team 10 | `TEAM_50_TO_TEAM_90_..._CORROBORATION_v*.md` | Corroboration תואם 60; סיום |
| **6** | Team 10 | Team 90 | `TEAM_10_TO_TEAM_90_..._HANDOFF_v*.md` | חבילה מוכנה; ארטיפקטים; בקשת תגובה |

**חזרה ל־#1** — רק אחרי תגובת Team 90. אין לופים.

---

## תפקידים — במשילות ברורה

| צוות | תפקיד | מה מצופה |
|------|-------|----------|
| **Team 90** | Validator | תגובה קנונית; מנדט ממוקד אחד (אם BLOCK) |
| **Team 10** | Orchestrator | הפעלות לפי מנדט; handoff ל־90; מניעת לופים |
| **Team 60** | Runtime | הרצה אחת; evidence; העברה ל־50 |
| **Team 50** | QA | Corroboration (shared run); העברה ל־10 |

---

## איסורים — למניעת לופים

- **Team 60:** לא לחזור על ריצות בלי הפעלה חדשה מ־10
- **Team 50:** לא להריץ G7-VERIFY נפרד (shared run בלבד)
- **Team 10:** לא להפעיל בלי מנדט מ־90
- **Team 90:** מנדט ממוקד **יחיד** per BLOCK (לא כמה מנדטים סותרים)

---

**מסמך משילות מלא:** `TEAM_10_WP003_GATE7_PARTA_GOVERNANCE_AND_MESSAGE_FLOW_v1.0.0.md`
