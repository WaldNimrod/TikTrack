/**
 * Import User Data JavaScript - Clean Version
 * 
 * This script handles the complete user data import process in modal format:
 * - 5-step wizard with progress indicators
 * - File upload with drag & drop validation
 * - Account selection with API integration
 * - File analysis with visual progress
 * - Problem resolution (missing tickers, duplicates)
 * - Preview generation with detailed tables
 * - Import execution with confirmation
 * 
 * Author: TikTrack Development Team
 * Version: 2.0 - Clean Modal Integration
 * Last Updated: 2025-01-16
 */

// Global state for import modal
let currentSessionId = null;
let currentStep = 1;
let selectedFile = null;
let selectedAccount = null;
let selectedConnector = null;
let analysisResults = null;
let previewData = null;

/**
 * Open import user data modal
 */
function openImportUserDataModal() {
    console.log('Opening import user data modal...');
    
    // Reset state
    resetImportModal();
    
    // Show modal
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }
    
    // Initialize step 1
    goToStep(1);
}

/**
 * Close import user data modal
 */
function closeImportUserDataModal() {
    console.log('Closing import user data modal...');
    
    // Hide modal
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    // Reset state
    resetImportModal();
}

/**
 * Reset import modal state
 */
function resetImportModal() {
    currentSessionId = null;
    currentStep = 1;
    selectedFile = null;
    selectedAccount = null;
    analysisResults = null;
    previewData = null;
    
    // Reset form elements
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const accountSelect = document.getElementById('importAccountSelect');
    if (accountSelect) {
        accountSelect.value = '';
    }
}

/**
 * Go to specific step
 */
function goToStep(step) {
    console.log(`Going to step ${step}`);
    currentStep = step;
    
    // Update step indicators
    updateStepIndicators();
    
    // Show step content
    showStepContent(step);
}

/**
 * Update step indicators
 */
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (stepNumber === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
    } else {
            indicator.classList.remove('active', 'completed');
        }
    });
}

/**
 * Show step content
 */
function showStepContent(step) {
    // Hide all step content
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show current step content
    let currentStepContent;
    if (step === 1) {
        currentStepContent = document.getElementById('step-upload');
    } else if (step === 2) {
        currentStepContent = document.getElementById('step-account');
    } else if (step === 3) {
        currentStepContent = document.getElementById('step-problems');
    } else if (step === 4) {
        currentStepContent = document.getElementById('step-preview');
    } else if (step === 5) {
        currentStepContent = document.getElementById('step-confirm');
    }
    
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
        // Show the step-content div inside
        const stepContent = currentStepContent.querySelector('.step-content');
        if (stepContent) {
            stepContent.style.display = 'block';
        }
    }
    
    // Load step-specific content
    switch(step) {
        case 1:
            loadStep1Content();
            break;
        case 2:
            loadStep2Content();
            break;
        case 3:
            loadStep3Content();
            break;
        case 4:
            loadStep4Content();
            break;
        case 5:
            loadStep5Content();
            break;
    }
}

/**
 * Load step 1 content (File & Account Selection)
 */
function loadStep1Content() {
    // The HTML content is already in the DOM, just need to load accounts
    setupStep1EventListeners();
    loadAccounts();
}

/**
 * Setup event listeners for step 1
 */
function setupStep1EventListeners() {
    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drop zone
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput?.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleFileDrop);
    }
    
    // Account select
    const accountSelect = document.getElementById('accountSelect');
    if (accountSelect) {
        accountSelect.addEventListener('change', handleAccountSelect);
    }
    
    // Continue button
    const continueBtn = document.querySelector('[data-button-type="PRIMARY"]');
    if (continueBtn) {
        continueBtn.addEventListener('click', analyzeFile);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

/**
 * Handle file drop event
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            handleFileSelect({ target: { files: [file] } });
        } else {
            showNotification('אנא בחר קובץ CSV בלבד', 'error');
        }
    }
}

/**
 * Load step 2 content (File Analysis)
 */
function loadStep2Content() {
    const content = document.getElementById('step2Content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="step-content-inner">
            <h4>ניתוח קובץ</h4>
            <div id="analysisResults" class="analysis-results">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i> מנתח קובץ...
                </div>
            </div>
        </div>
    `;
    
    // Start analysis
    analyzeFile();
}

/**
 * Load step 3 content (Problem Resolution)
 */
function loadStep3Content() {
    const content = document.getElementById('step3Content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="step-content-inner">
            <h4>פתרון בעיות</h4>
            <div id="problemResolution" class="problem-resolution">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i> טוען נתונים...
                </div>
            </div>
        </div>
    `;
    
    // Load problem resolution
    loadProblemResolution();
}

/**
 * Load step 4 content (Preview)
 */
function loadStep4Content() {
    const content = document.getElementById('step4Content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="step-content-inner">
            <h4>תצוגה מקדימה</h4>
            <div id="previewContainer" class="preview-container">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i> יוצר תצוגה מקדימה...
                </div>
            </div>
        </div>
    `;
    
    // Generate preview
    generatePreview();
}

/**
 * Load step 5 content (Final Approval)
 */
function loadStep5Content() {
    const content = document.getElementById('step5Content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="step-content-inner">
            <h4>אישור סופי</h4>
            <div class="final-summary">
                <h5>סיכום ייבוא</h5>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">רשומות לייבוא:</span>
                        <span class="stat-value" id="importCount">0</span>
                </div>
                    <div class="stat-item">
                        <span class="stat-label">רשומות לדילוג:</span>
                        <span class="stat-value" id="skipCount">0</span>
                        </div>
                    <div class="stat-item">
                        <span class="stat-label">אחוז ייבוא:</span>
                        <span class="stat-value" id="importRate">0%</span>
                        </div>
                        </div>
                        </div>
            
            <div class="step-actions">
                <button class="btn btn-secondary" onclick="goToStep(4)">
                    <i class="fas fa-arrow-right"></i> חזור לתצוגה מקדימה
                </button>
                <button class="btn btn-primary" onclick="showConfirmationModal()">
                    <i class="fas fa-check"></i> אישור ייבוא
                </button>
                </div>
            </div>
        `;
    
    // Update summary stats
    updateSummaryStats();
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('File selected:', file.name, file.size);
    selectedFile = file;
    
    // Update UI using existing HTML structure
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (fileInfo && fileName && fileSize) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        // Hide drop zone
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.style.display = 'none';
        }
        
        console.log('File info updated in UI');
    } else {
        console.error('File info elements not found:', { fileInfo, fileName, fileSize });
    }
    
    // Enable analyze button if account is also selected
    updateAnalyzeButton();
}

/**
 * Update analyze button state
 */
function updateAnalyzeButton() {
    const continueBtn = document.querySelector('[data-button-type="PRIMARY"]');
    if (continueBtn) {
        if (selectedFile && selectedAccount && selectedConnector) {
            continueBtn.disabled = false;
            console.log('Analyze button enabled');
        } else {
            continueBtn.disabled = true;
            console.log('Analyze button disabled - missing:', { 
                file: !!selectedFile, 
                account: !!selectedAccount,
                connector: !!selectedConnector
            });
        }
    }
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
 * Reset file selection
 */
function resetFile() {
    console.log('Resetting file selection');
    selectedFile = null;
    
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Hide file info and show drop zone
    const fileInfo = document.getElementById('fileInfo');
    const dropZone = document.getElementById('dropZone');
    
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    if (dropZone) {
        dropZone.style.display = 'block';
    }
    
    // Update analyze button
    updateAnalyzeButton();
}

/**
 * Handle account selection
 */
function handleAccountSelect(event) {
    const accountId = event.target.value;
    console.log('Account selected:', accountId);
    
    if (!accountId) {
        selectedAccount = null;
    } else {
        selectedAccount = accountId;
    }
    
    // Update analyze button
    updateAnalyzeButton();
    
    // Update UI
    const accountInfo = document.getElementById('accountInfo');
    if (accountInfo) {
        const selectedOption = event.target.options[event.target.selectedIndex];
        accountInfo.innerHTML = `
            <div class="account-selected">
                <i class="fas fa-user"></i>
                <span>${selectedOption.textContent}</span>
            </div>
        `;
    }
    
    // Enable analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn && selectedFile) {
        analyzeBtn.disabled = false;
    }
}

/**
 * Handle connector selection
 */
function handleConnectorSelect(event) {
    selectedConnector = event.target.value;
    console.log('Connector selected:', selectedConnector);
    updateAnalyzeButton();
}

/**
 * Load accounts from API
 */
function loadAccounts() {
    // Use the existing SelectPopulatorService
    if (window.SelectPopulatorService) {
        window.SelectPopulatorService.populateAccountsSelect('accountSelect', {
            includeEmpty: true,
            emptyText: 'בחר חשבון מסחר...',
            filterFn: (account) => account.status === 'open'
        });
    } else {
        // Fallback to direct API call
        fetch('/api/trading-accounts/')
            .then(response => response.json())
            .then(data => {
                const accounts = data.data || data || [];
                const openAccounts = accounts.filter(account => account.status === 'open');
                
                const accountSelect = document.getElementById('accountSelect');
                if (accountSelect) {
                    accountSelect.innerHTML = '<option value="">בחר חשבון מסחר...</option>';
                    openAccounts.forEach(account => {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = account.name;
                        accountSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading accounts:', error);
                showNotification('שגיאה בטעינת חשבונות', 'error');
            });
    }
}

/**
 * Analyze file
 */
function analyzeFile() {
    if (!selectedFile || !selectedAccount) {
        showNotification('נא לבחור קובץ וחשבון מסחר', 'error');
        return;
    }
    
    console.log('Analyzing file...');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('trading_account_id', selectedAccount);
    
    fetch('/api/user-data-import/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('File analysis completed:', data);
            currentSessionId = data.session_id;
            analysisResults = data.analysis_results;
            
            // Display results
            displayAnalysisResults(data.analysis_results);
            
            // Go to next step
            setTimeout(() => goToStep(3), 1000);
        } else {
            showNotification(`שגיאה בניתוח הקובץ: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Analysis error:', error);
        showNotification('שגיאה בניתוח הקובץ', 'error');
    });
}

/**
 * Display analysis results
 */
function displayAnalysisResults(results) {
    console.log('Displaying analysis results:', results);
    
    // Update the analysis cards
    const totalRecords = document.getElementById('totalRecords');
    const validRecords = document.getElementById('validRecords');
    const invalidRecords = document.getElementById('invalidRecords');
    const duplicateRecords = document.getElementById('duplicateRecords');
    const missingTickers = document.getElementById('missingTickers');
    
    if (totalRecords) totalRecords.textContent = results.total_records || 0;
    if (validRecords) validRecords.textContent = results.valid_records || 0;
    if (invalidRecords) invalidRecords.textContent = results.invalid_records || 0;
    if (duplicateRecords) duplicateRecords.textContent = results.duplicate_records || 0;
    if (missingTickers) missingTickers.textContent = results.missing_tickers ? results.missing_tickers.length : 0;
    
    console.log('Analysis results displayed successfully');
}

/**
 * Load problem resolution
 */
function loadProblemResolution() {
    if (!currentSessionId) {
        showNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            previewData = data.preview_data;
            displayProblemResolutionDetailed(data.preview_data);
        } else {
            showNotification(`שגיאה בטעינת נתוני בעיות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Problem resolution error:', error);
        showNotification('שגיאה בטעינת נתוני בעיות', 'error');
    });
}

/**
 * Display problem resolution
 */
function displayProblemResolution(data) {
    const container = document.getElementById('problemResolution');
    if (!container) return;
    
    container.innerHTML = `
        <div class="problem-resolution">
            <div class="problem-section">
                <h5>טיקרים חסרים</h5>
                <div id="missingTickers" class="problem-cards">
                    ${data.missing_tickers?.map(ticker => `
                        <div class="problem-card missing-ticker-card">
                            <div class="problem-card-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>${ticker}</span>
                            </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-primary" onclick="openAddTickerModal('${ticker}')">
                                    הוסף טיקר
                </button>
                            </div>
                                        </div>
                    `).join('') || '<p>אין טיקרים חסרים</p>'}
                                    </div>
                                                </div>
            
            <div class="problem-section">
                <h5>כפילויות בקובץ</h5>
                <div id="withinFileDuplicates" class="problem-cards">
                    ${data.within_file_duplicates?.map((dup, index) => `
                        <div class="problem-card within-file-duplicate">
                            <div class="problem-card-header">
                                <i class="fas fa-copy"></i>
                                <span>${dup.symbol} - ${dup.date}</span>
                                                </div>
                            <div class="problem-card-body">
                                <div class="problem-card-details">
                                    <span>כמות: ${dup.quantity}</span>
                                    <span>מחיר: ${dup.price}</span>
                                            </div>
                                <div class="problem-card-confidence">
                                    <span>רמת ביטחון: ${dup.confidence || 0}%</span>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${dup.confidence || 0}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-success" onclick="acceptDuplicate(${index}, 'within_file')">
                                    קבל
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectDuplicate(${index}, 'within_file')">
                                    דחה
                                </button>
                            </div>
                        </div>
                    `).join('') || '<p>אין כפילויות בקובץ</p>'}
                        </div>
                    </div>
            
            <div class="problem-section">
                <h5>כפילויות מול בסיס הנתונים</h5>
                <div id="existingRecords" class="problem-cards">
                    ${data.existing_records?.map((record, index) => `
                        <div class="problem-card existing-record-card">
                            <div class="problem-card-header">
                                <i class="fas fa-database"></i>
                                <span>${record.symbol} - ${record.date}</span>
                            </div>
                            <div class="problem-card-body">
                                <div class="problem-card-details">
                                    <span>כמות: ${record.quantity}</span>
                                    <span>מחיר: ${record.price}</span>
                                        </div>
                                <div class="problem-card-confidence">
                                    <span>רמת ביטחון: ${record.confidence || 0}%</span>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${record.confidence || 0}%"></div>
                                    </div>
                                                </div>
                                                </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-success" onclick="acceptDuplicate(${index}, 'existing_record')">
                                    קבל
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectDuplicate(${index}, 'existing_record')">
                                    דחה
                                </button>
                            </div>
                        </div>
                    `).join('') || '<p>אין כפילויות מול בסיס הנתונים</p>'}
                        </div>
                    </div>
            
            <div class="step-actions">
                <button class="btn btn-primary" onclick="goToStep(4)">
                    <i class="fas fa-arrow-right"></i> המשך לתצוגה מקדימה
                        </button>
                    </div>
                </div>
            `;
}

/**
 * Accept duplicate
 */
function acceptDuplicate(index, type) {
    if (!currentSessionId) return;
    
    fetch(`/api/user-data-import/session/${currentSessionId}/accept-duplicate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            record_index: index,
            duplicate_type: type
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('כפילות אושרה', 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showNotification(`שגיאה באישור כפילות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Accept duplicate error:', error);
        showNotification('שגיאה באישור כפילות', 'error');
    });
}

/**
 * Reject duplicate
 */
function rejectDuplicate(index, type) {
    if (!currentSessionId) return;
    
    fetch(`/api/user-data-import/session/${currentSessionId}/reject-duplicate`, {
            method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            record_index: index,
            duplicate_type: type
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('כפילות נדחתה', 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showNotification(`שגיאה בדחיית כפילות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Reject duplicate error:', error);
        showNotification('שגיאה בדחיית כפילות', 'error');
    });
}

/**
 * Open add ticker modal
 */
function openAddTickerModal(symbol) {
    const modal = document.getElementById('addTickerModal');
    const symbolInput = document.getElementById('tickerSymbol');
    const nameInput = document.getElementById('tickerName');
    
    if (modal && symbolInput && nameInput) {
        symbolInput.value = symbol;
        nameInput.value = symbol; // Default name to symbol
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    } else {
        // Fallback to prompt
        const tickerName = prompt(`הזן שם לטיקר ${symbol}:`, symbol);
        if (tickerName) {
            saveTickerFromModal(symbol, tickerName);
        }
    }
}

/**
 * Save ticker from modal
 */
function saveTickerFromModal(symbol, name) {
    if (!symbol) {
        symbol = document.getElementById('tickerSymbol')?.value;
    }
    if (!name) {
        name = document.getElementById('tickerName')?.value;
    }
    
    if (!symbol || !name) {
        showNotification('נא למלא את כל השדות', 'error');
        return;
    }
    
    // Close modal
    const modal = document.getElementById('addTickerModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    // Make API call to add ticker
    fetch('/api/tickers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            symbol: symbol,
            name: name,
            type: document.getElementById('tickerType')?.value || 'stock',
            currency: document.getElementById('tickerCurrency')?.value || 'USD'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`טיקר ${symbol} נוסף בהצלחה`, 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showNotification(`שגיאה בהוספת טיקר: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Add ticker error:', error);
        showNotification('שגיאה בהוספת טיקר', 'error');
    });
}

/**
 * Generate preview
 */
function generatePreview() {
    if (!currentSessionId) {
        showNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            previewData = data.preview_data;
            displayPreview(data.preview_data);
            
            // Go to next step
            setTimeout(() => goToStep(5), 1000);
        } else {
            showNotification(`שגיאה ביצירת תצוגה מקדימה: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Preview error:', error);
        showNotification('שגיאה ביצירת תצוגה מקדימה', 'error');
    });
}

/**
 * Display preview
 */
function displayPreview(data) {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="preview-data">
            <h5>תצוגה מקדימה</h5>
            <div class="preview-summary">
                <div class="summary-item">
                    <span class="summary-label">רשומות לייבוא:</span>
                    <span class="summary-count">${data.summary?.records_to_import || 0}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">רשומות לדילוג:</span>
                    <span class="summary-count">${data.summary?.records_to_skip || 0}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">אחוז ייבוא:</span>
                    <span class="summary-count">${data.summary?.import_rate || 0}%</span>
                </div>
            </div>
            
            <div class="preview-tables">
                <div class="table-container">
                    <h6>רשומות לייבוא</h6>
                    <div class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th>סמל</th>
                                    <th>תאריך</th>
                                    <th>כמות</th>
                                    <th>מחיר</th>
                                    <th>עמלה</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.records_to_import?.map(record => `
                                    <tr>
                <td>${record.symbol}</td>
                                        <td>${record.date}</td>
                <td>${record.quantity}</td>
                                        <td>${record.price}</td>
                                        <td>${record.fee}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5">אין רשומות לייבוא</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="table-container">
                    <h6>רשומות לדילוג</h6>
                    <div class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th>סמל</th>
                                    <th>תאריך</th>
                                    <th>כמות</th>
                                    <th>מחיר</th>
                                    <th>סיבה</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.records_to_skip?.map(record => `
                                    <tr>
                <td>${record.symbol}</td>
                                        <td>${record.date}</td>
                <td>${record.quantity}</td>
                                        <td>${record.price}</td>
                                        <td>${record.reason}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5">אין רשומות לדילוג</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update summary stats
 */
function updateSummaryStats() {
    if (!previewData) return;
    
    const importCount = document.getElementById('importCount');
    const skipCount = document.getElementById('skipCount');
    const importRate = document.getElementById('importRate');
    
    if (importCount) importCount.textContent = previewData.summary?.records_to_import || 0;
    if (skipCount) skipCount.textContent = previewData.summary?.records_to_skip || 0;
    if (importRate) importRate.textContent = `${previewData.summary?.import_rate || 0}%`;
}

/**
 * Show confirmation modal
 */
function showConfirmationModal() {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal-overlay';
    modal.innerHTML = `
                <div class="confirmation-modal">
            <h3>אישור ייבוא נתונים</h3>
            <p>האם אתה בטוח שברצונך לייבא את הנתונים?</p>
                    <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeConfirmationModal()">ביטול</button>
                <button class="btn btn-primary" onclick="executeImport()">ביצוע ייבוא</button>
                <button class="btn btn-danger" onclick="executeImportWithReport()">ייבוא + דוח</button>
                </div>
            </div>
        `;
        
    document.body.appendChild(modal);
}

/**
 * Close confirmation modal
 */
function closeConfirmationModal() {
    const modal = document.querySelector('.confirmation-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/**
 * Execute import
 */
function executeImport() {
    closeConfirmationModal();
    performImport(false);
}

/**
 * Execute import with report
 */
function executeImportWithReport() {
    closeConfirmationModal();
    performImport(true);
}

/**
 * Perform import
 */
function performImport(generateReport = false) {
    if (!currentSessionId) {
        showNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    showNotification('מתחיל ייבוא נתונים...', 'info');
    
    fetch(`/api/user-data-import/execute/${currentSessionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            generate_report: generateReport
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('ייבוא הנתונים הושלם בהצלחה!', 'success');
            closeImportUserDataModal();
            
            if (generateReport && data.report_url) {
                showNotification('דוח ייבוא זמין להורדה', 'info');
            }
            
            // Refresh executions table if exists
            if (typeof refreshExecutionsTable === 'function') {
                refreshExecutionsTable();
            }
    } else {
            showNotification(`שגיאה בייבוא: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Import error:', error);
        showNotification('שגיאה בייבוא הנתונים', 'error');
    });
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
 * Show notification
 */
function showNotification(message, type = 'info') {
    if (window.NotificationSystem) {
        window.NotificationSystem.show(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Display problem resolution with detailed cards
 */
function displayProblemResolutionDetailed(data) {
    console.log('Displaying detailed problem resolution:', data);
    
    // Clear existing content
    clearProblemSections();
    
    // Display missing tickers
    if (data.summary?.missing_tickers && data.summary.missing_tickers.length > 0) {
        displayMissingTickers(data.summary.missing_tickers);
    }
    
    // Display within-file duplicates
    if (data.records_to_skip) {
        const withinFileDuplicates = data.records_to_skip.filter(record => 
            record.reason === 'within_file_duplicate' || record.reason === 'within_file_duplicate_match'
        );
        if (withinFileDuplicates.length > 0) {
            displayWithinFileDuplicates(withinFileDuplicates);
        }
    }
    
    // Display existing records
    if (data.records_to_skip) {
        const existingRecords = data.records_to_skip.filter(record => 
            record.reason === 'existing_record'
        );
        if (existingRecords.length > 0) {
            displayExistingRecords(existingRecords);
        }
    }
}

/**
 * Clear all problem sections
 */
function clearProblemSections() {
    const sections = [
        'missingTickersSection',
        'withinFileDuplicatesSection', 
        'existingRecordsSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

/**
 * Display missing tickers
 */
function displayMissingTickers(missingTickers) {
    const section = document.getElementById('missingTickersSection');
    const container = document.getElementById('missingTickersContainer');
    
    if (!section || !container) return;
    
    section.style.display = 'block';
    
    container.innerHTML = missingTickers.map(ticker => 
        renderMissingTickerCard(ticker)
    ).join('');
}

/**
 * Display within-file duplicates
 */
function displayWithinFileDuplicates(duplicates) {
    const section = document.getElementById('withinFileDuplicatesSection');
    const container = document.getElementById('withinFileDuplicatesContainer');
    
    if (!section || !container) return;
    
    section.style.display = 'block';
    
    container.innerHTML = duplicates.map((duplicate, index) => 
        renderDuplicateCard(duplicate, 'within_file', index)
    ).join('');
}

/**
 * Display existing records
 */
function displayExistingRecords(existingRecords) {
    const section = document.getElementById('existingRecordsSection');
    const container = document.getElementById('existingRecordsContainer');
    
    if (!section || !container) return;
    
    section.style.display = 'block';
    
    container.innerHTML = existingRecords.map((record, index) => 
        renderDuplicateCard(record, 'existing_record', index)
    ).join('');
}

/**
 * Render missing ticker card
 */
function renderMissingTickerCard(ticker) {
    return `
        <div class="problem-card missing-ticker-card">
            <div class="problem-card-header">
                <i class="bi bi-exclamation-circle"></i>
                <span>${ticker}</span>
            </div>
            <div class="problem-card-body">
                <div class="missing-ticker-info">
                    <i class="bi bi-info-circle"></i>
                    הטיקר ${ticker} לא קיים במערכת
                </div>
            </div>
            <div class="problem-card-actions">
                <button class="btn btn-sm btn-primary" onclick="openAddTickerModal('${ticker}')">
                    <i class="bi bi-plus-circle"></i>
                    הוסף טיקר
                </button>
            </div>
        </div>
    `;
}

/**
 * Render duplicate/existing record card
 */
function renderDuplicateCard(duplicate, type, index) {
    const confidence = duplicate.confidence_score || 0;
    const confidenceClass = getConfidenceClass(confidence);
    
    return `
        <div class="problem-card ${type === 'within_file' ? 'within-file-duplicate' : 'existing-record-card'}">
            <div class="problem-card-header">
                <i class="bi ${type === 'within_file' ? 'bi-files' : 'bi-exclamation-triangle'}"></i>
                <span>${duplicate.symbol || 'לא ידוע'}</span>
            </div>
            <div class="problem-card-body">
                <div class="problem-card-details">
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">פעולה:</span>
                        <span class="problem-card-detail-value">${duplicate.action || 'לא ידוע'}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">כמות:</span>
                        <span class="problem-card-detail-value">${duplicate.quantity || 'לא ידוע'}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">מחיר:</span>
                        <span class="problem-card-detail-value">${duplicate.price || 'לא ידוע'}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">תאריך:</span>
                        <span class="problem-card-detail-value">${duplicate.date || 'לא ידוע'}</span>
                    </div>
                </div>
                <div class="problem-card-confidence ${confidenceClass}">
                    <span class="confidence-text">רמת ביטחון: ${confidence}%</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                </div>
            </div>
            <div class="problem-card-actions">
                <button class="btn btn-sm btn-success" onclick="acceptDuplicate(${index}, '${type}')">
                    <i class="bi bi-check-circle"></i>
                    קבל
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectDuplicate(${index}, '${type}')">
                    <i class="bi bi-x-circle"></i>
                    דחה
                </button>
            </div>
        </div>
    `;
}

/**
 * Get confidence class based on score
 */
function getConfidenceClass(confidence) {
    if (confidence >= 80) return 'confidence-high';
    if (confidence >= 50) return 'confidence-medium';
    return 'confidence-low';
}

/**
 * Refresh preview data after user actions
 */
function refreshPreviewData() {
    if (!currentSessionId) return;
    
    fetch(`/api/user-data-import/session/${currentSessionId}/refresh-preview`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            previewData = data.preview_data;
            // Refresh the current step display
            if (currentStep === 3) {
                displayProblemResolutionDetailed(data.preview_data);
            } else if (currentStep === 4) {
                displayPreview(data.preview_data);
            }
        } else {
            showNotification(`שגיאה ברענון התצוגה: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Refresh preview error:', error);
        showNotification('שגיאה ברענון התצוגה', 'error');
    });
}

// Export functions for global access
window.openImportUserDataModal = openImportUserDataModal;
window.closeImportUserDataModal = closeImportUserDataModal;
window.goToStep = goToStep;
window.uploadFile = handleFileSelect;
window.selectAccount = handleAccountSelect;
window.analyzeFile = analyzeFile;
window.acceptDuplicate = acceptDuplicate;
window.rejectDuplicate = rejectDuplicate;
window.openAddTickerModal = openAddTickerModal;
window.saveTickerFromModal = saveTickerFromModal;
window.showConfirmationModal = showConfirmationModal;
window.closeConfirmationModal = closeConfirmationModal;
window.executeImport = executeImport;
window.executeImportWithReport = executeImportWithReport;
window.performImport = performImport;
window.showNotification = showNotification;
window.resetFile = resetFile;
