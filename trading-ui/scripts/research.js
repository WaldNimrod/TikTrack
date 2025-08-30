// ===== קובץ JavaScript פשוט לדף תחקיר =====
/*
 * Research.js - Research Page Management
 * =====================================
 * 
 * This file contains all research page functionality for the TikTrack application.
 * It handles research data display and user interactions.
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * 
 * File: trading-ui/scripts/research.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// פונקציות בסיסיות
function openResearchDetails(id) {

}

function editResearch(id) {

}

function deleteResearch(id) {

}

// פונקציות לטריידים
function loadTrades() {

  if (typeof window.loadTradesData === 'function') {
    window.loadTradesData();
  } else {
    console.error('loadTradesData function not found');
  }
}

function showAddTradeModal() {

  if (typeof window.showAddTradeModal === 'function') {
    window.showAddTradeModal();
  } else {
    console.error('showAddTradeModal function not found');
  }
}

function filterTradesData(statuses, types, accounts, dateRange, searchTerm) {

  if (typeof window.filterTradesData === 'function') {
    window.filterTradesData(statuses, types, accounts, dateRange, searchTerm);
  } else {
    console.error('filterTradesData function not found');
  }
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {

  // מציאת כל הסקשנים
  const topSection = document.querySelector('.top-section');
  const contentSections = document.querySelectorAll('.content-section');

  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }

  // בדיקה אם כל הסקשנים סגורים
  const topSectionBody = topSection.querySelector('.section-body');
  const isTopCollapsed = topSectionBody.style.display === 'none';

  // מצב הסקשנים האחרים
  let allSectionsCollapsed = isTopCollapsed;

  contentSections.forEach((section, index) => {
    const sectionBody = section.querySelector('.section-body');
    if (sectionBody && sectionBody.style.display !== 'none') {
      allSectionsCollapsed = false;
    }
  });

  // החלטה: אם כל הסקשנים סגורים - פתח הכל, אחרת - סגור הכל
  const shouldOpen = allSectionsCollapsed;

  // עדכון top-section
  if (topSectionBody) {
    topSectionBody.style.display = shouldOpen ? 'block' : 'none';
  }

  // עדכון content-sections
  contentSections.forEach((section, index) => {
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector('button[onclick*="toggle"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
      sectionBody.style.display = shouldOpen ? 'block' : 'none';

      // עדכון האייקון
      if (icon) {
        icon.textContent = shouldOpen ? '▲' : '▼';
      }
    }
  });

  // עדכון האייקון של הכפתור הראשי
  const mainToggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;
  if (mainIcon) {
    mainIcon.textContent = shouldOpen ? '▲' : '▼';
  }

  // שמירת המצב ב-localStorage
  localStorage.setItem('allSectionsCollapsed', !shouldOpen);

}

function toggleResearchSection() {

  const contentSections = document.querySelectorAll('.content-section');

  const researchSection = contentSections[1]; // הסקשן השני - טריידים

  if (!researchSection) {
    console.error('❌ לא נמצא סקשן טריידים');
    return;
  }

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
function restoreTopSectionState() {
  // שחזור מצב כל הסקשנים
  const allSectionsCollapsed = localStorage.getItem('allSectionsCollapsed') === 'true';
  const topSection = document.querySelector('.top-section');
  const contentSections = document.querySelectorAll('.content-section');

  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && allSectionsCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב content-sections
  contentSections.forEach((section, index) => {
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector('button[onclick*="toggle"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && allSectionsCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  });
}

function restoreResearchSectionState() {
  // שחזור מצב סקשן הטריידים
  const researchCollapsed = localStorage.getItem('researchSectionCollapsed') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const researchSection = contentSections[1];

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

  // שחזור מצב סקשן הסיכום
  const summaryCollapsed = localStorage.getItem('summarySectionCollapsed') === 'true';
  const summarySection = contentSections[0];

  if (summarySection) {
    const sectionBody = summarySection.querySelector('.section-body');
    const toggleBtn = summarySection.querySelector('button[onclick="toggleSummarySection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && summaryCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
}

// פונקציות נוספות
function resetAllFiltersAndReloadData() {

}

// פונקציה להפעלה בטעינת הדף
function initializeResearchPage() {

  // שחזור מצב הסגירה
  restoreTopSectionState();
  restoreResearchSectionState();
  restoreAccountsSectionState();

  // טעינת נתונים

  if (typeof window.loadTrades === 'function') {
    window.loadTrades();
  } else {
    console.error('❌ loadTrades function not found');
  }

  }

/**
 * סגירה/פתיחה של סקשן הסיכום
 */
function toggleSummarySection() {
  const contentSections = document.querySelectorAll('.content-section');
  const summarySection = contentSections[0]; // הסקשן הראשון - סיכום

  if (!summarySection) {
    console.error('❌ לא נמצא סקשן סיכום');
    return;
  }

  const sectionBody = summarySection.querySelector('.section-body');
  const toggleBtn = summarySection.querySelector('button[onclick="toggleSummarySection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';
    sectionBody.style.display = isCollapsed ? 'block' : 'none';

    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב
    localStorage.setItem('summarySectionCollapsed', !isCollapsed);

    }
}

/**
 * רענון נתוני הסיכום
 */
function refreshSummaryData() {
  // כאן אפשר להוסיף קריאה לשרת לקבלת נתונים מעודכנים
  // loadSummaryData();

  }

/**
 * שחזור מצב סקשן החשבונות
 */
function restoreAccountsSectionState() {
  const savedState = localStorage.getItem('accountsSectionCollapsed');
  if (savedState === 'true') {
    const accountsSection = document.querySelector('.accounts-section');
    if (accountsSection) {
      const sectionBody = accountsSection.querySelector('.section-body');
      const toggleBtn = accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');

      if (sectionBody && toggleBtn) {
        sectionBody.style.display = 'none';
        toggleBtn.textContent = 'הצג חשבונות';
        }
    }
  } else {
    ');
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף התחקיר
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  // קריאה לפונקציה הגלובלית אם זמינה
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'research');
  } else {
    console.error('❌ updateGridFromComponentGlobal function not found');
    // ניסיון נוסף אחרי זמן קצר
    setTimeout(() => {
      if (typeof window.updateGridFromComponentGlobal === 'function') {
        window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'research');
      }
    }, 1000);
  }
};

// פונקצית סידור מותאמת לטבלת טריידים בדף התחקיר - משתמשת בפונקציה הגלובלית
function sortResearchTable(columnIndex) {
  if (typeof window.sortTable === 'function') {
    window.sortTable(
      columnIndex,
      window.tradesData || [],
      'trades',
      window.updateTradesTable
    );
  } else {
    console.error('❌ sortTable function not found in tables.js');
  }
}

// הגדרת הפונקציות כגלובליות
window.openResearchDetails = openResearchDetails;
window.editResearch = editResearch;
window.deleteResearch = deleteResearch;
window.loadTrades = loadTrades;
window.showAddTradeModal = showAddTradeModal;
window.filterTradesData = filterTradesData;
window.toggleTopSection = toggleTopSection;
window.toggleResearchSection = toggleResearchSection;
window.toggleAccountsSection = toggleAccountsSection;
window.restoreTopSectionState = restoreTopSectionState;
window.restoreResearchSectionState = restoreResearchSectionState;
window.restoreAccountsSectionState = restoreAccountsSectionState;
window.initializeResearchPage = initializeResearchPage;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;
window.toggleSummarySection = toggleSummarySection;
window.refreshSummaryData = refreshSummaryData;
window.sortTable = sortResearchTable;

// בדיקת זמינות פונקציות מיד אחרי הגדרתן
// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  // שחזור מצב הסגירה
  restoreTopSectionState();
  restoreResearchSectionState();
  restoreAccountsSectionState();

  // בדיקת זמינות פונקציות גלובליות
  setTimeout(() => {
    ===');
    if (typeof window.updateGridFromComponent === 'function') {
      } else {
      console.warn('⚠️ updateGridFromComponent not available for research page');
    }
  }, 1000);

  // ניקוי הודעות קונסולה אחרי זמן קצר
  setTimeout(() => {
    if (console.clear) {
      console.clear();
    }
  }, 5000);
});
