# 🚨 פקודת P0 אדומה: ניקוי רעלים - Team 20

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend)  
**תאריך:** 2026-02-05  
**סטטוס:** 🔴 **CRITICAL - BLOCKING BATCH 2**  
**מקור:** פקודת האדריכל P0 אדומה

---

## 📢 Executive Summary

לפי פקודת האדריכל P0 אדומה, יש לבצע ניקוי רעלים מיידי:

1. **אכיפת רבים (Plural):** שינוי כל מופעי `trade`/`trading_account` ל-`trades`/`trading_accounts`
2. **ניקוי D16:** הסרת כל שארית טקסטואלית של השם הישן

---

## 🔴 משימות קריטיות

### **1. אכיפת רבים (Plural)** 🔴 **CRITICAL**

**בעיה:**
- יש מופעים של `trade`/`trading_account` ביחיד במקום רבים

**פעולות:**
1. חיפוש כל המופעים של `trade` (לא `trades`) ב-API endpoints
2. חיפוש כל המופעים של `trading_account` (לא `trading_accounts`) ב-API endpoints
3. שינוי לרבים: `trade` → `trades`, `trading_account` → `trading_accounts`

**קבצים לבדיקה:**
- כל קבצי API routes
- כל קבצי Field Maps
- כל קבצי Database Schema

---

### **2. ניקוי D16** 🔴 **CRITICAL**

**בעיה:**
- יש שאריות טקסטואליות של D16 בקוד

**פעולות:**
1. חיפוש כל המופעים של `D16` בקוד
2. הסרה או עדכון של כל המופעים

---

## ⏱️ זמן משוער

**1-2 שעות**

---

## ✅ קריטריוני השלמה

- ✅ כל המופעים של `trade`/`trading_account` שונו לרבים
- ✅ אין עוד מופעים של D16 בקוד

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-05  
**סטטוס:** 🔴 **CRITICAL - BLOCKING BATCH 2**

**log_entry | [Team 10] | P0_RED | TEAM_20 | CLEANUP_MANDATE | RED | 2026-02-05**
