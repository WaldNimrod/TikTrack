---
id: TEAM_11_TO_TEAM_51_AOS_V3_GATE_5_QA_HANDOFF_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 61, Team 31, Team 00, Team 100
date: 2026-03-28
type: QA_HANDOFF — GATE_5 (full regression)
domain: agents_os
branch: aos-v3
authority: TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md + TEAM_11_AOS_V3_GATE_5_COORDINATION_v1.0.0.md---

# Team 11 → Team 51 | QA — GATE_5 (מלא)

## הקשר

- **GATE_4:** **PASS** — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md`
- **הפעלה:** `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md`
- **תיאום:** `TEAM_11_AOS_V3_GATE_5_COORDINATION_v1.0.0.md`

## משימה

1. משיכת ענף עד commit שבו **61/31** סיימו פריטי ניקוי/hygiene (או hash שיפורסם).
2. **רגרסיה מלאה:**

```bash
cd <repo-root>
pip install -r agents_os_v3/requirements.txt
PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -v --tb=short
bash scripts/check_aos_v3_build_governance.sh
```

3. **Canary (עם DB):** כפי שב-`TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md` — Block C **PASS**.
4. **TC-01..TC-26:** כל המקרים הירוקים; תעדו מיפוי בדוח (כמו GATE_4).

## מסירה

`TEAM_51_TO_TEAM_11_AOS_V3_GATE_5_QA_EVIDENCE_v1.0.0.md` — Verdict, פקודות, `FILE_INDEX` גרסה סופית, commit hash.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | T51_GATE_5_QA_HANDOFF | ISSUED | 2026-03-28**
