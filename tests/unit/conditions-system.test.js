/**
 * Conditions System Tests
 * =======================
 *
 * Coverage for the refactored conditions module components:
 * - ConditionsCRUDManager utility behaviour (data preparation & caching)
 * - ConditionsFormGenerator form data collection logic
 * - ConditionsUIManager post-save confirmation flow
 */

const fs = require('fs');
const path = require('path');

const loadScript = (relativePath) => {
    const absolutePath = path.join(__dirname, '../../', relativePath);
    return fs.readFileSync(absolutePath, 'utf8');
};

describe('Conditions System', () => {
    let ConditionsCRUDManagerClass;
    let ConditionsUIManagerClass;
    let ConditionsFormGeneratorClass;

    const createLoggerStub = () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    });

    const translationsMap = {
        condition_entity_label: 'תנאי',
        condition_created: 'תנאי נוצר בהצלחה',
        condition_updated: 'תנאי עודכן בהצלחה',
        condition_deleted: 'תנאי נמחק בהצלחה',
        condition_create_error: 'שגיאה ביצירת התנאי',
        condition_update_error: 'שגיאה בעדכון התנאי',
        condition_delete_error: 'שגיאה במחיקת התנאי',
        post_save_prompt_title: 'שמירת תנאי',
        post_save_prompt_base: 'האם תרצה להוסיף תנאי נוסף ל{entityLabel} {entityName}?',
        post_save_prompt_confirm_hint: 'אישור – הוסף תנאי נוסף',
        post_save_prompt_cancel_hint: 'דחייה – חזרה למודול {entityLabel}',
        select_method: 'בחר שיטת מסחר',
        method_parameters: 'פרמטרים לשיטה',
        logical_operator: 'אופרטור לוגי',
        condition_group: 'קבוצת תנאי',
        is_active: 'תנאי פעיל',
        save_condition: 'שמור תנאי',
        add_condition: 'הוסף תנאי'
    };

    const createTranslatorStub = () => ({
        getMessage: jest.fn((key) => translationsMap[key] ?? key),
        getFormLabel: jest.fn((key) => translationsMap[key] ?? key),
        getOperator: jest.fn((key) => key),
        getParameterName: jest.fn((key) => key),
        translateCondition: jest.fn((condition) => condition),
        translateMethod: jest.fn((method) => method)
    });

    const createValidatorStub = () => ({
        validateCondition: jest.fn(() => ({ isValid: true, errors: [], warnings: [] })),
        validateForCreation: jest.fn(() => ({ isValid: true, errors: [] })),
        validateForUpdate: jest.fn(() => ({ isValid: true, errors: [] }))
    });

    beforeAll(() => {
        global.window = global.window || {};
        window.document = window.document || global.document;

        window.Logger = createLoggerStub();

        // Load core scripts
        eval(loadScript('trading-ui/scripts/conditions/conditions-crud-manager.js'));
        eval(loadScript('trading-ui/scripts/conditions/conditions-form-generator.js'));
        eval(loadScript('trading-ui/scripts/conditions/conditions-ui-manager.js'));

        ConditionsCRUDManagerClass = window.ConditionsCRUDManager;
        ConditionsUIManagerClass = window.ConditionsUIManager;
        ConditionsFormGeneratorClass = window.conditionsFormGenerator.constructor;
    });

    beforeEach(() => {
        window.Logger = createLoggerStub();
        window.conditionsTranslations = createTranslatorStub();
        window.conditionsValidator = createValidatorStub();
        window.showNotification = jest.fn();
        window.notificationSystem = null;

        window.CRUDResponseHandler = {
            handleSaveResponse: jest.fn(async () => ({ data: { id: 1 } })),
            handleUpdateResponse: jest.fn(async () => ({ data: { id: 1 } })),
            handleDeleteResponse: jest.fn(async () => true)
        };

        window.conditionsCRUDManager = new ConditionsCRUDManagerClass();
        window.conditionsFormGenerator = new ConditionsFormGeneratorClass();

        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        delete window.showConfirmationDialog;
        delete window.ModalNavigationService;
        delete window.ConditionsModalController;
    });

    describe('ConditionsCRUDManager', () => {
        test('prepareConditionData normalizes numeric fields and booleans', () => {
            const manager = new ConditionsCRUDManagerClass();
            const prepared = manager.prepareConditionData({
                method_id: '7',
                trade_plan_id: '12',
                trade_id: '4',
                id: '42',
                condition_group: '6',
                is_active: 0,
                parameters_json: {
                    threshold: 15.5,
                    signal: 'buy'
                }
            });

            expect(prepared.method_id).toBe(7);
            expect(prepared.trade_plan_id).toBe(12);
            expect(prepared.trade_id).toBe(4);
            expect(prepared.id).toBe(42);
            expect(prepared.condition_group).toBe(6);
            expect(prepared.is_active).toBe(false);
            expect(prepared.parameters_json).toBe(JSON.stringify({ threshold: 15.5, signal: 'buy' }));
        });

        test('getTradingMethods caches non-empty responses and evicts empty payloads', async () => {
            const manager = new ConditionsCRUDManagerClass();
            jest.spyOn(manager, 'requestJson').mockResolvedValueOnce({
                data: [{ id: 2, name: 'Moving Average', method_key: 'moving_average' }]
            });

            const firstResult = await manager.getTradingMethods(false);
            expect(firstResult).toEqual([{ id: 2, name: 'Moving Average', method_key: 'moving_average' }]);
            expect(window.conditionsTranslations.translateMethod).toHaveBeenCalledTimes(1);
            expect(manager.cache.get('trading_methods').data).toHaveLength(1);

            manager.cache.set('trading_methods', {
                data: [{ id: 99, name: 'Legacy Method' }],
                timestamp: Date.now()
            });
            manager.requestJson.mockResolvedValueOnce({ data: [] });

            const secondResult = await manager.getTradingMethods(false);
            expect(secondResult).toEqual([]);
            expect(manager.cache.has('trading_methods')).toBe(false);
        });
    });

    describe('ConditionsFormGenerator', () => {
        test('collectFormData returns normalized payload with typed parameters', () => {
            const generator = new ConditionsFormGeneratorClass();
            generator.containerId = 'conditionsFormContainer';
            generator.currentMethod = {
                parameters: [
                    { parameter_key: 'threshold', parameter_type: 'number' },
                    { parameter_key: 'confirmation', parameter_type: 'boolean' },
                    { parameter_key: 'timeframe', parameter_type: 'dropdown' }
                ]
            };

            document.body.innerHTML = `
                <div id="conditionsFormContainer">
                    <select id="methodSelect">
                        <option value="">בחר שיטת מסחר</option>
                        <option value="5" selected>שיטה לדוגמה</option>
                    </select>
                    <select id="logicalOperator">
                        <option value="NONE">NONE</option>
                        <option value="AND">AND</option>
                    </select>
                    <input id="conditionGroup" type="number" value="3" />
                    <input id="isActive" type="checkbox" checked />
                    <input id="threshold" type="number" value="12.5" />
                    <input id="confirmation" type="checkbox" />
                    <select id="timeframe">
                        <option value="">בחר...</option>
                        <option value="1h" selected>1H</option>
                    </select>
                </div>
            `;

            const data = generator.collectFormData();

            expect(data.method_id).toBe(5);
            expect(data.logical_operator).toBe('NONE');
            expect(data.condition_group).toBe(3);
            expect(data.is_active).toBe(true);
            expect(data.parameters_json).toEqual({
                threshold: 12.5,
                timeframe: '1h',
                confirmation: false
            });
        });
    });

    describe('ConditionsUIManager post-save flow', () => {
        const createManager = () => {
            const manager = new ConditionsUIManagerClass();
            manager.entityType = 'plan';
            manager.entityId = 21;
            manager.entityName = 'TSLA';
            manager.container = document.createElement('div');
            return manager;
        };

        test('promptPostSaveAction resolves with add when user confirms via dialog', async () => {
            const manager = createManager();
            manager.openConditionForm = jest.fn();

            window.showConfirmationDialog = (title, message, onConfirm) => {
                expect(title).toBe(translationsMap.post_save_prompt_title);
                expect(typeof message).toBe('string');
                onConfirm();
            };

            const result = await manager.promptPostSaveAction('create', { id: 5 });
            expect(manager.openConditionForm).toHaveBeenCalledTimes(1);
            expect(result).toBe('add');
        });

        test('promptPostSaveAction resolves with return when user cancels via dialog', async () => {
            const manager = createManager();
            manager.openConditionForm = jest.fn();
            window.ModalNavigationService = { goBack: jest.fn() };

            window.showConfirmationDialog = (title, message, _onConfirm, onCancel) => {
                onCancel();
            };

            const result = await manager.promptPostSaveAction('update', { id: 9 });
            expect(manager.openConditionForm).not.toHaveBeenCalled();
            expect(window.ModalNavigationService.goBack).toHaveBeenCalledTimes(1);
            expect(result).toBe('return');
        });

        test('promptPostSaveAction defaults to add flow when confirmation dialog unavailable', async () => {
            const manager = createManager();
            manager.openConditionForm = jest.fn();

            const result = await manager.promptPostSaveAction('create', { id: 11 });
            expect(window.Logger.warn).toHaveBeenCalledWith(
                '[ConditionsUIManager] showConfirmationDialog unavailable, defaulting to add another condition',
                { actionType: 'create', entityId: 21 },
                { page: 'conditions-ui-manager' }
            );
            expect(manager.openConditionForm).toHaveBeenCalledTimes(1);
            expect(result).toBe('add');
        });
    });
});


