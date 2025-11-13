# מערכת ניווט מודולים מקוננים - TikTrack
## Modal Navigation System (Service Architecture)

**תאריך עדכון:** 2025-11-11  
**גרסה:** 2.0.0  
**סטטוס:** ✅ פעילה בפרודקשן  
**מטרה:** ניהול Stack של מודולים מקוננים באמצעות שירות כללי, אינטגרציה עם PageStateManager, ובקרת UI אחידה.

---

## 📋 סקירה כללית

מהדורה זו של מערכת הניווט מחליפה את המימוש המבוסס על `ModalNavigationManager` מקומי במערכת שירות כללית:

- **ModalNavigationService** – שכבת הלוגיקה המרכזית (stack, התמPersistence, אירועים).
- **ModalNavigationUI** – שכבת התצוגה (breadcrumb, כפתור BACK, אינטגרציה עם ButtonSystem).
- **PageStateManager** – אחסון מצב הניווט ב-`UnifiedCacheManager` (חדש בגרסה זו).
- **Compatibility Wrappers** – `window.modalNavigationManager` ו-`window.pushModalToNavigation()` עבור קוד קיים.

המערכת מוותרת על ניהול ידני של backdrops ותוכן HTML שמור, מתמקדת ברשימת מטא-נתונים בלבד, ומספקת API עקבי לכל מודול שרוצה להצטרף לניווט.

---

## 🏗️ ארכיטקטורה

| רכיב | קובץ | אחריות |
|------|------|---------|
| **ModalNavigationService** | `trading-ui/scripts/modal-navigation-manager.js` | Stack, קריאות API (`registerModalOpen`, `registerModalClose`, `updateModalMetadata`, `goBack`, `navigateTo`, `getStack`) | 
| **ModalNavigationUI** | `trading-ui/scripts/modal-navigation-manager.js` | breadcrumb, כפתור BACK, רישום האזנה ל-`shown/hidden.bs.modal` |
| **PageStateManager** | `trading-ui/scripts/page-state-manager.js` | שימור מצב (`saveModalNavigationState`, `loadModalNavigationState`, `clearModalNavigationState`) |
| **Compatibility Layer** | `window.modalNavigationManager` | חשיפה מינימלית לפונקציות `goBack`, `updateModalNavigation`, `getBreadcrumb`, לצורכי תאימות לאחור |

```
ModalNavigationService
├── state (stack, activeModalId)
├── registerModalOpen()
├── registerModalClose()
├── updateModalMetadata()
├── goBack()
├── navigateTo()
└── getStack(options)

ModalNavigationUI
├── updateModalNavigation(element)
├── getBreadcrumb(element)
└── subscribe לשינויים מהשירות
```

---

## 🔧 API מרכזי – ModalNavigationService

### `registerModalOpen(modalElement, metadata)`
רישום מודול חדש או עדכון מודול קיים. מבטיח שהמודול יופיע ב-breadcrumb ויתויג במטא-נתונים הנכונים.

```javascript
await window.ModalNavigationService.registerModalOpen(modalElement, {
  modalId: 'entityDetailsModal',
  modalType: 'entity-details',
  entityType: 'trade_plan',
  entityId: 123,
  title: 'פרטי תכנון #123',
  sourceInfo: { type: 'entity-details', modalId: 'executionsModal' },
  metadata: { mode: 'view' }
});
```

### `registerModalClose(modalId, { instanceId })`
הסרת מודול מה-stack. **בגרסה הנוכחית השירות קורא לפונקציה הזו אוטומטית** כאשר מתקבל אירוע `hidden.bs.modal`. השימוש הידני רלוונטי רק במודולים legacy שלא עודכנו לשירות.

```javascript
// שימוש ידני – רק אם אין חיבור לשירות (legacy):
window.ModalNavigationService.registerModalClose('entityDetailsModal', {
  instanceId: modalElement.dataset.modalNavigationInstanceId
});
```

### `updateModalMetadata(modalId, updates)`
עדכון מידע קיים (למשל כותרת, entityId) ללא שינוי סדר ה-stack.

```javascript
window.ModalNavigationService.updateModalMetadata('entityDetailsModal', {
  title: 'פרטי טרייד #456',
  entityId: 456,
  metadata: {
    mode: 'view',
    includeLinkedItems: true,
    lastLoadedAt: Date.now()
  }
});
```

### `getStack({ includeElements })`
החזרת snapshot של המצב (עם/בלי אלמנטים פיזיים בר DOM).

```javascript
const stack = window.ModalNavigationService.getStack({ includeElements: true });
```

### `goBack()` / `navigateTo(modalId)`
פקודות ניווט חוזר או קפיצה למודול ספציפי. משמרות אירועי Bootstrap ומעדכנות את ה-stack בהתאם.

### אירוע `modal-navigation:restore`
האירוע נשלח ע"י השירות בשני שלבים:

| Stage | תזמון | שימוש |
|-------|-------|--------|
| `before-show` | לפני שהמודול הקודם מוצג מחדש | מאפשר לטעון מחדש נתונים/להציג מצב טעינה |
| `after-show` | לאחר שהמודול מוצג | עדכון final UI, שמירת `instanceId` על האובייקט |

```javascript
modalElement.addEventListener('modal-navigation:restore', event => {
  const { stage, entry } = event.detail || {};
  if (stage === 'before-show' && entry?.entityId) {
    restoreContent(entry);
  }
});
```

---

## 🎨 שכבת ה-UI (ModalNavigationUI)

- מאזינה ל-`shown.bs.modal` ו-`hidden.bs.modal` כדי לעדכן breadcrumb ו-Back button.
- משתמשת ב-`Window.ButtonSystem` לעיצוב הכפתור.
- חשופה כ-`window.modalNavigationManager.updateModalNavigation()` עבור מודולים שזקוקים לרענון ידני (למשל אחרי שינוי כותרת).

```javascript
if (window.modalNavigationManager?.updateModalNavigation) {
  window.modalNavigationManager.updateModalNavigation(modalElement);
}
```

---

## 📦 תאימות לאחור

| פונקציה ישנה | מצב בגרסה 2 | הערה |
|--------------|-------------|-------|
| `modalNavigationManager.pushModal()` | נתמכת דרך `window.pushModalToNavigation()` (wrapper לשירות) | מומלץ לעבור ל-`ModalNavigationService.registerModalOpen` |
| `modalNavigationManager.goBack()` | ממשיך לעבוד (קורא ל-`service.goBack()`) | אין שינוי ב-API הציבורי |
| `modalNavigationManager.manageBackdrop()` | **בטל** | ניהול backdrop מתבצע ע"י Bootstrap בלבד |
| `modalNavigationManager.modalHistory` | **בוטל** | השתמשו ב-`ModalNavigationService.getStack()` |

---

## 🔗 אינטגרציה עם מערכות קיימות

### EntityDetailsModal (`entity-details-modal.js`)
- רישום מוקדם ב-`registerModalOpen` עוד לפני טעינת הנתונים.
- `updateModalMetadata` בסיום `loadEntityData()` כדי לעדכן כותרות ו-entityId.
- מאזין ל-`modal-navigation:restore` ומרענן את הנתונים לפי ה-entry שנשמר, כולל טעינה מחדש של הנתונים מה-API.
- אין קריאה ידנית ל-`registerModalClose` – השירות מטפל בסגירה דרך מאזין `hidden.bs.modal` שנרשם אוטומטית.

### ModalManagerV2 (`modal-manager-v2.js`)
- רישום מודולי CRUD עם `entityType`, `entityId`, `mode`.
- קריאה ל-`updateModalMetadata` לאחר שינוי כותרת.
- סגירה מנוהלת אוטומטית; אין צורך להוסיף מאזין גלובלי שסוגר את המופע.

### מודולים ייעודיים (Trade Selector, Linked Items, Import User Data)
- קוראים ל-`registerModalOpen` בעת הצגה ומעדכנים מטא-נתונים לפי הצורך.
- אין להוסיף קריאות ידניות ל-`registerModalClose`; השירות מנקה את המופע בעת `hidden.bs.modal`.
- אינם מנהלים backdrop או HTML שמור.

### Utilities
- `createAndShowModal()` ב-`core-systems.js` אינו נוגע עוד לניווט; האחריות לרישום מוטלת על הקורא.
- `ui-utils.js` ו-`notification-system.js` הפסיקו לקרוא ל-`manageBackdrop`.

---

## 🔄 זרימות עיקריות

### פתיחת מודול
1. יצירת ה-Modal (Bootstrap).
2. קריאה ל-`ModalNavigationService.registerModalOpen` (לפני או מיד אחרי `show()`).
3. השירות מצמיד מאזין `hidden.bs.modal` ייעודי ומעדכן את ה-`instanceId` על האלמנט.
4. מודול הפרטים אחראי לעדכן מטא-נתונים (`updateModalMetadata`) עם כותרת/EntityId/מצב עדכני.
5. ModalNavigationUI מאזינה ל-`shown.bs.modal` ומציגה breadcrumb + כפתור BACK.
6. PageStateManager שומר את ה-stack המעודכן.

### סגירת מודול
1. Bootstrap מפעיל `hidden.bs.modal` (לחיצה על Close, `goBack`, או סגירה תכנית).
2. המאזין האוטומטי של השירות קורא ל-`registerModalClose` עם ה-`instanceId` של המופע.
3. PageStateManager מעדכן/מנקה מצב.
4. ModalNavigationUI מסירה breadcrumb/כפתורי BACK רלוונטיים.

### חזרה אחורה
1. `goBack()` → סגירה של המודול האחרון באמצעות Bootstrap.
2. האירוע `hidden.bs.modal` של המודול שנסגר מפעיל את המאזין האוטומטי.
3. לאחר הסגירה, השירות מציג מחדש את המודול הקודם (אם קיים) וה-UI מתעדכן אוטומטית.

### טעינת מצב שמור
- בעת `service.init()` נשלפת רשימת stack מ-PageStateManager (אם קיימת). אין פתיחה אוטומטית של מודולים; הנתונים משמשים לצורכי ניתור בלבד.

---

## 🗂️ התמPersistence – PageStateManager

```javascript
await window.PageStateManager.saveModalNavigationState({
  stack: [
    { modalId: 'entityDetailsModal', modalType: 'entity-details', entityType: 'trade', entityId: 12, title: 'טרייד #12' }
  ],
  activeModalId: 'entityDetailsModal'
});
```

API חדש:
- `saveModalNavigationState(state, { pageName })`
- `loadModalNavigationState({ pageName })`
- `clearModalNavigationState({ pageName })`

ברירת המחדל ל-`pageName` מגיעה מ-`window.getCurrentPageName()`.

---

## 📑 מבנה מטא-נתונים

כל ערך stack (entry) מכיל:

| שדה | תיאור |
|-----|-------|
| `instanceId` | מזהה ייחודי לכל פתיחה של מודל (גם אם `modalId` זהה) |
| `modalId` | מזהה המודל (אלמנט DOM) |
| `modalType` | טיפוס לוגי (למשל `entity-details`, `crud-modal`) |
| `entityType` / `entityId` | ישות עסקית אליה שייך המודל |
| `title` | הכותרת העדכנית להצגה ב-breadcrumb |
| `sourceInfo` | אובייקט מקור (למשל מי פתח את המודל) |
| `metadata` | שדות משלימים (מצב צפייה/עריכה, includeLinkedItems, lastLoadedAt וכו') |

`ModalNavigationService.updateModalMetadata` מאחד את הערכים החדשים עם הנתון הקיים ולכן מומלץ לספק רק שדות שהשתנו.

---

## 🧪 בדיקות מומלצות

1. **שרשרת Entity → Plan → Note → Back** – ודא שהBreadcrumb והכפתור מתעדכנים בכל שלב.
2. **מודולי CRUD מקוננים** (ModalManagerV2) – ודא שמזהי הישות והכותרות משתקפים ב-stack.
3. **Modal Selector (trade-selector)** – וודא שדנן מקור (`sourceInfo`) נשמר ומעודכן.
4. **סגירה מהירה** – פתיחה וסגירה רצופים של מודולים אמורים להשאיר Stack נקי.
5. **התאוששות לאחר רענון דף** – בדוק ש-`loadModalNavigationState` מחזיר נתונים (אבחון בלבד).

---

## 🛠️ פתרון בעיות

| סימפטום | בדיקה |
|---------|--------|
| כפתור BACK לא מופיע | בדוק ש-`registerModalOpen` נקרא לפני אירוע `shown.bs.modal` ושיש לפחות שני פריטים ב-stack |
| Breadcrumb ריק | ודא ש-`updateModalMetadata` כותב `title` וכי ה-UI מעודכן (`updateModalNavigation`) |
| Stack לא מתנקה | ודא שהמודול קרא ל-`registerModalOpen` ושאלמנט ה-Modal לא הוסר לפני אירוע `hidden.bs.modal` |
| נתונים לא נשמרים | בדוק ש-`PageStateManager.saveModalNavigationState` זמין וש-`UnifiedCacheManager` מאותחל |

---

## 📚 מסמכים נלווים

- `Modal System V2` – פרטי ModalManagerV2 (`documentation/02-ARCHITECTURE/FRONTEND/MODAL_SYSTEM_V2.md`).
- `Entity Details Modal` – אינטגרציה עם שירות הניווט (`documentation/02-ARCHITECTURE/FRONTEND/ENTITY_DETAILS_MODAL.md`).
- **מדריך מפתחים חדש** – `documentation/frontend/guides/MODAL_NAVIGATION_DEVELOPER_GUIDE.md` (ראו להלן).

---

## 🧭 מדריך למפתחים (תמצית)

1. **מודול חדש שרוצה להופיע ב-breadcrumb**
   - הוסף קריאה ל-`registerModalOpen` עם מטא-נתונים רלוונטיים (לפני `show()`).
   - אין לקרוא ל-`registerModalClose` ידנית; השירות יעשה זאת. ניתן להשתמש ב-`hidden.bs.modal` לניקוי מקומי כל עוד לא נקראת הפונקציה.
   - אם הכותרת משתנה לאחר טעינה – קרא ל-`updateModalMetadata`.

2. **מודולים ותיקים**
   - הימנע מקריאה ל-`modalNavigationManager.manageBackdrop` או גישה ישירה ל-`modalHistory`.
   - במקרה של קוד ישן שאינו בר־שינוי, ניתן להשתמש ב-`window.pushModalToNavigation` (wrapper הממיר לקריאה לשירות).

3. **PageStateManager**
   - אין צורך בהתערבות ידנית; השירות ינהל שמירה/טעינה.
   - לשימוש ייעודי (לדוגמה אבחון) ניתן לקרוא ל-`PageStateManager.loadModalNavigationState()`.

---

## 🔄 צ'קליסט מעבר לגרסה 2

- [x] ModalManagerV2 מעדכן `ModalNavigationService` במקום `pushModal`.
- [x] EntityDetailsModal רושם/מעדכן/מנקה דרך השירות.
- [x] שירותים חיצוניים (trade-selector, linked-items וכו') הוסבו.
- [x] ניהול backdrops הוסר ממודולים מקומיים.
- [x] PageStateManager תומך במצב ניווט.

---

**גרסה אחרונה:** 2.0.0  
**תאריך עדכון:** 2025-11-11  
**מחבר:** TikTrack Frontend Team



