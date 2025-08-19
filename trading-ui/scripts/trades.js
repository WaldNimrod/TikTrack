// ===== TRADES MANAGEMENT SYSTEM =====
// קובץ ייעודי לניהול טריידים - פונקציות עריכה, ביטול ומחיקה
// 
// עדכון: אוגוסט 2025
// שינויים עיקריים:
// - פיצול פונקציות טריידים מקובץ database.html
// - עדכון מבנה בסיס נתונים (הסרת opened_at, החלפת ב-created_at)
// - הגבלת סוגי טריידים לשלושה: swing, invest, pasive
// - תיקון ערכי סטטוס (canceled -> cancelled)
// - שיפור מבנה טופסי עריכה והוספה
//
// תלות: נדרש apiCall function מ-grid-table.js
// תלות: נדרש showNotification function מ-grid-table.js

/**
 * פונקציה לעריכת טרייד
 * פותחת מודל עריכה עם נתוני הטרייד הנבחר
 * 
 * @param {string} tradeId - מזהה הטרייד לעריכה
 */
async function editTradeRecord(tradeId) {
    try {
        console.log(`🔧 עריכת טרייד: ${tradeId}`);
        
        // קבלת נתוני הטרייד מה-API
        const response = await window.apiCall(`/api/v1/trades/${tradeId}`);
        
        console.log('📡 תגובה מהשרת:', response);
        
        if (response.status === 'success' && response.data) {
            const tradeData = response.data;
            console.log('📊 נתוני טרייד לעריכה:', tradeData);
            console.log('📊 מפתחות בנתונים:', Object.keys(tradeData));
            
            // הצגת מודל עריכת טרייד
            showEditTradeModal(tradeData);
        } else {
            console.error('❌ שגיאה בקבלת נתוני טרייד:', response);
            alert('שגיאה בקבלת נתוני טרייד');
        }
    } catch (error) {
        console.error('❌ שגיאה בעריכת טרייד:', error);
        alert('שגיאה בעריכת טרייד');
    }
}

/**
 * פונקציה לביטול טרייד
 * משנה את סטטוס הטרייד ל"מבוטל"
 * 
 * @param {string} tradeId - מזהה הטרייד לביטול
 */
async function cancelTradeRecord(tradeId) {
    try {
        console.log(`❌ ביטול טרייד: ${tradeId}`);
        
        // אישור ביטול
        if (!confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
            return;
        }
        
        // קריאה ל-API לביטול הטרייד
        const response = await window.apiCall(`/api/v1/trades/${tradeId}/cancel`, 'PUT');
        
        if (response.status === 'success') {
            console.log('✅ טרייד בוטל בהצלחה');
            
            // רענון הטבלה
            if (typeof loadTrades === 'function') {
                loadTrades();
            } else if (typeof loadTradesData === 'function') {
                loadTradesData();
            }
            
            // הצגת הודעת הצלחה
            if (typeof showNotification === 'function') {
                showNotification('טרייד בוטל בהצלחה', 'success');
            } else {
                alert('טרייד בוטל בהצלחה');
            }
        } else {
            console.error('❌ שגיאה בביטול טרייד:', response);
            alert('שגיאה בביטול טרייד');
        }
    } catch (error) {
        console.error('❌ שגיאה בביטול טרייד:', error);
        alert('שגיאה בביטול טרייד');
    }
}

/**
 * פונקציה למחיקת טרייד
 * מוחקת את הטרייד לחלוטין מהמערכת
 * 
 * @param {string} tradeId - מזהה הטרייד למחיקה
 */
async function deleteTradeRecord(tradeId) {
    try {
        console.log(`🗑️ מחיקת טרייד: ${tradeId}`);
        
        // אישור מחיקה
        if (!confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
            return;
        }
        
        // קריאה ל-API למחיקת הטרייד
        const response = await window.apiCall(`/api/v1/trades/${tradeId}`, 'DELETE');
        
        if (response.status === 'success') {
            console.log('✅ טרייד נמחק בהצלחה');
            
            // רענון הטבלה
            if (typeof loadTrades === 'function') {
                loadTrades();
            } else if (typeof loadTradesData === 'function') {
                loadTradesData();
            }
            
            // הצגת הודעת הצלחה
            if (typeof showNotification === 'function') {
                showNotification('טרייד נמחק בהצלחה', 'success');
            } else {
                alert('טרייד נמחק בהצלחה');
            }
        } else {
            console.error('❌ שגיאה במחיקת טרייד:', response);
            alert('שגיאה במחיקת טרייד');
        }
    } catch (error) {
        console.error('❌ שגיאה במחיקת טרייד:', error);
        alert('שגיאה במחיקת טרייד');
    }
}

/**
 * פונקציה להצגת מודל עריכת טרייד
 * ממלאת את המודל בנתונים ומציגה אותו
 * 
 * @param {Object} tradeData - נתוני הטרייד לעריכה
 */
async function showEditTradeModal(tradeData) {
    console.log('🔧 הצגת מודל עריכת טרייד:', tradeData);
    
    // בדיקה שהמודל קיים
    const modal = document.getElementById('editTradeModal');
    if (!modal) {
        console.error('❌ מודל עריכת טרייד לא נמצא');
        alert('מודל עריכת טרייד לא נמצא');
        return;
    }
    console.log('✅ מודל עריכת טרייד נמצא');
    
    // מילוי הנתונים במודל
    console.log('🔧 מתחיל מילוי נתונים...');
    await fillEditTradeModalData(tradeData);
    console.log('🔧 מילוי נתונים הושלם');
    
    // הצגת המודל
    console.log('🔧 מציג מודל...');
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        console.log('🔧 משתמש ב-Bootstrap Modal');
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        console.log('✅ Bootstrap Modal נפתח');
    } else {
        console.log('🔧 משתמש בגיבוי Modal');
        // גיבוי אם Bootstrap לא זמין
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        console.log('✅ גיבוי Modal נפתח');
    }
    
    console.log('🔧 הצגת מודל עריכת טרייד הושלמה');
}

/**
 * פונקציה למילוי נתונים במודל עריכת טרייד
 * 
 * @param {Object} tradeData - נתוני הטרייד
 */
async function fillEditTradeModalData(tradeData) {
    console.log('🔧 מילוי נתונים במודל עריכת טרייד:', tradeData);
    console.log('🔧 סוג הנתונים:', typeof tradeData);
    console.log('🔧 מפתחות בנתונים:', Object.keys(tradeData));
    
    // בדיקה שהמודל קיים
    const modal = document.getElementById('editTradeModal');
    if (!modal) {
        console.error('❌ מודל עריכת טרייד לא נמצא!');
        return;
    }
    console.log('✅ מודל עריכת טרייד נמצא');
    
    // מילוי שדות המודל
    const fields = {
        'editTradeId': tradeData.id || '',
        'editTradeAccountId': tradeData.account_id || '',
        'editTradeTickerId': tradeData.ticker_id || '',
        'editTradeTradePlanId': tradeData.trade_plan_id || '',
        'editTradeStatus': tradeData.status || 'open',
        'editTradeType': tradeData.type || 'swing',
        'editTradeSide': tradeData.side || 'Long',
        'editTradeOpenedAt': tradeData.created_at ? new Date(tradeData.created_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        'editTradeClosedAt': tradeData.closed_at ? new Date(tradeData.closed_at).toISOString().slice(0, 16) : '',
        'editTradeTotalPl': tradeData.total_pl || 0,
        'editTradeNotes': tradeData.notes || ''
    };
    
    // המרת ערכי סטטוס לעברית
    if (tradeData.status) {
        const statusMapping = {
            'open': 'open',
            'closed': 'closed', 
            'cancelled': 'cancelled',
            'פתוח': 'open',
            'סגור': 'closed',
            'מבוטל': 'cancelled'
        };
        fields['editTradeStatus'] = statusMapping[tradeData.status] || 'open';
        console.log(`🔧 המרת סטטוס: "${tradeData.status}" → "${fields['editTradeStatus']}"`);
    }
    
    // המרת ערכי סוג לעברית
    if (tradeData.type) {
        const typeMapping = {
            'swing': 'swing',
            'investment': 'investment',
            'passive': 'passive',
            'invest': 'investment',  // תאימות לאחור
            'pasive': 'passive',     // תאימות לאחור
            'סווינג': 'swing',
            'השקעה': 'investment',
            'פאסיבי': 'passive'
        };
        fields['editTradeType'] = typeMapping[tradeData.type] || 'swing';
        console.log(`🔧 המרת סוג: "${tradeData.type}" → "${fields['editTradeType']}"`);
    }
    
    // בדיקה שהערכים תואמים לאפשרויות במודל
    console.log('🔍 בדיקת התאמת ערכים למודל:');
    console.log('🔍 סטטוס:', fields['editTradeStatus']);
    console.log('🔍 סוג:', fields['editTradeType']);
    
    console.log('🔧 שדות למילוי:', fields);
    
    // טעינת נתוני חשבונות ותוכניות
    await loadAccountsForModal();
    await loadTickersForModal();
    await loadTradePlansForModal();
    
    // מילוי מזהה כטקסט
    const idDisplay = document.getElementById('editTradeIdDisplay');
    if (idDisplay) {
        idDisplay.textContent = fields['editTradeId'];
        console.log(`✅ מילא מזהה: ${fields['editTradeId']}`);
    }
    
    // מילוי טיקר כטקסט (לייבל)
    const tickerDisplay = document.getElementById('editTradeTickerDisplay');
    if (tickerDisplay) {
        // נסה לקבל את שם הטיקר מהנתונים
        const tickerSymbol = tradeData.ticker_symbol || tradeData.ticker_name || 'לא ידוע';
        tickerDisplay.textContent = tickerSymbol;
        console.log(`✅ מילא טיקר: ${tickerSymbol}`);
    } else {
        console.warn('⚠️ שדה editTradeTickerDisplay לא נמצא');
    }
    
    // מילוי מחיר נוכחי ושינוי יומי (נתוני דמה)
    const currentPrice = document.getElementById('editTradeCurrentPrice');
    if (currentPrice) {
        const price = (Math.random() * 200 + 50).toFixed(2);
        currentPrice.textContent = `$${price}`;
        console.log(`✅ מילא מחיר נוכחי: $${price}`);
    } else {
        console.warn('⚠️ שדה editTradeCurrentPrice לא נמצא');
    }
    
    const dailyChange = document.getElementById('editTradeDailyChange');
    if (dailyChange) {
        const change = (Math.random() * 10 - 5).toFixed(1);
        const isPositive = change >= 0;
        dailyChange.textContent = `${isPositive ? '+' : ''}${change}%`;
        dailyChange.className = `form-control-plaintext ${isPositive ? 'text-success' : 'text-danger'}`;
        console.log(`✅ מילא שינוי יומי: ${isPositive ? '+' : ''}${change}%`);
    } else {
        console.warn('⚠️ שדה editTradeDailyChange לא נמצא');
    }
    
    // מילוי כל השדות
    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            const value = fields[fieldId];
            element.value = value;
            console.log(`✅ מילא שדה ${fieldId}: "${value}" (סוג: ${typeof value})`);
            
            // בדיקה מיוחדת לשדות select
            if (element.tagName === 'SELECT') {
                console.log(`🔍 שדה ${fieldId} הוא SELECT עם ${element.options.length} אפשרויות:`);
                for (let i = 0; i < element.options.length; i++) {
                    const option = element.options[i];
                    console.log(`  - ${option.value}: ${option.text} ${option.value === value ? '← נבחר' : ''}`);
                }
            }
        } else {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא במודל`);
        }
    });
    
    console.log('🔧 מילוי המודל הושלם');
}

/**
 * פונקציה לשמירת טרייד מעודכן
 * שולחת את הנתונים המעודכנים לשרת
 */
async function saveTradeRecord() {
    try {
        console.log('💾 שמירת טרייד מעודכן...');
        
        // איסוף נתונים מהמודל
        const tradeId = document.getElementById('editTradeId').value;
        const accountId = document.getElementById('editTradeAccountId').value;
        const tickerId = document.getElementById('editTradeTickerId').value;
        const status = document.getElementById('editTradeStatus').value;
        const type = document.getElementById('editTradeType').value;
        
        // וולידציה בסיסית
        if (!tradeId) {
            alert('שגיאה: מזהה טרייד חסר');
            return;
        }
        
        if (!accountId) {
            alert('שגיאה: יש לבחור חשבון');
            return;
        }
        
        if (!tickerId) {
            alert('שגיאה: יש לבחור טיקר');
            return;
        }
        
        if (!status) {
            alert('שגיאה: יש לבחור סטטוס');
            return;
        }
        
        if (!type) {
            alert('שגיאה: יש לבחור סוג טרייד');
            return;
        }
        
        // וולידציה של סוג הטרייד
        const validTypes = ['swing', 'investment', 'passive'];
        if (!validTypes.includes(type)) {
            alert('שגיאה: סוג טרייד לא תקין. יש לבחור: סווינג, השקעה, או פאסיבי');
            return;
        }
        
        const tradeData = {
            account_id: accountId,
            ticker_id: tickerId,
            trade_plan_id: document.getElementById('editTradeTradePlanId').value || null,
            status: status,
            type: type,
            side: document.getElementById('editTradeSide').value || 'Long',
            created_at: document.getElementById('editTradeOpenedAt').value || null,
            closed_at: document.getElementById('editTradeClosedAt').value || null,
            total_pl: parseFloat(document.getElementById('editTradeTotalPl').value) || 0,
            notes: document.getElementById('editTradeNotes').value || ''
        };
        
        console.log('📊 נתונים לשמירה:', { id: tradeId, ...tradeData });
        
        // שליחה לשרת
        const response = await window.apiCall(`/api/v1/trades/${tradeId}`, 'PUT', tradeData);
        
        if (response.status === 'success') {
            console.log('✅ טרייד נשמר בהצלחה');
            
            // סגירת המודל
            const modal = document.getElementById('editTradeModal');
            if (modal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
            // רענון הטבלה
            if (typeof loadTrades === 'function') {
                loadTrades();
            } else if (typeof loadTradesData === 'function') {
                loadTradesData();
            }
            
            // הצגת הודעת הצלחה
            if (typeof showNotification === 'function') {
                showNotification('טרייד נשמר בהצלחה', 'success');
            } else {
                alert('טרייד נשמר בהצלחה');
            }
        } else {
            console.error('❌ שגיאה בשמירת טרייד:', response);
            alert('שגיאה בשמירת טרייד');
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת טרייד:', error);
        alert('שגיאה בשמירת טרייד');
    }
}

/**
 * פונקציה להוספת טרייד חדש
 * פותחת מודל הוספה ריק
 */
async function showAddTradeModal() {
    console.log('➕ === SHOW ADD TRADE MODAL CALLED ===');
    console.log('➕ הצגת מודל הוספת טרייד חדש');
    
    // בדיקה שהמודל קיים
    const modal = document.getElementById('addTradeModal');
    if (!modal) {
        console.error('❌ מודל הוספת טרייד לא נמצא');
        alert('מודל הוספת טרייד לא נמצא');
        return;
    }
    
    // ניקוי המודל
    clearAddTradeModal();
    
    // טעינת נתוני חשבונות ותוכניות
    console.log('🔧 טוען נתונים למודל הוספה...');
    await loadAccountsForAddModal();
    await loadTickersForAddModal();
    await loadTradePlansForAddModal();
    console.log('✅ נתונים נטענו למודל הוספה');
    
    // הצגת המודל
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        console.log('✅ Bootstrap Modal נפתח');
    } else {
        // גיבוי אם Bootstrap לא זמין
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        console.log('✅ גיבוי Modal נפתח');
    }
}

/**
 * פונקציה לניקוי מודל הוספת טרייד
 */
function clearAddTradeModal() {
    const fields = [
        'addTradeAccountId',
        'addTradeTickerId',
        'addTradeTradePlanId',
        'addTradeStatus',
        'addTradeType',
        'addTradeOpenedAt',
        'addTradeClosedAt',
        'addTradeNotes'
    ];
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            if (fieldId === 'addTradeOpenedAt') {
                // הגדרת תאריך היום כברירת מחדל
                const today = new Date();
                const todayString = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
                element.value = todayString;
                console.log(`✅ הגדרת תאריך פתיחה כברירת מחדל: ${todayString}`);
            } else if (fieldId === 'addTradeStatus') {
                // הגדרת "פתוח" כברירת מחדל
                element.value = 'open';
                console.log('✅ הגדרת סטטוס "פתוח" כברירת מחדל');
            } else if (fieldId === 'addTradeType') {
                // הגדרת "סווינג" כברירת מחדל
                element.value = 'swing';
                console.log('✅ הגדרת סוג "סווינג" כברירת מחדל');
            } else {
                element.value = '';
            }
        }
    });
    
    // ניקוי שדות הטיקר
    const tickerDisplay = document.getElementById('addTradeTickerDisplay');
    if (tickerDisplay) {
        tickerDisplay.textContent = 'לא נבחר';
    }
    
    const tickerIdInput = document.getElementById('addTradeTickerId');
    if (tickerIdInput) {
        tickerIdInput.value = '';
    }
    
    const currentPrice = document.getElementById('addTradeCurrentPrice');
    if (currentPrice) {
        currentPrice.textContent = '-';
    }
    
    const dailyChange = document.getElementById('addTradeDailyChange');
    if (dailyChange) {
        dailyChange.textContent = '-';
        dailyChange.className = 'form-control-plaintext';
    }
}

/**
 * פונקציה לשמירת טרייד חדש
 */
async function saveNewTradeRecord() {
    try {
        console.log('💾 שמירת טרייד חדש...');
        
        // איסוף נתונים מהמודל
        const accountId = document.getElementById('addTradeAccountId').value;
        const tickerId = document.getElementById('addTradeTickerId').value;
        const status = document.getElementById('addTradeStatus').value;
        const type = document.getElementById('addTradeType').value;
        const side = document.getElementById('addTradeSide').value;
        
        // וולידציה בסיסית
        if (!accountId) {
            alert('שגיאה: יש לבחור חשבון');
            return;
        }
        
        if (!tickerId) {
            alert('שגיאה: יש לבחור טיקר');
            return;
        }
        
        if (!status) {
            alert('שגיאה: יש לבחור סטטוס');
            return;
        }
        
        if (!type) {
            alert('שגיאה: יש לבחור סוג טרייד');
            return;
        }
        
        // וולידציה של סוג הטרייד
        const validTypes = ['swing', 'investment', 'passive'];
        if (!validTypes.includes(type)) {
            alert('שגיאה: סוג טרייד לא תקין. יש לבחור: סווינג, השקעה, או פאסיבי');
            return;
        }
        
        const tradeData = {
            account_id: accountId,
            ticker_id: tickerId,
            trade_plan_id: document.getElementById('addTradeTradePlanId').value || null,
            status: status,
            type: type,
            side: side,
            created_at: document.getElementById('addTradeOpenedAt').value || null,
            closed_at: document.getElementById('addTradeClosedAt').value || null,
            total_pl: 0, // רווח/הפסד מתחיל ב-0 בטרייד חדש - לא נדרש מהמשתמש
            notes: document.getElementById('addTradeNotes').value || ''
        };
        
        console.log('📊 נתונים חדשים:', tradeData);
        
        // שליחה לשרת
        const response = await window.apiCall('/api/v1/trades/', 'POST', tradeData);
        
        if (response.status === 'success') {
            console.log('✅ טרייד חדש נשמר בהצלחה');
            
            // סגירת המודל
            const modal = document.getElementById('addTradeModal');
            if (modal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
            // רענון הטבלה
            if (typeof loadTrades === 'function') {
                loadTrades();
            } else if (typeof loadTradesData === 'function') {
                loadTradesData();
            }
            
            // הצגת הודעת הצלחה
            if (typeof showNotification === 'function') {
                showNotification('טרייד חדש נשמר בהצלחה', 'success');
            } else {
                alert('טרייד חדש נשמר בהצלחה');
            }
        } else {
            console.error('❌ שגיאה בשמירת טרייד חדש:', response);
            alert('שגיאה בשמירת טרייד חדש');
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת טרייד חדש:', error);
        alert('שגיאה בשמירת טרייד חדש');
    }
}

// הגדרת פונקציות גלובליות
window.editTradeRecord = editTradeRecord;
window.cancelTradeRecord = cancelTradeRecord;
window.deleteTradeRecord = deleteTradeRecord;
window.showEditTradeModal = showEditTradeModal;
window.fillEditTradeModalData = fillEditTradeModalData;
window.saveTradeRecord = saveTradeRecord;
window.showAddTradeModal = showAddTradeModal;
window.clearAddTradeModal = clearAddTradeModal;
window.saveNewTradeRecord = saveNewTradeRecord;
window.updateTickerFromTradePlan = updateTickerFromTradePlan;
window.loadAccountsForModal = loadAccountsForModal;
window.loadTickersForModal = loadTickersForModal;
window.loadTradePlansForModal = loadTradePlansForModal;
window.loadAccountsForAddModal = loadAccountsForAddModal;
window.loadTickersForAddModal = loadTickersForAddModal;
window.loadTradePlansForAddModal = loadTradePlansForAddModal;

/**
 * פונקציה לטעינת חשבונות למודל
 */
async function loadAccountsForModal() {
    try {
        console.log('🔧 טוען חשבונות למודל...');
        
        // קריאה ל-API לקבלת חשבונות
        const response = await window.apiCall('/api/v1/accounts/');
        
        if (response.status === 'success' && response.data) {
            const accounts = response.data;
            console.log('📊 חשבונות שהתקבלו:', accounts);
            
            // מילוי שדה החשבון במודל
            const accountSelect = document.getElementById('editTradeAccountId');
            if (accountSelect) {
                // ניקוי האפשרויות הקיימות (למעט הראשונה)
                while (accountSelect.options.length > 1) {
                    accountSelect.remove(1);
                }
                
                // הוספת החשבונות
                accounts.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name || `חשבון ${account.id}`;
                    accountSelect.appendChild(option);
                });
                
                console.log(`✅ מילא ${accounts.length} חשבונות במודל`);
            }
        } else {
            console.warn('⚠️ לא הצלחתי לטעון חשבונות, משתמש בערכים ברירת מחדל');
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת חשבונות:', error);
    }
}

/**
 * פונקציה לטעינת טיקרים למודל
 */
async function loadTickersForModal() {
    try {
        console.log('🔧 טוען טיקרים למודל...');
        
        // קריאה ל-API לקבלת טיקרים
        const response = await window.apiCall('/api/v1/tickers/');
        
        if (response.status === 'success' && response.data) {
            const tickers = response.data;
            console.log('📊 טיקרים שהתקבלו:', tickers);
            
            // מילוי שדה הטיקר במודל
            const tickerSelect = document.getElementById('editTradeTickerId');
            if (tickerSelect) {
                // ניקוי האפשרויות הקיימות (למעט הראשונה)
                while (tickerSelect.options.length > 1) {
                    tickerSelect.remove(1);
                }
                
                // הוספת הטיקרים
                tickers.forEach(ticker => {
                    const option = document.createElement('option');
                    option.value = ticker.id;
                    option.textContent = ticker.symbol || `טיקר ${ticker.id}`;
                    tickerSelect.appendChild(option);
                });
                
                console.log(`✅ מילא ${tickers.length} טיקרים במודל`);
            }
        } else {
            console.warn('⚠️ לא הצלחתי לטעון טיקרים, משתמש בערכים ברירת מחדל');
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
    }
}

/**
 * פונקציה לטעינת תוכניות טרייד למודל
 */
async function loadTradePlansForModal() {
    try {
        console.log('🔧 טוען תוכניות טרייד למודל...');
        
        // קריאה ל-API לקבלת תוכניות טרייד
        const response = await window.apiCall('/api/v1/trade_plans/');
        
        console.log('📡 תגובת API לתוכניות:', response);
        
        if (response.status === 'success' && response.data) {
            const tradePlans = response.data;
            console.log('📊 תוכניות טרייד שהתקבלו:', tradePlans);
            console.log('📊 מספר תוכניות:', tradePlans.length);
            
            // מילוי שדה תוכנית הטרייד במודל
            const tradePlanSelect = document.getElementById('editTradeTradePlanId');
            console.log('🔍 שדה תוכנית טרייד:', tradePlanSelect);
            
            if (tradePlanSelect) {
                console.log('🔍 מספר אפשרויות קיימות:', tradePlanSelect.options.length);
                
                // ניקוי האפשרויות הקיימות (למעט הראשונה)
                while (tradePlanSelect.options.length > 1) {
                    tradePlanSelect.remove(1);
                }
                
                console.log('🧹 ניקוי הושלם, מספר אפשרויות:', tradePlanSelect.options.length);
                
                // הוספת התוכניות
                tradePlans.forEach((plan, index) => {
                    const option = document.createElement('option');
                    option.value = plan.id;
                    const createdDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : '';
                    option.textContent = `תוכנית ${plan.id} - ${createdDate}`;
                    tradePlanSelect.appendChild(option);
                    console.log(`✅ הוספת תוכנית ${index + 1}: ${option.textContent}`);
                });
                
                console.log(`✅ מילא ${tradePlans.length} תוכניות טרייד במודל`);
                console.log('🔍 מספר אפשרויות סופי:', tradePlanSelect.options.length);
            } else {
                console.error('❌ שדה editTradeTradePlanId לא נמצא!');
            }
        } else {
            console.warn('⚠️ לא הצלחתי לטעון תוכניות טרייד:', response);
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת תוכניות טרייד:', error);
    }
}

/**
 * פונקציה לטעינת חשבונות למודל הוספה
 */
async function loadAccountsForAddModal() {
    try {
        console.log('🔧 טוען חשבונות למודל הוספה...');
        
        // קריאה ל-API לקבלת חשבונות
        const response = await window.apiCall('/api/v1/accounts/');
        
        if (response.status === 'success' && response.data) {
            const accounts = response.data;
            console.log('📊 חשבונות שהתקבלו:', accounts);
            
            // מילוי שדה החשבון במודל הוספה
            const accountSelect = document.getElementById('addTradeAccountId');
            if (accountSelect) {
                // ניקוי האפשרויות הקיימות (למעט הראשונה)
                while (accountSelect.options.length > 1) {
                    accountSelect.remove(1);
                }
                
                // הוספת החשבונות
                accounts.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name || `חשבון ${account.id}`;
                    accountSelect.appendChild(option);
                });
                
                console.log(`✅ מילא ${accounts.length} חשבונות במודל הוספה`);
            }
        } else {
            console.warn('⚠️ לא הצלחתי לטעון חשבונות, משתמש בערכים ברירת מחדל');
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת חשבונות:', error);
    }
}

/**
 * פונקציה לטעינת טיקרים למודל הוספה
 */
async function loadTickersForAddModal() {
    try {
        console.log('🔧 טוען טיקרים למודל הוספה...');
        
        // קריאה ל-API לקבלת טיקרים
        const response = await window.apiCall('/api/v1/tickers/');
        
        if (response.status === 'success' && response.data) {
            const tickers = response.data;
            console.log('📊 טיקרים שהתקבלו:', tickers);
            
            // מילוי שדה הטיקר במודל הוספה
            const tickerSelect = document.getElementById('addTradeTickerId');
            if (tickerSelect) {
                // ניקוי האפשרויות הקיימות (למעט הראשונה)
                while (tickerSelect.options.length > 1) {
                    tickerSelect.remove(1);
                }
                
                // הוספת הטיקרים
                tickers.forEach(ticker => {
                    const option = document.createElement('option');
                    option.value = ticker.id;
                    option.textContent = ticker.symbol || `טיקר ${ticker.id}`;
                    tickerSelect.appendChild(option);
                });
                
                console.log(`✅ מילא ${tickers.length} טיקרים במודל הוספה`);
            }
        } else {
            console.warn('⚠️ לא הצלחתי לטעון טיקרים, משתמש בערכים ברירת מחדל');
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
    }
}

/**
 * פונקציה לטעינת תוכניות טרייד למודל הוספה
 */
async function loadTradePlansForAddModal() {
    try {
        console.log('🔧 טוען תוכניות טרייד למודל הוספה...');
        
        // קריאה ל-API לקבלת תוכניות טרייד
        const response = await window.apiCall('/api/v1/trade_plans/');
        
        console.log('📡 תגובת API לתוכניות (הוספה):', response);
        
        if (response.status === 'success' && response.data) {
            const tradePlans = response.data;
            console.log('📊 תוכניות טרייד שהתקבלו (הוספה):', tradePlans);
            console.log('📊 מספר תוכניות (הוספה):', tradePlans.length);
            
            // מילוי שדה תוכנית הטרייד במודל הוספה
            const tradePlanSelect = document.getElementById('addTradeTradePlanId');
            console.log('🔍 שדה תוכנית טרייד (הוספה):', tradePlanSelect);
            
            if (tradePlanSelect) {
                console.log('🔍 מספר אפשרויות קיימות (הוספה):', tradePlanSelect.options.length);
                
                // ניקוי האפשרויות הקיימות (למעט הראשונה)
                while (tradePlanSelect.options.length > 1) {
                    tradePlanSelect.remove(1);
                }
                
                console.log('🧹 ניקוי הושלם (הוספה), מספר אפשרויות:', tradePlanSelect.options.length);
                
                // הוספת התוכניות
                tradePlans.forEach((plan, index) => {
                    const option = document.createElement('option');
                    option.value = plan.id;
                    const createdDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : '';
                    option.textContent = `תוכנית ${plan.id} - ${createdDate}`;
                    tradePlanSelect.appendChild(option);
                    console.log(`✅ הוספת תוכנית ${index + 1} (הוספה): ${option.textContent}`);
                });
                
                console.log(`✅ מילא ${tradePlans.length} תוכניות טרייד במודל הוספה`);
                console.log('🔍 מספר אפשרויות סופי (הוספה):', tradePlanSelect.options.length);
            } else {
                console.error('❌ שדה addTradeTradePlanId לא נמצא!');
            }
        } else {
            console.warn('⚠️ לא הצלחתי לטעון תוכניות טרייד (הוספה):', response);
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת תוכניות טרייד (הוספה):', error);
    }
}

/**
 * פונקציה לעדכון טיקר בהתאם לתוכנית שנבחרה
 */
function updateTickerFromTradePlan(tradePlanId, isEditModal = true) {
    console.log(`🔧 עדכון טיקר לפי תוכנית ${tradePlanId} (עריכה: ${isEditModal})`);
    
    const tickerDisplay = document.getElementById(isEditModal ? 'editTradeTickerDisplay' : 'addTradeTickerDisplay');
    const tickerIdInput = document.getElementById(isEditModal ? 'editTradeTickerId' : 'addTradeTickerId');
    const currentPrice = document.getElementById(isEditModal ? 'editTradeCurrentPrice' : 'addTradeCurrentPrice');
    const dailyChange = document.getElementById(isEditModal ? 'editTradeDailyChange' : 'addTradeDailyChange');
    
    if (!tradePlanId) {
        // אם לא נבחרה תוכנית, נקה את השדות
        if (tickerDisplay) tickerDisplay.textContent = isEditModal ? '' : 'לא נבחר';
        if (tickerIdInput) tickerIdInput.value = '';
        if (currentPrice) currentPrice.textContent = isEditModal ? '$150.25' : '-';
        if (dailyChange) {
            dailyChange.textContent = isEditModal ? '+2.5%' : '-';
            dailyChange.className = 'form-control-plaintext text-success';
        }
        return;
    }
    
    // כאן נצטרך לקרוא ל-API לקבלת פרטי התוכנית
    // כרגע נשתמש בנתוני דמה
    fetch(`/api/v1/trade_plans/${tradePlanId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                const plan = data.data;
                console.log('📊 פרטי תוכנית:', plan);
                
                // עדכון הטיקר
                if (tickerDisplay) {
                    tickerDisplay.textContent = plan.ticker_symbol || plan.ticker_name || 'לא ידוע';
                }
                if (tickerIdInput) {
                    tickerIdInput.value = plan.ticker_id || '';
                }
                
                // נתוני דמה למחיר ושינוי יומי
                if (currentPrice) {
                    const price = (Math.random() * 200 + 50).toFixed(2);
                    currentPrice.textContent = `$${price}`;
                }
                if (dailyChange) {
                    const change = (Math.random() * 10 - 5).toFixed(1);
                    const isPositive = change >= 0;
                    dailyChange.textContent = `${isPositive ? '+' : ''}${change}%`;
                    dailyChange.className = `form-control-plaintext ${isPositive ? 'text-success' : 'text-danger'}`;
                }
            }
        })
        .catch(error => {
            console.error('❌ שגיאה בקבלת פרטי תוכנית:', error);
            // במקרה של שגיאה, נשתמש בנתוני דמה
            if (tickerDisplay) tickerDisplay.textContent = 'AAPL';
            if (tickerIdInput) tickerIdInput.value = '1';
            if (currentPrice) currentPrice.textContent = '$150.25';
            if (dailyChange) {
                dailyChange.textContent = '+2.5%';
                dailyChange.className = 'form-control-plaintext text-success';
            }
        });
}

/**
 * הוספת event listeners לטופסי עריכה והוספה
 */
document.addEventListener('DOMContentLoaded', function() {
    // Event listener לבחירת תוכנית בטופס עריכה
    const editTradePlanSelect = document.getElementById('editTradeTradePlanId');
    if (editTradePlanSelect) {
        editTradePlanSelect.addEventListener('change', function() {
            updateTickerFromTradePlan(this.value, true);
        });
    }
    
    // Event listener לבחירת תוכנית בטופס הוספה
    const addTradePlanSelect = document.getElementById('addTradeTradePlanId');
    if (addTradePlanSelect) {
        addTradePlanSelect.addEventListener('change', function() {
            updateTickerFromTradePlan(this.value, false);
        });
    }
});

console.log('✅ קובץ trades.js נטען בהצלחה - פונקציות טריידים זמינות');

// בדיקת זמינות פונקציות
console.log('🔍 בדיקת זמינות פונקציות:');
console.log('🔍 loadTradePlansForModal:', typeof window.loadTradePlansForModal);
console.log('🔍 loadTradePlansForAddModal:', typeof window.loadTradePlansForAddModal);
console.log('🔍 showAddTradeModal:', typeof window.showAddTradeModal);
console.log('🔍 showEditTradeModal:', typeof window.showEditTradeModal);
