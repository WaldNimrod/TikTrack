---
id: TEAM_61_AOS_V3_GOVERNANCE_GITIGNORE_EXCLUDE_EVIDENCE_v1.0.0
historical_record: true
from: Team 61
to: Team 11
date: 2026-03-28
type: EVIDENCE — mandate TEAM_11_TO_TEAM_61_AOS_V3_GOVERNANCE_CHECK_RUNTIME_EXCLUDE_MANDATE_v1.0.0---

## AC

1. `scripts/check_aos_v3_build_governance.sh` — נתיבים תחת `agents_os_v3/` ש־`git check-ignore` מזהה כמתעלמים (למשל `agents_os_v3/pipeline_state.json` מ־`.gitignore`) **אינם** נדרשים ב־`FILE_INDEX.json`.
2. `pipeline_state.json` **לא** נוסף ל־`FILE_INDEX.json`.

## אימות מקומי

```bash
touch agents_os_v3/pipeline_state.json
git check-ignore -q agents_os_v3/pipeline_state.json   # exit 0
bash scripts/check_aos_v3_build_governance.sh         # PASS
```

**log_entry | TEAM_61 | AOS_V3_BUILD | GOVERNANCE_GITIGNORE_EXCLUDE | MANDATE_T11 | 2026-03-28**
