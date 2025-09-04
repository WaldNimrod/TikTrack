# מדריך אינטגרציה - Entity Details System

## הוספת כפתורי פרטים לטבלאות

### 🎯 **מטרה**
הוספת כפתור "פרטים" לכל טבלה במערכת TikTrack כדי לפתוח את מערכת entity-details-system

### ✅ **מה שכבר הושלם**

#### **טבלת טיקרים** ✅ הושלם
- **קובץ**: `trading-ui/scripts/tickers.js`
- **מיקום**: שורה 1614-1618
- **קוד שנוסף**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('ticker', ${ticker.id})" 
        title="פרטי טיקר">
    <i class="fas fa-info-circle"></i>
</button>
```

### 🔄 **טבלאות שצריך להוסיף להן כפתורים**

#### **טבלת טריידים (trades.js)**
- **מיקום משוער**: בעמודת הפעולות
- **קוד להוספה**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('trade', ${trade.id})" 
        title="פרטי טרייד">
    <i class="fas fa-info-circle"></i>
</button>
```

#### **טבלת תכניות השקעה (trade_plans.js או trade-plans.js)**
- **מיקום משוער**: בעמודת הפעולות
- **קוד להוספה**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('trade_plan', ${plan.id})" 
        title="פרטי תכנית השקעה">
    <i class="fas fa-info-circle"></i>
</button>
```

#### **טבלת ביצועים (executions.js)**
- **מיקום משוער**: בעמודת הפעולות
- **קוד להוספה**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('execution', ${execution.id})" 
        title="פרטי ביצוע">
    <i class="fas fa-info-circle"></i>
</button>
```

#### **טבלת חשבונות (accounts.js)**
- **מיקום משוער**: בעמודת הפעולות
- **קוד להוספה**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('account', ${account.id})" 
        title="פרטי חשבון">
    <i class="fas fa-info-circle"></i>
</button>
```

#### **טבלת התראות (alerts.js)**
- **מיקום משוער**: בעמודת הפעולות
- **קוד להוספה**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('alert', ${alert.id})" 
        title="פרטי התראה">
    <i class="fas fa-info-circle"></i>
</button>
```

#### **טבלת תזרימי מזומנים (cash_flows.js)**
- **מיקום משוער**: בעמודת הפעולות
- **קוד להוספה**:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('cash_flow', ${cashFlow.id})" 
        title="פרטי תזרים מזומנים">
    <i class="fas fa-info-circle"></i>
</button>
```

### 🔍 **איך למצוא את המיקום הנכון**

#### **שלב 1: מציאת פונקציית עדכון הטבלה**
חפש בקובץ JavaScript של הדף:
- `updateTickersTable` - עבור טיקרים ✅ נמצא
- `updateTradesTable` - עבור טריידים
- `updateTradePlansTable` - עבור תכניות השקעה
- `updateExecutionsTable` - עבור ביצועים
- `updateAccountsTable` - עבור חשבונות
- `updateAlertsTable` - עבור התראות
- `updateCashFlowsTable` - עבור תזרימי מזומנים

#### **שלב 2: מציאת המקום בפונקציה**
חפש בתוך הפונקציה את מבנה כמו:
```javascript
<td class="actions-cell">
    <div class="btn-group btn-group-sm" role="group">
        // כפתורים קיימים
    </div>
</td>
```

#### **שלב 3: הוספת הכפתור**
הוסף את הכפתור החדש **בתחילת** ה-btn-group:
```javascript
<button class="btn btn-outline-primary" 
        onclick="showEntityDetails('ENTITY_TYPE', ${ENTITY.id})" 
        title="פרטי ENTITY_NAME">
    <i class="fas fa-info-circle"></i>
</button>
```

### 📋 **הנחיות עיצוב**

#### **סגנון הכפתור**
- **מחלקות CSS**: `btn btn-outline-primary btn-sm` (אם יש btn-group-sm)
- **צבע**: כחול primary (להבדיל מכפתורי הפעולות האחרות)
- **אייקון**: `fas fa-info-circle` (עקבי לכל הטבלאות)
- **מיקום**: ראשון בקבוצת הכפתורים

#### **שמות הפונקציות**
- `showEntityDetails(entityType, entityId)`
- **entityType** תמיד באנגלית: 'ticker', 'trade', 'trade_plan', וכו'
- **entityId** מספר המזהה של הרשומה

### 🧪 **בדיקה**

#### **לבדיקת הכפתור החדש:**
1. פתח את הדף ברשימת
2. לחץ על כפתור הפרטים בשורה כלשהי
3. וודא שנפתח החלון הקופץ עם פרטי הישות
4. בדוק שהנתונים מוצגים נכון
5. בדוק שהפעולות המהירות עובדות

#### **בדיקות נוספות:**
- וודא שהכפתור לא משבש את עמודת הפעולות
- בדוק responsive design במובייל  
- וודא שהצבעים עקביים עם שאר המערכת
- בדוק שהטקסט ב-RTL מיושר נכון

### 🚨 **בעיות נפוצות ופתרונות**

#### **"showEntityDetails is not defined"**
- **סיבה**: הקבצים לא נטענו בסדר הנכון
- **פתרון**: וודא שentity-details-modal.js נטען לפני הקובץ הספציפי

#### **"EntityDetailsModal not initialized"**
- **סיבה**: המחלקה לא אותחלה
- **פתרון**: בדוק שאין שגיאות JavaScript בקונסול

#### **המודל לא נפתח**
- **סיבה**: Bootstrap לא נטען או שגיאה בHTML
- **פתרון**: בדוק קונסול דפדפן לשגיאות

#### **הנתונים לא נטענים**
- **סיבה**: הAPI endpoint לא עובד או אין נתונים
- **פתרון**: בדוק ב-Network tab שהקריאה מצליחה

---

**יוצר**: Nimrod  
**תאריך יצירה**: 4 בספטמבר 2025  
**עדכון אחרון**: 4 בספטמבר 2025  
**סטטוס**: מדריך מלא להמשך היישום