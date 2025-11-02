# תוכנית בדיקות - בעיית עדכון כותרת מודול אחרי חזרה

## תאריך: 1 בנובמבר 2025

## בעיה
כותרת המודול לא מתעדכנת אחרי חזרה לסוג הישות הנכון וממשיכה להציג את סוג הישות הקודם.

## נקודות בדיקה קריטיות

### 1. בדיקת ערכי כותרת ב-DOM
**מה לבדוק:**
- מה הערך של `innerHTML` של `#entityDetailsModalLabel` לפני כל עדכון
- מה הערך אחרי כל עדכון
- מתי הכותרת משתנה (אם בכלל)

**איפה להוסיף לוגים:**
- בתחילת `_showPreviousModal()` - לפני כל עדכון
- אחרי עדכון `currentEntityType/Id`
- אחרי כל קריאה ל-`updateModalTitle()`
- אחרי שחזור תוכן
- אחרי `updateModalNavigation()`

### 2. בדיקת ערכי משתנים ב-entityDetailsModal
**מה לבדוק:**
- מה הערך של `entityDetailsModal.currentEntityType` לפני ואחרי כל עדכון
- מה הערך של `entityDetailsModal.currentEntityId` לפני ואחרי כל עדכון
- מה הערך של `entityDetailsModal.sourceInfo` לפני ואחרי כל עדכון

**איפה להוסיף לוגים:**
- בתחילת `_showPreviousModal()`
- אחרי כל עדכון של `currentEntityType/Id`
- בתחילת `updateModalTitle()` - מה הערכים שהפונקציה מקבלת
- בתוך `updateModalTitle()` - מה הערכים הסופיים (`finalEntityType`, `finalEntityId`)

### 3. בדיקת תוכן משוחזר
**מה לבדוק:**
- האם התוכן המשוחזר מכיל אלמנט כותרת?
- האם התוכן המשוחזר מכיל JavaScript שיכול לעדכן את הכותרת?
- מה האורך של התוכן המשוחזר?

**איפה להוסיף לוגים:**
- לפני שחזור תוכן - מה `previousModal.content`
- אחרי שחזור תוכן - מה `contentElement.innerHTML`
- בדיקה אם יש אלמנטים עם `id="entityDetailsModalLabel"` בתוכן המשוחזר

### 4. בדיקת סדר ביצוע
**מה לבדוק:**
- באיזה סדר הפונקציות רצות?
- האם יש `setTimeout` שעלול לגרום לבעיות?
- האם יש race conditions?

**איפה להוסיף לוגים:**
- בתחילת `_showPreviousModal()`
- בתחילת כל `setTimeout`
- בסוף כל `setTimeout`
- בתוך `updateModalTitle()` - נקודת כניסה ויציאה

### 5. בדיקת history state
**מה לבדוק:**
- מה ה-history לפני `goBack()`
- מה ה-history אחרי `popModal()`
- מה ה-history אחרי `_showPreviousModal()`

**איפה להוסיף לוגים:**
- בתחילת `goBack()`
- אחרי `popModal()`
- בתחילת `_showPreviousModal()` - מה `previousModal.info`
- בסוף `_showPreviousModal()`

## לוגים להוספה

### ב-modal-navigation-manager.js:

1. **בתחילת `_showPreviousModal()`:**
```javascript
console.log('🔍🔍🔍 [_showPreviousModal] START', {
    previousModalInfo: previousModal.info,
    previousModalEntityType: previousModal.info?.entityType,
    previousModalEntityId: previousModal.info?.entityId,
    previousModalHasContent: !!previousModal.content,
    previousModalContentLength: previousModal.content?.length || 0,
    currentEntityDetailsModalType: window.entityDetailsModal?.currentEntityType,
    currentEntityDetailsModalId: window.entityDetailsModal?.currentEntityId,
    titleElementBefore: document.getElementById('entityDetailsModalLabel')?.innerHTML,
    historyLength: this.modalHistory.length
});
```

2. **אחרי עדכון currentEntityType/Id:**
```javascript
console.log('🔍🔍🔍 [_showPreviousModal] After updating currentEntityType/Id', {
    entityType,
    entityId,
    currentEntityType: window.entityDetailsModal.currentEntityType,
    currentEntityId: window.entityDetailsModal.currentEntityId,
    sourceInfo: window.entityDetailsModal.sourceInfo,
    titleElementAfter: document.getElementById('entityDetailsModalLabel')?.innerHTML
});
```

3. **אחרי שחזור תוכן:**
```javascript
console.log('🔍🔍🔍 [_showPreviousModal] After restoring content', {
    contentLength: previousModal.content?.length || 0,
    contentElementInnerHTML: document.getElementById('entityDetailsContent')?.innerHTML?.substring(0, 200),
    titleElementAfter: document.getElementById('entityDetailsModalLabel')?.innerHTML,
    hasTitleInContent: previousModal.content?.includes('entityDetailsModalLabel') || false
});
```

### ב-entity-details-modal.js:

1. **בתחילת `updateModalTitle()`:**
```javascript
console.log('🔍🔍🔍 [updateModalTitle] START', {
    receivedEntityType: entityType,
    receivedEntityDataOrId: entityDataOrId,
    thisCurrentEntityType: this.currentEntityType,
    thisCurrentEntityId: this.currentEntityId,
    thisSourceInfo: this.sourceInfo,
    finalEntityType,
    finalEntityId,
    titleElementBefore: titleElement?.innerHTML,
    isNestedModal: !!this.sourceInfo
});
```

2. **אחרי עדכון currentEntityType/Id:**
```javascript
console.log('🔍🔍🔍 [updateModalTitle] After updating currentEntityType/Id', {
    finalEntityType,
    finalEntityId,
    thisCurrentEntityType: this.currentEntityType,
    thisCurrentEntityId: this.currentEntityId
});
```

3. **אחרי יצירת titleHTML:**
```javascript
console.log('🔍🔍🔍 [updateModalTitle] After creating titleHTML', {
    titleHTML,
    titleHTMLLength: titleHTML.length,
    titleElementAfter: titleElement?.innerHTML
});
```

4. **בסוף `updateModalTitle()`:**
```javascript
console.log('🔍🔍🔍 [updateModalTitle] END', {
    finalEntityType,
    finalEntityId,
    titleElementFinal: titleElement?.innerHTML,
    breadcrumbRestored: !!(breadcrumbContainer && breadcrumbHTML)
});
```

## שאלות לבדיקה

1. האם `updateModalTitle()` נקרא בכלל?
2. מה הערכים שהיא מקבלת?
3. האם הכותרת מתעדכנת ב-DOM אבל אז נדרסת?
4. האם התוכן המשוחזר מכיל את הכותרת הישנה?
5. האם יש event listeners שמוסיפים את הכותרת הישנה?

## שלבים לביצוע

1. הוספת כל הלוגים למעלה
2. הרצת תרחיש: פתיחת trade_plan → מעבר ל-note → חזרה
3. ניתוח הלוגים לפי סדר הביצוע
4. זיהוי נקודת הכישלון המדויקת
5. תיקון נקודת הכישלון


