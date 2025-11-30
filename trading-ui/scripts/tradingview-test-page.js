/**
 * TradingView Test Page - TradingView Lightweight Charts testing page
 * 
 * This file handles the TradingView test page functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */

(function() {
    'use strict';
    
    const tests = {
        library: {
            name: 'Library Loading',
            run: function() {
                const status = document.getElementById('library-status');
                const info = document.getElementById('library-info');
                
                try {
                    // Check for LightweightCharts
                    const hasLightweightCharts = typeof window.LightweightCharts !== 'undefined';
                    const hasLightweightChartsLower = typeof window.lightweightCharts !== 'undefined';
                    
                    if (hasLightweightCharts || hasLightweightChartsLower) {
                        const lib = window.LightweightCharts || window.lightweightCharts;
                        const version = lib?.version ? lib.version() : 'unknown';
                        
                        status.className = 'test-status success';
                        status.textContent = '✅ הספרייה נטענה בהצלחה';
                        
                        info.style.display = 'block';
                        info.textContent = '';
                        const infoHTML = `
                            <strong>Global Name:</strong> ${hasLightweightCharts ? 'window.LightweightCharts' : 'window.lightweightCharts'}<br>
                            <strong>Version:</strong> ${version}<br>
                            <strong>createChart:</strong> ${typeof lib?.createChart === 'function' ? '✅' : '❌'}<br>
                            <strong>LineSeries:</strong> ${lib?.LineSeries ? '✅' : '❌'}
                        `;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = infoHTML;
                        while (tempDiv.firstChild) {
                            info.appendChild(tempDiv.firstChild);
                        }
                        
                        return true;
                    } else {
                        status.className = 'test-status error';
                        status.textContent = '❌ הספרייה לא נטענה';
                        return false;
                    }
                } catch (error) {
                    status.className = 'test-status error';
                    status.textContent = `❌ שגיאה: ${error.message}`;
                    info.style.display = 'block';
                    info.textContent = error.stack;
                    return false;
                }
            }
        },
        
        theme: {
            name: 'Theme System',
            run: function() {
                const status = document.getElementById('theme-status');
                const info = document.getElementById('theme-info');
                
                try {
                    if (typeof window.TradingViewTheme === 'undefined') {
                        status.className = 'test-status error';
                        status.textContent = '❌ מערכת Theme לא נטענה';
                        return false;
                    }
                    
                    const theme = window.TradingViewTheme;
                    const themeOptions = theme.getThemeOptions();
                    const colors = theme.getChartColors();
                    
                    status.className = 'test-status success';
                    status.textContent = '✅ מערכת Theme עובדת';
                    
                    info.style.display = 'block';
                    const infoHTML = `
                        <strong>Theme Options:</strong> ${JSON.stringify(themeOptions, null, 2).substring(0, 200)}...<br>
                        <strong>Colors:</strong> ${JSON.stringify(colors, null, 2)}
                    `;
                    info.textContent = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = infoHTML;
                    while (tempDiv.firstChild) {
                        info.appendChild(tempDiv.firstChild);
                    }
                    
                    return true;
                } catch (error) {
                    status.className = 'test-status error';
                    status.textContent = `❌ שגיאה: ${error.message}`;
                    info.style.display = 'block';
                    info.textContent = error.stack;
                    return false;
                }
            }
        },
        
        adapter: {
            name: 'Adapter System',
            run: function() {
                const status = document.getElementById('adapter-status');
                const info = document.getElementById('adapter-info');
                
                try {
                    if (typeof window.TradingViewChartAdapter === 'undefined') {
                        status.className = 'test-status error';
                        status.textContent = '❌ מערכת Adapter לא נטענה';
                        return false;
                    }
                    
                    const adapter = window.TradingViewChartAdapter;
                    
                    status.className = 'test-status success';
                    status.textContent = '✅ מערכת Adapter עובדת';
                    
                    info.style.display = 'block';
                    const infoHTML = `
                        <strong>Methods:</strong><br>
                        - createChart: ${typeof adapter.createChart === 'function' ? '✅' : '❌'}<br>
                        - addLineSeries: ${typeof adapter.addLineSeries === 'function' ? '✅' : '❌'}<br>
                        - addAreaSeries: ${typeof adapter.addAreaSeries === 'function' ? '✅' : '❌'}<br>
                        - addCandlestickSeries: ${typeof adapter.addCandlestickSeries === 'function' ? '✅' : '❌'}<br>
                        - destroyChart: ${typeof adapter.destroyChart === 'function' ? '✅' : '❌'}<br>
                        - applyTheme: ${typeof adapter.applyTheme === 'function' ? '✅' : '❌'}
                    `;
                    info.textContent = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = infoHTML;
                    while (tempDiv.firstChild) {
                        info.appendChild(tempDiv.firstChild);
                    }
                    
                    return true;
                } catch (error) {
                    status.className = 'test-status error';
                    status.textContent = `❌ שגיאה: ${error.message}`;
                    info.style.display = 'block';
                    info.textContent = error.stack;
                    return false;
                }
            }
        },
        
        basicChart: {
            name: 'Basic Chart',
            run: function() {
                const status = document.getElementById('basic-chart-status');
                const container = document.getElementById('basic-chart-container');
                
                return new Promise((resolve) => {
                    // Use requestAnimationFrame instead of setTimeout
                    requestAnimationFrame(() => {
                        try {
                            // Clear container first
                            container.innerHTML = '';
                            
                            // Quick checks
                            if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
                                status.className = 'test-status error';
                                status.textContent = '❌ הספרייה לא נטענה - לא ניתן ליצור גרף';
                                resolve(false);
                                return;
                            }
                            
                            if (typeof window.TradingViewChartAdapter === 'undefined') {
                                status.className = 'test-status error';
                                status.textContent = '❌ מערכת Adapter לא עובדת - לא ניתן ליצור גרף';
                                resolve(false);
                                return;
                            }
                            
                            // Check dimensions with ResizeObserver or immediate check
                            if (container.clientWidth === 0 || container.clientHeight === 0) {
                                // Wait for next frame if dimensions not ready
                                requestAnimationFrame(() => {
                                    createChart();
                                });
                            } else {
                                createChart();
                            }
                            
                            function createChart() {
                                try {
                                    // Get wrapper for width calculation (if exists)
                                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                                    const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || 600);
                                    const containerHeight = container.clientHeight || 400;
                                    
                                    const chart = window.TradingViewChartAdapter.createChart(container, {
                                        width: containerWidth,
                                        height: containerHeight,
                                    });
                                    
                                    // Remove loading indicator
                                    const loading = container.querySelector('.chart-loading');
                                    if (loading) loading.remove();
                                    
                                    if (!chart || typeof chart.addSeries !== 'function') {
                                        status.className = 'test-status error';
                                        status.textContent = `❌ הגרף לא נוצר נכון - חסר addSeries`;
                                        if (window.Logger) {
                                            window.Logger.error('Chart object', { page: 'tradingview-test-page', chart, methods: chart ? Object.getOwnPropertyNames(chart) : 'null' });
                                        }
                                        resolve(false);
                                        return;
                                    }
                                    
                                    // Add series and data
                                    const lineSeries = window.TradingViewChartAdapter.addLineSeries(chart, {
                                        color: '#26baac',
                                        lineWidth: 2,
                                    });
                                    
                                    const sampleData = [
                                        { time: '2025-01-01', value: 100 },
                                        { time: '2025-01-02', value: 105 },
                                        { time: '2025-01-03', value: 110 },
                                        { time: '2025-01-04', value: 108 },
                                        { time: '2025-01-05', value: 115 },
                                        { time: '2025-01-06', value: 120 },
                                        { time: '2025-01-07', value: 118 },
                                    ];
                                    
                                    lineSeries.setData(sampleData);
                                    
                                    status.className = 'test-status success';
                                    status.textContent = '✅ גרף בסיסי נוצר בהצלחה עם נתונים';
                                    resolve(true);
                                } catch (error) {
                                    status.className = 'test-status error';
                                    status.textContent = `❌ שגיאה: ${error.message}`;
                                    if (window.Logger) {
                                        window.Logger.error('Basic Chart Error', { page: 'tradingview-test-page', error });
                                    }
                                    resolve(false);
                                }
                            }
                        } catch (error) {
                            status.className = 'test-status error';
                            status.textContent = `❌ שגיאה: ${error.message}`;
                            if (window.Logger) {
                                window.Logger.error('Basic Chart Error', { page: 'tradingview-test-page', error });
                            }
                            resolve(false);
                        }
                    });
                });
            }
        },
        
        lineSeries: {
            name: 'Line Series',
            run: function() {
                const status = document.getElementById('line-series-status');
                const container = document.getElementById('line-series-container');
                
                return new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        try {
                            container.innerHTML = '';
                            
                            if (container.clientWidth === 0 || container.clientHeight === 0) {
                                requestAnimationFrame(() => {
                                    createChart();
                                });
                            } else {
                                createChart();
                            }
                            
                            function createChart() {
                                try {
                                    // Get wrapper for width calculation (if exists)
                                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                                    const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || 600);
                                    const containerHeight = container.clientHeight || 400;
                                    
                                    const chart = window.TradingViewChartAdapter.createChart(container, {
                                        width: containerWidth,
                                        height: containerHeight,
                                    });
                                    
                                    // Remove loading indicator
                                    const loading = container.querySelector('.chart-loading');
                                    if (loading) loading.remove();
                                    
                                    const lineSeries = window.TradingViewChartAdapter.addLineSeries(chart);
                                    
                                    const data = [
                                        { time: '2025-01-01', value: 100 },
                                        { time: '2025-01-02', value: 105 },
                                        { time: '2025-01-03', value: 110 },
                                        { time: '2025-01-04', value: 108 },
                                        { time: '2025-01-05', value: 115 },
                                    ];
                                    
                                    lineSeries.setData(data);
                                    
                                    status.className = 'test-status success';
                                    status.textContent = '✅ Line Series נוצר בהצלחה';
                                    resolve(true);
                                } catch (error) {
                                    status.className = 'test-status error';
                                    status.textContent = `❌ שגיאה: ${error.message}`;
                                    if (window.Logger) {
                                        window.Logger.error('Line Series Error', { page: 'tradingview-test-page', error });
                                    }
                                    resolve(false);
                                }
                            }
                        } catch (error) {
                            status.className = 'test-status error';
                            status.textContent = `❌ שגיאה: ${error.message}`;
                            if (window.Logger) {
                                window.Logger.error('Line Series Error', { page: 'tradingview-test-page', error });
                            }
                            resolve(false);
                        }
                    });
                });
            }
        },
        
        steppedLine: {
            name: 'Stepped Line',
            run: function() {
                const status = document.getElementById('stepped-line-status');
                const container = document.getElementById('stepped-line-container');
                
                return new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        try {
                            container.innerHTML = '';
                            
                            if (container.clientWidth === 0 || container.clientHeight === 0) {
                                requestAnimationFrame(() => {
                                    createChart();
                                });
                            } else {
                                createChart();
                            }
                            
                            function createChart() {
                                try {
                                    // Get wrapper for width calculation (if exists)
                                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                                    const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || 600);
                                    const containerHeight = container.clientHeight || 400;
                                    
                                    const chart = window.TradingViewChartAdapter.createChart(container, {
                                        width: containerWidth,
                                        height: containerHeight,
                                    });
                                    
                                    // Remove loading indicator
                                    const loading = container.querySelector('.chart-loading');
                                    if (loading) loading.remove();
                                    
                                    const lineSeries = window.TradingViewChartAdapter.addLineSeries(chart, {
                                        lineType: 1, // Stepped
                                        color: '#26baac',
                                    });
                                    
                                    const data = [
                                        { time: '2025-01-01', value: 100 },
                                        { time: '2025-01-02', value: 150 },
                                        { time: '2025-01-03', value: 120 },
                                        { time: '2025-01-04', value: 180 },
                                        { time: '2025-01-05', value: 160 },
                                    ];
                                    
                                    lineSeries.setData(data);
                                    
                                    status.className = 'test-status success';
                                    status.textContent = '✅ Stepped Line נוצר בהצלחה';
                                    resolve(true);
                                } catch (error) {
                                    status.className = 'test-status error';
                                    status.textContent = `❌ שגיאה: ${error.message}`;
                                    if (window.Logger) {
                                        window.Logger.error('Stepped Line Error', { page: 'tradingview-test-page', error });
                                    }
                                    resolve(false);
                                }
                            }
                        } catch (error) {
                            status.className = 'test-status error';
                            status.textContent = `❌ שגיאה: ${error.message}`;
                            if (window.Logger) {
                                window.Logger.error('Stepped Line Error', { page: 'tradingview-test-page', error });
                            }
                            resolve(false);
                        }
                    });
                });
            }
        },
        
        dualAxes: {
            name: 'Dual Y-Axes',
            run: function() {
                const status = document.getElementById('dual-axes-status');
                const container = document.getElementById('dual-axes-container');
                
                return new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        try {
                            container.innerHTML = '';
                            
                            if (container.clientWidth === 0 || container.clientHeight === 0) {
                                requestAnimationFrame(() => {
                                    createChart();
                                });
                            } else {
                                createChart();
                            }
                            
                            function createChart() {
                                try {
                                    // Get wrapper for width calculation (if exists)
                                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                                    const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || 600);
                                    const containerHeight = container.clientHeight || 400;
                                    
                                    const chart = window.TradingViewChartAdapter.createChart(container, {
                                        width: containerWidth,
                                        height: containerHeight,
                                    });
                                    
                                    // Remove loading indicator
                                    const loading = container.querySelector('.chart-loading');
                                    if (loading) loading.remove();
                                    
                                    // Position Size - Left Scale
                                    const positionSizeSeries = window.TradingViewChartAdapter.addLineSeries(chart, {
                                        priceScaleId: 'left',
                                        color: '#6c757d',
                                        lineType: 1, // Stepped
                                    });
                                    
                                    // P/L - Right Scale
                                    const plSeries = window.TradingViewChartAdapter.addLineSeries(chart, {
                                        priceScaleId: 'right',
                                        color: '#26baac',
                                        lineType: 0, // Normal
                                    });
                                    
                                    // Sample data
                                    positionSizeSeries.setData([
                                        { time: '2025-01-01', value: 100 },
                                        { time: '2025-01-02', value: 150 },
                                        { time: '2025-01-03', value: 120 },
                                    ]);
                                    
                                    plSeries.setData([
                                        { time: '2025-01-01', value: 0 },
                                        { time: '2025-01-02', value: 500 },
                                        { time: '2025-01-03', value: 300 },
                                    ]);
                                    
                                    status.className = 'test-status success';
                                    status.textContent = '✅ Dual Y-Axes נוצר בהצלחה';
                                    resolve(true);
                                } catch (error) {
                                    status.className = 'test-status error';
                                    status.textContent = `❌ שגיאה: ${error.message}`;
                                    if (window.Logger) {
                                        window.Logger.error('Dual Y-Axes Error', { page: 'tradingview-test-page', error });
                                    }
                                    resolve(false);
                                }
                            }
                        } catch (error) {
                            status.className = 'test-status error';
                            status.textContent = `❌ שגיאה: ${error.message}`;
                            if (window.Logger) {
                                window.Logger.error('Dual Y-Axes Error', { page: 'tradingview-test-page', error });
                            }
                            resolve(false);
                        }
                    });
                });
            }
        },
        
        colors: {
            name: 'Colors Integration',
            run: function() {
                const status = document.getElementById('colors-status');
                const info = document.getElementById('colors-info');
                
                try {
                    if (typeof window.TradingViewTheme === 'undefined') {
                        status.className = 'test-status error';
                        status.textContent = '❌ מערכת Theme לא נטענה';
                        return false;
                    }
                    
                    const theme = window.TradingViewTheme;
                    const colors = theme.getChartColors();
                    
                    // Test CSS variable reading
                    const primaryColor = theme.getSeriesColor('primary');
                    const successColor = theme.getSeriesColor('success');
                    
                    status.className = 'test-status success';
                    status.textContent = '✅ אינטגרציה עם צבעים עובדת';
                    
                    info.style.display = 'block';
                    const infoHTML = `
                        <strong>Primary Color:</strong> ${primaryColor}<br>
                        <strong>Success Color:</strong> ${successColor}<br>
                        <strong>All Colors:</strong> ${JSON.stringify(colors, null, 2)}
                    `;
                    info.textContent = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = infoHTML;
                    while (tempDiv.firstChild) {
                        info.appendChild(tempDiv.firstChild);
                    }
                    
                    return true;
                } catch (error) {
                    status.className = 'test-status error';
                    status.textContent = `❌ שגיאה: ${error.message}`;
                    info.style.display = 'block';
                    info.textContent = error.stack;
                    return false;
                }
            }
        },
        
        preferences: {
            name: 'Preferences Integration',
            run: function() {
                const status = document.getElementById('preferences-status');
                const info = document.getElementById('preferences-info');
                
                try {
                    if (typeof window.TradingViewTheme === 'undefined') {
                        status.className = 'test-status error';
                        status.textContent = '❌ מערכת Theme לא נטענה';
                        return false;
                    }
                    
                    const theme = window.TradingViewTheme;
                    
                    // Check if preferences are loaded
                    const hasPreferences = theme.preferences !== null;
                    
                    status.className = hasPreferences ? 'test-status success' : 'test-status warning';
                    status.textContent = hasPreferences 
                        ? '✅ אינטגרציה עם העדפות עובדת' 
                        : '⚠️ העדפות לא נטענו (אולי PreferencesData לא זמין)';
                    
                    info.style.display = 'block';
                    const infoHTML = `
                        <strong>Preferences Loaded:</strong> ${hasPreferences ? '✅' : '❌'}<br>
                        <strong>PreferencesData Available:</strong> ${typeof window.PreferencesData !== 'undefined' ? '✅' : '❌'}<br>
                        <strong>Preferences:</strong> ${JSON.stringify(theme.preferences, null, 2)}
                    `;
                    info.textContent = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = infoHTML;
                    while (tempDiv.firstChild) {
                        info.appendChild(tempDiv.firstChild);
                    }
                    
                    return hasPreferences;
                } catch (error) {
                    status.className = 'test-status error';
                    status.textContent = `❌ שגיאה: ${error.message}`;
                    info.style.display = 'block';
                    info.textContent = error.stack;
                    return false;
                }
            }
        },
        
        rtl: {
            name: 'RTL Support',
            run: function() {
                const status = document.getElementById('rtl-status');
                const info = document.getElementById('rtl-info');
                
                try {
                    // Check document direction
                    const isRTL = document.documentElement.dir === 'rtl';
                    
                    // Check if charts are created (they should work LTR)
                    const testContainer = document.createElement('div');
                    testContainer.style.width = '100px';
                    testContainer.style.height = '100px';
                    document.body.appendChild(testContainer);
                    
                    let chartCreated = false;
                    try {
                        const chart = window.TradingViewChartAdapter.createChart(testContainer);
                        chartCreated = true;
                        window.TradingViewChartAdapter.destroyChart(chart);
                    } catch (e) {
                        // Ignore
                    }
                    
                    document.body.removeChild(testContainer);
                    
                    status.className = 'test-status success';
                    status.textContent = '✅ תמיכה ב-RTL נבדקה';
                    
                    info.style.display = 'block';
                    const infoHTML = `
                        <strong>Document Direction:</strong> ${isRTL ? 'RTL ✅' : 'LTR'}<br>
                        <strong>Chart Creation:</strong> ${chartCreated ? '✅' : '❌'}<br>
                        <strong>Note:</strong> הגרפים תמיד משמאל לימין - זה בסדר. רק טקסט צריך להיות RTL.
                    `;
                    info.textContent = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = infoHTML;
                    while (tempDiv.firstChild) {
                        info.appendChild(tempDiv.firstChild);
                    }
                    
                    return true;
                } catch (error) {
                    status.className = 'test-status error';
                    status.textContent = `❌ שגיאה: ${error.message}`;
                    info.style.display = 'block';
                    info.textContent = error.stack;
                    return false;
                }
            }
        }
    };
    
    // Store test results for log copying (must be defined before runAllTests)
    const testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        tests: {},
        consoleLogs: [],
        errors: [],
        startTime: new Date(),
        endTime: null
    };
    
    // Element ID mapping for tests (used in runAllTests)
    const elementIdMap = {
        'library': 'library',
        'theme': 'theme',
        'adapter': 'adapter',
        'basicChart': 'basic-chart',
        'lineSeries': 'line-series',
        'steppedLine': 'stepped-line',
        'dualYAxes': 'dual-axes',
        'colors': 'colors',
        'preferences': 'preferences',
        'rtl': 'rtl'
    };
    
    // Run single test helper
    async function runSingleTest(testKey, test) {
        const statusEl = document.getElementById(`${elementIdMap[testKey] || testKey}-status`);
        const infoEl = document.getElementById(`${elementIdMap[testKey] || testKey}-info`);
        
        let testResult = {
            name: test.name,
            status: 'pending',
            message: '',
            info: '',
            error: null
        };
        
        try {
            window.Logger?.debug(`Running test: ${test.name}`);
            let result = test.run();
            
            // Wait only for async operations (if test returns Promise)
            // Capture the resolved value from the Promise
            if (result instanceof Promise) {
                result = await result;
            }
            
            // Small delay for DOM updates (only if needed)
            await new Promise(r => requestAnimationFrame(r));
            
            // Use the actual result value (not the Promise object) to determine test outcome
            const testPassed = result ? true : false;
            
            if (testPassed) {
                testResults.passed++;
            } else {
                testResults.failed++;
            }
            
            // Update from DOM (if available, otherwise use result)
            if (statusEl) {
                testResult.status = statusEl.className.includes('success') ? 'passed' : 
                                   statusEl.className.includes('error') ? 'failed' : 
                                   testPassed ? 'passed' : 'failed';
                testResult.message = statusEl.textContent || '';
            } else {
                // No DOM status element, use result value
                testResult.status = testPassed ? 'passed' : 'failed';
            }
            
            if (infoEl && infoEl.style.display !== 'none') {
                testResult.info = infoEl.innerHTML || '';
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error(`Test ${test.name} failed`, { page: 'tradingview-test-page', error });
            }
            testResults.failed++;
            testResult.status = 'failed';
            testResult.error = error.message;
            testResult.message = `❌ שגיאה: ${error.message}`;
        }
        
        testResults.tests[testKey] = testResult;
    }
    
    // Update test summary
    function updateTestSummary() {
        if (window.Logger) {
            window.Logger.info(`\n📊 Test Summary:`, { page: 'tradingview-test-page', passed: testResults.passed, failed: testResults.failed, total: testResults.total });
        }
        
        // Update summary display
        const summaryPassed = document.getElementById('summary-passed');
        const summaryFailed = document.getElementById('summary-failed');
        const summaryTotal = document.getElementById('summary-total');
        
        if (summaryPassed) summaryPassed.textContent = `✅ עברו: ${testResults.passed}`;
        if (summaryFailed) summaryFailed.textContent = `❌ נכשלו: ${testResults.failed}`;
        if (summaryTotal) summaryTotal.textContent = `📈 סך הכל: ${testResults.total}`;
    }
    
    // Run all tests
    async function runAllTests(preferencesPromise = null) {
        if (window.Logger) {
            window.Logger.info('🧪 Starting TradingView Lightweight Charts tests...', { page: 'tradingview-test-page' });
        }
        
        testResults.startTime = new Date();
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.total = Object.keys(tests).length;
        
        // Group tests by type
        const basicTests = ['library', 'theme', 'adapter'];
        const chartTests = ['basicChart', 'lineSeries', 'steppedLine', 'dualAxes'];
        const integrationTests = ['colors', 'preferences', 'rtl'];
        
        // Run basic tests in parallel (immediate)
        await Promise.all(basicTests.map(testKey => runSingleTest(testKey, tests[testKey])));
        
        // Wait for preferences if needed (for preferences test)
        if (preferencesPromise && integrationTests.includes('preferences')) {
            await preferencesPromise;
        }
        
        // Run chart tests in parallel (after DOM is ready)
        await new Promise(resolve => requestAnimationFrame(() => {
            Promise.all(chartTests.map(testKey => runSingleTest(testKey, tests[testKey])))
                .then(() => resolve());
        }));
        
        // Run integration tests in parallel
        await Promise.all(integrationTests.map(testKey => runSingleTest(testKey, tests[testKey])));
        
        testResults.endTime = new Date();
        
        // Update summary immediately
        updateTestSummary();
    }
    
    // Wait for DOM, scripts, and preferences to load
    async function initializeAndRunTests() {
        // Start preferences loading in parallel (non-blocking)
        const preferencesPromise = (async () => {
            try {
                if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
                    if (window.Logger) {
                        window.Logger.info('📄 Initializing preferences with lazy loading...', { page: 'tradingview-test-page' });
                    }
                    await window.PreferencesCore.initializeWithLazyLoading();
                    if (window.Logger) {
                        window.Logger.info('✅ Preferences initialized successfully', { page: 'tradingview-test-page' });
                    }
                    
                    // Reload TradingView theme preferences after preferences are loaded
                    if (window.TradingViewTheme && typeof window.TradingViewTheme.loadPreferences === 'function') {
                        await window.TradingViewTheme.loadPreferences();
                        if (window.Logger) {
                            window.Logger.info('✅ TradingView theme preferences reloaded', { page: 'tradingview-test-page' });
                        }
                    }
                    return true;
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Preferences initialization failed', { page: 'tradingview-test-page', error });
                }
                return false;
            }
            return false;
        })();
        
        // Run basic tests immediately (don't wait for preferences)
        runAllTests(preferencesPromise);
    }
    
    // Wait for DOM and scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAndRunTests);
    } else {
        // DOM already ready, but wait for scripts to load
        if (window.LightweightCharts || window.lightweightCharts) {
            initializeAndRunTests();
        } else {
            // Wait for scripts with a small timeout (max 1 second)
            const scriptCheckInterval = setInterval(() => {
                if (window.LightweightCharts || window.lightweightCharts) {
                    clearInterval(scriptCheckInterval);
                    initializeAndRunTests();
                }
            }, 100);
            
            // Timeout after 1 second
            setTimeout(() => {
                clearInterval(scriptCheckInterval);
                initializeAndRunTests();
            }, 1000);
        }
    }
    
    // Override console methods to capture logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    
    function captureConsoleLog(level, args) {
        const timestamp = new Date().toISOString();
        const message = Array.from(args).map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        
        testResults.consoleLogs.push({
            timestamp,
            level,
            message
        });
    }
    
    console.log = function(...args) {
        captureConsoleLog('log', args);
        originalConsoleLog.apply(console, args);
    };
    
    console.error = function(...args) {
        captureConsoleLog('error', args);
        testResults.errors.push({
            timestamp: new Date().toISOString(),
            message: Array.from(args).map(String).join(' ')
        });
        originalConsoleError.apply(console, args);
    };
    
    console.warn = function(...args) {
        captureConsoleLog('warn', args);
        originalConsoleWarn.apply(console, args);
    };
    
    console.info = function(...args) {
        captureConsoleLog('info', args);
        originalConsoleInfo.apply(console, args);
    };
    
    // Copy detailed log function
    async function copyDetailedLog() {
        try {
            const copyBtn = document.getElementById('copyLogBtn');
            if (copyBtn) {
                copyBtn.disabled = true;
                let hourglassIcon = '<img src="../../images/icons/tabler/hourglass.svg" width="16" height="16" alt="hourglass" class="icon">';
                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                    try {
                        hourglassIcon = await window.IconSystem.renderIcon('button', 'hourglass', { size: '16', alt: 'hourglass', class: 'icon' });
                    } catch (error) {
                        // Fallback already set
                    }
                }
                copyBtn.innerHTML = hourglassIcon + ' מעתיק...';
            }
            
            testResults.endTime = new Date();
            const duration = testResults.endTime - testResults.startTime;
            
            let logText = '═══════════════════════════════════════════════════════════\n';
            logText += '📊 TradingView Lightweight Charts - Test Report\n';
            logText += '═══════════════════════════════════════════════════════════\n\n';
            
            logText += `📅 Test Date: ${testResults.startTime.toLocaleString('he-IL')}\n`;
            logText += `⏱️ Duration: ${(duration / 1000).toFixed(2)} seconds\n`;
            logText += `🌐 User Agent: ${navigator.userAgent}\n`;
            logText += `🔗 Page URL: ${window.location.href}\n\n`;
            
            logText += '═══════════════════════════════════════════════════════════\n';
            logText += '📈 Test Summary\n';
            logText += '═══════════════════════════════════════════════════════════\n';
            logText += `✅ Passed: ${testResults.passed}\n`;
            logText += `❌ Failed: ${testResults.failed}\n`;
            logText += `📊 Total: ${testResults.total}\n`;
            logText += `📉 Success Rate: ${testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0}%\n\n`;
            
            logText += '═══════════════════════════════════════════════════════════\n';
            logText += '🧪 Individual Test Results\n';
            logText += '═══════════════════════════════════════════════════════════\n';
            
            Object.keys(testResults.tests).forEach((testKey, index) => {
                const test = testResults.tests[testKey];
                logText += `\n${index + 1}. ${test.name}\n`;
                logText += `   Status: ${test.status === 'passed' ? '✅ PASSED' : test.status === 'failed' ? '❌ FAILED' : '⏳ PENDING'}\n`;
                logText += `   Message: ${test.message}\n`;
                if (test.info) {
                    logText += `   Details: ${test.info.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')}\n`;
                }
            });
            
            if (testResults.errors.length > 0) {
                logText += '\n═══════════════════════════════════════════════════════════\n';
                logText += '❌ Errors\n';
                logText += '═══════════════════════════════════════════════════════════\n';
                testResults.errors.forEach((error, index) => {
                    logText += `\n${index + 1}. [${error.timestamp}]\n`;
                    logText += `   ${error.message}\n`;
                });
            }
            
            if (testResults.consoleLogs.length > 0) {
                logText += '\n═══════════════════════════════════════════════════════════\n';
                logText += '📝 Console Logs\n';
                logText += '═══════════════════════════════════════════════════════════\n';
                testResults.consoleLogs.forEach((log, index) => {
                    logText += `\n[${log.timestamp}] [${log.level.toUpperCase()}]\n`;
                    logText += `   ${log.message}\n`;
                });
            }
            
            logText += '\n═══════════════════════════════════════════════════════════\n';
            logText += '🔧 System Information\n';
            logText += '═══════════════════════════════════════════════════════════\n';
            logText += `LightweightCharts: ${typeof window.LightweightCharts !== 'undefined' ? '✅ Available' : '❌ Not Available'}\n`;
            logText += `TradingViewTheme: ${typeof window.TradingViewTheme !== 'undefined' ? '✅ Available' : '❌ Not Available'}\n`;
            logText += `TradingViewChartAdapter: ${typeof window.TradingViewChartAdapter !== 'undefined' ? '✅ Available' : '❌ Not Available'}\n`;
            
            if (window.LightweightCharts) {
                try {
                    logText += `LightweightCharts Version: ${window.LightweightCharts.version ? window.LightweightCharts.version() : 'Unknown'}\n`;
                } catch (e) {
                    logText += `LightweightCharts Version: Unknown\n`;
                }
            }
            
            logText += '\n═══════════════════════════════════════════════════════════\n';
            logText += 'End of Report\n';
            logText += '═══════════════════════════════════════════════════════════\n';
            
            await navigator.clipboard.writeText(logText);
            
            if (copyBtn) {
                copyBtn.disabled = false;
                let infoIcon = '<img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon">';
                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                    try {
                        infoIcon = await window.IconSystem.renderIcon('button', 'info-circle', { size: '16', alt: 'icon', class: 'icon' });
                    } catch (error) {
                        // Fallback already set
                    }
                }
                copyBtn.innerHTML = infoIcon + ' הועתק!';
                setTimeout(async () => {
                    let infoIcon2 = '<img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon">';
                    if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                        try {
                            infoIcon2 = await window.IconSystem.renderIcon('button', 'info-circle', { size: '16', alt: 'icon', class: 'icon' });
                        } catch (error) {
                            // Fallback already set
                        }
                    }
                    copyBtn.innerHTML = infoIcon2 + ' העתק לוג מפורט';
                }, 2000);
            }
            
            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess('לוג מפורט הועתק ללוח', 'בדיקת TradingView');
            } else {
                window.showErrorNotification('לוג מפורט הועתק ללוח', "שגיאה");
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error copying log', { page: 'tradingview-test-page', error });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בהעתקת הלוג: ' + error.message, 'בדיקת TradingView');
            } else {
                window.showErrorNotification('שגיאה בהעתקת הלוג: ' + error.message, "שגיאה");
            }
            
            const copyBtn = document.getElementById('copyLogBtn');
            if (copyBtn) {
                copyBtn.disabled = false;
                // Render icon using IconSystem
                let iconHTML = '<img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon">';
                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                    try {
                        iconHTML = await window.IconSystem.renderIcon('button', 'info-circle', { size: '16', alt: 'icon', class: 'icon' });
                    } catch (error) {
                        // Fallback already set
                    }
                }
                copyBtn.innerHTML = iconHTML + ' העתק לוג מפורט';
            }
        }
    }
    
    // Helper function to get CSS variable value
    function getCSSVariableValue(variableName, fallback) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            return value && value.trim() ? value.trim() : fallback;
        } catch (error) {
            return fallback;
        }
    }
    
    // Setup copy button
    function setupCopyButton() {
        const copyBtn = document.getElementById('copyLogBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyDetailedLog);
        }
    }
    
    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'tradingview-test-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'tradingview-test-page', 
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'tradingview-test-page', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'tradingview-test-page' });
                    }
                }
            }, 500);
        }
    }

    /**
     * Initialize page
     */
    function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Setup copy button
        setupCopyButton();
        
        // Preferences initialization is handled in initializeAndRunTests()
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

    // Export functions to window for debugging
    window.tradingviewTestPage = {
        initializeHeader,
        getCSSVariableValue
    };

})();
