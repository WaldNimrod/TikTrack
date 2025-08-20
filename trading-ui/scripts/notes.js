// ===== קובץ JavaScript פשוט לדף הערות =====

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
window.toggleMainSection = toggleMainSection;
window.restoreNotesSectionState = restoreNotesSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// פונקציה לטעינת נתונים
async function loadNotesData() {
  console.log('🔄 loadNotesData נקראה');

  try {
    // קריאה לשרת לקבלת נתוני הערות
    const response = await fetch('/api/notes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const notes = await response.json();
    console.log('✅ נטענו', notes.length, 'הערות מהשרת');

    // עדכון הטבלה
    updateNotesTable(notes);

    if (typeof window.showNotification === 'function') {
      window.showNotification(`נטענו ${notes.length} הערות בהצלחה`, 'success');
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים:', error);

    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתונים מהשרת', 'error');
    } else {
      alert('שגיאה בטעינת נתונים מהשרת: ' + error.message);
    }
  }
}

// פונקציה לעדכון הטבלה
function updateNotesTable(notes) {
  console.log('🔄 updateNotesTable נקראה עם', notes.length, 'הערות');

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
    const date = new Date(note.created_at).toLocaleDateString('he-IL');
    const status = note.status || 'פעילה';
    const statusClass = status === 'פעילה' ? 'status-active' : 'status-archived';

    return `
      <tr>
        <td>${date}</td>
        <td>${note.content || 'ללא תוכן'}</td>
        <td>${note.related_object || 'לא מקושר'}</td>
        <td>${note.related_type || 'כללי'}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
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
  
  // טעינת נתונים למודל
  loadModalData();
  
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
    const response = await fetch(`/api/notes/${noteId}`);
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
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני הערה', 'error');
    }
  }
}

async function loadModalData() {
  try {
    console.log('🔄 טוען נתונים למודלים...');
    
    // טעינת חשבונות
    const accountsResponse = await fetch('/api/v1/accounts/');
    const accounts = accountsResponse.ok ? await accountsResponse.json() : [];
    
    // טעינת טריידים
    const tradesResponse = await fetch('/api/trades');
    const trades = tradesResponse.ok ? await tradesResponse.json() : [];
    
    // טעינת תכנונים
    const tradePlansResponse = await fetch('/api/v1/trade_plans/');
    const tradePlans = tradePlansResponse.ok ? await tradePlansResponse.json() : [];
    
    // טעינת טיקרים
    const tickersResponse = await fetch('/api/tickers');
    const tickers = tickersResponse.ok ? await tickersResponse.json() : [];
    
    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תכנונים, ${tickers.length} טיקרים`);
    
    // שמירת הנתונים במשתנים גלובליים
    window.modalAccounts = accounts;
    window.modalTrades = trades;
    window.modalTradePlans = tradePlans;
    window.modalTickers = tickers;
    
  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים למודלים:', error);
  }
}

function onNoteRelationTypeChange() {
  const selectedType = document.querySelector('input[name="noteRelationType"]:checked')?.value;
  const editSelectedType = document.querySelector('input[name="editNoteRelationType"]:checked')?.value;
  
  const isEdit = editSelectedType !== undefined;
  const relationType = isEdit ? editSelectedType : selectedType;
  const selectId = isEdit ? 'editNoteRelatedObjectSelect' : 'noteRelatedObjectSelect';
  
  console.log('🔄 onNoteRelationTypeChange:', relationType, 'isEdit:', isEdit);
  
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';
  
  if (!relationType) return;
  
  let options = [];
  
  switch (relationType) {
    case '1': // חשבון
      options = window.modalAccounts?.map(account => 
        `<option value="${account.id}">${account.name}</option>`
      ) || [];
      break;
    case '2': // טרייד
      options = window.modalTrades?.map(trade => 
        `<option value="${trade.id}">טרייד #${trade.id} - ${trade.ticker || 'לא מוגדר'}</option>`
      ) || [];
      break;
    case '3': // תכנון
      options = window.modalTradePlans?.map(plan => 
        `<option value="${plan.id}">תכנון #${plan.id} - ${plan.ticker || 'לא מוגדר'}</option>`
      ) || [];
      break;
    case '4': // טיקר
      options = window.modalTickers?.map(ticker => 
        `<option value="${ticker.id}">${ticker.symbol} - ${ticker.name || 'לא מוגדר'}</option>`
      ) || [];
      break;
  }
  
  select.innerHTML += options.join('');
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
    
    const response = await fetch('/api/notes', {
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
    
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ הערה עודכנה בהצלחה:', result);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('הערה עודכנה בהצלחה!', 'success');
    }
    
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

async function deleteNoteFromServer(noteId) {
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
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
}

function clearNoteValidationErrors() {
  const errorElements = document.querySelectorAll('.invalid-feedback');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
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

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');

  // שחזור מצב הסגירה
  restoreNotesSectionState();

  // טעינת נתונים
  loadNotesData();

  console.log('דף הערות נטען בהצלחה');
});

