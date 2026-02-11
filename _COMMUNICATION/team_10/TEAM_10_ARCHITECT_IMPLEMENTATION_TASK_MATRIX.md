# מטריצת משימות יישום — ADR-013 + SOP-012 + PROMPTS FOR THE FIELD

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_ARCHITECT_OFFICIAL_RESPONSE_AND_PROMPTS.md`, `ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR-013), `ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md` (SOP-012)  
**סטטוס:** 📋 **מנדט יישום — חלוקה לצוותים**

---

## 1. מקור והנחיות

- **ADR-013:** מודל A/B/C/D, Broker API, Rich-Text TipTap, Buttons .phx-btn, עתיד user_tier/required_tier.
- **SOP-012:** TipTap (Starter Kit + Link + TextStyle + Attributes), סגנונות `.phx-rt--*`, סניטיזציה FE/BE, Design System Page (Type D). **Allowlist מפורש ל-DOMPurify:** `SOP_012_DOMPURIFY_ALLOWLIST.md`.
- **PROMPTS:** Team 10 — MAPPING_REQUIRED, אין אישור קוד ללא מיפוי; Team 90 — סריקה: אין Inline Style ב-Editor, סניטיזציה בשרת.

---

## 2. מטריצת משימות (לפי צוות)

### Team 10 — The Gateway

| מזהה | משימה | מקור | סטטוס / הערה |
|------|------|------|--------------|
| **T10.1** | לנסח ולתעד את מצב **MAPPING_REQUIRED**: מתי חל, איפה מתועד (ORDER / Work Plan). | PROMPTS | |
| **T10.2** | **לא לאשר** כתיבת קוד ללא אישור המיפויים per ADR-011 (Routes Map, Data Map, CSS Plan). לתעד בתהליך/צ'קליסט. | PROMPTS, ARCHITECT_PRE_CODING_MAPPING_MANDATE | |
| **T10.3** | לוודא ש־Endpoint ברוקרים קיים — רשום כהושלם; לשמור בצ'קליסט עדכון. | ADR-013, PROMPTS | ✅ הושלם (GET /api/v1/reference/brokers) |
| **T10.4** | להפיץ מטריצה זו ומסמכי המנדט לצוותים; לעדכן Evidence Log. | — | |

---

### Team 20 — Backend

| מזהה | משימה | מקור | סטטוס / הערה |
|------|------|------|--------------|
| **T20.1** | **GET /api/v1/reference/brokers** — Endpoint פעיל ומוכן. | ADR-013 | ✅ הושלם (מאושר Team 10) |
| **T20.2** | **סניטיזציה בשרת:** ליישם סניטייזר ב־Python לכל תוכן Rich-Text לפני שמירה ל-DB. **חוק:** רק תגיות/תכונות מאושרות; רק קלאסים שמתחילים ב־`phx-rt--` מאושרים. | SOP-012 §2 | |
| **T20.3** | **אימות BE לשדות HTML:** לאשר שה־HTML המסונן **נשמר במלואו** ל-DB **ולא נחתך** (אורך, encoding, שמירת תגיות/קלאסים מאושרים). | SOP-012 §2 | דרישה רשמית |
| **T20.4** | (עתידי) תמיכה ב־**user_tier** ו־**required_tier** ב־JWT ו־contract כשהמוצר ידרוש פרימיום. | ADR-013 §3 | מוכנות לעתיד |

---

### Team 30 — Bridge / Containers / FE Logic

| מזהה | משימה | מקור | סטטוס / הערה |
|------|------|------|--------------|
| **T30.1** | **Broker Select:** שימוש ב־GET /api/v1/reference/brokers בטפסים (D16, D18, D21) — dynamic select; value/label לפי DATA_MAP. | ADR-013, משימה 1 בתוכנית | תואם Task 3 (API הושלם) |
| **T30.2** | **Rich-Text Editor:** להחליף textarea ב־**TipTap** (Starter Kit + Link + TextStyle + Attributes) בשדות description/notes. | ADR-013, SOP-012, משימה 2 | |
| **T30.3** | **כפתור "סגנון" (Styles):** להזריק רק מחלקות DNA — `.phx-rt--success`, `.phx-rt--warning`, `.phx-rt--danger`, `.phx-rt--highlight`. **אסור** Inline Style בתוך ה־Editor. | SOP-012 §1, PROMPTS (90) | |
| **T30.4** | **סניטיזציה בצד לקוח:** שימוש ב־**DOMPurify** עם Allowlist קשיח — **רשימה מפורשת:** תגיות, attributes, יישור רק ב-class (אין `style`). ראה `SOP_012_DOMPURIFY_ALLOWLIST.md`. | SOP-012 §2 | |
| **T30.5** | **דף Design System (/admin/design-system):** העמוד הוא **React Type D**; כולל **טבלת Rich-Text Styles** כחלק מהעמוד (מילון הסגנונות לפי SOP-012). Guard לפי JWT role. תיאום עם Team 40. | SOP-012 §3, ADR-013 (Type D) | |
| **T30.6** | (אם טרם הושלם) מודל A/B/C/D: Redirect C→Home, Type B שני containers, User Icon success/warning — לפי Work Plan §4. | ADR-013 §1 | ראה TEAM_10_VISUAL_GAPS_WORK_PLAN |

---

### Team 40 — Presentational / DNA

| מזהה | משימה | מקור | סטטוס / הערה |
|------|------|------|--------------|
| **T40.1** | **SSOT כפתורים (.phx-btn):** DNA_BUTTON_SYSTEM — מחלקות ותקנון. | ADR-013 | ✅ הושלם (מאושר Team 10) |
| **T40.2** | **מחלקות Rich-Text ב-DNA:** להגדיר ב־CSS את `.phx-rt--success`, `.phx-rt--warning`, `.phx-rt--danger`, `.phx-rt--highlight` (צבעים/משתנים מהפלטה). | SOP-012 §1 | |
| **T40.3** | **Design System Page:** העמוד הוא React Type D; כולל **טבלת Rich-Text Styles** כחלק מהעמוד (לפי SOP-012). לתת רכיב/טבלה להצגת מילון הסגנונות (Rich Text + כפתורים) — תיאום עם Team 30. | SOP-012 §3 | |

---

### Team 50 — QA

| מזהה | משימה | מקור | סטטוס / הערה |
|------|------|------|--------------|
| **T50.1** | **שער ב' / Regression:** לוודא רשימת ברוקרים מ־API; Rich-Text ללא Inline Style; סניטיזציה (FE + BE) פועלת. | ADR-013, SOP-012 | בהתאם לתוכנית Gate B |
| **T50.2** | **Design System (Type D):** לוודא גישה ל־/admin/design-system רק למשתמש עם תפקיד מנהל; אורח/לא־מנהל מופנה. | ADR-013 §1 (D) | |

---

### Team 90 — The Spy

| מזהה | משימה | מקור | סטטוס / הערה |
|------|------|------|--------------|
| **T90.1** | **סריקה:** לוודא שאף מפתח לא משתמש ב־**Inline Style** בתוך ה־Rich-Text Editor. | PROMPTS, SOP-012 | מנדט סריקה |
| **T90.2** | **סריקה:** לוודא ש־**סניטיזציה** מיושמת **בשרת** (Python) לפני שמירה ל-DB. | PROMPTS, SOP-012 §2 | מנדט סריקה |

---

## 3. סיכום אחריות

| צוות | משימות פעילות (לא הושלמו) | משימות שהושלמו |
|------|---------------------------|-----------------|
| **10** | T10.1, T10.2, T10.4 | T10.3 |
| **20** | T20.2, T20.3 | T20.1; T20.4 עתידי |
| **30** | T30.1, T30.2, T30.3, T30.4, T30.5, T30.6 (אם רלוונטי) | — |
| **40** | T40.2, T40.3 | T40.1 |
| **50** | T50.1, T50.2 | — |
| **90** | T90.1, T90.2 | — |

---

## 4. נספח Allowlist (SOP-012)

**קובץ:** `_COMMUNICATION/team_10/SOP_012_DOMPURIFY_ALLOWLIST.md`  
תגיות מותרות, attributes מותרים, יישור רק ב-class (אין `style`). **חובה** ל־T30.4 (DOMPurify); תאימות ל־T20.2/T20.3 (BE).

---

## 5. מסמכי מנדט לצוותים

| צוות | מסמך מנדט |
|------|-----------|
| Team 10 (עצמי) | `TEAM_10_OWN_ARCHITECT_IMPLEMENTATION_TASKS.md` |
| Team 20 | `TEAM_10_TO_TEAM_20_ARCHITECT_IMPLEMENTATION_TASKS.md` |
| Team 30 | `TEAM_10_TO_TEAM_30_ARCHITECT_IMPLEMENTATION_TASKS.md` |
| Team 40 | `TEAM_10_TO_TEAM_40_ARCHITECT_IMPLEMENTATION_TASKS.md` |
| Team 50 | `TEAM_10_TO_TEAM_50_ARCHITECT_IMPLEMENTATION_TASKS.md` |
| Team 90 | `TEAM_10_TO_TEAM_90_ARCHITECT_IMPLEMENTATION_TASKS.md` |

---

## 6. תיקוני דיוק לפני הפצה (בוצעו)

- **Allowlist מפורש:** `SOP_012_DOMPURIFY_ALLOWLIST.md` — רשימה מחייבת ל-DOMPurify (תגיות, attributes, align רק ב-class).
- **T20.3:** אימות BE — HTML נשמר במלואו ולא נחתך.
- **Design System:** העמוד React Type D; כולל טבלת Rich-Text Styles כחלק מהעמוד (SOP-012).

---

**Team 10 (The Gateway)**  
**log_entry | ARCHITECT_IMPLEMENTATION_TASK_MATRIX | 2026-02-10**
