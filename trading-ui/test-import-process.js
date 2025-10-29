# תוכנית בדיקות מקיפה - תהליך ייבוא נתוני משתמש

## 📋 סקירה כללית
תוכנית בדיקות שלב אחר שלב לתהליך הייבוא, כולל ייבוא ראשוני, ייבוא חוזר, ותיקוני טיקרים.

---

## 🧪 שלב 1: בדיקות אוטומטיות לפני התחלה

### 1.1 בדיקת מצב בסיס נתונים
```javascript
// העתק לקונסולה - בדיקת מצב התחלתי
console.log('🔍 === בדיקת מצב בסיס נתונים ===');
fetch('/api/executions/')
    .then(r => r.json())
    .then(data => {
        const executions = data.data || data || [];
        console.log(`📊 מספר רשומות קיימות: ${executions.length}`);
        
        // רשומות מיובאות (source = 'ibkr_import' או 'demo_import')
        const imported = executions.filter(e => e.source && (e.source.includes('import')));
        console.log(`📥 רשומות מיובאות: ${imported.length}`);
        
        // רשומות עם Realized P/L או MTM P/L
        const withPL = executions.filter(e => e.realized_pl !== null || e.mtm_pl !== null);
        console.log(`💰 רשומות עם P/L: ${withPL.length}`);
        
        // בדיקת שלמות הנתונים
        const withMissingTicker = executions.filter(e => !e.ticker_symbol && !e.ticker_id);
        const withMissingAccount = executions.filter(e => !e.account_name && !e.trading_account_id);
        console.log(`⚠️ רשומות ללא ticker: ${withMissingTicker.length}`);
        console.log(`⚠️ רשומות ללא account: ${withMissingAccount.length}`);
        
        return { total: executions.length, imported: imported.length, withPL: withPL.length };
    })
    .then(results => {
        console.log('✅ === סיום בדיקת מצב ===');
        console.log('📋 תוצאות:', results);
    });
```

### 1.2 בדיקת מצב שרת
```javascript
// העתק לקונסולה - בדיקת מצב שרת
console.log('🔍 === בדיקת מצב שרת ===');
fetch('/api/system/health')
    .then(r => r.json())
    .then(data => {
        console.log('✅ שרת פעיל:', data.status === 'ok' ? 'כן' : 'לא');
        console.log('📊 מצב:', data);
    })
    .catch(err => console.error('❌ שגיאה בבדיקת שרת:', err));
```

---

## 🧪 שלב 2: מחיקת רשומות מיובאות (הכנה לבדיקה)

### 2.1 מחיקת רשומות מיובאות
```javascript
// ⚠️ זהירות! מחיקה של רשומות מיובאות
// העתק לקונסולה רק אם אתה בטוח

console.log('⚠️ === מחיקת רשומות מיובאות ===');
console.log('⚠️ זה ימחק את כל הרשומות עם source כולל "import"');

// תחילה נבדוק כמה יש
fetch('/api/executions/')
    .then(r => r.json())
    .then(data => {
        const executions = data.data || data || [];
        const imported = executions.filter(e => e.source && (e.source.includes('import')));
        console.log(`📊 נמצאו ${imported.length} רשומות מיובאות למחיקה`);
        
        if (imported.length === 0) {
            console.log('✅ אין רשומות למחיקה');
            return;
        }
        
        // הצגת אישור
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק ${imported.length} רשומות מיובאות?`);
        if (!confirmed) {
            console.log('❌ בוטל על ידי המשתמש');
            return;
        }
        
        // מחיקה אחת אחת (בטיחות)
        console.log('🗑️ מתחיל במחיקה...');
        let deleted = 0;
        const deletePromises = imported.map(exec => 
            fetch(`/api/executions/${exec.id}`, { method: 'DELETE' })
                .then(r => {
                    if (r.ok) deleted++;
                    return r.ok;
                })
                .catch(err => {
                    console.error(`❌ שגיאה במחיקת רשומה ${exec.id}:`, err);
                    return false;
                })
        );
        
        Promise.all(deletePromises)
            .then(results => {
                console.log(`✅ נמחקו ${deleted} מתוך ${imported.length} רשומות`);
                console.log('🔄 רענון טבלה...');
                setTimeout(() => {
                    if (window.loadExecutionsData) {
                        window.loadExecutionsData();
                    }
                    console.log('✅ טבלה עודכנה');
                }, 1000);
            });
    })
    .catch(err => console.error('❌ שגיאה:', err));
```

---

## 🧪 שלב 3: ייבוא ראשוני (Initial Import)

### 3.1 הוראות לייבוא ראשוני
1. **פתח את עמוד Executions**: `/executions`
2. **לחץ על כפתור**: "📥 ייבוא נתוני משתמש"
3. **בחר קובץ**: בחר קובץ CSV של IBKR (או demo)
4. **בחר connector**: בחר "IBKR" (או "Demo" לבדיקה)
5. **בחר חשבון מסחר**: בחר חשבון מהרשימה
6. **לחץ "המשך לניתוח"**: וודא שהכפתור פעיל (לא disabled)

### 3.2 קוד בדיקה אחרי ייבוא ראשוני
```javascript
// העתק לקונסולה אחרי שהסתיים ייבוא ראשוני

console.log('🔍 === בדיקת ייבוא ראשוני ===');

// בדיקה 1: מספר רשומות חדשות
fetch('/api/executions/')
    .then(r => r.json())
    .then(data => {
        const executions = data.data || data || [];
        const imported = executions.filter(e => e.source && e.source.includes('import'));
        console.log(`✅ מספר רשומות מיובאות: ${imported.length}`);
        
        // בדיקה 2: שדות Realized P/L ו-MTM P/L
        const withRealizedPL = imported.filter(e => e.realized_pl !== null && e.realized_pl !== undefined);
        const withMTMPL = imported.filter(e => e.mtm_pl !== null && e.mtm_pl !== undefined);
        console.log(`💰 רשומות עם Realized P/L: ${withRealizedPL.length}`);
        console.log(`💰 רשומות עם MTM P/L: ${withMTMPL.length}`);
        
        // בדיקה 3: שלמות הנתונים
        const withTicker = imported.filter(e => e.ticker_symbol || e.ticker_id);
        const withAccount = imported.filter(e => e.account_name || e.trading_account_id);
        console.log(`✅ רשומות עם ticker: ${withTicker.length} / ${imported.length}`);
        console.log(`✅ רשומות עם account: ${withAccount.length} / ${imported.length}`);
        
        // בדיקה 4: דוגמאות
        if (imported.length > 0) {
            console.log('📋 דוגמה לרשומה מיובאת:');
            const example = imported[0];
            console.log({
                id: example.id,
                ticker: example.ticker_symbol || 'לא מוגדר',
                action: example.action,
                quantity: example.quantity,
                price: example.price,
                realized_pl: example.realized_pl,
                mtm_pl: example.mtm_pl,
                source: example.source,
                external_id: example.external_id
            });
        }
        
        return {
            totalImported: imported.length,
            withRealizedPL: withRealizedPL.length,
            withMTMPL: withMTMPL.length,
            withTicker: withTicker.length,
            withAccount: withAccount.length
        };
    })
    .then(results => {
        console.log('📊 === סיכום ייבוא ראשוני ===');
        console.log(results);
        
        if (results.totalImported > 0) {
            console.log('✅ ייבוא ראשוני הושלם בהצלחה!');
        } else {
            console.log('⚠️ לא נמצאו רשומות מיובאות - בדוק אם הייבוא הצליח');
        }
    });
```

---

## 🧪 שלב 4: ייבוא חוזר (Re-import - Same File)

### 4.1 הוראות לייבוא חוזר
1. **השתמש באותו קובץ** שייבאת בשלב 3
2. **לחץ על כפתור**: "📥 ייבוא נתוני משתמש"
3. **העלה את אותו קובץ**
4. **בחר אותו connector ואותו חשבון**
5. **לחץ "המשך לניתוח"**
6. **בשלב 2 (Analysis + Problems)**: 
   - המערכת אמורה לזהות שהיו רשומות קיימות
   - אמור להיות חלק "רשומות קיימות במערכת"
   - בדוק את ה-confidence scores ואת התאמות השדות

### 4.2 קוד בדיקה אחרי ייבוא חוזר
```javascript
// העתק לקונסולה אחרי שהסתיים ניתוח של ייבוא חוזר

console.log('🔍 === בדיקת ייבוא חוזר ===');

// בדיקה 1: כפילויות מזוהות
const analysisResults = window.analysisResults || null;
if (analysisResults) {
    console.log('📊 תוצאות ניתוח:');
    console.log({
        totalRecords: analysisResults.total_records,
        problems: analysisResults.problems || {},
        duplicates: analysisResults.duplicates || [],
        existing: analysisResults.existing_records || []
    });
    
    const existingCount = analysisResults.existing_records?.length || 0;
    const duplicatesCount = analysisResults.duplicates?.length || 0;
    
    console.log(`⚠️ רשומות קיימות מזוהות: ${existingCount}`);
    console.log(`⚠️ כפילויות בקובץ: ${duplicatesCount}`);
    
    if (existingCount === 0 && duplicatesCount === 0) {
        console.warn('⚠️ לא זוהו כפילויות - זה לא צפוי!');
    } else {
        console.log('✅ זיהוי כפילויות עובד!');
    }
} else {
    console.warn('⚠️ analysisResults לא נמצא - בדוק שהניתוח הסתיים');
}

// בדיקה 2: מספר רשומות במערכת (לא אמור לגדול)
fetch('/api/executions/')
    .then(r => r.json())
    .then(data => {
        const executions = data.data || data || [];
        const imported = executions.filter(e => e.source && e.source.includes('import'));
        console.log(`📊 מספר רשומות מיובאות במערכת: ${imported.length}`);
        console.log('💡 אם לחצת "דחה" על כל הכפילויות, המספר לא אמור לגדול');
    });
```

---

## 🧪 שלב 5: ייבוא עם תיקוני טיקרים (Re-import with Ticker Fixes)

### 5.1 הוראות לייבוא עם תיקוני טיקרים
1. **השתמש באותו קובץ** (או קובץ עם טיקרים חסרים)
2. **לחץ על כפתור**: "📥 ייבוא נתוני משתמש"
3. **העלה את הקובץ**
4. **בשלב 2 (Analysis + Problems)**: 
   - **טיקרים חסרים**: לחץ על "הוסף טיקר" בטיקרים החסרים
   - הוסף טיקרים חדשים בממשק
5. **וודא שהטיקרים התווספו**: בדוק שהטיקרים החדשים נראים בבעיות
6. **לחץ "המשך לתצוגה מקדימה"**
7. **וודא שבתוצאות**: רק הרשומות עם טיקרים מתוקנים מופיעות ב-"רשומות לייבוא"

### 5.2 קוד בדיקה אחרי תיקוני טיקרים
```javascript
// העתק לקונסולה אחרי שתיקנת טיקרים ולפני הלחיצה על "ביצוע ייבוא"

console.log('🔍 === בדיקת תיקוני טיקרים ===');

// בדיקה 1: מספר טיקרים שנוספו
fetch('/api/tickers/')
    .then(r => r.json())
    .then(data => {
        const tickers = data.data || data || [];
        console.log(`📊 מספר טיקרים במערכת: ${tickers.length}`);
        
        // בדיקה 2: Preview data
        const previewData = window.previewData || null;
        if (previewData) {
            const toImport = previewData.records_to_import || [];
            const toSkip = previewData.records_to_skip || [];
            
            console.log(`✅ רשומות לייבוא: ${toImport.length}`);
            console.log(`⏭️ רשומות לדילוג: ${toSkip.length}`);
            
            // בדיקה שכל הרשומות לייבוא יש להן ticker
            const withTicker = toImport.filter(r => r.symbol || r.ticker || r.ticker_id);
            console.log(`✅ רשומות לייבוא עם ticker: ${withTicker.length} / ${toImport.length}`);
            
            if (toImport.length > 0 && withTicker.length === toImport.length) {
                console.log('✅ כל הרשומות לייבוא כוללות ticker - מעולה!');
            } else if (toImport.length > 0) {
                console.warn('⚠️ יש רשומות ללא ticker - בדוק את התיקונים');
            }
        } else {
            console.warn('⚠️ previewData לא נמצא - בדוק שהגעת לשלב Preview');
        }
    });
```

---

## 🧪 שלב 6: בדיקת ייבוא סופי וניקוי

### 6.1 ביצוע ייבוא ובדיקת תוצאות
```javascript
// העתק לקונסולה אחרי שהסתיים ייבוא (לחצת "ביצוע ייבוא")

console.log('🔍 === בדיקת ייבוא סופי ===');

setTimeout(() => {
    fetch('/api/executions/')
        .then(r => r.json())
        .then(data => {
            const executions = data.data || data || [];
            const imported = executions.filter(e => e.source && e.source.includes('import'));
            
            console.log(`✅ === תוצאות ייבוא ===`);
            console.log(`📊 סה"כ רשומות מיובאות: ${imported.length}`);
            
            // בדיקת Realized P/L ו-MTM P/L
            const buyWithRealizedPL = imported.filter(e => 
                e.action === 'buy' && e.realized_pl !== null && e.realized_pl !== 0
            );
            const sellWithoutRealizedPL = imported.filter(e => 
                e.action === 'sell' && (e.realized_pl === null || e.realized_pl === undefined)
            );
            
            console.log(`⚠️ קניות עם Realized P/L (לא אמור להיות): ${buyWithRealizedPL.length}`);
            console.log(`⚠️ מכירות ללא Realized P/L (בעיה!): ${sellWithoutRealizedPL.length}`);
            
            if (buyWithRealizedPL.length > 0) {
                console.warn('⚠️ נמצאו קניות עם Realized P/L - זה לא תקין!');
            }
            if (sellWithoutRealizedPL.length > 0) {
                console.error('❌ נמצאו מכירות ללא Realized P/L - זה לא תקין!');
            }
            
            // בדיקת ticker ו-account
            const withoutTicker = imported.filter(e => !e.ticker_symbol && !e.ticker_id);
            const withoutAccount = imported.filter(e => !e.account_name && !e.trading_account_id);
            
            console.log(`⚠️ רשומות ללא ticker: ${withoutTicker.length}`);
            console.log(`⚠️ רשומות ללא account: ${withoutAccount.length}`);
            
            // סיכום
            const allGood = buyWithRealizedPL.length === 0 && 
                           sellWithoutRealizedPL.length === 0 &&
                           withoutTicker.length === 0 &&
                           withoutAccount.length === 0;
            
            if (allGood) {
                console.log('✅ כל הבדיקות עברו! ייבוא הצליח');
            } else {
                console.warn('⚠️ יש בעיות - בדוק את התוצאות למעלה');
            }
        });
}, 2000); // המתן 2 שניות לרענון הנתונים
```

---

## 📋 סיכום הבדיקות

### ✅ בדיקות אוטומטיות
1. ✅ מצב בסיס נתונים
2. ✅ מצב שרת
3. ✅ מחיקת רשומות מיובאות (אופציונאלי)

### ✅ בדיקות תהליך
1. ✅ ייבוא ראשוני - יצירת רשומות חדשות
2. ✅ ייבוא חוזר - זיהוי duplicates
3. ✅ ייבוא עם תיקוני tickers - רק המתוקנות
4. ✅ בדיקת שדות Realized P/L ו-MTM P/L
5. ✅ בדיקת שלמות הנתונים (ticker, account)

### 📝 רשימת בדיקות ידניות
- [ ] שלב 1 (Upload): כפתור "המשך לניתוח" פעיל
- [ ] שלב 2 (Analysis): תוצאות ניתוח מוצגות
- [ ] שלב 2 (Problems): בעיות מוצגות (טיקרים חסרים, כפילויות)
- [ ] שלב 2 (Problems): כפתור "הוסף טיקר" עובד
- [ ] שלב 2 (Problems): כפתורי "קבל"/"דחה" עובדים
- [ ] שלב 3 (Preview): תצוגה מקדימה נכונה (2 טבלאות)
- [ ] שלב 3 (Preview): שדות Realized P/L ו-MTM P/L מוצגים
- [ ] שלב 3 (Confirm): כפתור "ביצוע ייבוא" עובד
- [ ] אחרי ייבוא: טבלה מתעדכנת אוטומטית
- [ ] אחרי ייבוא: שדות Realized P/L ו-MTM P/L נכונים

---

## 🐛 דיבוג בעיות

### בעיה: כפתור "המשך לניתוח" disabled
```javascript
// בדיקת מצב הכפתור
const modal = document.getElementById('importUserDataModal');
const btn = modal?.querySelector('[data-button-type="PRIMARY"]');
console.log('כפתור:', {
    exists: !!btn,
    disabled: btn?.disabled,
    hasFile: !!window.selectedFile,
    accountValue: modal?.querySelector('#tradingAccountSelect')?.value,
    connectorValue: modal?.querySelector('#connectorSelect')?.value
});
```

### בעיה: שלב 3 לא מציג תוכן
```javascript
// בדיקת גובה התוכן
const step3 = document.getElementById('step-preview');
const content = step3?.querySelector('.step-content');
console.log('שלב 3:', {
    exists: !!step3,
    display: step3?.style.display,
    contentHeight: content?.offsetHeight,
    contentScrollHeight: content?.scrollHeight,
    innerHTML: content?.innerHTML?.length
});
```

---

## 📞 הערות חשובות

1. **שמור את מספר הרשומות לפני כל ייבוא** - זה יעזור לבדוק שלא נוספו duplicates
2. **בדוק את הלוגים בשרת** - `tail -f Backend/logs/app.log | grep import`
3. **בדוק את לוגי הדפדפן** - פתח את ה-Console וראה את הלוגים מ-`window.Logger`
4. **אם יש בעיות** - שמור את הלוגים ונתוני ה-preview לניתוח מעמיק

