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
  },

  // Index page (dashboard) configuration
  index: {
    containerId: 'summaryStats',
    tableType: null, // Dashboard doesn't have a single table type
    stats: [
      {
        id: 'totalTrades',
        label: 'סה"כ טריידים',
        calculator: 'count',
        // Note: This will be calculated from trades data passed to updatePageSummaryStats
      },
      {
        id: 'totalAlerts',
        label: 'סה"כ התראות',
        calculator: 'count',
        // Note: This will be calculated from alerts data passed to updatePageSummaryStats
      },
      {
        id: 'currentBalance',
        label: 'יתרה נוכחית',
        calculator: 'custom',
        customCalculator: (data) => {
          // Calculate from accounts data if available
          if (data && Array.isArray(data) && data.length > 0) {
            return data.reduce((sum, item) => {
              const value = item?.total_value ?? item?.opening_balance ?? 0;
              return sum + (parseFloat(value) || 0);
            }, 0);
          }
          return 0;
        },
        formatter: 'currency'
      },
      {
        id: 'totalPnL',
        label: 'רווח/הפסד',
        calculator: 'custom',
        customCalculator: (data) => {
          // Calculate P/L from trades data if available
          if (data && Array.isArray(data) && data.length > 0) {
            return data.reduce((sum, trade) => {
              const pl = trade?.position_pl_value ?? trade?.unrealized_pl ?? 0;
              return sum + (parseFloat(pl) || 0);
            }, 0);
          }
          return 0;
        },
        formatter: 'currencyWithColor'
      }
    ]
  },

  // Preferences page configuration
  preferences: {
    containerId: 'infoSummary',
    tableType: null,
    stats: [
      {
        id: 'activeProfileName',
        label: 'פרופיל פעיל',
        calculator: 'custom',
        customCalculator: (data) => {
          // This will be set by preferences.js directly
          return data?.activeProfileName || 'לא זמין';
        }
      },
      {
        id: 'activeUserName',
        label: 'משתמש פעיל',
        calculator: 'custom',
        customCalculator: (data) => {
          return data?.activeUserName || 'לא זמין';
        }
      },
      {
        id: 'preferencesCount',
        label: 'מספר העדפות',
        calculator: 'custom',
        customCalculator: (data) => {
          return data?.preferencesCount || 0;
        },
        formatter: 'integer'
      },
      {
        id: 'profilesCount',
        label: 'מספר פרופילים',
        calculator: 'custom',
        customCalculator: (data) => {
          return data?.profilesCount || 0;
        },
        formatter: 'integer'
      },
      {
        id: 'groupsCount',
        label: 'מספר קבוצות',
        calculator: 'custom',
        customCalculator: (data) => {
          return data?.groupsCount || 0;
        },
        formatter: 'integer'
      }
    ]
  },

  // DB Display page configuration
  db_display: {
    containerId: 'summaryStats',
    tableType: null,
    stats: [
      {
        id: 'totalTables',
        label: 'סה"כ טבלאות',
        calculator: 'count'
      },
      {
        id: 'totalRecords',
        label: 'סה"כ רשומות',
        calculator: 'sumField',
        params: { field: 'record_count' },
        formatter: 'integer'
      }
    ]
  },

  // Background Tasks page configuration
  'background-tasks': {
    containerId: 'summaryStats',
    tableType: null,
    stats: [
      {
        id: 'totalTasks',
        label: 'סה"כ משימות',
        calculator: 'count'
      },
      {
        id: 'activeTasks',
        label: 'משימות פעילות',
        calculator: 'countByStatus',
        params: { status: 'active' }
      },
      {
        id: 'completedTasks',
        label: 'משימות הושלמו',
        calculator: 'countByStatus',
        params: { status: 'completed' }
      },
      {
        id: 'failedTasks',
        label: 'משימות נכשלו',
        calculator: 'countByStatus',
        params: { status: 'failed' }
      }
    ]
  },

  // Notifications Center page configuration
  'notifications-center': {
    containerId: 'overviewStats',
    tableType: null,
    stats: [
      {
        id: 'totalNotifications',
        label: 'סה"כ התראות',
        calculator: 'count'
      },
      {
        id: 'unreadNotifications',
        label: 'התראות שלא נקראו',
        calculator: 'countByField',
        params: { field: 'read', value: false }
      },
      {
        id: 'readNotifications',
        label: 'התראות נקראו',
        calculator: 'countByField',
        params: { field: 'read', value: true }
      }
    ]
  },

  // External Data Dashboard page configuration
  'external-data-dashboard': {
    containerId: null, // No specific container - uses custom display
    tableType: null,
    stats: [
      {
        id: 'totalConnectors',
        label: 'סה"כ מחברים',
        calculator: 'count'
      },
      {
        id: 'activeConnectors',
        label: 'מחברים פעילים',
        calculator: 'countByStatus',
        params: { status: 'active' }
      },
      {
        id: 'totalDataPoints',
        label: 'סה"כ נקודות נתונים',
        calculator: 'sumField',
        params: { field: 'data_points' },
        formatter: 'integer'
      }
    ]
  },

  // AI Analysis page configuration
  'ai-analysis': {
    containerId: 'summaryStats',
    tableType: 'ai_analysis',
    stats: [
      {
        id: 'totalAnalyses',
        label: 'סה"כ ניתוחים',
        calculator: 'count'
      },
      {
        id: 'completedAnalyses',
        label: 'ניתוחים הושלמו',
        calculator: 'countByField',
        params: { field: 'status', value: 'completed' }
      },
      {
        id: 'pendingAnalyses',
        label: 'ניתוחים ממתינים',
        calculator: 'countByField',
        params: { field: 'status', value: 'pending' }
      },
      {
        id: 'failedAnalyses',
        label: 'ניתוחים נכשלו',
        calculator: 'countByField',
        params: { field: 'status', value: 'failed' }
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
