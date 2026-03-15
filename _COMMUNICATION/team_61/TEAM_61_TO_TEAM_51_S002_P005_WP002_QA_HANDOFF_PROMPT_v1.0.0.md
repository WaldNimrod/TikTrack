---
project_domain: AGENTS_OS
id: TEAM_61_TO_TEAM_51_S002_P005_WP002_QA_HANDOFF_PROMPT_v1.0.0
from: Team 61 (Cloud Agent / DevOps Automation)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 10, Team 190, Team 100, Team 00
date: 2026-03-10
historical_record: true
status: ACTIVE
work_package_id: S002-P005-WP002
handoff_type: GATE_3_IMPLEMENTATION_COMPLETE → GATE_4_QA_VERIFICATION
in_response_to: TEAM_10_TO_TEAM_61_S002_P005_WP002_DEVELOPMENT_AUTHORIZATION_v1.0.0
---

# פרומט קאנוני — S002-P005-WP002 Pipeline Governance (PASS_WITH_ACTION) — העברה לצוות 51

**Team 51, הנה הפרומט המפורט לביצוע QA על חבילת S002-P005-WP002 — Pipeline Governance (PASS_WITH_ACTION).**

---

## §1 מי מעביר ומי מקבל

| מ | אל | שלב שהושלם | שלב להפעלה |
|---|---|---|---|
| Team 61 | Team 51 | GATE_3 — Implementation (PASS_WITH_ACTION) | GATE_4 — QA Verification |

---

## §2 סקופ מלא — עדכונים שבוצעו

### 2.1 מקורות Design Lock

| מסמך | path |
|------|------|
| Design spec | `_COMMUNICATION/team_100/TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0.md` |
| Development auth | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_61_S002_P005_WP002_DEVELOPMENT_AUTHORIZATION_v1.0.0.md` |

### 2.2 קבצים שנגעו בהם

| קובץ | שינוי |
|------|-------|
| `agents_os_v2/orchestrator/state.py` | +`gate_state`, `pending_actions`, `override_reason` ב־PipelineState |
| `agents_os_v2/orchestrator/pipeline.py` | +`pass_with_actions`, `actions_clear`, `override`, `insist`; חסימת `pass` כאשר gate_state=PASS_WITH_ACTION |
| `pipeline_run.sh` | +4 פקודות: `pass_with_actions`, `actions_clear`, `override`, `insist` (domain-aware) |
| `agents_os/ui/js/pipeline-dashboard.js` | PWA banner ב-sidebar + כפתורים "Actions Resolved", "Override & Advance" (כולל prompt ל-reason) |
| `agents_os/ui/css/pipeline-dashboard.css` | 5 CSS classes: `.pwa-banner`, `.pwa-banner-title`, `.pwa-action-item`, `.pwa-btn-clear`, `.pwa-btn-override` |
| `agents_os/ui/js/pipeline-commands.js` | +`copyOverrideWithReason()` — prompt ל-reason לפני העתקת פקודת override |
| `agents_os_v2/observers/state_reader.py` | +`read_pipeline_state()` — parse `gate_state`, `pending_actions`, `override_reason` ל־STATE_SNAPSHOT.json |

---

## §3 רשימת בדיקות — AC-01..AC-08

### 3.1 AC-01 — pass_with_actions רושם state, gate לא מתקדם

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix

# הרץ pass_with_actions (domain: agents_os)
./pipeline_run.sh --domain agents_os pass_with_actions "fix-lint|add-test"

# בדוק state file
cat _COMMUNICATION/agents_os/pipeline_state_agentsos.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
assert d.get('gate_state')=='PASS_WITH_ACTION', 'gate_state should be PASS_WITH_ACTION'
assert 'fix-lint' in (d.get('pending_actions') or []), 'pending_actions should contain fix-lint'
"
```

**תוצאה נדרשת:** `gate_state=PASS_WITH_ACTION`, `pending_actions` מכיל את הפעולות, `current_gate` לא השתנה.

### 3.2 AC-02 — pass נכשל כאשר gate_state=PASS_WITH_ACTION

```bash
# אחרי AC-01 (state ב-PASS_WITH_ACTION):
./pipeline_run.sh --domain agents_os pass
echo $?
```

**תוצאה נדרשת:** exit code ≠ 0, הודעת שגיאה משמעותית (למשל "PASS_WITH_ACTION" או "actions_clear or override").

### 3.3 AC-03 — actions_clear מתקדם ומוחק pending_actions

```bash
./pipeline_run.sh --domain agents_os actions_clear

# בדוק state
cat _COMMUNICATION/agents_os/pipeline_state_agentsos.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
assert d.get('gate_state') is None or d.get('gate_state')!='PASS_WITH_ACTION'
assert not (d.get('pending_actions') or [])
"
```

**תוצאה נדרשת:** gate התקדם, `pending_actions` ריק, `gate_state` null או לא PASS_WITH_ACTION.

### 3.4 AC-04 — override מתקדם ומתעד override_reason

```bash
# הגדר state ל-PASS_WITH_ACTION (אם צריך):
./pipeline_run.sh --domain agents_os pass_with_actions "test-action"

# הרץ override
./pipeline_run.sh --domain agents_os override "Nimrod approved expedited close"

# בדוק state
cat _COMMUNICATION/agents_os/pipeline_state_agentsos.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
assert 'Nimrod' in (d.get('override_reason') or '')
"
```

**תוצאה נדרשת:** gate התקדם, `override_reason` מכיל את הטקסט.

### 3.5 AC-05 — Dashboard מציג PWA banner כאשר gate_state=PASS_WITH_ACTION

1. הגדר state ל־PASS_WITH_ACTION (למשל via `pass_with_actions`).
2. הפעל UI: `python3 -m http.server 8090` (משורש הרפו).
3. פתח `http://localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html`.
4. החלף ל-domain agents_os (או tiktrack אם state שם).

**תוצאה נדרשת:** banner צהוב "⚡ PASS_WITH_ACTION" מוצג ב-sidebar עם רשימת הפעולות.

### 3.6 AC-06 — כפתור "Actions Resolved" מפעיל actions_clear

1. עם state ב־PASS_WITH_ACTION, לחץ "✅ Actions Resolved".
2. פקודה מועתקת ל-clipboard (כולל `actions_clear`).

**תוצאה נדרשת:** הפקודה המועתקת מכילה `./pipeline_run.sh actions_clear` (או `./pipeline_run.sh --domain agents_os actions_clear`).

### 3.7 AC-07 — כפתור "Override & Advance" דורש reason ומפעיל override

1. עם state ב־PASS_WITH_ACTION, לחץ "⚡ Override & Advance".
2. prompt נפתח: "Override reason (required):".
3. הזן reason ולחץ OK.
4. פקודת override (עם ה-reason) מועתקת.

**תוצאה נדרשת:** prompt מופיע; ההעתקה כוללת `override "..."` עם ה-reason שהוזן.

### 3.8 AC-08 — state_reader מפרסר gate_state

```bash
python3 -m agents_os_v2.observers.state_reader

# בדוק STATE_SNAPSHOT
cat _COMMUNICATION/agents_os/STATE_SNAPSHOT.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
p=d.get('pipeline',{})
assert 'domains' in p or 'legacy' in p
for dom,info in p.get('domains',{}).items():
    if isinstance(info,dict) and 'error' not in info:
        assert 'gate_state' in info
"
```

**תוצאה נדרשת:** `STATE_SNAPSHOT.json` מכיל `pipeline.domains.*.gate_state` (או legacy).

---

## §4 Regression Tests (pytest)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini" --tb=short
```

**תוצאה נדרשת:** כל הטסטים הרלוונטיים עוברים (2 כשלים מוכרים ב־test_injection מותרים).

---

## §5 תוצר נדרש

**קובץ:** `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP002_QA_RESULT_v1.0.0.md`

**מבנה מוצע:**

```markdown
---
project_domain: AGENTS_OS
id: TEAM_51_S002_P005_WP002_QA_RESULT_v1.0.0
from: Team 51
to: Team 61, Team 10, Team 190
date: [תאריך]
status: QA_PASS | BLOCK_FOR_FIX
work_package_id: S002-P005-WP002
---

## תוצאות

| AC | Criterion | Result |
|----|-----------|--------|
| AC-01 | pass_with_actions records, gate holds | PASS / FAIL |
| AC-02 | pass fails when PASS_WITH_ACTION | PASS / FAIL |
| AC-03 | actions_clear advances + clears | PASS / FAIL |
| AC-04 | override advances + logs reason | PASS / FAIL |
| AC-05 | Dashboard PWA banner | PASS / FAIL |
| AC-06 | Actions Resolved button | PASS / FAIL |
| AC-07 | Override button + reason prompt | PASS / FAIL |
| AC-08 | state_reader gate_state | PASS / FAIL |
| Regression | pytest agents_os_v2 | PASS / FAIL |

## החלטה

QA_PASS → Team 10 לניתוב ל־GATE_5 / המשך lifecycle.
BLOCK_FOR_FIX → [רשימת תיקונים ספציפיים]
```

---

## §6 Closure Path

- **QA_PASS** → Team 10 מעדכן WSM, מנתב ל־GATE_5 (Team 90) או לסגירת lifecycle לפי roadmap.
- **BLOCK_FOR_FIX** → Team 61 מתקן את הממצאים ומגיש מחדש ל־Team 51.

---

## §7 מקורות

| מסמך | path |
|------|------|
| Design spec | `_COMMUNICATION/team_100/TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0.md` |
| Development auth | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_61_S002_P005_WP002_DEVELOPMENT_AUTHORIZATION_v1.0.0.md` |
| V2 Operating Procedures | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` |

---

**log_entry | TEAM_61 | S002_P005_WP002_QA_HANDOFF | ISSUED | 2026-03-10**
