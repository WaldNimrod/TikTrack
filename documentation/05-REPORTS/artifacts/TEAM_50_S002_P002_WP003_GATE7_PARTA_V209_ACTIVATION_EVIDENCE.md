# Team 50 — S002-P002-WP003 GATE_7 Part A v2.0.9 Activation Evidence

**date:** 2026-03-13  
**trigger:** TEAM_90_..._MARKET_OPEN_WINDOW_MANDATE_v2.0.8  

---

## מה בוצע (Team 50)

| # | פריט | סטטוס |
|---|------|--------|
| 1 | `scripts/team_50_verify_timestamp_in_et_window.py` | נוצר — בדיקת timestamp בתוך 09:30–16:00 ET |
| 2 | `scripts/team_50_verify_g7_v209_corroboration_prereqs.py` | נוצר — prereqs: log, mode=market_open, timestamp ET |
| 3 | `scripts/team_50_generate_corroboration_v209.py` | נוצר — יצירת corroboration SUBMITTED |
| 4 | `scripts/team_50_run_corroboration_v209_after_market_run.sh` | נוצר — one-shot אחרי ריצת Team 60 |
| 5 | `TEAM_50_TO_TEAM_90_..._QA_CORROBORATION_v2.0.9.md` | ACTIVATION_READY — ממתין לריצה בחלון ET |

---

## תפעול סופי (כדי לקבל PASS מ־Team 90)

1. **Team 60 / מפעיל:** בתוך 09:30–16:00 ET (Mon–Fri):
   ```bash
   ./scripts/run_g7_cc01_v209_market_open_window.sh
   ```

2. **Team 50:** מיד אחרי הצלחת צעד 1:
   ```bash
   ./scripts/team_50_run_corroboration_v209_after_market_run.sh
   ```

3. **Team 90:** לאשר PASS_PART_A לפי המנדט.

---

## One-liner ל־Team 10

אין תיקון קוד נדרש. נדרש רק rerun בחלון ET (הרצת `run_g7_cc01_v209_market_open_window.sh` ב־09:30–16:00 ET) + corroboration של Team 50 (`team_50_run_corroboration_v209_after_market_run.sh`), ואז Team 90 יאשר PASS_PART_A.
