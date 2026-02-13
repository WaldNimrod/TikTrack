# 🧹 תוכנית ניקוי קבצים ישנים - מידע סותר

**id:** `TEAM_10_DEPRECATED_DOCS_CLEANUP_PLAN`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-06  
**version:** v1.0

---

**מקור:** אזהרה מהמשתמש על קבצים ישנים עם מידע סותר  
**תאריך:** 2026-02-06  
**סטטוס:** ✅ **COMPLETE** (ראה `TEAM_10_DEPRECATED_DOCS_CLEANUP_COMPLETE.md`)

---

## 🚨 קבצים קריטיים שזוהו כבעלי מידע סותר

### **1. ARCHITECT_PHASE_2_KICKOFF_MANDATE.md** ⚠️ **DEPRECATED**
- ✅ **סומן כ-DEPRECATED** עם אזהרה
- ❌ מזכיר `FIX_transformers.js` (סותר)
- ❌ מזכיר D21 כ-"Trades History" (סותר - צריך להיות "Cash Flows")
- ✅ **SSOT:** `ARCHITECT_PHASE_2_REFINED_MANDATE.md`

### **2. קבצים עם FIX_transformers.js (רשימה חלקית):**
הקבצים הבאים עדיין מכילים `FIX_transformers.js` - רובם היסטוריים ולא פעילים:
- `TEAM_10_TRADING_ACCOUNTS_RED_FIX_STATUS.md` - היסטורי (Trading Accounts fix)
- `TEAM_30_TRADING_ACCOUNTS_RED_FIX_COMPLETION_REPORT.md` - היסטורי
- `TEAM_10_TO_TEAM_30_TRADING_ACCOUNTS_RED_FIX.md` - היסטורי
- `ARCHITECT_TRADING_ACCOUNTS_RED_FIX_MANDATE.md` - היסטורי
- `TEAM_10_TO_TEAM_30_FIX_FILES_DETAILED.md` - היסטורי
- `TEAM_10_ARCHITECT_MANDATE_*` - קבצים היסטוריים (P0/P1/P2)

**הערה:** קבצים היסטוריים יכולים להישאר עם `FIX_transformers.js` כי הם מתעדים את ההיסטוריה. הקבצים הפעילים כבר עודכנו.

---

## ✅ קבצים פעילים שכבר עודכנו

### **Phase 2 Active Documents:**
- ✅ `TEAM_10_PHASE_2_IMPLEMENTATION_PLAN.md` - מסומן כ-NON-SSOT, עודכן ל-`transformers.js`
- ✅ `TEAM_10_PHASE_2_ALL_TEAMS_MANDATE.md` - מסומן כ-NON-SSOT, עודכן ל-`transformers.js`
- ✅ `TEAM_10_PHASE_2_RELEASE_SUMMARY.md` - מסומן כ-NON-SSOT, עודכן ל-`transformers.js`

### **SSOT Documents (מקור האמת):**
- ✅ `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md` - SSOT, `transformers.js`
- ✅ `documentation/01-ARCHITECTURE/TT2_PHASE_2_ALL_TEAMS_MANDATE.md` - SSOT, `transformers.js`
- ✅ `documentation/08-REPORTS/TT2_PHASE_2_RELEASE_SUMMARY.md` - SSOT, `transformers.js`

---

## 📋 כללי עבודה לעתיד

### **1. לפני יצירת קובץ חדש:**
- [ ] חיפוש אחר קבצים ישנים בנושא דומה
- [ ] בדיקה אם יש סתירות
- [ ] סמן קבצים ישנים כ-DEPRECATED לפני יצירת חדש

### **2. אחרי קידום ל-SSOT:**
- [ ] סמן את הקובץ ב-_COMMUNICATION/ כ-NON-SSOT
- [ ] הוסף קישור ל-SSOT ב-`supersedes:`
- [ ] וודא שאין סתירות בין SSOT ל-_COMMUNICATION/

### **3. בדיקה תקופתית:**
- [ ] חיפוש אחר `FIX_transformers.js` בקבצים פעילים
- [ ] חיפוש אחר שמות ישנים של עמודים/מודולים
- [ ] בדיקת סתירות בין מסמכים

---

## 🎯 פעולות נדרשות מיידיות

### **הושלם:**
- ✅ `ARCHITECT_PHASE_2_KICKOFF_MANDATE.md` - סומן כ-DEPRECATED
- ✅ `ARCHITECT_PHASE_2_FULL_RELEASE_MANDATE.md` - סומן כ-SUPERSEDED
- ✅ `TEAM_10_PHASE_2_IMPLEMENTATION_PLAN.md` - סומן כ-NON-SSOT
- ✅ `TEAM_10_PHASE_2_ALL_TEAMS_MANDATE.md` - סומן כ-NON-SSOT
- ✅ `TEAM_10_PHASE_2_RELEASE_SUMMARY.md` - סומן כ-NON-SSOT
- ✅ `TEAM_10_KNOWLEDGE_PROMOTION_WORKFLOW.md` - סומן כ-NON-SSOT
- ✅ `TEAM_10_KNOWLEDGE_PROMOTION_ACKNOWLEDGMENT.md` - סומן כ-NON-SSOT
- ✅ `TEAM_10_TRADING_ACCOUNTS_RED_FIX_STATUS.md` - סומן כ-HISTORICAL
- ✅ `TEAM_10_ARCHITECT_MANDATE_COMPLETE.md` - סומן כ-HISTORICAL

**ראה דוח מפורט:** `TEAM_10_DEPRECATED_DOCS_CLEANUP_COMPLETE.md`

---

## 📊 סטטוס

**קבצים קריטיים:** ✅ **טופלו (2 קבצים)**  
**קבצים פעילים:** ✅ **טופלו (5 קבצים)**  
**קבצים היסטוריים:** ✅ **טופלו (2 קבצים)**  
**סה"כ:** ✅ **9 קבצים טופלו**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** ✅ **COMPLETE - SEE CLEANUP_COMPLETE.md**

**log_entry | [Team 10] | DEPRECATED_DOCS | CLEANUP_COMPLETE | GREEN | 2026-02-06**
