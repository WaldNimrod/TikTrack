/**
 * Import User Data JavaScript
 * 
 * This script handles the complete user data import process including:
 * - File upload and validation
 * - Account selection
 * - File analysis and processing
 * - Problem resolution (missing tickers, duplicates)
 * - Preview generation and confirmation
 * - Import execution
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-16
 */

// Global state
let currentStep = 1;
let selectedFile = null;
let selectedAccount = null;
let sessionId = null;
let analysisResults = null;
let previewData = null;

// DOM elements
const fileInput = document.getElementById('file-input');
const fileUploadArea = document.getElementById('file-upload-area');
const fileInfo = document.getElementById('file-info');
const accountSelect = document.getElementById('account-select');
const analysisProgress = document.getElementById('analysis-progress');
const analysisResults = document.getElementById('analysis-results');
const previewModal = document.getElementById('preview-modal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadTradingAccounts();
});

/**
 * Initialize the page
 */
function initializePage() {
    console.log('Initializing Import User Data page');
    
    // Set up file upload area
    setupFileUpload();
    
    // Initialize step navigation
    updateStepNavigation();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleFileDrop);
    
    // Account selection
    accountSelect.addEventListener('change', handleAccountSelect);
    
    // Step navigation
    document.getElementById('next-btn').addEventListener('click', nextStep);
    document.getElementById('prev-btn').addEventListener('click', previousStep);
}

/**
 * Set up file upload area
 */
function setupFileUpload() {
    fileUploadArea.addEventListener('click', function() {
        fileInput.click();
    });
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processSelectedFile(file);
    }
}

/**
 * Handle drag over
 */
function handleDragOver(event) {
    event.preventDefault();
    fileUploadArea.classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleDragLeave(event) {
    event.preventDefault();
    fileUploadArea.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleFileDrop(event) {
    event.preventDefault();
    fileUploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processSelectedFile(files[0]);
    }
}

/**
 * Process selected file
 */
function processSelectedFile(file) {
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
    
    selectedFile = file;
    
    // Update UI
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
    fileUploadArea.style.display = 'none';
    
    // Enable next step
    updateStepNavigation();
    
    showNotification('קובץ נבחר בהצלחה', 'success');
}

/**
 * Clear selected file
 */
function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    fileUploadArea.style.display = 'block';
    updateStepNavigation();
}

/**
 * Handle account selection
 */
function handleAccountSelect(event) {
    selectedAccount = event.target.value;
    updateStepNavigation();
}

/**
 * Load trading accounts
 */
async function loadTradingAccounts() {
    try {
        const response = await fetch('/api/user-data-import/accounts');
        const data = await response.json();
        
        if (data.status === 'success') {
            const select = document.getElementById('account-select');
            select.innerHTML = '<option value="">בחר חשבון מסחר</option>';
            
            data.accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.currency_symbol})`;
                select.appendChild(option);
            });
        } else {
            showNotification('שגיאה בטעינת חשבונות', 'error');
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        showNotification('שגיאה בטעינת חשבונות', 'error');
    }
}

/**
 * Next step
 */
function nextStep() {
    if (currentStep < 6) {
        // Validate current step
        if (!validateCurrentStep()) {
            return;
        }
        
        // Process current step
        processCurrentStep();
        
        // Move to next step
        currentStep++;
        updateStepDisplay();
        updateStepNavigation();
    }
}

/**
 * Previous step
 */
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
        updateStepNavigation();
    }
}

/**
 * Validate current step
 */
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!selectedFile) {
                showNotification('אנא בחר קובץ לייבוא', 'error');
                return false;
            }
            return true;
            
        case 2:
            if (!selectedAccount) {
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
async function processCurrentStep() {
    switch (currentStep) {
        case 2:
            await analyzeFile();
            break;
        case 3:
            await generatePreview();
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
async function analyzeFile() {
    if (!selectedFile || !selectedAccount) {
        return;
    }
    
    try {
        // Show progress
        analysisProgress.style.display = 'block';
        updateProgress(0, 'מתחיל ניתוח...');
        
        // Upload file
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('account_id', selectedAccount);
        
        const response = await fetch('/api/user-data-import/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            sessionId = data.session_id;
            analysisResults = data.analysis_results;
            
            // Update progress
            updateProgress(100, 'ניתוח הושלם');
            
            // Show results
            displayAnalysisResults(analysisResults);
            
            // Hide progress
            setTimeout(() => {
                analysisProgress.style.display = 'none';
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
async function generatePreview() {
    if (!sessionId) {
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/session/${sessionId}/preview`);
        const data = await response.json();
        
        if (data.status === 'success') {
            previewData = data.preview_data;
            displayPreviewSummary(previewData);
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
function displayAnalysisResults(results) {
    document.getElementById('valid-count').textContent = results.valid_records || 0;
    document.getElementById('missing-tickers-count').textContent = results.missing_tickers || 0;
    document.getElementById('duplicates-count').textContent = results.duplicate_records || 0;
    document.getElementById('errors-count').textContent = results.invalid_records || 0;
    
    analysisResults.style.display = 'block';
}

/**
 * Display preview summary
 */
function displayPreviewSummary(data) {
    document.getElementById('preview-total').textContent = data.summary.total_records || 0;
    document.getElementById('preview-import').textContent = data.summary.records_to_import || 0;
    document.getElementById('preview-skip').textContent = data.summary.records_to_skip || 0;
}

/**
 * Show preview modal
 */
function showPreviewModal() {
    if (!previewData) {
        showNotification('אין נתוני תצוגה מקדימה', 'error');
        return;
    }
    
    // Update tab counts
    document.getElementById('import-tab-count').textContent = previewData.records_to_import.length;
    document.getElementById('skip-tab-count').textContent = previewData.records_to_skip.length;
    
    // Populate tables
    populatePreviewTable('import', previewData.records_to_import);
    populatePreviewTable('skip', previewData.records_to_skip);
    
    // Show modal
    previewModal.style.display = 'block';
}

/**
 * Close preview modal
 */
function closePreviewModal() {
    previewModal.style.display = 'none';
}

/**
 * Show preview tab
 */
function showPreviewTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.preview-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`preview-tab-${tabName}`).classList.add('active');
}

/**
 * Populate preview table
 */
function populatePreviewTable(type, records) {
    const tbody = document.getElementById(`preview-tbody-${type}`);
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
    if (!sessionId) {
        showNotification('אין סשן ייבוא פעיל', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/session/${sessionId}/execute`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification(`ייבוא הושלם: ${data.imported_count} רשומות יובאו`, 'success');
            
            // Reset form
            resetForm();
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
        resetForm();
    }
}

/**
 * Reset form
 */
function resetForm() {
    currentStep = 1;
    selectedFile = null;
    selectedAccount = null;
    sessionId = null;
    analysisResults = null;
    previewData = null;
    
    // Reset UI
    clearFile();
    accountSelect.value = '';
    analysisResults.style.display = 'none';
    analysisProgress.style.display = 'none';
    
    updateStepDisplay();
    updateStepNavigation();
}

/**
 * Update step display
 */
function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else if (index + 1 < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.remove('active');
        
        if (index + 1 === currentStep) {
            content.classList.add('active');
        }
    });
}

/**
 * Update step navigation
 */
function updateStepNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Previous button
    if (currentStep > 1) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Next button
    if (currentStep < 6) {
        nextBtn.textContent = 'שלב הבא →';
        nextBtn.disabled = !canProceedToNextStep();
    } else {
        nextBtn.textContent = 'סיום';
        nextBtn.disabled = false;
    }
}

/**
 * Check if can proceed to next step
 */
function canProceedToNextStep() {
    switch (currentStep) {
        case 1:
            return selectedFile !== null;
        case 2:
            return selectedAccount !== null;
        case 3:
            return analysisResults !== null;
        case 4:
            return true; // Problem resolution
        case 5:
            return previewData !== null;
        case 6:
            return true; // Confirmation
        default:
            return false;
    }
}

/**
 * Update progress
 */
function updateProgress(percentage, text) {
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-text').textContent = text;
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
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Use the global notification system if available
    if (typeof showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback to alert
        alert(message);
    }
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
