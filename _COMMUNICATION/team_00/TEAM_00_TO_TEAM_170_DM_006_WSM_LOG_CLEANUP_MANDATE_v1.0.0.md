---
id: DM-006
historical_record: true
dm_type: DIRECT_MANDATE
from: Team 00 (Nimrod — System Designer)
to: Team 170 (Documentation & Governance)
authority: Team 00 — constitutional authority
classification: GOVERNANCE_MAINTENANCE
pipeline_impact: NONE
scope_boundary: WSM maintenance only — zero operational state changes
return_path: Team 170 → completion report → Team 00 sign-off
status: ACTIVE
date: 2026-03-24
registry_ref: _COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md---

# DM-006 — WSM Log Cleanup Mandate
## ניקוי `PHOENIX_MASTER_WSM_v1.0.0.md`: ארכיון log_entries + תיקון drift §0

---

## §1 — רקע ובעיה

`PHOENIX_MASTER_WSM_v1.0.0.md` מכיל כיום **406 שורות**:

| אזור | שורות | ערך |
|---|---|---|
| Header + §0 definitions | ~80 | חיוני — הגדרות מבניות |
| CURRENT_OPERATIONAL_STATE | ~90 | חיוני — מצב אופרטיבי live |
| `log_entry` היסטוריים S001+S002 | ~240 | **ארכיוני — 60% מהקובץ, לא נקרא** |

**שתי בעיות דורשות טיפול:**

1. **צפיפות מיותרת:** כל log_entry מ-S001 + S002 שוכן ב-WSM הפעיל למרות שאין להם ערך אופרטיבי. זה מאט קריאה, מעלה סיכון לעדכון בשורה שגויה, ומסתיר את המצב החי.

2. **Drift ב-§0 + §0.1:** הגדרות המבנה עדיין מתייחסות ל-`GATE_8`, `Team 90 owns GATE_5–GATE_8` — מודל הגייטים הישן. המודל הקנוני הנוכחי הוא GATE_0→GATE_5 (מאומת ב-`pipeline-config.js`).

---

## §2 — Deliverables

### DELIVERABLE-1: ארכיון log_entries S001 + S002

**פעולה:** העבר את כל log_entry הרלוונטיים ל-S001 ו-S002 לקובץ ארכיון ייעודי:

```
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WSM_LOG_ARCHIVE_S001_S002.md
```

**גבולות ארכיון:**
- ✅ להעביר לארכיון: כל entries שמתייחסים ל-S001-Pxxx ו-S002-Pxxx (תאריכים 2026-02-19 → ~2026-03-14)
- ✅ להעביר לארכיון: entries אדמיניסטרטיביים כלליים מאותה תקופה (WSM_V1_0_0_ACTIVE, GOVERNANCE_REALIGNMENT וכו')
- ❌ **להשאיר** ב-WSM: כל entries של S003 (active stage)
- ❌ **להשאיר** ב-WSM: entries של AOS S003-P012 ו-S003 DM-related

**פורמט קובץ ארכיון:**

```markdown
---
id: PHOENIX_WSM_LOG_ARCHIVE_S001_S002
archive_source: PHOENIX_MASTER_WSM_v1.0.0.md
archived_date: 2026-03-24
archived_by: Team 170 per DM-006
stages_covered: S001, S002
reason: Operational WSM size reduction — historical entries not required for active execution
---

# WSM Log Archive — S001 + S002
> ארכיון log_entries מ-PHOENIX_MASTER_WSM_v1.0.0.md שהועברו לאחסון היסטורי.
> לא למחוק — תיעוד היסטורי קנוני.

[כל ה-log_entries שהועברו — בסדר כרונולוגי, ללא שינוי]
```

**תוצאה מצופה:** WSM יתכווץ מ-406 → פחות מ-170 שורות.

---

### DELIVERABLE-2: תיקון Drift §0 + §0.1

**בעיה:** §0 ו-§0.1 מציינים GATE_6/GATE_7/GATE_8 כחלק ממודל הגייטים הנורמלי. המודל הנוכחי הוא GATE_0→GATE_5 בלבד.

**שורות לתיקון:**

| מיקום | קיים | נדרש |
|---|---|---|
| §0 — שורת `structural_revision` header | `GATE_2/GATE_8` | `GATE_2/GATE_5` |
| §0 — שורת Fast-track overlay | `gate_id remains canonical (GATE_0..GATE_8)` | `GATE_0..GATE_5` |
| §0 — שורת Gate ownership | `GATE_5–GATE_8 owner Team 90` | `GATE_5 owner Team 90 (final gate)` |
| §0.1 — Role contract | `GATE_5, GATE_6, GATE_7, GATE_8` (Team 90) | `GATE_5` |
| §0 — reference to `04_GATE_MODEL_PROTOCOL_v2.3.0` | keep reference | keep — but note model updated |

**כלל:** כל GATE_6/7/8 ב-§0 + §0.1 = drift שיש לתקן. GATE_5 הוא השער האחרון = COMPLETE.

**⚠️ חשוב:** log_entry היסטוריים המכילים `GATE_8 PASS` — **אל תגע בהם** — הם רשומות עובדתיות של S001/S002 ועוברים לארכיון כמות שהם (DELIVERABLE-1).

---

### DELIVERABLE-3: log_entry סיום

הוסף בסוף ה-WSM (לאחר ניקוי):

```
**log_entry | TEAM_170 | WSM_MAINTENANCE | DM_006 | LOG_ARCHIVE_S001_S002_COMPLETE + SECTION_0_DRIFT_FIX | 2026-03-24**
```

---

## §3 — מה מחוץ לסקופ (אסור לגעת)

| פריט | סיבה |
|---|---|
| CURRENT_OPERATIONAL_STATE | live state — Team 101/100 מעדכנים per DM-005 |
| STAGE_PARALLEL_TRACKS | operational state — לא לגעת |
| שינוי version header (v1.0.0) | יבוצע בסגירת S003 כ-v1.1.0 |
| תוכן §5 EXECUTION_ORDER_LOCK | לא ב-scope |
| log_entries של S003 | active stage — להשאיר |
| Program Registry / Portfolio docs | לא ב-scope של DM-006 |

---

## §4 — Acceptance Criteria

| AC | Pass Condition |
|---|---|
| AC-01 | `PHOENIX_WSM_LOG_ARCHIVE_S001_S002.md` קיים וכולל את כל entries S001+S002 |
| AC-02 | WSM מכיל פחות מ-170 שורות לאחר הניקוי |
| AC-03 | WSM §0/§0.1 — אין אזכורי GATE_6/GATE_7/GATE_8 |
| AC-04 | CURRENT_OPERATIONAL_STATE זהה למצב לפני הניקוי (byte-for-byte על hash) |
| AC-05 | `ssot_check --domain agents_os` exit 0 לאחר שינוי |
| AC-06 | `ssot_check --domain tiktrack` exit 0 לאחר שינוי |
| AC-07 | completion report קיים ב-`_COMMUNICATION/team_170/` |

---

## §5 — Return Path

```
Team 170 → _COMMUNICATION/team_170/TEAM_170_DM_006_WSM_CLEANUP_COMPLETION_REPORT_v1.0.0.md
→ Team 00 review (AC-01..07 check)
→ DM-006 CLOSED — Bridge: ABSORB
```

---

**log_entry | TEAM_00 | DM_006 | WSM_LOG_CLEANUP_MANDATE | TEAM_170_ACTIVATED | 2026-03-24**
