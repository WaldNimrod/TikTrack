# 🚨 פקודת P0 אדומה: ניקוי רעלים - Team 30

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-05  
**סטטוס:** 🔴 **CRITICAL - BLOCKING BATCH 2**  
**מקור:** פקודת האדריכל P0 אדומה

---

## 📢 Executive Summary

לפי פקודת האדריכל P0 אדומה, יש לבצע ניקוי רעלים מיידי:

1. **ניקוי פורט 7246:** הסרה מיידית של כל קריאת Ingest ב-SortManager ו-DataLoader
2. **אכיפת רבים (Plural):** שינוי כל מופעי `trade`/`trading_account` ל-`trades`/`trading_accounts`
3. **ניקוי D16:** הסרת כל שארית טקסטואלית של השם הישן

---

## 🔴 משימות קריטיות

### **1. ניקוי פורט 7246 - קריאות Ingest** 🔴 **CRITICAL**

**בעיה:**
- יש קריאות ל-`http://127.0.0.1:7246/ingest/...` בקוד
- זה פורט לא מורשה שצריך להסיר

**פעולות:**
1. חיפוש כל המופעים של `7246` בקוד
2. חיפוש כל המופעים של `ingest` בקוד
3. הסרה מיידית של כל הקריאות

**קבצים לבדיקה:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
- כל קבצי SortManager
- כל קבצי DataLoader

---

### **2. אכיפת רבים (Plural)** 🔴 **CRITICAL**

**בעיה:**
- יש מופעים של `trade`/`trading_account` ביחיד במקום רבים

**פעולות:**
1. חיפוש כל המופעים של `trade` (לא `trades`)
2. חיפוש כל המופעים של `trading_account` (לא `trading_accounts`)
3. שינוי לרבים: `trade` → `trades`, `trading_account` → `trading_accounts`

**הערה:** רק שמות משתנים/פונקציות/קבצים - לא תוכן טקסטואלי.

---

### **3. ניקוי D16** 🔴 **CRITICAL**

**בעיה:**
- יש שאריות טקסטואליות של D16 בקוד

**פעולות:**
1. חיפוש כל המופעים של `D16` בקוד
2. הסרה או עדכון של כל המופעים

**הערה:** כבר בוצע ניקוי חלקי ב-P2, אבל יש לבדוק שוב.

---

## ⏱️ זמן משוער

**2-4 שעות**

---

## ✅ קריטריוני השלמה

- ✅ אין עוד קריאות ל-7246 בקוד
- ✅ אין עוד `ingest` בקוד
- ✅ כל המופעים של `trade`/`trading_account` שונו לרבים
- ✅ אין עוד מופעים של D16 בקוד

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-05  
**סטטוס:** 🔴 **CRITICAL - BLOCKING BATCH 2**

**log_entry | [Team 10] | P0_RED | TEAM_30 | CLEANUP_MANDATE | RED | 2026-02-05**
