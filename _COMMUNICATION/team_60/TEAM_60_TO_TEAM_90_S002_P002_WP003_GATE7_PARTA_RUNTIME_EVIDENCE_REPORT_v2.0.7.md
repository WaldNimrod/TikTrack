

# Team 60 → Team 90 | S002-P002-WP003 GATE_7 Part A Runtime Evidence Report v2.0.7

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.7  
**from:** Team 60 (Runtime/Infrastructure)  
**to:** Team 90 (GATE_7 owner)  
**cc:** Team 10, Team 50, Team 20, Team 00, Team 100, Team 190  
**date:** 2026-03-12  
**historical_record:** true
**status:** PROCEDURE_READY — Evidence run during 09:30–16:00 ET required  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_..._V2_0_6_BLOCK_ACK_AND_CC01_V2_0_7_ROUTING; TEAM_10_TO_TEAM_60_..._CC01_V2_0_7_ACTIVATION  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 Part A |
| phase_owner | Team 90 |
| project_domain | TIKTRACK |

---

## 1) תיקון מדויק — נוהל ריצה (חובה)

כדי שהלוג **יכלול** `mode=market_open` (ולא `off_hours`), הריצה חייבת להתבצע **בחלון 09:30–16:00 ET (Mon–Fri)**.

### Pre-flight (חובה)

```bash
python3 scripts/check_market_open_et.py
```

- **exit 0** — השוק פתוח; המשך.
- **exit 1** — השוק סגור; **אל תריץ verify** — חכה ל־09:30 ET.

### ריצה מלאה (אוטומטית)

```bash
./scripts/run_g7_cc01_v207_market_open.sh
```

הסקריפט: מריץ Pre-flight → מפעיל backend עם `tee` ל־`documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log` → מריץ verify (market_open) → בודק `grep "mode=market_open"` בלוג. אם חסר — exit 1 (לא קביל).

### אימות

```bash
grep "mode=market_open" documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log
```

**חובה:** יש שורה עם `mode=market_open`. אם מופיע רק `mode=off_hours` — הריצה לא קבילה.

---

## 2) סטטוס בעת הפקת הדוח

| פריט | ערך |
|------|-----|
| Pre-flight בעת הפקה | **SKIP** — US market CLOSED (08:09 ET). |
| לוג צפוי | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log` (נוצר בהרצת הסקריפט בשעות השוק). |
| run_id | v2.0.7-cc01-market-open |

**המשך:** הרץ `./scripts/run_g7_cc01_v207_market_open.sh` **בתוך 09:30–16:00 ET (Mon–Fri)**. לאחר הצלחה — הלוג יכיל `mode=market_open`, ה־JSON יעודכן, ו־Team 50 יוכלו להגיש corroboration v2.0.7 עם אותו log_path ו־timestamp.

---

## 3) דליברבלים

| ארטיפקט | נתיב |
|----------|------|
| נוהל ריצה | `scripts/run_g7_cc01_v207_market_open.sh` |
| Pre-flight | `scripts/check_market_open_et.py` |
| לוג (לאחר הרצה בשעות השוק) | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log` |
| JSON | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` |

---

## 4) זרימה להמשך

1. **Team 60:** הרצת `run_g7_cc01_v207_market_open.sh` בחלון market-open → לוג עם `mode=market_open`, עדכון JSON.  
2. **Team 50:** Corroboration v2.0.7 — אותו log_path ו־timestamp.  
3. **Team 10:** Handoff v2.0.7 ל־Team 90.

---

**log_entry | TEAM_60 | S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.7 | PROCEDURE_READY | 2026-03-12**
