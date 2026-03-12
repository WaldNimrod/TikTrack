# Team 60 → Team 90 | S002-P002-WP003 GATE_7 Part A Runtime Evidence Report v2.0.9

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.9  
**from:** Team 60 (Runtime/Infrastructure)  
**to:** Team 90 (GATE_7 owner)  
**cc:** Team 10, Team 50, Team 20, Team 00, Team 100, Team 190  
**date:** 2026-03-13  
**status:** PROCEDURE_READY — Run in 09:30–16:00 ET required for admissible evidence  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_90_..._MARKET_OPEN_WINDOW_MANDATE_v2.0.8  

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

## 1) דרישת קבילות (Team 90)

Run A for CC-01 must be executed in **09:30–16:00 ET (Mon–Fri)**.  
Forced `mode=market_open` outside this window is **not admissible**.

---

## 2) נוהל ריצה (חובה)

**הרץ רק בתוך חלון 09:30–16:00 ET (Mon–Fri):**

```bash
./scripts/run_g7_cc01_v209_market_open_window.sh
```

- הסקריפט מריץ **Pre-flight** (`check_market_open_et.py`). אם exit 1 — נעצר (לא קביל).
- **אין** שימוש ב־`G7_CC01_EVIDENCE_FORCE_MARKET_OPEN` — הבקאנד מחזיר `mode=market_open` רק כשהשוק באמת פתוח.
- תוצאה: `documentation/05-REPORTS/artifacts/G7_PART_A_V2_0_9.log` עם `mode=market_open`, JSON מעודכן עם timestamp בתוך החלון.

---

## 3) ארטיפקטים (לאחר הרצה בחלון ET)

| ארטיפקט | נתיב |
|----------|------|
| Runtime Evidence Report v2.0.9 | _COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_..._RUNTIME_EVIDENCE_REPORT_v2.0.9.md (זה) |
| QA Corroboration v2.0.9 | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_..._QA_CORROBORATION_v2.0.9.md |
| JSON | documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json |
| Log | documentation/05-REPORTS/artifacts/G7_PART_A_V2_0_9.log |

---

## 4) סטטוס בעת הפקה

- **Pre-flight בעת הפקה:** SKIP — US market CLOSED (18:30 ET).
- **המשך:** הרץ `./scripts/run_g7_cc01_v209_market_open_window.sh` **בתוך 09:30–16:00 ET**. לאחר הצלחה — timestamp ב־JSON יהיה בתוך החלון; Team 50 יאשרו corroboration v2.0.9 על אותו log_path/run_id; Team 90 יאשר PASS_PART_A.

---

## 5) זרימה

1. **Team 60:** הרצת הסקריפט בחלון 09:30–16:00 ET → לוג V2_0_9, JSON עם timestamp קביל.  
2. **Team 50:** Corroboration v2.0.9 — אותו log_path ו־run_id.  
3. **Team 90:** PASS_PART_A.

---

**log_entry | TEAM_60 | S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.9 | PROCEDURE_READY | 2026-03-13**
