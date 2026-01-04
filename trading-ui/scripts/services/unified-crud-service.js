/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 8
 * 
 * CRUD OPERATIONS (3)
 * - saveEntity(entityType, entityData, options) - שמירה כללית (יצירה או עדכון)
 * - updateEntity(entityType, entityId, entityData, options) - עדכון כללי
 * - deleteEntity(entityType, entityId, options) - מחיקה כללית
 * 
 * UTILITIES (5)
 * - _getEntityAPIEndpoint(entityType) - קבלת endpoint API לפי סוג ישות
 * - _getEntityActionName(entityType, operation) - קבלת שם פעולה לניקוי מטמון
 * - _isValidEntityType(entityType) - בדיקה אם סוג ישות תקין
 * - _getDefaultReloadFunction(entityType) - קבלת פונקציית רענון ברירת מחדל לפי סוג ישות
 * - _getEntityServiceMethod(entityType, operation) - קבלת פונקציית שירות ישות (אם קיימת)
 * 
 * ==========================================
 */

/**
 * Unified CRUD Service - TikTrack
 * ================================
 * 
 * שירות מאוחד לפעולות CRUD עבור כל הישויות במערכת.
 * משתמש במערכות הקיימות: DataCollectionService, CRUDResponseHandler, CacheSyncManager, ModalManagerV2
 * 
 * תכונות:
 * - שמירה כללית (יצירה או עדכון) - saveEntity
 * - עדכון כללי - updateEntity
 * - מחיקה כללית - deleteEntity
 * - אינטגרציה מלאה עם מערכות קיימות
 * - ניקוי מטמון אוטומטי
 * - סגירת מודלים אוטומטית
 * - רענון טבלאות אוטומטי
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * תיעוד: documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_CRUD_SYSTEM.md
 */

// ===== UNIFIED CRUD SERVICE =====

class UnifiedCRUDService {
    /**
     * שמירה כללית (יצירה או עדכון)
     * 
     * שומר ישות חדשה או מעדכן ישות קיימת.
     * משתמש ב-DataCollectionService לאיסוף נתונים, CRUDResponseHandler לטיפול בתגובות,
     * CacheSyncManager לניקוי מטמון, ו-ModalManagerV2 לסגירת מודלים.
     * 
     * @param {string} entityType - סוג הישות (trade, trade_plan, alert, ticker, trading_account, execution, cash_flow, note)
     * @param {Object} entityData - נתוני הישות לשמירה
     * @param {Object} options - אופציות נוספות
     * @param {string} [options.modalId] - מזהה המודל לסגירה
     * @param {string} [options.successMessage] - הודעת הצלחה מותאמת אישית
     * @param {string} [options.entityName] - שם הישות בעברית (למטרות הודעות)
     * @param {Function} [options.reloadFn] - פונקציית רענון מותאמת אישית
     * @param {boolean} [options.requiresHardReload=false] - האם נדרש hard reload
     * @param {Object} [options.fieldMap] - מפת שדות לאיסוף נתונים (אם לא סופק entityData)
     * @param {string} [options.formId] - מזהה הטופס לאיסוף נתונים (אם לא סופק entityData)
     * @returns {Promise<Object|null>} - נתוני התגובה או null במקרה של שגיאה
     * @throws {Error} When entityType is invalid or required data is missing
     * 
     * @example
     * // Save new trade
     * const result = await UnifiedCRUDService.saveEntity('trade', {
     *   trading_account_id: 1,
     *   ticker_id: 2,
     *   status: 'open',
     *   side: 'Long'
     * }, {
     *   modalId: 'tradesModal',
     *   successMessage: 'טרייד נוסף בהצלחה',
     *   entityName: 'טרייד',
     *   reloadFn: () => window.loadTradesData()
     * });
     * 
     * @example
     * // Save using form data collection
     * const result = await UnifiedCRUDService.saveEntity('note', null, {
     *   modalId: 'notesModal',
     *   fieldMap: {
     *     content: { id: 'noteContent', type: 'rich-text' },
     *     related_type_id: { id: 'noteRelatedType', type: 'text' },
     *     related_id: { id: 'noteRelatedObject', type: 'int' }
     *   }
     * });
     */
    static async saveEntity(entityType, entityData, options = {}) {
        window.Logger?.debug('UnifiedCRUDService.saveEntity called', {
            entityType,
            hasEntityData: !!entityData,
            options,
            page: 'unified-crud-service'
        });

        try {
            // Validate entity type
            if (!this._isValidEntityType(entityType)) {
                throw new Error(`Invalid entity type: ${entityType}`);
            }

            // Collect data if not provided
            let data = entityData;
            if (!data && options.fieldMap) {
                if (!window.DataCollectionService) {
                    throw new Error('DataCollectionService not available');
                }
                data = window.DataCollectionService.collectFormData(options.fieldMap);
                window.Logger?.info(`🔍 DEBUG: Collected formData for ${entityType}:`, data);
                window.Logger?.debug('Collected form data', { data, page: 'unified-crud-service' });
            } else if (!data && options.formId) {
                // Fallback: try to collect from form directly
                const form = document.getElementById(options.formId);
                if (!form) {
                    throw new Error(`Form not found: ${options.formId}`);
                }
                // This is a simplified collection - should use fieldMap for better control
                data = {};
                window.Logger?.warn('Using simplified form collection - consider using fieldMap', {
                    formId: options.formId,
                    page: 'unified-crud-service'
                });
            }

            if (!data || Object.keys(data).length === 0) {
                throw new Error('No data provided for save operation');
            }

            // Determine if this is create or update
            // Special handling for user_profile - always update (PUT) current user profile
            const isUserProfile = entityType === 'user_profile';
            const isEdit = isUserProfile ? true : (options.isEdit || data.id || (options.formId && document.getElementById(options.formId)?.dataset.mode === 'edit'));
            const entityId = isEdit ? (data.id || options.entityId) : null;

            // Get API endpoint
            const endpoint = this._getEntityAPIEndpoint(entityType);
            // user_profile always uses /api/auth/me without ID
            const url = isUserProfile ? endpoint : (entityId ? `${endpoint}/${entityId}` : endpoint);
            const method = isUserProfile ? 'PUT' : (entityId ? 'PUT' : 'POST');

            window.Logger?.info(`Saving ${entityType}`, {
                method,
                url,
                isEdit,
                entityId,
                page: 'unified-crud-service'
            });

            // Prepare payload
            const payload = { ...data };
            if (entityId && payload.id) {
                // Remove id from payload for update (backend handles it from URL)
                delete payload.id;
            }

            // Special handling for tag_category: convert order to order_index and remove description
            if (entityType === 'tag_category') {
                if (payload.order !== undefined) {
                    payload.order_index = payload.order;
                    delete payload.order;
                }
                // Remove description field - backend API doesn't support it
                if (payload.description !== undefined) {
                    delete payload.description;
                }
            }

            // Special handling for alerts: convert alertStatusCombined to status + is_triggered
            if (entityType === 'alert' && payload.status) {
                // Check if status is a combined value (new, active, unread, read, cancelled)
                const combinedState = payload.status;
                const mapping = {
                    'new': { status: 'open', is_triggered: 'false' },
                    'active': { status: 'open', is_triggered: 'new' },
                    'unread': { status: 'closed', is_triggered: 'new' },
                    'read': { status: 'closed', is_triggered: 'true' },
                    'cancelled': { status: 'cancelled', is_triggered: 'false' }
                };
                
                if (mapping[combinedState]) {
                    payload.status = mapping[combinedState].status;
                    payload.is_triggered = mapping[combinedState].is_triggered;
                }
            }

            // Send to API
            let response;
            let isServiceResult = false;
            const useService = this._getEntityServiceMethod(entityType, method === 'POST' ? 'create' : 'update');
            
            if (useService && entityId) {
                // For update operations, check service signature
                // Watch lists services expect (listId, payload, options) signature
                // Note services expect (noteId, { payload: ... }) signature
                // Alert services expect (alertId, payload, options) signature
                let serviceResult;
                if (entityType === 'watch_list' || entityType === 'alert') {
                    // Watch lists and alert services expect (id, payload, options) signature
                    serviceResult = await useService(entityId, payload, {});
                } else if (entityType === 'note') {
                    // Note services expect (noteId, { payload: ... }) signature
                    serviceResult = await useService(entityId, { payload });
                } else {
                    // Other services might have different signatures
                    serviceResult = await useService(entityId, payload);
                }
                // Check if service returns Response object or result object
                if (serviceResult instanceof Response) {
                    response = serviceResult;
                } else {
                    // Service returned result object directly - handle it
                    isServiceResult = true;
                    response = serviceResult;
                }
            } else if (useService && !entityId) {
                // For create operations, check service signature
                // Some services (like NotesData.createNote) expect { payload: ... } instead of direct payload
                // But watch_list, execution, cash_flow, and alert services expect (payload, options) signature
                let serviceResult;
                if (entityType === 'watch_list' || entityType === 'execution' || entityType === 'cash_flow' || entityType === 'alert' || entityType === 'trading_account' || entityType === 'ticker' || entityType === 'trade') {
                    // Watch lists, execution, cash_flow, alert, trading_account, ticker, and trade services expect (payload, options) signature
                    window.Logger?.info('🔍 DEBUG: Calling service with payload:', payload, 'entityType:', entityType);
                    serviceResult = await useService(payload, {});
                } else {
                    // Other services might expect { payload: ... } format
                    const serviceOptions = { payload: payload };
                    serviceResult = await useService(serviceOptions);
                }
                // Check if service returns Response object or result object
                if (serviceResult instanceof Response) {
                    response = serviceResult;
                } else {
                    // Service returned result object directly - handle it
                    isServiceResult = true;
                    response = serviceResult;
                }
            } else {
                // Fallback to direct fetch
                response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            }

            // Handle response with CRUDResponseHandler
            const crudOptions = {
                modalId: options.modalId,
                successMessage: options.successMessage || (entityId 
                    ? `${options.entityName || entityType} עודכן בהצלחה!`
                    : `${options.entityName || entityType} נוסף בהצלחה!`),
                entityName: options.entityName || entityType,
                reloadFn: options.reloadFn || this._getDefaultReloadFunction(entityType),
                requiresHardReload: options.requiresHardReload || false,
                returnErrorDetails: options.returnErrorDetails || false // Pass through for testing context
            };

            let crudResult = null;
            if (isServiceResult) {
                // Service already handled the response and returned result object
                // Just need to handle modal closing and notifications
                if (response && response.status === 'success' && response.data) {
                    // Show success notification
                    if (typeof window.showSuccessNotification === 'function') {
                        window.showSuccessNotification('הצלחה', crudOptions.successMessage);
                    }
                    
                    // Close modal
                    if (crudOptions.modalId && window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                        window.ModalManagerV2.hideModal(crudOptions.modalId);
                    } else if (crudOptions.modalId && bootstrap?.Modal) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById(crudOptions.modalId));
                        if (modal) {
                            modal.hide();
                        }
                    }
                    
                    // Reload table if needed
                    if (crudOptions.reloadFn && typeof crudOptions.reloadFn === 'function') {
                        await crudOptions.reloadFn();
                    }
                    
                    crudResult = response;
                } else {
                    // Service returned error - show error notification
                    const errorMessage = response?.error || response?.message || 'שמירה נכשלה';
                    if (typeof window.showErrorNotification === 'function') {
                        window.showErrorNotification('שגיאה', errorMessage);
                    }
                    crudResult = null;
                }
            } else {
                // Standard Response object - use CRUDResponseHandler
                if (entityId) {
                    crudResult = await window.CRUDResponseHandler?.handleUpdateResponse?.(response, crudOptions);
                } else {
                    crudResult = await window.CRUDResponseHandler?.handleSaveResponse?.(response, crudOptions);
                }
            }

            // Invalidate cache
            const actionName = this._getEntityActionName(entityType, entityId ? 'updated' : 'created');
            if (window.CacheSyncManager?.invalidateByAction) {
                try {
                    await window.CacheSyncManager.invalidateByAction(actionName);
                    window.Logger?.debug('Cache invalidated', { actionName, page: 'unified-crud-service' });
                } catch (cacheError) {
                    window.Logger?.warn('Cache invalidation failed', { error: cacheError, page: 'unified-crud-service' });
                }
            }

            window.Logger?.info(`${entityType} saved successfully`, {
                entityId: entityId || crudResult?.data?.id || crudResult?.id,
                page: 'unified-crud-service'
            });

            return crudResult;

        } catch (error) {
            window.Logger?.error(`Error saving ${entityType}:`, error, { page: 'unified-crud-service' });
            
            // Use CRUDResponseHandler for error handling if available
            if (window.CRUDResponseHandler?.handleError) {
                window.CRUDResponseHandler.handleError(error, `שמירת ${options.entityName || entityType}`);
            } else if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', error.message || `לא ניתן לשמור את ${options.entityName || entityType}`);
            }
            
            return null;
        }
    }

    /**
     * יצירה כללית
     *
     * יוצר ישות חדשה.
     *
     * @param {string} entityType - סוג הישות
     * @param {Object} entityData - נתוני הישות ליצירה
     * @param {Object} options - אופציות נוספות (כמו saveEntity)
     * @returns {Promise<Object|null>} - נתוני התגובה או null במקרה של שגיאה
     *
     * @example
     * // Create trade
     * const result = await UnifiedCRUDService.create('trade', {
     *   symbol: 'AAPL',
     *   side: 'buy',
     *   quantity: 100
     * }, {
     *   modalId: 'tradesModal',
     *   successMessage: 'טרייד נוצר בהצלחה',
     *   entityName: 'טרייד'
     * });
     */
    static async create(entityType, entityData, options = {}) {
        // region agent log - HYPOTHESIS: UnifiedCRUDService.create called
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                location:'unified-crud-service.js:create',
                message:'UnifiedCRUDService.create called',
                data:{
                    entityType,
                    options,
                    hasLogger: !!window.Logger,
                    isInIframe: window !== window.top,
                    windowUnifiedCRUD: typeof window.UnifiedCRUDService,
                    iframeUnifiedCRUD: window !== window.top ? typeof window.top.UnifiedCRUDService : 'not-iframe'
                },
                timestamp:Date.now(),
                sessionId:'debug-session',
                runId:'unified-crud-service-debug',
                hypothesisId:'CRUD_SERVICE_CREATE_CALL'
            })
        }).catch(()=>{});
        // endregion

        window.Logger?.debug('UnifiedCRUDService.create called', {
            entityType,
            options,
            page: 'unified-crud-service'
        });

        return await this.saveEntity(entityType, entityData, {
            ...options,
            isEdit: false
        });
    }

    /**
     * עדכון כללי
     * 
     * מעדכן ישות קיימת.
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} entityData - נתוני הישות לעדכון
     * @param {Object} options - אופציות נוספות (כמו saveEntity)
     * @returns {Promise<Object|null>} - נתוני התגובה או null במקרה של שגיאה
     * 
     * @example
     * // Update trade
     * const result = await UnifiedCRUDService.updateEntity('trade', 123, {
     *   status: 'closed',
     *   closed_at: new Date().toISOString()
     * }, {
     *   modalId: 'tradesModal',
     *   successMessage: 'טרייד עודכן בהצלחה',
     *   entityName: 'טרייד'
     * });
     */
    static async updateEntity(entityType, entityId, entityData, options = {}) {
        window.Logger?.debug('UnifiedCRUDService.updateEntity called', {
            entityType,
            entityId,
            options,
            page: 'unified-crud-service'
        });

        return await this.saveEntity(entityType, { ...entityData, id: entityId }, {
            ...options,
            isEdit: true,
            entityId
        });
    }

    /**
     * מחיקה כללית
     * 
     * מוחק ישות קיימת.
     * משתמש ב-EntityDetailsAPI.deleteEntity אם זמין, אחרת fallback ל-fetch ישיר.
     * 
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אופציות נוספות
     * @param {string} [options.modalId] - מזהה המודל לסגירה
     * @param {string} [options.successMessage] - הודעת הצלחה מותאמת אישית
     * @param {string} [options.entityName] - שם הישות בעברית
     * @param {Function} [options.reloadFn] - פונקציית רענון מותאמת אישית
     * @param {Function} [options.checkLinkedItems] - פונקציית בדיקת פריטים מקושרים
     * @returns {Promise<boolean>} - true אם המחיקה הצליחה, false אחרת
     * 
     * @example
     * // Delete trade
     * const success = await UnifiedCRUDService.deleteEntity('trade', 123, {
     *   modalId: 'tradesModal',
     *   successMessage: 'טרייד נמחק בהצלחה',
     *   entityName: 'טרייד',
     *   reloadFn: () => window.loadTradesData()
     * });
     */
    static async deleteEntity(entityType, entityId, options = {}) {
        window.Logger?.debug('UnifiedCRUDService.deleteEntity called', {
            entityType,
            entityId,
            options,
            page: 'unified-crud-service'
        });

        try {
            // Validate entity type
            if (!this._isValidEntityType(entityType)) {
                throw new Error(`Invalid entity type: ${entityType}`);
            }

            // Check linked items if function provided
            if (options.checkLinkedItems && typeof options.checkLinkedItems === 'function') {
                const hasLinkedItems = await options.checkLinkedItems(entityType, entityId);
                if (hasLinkedItems) {
                    window.Logger?.info('Entity has linked items, deletion cancelled', {
                        entityType,
                        entityId,
                        page: 'unified-crud-service'
                    });
                    return false;
                }
            }

            // Use EntityDetailsAPI if available (but not for import_session - it has custom endpoint)
            // Note: entityDetailsAPI.deleteEntity returns boolean, not Response object
            // entityDetailsAPI already handles confirmation, deletion, notifications, and cache clearing
            let deleteSuccess = false;
            if (window.entityDetailsAPI?.deleteEntity && entityType !== 'import_session') {
                deleteSuccess = await window.entityDetailsAPI.deleteEntity(entityType, entityId);
                
                // entityDetailsAPI already handles confirmation, deletion, notifications, and cache clearing
                // We just need to handle reload and return result
                if (deleteSuccess) {
                    // Reload linked items modal if it's open
                    try {
                        window.Logger?.debug('🔄 Checking if linked items modal is open after delete', {
                            page: 'unified-crud-service'
                        });
                        
                        const linkedItemsModal = document.getElementById('linkedItemsModal');
                        const isModalOpen = linkedItemsModal && linkedItemsModal.classList.contains('show');
                        
                        window.Logger?.debug('🔄 Linked items modal check', {
                            modalExists: !!linkedItemsModal,
                            isModalOpen,
                            page: 'unified-crud-service'
                        });
                        
                        if (isModalOpen) {
                            // Get parent entity info from ModalNavigationService
                            const stack = window.ModalNavigationService?.getStack?.() || [];
                            const linkedItemsEntry = stack.find(entry => entry.modalId === 'linkedItemsModal');
                            
                            window.Logger?.debug('🔄 ModalNavigationService stack check', {
                                stackLength: stack.length,
                                linkedItemsEntryFound: !!linkedItemsEntry,
                                linkedItemsEntry,
                                page: 'unified-crud-service'
                            });
                            
                            if (linkedItemsEntry && linkedItemsEntry.entityType && linkedItemsEntry.entityId) {
                                // Get mode from metadata (warningBlock or view)
                                const modalMode = linkedItemsEntry.metadata?.mode || 'view';
                                
                                window.Logger?.info('🔄 Reloading linked items data after delete', {
                                    entityType: linkedItemsEntry.entityType,
                                    entityId: linkedItemsEntry.entityId,
                                    deletedEntityType: entityType,
                                    deletedEntityId: entityId,
                                    modalMode,
                                    page: 'unified-crud-service'
                                });
                                
                                // Clear cache for linked items before reloading
                                const cacheKey = `linked-items-${linkedItemsEntry.entityType}-${linkedItemsEntry.entityId}`;
                                if (window.UnifiedCacheManager?.invalidate) {
                                    try {
                                        await window.UnifiedCacheManager.invalidate(cacheKey, { layer: 'memory' });
                                        window.Logger?.debug('🔄 Cache invalidated for linked items', {
                                            cacheKey,
                                            page: 'unified-crud-service'
                                        });
                                    } catch (cacheError) {
                                        window.Logger?.warn('⚠️ Failed to invalidate cache', {
                                            cacheKey,
                                            error: cacheError,
                                            page: 'unified-crud-service'
                                        });
                                    }
                                }
                                
                                // Also clear entityDetailsAPI cache if available
                                if (window.entityDetailsAPI?.clearEntityCache) {
                                    try {
                                        window.entityDetailsAPI.clearEntityCache('linked-items', `${linkedItemsEntry.entityType}-${linkedItemsEntry.entityId}`);
                                    } catch (e) {
                                        // Ignore cache clear errors
                                    }
                                }
                                
                                // Reload linked items data with cache busting (force refresh)
                                // Use direct fetch with timestamp to bypass any caching
                                let linkedItemsData = null;
                                try {
                                    const url = `/api/linked-items/${linkedItemsEntry.entityType}/${linkedItemsEntry.entityId}?_t=${Date.now()}`;
                                    window.Logger?.debug('🔄 Fetching linked items from server', {
                                        url,
                                        page: 'unified-crud-service'
                                    });
                                    
                                    const response = await fetch(url, {
                                        method: 'GET',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Cache-Control': 'no-cache'
                                        }
                                    });
                                    
                                    if (response.ok) {
                                        linkedItemsData = await response.json();
                                        window.Logger?.debug('✅ Linked items data fetched from server', {
                                            hasData: !!linkedItemsData,
                                            parentCount: linkedItemsData?.parent_entities?.length || 0,
                                            childCount: linkedItemsData?.child_entities?.length || 0,
                                            page: 'unified-crud-service'
                                        });
                                    } else {
                                        window.Logger?.warn('⚠️ Failed to fetch linked items', {
                                            status: response.status,
                                            page: 'unified-crud-service'
                                        });
                                        // Fallback to loadLinkedItemsData
                                        linkedItemsData = await window.loadLinkedItemsData?.(
                                            linkedItemsEntry.entityType,
                                            linkedItemsEntry.entityId
                                        );
                                    }
                                } catch (fetchError) {
                                    window.Logger?.warn('⚠️ Error fetching linked items, using fallback', {
                                        error: fetchError,
                                        page: 'unified-crud-service'
                                    });
                                    // Fallback to loadLinkedItemsData
                                    linkedItemsData = await window.loadLinkedItemsData?.(
                                        linkedItemsEntry.entityType,
                                        linkedItemsEntry.entityId
                                    );
                                }
                                
                                window.Logger?.debug('🔄 Linked items data loaded', {
                                    hasData: !!linkedItemsData,
                                    parentCount: linkedItemsData?.parent_entities?.length || 0,
                                    childCount: linkedItemsData?.child_entities?.length || 0,
                                    modalMode,
                                    deletedItemInData: linkedItemsData ? (
                                        (linkedItemsData.parent_entities || []).some(item => item.id === entityId && item.type === entityType) ||
                                        (linkedItemsData.child_entities || []).some(item => item.id === entityId && item.type === entityType)
                                    ) : false,
                                    page: 'unified-crud-service'
                                });
                                
                                if (linkedItemsData) {
                                    // Find all linked items tables in the modal
                                    const tables = linkedItemsModal.querySelectorAll('[id^="linkedItemsTable_"]');
                                    
                                    window.Logger?.debug('🔄 Found linked items tables', {
                                        tablesCount: tables.length,
                                        tableIds: Array.from(tables).map(t => t.id),
                                        page: 'unified-crud-service'
                                    });
                                    
                                    if (tables.length > 0) {
                                        // Determine which items to show based on mode (same logic as in createLinkedItemsModalContent)
                                        // In warningBlock mode, show only child entities
                                        // In view mode, show parent + child entities
                                        const parentEntities = linkedItemsData.parent_entities || [];
                                        const childEntities = linkedItemsData.child_entities || [];
                                        let allItems = modalMode === 'warningBlock' 
                                            ? childEntities  // Only child entities in warningBlock mode
                                            : [...parentEntities, ...childEntities];  // All entities in view mode
                                        
                                        window.Logger?.info('🔄 Items before enrichment and sorting', {
                                            modalMode,
                                            totalItems: allItems.length,
                                            parentCount: parentEntities.length,
                                            childCount: childEntities.length,
                                            showingOnlyChildren: modalMode === 'warningBlock',
                                            deletedItemInList: allItems.some(item => item.id === entityId && item.type === entityType),
                                            deletedEntityType: entityType,
                                            deletedEntityId: entityId,
                                            allItemsSample: allItems.slice(0, 2),
                                            page: 'unified-crud-service'
                                        });
                                        
                                        // Enrich items using EntityDetailsRenderer (same as in renderLinkedItems)
                                        let enrichedItems = allItems;
                                        if (window.entityDetailsRenderer?._enrichLinkedItems) {
                                            enrichedItems = window.entityDetailsRenderer._enrichLinkedItems(
                                                allItems,
                                                linkedItemsEntry.entityType,
                                                {}
                                            );
                                            window.Logger?.debug('🔄 Items enriched', {
                                                beforeCount: allItems.length,
                                                afterCount: enrichedItems.length,
                                                page: 'unified-crud-service'
                                            });
                                        }
                                        
                                        // Sort items using LinkedItemsService (same as in renderLinkedItems)
                                        if (window.LinkedItemsService?.sortLinkedItems) {
                                            enrichedItems = window.LinkedItemsService.sortLinkedItems(enrichedItems);
                                        }
                                        
                                        window.Logger?.info('🔄 Updating linked items table after delete', {
                                            tableCount: tables.length,
                                            itemsCount: enrichedItems.length,
                                            deletedItemStillInList: enrichedItems.some(item => item.id === entityId && item.type === entityType),
                                            page: 'unified-crud-service'
                                        });
                                        
                                        // Update each table with all items (even if empty - this is normal after deletion)
                                        tables.forEach(table => {
                                            const tableId = table.id;
                                            
                                            window.Logger?.debug('🔄 Updating table', {
                                                tableId,
                                                itemsCount: enrichedItems.length,
                                                willClearTable: enrichedItems.length === 0,
                                                page: 'unified-crud-service'
                                            });
                                            
                                            // Get current row count before update
                                            const tbody = table.querySelector('tbody');
                                            const rowsBefore = tbody ? tbody.querySelectorAll('tr').length : 0;
                                            
                                            window.Logger?.debug('🔄 Table state before update', {
                                                tableId,
                                                rowsBefore,
                                                itemsToShow: enrichedItems.length,
                                                page: 'unified-crud-service'
                                            });
                                            
                                            // Update table using EntityDetailsRenderer
                                            // Note: updateLinkedItemsTableBody will clear the table if enrichedItems is empty
                                            if (window.entityDetailsRenderer?.updateLinkedItemsTableBody) {
                                                window.Logger?.debug('🔄 Calling updateLinkedItemsTableBody', {
                                                    tableId,
                                                    itemsCount: enrichedItems.length,
                                                    page: 'unified-crud-service'
                                                });
                                                window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, enrichedItems);
                                                
                                                // Verify update after a short delay
                                                setTimeout(() => {
                                                    const tbodyAfter = table.querySelector('tbody');
                                                    const rowsAfter = tbodyAfter ? tbodyAfter.querySelectorAll('tr').length : 0;
                                                    const deletedItemStillVisible = tbodyAfter ? 
                                                        Array.from(tbodyAfter.querySelectorAll('tr')).some(row => {
                                                            const rowId = row.getAttribute('data-item-id');
                                                            const rowType = row.getAttribute('data-item-type');
                                                            return rowId === String(entityId) && rowType === entityType;
                                                        }) : false;
                                                    
                                                    window.Logger?.info('✅ Table update verification', {
                                                        tableId,
                                                        rowsBefore,
                                                        rowsAfter,
                                                        expectedRows: enrichedItems.length,
                                                        deletedItemStillVisible,
                                                        page: 'unified-crud-service'
                                                    });
                                                    
                                                    if (deletedItemStillVisible) {
                                                        window.Logger?.warn('⚠️ Deleted item still visible in table!', {
                                                            tableId,
                                                            deletedEntityType: entityType,
                                                            deletedEntityId: entityId,
                                                            page: 'unified-crud-service'
                                                        });
                                                    }
                                                }, 500);
                                                
                                                window.Logger?.debug('✅ Table updated via EntityDetailsRenderer', {
                                                    tableId,
                                                    itemsCount: enrichedItems.length,
                                                    page: 'unified-crud-service'
                                                });
                                            } else if (typeof window.updateLinkedItemsTable === 'function') {
                                                window.updateLinkedItemsTable(tableId, enrichedItems);
                                                window.Logger?.debug('✅ Table updated via updateLinkedItemsTable', {
                                                    tableId,
                                                    itemsCount: enrichedItems.length,
                                                    page: 'unified-crud-service'
                                                });
                                            } else {
                                                window.Logger?.warn('⚠️ No update function available', {
                                                    tableId,
                                                    hasEntityDetailsRenderer: !!window.entityDetailsRenderer,
                                                    hasUpdateLinkedItemsTable: typeof window.updateLinkedItemsTable === 'function',
                                                    page: 'unified-crud-service'
                                                });
                                            }
                                        });
                                        
                                        // Update table data registry with enriched items
                                        if (window.linkedItemsTableData) {
                                            tables.forEach(table => {
                                                const tableId = table.id;
                                                window.linkedItemsTableData[tableId] = enrichedItems;
                                            });
                                        }
                                        
                                        // Update TableDataRegistry if available
                                        if (window.TableDataRegistry) {
                                            tables.forEach(table => {
                                                const tableId = table.id;
                                                const tableType = `linked_items__${linkedItemsEntry.entityType}_${linkedItemsEntry.entityId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
                                                window.TableDataRegistry.setFullData(tableType, enrichedItems, {
                                                    tableId,
                                                    resetFiltered: false
                                                });
                                            });
                                        }
                                        
                                        window.Logger?.info('✅ Linked items modal refreshed after delete', {
                                            entityType: linkedItemsEntry.entityType,
                                            entityId: linkedItemsEntry.entityId,
                                            itemsCount: enrichedItems.length,
                                            deletedItemStillInList: enrichedItems.some(item => item.id === entityId && item.type === entityType),
                                            page: 'unified-crud-service'
                                        });
                                    } else {
                                        window.Logger?.warn('⚠️ No linked items tables found in modal', {
                                            page: 'unified-crud-service'
                                        });
                                    }
                                } else {
                                    window.Logger?.warn('⚠️ Failed to load linked items data', {
                                        page: 'unified-crud-service'
                                    });
                                }
                            } else {
                                window.Logger?.warn('⚠️ Linked items entry not found in ModalNavigationService', {
                                    page: 'unified-crud-service'
                                });
                            }
                        } else {
                            window.Logger?.debug('ℹ️ Linked items modal is not open, skipping refresh', {
                                page: 'unified-crud-service'
                            });
                        }
                    } catch (refreshError) {
                        window.Logger?.error('❌ Error refreshing linked items modal after delete', {
                            error: refreshError,
                            stack: refreshError.stack,
                            page: 'unified-crud-service'
                        });
                        window.Logger?.error('Error refreshing linked items modal:', refreshError);
                    }
                    
                    // Reload data if function provided
                    if (options.reloadFn && typeof options.reloadFn === 'function') {
                        try {
                            await options.reloadFn();
                        } catch (reloadError) {
                            window.Logger?.warn('Error in reload function after delete', {
                                error: reloadError,
                                page: 'unified-crud-service'
                            });
                        }
                    }
                }
            } else {
                // Fallback to direct fetch (for import_session or when entityDetailsAPI not available)
                // First, show confirmation dialog if not already confirmed
                let confirmed = false;
                if (options.skipConfirmation) {
                    confirmed = true;
                } else if (typeof window.showConfirmationDialog === 'function') {
                    // Use global confirmation dialog
                    const entityName = options.entityName || entityType;
                    const confirmationMessage = `האם אתה בטוח שברצונך למחוק את ${entityName} #${entityId}?\n\nפעולה זו תמחק את הפריט לצמיתות.`;
                    
                    confirmed = await new Promise((resolve) => {
                        window.showConfirmationDialog(
                            `מחיקת ${entityName}`,
                            confirmationMessage,
                            () => {
                                resolve(true);
                            },
                            () => {
                                resolve(false);
                            },
                            'danger'
                        );
                    });
                } else {
                    // Fallback to simple confirm
                    const entityName = options.entityName || entityType;
                    confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את ${entityName} #${entityId}?`);
                }
                
                if (!confirmed) {
                    window.Logger?.info('Deletion cancelled by user', {
                        entityType,
                        entityId,
                        page: 'unified-crud-service'
                    });
                    return false;
                }
                
                // Proceed with deletion
                const endpoint = this._getEntityAPIEndpoint(entityType);
                const url = `${endpoint}/${entityId}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow' // Follow redirects (302)
                });

                // Invalidate cache BEFORE handling response (critical for fresh data)
                // Use standard cache invalidation pattern (same as all other data services)
                const actionName = this._getEntityActionName(entityType, 'deleted');
                
                // For import_session, use DataImportData service (standard pattern)
                if (entityType === 'import_session') {
                    if (window.DataImportData?.invalidateHistoryCache) {
                        try {
                            await window.DataImportData.invalidateHistoryCache();
                            window.Logger?.debug('Cache invalidated via DataImportData (standard pattern)', { page: 'unified-crud-service' });
                        } catch (cacheError) {
                            window.Logger?.warn('Cache invalidation failed', { error: cacheError, page: 'unified-crud-service' });
                        }
                    }
                } else {
                    // For other entities, use CacheSyncManager.invalidateByAction (standard pattern)
                    // This handles both Backend Cache (via CacheSyncManager) and Frontend Cache (via fallback in data services)
                    if (window.CacheSyncManager?.invalidateByAction) {
                        try {
                            await window.CacheSyncManager.invalidateByAction(actionName);
                            window.Logger?.debug('Cache invalidated via CacheSyncManager (standard pattern)', { actionName, page: 'unified-crud-service' });
                        } catch (cacheError) {
                            window.Logger?.warn('Cache invalidation failed', { error: cacheError, page: 'unified-crud-service' });
                        }
                    }
                }

                // Handle response with CRUDResponseHandler (same as other delete operations)
                const crudOptions = {
                    modalId: options.modalId,
                    successMessage: options.successMessage || `${options.entityName || entityType} נמחק בהצלחה!`,
                    entityName: options.entityName || entityType,
                    reloadFn: options.reloadFn || this._getDefaultReloadFunction(entityType),
                    requiresHardReload: options.requiresHardReload || false
                };

                const crudResult = await window.CRUDResponseHandler?.handleDeleteResponse?.(response, crudOptions);
                deleteSuccess = crudResult !== null && crudResult !== false;
            }

            // Invalidate cache for entityDetailsAPI path (already handled above for fallback path)
            if (deleteSuccess && window.entityDetailsAPI?.deleteEntity && entityType !== 'import_session') {
                // entityDetailsAPI already handles cache invalidation, but we ensure it's done
                const actionName = this._getEntityActionName(entityType, 'deleted');
                if (window.CacheSyncManager?.invalidateByAction) {
                    try {
                        await window.CacheSyncManager.invalidateByAction(actionName);
                        window.Logger?.debug('Cache invalidated (entityDetailsAPI path)', { actionName, page: 'unified-crud-service' });
                    } catch (cacheError) {
                        window.Logger?.warn('Cache invalidation failed', { error: cacheError, page: 'unified-crud-service' });
                    }
                }
            }

            if (deleteSuccess) {
                window.Logger?.info(`${entityType} deleted successfully`, {
                    entityId,
                    page: 'unified-crud-service'
                });
            }

            return deleteSuccess;

        } catch (error) {
            window.Logger?.error(`Error deleting ${entityType}:`, error, { page: 'unified-crud-service' });
            
            // Use CRUDResponseHandler for error handling if available
            if (window.CRUDResponseHandler?.handleError) {
                window.CRUDResponseHandler.handleError(error, `מחיקת ${options.entityName || entityType}`);
            } else if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', error.message || `לא ניתן למחוק את ${options.entityName || entityType}`);
            }
            
            return false;
        }
    }

    /**
     * קבלת endpoint API לפי סוג ישות
     * 
     * @private
     * @param {string} entityType - סוג הישות
     * @returns {string} - endpoint API
     */
    static _getEntityAPIEndpoint(entityType) {
        const endpointMap = {
            'trade': '/api/trades',
            'trade_plan': '/api/trade-plans',
            'alert': '/api/alerts',
            'ticker': '/api/tickers',
            'trading_account': '/api/trading-accounts',
            'execution': '/api/executions',
            'cash_flow': '/api/cash-flows',
            'note': '/api/notes',
            'watch_list': '/api/watch_lists',
            'import_session': '/api/user-data-import/session',
            'tag': '/api/tags',
            'tag_category': '/api/tags/categories',
            'trading_journal': '/api/trading_journal',
            'preference_profile': '/api/preference-profiles',
            'user_profile': '/api/auth/me' // Special endpoint for user profile - uses PUT to update current user
        };

        return endpointMap[entityType] || `/api/${entityType}`;
    }

    /**
     * קבלת שם פעולה לניקוי מטמון
     * 
     * מחזיר שם פעולה התואם ל-CacheSyncManager.invalidationPatterns
     * 
     * @private
     * @param {string} entityType - סוג הישות
     * @param {string} operation - סוג הפעולה (created, updated, deleted)
     * @returns {string} - שם הפעולה
     */
    static _getEntityActionName(entityType, operation) {
        const entityNameMap = {
            'trade': 'trade',
            'trade_plan': 'trade-plan',
            'alert': 'alert',
            'ticker': 'ticker',
            'trading_account': 'account',
            'execution': 'execution',
            'cash_flow': 'cash-flow',
            'note': 'note',
            'watch_list': 'watch-list',
            'import_session': 'import-session',
            'tag': 'tag',
            'tag_category': 'tag-category',
            'trading_journal': 'trading-journal',
            'preference_profile': 'preference-profile',
            'user_profile': 'user-profile'
        };

        const entityName = entityNameMap[entityType] || entityType;
        
        // טיפול מיוחד ב-ticker (רק updated קיים ב-CacheSyncManager)
        if (entityType === 'ticker' && operation !== 'updated') {
            window.Logger?.warn(`Ticker ${operation} action not supported in CacheSyncManager, using ticker-updated`, {
                operation,
                page: 'unified-crud-service'
            });
            return 'ticker-updated';
        }
        
        return `${entityName}-${operation}`;
    }

    /**
     * בדיקה אם סוג ישות תקין
     * 
     * @private
     * @param {string} entityType - סוג הישות
     * @returns {boolean} - true אם תקין
     */
    static _isValidEntityType(entityType) {
        const validTypes = [
            'trade',
            'trade_plan',
            'alert',
            'ticker',
            'trading_account',
            'execution',
            'cash_flow',
            'note',
            'watch_list',
            'import_session',
            'tag',
            'tag_category',
            'trading_journal',
            'preference_profile',
            'user_profile'
        ];

        return validTypes.includes(entityType);
    }

    /**
     * קבלת פונקציית רענון ברירת מחדל לפי סוג ישות
     * 
     * @private
     * @param {string} entityType - סוג הישות
     * @returns {Function|null} - פונקציית רענון או null
     */
    /**
     * קבלת פונקציית רענון ברירת מחדל לפי סוג ישות
     * 
     * @private
     * @param {string} entityType - סוג הישות
     * @returns {Function|null} - פונקציית רענון או null
     */
    static _getDefaultReloadFunction(entityType) {
        const reloadFunctionMap = {
            'trade': () => window.loadTradesData?.(),
            'trade_plan': () => window.loadTradePlansData?.(),
            'alert': () => window.loadAlertsData?.(),
            'ticker': () => window.loadTickersData?.(),
            'trading_account': () => window.loadTradingAccountsDataForTradingAccountsPage?.(),
            'execution': () => window.loadExecutionsData?.(),
            'cash_flow': () => window.loadCashFlowsData?.(),
            'note': () => window.loadNotesData?.({ force: true }),
            'watch_list': () => window.WatchListsPage?.loadWatchLists?.(),
            'import_session': () => window.refreshDataImportHistory?.()
        };

        return reloadFunctionMap[entityType] || null;
    }

    /**
     * קבלת פונקציית שירות ישות (אם קיימת)
     * 
     * @private
     * @param {string} entityType - סוג הישות
     * @param {string} operation - סוג הפעולה (create, update)
     * @returns {Function|null} - פונקציית שירות או null
     */
    static _getEntityServiceMethod(entityType, operation) {
        const serviceMap = {
            'trade': {
                create: window.TradesData?.saveTrade,
                update: window.TradesData?.updateTrade
            },
            'trade_plan': {
                create: window.TradePlansData?.saveTradePlan,
                update: window.TradePlansData?.updateTradePlan
            },
            'alert': {
                create: window.AlertsData?.createAlert,
                update: window.AlertsData?.updateAlert
            },
            'ticker': {
                create: window.TickersData?.createTicker,
                update: window.TickersData?.updateTicker
            },
            'trading_account': {
                create: window.TradingAccountsData?.createTradingAccount,
                update: window.TradingAccountsData?.updateTradingAccount
            },
            'execution': {
                create: window.ExecutionsData?.createExecution,
                update: window.ExecutionsData?.updateExecution
            },
            'cash_flow': {
                create: window.CashFlowsData?.createCashFlow,
                update: window.CashFlowsData?.updateCashFlow
            },
            'note': {
                create: window.NotesData?.createNote,
                update: window.NotesData?.updateNote
            },
            'watch_list': {
                create: window.WatchListsDataService?.createWatchList,
                update: window.WatchListsDataService?.updateWatchList
            }
        };

        return serviceMap[entityType]?.[operation] || null;
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

// region agent log - HYPOTHESIS: UnifiedCRUDService registration
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
        location:'unified-crud-service.js:registration',
        message:'UnifiedCRUDService being registered to global scope',
        data:{
            isInIframe: window !== window.top,
            hasExistingUnifiedCRUD: !!window.UnifiedCRUDService,
            windowLocation: window.location?.href,
            classMethods: Object.getOwnPropertyNames(UnifiedCRUDService).filter(name => typeof UnifiedCRUDService[name] === 'function')
        },
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'unified-crud-service-registration',
        hypothesisId:'CRUD_SERVICE_REGISTRATION'
    })
}).catch(()=>{});
// endregion

window.UnifiedCRUDService = UnifiedCRUDService;

// region agent log - HYPOTHESIS: UnifiedCRUDService registration complete
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
        location:'unified-crud-service.js:registration-complete',
        message:'UnifiedCRUDService registered successfully',
        data:{
            isInIframe: window !== window.top,
            hasUnifiedCRUD: !!window.UnifiedCRUDService,
            createMethod: typeof window.UnifiedCRUDService?.create,
            windowLocation: window.location?.href
        },
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'unified-crud-service-registration',
        hypothesisId:'CRUD_SERVICE_REGISTRATION_COMPLETE'
    })
}).catch(()=>{});
// endregion

