# רשימת קבצי HTML בתיקייה UI - מלאי מלא

**תאריך עדכון:** 2026-02-04  
**מטרה:** רשימה מסודרת של כל קבצי ה-HTML בתיקייה `ui` (לא כולל blueprints), מסודרים לפי עמוד, תאריך עדכון וגרסה.

---

## 📋 סיכום כללי

סה"כ **9 קבצי HTML** בתיקייה `ui`:
- **4 עמודי תוכן** (Financial Views)
- **2 קומפוננטות** (Core Components)
- **2 עמודי תבנית** (Index/Build)
- **1 קובץ בדיקה** (Test)

---

## 📄 עמודי תוכן (Financial Views)

### 1. עמוד חשבונות מסחר (Trading Accounts)
- **קובץ:** `ui/src/views/financial/trading_accounts.html`
- **Route:** `/trading_accounts`
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד לניהול חשבונות מסחר
- **תכונות:**
  - טבלת חשבונות מסחר
  - פילטרים וחיפוש
  - פעולות CRUD

---

### 2. עמוד פרופיל משתמש (User Profile)
- **קובץ:** `ui/src/views/financial/user_profile.html`
- **Route:** `/user_profile`
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד לניהול פרופיל משתמש
- **תכונות:**
  - מידע אישי
  - שינוי סיסמה
  - מפתחות API
  - **בעיה ידועה:** חסרים שדות, החלוקה לא נכונה, עיצוב סקשן המפתחות לא קרוב

---

### 3. עמוד עמלות ברוקרים (Brokers Fees)
- **קובץ:** `ui/src/views/financial/brokers_fees.html`
- **Route:** `/brokers_fees`
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד לניהול ברוקרים ועמלות
- **תכונות:**
  - טבלת ברוקרים ועמלות
  - הגדרות עמלות

---

### 4. עמוד תזרימי מזומנים (Cash Flows)
- **קובץ:** `ui/src/views/financial/cash_flows.html`
- **Route:** `/cash_flows`
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד ליומן תזרים מזומנים
- **תכונות:**
  - טבלת תנועות מזומנים
  - פילטרים לפי תאריך

---

## 🧩 קומפוננטות (Core Components)

### 5. Unified Header Component
- **קובץ:** `ui/src/components/core/unified-header.html`
- **Route:** N/A (קומפוננטה, לא עמוד)
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Component Template)
- **תיאור:** תבנית Header מאוחדת לכל העמודים
- **שימוש:** נטען דינמית על ידי `header-loader.js`

---

### 6. Footer Component
- **קובץ:** `ui/src/views/financial/footer.html`
- **Route:** N/A (קומפוננטה, לא עמוד)
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Component Template)
- **תיאור:** תבנית Footer לכל העמודים
- **שימוש:** נטען דינמית על ידי `footer-loader.js`

---

## 🏠 עמודי תבנית (Index/Build)

### 7. עמוד ראשי (Index)
- **קובץ:** `ui/index.html`
- **Route:** `/`
- **סטטוס:** ✅ **TRACKED** (נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-01-31 21:59:31 +0200
- **Commit:** `70d6d91cc33c7ad40d1c57fefcc083bd177116a9`
- **הודעה:** "feat: Team 60 infrastructure setup complete - all P0 tasks done"
- **גרסה:** v1.0 (Main Entry Point)
- **תיאור:** עמוד ראשי / נקודת כניסה למערכת

---

### 8. Build Output (Dist)
- **קובץ:** `ui/dist/index.html`
- **Route:** N/A (Build Output)
- **סטטוס:** ✅ **TRACKED** (נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-01 15:57:08 +0200
- **Commit:** `6a84460cb1a453fbe85df408d82b8be582cc5c3e`
- **הודעה:** "feat: Validation Framework Complete + Documentation Updates"
- **גרסה:** v1.0 (Build Artifact)
- **תיאור:** קובץ Build (לא רלוונטי לפיתוח)

---

## 🧪 קבצי בדיקה (Test Files)

### 9. Auth Guard Test
- **קובץ:** `ui/test-auth-guard.html`
- **Route:** N/A (קובץ בדיקה)
- **סטטוס:** ⚠️ **UNTRACKED** (לא נשמר בגיט)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Test File)
- **תיאור:** קובץ בדיקה ל-Auth Guard

---

## 📊 טבלת סיכום

| # | שם עמוד | קובץ | Route | סטטוס | תאריך עדכון | גרסה |
|---|---------|------|-------|-------|--------------|-------|
| 1 | חשבונות מסחר | `trading_accounts.html` | `/trading_accounts` | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |
| 2 | פרופיל משתמש | `user_profile.html` | `/user_profile` | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |
| 3 | עמלות ברוקרים | `brokers_fees.html` | `/brokers_fees` | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |
| 4 | תזרימי מזומנים | `cash_flows.html` | `/cash_flows` | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |
| 5 | Unified Header | `unified-header.html` | N/A | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |
| 6 | Footer | `footer.html` | N/A | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |
| 7 | עמוד ראשי | `index.html` | `/` | ✅ TRACKED | 2026-01-31 21:59:31 | v1.0 |
| 8 | Build Output | `dist/index.html` | N/A | ✅ TRACKED | 2026-02-01 15:57:08 | v1.0 |
| 9 | Auth Guard Test | `test-auth-guard.html` | N/A | ⚠️ UNTRACKED | 2026-02-04 02:00:33 | v1.0 |

---

## ⚠️ בעיות ידועות

1. **רוב הקבצים UNTRACKED** - 7 מתוך 9 קבצים לא נשמרו בגיט
2. **פרופיל משתמש** - חסרים שדות, החלוקה לא נכונה, עיצוב סקשן המפתחות לא קרוב
3. **אין היסטוריית גרסאות** - לא ניתן לעקוב אחרי שינויים בקבצים ה-UNTRACKED

---

## 🔧 המלצות

1. **לשמור את כל הקבצים בגיט** - להוסיף את כל הקבצים ה-UNTRACKED ל-git
2. **לתעד שינויים** - ליצור commit לכל שינוי משמעותי
3. **לשחזר גרסאות קודמות** - לבדוק גרסאות קודמות של `user_profile.html` (ראה `_COMMUNICATION/user_profile_versions/`)

---

## 📝 הערות

- כל הקבצים ב-`ui/src/views/financial/` הם עמודי HTML סטטיים
- הקבצים נטענים דרך Vite Middleware (ראה `ui/vite.config.js`)
- Header ו-Footer נטענים דינמית על ידי loaders
- כל העמודים משתמשים ב-Auth Guard לבדיקת אימות

---

**עודכן על ידי:** AI Assistant  
**תאריך:** 2026-02-04
