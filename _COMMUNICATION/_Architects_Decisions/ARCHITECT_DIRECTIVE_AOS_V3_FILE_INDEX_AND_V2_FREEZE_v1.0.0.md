---
id: ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: All AOS v3 BUILD teams (11, 21, 31, 51, 61, 111)
cc: Team 100 (Chief Architect), Team 191 (Git Governance)
date: 2026-03-27
type: ARCHITECT_DIRECTIVE — Iron Rule
domain: agents_os
authority: Team 00 Constitutional authority---

# Architect Directive — AOS v3 File Index Protocol + v2 Freeze

## סעיף 1 — UC-15: AOS v2 FROZEN (נעול)

**החלטה:** AOS v2 (`agents_os_v2/`) **מוקפא לחלוטין** לאורך כל תקופת פיתוח AOS v3.

| היבט | כלל |
|---|---|
| קוד v2 | **אסור לשינוי** — קריאה מותרת לצורך הפניה בלבד |
| ריצה | v2 **לא רץ** במקביל לפיתוח v3 |
| קבצים חדשים ב-`agents_os_v2/` | **אסורים לחלוטין** |
| תיקוני bugs ב-v2 | **אסורים** — כל תיקון מממומש רק ב-v3 |
| שימוש בv2 כ-reference | ✓ מותר — קוד קיים (`json_enforcer.py`, `pipeline.py` וכו') משמש כהשראה; לא מועתק ישירות |

**נימוק:** v2 משמש כרשת ביטחון לידע, לא כבסיס חי. כל מגע בv2 בתקופת פיתוח v3 מסתכן בערבוב context ובחובות ניקוי לא מוגדרים.

---

## סעיף 2 — Iron Rule: FILE INDEX מלווה את כל ה-BUILD

**כל קובץ שנוצר, מוסר או משתנה כחלק מ-AOS v3 חייב להיות רשום ב-FILE INDEX לפני commit.**

### 2.1 קובץ SSOT

```
agents_os_v3/FILE_INDEX.json
```

**בעלים ומנהל:** Team 61 (AOS DevOps) — אחראי על תחזוקה שוטפת ואכיפה.
**בדיקה בשערים:** Team 90 בודק עדכניות FILE_INDEX בכל gate validation.

### 2.2 מבנה הרשומה

```json
{
  "version": "1.0.0",
  "last_updated": "2026-03-27",
  "entries": [
    {
      "path": "agents_os_v3/api/routes/feedback.py",
      "status": "NEW",
      "spec_ref": "§4.19",
      "owner_team": "team_21",
      "added_in_gate": "GATE_1",
      "notes": ""
    }
  ]
}
```

### 2.3 ערכי `status` — ארבעה בלבד

| status | משמעות | פעולה בסיום |
|---|---|---|
| `NEW` | קובץ חדש — קיים רק ב-v3 | נשאר |
| `MODIFIED_FROM_V2` | קובץ v2 שהועתק ושונה ל-v3 | גרסת v2 המקורית תימחק בסיום |
| `SHARED` | קובץ שמשמש גם v2 וגם v3 (infra, utils) | נשאר; לבחון בסיום |
| `DEPRECATED_V2` | קובץ v2 שמיותר עם השלמת v3 | **נמחק בסיום** — רשימת cleanup |

### 2.4 כלל הכנסה

- **לפני כל commit** שיוצר/משנה קובץ ב-`agents_os_v3/` → רשם ב-FILE_INDEX
- **כלל האצבע:** אם הקובץ לא ב-FILE_INDEX — הוא רעש. Gate validation ידחה.
- קבצים ב-`agents_os_v2/` אינם נרשמים (מוקפאים) — למעט `DEPRECATED_V2` entries שמסמנים מה יימחק.

---

## סעיף 3 — Cleanup Protocol (סיום פרויקט)

בסיום BUILD מלא ולפני merge ל-`main`:

### שלב 3.1 — Cleanup Report (Team 61 + Team 111)
```
agents_os_v3/CLEANUP_REPORT.md
```
מבוסס FILE_INDEX — רשימת כל:
- `DEPRECATED_V2` entries → לבדיקת בעלות לפני מחיקה
- `MODIFIED_FROM_V2` entries → לאישור שגרסת v2 המקורית מיותרת
- `SHARED` entries → לבחון האם עדיין נחוצים

### שלב 3.2 — אישור Team 00
Nimrod בוחן CLEANUP_REPORT ומאשר רשימת מחיקה.

### שלב 3.3 — ביצוע
Team 61 מבצע מחיקה מאושרת + PR ל-main.

---

## סעיף 4 — אכיפה בשערים

**Gate checklist חדש — לכל gate validation (Team 90 מוסיף ל-checklist):**

```
□ FILE_INDEX.json עודכן עבור כל קבצים שנוצרו/שונו ב-gate זה
□ אין קבצים ב-agents_os_v3/ שחסרים מ-FILE_INDEX
□ אין שינויים ב-agents_os_v2/ (אסור לחלוטין)
□ DEPRECATED_V2 entries מוסברים בבירור
```

**אי-עמידה בגנדר = GATE FAIL (BLOCKING).**

---

## סעיף 5 — הטמעה בפרויקט

### Commit ראשון של BUILD (Team 61 — Gate 1)
יצירת `agents_os_v3/FILE_INDEX.json` עם:
- מבנה ריק (entries: [])
- כל קבצי ה-UI המוקאפ הקיימים (`agents_os_v3/ui/`) — status: `NEW`
- spec files ב-`_COMMUNICATION/` — **לא נרשמים** (מחוץ לתחום)

### כלל העברה ל-Teams בעת Activation
כל activation prompt ל-BUILD team חייב לכלול:
> **Iron Rule — FILE INDEX:** כל קובץ שתיצור ב-`agents_os_v3/` חייב להירשם ב-`agents_os_v3/FILE_INDEX.json` עם status נכון לפני commit. Gate validation בודק עדכניות INDEX. אי-ציות = gate FAIL.

---

## סעיף 6 — לוגיקת ה-`agents_os_v3/` directory

**המבנה הנדרש בסיום BUILD:**

```
agents_os_v3/
├── FILE_INDEX.json          ← SSOT tracking
├── CLEANUP_REPORT.md        ← נוצר בסיום
├── api/                     ← FastAPI app (NEW)
│   ├── routes/
│   ├── models/
│   └── services/
│       ├── audit/
│       │   ├── ingestion.py  ← NEW (§11 spec)
│       │   └── sse.py        ← NEW (§11 spec)
│       └── ...
├── db/
│   └── migrations/          ← DDL v1.0.2 (NEW)
├── ui/                      ← מוקאפ קיים → production (MODIFIED_FROM_V2 logically)
│   ├── index.html
│   ├── history.html
│   ├── config.html
│   ├── teams.html
│   └── portfolio.html
└── tests/
    └── integration/         ← IT-15..IT-22 (NEW)
```

כל דבר מחוץ לעץ הזה ב-`agents_os_v3/` — חריגה שדורשת נימוק מפורש ב-FILE_INDEX.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | AOS_V3_FILE_INDEX_AND_V2_FREEZE | IRON_RULE | 2026-03-27**
