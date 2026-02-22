# Team 40 → Team 30: תאום Build Alerts (MB3A, D34)
**project_domain:** TIKTRACK

**from:** Team 40 (UI Assets & Design)  
**to:** Team 30 (UI Integration)  
**date:** 2026-02-16  
**re:** MB3A Build Alerts — עמוד התראות (alerts.html, D34)  
**מקור:** [TEAM_31_TO_TEAM_10_MB3A_ALERTS_BUILD_ACK_AND_HANDOFF.md](../team_31/TEAM_31_TO_TEAM_10_MB3A_ALERTS_BUILD_ACK_AND_HANDOFF.md), [TEAM_10_MB3A_ALERTS_ACTIVATION.md](../team_10/TEAM_10_MB3A_ALERTS_ACTIVATION.md) §2.3, §2.4

---

## 1. אישור קלט והפעלה

Team 40 מאשרים קבלת **מסירת Blueprint Alerts** מ-Team 31 והפעלה ל-**Build Alerts (D34)**. קלט חובה:

- **Scope Lock:** `_COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md`  
- **Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/alerts_BLUEPRINT.html`  
- **תוכנית:** TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §4  

Route: **alerts**. תפריט: **נתונים → התראות**.

---

## 2. חלוקת אחריות (SLA 30/40)

| צוות | אחריות |
|------|--------|
| **Team 30** | אינטגרציה UI — מימוש עמוד לפי Blueprint ו-Scope Lock; לוגיקה, data-action; תאום עם 31 ו-40. |
| **Team 40** | UI Assets וסטיילינג — CSS, classes, עקביות ל־phoenix-base/components/header/D15_DASHBOARD. **ללא** לוגיקה או API. |

---

## 3. כפתורי סינון (filter-icon-btn)

לפי הערת Team 31: בבלופרינט ייתכן inline styles בכפתורי סינון; יש להעביר ל-**classes**.

**המחלקות כבר קיימות** מ-Notes (D35) ב־`phoenix-components.css` — חלות גם על Alerts (D34):

- `filter-buttons-container` — עטיפה לסדרת איקונים בכותרת  
- `filter-icon-btn` — כפתור איקון (36×36, רקע ניטרלי, מסגרת)  
- `filter-icon-btn--active` — מצב נבחר (רקע לבן, מסגרת 2px ב־--color-brand)  

מיפוי איקונים כמו ב-Notes: all → notes.svg (או alerts.svg לעמוד התראות לפי Blueprint), account → trading_accounts.svg, trade → trades.svg, trade_plan → trade_plans.svg, ticker → tickers.svg.  
נתיב: `/images/icons/entities/`.  
**אין צורך ב-classes חדשים** — להחליף inline styles במחלקות האלה.

---

## 4. סנכרון וסגירה

- עובדים מאותו Blueprint ואותו Scope Lock.  
- סגירה: **רק עם Seal (SOP-013)** — כל צוות מסגיר את חלקו ב-Seal נפרד לפי נוהל.

---

**log_entry | TEAM_40 | TO_30 | MB3A_BUILD_ALERTS_COORDINATION | 2026-02-16**
