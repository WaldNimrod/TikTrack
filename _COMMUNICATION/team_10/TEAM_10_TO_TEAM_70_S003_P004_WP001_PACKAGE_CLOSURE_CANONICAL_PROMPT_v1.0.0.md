date: 2026-03-26
historical_record: true

# Team 10 → Team 70 | S003-P004-WP001 — פרומט קנוני מאוחד לסגירת חבילה (פינוי במה)

**id:** TEAM_10_TO_TEAM_70_S003_P004_WP001_PACKAGE_CLOSURE_CANONICAL_PROMPT_v1.0.0.md  
**from:** Team 10 (Gateway — TikTrack)  
**to:** Team 70 (Documentation Operations — TikTrack documentation lane)  
**cc:** Team 101, Team 100, Nimrod  
**date:** 2026-03-26  
**work_package_id:** S003-P004-WP001  
**program_id:** S003-P004  
**page / module:** D33 — הטיקרים שלי (`user_tickers`)  
**domain:** tiktrack  
**status:** ACTION_REQUIRED — **נקודת כניסה יחידה** לסגירת התיעוד של החבילה  

---

## מטרה

**לסגור תיעודית** את חבילת **S003-P004-WP001** כך שניתן **לפנות את הבמה** לנושא הבא.  
פרומט זה **מקבץ** את כל החובות מתוך:

- `TEAM_10_TO_TEAM_70_S003_P004_WP001_DOCUMENTATION_MANDATE_v1.0.0.md` (D1–D4)  
- `TEAM_10_TO_TEAM_70_S003_P004_WP001_ACTIVATION_BOOK_PROMOTION_MANDATE_v1.0.0.md` (AB1–AB5)  

**אין צורך** לפצל ביצוע בין שני הקבצים — **בצעו לפי סעיף 3 להלן בסדר**.

---

## מקורות אמת (קריאה לפני כתיבה)

| סוג | נתיב |
|-----|------|
| LOD200 (LOCKED) | `_COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md` |
| LLD400 | `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md` |
| סגירת Gateway (AS_MADE) | `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_GATE_5_AS_MADE_CLOSURE_v1.0.0.md` |
| ספר הפעלה (G3_PLAN — מקור להעתקה) | `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` |
| מימוש / QA / verdicts | כמפורט ב־AS_MADE §3 |

**איסור:** אין להמציא שמות שדות API, נתיבים או מצב מימוש.

---

## סדר ביצוע (checklist)

סמנו ✓ ב־`TEAM_70_S003_P004_WP001_DOCUMENTATION_CLOSURE_v1.0.0.md` או בטבלת סגירה פנימית שלכם.

| # | משימה | תיאור קצר |
|---|--------|-----------|
| **1** | **D1 — סיכום מימוש** | פרסמו תחת `documentation/docs-system/` סיכום מימוש ל־D33: מודול, נתיבי קבצים עיקריים, נקודות API (`GET/POST/PATCH/DELETE` תחת `/api/v1/me/tickers`), Iron Rules D33-IR-01…07 ברמת «מה יושם». עקבו אחר מבנה תיקיות קיים. |
| **2** | **AB1 — ספר הפעלה קנוני** | העתיקו את **גוף** ה־G3_PLAN (תוכן מלא) לקובץ קנוני תחת `documentation/docs-system/` (למשל `08-PRODUCT/`); שם קובץ עקבי — רשמו את הנתיב הסופי בסגירה. |
| **3** | **D2 + AB2 — אינדקסים** | עדכנו `documentation/docs-system/00_INDEX.md` כך שיופיעו **גם** סיכום המימוש **וגם** ספר ההפעלה. אם הנוהל אצלכם מחייב — הוסיפו קישור מתאים ב־`00_MASTER_INDEX.md` (שורש repo). |
| **4** | **D3 — Drift** | ציינו במפורש: אין drift בין LLD400 למימוש, **או** חריגים מתועדים בלבד (למשל OBS-102) — בלי הנחות. |
| **5** | **D4 — היגיינה** | אל תמחקו verdicts / מימוש / QA של צוותים אחרים. routing של Team 10 כבר בארכיון: `_COMMUNICATION/99-ARCHIVE/2026-03-26_S003_P004_WP001_team10_routing/`. |
| **6** | **AB3 — stub ב־team_10** | **רק אחרי** שקיימים הקבצים הקנוניים והאינדקס מעודכן: החליפו את `TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` ב־stub קצר (~≤25 שורות) עם נתיב SSOT ב־`documentation/` + תאריך + הערה על ציטוטים היסטוריים ב־verdicts. |
| **7** | **AB4 — Team 101** | בקשו במפורש מ־Team 101 לעדכן את שורת `Document:` / ההפניה בתוך `work_plan` ב־`pipeline_state_tiktrack.json` לנתיב הקנוני — **אל תערכו את ה־JSON בלי אישור Team 101**. |
| **8** | **AB5 — אינדקס צוות 10** | רשמו בסגירה אם נדרש עדכון ל־`TEAM_10_S003_P004_WP001_REMAINING_ARTIFACTS_INDEX_v1.0.0.md` (או שלחו שורת diff/הנחיה ל־Team 10). |

---

## פלט חובה (ארטיפקט סגירה)

נתיב קבוע:

`_COMMUNICATION/team_70/TEAM_70_S003_P004_WP001_DOCUMENTATION_CLOSURE_v1.0.0.md`

**חייב לכלול:**

1. טבלת checklist (שורות 1–8) עם סטטוס ✓  
2. רשימת **כל** הקבצים שנוצרו/עודכנו תחת `documentation/` (נתיבים מלאים)  
3. אילו אינדקסים עודכנו  
4. אישור ביצוע **AB3** (stub)  
5. בלוק בקשה ל־**Team 101** (pipeline / `work_plan`)  
6. **תאריך ביצוע אמיתי** (לא placeholder)  
7. הצהרות סטטוס: **`READY_FOR_TEAM_101_REVIEW`** + **`PACKAGE_DOCUMENTATION_FINALLY_CLOSED`** כאשר כל הסעיפים הושלמו  

---

## Definition of Done (פינוי במה)

החבילה נחשבת **תיעודית סגורה מבחינת צוות 70** כאשר:

- קיימים קבצים קנוניים תחת `documentation/` (סיכום מימוש + ספר הפעלה)  
- האינדקסים מצביעים עליהם  
- stub ב־`team_10` פעיל (אין SSOT מלא של G3 רק ב־`team_10`)  
- קובץ הסגירה תחת `team_70` הוגש עם כל הסעיפים לעיל  

**אחרי זה** Team 10 יכול לסמן את נושא ה־WP כסגור מתיעוד TikTrack ולהתקדם לנושא הבא; **Team 101** מטפל ב־JSON לפי בקשתכם.

---

## English — single execution block (Cursor / agent)

You are **Team 70**. Execute **rows 1–8 in order**. Write only to `documentation/` (canonical tree) and `_COMMUNICATION/team_70/`. Do not delete other teams’ evidence. Do not edit `pipeline_state_tiktrack.json` without explicit Team 101 approval — request the update in your closure file. No invented API fields; plural resource naming per project rules.

---

**log_entry | TEAM_10 | S003_P004_WP001 | TO_TEAM_70 | PACKAGE_CLOSURE_CANONICAL_PROMPT | 2026-03-26**
