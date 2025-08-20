// ===== קובץ JavaScript פשוט לדף הערות =====

// פונקציות בסיסיות
function openNoteDetails(id) {
  console.log('פתיחת פרטי הערה:', id);
}

function editNote(id) {
  console.log('עריכת הערה:', id);
}

function deleteNote(id) {
  console.log('מחיקת הערה:', id);
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

// פונקציה לטעינת נתונים (placeholder)
function loadNotesData() {
  console.log('🔄 loadNotesData נקראה');
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציית טעינת נתונים לא מוגדרת עדיין', 'warning');
  } else {
    alert('פונקציית טעינת נתונים לא מוגדרת עדיין');
  }
}
window.loadNotesData = loadNotesData;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');

  // שחזור מצב הסגירה
  restoreNotesSectionState();

  console.log('דף הערות נטען בהצלחה');
});

