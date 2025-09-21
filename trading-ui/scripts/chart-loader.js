/**
 * Chart.js Dynamic Loader
 * =======================
 * 
 * Loads Chart.js library dynamically to avoid 404 map file errors
 * and provides fallback handling for failed loads.
 */

console.log('📊 Chart.js loader initialized');

// Function to load Chart.js dynamically
function loadChartJS() {
    // Check if Chart.js is already loaded
    if (typeof Chart !== 'undefined') {
        console.log('✅ Chart.js already loaded');
        return Promise.resolve();
    }
    
    console.log('📊 Loading Chart.js dynamically...');
    
    return new Promise((resolve, reject) => {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        
        chartScript.onload = function() {
            console.log('✅ Chart.js loaded successfully');
            resolve();
        };
        
        chartScript.onerror = function() {
            console.warn('⚠️ Chart.js failed to load - charts will be disabled');
            reject(new Error('Chart.js failed to load'));
        };
        
        document.head.appendChild(chartScript);
    });
}

// Auto-load Chart.js when this script is loaded
loadChartJS().catch(error => {
    console.warn('Chart.js loading failed:', error.message);
});

// Export function for manual loading if needed
window.loadChartJS = loadChartJS;
