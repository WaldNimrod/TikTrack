/**
 * register-table-portfolio.js
 * Registers the portfolio table with the UnifiedTableSystem.
 */

window.registerPortfolioTable = function registerPortfolioTable() {
    if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry || typeof window.UnifiedTableSystem.registry.register !== 'function') {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for portfolio registration', { page: 'register-table-portfolio' });
        return false;
    }

    const tableType = 'portfolio';

    if (typeof window.UnifiedTableSystem.registry.isRegistered === 'function' &&
        window.UnifiedTableSystem.registry.isRegistered(tableType)) {
        window.Logger?.debug?.('ℹ️ Portfolio table already registered with UnifiedTableSystem', { page: 'register-table-portfolio' });
        return true;
    }

    window.UnifiedTableSystem.registry.register(tableType, {
        dataGetter: () => {
            return window.positionsPortfolioState?.portfolioData?.positions || [];
        },
        updateFunction: (data) => {
            if (typeof window.updatePortfolioTable === 'function') {
                window.updatePortfolioTable(data);
            } else {
                window.Logger?.warn('updatePortfolioTable function not available when sorting portfolio table', { page: 'register-table-portfolio' });
            }
        },
        tableSelector: 'table[data-table-type="portfolio"]',
        columns: window.TABLE_COLUMN_MAPPINGS?.portfolio || [],
        sortable: true,
        filterable: true,
        defaultSort: { columnIndex: 0, direction: 'asc' }
    });

    window.Logger?.info?.('✅ Registered portfolio table with UnifiedTableSystem', { page: 'register-table-portfolio' });
    return true;
};

