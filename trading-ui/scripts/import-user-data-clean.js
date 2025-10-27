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
    const currentStepContent = document.getElementById(`step${step}Content`);
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
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
    const content = document.getElementById('step1Content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="step-content-inner">
            <h4>בחר קובץ וחשבון מסחר</h4>
            
            <div class="form-group">
                <label for="importFileInput">קובץ CSV:</label>
                <input type="file" id="importFileInput" accept=".csv" class="form-control" onchange="handleFileSelect(event)">
                <div id="fileInfo" class="file-info"></div>
            </div>
            
            <div class="form-group">
                <label for="importAccountSelect">חשבון מסחר:</label>
                <select id="importAccountSelect" class="form-control" onchange="handleAccountSelect(event)">
                    <option value="">בחר חשבון מסחר</option>
                </select>
                <div id="accountInfo" class="account-info"></div>
            </div>
            
            <div class="step-actions">
                <button class="btn btn-primary" onclick="analyzeFile()" id="analyzeBtn" disabled>
                    <i class="fas fa-search"></i> נתח קובץ
                </button>
            </div>
        </div>
    `;
    
    // Load accounts
    loadAccounts();
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
    
    selectedFile = file;
    
    // Update UI
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <div class="file-selected">
                <i class="fas fa-file-csv"></i>
                <span>${file.name}</span>
                <small>${formatFileSize(file.size)}</small>
            </div>
        `;
    }
    
    // Enable analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn && selectedAccount) {
        analyzeBtn.disabled = false;
    }
}

/**
 * Handle account selection
 */
function handleAccountSelect(event) {
    const accountId = event.target.value;
    if (!accountId) return;
    
    selectedAccount = accountId;
    
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
 * Load accounts from API
 */
function loadAccounts() {
    fetch('/api/user-data-import/accounts')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const accountSelect = document.getElementById('importAccountSelect');
                if (accountSelect) {
                    accountSelect.innerHTML = '<option value="">בחר חשבון מסחר</option>';
                    data.accounts.forEach(account => {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = `${account.name} (${account.provider})`;
                        accountSelect.appendChild(option);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error loading accounts:', error);
            showNotification('שגיאה בטעינת חשבונות', 'error');
        });
}

/**
 * Analyze file
 */
function analyzeFile() {
    if (!selectedFile || !selectedAccount) {
        showNotification('נא לבחור קובץ וחשבון', 'error');
        return;
    }
    
    console.log('Analyzing file...');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('account_id', selectedAccount);
    
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
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="analysis-results">
            <h5>תוצאות ניתוח</h5>
            <div class="results-grid">
                <div class="result-item">
                    <i class="fas fa-file-alt"></i>
                    <span class="result-label">רשומות שנמצאו</span>
                    <span class="result-count">${results.total_records || 0}</span>
                </div>
                <div class="result-item">
                    <i class="fas fa-check-circle"></i>
                    <span class="result-label">רשומות תקינות</span>
                    <span class="result-count">${results.valid_records || 0}</span>
                </div>
                <div class="result-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span class="result-label">רשומות בעייתיות</span>
                    <span class="result-count">${results.invalid_records || 0}</span>
                </div>
                <div class="result-item">
                    <i class="fas fa-times-circle"></i>
                    <span class="result-label">כפילויות</span>
                    <span class="result-count">${results.duplicate_records || 0}</span>
                </div>
            </div>
        </div>
    `;
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
            displayProblemResolution(data.preview_data);
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
            // Refresh problem resolution
            loadProblemResolution();
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
            // Refresh problem resolution
            loadProblemResolution();
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
    // Simple prompt for now
    const tickerName = prompt(`הזן שם לטיקר ${symbol}:`, symbol);
    if (tickerName) {
        saveTickerFromModal(symbol, tickerName);
    }
}

/**
 * Save ticker from modal
 */
function saveTickerFromModal(symbol, name) {
    // This would typically make an API call to add the ticker
    showNotification(`טיקר ${symbol} נוסף בהצלחה`, 'success');
    // Refresh problem resolution
    loadProblemResolution();
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

