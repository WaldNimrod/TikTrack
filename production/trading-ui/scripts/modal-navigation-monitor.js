/**
 * Modal Navigation Monitor Script
 * ================================
 *
 * כלי ניטור עבור ModalNavigationService החדש.
 * טען את הסקריפט בקונסול כדי לעקוב אחרי כל הקריאות לשירות הניווט.
 */

(function() {
    'use strict';

    if (!window.ModalNavigationService) {
        console.error('❌ ModalNavigationService not found! Make sure it is initialized.');
        return;
    }

    const service = window.ModalNavigationService;

    const original = {
        registerModalOpen: service.registerModalOpen?.bind(service),
        registerModalClose: service.registerModalClose?.bind(service),
        updateModalMetadata: service.updateModalMetadata?.bind(service),
        goBack: service.goBack?.bind(service),
        navigateTo: service.navigateTo?.bind(service)
    };

    const callCounter = {
        registerModalOpen: 0,
        registerModalClose: 0,
        updateModalMetadata: 0,
        goBack: 0,
        navigateTo: 0
    };

    function snapshot(label, details = {}) {
        const stack = service.getStack ? service.getStack({ includeElements: true }) : [];
        return {
            timestamp: Date.now(),
            label,
            stackLength: stack.length,
            stack: stack.map((entry, index) => ({
                index,
                modalId: entry.modalId,
                modalType: entry.modalType,
                entityType: entry.entityType,
                entityId: entry.entityId,
                title: entry.title,
                sourceInfo: entry.sourceInfo,
                element: entry.element
            })),
            details
        };
    }

    function logStack(label) {
        const snap = snapshot(label);
        console.group(`📚 ${label} (length: ${snap.stackLength})`);
        snap.stack.forEach(item => {
            console.log(`• [${item.index}] ${item.modalId || '(no id)'}`, {
                modalType: item.modalType,
                entityType: item.entityType,
                entityId: item.entityId,
                title: item.title,
                sourceInfo: item.sourceInfo,
                element: item.element
            });
        });
        console.groupEnd();
        return snap;
    }

    function wrapAsync(methodName, originalFn) {
        if (!originalFn) {
            console.warn(`⚠️ ${methodName} is not defined on ModalNavigationService.`);
            return () => Promise.resolve(undefined);
        }

        return async function(...args) {
            callCounter[methodName]++;
            const callId = `${methodName}-${callCounter[methodName]}`;
            console.group(`🚀 [${callId}] ${methodName}`);
            console.log('📥 Input:', args);
            const before = snapshot(`${callId}-before`);
            const result = await originalFn(...args);
            const after = snapshot(`${callId}-after`);
            console.log('📊 Stack length:', `${before.stackLength} → ${after.stackLength}`);
            console.groupEnd();
            return result;
        };
    }

    service.registerModalOpen = wrapAsync('registerModalOpen', original.registerModalOpen);
    service.registerModalClose = wrapAsync('registerModalClose', original.registerModalClose);
    service.updateModalMetadata = wrapAsync('updateModalMetadata', original.updateModalMetadata);
    service.goBack = wrapAsync('goBack', original.goBack);
    service.navigateTo = wrapAsync('navigateTo', original.navigateTo);

    console.log('✅ ModalNavigationService monitor active. Current stack snapshot:');
    logStack('Initial Stack');
})();












