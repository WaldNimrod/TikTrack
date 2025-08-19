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
    const response = await window.apiCall('/api/notes');
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
 * מעדכנת את הטבלה עם הנתונים המלאים
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

  // טעינת נתונים נוספים לצורך הצגת סימבולים
  let accounts = [];
  let trades = [];
  let tradePlans = [];
  let tickers = [];

  try {
    // טעינת נתונים במקביל
    console.log('🔄 טוען נתונים נוספים...');
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      window.apiCall('/api/v1/accounts/'),
      window.apiCall('/api/trades'),
      window.apiCall('/api/v1/trade_plans/'),
      window.apiCall('/api/tickers')
    ]);

    accounts = accountsResponse.data || accountsResponse;
    trades = tradesResponse.data || tradesResponse;
    tradePlans = tradePlansResponse.data || tradePlansResponse;
    tickers = tickersResponse.data || tickersResponse;

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);
    console.log(`🔍 טיקרים שנטענו:`, tickers.map(t => ({ id: t.id, symbol: t.symbol })));
  } catch (error) {
    console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
  }

  tbody.innerHTML = notes.map(note => {
    console.log(`🔍 מעבד הערה ${note.id}:`, note);
    console.log(`🔍 related_type_id: ${note.related_type_id}, related_id: ${note.related_id}`);

    // קביעת תוכן האובייקט המקושר - בדיוק כמו בדף התראות
    let relatedIcon = '';
    let relatedDisplay = '';
    let symbolDisplay = '';
    let relatedClass = '';

    if (note.related_type_id == 1) { // account
      console.log(`🏦 מעבד חשבון ID: ${note.related_id}`);
      console.log(`🏦 חשבונות זמינים:`, accounts.length, accounts.map(a => ({ id: a.id, name: a.name })));
      relatedClass = 'related-account';
      relatedIcon = '🏦';
      const account = accounts.find(acc => acc.id == note.related_id);
      console.log(`🏦 חשבון שנמצא:`, account);
      const accountName = account ? account.name.substring(0, 12) : 'חשבון';
      relatedDisplay = `חשבון: ${accountName}`;
      symbolDisplay = ''; // ריק לחשבון
      console.log(`🏦 תוצאה: relatedDisplay="${relatedDisplay}", symbolDisplay="${symbolDisplay}"`);
    } else if (note.related_type_id == 2) { // trade
      console.log(`📈 מעבד טרייד ID: ${note.related_id}`);
      console.log(`📈 טריידים זמינים:`, trades.length, trades.map(t => ({ id: t.id, ticker_id: t.ticker_id })));
      relatedClass = 'related-trade';
      relatedIcon = '📈';
      const trade = trades.find(t => t.id == note.related_id);
      console.log(`📈 טרייד שנמצא:`, trade);
      if (trade && trade.ticker_id) {
        const ticker = tickers.find(tick => tick.id == trade.ticker_id);
        console.log(`📈 טיקר עבור טרייד:`, ticker);
        const symbol = ticker ? ticker.symbol : trade.ticker_id;
        relatedDisplay = `${symbol}`;
        symbolDisplay = symbol;
      } else {
        relatedDisplay = `${note.related_id}`;
        symbolDisplay = `${note.related_id}`;
      }
      console.log(`📈 תוצאה: relatedDisplay="${relatedDisplay}", symbolDisplay="${symbolDisplay}"`);
    } else if (note.related_type_id == 3) { // trade_plan
      relatedClass = 'related-plan';
      relatedIcon = '📋';
      const plan = tradePlans.find(p => p.id == note.related_id);
      if (plan && plan.ticker_id) {
        const ticker = tickers.find(tick => tick.id == plan.ticker_id);
        const symbol = ticker ? ticker.symbol : plan.ticker_id;
        relatedDisplay = `${symbol}`;
        symbolDisplay = symbol;
      } else {
        relatedDisplay = `${note.related_id}`;
        symbolDisplay = `${note.related_id}`;
      }
    } else if (note.related_type_id == 4) { // ticker
      console.log(`🎯 מעבד טיקר ID: ${note.related_id}`);
      console.log(`🎯 טיקרים זמינים:`, tickers.length, tickers.map(t => ({ id: t.id, symbol: t.symbol })));
      relatedClass = 'related-ticker';
      relatedIcon = '🎯';
      const ticker = tickers.find(tick => tick.id == note.related_id);
      console.log(`🎯 טיקר שנמצא:`, ticker);
      const symbol = ticker ? ticker.symbol : note.related_id;
      relatedDisplay = `${symbol}`;
      symbolDisplay = symbol;
      console.log(`🎯 תוצאה: relatedDisplay="${relatedDisplay}", symbolDisplay="${symbolDisplay}"`);
    } else {
      relatedClass = 'related-other';
      relatedIcon = '📌';
      relatedDisplay = `אובייקט ${note.related_id}`;
      symbolDisplay = `אובייקט ${note.related_id}`;
    }

    // קביעת אייקון הקובץ
    const fileIcon = getFileIcon(note.attachment);
    const fileLink = createFileLink(note.attachment);

    // תאריך יצירה
    const createdAt = note.created_at ? new Date(note.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

    console.log(`✅ תוצאה סופית עבור הערה ${note.id}: symbolDisplay="${symbolDisplay}", relatedDisplay="${relatedDisplay}", relatedClass="${relatedClass}"`);

    return `
        <tr>
        <td><strong>${symbolDisplay}</strong></td>
        <td style="padding: 0;">
          <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right;">
            ${relatedDisplay}
          </div>
        </td>
        <td title="${formatContentForDisplay(note.content)}">${formatContentForDisplay(note.content)}</td>
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

  // עדכון סטטיסטיקות הטבלה (אם הפונקציה קיימת)
  if (typeof window.updateTableStats === 'function') {
    window.updateTableStats('notes');
  }

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
  const shortName = filename.length > 12 ? filename.substring(0, 12) + '...' : filename;
  return `<a href="/uploads/notes/${filename}" target="_blank" class="file-link" title="${filename}">${icon} ${shortName}</a>`;
}

/**
 * פונקציה להמרת HTML לטקסט פשוט והגבלה ל-50 תווים
 */
function formatContentForDisplay(content) {
  if (!content) return '-';

  // המרת HTML לטקסט פשוט והגבלה ל-50 תווים
  const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
}

/**
 * פונקציות נוספות
 */

/**
 * פונקציה לפתיחת מודל הוספת הערה
 */
function showAddNoteModal() {
  console.log('פתיחת מודל הוספת הערה');

  // ניקוי הטופס
  document.getElementById('noteContentEditor').innerHTML = '';
  document.getElementById('noteContent').value = '';

  // ניקוי רדיו באטונים
  const radioButtons = document.querySelectorAll('input[name="noteRelationType"]');
  radioButtons.forEach(radio => radio.checked = false);

  // ניקוי הסלקט המאוחד
  const unifiedSelect = document.getElementById('noteRelatedObjectSelect');
  if (unifiedSelect) {
    unifiedSelect.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';
  }

  // ניקוי קובץ מצורף
  document.getElementById('noteAttachment').value = '';
  const preview = document.getElementById('noteAttachmentPreview');
  if (preview) preview.style.display = 'none';

  // הוספת event listeners לרדיו באטונים
  setupRadioButtonListeners();

  // פתיחת המודל
  const modal = new bootstrap.Modal(document.getElementById('addNoteModal'));
  modal.show();
}

/**
 * פונקציה להגדרת event listeners לרדיו באטונים
 */
function setupRadioButtonListeners() {
  const radioButtons = document.querySelectorAll('input[name="noteRelationType"]');

  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      // עדכון הסלקט המאוחד
      if (this.checked) {
        loadRelatedObjectsForUnifiedSelect(this.value);
      }
    });
  });
}

/**
 * פונקציה לטעינת נתונים לסלקט מאוחד
 */
async function loadRelatedObjectsForUnifiedSelect(relationType) {
  const select = document.getElementById('noteRelatedObjectSelect');
  if (!select) return;

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  try {
    let data = [];
    let endpoint = '';
    let tickers = [];

    // טעינת טיקרים לצורך הצגת סימבולים
    try {
      const tickersResponse = await window.apiCall('/api/tickers');
      tickers = tickersResponse.data || tickersResponse;
    } catch (error) {
      console.warn('שגיאה בטעינת טיקרים:', error);
    }

    switch (relationType) {
      case 'trade_plan':
        endpoint = '/api/v1/trade_plans/';
        break;
      case 'trade':
        endpoint = '/api/trades';
        break;
      case 'account':
        endpoint = '/api/v1/accounts/';
        break;
      case 'ticker':
        endpoint = '/api/tickers';
        break;
    }

    if (endpoint) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      // סינון רק רשומות עם סטטוס פתוח
      const filteredData = data.filter(item => {
        if (relationType === 'account') {
          return item.status === 'open';
        } else if (relationType === 'trade') {
          return item.status === 'open';
        } else if (relationType === 'trade_plan') {
          return item.status === 'open';
        }
        return true;
      });

      filteredData.forEach(item => {
        let displayText = '';
        switch (relationType) {
          case 'account':
            displayText = item.name;
            break;
          case 'trade':
            // טרייד: [סימבול],[צד],[סוג],[תאריך יצירה]-[id]
            const tradeTicker = tickers.find(t => t.id == item.ticker_id);
            const symbol = tradeTicker ? tradeTicker.symbol : 'לא ידוע';
            const side = item.side === 'buy' ? 'קנייה' : item.side === 'sell' ? 'מכירה' : item.side;
            const type = item.type === 'swing' ? 'סווינג' : item.type === 'investment' ? 'השקעה' : item.type;
            const tradeDate = item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : 'לא ידוע';
            displayText = `${symbol},${side},${type},${tradeDate}-${item.id}`;
            break;
          case 'trade_plan':
            // תכנון: [סימבול],[תאריך יצירה]-[id]
            const planTicker = tickers.find(t => t.id == item.ticker_id);
            const planSymbol = planTicker ? planTicker.symbol : 'לא ידוע';
            const planDate = item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : 'לא ידוע';
            displayText = `${planSymbol},${planDate}-${item.id}`;
            break;
          case 'ticker':
            displayText = item.symbol;
            break;
        }

        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = displayText;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('שגיאה בטעינת נתונים לסלקט:', error);
  }
}

/**
 * פונקציה לפתיחת מודל עריכת הערה
 */
function editNote(noteId) {
  console.log('עריכת הערה:', noteId);

  // מציאת ההערה בנתונים
  const note = notesData.find(n => n.id == noteId);
  if (!note) {
    alert('הערה לא נמצאה');
    return;
  }

  // מילוי הטופס
  document.getElementById('editNoteId').value = note.id;
  document.getElementById('editNoteContentEditor').innerHTML = note.content || '';
  document.getElementById('editNoteContent').value = note.content || '';

  // הגדרת סוג הקשר
  let relationType = '';
  let relationId = '';

  switch (note.related_type_id) {
    case 1: // חשבון
      relationType = 'account';
      relationId = note.related_id;
      break;
    case 2: // טרייד
      relationType = 'trade';
      relationId = note.related_id;
      break;
    case 3: // תכנון
      relationType = 'trade_plan';
      relationId = note.related_id;
      break;
    case 4: // טיקר
      relationType = 'ticker';
      relationId = note.related_id;
      break;
  }

  // בחירת רדיו באטון מתאים
  const radioButton = document.querySelector(`input[name="editNoteRelationType"][value="${relationType}"]`);
  if (radioButton) {
    radioButton.checked = true;
    // טעינת אובייקטים מקושרים
    loadEditRelatedObjects(relationType, relationId);
  }

  // הצגת קובץ נוכחי אם יש
  const preview = document.getElementById('editNoteAttachmentPreview');
  if (note.attachment) {
    const icon = getFileIcon(note.attachment);
    const info = document.getElementById('editNoteAttachmentInfo');
    if (info) {
      info.innerHTML = `<small class="text-muted">קובץ נוכחי: ${icon} ${note.attachment}</small>`;
    }
    if (preview) preview.style.display = 'block';
  } else {
    if (preview) preview.style.display = 'none';
  }

  // הוספת event listeners לרדיו באטונים של עריכה
  setupEditRadioButtonListeners();

  // פתיחת המודל
  const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
  modal.show();
}

/**
 * פונקציה להגדרת event listeners לרדיו באטונים של עריכה
 */
function setupEditRadioButtonListeners() {
  const radioButtons = document.querySelectorAll('input[name="editNoteRelationType"]');

  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      // הסתרת כל הסלקטים
      const selects = ['editNoteTradePlanId', 'editNoteTradeId', 'editNoteAccountId'];
      selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
          select.style.display = 'none';
        }
      });

      // הצגת הסלקט המתאים
      if (this.checked) {
        let selectId = '';
        switch (this.value) {
          case 'trade_plan':
            selectId = 'editNoteTradePlanId';
            break;
          case 'trade':
            selectId = 'editNoteTradeId';
            break;
          case 'account':
            selectId = 'editNoteAccountId';
            break;
        }

        if (selectId) {
          const select = document.getElementById(selectId);
          if (select) {
            select.style.display = 'block';
            // טעינת נתונים לסלקט
            loadRelatedObjectsForEditSelect(this.value, selectId);
          }
        }
      }
    });
  });
}

/**
 * פונקציה לטעינת נתונים לסלקט עריכה
 */
async function loadRelatedObjectsForEditSelect(relationType, selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = '<option value="">בחר...</option>';

  try {
    let data = [];
    let endpoint = '';

    switch (relationType) {
      case 'trade_plan':
        endpoint = '/api/v1/trade_plans/';
        break;
      case 'trade':
        endpoint = '/api/trades';
        break;
      case 'account':
        endpoint = '/api/v1/accounts/';
        break;
    }

    if (endpoint) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      // סינון רק רשומות עם סטטוס פתוח
      const filteredData = data.filter(item => {
        if (relationType === 'account') {
          return item.status === 'open';
        } else if (relationType === 'trade') {
          return item.status === 'open';
        } else if (relationType === 'trade_plan') {
          return item.status === 'open';
        }
        return true;
      });

      filteredData.forEach(item => {
        let displayText = '';
        switch (relationType) {
          case 'account':
            displayText = item.name;
            break;
          case 'trade':
            displayText = `טרייד ${item.id}`;
            break;
          case 'trade_plan':
            displayText = `תכנון ${item.id}`;
            break;
        }

        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = displayText;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('שגיאה בטעינת נתונים לסלקט עריכה:', error);
  }
}

/**
 * פונקציה למחיקת הערה
 */
function deleteNote(noteId) {
  console.log('מחיקת הערה:', noteId);

  if (confirm('האם אתה בטוח שברצונך למחוק הערה זו?')) {
    deleteNoteFromServer(noteId);
  }
}

/**
 * פונקציה לטעינת אובייקטים מקושרים למודל הוספה
 */
async function loadRelatedObjects(relatedTypeId) {
  const relatedIdSelect = document.getElementById('relatedId');
  relatedIdSelect.innerHTML = '<option value="">בחר אובייקט...</option>';

  if (!relatedTypeId) return;

  try {
    let data = [];
    let endpoint = '';

    switch (relatedTypeId) {
      case '1': // חשבונות
        endpoint = '/api/v1/accounts/';
        break;
      case '2': // טריידים
        endpoint = '/api/trades';
        break;
      case '3': // תכנונים
        endpoint = '/api/v1/trade_plans/';
        break;
      case '4': // טיקרים
        endpoint = '/api/tickers';
        break;
    }

    if (endpoint) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      // סינון רק רשומות עם סטטוס פתוח
      const filteredData = data.filter(item => {
        if (relatedTypeId === '1') { // חשבונות
          return item.status === 'open';
        } else if (relatedTypeId === '2') { // טריידים
          return item.status === 'open';
        } else if (relatedTypeId === '3') { // תכנונים
          return item.status === 'open';
        } else if (relatedTypeId === '4') { // טיקרים
          return item.status === 'active';
        }
        return true;
      });

      filteredData.forEach(item => {
        let displayText = '';
        switch (relatedTypeId) {
          case '1': // חשבונות
            displayText = item.name;
            break;
          case '2': // טריידים
            displayText = `טרייד ${item.id}`;
            break;
          case '3': // תכנונים
            displayText = `תכנון ${item.id}`;
            break;
          case '4': // טיקרים
            displayText = item.symbol;
            break;
        }

        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = displayText;
        relatedIdSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('שגיאה בטעינת אובייקטים מקושרים:', error);
  }
}

/**
 * פונקציה לטעינת אובייקטים מקושרים למודל עריכה
 */
async function loadRelatedObjectsForEdit(relatedTypeId, selectedId) {
  const relatedIdSelect = document.getElementById('editRelatedId');
  relatedIdSelect.innerHTML = '<option value="">בחר אובייקט...</option>';

  if (!relatedTypeId) return;

  try {
    let data = [];
    let endpoint = '';

    switch (relatedTypeId) {
      case 1: // חשבונות
        endpoint = '/api/v1/accounts/';
        break;
      case 2: // טריידים
        endpoint = '/api/trades';
        break;
      case 3: // תכנונים
        endpoint = '/api/v1/trade_plans/';
        break;
      case 4: // טיקרים
        endpoint = '/api/tickers';
        break;
    }

    if (endpoint) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      // סינון רק רשומות עם סטטוס פתוח
      const filteredData = data.filter(item => {
        if (relatedTypeId === 1) { // חשבונות
          return item.status === 'open';
        } else if (relatedTypeId === 2) { // טריידים
          return item.status === 'open';
        } else if (relatedTypeId === 3) { // תכנונים
          return item.status === 'open';
        } else if (relatedTypeId === 4) { // טיקרים
          return item.status === 'active';
        }
        return true;
      });

      filteredData.forEach(item => {
        let displayText = '';
        switch (relatedTypeId) {
          case 1: // חשבונות
            displayText = item.name;
            break;
          case 2: // טריידים
            displayText = `טרייד ${item.id}`;
            break;
          case 3: // תכנונים
            displayText = `תכנון ${item.id}`;
            break;
          case 4: // טיקרים
            displayText = item.symbol;
            break;
        }

        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = displayText;
        if (item.id == selectedId) {
          option.selected = true;
        }
        relatedIdSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('שגיאה בטעינת אובייקטים מקושרים:', error);
  }
}

/**
 * פונקציה לטעינת אובייקטים מקושרים למודל עריכה (עבור המודל הקיים)
 */
async function loadEditRelatedObjects(relationType, selectedId) {
  try {
    let data = [];
    let endpoint = '';
    let selectId = '';

    switch (relationType) {
      case 'trade_plan':
        endpoint = '/api/v1/trade_plans/';
        selectId = 'editNoteTradePlanId';
        break;
      case 'trade':
        endpoint = '/api/trades';
        selectId = 'editNoteTradeId';
        break;
      case 'account':
        endpoint = '/api/v1/accounts/';
        selectId = 'editNoteAccountId';
        break;
    }

    if (endpoint && selectId) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      const select = document.getElementById(selectId);
      if (select) {
        select.style.display = 'block';
        select.innerHTML = '<option value="">בחר...</option>';

        data.forEach(item => {
          let displayText = '';
          switch (relationType) {
            case 'trade_plan':
              displayText = `תכנון ${item.id}`;
              break;
            case 'trade':
              displayText = `טרייד ${item.id}`;
              break;
            case 'account':
              displayText = item.name;
              break;
          }

          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = displayText;
          if (item.id == selectedId) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('שגיאה בטעינת אובייקטים מקושרים:', error);
  }
}

/**
 * פונקציה לשמירת הערה חדשה
 */
async function saveNote() {
  console.log('🔄 התחלת שמירת הערה...');
  const content = document.getElementById('noteContentEditor').innerHTML;
  const attachment = document.getElementById('noteAttachment').files[0];
  console.log('📝 תוכן הערה:', content);

  // קבלת סוג הקשר
  const selectedRelationType = document.querySelector('input[name="noteRelationType"]:checked');
  console.log('🔗 סוג קשר שנבחר:', selectedRelationType ? selectedRelationType.value : 'לא נבחר');
  if (!selectedRelationType) {
    alert('נא לבחור סוג אובייקט מקושר');
    return;
  }

  let relatedTypeId = '';
  let relatedId = '';

  switch (selectedRelationType.value) {
    case 'trade_plan':
      relatedTypeId = '3';
      relatedId = document.getElementById('noteRelatedObjectSelect').value;
      break;
    case 'trade':
      relatedTypeId = '2';
      relatedId = document.getElementById('noteRelatedObjectSelect').value;
      break;
    case 'account':
      relatedTypeId = '1';
      relatedId = document.getElementById('noteRelatedObjectSelect').value;
      break;
    case 'ticker':
      relatedTypeId = '4';
      relatedId = document.getElementById('noteRelatedObjectSelect').value;
      break;
  }

  console.log('🔗 relatedTypeId:', relatedTypeId, 'relatedId:', relatedId);

  if (!content || content.trim() === '' || content === '<br>' || !relatedId) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relatedTypeId);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch('/api/notes', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('הערה נשמרה בהצלחה:', result);

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
      modal.hide();

      // רענון הטבלה
      loadNotesData();

      alert('הערה נשמרה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בשמירת הערה:', error);
    alert('שגיאה בשמירת הערה');
  }
}

/**
 * פונקציה לעדכון הערה
 */
async function updateNote() {
  const noteId = document.getElementById('editNoteId').value;
  const content = document.getElementById('editNoteContent').value;
  const relatedTypeId = document.getElementById('editRelatedType').value;
  const relatedId = document.getElementById('editRelatedId').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  if (!content || !relatedTypeId || !relatedId) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relatedTypeId);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('הערה עודכנה בהצלחה:', result);

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
      modal.hide();

      // רענון הטבלה
      loadNotesData();

      alert('הערה עודכנה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בעדכון הערה:', error);
    alert('שגיאה בעדכון הערה');
  }
}

/**
 * פונקציה לעדכון הערה מהמודל הקיים
 */
async function updateNoteFromModal() {
  const noteId = document.getElementById('editNoteId').value;
  const content = document.getElementById('editNoteContent').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // קבלת סוג הקשר
  const selectedRelationType = document.querySelector('input[name="editNoteRelationType"]:checked');
  if (!selectedRelationType) {
    alert('נא לבחור סוג אובייקט מקושר');
    return;
  }

  let relatedTypeId = '';
  let relatedId = '';

  switch (selectedRelationType.value) {
    case 'trade_plan':
      relatedTypeId = '3';
      relatedId = document.getElementById('editNoteTradePlanId').value;
      break;
    case 'trade':
      relatedTypeId = '2';
      relatedId = document.getElementById('editNoteTradeId').value;
      break;
    case 'account':
      relatedTypeId = '1';
      relatedId = document.getElementById('editNoteAccountId').value;
      break;
  }

  if (!content || !relatedId) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relatedTypeId);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('הערה עודכנה בהצלחה:', result);

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
      modal.hide();

      // רענון הטבלה
      loadNotesData();

      alert('הערה עודכנה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בעדכון הערה:', error);
    alert('שגיאה בעדכון הערה');
  }
}

/**
 * פונקציה למחיקת הערה מהשרת
 */
async function deleteNoteFromServer(noteId) {
  try {
    const response = await fetch(`/api/v1/notes/${noteId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('הערה נמחקה בהצלחה');

      // רענון הטבלה
      loadNotesData();

      alert('הערה נמחקה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה במחיקת הערה:', error);
    alert('שגיאה במחיקת הערה');
  }
}

// הוספת הפונקציות לגלובל
window.loadNotesData = loadNotesData;
window.updateNotesTable = updateNotesTable;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.showAddNoteModal = showAddNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;

// פונקציה לפתיחת פרטי הערה (הוספת הערה)
function openNoteDetails(id) {
  console.log('פתיחת פרטי הערה:', id);
  // פתיחת מודל הוספת הערה
  if (typeof showAddNoteModal === 'function') {
    showAddNoteModal();
  } else {
    console.error('showAddNoteModal function not found');
  }
}

window.openNoteDetails = openNoteDetails;

// פונקציות לעיצוב טקסט
function formatText(command) {
  // מציאת העורך הפעיל
  let editor = null;

  // בדיקה איזה עורך פעיל כרגע
  const addEditor = document.getElementById('noteContentEditor');
  const editEditor = document.getElementById('editNoteContentEditor');

  if (addEditor && addEditor === document.activeElement) {
    editor = addEditor;
  } else if (editEditor && editEditor === document.activeElement) {
    editor = editEditor;
  } else {
    // אם אף עורך לא פעיל, ננסה למצוא עורך פתוח
    if (addEditor && addEditor.offsetParent !== null) {
      editor = addEditor;
    } else if (editEditor && editEditor.offsetParent !== null) {
      editor = editEditor;
    }
  }

  if (!editor) {
    console.warn('לא נמצא עורך טקסט פעיל');
    return;
  }

  editor.focus();

  switch (command) {
    case 'bold':
      document.execCommand('bold', false, null);
      break;
    case 'italic':
      document.execCommand('italic', false, null);
      break;
    case 'underline':
      document.execCommand('underline', false, null);
      break;
    case 'strikethrough':
      document.execCommand('strikethrough', false, null);
      break;
    case 'h3':
      document.execCommand('formatBlock', false, '<h3>');
      break;
    case 'h4':
      document.execCommand('formatBlock', false, '<h4>');
      break;
    case 'ul':
      document.execCommand('insertUnorderedList', false, null);
      break;
    case 'ol':
      document.execCommand('insertOrderedList', false, null);
      break;
    case 'alignLeft':
      document.execCommand('justifyLeft', false, null);
      break;
    case 'alignCenter':
      document.execCommand('justifyCenter', false, null);
      break;
    case 'alignRight':
      document.execCommand('justifyRight', false, null);
      break;
    case 'directionLtr':
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('insertHTML', false, '<span style="direction: ltr; text-align: left;">' + window.getSelection().toString() + '</span>');
      break;
    case 'directionRtl':
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('insertHTML', false, '<span style="direction: rtl; text-align: right;">' + window.getSelection().toString() + '</span>');
      break;
    case 'link':
      const url = prompt('הכנס URL לקישור:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
      break;
    case 'color':
      const color = prompt('הכנס קוד צבע (למשל: #FF0000):');
      if (color) {
        document.execCommand('foreColor', false, color);
      }
      break;
  }

  // עדכון השדה הנסתר
  syncEditorContent();
}

// פונקציה להעתקת תוכן מהעורך לשדה הנסתר
function syncEditorContent() {
  const addEditor = document.getElementById('noteContentEditor');
  const editEditor = document.getElementById('editNoteContentEditor');
  const addTextarea = document.getElementById('noteContent');
  const editTextarea = document.getElementById('editNoteContent');

  if (addEditor && addTextarea) {
    addTextarea.value = addEditor.innerHTML;
    console.log('🔄 עדכון תוכן הוספה:', addEditor.innerHTML);
  }

  if (editEditor && editTextarea) {
    editTextarea.value = editEditor.innerHTML;
    console.log('🔄 עדכון תוכן עריכה:', editEditor.innerHTML);
  }
}

/**
 * פונקציה לקביעת צבע טקסט
 */
function setTextColor(color) {
  // מציאת העורך הפעיל
  let editor = null;

  // בדיקה איזה עורך פעיל כרגע
  const addEditor = document.getElementById('noteContentEditor');
  const editEditor = document.getElementById('editNoteContentEditor');

  if (addEditor && addEditor === document.activeElement) {
    editor = addEditor;
  } else if (editEditor && editEditor === document.activeElement) {
    editor = editEditor;
  } else {
    // אם אף עורך לא פעיל, ננסה למצוא עורך פתוח
    if (addEditor && addEditor.offsetParent !== null) {
      editor = addEditor;
    } else if (editEditor && editEditor.offsetParent !== null) {
      editor = editEditor;
    }
  }

  if (!editor) {
    console.warn('לא נמצא עורך טקסט פעיל');
    return;
  }

  editor.focus();
  document.execCommand('foreColor', false, color);
  syncEditorContent();
}

window.formatText = formatText;
window.syncEditorContent = syncEditorContent;
window.setTextColor = setTextColor;

// הגדרת הפונקציה updateGridFromComponent לדף ההערות
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (notes) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // בדיקה שהפונקציה הגלובלית קיימת
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    // קריאה לפונקציה הגלובלית
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'notes');
  } else {
    console.error('❌ window.updateGridFromComponentGlobal is not defined');
    // קריאה ישירה לפונקציית הטעינה
    if (typeof window.loadNotesData === 'function') {
      window.loadNotesData();
    }
  }
};
