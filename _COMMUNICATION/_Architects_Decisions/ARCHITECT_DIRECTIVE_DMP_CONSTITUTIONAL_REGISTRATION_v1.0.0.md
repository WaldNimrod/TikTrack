---
id: ARCHITECT_DIRECTIVE_DMP_CONSTITUTIONAL_REGISTRATION_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
authority: Team 00 constitutional authority
classification: IRON_RULE
status: LOCKED
date: 2026-03-23
supplements: ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0.md
supplements: ARCHITECT_DIRECTIVE_DIRECT_MANDATE_PROTOCOL_v1.0.0.md---

# Architectural Directive — DMP Constitutional Registration
## רישום ה-Direct Mandate Protocol במסגרת הקנונית הארגונית

---

## §1 — מטרה

מסמך זה:
1. רושם רשמית את ה-**DMP** (Direct Mandate Protocol) כנוהל חוקתי קנוני
2. נועל **טרמינולוגיה** ברורה ומחייבת לכל הצוותים
3. קושר בין DMP ל-**מצב ידני** (Manual Mode) המוגדר ב-§1 של `ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0.md`
4. מגדיר **ייצוג UI** קנוני עבור DMs בכלי הניהול

---

## §2 — טרמינולוגיה קנונית (נעול — Iron Rule)

| מונח | הגדרה | כתיב אנגלי | כתיב עברי |
|---|---|---|---|
| **Direct Mandate** | יחידת עבודה bounded, מחוץ לגייט מודל, מונפקת ע"י Team 00/100 | Direct Mandate | מנדט ישיר |
| **DMP** | Direct Mandate Protocol — הנוהל הקנוני המסדיר Direct Mandates | DMP | נוהל מנדט ישיר |
| **DM-ID** | מזהה קנוני: `DM-NNN` — מספור רץ ונצחי | DM-NNN | מ"י-NNN |
| **DM Registry** | ה-SSOT לכל ה-DMs — `DIRECT_MANDATE_REGISTRY_v1.0.0.md` | DM Registry | רישום מ"י |
| **Bridge Decision** | החלטת סגירה: ABSORB / FORMALIZE / DISCARD | Bridge Decision | החלטת גישור |
| **Manual Mode DMP** | ביצוע DMP במסגרת מצב ידני — Nimrod כאורקסטרטור | Manual Mode DMP | מ"י במצב ידני |

**אסור לשימוש (deprecated / forbidden terms):**

| מונח אסור | הסיבה | תחליף |
|---|---|---|
| "WP מחוץ לפייפליין" | WP = pipeline entity by definition | Direct Mandate (DM) |
| "שער שלילי" / "gate -1" | gates have semantic meaning; hack language | DMP lifecycle states |
| "חבילה דחופה" ללא רישום | עמום, לא ניתן למעקב | DM-NNN + DM Registry |
| "TRACK_MANUAL" כקוד | אין variant קוד למצב ידני — זה mode, לא track | Manual Mode + DMP |

---

## §3 — מיפוי ל-Work Modes (Iron Rule)

DMP פועל **אך ורק** במסגרת **מצב ידני (Manual Mode)**
כפי שמוגדר ב-`ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0.md` §1:

```
מצב ידני  →  DMP הוא הנוהל הקנוני לחבילות bounded במצב זה
דשבורד    →  DMP אינו רלוונטי — Pipeline מנהל את הזרימה
אוטומטי   →  DMP אינו רלוונטי — CLI מנהל; human רק בשערים
```

**ההבחנה הקריטית:**

| מאפיין | DMP (Manual Mode) | Pipeline (Dashboard/Auto) |
|---|---|---|
| גייטים | אין | 5+ שערים |
| WSM | אסור לגעת | מעודכן ב-pipeline_run.sh |
| מספור | DM-NNN | WP-NNN ב-pipeline_state |
| אורקסטרציה | Nimrod ידני | pipeline_run.sh |
| SSOT | DM Registry | pipeline_state.json |
| תנאי שימוש | bounded, urgent, no gate cycle | כל עבודה קנונית |

---

## §4 — DMP כנוהל חוקתי (רישום רשמי)

**DMP מוכר רשמית כ:**
- נוהל חוקתי מדרגה א' (peer to GATE_SEQUENCE_CANON + ORG_PIPELINE_ARCH)
- הכלי הלגיטימי היחיד לעבודה bounded מחוץ לפייפליין
- חלק ממסגרת ה-safety nets של המערכת (כמו Manual Mode בכלל)

**לגיטימיות:** DM שהונפק נכון אינו "מעקף" — הוא **ניהול מסודר** של עבודה שאינה מתאימה לפייפליין. המעקף הבעייתי הוא הנחיה ללא DM-ID, ללא Registry, ללא return_path.

---

## §5 — ייצוג UI קנוני

### §5.1 — עמוד מפת הדרכים (`PIPELINE_ROADMAP.html`)

**Panel: "Direct Mandates"** — ב-sidebar (תחת hierarchy / canonical files):
- Tab א: **Active** — כל DMs עם status=ACTIVE (בולט, צבע: כחול/כתום)
- Tab ב: **Closed** — כל DMs עם status=CLOSED (מעומעם)
- Data source: `_COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md` — parse §3/§4 tables
- כלול: DM-ID | to | scope | status | created
- אין עריכה מה-UI — read-only

### §5.2 — Dashboard (`PIPELINE_DASHBOARD.html`)

**Badge: "DM"** — ב-header row:
- כשיש DMs ב-ACTIVE: badge כתום עם ספירה (e.g. `DM ●2`)
- כשאין DMs ב-ACTIVE: badge מעומעם (`DM ○`)
- לחיצה: navigate ל-`PIPELINE_ROADMAP.html` + auto-open Direct Mandates panel

### §5.3 — Implementation

מנדט: DM-004 → Team 61
מסמך: `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_DMP_UI_INTEGRATION_MANDATE_v1.0.0.md`

---

## §6 — Iron Rules (DMP — תמצית לכל הצוותים)

1. **רישום חובה לפני הפעלה** — כל DM חייב DM-ID ב-Registry לפני ש-team מתחיל עבודה
2. **Team 00 / Team 100 בלבד מנפיקים** — אף צוות אחר אינו מוסמך להנפיק DM
3. **Bridge Decision חובה בסגירה** — אין DM CLOSED ללא ABSORB/FORMALIZE/DISCARD
4. **DM אינו WP** — אסור להתייחס ל-DM-ID כ-WP-ID; אין WSM; אין pipeline_state entry
5. **return_path חובה** — כל DM מגדיר ל-מי ולאן חוזרת התוצאה

---

## §7 — הפניות

| מסמך | תפקיד |
|---|---|
| `ARCHITECT_DIRECTIVE_DIRECT_MANDATE_PROTOCOL_v1.0.0.md` | ה-DMP המלא — lifecycle, fields, authority |
| `DIRECT_MANDATE_REGISTRY_v1.0.0.md` | SSOT לכל ה-DMs הפעילים והסגורים |
| `ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0.md` §1 | מצבי עבודה קנוניים (Manual/Dashboard/Auto) |
| `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_DMP_UI_INTEGRATION_MANDATE_v1.0.0.md` | DM-004 — UI integration mandate |

---

**log_entry | TEAM_00 | DMP_CONSTITUTIONAL_REGISTRATION | LOCKED | IRON_RULE | 2026-03-23**
