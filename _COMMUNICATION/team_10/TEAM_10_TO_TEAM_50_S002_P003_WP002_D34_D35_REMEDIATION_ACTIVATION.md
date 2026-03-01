# Team 10 → Team 50: מנדט תיקון — D34/D35 FAV (סגירת BF-G5-001..004)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P003_WP002_D34_D35_REMEDIATION_ACTIVATION  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 90, Team 20, Team 30  
**date:** 2026-02-27  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_5 (remediation loop)  
**work_package_id:** S002-P003-WP002  
**trigger:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT (BF-G5-001..004)  

---

## 1) מטרה

Team 90 החזיר **GATE_5 BLOCK** — חסרים ארבעה ארטיפקטים קנוניים של D34/D35 ב־WP002. Team 10 מפעיל את **Team 50** (שכבת QA/FAV) ליצור אותם בנתיבים הקנוניים, לעדכן evidence ולדווח — כדי ש־Team 10 יוכל להגיש מחדש בקשת GATE_5 ל־Team 90.

---

## 2) ממצאים לסגירה (חובה)

| ID | ארטיפקט | נתיב קנוני | הערות (LLD400 §2.5) |
|----|----------|------------|----------------------|
| **BF-G5-001** | D34 FAV API script | `scripts/run-alerts-d34-fav-api.sh` | D34 FAV API (extended from Gate-A); env vars, exit codes |
| **BF-G5-002** | D34 E2E | `tests/alerts-d34-fav-e2e.test.js` | D34 E2E: CREATE/EDIT/DELETE alert, is_active toggle |
| **BF-G5-003** | D34 CATS | `scripts/run-cats-precision.sh` | D34 CATS precision (price_threshold) |
| **BF-G5-004** | D35 E2E | `tests/notes-d35-fav-e2e.test.js` | D35 E2E: DELETE, full CRUD round-trip, XSS sanitization |

**תקן:** ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD, ARCHITECT_DIRECTIVE_FAV_PROTOCOL, ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE — env vars בלבד, ללא credentials בקוד.

---

## 3) מה לעשות (רשימת משימות)

| # | משימה | תוצר |
|---|--------|------|
| 1 | ליצור את ארבעת הקבצים בנתיבים לעיל | קובץ על הדיסק בכל נתיב; תוכן per LLD400 ו־standards |
| 2 | לעדכן/להשלים דוח FAV | להפנות לנתיבים המדויקים של D34/D35 ולהוסיף run evidence ל־D34/D35 (אם רלוונטי) |
| 3 | לדווח סיום ל־Team 10 | מסמך ב־_COMMUNICATION/team_50/ — למשל TEAM_50_TO_TEAM_10_S002_P003_WP002_D34_D35_REMEDIATION_COMPLETION.md — עם רשימת קבצים ו־BF-G5-001..004 = CLOSED |

---

## 4) קונטקסט חובה

| מסמך | שימוש |
|------|--------|
| _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT.md | ממצאים ממוספרים ונתיבים |
| _COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md | §2.5 ארטיפקטים, §2.6 exit criteria ל־D34/D35 |
| _COMMUNICATION/team_10/TEAM_10_S002_P003_WP002_WORK_PACKAGE_DEFINITION.md | scope ו־deliverables |

---

## 5) אחרי סיום

- Team 50 מדווח ל־**Team 10** (דוח remediation completion).
- **Team 10** מעדכן חבילת evidence (paths + דוח מעודכן) ומגיש מחדש **בקשת GATE_5** ל־Team 90 (הפניה לפרומפט ההפעלה ולחבילה המעודכנת).
- **Team 90** מריץ re-validation; עם PASS — עדכון WSM וקידום ל־GATE_6. עם BLOCK — לולאת תיקון נוספת.

---

**log_entry | TEAM_10 | TO_TEAM_50 | S002_P003_D34_D35_REMEDIATION | MANDATE_ACTIVE | 2026-02-27**
