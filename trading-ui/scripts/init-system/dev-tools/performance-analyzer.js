/**
 * Performance Analyzer - TikTrack Frontend
 * =======================================
 * 
 * כלי מתקדם לבדיקת ביצועים וזיכרון
 * 
 * Features:
 * - בדיקת זמן טעינה
 * - בדיקת שימוש בזיכרון
 * - בדיקת תאימות דפדפנים
 * - בדיקת נגישות
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 22, 2025
 */

console.log('⚡ Loading Performance Analyzer...');

/**
 * Performance Analyzer Class
 */
class PerformanceAnalyzer {
    constructor() {
        this.metrics = {
            loadTime: 0,
            memoryUsage: 0,
            scriptCount: 0,
            domElements: 0,
            eventListeners: 0
        };
        this.browserCompatibility = {};
        this.accessibilityIssues = [];
    }

    /**
     * Measure page load performance
     */
    measureLoadPerformance() {
        console.log('⚡ Measuring load performance...');
        
        // Measure load time
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.metrics.loadTime = loadTime;
            console.log(`⚡ Page load time: ${loadTime}ms`);
        }
        
        // Measure script count
        const scripts = document.querySelectorAll('script[src]');
        this.metrics.scriptCount = scripts.length;
        console.log(`⚡ Scripts loaded: ${scripts.length}`);
        
        // Measure DOM elements
        const domElements = document.querySelectorAll('*');
        this.metrics.domElements = domElements.length;
        console.log(`⚡ DOM elements: ${domElements.length}`);
        
        // Measure memory usage (if available)
        if (performance.memory) {
            this.metrics.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            console.log(`⚡ Memory usage: ${this.metrics.memoryUsage.used}MB / ${this.metrics.memoryUsage.total}MB`);
        }
    }

    /**
     * Check browser compatibility
     */
    checkBrowserCompatibility() {
        console.log('🌐 Checking browser compatibility...');
        
        const features = {
            'ES6 Classes': typeof class {} === 'function',
            'Arrow Functions': (() => {}) instanceof Function,
            'Template Literals': typeof `template` === 'string',
            'Destructuring': (() => { const {a} = {a: 1}; return a; })(),
            'Async/Await': typeof async function() {} === 'function',
            'Fetch API': typeof fetch === 'function',
            'Promise': typeof Promise === 'function',
            'Local Storage': typeof localStorage === 'object',
            'Session Storage': typeof sessionStorage === 'object',
            'IndexedDB': typeof indexedDB === 'object'
        };
        
        this.browserCompatibility = features;
        
        const unsupportedFeatures = Object.entries(features)
            .filter(([name, supported]) => !supported)
            .map(([name]) => name);
        
        if (unsupportedFeatures.length > 0) {
            console.warn(`🌐 Unsupported features:`, unsupportedFeatures);
        } else {
            console.log('🌐 All features supported');
        }
    }

    /**
     * Check accessibility
     */
    checkAccessibility() {
        console.log('♿ Checking accessibility...');
        
        const issues = [];
        
        // Check for missing alt attributes
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt && !img.getAttribute('aria-label')) {
                issues.push({
                    type: 'Missing alt text',
                    element: img,
                    severity: 'high'
                });
            }
        });
        
        // Check for missing labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const id = input.id;
            const label = document.querySelector(`label[for="${id}"]`);
            if (!label && !input.getAttribute('aria-label')) {
                issues.push({
                    type: 'Missing label',
                    element: input,
                    severity: 'high'
                });
            }
        });
        
        // Check for proper heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                issues.push({
                    type: 'Heading level skip',
                    element: heading,
                    severity: 'medium'
                });
            }
            lastLevel = level;
        });
        
        // Check for color contrast (simplified)
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            if (color && backgroundColor && 
                color !== 'rgba(0, 0, 0, 0)' && 
                backgroundColor !== 'rgba(0, 0, 0, 0)') {
                // Simplified contrast check - in real implementation would use proper contrast calculation
                if (color === backgroundColor) {
                    issues.push({
                        type: 'Color contrast issue',
                        element: element,
                        severity: 'high'
                    });
                }
            }
        });
        
        this.accessibilityIssues = issues;
        
        if (issues.length > 0) {
            console.warn(`♿ Accessibility issues found:`, issues.length);
        } else {
            console.log('♿ No accessibility issues found');
        }
    }

    /**
     * Check for performance bottlenecks
     */
    checkPerformanceBottlenecks() {
        console.log('⚡ Checking for performance bottlenecks...');
        
        const bottlenecks = [];
        
        // Check for large scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src.includes('bootstrap') || script.src.includes('font-awesome')) return;
            
            // Check if script is blocking
            if (!script.async && !script.defer) {
                bottlenecks.push({
                    type: 'Blocking script',
                    script: script.src.split('/').pop(),
                    suggestion: 'Consider adding async or defer attribute'
                });
            }
        });
        
        // Check for inline styles
        const inlineStyles = document.querySelectorAll('[style]');
        if (inlineStyles.length > 10) {
            bottlenecks.push({
                type: 'Too many inline styles',
                count: inlineStyles.length,
                suggestion: 'Consider moving to CSS classes'
            });
        }
        
        // Check for event listeners
        const elements = document.querySelectorAll('*');
        let eventListenerCount = 0;
        elements.forEach(element => {
            // This is a simplified check - in real implementation would use getEventListeners if available
            if (element.onclick || element.onload || element.onchange) {
                eventListenerCount++;
            }
        });
        
        this.metrics.eventListeners = eventListenerCount;
        
        if (eventListenerCount > 100) {
            bottlenecks.push({
                type: 'Too many event listeners',
                count: eventListenerCount,
                suggestion: 'Consider using event delegation'
            });
        }
        
        if (bottlenecks.length > 0) {
            console.warn(`⚡ Performance bottlenecks found:`, bottlenecks);
        } else {
            console.log('⚡ No performance bottlenecks found');
        }
        
        return bottlenecks;
    }

    /**
     * Generate performance report
     */
    generateReport() {
        const report = {
            metrics: this.metrics,
            browserCompatibility: this.browserCompatibility,
            accessibilityIssues: this.accessibilityIssues.length,
            performanceScore: this.calculatePerformanceScore()
        };
        
        console.log('⚡ Performance report:', report);
        return report;
    }

    /**
     * Calculate performance score
     */
    calculatePerformanceScore() {
        let score = 100;
        
        // Deduct points for slow load time
        if (this.metrics.loadTime > 3000) score -= 20;
        else if (this.metrics.loadTime > 2000) score -= 10;
        
        // Deduct points for high memory usage
        if (this.metrics.memoryUsage.used > 50) score -= 15;
        else if (this.metrics.memoryUsage.used > 30) score -= 10;
        
        // Deduct points for too many scripts
        if (this.metrics.scriptCount > 50) score -= 10;
        else if (this.metrics.scriptCount > 30) score -= 5;
        
        // Deduct points for accessibility issues
        score -= Math.min(this.accessibilityIssues.length * 2, 20);
        
        return Math.max(score, 0);
    }

    /**
     * Run complete performance analysis
     */
    async runCompleteAnalysis() {
        console.log('⚡ Starting complete performance analysis...');
        
        this.measureLoadPerformance();
        this.checkBrowserCompatibility();
        this.checkAccessibility();
        this.checkPerformanceBottlenecks();
        
        const report = this.generateReport();
        console.log(`⚡ Performance analysis complete. Score: ${report.performanceScore}/100`);
        
        return report;
    }
}

// Export for global use
window.PerformanceAnalyzer = PerformanceAnalyzer;

console.log('✅ Performance Analyzer loaded successfully');

