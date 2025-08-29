// ===== קובץ JavaScript לדף בסיס נתונים =====
/*
 * Database.js - Database Page Management
 * =====================================
 * 
 * This file contains all database page functionality for the TikTrack application.
 * It handles displaying all tables in one unified view with sorting and filtering.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - notification-system.js (for notifications)
 * 
 * Table Mapping:
 * - Uses all table types from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/database.js
 * Version: 2.3
 * Last Updated: August 28, 2025
 */

// משתנים גלובליים
let allData = {
  accounts: [],
  trades: [],
  tickers: [],
  tradePlans: [],
  executions: [],
  cashFlows: [],
  alerts: [],
  notes: [],
  constraints: []
};

// פונקציה לבדיקה אם ערך הוא מספרי
function isNumeric(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// פונקציה לעיצוב מספרים
function formatNumber(value) {
  if (!isNumeric(value)) {
    return value || '';
  }
  return parseFloat(value).toLocaleString('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// פונקציה ליצירת כפתור עריכה
function createEditButton(onClick) {
  return `<button class="btn btn-sm btn-secondary" onclick="${onClick}" title="ערוך">✏️</button>`;
}

// פונקציה ליצירת כפתור מחיקה
function createDeleteButton(onClick) {
  return `<button class="btn btn-sm btn-danger" onclick="${onClick}" title="מחק">🗑️</button>`;
}

// פונקציה לפתיחה/סגירה של סקשן עליון
function toggleTopSection() {
  const topSection = document.querySelector('.top-section');
  const contentSections = document.querySelectorAll('.content-section');
  const toggleBtn = topSection ? topSection.querySelector('button[onclick="toggleTopSection()"]') : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }

  // בדיקה אם כל הסקשנים סגורים
  const topSectionBody = topSection.querySelector('.section-body');
  const isTopCollapsed = topSectionBody ? topSectionBody.style.display === 'none' : false;

  let allSectionsCollapsed = isTopCollapsed;
  contentSections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    if (sectionBody && sectionBody.style.display !== 'none') {
      allSectionsCollapsed = false;
    }
  });

  // אם כל הסקשנים סגורים - פתח את כולם
  // אם יש סקשנים פתוחים - סגור את כולם
  const shouldCollapse = !allSectionsCollapsed;

  // סגירה/פתיחה של top-section
  if (topSectionBody) {
    topSectionBody.style.display = shouldCollapse ? 'none' : 'block';
    localStorage.setItem('databaseTopSectionHidden', shouldCollapse);
  }

  // סגירה/פתיחה של כל content-sections
  contentSections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    const sectionToggleBtn = section.querySelector('button[onclick="toggleMainSection()"]');
    const sectionIcon = sectionToggleBtn ? sectionToggleBtn.querySelector('.filter-icon') : null;
    const sectionTitle = section.querySelector('.table-title').textContent.trim();

    if (sectionBody) {
      sectionBody.style.display = shouldCollapse ? 'none' : 'block';
      localStorage.setItem(`databaseSectionHidden_${sectionTitle}`, shouldCollapse);

      // עדכון האייקון של הסקשן
      if (sectionIcon) {
        sectionIcon.textContent = shouldCollapse ? '▼' : '▲';
      }
    }
  });

  // עדכון האייקון של הכפתור הראשי
  if (icon) {
    icon.textContent = shouldCollapse ? '▼' : '▲';
  }
}

// פונקציה לפתיחה/סגירה של סקשן תוכן
function toggleMainSection() {
  const contentSections = document.querySelectorAll('.content-section');

  // מציאת הסקשן הנוכחי (הכי קרוב לכפתור שנלחץ)
  const clickedButton = window.event ? window.event.target.closest('button') : null;
  const currentSection = clickedButton ? clickedButton.closest('.content-section') : contentSections[0];

  if (!currentSection) {
    console.error('❌ לא נמצא סקשן');
    return;
  }

  const sectionBody = currentSection.querySelector('.section-body');
  const toggleBtn = currentSection.querySelector('button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.style.display = 'block';
      if (icon) icon.textContent = '▲';
    } else {
      sectionBody.style.display = 'none';
      if (icon) icon.textContent = '▼';
    }

    // שמירת מצב הסקשן
    const sectionTitle = currentSection.querySelector('.table-title').textContent.trim();
    localStorage.setItem(`databaseSectionHidden_${sectionTitle}`, !isCollapsed);
  }
}

// פונקציה לשחזור מצב הסקשנים
function restoreDatabaseSectionState() {
  // שחזור מצב top-section
  const topSectionHidden = localStorage.getItem('databaseTopSectionHidden') === 'true';
  const topSection = document.querySelector('.top-section');
  if (topSection && topSectionHidden) {
    const topSectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (topSectionBody) {
      topSectionBody.style.display = 'none';
      if (icon) icon.textContent = '▼';
    }
  }

  // שחזור מצב content-sections
  const contentSections = document.querySelectorAll('.content-section');
  contentSections.forEach(section => {
    const sectionTitle = section.querySelector('.table-title').textContent.trim();
    const isHidden = localStorage.getItem(`databaseSectionHidden_${sectionTitle}`) === 'true';

    if (isHidden) {
      const sectionBody = section.querySelector('.section-body');
      const toggleBtn = section.querySelector('button[onclick="toggleMainSection()"]');
      const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

      if (sectionBody) {
        sectionBody.style.display = 'none';
        if (icon) icon.textContent = '▼';
      }
    }
  });
}


