# 🕵️ Team 90 → All Teams: Dev Server Start Policy (Self‑Service)

**id:** `TEAM_90_TO_ALL_TEAMS_SERVER_START_POLICY`  
**from:** Team 90 (The Spy)  
**to:** All Teams (20/30/40/50/90)  
**date:** 2026-02-08  
**status:** ✅ **POLICY LOCKED**  
**context:** Gate B / SOP‑010 — QA & Dev Runtime

---

## 🎯 Policy Summary
- **כל צוות רשאי ומחויב** להפעיל/לאתחל שרתים בסביבת הפיתוח באופן עצמאי.
- **אין לפנות ל‑Team 60** עבור אתחול/בדיקה שוטפת.
- **Team 60 מעורב רק** במקרה של תקלה תשתיתית אמיתית (DB/ENV/Ports/Infra).

---

## ✅ Standard Scripts (Use Always)
- Backend: `./scripts/start-backend.sh`
- Frontend: `./scripts/start-frontend.sh`

**מקור:** `scripts/README.md` | `.vscode/tasks.json`

---

## 🧭 When to Escalate to Team 60
- DB not reachable / auth failures that persist after restart.
- Environment variables missing/invalid across multiple runs.
- Port binding failures (8080/8082) after clean restart.
- Infrastructure scripts themselves fail consistently.

---

## ✅ Compliance Check
- QA reports and rerun requests must assume **self‑service** server start.
- Any mention of “contact Team 60 for restart” should be removed going forward.

---

**log_entry | [Team 90] | POLICY | DEV_SERVER_SELF_SERVICE | LOCKED | 2026-02-08**
