---
id: TEAM_00_AOS_V3_GOVERNANCE_STRUCTURE_ANALYSIS_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
date: 2026-03-25
status: PENDING_NIMROD_APPROVAL
type: ARCHITECTURAL_ANALYSIS
subject: ניתוח מצב קבצי ממשל + SSOT — בעיות קיימות + מבנה מוצע ל-v3---

# ניתוח מבנה ממשל + SSOT — AOS v3

---

## חלק א — מיפוי המצב הנוכחי

### א.1 קבצי ממשל — היכן הם נמצאים היום

| סוג קובץ | מיקום | שייך ל | הערה |
|---|---|---|---|
| Iron Rules, Constitution | `docs-governance/01-FOUNDATIONS/` | **משותף** | ✅ נכון |
| WSM, SSM, Roadmap, Registry | `docs-governance/01-FOUNDATIONS/` | **משותף** | ✅ נכון |
| Gate Model Protocol | `docs-governance/01-FOUNDATIONS/` | **משותף** | ✅ נכון |
| TEAMS_ROSTER.json | `docs-governance/01-FOUNDATIONS/` | **משותף** | ✅ נכון |
| Shared Policies | `docs-governance/02-POLICIES/` | **משותף** | ✅ נכון |
| **AOS-specific governance** | `docs-governance/AGENTS_OS_GOVERNANCE/` | ❌ **AOS בלבד** | בתיקייה משותפת — שגוי |
| **AOS operating procedures** | `docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES` | ❌ **AOS בלבד** | בתיקייה משותפת — שגוי |
| **TikTrack team runbooks** | `docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK` | ❌ **TikTrack בלבד** | בתיקייה משותפת — שגוי |
| AOS architecture docs | `docs-agents-os/01-OVERVIEW + 02-ARCHITECTURE` | AOS | ✅ נכון |
| AOS procedures | `docs-agents-os/04-PROCEDURES/` | AOS | ✅ נכון (README only) |
| TikTrack architecture | `docs-system/01-ARCHITECTURE/` | TikTrack | ✅ נכון |
| TikTrack product | `docs-system/08-PRODUCT/` | TikTrack | ✅ נכון |
| **TikTrack conventions** | `agents_os_v2/context/conventions/backend.md` | ❌ **TikTrack** | בתוך קוד AOS — שגוי |
| Team identity (runtime) | `agents_os_v2/context/identity/team_XX.md` | AOS runtime | ⚠️ ראה ניתוח ב.3 |
| Team identity (governance) | `docs-governance/01-FOUNDATIONS/TEAMS_ROSTER.json` | משותף | ⚠️ ראה ניתוח ב.3 |
| Team identity (UI) | `agents_os/ui/js/pipeline-teams.js` | AOS UI | ⚠️ ראה ניתוח ב.3 |

---

### א.2 שלוש בעיות ממשל קיימות

#### בעיה 1 — דימום AOS לתוך ממשל משותף

```
docs-governance/
├── AGENTS_OS_GOVERNANCE/        ← ❌ זה AOS-specific, לא משותף
│   └── 02-TEMPLATES/
└── 04-PROCEDURES/
    ├── AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md  ← ❌ AOS-specific
    └── TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md       ← ❌ TikTrack-specific
```

**השפעה:** מי שקורא `docs-governance/` כממשל משותף מקבל תוכן שמתייחס רק לאחד הדומיינים. צוות חדש שמצטרף לא יכול לדעת מה שייך לו.

#### בעיה 2 — קונבנציות TikTrack בתוך קוד AOS

```
agents_os_v2/context/conventions/
├── backend.md     ← TikTrack tech stack, API patterns
├── frontend.md    ← TikTrack UI conventions
└── constraints.md ← TikTrack constraints
```

קבצים אלה מוזרקים כ-context לצוותי TikTrack בזמן ריצה — אבל הם חיים בתוך תיקיית הקוד של AOS. כשנבנה AOS v3, האם הם ייכנסו ל-`agents_os_v3/`? זה יצור שוב את אותה בעיה.

#### בעיה 3 — שלוש ייצוגים של הגדרות צוות (SSOT שלוש-ראשי)

| ייצוג | קובץ | מה הוא מכיל | שימוש |
|---|---|---|---|
| **Governance SSOT** | `TEAMS_ROSTER.json` | הגדרה מלאה (capabilities, gates, writes_to, engine) | ממשל + UI |
| **Runtime context** | `context/identity/team_XX.md` | פרומפט injection (תפקיד, תחומי אחריות, קבצי קריאה) | הזרקה לפרומפטים |
| **UI hardcode** | `pipeline-teams.js` | label, engine, domain per team | רינדור דשבורד |

`TEAMS_ROSTER.json` כולל `_meta.note` שאומר "UI reads from this file directly. Do NOT maintain team data in pipeline-teams.js" — אבל `pipeline-teams.js` עדיין מכיל 67 הפניות לצוות. **ה-note לא מיושם.**

---

## חלק ב — הניתוח: האם יש בעיה אמיתית?

### ב.1 ממשל משותף עם תוכן דומיין-ספציפי

**כן — זוהי בעיה.** לא בעיה פונקציונלית מיידית, אלא בעיה ממשל:

- כשצוות חדש (AI agent) מקבל הוראה "קרא את docs-governance/" — הוא מקבל context שכולל הנחיות ספציפיות ל-AOS שאולי לא רלוונטיות ואף מטעות עבורו.
- כשנרצה לבנות "ממשל AOS v3" או "ממשל TikTrack S004" — אין ברור איפה לשים חומרים חדשים.

### ב.2 קונבנציות TikTrack בקוד AOS

**בעיה בינונית.** פונקציונלית זה עובד, אבל:
- בניית AOS v3 ב-`agents_os_v3/` — האם נעתיק שוב את backend.md?
- תיקון ב-backend.md = צריך לדעת לחפש בתוך קוד AOS

### ב.3 שלוש ייצוגים של הגדרות צוות

**בעיה מורכבת — טעון הכרעה.**

הייצוגים אינם כפולים לחלוטין — יש להם תפקידים שונים:
- `TEAMS_ROSTER.json` = הגדרה ממשלתית מלאה (machine-readable)
- `team_XX.md` = prompt injection context (human-readable, LLM-oriented)
- `pipeline-teams.js` = UI rendering data

השאלה: האם `team_XX.md` הוא DERIVED מ-TEAMS_ROSTER.json, או INDEPENDENT?

היום: **INDEPENDENT** — כותבים שניהם ידנית → drift אפשרי.
ב-v3: **DERIVED** — TEAMS_ROSTER.json הוא SSOT; `team_XX.md` מיוצר ממנו; UI טוען ממנו.

---

## חלק ג — מבנה מוצע ל-v3

### ג.1 עיקרון

```
docs-governance/   → משותף בלבד. אם הקובץ לא רלוונטי לשני הדומיינים — הוא לא שייך כאן.
docs-agents-os/    → AOS כמערכת — ארכיטקטורה, נהלים, ממשל ספציפי ל-AOS
docs-system/       → TikTrack כמוצר — ארכיטקטורה, נהלים, ממשל ספציפי ל-TikTrack
```

### ג.2 מבנה מוצע

```
documentation/
│
├── docs-governance/                    ← SHARED ONLY (שני הדומיינים)
│   ├── 01-FOUNDATIONS/                 ← WSM, SSM, roadmap, registry, gate model, TEAMS_ROSTER.json
│   ├── 02-POLICIES/                    ← Iron Rules, constitution, shared policies
│   ├── 03-PROTOCOLS/                   ← shared gate protocols, fast-track, HITL
│   ├── 04-PROCEDURES/                  ← SHARED procedures only
│   └── 05-CONTRACTS/                   ← team role contracts (shared)
│
├── docs-agents-os/                     ← AOS כמערכת (v2 + v3)
│   ├── 01-OVERVIEW/
│   ├── 02-ARCHITECTURE/                ← v2 arch + v3 arch spec
│   ├── 03-CLI-REFERENCE/
│   ├── 04-PROCEDURES/                  ← AGENTS_OS_V2_OPERATING_PROCEDURES (עבר לכאן)
│   ├── 05-GOVERNANCE/                  ← AGENTS_OS_GOVERNANCE content (עבר לכאן)
│   └── 06-TEMPLATES/
│
└── docs-system/                        ← TikTrack כמוצר
    ├── 01-ARCHITECTURE/
    ├── 02-PIPELINE/
    ├── 03-SERVER/
    ├── 04-PROCEDURES/                  ← TEAM_10_GATE_ACTIONS_RUNBOOK (עבר לכאן)
    ├── 07-DESIGN/
    └── 08-PRODUCT/
```

### ג.3 פתרון שלוש ייצוגי הצוות ב-v3

```
documentation/docs-governance/01-FOUNDATIONS/
└── TEAMS_ROSTER.json          ← SSOT יחיד. מכיל הגדרה מלאה.

agents_os_v3/
└── context/
    └── teams/
        ├── team_10.md         ← AUTO-GENERATED מ-TEAMS_ROSTER.json
        ├── team_11.md            (לא נכתב ידנית — מיוצר ע"י seed.py)
        └── ...

agents_os_v3/ui/
└── app.js                     ← טוען TEAMS_ROSTER.json ישירות (לא pipeline-teams.js)
```

**Pipeline:** TEAMS_ROSTER.json → `seed.py` → SQLite `teams` table + `team_XX.md` auto-generated

**תוצאה:** שינוי בצוות = UPDATE פעם אחת ב-TEAMS_ROSTER.json. הכל נגזר ממנו.

### ג.4 קונבנציות TikTrack — מיקום נכון ב-v3

```
documentation/docs-system/05-CONVENTIONS/    ← חדש
├── backend.md              ← עבר מ-agents_os_v2/context/conventions/
├── frontend.md
└── constraints.md
```

`agents_os_v3/seed.py` טוען אותם משם. לא עותק — הפניה לנתיב.

---

## חלק ד — סיכום: מה לשנות ומה לא

### עכשיו (v2 פעיל) — לא לשנות
v2 עובד. שינויי מבנה עכשיו = סיכון שבירה.

### בעת בניית v3 — לממש
| פעולה | מה עושים |
|---|---|
| העברת `AGENTS_OS_GOVERNANCE/` | `docs-governance/AGENTS_OS_GOVERNANCE/` → `docs-agents-os/05-GOVERNANCE/` |
| העברת נהלים דומיין-ספציפיים | `docs-governance/04-PROCEDURES/AGENTS_OS_V2_*` → `docs-agents-os/04-PROCEDURES/` |
| העברת runbooks TikTrack | `docs-governance/04-PROCEDURES/TEAM_10_*` → `docs-system/04-PROCEDURES/` |
| יצירת קונבנציות TikTrack | `agents_os_v2/context/conventions/` → `docs-system/05-CONVENTIONS/` |
| auto-gen team context | `seed.py` מייצר `team_XX.md` מ-TEAMS_ROSTER.json |
| הסרת pipeline-teams.js | `app.js` טוען TEAMS_ROSTER.json ישירות |

### ב-v2 — שינוי אחד מומלץ (לא חובה)
הוסף `_meta` comment ב-`docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`:
"NOTE: this document belongs to docs-agents-os/. Remains here for backward compatibility until AOS v3 migration."

---

**log_entry | TEAM_00 | GOVERNANCE_STRUCTURE_ANALYSIS | AOS_V3 | PENDING_NIMROD_APPROVAL | 2026-03-25**
