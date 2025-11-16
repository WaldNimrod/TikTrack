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
        label: 'הערות אחרונות',
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
        calculator: 'countByField',
        params: { field: 'has_attachment', value: true }
      },
      {
        id: 'notesByType',
        label: 'הערות לפי סוג',
        calculator: 'count'
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
  }
};

// Expose globally
window.INFO_SUMMARY_CONFIGS = INFO_SUMMARY_CONFIGS;
console.log('✅ INFO_SUMMARY_CONFIGS loaded, trading_accounts config:', INFO_SUMMARY_CONFIGS.trading_accounts);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = INFO_SUMMARY_CONFIGS;
}
