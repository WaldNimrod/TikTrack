# Team 10 → Team 60: Stage-1 Specs ב-SSOT — תיאום המשך (1-002, 1-004)

**id:** `TEAM_10_TO_TEAM_60_STAGE1_SPECS_PROMOTED_AND_NEXT`  
**from:** Team 10 (The Gateway)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**רקע:** טיוטות Team 20 קודמו ל-SSOT; משימות 1-001…1-004 סגורות ברשימה המרכזית.

---

## 1. Specs ב-SSOT (לקריאה ויישום)

| משימה | קובץ SSOT | תיאור |
|--------|-----------|--------|
| **1-002** | `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` | תשתית מחירי שוק — Hierarchy (Cache → EOD → LocalStore), מדיניות Staleness, תיאום איתכם (Cache, EOD, DDL) |
| **1-004** | `_COMMUNICATION/team_20/TEAM_20_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md` | Evidence Precision — מטריצת שדות, סטיות; **נדרש:** אימות Precision מול DB בפועל |

---

## 2. תיאום נדרש

- **1-002 (MARKET_DATA_PIPE):** תשתית Cache/EOD — לתאם לפי ה-Spec (סעיף 5 — תיאום Team 60: Redis/in-memory/DB, cron/job, DDL).
- **1-004 (Precision Audit):** אימות מול DB בפועל — וידוא שדות NUMERIC(20,6)/(20,8) תואמים ל-Evidence; דיווח סטיות ל-Team 10 אם יש.

---

## 3. רשימת משימות

משימות 1-001…1-004 סומנו **CLOSED** ב-`_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md`. המשך תיאום ויישום לפי ה-Specs לעיל.

---

**log_entry | TEAM_10 | TO_TEAM_60 | STAGE1_SPECS_PROMOTED_NEXT | 2026-02-13**
