// ===== קובץ JavaScript לדף טיקרים =====

// משתנים גלובליים
let tickersData = [];
window.tickersData = tickersData;

// פונקציות בסיסיות
function openTickerDetails(id) {
    console.log('פתיחת פרטי תיקר:', id);
    showAddTickerModal();
}

function editTicker(id) {
    console.log('עריכת תיקר:', id);
    showEditTickerModal(id);
}

function deleteTicker(id) {
    console.log('מחיקת תיקר:', id);
    showDeleteTickerModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTickersSection() {
    console.log('🔄 toggleTickersSection נקראה');
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📋 מספר content-sections נמצא:', contentSections.length);
    const tickersSection = contentSections[0]; // הסקשן הראשון - טיקרים

    if (!tickersSection) {
        console.error('❌ לא נמצא סקשן טיקרים');
        return;
    }
    console.log('✅ סקשן טיקרים נמצא:', tickersSection);

    const sectionBody = tickersSection.querySelector('.section-body');
    const toggleBtn = tickersSection.querySelector('button[onclick="toggleTickersSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    console.log('🎯 sectionBody נמצא:', !!sectionBody);
    console.log('🔘 toggleBtn נמצא:', !!toggleBtn);
    console.log('🎨 icon נמצא:', !!icon);

    if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';
        console.log('📊 מצב נוכחי - isCollapsed:', isCollapsed);

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
        localStorage.setItem('tickersSectionCollapsed', !isCollapsed);
    }
}

// פונקציה לשחזור מצב הסגירה
function restoreTickersSectionState() {
    // שחזור מצב סקשן הטיקרים
    const tickersCollapsed = localStorage.getItem('tickersSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const tickersSection = contentSections[0];

    if (tickersSection) {
        const sectionBody = tickersSection.querySelector('.section-body');
        const toggleBtn = tickersSection.querySelector('button[onclick="toggleTickersSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && tickersCollapsed) {
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

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל הוספת טיקר
 */
function showAddTickerModal() {
    console.log('🔄 הצגת מודל הוספת טיקר');

    // ניקוי הטופס
    document.getElementById('addTickerForm').reset();
    clearTickerValidationErrors();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addTickerModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת טיקר
 */
function showEditTickerModal(id) {
    console.log('🔄 הצגת מודל עריכת טיקר:', id);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        showNotification('❌ טיקר לא נמצא', 'error');
        return;
    }

    // מילוי הטופס
    document.getElementById('editTickerId').value = ticker.id;
    document.getElementById('editTickerSymbol').value = ticker.symbol;
    document.getElementById('editTickerName').value = ticker.name;
    document.getElementById('editTickerType').value = ticker.type;
    document.getElementById('editTickerCurrency').value = ticker.currency;
    document.getElementById('editTickerRemarks').value = ticker.remarks || '';

    clearTickerValidationErrors();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTickerModal'));
    modal.show();
}

/**
 * הצגת מודל מחיקת טיקר
 */
function showDeleteTickerModal(id) {
    console.log('🔄 הצגת מודל מחיקת טיקר:', id);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        showNotification('❌ טיקר לא נמצא', 'error');
        return;
    }

    // מילוי המודל
    document.getElementById('deleteTickerId').value = ticker.id;
    document.getElementById('deleteTickerName').textContent = `${ticker.symbol} - ${ticker.name}`;

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteTickerModal'));
    modal.show();
}

// ========================================
// פונקציות ולידציה
// ========================================

/**
 * ולידציה של סמל טיקר
 */
function validateTickerSymbol(input) {
    const symbol = input.value.trim().toUpperCase();
    const errorElement = document.getElementById(input.id + 'Error');

    // בדיקות בסיסיות
    if (!symbol) {
        showFieldError(input, errorElement, 'סמל טיקר הוא שדה חובה');
        return false;
    }

    if (symbol.length < 1 || symbol.length > 10) {
        showFieldError(input, errorElement, 'סמל טיקר חייב להיות בין 1 ל-10 תווים');
        return false;
    }

    if (!/^[A-Z0-9.]+$/.test(symbol)) {
        showFieldError(input, errorElement, 'סמל טיקר יכול להכיל רק אותיות באנגלית, מספרים ונקודות');
        return false;
    }

    // בדיקת ייחודיות
    const currentId = document.getElementById('editTickerId')?.value;
    const existingTicker = tickersData.find(t =>
        t.symbol.toUpperCase() === symbol && t.id != currentId
    );

    if (existingTicker) {
        showFieldError(input, errorElement, 'סמל טיקר זה כבר קיים במערכת');
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של שם טיקר
 */
function validateTickerName(input) {
    const name = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!name) {
        showFieldError(input, errorElement, 'שם החברה הוא שדה חובה');
        return false;
    }

    if (name.length < 2 || name.length > 100) {
        showFieldError(input, errorElement, 'שם החברה חייב להיות בין 2 ל-100 תווים');
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * הצגת שגיאת שדה
 */
function showFieldError(input, errorElement, message) {
    input.classList.add('is-invalid');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * ניקוי שגיאת שדה
 */
function clearFieldError(input, errorElement) {
    input.classList.remove('is-invalid');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * ניקוי כל שגיאות הולידציה
 */
function clearTickerValidationErrors() {
    const form = document.getElementById('addTickerForm');
    if (form) {
        const inputs = form.querySelectorAll('.is-invalid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const errorElement = document.getElementById(input.id + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    }

    const editForm = document.getElementById('editTickerForm');
    if (editForm) {
        const inputs = editForm.querySelectorAll('.is-invalid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const errorElement = document.getElementById(input.id + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    }
}

// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת טיקר חדש
 */
async function saveTicker() {
    console.log('🔄 שמירת טיקר חדש');

    // ולידציה
    const symbol = document.getElementById('addTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('addTickerName').value.trim();
    const type = document.getElementById('addTickerType').value;
    const currency = document.getElementById('addTickerCurrency').value;
    const remarks = document.getElementById('addTickerRemarks').value.trim();

    // בדיקת ולידציה
    if (!validateTickerSymbol(document.getElementById('addTickerSymbol')) ||
        !validateTickerName(document.getElementById('addTickerName')) ||
        !type || !currency) {
        showNotification('❌ יש לתקן את השגיאות בטופס', 'error');
        return;
    }

    try {
        const tickerData = {
            symbol: symbol,
            name: name,
            type: type,
            currency: currency,
            remarks: remarks || null
        };

        console.log('📤 שליחת נתונים:', tickerData);

        const response = await fetch('/api/tickers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tickerData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ טיקר נשמר בהצלחה:', result);

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTickerModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ טיקר נשמר בהצלחה', 'success');

            // רענון הנתונים
            await loadTickersData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בשמירת טיקר:', error);
            showNotification('❌ שגיאה בשמירת טיקר: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת טיקר:', error);
        showNotification('❌ שגיאה בשמירת טיקר', 'error');
    }
}

/**
 * עדכון טיקר קיים
 */
async function updateTicker() {
    console.log('🔄 עדכון טיקר');

    const id = document.getElementById('editTickerId').value;
    const symbol = document.getElementById('editTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('editTickerName').value.trim();
    const type = document.getElementById('editTickerType').value;
    const currency = document.getElementById('editTickerCurrency').value;
    const remarks = document.getElementById('editTickerRemarks').value.trim();

    // בדיקת ולידציה
    if (!validateTickerSymbol(document.getElementById('editTickerSymbol')) ||
        !validateTickerName(document.getElementById('editTickerName')) ||
        !type || !currency) {
        showNotification('❌ יש לתקן את השגיאות בטופס', 'error');
        return;
    }

    try {
        const tickerData = {
            symbol: symbol,
            name: name,
            type: type,
            currency: currency,
            remarks: remarks || null
        };

        console.log('📤 שליחת נתונים לעדכון:', tickerData);

        const response = await fetch(`/api/tickers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tickerData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ טיקר עודכן בהצלחה:', result);

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTickerModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ טיקר עודכן בהצלחה', 'success');

            // רענון הנתונים
            await loadTickersData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בעדכון טיקר:', error);
            showNotification('❌ שגיאה בעדכון טיקר: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
        showNotification('❌ שגיאה בעדכון טיקר', 'error');
    }
}

/**
 * אישור מחיקת טיקר
 */
async function confirmDeleteTicker() {
    console.log('🔄 אישור מחיקת טיקר');

    const id = document.getElementById('deleteTickerId').value;

    try {
        const response = await fetch(`/api/tickers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ טיקר נמחק בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteTickerModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ טיקר נמחק בהצלחה', 'success');

            // רענון הנתונים
            await loadTickersData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה במחיקת טיקר:', error);
            showNotification('❌ שגיאה במחיקת טיקר: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה במחיקת טיקר:', error);
        showNotification('❌ שגיאה במחיקת טיקר', 'error');
    }
}

// ========================================
// פונקציות עזר
// ========================================

/**
 * הצגת הודעה
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(notification);

    // הסרה אוטומטית אחרי 5 שניות
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * טעינת נתוני טיקרים
 */
async function loadTickersData() {
    try {
        console.log('🔄 טעינת נתוני טיקרים');

        const response = await fetch('/api/tickers');
        if (response.ok) {
            const data = await response.json();
            tickersData = data.data || data;
            console.log('✅ נטענו', tickersData.length, 'טיקרים');

            // עדכון הטבלה
            updateTickersTable(tickersData);

        } else {
            console.error('❌ שגיאה בטעינת טיקרים');
            showNotification('❌ שגיאה בטעינת נתונים', 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
        showNotification('❌ שגיאה בטעינת נתונים', 'error');
    }
}

/**
 * עדכון טבלת טיקרים
 */
function updateTickersTable(tickers) {
    const tbody = document.querySelector('#tickersTable tbody');
    if (!tbody) return;

    if (tickers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">לא נמצאו טיקרים</td></tr>';
        return;
    }

    tbody.innerHTML = tickers.map(ticker => `
        <tr>
            <td>${ticker.id}</td>
            <td><strong>${ticker.symbol}</strong></td>
            <td>${ticker.name}</td>
            <td>${ticker.type}</td>
            <td>${ticker.remarks || ''}</td>
            <td>${ticker.currency}</td>
            <td>${ticker.active_trades ? 'כן' : 'לא'}</td>
            <td>${formatDate(ticker.created_at)}</td>
            <td>${formatDate(ticker.updated_at)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editTicker(${ticker.id})" title="ערוך">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTicker(${ticker.id})" title="מחק">X</button>
            </td>
        </tr>
    `).join('');

    // עדכון הספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
        countElement.textContent = `${tickers.length} טיקרים`;
    }
}

/**
 * עיצוב תאריך
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

// הגדרת הפונקציות כגלובליות
window.openTickerDetails = openTickerDetails;
window.editTicker = editTicker;
window.deleteTicker = deleteTicker;
window.toggleTickersSection = toggleTickersSection;
window.restoreTickersSectionState = restoreTickersSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// פונקציות מודלים
window.showAddTickerModal = showAddTickerModal;
window.showEditTickerModal = showEditTickerModal;
window.showDeleteTickerModal = showDeleteTickerModal;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;

// פונקציות ולידציה
window.validateTickerSymbol = validateTickerSymbol;
window.validateTickerName = validateTickerName;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED ===');

    // שחזור מצב הסגירה
    restoreTickersSectionState();

    // טעינת נתונים
    loadTickersData();

    console.log('דף טיקרים נטען בהצלחה');
});
