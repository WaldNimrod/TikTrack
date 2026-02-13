# Team 10 → Team 90: תגובה למנדט Roadmap v2.1 — תוכניות Stage‑1, Stage‑1b ויישור

**id:** `TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN`  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (The Spy)  
**date:** 2026-02-13  
**revised:** 2026-02-13 (תיקונים לפי Team 90 — ללא TBD, SSOT יחיד, Stage‑1b חסימה, Blueprint drift, Precision Audit)  
**re:** TEAM_90_TO_TEAM_10_ROADMAP_V2_1_LOCK_AND_STAGE1_ACTIVATION.md  
**status:** 🔒 **MANDATORY — Revised per Team 90 Required Fixes**

---

## 1) אימוץ Roadmap v2.1 — SSOT

- **אימוץ:** Team 10 מאמץ את `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` כ-**SSOT מחייב** לכל באצ'ים עתידיים.
- **הפניה:** כל תוכניות עבודה ומשימות יישרו ל-Roadmap v2.1; סטייה = fail (לפי שער Team 90).

---

## 2) Stage‑1 — תוכנית עבודה (Blocking Batch 3)

**מיקום SSOT מחייב (חד‑משמעי):** כל מפרטי Stage‑1 יישמרו ב-**`documentation/01-ARCHITECTURE/`** — נתיב יחיד, ללא חריגה.

**מפרטי Stage‑1 (תאריכים מחייבים — ללא TBD):**

| # | Spec | תיאור קצר | בעלים | תלויות | תאריך התחלה | תאריך סיום |
|---|------|------------|--------|--------|--------------|------------|
| 1 | **FOREX_MARKET_SPEC** | אפיון שערים ומחירים | Team 20 (Backend) + Team 10 (תיעוד SSOT) | — | 2026-02-15 | 2026-02-22 |
| 2 | **MARKET_DATA_PIPE** | תשתית מחירי שוק | Team 20 + Team 60 (תשתית) | FOREX_MARKET_SPEC | 2026-02-23 | 2026-03-02 |
| 3 | **CASH_FLOW_PARSER** | פיענוח תזרימים | Team 20 (לוגיקה) + Team 10 (SSOT) | MARKET_DATA_PIPE (רלוונטי) | 2026-03-03 | 2026-03-10 |
| 4 | **Precision Audit** | ביקורת Precision (נתונים, שדות כספיים, Decimal) — דרישת אדריכל | Team 20 (מימוש) + Team 60 (DB) + Team 10 (Evidence) | — | 2026-02-15 | 2026-03-10 |

**Precision Audit — פירוט:** משימה נפרדת; Owner ראשי Team 20; Team 60 לאימות DB/שדות; Team 10 לאיסוף Evidence (דוח/לוג) והגשה ל-Team 90. Evidence נדרש לסגירת Stage‑1.

**קריטריוני קבלה (כפי שנדרש):**
- כל Spec קיים כ-SSOT ב-**`documentation/01-ARCHITECTURE/`** בלבד.
- כל Spec מפנה ל-Roadmap v2.1 + owners + dependencies + תוכנית ולידציה.
- **אין קידוד UI לבאץ' 3** לפני סגירת Stage‑1.
- Precision Audit: Evidence מתועד (Owner + Evidence).

**פעולות Team 10:**
- הפצת מנדט Stage‑1 ל-Team 20 (ול-Team 60 כנדרש) עם רשימת ה-Specs, התאריכים והקריטריונים.
- עדכון `TT2_OFFICIAL_PAGE_TRACKER.md` ומסמך ניהול — סטטוס Stage‑1 (OPEN until closed).

---

## 3) Stage‑1b — Template Contract & Factory

**🔴 סטטוס נוכחי: BLOCKED (חסום)**  
- `generate-pages.js` ו-`validate-pages.js` **לא קיימים** עדיין בקוד (`ui/scripts/`).  
- Stage‑1b נשאר **BLOCKED** עד ביצוע: יצירת שני הקבצים ב-`ui/scripts/` → הרצת `validate-pages.js` לכל עמוד Non‑Auth חדש → Evidence PASS מתועד בלוג הסגירה.  
- **קריטריון סגירה (חד‑משמעי):** Stage‑1b **לא נסגר** לפני שקיימים הקבצים **ו-**Evidence PASS מצורף ללוג הסגירה.

**חוזה SSOT (POL‑015):**
- **מיקום נוכחי:** `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT.md` — **כבר ב-SSOT** (אין צורך בהעברה).
- **פסיקה אדריכל:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_PAGE_TEMPLATE_AND_FACTORY.md` — מאושר: `.content.html` כדרך המלך, סקריפטים ב-`ui/scripts/`, Auth מוחרג.

**תוכנית Rollout Stage‑1b:**

| שלב | תוכן | בעלים | קריטריון |
|-----|------|--------|----------|
| 1 | וידוא חוזה ב-`documentation/` + הפניה ב-00_MASTER_INDEX | Team 10 | Contract בנתיב SSOT; רשום באינדקס |
| 2 | יצירת/הפעלת `ui/scripts/generate-pages.js` — הרכבת עמודים מ-`.content.html` | Team 30 (+ 10 תיאום) | הרצה מוצלחת לכל עמודי Non‑Auth רלוונטיים |
| 3 | יצירת/הפעלת `ui/scripts/validate-pages.js` — בדיקת מבנה DOM ו-CSS | Team 30 (+ 10 תיאום) | כל עמוד Non‑Auth חדש עובר ולידציה |
| 4 | Evidence: ריצות validation מוצלחות מתועדות | Team 10 | דוח Evidence עם פלט `validate-pages.js` PASS |

**חסימת סגירה (חובה — חסם פעיל מיידי):**  
Stage‑1b **לא נסגר** לפני:
1. **קיום הקבצים:** `ui/scripts/generate-pages.js` ו-`ui/scripts/validate-pages.js` קיימים בקוד.
2. **הרצה:** `validate-pages.js` הורץ לכל עמוד Non‑Auth חדש.
3. **Evidence PASS:** Evidence מתועד (לוג סגירה) עם פלט PASS מצורף.

**קריטריון סגירה סופי:** Stage‑1b לא נסגר לפני שקיימים הקבצים **ו-**Evidence PASS מצורף.

**קריטריוני קבלה (כפי שנדרש):**
- Contract מקודם למיקום SSOT — ✅ **ממוקם** `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT.md`.
- **קבצי Scripts קיימים:** `generate-pages.js`, `validate-pages.js` ב-`ui/scripts/` — חובה לפני סגירה.
- Template Factory פעיל לבאץ' 3 (`.content.html` → `generate-pages.js`).
- `validate-pages.js` עובר לכל עמוד Non‑Auth חדש.
- Team 10 מגיש Evidence logs עם ריצות validation מוצלחות (PASS).

---

## 4) יישור Routes / Menu / Blueprint (לפני Kickoff באץ' 3)

| משימה | תיאור | בעלים | תוצר |
|--------|--------|--------|------|
| **Routes SSOT** | עדכון `routes.json` (כרגע `ui/public/routes.json` v1.1.2) — לכלול את כל עמודי Roadmap v2.1 כולל דאשבורדים Tracking/Planning | Team 10 + Team 30 | `routes.json` מעודכן + תיעוד ב-Page Tracker / SSOT |
| **Menu Alignment** | עדכון `unified-header.html` — Tracking/Planning dashboards + פריטי משנה | Team 30 + Team 40 (מראה) | Header תואם ל-routes ו-Roadmap |
| **Blueprint Scope** | Team 31 מכסה כל עמוד מאושר ב-Roadmap v2.1; **טיפול ב‑Drift** (להלן) | Team 31 + Team 10 | מטריצת Blueprint ↔ Roadmap (אינדקס עמודים מאושרים) |

**Blueprint Scope Drift — טיפול מחייב:**  
עמודים שקיימים היום אצל Team 31 אך **אינם** ב-Roadmap v2.1 (api_keys, securities, research, management) — **חובה** אחת מהשתיים:
- **לסמן OUT OF SCOPE** ל-Roadmap v2.1 (לא חלק מבאץ' 3/יישור נוכחי), או  
- **החלטה רשמית** (אדריכל / G-Lead) לכלול אותם — ולתעד ב-SSOT.  
Team 10 יגיש רשימת עמודים + סטטוס (IN SCOPE / OUT OF SCOPE / ממתין להחלטה) לפני Kickoff באץ' 3.

**קריטריוני קבלה:** Evidence log: routes מעודכנים, menu מעודכן, מטריצת Blueprint + טיפול ב‑Drift מתועד.

---

## 5) כללי משילות (נשמרים)

- **מחזור סגירה** אחרי כל Micro‑Batch: Consolidation → SSOT check → Clean Table → Archive.
- **גודל Micro‑Batch:** 3–5 עמודים או 1 domain + 1 infra.
- **אין סטיות מ-SSOT** ללא אישור אדריכל.

---

## 6) תבנית Evidence לוג לסגירה (Closure Evidence Template)

Team 10 ישתמש בתבנית הבאה לכל סגירת Stage / Micro‑Batch:

```markdown
# Evidence Log — [STAGE_NAME / MICRO-BATCH_NAME]

**id:** EVIDENCE_[IDENTIFIER]
**date:** YYYY-MM-DD
**gate:** Team 90 (Roadmap v2.1 alignment)

## 1. Scope
- [ ] Specs/Pages covered:
- [ ] SSOT documents updated:

## 2. Validation
- [ ] validate-pages.js: PASS (attach log or summary)
- [ ] Routes/Menu/Blueprint: aligned (attach refs)

## 3. Consolidation
- [ ] Knowledge Promotion performed (if applicable)
- [ ] 00_MASTER_INDEX / Page Tracker updated

## 4. Sign-off
- Team 10: [ ] Ready for Team 90 gate
log_entry | TEAM_10 | EVIDENCE | [IDENTIFIER] | [DATE]
```

---

## 7) סיכום התחייבות (גרסה מתוקנת)

- **Stage‑1:** תוכנית עבודה עם תאריכי התחלה וסיום לכל Spec (ללא TBD); מיקום SSOT יחיד: `documentation/01-ARCHITECTURE/`; משימת Precision Audit עם Owner + Evidence.
- **Stage‑1b:** חוזה ב-SSOT; חסימת סגירה עד קיום הקבצים + Evidence PASS; תוכנית Factory + validate-pages.
- **Routes/Menu/Blueprint:** תוכנית יישור + טיפול מחייב ב-Blueprint Scope Drift (OUT OF SCOPE או החלטה רשמית).
- **Evidence:** תבנית לוג לסגירה צורפה.

Team 10 יפיץ את המנדט והתוכניות המתוקנות לצוותים 20, 30, 31, 40, 60 כנדרש ויעדכן את ה-Page Tracker ואת מסמכי הניהול.

**log_entry | TEAM_10 | ROADMAP_V2_1_RESPONSE | REVISED_PER_TEAM_90_FIXES | 2026-02-13**
