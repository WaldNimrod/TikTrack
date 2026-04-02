---
id: TEAM_100_TO_TEAM_191_S003_P005_WP001_BACKUP_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Claude Code — Chief System Architect)
to: Team 191 (GitHub & Backup)
cc: Team 00 (Principal)
date: 2026-04-02
priority: HIGH
status: ACTIVE — execute immediately
work_package_id: S003-P005-WP001
subject: Full Backup — Pipeline Quality Plan v3.5.0 (S003-P005-WP001 complete cycle)
branch: aos-v3
push_target: origin/aos-v3
procedure_ref: TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.6.md
branch_mode_ref: TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0.md---

# מנדט גיבוי — S003-P005-WP001 Pipeline Quality Plan v3.5.0
## Team 191 — Git Governance & Backup

---

## 0. Context

S003-P005-WP001 (Pipeline Quality Plan v3.5.0) הושלם במלואו ואומת:
- Team 100 (Claude Code): מימוש מלא Phases 1–4
- Team 51 (Cursor): QA PASS — `133 passed, 42 skipped, 0 failed`
- Team 190 (OpenAI): Validation PASS — `TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.2.md`

כל הקוד והמסמכים קיימים **מקומית** ועדיין **לא בוצע commit ו-push**.
הגרסה המקומית על ענף `aos-v3` היא הגרסה הרשמית הפעילה.

**מטרת המנדט:** stage + commit + push של כל שינויי המושב הנוכחי ל-`origin/aos-v3`.

---

## 1. מצב Git הנוכחי (ממצא Team 100)

```
Branch: aos-v3
Local HEAD == origin/aos-v3 == 500e0a5feaf0e88535909552c770d0709d12a9f3
```

### Staged (כבר ב-index, מושבים קודמים):
~994 files (970 A + 21 M + 3 AM) — נצבר מאושבים קודמים, עדיין לא committed

### Unstaged modified (17 files) — **חייב staging:**
```
_COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.5.0.md
agents_os_v3/definition.yaml
agents_os_v3/governance/team_10.md
agents_os_v3/governance/team_11.md
agents_os_v3/modules/audit/ingestion.py
agents_os_v3/modules/definitions/models.py
agents_os_v3/modules/management/api.py
agents_os_v3/modules/management/use_cases.py
agents_os_v3/modules/prompting/builder.py
agents_os_v3/modules/state/machine.py
agents_os_v3/ui/app.js
agents_os_v3/ui/config.html
agents_os_v3/ui/index.html
agents_os_v3/ui/style.css
agents_os_v3/FILE_INDEX.json
agents_os_v3/pipeline_state.json
_COMMUNICATION/team_60/evidence/runtime/check_alert_conditions.launchd.stderr.log
```

### Untracked (18 files) — **חייב staging:**
```
_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_S003_P005_WP001_REVALIDATION_REQUEST_v1.0.1.md
_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_S003_P005_WP001_VALIDATION_REQUEST_v1.0.0.md
_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.0.md
_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.1.md
_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.2.md
_COMMUNICATION/team_51/TEAM_100_S003_P005_WP001_SELF_ASSESSMENT_EVIDENCE_v1.0.0.md
_COMMUNICATION/team_51/TEAM_100_TO_TEAM_51_PIPELINE_QUALITY_QA_MANDATE_v1.0.0.md
_COMMUNICATION/team_51/TEAM_100_TO_TEAM_51_S003_P005_WP001_QA_ACTIVATION_v1.0.0.md
_COMMUNICATION/team_51/TEAM_51_S003_P005_WP001_QA_VERDICT_v1.0.0.md
agents_os_v3/governance/team_20.md
agents_os_v3/governance/team_30.md
agents_os_v3/governance/team_40.md
agents_os_v3/governance/team_50.md
agents_os_v3/governance/team_51.md
agents_os_v3/governance/team_61.md
agents_os_v3/governance/team_70.md
agents_os_v3/governance/team_71.md
agents_os_v3/governance/team_90.md
```

**Plus this mandate file itself** — stage it too:
```
_COMMUNICATION/team_191/TEAM_100_TO_TEAM_191_S003_P005_WP001_BACKUP_MANDATE_v1.0.0.md
```

---

## 2. הוראות ביצוע — לפי TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.6.md

### שלב 1 — Pre-commit guards (§3 בנוהל)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix

bash scripts/lint_governance_dates.sh
python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check
python3 scripts/portfolio/build_portfolio_snapshot.py --check
bash scripts/lint_process_functional_separation.sh
```

**ציפיות:**
- `DATE-LINT`: PASS (או date-only warnings — לא blockers אם הם pre-existing)
- `SYNC CHECK`: PASS
- `SNAPSHOT CHECK`: PASS
- `PROCESS-FUNCTIONAL-SEPARATION`: PASS (verdict files נמצאים ב-team_190, team_51 — צפוי PASS)

**אם BLOCK על DATE-LINT:** בדוק אם ה-findings הם קבצים ישנים pre-existing (לא שינויים של מושב זה) — דווח ל-Team 100 לפני טיפול.

---

### שלב 2 — Stage כל השינויים

```bash
# Stage unstaged modified files
git add \
  "_COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.5.0.md" \
  "agents_os_v3/definition.yaml" \
  "agents_os_v3/governance/team_10.md" \
  "agents_os_v3/governance/team_11.md" \
  "agents_os_v3/modules/audit/ingestion.py" \
  "agents_os_v3/modules/definitions/models.py" \
  "agents_os_v3/modules/management/api.py" \
  "agents_os_v3/modules/management/use_cases.py" \
  "agents_os_v3/modules/prompting/builder.py" \
  "agents_os_v3/modules/state/machine.py" \
  "agents_os_v3/ui/app.js" \
  "agents_os_v3/ui/config.html" \
  "agents_os_v3/ui/index.html" \
  "agents_os_v3/ui/style.css" \
  "agents_os_v3/FILE_INDEX.json" \
  "agents_os_v3/pipeline_state.json"

# Stage untracked new files
git add \
  "_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_S003_P005_WP001_REVALIDATION_REQUEST_v1.0.1.md" \
  "_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_S003_P005_WP001_VALIDATION_REQUEST_v1.0.0.md" \
  "_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.0.md" \
  "_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.1.md" \
  "_COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_VALIDATION_VERDICT_v1.0.2.md" \
  "_COMMUNICATION/team_51/TEAM_100_S003_P005_WP001_SELF_ASSESSMENT_EVIDENCE_v1.0.0.md" \
  "_COMMUNICATION/team_51/TEAM_100_TO_TEAM_51_PIPELINE_QUALITY_QA_MANDATE_v1.0.0.md" \
  "_COMMUNICATION/team_51/TEAM_100_TO_TEAM_51_S003_P005_WP001_QA_ACTIVATION_v1.0.0.md" \
  "_COMMUNICATION/team_51/TEAM_51_S003_P005_WP001_QA_VERDICT_v1.0.0.md" \
  "agents_os_v3/governance/team_20.md" \
  "agents_os_v3/governance/team_30.md" \
  "agents_os_v3/governance/team_40.md" \
  "agents_os_v3/governance/team_50.md" \
  "agents_os_v3/governance/team_51.md" \
  "agents_os_v3/governance/team_61.md" \
  "agents_os_v3/governance/team_70.md" \
  "agents_os_v3/governance/team_71.md" \
  "agents_os_v3/governance/team_90.md" \
  "_COMMUNICATION/team_191/TEAM_100_TO_TEAM_191_S003_P005_WP001_BACKUP_MANDATE_v1.0.0.md"

# Also include log entry if present
git add "_COMMUNICATION/team_60/evidence/runtime/check_alert_conditions.launchd.stderr.log" 2>/dev/null || true
```

**Verify staging:**
```bash
git diff --cached --stat | tail -5
# Expected: ≥ 1015 files changed
```

---

### שלב 3 — Commit

```bash
git commit -m "$(cat <<'EOF'
feat(aos-v3): S003-P005-WP001 Pipeline Quality Plan v3.5.0 — full implementation

Phases 1–4 complete. Team 51 QA PASS (133/0). Team 190 Validation PASS.

Changes:
- CANONICAL_AUTO mode: BlockingFindingV1 + StructuredVerdictV1 + FeedbackIngestBody
- route_recommendation: Mode A strict (Literal doc|impl|arch, full→422)
- _normalise_route_rec: Mode B/C/D full→impl, case-insensitive, applied at lines 332+360
- §E auto-advance: CANONICAL_AUTO only, eligible gates GATE_0/GATE_1/GATE_1.1
- APScheduler Layer 2 scan: coalesce=True, max_instances=1
- SHA-256 full-file fingerprint (_file_fingerprint)
- Token budget: section-based trim L1/L2, meta-only L3/L4, approx_tokens in meta
- SSE feedback banner (index.html + style.css + app.js)
- Governance matrix: GET /api/governance/status (routed_without_governance=0)
- GET /api/feedback/stats + GET /api/runs/{id}/context + GET /api/teams/{id}/context
- Config tab: governance matrix + polling interval control
- WP ID validation: _WP_ID_CANONICAL_RE + _WP_ID_ULID_RE (20-26 char)
- Governance files: team_10/11/20/30/40/50/51/61/70/71/90.md
- definition.yaml: TRIGGER PROTOCOL in GATE_0, GATE_1 (1.1+1.2), GATE_2
- QA/Validation artifacts: team_51 verdict, team_190 verdict v1.0.2
EOF
)"
```

---

### שלב 4 — Push

```bash
git push origin aos-v3
```

**Expected output:** כולל `500e0a5fe..{new_sha}  aos-v3 -> aos-v3`

---

### שלב 5 — Verify

```bash
git log --oneline -3
git status --short | wc -l
# Expected: ≤ 18 remaining (untracked files not in this mandate, e.g. temp files)
```

---

## 3. דיווח נדרש

צור קובץ:
`_COMMUNICATION/team_191/TEAM_191_S003_P005_WP001_BACKUP_RESULT_v1.0.0.md`

```
## Result
- guards: PASS / WARN (detail) / BLOCK (detail)
- commit_sha: {sha}
- files_committed: N
- push: SUCCESS
- remote: origin/aos-v3
- log: git log --oneline -1 output
```

---

## 4. הנחיות מיוחדות

### ⚠️ אין לגעת ב-main
ענף `aos-v3` בלבד. אין merge ל-`main` כעת — פעולה זו תיעשה בנפרד לאחר השלמת הפרויקט (CLEANUP_REPORT + data migration).

### ⚠️ אין לעדכן WSM/SSM
Team 191 אינו מעדכן PHOENIX_MASTER_WSM_v1.0.0.md — זה בסמכות Team 00 בלבד.

### ⚠️ פקודות git add ספציפיות
אין להשתמש ב-`git add .` או `git add -A` — stage רק הקבצים המפורטים בסעיף 2.

### DATE-LINT tolerance
קבצים ישנים עם תאריכים מחוץ לחלון (pre-existing מלפני מושב זה) = WARN, לא BLOCK לצרכי מנדט זה — דווח אבל המשך.

---

**log_entry | TEAM_100 | BACKUP_MANDATE_ISSUED | S003-P005-WP001 | TO_TEAM_191 | 2026-04-02**
