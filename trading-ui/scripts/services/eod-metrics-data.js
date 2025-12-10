// EOD Metrics Data Service - שירות נתוני EOD עם caching
class EODMetricsDataService {
    constructor() {
        this.baseUrl = '/api/eod';
        this.cachePrefix = 'eod_';
    }

    async getPortfolioMetrics(userId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        if (filters.include_positions) params.append('include_positions', 'true');

        const cacheKey = `${this.cachePrefix}portfolio_${userId}_${filters.account_id || 'all'}_${filters.date_from || ''}_${filters.date_to || ''}`;

        return await CacheTTLGuard.get(cacheKey, async () => {
            const response = await fetch(`${this.baseUrl}/portfolio?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch portfolio metrics: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }, { ttl: 3600000 }); // 1 hour TTL
    }

    async getPositions(userId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.ticker_id) params.append('ticker_id', filters.ticker_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        const cacheKey = `${this.cachePrefix}positions_${userId}_${filters.account_id || 'all'}_${filters.ticker_id || 'all'}_${filters.date_from || ''}_${filters.date_to || ''}`;

        return await CacheTTLGuard.get(cacheKey, async () => {
            const response = await fetch(`${this.baseUrl}/positions?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch positions: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }, { ttl: 3600000 });
    }

    async getCashFlows(userId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        const cacheKey = `${this.cachePrefix}cash_flows_${userId}_${filters.account_id || 'all'}_${filters.date_from || ''}_${filters.date_to || ''}`;

        return await CacheTTLGuard.get(cacheKey, async () => {
            const response = await fetch(`${this.baseUrl}/cash-flows?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch cash flows: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }, { ttl: 3600000 });
    }

    async recomputeDateRange(userId, dateRange) {
        const response = await fetch(`${this.baseUrl}/recompute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                date_from: dateRange.date_from,
                date_to: dateRange.date_to,
                account_ids: dateRange.account_ids
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to start recompute: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    async getRecomputeStatus(jobId) {
        const response = await fetch(`${this.baseUrl}/recompute/${jobId}`);
        if (!response.ok) {
            throw new Error(`Failed to get recompute status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    async getRecomputeHistory(userId, limit = 10) {
        const response = await fetch(`${this.baseUrl}/recompute/history?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to get recompute history: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    // Utility methods
    invalidateCache(pattern = null) {
        // Invalidate cache entries matching pattern
        if (window.CacheSyncManager) {
            if (pattern) {
                CacheSyncManager.invalidatePattern(pattern);
            } else {
                CacheSyncManager.invalidatePattern(`${this.cachePrefix}*`);
            }
        }
    }

    clearUserCache(userId) {
        // Clear all EOD cache for specific user
        this.invalidateCache(`${this.cachePrefix}*_${userId}_*`);
    }
}

// Global instance
window.EODMetricsDataService = new EODMetricsDataService();
