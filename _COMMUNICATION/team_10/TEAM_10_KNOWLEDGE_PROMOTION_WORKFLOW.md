# ⚠️ NON-SSOT - COMMUNICATION ONLY

**⚠️ זהו מסמך תקשורת בלבד - לא SSOT!**

**SSOT Location:** `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`

---

# 📚 נוהל קידום ידע (Knowledge Promotion Protocol) - Team 10

**id:** `TEAM_10_KNOWLEDGE_PROMOTION_WORKFLOW`  
**owner:** Team 10 (The Gateway)  
**status:** ⚠️ **NON-SSOT - COMMUNICATION ONLY**  
**supersedes:** `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`  
**last_updated:** 2026-02-06  
**version:** v1.0 (Communication Copy)

---

**מקור:** `ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md`  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **ACTIVE**

---

## 🎯 תפקיד "עורך ראשי" (Chief Editor Role)

**Team 10 (The Gateway) הוא הצוות היחיד המורשה לכתוב לתיקיית `documentation/`.**

### **אחריות:**
- ✅ זיקוק דוחות תקשורת (`_COMMUNICATION/`) למסמכי SSOT (`documentation/`)
- ✅ שמירה על איכות ותקינות התיעוד
- ✅ אכיפת מבנה ומטא-דאטה סטנדרטי
- ✅ עדכון אינדקסים מרכזיים

---

## 🔄 שלב Consolidation - חובה בכל סיום באץ'

### **מתי מתבצע Consolidation?**
- ✅ בסיום כל באץ' ב-Phase 2
- ✅ לפני מעבר לבאץ' הבא
- ✅ לפני אישור סופי של האדריכל

### **תהליך Consolidation:**

#### **שלב 1: איסוף דוחות תקשורת**
1. **סריקת `_COMMUNICATION/team_[ID]/`** לכל הצוותים המעורבים בבאץ'
2. **זיהוי דוחות השלמה:**
   - `TEAM_[ID]_[BATCH]_COMPLETION_REPORT.md`
   - `TEAM_[ID]_[FEATURE]_COMPLETION.md`
   - דוחות התקדמות רלוונטיים

#### **שלב 2: זיקוק ל-SSOT**
1. **זיהוי ידע קריטי:**
   - החלטות אדריכליות
   - שינויים בתשתית
   - דפוסים חדשים (Patterns)
   - לקחים חשובים (Lessons Learned)
   - שינויים בנהלים

2. **מיפוי ל-`documentation/`:**
   - **`documentation/01-ARCHITECTURE/`** - החלטות אדריכליות, דפוסים
   - **`documentation/02-DEVELOPMENT/`** - מדריכי פיתוח, ספציפיקציות
   - **`documentation/05-PROCEDURES/`** - נהלי עבודה, workflows
   - **`documentation/09-GOVERNANCE/`** - תקנים, מדיניות
   - **`documentation/08-REPORTS/`** - דוחות סיכום (אם רלוונטי)

#### **שלב 3: יצירת/עדכון מסמכי SSOT**
1. **יצירת מסמך SSOT חדש** (אם נדרש):
   - מטא-דאטה מלא (`id`, `owner`, `status`, `supersedes`, `last_updated`, `version`)
   - תוכן מזוקק מהדוחות
   - קישורים רלוונטיים

2. **עדכון מסמך SSOT קיים** (אם קיים):
   - הוספת מידע חדש
   - עדכון גרסאות
   - עדכון `last_updated`

#### **שלב 4: עדכון אינדקסים**
1. **עדכון `00_MASTER_INDEX.md` (שורש הפרויקט):**
   - הוספת מסמכים חדשים
   - עדכון קישורים

2. **עדכון אינדקסים ספציפיים** (אם רלוונטי):
   - `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`
   - `documentation/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md`
   - וכו'

#### **שלב 5: ארכוב דוחות תקשורת**
1. **העברת דוחות תקשורת לארכיון:**
   - העברה ל-`_COMMUNICATION/99-ARCHIVE/` או תיקיית ארכיון ספציפית
   - שמירת קישור ב-SSOT למקור (אם רלוונטי)

---

## 📋 תבנית Consolidation Report

כל Consolidation חייב לכלול דוח מסודר:

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
- ✅ מטא-דאטה מלא בכל מסמך
- ✅ קישורים תקינים
- ✅ עדכון אינדקסים

### **4. ארכוב מסודר**
- ✅ דוחות תקשורת מועברים לארכיון
- ✅ קישורים נשמרים ב-SSOT (אם רלוונטי)

---

## 📅 לוח זמנים

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

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **ACTIVE - CHIEF EDITOR ROLE**

**log_entry | [Team 10] | KNOWLEDGE_PROMOTION | PROTOCOL_ACTIVATED | GREEN | 2026-02-06**
