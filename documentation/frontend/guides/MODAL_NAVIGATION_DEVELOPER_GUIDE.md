# Modal Navigation Developer Guide

**תאריך עדכון:** 2025-11-11  
**מחלקה:** Frontend  
**סטטוס:** ✅ עדכני

מדריך זה מספק הנחיות יישום ואבחון לשילוב מודולים עם `ModalNavigationService` החדש של TikTrack.

---

## 1. מושגים מרכזיים

| מושג | תיאור |
|------|--------|
| **ModalNavigationService** | שירות גלובלי לניהול stack של מודולים מקוננים. חשוף כ-`window.ModalNavigationService`. |
| **ModalNavigationUI** | שכבת UI שמציגה breadcrumb וכפתור BACK. חשופה באמצעות `window.modalNavigationManager`. |
| **PageStateManager** | אחראי לשמירת מצב הניווט ב-`UnifiedCacheManager`. |
| **Metadata** | אובייקט שמאפיין מודול ב-stack: `{ modalId, modalType, entityType, entityId, title, sourceInfo, metadata }`. |

---

## 2. Quick Start Checklist

1. **ייבוא/הגדרה**: הקובץ `modal-navigation-manager.js` נטען מתוך ה-manifest הכללי. אין צורך לייבא ידנית.
2. **רישום פתיחה**: כאשר מודול נוצר, קרא ל-`registerModalOpen()` עם המטא-נתונים הרלוונטיים.
3. **רישום סגירה**: מאזין ל-`hidden.bs.modal` → `registerModalClose()`.
4. **עדכון מידע**: לאחר טעינה דינמית (כותרת חדשה, מזהה ישות), קרא ל-`updateModalMetadata()`.
5. **UI**: אם הכותרת משתנה לאחר פתיחה, קרא ל-`modalNavigationManager.updateModalNavigation(modalElement)`.
6. **אין** קריאות ל-`manageBackdrop`, אין שמירת HTML בקוד מקומי.

---

## 3. תבניות קוד

### 3.1 רישום מודול חדש

```javascript
async function openTradeDetails(tradeId) {
  const modalElement = document.getElementById('tradeDetailsModal');

  await window.ModalNavigationService.registerModalOpen(modalElement, {
    modalId: 'tradeDetailsModal',
    modalType: 'entity-details',
    entityType: 'trade',
    entityId: tradeId,
    title: `פרטי טרייד #${tradeId}`,
    metadata: { mode: 'view' }
  });

  bootstrap.Modal.getOrCreateInstance(modalElement, { backdrop: false }).show();
}
```

### 3.2 סגירת מודול

```javascript
modalElement.addEventListener('hidden.bs.modal', () => {
  window.ModalNavigationService.registerModalClose('tradeDetailsModal');
}, { once: true });
```

### 3.3 עדכון כותרת/מזהה

```javascript
window.ModalNavigationService.updateModalMetadata('tradeDetailsModal', {
  title: 'פרטי טרייד #987',
  entityId: 987
});
```

### 3.4 ניווט לאחור ולמודול ספציפי

```javascript
await window.ModalNavigationService.goBack();
await window.ModalNavigationService.navigateTo('entityDetailsModal');
```

---

## 4. אינטגרציה עם מודולים קיימים

### EntityDetailsModal
- רישום מידי ב-`show()`.
- עדכון מידע ב-`loadEntityData()`.
- רישום סגירה ב-`onModalHidden()`.

### ModalManagerV2 (CRUD)
- רישום במקטע `showCrudModal` לאחר יצירת ה-Modal.
- מטא-נתונים: `entityType`, `mode`, `entityId`, `title` (מתוך הקונפיגורציה).
- שימוש ב-`updateModalMetadata` לאחר שינוי כותרת forms.

### מודולי שירות (trade-selector, linked-items וכו')
- רישום פתיחה עם `sourceInfo` כדי לשמר הקשר.
- listener ל-`hidden.bs.modal` לסגירה.

---

## 5. PageStateManager Integration

שירות הניווט קורא אוטומטית ל:
- `saveModalNavigationState()` לאחר כל שינוי stack.
- `loadModalNavigationState()` בזמן init (אבחון בלבד).
- `clearModalNavigationState()` כאשר stack מתאפס.

אין צורך בקריאות ידניות. לשימושי אבחון:

```javascript
const persisted = await window.PageStateManager.loadModalNavigationState();
console.table(persisted?.stack || []);
```

---

## 6. Debugging Toolkit

| כלי | מיקום | שימוש |
|-----|-------|-------|
| `window.debugModalStacking()` | `trading-ui/scripts/debug-modal-stacking.js` | לוג מפורט על stack, backdrops ו-z-index |
| `window.ModalNavigationService.getStack()` | גלובלי | בדיקת מצב עדכני בקונסול |
| `documentation/05-REPORTS/MODAL_NAVIGATION_DEBUG_REPORT.md` | דוח היסטורי | רקע על תקלות ישנות |

### טיפים
- אם breadcrumb לא מתעדכן: ודא שהמודול מעדכן `title` וה-UI נקרא.
- אם stack "נתקע": בדוק listener ל-`hidden.bs.modal` (כולל מודולים שמוסרים מה-DOM ידנית).

---

## 7. שינויים חשובים בין גרסה 1 ל-2

| נושא | גרסה 1 | גרסה 2 |
|------|---------|--------|
| Backdrop | ניהול ידני ע"י ModalNavigationManager | Bootstrap בלבד |
| HTML Cache | שמירת תוכן המודול | בוטל – נטען מחדש בכל פתיחה |
| Persistency | זיכרון בלבד | PageStateManager + UnifiedCache |
| API עיקרי | `pushModal`, `modalHistory` | `registerModalOpen`, `getStack` |
| תאימות | אין wrappers | קיימים wrappers לשימור קוד ישן |

---

## 8. שאלות נפוצות

**ש:** האם צריך להחזיק reference למודול ב-state?
**ת:** לא. השירות מחזיר את רכיבי ה-DOM כשמבקשים `includeElements: true`.

**ש:** מה קורה כאשר modalId אינו ייחודי?
**ת:** חובה להעביר `modalId` ייחודי. השירות יתריע בקונסול אם מזהה כפילויות.

**ש:** האם ניתן לדלג על `registerModalClose`?
**ת:** לא מומלץ. ללא הקריאה stack יישאר עם רשומות "מתות".

---

## 9. To-do לפני Merge

- [ ] בדוק שכל המודולים הרלוונטיים קוראים ל-`registerModalOpen/Close`.
- [ ] עדכן בדיקות ידניות (שרשור, חזרה, סגירה מלאה).
- [ ] ודא שאין שימוש ב-`manageBackdrop`.
- [ ] וודא שהמסמכים הקשורים (Entity Details, Modal System V2) הותאמו.

---

**Maintainer:** Frontend Architecture Team  
**צריכים עזרה?** פנו ל-`#frontend-architecture` בסלק.


