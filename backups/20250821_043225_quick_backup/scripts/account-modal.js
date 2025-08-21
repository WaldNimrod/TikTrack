// ===== קובץ JavaScript לפונקציות מודל חשבונות =====
// קובץ זה מכיל רק את הפונקציות הקשורות למודל הוספה/עריכה של חשבונות
// נוצר כדי להפריד את הפונקציונליות ולהימנע מטעינת accounts.js שלם בדפים שלא צריכים אותו

/**
 * הצגת מודל הוספת חשבון
 */
function showAddAccountModal() {
    console.log('🔄 הצגת מודל הוספת חשבון');

    // בדיקה אם יש מודל קיים בדף
    const modalElement = document.getElementById('accountModal');
    if (modalElement) {
        // איפוס הטופס
        const form = document.getElementById('accountForm');
        if (form) {
            form.reset();
        }

        // הצגת המודל
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        // יצירת המודל דינמית
        const modal = createAccountModal('add');
        document.body.appendChild(modal);

        // הצגת המודל
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

/**
 * יצירת מודל חשבון
 * @param {string} mode - 'add' או 'edit'
 * @param {Object} account - אובייקט החשבון לעריכה (רק במצב edit)
 */
function createAccountModal(mode, account = null) {
    const isEdit = mode === 'edit';
    const title = isEdit ? 'עריכת חשבון' : 'הוספת חשבון חדש';
    const buttonText = isEdit ? 'שמור שינויים' : 'הוסף חשבון';

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'accountModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'accountModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="accountModalLabel">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="accountForm">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountName" class="form-label">שם החשבון *</label>
                  <input type="text" class="form-control" id="accountName" name="name" required 
                         value="${account ? account.name : ''}" placeholder="הכנס שם חשבון" maxlength="18">
                  <div class="invalid-feedback" id="nameError"></div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountCurrency" class="form-label">מטבע *</label>
                  <select class="form-select" id="accountCurrency" name="currency" required>
                    <option value="">בחר מטבע</option>
                    <option value="ILS" ${account && account.currency === 'ILS' ? 'selected' : ''}>שקל (ILS)</option>
                    <option value="USD" ${account && account.currency === 'USD' ? 'selected' : ''}>דולר אמריקאי (USD)</option>
                    <option value="EUR" ${account && account.currency === 'EUR' ? 'selected' : ''}>אירו (EUR)</option>
                    <option value="GBP" ${account && account.currency === 'GBP' ? 'selected' : ''}>פאונד (GBP)</option>
                  </select>
                  <div class="invalid-feedback" id="currencyError"></div>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountStatus" class="form-label">סטטוס</label>
                  <select class="form-select" id="accountStatus" name="status">
                    <option value="open" ${account && account.status === 'open' ? 'selected' : ''}>פתוח</option>
                    <option value="closed" ${account && account.status === 'closed' ? 'selected' : ''}>סגור</option>
                    <option value="cancelled" ${account && account.status === 'cancelled' ? 'selected' : ''}>מבוטל</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountCashBalance" class="form-label">יתרת מזומן</label>
                  <input type="number" class="form-control" id="accountCashBalance" name="cash_balance" 
                         value="${account ? account.cash_balance || 0 : 0}" placeholder="0" step="0.01" min="0">
                  <div class="invalid-feedback" id="cashBalanceError"></div>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="accountNotes" class="form-label">הערות</label>
              <textarea class="form-control" id="accountNotes" name="notes" rows="3" 
                        placeholder="הכנס הערות על החשבון">${account ? account.notes || '' : ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
          <button type="button" class="btn btn-primary" onclick="saveAccount('${mode}', ${account ? account.id : 'null'})">
            ${buttonText}
          </button>
        </div>
      </div>
    </div>
  `;

    // הוספת event listeners לבדיקות בזמן אמת
    setTimeout(() => {
        const nameInput = modal.querySelector('#accountName');
        const currencySelect = modal.querySelector('#accountCurrency');
        const cashBalanceInput = modal.querySelector('#accountCashBalance');

        // בדיקת שם החשבון
        nameInput.addEventListener('input', function () {
            const value = this.value.trim();
            const errorElement = modal.querySelector('#nameError');

            if (value.length > 18) {
                this.classList.add('is-invalid');
                errorElement.textContent = 'שם החשבון לא יכול לעלות על 18 תווים';
            } else if (value === '') {
                this.classList.add('is-invalid');
                errorElement.textContent = 'שם החשבון הוא שדה חובה';
            } else {
                this.classList.remove('is-invalid');
                errorElement.textContent = '';
            }
        });

        // בדיקת מטבע
        currencySelect.addEventListener('change', function () {
            const errorElement = modal.querySelector('#currencyError');
            if (this.value === '') {
                this.classList.add('is-invalid');
                errorElement.textContent = 'יש לבחור מטבע';
            } else {
                this.classList.remove('is-invalid');
                errorElement.textContent = '';
            }
        });

        // בדיקת יתרת מזומן
        cashBalanceInput.addEventListener('input', function () {
            const value = parseFloat(this.value);
            const errorElement = modal.querySelector('#cashBalanceError');

            if (isNaN(value) || value < 0) {
                this.classList.add('is-invalid');
                errorElement.textContent = 'יתרת המזומן חייבת להיות מספר חיובי';
            } else {
                this.classList.remove('is-invalid');
                errorElement.textContent = '';
            }
        });
    }, 100);

    return modal;
}

/**
 * בדיקת תקינות נתוני חשבון
 * @param {Object} accountData - נתוני החשבון לבדיקה
 * @returns {Object} - { isValid: boolean, message: string }
 */
function validateAccountData(accountData) {
    // בדיקת שם החשבון
    if (!accountData.name || accountData.name.trim() === '') {
        return { isValid: false, message: 'שם החשבון הוא שדה חובה' };
    }

    if (accountData.name.length > 18) {
        return { isValid: false, message: 'שם החשבון לא יכול לעלות על 18 תווים' };
    }

    // בדיקת מטבע
    if (!accountData.currency || accountData.currency.trim() === '') {
        return { isValid: false, message: 'יש לבחור מטבע' };
    }

    // בדיקת יתרת מזומן
    if (accountData.cash_balance < 0) {
        return { isValid: false, message: 'יתרת המזומן לא יכולה להיות שלילית' };
    }

    return { isValid: true, message: '' };
}

/**
 * הצגת שגיאת טופס
 * @param {string} message - הודעת השגיאה
 */
function showFormError(message) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, 'error');
    } else {
        alert(message);
    }
}

/**
 * שמירת חשבון (הוספה או עדכון)
 * @param {string} mode - 'add' או 'edit'
 * @param {number} accountId - מזהה החשבון (רק במצב edit)
 */
async function saveAccount(mode, accountId = null) {
    try {
        console.log('🔄 שמירת חשבון:', mode, accountId);

        // איסוף נתונים מהטופס
        const form = document.getElementById('accountForm');
        const formData = new FormData(form);

        const accountData = {
            name: formData.get('name'),
            currency: formData.get('currency'),
            status: formData.get('status'),
            cash_balance: parseFloat(formData.get('cash_balance')) || 0,
            notes: formData.get('notes')
        };

        console.log('🔄 נתוני חשבון:', accountData);

        // בדיקת תקינות
        const validation = validateAccountData(accountData);
        if (!validation.isValid) {
            showFormError(validation.message);
            return; // לא ממשיכים אם יש שגיאה
        }

        // קריאה ל-API (נסתמך על פונקציות מ-accounts.js אם זמינות)
        let result;
        if (mode === 'add') {
            if (typeof window.addAccountToAPI === 'function') {
                result = await window.addAccountToAPI(accountData);
            } else {
                throw new Error('פונקציית הוספת חשבון לא זמינה');
            }
        } else {
            if (typeof window.updateAccountInAPI === 'function') {
                result = await window.updateAccountInAPI(accountId, accountData);
            } else {
                throw new Error('פונקציית עדכון חשבון לא זמינה');
            }
        }

        // רענון הנתונים לפני סגירת המודל
        try {
            if (typeof window.loadAccountsDataForAccountsPage === 'function') {
                await window.loadAccountsDataForAccountsPage();
            } else if (typeof window.loadAccountsData === 'function') {
                const accounts = await window.loadAccountsData();
                if (typeof window.updateAccountsTable === 'function') {
                    window.updateAccountsTable(accounts);
                }
            }

            // רק אם הרענון הצליח, נסגור את המודל
            const modal = document.getElementById('accountModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }

            // הצגת הודעת הצלחה
            const successMessage = mode === 'add' ? 'החשבון נוסף בהצלחה!' : 'החשבון עודכן בהצלחה!';
            if (typeof window.showNotification === 'function') {
                window.showNotification(successMessage, 'success');
            } else {
                alert(successMessage);
            }

        } catch (refreshError) {
            console.error('❌ שגיאה ברענון הנתונים:', refreshError);
            // גם אם הרענון נכשל, נסגור את המודל
            const modal = document.getElementById('accountModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת חשבון:', error);
        showFormError('שגיאה בשמירת החשבון: ' + error.message);
    }
}

// ייצוא הפונקציות לגלובל
window.showAddAccountModal = showAddAccountModal;
window.createAccountModal = createAccountModal;
window.validateAccountData = validateAccountData;
window.showFormError = showFormError;
window.saveAccount = saveAccount;

console.log('✅ account-modal.js נטען בהצלחה');
console.log('✅ showAddAccountModal זמין:', typeof window.showAddAccountModal);

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
    console.log('🧹 Clearing console messages from account-modal.js...');
    if (console.clear) {
        console.clear();
    }
}, 12000);