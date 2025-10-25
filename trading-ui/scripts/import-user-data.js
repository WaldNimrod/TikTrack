/**
 * Import User Data JavaScript - Modal Version
 * 
 * This script handles the complete user data import process in modal format:
 * - 6-step wizard with progress indicators
 * - File upload with drag & drop validation
 * - Account selection with API integration
 * - File analysis with visual progress
 * - Problem resolution (missing tickers, duplicates)
 * - Preview generation with detailed tables
 * - Import execution with confirmation
 * 
 * Can be used in any page by including the modal HTML and this script
 * 
 * Author: TikTrack Development Team
 * Version: 2.0 - Modal Integration
 * Last Updated: 2025-01-16
 */

// ===== IMPORT MODAL FUNCTIONS =====

// Global state for import modal
let importCurrentStep = 1;
let importSelectedFile = null;
let importSelectedAccount = null;
let importSessionId = null;
let importAnalysisResults = null;
let importPreviewData = null;

/**
 * Initialize import modal
 */
function initializeImportModal() {
    importCurrentStep = 1;
    importSelectedFile = null;
    importSelectedAccount = null;
    importSessionId = null;
    importAnalysisResults = null;
    importPreviewData = null;
    
    updateImportStepDisplay();
    updateImportStepNavigation();
    loadImportTradingAccounts();
    setupImportEventListeners();
}

/**
 * Reset import modal
 */
function resetImportModal() {
    importCurrentStep = 1;
    importSelectedFile = null;
    importSelectedAccount = null;
    importSessionId = null;
    importAnalysisResults = null;
    importPreviewData = null;
    
    // Reset UI
    clearImportFile();
    document.getElementById('import-account-select').value = '';
    document.getElementById('import-analysis-results').style.display = 'none';
    document.getElementById('import-analysis-progress').style.display = 'none';
    
    updateImportStepDisplay();
    updateImportStepNavigation();
}

/**
 * Setup import event listeners
 */
function setupImportEventListeners() {
    // File input change
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleImportFileSelect);
    }
    
    // Drag and drop
    const uploadArea = document.getElementById('import-file-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleImportDragOver);
        uploadArea.addEventListener('dragleave', handleImportDragLeave);
        uploadArea.addEventListener('drop', handleImportFileDrop);
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Account selection
    const accountSelect = document.getElementById('import-account-select');
    if (accountSelect) {
        accountSelect.addEventListener('change', handleImportAccountSelect);
    }
}

/**
 * Handle file selection
 */
function handleImportFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImportSelectedFile(file);
    }
}

/**
 * Handle drag over
 */
function handleImportDragOver(event) {
    event.preventDefault();
    document.getElementById('import-file-upload-area').classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleImportDragLeave(event) {
    event.preventDefault();
    document.getElementById('import-file-upload-area').classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleImportFileDrop(event) {
    event.preventDefault();
    document.getElementById('import-file-upload-area').classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processImportSelectedFile(files[0]);
    }
}

/**
 * Process selected file
 */
function processImportSelectedFile(file) {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showNotification('רק קבצי CSV נתמכים', 'error');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('הקובץ גדול מדי (מקסימום 10MB)', 'error');
        return;
    }
    
    importSelectedFile = file;
    
    // Update UI
    document.getElementById('import-file-name').textContent = file.name;
    document.getElementById('import-file-size').textContent = formatFileSize(file.size);
    document.getElementById('import-file-info').style.display = 'block';
    document.getElementById('import-file-upload-area').style.display = 'none';
    
    // Enable next step
    updateImportStepNavigation();
    
    showNotification('קובץ נבחר בהצלחה', 'success');
}

/**
 * Clear selected file
 */
function clearImportFile() {
    importSelectedFile = null;
    document.getElementById('import-file-input').value = '';
    document.getElementById('import-file-info').style.display = 'none';
    document.getElementById('import-file-upload-area').style.display = 'block';
    updateImportStepNavigation();
}

/**
 * Handle account selection
 */
function handleImportAccountSelect(event) {
    importSelectedAccount = event.target.value;
    updateImportStepNavigation();
}

/**
 * Load trading accounts
 */
async function loadImportTradingAccounts() {
    try {
        // Use SelectPopulatorService if available
        if (typeof window.SelectPopulatorService !== 'undefined') {
            await window.SelectPopulatorService.populateAccountsSelect('import-account-select', {
                includeEmpty: true,
                emptyText: 'בחר חשבון מסחר',
                filterFn: (account) => account.status === 'open'
            });
        } else if (typeof window.loadTradingAccountsFromServer === 'function') {
            // Fallback to direct loading
            await window.loadTradingAccountsFromServer();
            const accounts = window.trading_accountsData || [];
            
            const select = document.getElementById('import-account-select');
            select.innerHTML = '<option value="">בחר חשבון מסחר</option>';
            
            // Filter only open accounts
            const openAccounts = accounts.filter(account => account.status === 'open');
            
            openAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.currency?.symbol || 'USD'})`;
                select.appendChild(option);
            });
            
            if (openAccounts.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'אין חשבונות פעילים';
                option.disabled = true;
                select.appendChild(option);
            }
        } else {
            // Fallback to direct API call
            const response = await fetch('/api/trading-accounts/');
            const data = await response.json();
            const accounts = data.data || data;
            
            const select = document.getElementById('import-account-select');
            select.innerHTML = '<option value="">בחר חשבון מסחר</option>';
            
            const openAccounts = accounts.filter(account => account.status === 'open');
            
            openAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.currency?.symbol || 'USD'})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        showNotification('שגיאה בטעינת חשבונות', 'error');
        
        // Show error in select
        const select = document.getElementById('import-account-select');
        select.innerHTML = '<option value="">שגיאה בטעינת חשבונות</option>';
    }
}

/**
 * Next step
 */
function nextImportStep() {
    if (importCurrentStep < 6) {
        // Validate current step
        if (!validateImportCurrentStep()) {
            return;
        }
        
        // Process current step
        processImportCurrentStep();
        
        // Move to next step
        importCurrentStep++;
        updateImportStepDisplay();
        updateImportStepNavigation();
    }
}

/**
 * Previous step
 */
function previousImportStep() {
    if (importCurrentStep > 1) {
        importCurrentStep--;
        updateImportStepDisplay();
        updateImportStepNavigation();
    }
}

/**
 * Validate current step
 */
function validateImportCurrentStep() {
    switch (importCurrentStep) {
        case 1:
            if (!importSelectedFile) {
                showNotification('אנא בחר קובץ לייבוא', 'error');
                return false;
            }
            return true;
            
        case 2:
            if (!importSelectedAccount) {
                showNotification('אנא בחר חשבון מסחר', 'error');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

/**
 * Process current step
 */
async function processImportCurrentStep() {
    switch (importCurrentStep) {
        case 2:
            await analyzeImportFile();
            break;
        case 3:
            await generateImportPreview();
            break;
        case 4:
            // Problem resolution - handled in UI
            break;
        case 5:
            // Preview - handled in UI
            break;
        case 6:
            // Confirmation - handled in UI
            break;
    }
}

/**
 * Analyze file
 */
async function analyzeImportFile() {
    if (!importSelectedFile || !importSelectedAccount) {
        return;
    }
    
    try {
        // Show progress
        document.getElementById('import-analysis-progress').style.display = 'block';
        updateImportProgress(0, 'מתחיל ניתוח...');
        
        // Upload file
        const formData = new FormData();
        formData.append('file', importSelectedFile);
        formData.append('account_id', importSelectedAccount);
        
        const response = await fetch('/api/user-data-import/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            importSessionId = data.session_id;
            importAnalysisResults = data.analysis_results;
            
            // Update progress
            updateImportProgress(100, 'ניתוח הושלם');
            
            // Show results
            displayImportAnalysisResults(importAnalysisResults);
            
            // Hide progress
            setTimeout(() => {
                document.getElementById('import-analysis-progress').style.display = 'none';
            }, 1000);
            
            showNotification('ניתוח הושלם בהצלחה', 'success');
        } else {
            showNotification(`שגיאה בניתוח: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error analyzing file:', error);
        showNotification('שגיאה בניתוח הקובץ', 'error');
    }
}

/**
 * Generate preview
 */
async function generateImportPreview() {
    if (!importSessionId) {
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/session/${importSessionId}/preview`);
        const data = await response.json();
        
        if (data.status === 'success') {
            importPreviewData = data.preview_data;
            displayImportPreviewSummary(importPreviewData);
            showNotification('תצוגה מקדימה הוכנה', 'success');
        } else {
            showNotification(`שגיאה בהכנת תצוגה מקדימה: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error generating preview:', error);
        showNotification('שגיאה בהכנת תצוגה מקדימה', 'error');
    }
}

/**
 * Display analysis results
 */
function displayImportAnalysisResults(results) {
    document.getElementById('import-valid-count').textContent = results.valid_records || 0;
    document.getElementById('import-missing-tickers-count').textContent = results.missing_tickers || 0;
    document.getElementById('import-duplicates-count').textContent = results.duplicate_records || 0;
    document.getElementById('import-errors-count').textContent = results.invalid_records || 0;
    
    document.getElementById('import-analysis-results').style.display = 'block';
}

/**
 * Display preview summary
 */
function displayImportPreviewSummary(data) {
    document.getElementById('import-preview-total').textContent = data.summary.total_records || 0;
    document.getElementById('import-preview-import').textContent = data.summary.records_to_import || 0;
    document.getElementById('import-preview-skip').textContent = data.summary.records_to_skip || 0;
}

/**
 * Show preview modal
 */
function showImportPreviewModal() {
    if (!importPreviewData) {
        showNotification('אין נתוני תצוגה מקדימה', 'error');
        return;
    }
    
    // Update tab counts
    document.getElementById('import-import-tab-count').textContent = importPreviewData.records_to_import.length;
    document.getElementById('import-skip-tab-count').textContent = importPreviewData.records_to_skip.length;
    
    // Populate tables
    populateImportPreviewTable('import', importPreviewData.records_to_import);
    populateImportPreviewTable('skip', importPreviewData.records_to_skip);
    
    // Show modal
    document.getElementById('import-preview-modal').style.display = 'block';
}

/**
 * Close preview modal
 */
function closeImportPreviewModal() {
    document.getElementById('import-preview-modal').style.display = 'none';
}

/**
 * Show preview tab
 */
function showImportPreviewTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('#import-preview-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('#import-preview-modal .preview-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`import-preview-tab-${tabName}`).classList.add('active');
}

/**
 * Populate preview table
 */
function populateImportPreviewTable(type, records) {
    const tbody = document.getElementById(`import-preview-tbody-${type}`);
    tbody.innerHTML = '';
    
    records.forEach(record => {
        const row = document.createElement('tr');
        
        if (type === 'import') {
            row.innerHTML = `
                <td>${record.symbol}</td>
                <td>${record.action === 'buy' ? 'קניה' : 'מכירה'}</td>
                <td>${record.quantity}</td>
                <td>$${record.price}</td>
                <td>$${record.fee}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.external_id}</td>
            `;
        } else {
            row.innerHTML = `
                <td>${record.symbol}</td>
                <td>${record.action === 'buy' ? 'קניה' : 'מכירה'}</td>
                <td>${record.quantity}</td>
                <td>$${record.price}</td>
                <td>$${record.fee}</td>
                <td>${formatDate(record.date)}</td>
                <td>${getReasonText(record.reason)}</td>
                <td>${record.details ? record.details.join(', ') : ''}</td>
            `;
        }
        
        tbody.appendChild(row);
    });
}

/**
 * Execute import
 */
async function executeImport() {
    if (!importSessionId) {
        showNotification('אין סשן ייבוא פעיל', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/session/${importSessionId}/execute`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification(`ייבוא הושלם: ${data.imported_count} רשומות יובאו`, 'success');
            
            // Close modal and refresh data
            closeImportUserDataModal();
            if (typeof window.loadExecutionsData === 'function') {
                window.loadExecutionsData();
            }
        } else {
            showNotification(`שגיאה בייבוא: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error executing import:', error);
        showNotification('שגיאה בייבוא', 'error');
    }
}

/**
 * Cancel import
 */
function cancelImport() {
    if (confirm('האם אתה בטוח שברצונך לבטל את הייבוא?')) {
        closeImportUserDataModal();
    }
}

/**
 * Update step display
 */
function updateImportStepDisplay() {
    // Update step indicators
    document.querySelectorAll('#import-user-data-modal .step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index + 1 === importCurrentStep) {
            step.classList.add('active');
        } else if (index + 1 < importCurrentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update step content
    document.querySelectorAll('#import-user-data-modal .step-content').forEach((content, index) => {
        content.classList.remove('active');
        
        if (index + 1 === importCurrentStep) {
            content.classList.add('active');
        }
    });
}

/**
 * Update step navigation
 */
function updateImportStepNavigation() {
    const prevBtn = document.getElementById('import-prev-btn');
    const nextBtn = document.getElementById('import-next-btn');
    
    // Previous button
    if (importCurrentStep > 1) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Next button
    if (importCurrentStep < 6) {
        nextBtn.textContent = 'שלב הבא →';
        nextBtn.disabled = !canProceedToNextImportStep();
    } else {
        nextBtn.textContent = 'סיום';
        nextBtn.disabled = false;
    }
}

/**
 * Check if can proceed to next step
 */
function canProceedToNextImportStep() {
    switch (importCurrentStep) {
        case 1:
            return importSelectedFile !== null;
        case 2:
            return importSelectedAccount !== null;
        case 3:
            return importAnalysisResults !== null;
        case 4:
            return true; // Problem resolution
        case 5:
            return importPreviewData !== null;
        case 6:
            return true; // Confirmation
        default:
            return false;
    }
}

/**
 * Update progress
 */
function updateImportProgress(percentage, text) {
    document.getElementById('import-progress-fill').style.width = `${percentage}%`;
    document.getElementById('import-progress-text').textContent = text;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    } catch (error) {
        return dateString;
    }
}

/**
 * Get reason text
 */
function getReasonText(reason) {
    const reasons = {
        'validation_error': 'שגיאת וולידציה',
        'within_file_duplicate': 'כפילות בקובץ',
        'system_duplicate': 'כפילות במערכת'
    };
    
    return reasons[reason] || reason;
}

/**
 * Add missing tickers
 */
function addMissingTickers() {
    showNotification('פונקציונליות הוספת טיקרים תתווסף בעתיד', 'info');
}

/**
 * Review duplicates
 */
function reviewDuplicates() {
    showNotification('פונקציונליות סקירת כפילויות תתווסף בעתיד', 'info');
}