/**
 * DEBUG SCRIPT: Track Breadcrumb Rendering Process
 * 
 * This script intercepts and logs ALL functions related to breadcrumb rendering:
 * - getBreadcrumb()
 * - _performNavigationUpdate()
 * - updateModalNavigation()
 * - innerHTML assignments
 * - DOM mutations
 * 
 * Run this in console before opening modals to see the complete rendering flow.
 */

(function() {
    'use strict';
    
    console.log('🔍🔍🔍 Starting Advanced Breadcrumb Rendering Debug Script...');
    
    if (!window.modalNavigationManager) {
        console.warn('⚠️ modalNavigationManager not found - waiting...');
        const checkInterval = setInterval(() => {
            if (window.modalNavigationManager) {
                clearInterval(checkInterval);
                startAdvancedDebugging();
            }
        }, 500);
        return;
    }
    
    startAdvancedDebugging();
    
    function startAdvancedDebugging() {
        const manager = window.modalNavigationManager;
        
        // 1. Intercept getBreadcrumb()
        const originalGetBreadcrumb = manager.getBreadcrumb.bind(manager);
        manager.getBreadcrumb = function(...args) {
            const stackTrace = new Error().stack;
            const caller = stackTrace.split('\n')[2] || 'unknown';
            const functionMatch = caller.match(/at\s+(.+?)\s+\(/);
            const functionName = functionMatch ? functionMatch[1] : 'unknown';
            
            console.log('🔵 [getBreadcrumb] CALLED', {
                caller: functionName,
                callerFull: caller,
                modalHistoryLength: this.modalHistory.length,
                modalHistory: this.modalHistory.map((item, idx) => ({
                    index: idx,
                    entityType: item.info?.entityType,
                    entityId: item.info?.entityId,
                    hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source)
                })),
                timestamp: Date.now()
            });
            
            const result = originalGetBreadcrumb.apply(this, args);
            
            console.log('🔵 [getBreadcrumb] RETURNED', {
                resultLength: result?.length || 0,
                resultPreview: result?.substring(0, 200) || '(empty)',
                firstLinkInResult: result ? extractFirstLink(result) : null,
                timestamp: Date.now()
            });
            
            return result;
        };
        
        // 2. Intercept _performNavigationUpdate()
        const originalPerformUpdate = manager._performNavigationUpdate.bind(manager);
        manager._performNavigationUpdate = function(...args) {
            const stackTrace = new Error().stack;
            const caller = stackTrace.split('\n')[2] || 'unknown';
            const functionMatch = caller.match(/at\s+(.+?)\s+\(/);
            const functionName = functionMatch ? functionMatch[1] : 'unknown';
            
            console.log('🟡 [_performNavigationUpdate] CALLED', {
                caller: functionName,
                callerFull: caller,
                modalHistoryLength: this.modalHistory.length,
                modalHistory: this.modalHistory.map((item, idx) => ({
                    index: idx,
                    entityType: item.info?.entityType,
                    entityId: item.info?.entityId
                })),
                timestamp: Date.now()
            });
            
            // Get current breadcrumb state BEFORE update
            const modalElement = args[0];
            const breadcrumbContainer = modalElement?.querySelector?.('.modal-navigation-breadcrumb') || 
                                       document.querySelector('.modal-navigation-breadcrumb');
            
            let beforeState = null;
            if (breadcrumbContainer) {
                beforeState = {
                    innerHTML: breadcrumbContainer.innerHTML,
                    firstLink: extractFirstLink(breadcrumbContainer.innerHTML),
                    linksCount: breadcrumbContainer.querySelectorAll('.breadcrumb-link').length
                };
            }
            
            const result = originalPerformUpdate.apply(this, args);
            
            // Get breadcrumb state AFTER update (with small delay to catch async changes)
            setTimeout(() => {
                let afterState = null;
                if (breadcrumbContainer) {
                    afterState = {
                        innerHTML: breadcrumbContainer.innerHTML,
                        firstLink: extractFirstLink(breadcrumbContainer.innerHTML),
                        linksCount: breadcrumbContainer.querySelectorAll('.breadcrumb-link').length
                    };
                }
                
                const changed = !beforeState || !afterState || 
                               beforeState.innerHTML !== afterState.innerHTML;
                
                if (changed) {
                    console.log('🟡 [_performNavigationUpdate] BREADCRUMB CHANGED', {
                        before: beforeState,
                        after: afterState,
                        changed: changed,
                        timestamp: Date.now()
                    });
                } else {
                    console.log('🟡 [_performNavigationUpdate] NO CHANGE', {
                        state: afterState,
                        timestamp: Date.now()
                    });
                }
            }, 100);
            
            return result;
        };
        
        // 3. Intercept updateModalNavigation()
        const originalUpdateNav = manager.updateModalNavigation.bind(manager);
        manager.updateModalNavigation = function(...args) {
            const stackTrace = new Error().stack;
            const caller = stackTrace.split('\n')[2] || 'unknown';
            const functionMatch = caller.match(/at\s+(.+?)\s+\(/);
            const functionName = functionMatch ? functionMatch[1] : 'unknown';
            
            console.log('🟢 [updateModalNavigation] CALLED', {
                caller: functionName,
                callerFull: caller,
                modalId: args[0]?.id,
                modalHistoryLength: this.modalHistory.length,
                timestamp: Date.now()
            });
            
            return originalUpdateNav.apply(this, args);
        };
        
        // 4. Monitor breadcrumb container innerHTML setter
        function setupInnerHTMLInterceptor() {
            // Wait for breadcrumb container to exist
            const checkInterval = setInterval(() => {
                const breadcrumbContainer = document.querySelector('.modal-navigation-breadcrumb');
                if (breadcrumbContainer && !breadcrumbContainer._innerHTMLIntercepted) {
                    breadcrumbContainer._innerHTMLIntercepted = true;
                    
                    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
                    
                    // Create a new descriptor for this specific element
                    Object.defineProperty(breadcrumbContainer, 'innerHTML', {
                        set: function(value) {
                            const oldValue = this.innerHTML;
                            const stackTrace = new Error().stack;
                            const caller = stackTrace.split('\n')[2] || 'unknown';
                            const functionMatch = caller.match(/at\s+(.+?)\s+\(/);
                            const functionName = functionMatch ? functionMatch[1] : 'unknown';
                            
                            const oldFirstLink = extractFirstLink(oldValue);
                            const newFirstLink = extractFirstLink(value);
                            
                            if (oldFirstLink && newFirstLink && 
                                (oldFirstLink.type !== newFirstLink.type || oldFirstLink.id !== newFirstLink.id)) {
                                console.error('🔴🔴🔴 [innerHTML SETTER] FIRST LINK CHANGED!', {
                                    oldFirstLink,
                                    newFirstLink,
                                    caller: functionName,
                                    fullStackTrace: stackTrace,
                                    oldValuePreview: oldValue?.substring(0, 200),
                                    newValuePreview: value?.substring(0, 200),
                                    timestamp: Date.now()
                                });
                            } else {
                                console.log('🟠 [innerHTML SETTER]', {
                                    caller: functionName,
                                    oldFirstLink,
                                    newFirstLink,
                                    valueLength: value?.length || 0,
                                    timestamp: Date.now()
                                });
                            }
                            
                            if (originalDescriptor && originalDescriptor.set) {
                                originalDescriptor.set.call(this, value);
                            }
                        },
                        get: function() {
                            if (originalDescriptor && originalDescriptor.get) {
                                return originalDescriptor.get.call(this);
                            }
                            return '';
                        },
                        configurable: true
                    });
                    
                    clearInterval(checkInterval);
                    console.log('✅ innerHTML setter intercepted for breadcrumb container');
                }
            }, 500);
        }
        
        setupInnerHTMLInterceptor();
        
        // 5. Monitor DOM mutations
        function setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const target = mutation.target;
                        if (target.classList?.contains('modal-navigation-breadcrumb') || 
                            target.closest?.('.modal-navigation-breadcrumb')) {
                            
                            const stackTrace = new Error().stack;
                            const caller = stackTrace.split('\n')[2] || 'unknown';
                            const functionMatch = caller.match(/at\s+(.+?)\s+\(/);
                            const functionName = functionMatch ? functionMatch[1] : 'unknown';
                            
                            const breadcrumbContainer = target.closest?.('.modal-navigation-breadcrumb') || target;
                            const firstLink = extractFirstLink(breadcrumbContainer.innerHTML);
                            
                            console.log('🟣 [MUTATION OBSERVER]', {
                                mutationType: mutation.type,
                                caller: functionName,
                                firstLink,
                                addedNodes: mutation.addedNodes.length,
                                removedNodes: mutation.removedNodes.length,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            });
            
            // Start observing when breadcrumb container appears
            const checkInterval = setInterval(() => {
                const breadcrumbContainer = document.querySelector('.modal-navigation-breadcrumb');
                if (breadcrumbContainer) {
                    observer.observe(breadcrumbContainer, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });
                    clearInterval(checkInterval);
                    console.log('✅ MutationObserver started for breadcrumb container');
                }
            }, 500);
        }
        
        setupMutationObserver();
        
        console.log('✅ Advanced Breadcrumb Debugging Started');
        console.log('📋 Intercepted functions:');
        console.log('   - getBreadcrumb()');
        console.log('   - _performNavigationUpdate()');
        console.log('   - updateModalNavigation()');
        console.log('   - innerHTML setter');
        console.log('   - MutationObserver');
        
        // Helper function to extract first link info
        function extractFirstLink(html) {
            if (!html) return null;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const firstLink = tempDiv.querySelector('.breadcrumb-link');
            if (!firstLink) return null;
            
            return {
                type: firstLink.getAttribute('data-entity-type'),
                id: firstLink.getAttribute('data-entity-id'),
                text: firstLink.textContent.trim(),
                fullHTML: firstLink.outerHTML.substring(0, 100)
            };
        }
        
        // Global function to check current state
        window.debugBreadcrumbRendering = function() {
            const manager = window.modalNavigationManager;
            const breadcrumbContainer = document.querySelector('.modal-navigation-breadcrumb');
            
            console.log('📊 Current Breadcrumb State:', {
                modalHistory: manager.modalHistory.map((item, idx) => ({
                    index: idx,
                    entityType: item.info?.entityType,
                    entityId: item.info?.entityId
                })),
                breadcrumbHTML: breadcrumbContainer?.innerHTML || 'N/A',
                breadcrumbFirstLink: breadcrumbContainer ? extractFirstLink(breadcrumbContainer.innerHTML) : null,
                breadcrumbLinks: breadcrumbContainer ? 
                    Array.from(breadcrumbContainer.querySelectorAll('.breadcrumb-link')).map(link => ({
                        type: link.getAttribute('data-entity-type'),
                        id: link.getAttribute('data-entity-id'),
                        text: link.textContent.trim()
                    })) : []
            });
        };
        
        console.log('💡 Use window.debugBreadcrumbRendering() to check current state anytime');
    }
})();
