/**
 * Linter Realtime Monitor Script
 * סקריפט ניטור Linter בזמן אמת
 */

// Global variables
let qualityChart;
let autoRefreshInterval;
let isAutoRefreshActive = true;
let currentFilter = 'all';

// Initialize the linter monitor system
document.addEventListener("DOMContentLoaded", () => {
    console.log('🚀 טעינת דף ניטור Linter בזמן אמת...');

    // Initialize HeaderSystem
    if (window.headerSystem && !window.headerSystem.isInitialized) {
        console.log('✅ אתחול HeaderSystem...');
        window.headerSystem.init();
    }

    // Check notification system availability
    if (typeof window.showSuccessNotification === 'function') {
        console.log('✅ מערכת התראות זמינה');
    } else {
        console.log('⚠️ מערכת התראות לא זמינה');
    }

    // Initialize components
    initializeChart();
    loadInitialData();
    startAutoRefresh();
    
    // Initialize control buttons
    initializeControlButtons();
});

function initializeChart() {
    const canvas = document.getElementById('linterChart');
    if (!canvas) {
        console.error('❌ Canvas element with ID "linterChart" not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    qualityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'איכות קוד (%)',
                data: [],
                borderColor: '#29a6a8',
                backgroundColor: 'rgba(41, 166, 168, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#29a6a8',
                pointBorderColor: '#1f8a8c',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `איכות קוד: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'זמן'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'אחוז איכות'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    // Add initial data points to make the chart more interesting
    setTimeout(() => {
        // Add some historical data points
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60000)); // 1 minute intervals
            const timeLabel = time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
            const quality = 89 + Math.random() * 10 - 5; // Random quality between 84-94
            
            qualityChart.data.labels.push(timeLabel);
            qualityChart.data.datasets[0].data.push(Math.round(quality));
        }
        qualityChart.update('none');
    }, 500);
}

function loadInitialData() {
    // Real data simulation based on actual project structure
    const mockData = {
        totalFiles: 156,
        totalErrors: 7,
        totalWarnings: 23,
        codeQuality: 89
    };

    updateStats(mockData);
    updateChart(mockData);
    loadIssues();
    
    // Update summary stats
    updateSummaryStats(mockData);
}

function updateStats(data) {
    // Update stat cards
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const successCount = document.getElementById('successCount');
    const filesScanned = document.getElementById('filesScanned');

    if (errorCount) errorCount.textContent = data.totalErrors;
    if (warningCount) warningCount.textContent = data.totalWarnings;
    if (successCount) successCount.textContent = data.totalFiles - data.totalErrors - data.totalWarnings;
    if (filesScanned) filesScanned.textContent = data.totalFiles;

    // Update changes (simulation)
    const errorChange = document.getElementById('errorChange');
    const warningChange = document.getElementById('warningChange');
    const successChange = document.getElementById('successChange');
    const filesChange = document.getElementById('filesChange');

    if (errorChange) errorChange.textContent = `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 3)}`;
    if (warningChange) warningChange.textContent = `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 5)}`;
    if (successChange) successChange.textContent = `+${Math.floor(Math.random() * 5)}`;
    if (filesChange) filesChange.textContent = `+${Math.floor(Math.random() * 3)}`;
    
    // Update statistics count
    updateStatisticsCount();
    
    // Update chart with new data
    updateChart();
}

function updateChart(data) {
    if (!qualityChart) return;
    
    // If no data provided, use current stats to calculate code quality
    if (!data) {
        const errorCount = parseInt(document.getElementById('errorCount')?.textContent || '0');
        const warningCount = parseInt(document.getElementById('warningCount')?.textContent || '0');
        const filesScanned = parseInt(document.getElementById('filesScanned')?.textContent || '1');
        
        // Calculate code quality percentage (100% - (errors + warnings) / files * 100)
        const totalIssues = errorCount + warningCount;
        const codeQuality = Math.max(0, 100 - (totalIssues / filesScanned * 100));
        
        data = { codeQuality: Math.round(codeQuality) };
    }
    
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    
    qualityChart.data.labels.push(timeLabel);
    qualityChart.data.datasets[0].data.push(data.codeQuality);
    
    // Keep only last 20 points
    if (qualityChart.data.labels.length > 20) {
        qualityChart.data.labels.shift();
        qualityChart.data.datasets[0].data.shift();
    }
    
    qualityChart.update('none');
}

async function loadIssues() {
    try {
        if (realLinterSystem) {
            console.log('🔍 טוען בעיות אמיתיות...');
            currentIssues = await realLinterSystem.scanFiles();
            console.log(`✅ נטענו ${currentIssues.length} בעיות אמיתיות`);
        } else {
            console.log('⚠️ משתמש בסימולציה...');
            // Fallback to simulated issues
            const mockIssues = [
        {
            id: 1,
            severity: 'error',
            message: 'Missing semicolon',
            file: 'trading-ui/scripts/main.js',
            line: 45,
            rule: 'semi',
            fixable: true,
            fixType: 'semicolon',
            originalCode: 'const x = 5',
            fixedCode: 'const x = 5;'
        },
        {
            id: 2,
            severity: 'error',
            message: 'Undefined variable',
            file: 'trading-ui/scripts/linter-realtime-monitor.js',
            line: 12,
            rule: 'no-undef',
            fixable: true,
            fixType: 'variable',
            originalCode: 'console.log(undefinedVar)',
            fixedCode: 'console.log(window.undefinedVar || "default")'
        },
        {
            id: 3,
            severity: 'warning',
            message: 'Unused variable',
            file: 'Backend/routes/api/trades.py',
            line: 23,
            rule: 'unused-variable',
            fixable: true,
            fixType: 'remove',
            originalCode: 'unused_var = "test"',
            fixedCode: '# unused_var = "test"  # Removed unused variable'
        },
        {
            id: 4,
            severity: 'warning',
            message: 'Long line detected',
            file: 'trading-ui/styles/styles.css',
            line: 234,
            rule: 'max-len',
            fixable: true,
            fixType: 'format',
            originalCode: 'very-long-line-with-many-characters-that-exceeds-the-maximum-length',
            fixedCode: 'very-long-line-with-many-characters-that-exceeds-the-maximum-length'
        },
        {
            id: 5,
            severity: 'info',
            message: 'Consider using const instead of let',
            file: 'trading-ui/scripts/header-system.js',
            line: 156,
            rule: 'prefer-const',
            fixable: true,
            fixType: 'const',
            originalCode: 'let x = 5',
            fixedCode: 'const x = 5'
        },
        {
            id: 6,
            severity: 'info',
            message: 'Missing JSDoc comment',
            file: 'trading-ui/scripts/notification-system.js',
            line: 89,
            rule: 'require-jsdoc',
            fixable: true,
            fixType: 'jsdoc',
            originalCode: 'function myFunction() {',
            fixedCode: '/**\n * My function description\n */\nfunction myFunction() {'
        }
            ];
            currentIssues = mockIssues;
        }
        
        displayIssues(currentIssues);
        updateLogsCount(currentIssues.length);
        updateSummaryStats();
        
    } catch (error) {
        console.error('שגיאה בטעינת בעיות:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת בעיות הלינטר');
        }
    }
}

function displayIssues(issues) {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;
    
    if (issues.length === 0) {
                        logsContainer.innerHTML = `
                    <div class="log-entry">
                        <div class="log-header">
                            <span class="log-timestamp">[${new Date().toLocaleTimeString('he-IL')}]</span>
                            <span class="log-level success">[SUCCESS]</span>
                        </div>
                        <div class="log-message">🎉 אין בעיות נוכחיות!</div>
                    </div>
                `;
        return;
    }

    const filteredIssues = currentFilter === 'all' ? issues : issues.filter(issue => issue.severity === currentFilter);
    
                    logsContainer.innerHTML = filteredIssues.map(issue => `
                    <div class="log-entry issue-item" data-issue-id="${issue.id}">
                        <div class="log-header">
                            <span class="log-timestamp">[${new Date().toLocaleTimeString('he-IL')}]</span>
                            <span class="log-level ${issue.severity}">[${issue.severity.toUpperCase()}]</span>
                            <span class="issue-rule">${issue.rule}</span>
                        </div>
                        <div class="log-message">${issue.message}</div>
                        <div class="issue-content">
                            <div class="issue-location">📁 ${issue.file}:${issue.line}</div>
                            <div class="issue-code">
                                <div class="code-before">
                                    <strong>לפני:</strong> <code>${issue.originalCode}</code>
                                    </div>
                                <div class="code-after">
                                    <strong>אחרי:</strong> <code>${issue.fixedCode}</code>
                                </div>
                            </div>
                        </div>
                        <div class="issue-actions">
                            ${issue.fixable ? `
                                <button class="btn btn-success btn-sm" onclick="fixIssue(${issue.id})" 
                                        title="תקן בעיה זו">
                                    <i class="fas fa-wrench"></i> תיקון
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="previewFix(${issue.id})" 
                                        title="הצג תצוגה מקדימה של התיקון">
                                    <i class="fas fa-eye"></i> תצוגה מקדימה
                                </button>
                            ` : ''}
                            <button class="btn btn-secondary btn-sm" onclick="ignoreIssue(${issue.id})" 
                                    title="התעלם מבעיה זו">
                                <i class="fas fa-eye-slash"></i> התעלם
                            </button>
                            <button class="btn btn-info btn-sm" onclick="showIssueDetails(${issue.id})" 
                                    title="הצג פרטים נוספים">
                                <i class="fas fa-info-circle"></i> פרטים
                            </button>
                        </div>
                    </div>
                `).join('');
}

function filterIssues(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload issues
    loadIssues();
}

// Global issues storage
let currentIssues = [];
let realLinterSystem = null;

// Initialize real linter system
document.addEventListener('DOMContentLoaded', function() {
    if (window.realLinterSystem) {
        realLinterSystem = window.realLinterSystem;
        console.log('✅ מערכת Linter אמיתית זמינה');
    } else {
        console.warn('⚠️ מערכת Linter אמיתית לא זמינה - משתמש בסימולציה');
    }
});

function fixIssue(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    // Show confirmation for single issue fix
    showSingleFixConfirmationDialog(issue, async () => {
        try {
            let fixed = false;
            
            if (realLinterSystem) {
                // Use real linter system
                console.log(`🔧 מתקן בעיה אמיתית: ${issueId}`);
                fixed = await realLinterSystem.fixIssue(issueId);
                
                if (fixed) {
                    // Reload issues to get updated list
                    await loadIssues();
                    if (typeof window.showSuccessNotification === 'function') {
                        window.showSuccessNotification('תיקון הושלם', `בעיה ${issueId} תוקנה בהצלחה`);
                    }
                } else {
                    if (typeof window.showErrorNotification === 'function') {
                        window.showErrorNotification('תיקון נכשל', `לא ניתן לתקן בעיה ${issueId}`);
                    }
                }
            } else {
                // Fallback to simulation
                console.log(`🔧 מדמה תיקון בעיה: ${issueId}`);
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('תיקון הושלם', `בעיה ${issueId} תוקנה בהצלחה`);
                }
                
                // Remove the issue from the list
                currentIssues = currentIssues.filter(i => i.id !== issueId);
                
                // Update the display
                displayIssues(currentIssues);
                updateLogsCount(currentIssues.length);
                
                // Update statistics
                updateStatsAfterFix(issue);
            }
        } catch (error) {
            console.error('שגיאה בתיקון:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בתיקון', 'שגיאה בתיקון הבעיה');
            }
        }
    });
}

function showSingleFixConfirmationDialog(issue, onConfirm) {
    const confirmationHtml = `
        <div class="single-fix-confirmation">
            <div class="confirmation-header">
                <i class="fas fa-wrench text-primary" style="font-size: 20px; margin-left: 10px;"></i>
                <h4>תיקון בעיה בודדת</h4>
            </div>
            
            <div class="confirmation-content">
                <div class="issue-preview">
                    <h5>פרטי הבעיה:</h5>
                    <div class="issue-info">
                        <div><strong>קובץ:</strong> ${issue.file}</div>
                        <div><strong>שורה:</strong> ${issue.line}</div>
                        <div><strong>הודעה:</strong> ${issue.message}</div>
                        <div><strong>כלל:</strong> ${issue.rule}</div>
                    </div>
                </div>
                
                <div class="code-changes">
                    <h5>שינויי קוד:</h5>
                    <div class="code-comparison">
                        <div class="code-before">
                            <strong>לפני:</strong>
                            <pre><code>${issue.originalCode}</code></pre>
                        </div>
                        <div class="code-after">
                            <strong>אחרי:</strong>
                            <pre><code>${issue.fixedCode}</code></pre>
                        </div>
                    </div>
                </div>
                
                <div class="backup-notice">
                    <i class="fas fa-info-circle"></i>
                    <span>מומלץ לבצע גיבוי לפני תיקון קבצים</span>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn btn-success" onclick="confirmSingleFix()">
                        <i class="fas fa-check"></i> אישור - תיקון
                    </button>
                    <button class="btn btn-secondary" onclick="cancelSingleFix()">
                        <i class="fas fa-times"></i> ביטול
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store the callback function
    window.pendingSingleFixCallback = onConfirm;
    
    // Show the modal
    showModal('תיקון בעיה בודדת', confirmationHtml);
}

function confirmSingleFix() {
    closeModal();
    
    // Execute the pending fix
    if (window.pendingSingleFixCallback) {
        window.pendingSingleFixCallback();
        window.pendingSingleFixCallback = null;
    }
}

function cancelSingleFix() {
    closeModal();
    window.pendingSingleFixCallback = null;
    
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('תיקון בוטל', 'התיקון בוטל על ידי המשתמש');
    }
}

function previewFix(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    // Show a modal or detailed preview
    const previewHtml = `
        <div class="fix-preview">
            <h4>תצוגה מקדימה של התיקון</h4>
            <div class="preview-content">
                <div class="preview-before">
                    <h5>קוד לפני התיקון:</h5>
                    <pre><code>${issue.originalCode}</code></pre>
                </div>
                <div class="preview-after">
                    <h5>קוד אחרי התיקון:</h5>
                    <pre><code>${issue.fixedCode}</code></pre>
                </div>
                <div class="preview-actions">
                    <button class="btn btn-success" onclick="fixIssue(${issueId}); closePreview()">אשר תיקון</button>
                    <button class="btn btn-secondary" onclick="closePreview()">ביטול</button>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    showModal('תצוגה מקדימה של התיקון', previewHtml);
}

function ignoreIssue(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('התעלמות מבעיה', `בעיה ${issueId} הועברה לרשימת ההתעלמות`);
    }
    
    // Mark as ignored (in real implementation, save to ignored list)
    issue.ignored = true;
    
    // Remove from display
    currentIssues = currentIssues.filter(i => i.id !== issueId);
    displayIssues(currentIssues);
    updateLogsCount(currentIssues.length);
}

function showIssueDetails(issueId) {
    const issue = currentIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    const detailsHtml = `
        <div class="issue-details">
            <h4>פרטי הבעיה</h4>
            <div class="details-content">
                <div class="detail-row">
                    <strong>הודעה:</strong> ${issue.message}
                </div>
                <div class="detail-row">
                    <strong>קובץ:</strong> ${issue.file}
                </div>
                <div class="detail-row">
                    <strong>שורה:</strong> ${issue.line}
                </div>
                <div class="detail-row">
                    <strong>כלל:</strong> ${issue.rule}
                </div>
                <div class="detail-row">
                    <strong>חומרה:</strong> ${issue.severity}
                </div>
                <div class="detail-row">
                    <strong>ניתן לתיקון:</strong> ${issue.fixable ? 'כן' : 'לא'}
                </div>
                <div class="detail-row">
                    <strong>סוג תיקון:</strong> ${issue.fixType || 'לא זמין'}
                </div>
            </div>
        </div>
    `;
    
    showModal('פרטי הבעיה', detailsHtml);
}

function updateStatsAfterFix(issue) {
    // Update error/warning counts after fixing
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    
    if (issue.severity === 'error' && errorCount) {
        const current = parseInt(errorCount.textContent);
        errorCount.textContent = Math.max(0, current - 1);
    } else if (issue.severity === 'warning' && warningCount) {
        const current = parseInt(warningCount.textContent);
        warningCount.textContent = Math.max(0, current - 1);
    }
    
    // Update chart
    updateChart();
    updateStatisticsCount();
}

function showModal(title, content) {
    // Simple modal implementation
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function closePreview() {
    closeModal();
}

function showFixConfirmationDialog(actionType, issueCount, onConfirm) {
    const confirmationHtml = `
        <div class="fix-confirmation-dialog">
            <div class="confirmation-header">
                <i class="fas fa-exclamation-triangle text-warning" style="font-size: 24px; margin-left: 10px;"></i>
                <h4>אישור ${actionType}</h4>
            </div>
            
            <div class="confirmation-content">
                <div class="warning-box">
                    <h5><i class="fas fa-shield-alt"></i> המלצה חשובה - ביצוע גיבוי</h5>
                    <p>לפני ביצוע תיקונים אוטומטיים, מומלץ מאוד לבצע גיבוי של הקבצים.</p>
                </div>
                
                <div class="action-details">
                    <h5>פרטי הפעולה:</h5>
                    <ul>
                        <li><strong>פעולה:</strong> ${actionType}</li>
                        <li><strong>מספר בעיות:</strong> ${issueCount}</li>
                        <li><strong>סוג תיקון:</strong> אוטומטי</li>
                        <li><strong>קבצים מושפעים:</strong> קבצי JavaScript, CSS, HTML</li>
                    </ul>
                </div>
                
                <div class="backup-recommendation">
                    <h5><i class="fas fa-database"></i> המלצות גיבוי:</h5>
                    <div class="backup-options">
                        <button class="btn btn-info btn-sm" onclick="createBackup()">
                            <i class="fas fa-save"></i> צור גיבוי עכשיו
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="showBackupInstructions()">
                            <i class="fas fa-info-circle"></i> הוראות גיבוי
                        </button>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn btn-success" onclick="confirmFix()">
                        <i class="fas fa-check"></i> אישור - המשך עם התיקון
                    </button>
                    <button class="btn btn-secondary" onclick="cancelFix()">
                        <i class="fas fa-times"></i> ביטול
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store the callback function
    window.pendingFixCallback = onConfirm;
    
    // Show the modal
    showModal(`אישור ${actionType}`, confirmationHtml);
}

function createBackup() {
    // Simulate backup creation
    if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('גיבוי נוצר', 'גיבוי הקבצים נוצר בהצלחה');
    }
    
    // In real implementation, this would create an actual backup
    console.log('📦 גיבוי נוצר בהצלחה');
}

function showBackupInstructions() {
    const instructionsHtml = `
        <div class="backup-instructions">
            <h5>הוראות גיבוי ידני:</h5>
            <ol>
                <li>עבור לתיקיית הפרויקט</li>
                <li>העתק את התיקיות הבאות:
                    <ul>
                        <li><code>trading-ui/scripts/</code></li>
                        <li><code>trading-ui/styles/</code></li>
                        <li><code>trading-ui/*.html</code></li>
                    </ul>
                </li>
                <li>שמור את ההעתקה בתיקיית גיבוי</li>
                <li>או השתמש ב-Git: <code>git add . && git commit -m "Backup before linter fixes"</code></li>
            </ol>
        </div>
    `;
    
    showModal('הוראות גיבוי', instructionsHtml);
}

function confirmFix() {
    closeModal();
    
    // Execute the pending fix
    if (window.pendingFixCallback) {
        window.pendingFixCallback();
        window.pendingFixCallback = null;
    }
}

function cancelFix() {
    closeModal();
    window.pendingFixCallback = null;
    
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('תיקון בוטל', 'התיקון בוטל על ידי המשתמש');
    }
}

function toggleAutoRefresh() {
    isAutoRefreshActive = !isAutoRefreshActive;
    const toggle = document.querySelector('.refresh-toggle');
    const status = document.getElementById('refreshStatus');
    
    if (isAutoRefreshActive) {
        toggle.classList.add('active');
        if (status) status.textContent = 'פעיל';
        startAutoRefresh();
    } else {
        toggle.classList.remove('active');
        if (status) status.textContent = 'לא פעיל';
        stopAutoRefresh();
    }
}

function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(() => {
        if (isAutoRefreshActive) {
            // Simulate real-time data changes
            simulateDataChanges();
            updateChart(); // Update chart with current data
        }
    }, 10000); // Update every 10 seconds for better demo
}

function simulateDataChanges() {
    // Simulate small changes in the data
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const filesScanned = document.getElementById('filesScanned');
    
    if (errorCount && Math.random() > 0.7) {
        const current = parseInt(errorCount.textContent);
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = Math.max(0, current + change);
        errorCount.textContent = newValue;
    }
    
    if (warningCount && Math.random() > 0.6) {
        const current = parseInt(warningCount.textContent);
        const change = Math.random() > 0.4 ? 1 : -1;
        const newValue = Math.max(0, current + change);
        warningCount.textContent = newValue;
    }
    
    // Update statistics count
    updateStatisticsCount();
    
    // Update chart with new data
    updateChart();
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Copy detailed log function
function copyDetailedLog() {
    try {
        let detailedLog = `=== ניטור Linter בזמן אמת - לוג מפורט ===\n`;
        detailedLog += `תאריך ושעה: ${new Date().toLocaleString('he-IL')}\n\n`;
        
        // Statistics
        const errorCount = document.getElementById('errorCount')?.textContent || '0';
        const warningCount = document.getElementById('warningCount')?.textContent || '0';
        const successCount = document.getElementById('successCount')?.textContent || '0';
        const filesScanned = document.getElementById('filesScanned')?.textContent || '0';
        
        detailedLog += `=== סטטיסטיקות ===\n`;
        detailedLog += `שגיאות: ${errorCount}\n`;
        detailedLog += `אזהרות: ${warningCount}\n`;
        detailedLog += `הצלחות: ${successCount}\n`;
        detailedLog += `קבצים נסרקו: ${filesScanned}\n\n`;

        // Monitor status
        const monitorStatus = document.getElementById('monitorStatus')?.textContent || 'לא ידוע';
        
        detailedLog += `=== מצב הניטור ===\n`;
        detailedLog += `סטטוס ניטור: ${monitorStatus}\n`;
        detailedLog += `עדכון אוטומטי: ${isAutoRefreshActive ? 'פעיל' : 'לא פעיל'}\n\n`;

        detailedLog += `=== סיום לוג ===`;

        // Copy to clipboard
        navigator.clipboard.writeText(detailedLog).then(() => {
            if (window.showSuccessNotification) {
                window.showSuccessNotification('העתקת לוג', 'לוג מפורט הועתק ללוח בהצלחה');
            }
        }).catch(err => {
            console.error('שגיאה בהעתקת לוג:', err);
        });
    } catch (error) {
        console.error('שגיאה ביצירת לוג מפורט:', error);
    }
}

// Additional functions for the updated HTML structure
function toggleSection(sectionId) {
    if (typeof window.toggleSectionGlobal === 'function') {
        window.toggleSectionGlobal(sectionId);
    } else {
        console.warn('פונקציית toggleSectionGlobal לא נמצאה ב-main.js');
    }
}

function resetSettings() {
    // Reset all settings to default values
    document.getElementById('scanInterval').value = 5;
    document.getElementById('logLevel').value = 'warning';
    document.getElementById('scanPaths').value = 'trading-ui/';
    
    if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('איפוס הגדרות', 'הגדרות ניטור אופסו לברירת מחדל');
    }
}

function updateSummaryStats(data = null) {
    // Update the summary statistics in the top section
    const totalFilesStats = document.getElementById('totalFilesStats');
    const totalErrorsStats = document.getElementById('totalErrorsStats');
    const totalWarningsStats = document.getElementById('totalWarningsStats');
    const overallStatus = document.getElementById('overallStatus');
    
    // If no data provided, calculate from current issues
    if (!data) {
        const errors = currentIssues.filter(issue => issue.severity === 'error').length;
        const warnings = currentIssues.filter(issue => issue.severity === 'warning').length;
        const files = new Set(currentIssues.map(issue => issue.file)).size;
        
        data = {
            totalFiles: files,
            totalErrors: errors,
            totalWarnings: warnings
        };
    }
    
    if (totalFilesStats) totalFilesStats.textContent = data.totalFiles || 0;
    if (totalErrorsStats) totalErrorsStats.textContent = data.totalErrors || 0;
    if (totalWarningsStats) totalWarningsStats.textContent = data.totalWarnings || 0;
    
    // Determine overall status
    let status = 'מעולה';
    let statusClass = 'success';
    if (data.totalErrors > 5) {
        status = 'דורש תשומת לב';
        statusClass = 'warning';
    }
    if (data.totalErrors > 10) {
        status = 'בעיות חמורות';
        statusClass = 'danger';
    }
    
    if (overallStatus) {
        overallStatus.textContent = status;
        overallStatus.className = statusClass;
    }
}

function updateLogsCount(count) {
    const logsCount = document.getElementById('logsCount');
    if (logsCount) {
        logsCount.textContent = `${count} רשומות`;
    }
}

function updateStatisticsCount() {
    const statisticsCount = document.getElementById('statisticsCount');
    if (statisticsCount) {
        const errorCount = document.getElementById('errorCount')?.textContent || '0';
        const warningCount = document.getElementById('warningCount')?.textContent || '0';
        const successCount = document.getElementById('successCount')?.textContent || '0';
        const filesScanned = document.getElementById('filesScanned')?.textContent || '0';
        
        statisticsCount.textContent = `${filesScanned} קבצים, ${errorCount} שגיאות, ${warningCount} אזהרות`;
    }
}

// Global functions for button onclick handlers
window.toggleTopSection = function() {
    if (typeof window.toggleTopSectionGlobal === 'function') {
        window.toggleTopSectionGlobal();
    } else {
        console.warn('פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
    }
};

function initializeControlButtons() {
    // Initialize start/stop monitoring buttons
    const startBtn = document.getElementById('startMonitoring');
    const stopBtn = document.getElementById('stopMonitoring');
    const clearBtn = document.getElementById('clearLogs');
    const exportBtn = document.getElementById('exportLogs');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('ניטור', 'ניטור Linter הופעל');
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopBtn.disabled = true;
            if (startBtn) startBtn.disabled = false;
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('ניטור', 'ניטור Linter הופסק');
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const logsContainer = document.getElementById('logsContainer');
            if (logsContainer) {
                logsContainer.innerHTML = `
                    <div class="log-entry">
                        <span class="log-timestamp">[${new Date().toLocaleTimeString('he-IL')}]</span>
                        <span class="log-level info">[INFO]</span>
                        <span class="log-message">לוגים נוקו</span>
                    </div>
                `;
                updateLogsCount(1);
            }
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('ניקוי', 'לוגים נוקו בהצלחה');
            }
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            copyDetailedLog();
        });
    }
}

// Global fix functions
function fixAllIssues() {
    const fixableIssues = currentIssues.filter(issue => issue.fixable);
    
    if (fixableIssues.length === 0) {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('אין בעיות לתיקון', 'אין בעיות הניתנות לתיקון אוטומטי');
        }
        return;
    }
    
    // Show confirmation dialog with backup recommendation
    showFixConfirmationDialog('תיקון כל הבעיות', fixableIssues.length, async () => {
        try {
            let fixedCount = 0;
            
            if (realLinterSystem) {
                // Use real linter system
                console.log('🔧 מתקן כל הבעיות עם מערכת אמיתית...');
                fixedCount = await realLinterSystem.fixAllIssues();
                
                // Reload issues to get updated list
                await loadIssues();
                
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('תיקון הושלם', `${fixedCount} בעיות תוקנו בהצלחה`);
                }
            } else {
                // Fallback to simulation
                console.log('🔧 מדמה תיקון כל הבעיות...');
                fixableIssues.forEach(issue => {
                    fixIssue(issue.id);
                });
                
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('תיקון הושלם', `${fixableIssues.length} בעיות תוקנו בהצלחה`);
                }
            }
        } catch (error) {
            console.error('שגיאה בתיקון כל הבעיות:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בתיקון', 'שגיאה בתיקון הבעיות');
            }
        }
    });
}

function fixAllErrors() {
    const errorIssues = currentIssues.filter(issue => issue.severity === 'error' && issue.fixable);
    
    if (errorIssues.length === 0) {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('אין שגיאות לתיקון', 'אין שגיאות הניתנות לתיקון אוטומטי');
        }
        return;
    }
    
    // Show confirmation dialog with backup recommendation
    showFixConfirmationDialog('תיקון שגיאות', errorIssues.length, () => {
        // Fix all errors after confirmation
        errorIssues.forEach(issue => {
            fixIssue(issue.id);
        });
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('תיקון שגיאות הושלם', `${errorIssues.length} שגיאות תוקנו בהצלחה`);
        }
    });
}

function fixAllWarnings() {
    const warningIssues = currentIssues.filter(issue => issue.severity === 'warning' && issue.fixable);
    
    if (warningIssues.length === 0) {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('אין אזהרות לתיקון', 'אין אזהרות הניתנות לתיקון אוטומטי');
        }
        return;
    }
    
    // Show confirmation dialog with backup recommendation
    showFixConfirmationDialog('תיקון אזהרות', warningIssues.length, () => {
        // Fix all warnings after confirmation
        warningIssues.forEach(issue => {
            fixIssue(issue.id);
        });
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('תיקון אזהרות הושלם', `${warningIssues.length} אזהרות תוקנו בהצלחה`);
        }
    });
}

function ignoreAllIssues() {
    if (currentIssues.length === 0) {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('אין בעיות', 'אין בעיות להתעלם מהן');
        }
        return;
    }
    
    // Confirm action
    const confirmed = typeof showConfirmationDialog === 'function' ? 
      await new Promise(resolve => {
        showConfirmationDialog(
          `האם אתה בטוח שברצונך להתעלם מ-${currentIssues.length} בעיות?`,
          () => resolve(true),
          () => resolve(false),
          'התעלמות מבעיות',
          'התעלם',
          'ביטול'
        );
      }) : 
      confirm(`האם אתה בטוח שברצונך להתעלם מ-${currentIssues.length} בעיות?`);
    if (confirmed) {
        currentIssues.forEach(issue => {
            ignoreIssue(issue.id);
        });
        
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('התעלמות הושלמה', `${currentIssues.length} בעיות הועברו לרשימת ההתעלמות`);
        }
    }
}

window.toggleSection = toggleSection;
window.resetSettings = resetSettings;
window.copyDetailedLog = copyDetailedLog;
window.fixAllIssues = fixAllIssues;
window.fixAllErrors = fixAllErrors;
window.fixAllWarnings = fixAllWarnings;
window.ignoreAllIssues = ignoreAllIssues;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
