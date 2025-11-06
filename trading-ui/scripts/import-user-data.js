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
 * Initialize import user data modal - called by unified system
 */
window.initializeImportUserDataModal = function() {
    window.Logger.info('[Import Modal] Initializing import modal', { page: 'import-user-data' });
    
    // Don't setup event listeners here - they will be set up when modal opens
    // setupImportModalEventListeners();
    
    // Load accounts
    loadAccounts();
};

/**
 * Open import user data modal
 */
async function openImportUserDataModal() {
    window.Logger.info('[Import Modal] Opening import modal', { page: 'import-user-data' });
    
    // Reset state
    resetImportModal();
    
    // Show modal
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        
        // Process buttons using centralized button system
        if (window.processButtons) {
            window.processButtons(modal);
            window.Logger.debug('[Import Modal] Buttons processed by centralized button system', { page: 'import-user-data' });
        } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
            window.advancedButtonSystem.processButtons(modal);
            window.Logger.debug('[Import Modal] Buttons processed by centralized button system', { page: 'import-user-data' });
        } else if (window.initializeButtons) {
            window.initializeButtons();
            window.Logger.debug('[Import Modal] Buttons initialized via initializeButtons()', { page: 'import-user-data' });
        }
        
        // Setup event listeners now that modal is visible
        setupImportModalEventListeners();
        
        // Load accounts
        await loadAccounts();
    }
    
    // Initialize step 1
    goToStep(1);
}

/**
 * Close import user data modal
 */
function closeImportUserDataModal() {
    window.Logger.info('[Import Modal] Closing import modal', { page: 'import-user-data' });
    
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
    window.selectedFile = null; // Make it global
    selectedAccount = null;
    selectedConnector = null;
    analysisResults = null;
    previewData = null;
    
    // Reset form elements
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const accountSelect = document.getElementById('tradingAccountSelect');
    if (accountSelect) {
        accountSelect.value = '';
    }
    
    const connectorSelect = document.getElementById('connectorSelect');
    if (connectorSelect) {
        connectorSelect.value = '';
    }
    
    // Reset UI elements
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.style.display = 'block';
    }
    
    // Reset event listener flags
    const elementsWithListeners = document.querySelectorAll('[data-listeners-setup]');
    elementsWithListeners.forEach(element => {
        element.removeAttribute('data-listeners-setup');
    });
    
    // Reset analyze button
    updateAnalyzeButton();
}

/**
 * Go to specific step
 */
function goToStep(step) {
    window.Logger.info('[Import Modal] Navigating to step', { 
        from: currentStep, 
        to: step, 
        page: 'import-user-data' 
    });
    
    currentStep = step;
    
    // Update step indicators
    updateStepIndicators();
    
    // Show step content
    showStepContent(step);
    
    // Load step-specific content
    if (step === 1) {
        window.Logger.debug('[Import Modal] Loading step 1 content', { page: 'import-user-data' });
        loadStep1Content();
    } else if (step === 2) {
        window.Logger.debug('[Import Modal] Loading step 2 content (Analysis + Problems)', { page: 'import-user-data' });
        loadStep2Content();
        // loadProblemResolution will be called after analysis is complete
                    } else if (step === 3) {
                        window.Logger.debug('[Import Modal] Loading step 3 content (Preview + Confirmation)', { page: 'import-user-data' });
                        loadPreviewData();
                    }
    
    // Process buttons in the modal after step change
    // This ensures all buttons are properly handled by the centralized button system
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        // Get the current visible step container
        const currentStepElement = modal.querySelector(`.import-step[data-step="${step}"]`);
        if (currentStepElement) {
            if (window.processButtons) {
                window.processButtons(currentStepElement);
            } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
                window.advancedButtonSystem.processButtons(currentStepElement);
            }
            window.Logger.debug('[Import Modal] Buttons processed for step', { 
                step, 
                page: 'import-user-data' 
            });
        } else {
            // Fallback: process entire modal
            if (window.processButtons) {
                window.processButtons(modal);
            } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
                window.advancedButtonSystem.processButtons(modal);
            }
            window.Logger.debug('[Import Modal] Buttons processed for entire modal', { 
                step, 
                page: 'import-user-data' 
            });
        }
    }
    
    window.Logger.info('[Import Modal] Step navigation completed', { 
        currentStep, 
        page: 'import-user-data' 
    });
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
    window.Logger.debug('[Import Modal] Showing step content', { step, page: 'import-user-data' });
    
    // Hide all import steps (containers)
    const importSteps = document.querySelectorAll('.import-step');
    window.Logger.debug('[Import Modal] Found import steps', { 
        count: importSteps.length, 
        page: 'import-user-data' 
    });
    importSteps.forEach(stepElement => {
        stepElement.style.display = 'none';
    });
    
    // Show current step content
    let currentStepContent;
    if (step === 1) {
        currentStepContent = document.getElementById('step-upload');
    } else if (step === 2) {
        currentStepContent = document.getElementById('step-analysis');
        // Also show the problem resolution section
        const problemSection = document.getElementById('problemResolutionSection');
        if (problemSection) {
            problemSection.style.display = 'block';
        }
                    } else if (step === 3) {
                        currentStepContent = document.getElementById('step-preview');
                    }
    
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
        window.Logger.info('[Import Modal] Step content shown', { 
            step, 
            elementId: currentStepContent.id,
            page: 'import-user-data' 
        });
    } else {
        window.Logger.error('[Import Modal] Step content element not found', { 
            step, 
            page: 'import-user-data' 
        });
    }
}

/**
 * Load step 1 content (File & Account Selection)
 */
function loadStep1Content() {
    // The HTML content is already in the DOM, just need to load accounts
    // Event listeners are already set up during initialization
    loadAccounts();
}

/**
 * Setup event listeners for import modal - called once during initialization
 */
function setupImportModalEventListeners() {
    window.Logger.debug('[Import Modal] Setting up import modal event listeners', { page: 'import-user-data' });
    
    window.Logger.info('[Import Modal] Setting up event listeners', { page: 'import-user-data' });
    
    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
        window.Logger.debug('[Import Modal] File input event listener added', { page: 'import-user-data' });
    }
    
    // Drop zone
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput?.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleFileDrop);
        window.Logger.debug('[Import Modal] Drop zone event listeners added', { page: 'import-user-data' });
    }
    
    // Account select - look INSIDE the modal
    const modal = document.getElementById('importUserDataModal');
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    window.Logger.debug('[Import Modal] Account select element found', { 
        exists: !!accountSelect, 
        id: accountSelect?.id,
        page: 'import-user-data' 
    });
    if (accountSelect) {
        accountSelect.addEventListener('change', handleAccountSelect);
        window.Logger.info('[Import Modal] Account select event listener added successfully', { page: 'import-user-data' });
    } else {
        window.Logger.error('[Import Modal] Account select element not found in modal!', { page: 'import-user-data' });
    }
    
    // Connector select - look INSIDE the modal
    const connectorSelect = modal?.querySelector('#connectorSelect');
    if (connectorSelect) {
        connectorSelect.addEventListener('change', handleConnectorSelect);
        window.Logger.debug('[Import Modal] Connector select event listener added', { page: 'import-user-data' });
    }
    
    // Continue button - NO manual event listener needed!
    // The centralized button system handles data-onclick automatically via event delegation
    // Just ensure the button has data-onclick="analyzeFile()" in HTML
    const continueBtn = modal?.querySelector('[data-button-type="PRIMARY"]');
    if (continueBtn) {
        window.Logger.debug('[Import Modal] Continue button found - will be handled by centralized button system', { 
            hasDataOnclick: continueBtn.hasAttribute('data-onclick'),
            page: 'import-user-data' 
        });
    }
    
    // Mark as set up
    if (modal) {
        modal.setAttribute('data-listeners-setup', 'true');
    }
    
    window.Logger.info('[Import Modal] All event listeners set up successfully', { page: 'import-user-data' });
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
    // The HTML content is already in the DOM, just need to display analysis results
    if (analysisResults) {
        displayAnalysisResults(analysisResults);
    }
}

/**
 * Load confirmation data (Step 5)
 */
function loadConfirmationData() {
    // The HTML content is already in the DOM, just need to display confirmation data
    if (analysisResults && previewData) {
        displayConfirmationData(analysisResults, previewData);
    }
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
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayProblemResolutionDetailed(data.preview_data);
        } else {
            showNotification(`שגיאה בטעינת נתוני בעיות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Problem resolution error:', error);
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
        <div class="problem-summary">
            <h4>סיכום בעיות</h4>
            <div class="problem-stats">
                <div class="stat-item">
                    <span class="stat-label">רשומות עם בעיות:</span>
                    <span class="stat-value">${data.problematic_records || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">רשומות נקיות:</span>
                    <span class="stat-value">${data.clean_records || 0}</span>
                </div>
            </div>
        </div>
    `;
}


/**
 * Clear problem sections
 */
function clearProblemSections() {
    const missingTickersSection = document.getElementById('missingTickersSection');
    const withinFileDuplicatesSection = document.getElementById('withinFileDuplicatesSection');
    const existingRecordsSection = document.getElementById('existingRecordsSection');
    
    if (missingTickersSection) missingTickersSection.style.display = 'none';
    if (withinFileDuplicatesSection) withinFileDuplicatesSection.style.display = 'none';
    if (existingRecordsSection) existingRecordsSection.style.display = 'none';
}

/**
 * Display existing records
 */
function displayExistingRecords(existingRecords) {
    const section = document.getElementById('existingRecordsSection');
    const container = document.getElementById('existingRecordsContainer');
    
    if (!section || !container) {
        window.Logger.warn('[Import Modal] Existing records section not found', { page: 'import-user-data' });
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    existingRecords.forEach((recordData, index) => {
        const card = document.createElement('div');
        card.className = 'problem-card existing-record-card';
        
        // Get the actual record data
        const record = recordData.record || recordData;
        const matches = recordData.matches || [];
        
        // Calculate confidence score from matches
        let confidenceScore = 0;
        if (matches.length > 0) {
            confidenceScore = matches[0].confidence || 0;
        }
        
        const confidenceColor = confidenceScore >= 80 ? '#28a745' : confidenceScore >= 50 ? '#ffc107' : '#dc3545';
        
        card.innerHTML = `
            <div class="problem-card-header">
                <div class="problem-card-title">
                    <i class="bi bi-database"></i>
                    רשומה קיימת במערכת #${index + 1}
                </div>
                <div class="confidence-score" style="color: ${confidenceColor}">
                    ${confidenceScore.toFixed(1)}% התאמה
                </div>
            </div>
            <div class="problem-card-content">
                <div class="record-details">
                    <div class="detail-row">
                        <span class="detail-label">סמל:</span>
                        <span class="detail-value">${record.symbol || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">פעולה:</span>
                        <span class="detail-value">${record.action || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">כמות:</span>
                        <span class="detail-value">${record.quantity || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">מחיר:</span>
                        <span class="detail-value">$${record.price || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">תאריך:</span>
                        <span class="detail-value">${record.date || 'לא זמין'}</span>
                    </div>
                </div>
                <div class="problem-card-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="importExistingRecord(${index})">
                        <i class="bi bi-arrow-down-circle"></i> ייבוא בכל זאת
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="skipExistingRecord(${index})">
                        <i class="bi bi-x-circle"></i> דלג
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    window.Logger.info('[Import Modal] Displayed existing records', { 
        count: existingRecords.length, 
        page: 'import-user-data' 
    });
}

/**
 * Import existing record (force import)
 */
function importExistingRecord(index) {
    window.Logger.info('[Import Modal] Importing existing record', { index, page: 'import-user-data' });
    
    // TODO: Implement logic to force import this specific record
    showNotification('ייבוא רשומה קיימת - פונקציונליות תפותח בקרוב', 'info');
}

/**
 * Skip existing record
 */
function skipExistingRecord(index) {
    window.Logger.info('[Import Modal] Skipping existing record', { index, page: 'import-user-data' });
    
    // TODO: Implement logic to skip this specific record
    showNotification('דילוג על רשומה קיימת - פונקציונליות תפותח בקרוב', 'info');
}

/**
 * Display missing tickers
 */

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
    
    window.Logger.info('[Import Modal] File selected', { fileName: file.name, fileSize: file.size, page: 'import-user-data' });
    selectedFile = file;
    window.selectedFile = file; // Make it global
    
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
        
        window.Logger.debug('[Import Modal] File info updated in UI', { page: 'import-user-data' });
        } else {
        window.Logger.error('File info elements not found:', { fileInfo, fileName, fileSize });
    }
    
    // Enable analyze button if account is also selected
    updateAnalyzeButton();
}

/**
 * Update analyze button state
 */
function updateAnalyzeButton() {
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.warn('[Import Modal] Modal not found for button update', { page: 'import-user-data' });
            return;
        }
    
    const continueBtn = modal.querySelector('[data-button-type="PRIMARY"]');
    if (continueBtn) {
        // Check actual DOM values - more reliable than variables
        // Look for selects INSIDE the modal to avoid conflicts
        const connectorSelect = modal.querySelector('#connectorSelect');
        const accountSelect = modal.querySelector('#tradingAccountSelect');
        
        // Get all possible values for debugging
        const connectorValue = connectorSelect?.value;
        const accountValue = accountSelect?.value;
        const accountSelectedIndex = accountSelect?.selectedIndex;
        const accountSelectedOption = accountSelect?.options[accountSelectedIndex];
        
        // Check both local and global selectedFile variables
        const currentSelectedFile = selectedFile || window.selectedFile;
        
        // Detailed debugging information
        const debugInfo = {
            selectedFile: !!currentSelectedFile,
            selectedFileName: currentSelectedFile?.name,
            connectorSelectExists: !!connectorSelect,
            connectorValue: connectorValue,
            accountSelectExists: !!accountSelect,
            accountValue: accountValue,
            accountSelectedIndex: accountSelectedIndex,
            accountSelectedOptionText: accountSelectedOption?.text,
            accountSelectedOptionValue: accountSelectedOption?.value,
            allOptions: accountSelect ? Array.from(accountSelect.options).map((opt, idx) => ({
                index: idx,
                value: opt.value,
                text: opt.text,
                selected: opt.selected
            })) : []
        };
        
        // Check if accountValue is not empty and not the default "בחר חשבון מסחר..."
        // Also check if it's a valid number (account IDs are numbers)
        const accountValid = accountValue && 
                           accountValue !== '' && 
                           accountValue !== '0' && 
                           !isNaN(parseInt(accountValue));
        
        const allFieldsFilled = currentSelectedFile && connectorValue && accountValid;
        
        window.Logger.debug('[Import Modal] Button state check - DETAILED', { 
            ...debugInfo,
            accountValid: accountValid,
            allFieldsFilled,
            page: 'import-user-data'
        });
        
        if (allFieldsFilled) {
            continueBtn.disabled = false;
            window.Logger.info('[Import Modal] Analyze button enabled', { 
                accountValue: accountValue,
                connectorValue: connectorValue,
                page: 'import-user-data' 
            });
        } else {
            continueBtn.disabled = true;
            window.Logger.warn('[Import Modal] Analyze button disabled - missing requirements', { 
                ...debugInfo,
                accountValid: accountValid,
                page: 'import-user-data'
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
    window.Logger.debug('[Import Modal] Resetting file selection', { page: 'import-user-data' });
    selectedFile = null;
    window.selectedFile = null; // Make it global
    
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
    // Handle both event-based calls and direct calls
    // Look for select INSIDE the modal to avoid conflicts
    const modal = document.getElementById('importUserDataModal');
    const target = event?.target || modal?.querySelector('#tradingAccountSelect');
    const value = target?.value;
    
    window.Logger.info('[Import Modal] handleAccountSelect called', { 
        event: event?.type || 'direct_call', 
        target: target?.id,
        value: value,
        selectedIndex: target?.selectedIndex,
        page: 'import-user-data' 
    });
    
    const accountId = value;
    window.Logger.info('[Import Modal] Account selected', { accountId, page: 'import-user-data' });
    
    if (!accountId) {
        selectedAccount = null;
                } else {
        selectedAccount = accountId;
    }
    
    // Update UI first
    const accountInfo = document.getElementById('accountInfo');
    if (accountInfo && target) {
        const selectedOption = target.options[target.selectedIndex];
        accountInfo.innerHTML = `
            <div class="account-selected">
                <i class="fas fa-user"></i>
                <span>${selectedOption.textContent}</span>
            </div>
        `;
    }
    
    // Wait a tick to ensure DOM is updated, then update button
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
        updateAnalyzeButton();
    });
    
    // Remove duplicate button update code below
}

/**
 * Handle connector selection
 */
function handleConnectorSelect(event) {
    const modal = document.getElementById('importUserDataModal');
    const target = event?.target || modal?.querySelector('#connectorSelect');
    selectedConnector = target?.value;
    window.Logger.info('[Import Modal] Connector selected', { 
        connector: selectedConnector,
        value: target?.value,
        page: 'import-user-data' 
    });
    
    // Validate connector selection using central validation system
    validateConnectorSelection();
    
    // Wait a tick to ensure DOM is updated, then update button
    requestAnimationFrame(() => {
        updateAnalyzeButton();
    });
}

/**
 * Validate connector selection using central validation system
 */
function validateConnectorSelection() {
    const connectorSelect = document.getElementById('connectorSelect');
    if (!connectorSelect) return;
    
    // Use central validation system
    const validationResult = window.validateSelectField(connectorSelect, {
        required: true,
        customValidation: (value) => {
            if (!value || value === '') {
                return 'חובה לבחור ספק נתונים';
            }
            return true;
        }
    });
    
    if (validationResult === true) {
        window.Logger.debug('[Import Modal] Connector validation passed', { connector: selectedConnector, page: 'import-user-data' });
        } else {
        window.Logger.warn('[Import Modal] Connector validation failed', { error: validationResult, page: 'import-user-data' });
    }
}

/**
 * Validate all required fields before proceeding
 */
function validateAllRequiredFields() {
    let isValid = true;
    
    // Validate connector selection using central validation system
    const connectorSelect = document.getElementById('connectorSelect');
    if (connectorSelect) {
        const connectorValidation = window.validateSelectField(connectorSelect, {
            required: true,
            customValidation: (value) => {
                if (!value || value === '') {
                    return 'חובה לבחור ספק נתונים';
                }
                return true;
            }
        });
        
        if (connectorValidation !== true) {
            isValid = false;
            window.Logger.warn('[Import Modal] Connector validation failed', { error: connectorValidation, page: 'import-user-data' });
            showNotification('שגיאה', connectorValidation, 'error');
        }
    }
    
    // Validate file selection
    if (!selectedFile) {
        isValid = false;
        window.Logger.warn('[Import Modal] No file selected', { page: 'import-user-data' });
        showNotification('שגיאה', 'חובה לבחור קובץ', 'error');
    }
    
    // Validate account selection using central validation system
    const accountSelect = document.getElementById('tradingAccountSelect');
    
    // Debug: Check if element exists and its properties
    window.Logger.debug('[Import Modal] Account select element debug', {
        exists: !!accountSelect,
        id: accountSelect?.id,
        className: accountSelect?.className,
        value: accountSelect?.value,
        options: accountSelect?.options?.length,
        page: 'import-user-data'
    });
    
    // Additional debug: Check all select elements
    const allSelects = document.querySelectorAll('select');
    window.Logger.debug('[Import Modal] All select elements found', {
        count: allSelects.length,
        elements: Array.from(allSelects).map(select => ({
            id: select.id,
            className: select.className,
            value: select.value
        })),
        page: 'import-user-data'
    });
    
    // Additional debug: Check all elements in the modal
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        const modalSelects = modal.querySelectorAll('select');
        window.Logger.debug('[Import Modal] Select elements in modal', {
            count: modalSelects.length,
            elements: Array.from(modalSelects).map(select => ({
                id: select.id,
                className: select.className,
                value: select.value,
                parentId: select.parentElement?.id
            })),
            page: 'import-user-data'
        });
        
        // Check if tradingAccountSelect is inside modal
        const accountInModal = modal.querySelector('#tradingAccountSelect');
        window.Logger.debug('[Import Modal] Account select in modal', {
            found: !!accountInModal,
            id: accountInModal?.id,
            page: 'import-user-data'
        });
    }
    
    if (accountSelect) {
        const accountValidation = window.validateSelectField(accountSelect, {
            required: true,
            customValidation: (value) => {
                if (!value || value === '') {
                    return 'חובה לבחור חשבון מסחר';
                }
                return true;
            }
        });
        
        if (accountValidation !== true) {
            isValid = false;
            window.Logger.warn('[Import Modal] Account validation failed', { error: accountValidation, page: 'import-user-data' });
            showNotification('שגיאה', accountValidation, 'error');
        }
    } else {
        isValid = false;
        window.Logger.error('[Import Modal] Account select element not found for validation', { page: 'import-user-data' });
        showNotification('שגיאה', 'שדה חשבון מסחר לא נמצא', 'error');
    }
    
    // Note: We don't need to check selectedAccount variable anymore
    // The account ID is only needed for the initial upload, then we use session_id
    
    return isValid;
}

/**
 * Load accounts from API
 */
async function loadAccounts() {
    window.Logger.debug('[Import Modal] Loading accounts', { page: 'import-user-data' });
    
    // Get the modal first to ensure we populate the correct select
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.error('[Import Modal] Modal not found for loading accounts', { page: 'import-user-data' });
        return;
    }
    
    const accountSelect = modal.querySelector('#tradingAccountSelect');
    if (!accountSelect) {
        window.Logger.error('[Import Modal] Account select not found in modal', { page: 'import-user-data' });
        return;
    }
    
    // Use the existing SelectPopulatorService but pass the element directly
    if (window.SelectPopulatorService) {
        window.Logger.debug('[Import Modal] Using SelectPopulatorService', { page: 'import-user-data' });
        try {
            // Temporarily set the ID to ensure SelectPopulatorService finds it
            // But we'll populate it manually to ensure it's the right element
            const response = await fetch('/api/trading-accounts/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let accounts = responseData.data || responseData || [];
            
            // Filter only open accounts
            accounts = accounts.filter(account => account.status === 'open');
            
            // Clear existing options
            accountSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר חשבון מסחר...';
            accountSelect.appendChild(emptyOption);
            
            // Add account options
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id.toString(); // Ensure it's a string
                option.textContent = account.name;
                accountSelect.appendChild(option);
            });
            
            window.Logger.info('[Import Modal] Accounts loaded successfully', { 
                count: accounts.length, 
                page: 'import-user-data' 
            });
            
            // Update button state after loading
            updateAnalyzeButton();
        } catch (error) {
            window.Logger.error('[Import Modal] Error loading accounts', { error: error.message, page: 'import-user-data' });
            // Fallback to direct API call
            await loadAccountsFallback();
        }
    } else {
        window.Logger.warn('[Import Modal] SelectPopulatorService not available, using fallback', { page: 'import-user-data' });
        // Fallback to direct API call
        await loadAccountsFallback();
    }
}

/**
 * Fallback method to load accounts directly
 */
function loadAccountsFallback() {
    window.Logger.debug('[Import Modal] Loading accounts via fallback method', { page: 'import-user-data' });
    
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.error('[Import Modal] Modal not found for fallback', { page: 'import-user-data' });
        return;
    }
    
    const accountSelect = modal.querySelector('#tradingAccountSelect');
    if (!accountSelect) {
        window.Logger.error('[Import Modal] Account select not found in modal for fallback', { page: 'import-user-data' });
        return;
    }
    
    fetch('/api/trading-accounts/')
        .then(response => response.json())
        .then(data => {
            const accounts = data.data || data || [];
            const openAccounts = accounts.filter(account => account.status === 'open');
            
            // Clear existing options
            accountSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר חשבון מסחר...';
            accountSelect.appendChild(emptyOption);
            
            // Add account options
            openAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id.toString(); // Ensure it's a string
                option.textContent = account.name;
                accountSelect.appendChild(option);
            });
            
            window.Logger.info('[Import Modal] Accounts loaded via fallback', { count: openAccounts.length, page: 'import-user-data' });
            
            // Update button state after loading
            updateAnalyzeButton();
        })
        .catch(error => {
            window.Logger.error('[Import Modal] Error loading accounts via fallback', { error: error.message, page: 'import-user-data' });
            showNotification('שגיאה בטעינת חשבונות', 'error');
        });
}

/**
 * Analyze file
 */
function analyzeFile() {
    // Validate all required fields using central validation system
    if (!validateAllRequiredFields()) {
        window.Logger.warn('[Import Modal] Cannot proceed - validation failed', { page: 'import-user-data' });
        return;
    }
    
    window.Logger.info('[Import Modal] Starting file analysis', { sessionId: currentSessionId, page: 'import-user-data' });
    
    // Get actual values from DOM - more reliable than variables
    const modal = document.getElementById('importUserDataModal');
    const connectorSelect = modal?.querySelector('#connectorSelect');
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    
    const connectorValue = connectorSelect?.value;
    const accountValue = accountSelect?.value;
    
    // Validate values
    if (!selectedFile || !connectorValue || !accountValue) {
        window.Logger.error('[Import Modal] Missing required values', {
            selectedFile: !!selectedFile,
            connectorValue: connectorValue,
            accountValue: accountValue,
            page: 'import-user-data'
        });
        showNotification('אנא מלא את כל השדות הנדרשים', 'error');
        return;
    }
    
    window.Logger.info('[Import Modal] Analysis starting with values', {
        selectedFile: selectedFile?.name,
        connectorValue: connectorValue,
        accountValue: accountValue,
        accountValueType: typeof accountValue,
        page: 'import-user-data'
    });
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('trading_account_id', accountValue);
    formData.append('connector_type', connectorValue);
    
    // Debug: Log what's being sent
    window.Logger.debug('[Import Modal] FormData contents', {
        hasFile: formData.has('file'),
        fileSize: selectedFile?.size,
        trading_account_id: formData.get('trading_account_id'),
        connector_type: formData.get('connector_type'),
        page: 'import-user-data'
    });
    
    fetch('/api/user-data-import/upload', {
            method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            window.Logger.info('[Import Modal] File analysis completed', { data, page: 'import-user-data' });
            currentSessionId = data.session_id;
            window.currentSessionId = data.session_id; // Make it global
            analysisResults = data.analysis_results;
            
            // Display results
            displayAnalysisResults(data.analysis_results);
            
            // Load problem resolution now that we have session ID
            loadProblemResolution();
            
            // Go to next step
            setTimeout(() => goToStep(2), 1000);
    } else {
            showNotification(`שגיאה בניתוח הקובץ: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Analysis error:', error);
        showNotification('שגיאה בניתוח הקובץ', 'error');
    });
}

/**
 * Display analysis results
 */
function displayAnalysisResults(results) {
    window.Logger.debug('[Import Modal] Displaying analysis results', { results, page: 'import-user-data' });
    
    try {
        // Update the analysis cards
        const totalRecords = document.getElementById('totalRecords');
        const validRecords = document.getElementById('validRecords');
        const invalidRecords = document.getElementById('invalidRecords');
        const duplicateRecords = document.getElementById('duplicateRecords');
        const missingTickersCount = document.getElementById('missingTickersCount');
        const missingTickerRecords = document.getElementById('missingTickerRecords');
        const existingRecords = document.getElementById('existingRecords');
        
        window.Logger.debug('[Import Modal] Found elements', { 
            totalRecords: !!totalRecords, 
            validRecords: !!validRecords, 
            invalidRecords: !!invalidRecords, 
            duplicateRecords: !!duplicateRecords, 
            missingTickersCount: !!missingTickersCount,
            missingTickerRecords: !!missingTickerRecords,
            existingRecords: !!existingRecords,
            page: 'import-user-data' 
        });
        
        // Calculate actual importable records (clean_records minus records with missing tickers)
        const missingTickersCountValue = results.missing_tickers ? results.missing_tickers.length : 0;
        const missingTickerRecordsCount = results.missing_ticker_records || 0;
        // Calculate records that will actually be imported (clean_records minus missing ticker records)
        const actualValidRecords = Math.max(0, (results.clean_records || 0) - missingTickerRecordsCount);
        
        window.Logger.info('[Import Modal] Analysis results calculation', {
            total_records: results.total_records || 0,
            original_valid_records: results.valid_records || 0,
            clean_records: results.clean_records || 0,
            missing_tickers_count: missingTickersCountValue,
            missing_ticker_records_count: missingTickerRecordsCount,
            actual_valid_records: actualValidRecords,
            invalid_records: results.invalid_records || 0,
            duplicate_records: results.duplicate_records || 0,
            existing_records: results.existing_records || 0,
            page: 'import-user-data'
        });
        
        if (totalRecords) totalRecords.textContent = results.total_records || 0;
        if (validRecords) validRecords.textContent = actualValidRecords; // Records that will actually be imported (clean_records)
        if (invalidRecords) invalidRecords.textContent = results.invalid_records || 0;
        if (duplicateRecords) duplicateRecords.textContent = results.duplicate_records || 0;
        if (missingTickersCount) missingTickersCount.textContent = missingTickersCountValue; // Number of missing tickers
        if (missingTickerRecords) missingTickerRecords.textContent = missingTickerRecordsCount; // Records with missing tickers
        if (existingRecords) existingRecords.textContent = results.existing_records || 0; // Records that already exist in system
        
        window.Logger.info('[Import Modal] Analysis results displayed successfully', { page: 'import-user-data' });
    } catch (error) {
        window.Logger.error('[Import Modal] Error displaying analysis results', { error: error.message, stack: error.stack, page: 'import-user-data' });
    }
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
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayProblemResolutionDetailed(data.preview_data);
    } else {
            showNotification(`שגיאה בטעינת נתוני בעיות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Problem resolution error:', error);
        showNotification('שגיאה בטעינת נתוני בעיות', 'error');
    });
}

/**
 * Display preview data
 */
function displayPreviewData(data) {
    window.Logger.debug('[Import Modal] Displaying preview data', { data, page: 'import-user-data' });
    
    if (!data) {
        window.Logger.warn('[Import Modal] No preview data to display', { page: 'import-user-data' });
        return;
    }
    
    // Update summary counts
    const importCount = data.records_to_import?.length || 0;
    const skipCount = data.records_to_skip?.length || 0;
    const totalCount = importCount + skipCount;
    const importRate = totalCount > 0 ? Math.round((importCount / totalCount) * 100) : 0;
    
    // Update summary display
    const importCountEl = document.getElementById('previewImportCount');
    const skipCountEl = document.getElementById('previewSkipCount');
    const importRateEl = document.getElementById('previewImportRate');
    
    if (importCountEl) importCountEl.textContent = importCount;
    if (skipCountEl) skipCountEl.textContent = skipCount;
    if (importRateEl) importRateEl.textContent = `${importRate}%`;
    
    // Display records to import
    const importTableBody = document.getElementById('importTableBody');
    if (importTableBody && data.records_to_import) {
        importTableBody.innerHTML = '';
        data.records_to_import.forEach(record => {
            const row = document.createElement('tr');
            const realizedPL = record.realized_pl !== null && record.realized_pl !== undefined 
                ? (record.realized_pl >= 0 ? `$${record.realized_pl}` : `-$${Math.abs(record.realized_pl)}`) 
                : '-';
            const mtmPL = record.mtm_pl !== null && record.mtm_pl !== undefined 
                ? (record.mtm_pl >= 0 ? `$${record.mtm_pl}` : `-$${Math.abs(record.mtm_pl)}`) 
                : '-';
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
                <td>${record.date || 'N/A'}</td>
            `;
            importTableBody.appendChild(row);
        });
    }
    
    // Display records to skip
    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableBody && data.records_to_skip) {
        skipTableBody.innerHTML = '';
        data.records_to_skip.forEach(record => {
            const row = document.createElement('tr');
            const realizedPL = record.realized_pl !== null && record.realized_pl !== undefined 
                ? (record.realized_pl >= 0 ? `$${record.realized_pl}` : `-$${Math.abs(record.realized_pl)}`) 
                : '-';
            const mtmPL = record.mtm_pl !== null && record.mtm_pl !== undefined 
                ? (record.mtm_pl >= 0 ? `$${record.mtm_pl}` : `-$${Math.abs(record.mtm_pl)}`) 
                : '-';
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
                <td>${record.date || 'N/A'}</td>
                <td>${record.reason || 'N/A'}</td>
            `;
            skipTableBody.appendChild(row);
        });
    }
    
    window.Logger.info('[Import Modal] Preview data displayed successfully', { 
        importCount, 
        skipCount, 
        importRate, 
        page: 'import-user-data' 
    });
}

/**
 * Load preview data (Step 4)
 */
function loadPreviewData() {
    window.Logger.debug('[Import Modal] Loading preview data', { 
        currentSessionId, 
        page: 'import-user-data' 
    });
    
    if (!currentSessionId) {
        window.Logger.error('[Import Modal] No session ID for preview', { page: 'import-user-data' });
        showNotification('שגיאה: אין מזהה הפעלה', 'error');
        return;
    }
    
    // Load preview data from server
    fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayPreviewData(data.preview_data);
            displayConfirmationData(analysisResults, data.preview_data);
            window.Logger.info('[Import Modal] Preview and confirmation data loaded successfully', { 
                data: data.preview_data, 
                page: 'import-user-data' 
            });
        } else {
            window.Logger.error('[Import Modal] Failed to load preview data', { 
                error: data.error, 
                page: 'import-user-data' 
            });
            showNotification(`שגיאה בטעינת תצוגה מקדימה: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('[Import Modal] Preview data error:', error);
        showNotification('שגיאה בטעינת תצוגה מקדימה', 'error');
    });
}

/**
 * Load confirmation data (Step 5)
 */
function loadConfirmationData() {
    // The HTML content is already in the DOM, just need to display confirmation data
    if (analysisResults && previewData) {
        displayConfirmationData(analysisResults, previewData);
    }
}

/**
 * Display confirmation data
 */
function displayConfirmationData(analysisResults, previewData) {
    window.Logger.debug('[Import Modal] Displaying confirmation data', { analysisResults, previewData, page: 'import-user-data' });
    
    if (!analysisResults || !previewData) {
        window.Logger.warn('[Import Modal] Missing data for confirmation display', { page: 'import-user-data' });
        return;
    }
    
    // Update confirmation summary
    const fileName = window.selectedFile?.name || 'קובץ לא ידוע';
    const accountSelect = document.getElementById('tradingAccountSelect');
    const accountName = accountSelect?.selectedOptions[0]?.text || 'חשבון מסחר לא ידוע';
    
    const totalRecords = analysisResults.total_records || 0;
    const importCount = previewData.records_to_import?.length || 0;
    const skipCount = previewData.records_to_skip?.length || 0;
    
    // Update confirmation display elements
    const confirmFileNameEl = document.getElementById('confirmFileName');
    const confirmAccountNameEl = document.getElementById('confirmAccountName');
    const confirmTotalRecordsEl = document.getElementById('confirmTotalRecords');
    const confirmImportRecordsEl = document.getElementById('confirmImportRecords');
    const confirmSkipRecordsEl = document.getElementById('confirmSkipRecords');
    
    if (confirmFileNameEl) confirmFileNameEl.textContent = fileName;
    if (confirmAccountNameEl) confirmAccountNameEl.textContent = accountName;
    if (confirmTotalRecordsEl) confirmTotalRecordsEl.textContent = totalRecords;
    if (confirmImportRecordsEl) confirmImportRecordsEl.textContent = importCount;
    if (confirmSkipRecordsEl) confirmSkipRecordsEl.textContent = skipCount;
    
    window.Logger.info('[Import Modal] Confirmation data displayed successfully', { 
        fileName, 
        accountName, 
        totalRecords, 
        importCount, 
        skipCount, 
        page: 'import-user-data' 
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
                    ${data.missing_tickers?.map(ticker => {
                        const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
                        const currency = typeof ticker === 'string' ? 'USD' : ticker.currency;
                        return `
                        <div class="problem-card missing-ticker-card">
                            <div class="problem-card-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>${symbol}</span>
                            </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-primary" onclick="openAddTickerModal('${symbol}', '${currency}')">
                                    הוסף טיקר
                </button>
                                        </div>
                                    </div>
                    `;
                    }).join('') || '<p>אין טיקרים חסרים</p>'}
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
        if (data.success || data.status === 'success') {
            showNotification('כפילות אושרה', 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showNotification(`שגיאה באישור כפילות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Accept duplicate error:', error);
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
        if (data.success || data.status === 'success') {
            showNotification('כפילות נדחתה', 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showNotification(`שגיאה בדחיית כפילות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Reject duplicate error:', error);
        showNotification('שגיאה בדחיית כפילות', 'error');
    });
}

/**
 * Open add ticker modal
 */
function openAddTickerModal(symbol, currency = 'USD') {
    const modal = document.getElementById('addTickerModal');
    const symbolInput = document.getElementById('tickerSymbol');
    const nameInput = document.getElementById('tickerName');
    const currencySelect = document.getElementById('tickerCurrency');
    
    if (modal && symbolInput && nameInput) {
        symbolInput.value = symbol;
        nameInput.value = symbol; // Default name to symbol
        
        // Set currency based on imported data
        if (currencySelect) {
            const currencyMap = {
                'USD': '1',
                'EUR': '2', 
                'ILS': '3'
            };
            const currencyId = currencyMap[currency] || '1'; // Default to USD
            currencySelect.value = currencyId;
        }
        
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
            currency_id: parseInt(document.getElementById('tickerCurrency')?.value || '1')
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            showNotification(`טיקר ${symbol} נוסף בהצלחה`, 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            const errorMsg = data.error?.message || data.error || 'שגיאה לא ידועה';
            showNotification(`שגיאה בהוספת טיקר: ${errorMsg}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Add ticker error:', error);
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
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayPreview(data.preview_data);
            
            // Go to next step
            setTimeout(() => goToStep(5), 1000);
        } else {
            showNotification(`שגיאה ביצירת תצוגה מקדימה: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Preview error:', error);
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
    
    fetch(`/api/user-data-import/session/${currentSessionId}/execute`, {
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
        if (data.success || data.status === 'success') {
            showNotification('ייבוא הנתונים הושלם בהצלחה!', 'success');
            closeImportUserDataModal();
            
            // Clear cache to show new data - use centralized cache clearing
            if (typeof window.clearCacheQuick === 'function') {
                window.clearCacheQuick();
            } else if (typeof window.clearAllCacheAdvanced === 'function') {
                window.clearAllCacheAdvanced();
            }
            
            if (generateReport && data.report_url) {
                showNotification('דוח ייבוא זמין להורדה', 'info');
            }
            
            // Refresh executions table if exists
            if (typeof window.loadExecutionsData === 'function') {
                window.loadExecutionsData();
            }
    } else {
            showNotification(`שגיאה בייבוא: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Import error:', error);
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
        window.Logger.info(`[Import Modal] ${message}`, { type, page: 'import-user-data' });
    }
}

/**
 * Display problem resolution with detailed cards
 */
function displayProblemResolutionDetailed(data) {
    window.Logger.debug('[Import Modal] Displaying detailed problem resolution', { data, page: 'import-user-data' });
    
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
    const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
    const currency = typeof ticker === 'string' ? 'USD' : ticker.currency;
    
    return `
        <div class="problem-card missing-ticker-card">
            <div class="problem-card-header">
                <i class="bi bi-exclamation-circle"></i>
                <span>${symbol}</span>
            </div>
            <div class="problem-card-body">
                <div class="missing-ticker-info">
                    <i class="bi bi-info-circle"></i>
                    הטיקר ${symbol} לא קיים במערכת
                </div>
            </div>
            <div class="problem-card-actions">
                <button class="btn btn-sm btn-primary" onclick="openAddTickerModal('${symbol}', '${currency}')">
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
        if (data.success || data.status === 'success') {
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
        window.Logger.error('Refresh preview error:', error);
        showNotification('שגיאה ברענון התצוגה', 'error');
    });
}

/**
 * Confirm import - final step before executing the import
 */
function confirmImport(withReport = false) {
    window.Logger.info('[Import Modal] Confirming import', { 
        withReport, 
        sessionId: currentSessionId,
        page: 'import-user-data' 
    });
    
    if (!currentSessionId) {
        showNotification('לא נמצא מזהה סשן לייבוא', 'error');
        return;
    }
    
    // Execute the import
    if (withReport) {
        executeImportWithReport();
        } else {
        executeImport();
        }
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
window.confirmImport = confirmImport;
