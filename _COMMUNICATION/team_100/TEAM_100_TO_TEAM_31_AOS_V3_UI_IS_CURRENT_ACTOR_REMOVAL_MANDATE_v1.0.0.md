---
id: TEAM_100_TO_TEAM_31_AOS_V3_UI_IS_CURRENT_ACTOR_REMOVAL_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect / Chief R&D)
to: Team 31 (AOS Frontend Implementation)
cc: Team 11 (AOS Gateway), Team 00 (Principal)
date: 2026-03-28
type: MANDATE — UI Spec Alignment (post-GATE_2)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md §5 OBS-01
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3.md §4.13
  - ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
priority: HIGH — must be resolved before GATE_4 UI wiring---

# Team 100 → Team 31 | מנדט: הסרת `is_current_actor` מ-UI

## 1 — רקע

באישור GATE_2 (OBS-01) זוהה כי קובץ `agents_os_v3/ui/app.js` עדיין מכיל הפניות לשדה **`is_current_actor`** — שדה שהוסר מתגובת `GET /api/teams` לפי UI Spec v1.0.3 §4.13 ו-AUTHORITY_MODEL v1.0.0.

ה-backend (GATE_2) **אינו מחזיר** את השדה הזה. כל UI שמסתמך עליו ישבר בחיבור ל-API החי.

## 2 — סכמת TeamResponse תקנית (UI Spec v1.0.3 §4.13)

```json
{
  "team_id":               "string",
  "label":                 "string",
  "name":                  "string",
  "engine":                "string",
  "group":                 "string",
  "profession":            "string",
  "domain_scope":          "string",
  "parent_team_id":        "string | null",
  "children":              ["string"],
  "has_active_assignment":  "boolean"
}
```

**`is_current_actor` לא קיים** בסכמה. השדה `has_active_assignment` ממלא את התפקיד של סימון צוותים עם הקצאה פעילה.

## 3 — שינויים נדרשים

### קובץ: `agents_os_v3/ui/app.js`

| # | מיקום (שורות) | תיאור | פעולה |
|---|--------------|-------|-------|
| F-01 | ~843–854 | `MOCK_TEAMS` — כל אובייקט צוות כולל `is_current_actor: true/false` | **מחק** את המפתח `is_current_actor` מכל 12 אובייקטי הצוות |
| F-02 | ~2389–2391 | הצגת "You are the CURRENT ACTOR" לפי `team.is_current_actor` | **החלף** ב-`has_active_assignment` — טקסט: `"Assignment: Active"` / `"Assignment: None"` |
| F-03 | ~2452, 2476, 2779 | פילטר checkbox `aosv3-team-filter-current` — מסנן לפי `is_current_actor` | **שנה** את לוגיקת הסינון לסנן לפי `has_active_assignment` במקום; עדכן label של ה-checkbox אם קיים ב-HTML |
| F-04 | ~2609–2612 | Detail card — שורת `<dt>is_current_actor</dt>` עם badge | **החלף** ב-`<dt>has_active_assignment</dt>` ו-badge לפי `team.has_active_assignment` |
| F-05 | ~2745–2747 | Team row star `★` מוצג כש-`is_current_actor` | **החלף** — הצג `★` כאשר `has_active_assignment === true` |

### כללי

- **אין** להוסיף `is_current_actor` חזרה תחת שם אחר.
- **אין** לחשב `is_current_actor` בצד הלקוח — השדה הוסר מ-API ומ-spec.
- שדה `has_active_assignment` כבר קיים בסכמה ומוחזר מה-backend. הוא מסמן האם לצוות יש הקצאה `ACTIVE` ב-`assignments`.

## 4 — קריטריוני קבלה

| AC | תנאי |
|----|-------|
| AC-01 | Grep `is_current_actor` על `agents_os_v3/ui/` → **0 תוצאות** |
| AC-02 | ה-mock data ב-`MOCK_TEAMS` תואם את סכמת §4.13 (ללא `is_current_actor`) |
| AC-03 | פילטר ה-roster, detail card, ו-team row star פועלים לפי `has_active_assignment` |
| AC-04 | אין שגיאות console בפתיחת Dashboard |

## 5 — הרצה לבדיקה

```bash
# grep לוודא שאין is_current_actor
rg "is_current_actor" agents_os_v3/ui/

# פתיחת הדשבורד (אם שרת UI פעיל)
# http://localhost:8090/?domain=agents_os → Teams tab → verify filter + detail card
```

## 6 — מסירה

דוח השלמה + Seal ל-Team 11. Team 51 יאמת AC-01 כחלק מ-GATE_4 QA.

---

**log_entry | TEAM_100 | AOS_V3_BUILD | MANDATE_TEAM_31_IS_CURRENT_ACTOR_REMOVAL | 2026-03-28**
