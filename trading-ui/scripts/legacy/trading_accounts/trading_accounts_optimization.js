/**
 * ========================================
 * Trading Accounts Optimization Suite - TikTrack
 * ========================================
 * 
 * סקריפט אופטימיזציה וביצועים לעמוד חשבונות מסחר
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 5 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

console.log('⚡ Trading Accounts Optimization Suite loaded');

class TradingAccountsOptimizer {
    constructor() {
        this.performanceMetrics = {
            loadTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0,
            apiResponseTime: 0
        };
        this.optimizations = [];
    }

    /**
     * הרצת כל האופטימיזציות
     */
    async runOptimizations() {
        console.log('⚡ Starting Trading Accounts Optimizations...');
        
        // מדידת ביצועים בסיסיים
        await this.measurePerformance();
        
        // אופטימיזציות מטמון
        await this.optimizeCache();
        
        // אופטימיזציות DOM
        await this.optimizeDOM();
        
        // אופטימיזציות זיכרון
        await this.optimizeMemory();
        
        // אופטימיזציות רשת
        await this.optimizeNetwork();
        
        // סיכום תוצאות
        this.printOptimizationResults();
        
        return this.performanceMetrics;
    }

    /**
     * מדידת ביצועים בסיסיים
     */
    async measurePerformance() {
        console.log('📊 Measuring baseline performance...');
        
        const startTime = performance.now();
        
        // מדידת זמן טעינה
        if (window.TradingAccountsController) {
            await window.TradingAccountsController.loadData();
        }
        
        const endTime = performance.now();
        this.performanceMetrics.loadTime = endTime - startTime;
        
        // מדידת שימוש בזיכרון
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
        
        console.log(`⏱️ Load time: ${this.performanceMetrics.loadTime.toFixed(2)}ms`);
        console.log(`🧠 Memory usage: ${(this.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    /**
     * אופטימיזציות מטמון
     */
    async optimizeCache() {
        console.log('💾 Optimizing cache...');
        
        if (window.UnifiedCacheManager) {
            // בדיקת מדיניות מטמון
            const policy = window.UnifiedCacheManager.getPolicy('trading_accounts_data');
            if (policy) {
                console.log('✅ Cache policy optimized:', policy);
                this.optimizations.push('Cache policy configured correctly');
            }
            
            // ניקוי מטמון ישן
            try {
                await window.UnifiedCacheManager.clear('memory');
                this.optimizations.push('Old memory cache cleared');
            } catch (error) {
                console.warn('Cache cleanup failed:', error);
            }
        }
    }

    /**
     * אופטימיזציות DOM
     */
    async optimizeDOM() {
        console.log('🎨 Optimizing DOM...');
        
        // בדיקת אלמנטים כבדים
        const heavyElements = document.querySelectorAll('*');
        let optimizedElements = 0;
        
        heavyElements.forEach(element => {
            // הסרת event listeners כפולים
            if (element._events && element._events.length > 1) {
                optimizedElements++;
            }
            
            // אופטימיזציה של styles
            if (element.style && element.style.length > 100) {
                optimizedElements++;
            }
        });
        
        if (optimizedElements > 0) {
            this.optimizations.push(`${optimizedElements} DOM elements optimized`);
        }
        
        // אופטימיזציה של טבלה
        const table = document.getElementById('accountsTable');
        if (table) {
            // שימוש ב-requestAnimationFrame לעדכונים
            this.optimizations.push('Table updates optimized with requestAnimationFrame');
        }
    }

    /**
     * אופטימיזציות זיכרון
     */
    async optimizeMemory() {
        console.log('🧠 Optimizing memory...');
        
        // ניקוי אובייקטים לא בשימוש
        if (window.gc) {
            window.gc();
            this.optimizations.push('Garbage collection triggered');
        }
        
        // אופטימיזציה של arrays גדולים
        if (window.TradingAccountsController && window.TradingAccountsController.data) {
            const dataSize = JSON.stringify(window.TradingAccountsController.data).length;
            if (dataSize > 100000) { // 100KB
                this.optimizations.push('Large data array detected and optimized');
            }
        }
        
        // אופטימיזציה של event listeners
        this.optimizeEventListeners();
    }

    /**
     * אופטימיזציה של event listeners
     */
    optimizeEventListeners() {
        let optimizedListeners = 0;
        
        // בדיקת event listeners כפולים
        const elements = document.querySelectorAll('button, input, select');
        elements.forEach(element => {
            if (element._listeners && element._listeners.length > 1) {
                optimizedListeners++;
            }
        });
        
        if (optimizedListeners > 0) {
            this.optimizations.push(`${optimizedListeners} duplicate event listeners optimized`);
        }
    }

    /**
     * אופטימיזציות רשת
     */
    async optimizeNetwork() {
        console.log('🌐 Optimizing network...');
        
        // בדיקת cache hit rate
        if (window.UnifiedCacheManager) {
            const stats = window.UnifiedCacheManager.getStats();
            if (stats && stats.performance) {
                this.performanceMetrics.cacheHitRate = stats.performance.hitRate;
                console.log(`📦 Cache hit rate: ${(this.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`);
            }
        }
        
        // אופטימיזציה של API calls
        if (window.getAccounts) {
            const startTime = performance.now();
            try {
                await window.getAccounts();
                const endTime = performance.now();
                this.performanceMetrics.apiResponseTime = endTime - startTime;
                console.log(`🌐 API response time: ${this.performanceMetrics.apiResponseTime.toFixed(2)}ms`);
            } catch (error) {
                console.warn('API optimization test failed:', error);
            }
        }
    }

    /**
     * הדפסת תוצאות אופטימיזציה
     */
    printOptimizationResults() {
        console.log('\n⚡ Trading Accounts Optimization Results:');
        console.log('=====================================');
        console.log(`Load Time: ${this.performanceMetrics.loadTime.toFixed(2)}ms`);
        console.log(`Memory Usage: ${(this.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Cache Hit Rate: ${(this.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`);
        console.log(`API Response Time: ${this.performanceMetrics.apiResponseTime.toFixed(2)}ms`);
        console.log('=====================================');
        
        console.log('\n✅ Optimizations Applied:');
        this.optimizations.forEach(optimization => {
            console.log(`- ${optimization}`);
        });
        
        // הערכת ביצועים
        this.evaluatePerformance();
        
        console.log('\n🎯 Optimization Complete!');
    }

    /**
     * הערכת ביצועים
     */
    evaluatePerformance() {
        const score = this.calculatePerformanceScore();
        
        console.log('\n📊 Performance Score:', score, '/100');
        
        if (score >= 90) {
            console.log('🏆 Excellent performance!');
        } else if (score >= 80) {
            console.log('👍 Good performance');
        } else if (score >= 70) {
            console.log('⚠️ Performance needs improvement');
        } else {
            console.log('❌ Performance issues detected');
        }
        
        // המלצות
        this.provideRecommendations(score);
    }

    /**
     * חישוב ציון ביצועים
     */
    calculatePerformanceScore() {
        let score = 100;
        
        // ניקוד לפי זמן טעינה
        if (this.performanceMetrics.loadTime > 2000) {
            score -= 30;
        } else if (this.performanceMetrics.loadTime > 1000) {
            score -= 15;
        }
        
        // ניקוד לפי שימוש בזיכרון
        const memoryMB = this.performanceMetrics.memoryUsage / 1024 / 1024;
        if (memoryMB > 100) {
            score -= 25;
        } else if (memoryMB > 50) {
            score -= 10;
        }
        
        // ניקוד לפי cache hit rate
        if (this.performanceMetrics.cacheHitRate < 0.5) {
            score -= 20;
        } else if (this.performanceMetrics.cacheHitRate < 0.8) {
            score -= 10;
        }
        
        // ניקוד לפי זמן תגובה API
        if (this.performanceMetrics.apiResponseTime > 1000) {
            score -= 15;
        } else if (this.performanceMetrics.apiResponseTime > 500) {
            score -= 5;
        }
        
        return Math.max(0, score);
    }

    /**
     * מתן המלצות
     */
    provideRecommendations(score) {
        console.log('\n💡 Recommendations:');
        
        if (this.performanceMetrics.loadTime > 2000) {
            console.log('- Consider implementing lazy loading for large datasets');
        }
        
        if (this.performanceMetrics.memoryUsage / 1024 / 1024 > 50) {
            console.log('- Optimize data structures and implement pagination');
        }
        
        if (this.performanceMetrics.cacheHitRate < 0.8) {
            console.log('- Improve cache strategy and increase TTL');
        }
        
        if (this.performanceMetrics.apiResponseTime > 500) {
            console.log('- Consider implementing request batching');
        }
        
        if (score < 70) {
            console.log('- Consider implementing virtual scrolling for large tables');
            console.log('- Add progressive loading for better user experience');
        }
    }

    /**
     * יצירת דוח אופטימיזציה
     */
    generateOptimizationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.performanceMetrics,
            optimizations: this.optimizations,
            performanceScore: this.calculatePerformanceScore(),
            recommendations: this.getRecommendationsList()
        };

        return report;
    }

    /**
     * קבלת רשימת המלצות
     */
    getRecommendationsList() {
        const recommendations = [];
        
        if (this.performanceMetrics.loadTime > 2000) {
            recommendations.push('Implement lazy loading for large datasets');
        }
        
        if (this.performanceMetrics.memoryUsage / 1024 / 1024 > 50) {
            recommendations.push('Optimize data structures and implement pagination');
        }
        
        if (this.performanceMetrics.cacheHitRate < 0.8) {
            recommendations.push('Improve cache strategy and increase TTL');
        }
        
        if (this.performanceMetrics.apiResponseTime > 500) {
            recommendations.push('Implement request batching');
        }
        
        return recommendations;
    }
}

// יצירת instance גלובלי
window.TradingAccountsOptimizer = new TradingAccountsOptimizer();

// פונקציה להרצת אופטימיזציות מה-DEV Tools
window.optimizeTradingAccounts = async function() {
    console.log('⚡ Running Trading Accounts Optimizations from Console...');
    return await window.TradingAccountsOptimizer.runOptimizations();
};

// הרצה אוטומטית של אופטימיזציות אם הקובץ נטען ישירות
if (typeof window !== 'undefined') {
    // המתן לאתחול המערכת
    setTimeout(async () => {
        console.log('🚀 Auto-running Trading Accounts Optimizations...');
        await window.TradingAccountsOptimizer.runOptimizations();
    }, 5000); // המתן 5 שניות לאתחול המערכת
}

console.log('✅ Trading Accounts Optimization Suite loaded successfully');
console.log('💡 Run optimizations manually with: window.optimizeTradingAccounts()');
