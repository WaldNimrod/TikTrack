# תוכנית מימוש מלאה – סטנדרטיזציה לכל עמודי המשתמש

מסמך זה מרחיב את הדוח `USER_PAGES_STANDARDIZATION_AUDIT.md` ומפרט כיצד לבצע את הסטנדרטיזציה המלאה בכל העמודים לפי ששת השלבים שסוכמו עם נימרוד.

---

## 1. עבודה לפי דפוסים רוחביים

### 1.1 שכבת שירותי הנתונים והמטמון
| עמוד | שירות נתונים מתוכנן | מפתח מטמון (UCM) | TTL מוצע (CacheTTLGuard) | Decorators backend |
|------|----------------------|-------------------|---------------------------|--------------------|
| Dashboard | `services/dashboard-data.js` | `dashboard-data` + תתי-מפתחות (`dashboard-trades`, `dashboard-alerts`) | 60 שניות | `@invalidate_cache(['dashboard'])` על `/api/trades`, `/api/alerts`, `/api/trading-accounts`, `/api/cash-flows` |
| Executions | `services/executions-data.js` | `executions-data` | 45 שניות | `@invalidate_cache(['executions'])` על create/update/delete |
| Trading Accounts | `services/trading-accounts-data.js` | `trading-accounts-data` | 60 שניות | `@invalidate_cache(['trading_accounts','accounts-summary'])` |
| Cash Flows | `services/cash-flows-data.js` | `cash-flows-data` | 60 שניות | `@invalidate_cache(['cash_flows','accounts-summary'])` |
| Notes | `services/notes-data.js` | `notes-data` (במקום `notes`) | 90 שניות | `@invalidate_cache(['notes'])` |
| Data Import | `services/data-import-service.js` | `data-import-history` | 5 דקות | webhook invalidate בעת סשן חדש |
| DB Display | `services/db-diagnostics-service.js` | `db-display-{table}` | 10 דקות (read-only) | לא נדרש – נתוני מערכת בלבד |
| DB Extra Data | `services/db-extra-data-service.js` | `db-extra-{slug}` | 10 דקות | לא נדרש |
| Research | `services/research-data.js` (מקור נתונים אמיתי או fallback לשגיאה) | `research-data` | 15 דקות | `@invalidate_cache(['research'])` |
| Preferences | `services/preferences-data.js` | `preferences-types`, `preferences-defaults`, `preferences-user-{profile}` | 5 דקות | כבר קיים (לעדכן להגדרות החדשות) |

**פעולות לביצוע**  
1. ליצור קבצי שירות חדשים בתיקיית `trading-ui/scripts/services/` לפי הטבלה.  
2. לרשום את המפתחות ב-`unified-cache-manager.js` (כולל שכבת זיכרון, localStorage, IndexedDB, backend).  
3. לעדכן `CacheTTLGuard.CONFIG` ו-`CacheSyncManager` בתיקיית `scripts`.  
4. לבטל כל `fetch` ישיר בקבצי הדף ולהפנות לשירות החדש (`window.ExecutionsData.loadExecutionsData`, `window.TradingAccountsData.load`, וכו').  
5. להוסיף בדיקות smoke לכל שירות (טעינה, invalidate, forced reload).

### 1.2 סטנדרט CRUD אחיד
- כל פעולה (save/update/delete/cancel/close/execute) תשתמש ב:
  - `CRUDResponseHandler.handleSave/handleUpdate/handleDelete`.
  - `handleApiResponseWithRefresh` כאשר יש צורך לרענן טבלה וטפסים.
  - `window.checkLinkedItemsAndPerformAction` לפני delete/cancel.
  - `ModalManagerV2` לפתיחה/סגירה של מודלים (אין DOM ישיר).
  - `NotificationSystem` להצגת הצלחה/כשל (אין `alert`, אין `console.log` למשתמש).
  - `TagService` לכל ישות שתומכת בתגיות (Trades, Trade Plans, Alerts, Notes, Tag Management).
- לוגיקת cache:
  - לפני שליחת בקשה – לקרוא `UnifiedCacheManager.invalidate/clearByPattern`.
  - לאחר הצלחת ה-CRUD – להעביר `reloadFn` שמתבסס על שירות הנתונים ולא על `fetch` מקומי.

### 1.3 לוגים, שגיאות ו-Rule 48
- להחליף הדפסות console ב-`window.Logger`.
- כאשר נתון חסר או API מחזיר שגיאה – להציג הודעת "לא זמין" דרך מערכת ההתראות (אין נתונים מדומים).
- ב-Research: אם ה-API לא זמין – הצגת שגיאה + לינק להדרכה, ללא `setTimeout` מדומה.

---

## 2. השלמות ובדיקות לכל עמוד

| עמוד | פעולות עיקריות | בדיקות יעודיות |
|------|-----------------|-----------------|
| Dashboard | לחבר ל-`dashboard-data.js`, להוסיף invalidate cross-entity, לאפשר refresh מהיר דרך `CacheTTLGuard`. | שינוי רשומה בטיקרים → בדוק ש-dashboard מציג נתונים חדשים ללא רענון ידני. |
| Trades / Trade Plans / Tickers / Tag Management | מצב תקין – רק לוודא שהשירותים החדשים מתחברים ל-CacheSync החדש (אין שינוי קוד משמעותי). | להריץ CRUD מלא + לעקוב אחרי `UnifiedCacheManager.inspect`. |
| Executions | להחליף `loadExecutionsData` לשימוש בשירות, לרכז כל ה-`fetch` (כולל modal helpers) בשירות, לחבר ל-`checkLinkedItemsAndPerformAction`. | יצירת ביצוע → verify table refresh; ביטול ביצוע → verify cache invalidate. |
| Trading Accounts | ליצור שירות נתונים עם יכולת טעינת יתרות/טריידים פתוחים; לעטוף את כל פעולות העריכה ב-CRUD handler. | הוספת חשבון, שינוי יתרה, הצגת יתרות מט"ח. |
| Cash Flows | להסיר console, להוסיף שירות נתונים עם מסוכים (trades/trade plans reference), מחיקת ריצה כפולה. | הוספה/עדכון/ביטול תזרים, בדיקת סיכומים. |
| Notes | לעבור למפתח `notes-data`, להכניס לוגיקה של rich text לתוך השירות (load/save). | הוספת הערה + תגיות, בדיקת טעינת קבצים. |
| Research | לחבר לנתוני אמת (API קיים או שאילתת DB). אם מידע אינו זמין – הצגת אזהרה + תיעוד. | טעינת מדד תנודתיות, בדיקת מצבי שגיאה. |
| Preferences | ליצור שירות מרוכז להעדפות (types/defaults/user profiles), לצמצם `fetch` מפוזרים. | שמירת פרופיל, החלפת פרופיל, בדיקת `/api/preferences/version`. |
| Data Import | לחשוף שירות לכל ה-API endpoints, לתזמן invalidate כאשר מתקבל session חדש. | טעינת היסטוריה לחשבון יחיד/מרובה, partial failure. |
| DB Display + DB Extra Data | איחוד לקובץ שירות אחד שמקבל slug, מטמון ארוך, טיפול בשגיאות דרך UI. | טעינת כל טבלה, הצגת שגיאה ייעודית כשאין הרשאות. |

עבור כל עמוד יש להכין בדיקת Jest/Integration (אם קיימת תשתית) + תרחיש ידני (מתועד בסעיף 6).

---

## 3. סריקה חוזרת לניקיון קוד
1. להריץ linters (ESLint + Stylelint) על כל הקבצים ששונו.
2. להריץ סקריפט custom לזיהוי `fetch(` בקבצי דף (ציפייה: יישארו רק בשירותים).
3. לבדוק שאין inline styles או `console.log`.
4. לוודא שכל קובץ JS מכיל Function Index מעודכן.
5. להפעיל `node scripts/quality/enforce-general-systems.js` (אם קיים) כדי לוודא שימוש במערכות הגנריות.

---

## 4. בדיקות מאקרו (אוטומציה + ידני)

### 4.1 Jest / Unit
- להריץ את חבילות השירותים החדשות (mock fetch + Mock UCM).
- לוודא שקריאות CRUD מטפלות בשגיאות (reject, status != 200).

### 4.2 Integration / Manual
- **CRUD Sweep**: ריצה לפי עמוד – יצירה, עדכון, מחיקה, ביטול, שיבוט.  
- **Cache Validation**: אחרי כל CRUD – להריץ `window.UnifiedCacheManager.inspect('<key>')` ולוודא שהמפתח מתעדכן.  
- **Header/Filter Persistence**: לעבור בין עמודים עם פילטר פתוח, לוודא שהמצב נשמר (PageStateManager).  
- **Tag Flow**: בדיקה חוצת-עמודים (Trades → Tag Management → Notes).  
- **Research Failover**: סימולציה של API לא זמין ובדיקה שהמשתמש מקבל הודעה מפורטת ולא נתונים מדומים.

כל תוצאה מתועדת ב-`documentation/05-REPORTS/LOCAL_SUMMARIES/USER_PAGES_STANDARDIZATION_TEST_REPORT.md` (ייצור קובץ חדש בשלב 4).

---

## 5. עדכון תיעוד
1. לעדכן את `USER_PAGES_STANDARDIZATION_AUDIT.md` עם עמודת “Remediation Status”.
2. לעדכן `documentation/INDEX.md` עם הקבצים החדשים (שירותים/דוחות).
3. להוסיף הפניות ב-`documentation/frontend/GENERAL_SYSTEMS_LIST.md` לשירותים החדשים.
4. לעדכן את הדוקומנטציה של כל עמוד (למשל `pages/TRADING_ACCOUNTS_PAGE_SPECIFICATION.md`) עם הסברים על שכבת השירות והמטמון.
5. להוסיף מדריך תפעול קצר לכל שירות תחת `documentation/02-ARCHITECTURE/FRONTEND/` (לדוגמה `FRONTEND_EXECUTIONS_DATA_SERVICE.md`).

---

## 6. תרחישי בדיקה בממשק וסיכום

### 6.1 צ'ק-ליסט UI (דוגמה)
- **Dashboard – Refresh**  
  1. לעדכן טיקר.  
  2. לוודא שה-Widget ב-dashboard מתעדכן תוך <= 2 שניות.  
  3. לבדוק שרשומת המטמון `dashboard-data` עודכנה.
- **Executions – Cancel Flow**  
  1. לפתוח ביצוע, ללחוץ ביטול.  
  2. לאשר את מודל האזהרה (ModalManagerV2).  
  3. וידוא שהשורה בטבלה מתעדכנת + מופיעה הודעת הצלחה.  
  4. בדיקת `UnifiedCacheManager.inspect('executions-data')`.
- **Trading Accounts – Balance Update**  
  1. לערוך חשבון ולשנות Balance.  
  2. לוודא שהסכומים בדשבורד וב-Accounts Table מתעדכנים.  
  3. בדיקת cache key `trading-accounts-data`.
- **Research – Data Availability**  
  1. לבצע טעינה כאשר ה-API אינו זמין (סימולציה).  
  2. לקבל הודעת שגיאה מפורטת (Rule 48) ללא נתונים מדומים.

### 6.2 סיכום עבודה
- לאחר סיום כל השלבים להכין תקציר מצב (`documentation/05-REPORTS/LOCAL_SUMMARIES/USER_PAGES_STANDARDIZATION_SUMMARY.md`) עם:
  - מפת התקדמות (עמודים × מצב).  
  - תקלות קריטיות שנותרו (אם יש).  
  - בדיקות שבוצעו + קישורים לתוצאות.  
  - המלצות לפריסה/בקרת איכות.

---

מסמך זה מהווה מפת דרכים מחייבת לשלבי המימוש הבאים. כל עבודת קוד/בדיקות/תיעוד תתבצע לפי הסעיפים לעיל ותסומן לאורך הדרך בכלי המשימות.*** End Patch

