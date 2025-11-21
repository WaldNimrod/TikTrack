/**
 * Debug script for active import session
 * Run this in browser console to diagnose active session issues
 */

window.debugActiveSession = function() {
    console.group('🔍 [DEBUG] Active Session Diagnostic');
    
    // 0. Check if modal is open
    const modal = document.getElementById('importUserDataModal');
    console.log('0️⃣ Modal Status:');
    console.log('  Modal element:', modal ? '✅ Found' : '❌ Not found');
    if (modal) {
        const isVisible = modal.classList.contains('show') || window.getComputedStyle(modal).display !== 'none';
        console.log('  Modal visible:', isVisible);
        console.log('  Modal has show class:', modal.classList.contains('show'));
    }
    
    // 1. Check session variables
    console.log('\n1️⃣ Session Variables:');
    console.log('  currentSessionId:', typeof currentSessionId !== 'undefined' ? currentSessionId : window.currentSessionId);
    console.log('  window.currentSessionId:', window.currentSessionId);
    console.log('  activeSessionInfo:', typeof activeSessionInfo !== 'undefined' ? activeSessionInfo : 'undefined');
    
    // 2. Check if session is active
    const activeInfo = typeof activeSessionInfo !== 'undefined' ? activeSessionInfo : null;
    if (typeof isSessionActive === 'function' && activeInfo) {
        const statusToCheck = activeInfo?.statusRaw || activeInfo?.status;
        const isActive = isSessionActive(statusToCheck);
        console.log('  Status to check:', statusToCheck);
        console.log('  Is session active?', isActive);
    } else {
        console.warn('  ⚠️ isSessionActive function not available or activeSessionInfo is null');
        if (typeof isSessionActive === 'function') {
            console.log('  isSessionActive function exists');
        } else {
            console.log('  isSessionActive function does NOT exist');
        }
    }
    
    // 3. Check DOM elements
    console.log('\n2️⃣ DOM Elements:');
    const indicator = document.getElementById('activeSessionIndicator');
    const controlsRow = document.getElementById('activeSessionControlsRow');
    const detailsRow = document.getElementById('activeSessionDetailsRow');
    const resumeButton = document.getElementById('resumeImportSessionBtn');
    const resetButton = document.getElementById('resetImportSessionBtn');
    const analyzeButton = document.getElementById('analyzeBtn');
    
    console.log('  activeSessionIndicator:', indicator ? '✅ Found' : '❌ Not found');
    if (indicator) {
        console.log('    - display style:', window.getComputedStyle(indicator).display);
        console.log('    - has d-none:', indicator.classList.contains('d-none'));
        console.log('    - data-has-session:', indicator.getAttribute('data-has-session'));
    }
    
    console.log('  activeSessionControlsRow:', controlsRow ? '✅ Found' : '❌ Not found');
    if (controlsRow) {
        console.log('    - display style:', window.getComputedStyle(controlsRow).display);
        console.log('    - has d-none:', controlsRow.classList.contains('d-none'));
    }
    
    console.log('  activeSessionDetailsRow:', detailsRow ? '✅ Found' : '❌ Not found');
    if (detailsRow) {
        console.log('    - display style:', window.getComputedStyle(detailsRow).display);
        console.log('    - has d-none:', detailsRow.classList.contains('d-none'));
    }
    
    console.log('  resumeImportSessionBtn:', resumeButton ? '✅ Found' : '❌ Not found');
    if (resumeButton) {
        console.log('    - display style:', window.getComputedStyle(resumeButton).display);
        console.log('    - has d-none:', resumeButton.classList.contains('d-none'));
        console.log('    - disabled:', resumeButton.disabled);
    }
    
    console.log('  resetImportSessionBtn:', resetButton ? '✅ Found' : '❌ Not found');
    if (resetButton) {
        console.log('    - display style:', window.getComputedStyle(resetButton).display);
        console.log('    - has d-none:', resetButton.classList.contains('d-none'));
        console.log('    - disabled:', resetButton.disabled);
    }
    
    console.log('  analyzeBtn:', analyzeButton ? '✅ Found' : '❌ Not found');
    if (analyzeButton) {
        console.log('    - disabled:', analyzeButton.disabled);
        console.log('    - aria-disabled:', analyzeButton.getAttribute('aria-disabled'));
    }
    
    // 4. Check session data values
    console.log('\n3️⃣ Session Data Values:');
    if (indicator) {
        const sessionIdEl = document.getElementById('activeSessionIdValue');
        const statusEl = document.getElementById('activeSessionStatusValue');
        const fileEl = document.getElementById('activeSessionFileValue');
        const accountEl = document.getElementById('activeSessionAccountValue');
        
        console.log('  Session ID value:', sessionIdEl?.textContent || 'N/A');
        console.log('  Status value:', statusEl?.textContent || 'N/A');
        console.log('  File value:', fileEl?.textContent || 'N/A');
        console.log('  Account value:', accountEl?.textContent || 'N/A');
    }
    
    // 5. Try to fetch latest session
    console.log('\n4️⃣ Fetching Latest Active Session from API...');
    fetch('/api/user-data-import/sessions/active')
        .then(response => response.json())
        .then(data => {
            console.log('  API Response:', data);
            if (data.session) {
                console.log('  ✅ Active session found:', {
                    id: data.session.id,
                    status: data.session.status,
                    file_name: data.session.file_name,
                    trading_account_id: data.session.trading_account_id
                });
            } else {
                console.log('  ❌ No active session in API response');
            }
        })
        .catch(error => {
            console.error('  ❌ Error fetching session:', error);
        });
    
    // 6. Check localStorage
    console.log('\n5️⃣ LocalStorage:');
    try {
        const stored = localStorage.getItem('activeImportSession');
        if (stored) {
            const parsed = JSON.parse(stored);
            console.log('  ✅ Stored session:', parsed);
        } else {
            console.log('  ❌ No stored session');
        }
    } catch (error) {
        console.error('  ❌ Error reading localStorage:', error);
    }
    
    // 7. Test update functions
    console.log('\n6️⃣ Testing Update Functions:');
    if (typeof updateActiveSessionIndicator === 'function') {
        console.log('  ✅ updateActiveSessionIndicator exists');
        console.log('  🔄 Calling updateActiveSessionIndicator()...');
        try {
            updateActiveSessionIndicator();
            console.log('  ✅ Function called successfully');
        } catch (error) {
            console.error('  ❌ Error calling function:', error);
        }
    } else {
        console.warn('  ❌ updateActiveSessionIndicator function not available');
    }
    
    if (typeof updateResetSessionButtonState === 'function') {
        console.log('  ✅ updateResetSessionButtonState exists');
        console.log('  🔄 Calling updateResetSessionButtonState()...');
        try {
            updateResetSessionButtonState();
            console.log('  ✅ Function called successfully');
        } catch (error) {
            console.error('  ❌ Error calling function:', error);
        }
    } else {
        console.warn('  ❌ updateResetSessionButtonState function not available');
    }
    
    if (typeof updateAnalyzeButton === 'function') {
        console.log('  ✅ updateAnalyzeButton exists');
        console.log('  🔄 Calling updateAnalyzeButton()...');
        try {
            updateAnalyzeButton();
            console.log('  ✅ Function called successfully');
        } catch (error) {
            console.error('  ❌ Error calling function:', error);
        }
    } else {
        console.warn('  ❌ updateAnalyzeButton function not available');
    }
    
    // 8. Manual fix attempt
    console.log('\n7️⃣ Manual Fix Attempt:');
    console.log('  Run: window.fixActiveSessionDisplay() to try manual fix');
    
    console.groupEnd();
    
    return {
        currentSessionId: typeof currentSessionId !== 'undefined' ? currentSessionId : window.currentSessionId,
        activeSessionInfo: typeof activeSessionInfo !== 'undefined' ? activeSessionInfo : null,
        indicator: indicator,
        controlsRow: controlsRow,
        detailsRow: detailsRow,
        resumeButton: resumeButton,
        resetButton: resetButton,
        analyzeButton: analyzeButton,
        modal: modal
    };
};

window.fixActiveSessionDisplay = async function() {
    console.group('🔧 [FIX] Attempting to fix active session display');
    
    // 1. Fetch latest session
    console.log('1️⃣ Fetching latest active session...');
    try {
        const response = await fetch('/api/user-data-import/sessions/active');
        const data = await response.json();
        
        if (data.session) {
            console.log('  ✅ Session found:', data.session.id);
            
            // Update variables
            if (typeof currentSessionId !== 'undefined') {
                currentSessionId = data.session.id;
                window.currentSessionId = data.session.id;
            }
            
            if (typeof activeSessionInfo !== 'undefined') {
                activeSessionInfo = {
                    sessionId: data.session.id,
                    fileName: data.session.file_name,
                    accountId: data.session.trading_account_id,
                    provider: data.session.provider,
                    status: data.session.status,
                    statusRaw: data.session.status,
                    totalRecords: data.session.total_records || 0,
                    readyRecords: data.session.imported_records || 0,
                    skipRecords: data.session.skipped_records || 0
                };
            } else {
                // Try to set it on window if local variable doesn't exist
                window.activeSessionInfo = {
                    sessionId: data.session.id,
                    fileName: data.session.file_name,
                    accountId: data.session.trading_account_id,
                    provider: data.session.provider,
                    status: data.session.status,
                    statusRaw: data.session.status,
                    totalRecords: data.session.total_records || 0,
                    readyRecords: data.session.imported_records || 0,
                    skipRecords: data.session.skipped_records || 0
                };
            }
            
            // Call update functions
            if (typeof updateActiveSessionIndicator === 'function') {
                console.log('  🔄 Calling updateActiveSessionIndicator()...');
                updateActiveSessionIndicator();
            }
            
            if (typeof updateResetSessionButtonState === 'function') {
                console.log('  🔄 Calling updateResetSessionButtonState()...');
                updateResetSessionButtonState();
            }
            
            if (typeof updateAnalyzeButton === 'function') {
                console.log('  🔄 Calling updateAnalyzeButton()...');
                updateAnalyzeButton();
            }
            
            console.log('  ✅ Fix attempt completed');
        } else {
            console.log('  ❌ No active session found');
        }
    } catch (error) {
        console.error('  ❌ Error:', error);
    }
    
    console.groupEnd();
};

console.log('✅ Debug functions loaded!');
console.log('📋 Run: debugActiveSession() to diagnose');
console.log('🔧 Run: fixActiveSessionDisplay() to attempt fix');

