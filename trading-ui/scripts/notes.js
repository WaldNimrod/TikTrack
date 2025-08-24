// ===== קובץ JavaScript פשוט לדף הערות =====
/*
 * Notes.js - Notes Page Management
 * =================================
 * 
 * This file contains all notes management functionality for the TikTrack application.
 * It handles notes CRUD operations, table updates, and user interactions.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * 
 * Table Mapping:
 * - Uses 'notes' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/notes.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// פונקציות בסיסיות
function openNoteDetails(id) {
  console.log('🔄 openNoteDetails נקראה');
  showAddNoteModal();
}

function editNote(id) {
  console.log('🔄 editNote נקראה עבור ID:', id);
  showEditNoteModal(id);
}

function deleteNote(id) {
  console.log('🔄 deleteNote נקראה עבור ID:', id);
  if (confirm('האם אתה בטוח שברצונך למחוק הערה זו?')) {
    deleteNoteFromServer(id);
  }
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
  console.log('🔄 toggleTopSection נקראה');
  const topSection = document.querySelector('.top-section');

  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }
  console.log('✅ top-section נמצא:', topSection);

  const sectionBody = topSection.querySelector('.section-body');
  const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.style.display = 'block';
    } else {
      sectionBody.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('notesTopSectionHidden', !isCollapsed);
  }
}

function toggleMainSection() {
  console.log('🔄 toggleMainSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);
  const notesSection = contentSections[0]; // הסקשן הראשון - הערות

  if (!notesSection) {
    console.error('❌ לא נמצא סקשן הערות');
    return;
  }
  console.log('✅ סקשן הערות נמצא:', notesSection);

  const sectionBody = notesSection.querySelector('.section-body');
  const toggleBtn = notesSection.querySelector('button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.style.display = 'block';
    } else {
      sectionBody.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('notesMainSectionHidden', !isCollapsed);
  }
}



// פונקציה לשחזור מצב הסגירה
function restoreNotesSectionState() {
  // שחזור מצב top-section (התראות וסיכום)
  const topCollapsed = localStorage.getItem('notesTopSectionHidden') === 'true';
  const topSection = document.querySelector('.top-section');

  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && topCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב סקשן ההערות
  const notesCollapsed = localStorage.getItem('notesMainSectionHidden') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const notesSection = contentSections[0];

  if (notesSection) {
    const sectionBody = notesSection.querySelector('.section-body');
    const toggleBtn = notesSection.querySelector('button[onclick="toggleMainSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && notesCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
}

// פונקציות נוספות
function resetAllFiltersAndReloadData() {
  console.log('איפוס פילטרים');
}

// הגדרת הפונקציות כגלובליות
window.openNoteDetails = openNoteDetails;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreNotesSectionState = restoreNotesSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// פונקציה לטעינת נתונים
async function loadNotesData() {
  console.log('🔄 loadNotesData נקראה');

  try {
    // קריאה לשרת לקבלת נתוני הערות
    const response = await fetch('/api/v1/notes/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const notes = responseData.data || responseData;
    console.log('✅ נטענו', notes.length, 'הערות מהשרת');

    // בדיקה אם הנתונים ריקים או לא תקינים
    if (!notes || notes.length === 0) {
      console.warn('⚠️ לא נמצאו הערות בשרת');
      const tbody = document.querySelector('#notesTable tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">
              <div style="padding: 20px;">
                <h5>📝 אין הערות</h5>
                <p>לא נמצאו הערות במערכת</p>
                <button class="btn btn-sm btn-primary" onclick="openNoteDetails()">הוסף הערה ראשונה</button>
              </div>
            </td>
          </tr>
        `;
      }
      return;
    }

    // טעינת נתונים נוספים (חשבונות, טריידים, תוכניות, טיקרים)
    console.log('🔄 טוען נתונים נוספים...');
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    const accounts = (accountsResponse.data || accountsResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
    const trades = (tradesResponse.data || tradesResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
    const tradePlans = (tradePlansResponse.data || tradePlansResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
    const tickers = (tickersResponse.data || tickersResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);

    // עדכון הטבלה עם הנתונים הנוספים
    updateNotesTable(notes, accounts, trades, tradePlans, tickers);

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים:', error);

    // הצגת הודעת שגיאה בטבלה
    const tbody = document.querySelector('#notesTable tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <div style="padding: 20px;">
              <h5>❌ שגיאה בטעינת נתונים</h5>
              <p>לא ניתן לטעון נתונים מהשרת</p>
              <p class="small text-muted">${error.message}</p>
              <button class="btn btn-sm btn-primary" onclick="loadNotesData()">נסה שוב</button>
            </div>
          </td>
        </tr>
      `;
    }

    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתונים מהשרת', 'error');
    } else {
      alert('שגיאה בטעינת נתונים מהשרת: ' + error.message);
    }
  }
}

// פונקציה לעדכון הטבלה
function updateNotesTable(notes, accounts = [], trades = [], tradePlans = [], tickers = []) {
  console.log('🔄 updateNotesTable נקראה עם', notes.length, 'הערות');
  console.log('🔄 נתונים נוספים:', { accounts: accounts.length, trades: trades.length, tradePlans: tradePlans.length, tickers: tickers.length });

  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody בטבלה');
    return;
  }

  if (!notes || notes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          <div style="padding: 20px;">
            <h5>📝 אין הערות</h5>
            <p>לא נמצאו הערות במערכת</p>
            <button class="btn btn-sm btn-primary" onclick="openNoteDetails()">הוסף הערה ראשונה</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // בניית שורות הטבלה
  const rows = notes.map(note => {
    const date = note.created_at ? new Date(note.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
    const content = note.content || 'ללא תוכן';
    const attachment = note.attachment || '-';

    // קביעת סימבול ואובייקט מקושר (כמו בעמוד התראות)
    let symbolDisplay = '-';
    let relatedDisplay = 'כללי';
    let relatedIcon = '🌐';
    let relatedClass = 'related-general';

    if (note.related_type_id && note.related_id) {
      switch (note.related_type_id) {
        case 1: // חשבון
          const account = accounts.find(a => a.id === note.related_id);
          if (account) {
            const name = account.name || account.account_name || 'לא מוגדר';
            relatedDisplay = `${name}`;
          } else {
            relatedDisplay = `חשבון ${note.related_id}`;
          }
          relatedIcon = '🏦';
          relatedClass = 'related-account';
          symbolDisplay = ''; // חשבון - ריק לחלוטין
          break;
        case 2: // טרייד
          const trade = trades.find(t => t.id === note.related_id);
          if (trade) {
            const date = trade.created_at || trade.date;
            const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
            const side = trade.side || 'לא מוגדר';
            relatedDisplay = `טרייד | ${side} | ${formattedDate}`;
            // קביעת סימבול לטרייד
            if (trade.ticker_id) {
              const ticker = tickers.find(tick => tick.id === trade.ticker_id);
              symbolDisplay = ticker ? ticker.symbol : '-';
            } else {
              symbolDisplay = '-';
            }
          } else {
            relatedDisplay = `טרייד | לא מוגדר | לא מוגדר`;
            symbolDisplay = '-';
          }
          relatedIcon = '📈';
          relatedClass = 'related-trade';
          break;
        case 3: // תוכנית
          const plan = tradePlans.find(p => p.id === note.related_id);
          if (plan) {
            const date = plan.created_at || plan.date;
            const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
            const side = plan.side || 'לא מוגדר';
            relatedDisplay = `תוכנית | ${side} | ${formattedDate}`;
            // קביעת סימבול לתוכנית
            if (plan.ticker_id) {
              const ticker = tickers.find(tick => tick.id === plan.ticker_id);
              symbolDisplay = ticker ? ticker.symbol : '-';
            } else {
              symbolDisplay = '-';
            }
          } else {
            relatedDisplay = `תוכנית | לא מוגדר | לא מוגדר`;
            symbolDisplay = '-';
          }
          relatedIcon = '📋';
          relatedClass = 'related-plan';
          break;
        case 4: // טיקר
          const ticker = tickers.find(t => t.id === note.related_id);
          if (ticker) {
            relatedDisplay = ticker.symbol;
            symbolDisplay = ticker.symbol;
          } else {
            relatedDisplay = `טיקר ${note.related_id}`;
            symbolDisplay = `טיקר ${note.related_id}`;
          }
          relatedIcon = '📊';
          relatedClass = 'related-ticker';
          break;
        default:
          symbolDisplay = `אובייקט ${note.related_id}`;
          relatedDisplay = `אובייקט ${note.related_id}`;
          relatedIcon = '❓';
          relatedClass = 'related-other';
      }
    }

    // הוספת האייקון לפני האובייקט
    relatedDisplay = relatedIcon + relatedDisplay;

    // קביעת סוג לפילטר
    let typeForFilter = 'כללי';
    if (note.related_type_id) {
      switch (note.related_type_id) {
        case 1: typeForFilter = 'חשבון'; break;
        case 2: typeForFilter = 'טרייד'; break;
        case 3: typeForFilter = 'תוכנית'; break;
        case 4: typeForFilter = 'טיקר'; break;
        default: typeForFilter = 'כללי';
      }
    }

    return `
      <tr>
        <td><span class="symbol-text">${symbolDisplay}</span></td>
        <td style="padding: 0;" data-type="${typeForFilter}">
          <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right; min-width: 150px;">
            ${relatedDisplay}
          </div>
        </td>
        <td>${content}</td>
        <td>${attachment}</td>
        <td data-date="${note.created_at}">${date}</td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="editNote('${note.id}')" title="ערוך">
            <span class="btn-icon">✏️</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteNote('${note.id}')" title="מחק">X</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
  console.log('✅ טבלת ההערות עודכנה בהצלחה');
}

// פונקציה לעדכון גלובלי של הטבלה (נדרשת עבור הפילטרים)
function updateGridFromComponent(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
  console.log('🔄 updateGridFromComponent נקראה עבור הערות');
  console.log('פרמטרים:', { selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm });

  // כרגע רק נטען מחדש את הנתונים
  loadNotesData();
}

// פונקציות מודלים
function showAddNoteModal() {
  console.log('🔄 showAddNoteModal נקראה');

  // איפוס הטופס
  document.getElementById('addNoteForm').reset();

  // ניקוי ולידציה
  clearNoteValidationErrors();

  // הסרת קלאסים של ולידציה
  const fields = document.querySelectorAll('.is-valid, .is-invalid');
  fields.forEach(field => {
    field.classList.remove('is-valid', 'is-invalid');
  });

  // טעינת נתונים למודל
  loadModalData();

  // בחירת טיקר כברירת מחדל אחרי טעינת הנתונים
  setTimeout(() => {
    document.getElementById('noteRelationTicker').checked = true;
    // טעינת אפשרויות לטיקר
    const tickerRadio = document.getElementById('noteRelationTicker');
    if (tickerRadio && window.modalTickers) {
      populateSelect('noteRelatedObjectSelect', window.modalTickers, 'symbol', '');
    }
  }, 200);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('addNoteModal'));
  modal.show();
}

function showEditNoteModal(noteId) {
  console.log('🔄 showEditNoteModal נקראה עבור ID:', noteId);

  // טעינת נתוני ההערה
  loadNoteData(noteId);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
  modal.show();
}

async function loadNoteData(noteId) {
  try {
    const response = await fetch(`/api/v1/notes/${noteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const note = await response.json();
    console.log('✅ נטענו נתוני הערה:', note);

    // מילוי הטופס
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editNoteContent').value = note.content || '';

    // בחירת סוג הקשר
    const relationType = note.related_type_id;
    if (relationType) {
      document.querySelector(`input[name="editNoteRelationType"][value="${relationType}"]`).checked = true;
      onNoteRelationTypeChange();

      // בחירת האובייקט המקושר
      setTimeout(() => {
        document.getElementById('editNoteRelatedObjectSelect').value = note.related_id;
      }, 100);
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני הערה:', error);
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('שגיאה בטעינת נתוני הערה', 'error');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני הערה', 'error');
    }
  }
}

async function loadModalData() {
  try {
    console.log('🔄 טוען נתונים למודלים...');

    // טעינת נתונים במקביל
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/database_v2/accounts').then(r => r.json()).catch(() => []),
      fetch('/api/database_v2/trades').then(r => r.json()).catch(() => []),
      fetch('/api/database_v2/trade_plans').then(r => r.json()).catch(() => []),
      fetch('/api/database_v2/tickers').then(r => r.json()).catch(() => [])
    ]);

    const accounts = Array.isArray(accountsResponse) ? accountsResponse : [];
    const trades = Array.isArray(tradesResponse) ? tradesResponse : [];
    const tradePlans = Array.isArray(tradePlansResponse) ? tradePlansResponse : [];
    const tickers = Array.isArray(tickersResponse) ? tickersResponse : [];

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל:', error);
    // המשך עם מערכים ריקים
    updateRadioButtons([], [], [], []);
  }
}

/**
 * עדכון רדיו באטונים
 */
function updateRadioButtons(accounts, trades, tradePlans, tickers) {
  // עדכון רדיו באטון לחשבונות
  const accountRadio = document.getElementById('noteRelationAccount');
  const editAccountRadio = document.getElementById('editNoteRelationAccount');

  if (accountRadio) {
    accountRadio.addEventListener('change', () => {
      populateSelect('noteRelatedObjectSelect', accounts, 'name', 'חשבון');
    });
  }

  if (editAccountRadio) {
    editAccountRadio.addEventListener('change', () => {
      populateSelect('editNoteRelatedObjectSelect', accounts, 'name', 'חשבון');
    });
  }

  // עדכון רדיו באטון לטריידים
  const tradeRadio = document.getElementById('noteRelationTrade');
  const editTradeRadio = document.getElementById('editNoteRelationTrade');

  if (tradeRadio) {
    tradeRadio.addEventListener('change', () => {
      populateSelect('noteRelatedObjectSelect', trades, 'id', 'טרייד');
    });
  }

  if (editTradeRadio) {
    editTradeRadio.addEventListener('change', () => {
      populateSelect('editNoteRelatedObjectSelect', trades, 'id', 'טרייד');
    });
  }

  // עדכון רדיו באטון לתכנונים
  const planRadio = document.getElementById('noteRelationTradePlan');
  const editPlanRadio = document.getElementById('editNoteRelationTradePlan');

  if (planRadio) {
    planRadio.addEventListener('change', () => {
      populateSelect('noteRelatedObjectSelect', tradePlans, 'id', 'תכנון');
    });
  }

  if (editPlanRadio) {
    editPlanRadio.addEventListener('change', () => {
      populateSelect('editNoteRelatedObjectSelect', tradePlans, 'id', 'תכנון');
    });
  }

  // עדכון רדיו באטון לטיקרים
  const tickerRadio = document.getElementById('noteRelationTicker');
  const editTickerRadio = document.getElementById('editNoteRelationTicker');

  if (tickerRadio) {
    tickerRadio.addEventListener('change', () => {
      populateSelect('noteRelatedObjectSelect', tickers, 'symbol', '');
    });
  }

  if (editTickerRadio) {
    editTickerRadio.addEventListener('change', () => {
      populateSelect('editNoteRelatedObjectSelect', tickers, 'symbol', '');
    });
  }
}

/**
 * מילוי select עם נתונים
 */
function populateSelect(selectId, data, field, prefix = '') {
  const select = document.getElementById(selectId);
  if (!select) return;

  console.log(`🔄 מילוי ${selectId} עם ${data.length} פריטים מסוג ${prefix}`);
  if (data.length > 0) {
    console.log('📋 דוגמה לפריט ראשון:', data[0]);
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;

    // יצירת טקסט מותאם לכל סוג אובייקט
    let displayText = '';

    if (prefix === 'חשבון') {
      // עבור חשבון: שם החשבון + מטבע
      const name = item.name || item.account_name || 'לא מוגדר';
      const currency = item.currency || 'ILS';
      displayText = `${name} (${currency})`;
    } else if (prefix === 'טרייד') {
      // עבור טרייד: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else {
      // עבור טיקר: רק סימבול
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });
}

function onNoteRelationTypeChange() {
  // פונקציה זו לא נדרשת יותר - הוחלפה ב-updateRadioButtons
  console.log('🔄 onNoteRelationTypeChange - פונקציה זו הוחלפה ב-updateRadioButtons');
}

// פונקציות שמירה ומחיקה
async function saveNote() {
  console.log('🔄 saveNote נקראה');

  // איסוף נתונים מהטופס
  const content = document.getElementById('noteContent').value.trim();
  const relationType = document.querySelector('input[name="noteRelationType"]:checked')?.value;
  const relatedId = document.getElementById('noteRelatedObjectSelect').value;
  const attachment = document.getElementById('noteAttachment').files[0];

  // ולידציה
  if (!content) {
    showNoteValidationError('contentError', 'תוכן הערה הוא שדה חובה');
    return;
  }

  if (!relationType) {
    showNoteValidationError('relationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    return;
  }

  if (!relatedId) {
    showNoteValidationError('relatedObjectError', 'יש לבחור אובייקט לשיוך');
    return;
  }

  clearNoteValidationErrors();

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relationType);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch('/api/v1/notes/', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ הערה נשמרה בהצלחה:', result);

    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('הערה נשמרה בהצלחה!', 'success');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('הערה נשמרה בהצלחה!', 'success');
    }

    // סגירת המודל וטעינה מחדש
    const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
    modal.hide();

    loadNotesData();

  } catch (error) {
    console.error('❌ שגיאה בשמירת הערה:', error);
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('שגיאה בשמירת הערה', 'error');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בשמירת הערה', 'error');
    }
  }
}

async function updateNoteFromModal() {
  console.log('🔄 updateNoteFromModal נקראה');

  // איסוף נתונים מהטופס
  const noteId = document.getElementById('editNoteId').value;
  const content = document.getElementById('editNoteContent').value.trim();
  const relationType = document.querySelector('input[name="editNoteRelationType"]:checked')?.value;
  const relatedId = document.getElementById('editNoteRelatedObjectSelect').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // ולידציה
  if (!content) {
    showNoteValidationError('editContentError', 'תוכן הערה הוא שדה חובה');
    return;
  }

  if (!relationType) {
    showNoteValidationError('editRelationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    return;
  }

  if (!relatedId) {
    showNoteValidationError('editRelatedObjectError', 'יש לבחור אובייקט לשיוך');
    return;
  }

  clearNoteValidationErrors();

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relationType);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(`/api/v1/notes/${noteId}`, {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ הערה עודכנה בהצלחה:', result);

    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('הערה עודכנה בהצלחה!', 'success');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('הערה עודכנה בהצלחה!', 'success');
    }

    // סגירת המודל וטעינה מחדש
    const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
    modal.hide();

    loadNotesData();

  } catch (error) {
    console.error('❌ שגיאה בעדכון הערה:', error);
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('שגיאה בעדכון הערה', 'error');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון הערה', 'error');
    }
  }
}

async function deleteNoteFromServer(noteId) {
  try {
    const response = await fetch(`/api/v1/notes/${noteId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ הערה נמחקה בהצלחה');

    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('הערה נמחקה בהצלחה!', 'success');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('הערה נמחקה בהצלחה!', 'success');
    }

    loadNotesData();

  } catch (error) {
    console.error('❌ שגיאה במחיקת הערה:', error);
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('שגיאה במחיקת הערה', 'error');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה במחיקת הערה', 'error');
    }
  }
}

// פונקציות ולידציה
function showNoteValidationError(fieldId, message) {
  const errorElement = document.getElementById(fieldId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  // הוספת קלאס is-invalid לשדה הקשור
  const field = getFieldByErrorId(fieldId);
  if (field) {
    field.classList.add('is-invalid');
  }
}

function clearNoteValidationErrors() {
  const errorElements = document.querySelectorAll('.invalid-feedback');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });

  // הסרת קלאס is-invalid מכל השדות
  const fields = document.querySelectorAll('.is-invalid');
  fields.forEach(field => {
    field.classList.remove('is-invalid');
  });
}

function getFieldByErrorId(errorId) {
  switch (errorId) {
    case 'contentError':
      return document.getElementById('noteContent');
    case 'editContentError':
      return document.getElementById('editNoteContent');
    case 'relationTypeError':
      return document.querySelector('input[name="noteRelationType"]:checked')?.closest('.col-md-6');
    case 'editRelationTypeError':
      return document.querySelector('input[name="editNoteRelationType"]:checked')?.closest('.col-md-6');
    case 'relatedObjectError':
      return document.getElementById('noteRelatedObjectSelect');
    case 'editRelatedObjectError':
      return document.getElementById('editNoteRelatedObjectSelect');
    default:
      return null;
  }
}

window.loadNotesData = loadNotesData;
window.updateNotesTable = updateNotesTable;
window.updateGridFromComponent = updateGridFromComponent;
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.deleteNoteFromServer = deleteNoteFromServer;
window.onNoteRelationTypeChange = onNoteRelationTypeChange;
window.setupNoteValidationEvents = setupNoteValidationEvents;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');

  // שחזור מצב הסגירה
  restoreNotesSectionState();

  // טעינת נתונים
  loadNotesData();

  // הוספת ולידציה בזמן אמת
  setupNoteValidationEvents();

  // שחזור מצב סידור
  restoreSortState();

  console.log('דף הערות נטען בהצלחה');
});

// פונקציה להגדרת אירועי ולידציה
function setupNoteValidationEvents() {
  // ולידציה לשדה תוכן
  const contentField = document.getElementById('noteContent');
  if (contentField) {
    contentField.addEventListener('input', function () {
      if (this.value.trim()) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('contentError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
      }
    });
  }

  // ולידציה לשדה תוכן בעריכה
  const editContentField = document.getElementById('editNoteContent');
  if (editContentField) {
    editContentField.addEventListener('input', function () {
      if (this.value.trim()) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('editContentError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
      }
    });
  }

  // ולידציה לבחירת אובייקט
  const relatedObjectSelect = document.getElementById('noteRelatedObjectSelect');
  if (relatedObjectSelect) {
    relatedObjectSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('relatedObjectError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        const errorElement = document.getElementById('relatedObjectError');
        if (errorElement) {
          errorElement.textContent = 'יש לבחור אובייקט לשיוך';
          errorElement.style.display = 'block';
        }
      }
    });
  }

  // ולידציה לבחירת אובייקט בעריכה
  const editRelatedObjectSelect = document.getElementById('editNoteRelatedObjectSelect');
  if (editRelatedObjectSelect) {
    editRelatedObjectSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('editRelatedObjectError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        const errorElement = document.getElementById('editRelatedObjectError');
        if (errorElement) {
          errorElement.textContent = 'יש לבחור אובייקט לשיוך';
          errorElement.style.display = 'block';
        }
      }
    });
  }
}

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת הערות
 * @param {number} columnIndex - אינדקס העמודה לסידור
 * 
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת ID
 * sortTable(1); // סידור לפי עמודת תוכן
 * sortTable(3); // סידור לפי עמודת תאריך יצירה
 * 
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */
function sortTable(columnIndex) {
  console.log(`🔄 sortTable נקראה עבור עמודה ${columnIndex}`);

  if (typeof window.sortTable === 'function') {
    window.sortTable(
      'notes',
      columnIndex,
      window.notesData || [],
      updateNotesTable
    );
  } else {
    console.error('❌ sortTable function not found in main.js');
  }
}

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {
  console.log('🔄 Restoring sort state for notes table');

  if (typeof window.restoreAnyTableSort === 'function') {
    window.restoreAnyTableSort('notes', window.notesData || [], updateNotesTable);
  } else {
    console.error('❌ restoreAnyTableSort function not found in main.js');
  }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;

