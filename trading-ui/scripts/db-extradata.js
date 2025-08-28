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

// פונקציה לפתיחה/סגירה של כל הסקשנים
function toggleAllSections() {
    // נמנע מלולאה אינסופית על ידי בדיקה אם הפונקציה הגלובלית קיימת
    if (typeof window.globalToggleAllSections === 'function') {
        window.globalToggleAllSections();
    } else {
        // מימוש מקומי אם הפונקציה הגלובלית לא זמינה
        const contentSections = document.querySelectorAll('.content-section');
        const topSection = document.querySelector('.top-section');

        // בדיקה אם כל הסקשנים פתוחים או סגורים
        let allCollapsed = true;
        let allExpanded = true;

        // בדיקת סקשן עליון
        if (topSection) {
            const topSectionBody = topSection.querySelector('.section-body');
            if (topSectionBody) {
                if (topSectionBody.style.display !== 'none') {
                    allCollapsed = false;
                } else {
                    allExpanded = false;
                }
            }
        }

        // בדיקת סקשני תוכן
        contentSections.forEach(section => {
            const sectionBody = section.querySelector('.section-body');
            if (sectionBody) {
                if (sectionBody.style.display !== 'none') {
                    allCollapsed = false;
                } else {
                    allExpanded = false;
                }
            }
        });

        // החלטה אם לסגור או לפתוח הכל
        const shouldCollapse = !allCollapsed;

        // סגירה/פתיחה של סקשן עליון
        if (topSection) {
            const topSectionBody = topSection.querySelector('.section-body');
            const toggleBtn = topSection.querySelector('button[onclick="toggleAllSections()"]');
            const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

            if (topSectionBody) {
                topSectionBody.style.display = shouldCollapse ? 'none' : 'block';
                if (icon) {
                    icon.textContent = shouldCollapse ? '▼' : '▲';
                }
            }
        }

        // סגירה/פתיחה של סקשני תוכן
        contentSections.forEach(section => {
            const sectionBody = section.querySelector('.section-body');
            const toggleBtn = section.querySelector('.filter-toggle-btn');
            const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

            if (sectionBody) {
                sectionBody.style.display = shouldCollapse ? 'none' : 'block';
                if (icon) {
                    icon.textContent = shouldCollapse ? '▼' : '▲';
                }
            }
        });

        // שמירת המצב ב-localStorage
        localStorage.setItem('dbExtradataAllSectionsCollapsed', shouldCollapse);
    }
}

// פונקציה לפתיחה/סגירה של סקשן מטבעות
function toggleCurrenciesSection() {
    console.log('🔄 toggleCurrenciesSection called');
    
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
        console.log('💾 Saved currencies section state to localStorage:', !isCollapsed);
    }
}

// פונקציה לפתיחה/סגירה של סקשן סוגי קישור
function toggleNoteRelationTypesSection() {

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

        // סקשן סוגי קישור
    }
}

// פונקציה לשחזור מצב הסגירה
function restoreSectionsState() {
    console.log('🔄 Restoring sections state...');

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
    console.log('🔍 Currencies section collapsed state:', currenciesCollapsed);
    
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
            console.log('✅ Currencies section restored to collapsed state');
        } else {
            console.log('ℹ️ Currencies section restored to expanded state');
        }
    } else {
        console.log('⚠️ Currencies section not found');
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

    // מצב הסגירה שוחזר
}

// פונקציה לטעינת נתוני מטבעות
async function loadCurrenciesData() {

    try {
        const response = await fetch('/api/v1/currencies/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            updateCurrenciesTable(result.data);
            updateCurrenciesCount(result.data.length);
            // נטענו מטבעות
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

    const rows = currencies.map(currency => {
        // בדיקה אם זה רשומת הבסיס (מזהה 1)
        const isBaseRecord = currency.id === 1;
        const isProtected = isBaseRecord;

        return `
    <tr ${isProtected ? 'class="table-warning"' : ''}>
      <td class="ticker-cell" data-type="${currency.symbol || ''}">${currency.symbol || ''}</td>
      <td>${currency.name || ''}</td>
      <td>${currency.usd_rate || ''}</td>
      <td>${currency.id || ''}</td>
      <td data-date="${currency.created_at}">${currency.created_at || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" 
                        onclick="editCurrencyRecord(${currency.id})" 
                        title="${isProtected ? 'רשומת בסיס - לא ניתן לערוך' : 'ערוך'}"
                        ${isProtected ? 'disabled' : ''}>✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" 
                        onclick="deleteCurrencyRecord(${currency.id})" 
                        title="${isProtected ? 'רשומת בסיס - לא ניתן למחוק' : 'מחק'}"
                        ${isProtected ? 'disabled' : ''}>🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        ${isProtected ? '<small class="text-muted d-block mt-1">🔒 רשומת בסיס מוגנת</small>' : ''}
      </td>
    </tr>
  `;
    }).join('');

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

    try {
        const response = await fetch('/api/v1/note_relation_types/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            updateNoteRelationTypesTable(result.data);
            updateNoteRelationTypesCount(result.data.length);
            // נטענו סוגי קישור
        } else {
            throw new Error(result.error?.message || 'שגיאה בטעינת סוגי קישור');
        }
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
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">אין נתונים</td></tr>';
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
      <td>${type.id || ''}</td>
      <td data-date="${type.created_at}">${type.created_at || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editNoteRelationTypeRecord(${type.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" onclick="deleteNoteRelationTypeRecord(${type.id})" title="מחק">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
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
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
    }
}

// פונקציות עריכה ומחיקה (placeholder)
// פונקציות אלו הוחלפו בפונקציות החדשות עם שמות ברורים יותר
// editCurrency, deleteCurrency, editNoteRelationType, deleteNoteRelationType

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
    // טעינת נתונים במקביל
    await Promise.all([
        loadCurrenciesData(),
        loadNoteRelationTypesData()
    ]);

    // עדכון סטטיסטיקות כלליות
    updateSummaryStats();
}

// הגדרת הפונקציות כגלובליות
window.loadCurrenciesData = loadCurrenciesData;
window.loadNoteRelationTypesData = loadNoteRelationTypesData;
window.loadAllData = loadAllData;
// window.editCurrency = editCurrencyRecord; // This line is removed as per the edit hint
// window.deleteCurrency = deleteCurrencyRecord; // This line is removed as per the edit hint
// window.editNoteRelationType = editNoteRelationTypeRecord; // This line is removed as per the edit hint
// window.deleteNoteRelationType = deleteNoteRelationTypeRecord; // This line is removed as per the edit hint

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
    // שחזור מצב הסגירה
    restoreSectionsState();

    // עדכון טקסט טעינה
    updateLoadingText();

    // טעינת הנתונים
    loadAllData();
});

// ===== פונקציות וולידציה =====

// פונקציה לוולידציה של סמל מטבע (משתמשת במערכת החדשה)
function validateCurrencySymbol(input) {
    // בדיקה שהפרמטר קיים ותקין
    if (!input || !input.value) {
        console.warn('validateCurrencySymbol: input parameter is invalid');
        return false;
    }
    
    const symbol = input.value.trim().toUpperCase();
    
    // עדכון הערך לשדה
    input.value = symbol;
    
    // שימוש במערכת החדשה
    if (window.validateCurrencySymbol) {
        const result = window.validateCurrencySymbol(symbol);
        if (result === true) {
            if (window.showFieldSuccess) {
                window.showFieldSuccess(input);
            }
            return true;
        } else {
            if (window.showFieldError) {
                window.showFieldError(input, result);
            }
            return false;
        }
    } else {
        // Fallback לוולידציה בסיסית
        const symbolPattern = /^[A-Z]+$/;
        if (!symbolPattern.test(symbol)) {
            if (window.showFieldError) {
                window.showFieldError(input, 'סמל מטבע חייב להכיל רק אותיות אנגליות גדולות');
            }
            return false;
        }
        if (symbol.length > 10) {
            if (window.showFieldError) {
                window.showFieldError(input, 'סמל מטבע לא יכול להיות יותר מ-10 תווים');
            }
            return false;
        }
        if (window.showFieldSuccess) {
            window.showFieldSuccess(input);
        }
        return true;
    }
}

// פונקציה לוולידציה של שם מטבע
function validateCurrencyName(input) {
    const name = input.value.trim();

    if (name.length === 0) {
        input.classList.add('is-invalid');
        return false;
    }

    if (name.length > 100) {
        input.classList.add('is-invalid');
        return false;
    }

    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

// פונקציה לוולידציה של שער דולר
function validateCurrencyUsdRate(input) {
    const rate = parseFloat(input.value);

    if (isNaN(rate) || rate < 0) {
        input.classList.add('is-invalid');
        return false;
    }

    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

// פונקציה לוולידציה של כל הטופס
function validateCurrencyForm() {
    // בדיקה אם זה מודל הוספה או עריכה
    const isEditMode = document.getElementById('editCurrencySymbol') !== null;

    const symbolInput = isEditMode ?
        document.getElementById('editCurrencySymbol') :
        document.getElementById('currencySymbol');
    const nameInput = isEditMode ?
        document.getElementById('editCurrencyName') :
        document.getElementById('currencyName');
    const rateInput = isEditMode ?
        document.getElementById('editCurrencyUsdRate') :
        document.getElementById('currencyUsdRate');

    const symbolValid = validateCurrencySymbol(symbolInput);
    const nameValid = validateCurrencyName(nameInput);
    const rateValid = validateCurrencyUsdRate(rateInput);

    return symbolValid && nameValid && rateValid;
}

// ===== פונקציות CRUD למטבעות (Currencies) =====

// פונקציה להוספת מטבע חדש
function addCurrencyRecord() {
    showAddCurrencyModal();
}

// פונקציה לעריכת מטבע
function editCurrencyRecord(id) {
    // בדיקה אם זה רשומת הבסיס (מזהה 1)
    if (id === 1) {
        if (window.showNotification) {
            window.showNotification('לא ניתן לערוך רשומת בסיס מוגנת', 'warning');
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('רשומה מוגנת', 'לא ניתן לערוך רשומת בסיס מוגנת');
            } else {
                window.showWarningNotification('רשומה מוגנת', 'לא ניתן לערוך רשומת בסיס מוגנת');
            }
        }
        return;
    }
    showEditCurrencyModal(id);
}

// פונקציה למחיקת מטבע
function deleteCurrencyRecord(id) {
    // בדיקה אם זה רשומת הבסיס (מזהה 1)
    if (id === 1) {
        if (window.showNotification) {
            window.showNotification('לא ניתן למחוק רשומת בסיס מוגנת', 'warning');
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('רשומה מוגנת', 'לא ניתן למחוק רשומת בסיס מוגנת');
            } else {
                window.showWarningNotification('רשומה מוגנת', 'לא ניתן למחוק רשומת בסיס מוגנת');
            }
        }
        return;
    }
    showDeleteCurrencyModal(id);
}

// פונקציה להצגת מודל הוספת מטבע
function showAddCurrencyModal() {
    const modalHtml = `
        <div class="modal fade" id="addCurrencyModal" tabindex="-1" aria-labelledby="addCurrencyModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-primary">
                        <h5 class="modal-title text-white" id="addCurrencyModalLabel">הוסף מטבע חדש</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addCurrencyForm" novalidate>
                            <div class="mb-3">
                                <label for="currencySymbol" class="form-label">סמל מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="currencySymbol" 
                                       name="symbol" 
                                       required 
                                       maxlength="10" 
                                       pattern="^[A-Z]+$"
                                       placeholder="USD">
                                <div class="form-text">רק אותיות אנגליות גדולות (למשל: USD, EUR, ILS)</div>
                            </div>
                            <div class="mb-3">
                                <label for="currencyName" class="form-label">שם מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="currencyName" 
                                       name="name" 
                                       required 
                                       maxlength="100" 
                                       placeholder="US Dollar">
                            </div>
                            <div class="mb-3">
                                <label for="currencyUsdRate" class="form-label">שער דולר</label>
                                <input type="number" 
                                       class="form-control" 
                                       id="currencyUsdRate" 
                                       name="usd_rate" 
                                       step="0.000001" 
                                       min="0" 
                                       value="1.0" 
                                       placeholder="1.0">
                                <div class="form-text">שער המרה לדולר אמריקאי (ברירת מחדל: 1.0)</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="saveCurrencyRecord()">שמור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // הסרת מודל קיים אם יש
    const existingModal = document.getElementById('addCurrencyModal');
    if (existingModal) {
        existingModal.remove();
    }

    // הוספת המודל לדף
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addCurrencyModal'));
    
    // ניקוי וולידציות לפני הצגת המודל
    modal._element.addEventListener('shown.bs.modal', function() {
        clearModalValidations('addCurrencyForm');
        setupModalValidations('addCurrencyForm');
    });
    
    modal.show();
}

// פונקציה להצגת מודל עריכת מטבע
function showEditCurrencyModal(id) {
    // טעינת נתוני המטבע
    fetch(`/api/v1/currencies/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                const currency = result.data;
                showEditCurrencyModalWithData(currency);
            } else {
                showNotification('שגיאה בטעינת נתוני המטבע', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading currency:', error);
            showNotification('שגיאה בטעינת נתוני המטבע', 'error');
        });
}

// פונקציה להצגת מודל עריכת מטבע עם נתונים
function showEditCurrencyModalWithData(currency) {
    const modalHtml = `
        <div class="modal fade" id="editCurrencyModal" tabindex="-1" aria-labelledby="editCurrencyModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-secondary">
                        <h5 class="modal-title text-white" id="editCurrencyModalLabel">ערוך מטבע</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editCurrencyForm" novalidate>
                            <input type="hidden" id="editCurrencyId" value="${currency.id}">
                            <div class="mb-3">
                                <label for="editCurrencySymbol" class="form-label">סמל מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editCurrencySymbol" 
                                       name="symbol" 
                                       required 
                                       maxlength="10" 
                                       pattern="^[A-Z]+$"
                                       value="${currency.symbol}">
                                <div class="form-text">רק אותיות אנגליות גדולות (למשל: USD, EUR, ILS)</div>
                            </div>
                            <div class="mb-3">
                                <label for="editCurrencyName" class="form-label">שם מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editCurrencyName" 
                                       name="name" 
                                       required 
                                       maxlength="100" 
                                       value="${currency.name}">
                            </div>
                            <div class="mb-3">
                                <label for="editCurrencyUsdRate" class="form-label">שער דולר</label>
                                <input type="number" 
                                       class="form-control" 
                                       id="editCurrencyUsdRate" 
                                       name="usd_rate" 
                                       step="0.000001" 
                                       min="0" 
                                       value="${currency.usd_rate}">
                                <div class="form-text">שער המרה לדולר אמריקאי</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="updateCurrencyRecord()">עדכן</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // הסרת מודל קיים אם יש
    const existingModal = document.getElementById('editCurrencyModal');
    if (existingModal) {
        existingModal.remove();
    }

    // הוספת המודל לדף
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editCurrencyModal'));
    
    // ניקוי וולידציות לפני הצגת המודל
    modal._element.addEventListener('shown.bs.modal', function() {
        clearModalValidations('editCurrencyForm');
        setupModalValidations('editCurrencyForm');
    });
    
    modal.show();
}

// פונקציה להצגת מודל מחיקת מטבע
function showDeleteCurrencyModal(id) {
    const modalHtml = `
        <div class="modal fade" id="deleteCurrencyModal" tabindex="-1" aria-labelledby="deleteCurrencyModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-danger">
                        <h5 class="modal-title text-white" id="deleteCurrencyModalLabel">מחק מטבע</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>האם אתה בטוח שברצונך למחוק מטבע זה?</p>
                        <p class="text-muted">פעולה זו אינה הפיכה.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeleteCurrencyRecord(${id})">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // הסרת מודל קיים אם יש
    const existingModal = document.getElementById('deleteCurrencyModal');
    if (existingModal) {
        existingModal.remove();
    }

    // הוספת המודל לדף
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteCurrencyModal'));
    modal.show();
}

// פונקציה לשמירת מטבע חדש
async function saveCurrencyRecord() {
    // וולידציה של הטופס
    if (!validateCurrencyForm()) {
        showNotification('יש לתקן שגיאות בטופס לפני השמירה', 'error');
        return;
    }

    const form = document.getElementById('addCurrencyForm');
    const formData = new FormData(form);

    const currencyData = {
        symbol: formData.get('symbol').trim().toUpperCase(),
        name: formData.get('name').trim(),
        usd_rate: parseFloat(formData.get('usd_rate')) || 1.0
    };

    try {
        const response = await fetch('/api/v1/currencies/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(currencyData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification('מטבע נוסף בהצלחה', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addCurrencyModal')).hide();
            loadCurrenciesData(); // טעינה מחדש של הנתונים
        } else {
            // הודעות שגיאה ספציפיות
            let errorMessage = 'שגיאה בהוספת מטבע';

            if (result.error && result.error.message) {
                if (result.error.message.includes('UNIQUE constraint failed') ||
                    result.error.message.includes('symbol')) {
                    errorMessage = 'סמל מטבע זה כבר קיים במערכת';
                } else if (result.error.message.includes('symbol and name are required')) {
                    errorMessage = 'סמל מטבע ושם מטבע הם שדות חובה';
                } else {
                    errorMessage = result.error.message;
                }
            }

            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error saving currency:', error);
        showNotification('שגיאה בתקשורת עם השרת', 'error');
    }
}

// פונקציה לעדכון מטבע
async function updateCurrencyRecord() {
    // וולידציה של הטופס
    if (!validateCurrencyForm()) {
        showNotification('יש לתקן שגיאות בטופס לפני העדכון', 'error');
        return;
    }

    const form = document.getElementById('editCurrencyForm');
    const formData = new FormData(form);
    const currencyId = document.getElementById('editCurrencyId').value;

    const currencyData = {
        symbol: formData.get('symbol').trim().toUpperCase(),
        name: formData.get('name').trim(),
        usd_rate: parseFloat(formData.get('usd_rate')) || 1.0
    };

    try {
        const response = await fetch(`/api/v1/currencies/${currencyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(currencyData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification('מטבע עודכן בהצלחה', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editCurrencyModal')).hide();
            loadCurrenciesData(); // טעינה מחדש של הנתונים
        } else {
            // הודעות שגיאה ספציפיות
            let errorMessage = 'שגיאה בעדכון מטבע';

            if (result.error && result.error.message) {
                if (result.error.message.includes('UNIQUE constraint failed') ||
                    result.error.message.includes('symbol')) {
                    errorMessage = 'סמל מטבע זה כבר קיים במערכת';
                } else if (result.error.message.includes('symbol and name are required')) {
                    errorMessage = 'סמל מטבע ושם מטבע הם שדות חובה';
                } else if (result.error.message.includes('Currency not found')) {
                    errorMessage = 'המטבע לא נמצא במערכת';
                } else {
                    errorMessage = result.error.message;
                }
            }

            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error updating currency:', error);
        showNotification('שגיאה בתקשורת עם השרת', 'error');
    }
}

// פונקציה לאישור מחיקת מטבע
async function confirmDeleteCurrencyRecord(id) {
    try {
        const response = await fetch(`/api/v1/currencies/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification('מטבע נמחק בהצלחה', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteCurrencyModal')).hide();
            loadCurrenciesData(); // טעינה מחדש של הנתונים
        } else {
            showNotification(result.error?.message || 'שגיאה במחיקת מטבע', 'error');
        }
    } catch (error) {
        console.error('Error deleting currency:', error);
        showNotification('שגיאה במחיקת מטבע', 'error');
    }
}

// ===== פונקציות CRUD לסוגי קישור הערות (Note Relation Types) =====

// פונקציה להוספת סוג קישור חדש
function addNoteRelationTypeRecord() {
    showAddNoteRelationTypeModal();
}

// פונקציה לעריכת סוג קישור
function editNoteRelationTypeRecord(id) {
    showEditNoteRelationTypeModal(id);
}

// פונקציה למחיקת סוג קישור
function deleteNoteRelationTypeRecord(id) {
    showDeleteNoteRelationTypeModal(id);
}

// פונקציה להצגת מודל הוספת סוג קישור
function showAddNoteRelationTypeModal() {
    const modalHtml = `
        <div class="modal fade" id="addNoteRelationTypeModal" tabindex="-1" aria-labelledby="addNoteRelationTypeModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-primary">
                        <h5 class="modal-title text-white" id="addNoteRelationTypeModalLabel">הוסף סוג קישור חדש</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addNoteRelationTypeForm">
                            <div class="mb-3">
                                <label for="noteRelationType" class="form-label">סוג קישור *</label>
                                <input type="text" class="form-control" id="noteRelationType" name="note_relation_type" required maxlength="20" placeholder="example_type">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="saveNoteRelationTypeRecord()">שמור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // הסרת מודל קיים אם יש
    const existingModal = document.getElementById('addNoteRelationTypeModal');
    if (existingModal) {
        existingModal.remove();
    }

    // הוספת המודל לדף
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addNoteRelationTypeModal'));
    modal.show();
}

// פונקציה להצגת מודל עריכת סוג קישור
function showEditNoteRelationTypeModal(id) {
    // טעינת נתוני סוג הקישור
    fetch(`/api/v1/note_relation_types/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                const noteType = result.data;
                showEditNoteRelationTypeModalWithData(noteType);
            } else {
                showNotification('שגיאה בטעינת נתוני סוג הקישור', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading note relation type:', error);
            showNotification('שגיאה בטעינת נתוני סוג הקישור', 'error');
        });
}

// פונקציה להצגת מודל עריכת סוג קישור עם נתונים
function showEditNoteRelationTypeModalWithData(noteType) {
    const modalHtml = `
        <div class="modal fade" id="editNoteRelationTypeModal" tabindex="-1" aria-labelledby="editNoteRelationTypeModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-secondary">
                        <h5 class="modal-title text-white" id="editNoteRelationTypeModalLabel">ערוך סוג קישור</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editNoteRelationTypeForm">
                            <input type="hidden" id="editNoteRelationTypeId" value="${noteType.id}">
                            <div class="mb-3">
                                <label for="editNoteRelationType" class="form-label">סוג קישור *</label>
                                <input type="text" class="form-control" id="editNoteRelationType" name="note_relation_type" required maxlength="20" value="${noteType.note_relation_type}">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="updateNoteRelationTypeRecord()">עדכן</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // הסרת מודל קיים אם יש
    const existingModal = document.getElementById('editNoteRelationTypeModal');
    if (existingModal) {
        existingModal.remove();
    }

    // הוספת המודל לדף
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editNoteRelationTypeModal'));
    modal.show();
}

// פונקציה להצגת מודל מחיקת סוג קישור
function showDeleteNoteRelationTypeModal(id) {
    const modalHtml = `
        <div class="modal fade" id="deleteNoteRelationTypeModal" tabindex="-1" aria-labelledby="deleteNoteRelationTypeModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-danger">
                        <h5 class="modal-title text-white" id="deleteNoteRelationTypeModalLabel">מחק סוג קישור</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>האם אתה בטוח שברצונך למחוק סוג קישור זה?</p>
                        <p class="text-muted">פעולה זו אינה הפיכה.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeleteNoteRelationTypeRecord(${id})">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // הסרת מודל קיים אם יש
    const existingModal = document.getElementById('deleteNoteRelationTypeModal');
    if (existingModal) {
        existingModal.remove();
    }

    // הוספת המודל לדף
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteNoteRelationTypeModal'));
    modal.show();
}

// פונקציה לשמירת סוג קישור חדש
async function saveNoteRelationTypeRecord() {
    const form = document.getElementById('addNoteRelationTypeForm');
    const formData = new FormData(form);

    const noteTypeData = {
        note_relation_type: formData.get('note_relation_type')
    };

    try {
        const response = await fetch('/api/v1/note_relation_types/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteTypeData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification('סוג קישור נוסף בהצלחה', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addNoteRelationTypeModal')).hide();
            loadNoteRelationTypesData(); // טעינה מחדש של הנתונים
        } else {
            showNotification(result.error?.message || 'שגיאה בהוספת סוג קישור', 'error');
        }
    } catch (error) {
        console.error('Error saving note relation type:', error);
        showNotification('שגיאה בהוספת סוג קישור', 'error');
    }
}

// פונקציה לעדכון סוג קישור
async function updateNoteRelationTypeRecord() {
    const form = document.getElementById('editNoteRelationTypeForm');
    const formData = new FormData(form);
    const noteTypeId = document.getElementById('editNoteRelationTypeId').value;

    const noteTypeData = {
        note_relation_type: formData.get('note_relation_type')
    };

    try {
        const response = await fetch(`/api/v1/note_relation_types/${noteTypeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteTypeData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification('סוג קישור עודכן בהצלחה', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editNoteRelationTypeModal')).hide();
            loadNoteRelationTypesData(); // טעינה מחדש של הנתונים
        } else {
            showNotification(result.error?.message || 'שגיאה בעדכון סוג קישור', 'error');
        }
    } catch (error) {
        console.error('Error updating note relation type:', error);
        showNotification('שגיאה בעדכון סוג קישור', 'error');
    }
}

// פונקציה לאישור מחיקת סוג קישור
async function confirmDeleteNoteRelationTypeRecord(id) {
    try {
        const response = await fetch(`/api/v1/note_relation_types/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification('סוג קישור נמחק בהצלחה', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteNoteRelationTypeModal')).hide();
            loadNoteRelationTypesData(); // טעינה מחדש של הנתונים
        } else {
            showNotification(result.error?.message || 'שגיאה במחיקת סוג קישור', 'error');
        }
    } catch (error) {
        console.error('Error deleting note relation type:', error);
        showNotification('שגיאה במחיקת סוג קישור', 'error');
    }
}

// ===== פונקציות כלליות =====

// showNotification מיוצאת מקובץ ui-utils.js

// פונקציה כללית להוספת רשומה (מטבע או סוג קישור)
function addRecord() {
    // נבדוק איזה כפתור לחצו על ידי בדיקת event target
    const event = window.event || arguments.callee.caller.arguments[0];
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) {
            const section = button.closest('.content-section');
            if (section) {
                const currenciesTable = section.querySelector('#currenciesTable');
                const noteTypesTable = section.querySelector('#noteRelationTypesTable');

                if (currenciesTable) {
                    addCurrencyRecord();
                } else if (noteTypesTable) {
                    addNoteRelationTypeRecord();
                } else {
                    // ברירת מחדל - הוספת מטבע
                    addCurrencyRecord();
                }
                return;
            }
        }
    }

    // אם לא הצלחנו לזהות, נבדוק לפי הסקשן הפעיל
    const contentSections = document.querySelectorAll('.content-section');
    const firstSection = contentSections[0]; // מטבעות
    const secondSection = contentSections[1]; // סוגי קישור

    // נבדוק איזה סקשן לא מוסתר
    if (firstSection && firstSection.querySelector('.section-body').style.display !== 'none') {
        addCurrencyRecord();
    } else if (secondSection && secondSection.querySelector('.section-body').style.display !== 'none') {
        addNoteRelationTypeRecord();
    } else {
        // ברירת מחדל - הוספת מטבע
        addCurrencyRecord();
    }
}

// ===== ייצוא פונקציות לגלובל =====

// ייצוא פונקציות וולידציה
window.validateCurrencySymbol = validateCurrencySymbol;
window.validateCurrencyName = validateCurrencyName;
window.validateCurrencyUsdRate = validateCurrencyUsdRate;
window.validateCurrencyForm = validateCurrencyForm;

// ייצוא פונקציות מטבעות
window.addCurrencyRecord = addCurrencyRecord;
window.editCurrencyRecord = editCurrencyRecord;
window.deleteCurrencyRecord = deleteCurrencyRecord;
window.saveCurrencyRecord = saveCurrencyRecord;
window.updateCurrencyRecord = updateCurrencyRecord;
window.confirmDeleteCurrencyRecord = confirmDeleteCurrencyRecord;

// ייצוא פונקציות סוגי קישור
window.addNoteRelationTypeRecord = addNoteRelationTypeRecord;
window.editNoteRelationTypeRecord = editNoteRelationTypeRecord;
window.deleteNoteRelationTypeRecord = deleteNoteRelationTypeRecord;
window.saveNoteRelationTypeRecord = saveNoteRelationTypeRecord;
window.updateNoteRelationTypeRecord = updateNoteRelationTypeRecord;
window.confirmDeleteNoteRelationTypeRecord = confirmDeleteNoteRelationTypeRecord;

// ייצוא פונקציה כללית
window.addRecord = addRecord;

// ייצוא פונקציות צפייה
window.viewCurrency = function(id) {
  if (typeof window.showEditCurrencyModal === 'function') {
    window.showEditCurrencyModal(id);
  } else {

  }
};

window.viewNoteRelationType = function(id) {
  if (typeof window.showEditNoteRelationTypeModal === 'function') {
    window.showEditNoteRelationTypeModal(id);
  } else {

  }
};

// ייצוא פונקציות הוספה
window.showAddCurrencyModal = showAddCurrencyModal;
window.showAddNoteRelationTypeModal = showAddNoteRelationTypeModal;

// ייצוא פונקציות עריכה
window.showEditCurrencyModal = showEditCurrencyModal;
window.showEditNoteRelationTypeModal = showEditNoteRelationTypeModal;

// ייצוא פונקציות מחיקה
window.showDeleteCurrencyModal = showDeleteCurrencyModal;
window.showDeleteNoteRelationTypeModal = showDeleteNoteRelationTypeModal;

// ייצוא פונקציות עדכון טבלאות
window.updateCurrenciesTable = updateCurrenciesTable;
window.updateNoteRelationTypesTable = updateNoteRelationTypesTable;

// ייצוא פונקציות וולידציה
window.initializeRealTimeValidation = initializeRealTimeValidation;
window.clearModalValidations = clearModalValidations;
window.setupModalValidations = setupModalValidations;

// window.showNotification מיוצאת מקובץ ui-utils.js

// ===== פונקציות וולידציה בזמן אמת =====

// פונקציה לניקוי וולידציות במודל
function clearModalValidations(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // ניקוי כל השדות
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (window.clearFieldValidation) {
            window.clearFieldValidation(input);
        } else {
            // Fallback לניקוי בסיסי
            input.classList.remove('is-valid', 'is-invalid');
            const parent = input.parentElement;
            if (parent) {
                const icon = parent.querySelector('.validation-icon');
                if (icon) icon.remove();
            }
        }
    });
}

// פונקציה להגדרת וולידציות במודל
function setupModalValidations(formId) {
    const form = document.getElementById(formId);
    if (!form || !window.setupFieldValidation) return;
    
    // הגדרת וולידציה לכל השדות הרלוונטיים
    const currencySymbol = form.querySelector('#currencySymbol, #editCurrencySymbol');
    const currencyName = form.querySelector('#currencyName, #editCurrencyName');
    const currencyUsdRate = form.querySelector('#currencyUsdRate, #editCurrencyUsdRate');
    
    if (currencySymbol) {
        window.setupFieldValidation(currencySymbol.id, {
            required: true,
            pattern: /^[A-Z]+$/,
            minLength: 1,
            maxLength: 10
        }, 'text');
    }
    
    if (currencyName) {
        window.setupFieldValidation(currencyName.id, {
            required: true,
            maxLength: 100
        }, 'text');
    }
    
    if (currencyUsdRate) {
        window.setupFieldValidation(currencyUsdRate.id, {
            type: 'number',
            min: 0
        }, 'number');
    }
}

// פונקציה לאתחול וולידציה בזמן אמת
function initializeRealTimeValidation() {
    // הגדרת וולידציה לשדות מטבע
    if (window.setupFieldValidation) {
        // שדות מודל הוספת מטבע - בדיקה אם קיימים
        const currencySymbol = document.getElementById('currencySymbol');
        if (currencySymbol) {
            window.setupFieldValidation('currencySymbol', {
                required: true,
                pattern: /^[A-Z]+$/,
                minLength: 1,
                maxLength: 10
            }, 'text');
        }
        
        const currencyName = document.getElementById('currencyName');
        if (currencyName) {
            window.setupFieldValidation('currencyName', {
                required: true,
                maxLength: 100
            }, 'text');
        }
        
        const currencyUsdRate = document.getElementById('currencyUsdRate');
        if (currencyUsdRate) {
            window.setupFieldValidation('currencyUsdRate', {
                type: 'number',
                min: 0
            }, 'number');
        }
        
        // שדות מודל עריכת מטבע - בדיקה אם קיימים
        const editCurrencySymbol = document.getElementById('editCurrencySymbol');
        if (editCurrencySymbol) {
            window.setupFieldValidation('editCurrencySymbol', {
                required: true,
                pattern: /^[A-Z]+$/,
                minLength: 1,
                maxLength: 10
            }, 'text');
        }
        
        const editCurrencyName = document.getElementById('editCurrencyName');
        if (editCurrencyName) {
            window.setupFieldValidation('editCurrencyName', {
                required: true,
                maxLength: 100
            }, 'text');
        }
        
        const editCurrencyUsdRate = document.getElementById('editCurrencyUsdRate');
        if (editCurrencyUsdRate) {
            window.setupFieldValidation('editCurrencyUsdRate', {
                type: 'number',
                min: 0
            }, 'number');
        }
        
        // שדות סוגי קישור - בדיקה אם קיימים
        const noteRelationType = document.getElementById('noteRelationType');
        if (noteRelationType) {
            window.setupFieldValidation('noteRelationType', {
                required: true,
                maxLength: 20
            }, 'text');
        }
        
        const editNoteRelationType = document.getElementById('editNoteRelationType');
        if (editNoteRelationType) {
            window.setupFieldValidation('editNoteRelationType', {
                required: true,
                maxLength: 20
            }, 'text');
        }
    } else {
        console.warn('⚠️ Validation system not available');
    }
}

// ===== אתחול העמוד =====

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Initializing db_extradata page...');
    
    // שחזור מצב הסקשנים
    restoreSectionsState();
    
    // אתחול וולידציה בזמן אמת (אם המערכת זמינה)
    if (typeof window.setupFieldValidation === 'function') {
        initializeRealTimeValidation();
    } else {
        console.warn('⚠️ Validation system not available');
    }
    
    console.log('✅ דף טבלאות עזר אותחל בהצלחה');
});
