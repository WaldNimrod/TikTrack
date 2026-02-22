# Team 30 → Team 40: בקשת מידע — מחלקות לכפתורי פילטר (עמוד הערות D35)
**project_domain:** TIKTRACK

**from:** Team 30 (Frontend)  
**to:** Team 40 (UI Assets & Design)  
**date:** 2026-02-16  
**re:** MB3A Notes — כפתורי סינון לפי סוג ישות מקושרת  
**מקור:** [TEAM_40_TO_TEAM_30_MB3A_BUILD_NOTES_COORDINATION.md](../team_40/TEAM_40_TO_TEAM_30_MB3A_BUILD_NOTES_COORDINATION.md) §3.1

---

## 1. רקע

Team 30 ממשים כעת את עמוד הערות (notes.html, D35) לפי Blueprint.  
לפי Gate-0 ו־TT2_BLUEPRINT_HANDOFF_REQUIREMENTS: כפתורי הסינון בבלופרינט משתמשים ב־**inline styles**; במסירה נדרש מעבר ל־**classes**.

---

## 2. בקשת מידע

**נדרש:** שם המחלקות (classes) לכפתורי פילטר לפי סוג ישות — למימוש סינון הטבלה.

| כפתור | `data-filter-type` | איקון (Blueprint) |
|-------|-------------------|-------------------|
| הצג הכל | `all` | notes.svg |
| חשבונות | `account` | trading_accounts.svg |
| טריידים | `trade` | trades.svg |
| תוכניות | `trade_plan` | trade_plans.svg |
| טיקרים | `ticker` | tickers.svg |

**מצב כפתור:** פעיל (נבחר) vs לא פעיל — האם יש classes נפרדות (למשל `filter-icon-btn--active`)?

---

## 3. מיקום בבלופרינט

- **קובץ:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/notes_BLUEPRINT.html`  
- **שורות:** 1522–1536 (כפתורי filter-icon-btn)

---

## 4. תלות

Team 30 יכול להתחיל עם inline styles מהבלופרינט; **החלפה ל-classes** תתבצע מיד עם קבלת המידע מצדכם.

---

**log_entry | TEAM_30 | TO_40 | NOTES_FILTER_BUTTONS_CLASSES_REQUEST | 2026-02-16**
