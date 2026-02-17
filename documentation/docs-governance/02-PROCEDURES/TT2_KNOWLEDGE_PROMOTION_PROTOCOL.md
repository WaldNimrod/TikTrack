# 📚 פרוטוקול קידום ידע (Knowledge Promotion Protocol)

**id:** `TT2_KNOWLEDGE_PROMOTION_PROTOCOL`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-15  
**version:** v1.4  
**מנדט:** GOV-MANDATE-V3 — Sandbox, קידום ידע בזמן, אימות ע"י צוות 90.

---

**מקור:** `ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md`  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **ACTIVE**

---

## 📢 Executive Summary

**Team 10 (The Gateway) הוא הצוות היחיד המורשה לכתוב לתיקיית `documentation/`.**

כל סיום באץ' ב-Phase 2 דורש שלב **Consolidation** שבו Team 10 מזקק דוחות תקשורת (`_COMMUNICATION/`) למסמכי SSOT (`documentation/`). **GOV-MANDATE-V3:** צוות 10 חייב לבצע קידום ידע (Consolidation) **בזמן**; צוות 90 (המרגל) מוודא שזה מתבצע.

**עיקר המהות של התהליך:** לאסוף את הידע שנצבר, את השינויים שבוצעו ואת העדכונים החשובים — ולהעתיק/לעדכן אותם **בתיעוד המרכזי** (`documentation/`). שמירה על **דוקומנטציה עדכנית** היא היעד המרכזי; **תיקיות נקיות** (ארכיון תקשורת) הן תוצאה משנית לאחר שקידום הידע הושלם.

**הפרדה חובה:** קבצי תקשורת וקבצים זמניים נוצרים **רק** בתיקיית הצוות (`_COMMUNICATION/team_XX/`) **ואינם** מתווספים לאינדקס. רק תוכן שמקודם ל-`documentation/` דרך נוהל זה מתועד באינדקס. ראה `CURSOR_INTERNAL_PLAYBOOK.md` סעיפים 4.2 ו-7 (GOV-MANDATE-V3).

---

## 🚫 איסור מוחלט — תיקיית החלטות האדריכלית

**אסור לגעת בתיקייה:** `_COMMUNICATION/_Architects_Decisions`

- ❌ **אסור:** להעביר, למחוק, לשנות או לארכב קבצים מתוך `_Architects_Decisions`.
- ✅ **חובה:** תיקייה זו נשארת מחוץ לנוהל קידום הידע והארכיון; רק האדריכלית/צוות האדריכלות מטפלים בתוכנה.

---

## 🎯 תפקיד "עורך ראשי" (Chief Editor Role)

### **אחריות Team 10:**
- ✅ זיקוק דוחות תקשורת למסמכי SSOT
- ✅ שמירה על איכות ותקינות התיעוד
- ✅ אכיפת מבנה ומטא-דאטה סטנדרטי
- ✅ עדכון אינדקסים מרכזיים
- ✅ ארכוב מסודר של דוחות תקשורת

### **הגבלות:**
- ❌ **אסור:** צוותים אחרים לכתוב ישירות ל-`documentation/`
- ✅ **חובה:** כל עדכון דרך Team 10 בלבד

---

## 🔄 שלב Consolidation - חובה בכל סיום באץ'

### **מתי מתבצע Consolidation?**
- ✅ בסיום כל באץ' ב-Phase 2
- ✅ לפני מעבר לבאץ' הבא
- ✅ לפני אישור סופי של האדריכל  
**GOV-MANDATE-V3:** צוות 10 מבצע Consolidation **בזמן**; צוות 90 (Enforcer) מוודא שהקידום בוצע.

### **תהליך Consolidation (5 שלבים) — סדר עדיפויות**

**עיקרון:** שלבים 1–4 (איסוף → זיקוק → SSOT → אינדקס) הם **ליבת התהליך** ומגדירים הצלחה. שלב 5 (ארכוב/ניקוי) מתבצע **אחרי** שקידום הידע הושלם.

#### **שלב 1: איסוף דוחות תקשורת**
1. סריקת `_COMMUNICATION/team_[ID]/` לכל הצוותים המעורבים (**לא** תיקיית `_Architects_Decisions`).
2. זיהוי דוחות השלמה, החלטות, שינויים ועדכונים שחייבים שימור בתיעוד המרכזי.

#### **שלב 2: זיקוק ל-SSOT**
1. זיהוי **ידע קריטי** (החלטות, דפוסים, לקחים, שינויים שבוצעו).
2. מיפוי ל-`documentation/` לפי קטגוריות.

#### **שלב 3: יצירת/עדכון מסמכי SSOT**
1. יצירת מסמך SSOT חדש (אם נדרש).
2. עדכון מסמך SSOT קיים (אם קיים).
3. **חובה:** כל עדכון חשוב שזוהה בתקשורת — מופיע או מקושר ב-`documentation/`.

#### **שלב 4: עדכון אינדקסים**
1. עדכון `00_MASTER_INDEX.md` (root).
2. עדכון אינדקסים ספציפיים (אם רלוונטי).

#### **שלב 5: ארכוב דוחות תקשורת (אחרי קידום הידע)**
1. **סיווג חובה לפני ארכוב (ראה סעיף "הפרדה — מה לא לארכיון" להלן):** סריקה וסימון של כל קובץ — **להעביר לארכיון** או **להשאיר בתקשורת פעילה**.
2. העברת **רק** דוחות תקשורת חד-פעמיים / Evidence / השלמות לארכיון.
3. שמירת קישורים ב-SSOT (אם רלוונטי).
4. ארכוב דוחות וארטיפקטים זמניים (כולל דוחות בדיקות) — **לא** נהלים/מפרטים/הגדרות.
5. ניקוי לוגים וקבצים זמניים לפי סריקה.

---

## ✅ קריטריוני הצלחה (Success Criteria)

התהליך נחשב **מוצלח** רק כאשר מתקיימים **כל** הקריטריונים להלן, **בסדר העדיפויות** המפורט.

### **עדיפות 1 — דוקומנטציה עדכנית (חובה)**

| # | קריטריון | אימות |
|---|-----------|--------|
| 1.1 | **הידע שנצבר** — החלטות, דפוסים ולקחים מדוחות התקשורת — **מקודם** ל-`documentation/` (מסמכי SSOT או דוחות סיכום). | קיים מסמך/עדכון ב-`documentation/` שמשקף את הידע; קישור מדוח הקונסולידציה. |
| 1.2 | **השינויים שבוצעו** — שינויים משמעותיים (סקופ, מפרטים, תהליכים) — **מתועדים** או מקושרים בתיעוד המרכזי. | רשימה בדוח הקונסולידציה: "שינויים שמוקדמו" + נתיב ב-`documentation/`. |
| 1.3 | **עדכונים חשובים** — עדכונים שחייבים שימור (אינדקס, Page Tracker, מדריכים) — **בוצעו** ב-`documentation/`. | `00_MASTER_INDEX.md` ואינדקסים רלוונטיים מעודכנים; גרסאות/תאריכים בדוח. |

### **עדיפות 2 — תיקיות נקיות (אחרי קידום הידע)**

| # | קריטריון | אימות |
|---|-----------|--------|
| 2.1 | **ארכיון מסודר** — דוחות תקשורת חד-פעמיים / Evidence / השלמות הועברו ל-`_COMMUNICATION/99-ARCHIVE/YYYY-MM-DD/`. | ARCHIVE_MANIFEST קיים; רשימת קבצים או ספירה בדוח הקונסולידציה. |
| 2.2 | **בתיקיות הצוותים** נשארו **רק** נהלים, תהליכי עבודה, מפרטים/חוזים וקבצים קבועים (לפי סעיף "הפרדה — מה לא לארכיון"). | רשימת KEEP מתועדת; אין העברת נהלים/מפרטים לארכיון. |
| 2.3 | **ניקוי** — לוגים וקבצים זמניים (לפי סריקה) טופלו; **לא** נוגעים ב-`_Architects_Decisions`. | רשימת ניקוי בדוח; אימות ש-`_Architects_Decisions` לא נפגע. |

### **סיכום**

- **יותר חשוב מתקיות נקיות:** לאסוף את הידע, השינויים והעדכונים החשובים ולעדכן את **התיעוד המרכזי**. רק לאחר מכן — ארכוב וניקוי תיקיות.
- **הצלחה:** דוקומנטציה עדכנית (עדיפות 1) + תיקיות נקיות (עדיפות 2) + אי-געת ב-`_Architects_Decisions`.

---

## 📋 מיפוי ידע ל-`documentation/`

| סוג ידע | תיקיית יעד | דוגמאות |
|:---|:---|:---|
| החלטות אדריכליות | `documentation/01-ARCHITECTURE/` | ADRs, Patterns, Blueprints |
| מדריכי פיתוח | `documentation/02-DEVELOPMENT/` | Guides, Specs, Workflows |
| נהלי עבודה | `documentation/05-PROCEDURES/` | Protocols, Procedures |
| תקנים ומדיניות | `documentation/09-GOVERNANCE/` | Standards, Policies |
| דוחות סיכום | `documentation/08-REPORTS/` | Completion Reports |

---

## 📋 תבנית Consolidation Report

כל Consolidation חייב לכלול דוח מסודר ב-`_COMMUNICATION/team_10/CONSOLIDATION_BATCH_[X].md`:

```markdown
# 📚 Consolidation Report - Batch [X]

**id:** `CONSOLIDATION_BATCH_[X]`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**last_updated:** [DATE]  
**version:** v1.0

## 📊 Batch Summary
- **Batch ID:** [X]
- **Pages Completed:** [List]
- **Teams Involved:** [List]
- **Completion Date:** [DATE]

## 📝 Knowledge Promoted

### SSOT Documents Created/Updated:
1. [Document 1] - [Description]
2. [Document 2] - [Description]

### Key Decisions:
- [Decision 1]
- [Decision 2]

### Patterns Established:
- [Pattern 1]
- [Pattern 2]

### Lessons Learned:
- [Lesson 1]
- [Lesson 2]

## ✅ קריטריוני הצלחה — אימות
- **עדיפות 1 (דוקומנטציה):** [ ] ידע שנצבר מקודם ל-documentation/ | [ ] שינויים שבוצעו מתועדים | [ ] אינדקסים מעודכנים
- **עדיפות 2 (תיקיות):** [ ] ארכיון + ARCHIVE_MANIFEST | [ ] רק נהלים/מפרטים נשארו ב-team_XX | [ ] לא נגענו ב-`_Architects_Decisions`

## 📦 ארכוב (שלב 5)
- **סיווג בוצע:** רק דוחות/Evidence הועברו לארכיון; נהלים/מפרטים/הגדרות **לא** ארכובו (נשארו ב־team_XX).
- **תיקיית ארכיון:** `_COMMUNICATION/99-ARCHIVE/YYYY-MM-DD/`
- **ARCHIVE_MANIFEST:** [קישור]
- **הערה:** תיקיית `_COMMUNICATION/_Architects_Decisions` — לא נסרקה ולא ארכובה.

## 🔗 References
- Communication Reports: [Links]
- SSOT Documents: [Links]
```

---

## ⚠️ כללי אכיפה

### **1. רק Team 10 רשאי לכתוב ל-`documentation/`**
- ❌ **אסור:** צוותים אחרים לכתוב ישירות ל-`documentation/`
- ✅ **חובה:** כל עדכון דרך Team 10 בלבד

### **2. Consolidation חובה לפני מעבר לבאץ' הבא**
- ❌ **אסור:** מעבר לבאץ' הבא ללא Consolidation
- ✅ **חובה:** Consolidation Report לפני אישור סופי

### **3. שמירה על איכות SSOT**
- ✅ מטא-דאטה מלא בכל מסמך (`id`, `owner`, `status`, `supersedes`, `last_updated`, `version`)
- ✅ קישורים תקינים
- ✅ עדכון אינדקסים

### **4. ארכוב מסודר — והפרדה חובה: מה לא לארכיון**
- ✅ ארכוב מתבצע **תמיד** תחת `_COMMUNICATION/99-ARCHIVE/` ובתיקיית משנה לפי תאריך (`YYYY-MM-DD/`).
- ✅ **אסור:** לגעת בתיקייה `_COMMUNICATION/_Architects_Decisions` — לא לסרוק אותה, לא להעביר ממנה ולא לארכב ממנה.
- ✅ קישורים נשמרים ב-SSOT (אם רלוונטי).
- ✅ לאחר הארכוב מתבצע ניקוי לוגים וקבצים זמניים לפי סריקה.

**❌ אסור להעביר לארכיון (נשארים בתקשורת פעילה `_COMMUNICATION/team_XX/`):**
- נהלים פנימיים של צוות (PROCEDURE, PROCESS, SOP, PROTOCOL, WORKFLOW).
- מפרטים והגדרות (SPEC, _SPEC, CRITERIA, CONTRACT כחוזה פעיל, SCHEMA, FIELD_MAP, ROLE_MAPPING).
- מדריכים ומדיניות בשימוש שוטף (GUIDE, POLICY, SERVER_START_POLICY).
- תוכניות והחלטות המגדירות עבודה (RETROFIT_PLAN, CSS_RULE_DECISION, VISUAL_VALIDATION_CRITERIA).
- תיקיות דמו/דוגמאות (demos/) וקבצי עזר שהצוות משתמש בהם.

**✅ מותר (וחובה) להעביר לארכיון:**
- דוחות השלמה חד-פעמיים (TO_TEAM_10_*_COMPLETE, *_COMPLETION_REPORT, *_EVIDENCE_*).
- Evidence ומענות לאודיט (BATCH_1_2_EVIDENCE, *_ACK, *_ACKNOWLEDGMENT).
- מנדטים ובדיקות שכבר סגורים (מנדטים שבוצעו; דוחות Gate/QA היסטוריים).
- לוגים וקבצים זמניים (לפי סריקה).

**חובה:** לפני כל ארכוב — Team 10 מריצה סריקה לפי הרשימות למעלה ומשאירה נהלים/מפרטים/הגדרות בתיקיית הצוות. דוגמה לתיעוד שחזור: `TEAM_10_RESTORED_PROCEDURES_AND_SPECS_2026_02_13.md`.

### **5. רשימת תיקיות לניקוי (בהתאם לסריקה)**
- ✅ Team 10 מבצע סריקה ומגדיר רשימה סופית לכל סשן.
- ✅ דוגמאות אפשריות: `logs/`, `tmp/`, `documentation/05-REPORTS/artifacts_SESSION_*/` (אם הוגדר זמני).
- ✅ **אסור:** לכלול את `_COMMUNICATION/_Architects_Decisions` בסריקה או בניקוי.
- ✅ הרשימה מתועדת בדוח ה-Consolidation.

---

## 📅 לוח זמנים Phase 2

### **Phase 2.1: Brokers Fees (D18)**
- **Completion:** [TBD]
- **Consolidation Deadline:** [TBD]
- **SSOT Documents:** [TBD]

### **Phase 2.2: Cash Flows (D21)**
- **Completion:** [TBD]
- **Consolidation Deadline:** [TBD]
- **SSOT Documents:** [TBD]

---

## 📞 תקשורת

**כל שאלה או הבהרה:**
- 📧 `_COMMUNICATION/team_10/`
- 📋 פורמט: `TEAM_[ID]_TO_TEAM_10_KNOWLEDGE_PROMOTION_[SUBJECT].md`

---

## 🔗 קישורים רלוונטיים

- **Workflow מפורט:** `_COMMUNICATION/team_10/TEAM_10_KNOWLEDGE_PROMOTION_WORKFLOW.md`
- **Master Index:** `00_MASTER_INDEX.md` (root)
- **Page Tracker:** `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-15  
**סטטוס:** 🟢 **ACTIVE - CHIEF EDITOR ROLE**

**שינוי v1.2 (2026-02-13):** הוספת הפרדה מפורשת — "מה לא לארכיון" (נהלים, מפרטים, הגדרות, מדריכים) vs "מה לארכיון" (דוחות/Evidence); סיווג חובה לפני ארכוב; עדכון תבנית Consolidation Report.

**שינוי v1.4 (2026-02-15):** (1) עיקר המהות — קידום הידע והעדכון בתיעוד המרכזי קודם לתיקיות נקיות; (2) קריטריוני הצלחה ברורים — עדיפות 1: דוקומנטציה עדכנית, עדיפות 2: ארכיון ותיקיות נקיות; (3) איסור מוחלט — **אסור לגעת בתיקייה** `_COMMUNICATION/_Architects_Decisions` (לא לסרוק, לא להעביר, לא לארכב).

**log_entry | [Team 10] | KNOWLEDGE_PROMOTION | PROTOCOL_V1.4_SUCCESS_CRITERIA_ARCHITECTS_OFF_LIMITS | 2026-02-15**
