/**
 * Test Fixtures - TikTrack
 * ========================
 * 
 * Shared test data fixtures for all tests
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

/**
 * Create mock trade data
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock trade object
 */
function createMockTrade(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 1000),
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        price: 150.00,
        status: 'active',
        date: new Date().toISOString(),
        type: 'stock',
        account_id: 1,
        ...overrides
    };
}

/**
 * Create mock account data
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock account object
 */
function createMockAccount(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 100),
        name: 'Test Account',
        balance: 50000.00,
        currency: 'USD',
        status: 'active',
        ...overrides
    };
}

/**
 * Create mock alert data
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock alert object
 */
function createMockAlert(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 100),
        symbol: 'AAPL',
        condition: 'price_above',
        value: 160.00,
        status: 'active',
        priority: 'high',
        ...overrides
    };
}

/**
 * Create mock execution data
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock execution object
 */
function createMockExecution(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 1000),
        trade_id: 1,
        action: 'buy',
        quantity: 100,
        price: 150.00,
        fee: 2.50,
        date: new Date().toISOString(),
        ...overrides
    };
}

/**
 * Create mock ticker data
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock ticker object
 */
function createMockTicker(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 100),
        symbol: 'AAPL',
        name: 'Apple Inc.',
        exchange: 'NASDAQ',
        currency: 'USD',
        current_price: 150.00,
        ...overrides
    };
}

/**
 * Create mock trade plan data
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock trade plan object
 */
function createMockTradePlan(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 100),
        name: 'Test Plan',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        entry_price: 150.00,
        target_price: 165.00,
        stop_price: 145.00,
        status: 'open',
        ...overrides
    };
}

/**
 * Create mock modal configuration
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock modal config
 */
function createMockModalConfig(overrides = {}) {
    return {
        id: 'test-modal',
        entityType: 'test',
        title: {
            add: 'Add Test',
            edit: 'Edit Test'
        },
        size: 'lg',
        fields: [
            {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true
            }
        ],
        onSave: 'saveTest',
        ...overrides
    };
}

/**
 * Create mock API response
 * @param {number} status - HTTP status code
 * @param {*} data - Response data
 * @param {Object} options - Response options
 * @returns {Object} Mock API response
 */
function createMockApiResponse(status = 200, data = {}, options = {}) {
    return {
        ok: status >= 200 && status < 300,
        status: status,
        statusText: options.statusText || 'OK',
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        ...options
    };
}

/**
 * Create mock form element
 * @param {Object} fields - Form fields data
 * @returns {HTMLElement} Mock form element
 */
function createMockForm(fields = {}) {
    const form = document.createElement('form');
    form.id = 'test-form';
    
    Object.keys(fields).forEach(name => {
        const input = document.createElement('input');
        input.name = name;
        input.value = fields[name];
        form.appendChild(input);
    });
    
    return form;
}

module.exports = {
    createMockTrade,
    createMockAccount,
    createMockAlert,
    createMockExecution,
    createMockTicker,
    createMockTradePlan,
    createMockModalConfig,
    createMockApiResponse,
    createMockForm
};

