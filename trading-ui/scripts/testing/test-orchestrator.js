/**
 * Test Orchestrator - TikTrack
 * Runs tests from registry with unified reporting
 *
 * @version 1.0.0
 * @created December 2025
 */

(function TestOrchestratorFactory() {
    class TestOrchestrator {
        constructor(options = {}) {
            this.registry = options.registry || [];
            this.logger = options.logger || console;
            this.onProgress = options.onProgress;
            this.onResult = options.onResult;
            this.onComplete = options.onComplete;
        }

        resolveRunner(runnerName) {
            if (!runnerName) return null;
            const runner = window[runnerName];
            return typeof runner === 'function' ? runner : null;
        }

        async run(options = {}) {
            const filterFn = options.filterFn;
            const tests = filterFn ? this.registry.filter(filterFn) : [...this.registry];
            const results = [];
            const suiteStart = Date.now();

            this.logger?.info?.('🧪 [TestOrchestrator] Starting registry suite', {
                total: tests.length
            });

            for (let index = 0; index < tests.length; index += 1) {
                const test = tests[index];
                const runner = this.resolveRunner(test.runner);
                const startTime = Date.now();

                let status = 'success';
                let error = null;
                let message = 'Test completed';

                try {
                    if (!runner) {
                        status = 'skipped';
                        message = `Runner not found: ${test.runner}`;
                    } else {
                        const runnerResult = await runner();
                        if (runnerResult && typeof runnerResult === 'object') {
                            if (runnerResult.status) status = runnerResult.status;
                            if (runnerResult.message) message = runnerResult.message;
                            if (runnerResult.error) {
                                status = 'failed';
                                error = runnerResult.error;
                            }
                        }
                    }
                } catch (err) {
                    status = 'failed';
                    error = err?.message || String(err);
                    message = error;
                }

                const endTime = Date.now();
                const result = window.TestResultsModel?.createResult({
                    testId: test.id,
                    name: test.name,
                    page: test.page,
                    entityType: test.entityType,
                    testType: test.category,
                    status,
                    message,
                    error,
                    startTime,
                    endTime,
                    details: {
                        runner: test.runner,
                        file: test.file,
                        prerequisites: test.prerequisites || []
                    }
                }) || {
                    testId: test.id,
                    name: test.name,
                    page: test.page,
                    entityType: test.entityType,
                    testType: test.category,
                    status,
                    message,
                    error,
                    executionTime: endTime - startTime
                };

                results.push(result);
                this.onResult?.(result, test, index, tests.length);
                this.onProgress?.({
                    current: index + 1,
                    total: tests.length,
                    test
                });
            }

            const summary = window.TestResultsModel?.mergeSummary(results) || {
                total: results.length,
                passed: results.filter((r) => r.status === 'success').length,
                failed: results.filter((r) => r.status === 'failed').length,
                warnings: results.filter((r) => r.status === 'warning').length
            };

            const durationMs = Date.now() - suiteStart;
            const payload = { results, summary, durationMs };

            this.logger?.info?.('✅ [TestOrchestrator] Registry suite completed', payload);
            this.onComplete?.(payload);

            return payload;
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TestOrchestrator;
    } else {
        window.TestOrchestrator = TestOrchestrator;
    }
})();
