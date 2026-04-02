---
id: TEAM_11_TO_TEAM_170_AOS_V3_CANONICAL_PROMOTION_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 170 (Spec & Governance Authority)
cc: Team 71 (AOS Documentation), Team 10 (Gateway), Team 00 (Principal)
date: 2026-03-29
type: MANDATE — קידום קאנוני (אחרי תיקוני v3 ישירים)
domain: agents_os + governance
branch: aos-v3
authority:
  - .cursorrules (Knowledge Promotion Protocol)
  - TEAM_11_AOS_V3_UI_DIRECT_FIXES_CLOSURE_v1.0.0.md
  - AGENTS.md (מקטע AOS v3)---

# Team 11 → Team 170 | קידום קאנוני — יישור AOS v3 אחרי סגירת זנבות

## מטרה

ליישר את **מקור האמת התיעודי** עם מצב הקוד וההפעלה בפועל אחרי סדרת תיקונים ישירים ב־`agents_os_v3/` (ללא חבילת WP נפרדת), ולעדכן אינדקסים קנוניים כנדרש — **בלי המצאת שדות** ובהתאם ל־**Knowledge Promotion** (קידום דרך בעל התיעוד, לא מעקף מצוותי מימוש).

## היקף עבודה (בעלות Team 170)

### 1) סריקת drift (חובה)

השוו בין:

| מקור | שימוש |
|------|--------|
| `AGENTS.md` | טבלת **AOS v3** (כולל שורת *Direct UI fixes* ו־`FILE_INDEX` / pre-commit) |
| `agents_os_v3/ui/*.html`, `app.js`, `style.css` | התנהגות UI (דומיין Type A/B, ניווט, טבלאות) |
| `documentation/docs-agents-os/**/AGENTS_OS_V3_*.md` | ארכיטקטורה, פורטים, Runbook, Checklist |
| `00_MASTER_INDEX.md` (שורש) | אם נדרש קישור או הערת מצב ל־v3 |

זיהוי: פערים בין מה שכתוב לבין מה שרץ (פורטים, נתיבי UI, E2E, mock, שני טיפוסי דומיין).

### 2) קידום קנוני (לפי צורך)

- עדכון או הוספת פסקאות **רק** בנתיבים ש־**Team 170** מחזיק (governance + `documentation/docs-agents-os/` לפי תחום).
- עדכון **מאסטר אינדקס** קשור (repo root או `documentation/docs-governance/` — לפי נוהל הקיים) כאשר יש שינוי נקודת כניסה או הפניה חובה.
- **אין** לערוך `agents_os_v3/` במסגרת מנדט זה (מימוש נשאר ב־21/31); אם נדרש GIN — פרסמו בקשה מפורשת ל־Gateway.

### 3) תיאום עם Team 71

אם נדרש תוכן טכני ארוך (Runbook, Overview) — **Team 71** יכולה להכין טיוטה; **Team 170** מאשרת קנוניזציה ומיקום קובץ.

## מסירה חזרה ל־Team 11

קובץ תחת `_COMMUNICATION/team_170/`:

`TEAM_170_TO_TEAM_11_AOS_V3_CANONICAL_PROMOTION_RECEIPT_v1.0.0.md`

חובה:

| שדה | תוכן |
|-----|------|
| **תאריך** | תאריך אמת |
| **רשימת קבצים קנוניים** | נתיבים מלאים שעודכנו (או *אין שינוי — drift לא נמצא*) |
| **החלטות** | תמצית (מה יושב בקנון, מה נשאר ב־AGENTS.md בלבד) |
| **הפניה ל־Team 10** | אם נדרש עדכון אינדקס Gateway / ניתוב חבילה |

## קריטריוני קבלה (Gateway)

- יש מסמך מסירה חתום בתאריך.
- אין סתירה פתוחה בין `AGENTS.md` לבין מסמכי `AGENTS_OS_V3_*` ללא הסבר בקבלה.
- חבילה חדשה בפיפליין לא מתחילה לפני **קבלת מסירה** (או החלטת Principal/00 לחריג מפורש).

## איסורים

- שינוי **SSM/WSM** או חוקת צוותים — רק לפי מנדט Team 00/100.
- מחיקת ארטיפקטים תחת `_COMMUNICATION/team_11/` בלי תיאום Gateway.

---

**log_entry | TEAM_11 | AOS_V3 | T170_CANONICAL_PROMOTION_MANDATE | ISSUED | 2026-03-29**
