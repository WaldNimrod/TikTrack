/**
 * Ticker Dashboard Debug Console
 * 
 * קוד בדיקה לקונסול לבדיקת נתוני דשבורד הטיקר
 * 
 * שימוש: העתק את הקוד הזה לקונסול הדפדפן והרץ
 */

(function() {
    'use strict';

    /**
     * בדיקת נתוני טיקר
     */
    window.debugTickerDashboard = async function() {
        console.group('🔍 Ticker Dashboard Debug Report');
        console.log('Timestamp:', new Date().toISOString());
        
        // 1. בדיקת tickerDashboard
        console.group('1. TickerDashboard Object');
        const tickerDashboard = window.tickerDashboard;
        if (!tickerDashboard) {
            console.error('❌ window.tickerDashboard not found');
            console.groupEnd();
            return;
        }
        console.log('✅ window.tickerDashboard exists');
        console.log('Has init:', typeof tickerDashboard.init === 'function');
        console.log('Has refreshData:', typeof tickerDashboard.refreshData === 'function');
        console.log('Has tickerData getter:', 'tickerData' in tickerDashboard);
        console.log('Has tickerId getter:', 'tickerId' in tickerDashboard);
        console.groupEnd();
        
        // 2. בדיקת tickerData
        console.group('2. Ticker Data');
        const tickerData = tickerDashboard.tickerData;
        if (!tickerData) {
            console.error('❌ tickerData is null or undefined');
            console.log('Trying to load data...');
            
            // Try to get tickerId from URL
            const urlParams = new URLSearchParams(window.location.search);
            const tickerId = urlParams.get('tickerId') || urlParams.get('tickerSymbol');
            console.log('TickerId from URL:', tickerId);
            
            if (tickerId && window.TickerDashboardData) {
                console.log('Attempting to load data...');
                try {
                    const data = await window.TickerDashboardData.loadTickerDashboardData(tickerId);
                    console.log('✅ Data loaded:', data);
                    console.log('Data keys:', Object.keys(data || {}));
                    console.log('ATR:', data?.atr);
                    console.log('Week52 High:', data?.week52_high);
                    console.log('Week52 Low:', data?.week52_low);
                    console.log('Volatility:', data?.volatility);
                } catch (error) {
                    console.error('❌ Error loading data:', error);
                }
            }
            console.groupEnd();
            return;
        }
        
        console.log('✅ tickerData exists');
        console.log('Ticker ID:', tickerData.id);
        console.log('Symbol:', tickerData.symbol);
        console.log('Price:', tickerData.current_price || tickerData.price);
        console.log('Change:', tickerData.daily_change || tickerData.change_amount);
        console.log('Change %:', tickerData.daily_change_percent || tickerData.change_percent);
        console.log('Volume:', tickerData.volume);
        
        // בדיקת ATR
        console.group('ATR Data');
        console.log('ATR:', tickerData.atr);
        console.log('ATR Period:', tickerData.atr_period);
        console.log('ATR Warnings:', tickerData.atr_warnings);
        console.log('Has ATR:', tickerData.atr !== null && tickerData.atr !== undefined);
        if (!tickerData.atr) {
            console.warn('⚠️ ATR is missing - check backend EntityDetailsService');
        }
        console.groupEnd();
        
        // בדיקת 52W Range
        console.group('52W Range Data');
        console.log('Week52 High:', tickerData.week52_high);
        console.log('Week52 Low:', tickerData.week52_low);
        console.log('Week52 Warnings:', tickerData.week52_warnings);
        console.log('Has Week52 High:', tickerData.week52_high !== null && tickerData.week52_high !== undefined);
        console.log('Has Week52 Low:', tickerData.week52_low !== null && tickerData.week52_low !== undefined);
        if (!tickerData.week52_high || !tickerData.week52_low) {
            console.warn('⚠️ 52W Range is missing - check backend Week52Calculator and MarketDataQuote table');
        }
        console.groupEnd();
        
        // בדיקת Volatility
        console.group('Volatility Data');
        console.log('Volatility:', tickerData.volatility);
        console.log('Has Volatility:', tickerData.volatility !== null && tickerData.volatility !== undefined);
        if (!tickerData.volatility) {
            console.warn('⚠️ Volatility is missing - check backend TechnicalIndicatorsCalculator and MarketDataQuote table');
        }
        console.groupEnd();
        
        // כל המפתחות הרלוונטיים
        console.group('All Relevant Keys');
        const relevantKeys = Object.keys(tickerData).filter(k => 
            k.includes('atr') || 
            k.includes('week') || 
            k.includes('52') || 
            k.includes('volatility') ||
            k.includes('price') ||
            k.includes('change') ||
            k.includes('volume')
        );
        console.log('Relevant keys:', relevantKeys);
        relevantKeys.forEach(key => {
            console.log(`  ${key}:`, tickerData[key]);
        });
        console.groupEnd();
        
        // כל המפתחות
        console.group('All Keys');
        console.log('All keys:', Object.keys(tickerData));
        console.groupEnd();
        
        console.groupEnd();
    };
    
    /**
     * בדיקת KPI Cards
     */
    window.debugKPICards = function() {
        console.group('🔍 KPI Cards Debug');
        const container = document.getElementById('tickerKPICards');
        if (!container) {
            console.error('❌ Container tickerKPICards not found');
            console.groupEnd();
            return;
        }
        
        console.log('✅ Container found');
        const cards = container.querySelectorAll('.kpi-card');
        console.log('Cards count:', cards.length);
        
        cards.forEach((card, index) => {
            const label = card.querySelector('.kpi-label')?.textContent || 'N/A';
            const value = card.querySelector('.kpi-value')?.textContent || 'N/A';
            console.log(`Card ${index + 1}:`, { label, value });
        });
        
        console.groupEnd();
    };
    
    /**
     * בדיקת גרף
     */
    window.debugChart = function() {
        console.group('🔍 Chart Debug');
        const container = document.getElementById('tradingview_widget');
        if (!container) {
            console.error('❌ Container tradingview_widget not found');
            console.groupEnd();
            return;
        }
        
        console.log('✅ Container found');
        console.log('Container height:', container.offsetHeight, 'px');
        console.log('Container width:', container.offsetWidth, 'px');
        console.log('Container computed height:', window.getComputedStyle(container).height);
        console.log('Container computed width:', window.getComputedStyle(container).width);
        
        const sectionBody = document.querySelector('#ticker-dashboard-chart .section-body');
        if (sectionBody) {
            console.log('Section body height:', sectionBody.offsetHeight, 'px');
            console.log('Section body computed height:', window.getComputedStyle(sectionBody).height);
            console.log('Section body display:', window.getComputedStyle(sectionBody).display);
            console.log('Section body flex-direction:', window.getComputedStyle(sectionBody).flexDirection);
        }
        
        const iframe = container.querySelector('iframe');
        if (iframe) {
            console.log('✅ TradingView iframe found');
            console.log('Iframe height:', iframe.offsetHeight, 'px');
            console.log('Iframe width:', iframe.offsetWidth, 'px');
        } else {
            console.warn('⚠️ TradingView iframe not found');
        }
        
        console.log('TradingView available:', typeof window.TradingView !== 'undefined');
        console.groupEnd();
    };
    
    /**
     * בדיקה מלאה
     */
    window.debugTickerDashboardFull = async function() {
        await window.debugTickerDashboard();
        window.debugKPICards();
        window.debugChart();
        
        console.log('\n📋 Summary:');
        console.log('Run these functions for detailed checks:');
        console.log('  - debugTickerDashboard() - Check ticker data');
        console.log('  - debugKPICards() - Check KPI cards rendering');
        console.log('  - debugChart() - Check chart container and height');
    };
    
    // Auto-run on load
    if (document.readyState === 'complete') {
        console.log('✅ Ticker Dashboard Debug Tools loaded');
        console.log('Run debugTickerDashboardFull() for full check');
    } else {
        window.addEventListener('load', () => {
            console.log('✅ Ticker Dashboard Debug Tools loaded');
            console.log('Run debugTickerDashboardFull() for full check');
        });
    }
})();



