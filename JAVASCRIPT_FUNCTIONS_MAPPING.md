# JavaScript Functions Mapping - TikTrack
## מיפוי פונקציות JavaScript - מערכת TikTrack

### תאריך עדכון: 23 אוגוסט 2025

---

## 📋 טבלת פונקציות לפי קטגוריות

### 🎯 **פונקציות גלובליות (Global Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `window.sortTableData` | `main.js` | סידור טבלאות גלובלי | ✅ פעיל | - |
| `window.getColumnValue` | `table-mappings.js` | קבלת ערך עמודה | ✅ פעיל | `getColumnValue` ב-`main.js` (deprecated) |
| `window.saveSortState` | `main.js` | שמירת מצב סידור | ✅ פעיל | - |
| `window.getSortState` | `main.js` | קבלת מצב סידור | ✅ פעיל | - |
| `window.sortAnyTable` | `main.js` | סידור כל טבלה | ✅ פעיל | - |
| `window.restoreAnyTableSort` | `main.js` | שחזור סידור טבלה | ✅ פעיל | - |

### 🔔 **פונקציות התראות (Notification Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `showNotification` | `main.js` | הצגת התראה כללית | ✅ פעיל | - |
| `showSuccessNotification` | `main.js` | הצגת התראת הצלחה | ✅ פעיל | - |
| `showErrorNotification` | `main.js` | הצגת התראת שגיאה | ✅ פעיל | - |
| `showWarningNotification` | `main.js` | הצגת התראת אזהרה | ✅ פעיל | - |
| `showInfoNotification` | `main.js` | הצגת התראת מידע | ✅ פעיל | - |
| `showModalNotification` | `main.js` | התראה במודל | ✅ פעיל | - |
| `showModalSuccessNotification` | `main.js` | התראת הצלחה במודל | ✅ פעיל | - |
| `showModalErrorNotification` | `main.js` | התראת שגיאה במודל | ✅ פעיל | - |
| `showModalWarningNotification` | `main.js` | התראת אזהרה במודל | ✅ פעיל | - |
| `showModalInfoNotification` | `main.js` | התראת מידע במודל | ✅ פעיל | - |

### 🔄 **פונקציות טעינת נתונים (Data Loading Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `loadDesignsData` | `planning.js` | טעינת נתוני תכנונים | ✅ פעיל | - |
| `loadTradesData` | `trades.js` | טעינת נתוני טריידים | ✅ פעיל | - |
| `loadAccountsData` | `accounts.js` | טעינת נתוני חשבונות | ✅ פעיל | - |
| `loadAlertsData` | `alerts.js` | טעינת נתוני התראות | ✅ פעיל | - |
| `loadTickersData` | `tickers.js` | טעינת נתוני טיקרים | ✅ פעיל | - |
| `loadNotesData` | `notes.js` | טעינת נתוני הערות | ✅ פעיל | - |
| `loadExecutionsData` | `executions.js` | טעינת נתוני עסקאות | ✅ פעיל | - |
| `loadCashFlowsData` | `cash_flows.js` | טעינת נתוני תזרימי מזומנים | ✅ פעיל | - |

### 📊 **פונקציות עדכון טבלאות (Table Update Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `updateDesignsTable` | `planning.js` | עדכון טבלת תכנונים | ✅ פעיל | - |
| `updateTradesTable` | `trades.js` | עדכון טבלת טריידים | ✅ פעיל | - |
| `updateAccountsTable` | `accounts.js` | עדכון טבלת חשבונות | ✅ פעיל | - |
| `updateAlertsTable` | `alerts.js` | עדכון טבלת התראות | ✅ פעיל | - |
| `updateTickersTable` | `tickers.js` | עדכון טבלת טיקרים | ✅ פעיל | - |
| `updateNotesTable` | `notes.js` | עדכון טבלת הערות | ✅ פעיל | - |
| `updateExecutionsTable` | `executions.js` | עדכון טבלת עסקאות | ✅ פעיל | - |
| `updateCashFlowsTable` | `cash_flows.js` | עדכון טבלת תזרימי מזומנים | ✅ פעיל | - |

### 🔍 **פונקציות סינון (Filter Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `filterDesignsData` | `planning.js` | סינון נתוני תכנונים | ✅ פעיל | - |
| `filterTradesData` | `trades.js` | סינון נתוני טריידים | ✅ פעיל | - |
| `filterTradesLocally` | `trades.js` | סינון מקומי טריידים | ✅ פעיל | - |
| `filterAlertsLocally` | `alerts.js` | סינון מקומי התראות | ✅ פעיל | - |

### 📋 **פונקציות סידור (Sort Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `sortTable` | `alerts.js` | סידור טבלת התראות | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `planning.js` | סידור טבלת תכנונים | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `trades.js` | סידור טבלת טריידים | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `accounts.js` | סידור טבלת חשבונות | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `notes.js` | סידור טבלת הערות | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `tickers.js` | סידור טבלת טיקרים | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `executions.js` | סידור טבלת עסקאות | ✅ פעיל | כן - בכל עמוד |
| `sortTable` | `cash_flows.js` | סידור טבלת תזרימי מזומנים | ✅ פעיל | כן - בכל עמוד |

### 🏠 **פונקציות ממשק (UI Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `toggleSection` | `main.js` | הצגה/הסתרת סקשן | ✅ פעיל | - |
| `toggleAllSections` | `main.js` | הצגה/הסתרת כל הסקשנים | ✅ פעיל | - |
| `restoreSectionStates` | `main.js` | שחזור מצב סקשנים | ✅ פעיל | - |
| `closeModal` | `alerts.js` | סגירת מודל | ✅ פעיל | כן - בקבצים רבים |

### 🎯 **פונקציות אימות (Validation Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `validateTradeForm` | `trades.js` | אימות טופס טרייד | ✅ פעיל | - |
| `validateAccountForm` | `accounts.js` | אימות טופס חשבון | ✅ פעיל | - |
| `validateAlertForm` | `alerts.js` | אימות טופס התראה | ✅ פעיל | - |

### 🌐 **פונקציות תרגום (Translation Functions)**
| פונקציה | מיקום | תיאור | סטטוס | כפילויות |
|---------|--------|--------|--------|-----------|
| `translateAccountStatus` | `translation-utils.js` | תרגום סטטוס חשבון | ✅ פעיל | - |
| `translateTickerStatus` | `translation-utils.js` | תרגום סטטוס טיקר | ✅ פעיל | - |
| `translateAlertStatus` | `translation-utils.js` | תרגום סטטוס התראה | ✅ פעיל | - |
| `translateTradePlanStatus` | `translation-utils.js` | תרגום סטטוס תכנון | ✅ פעיל | - |

---

## 🚨 **בעיות שזוהו**

### ❌ **כפילויות משמעותיות**
1. **`sortTable` function** - קיימת בכל עמוד עם אותה לוגיקה
2. **`closeModal` function** - קיימת במספר קבצים
3. **`getColumnValue` function** - קיימת ב-`main.js` ו-`table-mappings.js`
4. **פונקציות אימות** - דפוסים דומים בכל עמוד

### ⚠️ **מערכות מיותרות/מיושנות**
1. **`menu.js`** - מערכת תפריט מיושנת (יש `header-system.js`)
2. **`app-header.js`** - מערכת כותרת מיושנת
3. **`getColumnValue` ב-`main.js`** - deprecated, יש ב-`table-mappings.js`

### 🔄 **חוסר עקביות**
1. **סדר טעינת קבצים** - לא אחיד בכל העמודים
2. **שמות פונקציות** - לא אחידים (`loadData` vs `loadDataForPage`)
3. **מבנה קוד** - כל עמוד עם מבנה שונה

---

## 💡 **המלצות לארגון מחדש**

### 🎯 **שלב 1: איחוד פונקציות כפולות**
- [ ] העברת כל פונקציות `sortTable` למערכת גלובלית
- [ ] איחוד פונקציות `closeModal` 
- [ ] הסרת `getColumnValue` מ-`main.js`

### 🗂️ **שלב 2: ארגון מחדש לפי אחריות**
- [ ] **Core Functions** (`main.js`) - פונקציות יסוד
- [ ] **UI Components** (`ui-components.js`) - רכיבי ממשק
- [ ] **Data Management** (`data-manager.js`) - ניהול נתונים
- [ ] **Form Validation** (`form-validation.js`) - אימות טפסים

### 🧹 **שלב 3: ניקוי קבצים מיותרים**
- [ ] הסרת `menu.js` (מיושן)
- [ ] הסרת `app-header.js` (מיושן)
- [ ] איחוד `db-extradata.js` ו-`db_extradata.js`

### 📏 **שלב 4: סטנדרטיזציה**
- [ ] אחידות בשמות פונקציות
- [ ] סדר טעינה אחיד בכל העמודים
- [ ] מבנה קוד אחיד

---

## 📊 **סטטיסטיקות נוכחיות**

- **סה"כ קבצי JavaScript:** 29
- **פונקציות גלובליות:** 6
- **פונקציות כפולות זוהו:** 4
- **קבצים מיותרים:** 3
- **עמודים עם `sortTable`:** 8

---

*מסמך זה עודכן אוטומטית על ידי מערכת הניתוח של TikTrack*


