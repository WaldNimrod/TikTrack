/**
 * Jest Results Processor - TikTrack
 * ==================================
 * 
 * Processes test results and generates reports
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

module.exports = (results) => {
    console.log('📊 Processing test results...');
    
    // Process results
    const processedResults = {
        ...results,
        processedAt: new Date().toISOString(),
        summary: {
            totalTests: results.numTotalTests,
            passedTests: results.numPassedTests,
            failedTests: results.numFailedTests,
            skippedTests: results.numPendingTests,
            successRate: results.numTotalTests > 0 ? 
                (results.numPassedTests / results.numTotalTests) * 100 : 0
        }
    };
    
    // Log summary
    console.log(`✅ Tests completed: ${processedResults.summary.passedTests}/${processedResults.summary.totalTests} passed`);
    console.log(`📈 Success rate: ${processedResults.summary.successRate.toFixed(2)}%`);
    
    if (processedResults.summary.failedTests > 0) {
        console.log(`❌ Failed tests: ${processedResults.summary.failedTests}`);
    }
    
    if (processedResults.summary.skippedTests > 0) {
        console.log(`⏭️ Skipped tests: ${processedResults.summary.skippedTests}`);
    }
    
    return processedResults;
};
