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
  } catch (error) {
    console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
  }

  tbody.innerHTML = notes.map(note => {
    console.log(`🔍 מעבד הערה ${note.id}:`, note);

    // קביעת CSS class לפי סוג הקשר
    let relatedClass = '';
    let relatedIcon = '';
    let relatedDisplay = '';

    if (note.related_type_id == 1) { // account
      relatedClass = 'related-account';
      relatedIcon = '🏦';
      // הצגת שם החשבון (עד 15 תווים)
      const account = accounts.find(acc => acc.id == note.related_id);
      const accountName = account ? account.name.substring(0, 15) : 'חשבון';
      relatedDisplay = `${accountName}`;
    } else if (note.related_type_id == 2) { // trade
      relatedClass = 'related-trade';
      relatedIcon = '📈';
      // מציאת הטרייד והסימבול שלו
      const trade = trades.find(t => t.id == note.related_id);
      if (trade && trade.ticker_id) {
        const ticker = tickers.find(tick => tick.id == trade.ticker_id);
        const symbol = ticker ? ticker.symbol : trade.ticker_id;
        relatedDisplay = `${symbol}`;
      } else {
        relatedDisplay = `${note.related_id}`;
      }
    } else if (note.related_type_id == 3) { // trade_plan
      relatedClass = 'related-plan';
      relatedIcon = '📋';
      // מציאת התוכנית והסימבול שלה
      const plan = tradePlans.find(p => p.id == note.related_id);
      if (plan && plan.ticker_id) {
        const ticker = tickers.find(tick => tick.id == plan.ticker_id);
        const symbol = ticker ? ticker.symbol : plan.ticker_id;
        relatedDisplay = `${symbol}`;
      } else {
        relatedDisplay = `${note.related_id}`;
      }
    } else if (note.related_type_id == 4) { // ticker
      relatedClass = 'related-ticker';
      relatedIcon = '🎯';
      // מציאת הטיקר והסימבול שלו
      const ticker = tickers.find(tick => tick.id == note.related_id);
      const symbol = ticker ? ticker.symbol : note.related_id;
      relatedDisplay = `${symbol}`;
    } else {
      relatedClass = 'related-other';
      relatedIcon = '📌';
      relatedDisplay = note.related_type_name || '-';
    }

    // קביעת אייקון הקובץ
    const fileIcon = getFileIcon(note.attachment);
    const fileLink = createFileLink(note.attachment);

    // תאריך יצירה
    const createdAt = note.created_at ? new Date(note.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

    return `
        <tr>
        <td style="padding: 0;">
          <div class="related-object-cell ${relatedClass}">
            ${relatedIcon} ${relatedDisplay}
          </div>
        </td>
        <td>${note.content ? (note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content) : '-'}</td>
        <td>${createdAt}</td>
        <td>${fileLink}</td>
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

  // ניקוי סלקטים
  const selects = ['noteTradePlanId', 'noteTradeId', 'noteAccountId'];
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      select.style.display = 'none';
      select.innerHTML = `<option value="">בחר...</option>`;
    }
  });

  // ניקוי קובץ מצורף
  document.getElementById('noteAttachment').value = '';
  const preview = document.getElementById('noteAttachmentPreview');
  if (preview) preview.style.display = 'none';

  // פתיחת המודל
  const modal = new bootstrap.Modal(document.getElementById('addNoteModal'));
  modal.show();
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

  // פתיחת המודל
  const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
  modal.show();
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

      data.forEach(item => {
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

      data.forEach(item => {
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
  const content = document.getElementById('noteContent').value;
  const attachment = document.getElementById('noteAttachment').files[0];

  // קבלת סוג הקשר
  const selectedRelationType = document.querySelector('input[name="noteRelationType"]:checked');
  if (!selectedRelationType) {
    alert('נא לבחור סוג אובייקט מקושר');
    return;
  }

  let relatedTypeId = '';
  let relatedId = '';

  switch (selectedRelationType.value) {
    case 'trade_plan':
      relatedTypeId = '3';
      relatedId = document.getElementById('noteTradePlanId').value;
      break;
    case 'trade':
      relatedTypeId = '2';
      relatedId = document.getElementById('noteTradeId').value;
      break;
    case 'account':
      relatedTypeId = '1';
      relatedId = document.getElementById('noteAccountId').value;
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
    const response = await fetch(`/api/notes/${noteId}`, {
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

// הגדרת הפונקציה updateGridFromComponent לדף ההערות
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (notes) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // קריאה לפונקציה הגלובלית
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'notes');
};
