# Team 10 → Team 20 | S002-P002-WP003 G7-FIX — הפעלת מנדט אדריכלי (סבב תיקון 5)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_G7_FIX_ACTIVATION_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 50, Team 60, Team 90, Team 00  
**date:** 2026-03-12  
**status:** MANDATE_ACTIVE  
**trigger:** WP003 GATE_3 Remediation Round 5 — תיקוני קוד אדריכליים לפי מנדט Team 00  
**authority:** TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_3 (remediation) → GATE_7 |
| phase_owner | Team 90 (GATE_7) |

---

## 1) מטרה

מימוש **מנדט אדריכלי קנוני** — G7-FIX-1/2A/2B/3 — לטיפול בשלושה פגמים אדריכליים שגורמים ל־CC-WP003-04 לכישלונות שגויים.

**מסמך הסמכות:**  
`_COMMUNICATION/team_00/TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0.md`

**עליכם לעבוד אך ורק לפי המנדט הנ״ל.** חובה לקרוא את המסמך במלואו ולהפעיל את כל השינויים המפורטים בו.

---

## 2) סיכום תיקונים (לפי מנדט Team 00)

| Fix | קובץ | פעולה |
|-----|------|-------|
| **G7-FIX-1** | `scripts/sync_ticker_prices_eod.py` | 401 → אין cooldown; log-only + fallthrough |
| **G7-FIX-2A** | `api/integrations/market_data/providers/yahoo_provider.py` | `YahooSymbolRateLimitedException` + raise (במקום set_cooldown) |
| **G7-FIX-2B** | `scripts/sync_ticker_prices_eod.py` | per-ticker counter; threshold ≥3 → global cooldown |
| **G7-FIX-3** | `scripts/run_g7_part_a_evidence.py` | ספירת `"Yahoo 429 — cooldown"` + `"Yahoo systemic rate limit"` בלבד |

---

## 3) סדר ביצוע (כפי במנדט Team 00)

```
Step 1: G7-FIX-3 (evidence script)
Step 2: G7-FIX-1 (batch 401)
Step 3: G7-FIX-2 Part A (yahoo_provider.py)
Step 4: G7-FIX-2 Part B (sync_ticker_prices_eod.py)
Step 5: Local test: python scripts/run_g7_part_a_evidence.py
Step 6: Submit to Team 50 for G7-VERIFY
```

---

## 4) דליברבל — דוח השלמה

**נתיב:**  
`_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_G7_FIX_COMPLETION.md`

**תוכן מינימלי:**
- status: DONE | BLOCKED
- תיאור קצר: אילו תיקונים יושמו (1, 2A, 2B, 3)
- תוצאת local test: `pass_04=True` / `pass_04=False`
- הפניה ל־commit / קבצים ששונו
- **העברת חבילה ל־Team 50:** חובה לציין במפורש שהחבילה מועברת ל־Team 50 לצורך G7-VERIFY

---

## 5) חיבור לסבב

- **GATE_3 Remediation Round 5:**  
  `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE3_REMEDIATION_ROUND5_PLAN_v1.0.0.md`
- **תלות:** Team 50 G7-VERIFY ו־T-MKTDATA-01..05 יופעלו **אחרי** השלמתכם.

---

**log_entry | TEAM_10 | G7_FIX_ACTIVATION | TO_TEAM_20 | MANDATE_ACTIVE | 2026-03-12**
