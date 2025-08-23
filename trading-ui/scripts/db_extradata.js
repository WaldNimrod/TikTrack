// ===== קובץ JavaScript לדף טבלאות עזר =====
/*
 * DB_Extradata.js - Database Extra Data Page Management (Alternative)
 * =================================================================
 * 
 * This file contains alternative database extra data management functionality for the TikTrack application.
 * It handles display and management of auxiliary database tables.
 * 
 * Note: This is an alternative implementation to db-extradata.js
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * 
 * File: trading-ui/scripts/db_extradata.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// פונקציות בסיסיות
function openExtraDataDetails(id) {
  console.log('פתיחת פרטי טבלת עזר:', id);
}

function editExtraData(id) {
  console.log('עריכת טבלת עזר:', id);
}

function deleteExtraData(id) {
  console.log('מחיקת טבלת עזר:', id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleAllSections() {
  console.log('🔄 toggleAllSections נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  const toggleBtn = document.querySelector('button[onclick="toggleAllSections()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (contentSections.length === 0) {
    console.error('❌ לא נמצאו content-sections');
    return;
  }

  // בדיקה אם כל הסקשנים פתוחים או סגורים
  let allCollapsed = true;
  for (const section of contentSections) {
    const sectionBody = section.querySelector('.section-body');
    if (sectionBody && sectionBody.style.display !== 'none') {
      allCollapsed = false;
      break;
    }
  }

  // החלטה אם לסגור או לפתוח הכל
  const shouldCollapse = !allCollapsed;

  // עדכון כל הסקשנים
  for (const section of contentSections) {
    const sectionBody = section.querySelector('.section-body');
    const sectionToggleBtn = section.querySelector('.filter-toggle-btn');
    const sectionIcon = sectionToggleBtn ? sectionToggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
      sectionBody.style.display = shouldCollapse ? 'none' : 'block';

      // עדכון האייקון של כל סקשן
      if (sectionIcon) {
        sectionIcon.textContent = shouldCollapse ? '▼' : '▲';
      }
    }
  }

  // עדכון האייקון הראשי
  if (icon) {
    icon.textContent = shouldCollapse ? '▼' : '▲';
  }

  // שמירת המצב ב-localStorage
  localStorage.setItem('allSectionsCollapsed', shouldCollapse);

  console.log(`✅ כל הסקשנים ${shouldCollapse ? 'נסגרו' : 'נפתחו'}`);
}

function toggleTopSection() {
  console.log('🔄 toggleTopSection נקראה');
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
    sectionBody.style.display = isCollapsed ? 'block' : 'none';

    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('topSectionCollapsed', !isCollapsed);

    console.log(`✅ top-section ${isCollapsed ? 'נפתח' : 'נסגר'}`);
  }
}

function toggleExtraDataSection() {
  console.log('🔄 toggleExtraDataSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);
  const extraDataSection = contentSections[0]; // הסקשן הראשון - טבלאות עזר

  if (!extraDataSection) {
    console.error('❌ לא נמצא סקשן טבלאות עזר');
    return;
  }
  console.log('✅ סקשן טבלאות עזר נמצא:', extraDataSection);

  const sectionBody = extraDataSection.querySelector('.section-body');
  const toggleBtn = extraDataSection.querySelector('button[onclick="toggleExtraDataSection()"]');
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
    localStorage.setItem('extraDataSectionCollapsed', !isCollapsed);
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
function restoreTopSectionState() {
  // שחזור מצב הסקשן העליון
  const topCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
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
}

function restoreDesignsSectionState() {
  // שחזור מצב סקשן העיצובים
  const designsCollapsed = localStorage.getItem('designsSectionCollapsed') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const designsSection = contentSections[0];

  if (designsSection) {
    const sectionBody = designsSection.querySelector('.section-body');
    const toggleBtn = designsSection.querySelector('button[onclick="toggleDesignsSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && designsCollapsed) {
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

// פונקציה לשחזור מצב סקשן טבלאות עזר
function restoreExtraDataSectionState() {
  // שחזור מצב סקשן טבלאות עזר
  const extraDataCollapsed = localStorage.getItem('extraDataSectionCollapsed') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const extraDataSection = contentSections[0];

  if (extraDataSection) {
    const sectionBody = extraDataSection.querySelector('.section-body');
    const toggleBtn = extraDataSection.querySelector('button[onclick="toggleExtraDataSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && extraDataCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף טבלאות עזר
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 updateGridFromComponent called for extra data page with:', {
    selectedStatuses,
    selectedTypes,
    selectedDateRange,
    searchTerm
  });

  // קריאה לפונקציה הגלובלית אם זמינה
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'extra-data');
  } else {
    console.error('❌ updateGridFromComponentGlobal function not found');
    // ניסיון נוסף אחרי זמן קצר
    setTimeout(() => {
      if (typeof window.updateGridFromComponentGlobal === 'function') {
        console.log('🔄 Retrying updateGridFromComponentGlobal...');
        window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'extra-data');
      }
    }, 1000);
  }
};

// פונקציה לאתחול הדף
function initializeExtraDataPage() {
  console.log('🔄 אתחול דף טבלאות עזר...');

  // שחזור מצב הסגירה
  restoreTopSectionState();
  restoreAllSectionsState();

  console.log('✅ דף טבלאות עזר אותחל בהצלחה');
}

// הגדרת הפונקציות כגלובליות
window.openExtraDataDetails = openExtraDataDetails;
window.editExtraData = editExtraData;
window.deleteExtraData = deleteExtraData;
window.toggleTopSection = toggleTopSection;
window.toggleExtraDataSection = toggleExtraDataSection;
window.toggleAllSections = toggleAllSections;
window.restoreTopSectionState = restoreTopSectionState;
window.restoreExtraDataSectionState = restoreExtraDataSectionState;
window.restoreAllSectionsState = restoreAllSectionsState;
window.initializeExtraDataPage = initializeExtraDataPage;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// בדיקת זמינות פונקציות מיד אחרי הגדרתן
console.log('🔍 === EXTRA DATA FUNCTIONS CHECK ===');
console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);



// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');

  // אתחול הדף
  if (typeof initializeExtraDataPage === 'function') {
    initializeExtraDataPage();
  }

  // בדיקת זמינות פונקציות גלובליות
  setTimeout(() => {
    console.log('🔍 === CHECKING GLOBAL FUNCTIONS (EXTRA DATA) ===');
    console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);
    console.log('🔍 updateGridFromComponentGlobal available:', typeof window.updateGridFromComponentGlobal);

    if (typeof window.updateGridFromComponent === 'function') {
      console.log('✅ updateGridFromComponent is properly defined for extra data page');
    } else {
      console.warn('⚠️ updateGridFromComponent not available for extra data page');
    }
  }, 1000);

  console.log('דף טבלאות עזר נטען בהצלחה');

  // ניקוי הודעות קונסולה אחרי זמן קצר
  setTimeout(() => {
    console.log('🧹 Clearing console messages to reduce clutter...');
    if (console.clear) {
      console.clear();
    }
  }, 5000);
});
