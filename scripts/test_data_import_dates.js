/**
 * Test script to check what the server returns for import history
 * Run this in browser console on data_import page
 */

async function testImportHistoryDates() {
    console.group('🔍 Testing Import History Dates');
    
    try {
        // 1. Check if we have trading accounts
        console.log('1️⃣ Fetching trading accounts...');
        const accountsResponse = await fetch('/api/trading-accounts/');
        const accountsData = await accountsResponse.json();
        const accounts = accountsData.data || accountsData.accounts || [];
        console.log(`   Found ${accounts.length} trading accounts`);
        
        if (accounts.length === 0) {
            console.warn('   ⚠️ No trading accounts found - cannot fetch history');
            console.groupEnd();
            return;
        }
        
        // 2. Fetch import history for first account
        const accountId = accounts[0].id;
        console.log(`\n2️⃣ Fetching import history for account ${accountId}...`);
        const historyResponse = await fetch(`/api/user-data-import/history?trading_account_id=${accountId}&limit=5`);
        const historyData = await historyResponse.json();
        const sessions = historyData.sessions || [];
        console.log(`   Found ${sessions.length} sessions`);
        
        if (sessions.length === 0) {
            console.warn('   ⚠️ No sessions found');
            console.groupEnd();
            return;
        }
        
        // 3. Check first session dates
        const firstSession = sessions[0];
        console.log(`\n3️⃣ First session data:`);
        console.log(`   ID: ${firstSession.id}`);
        console.log(`   created_at: ${firstSession.created_at} (type: ${typeof firstSession.created_at})`);
        console.log(`   completed_at: ${firstSession.completed_at} (type: ${typeof firstSession.completed_at})`);
        
        // 4. Check if dates are DateEnvelope objects
        if (firstSession.created_at) {
            console.log(`\n4️⃣ created_at details:`);
            console.log(`   Is object: ${typeof firstSession.created_at === 'object'}`);
            if (typeof firstSession.created_at === 'object') {
                console.log(`   Has epochMs: ${'epochMs' in firstSession.created_at}`);
                console.log(`   Has utc: ${'utc' in firstSession.created_at}`);
                console.log(`   Has local: ${'local' in firstSession.created_at}`);
                console.log(`   Has display: ${'display' in firstSession.created_at}`);
                console.log(`   Full object:`, firstSession.created_at);
            }
        }
        
        if (firstSession.completed_at) {
            console.log(`\n5️⃣ completed_at details:`);
            console.log(`   Is object: ${typeof firstSession.completed_at === 'object'}`);
            if (typeof firstSession.completed_at === 'object') {
                console.log(`   Has epochMs: ${'epochMs' in firstSession.completed_at}`);
                console.log(`   Has utc: ${'utc' in firstSession.completed_at}`);
                console.log(`   Has local: ${'local' in firstSession.completed_at}`);
                console.log(`   Has display: ${'display' in firstSession.completed_at}`);
                console.log(`   Full object:`, firstSession.completed_at);
            }
        }
        
        // 5. Test FieldRendererService
        console.log(`\n6️⃣ Testing FieldRendererService:`);
        console.log(`   Available: ${!!window.FieldRendererService}`);
        console.log(`   renderDate function: ${!!(window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function')}`);
        
        if (window.FieldRendererService && firstSession.created_at) {
            const rendered = window.FieldRendererService.renderDate(firstSession.created_at, true);
            console.log(`   Render result: ${rendered}`);
        }
        
        // 6. Test normalizeSessionRecord if available
        if (typeof window.normalizeSessionRecord === 'function') {
            console.log(`\n7️⃣ Testing normalizeSessionRecord:`);
            const normalized = window.normalizeSessionRecord(firstSession);
            console.log(`   Normalized createdAtDisplay: ${normalized.createdAtDisplay}`);
            console.log(`   Normalized updatedAtDisplay: ${normalized.updatedAtDisplay}`);
        }
        
        console.groupEnd();
        return {
            sessions,
            firstSession,
            accounts
        };
        
    } catch (error) {
        console.error('❌ Error testing import history dates:', error);
        console.groupEnd();
        return null;
    }
}

// Make it available globally
window.testImportHistoryDates = testImportHistoryDates;

console.log('✅ Test script loaded! Run testImportHistoryDates() in console');

