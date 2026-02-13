# 📚 פרוטוקול קידום ידע (Knowledge Promotion Protocol)

**id:** `TT2_KNOWLEDGE_PROMOTION_PROTOCOL`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-13  
**version:** v1.3  
**מנדט:** GOV-MANDATE-V3 — Sandbox, קידום ידע בזמן, אימות ע"י צוות 90.

---

**מקור:** `ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md`  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **ACTIVE**

---

## 📢 Executive Summary

**Team 10 (The Gateway) הוא הצוות היחיד המורשה לכתוב לתיקיית `documentation/`.**

כל סיום באץ' ב-Phase 2 דורש שלב **Consolidation** שבו Team 10 מזקק דוחות תקשורת (`_COMMUNICATION/`) למסמכי SSOT (`documentation/`). **GOV-MANDATE-V3:** צוות 10 חייב לבצע קידום ידע (Consolidation) **בזמן**; צוות 90 (המרגל) מוודא שזה מתבצע.

**הפרדה חובה:** קבצי תקשורת וקבצים זמניים נוצרים **רק** בתיקיית הצוות (`_COMMUNICATION/team_XX/`) **ואינם** מתווספים לאינדקס. רק תוכן שמקודם ל-`documentation/` דרך נוהל זה מתועד באינדקס. ראה `CURSOR_INTERNAL_PLAYBOOK.md` סעיפים 4.2 ו-7 (GOV-MANDATE-V3).

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

### **תהליך Consolidation (5 שלבים):**

#### **שלב 1: איסוף דוחות תקשורת**
1. סריקת `_COMMUNICATION/team_[ID]/` לכל הצוותים המעורבים
2. זיהוי דוחות השלמה רלוונטיים

#### **שלב 2: זיקוק ל-SSOT**
1. זיהוי ידע קריטי (החלטות, דפוסים, לקחים)
2. מיפוי ל-`documentation/` לפי קטגוריות

#### **שלב 3: יצירת/עדכון מסמכי SSOT**
1. יצירת מסמך SSOT חדש (אם נדרש)
2. עדכון מסמך SSOT קיים (אם קיים)

#### **שלב 4: עדכון אינדקסים**
1. עדכון `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
2. עדכון אינדקסים ספציפיים (אם רלוונטי)

#### **שלב 5: ארכוב דוחות תקשורת**
1. **סיווג חובה לפני ארכוב (ראה סעיף "הפרדה — מה לא לארכיון" להלן):** סריקה וסימון של כל קובץ — **להעביר לארכיון** או **להשאיר בתקשורת פעילה**.
2. העברת **רק** דוחות תקשורת חד-פעמיים / Evidence / השלמות לארכיון.
3. שמירת קישורים ב-SSOT (אם רלוונטי).
4. ארכוב דוחות וארטיפקטים זמניים (כולל דוחות בדיקות) — **לא** נהלים/מפרטים/הגדרות.
5. ניקוי לוגים וקבצים זמניים לפי סריקה.

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

## 📦 ארכוב (שלב 5)
- **סיווג בוצע:** רק דוחות/Evidence הועברו לארכיון; נהלים/מפרטים/הגדרות **לא** ארכובו (נשארו ב־team_XX).
- **תיקיית ארכיון:** `_COMMUNICATION/99-ARCHIVE/YYYY-MM-DD/`
- **ARCHIVE_MANIFEST:** [קישור]

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
- ✅ Team 10 מבצע סריקה ומגדיר רשימה סופית לכל סשן
- ✅ דוגמאות אפשריות: `logs/`, `tmp/`, `documentation/05-REPORTS/artifacts_SESSION_*/` (אם הוגדר זמני)
- ✅ הרשימה מתועדת בדוח ה-Consolidation

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
- **Master Index:** `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
- **Page Tracker:** `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-13  
**סטטוס:** 🟢 **ACTIVE - CHIEF EDITOR ROLE**

**שינוי v1.2 (2026-02-13):** הוספת הפרדה מפורשת — "מה לא לארכיון" (נהלים, מפרטים, הגדרות, מדריכים) vs "מה לארכיון" (דוחות/Evidence); סיווג חובה לפני ארכוב; עדכון תבנית Consolidation Report.

**log_entry | [Team 10] | KNOWLEDGE_PROMOTION | PROTOCOL_V1.2_ARCHIVE_SEPARATION | 2026-02-13**
