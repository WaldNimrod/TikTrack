# Team 10 → Team 20 | KB-018 structlog — מנדט הסרת תלות לא בשימוש

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_20_KB_018_STRUCTLOG_REMOVAL_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 50, Team 170, Team 190  
**date:** 2026-03-13  
**status:** ACTION_REQUIRED  
**scope:** KB-018 — structlog listed but unused  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| bug_id | KB-2026-03-03-20 (KB-018) |
| scope_id | CLOUD_AGENT_SCAN |
| severity | LOW |
| remediation_mode | BATCHED |
| target_cycle | Cloud-Agent Batched Remediation Round (CA-BAT-01) |

---

## 1) הקשר

KB-018: `structlog` מופיע ב־`api/requirements.txt` אך אינו בשימוש בקוד. ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE: "Team 20 may remove or begin using; low priority". הסרה מפחיתה תלויות מיותרות וסוגרת את הבאג.

---

## 2) משימה נדרשת

**הסר** את שורת `structlog` מ־`api/requirements.txt`.

| קובץ | שינוי |
|------|--------|
| `api/requirements.txt` | הסירו את השורה: `structlog>=23.2.0` (כולל הערת # Logging אם נשארת ריקה) |

---

## 3) אימות מקומי חובה

1. `pip install -r api/requirements.txt` — ללא שגיאות
2. `python3 -m pytest tests/unit/ -v --tb=short` — כל הבדיקות עוברות
3. `uvicorn api.main:app --reload` (או `make run-api`) — האפליקציה עולה ללא שגיאות import

---

## 4) דליברבל נדרש — החזרה לבדיקת Team 10

**נתיב:**  
`_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_KB_018_STRUCTLOG_REMOVAL_COMPLETION_v1.0.0.md`

**תוכן חובה:**

| שדה | תוכן |
|-----|------|
| bug_id | KB-2026-03-03-20 |
| action_taken | "structlog removed from api/requirements.txt" |
| checks_run | רשימת הפקודות שהורצו |
| checks_result | PASS / FAIL לכל בדיקה |
| files_changed | `api/requirements.txt` |
| verdict | PASS / BLOCK |

---

## 5) Closure path

לאחר קבלת הדליברבל עם verdict PASS — Team 10 יעדכן את KNOWN_BUGS_REGISTER ל־CLOSED עבור KB-018.

---

**log_entry | TEAM_10 | TO_TEAM_20 | KB_018_STRUCTLOG_REMOVAL_MANDATE | ISSUED | 2026-03-13**
