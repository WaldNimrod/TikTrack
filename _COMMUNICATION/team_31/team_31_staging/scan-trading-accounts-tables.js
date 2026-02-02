/**
 * Scanner for Trading Accounts Page Tables
 * Scans the live legacy server at port 8090 to extract all table structures
 */

(async function scanTradingAccountsTables() {
  const BASE_URL = 'http://127.0.0.1:8090';
  const LOGIN_URL = `${BASE_URL}/login`;
  const TRADING_ACCOUNTS_URL = `${BASE_URL}/trading_accounts`;
  
  console.log('🔍 Starting Trading Accounts Tables Scanner...\n');
  
  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=admin&password=admin123',
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful\n');
    
    // Step 2: Fetch Trading Accounts Page
    console.log('📄 Step 2: Fetching Trading Accounts page...');
    const pageResponse = await fetch(TRADING_ACCOUNTS_URL, {
      credentials: 'include',
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status}`);
    }
    
    const htmlContent = await pageResponse.text();
    console.log('✅ Page fetched\n');
    
    // Step 3: Parse HTML and extract table structures
    console.log('🔎 Step 3: Analyzing page structure...');
    
    // Extract all tables
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    const tables = htmlContent.match(tableRegex) || [];
    
    console.log(`📊 Found ${tables.length} table(s) in HTML\n`);
    
    // Extract table headers and structure
    const tableStructures = [];
    
    tables.forEach((tableHtml, index) => {
      console.log(`\n📋 Table ${index + 1}:`);
      
      // Extract table ID or class
      const idMatch = tableHtml.match(/id=["']([^"']+)["']/i);
      const classMatch = tableHtml.match(/class=["']([^"']+)["']/i);
      const dataTableType = tableHtml.match(/data-table-type=["']([^"']+)["']/i);
      
      const tableInfo = {
        index: index + 1,
        id: idMatch ? idMatch[1] : null,
        className: classMatch ? classMatch[1] : null,
        dataTableType: dataTableType ? dataTableType[1] : null,
        columns: []
      };
      
      // Extract headers
      const theadMatch = tableHtml.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      if (theadMatch) {
        const thMatches = theadMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
        thMatches.forEach((th, colIndex) => {
          const textContent = th.replace(/<[^>]+>/g, '').trim();
          const sortable = th.includes('sortable') || th.includes('data-sort');
          const sortKey = th.match(/data-sort-key=["']([^"']+)["']/i)?.[1] || null;
          
          tableInfo.columns.push({
            index: colIndex,
            header: textContent,
            sortable: sortable,
            sortKey: sortKey
          });
        });
      }
      
      // Extract sample rows (first 3 rows)
      const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      if (tbodyMatch) {
        const rowMatches = tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
        tableInfo.sampleRows = rowMatches.slice(0, 3).map(row => {
          const cellMatches = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
          return cellMatches.map(cell => {
            return cell.replace(/<[^>]+>/g, '').trim();
          });
        });
      }
      
      tableStructures.push(tableInfo);
      
      console.log(`  ID: ${tableInfo.id || 'N/A'}`);
      console.log(`  Class: ${tableInfo.className || 'N/A'}`);
      console.log(`  Data Table Type: ${tableInfo.dataTableType || 'N/A'}`);
      console.log(`  Columns (${tableInfo.columns.length}):`);
      tableInfo.columns.forEach(col => {
        console.log(`    ${col.index}: ${col.header}${col.sortable ? ' [SORTABLE]' : ''}${col.sortKey ? ` (key: ${col.sortKey})` : ''}`);
      });
      
      if (tableInfo.sampleRows && tableInfo.sampleRows.length > 0) {
        console.log(`  Sample Rows: ${tableInfo.sampleRows.length}`);
        tableInfo.sampleRows.forEach((row, rowIndex) => {
          console.log(`    Row ${rowIndex + 1}: ${row.join(' | ')}`);
        });
      }
    });
    
    // Step 4: Look for dynamically generated tables (check for table containers)
    console.log('\n\n🔎 Step 4: Looking for table containers and dynamic structures...');
    
    // Look for common table container patterns
    const containerPatterns = [
      /<div[^>]*class=["'][^"']*table[^"']*["'][^>]*>/gi,
      /<div[^>]*id=["'][^"']*table[^"']*["'][^>]*>/gi,
      /<section[^>]*class=["'][^"']*table[^"']*["'][^>]*>/gi,
    ];
    
    const containers = [];
    containerPatterns.forEach(pattern => {
      const matches = htmlContent.match(pattern) || [];
      matches.forEach(match => {
        const idMatch = match.match(/id=["']([^"']+)["']/i);
        const classMatch = match.match(/class=["']([^"']+)["']/i);
        containers.push({
          id: idMatch ? idMatch[1] : null,
          className: classMatch ? classMatch[1] : null,
          html: match
        });
      });
    });
    
    console.log(`📦 Found ${containers.length} potential table containers`);
    
    // Step 5: Output results
    console.log('\n\n📊 SCAN RESULTS SUMMARY:');
    console.log('='.repeat(60));
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      url: TRADING_ACCOUNTS_URL,
      tablesFound: tables.length,
      tableStructures: tableStructures,
      containersFound: containers.length
    }, null, 2));
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'trading-accounts-tables-scan.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      url: TRADING_ACCOUNTS_URL,
      tablesFound: tables.length,
      tableStructures: tableStructures,
      containersFound: containers.length
    }, null, 2));
    
    console.log(`\n✅ Results saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
})();
