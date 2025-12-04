# ניתוח תלויות init-system
## Init System Dependencies Analysis

**תאריך יצירה:** 2025-12-04 16:26:43

---

## 📊 סיכום כללי


- **סה"כ תלויות:** 25

- **Scripts ב-init-system:** 0


---

## 📦 Scripts ב-init-system



---

## 🔍 ניתוח תלויות


### ❓ advanced-notifications (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ ai-analysis (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ✅ base (נדרש)


- **מספר scripts:** 0

- **סיבה:** נדרש ל-Logger, API_BASE_URL, וכל מערכות הבסיס



### ❓ cache (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ charts (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ conditions (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ crud (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ dashboard-widgets (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ dev-tools (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ entity-details (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ entity-services (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ external-data (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ helper (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ info-summary (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ logs (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ management (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ modules (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ preferences (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ services (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ system-management (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ tradingview-charts (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ tradingview-widgets (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ ui-advanced (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ validation (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



### ❓ watch-lists (לבדיקה)


- **מספר scripts:** 0

- **סיבה:** 



---

## 💡 המלצות


### תלויות נדרשות (מומלץ לשמור):

- `base`



### תלויות לבדיקה (אולי מיותרות):

- `advanced-notifications` - צריך לבדוק אם באמת נדרש

- `ai-analysis` - צריך לבדוק אם באמת נדרש

- `cache` - צריך לבדוק אם באמת נדרש

- `charts` - צריך לבדוק אם באמת נדרש

- `conditions` - צריך לבדוק אם באמת נדרש

- `crud` - צריך לבדוק אם באמת נדרש

- `dashboard-widgets` - צריך לבדוק אם באמת נדרש

- `dev-tools` - צריך לבדוק אם באמת נדרש

- `entity-details` - צריך לבדוק אם באמת נדרש

- `entity-services` - צריך לבדוק אם באמת נדרש

- `external-data` - צריך לבדוק אם באמת נדרש

- `helper` - צריך לבדוק אם באמת נדרש

- `info-summary` - צריך לבדוק אם באמת נדרש

- `logs` - צריך לבדוק אם באמת נדרש

- `management` - צריך לבדוק אם באמת נדרש

- `modules` - צריך לבדוק אם באמת נדרש

- `preferences` - צריך לבדוק אם באמת נדרש

- `services` - צריך לבדוק אם באמת נדרש

- `system-management` - צריך לבדוק אם באמת נדרש

- `tradingview-charts` - צריך לבדוק אם באמת נדרש

- `tradingview-widgets` - צריך לבדוק אם באמת נדרש

- `ui-advanced` - צריך לבדוק אם באמת נדרש

- `validation` - צריך לבדוק אם באמת נדרש

- `watch-lists` - צריך לבדוק אם באמת נדרש



### המלצה כללית:

- **נוכחי:** 25 תלויות

- **מומלץ:** 4 תלויות (רק base + מה שבאמת נדרש לניטור)

- **חיסכון:** 21 תלויות



### מה באמת נדרש ל-init-system:

1. **base** - ל-Logger, API_BASE_URL, וכל מערכות הבסיס ✅

2. **מה שנדרש לניטור** - צריך לבדוק מה `monitoring-functions.js` באמת צריך

3. **מה שנדרש ל-UnifiedAppInitializer** - צריך לבדוק מה `core-systems.js` באמת צריך


