/**
 * Browser Console Scanner for Trading Accounts Tables
 * 
 * Instructions:
 * 1. Navigate to http://127.0.0.1:8090/trading_accounts (logged in as admin/admin123)
 * 2. Open browser console (F12)
 * 3. Paste and run this script
 * 4. Copy the output JSON
 */

(function scanTradingAccountsTables() {
  console.log('🔍 Scanning Trading Accounts Page Tables...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    pageTitle: document.title,
    containers: [],
    tables: []
  };
  
  // Find all table elements
  const allTables = document.querySelectorAll('table');
  console.log(`📊 Found ${allTables.length} <table> elements\n`);
  
  allTables.forEach((table, tableIndex) => {
    const tableInfo = {
      index: tableIndex + 1,
      id: table.id || null,
      className: table.className || null,
      dataTableType: table.getAttribute('data-table-type') || null,
      columns: [],
      sampleRows: [],
      container: null
    };
    
    // Find container
    const container = table.closest('.content-section, .section-body, [data-section], [id*="container"], [id*="section"]');
    if (container) {
      const containerTitle = container.querySelector('.table-title, h2, h3, .section-title')?.textContent?.trim();
      tableInfo.container = {
        id: container.id || null,
        className: container.className || null,
        title: containerTitle || null
      };
    }
    
    // Extract headers
    const thead = table.querySelector('thead');
    if (thead) {
      const headers = thead.querySelectorAll('th');
      headers.forEach((th, colIndex) => {
        const headerText = th.textContent.trim();
        const isSortable = th.classList.contains('sortable-header') || 
                          th.hasAttribute('data-sort') ||
                          th.hasAttribute('data-sortable');
        const sortKey = th.getAttribute('data-sort-key') || 
                       th.getAttribute('data-sort') ||
                       null;
        const sortType = th.getAttribute('data-sort-type') || null;
        
        // Extract column classes (col-name, col-balance, etc.)
        const colClasses = Array.from(th.classList).filter(cls => cls.startsWith('col-'));
        
        tableInfo.columns.push({
          index: colIndex,
          header: headerText,
          sortable: isSortable,
          sortKey: sortKey,
          sortType: sortType,
          columnClasses: colClasses,
          html: th.outerHTML
        });
      });
    }
    
    // Extract sample rows (first 5 rows)
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      const maxRows = Math.min(5, rows.length);
      
      for (let i = 0; i < maxRows; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        const rowData = {
          rowIndex: i,
          cells: []
        };
        
        cells.forEach((cell, cellIndex) => {
          const cellText = cell.textContent.trim();
          const cellClasses = Array.from(cell.classList);
          const colClasses = cellClasses.filter(cls => cls.startsWith('col-'));
          
          rowData.cells.push({
            index: cellIndex,
            text: cellText,
            classes: cellClasses,
            columnClasses: colClasses,
            html: cell.outerHTML
          });
        });
        
        tableInfo.sampleRows.push(rowData);
      }
    }
    
    report.tables.push(tableInfo);
    
    console.log(`\n📋 Table ${tableIndex + 1}:`);
    console.log(`  ID: ${tableInfo.id || 'N/A'}`);
    console.log(`  Container: ${tableInfo.container?.title || 'N/A'}`);
    console.log(`  Columns: ${tableInfo.columns.length}`);
    tableInfo.columns.forEach(col => {
      console.log(`    ${col.index}: "${col.header}"${col.sortable ? ' [SORTABLE]' : ''}${col.columnClasses.length > 0 ? ` (${col.columnClasses.join(', ')})` : ''}`);
    });
    console.log(`  Sample Rows: ${tableInfo.sampleRows.length}`);
  });
  
  // Find containers/sections
  const containers = document.querySelectorAll('.content-section, [data-section], [id*="container"]');
  containers.forEach((container, index) => {
    const title = container.querySelector('.table-title, h2, h3, .section-title')?.textContent?.trim();
    const tablesInContainer = container.querySelectorAll('table');
    
    if (title || tablesInContainer.length > 0) {
      report.containers.push({
        index: index + 1,
        id: container.id || null,
        className: container.className || null,
        title: title || null,
        tableCount: tablesInContainer.length
      });
    }
  });
  
  console.log(`\n\n📦 Found ${report.containers.length} containers/sections`);
  report.containers.forEach(container => {
    console.log(`  ${container.index}: ${container.title || container.id || 'Untitled'} (${container.tableCount} tables)`);
  });
  
  // Output full report
  console.log('\n\n📊 FULL REPORT (JSON):');
  console.log('='.repeat(80));
  const reportJson = JSON.stringify(report, null, 2);
  console.log(reportJson);
  console.log('='.repeat(80));
  
  // Save to window for easy copy
  window.tradingAccountsTablesScan = report;
  console.log('\n💾 Report saved to window.tradingAccountsTablesScan');
  console.log('📋 Copy with: JSON.stringify(window.tradingAccountsTablesScan, null, 2)');
  
  return report;
})();
