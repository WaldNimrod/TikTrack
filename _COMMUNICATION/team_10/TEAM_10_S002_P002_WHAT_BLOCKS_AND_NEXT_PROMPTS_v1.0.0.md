# Team 10 | S002-P002 — מה חסר, מה מפריע, ופרומפטים להבא (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_S002_P002_WHAT_BLOCKS_AND_NEXT_PROMPTS_v1.0.0  
**owner:** Team 10  
**date:** 2026-03-07  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION  

---

## 1) מה חסר לנו (Team 10)

| # | חסר | הערה |
|---|-----|------|
| 1 | **6 תוצרי מחזור ראשון** | עד שלא ייכתבו — החבילה לא "מופעלת" מבצעית; הצוותים 50/60/61/90 לא מקבלים מנדטים. |
| 2 | **עדכון ACK ל־READY** | ב־TEAM_10_TO_TEAM_190_..._ACK רשום WAITING_ON_TRIGGER; אחרי אימות הטריגרים יש לעדכן ל־READY. |

**רשימת 6 התוצרים:**

1. `TEAM_10_S002_P002_MCP_QA_TRANSITION_WORK_PACKAGE_DEFINITION_v1.0.0.md` — WP-A, WP-B, שרשרת שערים ובעלים  
2. `TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md` — G3.1..G3.9, checkpoint G3.5  
3. `TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md`  
4. `TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0.md`  
5. `TEAM_10_TO_TEAM_50_S002_P002_MCP_QA_HYBRID_QA_ACTIVATION_v1.0.0.md`  
6. `TEAM_10_TO_TEAM_90_S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION_v1.0.0.md`  

---

## 2) מה מפריע להפעיל את החבילה

**מבחינת טריגרים — כלום.** שלושת הטריגרים מתקיימים:

| טריגר | סטטוס | ראיה |
|--------|--------|------|
| 1. GATE_8 PASS — חבילת Team 70 התקבלה | מתקיים | TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE8_VALIDATION_REPORT.md — PASS_DOCUMENTATION_CLOSED |
| 2. S002-P002 שרשרת ספק פתוחה (GATE_0..GATE_2) | מתקיים | Team 190 שלח את חבילת ההפעלה רק אחרי אישור GATE_2 |
| 3. WSM מסונכרן ל־S002-P002 | מתקיים | WSM עודכן; active_program_id=S002-P002 |

**המחסום היחיד:** חסרים **המסמכים עצמם** — הגדרת חבילת עבודה, תכנית GATE_3, וארבעת מנדטי ההפעלה ל־61, 60, 50, 90. ברגע ש־Team 10 יוצרים את ששת המסמכים ומפרסמים אותם — החבילה מופעלת והצוותים יכולים להתחיל.

---

## 3) פרומפטים מוכנים להבא — לפי צוות

להעתיק את הפרומפט הרלוונטי ולמסור לצוות (או להריץ כסוכן).

---

### פרומפט 1 — Team 10 (הבא המיידי): יצירת 6 תוצרי מחזור ראשון

```
אתה פועל כ־Team 10 (Gateway Orchestration) בתוכנית S002-P002 (MCP-QA Transition).

משימה: ליצור את ששת תוצרי המחזור הראשון לפי TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md §5.

מקורות חובה:
- _COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md
- documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_MCP_QA_ROLE_REFRESHER_v1.0.0.md
- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md (CURRENT_OPERATIONAL_STATE)
- 04_GATE_MODEL_PROTOCOL (אם קיים ב־repo) או WSM §0 — שרשרת שערים ובעלים

תוצרים ליצור (בסדר):

1) TEAM_10_S002_P002_MCP_QA_TRANSITION_WORK_PACKAGE_DEFINITION_v1.0.0.md
   - WP-A: Hybrid Integration (MCP + Selenium parity)
   - WP-B: Controlled Agentic Expansion
   - שרשרת שערים מפורשת (GATE_0..GATE_8) ובעלים לכל שער (לפי WSM/04_GATE_MODEL)

2) TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md
   - G3.1..G3.9 — תכנית אורקסטרציה
   - checkpoint חובה G3.5 (הגדרה מפורשת)

3) TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md
   - מנדט ל־Team 61: CI, אינטגרציית כלים, evidence generation hooks (לפי §6 Evidence Contract — provenance, Ed25519 signature block, gate context)

4) TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0.md
   - מנדט ל־Team 60: runtime hardening, משמורת מפתח Ed25519, הגדרת שירות חתימה

5) TEAM_10_TO_TEAM_50_S002_P002_MCP_QA_HYBRID_QA_ACTIVATION_v1.0.0.md
   - מנדט ל־Team 50: ריצות parity היברידיות (MCP + Selenium safety net)

6) TEAM_10_TO_TEAM_90_S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION_v1.0.0.md
   - מנדט ל־Team 90: נקודות ביקורת לאימות evidence מימוש ל־GATE_5/GATE_6

גבולות נעולים (§4 בפרומפט): אין סטיית gate-owner; GATE_7 = Team 90 + Nimrod; GATE_8 = Team 90 closure; Team 61 = repo automation בלבד; Team 60 = runtime + signing בלבד.

לאחר יצירת כל ששת המסמכים — לעדכן את TEAM_10_TO_TEAM_190_S002_P002_MCP_QA_TRANSITION_ACTIVATION_ACK_v1.0.0.md: trigger_readiness → READY, planned_issue_date → היום.
```

---

### פרומפט 2 — Team 61 (לאחר קבלת מנדט)

```
אתה פועל כ־Team 61 (repo automation) בתוכנית S002-P002 (MCP-QA Transition).

משימה: לממש את מנדט ההפעלה מ־Team 10.

מקור חובה: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md

פעולות: לפי המנדט — CI, אינטגרציית כלים, evidence generation hooks. כל MATERIALIZATION_EVIDENCE.json חייב לכלול: provenance tag (TARGET_RUNTIME | LOCAL_DEV_NON_AUTHORITATIVE | SIMULATION), signature block (Ed25519, key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team), gate context ו־artifact path.

דווח ל־Team 10 עם evidence_path לכל תוצר שבוצע.
```

---

### פרומפט 3 — Team 60 (לאחר קבלת מנדט)

```
אתה פועל כ־Team 60 (runtime/platform, signing-key custody) בתוכנית S002-P002 (MCP-QA Transition).

משימה: לממש את מנדט ההפעלה מ־Team 10.

מקור חובה: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0.md

פעולות: לפי המנדט — runtime hardening, משמורת מפתח Ed25519, הגדרת שירות חתימה. גבול: Team 60 שולט רק ב־runtime/platform ובמשמורת מפתחות חתימה.

דווח ל־Team 10 עם evidence_path לכל תוצר שבוצע.
```

---

### פרומפט 4 — Team 50 (לאחר קבלת מנדט)

```
אתה פועל כ־Team 50 (QA) בתוכנית S002-P002 (MCP-QA Transition).

משימה: לממש את מנדט ההפעלה מ־Team 10.

מקור חובה: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S002_P002_MCP_QA_HYBRID_QA_ACTIVATION_v1.0.0.md

פעולות: לפי המנדט — ריצות parity היברידיות (MCP + Selenium safety net). חוזה Evidence: כל MATERIALIZATION_EVIDENCE.json עם provenance, signature block, gate context.

דווח ל־Team 10 עם evidence_path לכל תוצר שבוצע.
```

---

### פרומפט 5 — Team 90 (לאחר קבלת מנדט)

```
אתה פועל כ־Team 90 (External Validation Unit) בתוכנית S002-P002 (MCP-QA Transition).

משימה: לממש את מנדט ההפעלה מ־Team 10.

מקור חובה: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION_v1.0.0.md

פעולות: לפי המנדט — הגדרת נקודות ביקורת לאימות evidence מימוש ל־GATE_5/GATE_6. גבול: GATE_7 בעלים Team 90; סמכות אנושית Nimrod (Team 00); עדות MCP ייעוצית בלבד.

דווח ל־Team 10 כאשר הפרוטוקול מוגדר וזמין.
```

---

## 4) סדר ביצוע מומלץ

1. **עכשיו:** הרץ את **פרומפט 1 (Team 10)** — יצירת 6 המסמכים.  
2. **אחרי ש־1 מוכן:** העבר את **פרומפטים 2–5** לצוותים 61, 60, 50, 90 (כל צוות מקבל את שלו).  
3. **אופציונלי:** לעדכן ACK ל־READY ו־planned_issue_date עם סיום מסמך 1.

---

**log_entry | TEAM_10 | S002_P002_WHAT_BLOCKS_AND_NEXT_PROMPTS | 2026-03-07**
