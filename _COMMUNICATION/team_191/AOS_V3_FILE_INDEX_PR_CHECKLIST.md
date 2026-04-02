---
id: AOS_V3_FILE_INDEX_PR_CHECKLIST
type: FALLBACK_CHECKLIST
owner: Team 191
date: 2026-03-27
authority: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0 §3 אפשרות B
---

# AOS v3 — PR / סוף-sprint checklist (fallback)

**מתי להשתמש:** אם pre-commit hook אינו רץ בסביבה מסוימת — סוקר חייב לאמת ידנית.

## לפני merge ל־`aos-v3` (או לפני PR פנימי)

- [ ] `agents_os_v3/FILE_INDEX.json` עודכן עבור **כל** קובץ שנוצר/שונה תחת `agents_os_v3/` (למעט `node_modules/`)
- [ ] **אין** שינויים ב־`agents_os_v2/` ב־PR (FREEZE מוחלט)
- [ ] ריצה מקומית: `bash scripts/check_aos_v3_build_governance.sh` → `PASS`

**Iron Rule:** אי-עמידה = **FAIL** ב-review.

**log_entry | TEAM_191 | AOS_V3_FILE_INDEX_PR_CHECKLIST | PUBLISHED | 2026-03-27**

historical_record: true
