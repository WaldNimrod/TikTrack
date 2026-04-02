---
id: TEAM_111_AOS_V3_SYSTEM_MAP_ACCURACY_REPORT_v1.0.0
historical_record: true
from: Team 111 (AOS Domain Architect)
to: Team 00 (Principal), Team 100 (Chief Architect)
cc: Team 31 (AOS Frontend), Team 11 (AOS Gateway)
date: 2026-03-31
type: LOD200_REPORT — System Map accuracy + readability + WP position feature assessment
domain: agents_os
branch: aos-v3
authority: TEAM_00_AOS_V3_SYSTEM_MAP_CANONICAL_DECLARATION_v1.0.0.md
system_state: BUILD COMPLETE + Remediation COMPLETE (2026-03-28); 102 tests PASS; FILE_INDEX v1.1.15
source_files:
  - agents_os_v3/ui/flow.html (8 diagrams)
  - agents_os_v3/ui/pipeline_flow.html (same 8 diagrams, design spec)
  - agents_os_v3/modules/state/machine.py
  - agents_os_v3/modules/definitions/constants.py
  - agents_os_v3/modules/management/api.py
  - agents_os_v3/tests/tc_module_map_helpers.py---

# Team 111 → Team 00 + Team 100 | System Map — Accuracy & Readability Report

## Executive Summary

המפה (`flow.html`) נבנתה בשלב ה-BUILD ותיעדה נכון את המבנה התיאורטי.
לאחר BUILD COMPLETE + Remediation, נמצאו **4 בעיות דיוק** ו-**6 נושאי קריאות** לתיקון.
המפה אינה בלתי-קריאה — אך כוללת תוויות מיושנות ומסלול deprecated שנראה פעיל.
**Task 3** (סמן WP פעיל) — תוכנן בפירוט: ~160 שורות, ללא שינויי backend.

---

## חלק 1 — ממצאי דיוק (8 תרשימים)

### D1: Gate Sequence (`#gates`)

**חומרה: MEDIUM**

בעיה: צמתי השערים כוללים תוויות סטטוס BUILD-time שמיושנות כעת:
- `GATE_0(["GATE_0\nInfrastructure\n✅ PASS"])` ← ✅ PASS הוא סטטוס BUILD, לא תכונה של השער
- `GATE_3(["GATE_3\nFIP + SSE\n⏳ Next"])` ← "⏳ Next" היה נכון בזמן BUILD; שגוי כרגע
- `GATE_4(["GATE_4\nUX Sign-off\n🔒 Permanent HITL"])` ← ה-🔒 שימושי (מסמן HITL קבוע); לשמור
- `T3["...⏳ Next"]` ← תיבת הצוותים של GATE_3 עדיין מכילה "⏳ Next"

תיקון נדרש: הסר `✅ PASS` / `⏳ Next` מכל הצמתים; שמור `🔒 Permanent HITL` ב-GATE_4 (תכונה ארכיטקטונית).

### D2: State Machine (`#sm`)

**חומרה: LOW**

בעיה: ב-subgraph CORRECTION, הצומת `CO_LOOP` מתנהג גם כצומת-מצב וגם כמייצג אירוע (CORRECTION_ESCALATED). שמו מבלבל — מצביע על לולאה (loop) אך בפועל מסמן מצב BLOCKED.

```
CO_LOOP["T10: resubmit() cycle >= max\nG08: BLOCKED — await Principal\nA09: ESCALATED event"]
CO --> CO_LOOP --> CO
```

הצומת הוא למעשה **תוצאת** מעבר T10, לא מצב לופ. קורא אנושי עלול לחשוב שיש state בשם CO_LOOP.

תיקון: שנה שם ל-`CO_ESC["BLOCKED\ncycle ≥ max → ESCALATED\nawait team_00"]`

### D3: InitiateRun (`#init`)

**חומרה: MEDIUM**

בעיה: Stage A — Sentinel Routing מוצג כנתיב פעיל שווה-ערך ל-Stage B:

```
SA["Stage A — Sentinel DEPRECATED
resolve_from_state_key IS NOT NULL
match gate+phase+domain+variant
L1 cutover: all NULL before PROD"]
```

הקוד ב-`routing/resolver.py` כולל הערת DEPRECATED, וכל השורות הן NULL ב-PROD. הצגה שווה-ערך עם Stage B מטעה — קורא עלול לחשוב שיש שתי מערכות routing מקבילות.

תיקון: הוסף `:::deprecated` styling ל-SA, שנה חיצים ל-SA→SB2 לקו מקווקו, הוסף טקסט: `[PROD: all NULL — inactive path]`

### D4: Gate Loop (`#loop`)

**חומרה: LOW**

בעיה: `HW["Dashboard surfaces gate\nawait team_00 action\nGATE-4: ALWAYS HITL\nGATE-2: only on PENDING_REVIEW verdict"]` — הצגה נכונה אך שני מקרי HITL שונים (GATE_4 קבוע vs. GATE_2 מותנה) מיוצגים בצומת אחד.

קורא אנושי צריך להבין שסוג ה-HITL שונה מהותית: GATE_4 = תמיד אנושי; GATE_2 = רק אם ה-FIP החזיר PENDING_REVIEW.

תיקון: פצל ל-`HW_G4` ו-`HW_G2` עם הפנייה מ-`ISHITL`, או הוסף הערת info-card מעל התרשים (פחות פולשני).

### D5–D8: Correction / Pause / Override / FIP

**חומרה: NONE / INFO**

| תרשים | מסקנה |
|--------|--------|
| D5 Correction | **מדויק** — T09/T10/T11/G07 תואמים ל-machine.py |
| D6 Pause/Resume | **מדויק** — snapshot/ATOMIC/Branch A+B תואמים לקוד |
| D7 Override | **מדויק** — FORCE_PASS/FAIL/PAUSE/RESUME/CORRECTION + cycle_count נכון |
| D8 FIP | **מדויק** — endpoints קיימים ב-API (אומת דרך tc_module_map_helpers.py) |

---

## חלק 2 — נושאי קריאות (6 פריטים)

| # | תרשים | בעיה | תיקון מוצע | עדיפות |
|---|--------|------|-------------|---------|
| R1 | Gate Sequence | תיבות T0..T5 צפופות מאוד (~5 שורות כ"א) | צמצם ל-3 שורות + פסיק בין צוותים | Medium |
| R2 | State Machine | תווית T12 בתוך INPROGRESS: 7 שורות — נחתכת במסכים צרים | קצר ל-3 שורות: "T12: override\nG09: team_00\nראה §7" | Medium |
| R3 | State Machine | שם `CO_LOOP` מבלבל (ראה D2 לעיל) | שנה ל-`CO_ESC` | Medium |
| R4 | InitiateRun | "Stage A — Sentinel DEPRECATED" נראה כנתיב חי | הוסף `:::deprecated` + קו מקווקו | Medium |
| R5 | Correction | תיבות הנתיב (RESUBMIT / REVIEWER / OVERRIDE) מפורטות אך ברורות | הוסף prefix: 🔁 / 👥 / ⚡ לשמות subgraph | Low |
| R6 | Override | הבחנה FORCE_FAIL (מונה++) vs FORCE_CORRECTION (לא מונה) — קשה להבחין | הוסף `:::warning` ל-A_FF ו-`:::info` ל-A_FC | Low |

---

## חלק 3 — Task 3: סמן מיקום WP פעיל

### עיקרון

**לא** לשנות את תרשימי Mermaid הקיימים. להוסיף section HTML חדש `#live` מעל Gate Sequence — כרטיסיות ריצות פעילות עם קישור "הצג בתרשים".

### מיפוי state → תרשים

| מצב ריצה | חץ אל |
|-----------|--------|
| `IN_PROGRESS` | `#loop` |
| `CORRECTION` | `#correction` |
| `PAUSED` | `#pause` |
| `COMPLETE` | `#sm` |
| `NOT_STARTED` | `#init` |

### Backend

`GET /api/runs` כבר קיים (TC-26 מאמת `?current_gate_id=X`). אין endpoints חדשים נדרשים.
יש לבדוק אם `?status=IN_PROGRESS` נתמך; fallback: fetch הכל + filter client-side.

### נפח עבודה (Team 31)

| רכיב | שורות משוערות |
|-------|---------------|
| HTML section `#live` (wrapper + empty state + card template) | ~50 |
| CSS (`.run-card`, `.run-card-gate`, `.status-badge` + color vars) | ~35 |
| JS (`loadLiveRuns()` + `renderRunCard()` + SSE refresh hook + `scrollToDiagram()`) | ~75 |
| Backend | 0 |
| **סה"כ** | **~160** |

### SSE integration

`app.js` כבר מכיל SSE chip logic לעדכון מצב. ניתן ל-hook ב-`onSSEEvent` הקיים:
כל event → קרא `loadLiveRuns()` → re-render כרטיסיות.

### סיכון

| סיכון | רמה | מיטיגציה |
|-------|-----|-----------|
| `?status=` filter לא נתמך | נמוך | filter client-side |
| SSE reconnect | אין | מטופל ב-app.js |
| Regression על 5 עמודים אחרים | אין | שינוי ב-flow.html בלבד |

---

## חלק 4 — המלצות לביצוע

### שלב א — תיקוני דיוק + קריאות (Team 111 → Team 31 mandate)

- D1: הסר emoji סטטוס BUILD מצמתי שערים (שמור 🔒 GATE_4)
- D2+R3: `CO_LOOP` → `CO_ESC`
- D3+R4: Sentinel Stage A — add `:::deprecated` + קו מקווקו + `[PROD: all NULL]`
- R1: צמצם תיבות T0..T5
- R2: קצר תווית T12
- R6: `:::warning` ל-FORCE_FAIL, `:::info` ל-FORCE_CORRECTION

עומס: ~40 שורות שינוי בתוך תרשימי Mermaid. **flow.html + pipeline_flow.html שניהם.**

### שלב ב — Task 3: Live WP Position (מותנה באישור Principal)

- דורש: אישור Team 00 ש-Task 3 נדרש בגרסה הנוכחית
- Team 31 mandate: ~160 שורות חדשות (HTML + CSS + JS)
- זמן: session אחד
- תנאי: FILE_INDEX bump v1.1.15 → v1.1.16

### מה לא לשנות

- מבנה 8 sections ו-IDs (מאושרים בבדיקות canary smoke)
- תוכן תרשימי FIP, Correction, Pause, Override — מדויקים
- `pipeline_flow.html` — אותם תיקונים כמו `flow.html`, ללא section `#live`

---

## בקשה לאישור

1. **Team 00 / Team 100:** אשרו ביצוע שלב א (תיקוני דיוק + קריאות) — Team 111 יבצע ישירות או ידפיס מנדט ל-Team 31.
2. **Team 00:** החלטה על Task 3 (Live WP Position) — יצירת mandate ל-Team 31 או דחייה לגרסה עתידית.

---

**log_entry | TEAM_111 | AOS_V3 | SYSTEM_MAP_ACCURACY_REPORT | v1.0.0 | 2026-03-31**
