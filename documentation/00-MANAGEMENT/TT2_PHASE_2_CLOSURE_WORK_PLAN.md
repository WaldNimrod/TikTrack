# 📋 תוכנית סגירת Phase 2 — סבב אחרון (Debt Closure)

**id:** `TT2_PHASE_2_CLOSURE_WORK_PLAN`  
**owner:** Team 10 (The Gateway) — כולל **תזמור סדר ביצוע** ו**ניהול תלויות** (ממתין ל / מותר להתחיל); הודעות אופרטיביות חייבות לכלול סדר עבודה נכון.  
**status:** 🔒 **SSOT - ACTIVE**  
**last_updated:** 2026-02-12  
**version:** v1.1 (שלב 2 — Phase Closure / Consolidation באץ' 2 הושלם)  
**context:** ADR-010 (פקודת סגירה מאוחדת) + TEAM_90_TO_TEAM_10_PHASE_2_CLOSURE_PLAN_REQUEST (4 שלבים).

---

## 📐 מקור החלטות

- **ADR-010:** מנדט אדריכל מאוחד — רספונסיביות (Option D), SOP-011 Seeding, SLA 30/40, הקשחת לוגיקה/אבטחה, Endpoints Option A.
- **Team 90:** תכנית סגירה ב-4 שלבים + תתי-משימות, תיאום עם צוות 90 כמפקח.

---

## 🎯 שלב 1: סגירת חובות (Debt Closure) — מול החלטות אדריכלית

**בעלות:** Team 10 (תיאום + **תזמור סדר ביצוע**) + צוותים 20, 30, 40, 60 (ביצוע).  
**נוהל רלוונטי:** הצלבת כל החלטה ב-ADR-010 מול קוד/תיעוד.

### סדר ביצוע ותלויות (שלב 1) — תזמור השער

| שלב בתור | מי | משימות | תלות / הערה |
|----------|-----|--------|-------------|
| **1** | Team 20 + Team 60 | 1.2.1, 1.2.2, 1.2.3 | **ללא תלות** — מתחילים ראשונים. השלמתן חוסמת את 1.1.3 ואת אינטגרציה מלאה של 30/40. |
| **2** | Team 10 | 1.1.1, 1.1.2 | במקביל ל-1.2. **1.1.3** (וידוא `make db-test-clean`) — **ממתין להשלמת 1.2.3** (Team 20/60). |
| **3** | Team 30 + Team 40 | 1.3.1, 1.3.2, 1.3.3 | **מותר להתחיל** עבודה על CSS, maskedLog, טרנספורמרים במקביל. **אינטגרציה מלאה עם API** — **ממתינים להשלמת 1.2.1 + 1.2.2** (Endpoints + פורטים פעילים). |
| **4** | Team 10 | 1.1.3, 1.4 | **אחרי** 1.2.3 מוכן — וידוא db-test-clean; אחרי 1.1–1.3 — פלט שלב 1. |
| **4א** | **Team 10** | **מסירת קונטקסט ל-Team 50** | **חובה לפני 1.5:** עדכון מפורט לצוות 50 — מה פותח, מה לבדוק, קונטקסט ו-SSOT. צוות 50 אינו בלופ הפיתוח. ראה TT2_QUALITY_ASSURANCE_GATE_PROTOCOL סעיף 1ב. |
| **5** | **Team 50 (QA)** | **1.5 — שער א'** | **תנאי חריגה:** הרצת סוויטת הבדיקות (0 SEVERE); דוח סיכום ל-Team 10. **שלב 1 לא נסגר ושלב 2 לא מופעל** לפני השלמת שער א'. ראה TT2_QUALITY_ASSURANCE_GATE_PROTOCOL. |

**שער:** Team 10 **לא** מאשר מעבר לשלב 2 (Phase Closure) אלא לאחר שכל משימות 1.1, 1.2, 1.3, 1.4 **ו-1.5 (QA צוות 50 — שער א')** הושלמו ואומתו. תנאי חריגה לכל פיתוח חדש: ללא QA (שער א') — אין סגירת שלב. הודעות אופרטיביות מהשער יפרטו "מותר להתחיל" / "ממתין ל" לפי סדר זה.

### 1.1 משימות Team 10 (השער)

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 1.1.1 | עדכון Page Tracker: D21 Infra → **VERIFIED** (סופי) | TT2_OFFICIAL_PAGE_TRACKER.md מעודכן | ⬜ |
| 1.1.2 | אכיפת SLA 30/40: צוות 40 מגיש UI (Presentational), צוות 30 מזריק לוגיקה (Containers) | הפניה ל-TT2_SLA_TEAMS_30_40.md; טיפול בחריגות | ⬜ |
| 1.1.3 | וידוא שצוות 20/60 לא נחסמים: פקודת `make db-test-clean` פועלת ב-100% | תיאום עם 20/60; רישום חסימות אם יש | ⬜ |

### 1.2 משימות Team 20 / Team 60 (Backend & Infra)

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 1.2.1 | מימוש Endpoints ל-Summary ו-Conversions ב-Backend (Option A) | API פעילים; תיעוד ב-SSOT | ⬜ |
| 1.2.2 | נעילת פורטים 8080/8082 והקשחת Precision ל-20,6 | CORS/Config + NUMERIC(20,6) מאומת | ⬜ |
| 1.2.3 | בניית Python Seeders עם הפלאג `is_test_data = true`; `make db-test-clean` מחזיר DB סטרילי | סקריפטים + Makefile | ⬜ |

### 1.3 משימות Team 30 / Team 40 (Frontend — תחת SLA 30/40)

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 1.3.1 | Retrofit רספונסיביות (Option D): **כל הממשק בכל העמודים** רספונסיבי ואחיד; בטבלאות (D16, D18, D21) — Sticky Start/End + Fluid (clamp). ראה ADR-010 סעיף 1. | CSS + מבנה טבלאות + layout עמודים מעודכן; בדיקות — וידוא רספונסיביות מלאה לכל העמודים | ⬜ |
| 1.3.2 | ניקוי מוחלט של `console.log` ומעבר ל-`audit.maskedLog` | אין console.log חשוף; audit.maskedLog בלבד | ⬜ |
| 1.3.3 | הקשחת טרנספורמרים: מניעת NaN ו-Undefined בטבלאות | transformers.js + null-safety | ⬜ |

### 1.4 פלט שלב 1

- רשימת חוסרים/פערים (אם נשארו) — בעלות ואחראי.
- וידוא שאין החלטות "תלויות" שלא הושלמו.

### 1.4א מסירת קונטקסט מצוות 10 לצוות 50 (חובה לפני 1.5)

לפני שצוות 50 מתחיל QA — **Team 10 חייב** למסור עדכון מפורט: מה פותח (שלב 1, משימות 1.1–1.4), מה נדרש לבדוק (scope, Gates), קישורי SSOT ותוכנית. ראה `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` סעיף 1ב.

### 1.5 משימות Team 50 (QA — שער א') — תנאי חריגה

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 1.5.1 | הרצת סוויטת הבדיקות האוטומטיות (אינטגרציה, Runtime, E2E) לפי TEAM_50_QA_WORKFLOW_PROTOCOL | דוח סיכום — 0 SEVERE; GATE_A_PASSED | ✅ |
| 1.5.2 | מסירת דוח ל-Team 10 (שער) לאישור | הודעת Team 50 → Team 10 עם קישור לדוח | ✅ |

**✅ הושלם 2026-02-12:** שער א' (1.5) ושער ב' אושרו. שלב 2 (Phase Closure — Consolidation באץ' 2) בוצע. ראה `_COMMUNICATION/team_10/CONSOLIDATION_BATCH_2.md`. נרטיב היסטורי: תיקון "ממתין ל-QA" הוחל עם השלמת שער א' ואישור שער ב'.

---

## 📚 שלב 2: הפעלת נוהל סיום שלב (Phase Closure)

**בעלות:** Team 10.  
**נוהל מחייב:** [TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md](../05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md)

**✅ בוצע 2026-02-12:** Consolidation באץ' 2 (פיננסי) — דוח `_COMMUNICATION/team_10/CONSOLIDATION_BATCH_2.md`; ארכיון `_COMMUNICATION/99-ARCHIVE/2026-02-12/`.

### 2.1 תתי-משימות

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 2.1.1 | Consolidation שלב 1 — איסוף דוחות תקשורת מ-`_COMMUNICATION/team_*` | רשימת דוחות רלוונטיים | ✅ |
| 2.1.2 | Consolidation שלב 2 — זיקוק ל-SSOT (החלטות, דפוסים, לקחים) | מיפוי ל-`documentation/` | ✅ |
| 2.1.3 | Consolidation שלב 3 — יצירה/עדכון מסמכי SSOT | מסמכים מעודכנים | ✅ |
| 2.1.4 | Consolidation שלב 4 — עדכון אינדקסים (00_MASTER_INDEX + אינדקסים ספציפיים) | אינדקסים מעודכנים | ✅ |
| 2.1.5 | Consolidation שלב 5 — ארכוב דוחות תקשורת | תיקיות ארכיון + קישורים ב-SSOT | ✅ |
| 2.1.6 | ניקוי/ארכוב תיקיות בהתאם לנוהל | מבנה תיקיות מסודר | ✅ |

---

## 🔁 שלב 3: ריצה חוזרת של בדיקות Team 90 (Gate B / סבב מאמת)

**בעלות:** Team 90 (ביצוע) + Team 10 (תיאום ותיעוד).

### 3.1 תתי-משימות

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 3.1.1 | ריצת Gate B (או סבב מאמת אחרון) לאחר תיקוני שלב 1–2 | דוח Team 90 | ⬜ |
| 3.1.2 | תיעוד ארטיפקטים והחלטת GREEN | ארטיפקטים ב-05-REPORTS/artifacts; עדכון GATE_B_STATUS אם רלוונטי | ⬜ |

**בדיקות רספונסיביות (חובה בסבב 3):** וידוא ש**כל הממשק בכל העמודים** רספונסיבי ואחיד (לא רק טבלאות); טבלאות — Sticky/clamp לפי Option D.

---

## 👁️ שלב 4: אישור ויזואלי סופי (G-Lead / Visionary)

**בעלות:** Team 10 (הכנה) + G-Lead (נמרוד) (ביצוע).

### 4.1 תתי-משימות

| # | משימה | תוצר | סטטוס |
|---|--------|------|--------|
| 4.1.1 | הכנה לסבב ידני אחרון: תיעוד סטטוס כל עמוד (D16, D18, D21) + חריגות שמצריכות תיקון | מסמך סטטוס + רשימת חריגות | ⬜ |
| 4.1.2 | מסירת החומר ל-G-Lead לבדיקה ידנית-ויזואלית בדפדפן | Handoff מסודר | ⬜ |
| 4.1.3 | רישום החלטת G-Lead: Sign-off או רשימת תיקונים ויזואליים | תיעוד FINAL_APPROVAL / תיקונים | ⬜ |
| 4.1.4 | גיבוי מלא ל-GitHub (כל הרפוזיטורי **למעט** `_COMMUNICATION/`, `99-ARCHIVE/`, תיקיות גיבויים, לוגים, וקבצי סביבה/סודות) | commit + push | ⬜ |

---

## 📌 סיכום בעלויות ודדליינים

| שלב | בעלים עיקריים | נוהל/רפרנס |
|-----|----------------|-------------|
| 1. Debt Closure | Team 10 (תיאום), 20/60/30/40 (ביצוע) | ADR-010 |
| 2. Phase Closure | Team 10 | TT2_KNOWLEDGE_PROMOTION_PROTOCOL |
| 3. Team 90 Re-run | Team 90 + Team 10 | SOP-010, GATE_B_STATUS |
| 4. G-Lead Approval | Team 10 + G-Lead | TT2_QUALITY_ASSURANCE_GATE_PROTOCOL (שער ג') |

**דדליינים:** יש לקבוע עם האדריכלית ו-Team 90 (לא הוגדרו במסמך זה).

---

## 🔗 רפרנסים

- ADR-010: `documentation/00-MANAGEMENT/ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md` (SSOT)
- Team 90 Request: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_PHASE_2_CLOSURE_PLAN_REQUEST.md`
- Knowledge Promotion: [TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md](../05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md)
- SLA 30/40: [TT2_SLA_TEAMS_30_40.md](../05-PROCEDURES/TT2_SLA_TEAMS_30_40.md)
- Quality Gates: [TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md](../05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md)
- Master Index: [00_MASTER_INDEX.md](./00_MASTER_INDEX.md)
- Page Tracker: [TT2_OFFICIAL_PAGE_TRACKER.md](../01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md)

---

**log_entry | Team 10 | PHASE_2_CLOSURE_WORK_PLAN | CREATED | 2026-02-09**
