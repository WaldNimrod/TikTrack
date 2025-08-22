/**
 * Simple filter for trades table
 * Works directly on the table without complexity
 */

class SimpleFilter {
    constructor() {
        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            search: ''
        };
    }

    init() {
        console.log('🔧 SimpleFilter initializing...');

        // Immediate check if elements exist
        const headerElement = document.getElementById('unified-header');
        console.log('🔧 Header element exists:', !!headerElement);

        if (headerElement) {
            const statusMenu = headerElement.querySelector('#statusFilterMenu');
            const typeMenu = headerElement.querySelector('#typeFilterMenu');
            const accountMenu = headerElement.querySelector('#accountFilterMenu');

            console.log('🔧 Menus exist - Status:', !!statusMenu, 'Type:', !!typeMenu, 'Account:', !!accountMenu);

            if (statusMenu) {
                const statusItems = statusMenu.querySelectorAll('.filter-item');
                console.log('🔧 Status items count:', statusItems.length);
            }
        }

        // Wait until elements are available
        this.waitForElements();
    }

    waitForElements() {
        // Check if elements exist - search within unified-header
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) {
            console.log('🔧 Header element not ready, waiting...');
            setTimeout(() => this.waitForElements(), 100);
            return;
        }

        const statusMenu = headerElement.querySelector('#statusFilterMenu');
        const typeMenu = headerElement.querySelector('#typeFilterMenu');
        const accountMenu = headerElement.querySelector('#accountFilterMenu');

        if (statusMenu && typeMenu && accountMenu) {
            console.log('🔧 Filter elements found, setting up listeners...');

            // Additional check - are there items in the menus
            const statusItems = statusMenu.querySelectorAll('.filter-item');
            const typeItems = typeMenu.querySelectorAll('.filter-item');
            const accountItems = accountMenu.querySelectorAll('.filter-item');

            console.log('🔧 Items found - Status:', statusItems.length, 'Type:', typeItems.length, 'Account:', accountItems.length);

            if (statusItems.length > 0 || typeItems.length > 0 || accountItems.length > 0) {
                this.setupEventListeners();
            } else {
                console.log('🔧 No filter items found yet, waiting...');
                setTimeout(() => this.waitForElements(), 100);
            }
        } else {
            console.log('🔧 Filter elements not ready, waiting...');
            console.log(`Status: ${statusMenu ? '✅' : '❌'}, Type: ${typeMenu ? '✅' : '❌'}, Account: ${accountMenu ? '✅' : '❌'}`);
            setTimeout(() => this.waitForElements(), 100);
        }
    }

    setupEventListeners() {
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) {
            console.error('❌ Header element not found');
            return;
        }

        // Status filter
        const statusItems = headerElement.querySelectorAll('#statusFilterMenu .filter-item');
        console.log('🔧 Found status items:', statusItems.length);
        statusItems.forEach(item => {
            console.log('🔧 Adding click listener to status item:', item.textContent.trim());
            item.addEventListener('click', (e) => {
                console.log('🔍 CLICK DETECTED on status item!');
                e.preventDefault();
                e.stopPropagation();

                const status = item.getAttribute('data-value');
                console.log('🔍 Status filter clicked:', status);

                // toggle selection
                item.classList.toggle('selected');
                console.log('🔍 Toggled selected class. Has selected:', item.classList.contains('selected'));

                // collect selected statuses
                this.currentFilters.status = Array.from(headerElement.querySelectorAll('#statusFilterMenu .filter-item.selected'))
                    .map(item => item.getAttribute('data-value'));

                console.log('🔍 Selected statuses:', this.currentFilters.status);

                // update display
                this.updateStatusDisplay();
                console.log('🔍 Status display updated');

                // apply filter
                this.applyFilters();
            });
        });

        // Type filter
        const typeItems = headerElement.querySelectorAll('#typeFilterMenu .filter-item');
        console.log('🔧 Found type items:', typeItems.length);
        typeItems.forEach(item => {
            console.log('🔧 Adding click listener to type item:', item.textContent.trim());
            item.addEventListener('click', (e) => {
                console.log('🔍 CLICK DETECTED on type item!');
                e.preventDefault();
                e.stopPropagation();

                const type = item.getAttribute('data-value');
                console.log('🔍 Type filter clicked:', type);

                // toggle selection
                item.classList.toggle('selected');
                console.log('🔍 Toggled selected class. Has selected:', item.classList.contains('selected'));

                // collect selected types
                this.currentFilters.type = Array.from(headerElement.querySelectorAll('#typeFilterMenu .filter-item.selected'))
                    .map(item => item.getAttribute('data-value'));

                console.log('🔍 Selected types:', this.currentFilters.type);

                // update display
                this.updateTypeDisplay();

                // apply filter
                this.applyFilters();
            });
        });

        // Search filter
        const searchInput = document.getElementById('searchFilterInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.trim();
                console.log('🔍 Search filter:', this.currentFilters.search);
                this.applyFilters();
            });
        }

        // Account filter
        const accountItems = headerElement.querySelectorAll('#accountFilterMenu .filter-item');
        console.log('🔧 Found account items:', accountItems.length);
        accountItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // The accounts are dynamically built - take the text of the account
                const accountText = item.querySelector('.option-text')?.textContent || item.textContent.trim();
                console.log('🔍 Account text:', accountText);
                console.log('🔍 Account filter clicked:', accountText);

                // toggle selection
                item.classList.toggle('selected');

                // collect selected accounts - take the text of the selected accounts
                this.currentFilters.account = Array.from(headerElement.querySelectorAll('#accountFilterMenu .filter-item.selected'))
                    .map(item => item.querySelector('.option-text')?.textContent || item.textContent.trim());

                console.log('🔍 Selected accounts:', this.currentFilters.account);

                // update display
                this.updateAccountDisplay();

                // apply filter
                this.applyFilters();
            });
        });

        // Reset button
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    updateStatusDisplay() {
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) return;

        const statusElement = headerElement.querySelector('#selectedStatus');
        if (!statusElement) return;

        if (this.currentFilters.status.length === 0) {
            statusElement.textContent = 'All statuses';
        } else if (this.currentFilters.status.length === 1) {
            statusElement.textContent = this.currentFilters.status[0];
        } else {
            statusElement.textContent = `${this.currentFilters.status.length} statuses`;
        }
    }

    updateTypeDisplay() {
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) return;

        const typeElement = headerElement.querySelector('#selectedType');
        if (!typeElement) return;

        if (this.currentFilters.type.length === 0) {
            typeElement.textContent = 'All types';
        } else if (this.currentFilters.type.length === 1) {
            typeElement.textContent = this.currentFilters.type[0];
        } else {
            typeElement.textContent = `${this.currentFilters.type.length} types`;
        }
    }

    updateAccountDisplay() {
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) return;

        const accountElement = headerElement.querySelector('#selectedAccount');
        if (!accountElement) return;

        if (this.currentFilters.account.length === 0) {
            accountElement.textContent = 'All accounts';
        } else if (this.currentFilters.account.length === 1) {
            accountElement.textContent = this.currentFilters.account[0];
        } else {
            accountElement.textContent = `${this.currentFilters.account.length} accounts`;
        }
    }

    applyFilters() {
        console.log('🔍 Applying filters:', this.currentFilters);

        // List of tables for filtering
        const tables = ['tradesTable', 'testTable'];

        tables.forEach(tableId => {
            const table = document.getElementById(tableId);
            if (!table) {
                console.log(`⚠️ Table ${tableId} not found`);
                return;
            }

            const rows = table.querySelectorAll('tbody tr');
            let visibleCount = 0;

            console.log(`🔍 Filtering table: ${tableId} with ${rows.length} rows`);

            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 4) return;

                // Match columns for each table
                let ticker, status, type, account;

                if (tableId === 'tradesTable') {
                    // Trades table: Ticker, Status, Type, Account
                    ticker = cells[0].textContent.trim();
                    status = cells[1].textContent.trim();
                    type = cells[2].textContent.trim();
                    account = cells[3].textContent.trim();
                } else if (tableId === 'testTable') {
                    // Test table: Name, Status, Type, Account
                    ticker = cells[0].textContent.trim();
                    status = cells[1].textContent.trim();
                    type = cells[2].textContent.trim();
                    account = cells[3].textContent.trim();
                }

                console.log(`🔍 ${tableId} Row ${index}: ${ticker} - Status: "${status}", Type: "${type}", Account: "${account}"`);

                let show = true;

                // Status filter
                if (this.currentFilters.status.length > 0) {
                    if (!this.currentFilters.status.includes(status)) {
                        show = false;
                        console.log(`❌ ${tableId} Row ${index} hidden by status filter`);
                    }
                }

                // Type filter
                if (show && this.currentFilters.type.length > 0) {
                    if (!this.currentFilters.type.includes(type)) {
                        show = false;
                        console.log(`❌ ${tableId} Row ${index} hidden by type filter`);
                    }
                }

                // Account filter
                if (show && this.currentFilters.account.length > 0) {
                    if (!this.currentFilters.account.includes(account)) {
                        show = false;
                        console.log(`❌ ${tableId} Row ${index} hidden by account filter`);
                    }
                }

                // Search filter
                if (show && this.currentFilters.search) {
                    const searchLower = this.currentFilters.search.toLowerCase();
                    const searchableText = `${ticker} ${status} ${type} ${account}`.toLowerCase();
                    if (!searchableText.includes(searchLower)) {
                        show = false;
                        console.log(`❌ ${tableId} Row ${index} hidden by search filter`);
                    }
                }

                if (show) {
                    row.style.display = '';
                    visibleCount++;
                    console.log(`✅ ${tableId} Row ${index} visible`);
                } else {
                    row.style.display = 'none';
                }
            });

            console.log(`🎯 ${tableId} filter result: ${visibleCount}/${rows.length} rows visible`);
        });
    }

    resetFilters() {
        console.log('🔄 Resetting filters');

        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            search: ''
        };

        // clear UI selections
        const headerElement = document.getElementById('unified-header');
        if (headerElement) {
            headerElement.querySelectorAll('.filter-item.selected').forEach(item => {
                item.classList.remove('selected');
            });
        }

        // clear search input
        const searchInput = document.getElementById('searchFilterInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // update displays
        this.updateStatusDisplay();
        this.updateTypeDisplay();
        this.updateAccountDisplay();

        // show all rows
        this.applyFilters();
    }
}

// Create global instance
window.simpleFilter = new SimpleFilter();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.simpleFilter) {
        window.simpleFilter.init();
    }
});
