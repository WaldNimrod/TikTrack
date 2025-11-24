/**
 * Economic Events Mock Data
 * =========================
 * 
 * Mock data for Economic Calendar events in the exact structure that will be used
 * in the final system. This data structure matches the EconomicEvent entity.
 * 
 * Structure:
 * {
 *   id: number,
 *   title: string,
 *   date: string (ISO format),
 *   time: string (HH:mm),
 *   country: string,
 *   importance: 'high' | 'medium' | 'low',
 *   eventType: string,
 *   description: string,
 *   actualValue: string | null,
 *   forecastValue: string | null,
 *   previousValue: string | null,
 *   linkedTrades: number[],
 *   savedAt: string (ISO format),
 *   userId: number
 * }
 * 
 * @version 1.0.0
 * @created January 29, 2025
 */

(function() {
    'use strict';

    /**
     * Mock Economic Events Data
     * This represents saved events that the user has marked as interesting
     */
    window.EconomicEventsMockData = [
        {
            id: 1,
            title: 'החלטת ריבית FED',
            date: '2025-01-15T00:00:00.000Z',
            time: '20:00',
            country: 'US',
            importance: 'high',
            eventType: 'interest-rate',
            description: 'החלטת ריבית של הבנק המרכזי של ארה"ב. השפעה צפויה על השוק.',
            actualValue: null,
            forecastValue: '5.25%',
            previousValue: '5.25%',
            linkedTrades: [123, 124],
            savedAt: '2025-01-10T10:00:00.000Z',
            userId: 1
        },
        {
            id: 2,
            title: 'דוח תוצר ארה"ב',
            date: '2025-01-20T00:00:00.000Z',
            time: '15:30',
            country: 'US',
            importance: 'medium',
            eventType: 'gdp',
            description: 'דוח רבעוני על התוצר המקומי הגולמי של ארה"ב.',
            actualValue: null,
            forecastValue: '2.5%',
            previousValue: '2.1%',
            linkedTrades: [],
            savedAt: '2025-01-18T08:00:00.000Z',
            userId: 1
        },
        {
            id: 3,
            title: 'דוח תעסוקה NFP',
            date: '2025-01-25T00:00:00.000Z',
            time: '15:30',
            country: 'US',
            importance: 'medium',
            eventType: 'employment',
            description: 'דוח תעסוקה חודשי - Non-Farm Payrolls.',
            actualValue: null,
            forecastValue: '180K',
            previousValue: '175K',
            linkedTrades: [125],
            savedAt: '2025-01-22T12:00:00.000Z',
            userId: 1
        },
        {
            id: 4,
            title: 'מדד מחירים לצרכן (CPI) ארה"ב',
            date: '2025-02-10T00:00:00.000Z',
            time: '15:30',
            country: 'US',
            importance: 'high',
            eventType: 'inflation',
            description: 'מדד מחירים לצרכן - אינדיקטור מרכזי לאינפלציה.',
            actualValue: null,
            forecastValue: '3.2%',
            previousValue: '3.1%',
            linkedTrades: [126, 127],
            savedAt: '2025-01-28T14:00:00.000Z',
            userId: 1
        },
        {
            id: 5,
            title: 'החלטת ריבית ECB',
            date: '2025-02-05T00:00:00.000Z',
            time: '14:45',
            country: 'EU',
            importance: 'high',
            eventType: 'interest-rate',
            description: 'החלטת ריבית של הבנק המרכזי האירופי.',
            actualValue: null,
            forecastValue: '4.0%',
            previousValue: '4.0%',
            linkedTrades: [128],
            savedAt: '2025-01-30T09:00:00.000Z',
            userId: 1
        },
        {
            id: 6,
            title: 'דוח תעסוקה בריטניה',
            date: '2025-02-12T00:00:00.000Z',
            time: '09:30',
            country: 'UK',
            importance: 'medium',
            eventType: 'employment',
            description: 'דוח תעסוקה חודשי של בריטניה.',
            actualValue: null,
            forecastValue: '3.8%',
            previousValue: '3.9%',
            linkedTrades: [],
            savedAt: '2025-02-01T11:00:00.000Z',
            userId: 1
        },
        {
            id: 7,
            title: 'החלטת ריבית בנק יפן',
            date: '2025-02-18T00:00:00.000Z',
            time: '03:00',
            country: 'JP',
            importance: 'high',
            eventType: 'interest-rate',
            description: 'החלטת ריבית של בנק יפן.',
            actualValue: null,
            forecastValue: '-0.1%',
            previousValue: '-0.1%',
            linkedTrades: [129],
            savedAt: '2025-02-05T10:00:00.000Z',
            userId: 1
        },
        {
            id: 8,
            title: 'דוח תוצר אירופה',
            date: '2025-02-20T00:00:00.000Z',
            time: '11:00',
            country: 'EU',
            importance: 'medium',
            eventType: 'gdp',
            description: 'דוח רבעוני על התוצר המקומי הגולמי של אירופה.',
            actualValue: null,
            forecastValue: '0.8%',
            previousValue: '0.6%',
            linkedTrades: [130],
            savedAt: '2025-02-08T15:00:00.000Z',
            userId: 1
        }
    ];

    if (window.Logger) {
        window.Logger.info('Economic Events Mock Data loaded', {
            module: 'EconomicEventsMockData',
            count: window.EconomicEventsMockData.length
        });
    }

})();

