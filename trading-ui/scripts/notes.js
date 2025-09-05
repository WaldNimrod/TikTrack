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
function openNoteDetails(_id) {
  showAddNoteModal();
}

function editNote(_id) {
  showEditNoteModal(_id);
}

function deleteNote(id) {
  // שימוש במערכת הגלובלית למחיקה
  if (typeof window.showDeleteWarning === 'function') {
    window.showDeleteWarning('notes', id, 'הערה', async () => {
      // קריאה לפונקציה המקומית לאחר אישור
      await confirmDeleteNote(id);
    }, null);
  } else {
    // גיבוי למקרה שהמערכת הגלובלית לא זמינה
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'מחיקת הערה',
        'האם אתה בטוח שברצונך למחוק הערה זו?\n\nפעולה זו אינה ניתנת לביטול.',
        async () => {
          await confirmDeleteNote(id);
        },
        () => {
        },
      );
    } else {
      // fallback אחרון - confirm רגיל
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'מחיקת הערה',
          'האם אתה בטוח שברצונך למחוק הערה זו?',
          () => confirmDeleteNote(id),
        );
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'מחיקת הערה',
            'האם אתה בטוח שברצונך למחוק הערה זו?',
            () => confirmDeleteNote(id),
          );
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק הערה זו?');
          if (confirmed) {
            confirmDeleteNote(id);
          }
        }
      }
    }
  }
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
  const topSection = document.querySelector('.top-section');

  if (!topSection) {
    handleElementNotFound('toggleTopSection', 'לא נמצא top-section');
    return;
  }

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

  const contentSections = document.querySelectorAll('.content-section');

  const notesSection = contentSections[0]; // הסקשן הראשון - הערות

  if (!notesSection) {
    handleElementNotFound('toggleMainSection', 'לא נמצא סקשן הערות');
    return;
  }

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

// הגדרת הפונקציות כגלובליות
window.openNoteDetails = openNoteDetails;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreNotesSectionState = restoreNotesSectionState;

// פונקציה לטעינת נתונים
async function loadNotesData() {
  // loadNotesData נקראה

  try {
    // קריאה לשרת לקבלת נתוני הערות
    // קריאה לשרת לקבלת נתוני הערות
    const response = await fetch('/api/v1/notes/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const notes = responseData.data || responseData;
    // נתונים התקבלו מהשרת

    // בדיקה אם הנתונים ריקים או לא תקינים
    if (!notes || notes.length === 0) {
      // console.warn('⚠️ לא נמצאו הערות בשרת');
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

    // פונקציה לטעינת נתונים עם טיפול בשגיאות
    const loadDataSafely = async (url, _dataName) => {
      try {
        const innerResponse = await fetch(url);
        if (!innerResponse.ok) {
          // console.warn(`⚠️ שגיאה בטעינת ${_dataName}: ${innerResponse.status}`);
          return [];
        }
        const data = await innerResponse.json();
        if (data.status === 'error') {
          // console.warn(`⚠️ שגיאה ב-API ${_dataName}: ${data.error?.message || 'שגיאה לא ידועה'}`);
          return [];
        }
        return Array.isArray(data.data) ? data.data : [];
      } catch {
        // console.warn(`⚠️ שגיאה בטעינת ${_dataName}:`);
        return [];
      }
    };

    const [accounts, trades, tradePlans, tickers] = await Promise.all([
      loadDataSafely('/api/v1/accounts/', 'חשבונות'),
      loadDataSafely('/api/v1/trades/', 'טריידים'),
      loadDataSafely('/api/v1/trade_plans/', 'תוכניות'),
      loadDataSafely('/api/v1/tickers/', 'טיקרים'),
    ]);

    // שמירת הנתונים ב-window לסינון
    window.notesData = notes;
    window.accountsData = accounts;
    window.tradesData = trades;
    window.tradePlansData = tradePlans;
    window.tickersData = tickers;

    // עדכון הטבלה עם הנתונים הנוספים
    // עדכון הטבלה עם הערות
    updateNotesTable(notes, accounts, trades, tradePlans, tickers);
    // loadNotesData הושלם בהצלחה

  } catch (error) {
    handleDataLoadError(error, 'טעינת נתונים');

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

    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים מהשרת: ' + error.message);
    } else {
      handleDataLoadError(error, 'טעינת נתונים מהשרת');
    }
  }
}

// פונקציה לעדכון הטבלה
function updateNotesTable(notes, accounts = [], trades = [], tradePlans = [], tickers = []) {
  // updateNotesTable נקראה עם הערות
  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    handleElementNotFound('updateNotesTable', 'לא נמצא tbody בטבלה');
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

    // הצגת תוכן כטקסט פשוט בלבד
    let contentDisplay = note.content || 'ללא תוכן';
    // הסרת תגי HTML אם יש
    contentDisplay = contentDisplay.replace(/<[^>]*>/g, '');
    // הגבלה ל-100 תווים
    if (contentDisplay.length > 100) {
      contentDisplay = contentDisplay.substring(0, 100) + '...';
    }

    // הצגת קובץ עם אייקון ו-10 תווים ראשונים
    let attachmentDisplay = '-';
    if (note.attachment) {
      const fileName = note.attachment;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let fileIcon = '📄'; // ברירת מחדל

      // קביעת אייקון לפי סוג הקובץ
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
        fileIcon = '🖼️';
      } else if (['pdf'].includes(fileExtension)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileIcon = '📘';
      } else if (['txt'].includes(fileExtension)) {
        fileIcon = '📄';
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        fileIcon = '📊';
      }

      // הצגת אייקון + 10 תווים ראשונים
      const shortName = fileName.length > 10 ? fileName.substring(0, 10) + '...' : fileName;
      attachmentDisplay = `${fileIcon} ${shortName}`;
    }

    // קביעת סימבול ואובייקט מקושר (כמו בעמוד התראות)
    let symbolDisplay = '-';
    let relatedDisplay = 'כללי';
    let relatedIcon = '🌐';
    let relatedClass = 'related-general';

    if (note.related_type_id && note.related_id) {
      switch (note.related_type_id) {
      case 1: { // חשבון
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
      }
      case 2: { // טרייד
        const trade = trades.find(t => t.id === note.related_id);
        if (trade) {
          const tradeDate = trade.created_at || trade.date;
          const formattedDate = tradeDate ? new Date(tradeDate).toLocaleDateString('he-IL') : 'לא מוגדר';
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
          relatedDisplay = 'טרייד | לא מוגדר | לא מוגדר';
          symbolDisplay = '-';
        }
        relatedIcon = '📈';
        relatedClass = 'related-trade';
        break;
      }
      case 3: { // תוכנית
        const plan = tradePlans.find(p => p.id === note.related_id);
        if (plan) {
          const planDate = plan.created_at || plan.date;
          const formattedDate = planDate ? new Date(planDate).toLocaleDateString('he-IL') : 'לא מוגדר';
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
          relatedDisplay = 'תוכנית | לא מוגדר | לא מוגדר';
          symbolDisplay = '-';
        }
        relatedIcon = '📋';
        relatedClass = 'related-plan';
        break;
      }
      case 4: { // טיקר
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
      }
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

    // יצירת קישור לסימבול (אם יש סימבול)
    let symbolLink = symbolDisplay;
    if (note.related_type_id === 1) {
      // עבור חשבונות - הצג רק אייקון קישור
      symbolLink = `<a href='#' onclick='viewLinkedItemsForNote(${note.id})' ` +
        'class=\'symbol-link\' title=\'עבור לדף החשבון\'>🔗</a>';
    } else if (symbolDisplay && symbolDisplay !== '-' && symbolDisplay !== '') {
      // עבור טיקרים, טריידים ותוכניות - הצג אייקון קישור + סימבול
      symbolLink = `<a href='#' onclick='showTickerPage("${symbolDisplay}")' ` +
        `class='symbol-link' title='עבור לדף הטיקר'>🔗</a> ${symbolDisplay}`;
    }

    return `
      <tr onclick='viewNote(${note.id})' style='cursor: pointer;'>
        <td class='ticker-cell'><span class='symbol-text'>${symbolLink}</span></td>
        <td style='padding: 0;' data-type='${typeForFilter}'>
          <div class='related-object-cell ${relatedClass}' 
            style='justify-content: flex-start; text-align: right; min-width: 150px;'>
            ${relatedDisplay}
          </div>
        </td>
        <td>${contentDisplay}</td>
        <td>${attachmentDisplay}</td>
        <td data-date='${note.created_at}'>${date}</td>
        <td class='actions-cell' onclick='event.stopPropagation();'>
          <button class='btn btn-sm btn-info' 
            onclick='window.showLinkedItemsModal && window.showLinkedItemsModal([], "note", ${note.id})' 
            title='צפה בפריטים מקושרים'>
            🔗
          </button>
          <button class='btn btn-sm btn-secondary' 
            onclick='editNote("${note.id}")' 
            title='ערוך הערה'>
            ✏️
          </button>
          <button class='btn btn-sm btn-danger' 
            onclick='deleteNote("${note.id}")' 
            title='מחק הערה'>
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
  // עדכון table-count ו-info-summary
  updateNotesSummary(notes);
}

// פונקציה לעדכון סיכום הערות
function updateNotesSummary(notes) {
  // שמירת המספר המקורי לחיפוש
  window.originalNotesCount = notes.length;

  // עדכון table-count
  const tableCountElement = document.querySelector('.table-count');
  if (tableCountElement) {
    tableCountElement.textContent = `${notes.length} הערות`;
  }

  // עדכון info-summary
  const totalNotesElement = document.getElementById('totalNotes');
  const activeNotesElement = document.getElementById('activeNotes');
  const recentNotesElement = document.getElementById('recentNotes');
  const totalLinksElement = document.getElementById('totalLinks');

  if (totalNotesElement) {
    totalNotesElement.textContent = notes.length;
  }

  if (activeNotesElement) {
    // הערות פעילות = כל ההערות (כרגע)
    activeNotesElement.textContent = notes.length;
  }

  if (recentNotesElement) {
    // הערות חדשות = הערות מה-7 ימים האחרונים
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at);
      return noteDate >= oneWeekAgo;
    });

    recentNotesElement.textContent = recentNotes.length;
  }

  if (totalLinksElement) {
    // סה"כ קישורים = הערות עם related_id
    const linkedNotes = notes.filter(note => note.related_id && note.related_type_id);
    totalLinksElement.textContent = linkedNotes.length;
  }

}

// פונקציה לעדכון גלובלי של הטבלה (נדרשת עבור הפילטרים)
function updateGridFromComponent(
  _selectedStatuses,
  _selectedTypes,
  _selectedAccounts,
  _selectedDateRange,
  _searchTerm,
) {
  // כרגע רק נטען מחדש את הנתונים
  loadNotesData();
}

// פונקציות מודלים
function showAddNoteModal() {
  // איפוס הטופס
  document.getElementById('addNoteForm').reset();

  // ניקוי עורך הטקסט
  setEditorContent('', 'add');

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
  // ניקוי דגלים
  window.removeAttachmentFlag = false;
  window.replaceAttachmentFlag = false;

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

    const responseData = await response.json();
    // חילוץ הנתונים מהמבנה הנכון
    const note = responseData.data || responseData;
    // מילוי הטופס
    document.getElementById('editNoteId').value = note.id;
    setEditorContent(note.content || '', 'edit');

    // הצגת קובץ מצורף נוכחי
    displayCurrentAttachment(note.attachment);

    // בחירת סוג הקשר
    const relationType = note.related_type_id;
    if (relationType) {
      // בחירת הרדיו באטון הנכון
      const radioButton = document.querySelector(`input[name="editNoteRelationType"][value="${relationType}"]`);
      if (radioButton) {
        radioButton.checked = true;
        // טעינת נתונים למודל אם עוד לא נטענו
        if (typeof window.loadModalData === 'function') {
          await window.loadModalData();
        }

        // מילוי הרשימה הנכונה לפי סוג הקשר
        await populateEditSelectByType(relationType, note.related_id);
      } else {
        handleElementNotFound('populateEditSelectByType', `לא נמצא רדיו באטון עבור ערך: ${relationType}`);
      }
    } else {
      // console.warn('⚠️ אין סוג קשר מוגדר');
    }

  } catch {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני הערה');
    }
  }
}

async function loadModalData() {
  try {
    // טעינת נתונים במקביל
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
    ]);

    const accounts = Array.isArray(accountsResponse.data) ? accountsResponse.data : [];
    const trades = Array.isArray(tradesResponse.data) ? tradesResponse.data : [];
    const tradePlans = Array.isArray(tradePlansResponse.data) ? tradePlansResponse.data : [];
    const tickers = Array.isArray(tickersResponse.data) ? tickersResponse.data : [];

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

    // הגדרת נתונים ראשוניים (ברירת מחדל לטיקר)
    populateSelect('noteRelatedObjectSelect', tickers, 'symbol', '');
    populateSelect('editNoteRelatedObjectSelect', tickers, 'symbol', '');

  } catch {
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
  if (!select) {return;}

  if (data.length > 0) {
    // Data available for population
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
  // הפונקציה הזו נקראת בעת שינוי רדיו באטון
  // הלוגיקה האמיתית נמצאת ב-updateRadioButtons
  // אבל אנחנו צריכים אותה לעבוד גם בעת טעינת נתונים לעריכה
}

async function populateEditSelectByType(relationType, selectedId) {
  try {
    let data = [];
    let displayField = '';
    let placeholder = '';

    switch (parseInt(relationType)) {
    case 1: { // חשבון
      const accountsResponse = await fetch('/api/v1/accounts/');
      const accountsData = await accountsResponse.json();
      data = Array.isArray(accountsData.data) ? accountsData.data : [];
      displayField = 'name';
      placeholder = 'חשבון';
      break;
    }
    case 2: { // טרייד
      const tradesResponse = await fetch('/api/v1/trades/');
      const tradesData = await tradesResponse.json();
      data = Array.isArray(tradesData.data) ? tradesData.data : [];
      displayField = 'id';
      placeholder = 'טרייד';
      break;
    }
    case 3: { // תוכנית
      const plansResponse = await fetch('/api/v1/trade_plans/');
      const plansData = await plansResponse.json();
      data = Array.isArray(plansData.data) ? plansData.data : [];
      displayField = 'id';
      placeholder = 'תוכנית';
      break;
    }
    case 4: { // טיקר
      const tickersResponse = await fetch('/api/v1/tickers/');
      const tickersData = await tickersResponse.json();
      data = Array.isArray(tickersData.data) ? tickersData.data : [];
      displayField = 'symbol';
      placeholder = 'טיקר';
      break;
    }
    }

    // מילוי הרשימה
    populateSelect('editNoteRelatedObjectSelect', data, displayField, placeholder);

    // בחירת הערך הנכון
    if (selectedId) {
      setTimeout(() => {
        const select = document.getElementById('editNoteRelatedObjectSelect');
        if (select) {
          select.value = selectedId;
        }
      }, 100);
    }

  } catch {
    // שגיאה במילוי רשימה לעריכה
  }
}

/**
 * וולידציה מקיפה של טופס הערה חדשה
 * @param {string} content - תוכן ההערה
 * @param {string} relationType - סוג הקשר
 * @param {string} relatedId - מזהה האובייקט הקשור
 * @param {File} attachment - קובץ מצורף (אופציונלי)
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateNoteForm(content, relationType, relatedId, attachment) {
  let isValid = true;

  // ניקוי שגיאות קודמות
  clearNoteValidationErrors();

  // וולידציה של תוכן
  if (!content) {
    window.showValidationWarning('contentError', 'תוכן הערה הוא שדה חובה');
    isValid = false;
  } else if (content.length < 1) {
    window.showValidationWarning('contentError', 'תוכן ההערה חייב להכיל לפחות תו אחד');
    isValid = false;
  } else if (content.length > 10000) {
    window.showValidationWarning('contentError', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    isValid = false;
  } else {
    // Content validation passed
  }

  // וולידציה של סוג קשר
  if (!relationType) {
    window.showValidationWarning('relationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    isValid = false;
  }

  // וולידציה של אובייקט קשור
  if (!relatedId) {
    window.showValidationWarning('relatedObjectError', 'יש לבחור אובייקט לשיוך');
    isValid = false;
  } else if (isNaN(parseInt(relatedId)) || parseInt(relatedId) <= 0) {
    window.showValidationWarning('relatedObjectError', 'מזהה אובייקט לא תקין');
    isValid = false;
  }

  // וולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      window.showValidationWarning('attachmentError', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      isValid = false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(attachment.type)) {
      window.showValidationWarning('attachmentError', 'סוג קובץ לא נתמך. מותרים: תמונות (JPG, PNG, GIF, BMP, WebP) ו-PDF בלבד');
      isValid = false;
    }
  }

  return isValid;
}

/**
 * וולידציה מקיפה של טופס עריכת הערה
 * @param {string} content - תוכן ההערה
 * @param {string} relationType - סוג הקשר
 * @param {string} relatedId - מזהה האובייקט הקשור
 * @param {File} attachment - קובץ מצורף (אופציונלי)
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateEditNoteForm(content, relationType, relatedId, attachment) {
  let isValid = true;

  // ניקוי שגיאות קודמות
  clearNoteValidationErrors();

  // וולידציה של תוכן
  if (!content) {
    window.showValidationWarning('editContentError', 'תוכן הערה הוא שדה חובה');
    isValid = false;
  } else if (content.length < 1) {
    window.showValidationWarning('editContentError', 'תוכן ההערה חייב להכיל לפחות תו אחד');
    isValid = false;
  } else if (content.length > 10000) {
    window.showValidationWarning('editContentError', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    isValid = false;
  }

  // וולידציה של סוג קשר
  if (!relationType) {
    window.showValidationWarning('editRelationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    isValid = false;
  }

  // וולידציה של אובייקט קשור
  if (!relatedId) {
    window.showValidationWarning('editRelatedObjectError', 'יש לבחור אובייקט לשיוך');
    isValid = false;
  } else if (isNaN(parseInt(relatedId)) || parseInt(relatedId) <= 0) {
    window.showValidationWarning('editRelatedObjectError', 'מזהה אובייקט לא תקין');
    isValid = false;
  }

  // וולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      window.showValidationWarning('editAttachmentError', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      isValid = false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(attachment.type)) {
      window.showValidationWarning('editAttachmentError', 'סוג קובץ לא נתמך. מותרים: תמונות (JPG, PNG, GIF, BMP, WebP) ו-PDF בלבד');
      isValid = false;
    }
  }

  return isValid;
}

// פונקציות שמירה ומחיקה
async function saveNote() {
  // איסוף נתונים מהטופס
  const content = getEditorContent('add');
  const relationType = document.querySelector('input[name="noteRelationType"]:checked')?.value;
  const relatedId = document.getElementById('noteRelatedObjectSelect').value;
  const attachment = document.getElementById('noteAttachment').files[0];

  // ולידציה מקיפה
  if (!validateNoteForm(content, relationType, relatedId, attachment)) {
    return;
  }

  clearNoteValidationErrors();

  try {
    // יצירת אובייקט JSON לשליחה
    const requestData = {
      content,
      related_type_id: parseInt(relationType),
      related_id: parseInt(relatedId),
    };

    const response = await fetch('/api/v1/notes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      window.showSuccessNotification('הצלחה', 'הערה נשמרה בהצלחה!');

      // סגירת המודל וטעינה מחדש
      const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
      modal.hide();
      loadNotesData();
    } else {

      // טיפול בשגיאות וולידציה מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Note validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'content\' is required')) {
              fieldError = 'תוכן הערה הוא שדה חובה';
              fieldName = 'contentError';
            } else if (error.includes('Field \'related_type_id\' is required')) {
              fieldError = 'יש לבחור סוג אובייקט לשיוך';
              fieldName = 'relationTypeError';
            } else if (error.includes('Field \'related_id\' is required')) {
              fieldError = 'יש לבחור אובייקט לשיוך';
              fieldName = 'relatedObjectError';
            } else if (error.includes('Field \'related_id\' references non-existent record')) {
              fieldError = 'האובייקט שנבחר לא קיים במערכת';
              fieldName = 'relatedObjectError';
            }

            // שימוש במערכת ההתראות המובנת
            if (fieldName && window.showValidationWarning) {
              window.showValidationWarning(fieldName, fieldError);
            } else {
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בשמירה', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת הערה - בדוק את הנתונים שהוזנו');
      }
    }

  } catch {
    window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת הערה - בדוק את הנתונים שהוזנו');
  }
}

async function updateNoteFromModal() {
  // איסוף נתונים מהטופס
  const noteId = document.getElementById('editNoteId').value;
  const content = getEditorContent('edit');
  const relationType = document.querySelector('input[name="editNoteRelationType"]:checked')?.value;
  const relatedId = document.getElementById('editNoteRelatedObjectSelect').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // בדיקה אם נדרשת מחיקת קובץ
  const shouldRemoveAttachment = window.removeAttachmentFlag === true;
  // const shouldReplaceAttachment = window.replaceAttachmentFlag === true;

  // ולידציה מקיפה
  if (!validateEditNoteForm(content, relationType, relatedId, attachment)) {
    return;
  }

  clearNoteValidationErrors();

  try {
    let response;

    // אם יש קובץ חדש או נדרשת מחיקת קובץ, השתמש ב-FormData
    if (attachment || shouldRemoveAttachment) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('related_type_id', relationType);
      formData.append('related_id', relatedId);

      if (attachment) {
        formData.append('attachment', attachment);
      }

      if (shouldRemoveAttachment) {
        formData.append('remove_attachment', 'true');
      }

      response = await fetch(`/api/v1/notes/${noteId}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // אחרת, השתמש ב-JSON
      const data = {
        content,
        related_type_id: parseInt(relationType),
        related_id: parseInt(relatedId),
      };

      response = await fetch(`/api/v1/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      window.showSuccessNotification('הצלחה', 'הערה עודכנה בהצלחה!');

      // ניקוי דגלים
      window.removeAttachmentFlag = false;
      window.replaceAttachmentFlag = false;

      // סגירת המודל וטעינה מחדש
      const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
      modal.hide();
      loadNotesData();
    } else {

      // טיפול בשגיאות וולידציה מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Note validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'content\' is required')) {
              fieldError = 'תוכן הערה הוא שדה חובה';
              fieldName = 'editContentError';
            } else if (error.includes('Field \'related_type_id\' is required')) {
              fieldError = 'יש לבחור סוג אובייקט לשיוך';
              fieldName = 'editRelationTypeError';
            } else if (error.includes('Field \'related_id\' is required')) {
              fieldError = 'יש לבחור אובייקט לשיוך';
              fieldName = 'editRelatedObjectError';
            } else if (error.includes('Field \'related_id\' references non-existent record')) {
              fieldError = 'האובייקט שנבחר לא קיים במערכת';
              fieldName = 'editRelatedObjectError';
            }

            // שימוש במערכת ההתראות המובנת
            if (fieldName && window.showValidationWarning) {
              window.showValidationWarning(fieldName, fieldError);
            } else {
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בעדכון', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון הערה - בדוק את הנתונים שהוזנו');
      }
    }

  } catch {
    window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון הערה - בדוק את הנתונים שהוזנו');
  }
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

async function confirmDeleteNote(noteId) {
  // סגירת המודל
  const modal = bootstrap.Modal.getInstance(document.getElementById('deleteNoteModal'));
  if (modal) {
    modal.hide();
  }

  // מחיקת ההערה
  await deleteNoteFromServer(noteId);
}

async function deleteNoteFromServer(noteId) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`/api/v1/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        window.showSuccessNotification('הצלחה', 'הערה נמחקה בהצלחה!');
        loadNotesData();
        return; // יציאה מוצלחת
      } else {

        // טיפול בשגיאות מהשרת
        if (result.error && result.error.message) {
          const serverMessage = result.error.message;

          if (serverMessage.includes('has linked items')) {
            window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק הערה זו - יש פריטים מקושרים אליה');
          } else {
            window.showErrorNotification('שגיאה במחיקה', serverMessage);
          }
        } else {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת הערה - בדוק את הנתונים');
        }
        return; // יציאה עם שגיאה
      }

    } catch {
      retryCount++;

      if (retryCount >= maxRetries) {
        // ניסיונות נגמרו - הצגת שגיאה
        window.showErrorNotification('שגיאה', `שגיאה במחיקת הערה לאחר ${maxRetries} ניסיונות. בדוק את חיבור השרת.`);
      } else {
        // המתנה לפני ניסיון נוסף
        const currentRetryCount = retryCount;
        await new Promise(resolve => setTimeout(resolve, 1000 * currentRetryCount));
      }
    }
  }
}

// פונקציות ולידציה

function clearNoteValidationErrors() {
  // שימוש במערכת הגלובלית לוולידציה
  if (typeof window.clearValidation === 'function') {
    window.clearValidation();
  } else {
    // fallback למערכת המקומית
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
}

// function getFieldByErrorId(errorId) {
//   switch (errorId) {
//   case 'contentError':
//     return document.getElementById('noteContent');
//   case 'editContentError':
//     return document.getElementById('editNoteContent');
//   case 'relationTypeError':
//     return document.querySelector('input[name="noteRelationType"]:checked')?.closest('.col-md-6');
//   case 'editRelationTypeError':
//     return document.querySelector('input[name="editNoteRelationType"]:checked')?.closest('.col-md-6');
//   case 'relatedObjectError':
//     return document.getElementById('noteRelatedObjectSelect');
//   case 'editRelatedObjectError':
//     return document.getElementById('editNoteRelatedObjectSelect');
//   default:
//     return null;
//   }
// }

window.loadNotesData = loadNotesData;
window.updateNotesTable = updateNotesTable;
window.updateNotesSummary = updateNotesSummary;
window.updateGridFromComponent = updateGridFromComponent;
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.deleteNoteFromServer = deleteNoteFromServer;
// window.showDeleteNoteModal = showDeleteNoteModal; // הוסר - שימוש במערכת הגלובלית
window.confirmDeleteNote = confirmDeleteNote;
window.onNoteRelationTypeChange = onNoteRelationTypeChange;
window.populateEditSelectByType = populateEditSelectByType;
window.setupNoteValidationEvents = setupNoteValidationEvents;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  // בדיקת זמינות מערכות
  // בדיקה שהמערכת זמינה
  if (typeof window.showSuccessNotification !== 'function') {
    return;
  }

  // שחזור מצב הסגירה
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    restoreNotesSectionState();
  }

  // טעינת נתונים
  loadNotesData();

  // הוספת ולידציה בזמן אמת
  setupNoteValidationEvents();

  // שחזור מצב סידור
  restoreSortState();

});

// פונקציה להגדרת אירועי ולידציה
function setupNoteValidationEvents() {
  // ולידציה לשדה תוכן (עורך טקסט עשיר)
  const contentField = document.getElementById('noteContent');
  if (contentField) {
    contentField.addEventListener('input', function () {
      const content = this.innerText || this.textContent || '';
      if (content.trim()) {
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

  // ולידציה לשדה תוכן בעריכה (עורך טקסט עשיר)
  const editContentField = document.getElementById('editNoteContent');
  if (editContentField) {
    editContentField.addEventListener('input', function () {
      const content = this.innerText || this.textContent || '';
      if (content.trim()) {
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

  // אירוע להחלפת קובץ מצורף
  const editAttachmentInput = document.getElementById('editNoteAttachment');
  if (editAttachmentInput) {
    editAttachmentInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        let fileIcon = '📄';

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
          fileIcon = '🖼️';
        } else if (['pdf'].includes(fileExtension)) {
          fileIcon = '📕';
        } else if (['doc', 'docx'].includes(fileExtension)) {
          fileIcon = '📘';
        } else if (['txt'].includes(fileExtension)) {
          fileIcon = '📄';
        } else if (['xls', 'xlsx'].includes(fileExtension)) {
          fileIcon = '📊';
        }

        const displayElement = document.getElementById('currentAttachmentDisplay');
        if (displayElement) {
          displayElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${fileIcon}</span>
              <span>${fileName} (חדש)</span>
              <span style="color: ${window.getTableColors ? window.getTableColors().positive : '#28a745'}; font-weight: bold;">✓ נבחר</span>
            </div>
          `;
        }

        // עדכון כפתורי הפעולה
        const actionsElement = document.getElementById('attachmentActions');
        if (actionsElement) {
          actionsElement.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-success" disabled>
              ✅ קובץ נבחר
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="clearSelectedFile()">
              ❌ בטל בחירה
            </button>
          `;
          actionsElement.style.display = 'block';
        }
      }
    });
  }
}

// פונקציה לביטול בחירת קובץ
function clearSelectedFile() {
  const fileInput = document.getElementById('editNoteAttachment');
  const displayElement = document.getElementById('currentAttachmentDisplay');
  const actionsElement = document.getElementById('attachmentActions');

  if (fileInput) {
    fileInput.value = '';
  }

  if (displayElement) {
    displayElement.textContent = 'אין קובץ מצורף';
  }

  if (actionsElement) {
    actionsElement.style.display = 'none';
  }

  // ניקוי דגלים
  window.removeAttachmentFlag = false;
  window.replaceAttachmentFlag = false;
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
  if (typeof window.sortTableData === 'function') {
    window.sortTableData(
      columnIndex,
      window.notesData || [],
      'notes',
      updateNotesTable,
    );
  } else {
    handleFunctionNotFound('sortTableData', 'פונקציית מיון טבלה לא נמצאה');
  }
}

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {
  // בדיקה אם יש נתונים לפני שחזור סידור
  if (!window.notesData || window.notesData.length === 0) {
    // אין נתונים לשחזור סידור - ממתין לטעינת נתונים
    return;
  }

  if (typeof window.restoreAnyTableSort === 'function') {
    window.restoreAnyTableSort('notes', window.notesData || [], updateNotesTable);
  } else {
    handleFunctionNotFound('restoreAnyTableSort', 'פונקציית שחזור מיון טבלה לא נמצאה');
  }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;

/**
 * פונקציה להצגת דף טיקר (כרגע הודעת "בפיתוח")
 * @param {string} symbol - סמל הטיקר
 */
function showTickerPage(symbol) {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', `דף הטיקר ${symbol} נמצא בפיתוח`);
  } else {
    // Fallback notification
  }
}

// הגדרת הפונקציה כגלובלית
window.showTickerPage = showTickerPage;

/**
 * פונקציות עורך טקסט עשיר
 */

/**
 * עיצוב טקסט בעורך
 * @param {string} command - פקודת העיצוב
 * @param {string} mode - 'add' או 'edit'
 */
function formatText(command, mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
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
    document.execCommand('strikeThrough', false, null);
    break;
  case 'h1':
    document.execCommand('formatBlock', false, '<h1>');
    break;
  case 'h2':
    document.execCommand('formatBlock', false, '<h2>');
    break;
  case 'h3':
    document.execCommand('formatBlock', false, '<h3>');
    break;
  case 'ul':
    document.execCommand('insertUnorderedList', false, null);
    break;
  case 'ol':
    document.execCommand('insertOrderedList', false, null);
    break;
  case 'link': {
    // Function to handle link insertion
    const insertLink = (url) => {
      if (url && url.trim()) {
        document.execCommand('createLink', false, url);
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('עורך טקסט', 'לינק נוסף בהצלחה');
        }
      }
    };
    
    // Use a custom prompt or fallback to browser prompt
    if (typeof window.showCustomPrompt === 'function') {
      window.showCustomPrompt(
        'הוספת לינק',
        'הכנס כתובת URL:',
        'http://',
        insertLink,
        () => console.log('❌ הוספת לינק - משתמש ביטל')
      );
    } else {
      // Fallback to browser prompt
      const url = prompt('הכנס כתובת URL:', 'http://');
      insertLink(url);
    }
    break;
  }
  default:
    // console.warn(`⚠️ פקודה לא מוכרת: ${command}`);
  }
}

/**
 * ניקוי עיצוב בעורך
 * @param {string} mode - 'add' או 'edit'
 */
function clearFormatting(mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  editor.focus();
  document.execCommand('removeFormat', false, null);
}

/**
 * קבלת תוכן מעורך הטקסט
 * @param {string} mode - 'add' או 'edit'
 * @returns {string} תוכן העורך
 */
function getEditorContent(mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
    return '';
  }

  // בדיקה אם העורך ריק או מכיל רק תגיות HTML ריקות
  const content = editor.innerHTML;
  const textContent = editor.textContent || editor.innerText || '';

  // אם אין תוכן טקסט, החזר מחרוזת ריקה
  if (!textContent.trim()) {
    return '';
  }

  return content;
}

/**
 * הגדרת תוכן לעורך הטקסט
 * @param {string} content - התוכן להגדרה
 * @param {string} mode - 'add' או 'edit'
 */
function setEditorContent(content, mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  editor.innerHTML = content || '';
}

// הגדרת הפונקציות כגלובליות
window.formatText = formatText;
window.clearFormatting = clearFormatting;
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;
window.filterNotesData = filterNotesData;
window.filterNotesByType = filterNotesByType;
window.getTypeDisplayName = getTypeDisplayName;
window.viewNote = viewNote;
window.loadNoteForViewing = loadNoteForViewing;
window.getNoteRelatedDisplay = getNoteRelatedDisplay;
window.editCurrentNote = editCurrentNote;
window.displayCurrentAttachment = displayCurrentAttachment;
window.removeCurrentAttachment = removeCurrentAttachment;
window.replaceCurrentAttachment = replaceCurrentAttachment;
window.clearSelectedFile = clearSelectedFile;

// פונקציה לסינון הערות לפי חיפוש
function filterNotesData(searchTerm) {
  if (!window.notesData) {
    // console.warn('⚠️ אין נתוני הערות זמינים לסינון');
    return;
  }

  const filteredNotes = window.notesData.filter(note => {
    const content = note.content?.toLowerCase() || '';
    const relatedDisplay = getNoteRelatedDisplay(note).toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return content.includes(searchLower) || relatedDisplay.includes(searchLower);
  });

  updateNotesTable(
    filteredNotes,
    window.accountsData || [],
    window.tradesData || [],
    window.tradePlansData || [],
    window.tickersData || [],
  );
}

// פונקציה לסינון הערות לפי סוג
function filterNotesByType(type) {
  if (!window.notesData) {
    // console.warn('⚠️ אין נתוני הערות זמינים לסינון');
    return;
  }

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-type') === 'all') {
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.backgroundColor = 'white';
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.add('btn-outline-primary');
    }
  });

  const activeButton = document.querySelector(`[data-type="${type}"]`);
  if (activeButton) {
    if (type === 'all') {
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      activeButton.style.backgroundColor = 'white';
      activeButton.style.color = colors.positive;
      activeButton.style.borderColor = colors.positive;
    } else {
      activeButton.classList.remove('btn-outline-primary');
      activeButton.classList.add('active');
    }
  }

  let filteredNotes;
  if (type === 'all') {
    filteredNotes = window.notesData;
  } else {
    const typeMap = {
      'account': 1,
      'trade': 2,
      'trade_plan': 3,
      'ticker': 4,
    };

    const typeId = typeMap[type];
    if (typeId) {
      filteredNotes = window.notesData.filter(note => note.related_type_id === typeId);
    } else {
      filteredNotes = window.notesData;
    }
  }

  updateNotesTable(
    filteredNotes,
    window.accountsData || [],
    window.tradesData || [],
    window.tradePlansData || [],
    window.tickersData || [],
  );
}

// פונקציה לקבלת שם תצוגה לסוג
function getTypeDisplayName(type) {
  switch (type) {
  case 'account': return 'חשבונות';
  case 'trade': return 'טריידים';
  case 'trade_plan': return 'תוכניות';
  case 'ticker': return 'טיקרים';
  default: return type;
  }
}

// פונקציה לצפייה בהערה
function viewNote(noteId) {
  // שמירת מזהה ההערה הנוכחית
  window.currentViewingNoteId = noteId;

  // טעינת נתוני ההערה
  loadNoteForViewing(noteId);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('viewNoteModal'));
  modal.show();
}

// פונקציה לטעינת נתוני הערה לצפייה
async function loadNoteForViewing(noteId) {
  try {
    const response = await fetch(`/api/v1/notes/${noteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const note = responseData.data || responseData;

    // מילוי המודל
    document.getElementById('viewNoteRelated').textContent = getNoteRelatedDisplay(note);
    document.getElementById('viewNoteContent').innerHTML = note.content || 'ללא תוכן';
    document.getElementById('viewNoteCreated').textContent = note.created_at ? new Date(note.created_at).toLocaleString('he-IL') : 'לא מוגדר';

    // הצגת קובץ מצורף
    const attachmentElement = document.getElementById('viewNoteAttachment');
    if (note.attachment) {
      const fileName = note.attachment;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let fileIcon = '📄';

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
        fileIcon = '🖼️';
      } else if (['pdf'].includes(fileExtension)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileIcon = '📘';
      } else if (['txt'].includes(fileExtension)) {
        fileIcon = '📄';
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        fileIcon = '📊';
      }

      attachmentElement.innerHTML = `
        <a href="/api/v1/notes/files/${fileName}" target="_blank" class="btn btn-sm btn-outline-primary">
          ${fileIcon} ${fileName}
        </a>
      `;
    } else {
      attachmentElement.textContent = 'אין קובץ מצורף';
    }

  } catch {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני הערה');
    }
  }
}

// פונקציה לקבלת תצוגת הקשר של הערה
function getNoteRelatedDisplay(note) {
  if (!note.related_type_id || !note.related_id) {
    return 'כללי';
  }

  switch (note.related_type_id) {
  case 1: return `🏦 חשבון ${note.related_id}`;
  case 2: return `📈 טרייד ${note.related_id}`;
  case 3: return `📋 תוכנית ${note.related_id}`;
  case 4: return `📊 טיקר ${note.related_id}`;
  default: return `אובייקט ${note.related_id}`;
  }
}

// פונקציה לעריכת הערה נוכחית
function editCurrentNote() {
  const noteId = window.currentViewingNoteId;
  if (noteId) {
    // סגירת מודל הצפייה
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewNoteModal'));
    viewModal.hide();

    // פתיחת מודל העריכה
    showEditNoteModal(noteId);
  }
}

// פונקציה להצגת קובץ מצורף נוכחי במודל עריכה
function displayCurrentAttachment(attachment) {
  const displayElement = document.getElementById('currentAttachmentDisplay');
  const actionsElement = document.getElementById('attachmentActions');

  if (!displayElement || !actionsElement) {
    return;
  }

  if (attachment) {
    const fileName = attachment;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let fileIcon = '📄';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
      fileIcon = '🖼️';
    } else if (['pdf'].includes(fileExtension)) {
      fileIcon = '📕';
    } else if (['doc', 'docx'].includes(fileExtension)) {
      fileIcon = '📘';
    } else if (['txt'].includes(fileExtension)) {
      fileIcon = '📄';
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      fileIcon = '📊';
    }

    displayElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${fileIcon}</span>
        <span>${fileName}</span>
        <a href="/api/v1/notes/files/${fileName}" 
           target="_blank" 
           class="btn btn-sm btn-outline-primary" 
           style="margin-right: auto;">
          👁️ צפה
        </a>
      </div>
    `;
    actionsElement.style.display = 'block';
  } else {
    displayElement.textContent = 'אין קובץ מצורף';
    actionsElement.style.display = 'none';
  }
}

// פונקציה למחיקת קובץ מצורף נוכחי
function removeCurrentAttachment() {
  const displayElement = document.getElementById('currentAttachmentDisplay');
  const actionsElement = document.getElementById('attachmentActions');
  const fileInput = document.getElementById('editNoteAttachment');

  if (displayElement) {
    displayElement.textContent = 'אין קובץ מצורף';
  }

  if (actionsElement) {
    actionsElement.style.display = 'none';
  }

  if (fileInput) {
    fileInput.value = '';
  }

  // סימון שמחיקת הקובץ נדרשת
  window.removeAttachmentFlag = true;

  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'הקובץ המצורף יימחק בעת שמירת ההערה');
  } else {
    // Fallback notification
  }
}

// פונקציה להחלפת קובץ מצורף
function replaceCurrentAttachment() {
  const fileInput = document.getElementById('editNoteAttachment');
  if (fileInput) {
    fileInput.click();
  }

  // סימון שהחלפת הקובץ נדרשת
  window.replaceAttachmentFlag = true;
}

