/**
 * Modal Navigation Monitor Script
 * ================================
 * 
 * סקריפט לניטור מלא של כל פעולות modal navigation
 * העתק והדבק בקונסול כדי לעקוב אחרי כל הקריאות והשינויים
 * 
 * Usage:
 * 1. העתק את כל התוכן של הקובץ הזה
 * 2. הדבק בקונסול של הדפדפן
 * 3. לחץ Enter
 * 4. פתח מודולים והסתכל על הלוגים המפורטים
 */

(function() {
    'use strict';
    
    if (!window.modalNavigationManager) {
        console.error('❌ ModalNavigationManager not found! Make sure it is initialized.');
        return;
    }
    
    const manager = window.modalNavigationManager;
    
    // שמירת פונקציות מקוריות
    const originalPushModal = manager.pushModal;
    const originalHandleModalShown = manager.handleModalShown;
    const originalUpdateModalNavigation = manager.updateModalNavigation;
    const originalSaveHistoryToCache = manager.saveHistoryToCache;
    const originalLoadHistoryFromCache = manager.loadHistoryFromCache;
    const originalGoBack = manager.goBack;
    const originalPopModal = manager.popModal;
    
    // מונים
    let callCounter = {
        pushModal: 0,
        handleModalShown: 0,
        updateModalNavigation: 0,
        saveHistoryToCache: 0,
        loadHistoryFromCache: 0,
        goBack: 0,
        popModal: 0
    };
    
    // שמירת מצב לפני ואחרי
    const stateTracker = {
        snapshots: [],
        currentSnapshot: null
    };
    
    /**
     * יצירת snapshot של המצב הנוכחי
     */
    function createSnapshot(label, details = {}) {
        const snapshot = {
            timestamp: Date.now(),
            label,
            historyLength: manager.modalHistory.length,
            history: manager.modalHistory.map((item, idx) => ({
                index: idx,
                entityType: item.info?.entityType,
                entityId: item.info?.entityId,
                title: item.info?.title || '(no title)',
                hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source),
                sourceInfo: item.info?.sourceInfo || item.info?.source || null,
                hasElement: !!item.element,
                elementId: item.element?.id,
                hasContent: !!item.content,
                contentLength: item.content?.length || 0
            })),
            details
        };
        
        stateTracker.snapshots.push(snapshot);
        stateTracker.currentSnapshot = snapshot;
        
        return snapshot;
    }
    
    /**
     * הדפסת השוואה בין שני snapshots
     */
    function compareSnapshots(before, after, operation) {
        console.group(`🔄 ${operation} - Array Changes`);
        console.log(`📊 Length: ${before.historyLength} → ${after.historyLength}`);
        console.log(`📈 Change: ${after.historyLength - before.historyLength > 0 ? '+' : ''}${after.historyLength - before.historyLength}`);
        
        if (before.historyLength !== after.historyLength) {
            console.log('✅ Array length changed - operation completed');
        } else {
            console.warn('⚠️ Array length UNCHANGED - might be update instead of add!');
        }
        
        // השוואת פריטים
        console.group('📋 Item Comparison');
        for (let i = 0; i < Math.max(before.history.length, after.history.length); i++) {
            const beforeItem = before.history[i];
            const afterItem = after.history[i];
            
            if (!beforeItem && afterItem) {
                console.log(`➕ Item ${i} ADDED:`, {
                    entityType: afterItem.entityType,
                    entityId: afterItem.entityId,
                    title: afterItem.title
                });
            } else if (beforeItem && !afterItem) {
                console.log(`➖ Item ${i} REMOVED:`, {
                    entityType: beforeItem.entityType,
                    entityId: beforeItem.entityId,
                    title: beforeItem.title
                });
            } else if (beforeItem && afterItem) {
                const changed = 
                    beforeItem.entityType !== afterItem.entityType ||
                    beforeItem.entityId !== afterItem.entityId ||
                    beforeItem.title !== afterItem.title ||
                    JSON.stringify(beforeItem.sourceInfo) !== JSON.stringify(afterItem.sourceInfo);
                
                if (changed) {
                    console.log(`🔄 Item ${i} MODIFIED:`, {
                        before: {
                            entityType: beforeItem.entityType,
                            entityId: beforeItem.entityId,
                            title: beforeItem.title,
                            sourceInfo: beforeItem.sourceInfo
                        },
                        after: {
                            entityType: afterItem.entityType,
                            entityId: afterItem.entityId,
                            title: afterItem.title,
                            sourceInfo: afterItem.sourceInfo
                        }
                    });
                }
            }
        }
        console.groupEnd();
        console.groupEnd();
    }
    
    // Override pushModal
    manager.pushModal = async function(modalElement, modalInfo) {
        callCounter.pushModal++;
        const callId = `pushModal-${callCounter.pushModal}`;
        
        const beforeSnapshot = createSnapshot(`Before ${callId}`, {
            callId,
            modalElementId: modalElement?.id,
            modalInfo: modalInfo ? {
                entityType: modalInfo.entityType,
                entityId: modalInfo.entityId,
                title: modalInfo.title,
                sourceInfo: modalInfo.sourceInfo || modalInfo.source
            } : null
        });
        
        console.group(`🚀 [${callId}] pushModal CALLED`);
        console.log('📥 Input:', {
            modalElementId: modalElement?.id,
            modalInfo: modalInfo ? {
                entityType: modalInfo.entityType,
                entityId: modalInfo.entityId,
                title: modalInfo.title,
                hasSourceInfo: !!(modalInfo.sourceInfo || modalInfo.source),
                sourceInfo: modalInfo.sourceInfo || modalInfo.source
            } : null,
            currentHistoryLength: manager.modalHistory.length
        });
        
        try {
            const result = await originalPushModal.call(this, modalElement, modalInfo);
            
            const afterSnapshot = createSnapshot(`After ${callId}`, {
                callId,
                result
            });
            
            compareSnapshots(beforeSnapshot, afterSnapshot, `pushModal ${callCounter.pushModal}`);
            
            console.log('✅ pushModal completed');
            console.groupEnd();
            
            return result;
        } catch (error) {
            console.error(`❌ [${callId}] pushModal ERROR:`, error);
            console.groupEnd();
            throw error;
        }
    };
    
    // Override handleModalShown
    manager.handleModalShown = async function(modalElement) {
        callCounter.handleModalShown++;
        const callId = `handleModalShown-${callCounter.handleModalShown}`;
        
        const beforeSnapshot = createSnapshot(`Before ${callId}`, {
            callId,
            modalElementId: modalElement?.id
        });
        
        console.group(`🔵 [${callId}] handleModalShown CALLED`);
        console.log('📥 Input:', {
            modalElementId: modalElement?.id,
            currentHistoryLength: manager.modalHistory.length
        });
        
        try {
            await originalHandleModalShown.call(this, modalElement);
            
            const afterSnapshot = createSnapshot(`After ${callId}`, {
                callId
            });
            
            compareSnapshots(beforeSnapshot, afterSnapshot, `handleModalShown ${callCounter.handleModalShown}`);
            
            console.log('✅ handleModalShown completed');
            console.groupEnd();
        } catch (error) {
            console.error(`❌ [${callId}] handleModalShown ERROR:`, error);
            console.groupEnd();
            throw error;
        }
    };
    
    // Override updateModalNavigation
    manager.updateModalNavigation = function(modalElement) {
        callCounter.updateModalNavigation++;
        const callId = `updateModalNavigation-${callCounter.updateModalNavigation}`;
        
        console.log(`🔹 [${callId}] updateModalNavigation called`, {
            modalElementId: modalElement?.id,
            historyLength: manager.modalHistory.length
        });
        
        return originalUpdateModalNavigation.call(this, modalElement);
    };
    
    // Override saveHistoryToCache
    manager.saveHistoryToCache = async function() {
        callCounter.saveHistoryToCache++;
        const callId = `saveHistoryToCache-${callCounter.saveHistoryToCache}`;
        
        const beforeSnapshot = createSnapshot(`Before ${callId}`, {
            callId,
            operation: 'saveToCache'
        });
        
        console.log(`💾 [${callId}] saveHistoryToCache called`, {
            historyLength: manager.modalHistory.length
        });
        
        try {
            await originalSaveHistoryToCache.call(this);
            
            // בדיקה אם מה שנשמר זהה למה שיש במערך
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                const cached = await window.UnifiedCacheManager.get('modal-navigation-history', {
                    layer: 'localStorage',
                    fallback: () => null
                });
                
                console.log(`✅ [${callId}] saveHistoryToCache completed`, {
                    savedLength: cached?.length || 0,
                    arrayLength: manager.modalHistory.length,
                    match: (cached?.length || 0) === manager.modalHistory.length
                });
            }
        } catch (error) {
            console.error(`❌ [${callId}] saveHistoryToCache ERROR:`, error);
            throw error;
        }
    };
    
    // Override loadHistoryFromCache
    manager.loadHistoryFromCache = async function() {
        callCounter.loadHistoryFromCache++;
        const callId = `loadHistoryFromCache-${callCounter.loadHistoryFromCache}`;
        
        console.log(`📥 [${callId}] loadHistoryFromCache called`);
        
        try {
            await originalLoadHistoryFromCache.call(this);
            
            const afterSnapshot = createSnapshot(`After ${callId}`, {
                callId,
                operation: 'loadFromCache'
            });
            
            console.log(`✅ [${callId}] loadHistoryFromCache completed`, {
                historyLength: manager.modalHistory.length,
                loadedItems: manager.modalHistory.map((item, idx) => ({
                    index: idx,
                    entityType: item.info?.entityType,
                    entityId: item.info?.entityId,
                    title: item.info?.title
                }))
            });
        } catch (error) {
            console.error(`❌ [${callId}] loadHistoryFromCache ERROR:`, error);
            throw error;
        }
    };
    
    // Override goBack
    manager.goBack = async function() {
        callCounter.goBack++;
        const callId = `goBack-${callCounter.goBack}`;
        
        const beforeSnapshot = createSnapshot(`Before ${callId}`, {
            callId,
            operation: 'goBack'
        });
        
        console.group(`🔙 [${callId}] goBack CALLED`);
        console.log('📥 Current state:', {
            historyLength: manager.modalHistory.length,
            history: manager.modalHistory.map((item, idx) => ({
                index: idx,
                entityType: item.info?.entityType,
                entityId: item.info?.entityId,
                title: item.info?.title
            }))
        });
        
        try {
            const result = await originalGoBack.call(this);
            
            const afterSnapshot = createSnapshot(`After ${callId}`, {
                callId,
                result
            });
            
            compareSnapshots(beforeSnapshot, afterSnapshot, `goBack ${callCounter.goBack}`);
            
            console.log('✅ goBack completed');
            console.groupEnd();
            
            return result;
        } catch (error) {
            console.error(`❌ [${callId}] goBack ERROR:`, error);
            console.groupEnd();
            throw error;
        }
    };
    
    // Override popModal
    manager.popModal = function() {
        callCounter.popModal++;
        const callId = `popModal-${callCounter.popModal}`;
        
        const beforeSnapshot = createSnapshot(`Before ${callId}`, {
            callId,
            operation: 'popModal'
        });
        
        console.group(`➖ [${callId}] popModal CALLED`);
        console.log('📥 Current state:', {
            historyLength: manager.modalHistory.length
        });
        
        const result = originalPopModal.call(this);
        
        const afterSnapshot = createSnapshot(`After ${callId}`, {
            callId,
            result
        });
        
        compareSnapshots(beforeSnapshot, afterSnapshot, `popModal ${callCounter.popModal}`);
        
        console.log('✅ popModal completed');
        console.groupEnd();
        
        return result;
    };
    
    // פונקציה להדפסת סיכום
    window.modalNavigationMonitorSummary = function() {
        console.group('📊 Modal Navigation Monitor Summary');
        console.log('📈 Call Counts:', callCounter);
        console.log('📸 Snapshots:', stateTracker.snapshots.length);
        console.log('📋 Current State:', {
            historyLength: manager.modalHistory.length,
            history: manager.modalHistory.map((item, idx) => ({
                index: idx,
                entityType: item.info?.entityType,
                entityId: item.info?.entityId,
                title: item.info?.title,
                hasSourceInfo: !!(item.info?.sourceInfo || item.info?.source)
            }))
        });
        
        // מציאת פעולות שהוסיפו פריטים
        const addOperations = [];
        const updateOperations = [];
        
        for (let i = 1; i < stateTracker.snapshots.length; i++) {
            const before = stateTracker.snapshots[i - 1];
            const after = stateTracker.snapshots[i];
            
            if (after.historyLength > before.historyLength) {
                addOperations.push({
                    label: after.label,
                    added: after.historyLength - before.historyLength
                });
            } else if (after.historyLength === before.historyLength) {
                // בדיקה אם משהו השתנה
                const changed = before.history.some((item, idx) => {
                    const afterItem = after.history[idx];
                    return !afterItem || 
                           item.entityType !== afterItem.entityType ||
                           item.entityId !== afterItem.entityId;
                });
                
                if (changed) {
                    updateOperations.push({
                        label: after.label,
                        type: 'update'
                    });
                }
            }
        }
        
        console.log('➕ Add Operations:', addOperations);
        console.log('🔄 Update Operations:', updateOperations);
        
        console.groupEnd();
    };
    
    // פונקציה לניקוי ניטור
    window.modalNavigationMonitorReset = function() {
        manager.pushModal = originalPushModal;
        manager.handleModalShown = originalHandleModalShown;
        manager.updateModalNavigation = originalUpdateModalNavigation;
        manager.saveHistoryToCache = originalSaveHistoryToCache;
        manager.loadHistoryFromCache = originalLoadHistoryFromCache;
        manager.goBack = originalGoBack;
        manager.popModal = originalPopModal;
        
        callCounter = {
            pushModal: 0,
            handleModalShown: 0,
            updateModalNavigation: 0,
            saveHistoryToCache: 0,
            loadHistoryFromCache: 0,
            goBack: 0,
            popModal: 0
        };
        
        stateTracker.snapshots = [];
        stateTracker.currentSnapshot = null;
        
        console.log('✅ Modal Navigation Monitor reset - all hooks removed');
    };
    
    console.log('✅ Modal Navigation Monitor activated!');
    console.log('📊 Use window.modalNavigationMonitorSummary() to see summary');
    console.log('🔄 Use window.modalNavigationMonitorReset() to stop monitoring');
    
    // הדפסת מצב ראשוני
    createSnapshot('Initial State', { operation: 'init' });
    console.log('📋 Initial State:', {
        historyLength: manager.modalHistory.length,
        history: manager.modalHistory.map((item, idx) => ({
            index: idx,
            entityType: item.info?.entityType,
            entityId: item.info?.entityId,
            title: item.info?.title
        }))
    });
    
})();





