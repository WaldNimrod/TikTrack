# Team 10 | S002-P002-WP003 — GATE_3 Remediation Round 5 — Execution Plan

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_GATE3_REMEDIATION_ROUND5_PLAN  
**from:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-12  
**gate_id:** GATE_3  
**work_package_id:** S002-P002-WP003  
**context:** WP003 חוזרת ל־GATE_3 — סבב תיקון חמישי; Part A BLOCK + דרישות אדריכליות

---

## 1) מקור הדרישות

| מקור | מסמך | תוכן |
|------|------|------|
| **Team 90** | `TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REVALIDATION_RESPONSE_v2.0.2.md` | CC-01, CC-02 NOT_EVIDENCED; מנדט ממוקד ל־60+50 |
| **Team 90** | `TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.2.md` | Run A (market-open), Run B (off-hours); corroboration v2.0.3 |
| **Team 00** | `TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0.md` | G7-FIX-1, G7-FIX-2A/B, G7-FIX-3; 7 success criteria; T-MKTDATA-01..05 |

---

## 2) סיכום דרישות לפי צוות

### Team 20 — G7-FIX (אדריכלי)
- G7-FIX-1: batch 401 → no cooldown
- G7-FIX-2A: yahoo_provider.py — YahooSymbolRateLimitedException
- G7-FIX-2B: sync_ticker_prices_eod.py — per-ticker counter, threshold ≥3
- G7-FIX-3: run_g7_part_a_evidence.py — count cooldown activations only

### Team 60 — CC-01, CC-02 Evidence
- **Run A:** market-open window — timestamped, Yahoo call count ≤5
- **Run B:** off-hours window — timestamped, Yahoo call count ≤2
- Deliverable: `TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.3.md`
- JSON: `cc_01_yahoo_call_count`, `cc_02_yahoo_call_count`; `pass_01`, `pass_02`, `pass_04`

### Team 50 — G7-VERIFY + Corroboration
- **G7-VERIFY:** אחרי Team 20 — הרצת `run_g7_part_a_evidence.py`; pass_04=True; T-MKTDATA-01..05
- **Corroboration v2.0.3:** אחרי Team 60 — התאמה ל־CC-01, CC-02
- Deliverable: `TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.3.md`

---

## 3) סדר העברה ותלויות

```
┌─────────────────────────────────────────────────────────────────────────┐
│  סדר 1 — מיידי     │  Team 20: G7-FIX-1/2/3 (מנדט Team 00)             │
│  סדר 2 — מקביל     │  Team 60: Run A (market-open) + Run B (off-hours)  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  סדר 3 — אחרי T20  │  Team 50: G7-VERIFY (pass_04) + T-MKTDATA-01..05   │
│  סדר 4 — אחרי T60  │  Team 50: Corroboration v2.0.3 (CC-01, CC-02)      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Deliverables

| צוות | Deliverable |
|------|-------------|
| Team 20 | דוח השלמה + evidence ל־G7-FIX |
| Team 60 | `TEAM_60_TO_TEAM_90_..._RUNTIME_EVIDENCE_REPORT_v2.0.3.md` |
| Team 50 | G7-VERIFY log + `TEAM_50_TO_TEAM_90_..._QA_CORROBORATION_v2.0.3.md` |

---

## 5) תנאי יציאה — Part A PASS

- CC-WP003-01: EVIDENCED (market-open, Yahoo ≤5)
- CC-WP003-02: EVIDENCED (off-hours, Yahoo ≤2)
- CC-WP003-04: PASS (כבר מאושר — נשאר אחרי G7-FIX)
- Team 50 corroboration v2.0.3 תואם Team 60

---

---

## 6) Status (2026-03-12)

| Team | Status |
|------|--------|
| Team 20 | ✅ DONE — G7-FIX-1/2A/2B/3; pass_04=True |
| Team 60 | ✅ DONE — Run A/B v2.0.3; CC-01, CC-02, CC-04 evidenced |
| Team 50 | ✅ DONE — G7-VERIFY, T-MKTDATA 5/5, Corroboration v2.0.3 → Team 90 |

**החבילה:** הוגשה ל־Team 90. Team 90 v2.0.3: **BLOCK_PART_A** (CC-01/02 NOT_EVIDENCED; CC-04 סתירה 60 vs 50).

**v2.0.5:** Team 20 ✓ Team 60 ✓ Team 50 ✓ — Re-QA PASS. **Handoff ל־Team 90:** `TEAM_10_TO_TEAM_90_..._HANDOFF_v2.0.5.md`. הערה: ticker_type — תיקון זריז (לא חוסם).

---

**log_entry | TEAM_10 | WP003_GATE3_REMEDIATION_ROUND5_PLAN | UPDATED_T50_IN_PROGRESS | 2026-03-12**
