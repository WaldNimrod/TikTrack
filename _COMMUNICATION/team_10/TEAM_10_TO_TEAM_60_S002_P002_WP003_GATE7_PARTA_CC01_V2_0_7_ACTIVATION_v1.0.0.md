

# Team 10 → Team 60 | S002-P002-WP003 GATE_7 Part A — הפעלת CC-01 v2.0.7

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE7_PARTA_CC01_V2_0_7_ACTIVATION  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 60 (Runtime/Infra)  
**cc:** Team 50, Team 90  
**date:** 2026-03-12  
**historical_record:** true
**status:** ACTION_REQUIRED  
**in_response_to:** TEAM_90_..._REVALIDATION_RESPONSE_v2.0.6 (BLOCK — הלוג מציג mode=off_hours)  

---

## 1) הקשר

v2.0.6 BLOCK — הלוג שהוגש מציג `mode=off_hours` (2026-03-12T11:50:57Z). חלון זה **לא קביל** ל־CC-01.

**דרישה:** ריצה **בחלון market-open** (09:30–16:00 ET) — הלוג **חייב** להכיל `PHASE_3 price sync cadence: mode=market_open`.

---

## 2) נוהל ריצה אופטימלי

### שלב 0 — Pre-flight (חובה)

```bash
python3 scripts/check_market_open_et.py
```

- **exit 0** — השוק פתוח; המשך לשלב 1
- **exit 1** — השוק סגור; **אל תריץ** — חכה ל־09:30 ET

### שלב 1 — Backend + לוג

```bash
# התחל backend עם tee ללוג חדש
uvicorn api.main:app --host 0.0.0.0 --port 8083 2>&1 | tee documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log
```

### שלב 2 — Verify (רק אחרי Pre-flight PASS)

```bash
G7_PART_A_LOG_PATH=documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log \
G7_PART_A_MODE=market_open \
python3 scripts/verify_g7_part_a_runtime.py
```

### שלב 3 — אימות

```bash
grep "mode=market_open" documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log
```

**חובה:** יש שורה עם `mode=market_open`. אם מופיע רק `mode=off_hours` — הריצה לא קבילה.

---

## 3) דליברבלים

| ארטיפקט | נתיב |
|----------|------|
| Runtime Evidence v2.0.7 | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_..._RUNTIME_EVIDENCE_REPORT_v2.0.7.md` |
| JSON | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` |
| Handoff ל־50 | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_50_..._V2_0_7_CC01_CANONICAL_HANDOFF` |

---

## 4) מנדט Team 90

**נתיב:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_60_TEAM_50_..._CC01_MARKET_OPEN_EVIDENCE_MANDATE_v2.0.6.md`

---

**log_entry | TEAM_10 | TO_TEAM_60 | CC01_V2_0_7_ACTIVATION | ACTION_REQUIRED | 2026-03-12**
