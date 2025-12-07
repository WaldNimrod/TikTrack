/**
 * Comprehensive Actions Menu Debug Tool
 * 
 * This script provides detailed debugging capabilities for the actions menu popup
 * clipping/hiding issues in tables.
 */

// Global debug results container
window.debugResults = [];

// Helper function to add results to both console and UI
function addDebugResult(title, data, type = 'info') {
    const result = {
        timestamp: new Date().toLocaleTimeString(),
        title,
        data,
        type
    };
    
    debugResults.push(result);
    
    // Log to console
    console.log(`\n=== ${title} ===`, data);
    
    // Add to UI if available
    const resultsContainer = document.getElementById('debug-results');
    if (resultsContainer) {
        const indicatorClass = type === 'error' ? 'status-fail' : 
                              type === 'success' ? 'status-pass' : 'status-warning';
        
        const html = `
            <div class="debug-section">
                <h6><span class="status-indicator ${indicatorClass}"></span>${title} <small>(${result.timestamp})</small></h6>
                <pre style="background: white; padding: 10px; border-radius: 4px; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;
        
        if (resultsContainer.textContent.includes('בחר בדיקה')) {
            resultsContainer.textContent = '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            doc.body.childNodes.forEach(node => {
                resultsContainer.appendChild(node.cloneNode(true));
            });
        } else {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            doc.body.childNodes.forEach(node => {
                resultsContainer.appendChild(node.cloneNode(true));
            });
        }
    }
}

// Test A: DOM Structure Analysis
function testDOMStructure() {
    addDebugResult('בדיקת מבנה DOM - התחלה', 'מתחיל בדיקת מבנה DOM');
    
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    
    if (allWrappers.length === 0) {
        addDebugResult('בדיקת מבנה DOM - שגיאה', 'לא נמצאו actions-menu-wrapper אלמנטים', 'error');
        return;
    }
    
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        const actionsCell = wrapper.closest('.actions-cell');
        const tableRow = wrapper.closest('tr');
        const table = wrapper.closest('table');
        
        if (!popup || !actionsCell || !tableRow) return;
        
        // Parent chain analysis
        const parentChain = [];
        let current = popup;
        while (current && current !== document.body && parentChain.length < 15) {
            const style = window.getComputedStyle(current);
            parentChain.push({
                tag: current.tagName,
                id: current.id || 'no-id',
                classes: current.className,
                overflow: style.overflow,
                position: style.position,
                zIndex: style.zIndex
            });
            current = current.parentElement;
        }
        
        addDebugResult(`מבנה DOM - Actions Menu ${index + 1}`, {
            wrapperExists: !!wrapper,
            popupExists: !!popup,
            actionsCellExists: !!actionsCell,
            tableRowExists: !!tableRow,
            parentChain: parentChain.slice(0, 8)
        });
    });
}

// Test B: Overflow Detection
function testOverflowParents() {
    addDebugResult('בדיקת Overflow בשרשרת ההורים - התחלה', 'מתחיל בדיקת אלמנטים עם overflow בעייתי');
    
    const allPopups = document.querySelectorAll('.actions-menu-popup');
    
    if (allPopups.length === 0) {
        addDebugResult('בדיקת Overflow - שגיאה', 'לא נמצאו popup אלמנטים', 'error');
        return;
    }
    
    allPopups.forEach((popup, index) => {
        const overflowElements = [];
        let current = popup;
        
        while (current && current !== document.body && overflowElements.length < 15) {
            const style = window.getComputedStyle(current);
            const overflow = style.overflow;
            const overflowX = style.overflowX;
            const overflowY = style.overflowY;
            
            if (overflow === 'hidden' || overflowX === 'hidden' || overflowY === 'hidden' ||
                overflow === 'auto' || overflowX === 'auto' || overflowY === 'auto') {
                
                const rect = current.getBoundingClientRect();
                const popupRect = popup.getBoundingClientRect();
                
                // בדוק אם הפופאפ נחתך על ידי האלמנט
                const isClipping = (
                    (overflow === 'hidden' || overflowX === 'hidden' || overflowY === 'hidden') &&
                    (popupRect.left < rect.left || popupRect.right > rect.right ||
                     popupRect.top < rect.top || popupRect.bottom > rect.bottom)
                );
                
                overflowElements.push({
                    element: current.tagName,
                    classes: current.className,
                    overflow: overflow,
                    overflowX: overflowX,
                    overflowY: overflowY,
                    isClipping: isClipping
                });
            }
            
            current = current.parentElement;
        }
        
        addDebugResult(`Overflow Analysis - Popup ${index + 1}`, {
            overflowElements: overflowElements,
            clippingElements: overflowElements.filter(el => el.isClipping)
        });
    });
}

// Test C: Position and Visibility
function testPositioning() {
    addDebugResult('בדיקת מיקום ונראות - התחלה', 'מתחיל בדיקת מיקום ונראות');
    
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    
    if (allWrappers.length === 0) {
        addDebugResult('בדיקת מיקום - שגיאה', 'לא נמצאו actions-menu-wrapper אלמנטים', 'error');
        return;
    }
    
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        const actionsCell = wrapper.closest('.actions-cell');
        const tableRow = wrapper.closest('tr');
        
        if (!popup || !actionsCell || !tableRow) return;
        
        const popupRect = popup.getBoundingClientRect();
        const cellRect = actionsCell.getBoundingClientRect();
        const rowRect = tableRow.getBoundingClientRect();
        
        const popupStyle = window.getComputedStyle(popup);
        
        addDebugResult(`מיקום ונראות - Actions Menu ${index + 1}`, {
            popup: {
                position: popupStyle.position,
                zIndex: popupStyle.zIndex,
                opacity: popupStyle.opacity,
                visibility: popupStyle.visibility,
                transform: popupStyle.transform,
                bounds: {
                    left: popupRect.left,
                    right: popupRect.right,
                    top: popupRect.top,
                    bottom: popupRect.bottom,
                    width: popupRect.width,
                    height: popupRect.height
                }
            },
            isVisible: popupRect.width > 0 && popupRect.height > 0,
            isInViewport: popupRect.top >= 0 && popupRect.left >= 0
        });
    });
}

// Run all tests
function runAllTests() {
    clearResults();
    addDebugResult('התחלת בדיקות מקיפות', `התאריך: ${new Date().toLocaleString()}`, 'success');
    
    try {
        testDOMStructure();
        testOverflowParents();
        testPositioning();
        
        addDebugResult('סיום בדיקות מקיפות', `הושלמו ${debugResults.length - 1} בדיקות`, 'success');
    } catch (error) {
        addDebugResult('שגיאה בכלי הבדיקה', error.message, 'error');
    }
}

// Clear results
function clearResults() {
    debugResults = [];
    const resultsContainer = document.getElementById('debug-results');
    if (resultsContainer) {
        resultsContainer.textContent = '';
        const p = document.createElement('p');
        p.className = 'text-muted';
        p.textContent = 'בחר בדיקה מהכפתורים למעלה כדי להתחיל';
        resultsContainer.appendChild(p);
    }
}

// Initialize debug tools when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Actions Menu Debug Tool loaded and ready');
    
    // Make functions globally available
    window.testDOMStructure = testDOMStructure;
    window.testOverflowParents = testOverflowParents;
    window.testPositioning = testPositioning;
    window.runAllTests = runAllTests;
    window.clearResults = clearResults;
});