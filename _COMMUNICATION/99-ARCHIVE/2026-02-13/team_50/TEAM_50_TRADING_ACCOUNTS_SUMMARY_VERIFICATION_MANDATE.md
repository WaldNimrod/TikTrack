# Team 50 — Mandate: trading_accounts/summary אימות

**id:** `TEAM_50_TRADING_ACCOUNTS_SUMMARY_VERIFICATION`  
**owner:** Team 50 (QA)  
**status:** ✅ **מאומת** — trading_accounts/summary 200 OK (2026-02-07)  
**last_updated:** 2026-02-07  
**מקור:** הודעה מ-Team 10 / The Gateway

---

## נושא

`trading_accounts/summary` — אימות לאחר תיקון Team 20+30.

---

## סטטוס

🔴 **Gate B RED** עד חיבור מלא ואימות.

---

## משימות Team 50

| # | משימה | סטטוס |
|---|--------|--------|
| 1 | להמתין לתיקון Team 20+30 | ✅ הושלם |
| 2 | ריצה מחדש של בדיקות אוטומציה: E2E + UI Summary | ✅ Runtime הושלם; E2E דורש עדכון selectors |
| 3 | להפיק אישור חתום | ✅ הושלם |

---

## Acceptance Criteria (חובה)

| קריטריון | תיאור | סטטוס |
|----------|--------|--------|
| **Summary נטען בפועל** | Summary נטען מה-endpoint `GET /api/v1/trading_accounts/summary` | ✅ אומת (HTTP 200) |
| **אין שגיאות Console** | אין שגיאות ב-Console בעת טעינת עמוד D16 | ✅ Runtime: אין שגיאות |
| **אין שגיאות Network** | אין שגיאות Network (4xx/5xx) בפנייה ל-summary | ✅ אומת (200 OK) |

---

## בדיקות נדרשות

### 1) E2E — D16 Trading Accounts
- ניווט ל-`/trading_accounts`
- Login + טעינת עמוד
- אימות שה-Summary section נטען (למשל `#summaryStats` / `[data-section="summary-alerts"]`)
- Capture Console logs — אימות שאין SEVERE
- Capture Network — אימות ש-`trading_accounts/summary` מחזיר 200

### 2) UI Summary
- אימות שה-UI מציג נתוני Summary בפועל (לא ריק/לא שגיאה)
- אימות שה-DataLoader קורא ל-`trading_accounts/summary` ומציג את התגובה

---

## תשתית נדרשת

- **Frontend:** `http://localhost:8080` (פעיל)
- **Backend:** `http://localhost:8082` (פעיל)
- **E2E:** `npm run test:phase2-e2e` (מתוך `tests/`)
- **Runtime:** `npm run test:phase2` (מתוך `tests/`)
**Policy:** אתחול/הפעלת שרתים הוא self‑service לכל צוות. אין לפנות ל‑Team 60 אלא במקרה תקלה תשתיתית אמיתית.

### ⚠️ חובה: שימוש בסקריפטי איתחול והפעלה

**יש תמיד להשתמש בסקריפטים הקיימים:**

| שרת | סקריפט | Task (Cursor) |
|-----|--------|---------------|
| Backend (8082) | `./scripts/start-backend.sh` | 🚀 Start Backend Server |
| Frontend (8080) | `./scripts/start-frontend.sh` | 🚀 Start Frontend Dev Server |
| **הכל** | — | 🚀 Start All Servers (Backend + Frontend) |
| בדיקת סטטוס | — | 📋 Check Server Status |

**מקור:** `scripts/README.md` | `.vscode/tasks.json`

---

## תלות

- תיקון Team 20: Endpoint `trading_accounts/summary` מיושם וזמין
- תיקון Team 30: DataLoader/Config מחוברים ל-endpoint

---

**log_entry | [Team 50] | MANDATE | TRADING_ACCOUNTS_SUMMARY_VERIFICATION | GATE_B_RED | 2026-01-31**
