date: 2026-03-26
historical_record: true

# Team 10 → Team 70 | S003-P004-WP001 — מנדט מחייב: ספר הפעלה (G3_PLAN) + סגירת חבילה תיעודית סופית

**id:** TEAM_10_TO_TEAM_70_S003_P004_WP001_ACTIVATION_BOOK_PROMOTION_MANDATE_v1.0.0.md  
**from:** Team 10 (Gateway — TikTrack)  
**to:** Team 70 (Documentation Operations — TikTrack documentation lane)  
**cc:** Team 101, Team 100, Nimrod  
**date:** 2026-03-26  
**work_package_id:** S003-P004-WP001  
**program_id:** S003-P004  
**domain:** tiktrack  
**status:** ACTION_REQUIRED — **חובה** (אין השארת SSOT לספר הפעלה רק תחת `team_10`)  

**לביצוע בפועל — השתמשו בפרומט הקנוני המאוחד:**  
`TEAM_10_TO_TEAM_70_S003_P004_WP001_PACKAGE_CLOSURE_CANONICAL_PROMPT_v1.0.0.md` (סדר משימות + Definition of Done לפינוי במה).

---

## 1) הגדרה: מהו «ספר ההפעלה» בחבילה זו

| מונח | משמעות | מקור נוכחי (לא מספיק כ־SSOT קוראים) |
|------|--------|--------------------------------------|
| **ספר הפעלה** | מסמך **G3_PLAN / Work Plan** שמפעיל צוותי ביצוע (20/30/50) וממופה ב־verdicts | `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` |

**דרישת Gateway:** גרסה **קנונית מלאה** של אותו תוכן (או מיזוג מבוקר עם D1 ממנדט התיעוד הכללי) חייבת לשבת תחת **`documentation/`**, בשם קבצים ובנתיב העקביים עם שאר תיעוד TikTrack, **רשומה באינדקס**. לא ניתן להשאיר את ספר ההפעלה כ־**מקור אמת יחיד** רק בתיקיית צוות 10.

---

## 2) משימות חובה (ביצוע צוות 70)

### AB1 — פרסום קנוני תחת `documentation/`

- העתיקו את **גוף** ספר ההפעלה (תוכן ה־G3_PLAN בשלמותו, כולל כותרות/טבלאות/§ הרלוונטיים) לנתיב קנוני תחת **`documentation/docs-system/`** (בחרו תת־תיקייה עקבית עם `documentation/docs-system/00_INDEX.md` ועם מבנה קיים — למשל **`08-PRODUCT/`** לחבילת D33, או **`01-ARCHITECTURE/`** אם זה המקובל אצלכם ל־WP packages; **אל תיצרו עץ חדש** בלי רישום באינדקס).
- **שם קובץ קנוני** (דוגמה; התאימו לקונבנציית השמות באותה תיקייה):  
  `D33_S003_P004_WP001_G3_EXECUTION_WORK_PLAN_v1.0.0.md`  
  או שם אחר **עקבי** עם קבצי WP/D33 באותה ספרייה — רשמו את השם הסופי במפורש ב־`TEAM_70_..._DOCUMENTATION_CLOSURE`.

### AB2 — רישום באינדקס (חובה)

- עדכנו **`documentation/docs-system/00_INDEX.md`** — שורה/טבלה שמפנה לספר ההפעלה הקנוני של WP001.
- אם לפי נוהל הפרויקט נדרש גם קישור מ־**`00_MASTER_INDEX.md`** (שורש repo) לתיעוד TikTrack של חבילה סגורה — **הוסיפו** בהתאם לתבנית הקיימת שם (ללא שכפול מיותר).

### AB3 — צומת `_COMMUNICATION/team_10/` אחרי הפרסום

- **אחרי** שקיים הקובץ הקנוני תחת `documentation/` והאינדקס מעודכן:  
  החליפו את `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` ב־**stub קצר** (מקסימום ~25 שורות) שמציין:
  - נתיב מלא ל־**SSOT קוראים** ב־`documentation/`
  - תאריך העברה (אמת)
  - הערה: verdicts היסטוריים עשויים עדיין לצטט את הנתיב הישן — **אין למחוק** עדויות צוותים אחרים

### AB4 — סנכרון עם Team 101 (pipeline / work_plan)

- שדה `work_plan` ב־`_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` מכיל טקסט משובץ שמפנה לשם הקובץ הישן. **צוות 70 לא משנה JSON לבד** אלא אם Team 101 אישר במפורש.
- **חובה:** ב־`TEAM_70_S003_P004_WP001_DOCUMENTATION_CLOSURE_v1.0.0.md` (או גרסה מאוחדת) ציינו בקשה מפורשת ל־**Team 101** לעדכן את שורת ה־`Document:` בתוך ה־`work_plan` המשובץ (או מדיניות חלופית שאושרה) כך שתצביע על **הנתיב הקנוני** ב־`documentation/`.

### AB5 — סגירת חבילה תיעודית סופית (ניקיון)

- השלימו גם את **D1–D4** מ־`TEAM_10_TO_TEAM_70_S003_P004_WP001_DOCUMENTATION_MANDATE_v1.0.0.md` אם עדיין לא סגור.
- עדכנו **`TEAM_10_S003_P004_WP001_REMAINING_ARTIFACTS_INDEX_v1.0.0.md`** (דרך בקשה ל־Team 10 או כחלק מ־Seal אם נפתח PR משותף) — או רשמו ב־closure של צוות 70 את רשימת העדכונים הנדרשים לאינדקס צוות 10.
- **אין** למחוק verdicts / מימוש / QA של צוותים אחרים; **אין** להשאיר עותק מלא כפול של ספר הפעלה כ־SSOT רק ב־`team_10` אחרי AB3.

---

## 3) פלט מבוקש (צוות 70)

עדכנו או הרחיבו:

`_COMMUNICATION/team_70/TEAM_70_S003_P004_WP001_DOCUMENTATION_CLOSURE_v1.0.0.md`

כך שיכלול במפורש:

| סעיף | תוכן |
|------|------|
| קבצים קנוניים | נתיב מלא לספר ההפעלה תחת `documentation/` |
| אינדקס | אילו אינדקסים עודכנו (`00_INDEX.md`, `00_MASTER_INDEX.md` אם רלוונטי) |
| Stub | אישור ש־`TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` הוחלף ב־pointer |
| Team 101 | בקשת עדכון `pipeline_state_tiktrack.json` / `work_plan` |
| תאריך | תאריך ביצוע אמיתי (2026-03-26 או מאוחר יותר) |
| סטטוס | `PACKAGE_DOCUMENTATION_FINALLY_CLOSED` כשהכול בוצע |

---

## 4) English — execution block (Cursor / agent)

You are **Team 70**. Execute **AB1–AB5**. Write canonical content under `documentation/docs-system/` only in paths you own. Write closure evidence under `_COMMUNICATION/team_70/`. Do not delete other teams’ verdict files. Do not edit `pipeline_state_tiktrack.json` without explicit Team 101 approval — **request** that update in your closure doc.

---

**log_entry | TEAM_10 | S003_P004_WP001 | TO_TEAM_70 | ACTIVATION_BOOK_PROMOTION_MANDATE | 2026-03-26**
