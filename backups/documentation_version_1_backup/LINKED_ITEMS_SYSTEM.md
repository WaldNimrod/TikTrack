# מערכת פריטים מקושרים - TikTrack

## 📋 סקירה כללית

מערכת הפריטים המקושרים (Linked Items System) היא מערכת לבדיקה והצגת אזהרות על פריטים מקושרים לפני ביצוע פעולות מסוכנות כמו מחיקה או ביטול.

## 🎯 מטרה

המערכת נועדה למנוע מחיקה או ביטול של פריטים שיש להם קשרים עם פריטים אחרים במערכת, ולספק למשתמש מידע מלא על ההשלכות של הפעולה.

## 🔗 סוגי פריטים מקושרים

### חשבונות (Accounts)
- **טריידים** (Trades) - טריידים מקושרים לחשבון
- **תזרימי מזומנים** (Cash Flows) - תזרימי מזומנים מקושרים לחשבון

### טיקרים (Tickers)
- **התראות** (Alerts) - התראות מקושרות לטיקר
- **טריידים** (Trades) - טריידים מקושרים לטיקר

### טריידים (Trades)
- **תוכניות טרייד** (Trade Plans) - תוכניות טרייד מקושרות
- **הערות** (Notes) - הערות מקושרות לטרייד

## 🛠️ פונקציות המערכת

### 1. בדיקת פריטים מקושרים

```javascript
/**
 * בדיקת פריטים מקושרים לחשבון
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<Array>} - מערך של פריטים מקושרים
 */
async function getLinkedItemsForAccount(accountId) {
  // בדיקת טריידים מקושרים
  const tradesResponse = await fetch(`/api/v1/trades/?account_id=${accountId}`);
  const tradesData = await tradesResponse.json();
  
  // בדיקת תזרימי מזומנים מקושרים
  const cashFlowsResponse = await fetch(`/api/v1/cash_flows/?account_id=${accountId}`);
  const cashFlowsData = await cashFlowsResponse.json();
  
  // סיכום הפריטים המקושרים
  const linkedItems = [];
  
  // הוספת טריידים
  if (tradesData && tradesData.data && Array.isArray(tradesData.data)) {
    linkedItems.push(...tradesData.data.map(trade => ({
      type: 'trade',
      id: trade.id,
      name: `${trade.ticker_symbol} ${trade.side}`,
      description: `טרייד ${trade.ticker_symbol}`
    })));
  }
  
  // הוספת תזרימי מזומנים
  if (cashFlowsData && cashFlowsData.data && Array.isArray(cashFlowsData.data)) {
    linkedItems.push(...cashFlowsData.data.map(cf => ({
      type: 'cash_flow',
      id: cf.id,
      name: `${cf.type} ${cf.amount}`,
      description: `תזרים מזומנים ${cf.type}`
    })));
  }
  
  return linkedItems;
}
```

### 2. הצגת אזהרת פריטים מקושרים

```javascript
/**
 * הצגת אזהרת פריטים מקושרים
 * @param {string} itemType - סוג הפריט ('account', 'ticker', 'trade')
 * @param {number} linkedCount - מספר הפריטים המקושרים
 * @param {Function} onConfirm - פונקציה לביצוע באישור
 * @param {Function} onCancel - פונקציה לביצוע בביטול
 */
function showLinkedItemsWarning(itemType, linkedCount, onConfirm = null, onCancel = null) {
  // מיפוי סוגי פריטים לעברית
  const itemTypeDisplay = {
    'account': 'חשבון',
    'ticker': 'טיקר',
    'trade': 'טרייד',
    'alert': 'התראה',
    'cash_flow': 'תזרים מזומנים'
  }[itemType] || 'אובייקט';
  
  // יצירת modal אזהרה
  createLinkedItemsWarningModal(itemTypeDisplay, linkedCount, onConfirm, onCancel);
}
```

### 3. יצירת Modal אזהרה

```javascript
/**
 * יצירת modal אזהרת פריטים מקושרים
 * @param {string} itemTypeDisplay - שם הפריט בעברית
 * @param {number} linkedCount - מספר הפריטים המקושרים
 * @param {Function} onConfirm - פונקציה לביצוע באישור
 * @param {Function} onCancel - פונקציה לביצוע בביטול
 */
function createLinkedItemsWarningModal(itemTypeDisplay, linkedCount, onConfirm, onCancel) {
  // יצירת HTML של המודל
  const modalHtml = `
    <div class="modal fade" id="linkedItemsWarningModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header modal-header-colored bg-warning text-dark">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle me-2"></i>
              אזהרת פריטים מקושרים
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">
              <strong>${itemTypeDisplay}</strong> זה מקושר ל-<strong>${linkedCount} פריטים</strong> במערכת.
            </p>
            <p class="text-warning mb-0 mt-2">
              <i class="fas fa-info-circle me-1"></i>
              מחיקת הפריט עלולה להשפיע על הפריטים המקושרים.
            </p>
            <p class="mb-0 mt-2">
              האם אתה בטוח שברצונך להמשיך?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelLinkedItemsBtn">
              <i class="fas fa-times me-1"></i>
              ביטול
            </button>
            <button type="button" class="btn btn-warning" id="confirmLinkedItemsBtn">
              <i class="fas fa-exclamation-triangle me-1"></i>
              המשך למחיקה
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // הוספת המודל ל-DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // קבלת אלמנטי המודל
  const modal = document.getElementById('linkedItemsWarningModal');
  const confirmBtn = document.getElementById('confirmLinkedItemsBtn');
  const cancelBtn = document.getElementById('cancelLinkedItemsBtn');
  
  // הוספת event listeners
  confirmBtn.addEventListener('click', () => {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
  });
  
  cancelBtn.addEventListener('click', () => {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
  });
  
  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // ניקוי המודל אחרי סגירה
  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}
```

## 🔄 זרימת עבודה

### זרימת מחיקת חשבון עם מקושרים

```javascript
// 1. המשתמש לוחץ על "מחק" חשבון
function deleteAccount(accountId) {
  const account = window.accountsData?.find(acc => acc.id === accountId);
  if (account) {
    checkLinkedItemsBeforeDeleteModal(account);
  }
}

// 2. בדיקת פריטים מקושרים
async function checkLinkedItemsBeforeDeleteModal(account) {
  const linkedItems = await getLinkedItemsForAccount(account.id);
  
  if (linkedItems && linkedItems.length > 0) {
    // יש פריטים מקושרים - הצגת אזהרה
    window.showLinkedItemsWarning('account', linkedItems.length,
      () => {
        // המשתמש אישר - הצגת modal מחיקה
        createCustomDeleteModal(account);
      },
      () => {
        // המשתמש ביטל
        console.log('User cancelled linked items warning');
      }
    );
  } else {
    // אין פריטים מקושרים - הצגת modal מחיקה ישירות
    createCustomDeleteModal(account);
  }
}

// 3. יצירת modal מחיקה מותאם
function createCustomDeleteModal(account) {
  // יצירת modal מחיקה עם כפתור "כן, מחק את החשבון"
  // ...
}

// 4. ביצוע המחיקה בפועל
async function performAccountDeletion(accountId) {
  const response = await fetch(`/api/v1/accounts/${accountId}`, {
    method: 'DELETE'
  });
  
  if (response.ok) {
    window.showSuccessNotification('החשבון נמחק בהצלחה');
    // רענון הטבלה
    window.loadAccountsAndUpdateTable();
  } else {
    window.showErrorNotification('שגיאה במחיקת החשבון');
  }
}
```

### זרימת ביטול חשבון עם מקושרים

```javascript
// 1. המשתמש לוחץ על "ביטול" חשבון
function cancelAccount(accountId) {
  const account = window.accountsData?.find(acc => acc.id === accountId);
  if (account) {
    checkLinkedItemsBeforeCancel(account);
  }
}

// 2. בדיקת פריטים מקושרים
async function checkLinkedItemsBeforeCancel(account) {
  const linkedItems = await getLinkedItemsForAccount(account.id);
  
  if (linkedItems && linkedItems.length > 0) {
    // יש פריטים מקושרים - הצגת אזהרה
    window.showLinkedItemsWarning('account', linkedItems.length,
      () => {
        // המשתמש אישר - ביצוע ביטול
        updateAccountStatus(account.id, 'cancelled');
      },
      () => {
        // המשתמש ביטל
        console.log('User cancelled account cancellation');
      }
    );
  } else {
    // אין פריטים מקושרים - ביצוע ביטול ישירות
    updateAccountStatus(account.id, 'cancelled');
  }
}
```

## 📊 מבנה נתונים

### מבנה פריט מקושר

```javascript
const linkedItem = {
  type: 'trade',           // סוג הפריט
  id: 1,                   // מזהה הפריט
  name: 'AAPL Long',       // שם הפריט
  description: 'טרייד AAPL' // תיאור הפריט
};
```

### דוגמאות פריטים מקושרים

```javascript
const linkedItems = [
  {
    type: 'trade',
    id: 1,
    name: 'AAPL Long',
    description: 'טרייד AAPL'
  },
  {
    type: 'trade',
    id: 4,
    name: 'AAPL Long',
    description: 'טרייד AAPL'
  },
  {
    type: 'cash_flow',
    id: 5,
    name: 'dividend 750.0',
    description: 'תזרים מזומנים dividend'
  },
  {
    type: 'cash_flow',
    id: 8,
    name: 'withdrawal -3000.0',
    description: 'תזרים מזומנים withdrawal'
  },
  {
    type: 'cash_flow',
    id: 11,
    name: 'deposit 546.0',
    description: 'תזרים מזומנים deposit'
  },
  {
    type: 'cash_flow',
    id: 12,
    name: 'fee 100.0',
    description: 'תזרים מזומנים fee'
  }
];
```

## 🎨 עיצוב

### Modal אזהרת פריטים מקושרים

- **כותרת**: "אזהרת פריטים מקושרים" (צהוב)
- **תוכן**: "חשבון זה מקושר ל-6 פריטים במערכת"
- **כפתורים**: 
  - "ביטול" (אפור) - ביטול הפעולה
  - "המשך למחיקה" (צהוב) - אישור הפעולה
- **איקון**: אזהרה (exclamation-triangle)

### צבעים

```css
/* כותרת */
.modal-header-colored.bg-warning {
  background-color: #ffc107 !important;
  color: #212529 !important;
}

/* כפתור אישור */
.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

/* כפתור ביטול */
.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}
```

## 🔍 דיבוג ופתרון בעיות

### לוגים חשובים

```javascript
// בדיקת נתוני API
console.log('🚀 Trades data:', tradesData);
console.log('🚀 Cash flows data:', cashFlowsData);

// בדיקת מבנה נתונים
console.log('🚀 tradesData.data exists:', tradesData && tradesData.data);
console.log('🚀 tradesData.data length:', tradesData?.data?.length);

// בדיקת פריטים מקושרים
console.log('✅ Linked items found:', linkedItems.length);
console.log('✅ Linked items details:', linkedItems);

// בדיקת זמינות פונקציות
console.log('🔧 showLinkedItemsWarning available:', typeof window.showLinkedItemsWarning === 'function');
console.log('🔧 Bootstrap available:', typeof bootstrap !== 'undefined');
```

### בעיות נפוצות

#### 1. אזהרת מקושרים לא מוצגת
**סיבה**: הפונקציה `getLinkedItemsForAccount` לא מחזירה נתונים נכונים
**פתרון**: 
- בדוק את מבנה התגובה מה-API
- וודא שהפונקציה מטפלת במבנה `{ data: [...] }`
- הוסף לוגים לבדיקת הנתונים

#### 2. Modal לא נפתח
**סיבה**: Bootstrap לא זמין או שגיאה ב-HTML
**פתרון**:
- בדוק שקובץ Bootstrap נטען
- וודא שהאלמנטים נוצרים נכון
- בדוק שאין שגיאות JavaScript

#### 3. פונקציה לא זמינה
**סיבה**: הקובץ `ui-utils.js` לא נטען
**פתרון**: 
- וודא שהקובץ נטען לפני `accounts.js`
- בדוק שאין שגיאות טעינה
- וודא שהפונקציה מיוצאת ל-`window`

### בדיקת זמינות

```javascript
// בדיקת זמינות פונקציות
console.log('showLinkedItemsWarning:', typeof window.showLinkedItemsWarning);
console.log('createLinkedItemsWarningModal:', typeof createLinkedItemsWarningModal);
console.log('getLinkedItemsForAccount:', typeof getLinkedItemsForAccount);

// בדיקת זמינות Bootstrap
console.log('Bootstrap:', typeof bootstrap);
console.log('Bootstrap.Modal:', typeof bootstrap?.Modal);

// בדיקת נתונים
console.log('accountsData:', window.accountsData);
console.log('accountsData length:', window.accountsData?.length);
```

## 📝 דוגמאות שימוש

### מחיקת חשבון עם מקושרים

```javascript
// המשתמש לוחץ על כפתור "מחק"
deleteAccount(1);

// המערכת בודקת מקושרים
// אם יש מקושרים - מציגה אזהרה
// המשתמש לוחץ "המשך למחיקה"
// המערכת מציגה modal מחיקה
// המשתמש לוחץ "כן, מחק את החשבון"
// המערכת מוחקת את החשבון
```

### ביטול חשבון עם מקושרים

```javascript
// המשתמש לוחץ על כפתור "ביטול"
cancelAccount(1);

// המערכת בודקת מקושרים
// אם יש מקושרים - מציגה אזהרה
// המשתמש לוחץ "המשך למחיקה"
// המערכת מבטלת את החשבון (סטטוס: cancelled)
```

## 🔄 עדכונים אחרונים

### עדכון 2025-08-26
- הוספת מערכת פריטים מקושרים מלאה
- תיקון זרימת מחיקת חשבונות עם מקושרים
- הוספת לוגים מפורטים לדיבוג
- תיקון עיצוב כפתור ביטול (X אדום)
- הוספת fallback למקרה של שגיאות Bootstrap

### שינויים בפונקציות
- `deleteAccount()` - עכשיו קוראת ל-`checkLinkedItemsBeforeDeleteModal()`
- `checkLinkedItemsBeforeDeleteModal()` - פונקציה חדשה לבדיקת מקושרים
- `getLinkedItemsForAccount()` - תוקנה לטפל במבנה נתונים נכון
- `showLinkedItemsWarning()` - תוקנה להציג modal נכון
