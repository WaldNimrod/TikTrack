// ===== קובץ JavaScript פשוט לדף תחקיר =====

// פונקציות בסיסיות
function openResearchDetails(id) {
  console.log('פתיחת פרטי תחקיר:', id);
}

function editResearch(id) {
  console.log('עריכת תחקיר:', id);
}

function deleteResearch(id) {
  console.log('מחיקת תחקיר:', id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleResearchSection() {
  console.log('🔄 toggleResearchSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);
  const researchSection = contentSections[0]; // הסקשן הראשון - תחקירים

  if (!researchSection) {
    console.error('❌ לא נמצא סקשן תחקירים');
    return;
  }
  console.log('✅ סקשן תחקירים נמצא:', researchSection);

  const sectionBody = researchSection.querySelector('.section-body');
  const toggleBtn = researchSection.querySelector('button[onclick="toggleResearchSection()"]');
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
    localStorage.setItem('researchSectionCollapsed', !isCollapsed);
  }
}

function toggleAccountsSection() {
  const contentSections = document.querySelectorAll('.content-section');
  const accountsSection = contentSections[1]; // הסקשן השני - חשבונות

  if (!accountsSection) {
    console.error('❌ לא נמצא סקשן חשבונות');
    return;
  }

  const sectionBody = accountsSection.querySelector('.section-body');
  const toggleBtn = accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');
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
    localStorage.setItem('accountsSectionCollapsed', !isCollapsed);
  }
}

// פונקציה לשחזור מצב הסגירה
function restoreResearchSectionState() {
  // שחזור מצב סקשן התחקירים
  const researchCollapsed = localStorage.getItem('researchSectionCollapsed') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const researchSection = contentSections[0];

  if (researchSection) {
    const sectionBody = researchSection.querySelector('.section-body');
    const toggleBtn = researchSection.querySelector('button[onclick="toggleResearchSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && researchCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב סקשן החשבונות
  const accountsCollapsed = localStorage.getItem('accountsSectionCollapsed') === 'true';
  const accountsSection = contentSections[1];

  if (accountsSection) {
    const sectionBody = accountsSection.querySelector('.section-body');
    const toggleBtn = accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && accountsCollapsed) {
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

// הגדרת הפונקציה updateGridFromComponent לדף התחקיר
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 updateGridFromComponent called for research page with:', {
    selectedStatuses,
    selectedTypes,
    selectedDateRange,
    searchTerm
  });

  // קריאה לפונקציה הגלובלית אם זמינה
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'research');
  } else {
    console.error('❌ updateGridFromComponentGlobal function not found');
    // ניסיון נוסף אחרי זמן קצר
    setTimeout(() => {
      if (typeof window.updateGridFromComponentGlobal === 'function') {
        console.log('🔄 Retrying updateGridFromComponentGlobal...');
        window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'research');
      }
    }, 1000);
  }
};

// הגדרת הפונקציות כגלובליות
window.openResearchDetails = openResearchDetails;
window.editResearch = editResearch;
window.deleteResearch = deleteResearch;
window.toggleResearchSection = toggleResearchSection;
window.toggleAccountsSection = toggleAccountsSection;
window.restoreResearchSectionState = restoreResearchSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// בדיקת זמינות פונקציות מיד אחרי הגדרתן
console.log('🔍 === RESEARCH.JS FUNCTIONS CHECK ===');
console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);



// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');

  // שחזור מצב הסגירה
  restoreResearchSectionState();

  // בדיקת זמינות פונקציות גלובליות
  setTimeout(() => {
    console.log('🔍 === CHECKING GLOBAL FUNCTIONS (RESEARCH) ===');
    console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);
    console.log('🔍 updateGridFromComponentGlobal available:', typeof window.updateGridFromComponentGlobal);

    if (typeof window.updateGridFromComponent === 'function') {
      console.log('✅ updateGridFromComponent is properly defined for research page');
    } else {
      console.warn('⚠️ updateGridFromComponent not available for research page');
    }
  }, 1000);

  console.log('דף תחקיר נטען בהצלחה');

  // ניקוי הודעות קונסולה אחרי זמן קצר
  setTimeout(() => {
    console.log('🧹 Clearing console messages to reduce clutter...');
    if (console.clear) {
      console.clear();
    }
  }, 5000);
});
