// ===== NOTES MANAGEMENT =====
// קובץ ייעודי לניהול הערות - משותף לכל הדפים

/**
 * טעינת חשבונות מהשרת
 * הפונקציה טוענת את כל החשבונות ומחזירה אותן
 * 
 * @returns {Promise<Array>} מערך של חשבונות
 * 
 * @example
 * const accounts = await loadAccountsForNotes();
 */
async function loadAccountsForNotes() {
    try {
        console.log('🔄 טוען חשבונות למודל הערות...');
        const response = await window.apiCall('/api/v1/accounts/');
        const accounts = response.data || response;
        console.log(`✅ נטענו ${accounts.length} חשבונות למודל הערות`);
        return accounts;
    } catch (error) {
        console.error('❌ שגיאה בטעינת חשבונות למודל הערות:', error);
        return [];
    }
}

/**
 * טעינת טריידים מהשרת
 * הפונקציה טוענת את כל הטריידים ומחזירה אותן
 * 
 * @returns {Promise<Array>} מערך של טריידים
 * 
 * @example
 * const trades = await loadTradesForNotes();
 */
async function loadTradesForNotes() {
    try {
        console.log('🔄 טוען טריידים למודל הערות...');
        const response = await window.apiCall('/api/v1/trades/');
        const trades = response.data || response;
        console.log(`✅ נטענו ${trades.length} טריידים למודל הערות`);
        return trades;
    } catch (error) {
        console.error('❌ שגיאה בטעינת טריידים למודל הערות:', error);
        return [];
    }
}

/**
 * טעינת תוכניות טרייד מהשרת
 * הפונקציה טוענת את כל תוכניות הטרייד ומחזירה אותן
 * 
 * @returns {Promise<Array>} מערך של תוכניות טרייד
 * 
 * @example
 * const tradePlans = await loadTradePlansForNotes();
 */
async function loadTradePlansForNotes() {
    try {
        console.log('🔄 טוען תוכניות טרייד למודל הערות...');
        const response = await window.apiCall('/api/v1/trade_plans/');
        const tradePlans = response.data || response;
        console.log(`✅ נטענו ${tradePlans.length} תוכניות טרייד למודל הערות`);
        return tradePlans;
    } catch (error) {
        console.error('❌ שגיאה בטעינת תוכניות טרייד למודל הערות:', error);
        return [];
    }
}

/**
 * טעינת טיקרים מהשרת
 * הפונקציה טוענת את כל הטיקרים ומחזירה אותם
 * 
 * @returns {Promise<Array>} מערך של טיקרים
 * 
 * @example
 * const tickers = await loadTickersForNotes();
 */
async function loadTickersForNotes() {
    try {
        console.log('🔄 טוען טיקרים למודל הערות...');
        const response = await window.apiCall('/api/v1/tickers/');
        const tickers = response.data || response;
        console.log(`✅ נטענו ${tickers.length} טיקרים למודל הערות`);
        return tickers;
    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים למודל הערות:', error);
        return [];
    }
}

/**
 * מילוי רשימת חשבונות ב-select box
 * הפונקציה ממלאת את ה-select box של חשבונות עם נתונים מהשרת
 * 
 * @param {string} selectId - מזהה ה-select box
 * @param {string} selectedValue - ערך נבחר (אופציונלי)
 * 
 * @example
 * await populateAccountsSelect('editNoteAccountId', '1');
 */
async function populateAccountsSelect(selectId, selectedValue = '') {
    try {
        const accounts = await loadAccountsForNotes();
        const select = document.getElementById(selectId);
        
        if (!select) {
            console.warn(`⚠️ לא נמצא select עם מזהה: ${selectId}`);
            return;
        }
        
        // שמירת האופציה הראשונה (בחר חשבון...)
        const firstOption = select.querySelector('option');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        // הוספת החשבונות
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.id} - ${account.name || 'חשבון ללא שם'} (${account.currency || 'N/A'})`;
            if (account.id.toString() === selectedValue.toString()) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        console.log(`✅ מילאתי ${accounts.length} חשבונות ב-${selectId}`);
    } catch (error) {
        console.error('❌ שגיאה במילוי רשימת חשבונות:', error);
    }
}

/**
 * מילוי רשימת טריידים ב-select box
 * הפונקציה ממלאת את ה-select box של טריידים עם נתונים מהשרת
 * 
 * @param {string} selectId - מזהה ה-select box
 * @param {string} selectedValue - ערך נבחר (אופציונלי)
 * 
 * @example
 * await populateTradesSelect('editNoteTradeId', '1');
 */
async function populateTradesSelect(selectId, selectedValue = '') {
    try {
        const trades = await loadTradesForNotes();
        const tickers = await loadTickersForNotes();
        
        // יצירת מפת טיקרים לזיהוי מהיר
        const tickerMap = {};
        tickers.forEach(ticker => {
            tickerMap[ticker.id] = ticker;
        });
        
        const select = document.getElementById(selectId);
        
        if (!select) {
            console.warn(`⚠️ לא נמצא select עם מזהה: ${selectId}`);
            return;
        }
        
        // שמירת האופציה הראשונה (בחר טרייד...)
        const firstOption = select.querySelector('option');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        // הוספת הטריידים
        trades.forEach(trade => {
            const option = document.createElement('option');
            option.value = trade.id;
            
            // מציאת הטיקר המתאים
            const ticker = tickerMap[trade.ticker_id];
            const tickerSymbol = ticker ? ticker.symbol : 'N/A';
            const tickerName = ticker ? ticker.name : 'N/A';
            
            const tradeType = trade.type === 'buy' ? 'קנייה' : trade.type === 'sell' ? 'מכירה' : trade.type || 'N/A';
            option.textContent = `${trade.id} - ${tickerSymbol} (${tickerName}) - ${tradeType}`;
            
            if (trade.id.toString() === selectedValue.toString()) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        console.log(`✅ מילאתי ${trades.length} טריידים ב-${selectId}`);
    } catch (error) {
        console.error('❌ שגיאה במילוי רשימת טריידים:', error);
    }
}

/**
 * מילוי רשימת תוכניות טרייד ב-select box
 * הפונקציה ממלאת את ה-select box של תוכניות טרייד עם נתונים מהשרת
 * 
 * @param {string} selectId - מזהה ה-select box
 * @param {string} selectedValue - ערך נבחר (אופציונלי)
 * 
 * @example
 * await populateTradePlansSelect('editNoteTradePlanId', '1');
 */
async function populateTradePlansSelect(selectId, selectedValue = '') {
    try {
        const tradePlans = await loadTradePlansForNotes();
        const tickers = await loadTickersForNotes();
        
        // יצירת מפת טיקרים לזיהוי מהיר
        const tickerMap = {};
        tickers.forEach(ticker => {
            tickerMap[ticker.id] = ticker;
        });
        
        const select = document.getElementById(selectId);
        
        if (!select) {
            console.warn(`⚠️ לא נמצא select עם מזהה: ${selectId}`);
            return;
        }
        
        // שמירת האופציה הראשונה (בחר תוכנית טרייד...)
        const firstOption = select.querySelector('option');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        // הוספת תוכניות הטרייד - רק בסטטוס פתוח
        const openTradePlans = tradePlans.filter(plan => plan.status === 'open' || plan.status === 'פתוח');
        
        openTradePlans.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            
            // מציאת הטיקר המתאים
            const ticker = tickerMap[plan.ticker_id];
            const tickerSymbol = ticker ? ticker.symbol : 'N/A';
            const tickerName = ticker ? ticker.name : 'N/A';
            
            // המרת סוג ההשקעה
            const investmentType = plan.investment_type === 'long' ? 'קנייה' : 
                                 plan.investment_type === 'short' ? 'מכירה' : 
                                 plan.investment_type === 'swing' ? 'סחורה' : 
                                 plan.investment_type || 'N/A';
            
            option.textContent = `${plan.id} - ${tickerSymbol} (${tickerName}) - ${investmentType}`;
            
            if (plan.id.toString() === selectedValue.toString()) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        console.log(`✅ מילאתי ${openTradePlans.length} תוכניות טרייד בסטטוס פתוח ב-${selectId}`);
    } catch (error) {
        console.error('❌ שגיאה במילוי רשימת תוכניות טרייד:', error);
    }
}

/**
 * טעינת הערות מהשרת
 * הפונקציה טוענת את כל ההערות ומחזירה אותן
 * 
 * @returns {Promise<Array>} מערך של הערות
 * 
 * @example
 * const notes = await loadNotesData();
 */
async function loadNotesData() {
    try {
        console.log('🔄 טוען הערות...');
        const response = await window.apiCall('/api/v1/notes/');
        const notes = response.data || response;
        console.log(`✅ נטענו ${notes.length} הערות`);
        return notes;
    } catch (error) {
        console.error('❌ שגיאה בטעינת הערות:', error);
        throw error;
    }
}

/**
 * חישוב סטטיסטיקות מנתוני ההערות
 * הפונקציה מחשבת סטטיסטיקות כלליות מנתוני ההערות
 * 
 * @param {Array} notes - מערך של הערות
 * @returns {Object} אובייקט עם הסטטיסטיקות
 * 
 * @example
 * const stats = calculateNotesStats(notes);
 */
function calculateNotesStats(notes) {
    const activeNotes = notes.filter(note => note.status === 'פעיל').length;
    const totalNotes = notes.length;
    const importantNotes = notes.filter(note => note.is_important).length;
    const recentNotes = notes.filter(note => {
        const noteDate = new Date(note.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return noteDate > weekAgo;
    }).length;
    
    return {
        active_notes: activeNotes,
        total_notes: totalNotes,
        important_notes: importantNotes,
        recent_notes: recentNotes
    };
}

/**
 * המרת סטטוס הערה מ-עברית לאנגלית
 * הפונקציה ממירה ערכים בעברית לערכים שהשרת מצפה להם
 * 
 * @param {string} statusDisplay - סטטוס בעברית
 * @returns {string} סטטוס באנגלית
 * 
 * @example
 * const status = convertNoteStatus('פעיל'); // returns 'active'
 */
function convertNoteStatus(statusDisplay) {
    if (statusDisplay === 'פעיל') return 'active';
    if (statusDisplay === 'לא פעיל') return 'inactive';
    if (statusDisplay === 'מבוטל') return 'cancelled';
    return statusDisplay || 'active';
}

/**
 * המרת סטטוס הערה מאנגלית לעברית
 * הפונקציה ממירה ערכים מהשרת לערכים לתצוגה בעברית
 * 
 * @param {string} status - סטטוס באנגלית
 * @returns {string} סטטוס בעברית
 * 
 * @example
 * const statusDisplay = convertNoteStatusToHebrew('active'); // returns 'פעיל'
 */
function convertNoteStatusToHebrew(status) {
    if (status === 'active' || status === 'פעיל') {
        return 'פעיל';
    } else if (status === 'inactive' || status === 'לא פעיל') {
        return 'לא פעיל';
    } else if (status === 'cancelled' || status === 'מבוטל') {
        return 'מבוטל';
    }
    return status || 'פעיל';
}

/**
 * מילוי נתונים במודל עריכת הערה
 * הפונקציה ממלאת את כל השדות במודל העריכה עם נתוני ההערה
 * 
 * @param {Object} note - נתוני ההערה
 * 
 * @example
 * fillNoteEditModal(noteData);
 */
async function fillNoteEditModal(note) {
    console.log(`🔧 מילוי מודל עריכת הערה עם נתונים:`, note);
    
    // מילוי שדות הטופס
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editNoteContent').value = note.content || '';
    document.getElementById('editNoteContentEditor').innerHTML = note.content || '';
    document.getElementById('editNoteAttachment').value = note.attachment || '';
    
    // קביעת סוג הקשר
    const relatedType = note.related_type || '';
    const relatedId = note.related_id || '';
    
    console.log(`🔍 סוג הקשר של ההערה: ${relatedType}, ID: ${relatedId}`);
    
    // מילוי רשימות לפי סוג הקשר
    if (relatedType === 'account') {
        console.log('🔄 מילוי רשימת חשבונות...');
        await populateAccountsSelect('editNoteAccountId', relatedId);
        await populateTradesSelect('editNoteTradeId', '');
        await populateTradePlansSelect('editNoteTradePlanId', '');
        
        // בחירת רדיו באטון חשבון
        const accountRadio = document.getElementById('editNoteRelationAccount');
        console.log('🔍 רדיו באטון חשבון לפני בחירה:', accountRadio);
        accountRadio.checked = true;
        console.log('🔍 רדיו באטון חשבון אחרי בחירה:', accountRadio.checked);
        
        document.getElementById('editNoteAccountId').style.display = 'block';
        document.getElementById('editNoteTradeId').style.display = 'none';
        document.getElementById('editNoteTradePlanId').style.display = 'none';
        console.log('✅ נבחר רדיו באטון חשבון');
    } else if (relatedType === 'trade') {
        console.log('🔄 מילוי רשימת טריידים...');
        await populateAccountsSelect('editNoteAccountId', '');
        await populateTradesSelect('editNoteTradeId', relatedId);
        await populateTradePlansSelect('editNoteTradePlanId', '');
        
        // בחירת רדיו באטון טרייד
        const tradeRadio = document.getElementById('editNoteRelationTrade');
        console.log('🔍 רדיו באטון טרייד לפני בחירה:', tradeRadio);
        tradeRadio.checked = true;
        console.log('🔍 רדיו באטון טרייד אחרי בחירה:', tradeRadio.checked);
        
        document.getElementById('editNoteAccountId').style.display = 'none';
        document.getElementById('editNoteTradeId').style.display = 'block';
        document.getElementById('editNoteTradePlanId').style.display = 'none';
        console.log('✅ נבחר רדיו באטון טרייד');
    } else if (relatedType === 'trade_plan') {
        console.log('🔄 מילוי רשימת תוכניות...');
        await populateAccountsSelect('editNoteAccountId', '');
        await populateTradesSelect('editNoteTradeId', '');
        await populateTradePlansSelect('editNoteTradePlanId', relatedId);
        
        // בחירת רדיו באטון תוכנית טרייד
        const planRadio = document.getElementById('editNoteRelationTradePlan');
        console.log('🔍 רדיו באטון תוכנית לפני בחירה:', planRadio);
        planRadio.checked = true;
        console.log('🔍 רדיו באטון תוכנית אחרי בחירה:', planRadio.checked);
        
        document.getElementById('editNoteAccountId').style.display = 'none';
        document.getElementById('editNoteTradeId').style.display = 'none';
        document.getElementById('editNoteTradePlanId').style.display = 'block';
        console.log('✅ נבחר רדיו באטון תוכנית טרייד');
    } else {
        console.log('🔄 מילוי רשימות כברירת מחדל...');
        // ללא קישור - נבחר תוכנית טרייד כברירת מחדל
        await populateAccountsSelect('editNoteAccountId', '');
        await populateTradesSelect('editNoteTradeId', '');
        await populateTradePlansSelect('editNoteTradePlanId', '');
        
        // בחירת רדיו באטון תוכנית טרייד כברירת מחדל
        const defaultRadio = document.getElementById('editNoteRelationTradePlan');
        console.log('🔍 רדיו באטון ברירת מחדל לפני בחירה:', defaultRadio);
        defaultRadio.checked = true;
        console.log('🔍 רדיו באטון ברירת מחדל אחרי בחירה:', defaultRadio.checked);
        
        document.getElementById('editNoteAccountId').style.display = 'none';
        document.getElementById('editNoteTradeId').style.display = 'none';
        document.getElementById('editNoteTradePlanId').style.display = 'block';
        console.log('✅ נבחר רדיו באטון תוכנית טרייד כברירת מחדל');
    }
    
    // בדיקה סופית - איזה רדיו באטון נבחר
    console.log('🔍 === בדיקה סופית של רדיו באטונים ===');
    const allRadios = document.querySelectorAll('input[name="editNoteRelationType"]');
    allRadios.forEach(radio => {
        console.log(`🔍 רדיו באטון ${radio.value}: checked = ${radio.checked}, id = ${radio.id}`);
    });
    
    const finalSelectedRelation = document.querySelector('input[name="editNoteRelationType"]:checked');
    console.log('🔍 רדיו באטון שנבחר:', finalSelectedRelation);
    if (finalSelectedRelation) {
        console.log('🔍 ערך הרדיו באטון:', finalSelectedRelation.value);
    } else {
        console.error('❌ לא נמצא רדיו באטון נבחר!');
    }
    console.log('🔍 === סיום בדיקה סופית ===');
}

/**
 * איסוף נתונים ממודל עריכת הערה
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני ההערה
 * 
 * @example
 * const noteData = collectNoteEditData();
 */
function collectNoteEditData() {
    // עדכון תוכן מהעורך לשדה הנסתר
    if (typeof syncEditorContent === 'function') {
        syncEditorContent();
    }
    
    // קביעת הקשר לפי רדיו באטון שנבחר
    let relatedType = null;
    let relatedId = null;
    
    // בדיקה של כל הרדיו באטונים
    const allRadios = document.querySelectorAll('input[name="editNoteRelationType"]');
    console.log('🔍 כל הרדיו באטונים:', allRadios);
    allRadios.forEach(radio => {
        console.log(`🔍 רדיו באטון ${radio.value}: checked = ${radio.checked}`);
    });
    
    const selectedRelation = document.querySelector('input[name="editNoteRelationType"]:checked');
    console.log('🔍 רדיו באטון שנבחר:', selectedRelation);
    
    if (selectedRelation) {
        relatedType = selectedRelation.value;
        console.log('🔍 סוג הקשר שנבחר:', relatedType);
        
        if (relatedType === 'account') {
            const accountId = document.getElementById('editNoteAccountId').value;
            console.log('🔍 ID חשבון שנבחר:', accountId);
            if (accountId) {
                relatedId = parseInt(accountId);
            }
        } else if (relatedType === 'trade') {
            const tradeId = document.getElementById('editNoteTradeId').value;
            console.log('🔍 ID טרייד שנבחר:', tradeId);
            if (tradeId) {
                relatedId = parseInt(tradeId);
            }
        } else if (relatedType === 'trade_plan') {
            const tradePlanId = document.getElementById('editNoteTradePlanId').value;
            console.log('🔍 ID תוכנית שנבחר:', tradePlanId);
            if (tradePlanId) {
                relatedId = parseInt(tradePlanId);
            }
        }
    } else {
        console.error('❌ לא נבחר רדיו באטון!');
        // נסיון לבחור רדיו באטון כברירת מחדל
        const defaultRadio = document.querySelector('input[name="editNoteRelationType"][value="trade_plan"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
            relatedType = 'trade_plan';
            console.log('✅ נבחר רדיו באטון כברירת מחדל: trade_plan');
        }
    }
    
    const noteData = {
        content: document.getElementById('editNoteContent').value.trim(),
        related_type: relatedType,
        related_id: relatedId,
        attachment: document.getElementById('editNoteAttachment').files[0] || null
    };
    
    console.log('📝 נתונים שנאספו ממודל עריכת הערה:', noteData);
    console.log('🔍 תוכן ההערה:', noteData.content);
    console.log('🔍 סוג הקשר:', noteData.related_type);
    console.log('🔍 ID הקשר:', noteData.related_id);
    return noteData;
}

/**
 * איסוף נתונים ממודל הוספת הערה
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני ההערה החדשה
 * 
 * @example
 * const noteData = collectNoteAddData();
 */
function collectNoteAddData() {
    // עדכון תוכן מהעורך לשדה הנסתר
    if (typeof syncEditorContent === 'function') {
        syncEditorContent();
    }
    
    // קביעת הקשר לפי רדיו באטון שנבחר
    let relatedType = null;
    let relatedId = null;
    
    const selectedRelation = document.querySelector('input[name="noteRelationType"]:checked');
    if (selectedRelation) {
        relatedType = selectedRelation.value;
        
        if (relatedType === 'account') {
            const accountId = document.getElementById('noteAccountId').value;
            if (accountId) {
                relatedId = parseInt(accountId);
            }
        } else if (relatedType === 'trade') {
            const tradeId = document.getElementById('noteTradeId').value;
            if (tradeId) {
                relatedId = parseInt(tradeId);
            }
        } else if (relatedType === 'trade_plan') {
            const tradePlanId = document.getElementById('noteTradePlanId').value;
            if (tradePlanId) {
                relatedId = parseInt(tradePlanId);
            }
        }
    }
    
    const noteData = {
        content: document.getElementById('noteContent').value.trim(),
        related_type: relatedType,
        related_id: relatedId,
        attachment: document.getElementById('noteAttachment').files[0] || null
    };
    
    console.log('📝 נתונים שנאספו ממודל הוספת הערה:', noteData);
    return noteData;
}

/**
 * המרת נתוני הערה ממבנה הממשק למבנה השרת
 * הפונקציה ממירה את related_type ו-related_id לשדות נפרדים שהשרת מצפה להם
 * 
 * @param {Object} noteData - נתוני הערה מהממשק
 * @returns {Object} נתוני הערה בפורמט השרת
 * 
 * @example
 * const serverData = convertNoteDataForServer(noteData);
 */
function convertNoteDataForServer(noteData) {
    const serverData = {
        content: noteData.content,
        attachment: noteData.attachment
    };
    
    // איפוס כל השדות
    serverData.account_id = null;
    serverData.trade_id = null;
    serverData.trade_plan_id = null;
    
    // הגדרת השדה המתאים לפי סוג הקשר
    if (noteData.related_type === 'account' && noteData.related_id) {
        serverData.account_id = noteData.related_id;
    } else if (noteData.related_type === 'trade' && noteData.related_id) {
        serverData.trade_id = noteData.related_id;
    } else if (noteData.related_type === 'trade_plan' && noteData.related_id) {
        serverData.trade_plan_id = noteData.related_id;
    }
    
    console.log('🔄 המרת נתונים לשרת:', {
        original: noteData,
        converted: serverData
    });
    
    return serverData;
}

/**
 * יצירת הערה חדשה
 * הפונקציה שולחת בקשה לשרת ליצירת הערה חדשה
 * 
 * @param {Object} noteData - נתוני ההערה החדשה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await createNote(noteData);
 */
async function createNote(noteData) {
    try {
        console.log('🚀 יוצר הערה חדשה:', noteData);
        
        let response;
        
        // בדיקה אם יש קובץ מצורף
        if (noteData.attachment) {
            // שליחה עם FormData
            const formData = new FormData();
            formData.append('content', noteData.content);
            formData.append('attachment', noteData.attachment);
            
            // הוספת שדות הקשר
            const serverData = convertNoteDataForServer(noteData);
            if (serverData.account_id) formData.append('account_id', serverData.account_id);
            if (serverData.trade_id) formData.append('trade_id', serverData.trade_id);
            if (serverData.trade_plan_id) formData.append('trade_plan_id', serverData.trade_plan_id);
            
            response = await window.apiCall('/api/v1/notes/', {
                method: 'POST',
                body: formData,
                headers: {} // לא שולח Content-Type כדי שהדפדפן יקבע אותו אוטומטית
            });
        } else {
            // שליחה רגילה עם JSON
            const serverData = convertNoteDataForServer(noteData);
            
            response = await window.apiCall('/api/v1/notes/', {
                method: 'POST',
                body: JSON.stringify(serverData)
            });
        }
        
        console.log('✅ הערה נוצרה בהצלחה:', response);
        showNotification('הערה נוצרה בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה ביצירת הערה:', error);
        showNotification('שגיאה ביצירת הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * עדכון הערה קיימת
 * הפונקציה שולחת בקשה לשרת לעדכון הערה קיימת
 * 
 * @param {number} noteId - מזהה ההערה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await updateNote(1);
 */
async function updateNote(noteId, noteData) {
    try {
        console.log(`🔄 מעדכן הערה ${noteId}:`, noteData);
        
        let response;
        
        // בדיקה אם יש קובץ מצורף
        if (noteData.attachment) {
            // שליחה עם FormData
            const formData = new FormData();
            formData.append('content', noteData.content);
            formData.append('attachment', noteData.attachment);
            
            // הוספת שדות הקשר
            const serverData = convertNoteDataForServer(noteData);
            if (serverData.account_id) formData.append('account_id', serverData.account_id);
            if (serverData.trade_id) formData.append('trade_id', serverData.trade_id);
            if (serverData.trade_plan_id) formData.append('trade_plan_id', serverData.trade_plan_id);
            
            response = await window.apiCall(`/api/v1/notes/${noteId}`, {
                method: 'PUT',
                body: formData,
                headers: {} // לא שולח Content-Type כדי שהדפדפן יקבע אותו אוטומטית
            });
        } else {
            // שליחה רגילה עם JSON
            const serverData = convertNoteDataForServer(noteData);
            
            response = await window.apiCall(`/api/v1/notes/${noteId}`, {
                method: 'PUT',
                body: JSON.stringify(serverData)
            });
        }
        
        console.log('✅ הערה עודכנה בהצלחה:', response);
        showNotification('הערה עודכנה בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בעדכון הערה:', error);
        showNotification('שגיאה בעדכון הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * מחיקת הערה
 * הפונקציה שולחת בקשה לשרת למחיקת הערה
 * 
 * @param {number} noteId - מזהה ההערה
 * @param {string} noteTitle - כותרת ההערה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await deleteNote(1, 'הערה חשובה');
 */
async function deleteNote(noteId, noteTitle) {
    try {
        // אישור מחיקה
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את ההערה "${noteTitle}"?\n\nפעולה זו לא ניתנת לביטול.`);
        if (!confirmed) {
            console.log('❌ מחיקת הערה בוטלה על ידי המשתמש');
            return null;
        }
        
        console.log(`🗑️ מוחק הערה ${noteId}: ${noteTitle}`);
        const response = await window.apiCall(`/api/v1/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ הערה נמחקה בהצלחה:', response);
        showNotification(`הערה "${noteTitle}" נמחקה בהצלחה!`, 'success');
        
        // רענון הטבלה אחרי המחיקה
        console.log('🔄 מרענן טבלה אחרי מחיקה...');
        try {
            // טעינת נתונים חדשים
            const notes = await loadNotesData();
            
            // עדכון הטבלה (תלוי בדף)
            if (typeof updateNotesTable === 'function') {
                await updateNotesTable(notes);
            }
            
            // עדכון סטטיסטיקות (תלוי בדף)
            if (typeof updateTableStats === 'function') {
                updateTableStats();
            }
            
            console.log('✅ טבלה רועננה בהצלחה אחרי מחיקה');
        } catch (refreshError) {
            console.warn('⚠️ שגיאה ברענון הטבלה:', refreshError);
        }
        
        return response;
    } catch (error) {
        console.error('❌ שגיאה במחיקת הערה:', error);
        showNotification('שגיאה במחיקת הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}



/**
 * הצגת מודל הוספת הערה
 * הפונקציה מציגה את המודל להוספת הערה חדשה
 * 
 * @example
 * showAddNoteModal();
 */
async function showAddNoteModal() {
    console.log('📝 מציג מודל הוספת הערה');
    
    // הצגת המודל קודם
    const modal = new bootstrap.Modal(document.getElementById('addNoteModal'));
    modal.show();
    
    // ניקוי הטופס
    document.getElementById('noteContent').value = '';
    document.getElementById('noteAttachment').value = '';
    
    // מילוי רשימות חשבונות, טריידים ותוכניות טרייד (ריקות)
    await populateAccountsSelect('noteAccountId', '');
    await populateTradesSelect('noteTradeId', '');
    await populateTradePlansSelect('noteTradePlanId', '');
}

/**
 * הצגת מודל עריכת הערה
 * הפונקציה מציגה את המודל לעריכת הערה קיימת
 * 
 * @param {Object} note - נתוני ההערה
 * 
 * @example
 * showEditNoteModal(noteData);
 */
async function showEditNoteModal(note) {
    console.log('✏️ מציג מודל עריכת הערה:', note);
    
    // הצגת המודל קודם
    const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
    modal.show();
    
    // מילוי הנתונים (אחרי שהמודל נפתח)
    await fillNoteEditModal(note);
}

/**
 * שמירת הערה חדשה
 * הפונקציה שומרת הערה חדשה ומרעננת את הטבלה
 * 
 * @example
 * saveNote();
 */
async function saveNote() {
    try {
        const noteData = collectNoteAddData();
        
        // בדיקות תקינות
        if (!noteData.content) {
            showNotification('תוכן ההערה הוא שדה חובה', 'error');
            return;
        }
        
        await createNote(noteData);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshNotesTable();
        
    } catch (error) {
        console.error('❌ שגיאה בשמירת הערה:', error);
    }
}

/**
 * עדכון הערה מהמודל
 * הפונקציה מעדכנת הערה קיימת ומרעננת את הטבלה
 * 
 * @example
 * updateNoteFromModal();
 */
async function updateNoteFromModal() {
    try {
        const noteId = document.getElementById('editNoteId').value;
        const noteData = collectNoteEditData();
        
        // בדיקות תקינות
        if (!noteData.content) {
            showNotification('תוכן ההערה הוא שדה חובה', 'error');
            return;
        }
        
        await updateNote(noteId, noteData);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshNotesTable();
        
    } catch (error) {
        console.error('❌ שגיאה בעדכון הערה:', error);
    }
}

/**
 * עדכון טבלת הערות בדף הערות
 * הפונקציה מעדכנת את הטבלה עם נתוני ההערות ומציגה שמות מלאים
 * 
 * @param {Array} notes - מערך של הערות
 * 
 * @example
 * updateNotesTable(notes);
 */
async function updateNotesTable(notes) {
    console.log('🚀 === התחלת updateNotesTable ===');
    console.log('🔄 מעדכן טבלת הערות עם', notes.length, 'הערות');
    console.log('📝 הערות:', notes);
    
    // פונקציות לקבצים (מוגדרות מקומית)
    function getFileIcon(filename) {
        if (!filename) return '📄';
        
        const extension = filename.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📈';
            case 'txt':
                return '📄';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
            case 'svg':
                return '🖼️';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return '🎥';
            case 'mp3':
            case 'wav':
            case 'flac':
                return '🎵';
            case 'zip':
            case 'rar':
            case '7z':
                return '📦';
            default:
                return '📎';
        }
    }
    
    function createFileLink(filename, fileUrl) {
        if (!filename) return '-';
        
        const icon = getFileIcon(filename);
        const displayName = filename.length > 20 ? filename.substring(0, 20) + '...' : filename;
        
        return `<a href="${fileUrl}" target="_blank" class="btn btn-sm btn-outline-primary" title="${filename}">
            ${icon} ${displayName}
        </a>`;
    }
    
    // חיפוש הטבלה - בדף הערות היא נמצאת ב-.main-content table tbody
    let tbody = document.querySelector('#notesTable tbody');
    if (!tbody) {
        tbody = document.querySelector('.main-content table tbody');
    }
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת הערות');
        return;
    }
    
    // טעינת נתונים נוספים לצורך הצגת שמות מלאים
    let accounts = [];
    let trades = [];
    let tradePlans = [];
    let tickers = [];
    
    try {
        // טעינת נתונים במקביל
        console.log('🔄 טוען נתונים נוספים...');
        const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
            window.apiCall('/api/v1/accounts/'),
            window.apiCall('/api/v1/trades/'),
            window.apiCall('/api/v1/trade_plans/'),
            window.apiCall('/api/v1/tickers/')
        ]);
        
        accounts = accountsResponse.data || accountsResponse;
        trades = tradesResponse.data || tradesResponse;
        tradePlans = tradePlansResponse.data || tradePlansResponse;
        tickers = tickersResponse.data || tickersResponse;
        
        console.log('📊 נתונים שנטענו:');
        console.log('חשבונות:', accounts);
        console.log('טריידים:', trades);
        console.log('תוכניות:', tradePlans);
        console.log('טיקרים:', tickers);
        console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);
    } catch (error) {
        console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
    }
    
    tbody.innerHTML = notes.map(note => {
        // קביעת הקשר לתצוגה עם שמות מלאים
        let relatedDisplay = '-';
        
        console.log(`🔍 מעבד הערה ${note.id}:`, note);
        console.log(`📊 נתונים זמינים: ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);
        
        if (note.related_type === 'account') {
            console.log(`🔍 מחפש חשבון עם ID: ${note.related_id}`);
            const account = accounts.find(acc => acc.id == note.related_id);
            console.log(`📋 חשבון שנמצא:`, account);
            relatedDisplay = account ? `חשבון - ${account.name}` : `חשבון ${note.related_id}`;
            console.log(`✅ תצוגה סופית: ${relatedDisplay}`);
        } else if (note.related_type === 'trade') {
            console.log(`🔍 מחפש טרייד עם ID: ${note.related_id}`);
            const trade = trades.find(t => t.id == note.related_id);
            console.log(`📈 טרייד שנמצא:`, trade);
            if (trade) {
                console.log(`🔍 מחפש טיקר עם ID: ${trade.ticker_id}`);
                const ticker = tickers.find(tick => tick.id == trade.ticker_id);
                console.log(`🎯 טיקר שנמצא:`, ticker);
                const tickerSymbol = ticker ? ticker.symbol : trade.ticker_id;
                relatedDisplay = `טרייד - ${tickerSymbol}`;
            } else {
                relatedDisplay = `טרייד ${note.related_id}`;
            }
            console.log(`✅ תצוגה סופית: ${relatedDisplay}`);
        } else if (note.related_type === 'trade_plan') {
            console.log(`🔍 מחפש תוכנית עם ID: ${note.related_id}`);
            const plan = tradePlans.find(p => p.id == note.related_id);
            console.log(`📋 תוכנית שנמצאה:`, plan);
            if (plan) {
                console.log(`🔍 מחפש טיקר עם ID: ${plan.ticker_id}`);
                const ticker = tickers.find(tick => tick.id == plan.ticker_id);
                console.log(`🎯 טיקר שנמצא:`, ticker);
                const tickerSymbol = ticker ? ticker.symbol : plan.ticker_id;
                relatedDisplay = `תוכנית - ${tickerSymbol}`;
            } else {
                relatedDisplay = `תוכנית ${note.related_id}`;
            }
            console.log(`✅ תצוגה סופית: ${relatedDisplay}`);
        }
        
        return `
        <tr>
          <td>${note.id}</td>
          <td>${relatedDisplay}</td>
          <td>${note.content ? (note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content) : '-'}</td>
          <td>${window.formatDateTime ? window.formatDateTime(note.created_at) : note.created_at}</td>
          <td>${createFileLink(note.attachment, `/api/v1/notes/files/${note.attachment}`)}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="showEditNoteModal(${JSON.stringify(note).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id}, 'הערה ${note.id}')" title="מחק">🗑️</button>
          </td>
        </tr>
      `}).join('');
    
    // עדכון ספירת רשומות
    const countElement = document.getElementById('notesCount');
    if (countElement) {
        countElement.textContent = `${notes.length} הערות`;
    }
    
    // הצגת הטבלה אם היא מוסתרת
    const section = document.getElementById('notesSection');
    const container = document.getElementById('notesContainer');
    const footer = document.querySelector('#notesSection .table-footer');
    const icon = document.querySelector('#notesSection .filter-icon');
    
    if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        if (container) container.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (icon) icon.textContent = '▲';
        localStorage.setItem('notesSectionOpen', 'true');
    }
    
    console.log('✅ טבלת הערות עודכנה בהצלחה');
}

/**
 * עדכון טבלת הערות בדף database.html עם עמודות נפרדות
 * הפונקציה מעדכנת את הטבלה עם נתוני ההערות בדף בסיס הנתונים בלבד
 * 
 * @param {Array} notes - מערך של הערות
 * 
 * @example
 * updateNotesTableDatabase(notes);
 */
function updateNotesTableDatabase(notes) {
    console.log('🔄 מעדכן טבלת הערות בדף בסיס נתונים עם', notes.length, 'הערות');
    
    // פונקציות לקבצים (מוגדרות מקומית)
    function getFileIcon(filename) {
        if (!filename) return '📄';
        
        const extension = filename.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📈';
            case 'txt':
                return '📄';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
            case 'svg':
                return '🖼️';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return '🎥';
            case 'mp3':
            case 'wav':
            case 'flac':
                return '🎵';
            case 'zip':
            case 'rar':
            case '7z':
                return '📦';
            default:
                return '📎';
        }
    }
    
    function createFileLink(filename, fileUrl) {
        if (!filename) return '-';
        
        const icon = getFileIcon(filename);
        const displayName = filename.length > 20 ? filename.substring(0, 20) + '...' : filename;
        
        return `<a href="${fileUrl}" target="_blank" class="btn btn-sm btn-outline-primary" title="${filename}">
            ${icon} ${displayName}
        </a>`;
    }
    
    const tbody = document.querySelector('#notesTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת הערות');
        return;
    }
    
    tbody.innerHTML = notes.map(note => {
        // קביעת הערכים לעמודות הנפרדות
        let accountId = '-';
        let tradeId = '-';
        let tradePlanId = '-';
        
        if (note.related_type === 'account') {
            accountId = note.related_id;
        } else if (note.related_type === 'trade') {
            tradeId = note.related_id;
        } else if (note.related_type === 'trade_plan') {
            tradePlanId = note.related_id;
        }
        
        return `
        <tr>
          <td>${note.id}</td>
          <td>${accountId}</td>
          <td>${tradeId}</td>
          <td>${tradePlanId}</td>
          <td>${note.content ? (note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content) : '-'}</td>
          <td>${window.formatDateTime ? window.formatDateTime(note.created_at) : note.created_at}</td>
          <td>${createFileLink(note.attachment, `/api/v1/notes/files/${note.attachment}`)}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="showEditNoteModal(${JSON.stringify(note).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id}, 'הערה ${note.id}')" title="מחק">🗑️</button>
          </td>
        </tr>
      `}).join('');
    
    // עדכון ספירת רשומות
    const countElement = document.getElementById('notesCount');
    if (countElement) {
        countElement.textContent = `${notes.length} הערות`;
    }
    
    // הצגת הטבלה אם היא מוסתרת
    const section = document.getElementById('notesSection');
    const container = document.getElementById('notesContainer');
    const footer = document.querySelector('#notesSection .table-footer');
    const icon = document.querySelector('#notesSection .filter-icon');
    
    if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        if (container) container.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (icon) icon.textContent = '▲';
        localStorage.setItem('notesSectionOpen', 'true');
    }
    
    console.log('✅ טבלת הערות בדף בסיס נתונים עודכנה בהצלחה');
}

/**
 * רענון טבלת הערות
 * הפונקציה מרעננת את טבלת ההערות עם נתונים עדכניים
 * 
 * @example
 * await refreshNotesTable();
 */
async function refreshNotesTable() {
    try {
        console.log('🔄 מרענן טבלת הערות...');
        const notes = await loadNotesData();
        
        // עדכון הטבלה (תלוי בדף)
        if (typeof updateNotesTable === 'function') {
            updateNotesTable(notes);
        }
        
        // עדכון סטטיסטיקות (תלוי בדף)
        if (typeof updateNotesStats === 'function') {
            const stats = calculateNotesStats(notes);
            updateNotesStats(stats);
        }
        
        console.log('✅ טבלת הערות רועננה בהצלחה');
    } catch (error) {
        console.error('❌ שגיאה ברענון טבלת הערות:', error);
    }
}

/**
 * הצגת הודעה למשתמש
 * הפונקציה מציגה הודעה למשתמש
 * 
 * @param {string} message - תוכן ההודעה
 * @param {string} type - סוג ההודעה (success/error/warning/info)
 * 
 * @example
 * showNotification('ההערה נשמרה בהצלחה!', 'success');
 */
function showNotification(message, type = 'info') {
    // בדיקה אם יש פונקציה גלובלית
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // הצגה פשוטה
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}

/**
 * קביעת אייקון לפי סוג קובץ
 * הפונקציה מחזירה אייקון מתאים לפי סיומת הקובץ
 * 
 * @param {string} filename - שם הקובץ
 * @returns {string} אייקון מתאים
 * 
 * @example
 * const icon = getFileIcon('document.pdf'); // returns '📄'
 */
function getFileIcon(filename) {
    if (!filename) return '📄';
    
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
        case 'pdf':
            return '📄';
        case 'doc':
        case 'docx':
            return '📝';
        case 'xls':
        case 'xlsx':
            return '📊';
        case 'ppt':
        case 'pptx':
            return '📈';
        case 'txt':
            return '📄';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
            return '🖼️';
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
            return '🎥';
        case 'mp3':
        case 'wav':
        case 'flac':
            return '🎵';
        case 'zip':
        case 'rar':
        case '7z':
            return '📦';
        default:
            return '📎';
    }
}

/**
 * יצירת קישור לקובץ עם אייקון
 * הפונקציה יוצרת קישור לקובץ עם אייקון מתאים
 * 
 * @param {string} filename - שם הקובץ
 * @param {string} fileUrl - כתובת הקובץ
 * @returns {string} HTML של הקישור
 * 
 * @example
 * const link = createFileLink('document.pdf', '/api/v1/notes/files/document.pdf');
 */
function createFileLink(filename, fileUrl) {
    if (!filename) return '-';
    
    const icon = getFileIcon(filename);
    const displayName = filename.length > 20 ? filename.substring(0, 20) + '...' : filename;
    
    return `<a href="${fileUrl}" target="_blank" class="btn btn-sm btn-outline-primary" title="${filename}">
        ${icon} ${displayName}
    </a>`;
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====

// פונקציות עיקריות
window.loadNotesData = loadNotesData;
window.calculateNotesStats = calculateNotesStats;
window.convertNoteStatus = convertNoteStatus;
window.convertNoteStatusToHebrew = convertNoteStatusToHebrew;
window.fillNoteEditModal = fillNoteEditModal;
window.collectNoteEditData = collectNoteEditData;
window.collectNoteAddData = collectNoteAddData;
window.createNote = createNote;
window.updateNote = updateNote;
window.deleteNote = deleteNote;
window.cancelNote = cancelNote;
window.convertNoteDataForServer = convertNoteDataForServer;

// פונקציות חדשות למילוי רשימות
window.loadAccountsForNotes = loadAccountsForNotes;
window.loadTradesForNotes = loadTradesForNotes;
window.loadTradePlansForNotes = loadTradePlansForNotes;
window.loadTickersForNotes = loadTickersForNotes;
window.populateAccountsSelect = populateAccountsSelect;
window.populateTradesSelect = populateTradesSelect;
window.populateTradePlansSelect = populateTradePlansSelect;

// פונקציות UI
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.updateNotesTable = updateNotesTable;
window.updateNotesTableDatabase = updateNotesTableDatabase;
window.refreshNotesTable = refreshNotesTable;
window.showNotification = showNotification;

// פונקציות קבצים
window.getFileIcon = getFileIcon;
window.createFileLink = createFileLink;

console.log('✅ קובץ notes.js נטען בהצלחה - פונקציות זמינות גלובלית');
