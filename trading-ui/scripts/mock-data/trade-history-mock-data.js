/**
 * Trade History Mock Data
 * =======================
 * 
 * Mock data for Trade History page in the exact structure that will be used
 * in the final system. This data structure matches the Trade entity and related entities.
 * 
 * Structure:
 * {
 *   selectedTrade: Trade object,
 *   statistics: Statistics object,
 *   timelineData: Timeline events array,
 *   planVsExecution: Comparison array,
 *   linkedItems: Linked items array
 * }
 * 
 * @version 1.0.0
 * @created January 29, 2025
 */

(function() {
    'use strict';

    /**
     * Mock Trade History Data
     * This represents the data for a selected trade's history analysis
     */
    window.TradeHistoryMockData = {
        // Selected Trade Details
        selectedTrade: {
            id: 123,
            ticker_symbol: 'AAPL',
            ticker: {
                id: 1,
                symbol: 'AAPL',
                name: 'Apple Inc.'
            },
            side: 'Long',
            investment_type: 'swing',
            status: 'closed',
            trading_account_id: 1,
            trading_account: {
                id: 1,
                name: 'Account #1'
            },
            trade_plan_id: 456,
            created_at: '2025-01-01T00:00:00.000Z', // Planning date
            opened_at: '2025-01-05T00:00:00.000Z',  // Entry date
            closed_at: '2025-01-20T00:00:00.000Z',
            planned_quantity: 150,
            planned_amount: 22500, // 150 * $150
            entry_price: 150,
            total_pl: 1110,
            pl_percent: 7.4,
            realized_pl: 1110,
            unrealized_pl: 0,
            notes: null
        },

        // Statistics
        statistics: {
            durationDays: 19,
            totalPL: 1110,
            totalPLPercent: 7.4,
            executionCount: 4,
            maxPosition: 150,
            avgEntryPrice: 151.33, // (100*150 + 50*152) / 150
            avgExitPrice: 156.67   // (30*155 + 120*158) / 150
        },

        // Timeline Data (for chart and absolute timeline)
        timelineData: [
            {
                id: 456,
                type: 'Trade Plan',
                date: '2025-01-01T00:00:00.000Z',
                entityType: 'trade_plan',
                title: 'תכנון',
                details: {
                    target_price: 160,
                    planned_quantity: 100,
                    planned_amount: 15000
                },
                displayText: 'Target: $160'
            },
            {
                id: 101,
                type: 'Execution',
                date: '2025-01-05T00:00:00.000Z',
                entityType: 'execution',
                title: 'Buy | 100#',
                side: 'buy',
                quantity: 100,
                price: 150,
                pl: 0,
                positionBefore: 0,
                positionAfter: 100,
                displayText: '$150'
            },
            {
                id: 201,
                type: 'Note',
                date: '2025-01-07T00:00:00.000Z',
                entityType: 'note',
                title: 'הערה',
                description: 'שינוי אסטרטגיה - הוספת stop loss',
                displayText: 'שינוי אסטרטגיה - הוספת stop loss'
            },
            {
                id: 301,
                type: 'Cash Flow',
                date: '2025-01-08T00:00:00.000Z',
                entityType: 'cash_flow',
                title: 'Deposit | $5,000',
                amount: 5000,
                flow_type: 'deposit',
                displayText: '$5,000.00'
            },
            {
                id: 102,
                type: 'Execution',
                date: '2025-01-10T00:00:00.000Z',
                entityType: 'execution',
                title: 'Buy | 50#',
                side: 'buy',
                quantity: 50,
                price: 152,
                pl: 100,
                positionBefore: 100,
                positionAfter: 150,
                displayText: '$152'
            },
            {
                id: 401,
                type: 'Alert',
                date: '2025-01-12T00:00:00.000Z',
                entityType: 'alert',
                title: 'התראה',
                description: 'מחיר התקרב ל-stop loss',
                displayText: 'מחיר התקרב ל-stop loss'
            },
            {
                id: 103,
                type: 'Execution',
                date: '2025-01-15T00:00:00.000Z',
                entityType: 'execution',
                title: 'Sell | 30#',
                side: 'sell',
                quantity: 30,
                price: 155,
                pl: 150,
                positionBefore: 150,
                positionAfter: 120,
                displayText: '$155'
            },
            {
                id: 104,
                type: 'Execution',
                date: '2025-01-20T00:00:00.000Z',
                entityType: 'execution',
                title: 'Sell | 120#',
                side: 'sell',
                quantity: 120,
                price: 158,
                pl: 960,
                positionBefore: 120,
                positionAfter: 0,
                displayText: '$158'
            }
        ],

        // Plan vs Execution Comparison
        planVsExecution: [
            {
                category: 'כניסה',
                categoryIcon: 'info-circle',
                planned: {
                    quantity: 100,
                    price: 150,
                    date: '2025-01-01T00:00:00.000Z',
                    description: null
                },
                trade: {
                    quantity: 100,
                    price: 150,
                    date: '2025-01-01T00:00:00.000Z',
                    description: null
                },
                executed: {
                    quantity: 100,
                    price: 150,
                    date: '2025-01-05T00:00:00.000Z',
                    description: 'פוזיציה: 0 → 100'
                },
                status: 'match',
                statusText: 'תואם',
                statusIcon: 'info-circle'
            },
            {
                category: 'הוספה',
                categoryIcon: 'info-circle',
                planned: {
                    quantity: null,
                    price: null,
                    date: null,
                    description: '-'
                },
                trade: {
                    quantity: null,
                    price: null,
                    date: null,
                    description: '-'
                },
                executed: {
                    quantity: 50,
                    price: 152,
                    date: '2025-01-10T00:00:00.000Z',
                    description: 'פוזיציה: 100 → 150'
                },
                status: 'additional',
                statusText: 'הוספה לא מתוכננת',
                statusIcon: 'info-circle'
            },
            {
                category: 'יציאה חלקית',
                categoryIcon: 'info-circle',
                planned: {
                    quantity: 150,
                    price: 160,
                    date: '2025-01-15T00:00:00.000Z',
                    description: '(יעד)',
                    isEstimated: true
                },
                trade: {
                    quantity: 150,
                    price: 160,
                    date: '2025-01-15T00:00:00.000Z',
                    description: '(יעד)',
                    isEstimated: true
                },
                executed: {
                    quantity: 30,
                    price: 155,
                    date: '2025-01-15T00:00:00.000Z',
                    description: 'פוזיציה: 150 → 120'
                },
                status: 'partial',
                statusText: 'יציאה חלקית',
                statusIcon: 'alert-triangle'
            },
            {
                category: 'יציאה סופית',
                categoryIcon: 'info-circle',
                planned: {
                    quantity: 150,
                    price: 160,
                    date: '2025-01-15T00:00:00.000Z',
                    description: '(יעד)',
                    isEstimated: true
                },
                trade: {
                    quantity: 120,
                    price: 160,
                    date: '2025-01-20T00:00:00.000Z',
                    description: '(יעד)',
                    isEstimated: true
                },
                executed: {
                    quantity: 120,
                    price: 158,
                    date: '2025-01-20T00:00:00.000Z',
                    description: 'פוזיציה: 120 → 0'
                },
                status: 'difference',
                statusText: 'מחיר נמוך מהמתוכנן',
                statusIcon: 'info-circle'
            },
            {
                category: 'רווח/הפסד',
                categoryIcon: 'chart-line',
                planned: {
                    amount: 1500,
                    description: '(150 × $10 רווח משוער)'
                },
                trade: {
                    amount: 1200,
                    description: '(120 × $10 רווח משוער)'
                },
                executed: {
                    amount: 1110,
                    description: '(P/L ממומש)'
                },
                status: 'difference',
                statusText: '$390 פחות מהמתוכנן',
                statusIcon: 'info-circle'
            }
        ],

        // Conditions/Reasons
        conditions: [
            { id: 1, type: 'entry', description: 'תנאי כניסה #1' },
            { id: 2, type: 'exit', description: 'תנאי יציאה #2' },
            { id: 3, type: 'reason', description: 'סיבה #3' }
        ],

        // Linked Items (for linked items section)
        linkedItems: {
            child_entities: [],
            parent_entities: []
        },

        // Timeline data for chart (formatted for TradingView)
        chartData: {
            marketPrice: [
                { time: '2025-01-01', value: 150 },
                { time: '2025-01-05', value: 150 },
                { time: '2025-01-10', value: 152 },
                { time: '2025-01-15', value: 155 },
                { time: '2025-01-20', value: 158 }
            ],
            positionSize: [
                { time: '2025-01-01', value: 0 },
                { time: '2025-01-05', value: 100 },
                { time: '2025-01-10', value: 150 },
                { time: '2025-01-15', value: 120 },
                { time: '2025-01-20', value: 0 }
            ],
            realizedPL: [
                { time: '2025-01-05', value: 0 },
                { time: '2025-01-10', value: 0 },
                { time: '2025-01-15', value: 150 },
                { time: '2025-01-20', value: 1110 }
            ],
            totalPL: [
                { time: '2025-01-01', value: 0 },
                { time: '2025-01-05', value: 0 },
                { time: '2025-01-10', value: 100 },
                { time: '2025-01-15', value: 150 },
                { time: '2025-01-20', value: 1110 }
            ]
        }
    };

    if (window.Logger) {
        window.Logger.info('Trade History Mock Data loaded', {
            module: 'TradeHistoryMockData',
            tradeId: window.TradeHistoryMockData.selectedTrade.id,
            timelineEvents: window.TradeHistoryMockData.timelineData.length,
            comparisons: window.TradeHistoryMockData.planVsExecution.length
        });
    }

})();

