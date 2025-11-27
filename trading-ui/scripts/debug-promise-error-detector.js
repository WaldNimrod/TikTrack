/**
 * Promise Error Detector - Debug Tool
 * כלי אבחון לזיהוי מקור שגיאת [object Promise] 404
 * 
 * כלי זה מוסיף monitoring מפורט לכל קריאת fetch, script.src, href, ו-URL assignments
 * ומדווח על כל מקרה שבו Promise מועבר במקום string.
 */

(function() {
    'use strict';

    const DEBUG_MODE = true;
    const errorReports = [];
    let monitoringActive = false;

    /**
     * Log error with full context
     */
    function logError(type, value, context) {
        const error = new Error();
        const stack = error.stack || '';
        const report = {
            type: type,
            value: value,
            valueType: typeof value,
            isPromise: value instanceof Promise,
            stringValue: String(value),
            timestamp: Date.now(),
            stack: stack,
            context: context,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        errorReports.push(report);
        
        console.error(`🔴 [Promise Error Detector] ${type}:`, {
            value: value,
            type: typeof value,
            isPromise: value instanceof Promise,
            stringValue: String(value),
            stack: stack.split('\n').slice(0, 10).join('\n'),
            context: context
        });
        
        if (window.Logger?.error) {
            window.Logger.error(`🔴 [Promise Error Detector] ${type}`, report, { 
                page: 'promise-error-detector',
                errorType: type 
            });
        }
        
        return report;
    }

    /**
     * Monitor fetch calls
     */
    function monitorFetch() {
        if (monitoringActive) return;
        
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            // Check if URL is a Promise or invalid
            if (url !== null && url !== undefined) {
                if (typeof url !== 'string' && typeof url !== 'object') {
                    logError('FETCH_CALLED_WITH_NON_STRING', url, {
                        args: args,
                        callSite: new Error().stack
                    });
                } else if (url instanceof Promise) {
                    logError('FETCH_CALLED_WITH_PROMISE', url, {
                        args: args,
                        callSite: new Error().stack
                    });
                } else if (typeof url === 'object' && url.toString() === '[object Promise]') {
                    logError('FETCH_CALLED_WITH_PROMISE_OBJECT', url, {
                        args: args,
                        callSite: new Error().stack
                    });
                }
            }
            
            return originalFetch.apply(this, args);
        };
        
        console.log('✅ [Promise Error Detector] Fetch monitoring active');
    }

    /**
     * Monitor script.src assignments
     */
    function monitorScriptSrc() {
        if (monitoringActive) return;
        
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, ...args) {
            const element = originalCreateElement.call(this, tagName, ...args);
            
            if (tagName.toLowerCase() === 'script') {
                const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
                
                if (originalSrcDescriptor && originalSrcDescriptor.set) {
                    Object.defineProperty(element, 'src', {
                        set: function(value) {
                            if (value !== null && value !== undefined) {
                                if (typeof value !== 'string') {
                                    logError('SCRIPT_SRC_SET_WITH_NON_STRING', value, {
                                        element: element,
                                        tagName: tagName,
                                        callSite: new Error().stack
                                    });
                                } else if (value instanceof Promise) {
                                    logError('SCRIPT_SRC_SET_WITH_PROMISE', value, {
                                        element: element,
                                        tagName: tagName,
                                        callSite: new Error().stack
                                    });
                                } else if (typeof value === 'object' && String(value) === '[object Promise]') {
                                    logError('SCRIPT_SRC_SET_WITH_PROMISE_OBJECT', value, {
                                        element: element,
                                        tagName: tagName,
                                        callSite: new Error().stack
                                    });
                                }
                            }
                            originalSrcDescriptor.set.call(this, value);
                        },
                        get: function() {
                            return originalSrcDescriptor.get ? originalSrcDescriptor.get.call(this) : this.getAttribute('src');
                        },
                        configurable: true,
                        enumerable: true
                    });
                }
            }
            
            return element;
        };
        
        console.log('✅ [Promise Error Detector] Script.src monitoring active');
    }

    /**
     * Monitor href assignments
     */
    function monitorHref() {
        if (monitoringActive) return;
        
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, ...args) {
            const element = originalCreateElement.call(this, tagName, ...args);
            
            if (tagName.toLowerCase() === 'a' || tagName.toLowerCase() === 'link') {
                const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'href') ||
                                                Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
                
                if (originalHrefDescriptor && originalHrefDescriptor.set) {
                    Object.defineProperty(element, 'href', {
                        set: function(value) {
                            if (value !== null && value !== undefined) {
                                if (typeof value !== 'string') {
                                    logError('HREF_SET_WITH_NON_STRING', value, {
                                        element: element,
                                        tagName: tagName,
                                        callSite: new Error().stack
                                    });
                                } else if (value instanceof Promise) {
                                    logError('HREF_SET_WITH_PROMISE', value, {
                                        element: element,
                                        tagName: tagName,
                                        callSite: new Error().stack
                                    });
                                } else if (typeof value === 'object' && String(value) === '[object Promise]') {
                                    logError('HREF_SET_WITH_PROMISE_OBJECT', value, {
                                        element: element,
                                        tagName: tagName,
                                        callSite: new Error().stack
                                    });
                                }
                            }
                            originalHrefDescriptor.set.call(this, value);
                        },
                        get: function() {
                            return originalHrefDescriptor.get ? originalHrefDescriptor.get.call(this) : this.getAttribute('href');
                        },
                        configurable: true,
                        enumerable: true
                    });
                }
            }
            
            return element;
        };
        
        console.log('✅ [Promise Error Detector] Href monitoring active');
    }

    /**
     * Monitor setAttribute calls
     */
    function monitorSetAttribute() {
        if (monitoringActive) return;
        
        const originalSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if ((name === 'src' || name === 'href') && value !== null && value !== undefined) {
                if (typeof value !== 'string') {
                    logError(`SETATTRIBUTE_${name.toUpperCase()}_WITH_NON_STRING`, value, {
                        element: this,
                        attributeName: name,
                        callSite: new Error().stack
                    });
                } else if (value instanceof Promise) {
                    logError(`SETATTRIBUTE_${name.toUpperCase()}_WITH_PROMISE`, value, {
                        element: this,
                        attributeName: name,
                        callSite: new Error().stack
                    });
                } else if (typeof value === 'object' && String(value) === '[object Promise]') {
                    logError(`SETATTRIBUTE_${name.toUpperCase()}_WITH_PROMISE_OBJECT`, value, {
                        element: this,
                        attributeName: name,
                        callSite: new Error().stack
                    });
                }
            }
            return originalSetAttribute.call(this, name, value);
        };
        
        console.log('✅ [Promise Error Detector] setAttribute monitoring active');
    }

    /**
     * Initialize monitoring
     */
    function init() {
        if (monitoringActive) {
            console.warn('⚠️ [Promise Error Detector] Already active');
            return;
        }
        
        monitoringActive = true;
        
        // Start monitoring before page loads
        monitorFetch();
        monitorScriptSrc();
        monitorHref();
        monitorSetAttribute();
        
        console.log('✅ [Promise Error Detector] All monitoring active');
        
        // Expose API
        window.PromiseErrorDetector = {
            getReports: () => errorReports,
            clearReports: () => errorReports.length = 0,
            getReportCount: () => errorReports.length,
            printReports: () => {
                console.table(errorReports);
                return errorReports;
            },
            exportReports: () => {
                return JSON.stringify(errorReports, null, 2);
            }
        };
    }

    // Initialize immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also initialize on script load (in case DOMContentLoaded already fired)
    if (typeof window !== 'undefined') {
        init();
    }

})();

