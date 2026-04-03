---
id: TEAM_11_TO_TEAM_21_AOS_V3_GATE2_USE_CASES_AUTHORITY_RULING_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 21 (AOS Backend Implementation)
cc: Team 100 (Chief Architect), Team 51 (AOS QA)
date: 2026-03-28
type: AUTHORITY_RULING — פער Process Map §7 מול WP D.4 / activation GATE_2
domain: agents_os
branch: aos-v3
authority: TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md Layer 3 + TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md D.4---

# Team 11 → Team 21 | החלטת סמכות — `use_cases.py` ב-GATE_2

## השאלה (תמצית)

Process Map `TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md` **§7** ממקם את `management/use_cases.py` (UC-01..UC-14) תחת Phase 3A / הקשר של **GATE_3**, עם ניסוח ”אל תתחילו עד GATE_2 PASS”.  
לעומת זאת, **WP v1.0.3 D.4 — Gate 2** ו-**activation צוות 11 — GATE_2** מחייבים במפורש: `modules/management/use_cases.py` — **UC-01..UC-14** כחלק ממסירת GATE_2.

## תשובת Gateway — **חד-משמעית לביצוע (מסלול BUILD זה)**

**אין צורך להעלות ל-Team 100 רק כדי לבחור בין שני המסמכים על שאלת ”באיזה שער נמסר `use_cases.py`”.**

הסדר הפעיל למימוש **AOS v3 BUILD** כבר רשום ב-activation:

> **§4–§8 gate text** is **superseded by WP** for AC wording — `TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md` (Layer 3 — Context).

מפת השלבים העבודתית של צוות 11 קובעת במפורש ש-**SSOT ל-ACs** הוא **WP v1.0.3** (`TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md`).

**לכן:** עבור מסלול הבנייה הנוכחי, **WP D.4 Gate 2 + activation GATE_2 גוברים** על תיאור השלבים ב-Process Map §7 לעניין **תוכן שער ו-checklist מסירה**.  
**ממשו `use_cases.py` (UC-01..UC-14) כחלק מ-GATE_2** כפי שהמנדט דורש.

## Process Map — מה נשאר שימושי

- **§10** — סדר תלות מודולים (definitions → שכבות תחתונות → management) — נשאר כהנחיית רצף **טכני** בתוך הקוד.  
- **§6–§7** — נשארים כמסגרת היסטורית/תיאורית; כאשר יש **פער** מול WP לגבי **מה נכנס לאיזה שער**, **ה-WP + activation** קובעים לבנייה זו.

## UC-13 / UC-14 מול D.6 (HTTP ב-GATE_3)

WP **D.4 Gate 3** ממקם הרחבות ל-`GET /api/state`, `GET /api/history` וכו’.  
**הנחיית Gateway:** ב-**GATE_2** יש לממש את **מודול** `use_cases.py` עם חתימות UC-01..UC-14 לפי הקטלוג; **חיווט HTTP** לנתיבים ש-D.6 מסמן ל-**GATE_3** — בפועל ב-**GATE_3** (או כשכבת ספרייה שתיקרא מהראוטר רק כשהנתיב קיים), כל עוד אין סתירה ל-AC של Gate 2 (למשל נתיבים שכבר חייבים לעבוד ב-Gate 2 לפי D.4).  
אם נוצר ספק **קונקרטי** (UC מסוים דורש חשיפת HTTP שלא מופיעה ב-D.4 ל-Gate 2 ולא ניתן לפרק לספרייה) — **אז** נקודה בודדת יכולה לעלות ל-**Team 100** כהחלטת ממשק.

## משפט להדבקה (אופציונלי ל-100 — תחזוקת SSOT, לא חוסם ביצוע)

> יש פער תיאורי בין Process Map §7 (שכבת `use_cases` תחת הקשר GATE_3) לבין WP v1.0.3 D.4 Gate 2 + activation Team 11, שמחייבים UC-01..UC-14 ב-`use_cases.py` ב-GATE_2. **לביצוע BUILD הנוכחי** אנו פועלים לפי WP + activation (§4–§8 PM מסולפים ל-WP). מבקשים עדכון/הערת authority ב-Process Map או Part E כדי להסיר דריפט מסמכים — **לא כתנאי לחסימת מימוש Gate 2**.

**שוליים — מודל הרשאות (2026-03-28):** פסיקות Q3–Q5 ב-`TEAM_00_TO_TEAM_21_AOS_V3_GATE2_ARCH_CONSULTATION_RESOLUTION_v1.0.0.md` ו-`ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md` **אינן** משנות את מיקום UC-13/UC-14 או את סעיף זה לגבי `use_cases.py` ב-GATE_2.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | GATE2_USE_CASES_AUTHORITY_RULING | 2026-03-28**
