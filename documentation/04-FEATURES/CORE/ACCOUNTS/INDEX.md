# Accounts System - אינדקס דוקומנטציה

**תאריך יצירה:** נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מעודכן

---

## 📚 קבצי דוקומנטציה זמינים

### 📖 תיעוד מפורט

#### **Account Activity System** ⭐ מערכת פעילות חשבון מסחר
- **[ACCOUNT_ACTIVITY_SYSTEM.md](ACCOUNT_ACTIVITY_SYSTEM.md)** - מערכת חישוב פעילות חשבון מסחר
  - מטרות המערכת וארכיטקטורה
  - API endpoints ונתוני תגובה
  - חישוב יתרות לפי מטבע
  - אינטגרציה עם מערכת מטבעות
  - Cache management

#### **Account Balance Service** ⭐ שירות טעינת יתרות
- **[ACCOUNT_BALANCE_SERVICE.md](ACCOUNT_BALANCE_SERVICE.md)** - שירות מרכזי לטעינת יתרות
  - API פשוט ונוח לשימוש
  - ניהול cache אוטומטי
  - Batch loading יעיל
  - דוגמאות שימוש בעמודים
  - אינטגרציה עם UnifiedCacheManager

#### **Cash Balance Architecture** 📊 השוואת ארכיטקטורות
- **[CASH_BALANCE_ARCHITECTURE_COMPARISON.md](CASH_BALANCE_ARCHITECTURE_COMPARISON.md)** - השוואה בין גישות
  - Approach A: Stored Field (לא מומלץ)
  - Approach B: Real-time Calculation + Caching (מומלץ ✅)
  - השוואת יתרונות וחסרונות
  - דוגמאות יישום

---

## 🎯 סקירה מהירה

### מערכות חשבונות במערכת:

1. **Account Activity System** - מערכת חישוב פעילות חשבון מסחר
   - חישוב יתרות בזמן אמת
   - תמיכה במספר מטבעות
   - אינטגרציה עם executions ו-cash flows
   - **API:** `/api/account-activity/<account_id>`

2. **Account Balance Service** - שירות טעינת יתרות
   - API פשוט: `AccountBalanceService.getBalance(accountId)`
   - Batch loading: `AccountBalanceService.getBalances([1, 2, 3])`
   - Cache אוטומטי (TTL: 60 שניות)
   - **קובץ:** `trading-ui/scripts/services/account-balance-service.js`

3. **Cash Balance Architecture** - דיון ארכיטקטוני
   - הסרת `cash_balance` מ-database
   - מעבר ל-real-time calculation
   - שימוש ב-caching לאופטימיזציה

---

## 📖 מיקום בדוקומנטציה

כל הדוקומנטציה של מערכות חשבונות נמצאת תחת:
```
documentation/04-FEATURES/CORE/ACCOUNTS/
├── INDEX.md (קובץ זה)
├── ACCOUNT_ACTIVITY_SYSTEM.md
├── ACCOUNT_BALANCE_SERVICE.md
└── CASH_BALANCE_ARCHITECTURE_COMPARISON.md
```

---

## 🔗 קישורים רלוונטיים

### במערכת הדוקומנטציה:
- **אינדקס ראשי:** [documentation/INDEX.md](../../../INDEX.md)
- **מערכות כלליות:** [documentation/frontend/GENERAL_SYSTEMS_LIST.md](../../../frontend/GENERAL_SYSTEMS_LIST.md)
- **מערכת מטמון:** [documentation/04-FEATURES/CORE/UNIFIED_CACHE_SYSTEM.md](../UNIFIED_CACHE_SYSTEM.md)
- **מערכת Services:** [documentation/frontend/SERVICES_ARCHITECTURE.md](../../../frontend/SERVICES_ARCHITECTURE.md)

### בקוד:
- **Backend Service:** `Backend/services/account_activity_service.py`
- **Backend API:** `Backend/routes/api/account_activity.py`
- **Frontend Service:** `trading-ui/scripts/services/account-balance-service.js`
- **Frontend Activity:** `trading-ui/scripts/account-activity.js`

---

## 🚀 התחלה מהירה

### למפתחים חדשים:

1. **להבין את הארכיטקטורה:**
   - קרא [CASH_BALANCE_ARCHITECTURE_COMPARISON.md](CASH_BALANCE_ARCHITECTURE_COMPARISON.md)

2. **להשתמש ב-Account Balance Service:**
   - קרא [ACCOUNT_BALANCE_SERVICE.md](ACCOUNT_BALANCE_SERVICE.md)
   - דוגמאות: `AccountBalanceService.getBalance(1)`

3. **להבין את Account Activity System:**
   - קרא [ACCOUNT_ACTIVITY_SYSTEM.md](ACCOUNT_ACTIVITY_SYSTEM.md)
   - API: `/api/account-activity/<account_id>`

---

## 📝 עדכון אחרון

**תאריך:** נובמבר 2025  
**שינויים:**
- ✅ יצירת Account Balance Service
- ✅ עדכון Account Activity System
- ✅ יצירת אינדקס דוקומנטציה זה





