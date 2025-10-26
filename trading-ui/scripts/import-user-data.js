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

// Add CSS for ticker button states
if (!document.getElementById('import-ticker-button-styles')) {
    const style = document.createElement('style');
    style.id = 'import-ticker-button-styles';
    style.textContent = `
        .missing-ticker-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            margin: 4px 0;
            background-color: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #dee2e6;
        }
        
        .missing-ticker-item .ticker-symbol {
            font-weight: bold;
            color: #495057;
        }
        
        .missing-ticker-item button.btn-success {
            background-color: #28a745;
            border-color: #28a745;
            color: white;
            cursor: not-allowed;
        }
        
        .missing-ticker-item button.btn-success:hover {
            background-color: #28a745;
            border-color: #28a745;
        }
        
        .result-item.total {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        
        .result-item.total .result-icon {
            color: #2196f3;
        }
        
        .result-item.total .result-count {
            color: #1976d2;
            font-weight: bold;
        }
    `;
    // Add CSS for confirmation modal
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .confirmation-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .confirmation-modal {
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            text-align: center;
        }
        
        .modal-actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
    `;
    document.head.appendChild(modalStyle);
}

// ===== IMPORT MODAL FUNCTIONS =====

/**
 * Close import user data modal
 * Hides the modal and cleans up state
 * 
 * @function closeImportUserDataModal
 * @returns {void}
 */
function closeImportUserDataModal() {
    console.log('Closing import user data modal...');
    
    // Hide modal
    document.getElementById('import-user-data-modal').style.display = 'none';
    
    // Reset modal state
    resetImportModal();
}

/**
 * Open import user data modal
 * Shows the modal and initializes the import process
 * 
 * @function openImportUserDataModal
 * @returns {void}
 */
function openImportUserDataModal() {
    console.log('Opening import user data modal...');
    
    // Reset modal state
    resetImportModal();
    
    // Show modal
    document.getElementById('import-user-data-modal').style.display = 'block';
    
    // Initialize modal
    initializeImportModal();
}

// Global state for import modal
let importCurrentStep = 1;
let importSelectedFile = null;
let importSelectedAccount = null;
let importSessionId = null;
let importAnalysisResults = null;
let importPreviewData = null;
let importReportPath = null;
let importSelectedExistingRecords = [];

/**
 * Load cached import data from Unified Cache Manager
 * Attempts to restore previous import session state from cache
 * 
 * @function loadFromCache
 * @async
 * @returns {Promise<void>}
 */
async function loadFromCache() {
    if (window.UnifiedCacheManager) {
        try {
            const cachedSessionId = await window.UnifiedCacheManager.get('import_session_id');
            const cachedAnalysisResults = await window.UnifiedCacheManager.get('import_analysis_results');
            const cachedPreviewData = await window.UnifiedCacheManager.get('import_preview_data');
            
            if (cachedSessionId) importSessionId = cachedSessionId;
            if (cachedAnalysisResults) importAnalysisResults = cachedAnalysisResults;
            if (cachedPreviewData) importPreviewData = cachedPreviewData;
        } catch (error) {
            console.warn('Failed to load from cache:', error);
        }
    }
}

/**
 * Clear all cached import data from Unified Cache Manager
 * Removes all import-related data from cache layers
 * 
 * @function clearCache
 * @async
 * @returns {Promise<void>}
 */
async function clearCache() {
    if (window.UnifiedCacheManager) {
        try {
            await window.UnifiedCacheManager.remove('import_session_id');
            await window.UnifiedCacheManager.remove('import_analysis_results');
            await window.UnifiedCacheManager.remove('import_preview_data');
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }
}

/**
 * Initialize import modal and load cached data
 * Sets up the modal state, loads cached data if available, and initializes UI elements
 * 
 * @function initializeImportModal
 * @returns {void}
 */
function initializeImportModal() {
    importCurrentStep = 1;
    importSelectedFile = null;
    importSelectedAccount = null;
    importSessionId = null;
    importAnalysisResults = null;
    importPreviewData = null;
    
    // Load from cache if available
    loadFromCache();
    
    updateImportStepDisplay();
    updateImportStepNavigation();
    loadImportTradingAccounts();
    setupImportEventListeners();
}

/**
 * Start a completely new import process
 * Clears all global state, cache, and UI elements to begin fresh import
 * 
 * @function startNewImport
 * @returns {void}
 */
function startNewImport() {
    console.log('🔄 Starting new import process...');
    
    // Clear all global state
    importCurrentStep = 1;
    importSelectedFile = null;
    importSelectedAccount = null;
    importSessionId = null;
    importAnalysisResults = null;
    importPreviewData = null;
    importReportPath = null;
    importSelectedExistingRecords = [];
    
    // Clear cache
    clearCache();
    
    // Reset UI
    clearImportFile();
    clearImportAccount();
    
    // Clear all step displays
    clearAllStepDisplays();
    
    // Reset to step 1
    updateImportStepDisplay();
    updateImportStepNavigation();
    
    // Show notification
    showNotification('ייבוא חדש התחיל - כל הנתונים נוקו. אנא בחר קובץ חדש לייבוא.', 'success');
    
    console.log('✅ New import process started successfully');
}

/**
 * Reset import modal to initial state
 * Clears all state variables and resets UI to step 1
 * 
 * @function resetImportModal
 * @returns {void}
 */
function resetImportModal() {
    importCurrentStep = 1;
    importSelectedFile = null;
    importSelectedAccount = null;
    importSessionId = null;
    importAnalysisResults = null;
    importPreviewData = null;
    
    // Clear cache
    clearCache();
    
    // Update report download button
    updateReportDownloadButton();
    
    // Reset UI
    clearImportFile();
    document.getElementById('import-account-select').value = '';
    document.getElementById('import-analysis-results').style.display = 'none';
    document.getElementById('import-analysis-progress').style.display = 'none';
    
    updateImportStepDisplay();
    updateImportStepNavigation();
    
    // Don't re-setup event listeners - they're already set up
    // setupImportEventListeners();
}

/**
 * Setup event listeners for import modal
 * Attaches event handlers for file upload, account selection, and navigation
 * 
 * @function setupImportEventListeners
 * @returns {void}
 */
function setupImportEventListeners() {
    // Remove existing listeners first to prevent duplicates
    removeImportEventListeners();
    
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
        // Remove click event to prevent double triggering
        // uploadArea.addEventListener('click', function() {
        //     fileInput.click();
        // });
    }
    
    // Account selection
    const accountSelect = document.getElementById('import-account-select');
    if (accountSelect) {
        accountSelect.addEventListener('change', handleImportAccountSelect);
    }
}

/**
 * Remove event listeners from import modal
 * Cleans up event handlers to prevent memory leaks
 * 
 * @function removeImportEventListeners
 * @returns {void}
 */
function removeImportEventListeners() {
    // File input change
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
        fileInput.removeEventListener('change', handleImportFileSelect);
    }
    
    // Drag and drop
    const uploadArea = document.getElementById('import-file-upload-area');
    if (uploadArea) {
        uploadArea.removeEventListener('dragover', handleImportDragOver);
        uploadArea.removeEventListener('dragleave', handleImportDragLeave);
        uploadArea.removeEventListener('drop', handleImportFileDrop);
        // Note: Can't remove anonymous function listeners easily
    }
    
    // Account selection
    const accountSelect = document.getElementById('import-account-select');
    if (accountSelect) {
        accountSelect.removeEventListener('change', handleImportAccountSelect);
    }
}

/**
 * Handle file selection from file input
 * Processes selected file and updates UI with file information
 * 
 * @function handleImportFileSelect
 * @param {Event} event - The change event from file input
 * @returns {void}
 */
function handleImportFileSelect(event) {
    console.log('handleImportFileSelect called');
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (file) {
        processImportSelectedFile(file);
    } else {
        console.log('No file selected');
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
 * Process selected file and update UI
 * Validates file type, stores file reference, and updates UI elements
 * 
 * @function processImportSelectedFile
 * @param {File} file - The selected file object
 * @returns {void}
 */
function processImportSelectedFile(file) {
    console.log('processImportSelectedFile called with file:', file.name);
    
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
    console.log('File stored in importSelectedFile');
    
    // Update UI
    document.getElementById('import-file-name').textContent = file.name;
    document.getElementById('import-file-size').textContent = formatFileSize(file.size);
    document.getElementById('import-file-info').style.display = 'block';
    document.getElementById('import-file-upload-area').style.display = 'none';
    console.log('UI updated with file info');
    
    // Enable next step
    updateImportStepNavigation();
    console.log('Step navigation updated');
    
    showNotification('קובץ נבחר בהצלחה', 'success');
    console.log('processImportSelectedFile completed');
}

/**
 * Clear selected file and reset file upload UI
 * Removes file selection and resets file upload area to initial state
 * 
 * @function clearImportFile
 * @returns {void}
 */
function clearImportFile() {
    importSelectedFile = null;
    document.getElementById('import-file-input').value = '';
    document.getElementById('import-file-info').style.display = 'none';
    document.getElementById('import-file-upload-area').style.display = 'block';
    updateImportStepNavigation();
}

/**
 * Clear selected account and reset account selection UI
 * Removes account selection and resets account dropdown to initial state
 * 
 * @function clearImportAccount
 * @returns {void}
 */
function clearImportAccount() {
    importSelectedAccount = null;
    document.getElementById('import-account-select').value = '';
    updateImportStepNavigation();
}

/**
 * Clear all step displays and reset UI elements
 * Hides all step content, clears lists, and resets counters to initial state
 * 
 * @function clearAllStepDisplays
 * @returns {void}
 */
function clearAllStepDisplays() {
    // Clear step 3 analysis results
    const analysisResults = document.getElementById('import-analysis-results');
    if (analysisResults) {
        analysisResults.style.display = 'none';
    }
    
    // Clear step 4 problems
    const problemsSection = document.getElementById('import-problems-section');
    if (problemsSection) {
        problemsSection.style.display = 'none';
    }
    
    // Clear step 5 preview summary
    const previewSummary = document.getElementById('import-preview-summary');
    if (previewSummary) {
        previewSummary.style.display = 'none';
    }
    
    // Clear step 6 final summary
    const finalSummary = document.getElementById('import-final-summary');
    if (finalSummary) {
        finalSummary.style.display = 'none';
    }
    
    // Clear all problem sections
    const problemSections = [
        'import-missing-tickers-section',
        'import-duplicates-section', 
        'import-existing-section',
        'import-normalization-errors-section'
    ];
    
    problemSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Clear all lists
    const listElements = [
        'import-missing-tickers-list',
        'import-duplicates-list',
        'import-existing-list',
        'import-normalization-errors-list'
    ];
    
    listElements.forEach(listId => {
        const list = document.getElementById(listId);
        if (list) {
            list.innerHTML = '';
        }
    });
    
    // Clear step 3 result cards
    const resultCards = [
        'import-total-count',
        'import-valid-count', 
        'import-invalid-count',
        'import-duplicates-count',
        'import-existing-count',
        'import-missing-tickers-count'
    ];
    
    resultCards.forEach(cardId => {
        const card = document.getElementById(cardId);
        if (card) {
            card.textContent = '0';
        }
    });
    
    // Clear step 5 preview stats
    const previewStats = [
        'import-preview-total',
        'import-preview-import', 
        'import-preview-skip'
    ];
    
    previewStats.forEach(statId => {
        const stat = document.getElementById(statId);
        if (stat) {
            stat.textContent = '0';
        }
    });
}

/**
 * Handle account selection from dropdown
 * Updates global state and triggers step navigation update
 * 
 * @function handleImportAccountSelect
 * @param {Event} event - The change event from account select dropdown
 * @returns {void}
 */
function handleImportAccountSelect(event) {
    console.log('🔍 Account selected:', event.target.value);
    importSelectedAccount = event.target.value;
    updateImportStepNavigation();
}

/**
 * Load trading accounts for import account selection
 * Populates the account dropdown with available trading accounts
 * 
 * @function loadImportTradingAccounts
 * @async
 * @returns {Promise<void>}
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
 * Navigate to next step in import wizard
 * Validates current step, processes it, and moves to next step
 * 
 * @function nextImportStep
 * @async
 * @returns {Promise<void>}
 */
async function nextImportStep() {
    console.log(`🔄 STEP TRANSITION: Moving from step ${importCurrentStep} to step ${importCurrentStep + 1}`);
    
    if (importCurrentStep < 6) {
        // Validate current step
        console.log(`🔍 STEP ${importCurrentStep}: Validating current step...`);
        if (!validateImportCurrentStep()) {
            console.log(`❌ STEP ${importCurrentStep}: Validation failed, staying on current step`);
            return;
        }
        console.log(`✅ STEP ${importCurrentStep}: Validation passed`);
        
        // Process current step
        console.log(`⚙️ STEP ${importCurrentStep}: Processing current step...`);
        await processImportCurrentStep();
        console.log(`✅ STEP ${importCurrentStep}: Processing completed`);
        
        // Move to next step
        importCurrentStep++;
        console.log(`➡️ STEP TRANSITION: Now on step ${importCurrentStep}`);
        
        console.log(`🎨 STEP ${importCurrentStep}: Updating step display...`);
        updateImportStepDisplay();
        console.log(`✅ STEP ${importCurrentStep}: Step display updated`);
        
        console.log(`🧭 STEP ${importCurrentStep}: Updating step navigation...`);
        updateImportStepNavigation();
        console.log(`✅ STEP ${importCurrentStep}: Step navigation updated`);
    }
}

/**
 * Navigate to previous step in import wizard
 * Decrements current step and updates UI accordingly
 * 
 * @function previousImportStep
 * @returns {void}
 */
function previousImportStep() {
    if (importCurrentStep > 1) {
        importCurrentStep--;
        updateImportStepDisplay();
        updateImportStepNavigation();
    }
}

/**
 * Validate current step before proceeding
 * Performs step-specific validation checks
 * 
 * @function validateImportCurrentStep
 * @returns {boolean} True if validation passes, false otherwise
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
            console.log('🔍 Validating step 2 - importSelectedAccount:', importSelectedAccount);
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
 * Process current step based on step number
 * Handles step-specific processing logic (analysis, preview generation, etc.)
 * 
 * @function processImportCurrentStep
 * @async
 * @returns {Promise<void>}
 */
async function processImportCurrentStep() {
    console.log(`⚙️ PROCESSING STEP ${importCurrentStep}: Starting...`);
    
    switch (importCurrentStep) {
        case 2:
            console.log(`📊 STEP 2: Analyzing file...`);
            await analyzeImportFile();
            console.log(`✅ STEP 2: File analysis completed`);
            break;
        case 3:
            console.log(`🔍 STEP 3: Generating preview...`);
            await generateImportPreview();
            console.log(`✅ STEP 3: Preview generation completed`);
            break;
        case 4:
            console.log(`🔧 STEP 4: Problem resolution - loading analysis results...`);
            // Problem resolution - display problems
            // Load analysis results from server
            if (importSessionId) {
                console.log(`📡 STEP 4: Loading analysis results from server (session: ${importSessionId})...`);
                await loadImportAnalysisResults();
                console.log(`✅ STEP 4: Analysis results loaded`);
                // Ensure the problems are displayed after loading
                if (importAnalysisResults) {
                    console.log(`🎨 STEP 4: Displaying problems...`);
                    displayImportProblems(importAnalysisResults);
                    console.log(`✅ STEP 4: Problems displayed`);
                } else {
                    console.log(`❌ STEP 4: No analysis results to display`);
                }
            } else {
                console.log(`❌ STEP 4: No session ID available`);
            }
            break;
        case 5:
            console.log(`👁️ STEP 5: Preview - loading preview data...`);
            // Preview - display preview data
            // Load preview data from server
            if (importSessionId) {
                console.log(`📡 STEP 5: Loading preview data from server (session: ${importSessionId})...`);
                loadImportPreviewData();
                console.log(`✅ STEP 5: Preview data loaded`);
            } else {
                console.log(`❌ STEP 5: No session ID available`);
            }
            break;
        case 6:
            console.log(`✅ STEP 6: Confirmation - displaying final summary...`);
            // Confirmation - display final summary
            displayImportFinalSummary();
            console.log(`✅ STEP 6: Final summary displayed`);
            break;
        default:
            console.log(`ℹ️ STEP ${importCurrentStep}: No processing needed`);
    }
    
    console.log(`✅ PROCESSING STEP ${importCurrentStep}: Completed`);
}

/**
 * Analyze uploaded file
 * Sends file to backend for analysis and stores results
 * 
 * @function analyzeImportFile
 * @async
 * @returns {Promise<void>}
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
            
            // Save to cache for persistence across steps
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save('import_session_id', importSessionId);
                await window.UnifiedCacheManager.save('import_analysis_results', importAnalysisResults);
            }
            
            // Update report download button
            updateReportDownloadButton();
            
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
 * Generate preview data for step 5
 * Requests preview data from backend and displays it
 * 
 * @function generateImportPreview
 * @async
 * @returns {Promise<void>}
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
            
            // Save to cache for persistence across steps
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save('import_preview_data', importPreviewData);
            }
            
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
 * Display analysis results in step 3
 * Shows counts and statistics from file analysis
 * 
 * @function displayImportAnalysisResults
 * @param {Object} results - Analysis results object
 * @param {number} results.total_records - Total records in file
 * @param {number} results.valid_records - Valid records count
 * @param {number} results.invalid_records - Invalid records count
 * @param {number} results.duplicate_records - Duplicate records count
 * @param {number} results.existing_records - Existing records count
 * @param {Array} results.missing_tickers - Array of missing ticker symbols
 * @returns {void}
 */
function displayImportAnalysisResults(results) {
    // The backend returns:
    // - valid_records: records that are technically valid (including those with missing tickers)
    // - missing_tickers: list of ticker symbols that are missing
    // - duplicate_records: count of duplicate records
    // - invalid_records: records with other errors
    
    // Calculate the breakdown:
    const validRecordsWithMissingTickers = results.valid_records || 0;
    const missingTickersUniqueCount = results.missing_tickers ? results.missing_tickers.length : 0;
    const existingRecordsCount = results.existing_records || 0;
    const duplicateRecordsCount = results.duplicate_records || 0;
    const invalidRecordsCount = results.invalid_records || 0;
    
    document.getElementById('import-existing-count').textContent = existingRecordsCount;
    
    // We need to calculate how many records have missing tickers
    // This is done by counting records that would be skipped due to missing tickers
    let recordsWithMissingTickers = 0;
    
    // Try to get the actual count from preview data if available
    if (importPreviewData && importPreviewData.records_to_skip) {
        recordsWithMissingTickers = importPreviewData.records_to_skip.filter(r => r.reason === 'missing_ticker').length;
    } else {
        // Fallback: use the missing tickers count as an estimate
        recordsWithMissingTickers = missingTickersUniqueCount;
    }
    
    // Records that are 100% valid (no missing tickers, no duplicates, no errors, no existing records)
    const fullyValidRecords = Math.max(0, validRecordsWithMissingTickers - recordsWithMissingTickers);
    
    // Total records in file
    const totalRecords = fullyValidRecords + recordsWithMissingTickers + duplicateRecordsCount + invalidRecordsCount + existingRecordsCount;
    
    // Update display
    document.getElementById('import-total-count').textContent = totalRecords;
    document.getElementById('import-valid-count').textContent = fullyValidRecords;
    document.getElementById('import-missing-tickers-count').textContent = recordsWithMissingTickers;
    document.getElementById('import-missing-tickers-detail').textContent = `${missingTickersUniqueCount} טיקרים ייחודיים`;
    document.getElementById('import-duplicates-count').textContent = duplicateRecordsCount;
    document.getElementById('import-errors-count').textContent = invalidRecordsCount;
    
        console.log('📊 Analysis Results:', {
            total: totalRecords,
            fullyValid: fullyValidRecords,
            recordsWithMissingTickers: recordsWithMissingTickers,
            uniqueMissingTickers: missingTickersUniqueCount,
            duplicates: duplicateRecordsCount,
            existingRecords: existingRecordsCount,
            errors: invalidRecordsCount,
            backendValidRecords: validRecordsWithMissingTickers,
            calculation: `${validRecordsWithMissingTickers} - ${recordsWithMissingTickers} = ${fullyValidRecords}`
        });
    
    // Display detailed error information
    displayDetailedErrors(results);
    
    document.getElementById('import-analysis-results').style.display = 'block';
    
    // Enable next button if there are any valid records (even with missing tickers)
    if (validRecordsWithMissingTickers > 0) {
        document.getElementById('import-next-btn').disabled = false;
        document.getElementById('import-next-btn').style.display = 'inline-block';
    } else {
        document.getElementById('import-next-btn').disabled = true;
        document.getElementById('import-next-btn').style.display = 'none';
    }
}

/**
 * Add a missing ticker to the system
 */
async function addMissingTicker(symbol) {
    console.log(`Adding missing ticker: ${symbol}`);
    
    // Open mini-modal for adding ticker
    showAddTickerModal(symbol);
}

/**
 * Show add ticker modal with pre-filled symbol
 */
function showAddTickerModal(symbol) {
    // Create modal HTML if it doesn't exist
    let modal = document.getElementById('add-ticker-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-ticker-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h4>הוסף טיקר חדש</h4>
                    <button class="close-btn" onclick="closeAddTickerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-ticker-form">
                        <div class="form-group">
                            <label for="addTickerSymbol">סמל הטיקר:</label>
                            <input type="text" id="addTickerSymbol" required>
                        </div>
                        <div class="form-group">
                            <label for="addTickerName">שם הטיקר:</label>
                            <input type="text" id="addTickerName" required>
                        </div>
                        <div class="form-group">
                            <label for="addTickerType">סוג הטיקר:</label>
                            <select id="addTickerType" required>
                                <option value="">בחר סוג</option>
                                <option value="stock">מניה</option>
                                <option value="etf">ETF</option>
                                <option value="bond">אג"ח</option>
                                <option value="crypto">קריפטו</option>
                                <option value="commodity">סחורה</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="addTickerCurrency">מטבע:</label>
                            <select id="addTickerCurrency" required>
                                <option value="">בחר מטבע</option>
                                <option value="1">USD</option>
                                <option value="2">EUR</option>
                                <option value="3">ILS</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="addTickerRemarks">הערות:</label>
                            <textarea id="addTickerRemarks" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeAddTickerModal()">ביטול</button>
                    <button class="btn btn-primary" onclick="saveMissingTicker()">שמור טיקר</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Pre-fill symbol
    document.getElementById('addTickerSymbol').value = symbol;
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Close add ticker modal
 * Hides the modal for adding missing tickers
 * 
 * @function closeAddTickerModal
 * @returns {void}
 */
function closeAddTickerModal() {
    document.getElementById('add-ticker-modal').style.display = 'none';
}

/**
 * Save missing ticker to database
 * Creates new ticker record and updates UI
 * 
 * @function saveMissingTicker
 * @async
 * @returns {Promise<void>}
 */
async function saveMissingTicker() {
    // Get the ticker symbol from the modal BEFORE calling saveTicker
    const symbolInput = document.getElementById('tickerSymbol');
    const tickerSymbol = symbolInput ? symbolInput.value.trim().toUpperCase() : null;
    
    console.log('🎯 Saving ticker:', tickerSymbol);
    
    // Use existing saveTicker function from tickers.js
    if (window.saveTicker) {
        try {
            await window.saveTicker();
            closeAddTickerModal();
            
            if (tickerSymbol) {
                console.log('✅ Ticker saved successfully, updating button for:', tickerSymbol);
                
                // Update the specific button for this ticker
                updateTickerButtonStatus(tickerSymbol, 'handled');
                
                // Remove the ticker from the missing tickers list in memory
                if (importAnalysisResults && importAnalysisResults.missing_tickers) {
                    importAnalysisResults.missing_tickers = importAnalysisResults.missing_tickers.filter(t => t !== tickerSymbol);
                    console.log('📝 Updated missing_tickers list:', importAnalysisResults.missing_tickers);
                }
                
                // Show success notification
                if (window.showNotification) {
                    window.showNotification(`טיקר ${tickerSymbol} נוסף בהצלחה למערכת!`, 'success');
                }
                
                // Update server about the new ticker so it can recalculate preview
                await updateServerWithNewTicker(tickerSymbol);
            }
        } catch (error) {
            console.error('❌ Error saving ticker:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בשמירת הטיקר', 'error');
            }
        }
    } else {
        console.error('saveTicker function not available');
        alert('שגיאה: פונקציית שמירת הטיקר לא זמינה');
    }
}

/**
 * Update server about new ticker so it can recalculate preview
 */
async function updateServerWithNewTicker(tickerSymbol) {
    if (!importSessionId) {
        console.error('No session ID available');
        return;
    }
    
    try {
        console.log('🔄 Updating server with new ticker:', tickerSymbol);
        
        // Call API to update session with new ticker
        const response = await fetch(`/api/user-data-import/session/${importSessionId}/update-ticker`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticker_symbol: tickerSymbol
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            console.log('✅ Server updated with new ticker');
            
            // Reload preview data to reflect the changes
            await loadImportPreviewData();
            
            // Update the preview summary display
            if (importPreviewData) {
                displayImportPreviewSummary(importPreviewData);
            }
        } else {
            console.error('❌ Failed to update server:', data.message);
        }
    } catch (error) {
        console.error('❌ Error updating server:', error);
    }
}

/**
 * Update ticker button status
 */
function updateTickerButtonStatus(tickerSymbol, status) {
    console.log('🔧 updateTickerButtonStatus called with:', tickerSymbol, status);
    const button = document.querySelector(`button[data-ticker-symbol="${tickerSymbol}"]`);
    console.log('🔍 Found button:', button);
    
    if (button) {
        if (status === 'handled') {
            button.textContent = 'טופל!';
            button.className = 'btn btn-sm btn-success';
            button.disabled = true;
            button.onclick = null; // Remove click handler
            console.log('✅ Button updated successfully');
        }
    } else {
        console.error('❌ Button not found for ticker:', tickerSymbol);
    }
}

/**
 * Update all ticker buttons based on current status
 * Refreshes button states for all missing tickers
 * 
 * @function updateAllTickerButtons
 * @returns {void}
 */
function updateAllTickerButtons() {
    if (!importAnalysisResults || !importAnalysisResults.missing_tickers) {
        return;
    }
    
    importAnalysisResults.missing_tickers.forEach(tickerSymbol => {
        const button = document.querySelector(`button[data-ticker-symbol="${tickerSymbol}"]`);
        if (button && button.textContent === 'הוסף למערכת') {
            // Button is still in "add" state, keep it as is
        }
    });
}

/**
 * Add missing tickers functionality
 */


/**
 * Load analysis results from server for step 4
 * Fetches detailed analysis results including problems and existing records
 * 
 * @function loadImportAnalysisResults
 * @async
 * @returns {Promise<void>}
 */
async function loadImportAnalysisResults() {
    if (!importSessionId) {
        console.error('No session ID available');
        return;
    }
    
    try {
        // Use preview endpoint to get detailed data including duplicates
        const response = await fetch(`/api/user-data-import/session/${importSessionId}/preview`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const previewData = data.preview_data;
            
            // Count duplicates from records_to_skip
            const duplicateRecords = previewData.records_to_skip.filter(record => 
                record.reason === 'within_file_duplicate' || record.reason === 'existing_record'
            );
            
            // Create analysis results from preview data
            const invalidRecords = previewData.records_to_skip.filter(record => 
                record.reason === 'validation_error'
            );
            
            importAnalysisResults = {
                total_records: previewData.summary.total_records || 0,
                valid_records: previewData.summary.records_to_import || 0,
                invalid_records: invalidRecords.length,
                duplicate_records: duplicateRecords.length,
                existing_records: duplicateRecords.filter(record => 
                    record.reason === 'existing_record'
                ).map((record, index) => ({
                    record_index: index,
                    record: record,
                    system_matches: record.details?.system_matches || []
                })),
                missing_tickers: previewData.summary.missing_tickers || [],
                normalization_errors: [],
                validation_errors: [],
                duplicate_details: {
                    within_file_duplicates: duplicateRecords.filter(record => 
                        record.reason === 'within_file_duplicate'
                    ).map((record, index) => ({
                        record_index: index,
                        // record is already the flat record itself, not nested
                        symbol: record.symbol,
                        action: record.action,
                        date: record.date,
                        quantity: record.quantity,
                        price: record.price,
                        fee: record.fee,
                        currency: record.currency,
                        asset_category: record.asset_category,
                        proceeds: record.proceeds,
                        basis: record.basis,
                        realized_pl: record.realized_pl,
                        mtm_pl: record.mtm_pl,
                        code: record.code,
                        row_number: record.row_number,
                        external_id: record.external_id,
                        source: record.source,
                        within_file_matches: record.details?.within_file_matches || [],
                        confidence_score: record.confidence_score || 60
                    })),
                    existing_records: duplicateRecords.filter(record => 
                        record.reason === 'existing_record'
                    ).map((record, index) => ({
                        record_index: index,
                        // record is already the flat record itself, not nested
                        symbol: record.symbol,
                        action: record.action,
                        date: record.date,
                        quantity: record.quantity,
                        price: record.price,
                        fee: record.fee,
                        currency: record.currency,
                        asset_category: record.asset_category,
                        proceeds: record.proceeds,
                        basis: record.basis,
                        realized_pl: record.realized_pl,
                        mtm_pl: record.mtm_pl,
                        code: record.code,
                        row_number: record.row_number,
                        external_id: record.external_id,
                        source: record.source,
                        system_matches: record.details?.system_matches || [],
                        confidence_score: record.confidence_score || 60
                    }))
                }
            };
            
            console.log('🔍 Loaded analysis results from preview:', importAnalysisResults);
            displayImportProblems(importAnalysisResults);
        } else {
            console.error('Failed to load analysis results:', data.message);
            showNotification('שגיאה בטעינת נתוני הניתוח', 'error');
        }
    } catch (error) {
        console.error('Error loading analysis results:', error);
        showNotification('שגיאה בטעינת נתוני הניתוח', 'error');
    }
}

/**
 * Load preview data from server for step 5
 * Fetches preview data including records to import and skip
 * 
 * @function loadImportPreviewData
 * @async
 * @returns {Promise<void>}
 */
async function loadImportPreviewData() {
    if (!importSessionId) {
        console.error('No session ID available');
        return;
    }
    
    try {
        console.log('🔄 Loading preview data for session:', importSessionId);
        const response = await fetch(`/api/user-data-import/session/${importSessionId}/preview`);
        const data = await response.json();
        
        console.log('📊 Preview API response:', data);
        
        if (data.status === 'success') {
            importPreviewData = data.preview_data;
            console.log('📊 Preview data loaded:', importPreviewData);
            displayImportPreviewSummary(importPreviewData);
        } else {
            console.error('Failed to load preview data:', data.message);
            showNotification('שגיאה בטעינת נתוני התצוגה המקדימה', 'error');
        }
    } catch (error) {
        console.error('Error loading preview data:', error);
        showNotification('שגיאה בטעינת נתוני התצוגה המקדימה', 'error');
    }
}

/**
 * Display problems in step 4
 * Shows missing tickers, duplicates, and existing records with resolution options
 * 
 * @function displayImportProblems
 * @param {Object} results - Problems data object
 * @param {Array} results.missing_tickers - Array of missing ticker symbols
 * @param {Array} results.duplicate_details - Duplicate records details
 * @param {Array} results.existing_records - Existing records details
 * @returns {void}
 */
function displayImportProblems(results) {
    console.log('🔍 Displaying problems with results:', results);
    
    // Show missing tickers section if there are missing tickers
    const missingTickersSection = document.getElementById('import-missing-tickers-section');
    const missingTickersList = document.getElementById('import-missing-tickers-list');
    
    // Show missing tickers section if there are missing tickers
    if (results.missing_tickers && results.missing_tickers.length > 0) {
        missingTickersSection.style.display = 'block';
        missingTickersList.innerHTML = results.missing_tickers.map(ticker => 
            `<div class="missing-ticker-item">
                <span class="ticker-symbol">${ticker}</span>
                <button class="btn btn-sm btn-primary" 
                        data-ticker-symbol="${ticker}" 
                        onclick="addMissingTicker('${ticker}')">
                    הוסף למערכת
                </button>
            </div>`
        ).join('');
    } else {
        missingTickersSection.style.display = 'none';
    }
    
    // Update button states after rendering
    setTimeout(() => {
        updateAllTickerButtons();
    }, 100);
    
    // Show duplicates section if there are duplicates
    const duplicatesSection = document.getElementById('import-duplicates-section');
    const duplicatesList = document.getElementById('import-duplicates-list');
    
    console.log('🔍 Duplicate records:', results.duplicate_records);
    console.log('🔍 Duplicates section element:', duplicatesSection);
    
    if (results.duplicate_records && results.duplicate_records > 0) {
        if (duplicatesSection) {
            duplicatesSection.style.display = 'block';
            
            // Build detailed duplicate list
            let duplicateListHtml = '';
            const duplicateDetails = results.duplicate_details || {};
            
            console.log('🔍 Duplicate details:', duplicateDetails);
            console.log('🔍 Within-file duplicates:', duplicateDetails.within_file_duplicates);
            console.log('🔍 System duplicates:', duplicateDetails.system_duplicates);
            
            // Within-file duplicates
            if (duplicateDetails.within_file_duplicates && duplicateDetails.within_file_duplicates.length > 0) {
                duplicateListHtml += `
                    <div class="duplicate-group">
                        <h6>🔍 כפילויות בתוך הקובץ (${duplicateDetails.within_file_duplicates.length})</h6>
                        <div class="duplicate-items">
                `;
                
                duplicateDetails.within_file_duplicates.forEach((dup, index) => {
                    // dup is already the record itself, not wrapped in a record property
                    duplicateListHtml += `
                        <div class="duplicate-item">
                            <div class="duplicate-header">
                                <strong>כפילות ${index + 1}</strong>
                                <span class="duplicate-confidence">דמיון: ${dup.confidence_score || 60}%</span>
                            </div>
                            <div class="duplicate-records">
                                <div class="record-comparison">
                                    <div class="record-main">
                                        <h6>📄 רשומה ראשית (שורה ${dup.row_number || 'N/A'})</h6>
                                        <div class="record-details">
                                            <div class="record-field"><strong>טיקר:</strong> ${dup.symbol || 'N/A'}</div>
                                            <div class="record-field"><strong>פעולה:</strong> ${dup.action || 'N/A'}</div>
                                            <div class="record-field"><strong>תאריך:</strong> ${dup.date || 'N/A'}</div>
                                            <div class="record-field"><strong>כמות:</strong> ${dup.quantity || 'N/A'}</div>
                                            <div class="record-field"><strong>מחיר:</strong> $${dup.price || 'N/A'}</div>
                                            <div class="record-field"><strong>עמלה:</strong> $${dup.fee || 'N/A'}</div>
                                            <div class="record-field"><strong>סה"כ:</strong> $${dup.proceeds || 'N/A'}</div>
                                            <div class="record-field"><strong>רווח/הפסד:</strong> $${dup.realized_pl || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div class="record-matches">
                                        <h6>🔍 רשומות דומות (${dup.within_file_matches?.length || 0})</h6>
                                        ${dup.within_file_matches?.map((match, matchIndex) => `
                                            <div class="record-match">
                                                <div class="match-header">
                                                    <strong>רשומה דומה ${matchIndex + 1}</strong>
                                                    <span class="match-confidence">דמיון: ${match.confidence || 60}%</span>
                                                </div>
                                                <div class="record-details">
                                                    <div class="record-field"><strong>טיקר:</strong> ${match.record?.symbol || 'N/A'}</div>
                                                    <div class="record-field"><strong>פעולה:</strong> ${match.record?.action || 'N/A'}</div>
                                                    <div class="record-field"><strong>תאריך:</strong> ${match.record?.date || 'N/A'}</div>
                                                    <div class="record-field"><strong>כמות:</strong> ${match.record?.quantity || 'N/A'}</div>
                                                    <div class="record-field"><strong>מחיר:</strong> $${match.record?.price || 'N/A'}</div>
                                                    <div class="record-field"><strong>עמלה:</strong> $${match.record?.fee || 'N/A'}</div>
                                                    <div class="record-field"><strong>סה"כ:</strong> $${match.record?.proceeds || 'N/A'}</div>
                                                    <div class="record-field"><strong>רווח/הפסד:</strong> $${match.record?.realized_pl || 'N/A'}</div>
                                                </div>
                                            </div>
                                        `).join('') || '<div class="no-matches">אין רשומות דומות</div>'}
                                    </div>
                                </div>
                            </div>
                            <div class="duplicate-actions-item">
                                <button class="btn btn-success btn-xs" onclick="acceptDuplicate(${index}, 'within_file')">
                                    ✅ ייבוא הכול
                                </button>
                                <button class="btn btn-danger btn-xs" onclick="rejectDuplicate(${index}, 'within_file')">
                                    ❌ אשר כפילות
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                duplicateListHtml += `
                        </div>
                    </div>
                `;
            }
            
            // System duplicates
            if (duplicateDetails.system_duplicates && duplicateDetails.system_duplicates.length > 0) {
                duplicateListHtml += `
                    <div class="duplicate-group">
                        <h6>🗄️ כפילויות במערכת (${duplicateDetails.system_duplicates.length})</h6>
                        <div class="duplicate-items">
                `;
                
                duplicateDetails.system_duplicates.forEach((dup, index) => {
                    // dup is already the record itself, not wrapped in a record property
                    duplicateListHtml += `
                        <div class="duplicate-item">
                            <div class="duplicate-header">
                                <strong>כפילות ${index + 1}</strong>
                                <span class="duplicate-confidence">דמיון: ${dup.confidence_score || 60}%</span>
                            </div>
                            <div class="duplicate-records">
                                <div class="record-comparison">
                                    <div class="record-main">
                                        <h6>📄 רשומה חדשה (שורה ${dup.row_number || 'N/A'})</h6>
                                        <div class="record-details">
                                            <div class="record-field"><strong>טיקר:</strong> ${dup.symbol || 'N/A'}</div>
                                            <div class="record-field"><strong>פעולה:</strong> ${dup.action || 'N/A'}</div>
                                            <div class="record-field"><strong>תאריך:</strong> ${dup.date || 'N/A'}</div>
                                            <div class="record-field"><strong>כמות:</strong> ${dup.quantity || 'N/A'}</div>
                                            <div class="record-field"><strong>מחיר:</strong> $${dup.price || 'N/A'}</div>
                                            <div class="record-field"><strong>עמלה:</strong> $${dup.fee || 'N/A'}</div>
                                            <div class="record-field"><strong>סה"כ:</strong> $${dup.proceeds || 'N/A'}</div>
                                            <div class="record-field"><strong>רווח/הפסד:</strong> $${dup.realized_pl || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div class="record-matches">
                                        <h6>🗄️ רשומות קיימות במערכת (${dup.system_matches?.length || 0})</h6>
                                        ${dup.system_matches?.map((match, matchIndex) => `
                                            <div class="record-match">
                                                <div class="match-header">
                                                    <strong>רשומה קיימת ${matchIndex + 1}</strong>
                                                    <span class="match-confidence">דמיון: ${match.confidence || 60}%</span>
                                                </div>
                                                <div class="record-details">
                                                    <div class="record-field"><strong>טיקר:</strong> ${match.record?.symbol || 'N/A'}</div>
                                                    <div class="record-field"><strong>פעולה:</strong> ${match.record?.action || 'N/A'}</div>
                                                    <div class="record-field"><strong>תאריך:</strong> ${match.record?.date || 'N/A'}</div>
                                                    <div class="record-field"><strong>כמות:</strong> ${match.record?.quantity || 'N/A'}</div>
                                                    <div class="record-field"><strong>מחיר:</strong> $${match.record?.price || 'N/A'}</div>
                                                    <div class="record-field"><strong>עמלה:</strong> $${match.record?.fee || 'N/A'}</div>
                                                    <div class="record-field"><strong>סה"כ:</strong> $${match.record?.proceeds || 'N/A'}</div>
                                                    <div class="record-field"><strong>רווח/הפסד:</strong> $${match.record?.realized_pl || 'N/A'}</div>
                                                </div>
                                            </div>
                                        `).join('') || '<div class="no-matches">אין רשומות קיימות</div>'}
                                    </div>
                                </div>
                            </div>
                            <div class="duplicate-actions-item">
                                <button class="btn btn-success btn-xs" onclick="acceptDuplicate(${index}, 'system')">
                                    ✅ ייבוא הכול
                                </button>
                                <button class="btn btn-danger btn-xs" onclick="rejectDuplicate(${index}, 'system')">
                                    ❌ אשר כפילות
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                duplicateListHtml += `
                        </div>
                    </div>
                `;
            }
            
            duplicatesList.innerHTML = `
                <div class="duplicate-info">
                    <h6>נמצאו ${results.duplicate_records} כפילויות פוטנציאליות</h6>
                    <p class="text-muted">המערכת זיהתה עסקאות שעלולות להיות כפילויות. אנא סקור אותן בקפידה.</p>
                    
                    ${duplicateListHtml}
                    
                    <div class="duplicate-actions">
                        <button class="btn btn-success btn-sm" onclick="acceptAllDuplicates()">
                            ✅ ייבוא כל הכפילויות
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectAllDuplicates()">
                            ❌ אשר כל הכפילויות
                        </button>
                    </div>
                </div>
            `;
            console.log('✅ Duplicates section displayed with detailed list');
        } else {
            console.error('❌ Duplicates section element not found');
        }
    } else {
        if (duplicatesSection) {
            duplicatesSection.style.display = 'none';
        }
        console.log('ℹ️ No duplicates found');
    }
    
    // Show validation errors if there are any
    const validationErrorsSection = document.getElementById('import-validation-errors-section');
    const validationErrorsList = document.getElementById('import-validation-errors-list');
    
    if (results.validation_errors && results.validation_errors.length > 0) {
        if (validationErrorsSection) {
            validationErrorsSection.style.display = 'block';
            validationErrorsList.innerHTML = results.validation_errors.map((error, index) => 
                `<div class="validation-error-item">שגיאה ${index + 1}: ${error.errors.join(', ')}</div>`
            ).join('');
        }
    } else {
        if (validationErrorsSection) {
            validationErrorsSection.style.display = 'none';
        }
    }
    
    // Show normalization errors if there are any
    const normalizationErrorsSection = document.getElementById('import-normalization-errors-section');
    const normalizationErrorsList = document.getElementById('import-normalization-errors-list');
    
    if (results.normalization_errors && results.normalization_errors.length > 0) {
        if (normalizationErrorsSection) {
            normalizationErrorsSection.style.display = 'block';
            normalizationErrorsList.innerHTML = results.normalization_errors.map((error, index) => 
                `<div class="normalization-error-item">שורה ${error.record_index + 1}: ${error.errors.join(', ')}</div>`
            ).join('');
        }
    } else {
        if (normalizationErrorsSection) {
            normalizationErrorsSection.style.display = 'none';
        }
    }
    
    // Show existing records section if there are existing records
    displayExistingRecords(results);
}

/**
 * Display existing records section in step 4
 * Shows records that already exist in the system with "Import Anyway" buttons
 * 
 * @function displayExistingRecords
 * @param {Object} results - Results object containing existing records
 * @param {Array} results.existing_records - Array of existing record objects
 * @returns {void}
 */
function displayExistingRecords(results) {
    const existingSection = document.getElementById('import-existing-section');
    const existingList = document.getElementById('import-existing-list');
    
    if (!existingSection || !existingList) {
        console.warn('Existing records section elements not found');
        return;
    }
    
    if (!results || !results.existing_records || results.existing_records.length === 0) {
        existingSection.style.display = 'none';
        return;
    }
    
    existingSection.style.display = 'block';
    
    let html = '<div class="existing-records-container">';
    
    results.existing_records.forEach((item, index) => {
        const record = item.record;
        const matches = item.system_matches || [];
        
        html += `
            <div class="existing-record-item" data-record-index="${item.record_index}">
                <div class="record-info">
                    <strong>${record.symbol}</strong> - 
                    ${record.action === 'buy' ? 'קניה' : 'מכירה'} 
                    ${record.quantity} @ $${record.price.toFixed(2)}
                    <br>
                    <small>תאריך: ${new Date(record.date).toLocaleDateString('he-IL')}</small>
                </div>
                <div class="record-matches">
                    <small>נמצאו ${matches.length} התאמות במערכת</small>
                </div>
                <button class="btn btn-danger btn-sm" 
                        onclick="importExistingRecord(${item.record_index})"
                        id="existing-btn-${item.record_index}">
                    ⚠️ ייבא בכל זאת
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    existingList.innerHTML = html;
}

/**
 * Import existing record (user's choice to import despite existing)
 * Sends request to backend to allow importing an existing record
 * 
 * @function importExistingRecord
 * @param {number} recordIndex - Index of the record to import
 * @async
 * @returns {Promise<void>}
 */
async function importExistingRecord(recordIndex) {
    try {
        // Mark this record for import
        if (!importSelectedExistingRecords) {
            importSelectedExistingRecords = [];
        }
        importSelectedExistingRecords.push(recordIndex);
        
        // Update button
        const btn = document.getElementById(`existing-btn-${recordIndex}`);
        btn.textContent = '✅ יובא';
        btn.className = 'btn btn-success btn-sm';
        btn.disabled = true;
        
        // Send to backend
        await fetch(`/api/user-data-import/session/${importSessionId}/allow-existing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record_index: recordIndex })
        });
        
        // Reload preview
        await loadImportPreviewData();
        displayImportPreviewSummary();
        
        showNotification('הרשומה תיובא למרות שהיא קיימת במערכת', 'warning');
    } catch (error) {
        console.error('Error allowing existing record import:', error);
        showNotification('שגיאה בעדכון סטטוס הרשומה', 'error');
    }
}

/**
 * Display detailed error information
 */
function displayDetailedErrors(results) {
    const errorContainer = document.getElementById('import-error-details');
    if (!errorContainer) return;
    
    let errorHtml = '';
    
    // Normalization errors
    if (results.normalization_errors && results.normalization_errors.length > 0) {
        errorHtml += '<div class="error-section">';
        errorHtml += '<h4>שגיאות נורמליזציה:</h4>';
        errorHtml += '<div class="error-list">';
        results.normalization_errors.forEach((error, index) => {
            errorHtml += `<div class="error-item">`;
            errorHtml += `<strong>שורה ${error.record_index + 1}:</strong> `;
            errorHtml += error.errors.join(', ');
            errorHtml += `</div>`;
        });
        errorHtml += '</div></div>';
    }
    
    // Validation errors
    if (results.validation_errors && results.validation_errors.length > 0) {
        errorHtml += '<div class="error-section">';
        errorHtml += '<h4>שגיאות ולידציה:</h4>';
        errorHtml += '<div class="error-list">';
        results.validation_errors.forEach((error, index) => {
            errorHtml += `<div class="error-item">`;
            errorHtml += `<strong>רשומה ${index + 1}:</strong> `;
            errorHtml += error.errors.join(', ');
            errorHtml += `</div>`;
        });
        errorHtml += '</div></div>';
    }
    
    // Missing tickers
    if (results.missing_tickers && results.missing_tickers.length > 0) {
        errorHtml += '<div class="error-section">';
        errorHtml += '<h4>טיקרים חסרים במערכת:</h4>';
        errorHtml += '<div class="error-list">';
        errorHtml += '<div class="error-item warning">';
        errorHtml += `<strong>רשימת טיקרים:</strong> ${results.missing_tickers.join(', ')}`;
        errorHtml += '</div>';
        errorHtml += '<div class="error-item info">';
        errorHtml += 'הטיקרים הללו לא קיימים במערכת. ניתן להוסיף אותם בשלב 4 או לדלג על הרשומות הרלוונטיות.';
        errorHtml += '</div>';
        errorHtml += '</div></div>';
    }
    
    // Duplicate details
    if (results.duplicate_details && results.duplicate_details.within_file_duplicates && results.duplicate_details.within_file_duplicates.length > 0) {
        errorHtml += '<div class="error-section">';
        errorHtml += '<h4>כפילויות זוהו:</h4>';
        errorHtml += '<div class="error-list">';
        results.duplicate_details.within_file_duplicates.forEach((dup, index) => {
            errorHtml += `<div class="error-item">`;
            errorHtml += `<strong>כפילות ${index + 1}:</strong> `;
            errorHtml += `${dup.record.symbol} - ${dup.record.action} - ${dup.record.quantity} (ביטחון: ${dup.confidence_score}%)`;
            errorHtml += `</div>`;
        });
        errorHtml += '</div></div>';
    }
    
    if (errorHtml === '') {
        errorHtml = '<div class="no-errors">אין שגיאות לפרט</div>';
    }
    
    errorContainer.innerHTML = errorHtml;
    errorContainer.style.display = errorHtml.includes('no-errors') ? 'none' : 'block';
}

/**
 * Display final summary for step 6
 * Shows import completion summary with file name and statistics
 * 
 * @function displayImportFinalSummary
 * @returns {void}
 */
function displayImportFinalSummary() {
    // Display file name
    const filenameElement = document.getElementById('import-final-filename');
    if (filenameElement && importSelectedFile) {
        filenameElement.textContent = importSelectedFile.name;
    }
    
    // Display account name
    const accountElement = document.getElementById('import-final-account');
    if (accountElement && importSelectedAccount) {
        const accountSelect = document.getElementById('import-account-select');
        const selectedOption = accountSelect.options[accountSelect.selectedIndex];
        accountElement.textContent = selectedOption ? selectedOption.text : 'לא נבחר';
    }
    
    // Display import count
    const importCountElement = document.getElementById('import-final-import-count');
    if (importCountElement && importPreviewData) {
        importCountElement.textContent = importPreviewData.summary.records_to_import || 0;
    }
    
    // Display skip count
    const skipCountElement = document.getElementById('import-final-skip-count');
    if (skipCountElement && importPreviewData) {
        skipCountElement.textContent = importPreviewData.summary.records_to_skip || 0;
    }
}

/**
 * Display preview summary for step 5
 * Shows import statistics and record counts
 * 
 * @function displayImportPreviewSummary
 * @param {Object} data - Preview data object
 * @param {Object} data.summary - Summary statistics
 * @param {number} data.summary.total_records - Total records count
 * @param {number} data.summary.records_to_import - Records to import count
 * @param {number} data.summary.records_to_skip - Records to skip count
 * @returns {void}
 */
function displayImportPreviewSummary(data) {
    console.log('📊 Preview Summary Data:', data);
    console.log('📊 Summary:', data.summary);
    
    document.getElementById('import-preview-total').textContent = data.summary.total_records || 0;
    document.getElementById('import-preview-import').textContent = data.summary.records_to_import || 0;
    document.getElementById('import-preview-skip').textContent = data.summary.records_to_skip || 0;
    
    console.log('📊 Updated preview display:', {
        total: data.summary.total_records || 0,
        import: data.summary.records_to_import || 0,
        skip: data.summary.records_to_skip || 0
    });
}

/**
 * Show preview modal with import data
 * Displays modal with records to import and skip
 * 
 * @function showImportPreviewModal
 * @returns {void}
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
 * Hides the preview modal
 * 
 * @function closeImportPreviewModal
 * @returns {void}
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
 * Show confirmation modal for user decisions
 * Displays a custom modal for confirming actions like importing existing records
 * 
 * @function showConfirmationModal
 * @param {string} title - Modal title
 * @param {string} message - Modal message content
 * @param {string} [type='warning'] - Modal type (warning, error, info)
 * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
 */
function showConfirmationModal(title, message, type = 'warning') {
    return new Promise((resolve) => {
        // Create modal HTML
        const modalHtml = `
            <div class="confirmation-modal-overlay" id="confirmationModalOverlay">
                <div class="confirmation-modal">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="closeConfirmationModal(false)">ביטול</button>
                        <button class="btn btn-danger" onclick="closeConfirmationModal(true)">אשר</button>
                    </div>
                </div>
            </div>
        `;
        
        // Append to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Store resolve function
        window.confirmationModalResolve = resolve;
    });
}

/**
 * Close confirmation modal and resolve promise
 * Removes modal from DOM and resolves the confirmation promise
 * 
 * @function closeConfirmationModal
 * @param {boolean} confirmed - Whether user confirmed the action
 * @returns {void}
 */
function closeConfirmationModal(confirmed) {
    const overlay = document.getElementById('confirmationModalOverlay');
    if (overlay) {
        overlay.remove();
    }
    if (window.confirmationModalResolve) {
        window.confirmationModalResolve(confirmed);
        window.confirmationModalResolve = null;
    }
}

/**
 * Execute the final import process
 * Sends request to backend to execute the import with confirmation for existing records
 * 
 * @function executeImport
 * @async
 * @returns {Promise<void>}
 */
async function executeImport() {
    if (!importSessionId) {
        showNotification('אין סשן ייבוא פעיל', 'error');
        return;
    }
    
    try {
        // Check if user is forcing import of existing records
        if (importSelectedExistingRecords && importSelectedExistingRecords.length > 0) {
            const confirmed = await showConfirmationModal(
                'אישור ייבוא רשומות קיימות',
                `אתה עומד לייבא ${importSelectedExistingRecords.length} רשומות שכבר קיימות במערכת. פעולה זו עלולה ליצור כפילויות. האם אתה בטוח?`,
                'warning'
            );
            
            if (!confirmed) {
                showNotification('הייבוא בוטל', 'info');
                return;
            }
        }
        
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
 * Update step display indicators and content visibility
 * Shows/hides step content and updates step indicators based on current step
 * 
 * @function updateImportStepDisplay
 * @returns {void}
 */
function updateImportStepDisplay() {
    console.log(`🎨 UPDATE STEP DISPLAY: Updating display for step ${importCurrentStep}`);
    
    // Update step indicators
    document.querySelectorAll('#import-user-data-modal .step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index + 1 === importCurrentStep) {
            step.classList.add('active');
            console.log(`🎯 STEP INDICATOR: Step ${index + 1} marked as active`);
        } else if (index + 1 < importCurrentStep) {
            step.classList.add('completed');
            console.log(`✅ STEP INDICATOR: Step ${index + 1} marked as completed`);
        }
    });
    
    // Update step content
    document.querySelectorAll('#import-user-data-modal .step-content').forEach((content, index) => {
        content.classList.remove('active');
        
        if (index + 1 === importCurrentStep) {
            content.classList.add('active');
            console.log(`📄 STEP CONTENT: Step ${index + 1} content marked as active`);
        }
    });
    
    // Process current step to load data
    if (importCurrentStep >= 4 && importSessionId) {
        console.log(`⚙️ UPDATE STEP DISPLAY: Processing step ${importCurrentStep} (session: ${importSessionId})`);
        processImportCurrentStep();
    } else if (importCurrentStep >= 4) {
        console.log(`❌ UPDATE STEP DISPLAY: Step ${importCurrentStep} but no session ID`);
    } else {
        console.log(`ℹ️ UPDATE STEP DISPLAY: Step ${importCurrentStep} - no processing needed`);
    }
    
    console.log(`✅ UPDATE STEP DISPLAY: Completed for step ${importCurrentStep}`);
}

/**
 * Update step navigation buttons state
 * Enables/disables navigation buttons based on current step and validation
 * 
 * @function updateImportStepNavigation
 * @returns {void}
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
 * Check if user can proceed to next step
 * Validates step-specific requirements for navigation
 * 
 * @function canProceedToNextImportStep
 * @returns {boolean} True if can proceed, false otherwise
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
/**
 * Review duplicates
 */
function reviewDuplicates() {
    showNotification('פונקציונליות סקירת כפילויות תתווסף בעתיד', 'info');
}

/**
 * Accept a specific duplicate
 */
function acceptDuplicate(index, type) {
    console.log(`Accepting duplicate ${index} of type ${type}`);
    showNotification(`כפילות ${index + 1} אושרה`, 'success');
    // TODO: Implement API call to accept specific duplicate
}

/**
 * Reject a specific duplicate
 */
function rejectDuplicate(index, type) {
    console.log(`Rejecting duplicate ${index} of type ${type}`);
    showNotification(`כפילות ${index + 1} נדחתה`, 'success');
    // TODO: Implement API call to reject specific duplicate
}

/**
 * Accept all duplicates
 */
function acceptAllDuplicates() {
    showNotification('כל הכפילויות התקבלו - יועברו לשלב הבא', 'success');
    // TODO: Implement logic to accept all duplicates
}

/**
 * Reject all duplicates
 */
function rejectAllDuplicates() {
    showNotification('כל הכפילויות נדחו - יוסרו מהרשימה', 'info');
    // TODO: Implement logic to reject all duplicates
}

/**
 * Download import report
 */
async function downloadImportReport() {
    if (!importSessionId) {
        showNotification('אין דוח זמין להורדה', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/reports/${importSessionId}/download?user_id=1&type=live`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `import_report_${importSessionId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('דוח הייבוא הורד בהצלחה', 'success');
        } else {
            const error = await response.json();
            showNotification(`שגיאה בהורדת הדוח: ${error.message}`, 'error');
        }
    } catch (error) {
        console.error('Download report error:', error);
        showNotification('שגיאה בהורדת הדוח', 'error');
    }
}

/**
 * Get live report status
 */
async function getLiveReportStatus() {
    if (!importSessionId) {
        return null;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/reports/${importSessionId}?user_id=1`);
        const data = await response.json();
        
        if (data.status === 'success') {
            return data.report;
        }
    } catch (error) {
        console.error('Get live report error:', error);
    }
    
    return null;
}

/**
 * Update report download button visibility
 */
function updateReportDownloadButton() {
    const downloadBtn = document.getElementById('import-download-report-btn');
    if (downloadBtn) {
        if (importSessionId) {
            downloadBtn.style.display = 'inline-block';
        } else {
            downloadBtn.style.display = 'none';
        }
    }
}

/**
 * List session files
 */
async function listSessionFiles() {
    if (!importSessionId) {
        return [];
    }
    
    try {
        const response = await fetch(`/api/user-data-import/reports/${importSessionId}/files?user_id=1`);
        const data = await response.json();
        
        if (data.status === 'success') {
            return data.files;
        }
    } catch (error) {
        console.error('List session files error:', error);
    }
    
    return [];
}

/**
 * Download session file
 */
async function downloadSessionFile(filename) {
    if (!importSessionId) {
        showNotification('אין סשן זמין', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/reports/${importSessionId}/files/${filename}?user_id=1`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('קובץ הורד בהצלחה', 'success');
        } else {
            const error = await response.json();
            showNotification(`שגיאה בהורדת הקובץ: ${error.message}`, 'error');
        }
    } catch (error) {
        console.error('Download session file error:', error);
        showNotification('שגיאה בהורדת הקובץ', 'error');
    }
}