const fs = require('fs');

const matrixContent = fs.readFileSync('documentation/05-REPORTS/INIT_LOADING_FULL_PAGE_MATRIX_2026_01_01.md', 'utf8');

const pages = [];
const lines = matrixContent.split('\n');

for (const line of lines) {
    if (line.startsWith('| /') && !line.includes('/test_') && !line.includes('/mockups/')) {
        const page = line.split('|')[1].trim();
        if (page && page !== '**עמודי אימות (4)**' && page !== '**עמודי עזר ומערכת (25)**' && !page.includes('**')) {
            pages.push(page);
        }
    }
}

console.log('Found', pages.length, 'pages:');
pages.forEach(page => console.log(`'${page}',`));
