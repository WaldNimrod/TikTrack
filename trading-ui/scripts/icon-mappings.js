/**
 * Icon Mappings - TikTrack
 * ========================
 * 
 * מיפוי מרכזי לכל האיקונים במערכת
 * 
 * Related Documentation:
 * - documentation/frontend/ICON_SYSTEM_ARCHITECTURE.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-11-23
 */

/**
 * Icon Mappings Configuration
 * 
 * מבנה המיפוי:
 * - entities: 17 איקוני ישויות מקוריים (paths ל-entities/)
 * - buttons: מיפוי ל-button icons (Tabler icon names)
 * - categories: מיפוי ל-category icons (Tabler icon names)
 * - charts: מיפוי ל-chart icons (Tabler icon names)
 * - pages: מיפוי ל-page icons (Tabler icon names)
 */
const IconMappings = {
    /**
     * Entity Icons - 17 איקוני ישויות מקוריים
     * אלה נשארים ב-entities/ directory ונמצאים תמיד קודם
     */
    entities: {
        ticker: '/trading-ui/images/icons/entities/tickers.svg',
        trade: '/trading-ui/images/icons/entities/trades.svg',
        trade_plan: '/trading-ui/images/icons/entities/trade_plans.svg',
        execution: '/trading-ui/images/icons/entities/executions.svg',
        account: '/trading-ui/images/icons/entities/trading_accounts.svg',
        trading_account: '/trading-ui/images/icons/entities/trading_accounts.svg',
        alert: '/trading-ui/images/icons/entities/alerts.svg',
        cash_flow: '/trading-ui/images/icons/entities/cash_flows.svg',
        note: '/trading-ui/images/icons/entities/notes.svg',
        preference: '/trading-ui/images/icons/entities/preferences.svg',
        research: '/trading-ui/images/icons/entities/research.svg',
        design: '/trading-ui/images/icons/tabler/palette.svg',
        constraint: '/trading-ui/images/icons/tabler/lock.svg',
        development: '/trading-ui/images/icons/entities/development.svg',
        info: '/trading-ui/images/icons/tabler/info-circle.svg',
        position: '/trading-ui/images/icons/entities/trades.svg',
        home: '/trading-ui/images/icons/entities/home.svg',
        user: '/trading-ui/images/icons/entities/user.svg'
    },

    /**
     * Button Icons - מיפוי ל-Tabler Icons
     * להחלפת Emojis ב-button-icons.js
     */
    buttons: {
        edit: 'pencil',
        delete: 'trash',
        cancel: 'x',
        link: 'link',
        add: 'plus',
        save: 'device-floppy',
        close: 'x',
        refresh: 'refresh',
        export: 'download',
        import: 'upload',
        warning: 'alert-triangle',
        search: 'search',
        filter: 'filter',
        view: 'eye',
        duplicate: 'copy',
        archive: 'archive',
        restore: 'restore',
        reactivate: 'check',
        approve: 'check',
        reject: 'x',
        pause: 'player-pause',
        play: 'player-play',
        stop: 'player-stop',
        read: 'check',
        check: 'check',
        toggle: 'chevron-down',
        sort: 'arrows-sort',
        copy: 'copy',
        menu: 'settings',
        back: 'arrow-right', // RTL - חץ ימינה
        'info-circle': 'info-circle',
        'bookmark': 'bookmark',
        'alert-circle': 'alert-circle',
        loader: 'loader', // Loading/spinner icon
        loading: 'loader', // Alias for loader
        spinner: 'loader', // Alias for loader
        sliders: 'sliders', // Settings sliders
        layers: 'layers', // Layers/categories
        terminal: 'terminal', // Terminal/console
        'clock-history': 'clock-history', // History/clock with history
        wallet: 'wallet', // Wallet icon
        paperclip: 'paperclip', // Paperclip/attachment icon
        'arrows-left-right': 'arrows-left-right', // Left-right arrows
        'currency-dollar': 'currency-dollar', // Currency/dollar icon
        tag: 'tag', // Tag icon
        'check-circle': 'check-circle', // Check circle icon
        'x-circle': 'x-circle', // X circle icon
        'plus-circle': 'plus-circle', // Plus circle icon
        book: 'book', // Book icon
        calendar: 'calendar', // Calendar icon
        list: 'list', // List icon
        activity: 'activity', // Activity icon
        cash: 'cash', // Cash icon
        'chart-pie': 'chart-pie', // Chart pie icon
        'chevron-up': 'chevron-up', // Chevron up icon
        circle: 'circle', // Circle icon
        'file-text': 'file-text', // File text icon
        hourglass: 'hourglass', // Hourglass icon
        tags: 'tags' // Tags icon (plural)
    },

    /**
     * Category Icons - מיפוי ל-Tabler Icons
     * להחלפת FontAwesome classes ב-notification-category-detector.js
     */
    categories: {
        development: 'tools',
        system: 'settings',
        business: 'briefcase',
        performance: 'gauge',
        ui: 'palette',
        security: 'shield',
        network: 'network',
        database: 'database',
        api: 'plug',
        cache: 'database',
        general: 'bell'
    },

    /**
     * Chart Icons - מיפוי ל-Tabler Icons
     * להחלפת chart-*.svg ב-price-history-page.html
     */
    charts: {
        'type-line': 'chart-line',
        'type-bar': 'chart-bar',
        'type-candlestick': 'chart-candle', // Note: Tabler uses 'chart-candle' not 'chart-candlestick'
        'scale-linear': 'line',
        'scale-log': 'chart-line',
        'volume-toggle': 'volume',
        'auto-scale': 'arrows-maximize',
        'zoom-in': 'zoom-in',
        'zoom-out': 'zoom-out',
        'zoom-reset': 'zoom-reset',
        'indicators': 'chart-dots',
        'series-toggle': 'toggle-left',
        'screenshot': 'camera',
        'export-image': 'download',
        'drawing-tools': 'pencil',
        'line': 'line',
        'line-horizontal': 'minus',
        'line-vertical': 'minus',
        'arrow': 'arrow-right',
        'rectangle': 'rectangle',
        'text': 'typography',
        'measure': 'ruler',
        'fibonacci': 'chart-line',
        'trend-line': 'trending-up',
        'support-resistance': 'line',
        'marker': 'map-pin',
        'clear-all': 'trash',
        'export-data': 'download',
        'settings': 'settings',
        'section-toggle': 'chevron-down',
        'unit-5m': 'clock',
        'unit-1h': 'clock-hour-1',
        'unit-1d': 'calendar',
        'unit-1w': 'calendar-week',
        'unit-1m': 'calendar-month',
        'unit-1y': 'calendar-event',
        'range-day': 'calendar',
        'range-week': 'calendar-week',
        'range-month': 'calendar-month',
        'range-year': 'calendar-event',
        'range-all': 'calendar-stats',
        'view-price': 'currency-dollar',
        'view-percent': 'percentage'
    },

    /**
     * Page Icons - מיפוי ל-Tabler Icons
     * להחלפת Emojis ב-unified-log-display.js
     */
    pages: {
        'index.html': 'home',
        'trades.html': 'chart-line',
        'alerts.html': 'bell',
        'accounts.html': 'user',
        'system-management.html': 'settings',
        'notifications-center.html': 'inbox',
        'preferences.html': 'settings',
        'user-profile.html': 'user',
        'tickers.html': 'currency-dollar',
        'executions.html': 'bolt',
        'cash_flows.html': 'currency-dollar',
        'trading-journal-page.html': 'notebook', // notebook icon for trading journal
        'notes.html': 'note',
        'research.html': 'search',
        'trade_plans.html': 'clipboard-list',
        'db_display.html': 'database',
        'db_extradata.html': 'database',
        'cache-management.html': 'database',
        'linter-realtime-monitor.html': 'search',
        'crud-testing-dashboard.html': 'flask',
        'external-data-dashboard.html': 'world',
        'server-monitor.html': 'server',
        'css-management.html': 'palette',
        'constraints.html': 'lock'
    }
};

// Export to global
window.IconMappings = IconMappings;

// Log initialization (debug only)
if (typeof window.Logger !== 'undefined') {
    window.Logger.debug('Icon Mappings loaded', { page: 'icon-mappings' });
}

