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
let importReportPath = null;

/**
 * Load data from cache
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
 * Clear cache data
 */
async function clearCache() {
    if (window.UnifiedCacheManager) {
        try {
            await window.UnifiedCacheManager.delete('import_session_id');
            await window.UnifiedCacheManager.delete('import_analysis_results');
            await window.UnifiedCacheManager.delete('import_preview_data');
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }
}

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
    
    // Load from cache if available
    loadFromCache();
    
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
 * Setup import event listeners
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
 * Remove import event listeners
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
 * Handle file selection
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
 * Process selected file
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
    console.log('🔍 Account selected:', event.target.value);
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
 * Process current step
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
 * Display analysis results
 */
function displayImportAnalysisResults(results) {
    document.getElementById('import-valid-count').textContent = results.valid_records || 0;
    document.getElementById('import-missing-tickers-count').textContent = 0; // TODO: Add missing tickers logic
    document.getElementById('import-duplicates-count').textContent = results.duplicate_records || 0;
    document.getElementById('import-errors-count').textContent = results.invalid_records || 0;
    
    // Display detailed error information
    displayDetailedErrors(results);
    
    document.getElementById('import-analysis-results').style.display = 'block';
    
    // Enable next button if there are valid records
    if (results.valid_records > 0) {
        document.getElementById('import-next-btn').disabled = false;
        document.getElementById('import-next-btn').style.display = 'inline-block';
    } else {
        document.getElementById('import-next-btn').disabled = true;
        document.getElementById('import-next-btn').style.display = 'none';
    }
}

/**
 * Add missing tickers functionality
 */
function addMissingTickers() {
    // TODO: Implement missing tickers addition
    console.log('Adding missing tickers...');
    // For now, just show a message
    alert('פונקציונליות הוספת טיקרים תהיה זמינה בקרוב');
}


/**
 * Load analysis results from server for step 4
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
                record.reason === 'within_file_duplicate' || record.reason === 'system_duplicate'
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
                    system_duplicates: duplicateRecords.filter(record => 
                        record.reason === 'system_duplicate'
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
 */
async function loadImportPreviewData() {
    if (!importSessionId) {
        console.error('No session ID available');
        return;
    }
    
    try {
        const response = await fetch(`/api/user-data-import/session/${importSessionId}/preview`);
        const data = await response.json();
        
        if (data.status === 'success') {
            importPreviewData = data.preview_data;
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
 */
function displayImportProblems(results) {
    console.log('🔍 Displaying problems with results:', results);
    
    // Show missing tickers section if there are missing tickers
    const missingTickersSection = document.getElementById('import-missing-tickers-section');
    const missingTickersList = document.getElementById('import-missing-tickers-list');
    
    // For now, show a placeholder since missing tickers logic is not implemented yet
    if (false) { // TODO: Implement missing tickers detection
        missingTickersSection.style.display = 'block';
        missingTickersList.innerHTML = results.missing_tickers.map(ticker => 
            `<div class="missing-ticker-item">${ticker}</div>`
        ).join('');
    } else {
        missingTickersSection.style.display = 'none';
    }
    
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