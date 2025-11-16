/* eslint-env jest */
const path = require('path');

const MODULE_PATH = path.resolve(__dirname, '../../trading-ui/scripts/trade-plan-service.js');

describe('trade-plan-service', () => {
    const originalLogger = global.window.Logger;
    const originalShowErrorNotification = global.window.showErrorNotification;
    const originalTradePlansData = global.window.TradePlansData;

    beforeAll(() => {
        delete require.cache[MODULE_PATH];
        require(MODULE_PATH);
    });

    beforeEach(() => {
        global.window.Logger = {
            error: jest.fn(),
            info: jest.fn()
        };
        global.window.showErrorNotification = jest.fn();
        global.window.TradePlansData = {
            loadTradePlansData: jest.fn()
        };
        if (typeof global.window.tradePlansData !== 'undefined') {
            global.window.tradePlansData = [];
        }
    });

    afterAll(() => {
        global.window.Logger = originalLogger;
        global.window.showErrorNotification = originalShowErrorNotification;
        global.window.TradePlansData = originalTradePlansData;
    });

    test('loadTradePlansData stores loader array payload', async () => {
        const sample = [{ id: 1, name: 'Plan A' }];
        global.window.TradePlansData.loadTradePlansData.mockResolvedValue(sample);

        const result = await global.window.loadTradePlansData();

        expect(result).toEqual(sample);
        expect(global.window.tradePlanService.getTradePlans()).toEqual(sample);
        expect(global.window.isTradePlansLoaded()).toBe(true);
    });

    test('loadTradePlansData normalizes data property arrays', async () => {
        const payload = { data: [{ id: 2, name: 'Plan B' }] };
        global.window.TradePlansData.loadTradePlansData.mockResolvedValue(payload);

        const result = await global.window.loadTradePlansData();

        expect(result).toEqual(payload.data);
        expect(global.window.tradePlanService.getTradePlans()).toEqual(payload.data);
    });

    test('loadTradePlansData throws when loader missing', async () => {
        global.window.TradePlansData = {};

        await expect(global.window.loadTradePlansData()).rejects.toThrow('TradePlansData loader unavailable');
        expect(global.window.Logger.error).toHaveBeenCalledWith(
            'שכבת הנתונים של תכניות המסחר לא זמינה',
            expect.any(Error),
            expect.objectContaining({ page: 'trade_plan_service', stage: 'missing-loader' })
        );
        expect(global.window.showErrorNotification).toHaveBeenCalledWith(
            'שגיאה בטעינת תכניות מסחר',
            'שכבת הנתונים של תכניות המסחר לא זמינה',
            6000,
            'system'
        );
    });

    test('loadTradePlansData propagates loader failures', async () => {
        const failure = new Error('network');
        global.window.TradePlansData.loadTradePlansData.mockRejectedValue(failure);

        await expect(global.window.loadTradePlansData()).rejects.toThrow(failure);
        expect(global.window.Logger.error).toHaveBeenCalledWith(
            'טעינת נתוני תכניות המסחר נכשלה',
            failure,
            expect.objectContaining({ page: 'trade_plan_service', stage: 'load-failure' })
        );
    });

    test('loadTradePlansData rejects invalid payloads', async () => {
        global.window.TradePlansData.loadTradePlansData.mockResolvedValue({ foo: 'bar' });

        await expect(global.window.loadTradePlansData()).rejects.toThrow('Invalid trade plans payload');
        expect(global.window.Logger.error).toHaveBeenCalledWith(
            'טעינת נתוני תכניות המסחר נכשלה',
            expect.any(Error),
            expect.objectContaining({ page: 'trade_plan_service', stage: 'load-failure' })
        );
    });
});

