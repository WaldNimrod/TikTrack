/**
 * Test Results Model - TikTrack
 * Unified results shape and aggregation helpers
 *
 * @version 1.0.0
 * @created December 2025
 */

(function TestResultsModelFactory() {
    const TestResultsModel = {
        createResult(options = {}) {
            const startTime = options.startTime || Date.now();
            const endTime = options.endTime || startTime;
            const duration = Math.max(0, endTime - startTime);

            const counters = options.counters || {};
            const executedCount = options.executedCount !== undefined
                ? options.executedCount
                : counters.total;

            return {
                testId: options.testId || options.id || 'unknown-test',
                name: options.name,
                page: options.page,
                entityType: options.entityType,
                testType: options.testType || options.category || 'registry',
                status: options.status || 'unknown',
                message: options.message,
                error: options.error,
                executionTime: duration,
                counters: counters,
                executedCount: executedCount,
                details: options.details || {},
                createdAt: new Date().toISOString()
            };
        },

        mergeSummary(results = []) {
            const summary = {
                total: results.length,
                passed: 0,
                failed: 0,
                warnings: 0,
                durationMs: 0
            };

            results.forEach((result) => {
                summary.durationMs += result.executionTime || 0;
                if (result.status === 'success') summary.passed += 1;
                else if (result.status === 'failed') summary.failed += 1;
                else if (result.status === 'warning') summary.warnings += 1;
            });

            return summary;
        },

        summarizeByPage(results = []) {
            const pageMap = {};

            results.forEach((result) => {
                if (!result.page) return;
                if (!pageMap[result.page]) {
                    pageMap[result.page] = {
                        page: result.page,
                        total: 0,
                        passed: 0,
                        failed: 0,
                        warnings: 0,
                        durationMs: 0
                    };
                }
                const pageEntry = pageMap[result.page];
                pageEntry.total += 1;
                pageEntry.durationMs += result.executionTime || 0;
                if (result.status === 'success') pageEntry.passed += 1;
                else if (result.status === 'failed') pageEntry.failed += 1;
                else if (result.status === 'warning') pageEntry.warnings += 1;
            });

            return Object.values(pageMap);
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TestResultsModel;
    } else {
        window.TestResultsModel = TestResultsModel;
    }
})();
