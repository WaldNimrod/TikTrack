# Team 10 → Team 50: הפעלה — S002-P003-WP002 D22 FAV (מנדט ביצוע)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P003_WP002_D22_FAV_ACTIVATION  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 20, Team 30, Team 190  
**date:** 2026-02-27  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) מי אחראי

**Team 10 (השער)** אחראי להפעיל את Team 50 ולוודא שיש מנדט ברור. מסמך זה הוא **מנדט הביצוע** — Team 50 מתבקש לפעול לפיו.

---

## 2) טריגר

- WP001 (D22 Filter UI) הושלם על ידי Team 30 — דוח התקבל ואושר: `TEAM_10_S002_P003_WP001_COMPLETION_ACK.md`.
- **D22 FAV** ב־WP002 כעת **לא חסום**. Team 50 מופעל לביצוע מקטע D22 של WP002 (במקביל או אחרי D34/D35 לפי הסטטוס אצלכם).

---

## 3) מה לעשות (רשימת משימות)

| # | משימה | תוצר / נתיב | הערות |
|---|--------|-------------|--------|
| 1 | סקריפט API ל־D22 | `scripts/run-tickers-d22-qa-api.sh` | env vars, JSON summary, exit codes (per LLD400 §2.5) |
| 2 | E2E ל־D22 | `tests/tickers-d22-e2e.test.js` | filter UI, CRUD, data integrity, summary |
| 3 | דיווח סיום ל־Team 10 | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P003_WP002_FAV_COMPLETION_REPORT.md` (או שם מקביל) | כולל D22 + D34 + D35 FAV status; SOP-013 Seal |

**שכבת אחריות:** רק QA — סקריפטים ו־E2E. אם API או UI חוסמים: הוצאת הודעת תאום ל־Team 20 או Team 30 (לא לתקן בעצמכם).

---

## 4) קונטקסט חובה (לפני ביצוע)

| מסמך | שימוש |
|------|--------|
| _COMMUNICATION/team_10/TEAM_10_S002_P003_GATE3_ACTIVATION_PROMPTS_v1.0.0.md | §4.2 — פרומט המלא ל־Team 50 |
| _COMMUNICATION/team_10/TEAM_10_S002_P003_WP002_WORK_PACKAGE_DEFINITION.md | scope, dependency order, exit criteria |
| _COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md | §2.5 ארטיפקטים, §2.6 exit criteria |

---

## 5) אחרי סיום

- Team 50 מדווח ל־**Team 10** (דוח השלמה ב־_COMMUNICATION/team_50/).
- Team 10 יקדם שער (GATE_3 exit → GATE_4 QA) בהתאם לריצת התהליך.

---

**log_entry | TEAM_10 | TO_TEAM_50 | S002_P003_WP002_D22_FAV_ACTIVATION | MANDATE_ACTIVE | 2026-02-27**
