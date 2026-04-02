# TEAM 191 INTERNAL WORK PROCEDURE v1.0.6

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.6
**owner:** Team 191 (child team of Team 190)
**date:** 2026-03-30
**status:** ACTIVE
**supersedes:** `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.5.md`
**authority_source:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

---

## 1) Mission

Team 191 is the operational Git-governance lane.
Purpose: remove technical blockers to commit/push flow while preserving governance integrity and clean-tree discipline.

---

## 2) Scope

### In Scope

1. Pre-push guard triage and remediation (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`).
2. Date/header/historical_record normalization for governance/communication markdown.
3. Registry/WSM mirror standardization using canonical sync scripts.
4. Snapshot refresh and re-check sequencing.
5. Clean-tree enforcement and drift reporting.
6. Process-functional separation guard check (`PROCESS-FUNCTIONAL-SEPARATION`) for functional verdict artifacts (`team_190`, `team_90`, `team_50`, `team_51`).

### Out of Scope

1. Constitutional gate verdicts (Team 190 only).
2. Architectural rulings (Team 00/100 only).
3. Business-logic/code behavior changes under a "Git fix" mandate.
4. Policy semantic overrides without explicit ruling.

---

## 3) Operating Sequence

1. Run baseline checks (`git status`, relevant guard checks), including:
   - `bash scripts/lint_governance_dates.sh`
   - `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check`
   - `python3 scripts/portfolio/build_portfolio_snapshot.py --check`
   - `scripts/lint_process_functional_separation.sh` (`PASS`/`WARN`/`BLOCK`)
2. Classify failure lane:
   - `DATE-LINT`
   - `SYNC CHECK`
   - `SNAPSHOT CHECK`
   - `PROCESS-FUNCTIONAL-SEPARATION`
   - `HOOK TEST FAILURE`
   - `OTHER`
3. Apply only lane-appropriate remediation.
4. Re-run full guard sequence.
5. If PASS: hand off with concise closure summary.
6. If still blocked: escalate with evidence-by-path and concrete unblock options.

---

## 4) Escalation Matrix

| Condition | Escalate To | Required Output |
|---|---|---|
| Policy ambiguity / semantic conflict | Team 190 | BLOCK report with options and recommendation |
| Domain ownership conflict | Team 10 + Team 190 | Routing clarification request |
| Architectural contradiction | Team 00/100 via Team 190 | Structured clarification request |
| Repeated blocker >2 remediation cycles | Team 190 | Root-cause report + corrective procedure proposal |

---

## 5) Evidence Format

Every Team 191 closure note must include:

1. `overall_result: PASS | PASS_WITH_ACTIONS | BLOCK`
2. `checks_run` with outcomes
3. `files_changed` list
4. `remaining_risks` (if any)
5. `next_action_owner`

---

## 6) Iron Rules

1. Never bypass hooks/guards unless explicitly mandated by Team 00/190.
2. Never hide drift; always report unresolved deltas.
3. Never mix semantic architecture changes into Git-ops fixes.
4. Keep remediation minimal, reversible, and evidence-backed.
5. Use exact dates in every new canonical message.
6. Never auto-remediate content violations in `PROCESS-FUNCTIONAL-SEPARATION` lane; report exact `file:line` and block only.
7. **IRON RULE — `agents_os_v3` pytest (Team 00 canonical feedback 2026-03-29):**
   - Every full run of `agents_os_v3/tests/` for Team 191 sign-off **must** set:
     `AOS_V3_E2E_RUN=1` and `AOS_V3_E2E_HEADLESS=1`.
   - **"Green full"** for this suite = **141 passed, 0 skipped, 0 failed** only.
   - Outcomes such as `107 passed, 22 skipped` are **NOT PASS** — must be reported as partial.

---

## 7) Mandatory Operational Character (Binding)

1. Team 191 must treat date-related push blockers as first-class recurring failures and remediate them immediately.
2. Classical mandatory remediation set for `DATE-LINT`:
   - normalize future dates to current UTC guard day,
   - add missing `date` headers in governance/communication markdown,
   - add `historical_record: true` for intentional historical documents.
3. In push/commit blocker events, Team 191 default behavior is remediation-first (not escalation-first) when fix is deterministic and non-semantic.
4. Team 191 must continuously capture recurring blocker patterns and fold them into this procedure as reusable remediation playbooks.
5. Objective is stable flow reliability: unblock commit/push while preserving content intent and governance integrity.
6. `PROCESS-FUNCTIONAL-SEPARATION` lane playbook (mandatory):
   - Symptoms: `owner_next_action` section/field found in `_COMMUNICATION/team_190/`, `team_90/`, `team_50/`, or `team_51/`.
   - Remediation policy: Team 191 does **not** modify issuing-team verdict content for this lane.
   - Team 191 action: return `BLOCK` with exact `file:line` findings using `scripts/lint_process_functional_separation.sh`.
   - Escalation routing:
     - issuing team = Team 190 -> escalate to Team 190 first.
     - unresolved constitutional conflict -> escalate to Team 00 via Team 190.

---

## 8) Language Lock (Binding)

1. Team 191 user-facing responses are in Hebrew by default.
2. Technical command tokens remain in English monospace for operational precision (for example: `git status`, `DATE-LINT`, `push`).
3. Fixed translation lock for recurring Git operations:
   - `commit` = קומיט מקומי
   - `push` = דחיפה לענף האינטגרציה `origin/codex/team191-integration`
   - `merge` = מיזוג מ-`codex/team191-integration` ל-`main` דרך PR
   - `DATE-LINT` = תקינות תאריכים בקבצי governance/communication
   - `SYNC CHECK` = סנכרון WSM/Registries
   - `SNAPSHOT CHECK` = תקינות snapshot artifacts
4. Language lock applies to all Team 191 operational summaries, escalation prompts, and closure contracts unless the user explicitly requests another language.
5. Canonical Hebrew command aliases (binding):
   - `191 עזרה` = `191 ?`
   - `191 קומיט` = `191 commit`
   - `191 פוש` = `191 push`
   - `191 מארג` = `191 merge`
   - `191 מיזוג` = `191 merge`
   - `191 סטטוס` = `191 status`
   - `191 בדיקה` = `191 checks`
   - `191 בדיקות` = `191 checks`
   - `191 נקי` = `191 clean`
   - `191 סנכרון` = `191 sync`
   - `191 בדיקת מיזוג` = `191 merge check`
   - `191 תיקון` = `191 fix`
   - `191 פוש מהיר` = `191 push quick`
   - `191 פוש בטוח` = `191 push safe`
   - `191 פוש מחמיר` = `191 push strict`
   - `191 מיזוג מהיר` = `191 merge quick`
   - `191 מיזוג בטוח` = `191 merge safe`
   - `191 מיזוג מחמיר` = `191 merge strict`
6. Optional message payload syntax (binding):
   - pattern: `<191-command> ? <free_text>`
   - purpose: user-provided title/prefix for commit / push / merge messages.
   - examples:
     - `191 קומיט ? השינוי שביצענו כרגע הוא מעולה`
     - `191 פוש ? סבב סגירה לולידציה`
     - `191 מארג ? איחוד סופי למיין`

---

## 9) Base Prompt Lock: `191 ?` (Binding)

1. Trigger: exact prompt `191 ?` (or `191?`) or alias `191 עזרה`.
2. Required behavior: always return the Team 191 command options menu; do not execute Git actions in this help mode.
3. Menu content is mandatory and stable:
   - `191 status` / `191 סטטוס` — show current Git/governance blocker status only.
   - `191 checks` / `191 בדיקות` / `191 בדיקה` — run guard suite only (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`, `PROCESS-FUNCTIONAL-SEPARATION`, merge-readiness checks) without push/merge.
   - `191 clean` / `191 נקי` — normalize to clean working tree via deterministic commit/remediation actions (no push).
   - `191 sync` / `191 סנכרון` — fetch/rebase synchronization lane for integration branch readiness.
   - `191 commit` / `191 קומיט` — create context-aware local commit message and commit all intended updates.
   - `191 commit ? <text>` / `191 קומיט ? <text>` — same flow with user text as message prefix.
   - `191 push` / `191 פוש` — run default `SAFE` push flow (guard checks + deterministic remediation + push).
   - `191 push ? <text>` / `191 פוש ? <text>` — same flow with user text as push/remediation message prefix.
   - `191 merge` / `191 מארג` / `191 מיזוג` — run canonical merge flow from `codex/team191-integration` to `main` (PR create/check/merge/verify).
   - `191 merge check` / `191 בדיקת מיזוג` — check-only lane (PR/checks/permissions), no merge side-effect.
   - `191 merge ? <text>` / `191 מארג ? <text>` / `191 מיזוג ? <text>` — same flow with user text as PR/merge title prefix.
   - `191 fix` / `191 תיקון` — correction loop lane: run `checks` -> remediate deterministic blockers -> re-check until clean/pass or explicit BLOCK.
   - `191 fix ? <text>` / `191 תיקון ? <text>` — same loop with user text as remediation commit/report prefix.
   - `191 push quick` / `191 פוש מהיר` — minimal flow (fast path; lower hygiene).
   - `191 push safe` / `191 פוש בטוח` — default balanced flow (recommended).
   - `191 push strict` / `191 פוש מחמיר` — maximal hygiene flow (deep checks, slower).
   - `191 merge quick` / `191 מיזוג מהיר` — verify branch sync + open PR/create PR, without auto-merge attempt.
   - `191 merge safe` / `191 מיזוג בטוח` — default merge flow (recommended): create/reuse PR, verify mergeability and required checks, then merge.
   - `191 merge strict` / `191 מיזוג מחמיר` — safe flow + post-merge verification (`origin/main` SHA, PR merged metadata, rules compliance evidence).
4. If mode is not specified, default mode is `SAFE`.
5. `191 merge` blocker contract (mandatory):
   - If PR write permission is missing (`pull_requests=write`) or merge is blocked by repo rules/checks, return `BLOCK` with exact blocker list and owner action.
   - Team 191 must not bypass branch protection by direct push to `main`.
6. Every `191 ?` response must include short pros/cons per mode to preserve consistent operator guidance.
7. Every `191 ?` response must include the locked Hebrew↔English command translation map.
8. Optional payload application rule:
   - If payload is provided after `?`, Team 191 must use it as a title/prefix when generating commit subject / remediation commit subject / PR title / merge report headline.
   - If payload is missing, Team 191 uses automatic context-derived naming (current default behavior).
9. `191 fix` loop contract (mandatory):
   - start with `191 checks`;
   - apply deterministic non-semantic remediations only (DATE-LINT / SYNC / SNAPSHOT / hook failures);
   - for `PROCESS-FUNCTIONAL-SEPARATION`: do not auto-fix content, return `BLOCK` with exact owner routing;
   - run `191 checks` again;
   - repeat until either:
     - `PASS`: guards pass and working tree is clean, or
     - `BLOCK`: non-deterministic/permission/policy blocker remains with exact owner routing.
10. Recommended operation sequence for `191 ?` output (mandatory):
   - quick diagnosis: `191 status` -> `191 checks`
   - auto-remediation loop: `191 fix` (or `191 תיקון`)
   - persist local result: `191 commit` (or `191 קומיט`)
   - publish integration branch: `191 push` (or `191 פוש`)
   - complete to `main`: `191 merge` (or `191 מארג` / `191 מיזוג`)
11. Bilingual lock (mandatory):
   - every command listed in `191 ?` must be displayed with both English and Hebrew names.

---

## 10) Setup Lock (One-Time + Session)

1. One-time repository Git setting (mandatory):
   - `git config push.default upstream`
   - target effect: `191 push` can run `git push origin` without branch-name mismatch failures.
2. Branch lock for Team 191 operation:
   - local branch: `main`
   - upstream target: `origin/codex/team191-integration`
   - no direct push lane to `origin/main`.
3. Session token loading for GitHub API actions:
   - token file path: `/tmp/team191_github_token`
   - loader pattern: `TOKEN="$(cat /tmp/team191_github_token)"`
4. Mandatory fine-grained PAT permissions for full `191 merge` lane:
   - `Pull requests: Read and write` (required for create/merge PR)
   - `Contents: Read and write`
   - `Metadata: Read-only`
   - `Administration: Read and write` (required when branch/rules settings changes are in scope)
5. Merge guard:
   - if API returns `Resource not accessible by personal access token` or header requires `pull_requests=write`,
     Team 191 returns `BLOCK` and routes owner to token-scope remediation.

---

## §הגנה לפני קומיט (חובה) / §PRE-COMMIT GUARD (MANDATORY)

**Must run before every `191 קומיט` and `191 פוש` invocation.**
A failed guard BLOCKS the commit. Team 191 reports the failure to Nimrod and
waits for instruction — never bypasses.

```bash
# Step 1 — SSOT consistency check (both domains)
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# Required: ✓ CONSISTENT on both
# If drift: run ./pipeline_run.sh wsm-reset FIRST, then re-check

# Step 2 — WP099 contamination check
grep -c "WP099" documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
# Required: output = 0
# If output > 0: git checkout HEAD -- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
#                then re-run Step 1

# Step 3 — Show pending changes for review
git status
# Required: review output — no unexpected files
# NEVER commit: *.env, credentials, *.key, pipeline_state_*.json (unless explicitly instructed)
```

**Iron Rule — git add scope:**
- NEVER use `git add -A` or `git add .`
- ALWAYS use targeted `git add <specific-paths>` based on the changes being committed
- When unsure which paths to add: show `git status` output to Nimrod and wait

**Iron Rule — git merge:**
- NEVER execute `git merge` unless Nimrod provides the exact branch name and confirms
- Merging without context is strictly prohibited

**Iron Rule — git push --force:**
- NEVER. Under any circumstances.

**Operational wrapper (mandatory default for guarded commits):** `bash scripts/safe_commit.sh "<message>" <path1> [path2] ...`
Dry-run (guards + `git status` only): `bash scripts/safe_commit.sh`

**ענף `aos-v3` — SSOT:** ב-`scripts/safe_commit.sh`, כאשר `git branch --show-current` הוא `aos-v3`, בדיקת SSOT (שלב 1) **מדולגת** אוטומטית (הענף אינו תמיד מסונכרן עם WSM הראשי). עדיין ניתן לאלץ בדיקה עם `SAFE_COMMIT_FORCE_SSOT=1`. על `main` / ענפים אחרים — SSOT נשאר חוסם כרגיל (או `SKIP_SSOT_CHECK=1` למצבי חירום).

---

## §COMMIT

> **⚠️ Pre-commit guard must pass before this step. See §PRE-COMMIT GUARD.**

Subject lines and process-ID rules: see **§11) Process-ID Title Lock**.

---

## 11) Process-ID Title Lock (Binding)

1. Every `191 commit` and `191 push` output must use a canonical process identifier as the main title prefix.
2. Canonical detection pattern:
   - full: `S[0-9]{3}[_-]P[0-9]{3}[_-]WP[0-9]{3}([_-]GATE[0-9A-Z]+)?`
   - partial valid forms: `S[0-9]{3}[_-]P[0-9]{3}[_-]WP[0-9]{3}`, `S[0-9]{3}[_-]P[0-9]{3}`, `S[0-9]{3}`
3. Normalization lock:
   - convert to uppercase
   - convert separators to underscore (`_`)
   - canonical target example: `S002_P005_WP002_GATE6`
4. Detection source priority:
   - changed file paths
   - changed file contents
   - staged and unstaged deltas together
5. Specificity priority (binding):
   - `S_P_WP_GATE` > `S_P_WP` > `S_P` > `S`
6. Team 191 must use the canonical detector:
   - `scripts/team191_detect_process_id.sh`
7. Commit subject lock:
   - default: `<PROCESS_ID>: Team 191 — <context>`
   - with payload: `<PROCESS_ID>: <payload>`
   - When AOS v3 commits occur during an active tiktrack pipeline run (states `IN_PROGRESS`, `CORRECTION`, `PAUSED`), append suffix last: `<PROCESS_ID>: <description> [run: <8chars>]` — see §15.5 and `scripts/suggest_run_suffix.sh`.
8. Push report / handoff headline lock:
   - default: `<PROCESS_ID>: Team 191 Push Report`
   - with payload: `<PROCESS_ID>: <payload>`
9. Fallback if no process id is detected:
   - `TEAM_191_FLOW`

---

## 12) Concurrent Changes Lock (Binding)

1. In this repository, parallel incoming changes during Team 191 execution are a normal operating condition.
2. Team 191 must not auto-stop solely because new non-overlapping local changes appeared while running commit/push/merge lanes.
3. Default behavior is continuity:
   - keep current remediation/publish cycle active,
   - include newly arrived non-conflicting artifacts in the next deterministic commit cycle.
4. Stop/escalate only when one of the following is true:
   - same-file overlap that creates overwrite risk,
   - canonical authority collision (`WSM`, registries, roadmap/contracts) that can produce semantic ambiguity.
5. Mixed-scope classification in pre-push guard is informational by default and not a blocker on its own.
6. Clean-tree target remains mandatory:
   - if concurrent changes arrive after a merge/pull, Team 191 starts the immediate next closure mini-cycle until tree is clean again.
7. This lock is permanent unless superseded by explicit Team 190/Team 00 ruling.

---

## 13) Continuous-Flow Default (Binding)

1. Default mode for Team 191 is `CONTINUOUS_FLOW` (not stop-and-wait).
2. At the beginning of each cycle, Team 191 defines a **cycle anchor**:
   - `cycle_anchor_sha = HEAD`
   - all remediation/commit/push/merge actions are executed against this cycle scope.
3. If new changes arrive during the cycle and are non-conflicting:
   - do not stop,
   - include them in the same cycle when deterministic and safe,
   - otherwise mark them as `NEXT_CYCLE_QUEUE` and continue closing current cycle.
4. End-of-cycle rule (loop breaker):
   - after successful merge to `main`, Team 191 reports `CYCLE_CLOSED` immediately,
   - Team 191 does **not** auto-expand the just-closed report with fresh post-merge deltas.
5. Post-merge deltas handling:
   - any new local/remote deltas after `CYCLE_CLOSED` open a new explicit cycle id (`CYCLE+1`),
   - new cycle starts from a new anchor and follows the same flow.
6. Pull discipline for deterministic closure:
   - perform `fetch/rebase/pull` only inside an active cycle where publication is still pending,
   - avoid extra `pull` after closure report unless user explicitly asks to start next cycle now.
7. Runtime-generated evidence/log files are valid carry-forward inputs:
   - they are not considered anomalies,
   - they are committed in the next available deterministic cycle unless policy says otherwise.
8. Success definition under continuous flow:
   - cycle checks PASS,
   - push/PR/merge for the cycle completed,
   - local tree clean at cycle close checkpoint.

---

## 14) Permission + Efficiency Lock (Binding)

1. Team 191 must run recurring GitHub network operations through short canonical commands/scripts only.
2. Forbidden pattern for recurring operations:
   - long one-line wrappers with `/bin/zsh -lc` that include polling loops and large JSON dumps.
3. Required execution pattern:
   - direct `curl -sS` calls for single API actions,
   - `scripts/team191_poll_pr_checks.sh` for CI polling,
   - `scripts/team191_merge_pr.sh` for wait+merge+verify flow.
4. Polling budget lock (default):
   - `max_polls=12`,
   - `sleep_sec=5`,
   - output only poll summary per iteration,
   - output full checks table once at the end.
5. Hook verification lock:
   - run `.git/hooks/pre-commit` only on explicit `HOOK TEST FAILURE` lane or as part of actual commit execution,
   - do not run hook repeatedly when no hook failure is present.
6. Approval persistence lock (Codex):
   - for recurring commands, operator must choose `Yes, and don't ask again` (Option 2) once per command family.
7. If token/auth is missing, Team 191 returns `BLOCK` immediately with exact owner action (no retry loops).
8. All optimizations in this section are non-semantic and are mandatory for token-efficient continuous operation.

---

## 15) AOS v3 Git overlay — binding (Team 00 canonical)

**מקור סמכות:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0.md` (מכסה גם סגירת `PENDING_TEAM_100_SIGNOFF`).

**מסמך מצב ענף:** `_COMMUNICATION/team_191/TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0.md` — **סטטוס: `APPROVED`** (הפניה לקנוני Team 00 לעיל).

### 15.1 פרמטרים מחייבים (מסלול AOS v3)

| נושא | ערך |
|------|-----|
| ענף עבודה | `aos-v3` |
| upstream | `origin/aos-v3` (ישיר; ללא `codex/team191-integration` במסלול זה) |
| פיפליין | לא בשימוש לפרויקט v3 בתקופה זו |
| `agents_os_v2/` | **FREEZE** — אין שינויים; אכיפה: `scripts/lint_aos_v3_file_index_and_v2_freeze.sh` (pre-commit) + `scripts/check_aos_v3_build_governance.sh` (BUILD) |
| `agents_os_v3/` | כל קובץ חייב רישום ב־`agents_os_v3/FILE_INDEX.json` לפני commit — אכיפה כנ"ל |
| סיום | איחוד ל־`main` לפי `TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0` §4 (כולל CLEANUP_REPORT) |

### 15.2 מנגנוני אכיפה (Team 191)

1. **Pre-commit (נבחר — אפשרות A):** hook ריפו `phoenix-aos-v3-file-index-v2-freeze` → `scripts/lint_aos_v3_file_index_and_v2_freeze.sh`
2. **כל BUILD (191-B):** `bash scripts/check_aos_v3_build_governance.sh` — בדיקת FREEZE ל־`agents_os_v2/` בטווח קומיטים **רק בענף `aos-v3`**; ב־`main` מוצג `INFO` ודילוג; אכיפת שינויי v2 ב-working tree נשארת ב־pre-commit אם מבוצעים `git add` ל־`agents_os_v2/`.
3. **Fallback (אפשרות B):** רשימת PR — `_COMMUNICATION/team_191/AOS_V3_FILE_INDEX_PR_CHECKLIST.md`

### 15.3 מחוץ למסלול v3

עבודה על `main` / TikTrack / מסלולים שאינם AOS v3: §10 נשאר כפי שהוא; אכיפת FREEZE על `agents_os_v2/` ו־FILE_INDEX ל־`agents_os_v3/` חלה על **כל קומיט** שיגע בנתיבים אלה (Iron Rule).

### 15.4 FILE_INDEX auto-update procedure (v1.0.6 — binding)

**בעיה:** כל קובץ חדש ב-`agents_os_v3/` שלא נרשם ב-`FILE_INDEX.json` חוסם commit בגלל governance hook.

**כלי:** `scripts/update_aos_v3_file_index.py` — סורק דיסק ומוסיף stub entries חסרים אוטומטית.

**נוהל מחייב:**

```bash
# לפני כל commit שמוסיף קבצים חדשים ל-agents_os_v3/
python3 scripts/update_aos_v3_file_index.py
# → "FILE_INDEX.json is up to date" = ניתן להמשיך לcommit
# → "Added N entries" = לעדכן spec_ref + owner_team ביד, ואז לcommit

# אחרי הרצת הסקריפט — לאמת שה-governance check עובר:
bash scripts/check_aos_v3_build_governance.sh  # → PASS
```

**Pre-commit hook (non-blocking):** hook `phoenix-aos-v3-file-index-auto-update` ב-`.pre-commit-config.yaml` מריץ את הסקריפט כאשר קבצים תחת `agents_os_v3/` נכללים בקומיט (מסנן `files: '^agents_os_v3/'` — **לא** מוגבל ל-`types: python`). אם הסקריפט מוסיף entries — יש לעיין בהם ולהוסיף את `agents_os_v3/FILE_INDEX.json` ל-staging לפני commit.

**הגבלות:**
- הסקריפט מוסיף רק stub entries (`status: NEW`, `spec_ref: AUTO`).
- יש לעדכן ידנית `spec_ref`, `owner_team`, `added_in_gate` בכל entry שנוסף.
- הסקריפט לא מסיר entries ישנים — מחיקה ידנית בלבד.

### 15.5 Active Run commit convention (v1.0.6 — binding)

**כלל:** commit שמשנה `agents_os_v3/` בזמן שדומיין **tiktrack** במצב `IN_PROGRESS` / `CORRECTION` / `PAUSED` צריך suffix אחרון בשורת הנושא:

```
[run: <run_id_prefix_8_chars>]
```

**פורמט קנוני מול §11:** `<PROCESS_ID>: <תיאור> [run: <8chars>]` (ה-suffix תמיד אחרון).

**דוגמה:**
```
S003_P005_GATE_0: AOS v3 fix domain slug resolution [run: 01KMX6Q8]
```

**מקור אמת לזיהוי מקומי (לא GET):** `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` — ראה החלטות מלאות ב-`_COMMUNICATION/team_00/TEAM_00_TO_TEAM_191_SECTION_15_5_ARCHITECTURAL_ANSWERS_v1.0.0.md`.

**עזר:** `bash scripts/suggest_run_suffix.sh` — מדפיס את ה-suffix המוצע (או כלום אם אין ריצה פעילה / קובץ חסר).

**אכיפה:** לא חוסמת אוטומטית. **Advisory (opt-in):** ניתן להתקין hook מקומי — ראו `scripts/git-hooks/README.md` (העתקה ל-`.git/hooks/prepare-commit-msg`).

**משוב קנוני:** `_COMMUNICATION/team_191/TEAM_00_TO_TEAM_191_CANONICAL_FEEDBACK_v1.0.0.md`.

### 15.6 אימות pytest מלא ל-`agents_os_v3` (binding)

כל אישור Team 191 על "ירוק מלא" לסוויט `agents_os_v3/tests/` חייב לכלול ריצה עם:

```bash
AOS_V3_E2E_RUN=1 AOS_V3_E2E_HEADLESS=1 PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -q
```

**ציפייה:** `141 passed` — **אין** דילוג על 22 בדיקות E2E. קובץ טסט חדש חייב `pytest <path> -v --tb=short` עם 0 failed לפני קומיט.

---

**log_entry | TEAM_190 | TEAM_191_INTERNAL_WORK_PROCEDURE | CREATED_AND_ACTIVATED | 2026-03-11**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | DATE_LINT_RECURRING_PATTERN_POLICY_LOCKED | 2026-03-11**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | HEBREW_LANGUAGE_LOCK_AND_191_HELP_PROMPT_LOCKED | 2026-03-11**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | PROCESS_ID_TITLE_LOCK_ADDED_v1_0_1 | 2026-03-15**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | CONCURRENT_CHANGES_ARE_NORMAL_LOCK_ADDED | 2026-03-15**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | CONTINUOUS_FLOW_DEFAULT_LOCK_ADDED | 2026-03-15**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | PERMISSION_AND_TOKEN_EFFICIENCY_LOCK_ADDED_v1_0_2 | 2026-03-15**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | PROCESS_FUNCTIONAL_SEPARATION_LANE_ADDED_v1_0_3 | 2026-03-15**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | PRE_COMMIT_GUARD_SAFE_COMMIT_MANDATE_TEAM100 | 2026-03-24**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | AOS_V3_OVERLAY_SECTION_15_v1_0_4 | 2026-03-27**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | FILE_INDEX_AUTO_UPDATE_AND_RUN_SUFFIX_CONVENTION_v1_0_5 | 2026-03-29**
**log_entry | TEAM_191 | TEAM_191_INTERNAL_WORK_PROCEDURE | v1_0_6_FILE_INDEX_TRIGGER_E2E_141_SAFE_COMMIT_AOS_V3_SSOT | 2026-03-29**

historical_record: true
