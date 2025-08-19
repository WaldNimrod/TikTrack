/**
 * ========================================
 * דף ההערות - Notes Page
 * ========================================
 * 
 * קובץ ייעודי לדף ההערות (notes.html)
 * מכיל את כל הפונקציות הספציפיות לדף זה
 * 
 * פונקציות עיקריות:
 * - loadNotesData() - טעינת נתוני הערות
 * - updateNotesTable() - עדכון טבלת ההערות
 * - פונקציות מיון וסטטיסטיקות
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים לדף ההערות
let notesData = [];

/**
 * פונקציה לטעינת נתוני הערות מהשרת
 */
async function loadNotesData() {
    try {
    console.log('🔄 טוען הערות מהשרת...');
        const response = await window.apiCall('/api/v1/notes/');
        const notes = response.data || response;
        console.log(`✅ נטענו ${notes.length} הערות`);
    
    // עדכון המשתנה הגלובלי לצורך מיון וסינון
    notesData = notes;
    
    // החלת פילטרים על הנתונים
    let filteredNotes = [...notesData];
    if (typeof window.filterDataByFilters === 'function') {
      console.log('🔄 מחיל פילטרים על נתוני ההערות...');
      filteredNotes = window.filterDataByFilters(notesData, 'notes');
      console.log('🔄 לאחר החלת פילטרים:', filteredNotes.length, 'הערות');
    }
    
    // עדכון הטבלה עם הנתונים המסוננים
    updateNotesTable(filteredNotes);
    
    return notes;
    
    } catch (error) {
    console.error('Error loading notes data:', error);
    document.querySelector('.main-content table tbody').innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
        throw error;
    }
}

/**
 * פונקציה לעדכון טבלת ההערות
 * טוענת נתונים נוספים (חשבונות, טריידים, תוכניות, טיקרים) לצורך הצגת שמות מלאים
 * ומעדכנת את הטבלה עם הנתונים המלאים
 * @param {Array} notes - מערך של הערות לעדכון
 */
async function updateNotesTable(notes) {
  console.log('🚀 === התחלת updateNotesTable בדף ההערות ===');
    console.log('🔄 מעדכן טבלת הערות עם', notes.length, 'הערות');
  
  const tbody = document.querySelector('.main-content table tbody');
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
    
    // שמירת הנתונים כמשתנים גלובליים לצורך החיפוש והסינון
    // נתונים אלה נדרשים לפונקציות החיפוש כדי למצוא סימבולים ושמות מלאים
    window.accountsData = accounts;
    window.tradesData = trades;
    window.tradePlansData = tradePlans;
    window.tickersData = tickers;
        
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
    
    let relatedClass = '';
        
        if (note.related_type === 'account') {
            console.log(`🔍 מחפש חשבון עם ID: ${note.related_id}`);
            const account = accounts.find(acc => acc.id == note.related_id);
            console.log(`📋 חשבון שנמצא:`, account);
            relatedDisplay = account ? `חשבון - ${account.name}` : `חשבון ${note.related_id}`;
      relatedClass = 'related-account';
        } else if (note.related_type === 'trade') {
            console.log(`🔍 מחפש טרייד עם ID: ${note.related_id}`);
            const trade = trades.find(t => t.id == note.related_id);
      console.log(`📋 טרייד שנמצא:`, trade);
            if (trade) {
                const ticker = tickers.find(tick => tick.id == trade.ticker_id);
        const tickerSymbol = ticker ? ticker.symbol : 'לא ידוע';
                relatedDisplay = `טרייד - ${tickerSymbol}`;
            } else {
                relatedDisplay = `טרייד ${note.related_id}`;
            }
      relatedClass = 'related-trade';
        } else if (note.related_type === 'trade_plan') {
            console.log(`🔍 מחפש תוכנית עם ID: ${note.related_id}`);
            const plan = tradePlans.find(p => p.id == note.related_id);
            console.log(`📋 תוכנית שנמצאה:`, plan);
            if (plan) {
                const ticker = tickers.find(tick => tick.id == plan.ticker_id);
        const tickerSymbol = ticker ? ticker.symbol : 'לא ידוע';
                relatedDisplay = `תוכנית - ${tickerSymbol}`;
            } else {
                relatedDisplay = `תוכנית ${note.related_id}`;
            }
      relatedClass = 'related-plan';
    } else {
      relatedDisplay = note.related_type || '-';
      relatedClass = 'related-other';
    }
    
    // קביעת אייקון הקובץ
    const fileIcon = getFileIcon(note.attachment);
    const fileLink = createFileLink(note.attachment);
    
    // תאריך יצירה
    const createdAt = note.created_at ? new Date(note.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
        
        return `
        <tr>
        <td><strong>#${note.id}</strong></td>
        <td>${note.content || '-'}</td>
        <td><span class="${relatedClass}">${relatedDisplay}</span></td>
        <td>${fileLink}</td>
        <td>${createdAt}</td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="editNote('${note.id}')" title="ערוך">
            <span class="btn-icon">✏️</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteNote('${note.id}')" title="מחק">✕</button>
          </td>
        </tr>
    `;
  }).join('');
    
    // עדכון ספירת רשומות
  const countElement = document.querySelector('.main-content .table-count');
    if (countElement) {
        countElement.textContent = `${notes.length} הערות`;
    }
    
  // עדכון סטטיסטיקות הטבלה
  window.updateTableStats('notes');
  
  console.log('✅ עדכון טבלת הערות הושלם');
}

/**
 * פונקציה לקבלת אייקון קובץ
 */
function getFileIcon(filename) {
  if (!filename) return '';
  
  const extension = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'txt': '📄',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️'
  };
  
  return iconMap[extension] || '📎';
}

/**
 * פונקציה ליצירת קישור לקובץ
 */
function createFileLink(filename) {
    if (!filename) return '-';
    
    const icon = getFileIcon(filename);
  return `<a href="/uploads/notes/${filename}" target="_blank" class="file-link">${icon} ${filename}</a>`;
}

/**
 * פונקציות נוספות
 */
function editNote(noteId) {
  console.log('עריכת הערה:', noteId);
  // כאן יוכנס קוד לעריכת הערה
}

function deleteNote(noteId) {
  console.log('מחיקת הערה:', noteId);
  // כאן יוכנס קוד למחיקת הערה
}

// הוספת הפונקציות לגלובל
window.loadNotesData = loadNotesData;
window.updateNotesTable = updateNotesTable;
window.editNote = editNote;
window.deleteNote = deleteNote;

// הגדרת הפונקציה updateGridFromComponent לדף ההערות
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (notes) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // קריאה לפונקציה הגלובלית
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'notes');
};
