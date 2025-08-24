// ===== קובץ JavaScript ייעודי לדף טבלאות עזר =====
/*
 * DB-Extradata.js - Database Extra Data Page Management
 * ===================================================
 * 
 * This file contains all database extra data management functionality for the TikTrack application.
 * It handles display and management of auxiliary database tables.
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * 
 * File: trading-ui/scripts/db-extradata.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// ===== פונקציות לפתיחה/סגירה של סקשנים =====

// פונקציה לפתיחה/סגירה של כל הסקשנים - משתמשת בפונקציה הגלובלית מ-main.js
function toggleAllSections() {
    console.log('🔄 toggleAllSections נקראה - שימוש בפונקציה הגלובלית');
    if (typeof window.toggleAllSections === 'function') {
        window.toggleAllSections();
    } else {
        console.error('❌ הפונקציה הגלובלית toggleAllSections לא זמינה');
    }
}

// פונקציה לפתיחה/סגירה של סקשן מטבעות
function toggleCurrenciesSection() {
    console.log('🔄 toggleCurrenciesSection נקראה');

    const contentSections = document.querySelectorAll('.content-section');
    const currenciesSection = contentSections[0]; // הסקשן הראשון - מטבעות

    if (!currenciesSection) {
        console.error('❌ לא נמצא סקשן מטבעות');
        return;
    }

    const sectionBody = currenciesSection.querySelector('.section-body');
    const toggleBtn = currenciesSection.querySelector('button[onclick="toggleCurrenciesSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';
        sectionBody.style.display = isCollapsed ? 'block' : 'none';

        if (icon) {
            icon.textContent = isCollapsed ? '▲' : '▼';
        }

        // שמירת המצב ב-localStorage
        localStorage.setItem('dbExtradataCurrenciesSectionCollapsed', !isCollapsed);

        console.log(`✅ סקשן מטבעות ${isCollapsed ? 'נפתח' : 'נסגר'}`);
    }
}

// פונקציה לפתיחה/סגירה של סקשן סוגי קישור
function toggleNoteRelationTypesSection() {
    console.log('🔄 toggleNoteRelationTypesSection נקראה');

    const contentSections = document.querySelectorAll('.content-section');
    const noteRelationTypesSection = contentSections[1]; // הסקשן השני - סוגי קישור

    if (!noteRelationTypesSection) {
        console.error('❌ לא נמצא סקשן סוגי קישור');
        return;
    }

    const sectionBody = noteRelationTypesSection.querySelector('.section-body');
    const toggleBtn = noteRelationTypesSection.querySelector('button[onclick="toggleNoteRelationTypesSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';
        sectionBody.style.display = isCollapsed ? 'block' : 'none';

        if (icon) {
            icon.textContent = isCollapsed ? '▲' : '▼';
        }

        // שמירת המצב ב-localStorage
        localStorage.setItem('dbExtradataNoteRelationTypesSectionCollapsed', !isCollapsed);

        console.log(`✅ סקשן סוגי קישור ${isCollapsed ? 'נפתח' : 'נסגר'}`);
    }
}

// פונקציה לשחזור מצב הסגירה
function restoreSectionsState() {
    console.log('🔄 שחזור מצב הסגירה...');

    // שחזור מצב הסקשן העליון
    const topCollapsed = localStorage.getItem('dbExtradataTopSectionCollapsed') === 'true';
    const topSection = document.querySelector('.top-section');

    if (topSection) {
        const sectionBody = topSection.querySelector('.section-body');
        const toggleBtn = topSection.querySelector('button[onclick="toggleAllSections()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && topCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }

    // שחזור מצב סקשן המטבעות
    const currenciesCollapsed = localStorage.getItem('dbExtradataCurrenciesSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const currenciesSection = contentSections[0];

    if (currenciesSection) {
        const sectionBody = currenciesSection.querySelector('.section-body');
        const toggleBtn = currenciesSection.querySelector('button[onclick="toggleCurrenciesSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && currenciesCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }

    // שחזור מצב סקשן סוגי הקישור
    const noteRelationTypesCollapsed = localStorage.getItem('dbExtradataNoteRelationTypesSectionCollapsed') === 'true';
    const noteRelationTypesSection = contentSections[1];

    if (noteRelationTypesSection) {
        const sectionBody = noteRelationTypesSection.querySelector('.section-body');
        const toggleBtn = noteRelationTypesSection.querySelector('button[onclick="toggleNoteRelationTypesSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && noteRelationTypesCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }

    console.log('✅ מצב הסגירה שוחזר');
}

// פונקציה לטעינת נתוני מטבעות
async function loadCurrenciesData() {
    console.log('🔄 טוען נתוני מטבעות...');

    try {
        const response = await fetch('/api/v1/currencies/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            updateCurrenciesTable(result.data);
            updateCurrenciesCount(result.data.length);
            console.log(`✅ נטענו ${result.data.length} מטבעות`);
        } else {
            throw new Error(result.error?.message || 'שגיאה בטעינת מטבעות');
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת מטבעות:', error);
        showCurrenciesError();
    }
}

// פונקציה לעדכון טבלת מטבעות
function updateCurrenciesTable(currencies) {
    const tbody = document.querySelector('#currenciesTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת מטבעות');
        return;
    }

    if (currencies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">אין נתונים</td></tr>';
        return;
    }

    const rows = currencies.map(currency => `
    <tr>
      <td class="ticker-cell" data-type="${currency.symbol || ''}">${currency.symbol || ''}</td>
      <td>${currency.name || ''}</td>
      <td>${currency.usd_rate || ''}</td>
      <td>${currency.id || ''}</td>
      <td data-date="${currency.created_at}">${currency.created_at || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editCurrency(${currency.id})" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCurrency(${currency.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

    tbody.innerHTML = rows;
}

// פונקציה לעדכון מספר המטבעות
function updateCurrenciesCount(count) {
    // עדכון מונה הטבלה עם שם מהכותרת
    const countElement = document.getElementById('currenciesCount');
    if (countElement) {
        countElement.textContent = `💱 מטבעות: ${count}`;
    }

    // עדכון הסטטיסטיקות הכלליות
    const summaryCountElement = document.getElementById('summaryCurrenciesCount');
    if (summaryCountElement) {
        summaryCountElement.textContent = count;
    }

    const totalRecordsElement = document.getElementById('totalRecords');
    if (totalRecordsElement) {
        const currentTotal = parseInt(totalRecordsElement.textContent) || 0;
        totalRecordsElement.textContent = currentTotal + count;
    }
}

// פונקציה להצגת שגיאה בטבלת מטבעות
function showCurrenciesError() {
    const tbody = document.querySelector('#currenciesTable tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
    }
}

// פונקציה לטעינת נתוני סוגי קישור הערות
async function loadNoteRelationTypesData() {
    console.log('🔄 טוען נתוני סוגי קישור הערות...');

    try {
        // כרגע אין API endpoint לסוגי קישור, נשתמש בנתונים סטטיים
        const noteRelationTypes = [
            { id: 1, note_relation_type: 'account', description: 'קישור לחשבון' },
            { id: 2, note_relation_type: 'trade', description: 'קישור לטרייד' },
            { id: 3, note_relation_type: 'trade_plan', description: 'קישור לתכנית טרייד' },
            { id: 4, note_relation_type: 'ticker', description: 'קישור לטיקר' }
        ];

        updateNoteRelationTypesTable(noteRelationTypes);
        updateNoteRelationTypesCount(noteRelationTypes.length);
        console.log(`✅ נטענו ${noteRelationTypes.length} סוגי קישור`);
    } catch (error) {
        console.error('❌ שגיאה בטעינת סוגי קישור:', error);
        showNoteRelationTypesError();
    }
}

// פונקציה לעדכון טבלת סוגי קישור
function updateNoteRelationTypesTable(noteRelationTypes) {
    const tbody = document.querySelector('#noteRelationTypesTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת סוגי קישור');
        return;
    }

    if (noteRelationTypes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">אין נתונים</td></tr>';
        return;
    }

    const rows = noteRelationTypes.map(type => {
        // המרת סוג לפילטר
        const typeForFilter = type.note_relation_type === 'account' ? 'חשבון' :
            type.note_relation_type === 'trade' ? 'טרייד' :
                type.note_relation_type === 'trade_plan' ? 'תוכנית' :
                    type.note_relation_type === 'ticker' ? 'טיקר' : (type.note_relation_type || '');

        return `
    <tr>
      <td data-type="${typeForFilter}">${type.note_relation_type || ''}</td>
      <td>${type.description || ''}</td>
      <td>${type.id || ''}</td>
      <td data-date="${type.created_at}">${type.created_at || ''}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editNoteRelationType(${type.id})" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNoteRelationType(${type.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `}).join('');

    tbody.innerHTML = rows;
}

// פונקציה לעדכון מספר סוגי הקישור
function updateNoteRelationTypesCount(count) {
    // עדכון מונה הטבלה עם שם מהכותרת
    const countElement = document.getElementById('noteRelationTypesCount');
    if (countElement) {
        countElement.textContent = `🔗 סוגי קישור: ${count}`;
    }

    // עדכון הסטטיסטיקות הכלליות
    const summaryCountElement = document.getElementById('summaryNoteRelationTypesCount');
    if (summaryCountElement) {
        summaryCountElement.textContent = count;
    }

    const totalRecordsElement = document.getElementById('totalRecords');
    if (totalRecordsElement) {
        const currentTotal = parseInt(totalRecordsElement.textContent) || 0;
        totalRecordsElement.textContent = currentTotal + count;
    }
}

// פונקציה להצגת שגיאה בטבלת סוגי קישור
function showNoteRelationTypesError() {
    const tbody = document.querySelector('#noteRelationTypesTable tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
    }
}

// פונקציות עריכה ומחיקה (placeholder)
function editCurrency(id) {
    console.log('עריכת מטבע:', id);
    alert(`עריכת מטבע ${id} - לא מומשה עדיין`);
}

function deleteCurrency(id) {
    console.log('מחיקת מטבע:', id);
    if (confirm('האם אתה בטוח שברצונך למחוק מטבע זה?')) {
        alert(`מחיקת מטבע ${id} - לא מומשה עדיין`);
    }
}

function editNoteRelationType(id) {
    console.log('עריכת סוג קישור:', id);
    alert(`עריכת סוג קישור ${id} - לא מומשה עדיין`);
}

function deleteNoteRelationType(id) {
    console.log('מחיקת סוג קישור:', id);
    if (confirm('האם אתה בטוח שברצונך למחוק סוג קישור זה?')) {
        alert(`מחיקת סוג קישור ${id} - לא מומשה עדיין`);
    }
}

// פונקציה לעדכון סטטיסטיקות כלליות
function updateSummaryStats() {
    const currenciesCount = document.getElementById('summaryCurrenciesCount');
    const noteRelationTypesCount = document.getElementById('summaryNoteRelationTypesCount');
    const totalRecords = document.getElementById('totalRecords');

    if (currenciesCount && noteRelationTypesCount && totalRecords) {
        const currencies = parseInt(currenciesCount.textContent) || 0;
        const noteTypes = parseInt(noteRelationTypesCount.textContent) || 0;
        const total = currencies + noteTypes;

        totalRecords.textContent = total;
    }
}

// פונקציה לטעינת כל הנתונים
async function loadAllData() {
    console.log('🔄 טוען את כל הנתונים...');

    // טעינת נתונים במקביל
    await Promise.all([
        loadCurrenciesData(),
        loadNoteRelationTypesData()
    ]);

    // עדכון סטטיסטיקות כלליות
    updateSummaryStats();

    console.log('✅ כל הנתונים נטענו בהצלחה');
}

// הגדרת הפונקציות כגלובליות
window.loadCurrenciesData = loadCurrenciesData;
window.loadNoteRelationTypesData = loadNoteRelationTypesData;
window.loadAllData = loadAllData;
window.editCurrency = editCurrency;
window.deleteCurrency = deleteCurrency;
window.editNoteRelationType = editNoteRelationType;
window.deleteNoteRelationType = deleteNoteRelationType;

// פונקציה לעדכון טקסט טעינה
function updateLoadingText() {
    const currenciesCountElement = document.getElementById('currenciesCount');
    const noteRelationTypesCountElement = document.getElementById('noteRelationTypesCount');

    if (currenciesCountElement) {
        currenciesCountElement.textContent = '💱 מטבעות: טוען...';
    }

    if (noteRelationTypesCountElement) {
        noteRelationTypesCountElement.textContent = '🔗 סוגי קישור: טוען...';
    }
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED (DB_EXTRADATA) ===');

    // שחזור מצב הסגירה
    restoreSectionsState();

    // עדכון טקסט טעינה
    updateLoadingText();

    // טעינת הנתונים
    loadAllData();

    console.log('דף טבלאות עזר נטען בהצלחה');
});
