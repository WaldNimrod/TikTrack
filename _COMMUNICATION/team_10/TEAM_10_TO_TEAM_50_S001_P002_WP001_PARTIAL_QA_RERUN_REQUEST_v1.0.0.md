# Team 10 → Team 50 | S001-P002-WP001 Partial QA Re-Run Request

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S001_P002_WP001_PARTIAL_QA_RERUN_REQUEST_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA & Fidelity)  
**ref:** BF-G5-009-002; TEAM_90_TO_TEAM_10_S001_P002_WP001_BLOCKING_REPORT  
**date:** 2026-03-14  
**status:** ACTIVE  
**scope:** Targeted partial QA re-run — non-empty widget scenarios only  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| work_package_id | S001-P002-WP001 |
| gate_id | GATE_5 (doc fix) |
| blocker | BF-G5-009-002 |

---

## 1) Request Summary

GATE_5 blocked because the current QA report marks scenarios 2–5 as **N/A** (non-empty widget not tested). Per BF-G5-009-002, Team 50 must re-run QA with unread test data setup and execute these scenarios as **PASS/FAIL**.

**This is a targeted partial re-run — NOT a full GATE_4 cycle.**

---

## 2) Scenarios to Execute (PASS/FAIL Required)

| # | Scenario | Setup | Expected PASS |
|---|----------|-------|---------------|
| 2 | Non-empty state | Run §3 setup first | Widget visible; badge shows integer count |
| 3 | Alert list content | Same session | Each item shows ticker · condition · relative time |
| 4 | Item click → D34 | Same session | Navigate to `/alerts.html` |
| 5 | Badge click → D34 filtered | Same session | Navigate to `/alerts.html?trigger_status=triggered_unread` |

---

## 3) Setup Commands (from Work Plan §6.4)

**Prerequisites:** Backend + frontend running. Credentials: `TikTrackAdmin` / `4181`.

**Obtain token:**
```bash
BACKEND="http://localhost:8082"
TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
```

**Ensure ≥1 triggered_unread (run before scenarios 2–5):**
```bash
ALERT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND/api/v1/alerts?per_page=1" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); arr=d.get('data',[]); print(arr[0]['id'] if arr else '')")
[ -n "$ALERT_ID" ] && curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"trigger_status":"triggered_unread"}' "$BACKEND/api/v1/alerts/$ALERT_ID" > /dev/null
```

*If no alerts exist, create one via D34 or `bash scripts/run-alerts-d34-qa-api.sh` first.*

---

## 4) Required Output

**Update** `_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md`:

1. Replace **N/A** for scenarios 2–5 with **PASS** or **FAIL**.
2. Add evidence (commands run, browser steps, snapshots if available).
3. Update **Overall** verdict: **PASS** only if all scenarios 2–5 are **PASS**; otherwise **FAIL**.

---

## 5) Full Spec Reference

Work plan: `_COMMUNICATION/team_10/TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.1.0.md` — §6.4, §6.5

---

**log_entry | TEAM_10 | TO_TEAM_50 | S001_P002_WP001_PARTIAL_QA_RERUN | REQUEST | 2026-03-14**
