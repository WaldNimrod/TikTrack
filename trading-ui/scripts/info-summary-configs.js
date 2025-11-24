/**
 * ===== INFO SUMMARY CONFIGURATIONS =====
 * 
 * Page-specific configurations for the Info Summary System.
 * Each page defines what statistics to display and how to calculate them.
 * 
 * Documentation: documentation/02-ARCHITECTURE/FRONTEND/INFO_SUMMARY_SYSTEM.md
 * ======================================
 */

const INFO_SUMMARY_CONFIGS = {
  // Trades page configuration
  trades: {
    containerId: 'summaryStats',
    tableType: 'trades',
    stats: [
      {
        id: 'totalTrades',
        label: 'סה"כ טריידים',
        calculator: 'count'
      },
      {
        id: 'openTrades',
        label: 'טריידים פתוחים',
        calculator: 'countByStatus',
        params: { status: 'open' }
      },
      {
        id: 'closedTrades',
        label: 'טריידים סגורים',
        calculator: 'countByStatus',
        params: { status: 'closed' }
      },
      {
        id: 'totalPL',
        label: 'P/L',
        calculator: 'customTradesPL',
        formatter: 'currencyWithColor'
      }
    ]
  },

  // Executions page configuration
  executions: {
    containerId: 'summaryStats',
    tableType: 'executions',
    stats: [
      {
        id: 'totalExecutions',
        label: 'סה"כ ביצועים',
        calculator: 'count',
        subStats: [
          {
            id: 'totalBuyExecutions',
            calculator: 'countByField',
            params: { field: 'action', value: 'buy' },
            className: 'buy-color'
          },
          {
            id: 'totalSellExecutions',
            calculator: 'countByField',
            params: { field: 'action', value: 'sell' },
            className: 'sell-color'
          }
        ]
      },
      {
        id: 'totalBuyAmount',
        label: 'סה"כ קניה',
        calculator: 'sumField',
        params: { field: 'amount' },
        formatter: 'currency',
        conditions: [{ field: 'action', operator: '===', value: 'buy' }]
      },
      {
        id: 'totalSellAmount',
        label: 'סה"כ מכירות',
        calculator: 'sumField',
        params: { field: 'amount' },
        formatter: 'currency',
        conditions: [{ field: 'action', operator: '===', value: 'sell' }]
      },
      {
        id: 'balanceAmount',
        label: 'מאזן',
        calculator: 'sumField',
        params: { field: 'amount' },
        formatter: 'currency'
      }
    ]
  },

  // Trade Plans page configuration
  trade_plans: {
    containerId: 'summaryStats',
    tableType: 'trade_plans',
    stats: [
      {
        id: 'totalDesigns',
        label: 'סה"כ תכנונים',
        calculator: 'count'
      },
      {
        id: 'totalInvestment',
        label: 'סה"כ השקעה',
        calculator: 'sumField',
        params: { field: 'investment_amount' },
        formatter: 'currency'
      },
      {
        id: 'avgInvestment',
        label: 'השקעה ממוצעת',
        calculator: 'avgField',
        params: { field: 'investment_amount' },
        formatter: 'currency'
      },
      {
        id: 'totalProfit',
        label: 'רווח כולל',
        calculator: 'sumField',
        params: { field: 'expected_profit' },
        formatter: 'currency'
      }
    ]
  },

  // Cash Flows page configuration
  cash_flows: {
    containerId: 'summaryStats',
    tableType: 'cash_flows',
    stats: [
      {
        id: 'totalCashFlows',
        label: 'סה"כ תזרימים',
        calculator: 'count'
      },
      {
        id: 'totalIncome',
        label: 'סה"כ הכנסות',
        calculator: 'sumField',
        params: { field: 'amount' },
        formatter: 'currency',
        conditions: [{ field: 'type', operator: '===', value: 'income' }]
      },
      {
        id: 'totalExpenses',
        label: 'סה"כ הוצאות',
        calculator: 'sumField',
        params: { field: 'amount' },
        formatter: 'currency',
        conditions: [{ field: 'type', operator: '===', value: 'expense' }]
      },
      {
        id: 'netCashFlow',
        label: 'תזרים נטו',
        calculator: 'sumField',
        params: { field: 'amount' },
        formatter: 'currency'
      }
    ]
  },

  // Alerts page configuration
  alerts: {
    containerId: 'summaryStats',
    tableType: 'alerts',
    stats: [
      {
        id: 'totalAlerts',
        label: 'סה"כ התראות',
        calculator: 'count'
      },
      {
        id: 'activeAlerts',
        label: 'התראות פעילות',
        calculator: 'countByStatus',
        params: { status: 'active' }
      },
      {
        id: 'triggeredAlerts',
        label: 'התראות שהופעלו',
        calculator: 'countByStatus',
        params: { status: 'triggered' }
      },
      {
        id: 'resolvedAlerts',
        label: 'התראות שנפתרו',
        calculator: 'countByStatus',
        params: { status: 'resolved' }
      }
    ]
  },

  // Notes page configuration
  notes: {
    containerId: 'summaryStats',
    tableType: 'notes',
    stats: [
      {
        id: 'totalNotes',
        label: 'סה"כ הערות',
        calculator: 'count'
      },
      {
        id: 'recentNotes',
        label: 'הערות חדשות',
        calculator: 'countByConditions',
        params: {
          conditions: [
            { field: 'created_at', operator: '>', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          ]
        }
      },
      {
        id: 'notesWithAttachments',
        label: 'הערות עם קבצים',
        calculator: 'countByConditions',
        params: {
          conditions: [
            { field: 'attachment', operator: '!==', value: null }
          ]
        }
      },
      {
        id: 'totalLinks',
        label: 'סה"כ קישורים',
        calculator: 'countByConditions',
        params: {
          conditions: [
            { field: 'related_id', operator: '!==', value: null }
          ]
        }
      }
    ]
  },

  // Tickers page configuration
  tickers: {
    containerId: 'summaryStats',
    tableType: 'tickers',
    stats: [
      {
        id: 'totalTickers',
        label: 'סה"כ טיקרים',
        calculator: 'count'
      },
      {
        id: 'activeTickers',
        label: 'טיקרים פעילים',
        calculator: 'countByStatus',
        params: { status: 'active' }
      },
      {
        id: 'stockTickers',
        label: 'מניות',
        calculator: 'countByField',
        params: { field: 'type', value: 'stock' }
      },
      {
        id: 'cryptoTickers',
        label: 'קריפטו',
        calculator: 'countByField',
        params: { field: 'type', value: 'crypto' }
      }
    ]
  },

  // Trading Accounts page configuration
  trading_accounts: {
    containerId: 'summaryStats',
    tableType: 'trading_accounts',
    stats: [
      {
        id: 'totalAccounts',
        label: 'סה"כ חשבונות',
        calculator: 'count'
      },
      {
        id: 'openAccounts',
        label: 'חשבונות פתוחים',
        calculator: 'countByStatus',
        params: { status: 'open' }
      },
      {
        id: 'closedAccounts',
        label: 'חשבונות סגורים',
        calculator: 'countByStatus',
        params: { status: 'closed' }
      },
      {
        id: 'totalBalance',
        label: 'סה"כ יתרה',
        calculator: 'customTradingAccountsBalance',
        formatter: 'currencyWithColor'
      }
    ]
  },

  // Economic Calendar page configuration
  'economic-calendar-page': {
    containerId: 'economic-calendar-summary',
    stats: [
      {
        id: 'totalEvents',
        label: 'סה"כ אירועים שמורים',
        calculator: 'count'
      },
      {
        id: 'highImportance',
        label: 'חשיבות גבוהה',
        calculator: 'countByField',
        params: { field: 'importance', value: 'high' }
      },
      {
        id: 'mediumImportance',
        label: 'חשיבות בינונית',
        calculator: 'countByField',
        params: { field: 'importance', value: 'medium' }
      },
      {
        id: 'lowImportance',
        label: 'חשיבות נמוכה',
        calculator: 'countByField',
        params: { field: 'importance', value: 'low' }
      },
      {
        id: 'eventsByUS',
        label: 'אירועים ארה"ב',
        calculator: 'countByField',
        params: { field: 'country', value: 'US' }
      },
      {
        id: 'eventsByEU',
        label: 'אירועים אירופה',
        calculator: 'countByField',
        params: { field: 'country', value: 'EU' }
      }
    ]
  },

  // Date Comparison Modal configuration
  'date-comparison-modal': {
    containerId: 'comparison-summary',
    stats: [
      {
        id: 'total_change',
        label: 'שינוי כולל',
        calculator: 'custom',
        customCalculator: (data) => data.total_change || 0,
        formatter: 'currencyWithColor'
      },
      {
        id: 'avg_change_percent',
        label: 'שינוי ממוצע',
        calculator: 'custom',
        customCalculator: (data) => data.avg_change_percent || 0,
        formatter: 'percentageWithColor'
      },
      {
        id: 'significant_changes',
        label: 'שינויים משמעותיים',
        calculator: 'custom',
        customCalculator: (data) => data.significant_changes || 0
      }
    ]
  },

  // Portfolio State page configuration
  'portfolio-state-page': {
    containerId: 'portfolio-state-summary',
    tableType: 'portfolio-trades',
    stats: [
      {
        id: 'total_cash_balance',
        label: 'יתרות מזומן',
        calculator: 'custom',
        customCalculator: (data) => {
          // Calculate from trades (mock data - should come from snapshot)
          const accounts = {};
          let total = 0;
          data.forEach(trade => {
            const accountId = trade.trading_account_id;
            if (!accounts[accountId]) {
              accounts[accountId] = true;
              total += 20000; // Mock balance per account
            }
          });
          return total;
        },
        formatter: 'currencyWithColor'
      },
      {
        id: 'total_portfolio_value',
        label: 'שווי תיק',
        calculator: 'custom',
        customCalculator: (data) => {
          const cashBalance = 20000 * (new Set(data.map(t => t.trading_account_id)).size);
          const unrealizedPL = data.reduce((sum, t) => sum + (t.position_pl_value || 0), 0);
          return cashBalance + unrealizedPL;
        },
        formatter: 'currencyWithColor'
      },
      {
        id: 'total_pl',
        label: 'P/L כולל',
        calculator: 'sumField',
        params: { field: 'position_pl_value' },
        formatter: 'currencyWithColor'
      },
      {
        id: 'total_unrealized_pl',
        label: 'P/L לא ממומש',
        calculator: 'sumField',
        params: { field: 'position_pl_value' },
        formatter: 'currencyWithColor'
      },
      {
        id: 'open_positions_count',
        label: 'פוזיציות פתוחות',
        calculator: 'count'
      }
    ]
  }
};

// Expose globally
window.INFO_SUMMARY_CONFIGS = INFO_SUMMARY_CONFIGS;
console.log('✅ INFO_SUMMARY_CONFIGS loaded, trading_accounts config:', INFO_SUMMARY_CONFIGS.trading_accounts);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = INFO_SUMMARY_CONFIGS;
}
