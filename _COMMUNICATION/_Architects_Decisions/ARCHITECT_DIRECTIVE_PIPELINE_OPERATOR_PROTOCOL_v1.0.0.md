---
id: ARCHITECT_DIRECTIVE_PIPELINE_OPERATOR_PROTOCOL_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: ALL TEAMS — mandatory read before any pipeline operation
date: 2026-03-21
type: IRON_RULE_DIRECTIVE
status: LOCKED
trigger: TT_TEST_FLIGHT TF-05 drift event (2026-03-21) + Nimrod architectural instruction---

# Architect Directive — Pipeline Operator Protocol
## ברזל: כל פעולת `pass` / `fail` / `approve` היא ידנית + מוכרזת

---

## §1 — Iron Rule: הפקודה הבסיסית היא READ-ONLY

```
./pipeline_run.sh --domain DOMAIN
```

**מה היא עושה:** מייצרת ומציגה את פרומט הגייט הנוכחי. שומרת prompt file בלבד.
**מה היא לא עושה:** לא מקדמת גייט/פאז, לא כותבת לstate, לא מעדכנת dashboard.

**שגיאה חמורה:** להניח שהרצת הפקודה הבסיסית שינתה משהו בפייפליין.

---

## §2 — טבלת פקודות קנונית (Iron Rule)

| פקודה | מה עושה | מתי להריץ |
|---|---|---|
| `./pipeline_run.sh --domain D` | **READ** — מציג פרומט נוכחי + שומר prompt file | כאשר רוצים לראות/להפיק את הפרומט הנוכחי |
| `./pipeline_run.sh --domain D pass` | **ADVANCE** — מקדמת phase/gate; כותבת לstate; מעדכנת STATE_VIEW | לאחר שצוות השלים עבודה וארטיפקט הוגש |
| `./pipeline_run.sh --domain D fail "טקסט"` | **BLOCK** — רושם כשל; מגדיר findings; מגדיל remediation_cycle_count | כאשר QA/validation נכשל עם ממצאים |
| `./pipeline_run.sh --domain D approve` | **HUMAN_APPROVE** — מוצא מ-HUMAN_PENDING; מקדם לשלב הבא | רק בשלבים שדורשים אישור אנושי (4.3 / 2.3) |
| `./pipeline_run.sh --domain D status` | **STATUS** — מציג state נוכחי בלבד | בדיקת מצב ללא שינוי |

---

## §3 — מחזורי חיים: מי מפעיל את הטריגר

### 3.1 מעבר פאז בתוך שער (למשל 3.1 → 3.2)
```
צוות X מסיים → כותב ארטיפקט → מעדכן Nimrod
Nimrod (או gateway team) מריץ:
  ./pipeline_run.sh --domain tiktrack pass
→ current_phase: 3.1 → 3.2
→ פרומט חדש לצוות הבא
```

### 3.2 מעבר שער (GATE_3 → GATE_4)
```
כל צוותי 3.2 מסיימים → ארטיפקטים הוגשו
Nimrod מריץ:
  ./pipeline_run.sh --domain tiktrack pass
→ current_gate: GATE_3 → GATE_4
→ gates_completed מקבל "GATE_3"
→ current_phase חוזר ל-4.1
→ פרומט GATE_4 לצוות 50
```

### 3.3 QA / ולידציה
```
צוות 50 מקבל פרומט GATE_4/4.1
צוות 50 מריץ בדיקות → כותב QA Report
─── אם PASS ───
  Nimrod מריץ: ./pipeline_run.sh --domain tiktrack pass
  → GATE_4/4.2 (Nimrod personal sign-off)
─── אם FAIL ───
  Nimrod מריץ: ./pipeline_run.sh --domain tiktrack fail "ממצאים"
  → remediation_cycle_count++
  → last_blocking_findings מתמלא
  → פרומט remediation לצוות הבונה
```

### 3.4 מעגל תיקון (remediation loop)
```
fail → צוות מקבל mandate תיקון → מתקן → מגיש
Nimrod מריץ: ./pipeline_run.sh --domain tiktrack pass
→ חוזרים לgateqa מחדש (remediation_cycle_count מוצג ב-CORRECTION_CYCLE_BANNER)
```

---

## §4 — Iron Rule: Bypass ידני חייב להיות מתועד מפורש

כאשר מבצעים bypass ידני של שלב (כלומר עורכים את קובץ המצב ישירות):
1. **חובה לרשום ב-monitor log:** `Phase X.Y bypassed manually — reason: [סיבה]`
2. **חובה לרשום ב-override_reason:** בקובץ ה-JSON: `"override_reason": "Phase X.Y bypassed — reason"`
3. **אסור לקדם phase ידנית** ללא תיעוד מפורש — bypass שקט = דריפט

---

## §5 — כלל: gateway team הוא הטריגר הממוצע

**לכל דומיין יש gateway:**
- TikTrack: Team 10 — אחראי לאשר סיום כל צוותי Phase 3.2 לפני שמעדכן את Nimrod
- AOS: Team 11 — אחראי לאשר סיום Team 61 לפני שמעדכן את Nimrod

Gateway לא מריץ `pass` עצמאית. הוא **מאשר** ל-Nimrod שניתן להריץ.
הרצת `pass` היא פריבילגיה אנושית (Nimrod) בלבד — לא AI agent.

---

## §6 — ביקורת אדריכלית נדרשת (סוף טיסת מבחן)

**שאלה פתוחה לביקורת:** האם נכון להוסיף gate-param validation לפקודת `pass`:
```
./pipeline_run.sh --domain tiktrack pass GATE_3
→ אם current_gate ≠ GATE_3: abort + error
```
זה יוסיף idiot-proof layer. ראה KB-36 (carry-forward). להחליט ב-WP003.

---

**log_entry | TEAM_100 | ARCHITECT_DIRECTIVE | PIPELINE_OPERATOR_PROTOCOL | IRON_RULE | TF-05_DRIFT_LOCK | 2026-03-21**
