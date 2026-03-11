# Team 10 → Team 60 | פרומט קנוני — אימות חוזר (Re-Verify) + טיפול ב-BLOCK

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_RE_VERIFY_CANONICAL_PROMPT_v1.0.0  
**owner:** Team 10 (Gateway)  
**date:** 2025-01-31  
**status:** LOCKED  
**canonical:** להעברה ל-Team 60 בעת הפעלת אימות חוזר; חובה כאשר תוצאת אימות = BLOCK — דרישת תיקון מפורטת לצוות האחראי + cc Team 10.  
**procedure_ref:** `documentation/docs-governance/04-PROCEDURES/TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0.md` §2.1, §2.2  

---

## פרומט הפעלה (העבר ל־Team 60)

---

**Team 60 — [WORK_PACKAGE / CHECK_ID] Re-Verify**

[ציין הקשר: למשל "Team 20 סיימה תיקון [X]. נדרש אימות חוזר."]

**משימות (לבצע לפי הסדר):**

1. **הרץ** את הפקודות/סקריפטים הרלוונטיים לאימות (למשל: `make sync-ticker-prices`, `python3 scripts/verify_g7_prehuman_automation.py`).

2. **דווח תוצאה — PASS או BLOCK.**  
   - **אם PASS:** צור `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_[CONTEXT]_RE_VERIFY_RESULT.md` עם status PASS + evidence.  
   - **אם BLOCK:**  
     - צור `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_[CONTEXT]_RE_VERIFY_RESULT.md` עם status BLOCK + סיבה + evidence.  
     - **חובה:** הנפק **דרישת תיקון מפורטת** לצוות האחראי (למשל Team 20) עם **cc: Team 10**.  
     - **תוכן דרישת התיקון:** כלל המעבר (PASS rule), מה בוצע באימות, לוג/Evidence, סיבת הכשל (שורש), מיקום רלוונטי בקוד, דרישת תיקון ברורה (כולל אפשרויות אם רלוונטי), אימות אחרי תיקון. **כל המידע הקיים** — כדי לאפשר תיקון אופטימלי ולהימנע מרעש מיותר.  
     - **נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_[OWNER_ID]_[CONTEXT]_REMEDIATION_REQUEST.md`  
     - **נהל:** `TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0` §2.1, §2.2.

3. **מסלול ל-Team 10:** דוח התוצאה והעתק דרישת התיקון (במקרה BLOCK) דרך _COMMUNICATION.

---

**מנדט/הקשר:** [קישור למנדט המלא ולמסמכי השלמה של הצוות שתיקן]

---

**log_entry | TEAM_10 | RE_VERIFY_CANONICAL_PROMPT_v1.0.0 | LOCKED | 2025-01-31**
