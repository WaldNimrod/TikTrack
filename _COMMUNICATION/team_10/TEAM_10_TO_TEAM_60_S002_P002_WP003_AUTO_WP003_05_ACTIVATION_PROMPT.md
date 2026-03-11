# Team 10 → Team 60 | S002-P002-WP003 — AUTO-WP003-05 Activation Prompt

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_AUTO_WP003_05_ACTIVATION_PROMPT  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure) — **פרומט הפעלה**  
**date:** 2026-03-11  
**status:** ACTION_REQUIRED  

---

## פרומט הפעלה (העבר ל־Team 60)

---

**Team 60 — S002-P002-WP003 AUTO-WP003-05 Re-Verify**

Team 20 סיים תיקון AUTO-WP003-05 (מילוי market_cap מ-Yahoo v7/quote ל-ANAU.MI, BTC-USD, TEVA.TA). נדרש אימות חוזר.

**משימות (לבצע לפי הסדר):**

1. **הרץ:** `make sync-ticker-prices`  
   - הערה: אם Yahoo ב-429/cooldown — יש להמתין או להריץ שוב כשהספק זמין. התוצאה תלויה בזמינות Yahoo.

2. **הרץ:** `python3 scripts/verify_g7_prehuman_automation.py`

3. **דווח:** תוצאה — PASS או BLOCK.  
   - **אם PASS:** צור `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_RE_VERIFY_RESULT.md` עם status PASS + evidence.  
   - **אם BLOCK:** צור אותו מסמך עם status BLOCK + סיבה + evidence; **בנוסף — חובה:** הנפק **דרישת תיקון מפורטת** ל-Team 20 עם **cc: Team 10** (כל המידע הקיים: כלל PASS, Evidence, לוגים, סיבת כשל, מיקום בקוד, דרישת תיקון, אימות אחרי תיקון). נהל: `TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0` §2.1, §2.2. פרומט קנוני: `documentation/docs-governance/06-TEMPLATES/TEAM_10_TO_TEAM_60_RE_VERIFY_CANONICAL_PROMPT_v1.0.0.md`.

4. **שלח ל-Team 10** — מסלול: דוח השלמה או עדכון דרך _COMMUNICATION.

**מנדט מלא:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_60_S002_P002_WP003_AUTO_WP003_05_RE_VERIFY.md`  
**דוח Team 20:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_COMPLETION.md`

---

**log_entry | TEAM_10 | AUTO_WP003_05_ACTIVATION_PROMPT | TO_TEAM_60 | 2026-03-11**
