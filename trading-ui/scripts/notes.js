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
  showAddNoteModal();
}

function editNote(id) {
  showEditNoteModal(id);
}

function deleteNote(id) {
  showDeleteNoteModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
  const topSection = document.querySelector('.top-section');

  if (!topSection) {
    console.error('❌ לא נמצא top-section');
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

    // פונקציה לטעינת נתונים עם טיפול בשגיאות
    const loadDataSafely = async (url, dataName) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`⚠️ שגיאה בטעינת ${dataName}: ${response.status}`);
          return [];
        }
        const data = await response.json();
        if (data.status === 'error') {
          console.warn(`⚠️ שגיאה ב-API ${dataName}: ${data.error?.message || 'שגיאה לא ידועה'}`);
          return [];
        }
        return Array.isArray(data.data) ? data.data : [];
      } catch (error) {
        console.warn(`⚠️ שגיאה בטעינת ${dataName}:`, error);
        return [];
      }
    };

    const [accounts, trades, tradePlans, tickers] = await Promise.all([
      loadDataSafely('/api/v1/accounts/', 'חשבונות'),
      loadDataSafely('/api/v1/trades/', 'טריידים'),
      loadDataSafely('/api/v1/trade_plans/', 'תוכניות'),
      loadDataSafely('/api/v1/tickers/', 'טיקרים')
    ]);

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

    // יצירת קישור לסימבול (אם יש סימבול)
    let symbolLink = symbolDisplay;
    if (note.related_type_id === 1) {
      // עבור חשבונות - הצג רק אייקון קישור
      symbolLink = `<a href="#" onclick="viewLinkedItemsForNote(${note.id})" class="symbol-link" title="עבור לדף החשבון">🔗</a>`;
    } else if (symbolDisplay && symbolDisplay !== '-' && symbolDisplay !== '') {
      // עבור טיקרים, טריידים ותוכניות - הצג אייקון קישור + סימבול
      symbolLink = `<a href="#" onclick="showTickerPage('${symbolDisplay}')" class="symbol-link" title="עבור לדף הטיקר">🔗</a> ${symbolDisplay}`;
    }

    return `
      <tr onclick="viewNote(${note.id})" style="cursor: pointer;">
        <td class="ticker-cell"><span class="symbol-text">${symbolLink}</span></td>
        <td style="padding: 0;" data-type="${typeForFilter}">
          <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right; min-width: 150px;">
            ${relatedDisplay}
          </div>
        </td>
        <td>${contentDisplay}</td>
        <td>${attachmentDisplay}</td>
        <td data-date="${note.created_at}">${date}</td>
        <td class="actions-cell" onclick="event.stopPropagation();">
          <table class="table table-sm table-borderless mb-0">
            <tbody>
              <tr>
                <td class="p-0 pe-1">
                  ${createLinkButton(`viewLinkedItemsForNote(${note.id})`)}
                </td>
                <td class="p-0 pe-1">
                  ${createEditButton(`editNote('${note.id}')`)}
                </td>
                <td class="p-0">
                  ${createDeleteButton(`deleteNote('${note.id}')`)}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
  console.log('✅ טבלת ההערות עודכנה בהצלחה');

  // עדכון table-count ו-info-summary
  updateNotesSummary(notes);
}

// פונקציה לעדכון סיכום הערות
function updateNotesSummary(notes) {
  console.log('🔄 updateNotesSummary נקראה עם', notes.length, 'הערות');

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

  console.log('✅ סיכום הערות עודכן');
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
  console.log('🔄 showEditNoteModal נקראה עבור ID:', noteId);

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
    console.log('✅ נטענו נתוני הערה:', responseData);

    // חילוץ הנתונים מהמבנה הנכון
    const note = responseData.data || responseData;
    console.log('🔧 נתוני הערה לחילוץ:', note);

    // מילוי הטופס
    document.getElementById('editNoteId').value = note.id;
    setEditorContent(note.content || '', 'edit');

    // הצגת קובץ מצורף נוכחי
    displayCurrentAttachment(note.attachment);

    // בחירת סוג הקשר
    const relationType = note.related_type_id;
    console.log('🔧 סוג קשר:', relationType, 'מזהה קשור:', note.related_id);

    if (relationType) {
      // בחירת הרדיו באטון הנכון
      const radioButton = document.querySelector(`input[name="editNoteRelationType"][value="${relationType}"]`);
      console.log('🔧 רדיו באטון שנמצא:', radioButton);

      if (radioButton) {
        radioButton.checked = true;
        console.log('✅ רדיו באטון נבחר');

        // טעינת נתונים למודל אם עוד לא נטענו
        if (typeof window.loadModalData === 'function') {
          console.log('🔄 טוען נתונים למודל...');
          await window.loadModalData();
        }

        // מילוי הרשימה הנכונה לפי סוג הקשר
        console.log('🔄 ממלא רשימה לפי סוג:', relationType);
        await populateEditSelectByType(relationType, note.related_id);
      } else {
        console.error('❌ לא נמצא רדיו באטון עבור ערך:', relationType);
      }
    } else {
      console.warn('⚠️ אין סוג קשר מוגדר');
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני הערה:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני הערה', 'error');
    }
  }
}

async function loadModalData() {
  try {
    console.log('🔄 טוען נתונים למודלים...');

    // טעינת נתונים במקביל
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    const accounts = Array.isArray(accountsResponse.data) ? accountsResponse.data : [];
    const trades = Array.isArray(tradesResponse.data) ? tradesResponse.data : [];
    const tradePlans = Array.isArray(tradePlansResponse.data) ? tradePlansResponse.data : [];
    const tickers = Array.isArray(tickersResponse.data) ? tickersResponse.data : [];

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

    // הגדרת נתונים ראשוניים (ברירת מחדל לטיקר)
    console.log('🔧 Setting initial data for tickers...');
    populateSelect('noteRelatedObjectSelect', tickers, 'symbol', '');
    populateSelect('editNoteRelatedObjectSelect', tickers, 'symbol', '');

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
  console.log('🔄 onNoteRelationTypeChange נקראה');

  // הפונקציה הזו נקראת בעת שינוי רדיו באטון
  // הלוגיקה האמיתית נמצאת ב-updateRadioButtons
  // אבל אנחנו צריכים אותה לעבוד גם בעת טעינת נתונים לעריכה
}

async function populateEditSelectByType(relationType, selectedId) {
  console.log('🔄 populateEditSelectByType נקראה עבור:', relationType, selectedId);

  try {
    let data = [];
    let displayField = '';
    let placeholder = '';

    switch (parseInt(relationType)) {
      case 1: // חשבון
        const accountsResponse = await fetch('/api/v1/accounts/');
        const accountsData = await accountsResponse.json();
        data = Array.isArray(accountsData.data) ? accountsData.data : [];
        displayField = 'name';
        placeholder = 'חשבון';
        break;
      case 2: // טרייד
        const tradesResponse = await fetch('/api/v1/trades/');
        const tradesData = await tradesResponse.json();
        data = Array.isArray(tradesData.data) ? tradesData.data : [];
        displayField = 'id';
        placeholder = 'טרייד';
        break;
      case 3: // תוכנית
        const plansResponse = await fetch('/api/v1/trade_plans/');
        const plansData = await plansResponse.json();
        data = Array.isArray(plansData.data) ? plansData.data : [];
        displayField = 'id';
        placeholder = 'תוכנית';
        break;
      case 4: // טיקר
        const tickersResponse = await fetch('/api/v1/tickers/');
        const tickersData = await tickersResponse.json();
        data = Array.isArray(tickersData.data) ? tickersData.data : [];
        displayField = 'symbol';
        placeholder = 'טיקר';
        break;
    }

    console.log('🔧 מילוי רשימה עם:', data.length, 'פריטים, שדה תצוגה:', displayField);

    // מילוי הרשימה
    populateSelect('editNoteRelatedObjectSelect', data, displayField, placeholder);

    // בחירת הערך הנכון
    if (selectedId) {
      console.log('🔧 בוחר ערך:', selectedId);
      setTimeout(() => {
        const select = document.getElementById('editNoteRelatedObjectSelect');
        if (select) {
          select.value = selectedId;
          console.log('✅ ערך נבחר ברשימה:', select.value);
        } else {
          console.error('❌ לא נמצא אלמנט select');
        }
      }, 100);
    } else {
      console.warn('⚠️ אין מזהה נבחר');
    }

  } catch (error) {
    console.error('❌ שגיאה במילוי רשימה לעריכה:', error);
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
    showNoteValidationError('contentError', 'תוכן הערה הוא שדה חובה');
    isValid = false;
  } else if (content.length < 1) {
    showNoteValidationError('contentError', 'תוכן ההערה חייב להכיל לפחות תו אחד');
    isValid = false;
  } else if (content.length > 10000) {
    showNoteValidationError('contentError', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    isValid = false;
  }

  // וולידציה של סוג קשר
  if (!relationType) {
    showNoteValidationError('relationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    isValid = false;
  }

  // וולידציה של אובייקט קשור
  if (!relatedId) {
    showNoteValidationError('relatedObjectError', 'יש לבחור אובייקט לשיוך');
    isValid = false;
  } else if (isNaN(parseInt(relatedId)) || parseInt(relatedId) <= 0) {
    showNoteValidationError('relatedObjectError', 'מזהה אובייקט לא תקין');
    isValid = false;
  }

  // וולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      showNoteValidationError('attachmentError', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      isValid = false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(attachment.type)) {
      showNoteValidationError('attachmentError', 'סוג קובץ לא נתמך. מותרים: תמונות, PDF, Word, טקסט');
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
    showNoteValidationError('editContentError', 'תוכן הערה הוא שדה חובה');
    isValid = false;
  } else if (content.length < 1) {
    showNoteValidationError('editContentError', 'תוכן ההערה חייב להכיל לפחות תו אחד');
    isValid = false;
  } else if (content.length > 10000) {
    showNoteValidationError('editContentError', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    isValid = false;
  }

  // וולידציה של סוג קשר
  if (!relationType) {
    showNoteValidationError('editRelationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    isValid = false;
  }

  // וולידציה של אובייקט קשור
  if (!relatedId) {
    showNoteValidationError('editRelatedObjectError', 'יש לבחור אובייקט לשיוך');
    isValid = false;
  } else if (isNaN(parseInt(relatedId)) || parseInt(relatedId) <= 0) {
    showNoteValidationError('editRelatedObjectError', 'מזהה אובייקט לא תקין');
    isValid = false;
  }

  // וולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      showNoteValidationError('editAttachmentError', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      isValid = false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(attachment.type)) {
      showNoteValidationError('editAttachmentError', 'סוג קובץ לא נתמך. מותרים: תמונות, PDF, Word, טקסט');
      isValid = false;
    }
  }

  return isValid;
}

// פונקציות שמירה ומחיקה
async function saveNote() {
  console.log('🔄 saveNote נקראה');

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

    if (typeof window.showNotification === 'function') {
      window.showNotification('הערה נשמרה בהצלחה!', 'success');
    }

    // סגירת המודל וטעינה מחדש
    const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
    modal.hide();

    loadNotesData();

  } catch (error) {
    console.error('❌ שגיאה בשמירת הערה:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בשמירת הערה', 'error');
    }
  }
}

async function updateNoteFromModal() {
  console.log('🔄 updateNoteFromModal נקראה');

  // איסוף נתונים מהטופס
  const noteId = document.getElementById('editNoteId').value;
  const content = getEditorContent('edit');
  const relationType = document.querySelector('input[name="editNoteRelationType"]:checked')?.value;
  const relatedId = document.getElementById('editNoteRelatedObjectSelect').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // בדיקה אם נדרשת מחיקת קובץ
  const shouldRemoveAttachment = window.removeAttachmentFlag === true;
  const shouldReplaceAttachment = window.replaceAttachmentFlag === true;

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
        body: formData
      });
    } else {
      // אחרת, השתמש ב-JSON
      const data = {
        content: content,
        related_type_id: parseInt(relationType),
        related_id: parseInt(relatedId)
      };

      response = await fetch(`/api/v1/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ הערה עודכנה בהצלחה:', result);

    if (typeof window.showNotification === 'function') {
      window.showNotification('הערה עודכנה בהצלחה!', 'success');
    }

    // ניקוי דגלים
    window.removeAttachmentFlag = false;
    window.replaceAttachmentFlag = false;

    // סגירת המודל וטעינה מחדש
    const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
    modal.hide();

    loadNotesData();

  } catch (error) {
    console.error('❌ שגיאה בעדכון הערה:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון הערה', 'error');
    }
  }
}

function showDeleteNoteModal(noteId) {
  console.log('🔄 showDeleteNoteModal נקראה עבור ID:', noteId);

  // יצירת המודל דינמית
  const modalHtml = `
      <div class="modal fade" id="deleteNoteModal" tabindex="-1" aria-labelledby="deleteNoteModalLabel" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header modal-header-danger">
              <h5 class="modal-title text-white" id="deleteNoteModalLabel">מחק הערה</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>האם אתה בטוח שברצונך למחוק הערה זו?</p>
              <p class="text-muted">פעולה זו אינה הפיכה.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
              <button type="button" class="btn btn-danger" onclick="confirmDeleteNote(${noteId})">מחק</button>
            </div>
          </div>
        </div>
      </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('deleteNoteModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('deleteNoteModal'));
  modal.show();

  // הסרת המודל מהדף אחרי סגירה
  document.getElementById('deleteNoteModal').addEventListener('hidden.bs.modal', function () {
    this.remove();
  });
}

async function confirmDeleteNote(noteId) {
  console.log('🔄 confirmDeleteNote נקראה עבור ID:', noteId);

  // סגירת המודל
  const modal = bootstrap.Modal.getInstance(document.getElementById('deleteNoteModal'));
  if (modal) {
    modal.hide();
  }

  // מחיקת ההערה
  await deleteNoteFromServer(noteId);
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

    if (typeof window.showNotification === 'function') {
      window.showNotification('הערה נמחקה בהצלחה!', 'success');
    }

    loadNotesData();

  } catch (error) {
    console.error('❌ שגיאה במחיקת הערה:', error);
    if (typeof window.showNotification === 'function') {
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
window.updateNotesSummary = updateNotesSummary;
window.updateGridFromComponent = updateGridFromComponent;
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.deleteNoteFromServer = deleteNoteFromServer;
window.showDeleteNoteModal = showDeleteNoteModal;
window.confirmDeleteNote = confirmDeleteNote;
window.onNoteRelationTypeChange = onNoteRelationTypeChange;
window.populateEditSelectByType = populateEditSelectByType;
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
              <span style="color: #28a745; font-weight: bold;">✓ נבחר</span>
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
  console.log(`🔄 sortTable נקראה עבור עמודה ${columnIndex}`);

  if (typeof window.sortTableData === 'function') {
    window.sortTableData(
      columnIndex,
      window.notesData || [],
      'notes',
      updateNotesTable
    );
  } else {
    console.error('❌ sortTableData function not found in tables.js');
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

/**
 * פונקציה להצגת דף טיקר (כרגע הודעת "בפיתוח")
 * @param {string} symbol - סמל הטיקר
 */
function showTickerPage(symbol) {
  console.log(`🔄 showTickerPage נקראה עבור סמל: ${symbol}`);

  if (typeof window.showNotification === 'function') {
    window.showNotification(`דף הטיקר ${symbol} נמצא בפיתוח`, 'info');
  } else {
    alert(`דף הטיקר ${symbol} נמצא בפיתוח`);
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
    console.error(`❌ לא נמצא עורך עם ID: ${editorId}`);
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
    case 'link':
      const url = prompt('הכנס כתובת URL:', 'http://');
      if (url) {
        document.execCommand('createLink', false, url);
      }
      break;
    default:
      console.warn(`⚠️ פקודה לא מוכרת: ${command}`);
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
    console.error(`❌ לא נמצא עורך עם ID: ${editorId}`);
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
    console.error(`❌ לא נמצא עורך עם ID: ${editorId}`);
    return '';
  }

  return editor.innerHTML;
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
    console.error(`❌ לא נמצא עורך עם ID: ${editorId}`);
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
  console.log('🔄 filterNotesData נקראה עם:', searchTerm);

  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody בטבלה');
    return;
  }

  const rows = tbody.querySelectorAll('tr');
  let visibleCount = 0;

  rows.forEach(row => {
    // דילוג על שורות ריקות או שגיאות
    if (row.cells.length < 6) {
      return;
    }

    const symbolCell = row.cells[0]?.textContent || '';
    const relatedCell = row.cells[1]?.textContent || '';
    const contentCell = row.cells[2]?.textContent || '';

    const searchText = searchTerm.toLowerCase();
    const rowText = `${symbolCell} ${relatedCell} ${contentCell}`.toLowerCase();

    if (searchText === '' || rowText.includes(searchText)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  // עדכון מונה ההערות המוצגות
  const tableCountElement = document.querySelector('.table-count');
  if (tableCountElement) {
    if (searchTerm === '') {
      // אם אין חיפוש, הצג את המספר המקורי
      const originalCount = window.originalNotesCount || '0';
      tableCountElement.textContent = `${originalCount} הערות`;
    } else {
      tableCountElement.textContent = `${visibleCount} הערות (מתוך ${window.originalNotesCount || '0'})`;
    }
  }

  console.log(`✅ סוננו ${visibleCount} הערות מתוך ${rows.length} שורות`);
}

// פונקציה לסינון הערות לפי סוג
function filterNotesByType(type) {
  console.log('🔄 filterNotesByType נקראה עם:', type);

  // עדכון מצב הכפתורים
  const filterButtons = document.querySelectorAll('.quick-filters .btn');
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
    }
  });

  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody בטבלה');
    return;
  }

  const rows = tbody.querySelectorAll('tr');
  let visibleCount = 0;

  rows.forEach(row => {
    // דילוג על שורות ריקות או שגיאות
    if (row.cells.length < 6) {
      return;
    }

    // קביעת סוג ההערה לפי העמודה השנייה
    const relatedCell = row.cells[1];
    const relatedText = relatedCell?.textContent || '';
    let noteType = 'other';

    if (relatedText.includes('🏦')) {
      noteType = 'account';
    } else if (relatedText.includes('📈')) {
      noteType = 'trade';
    } else if (relatedText.includes('📋')) {
      noteType = 'trade_plan';
    } else if (relatedText.includes('📊')) {
      noteType = 'ticker';
    }

    if (type === 'all' || noteType === type) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  // עדכון מונה ההערות המוצגות
  const tableCountElement = document.querySelector('.table-count');
  if (tableCountElement) {
    if (type === 'all') {
      const originalCount = window.originalNotesCount || '0';
      tableCountElement.textContent = `${originalCount} הערות`;
    } else {
      tableCountElement.textContent = `${visibleCount} הערות מסוג ${getTypeDisplayName(type)}`;
    }
  }

  console.log(`✅ סוננו ${visibleCount} הערות מסוג ${type}`);
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
  console.log('🔄 viewNote נקראה עבור ID:', noteId);

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

    console.log('✅ נטענו נתוני הערה לצפייה:', note);

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

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני הערה לצפייה:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני הערה', 'error');
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
    console.error('❌ לא נמצאו אלמנטים להצגת קובץ מצורף');
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
        <a href="/api/v1/notes/files/${fileName}" target="_blank" class="btn btn-sm btn-outline-primary" style="margin-right: auto;">
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
  console.log('🔄 removeCurrentAttachment נקראה');

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

  if (typeof window.showNotification === 'function') {
    window.showNotification('הקובץ המצורף יימחק בעת שמירת ההערה', 'info');
  }
}

// פונקציה להחלפת קובץ מצורף
function replaceCurrentAttachment() {
  console.log('🔄 replaceCurrentAttachment נקראה');

  const fileInput = document.getElementById('editNoteAttachment');
  if (fileInput) {
    fileInput.click();
  }

  // סימון שהחלפת הקובץ נדרשת
  window.replaceAttachmentFlag = true;
}

