/**
 * Grid Data Management Module
 * מודול ניהול נתונים לגריד - משותף לכל הדפים
 * 
 * This module provides centralized data management functionality for all grid components
 * in the TikTrack application. It handles data loading, processing, and statistics
 * calculation for various trading-related data.
 * 
 * Features:
 * - Default data generation for development/testing
 * - Server data loading with fallback to mock data
 * - Data processing and formatting utilities
 * - Statistics calculation and display
 * - Error handling and logging
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-16
 * 
 * 🚨 CRITICAL REMINDERS:
 * - ALWAYS start with: cd Backend && ./run_monitored.sh
 * - ALWAYS check health: curl http://localhost:8080/api/health
 * - NEVER write routes directly in app.py - use blueprints only!
 * - ALWAYS follow architecture: Models → Services → Routes → App
 * - ALWAYS use port 8080
 * - ALWAYS test all CRUD operations: GET, POST, PUT, DELETE
 */

// ===== GRID DATA MANAGEMENT =====
// קובץ ייעודי לניהול נתונים - משותף לכל הדפים

/**
 * Generate default row data for development and testing
 * 
 * This function provides sample data that mimics the structure of real trading data.
 * Used when server data is unavailable or for development purposes.
 * 
 * @returns {Array} Array of sample trading records
 */
const getDefaultRowData = () => [
  { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "⬅️", account: "חשבון ראשי" },
  { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "⬅️", account: "חשבון משני" },
  { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "⬅️", account: "חשבון ראשי" },
  { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "⬅️", account: "חשבון משני" },
  { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "⬅️", account: "חשבון ראשי" },
  { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "⬅️", account: "חשבון משני" }
];

/**
 * Load trading plans data from the server
 * 
 * This function attempts to load real data from the TikTrack backend API.
 * If the server is unavailable or returns an error, it falls back to
 * default mock data for development purposes.
 * 
 * TODO: Update to use new API endpoints (/api/v1/trade_plans/)
 * 
 * @returns {Promise<Array>} Promise that resolves to array of trading plans
 */
async function loadPlansFromServer() {
  try {
    console.log('Loading plans from server...');
    
    // TODO: Update to use new modular API
    // const response = await fetch('/api/v1/trade_plans/');
    // const data = await response.json();
    
    // כרגע נחזיר נתוני דוגמה
    const data = getDefaultRowData();
    
    console.log('Plans loaded from server:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Error loading plans from server:', error);
    // במקרה של שגיאה, נחזיר נתוני דוגמה
    return getDefaultRowData();
  }
}

/**
 * Extract numeric amount from formatted amount string
 * 
 * This utility function parses amount strings that contain currency symbols,
 * commas, and additional information (like share counts) to extract the
 * pure numeric value.
 * 
 * Examples:
 * - "$25,000 (#100)" -> 25000
 * - "$1,500" -> 1500
 * - "1500" -> 1500
 * 
 * @param {string} amountString - Formatted amount string to parse
 * @returns {number} Extracted numeric amount, 0 if parsing fails
 */
function extractAmount(amountString) {
  if (!amountString) return 0;
  
  // מחפש מספר אחרי הסימן $ ולפני הסימן (
  const match = amountString.match(/\$([0-9,]+)/);
  if (match) {
    // מסיר פסיקים וממיר למספר
    return parseFloat(match[1].replace(/,/g, ''));
  }
  
  // אם לא מצאנו $, נחפש מספר רגיל
  const numberMatch = amountString.match(/[\d,]+/);
  if (numberMatch) {
    return parseInt(numberMatch[0].replace(/,/g, ''));
  }
  
  return 0;
}

/**
 * Update summary statistics display
 * 
 * This function calculates and displays various statistics based on the
 * current data in the grid. It can work with provided data, grid data,
 * or fallback to window.rowData.
 * 
 * Statistics calculated:
 * - Total number of records
 * - Total amount invested
 * - Average amount per record
 * - Status distribution
 * 
 * @param {Array} data - Optional data array to calculate stats from
 */
function updateSummaryStats(data = null) {
  console.log('=== updateSummaryStats called ===');
  console.log('Input data:', data);
  console.log('window.rowData:', window.rowData);
  console.log('window.gridApi exists:', !!window.gridApi);
  
  let statsData;
  
  // אם לא הועברו נתונים, השתמש בנתונים המוצגים בגריד (כמו בדף התכנונים)
  if (!data && window.gridApi) {
    const displayedRows = [];
    window.gridApi.forEachNodeAfterFilter(node => {
      displayedRows.push(node.data);
    });
    statsData = displayedRows;
    console.log('Using displayed rows from grid:', statsData);
  } else if (!data) {
    statsData = window.rowData || [];
    console.log('Using window.rowData:', statsData);
  } else {
    statsData = data;
    console.log('Using provided data:', statsData);
  }
  
  console.log('Stats data to process:', statsData);
  console.log('Stats data length:', statsData.length);
  
  if (statsData.length === 0) {
    console.log('No data to calculate statistics');
    // עדכון תצוגה עם אפסים
    updateStatsDisplay({
      totalRecords: 0,
      totalAmount: 0,
      averageAmount: 0
    });
    return;
  }
  
  // חישוב סטטיסטיקות כלליות
  const totalRecords = statsData.length;
  let totalAmount = 0;
  
  // חישוב סכום כולל
  statsData.forEach(record => {
    try {
      totalAmount += extractAmount(record.amount);
    } catch (e) {
      console.log('שגיאה בחישוב סכום לרשומה:', record, e);
    }
  });
  
  // חישוב סכום ממוצע
  const averageAmount = totalRecords > 0 ? Math.round(totalAmount / totalRecords) : 0;
  
  console.log('Summary statistics calculated:', {
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });
  
  // עדכון תצוגת הסטטיסטיקות
  updateStatsDisplay({
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });
}

/**
 * Update the statistics display elements
 * 
 * This function formats and updates the HTML elements that display
 * the total records, total amount, and average amount.
 * 
 * @param {Object} stats - Object containing statistics to display
 */
function updateStatsDisplay(stats) {
  console.log('=== updateStatsDisplay called ===');
  console.log('Stats to display:', stats);
  
  // פונקציה לעיצוב מספרים עם פסיקים
  const formatNumber = (num) => {
    return num.toLocaleString('he-IL');
  };
  
  // פונקציה לעיצוב סכומים בדולרים
  const formatCurrency = (num) => {
    return `$${num.toLocaleString('he-IL')}`;
  };
  
  // עדכון התצוגה עם המידע החדש
  const summaryDiv = document.querySelector('.info-summary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div>סה"כ רשומות: <strong>${formatNumber(stats.totalRecords)}</strong></div>
      <div>סה"כ סכום: <strong>${formatCurrency(stats.totalAmount)}</strong></div>
      <div>סכום ממוצע: <strong>${formatCurrency(stats.averageAmount)}</strong></div>
    `;
    console.log('Updated info-summary with:', stats);
  } else {
    console.warn('info-summary element not found');
  }
  
  console.log('Stats display updated:', stats);
}

/**
 * Mark an alert as read
 * 
 * This function simulates marking an alert as read by hiding the button.
 * In a real application, it would communicate with a backend API to update
 * the alert status.
 * 
 * @param {HTMLElement} button - The button element to hide
 * @param {string} ticker - The ticker symbol of the alert
 */
function markAlertAsRead(button, ticker) {
  try {
    console.log('Marking alert as read for:', ticker);
    
    // הסתרת הכפתור
    if (button) {
      button.style.display = 'none';
    }
    
    // כאן תהיה קריאה לשרת לעדכון סטטוס ההתראה
    // await fetch('/api/alerts/mark-read', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ticker })
    // });
    
    console.log('Alert marked as read successfully');
  } catch (error) {
    console.error('Error marking alert as read:', error);
  }
}

/**
 * Load data from the server with filters applied
 * 
 * This function fetches all data from the server and then applies
 * the provided filters to return the filtered data.
 * 
 * @param {Object} filters - Object containing filter criteria
 * @returns {Promise<Array>} Promise that resolves to filtered data
 */
async function loadFilteredData(filters = {}) {
  try {
    console.log('Loading filtered data with filters:', filters);
    
    // טעינת כל הנתונים מהשרת
    const allData = await loadPlansFromServer();
    
    // החלת פילטרים
    let filteredData = allData;
    
    if (filters.statuses && filters.statuses.length > 0) {
      filteredData = filteredData.filter(item => filters.statuses.includes(item.status));
    }
    
    if (filters.types && filters.types.length > 0) {
      filteredData = filteredData.filter(item => filters.types.includes(item.type));
    }
    
    if (filters.accounts && filters.accounts.length > 0) {
      // כאן תהיה פילטרציה לפי חשבונות
      // filteredData = filteredData.filter(item => filters.accounts.includes(item.account));
    }
    
    console.log('Filtered data loaded:', filteredData.length, 'items');
    return filteredData;
  } catch (error) {
    console.error('Error loading filtered data:', error);
    return [];
  }
}

/**
 * Create sample data for development and testing
 * 
 * This function generates a specified number of random sample trading plans.
 * It includes various types, statuses, and dates.
 * 
 * @param {number} count - Number of sample data items to generate
 * @returns {Array} Array of sample trading plan objects
 */
function createSampleData(count = 10) {
  const tickers = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'GOOG', 'MSFT', 'META', 'NFLX', 'AMD', 'INTC'];
  const types = ['סווינג', 'השקעה', 'פאסיבי'];
  const statuses = ['פתוח', 'סגור', 'מבוטל'];
  
  const sampleData = [];
  
  for (let i = 0; i < count; i++) {
    const ticker = tickers[Math.floor(Math.random() * tickers.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // יצירת תאריך אקראי בחודש האחרון
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const dateStr = date.toISOString().split('T')[0];
    
    // יצירת נתונים אקראיים
    const amount = Math.floor(Math.random() * 50000) + 5000;
    const shares = Math.floor(Math.random() * 200) + 50;
    const targetPrice = Math.floor(Math.random() * 100) + 100;
    const stopPrice = Math.floor(Math.random() * 50) + 50;
    const currentPrice = Math.floor(Math.random() * 50) + 75;
    
    sampleData.push({
      ticker,
      date: dateStr,
      type,
      amount: `$${amount.toLocaleString()} (#${shares})`,
      target: `$${targetPrice} (${Math.floor(Math.random() * 20) + 5}%)`,
      stop: `$${stopPrice} (-${Math.floor(Math.random() * 10) + 2}%)`,
      current: `$${currentPrice} (${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 5).toFixed(1)}%)`,
      status,
      action: '⬅️'
    });
  }
  
  return sampleData;
}

/**
 * Save data to localStorage
 * 
 * This function stores the provided data array in localStorage under a specified key.
 * 
 * @param {Array} data - Data array to save
 * @param {string} key - Key under which to save the data (default: 'gridData')
 */
function saveDataToLocalStorage(data, key = 'gridData') {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Data saved to localStorage:', data.length, 'items');
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 * 
 * This function retrieves data from localStorage that was previously saved
 * under a specified key.
 * 
 * @param {string} key - Key under which the data was saved (default: 'gridData')
 * @returns {Array|null} Loaded data array, or null if no data found
 */
function loadDataFromLocalStorage(key = 'gridData') {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsedData = JSON.parse(data);
      console.log('Data loaded from localStorage:', parsedData.length, 'items');
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  return null;
}

/**
 * Clear data from localStorage
 * 
 * This function removes data from localStorage that was previously saved
 * under a specified key.
 * 
 * @param {string} key - Key under which the data was saved (default: 'gridData')
 */
function clearDataFromLocalStorage(key = 'gridData') {
  try {
    localStorage.removeItem(key);
    console.log('Data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
  }
}

/**
 * Initialize data for the application
 * 
 * This function checks if there is existing data in localStorage.
 * If not, it loads data from the server. It then sets the data
 * as global variables for grid updates.
 * 
 * @returns {Promise<Array>} The initialized data array
 */
async function initializeData() {
  console.log('Initializing data...');
  
  // בדיקה אם יש נתונים שמורים
  let data = loadDataFromLocalStorage();
  
  if (!data) {
    // טעינת נתונים מהשרת או שימוש בנתוני דוגמה
    data = await loadPlansFromServer();
    
    // שמירת הנתונים ב-localStorage
    saveDataToLocalStorage(data);
  }
  
  // הגדרת הנתונים כגלובליים
  window.rowData = data;
  
  // עדכון סטטיסטיקות
  updateSummaryStats(data);
  
  console.log('Data initialized:', data.length, 'items');
  return data;
}

/**
 * Refresh data from the server
 * 
 * This function fetches the latest data from the server and updates
 * the global data variable. It also saves the new data to localStorage.
 * 
 * @returns {Promise<Array>} The refreshed data array
 */
async function refreshData() {
  console.log('Refreshing data...');
  
  // טעינת נתונים חדשים מהשרת
  const newData = await loadPlansFromServer();
  
  // עדכון הנתונים הגלובליים
  window.rowData = newData;
  
  // שמירת הנתונים החדשים
  saveDataToLocalStorage(newData);
  
  // עדכון הגריד אם הוא קיים
  if (window.updateGridData) {
    window.updateGridData(newData);
  }
  
  // עדכון סטטיסטיקות
  updateSummaryStats(newData);
  
  console.log('Data refreshed:', newData.length, 'items');
  return newData;
}

// ===== GRID UNIVERSAL DATA LOADER =====
// פונקציונליות חדשה לטעינת נתונים כללית מבסיס הנתונים

// משתנים גלובליים לנתונים
let currentDataSource = null;
let currentDataConfig = null;

// הגדרות ברירת מחדל לנתונים
const DEFAULT_DATA_CONFIG = {
  apiEndpoint: 'http://127.0.0.1:8080/api/tradeplans',
  dataMapping: {
    ticker: 'ticker',
    date: 'created_at',
    type: 'investment_type',
    amount: 'planned_amount',
    target: 'target_price',
    stop: 'stop_price',
    current: 'current_price',
    status: 'status',
    action: 'action',
    account: 'account_name'
  },
  statusMapping: {
    'open': 'פתוח',
    'closed': 'סגור',
    'pending': 'מבוטל',
    'canceled': 'מבוטל',
    'cancelled': 'מבוטל'
  },
  typeMapping: {
    'long': 'השקעה',
    'short': 'סווינג',
    'passive': 'פאסיבי'
  },
  defaultFilters: {
    statuses: ['פתוח']
  }
};

/**
 * Load data from the database (backend)
 * 
 * This function fetches data from a specified API endpoint and processes it
 * into a format suitable for the grid. It handles configuration merging
 * and error handling.
 * 
 * @param {Object} config - Optional custom configuration for the data source
 * @returns {Promise<Array>} Promise that resolves to processed data
 */
async function loadDataFromDatabase(config = {}) {
  try {
    console.log('Loading data from database with config:', config);
    
    // מיזוג הגדרות מותאמות אישית עם ברירת המחדל
    const dataConfig = { ...DEFAULT_DATA_CONFIG, ...config };
    currentDataConfig = dataConfig;
    
    // קריאה לשרת
    const response = await fetch(dataConfig.apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log('Raw data from server:', rawData);
    
    // המרת הנתונים לפורמט הנדרש לגריד
    const processedData = processDataForGrid(rawData, dataConfig);
    console.log('Processed data for grid:', processedData);
    
    // שמירת הנתונים הגלובליים
    window.rowData = processedData;
    currentDataSource = processedData;
    
    // עדכון הגריד אם הוא קיים
    if (window.gridApi) {
      updateGridData(processedData);
      // הסטטיסטיקות יתעדכנו על ידי הפילטר
    } else {
      // אם הגריד לא קיים, עדכן רק את הסטטיסטיקות
      updateSummaryStats(processedData);
    }
    
    console.log('Data loaded successfully:', processedData.length, 'items');
    return processedData;
    
  } catch (error) {
    console.error('Error loading data from database:', error);
    
    // במקרה של שגיאה, נחזיר נתוני דוגמה
    const fallbackData = getDefaultRowData();
    window.rowData = fallbackData;
    currentDataSource = fallbackData;
    
    if (window.gridApi) {
      updateGridData(fallbackData);
    }
    
    return fallbackData;
  }
}

/**
 * Process raw data from the database into a format suitable for the grid
 * 
 * This function maps raw database fields to grid-friendly fields and
 * formats them appropriately.
 * 
 * @param {Array} rawData - Array of raw data objects from the database
 * @param {Object} config - Configuration object for data mapping
 * @returns {Array} Array of processed data objects for the grid
 */
function processDataForGrid(rawData, config) {
  console.log('=== processDataForGrid called ===');
  console.log('Raw data:', rawData);
  console.log('Config:', config);
  
  const mapping = config.dataMapping;
  const statusMapping = config.statusMapping;
  const typeMapping = config.typeMapping;
  
  const processedData = rawData.map(item => {
    // המרת תאריך
    const date = item[mapping.date] ? formatDate(item[mapping.date]) : 'N/A';
    
    // המרת סטטוס
    const rawStatus = item[mapping.status] || 'open';
    const status = statusMapping[rawStatus] || rawStatus;
    
    // המרת סוג
    const rawType = item[mapping.type] || 'long';
    const type = typeMapping[rawType] || rawType;
    
    // המרת סכום
    const amount = item[mapping.amount] ? formatAmount(item[mapping.amount]) : 'N/A';
    
    // המרת מחירים
    const target = item[mapping.target] ? formatPrice(item[mapping.target]) : 'N/A';
    const stop = item[mapping.stop] ? formatPrice(item[mapping.stop]) : 'N/A';
    const current = item[mapping.current] ? formatPrice(item[mapping.current]) : 'N/A';
    
    const processedItem = {
      ticker: item[mapping.ticker] || 'N/A',
      date: date,
      type: type,
      amount: amount,
      target: target,
      stop: stop,
      current: current,
      status: status,
      action: '⬅️',
      account: item[mapping.account] || 'N/A'
    };
    
    console.log('Processed item:', processedItem);
    return processedItem;
  });
  
  console.log('Final processed data:', processedData);
  return processedData;
}

/**
 * Format a date string into a YYYY-MM-DD format
 * 
 * This function attempts to parse a date string and return it in a consistent
 * YYYY-MM-DD format.
 * 
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return dateString;
  }
}

/**
 * Format an amount string into a currency string
 * 
 * This function takes a number or a string and formats it as a currency
 * string (e.g., "$1,234.56").
 * 
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatAmount(amount) {
  if (typeof amount === 'number') {
    return `$${amount.toLocaleString()}`;
  }
  return amount;
}

/**
 * Format a price string into a currency string
 * 
 * This function takes a number or a string and formats it as a currency
 * string (e.g., "$123.45").
 * 
 * @param {number|string} price - Price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  return price;
}

/**
 * Load filtered data from the database with specific filters applied
 * 
 * This function fetches all data from the database and then applies
 * the provided filters to return the filtered data.
 * 
 * @param {Object} filters - Object containing filter criteria
 * @param {Object} config - Optional custom configuration for the data source
 * @returns {Promise<Array>} Promise that resolves to filtered data
 */
async function loadFilteredDataFromDatabase(filters = {}, config = {}) {
  try {
    console.log('Loading filtered data from database:', filters);
    
    // טעינת כל הנתונים
    const allData = await loadDataFromDatabase(config);
    
    // החלת פילטרים
    let filteredData = allData;
    
    if (filters.statuses && filters.statuses.length > 0) {
      filteredData = filteredData.filter(item => filters.statuses.includes(item.status));
    }
    
    if (filters.types && filters.types.length > 0) {
      filteredData = filteredData.filter(item => filters.types.includes(item.type));
    }
    
    if (filters.accounts && filters.accounts.length > 0) {
      // כאן תהיה פילטרציה לפי חשבונות אם יש שדה כזה
      // filteredData = filteredData.filter(item => filters.accounts.includes(item.account));
    }
    
    console.log('Filtered data:', filteredData.length, 'items');
    return filteredData;
    
  } catch (error) {
    console.error('Error loading filtered data:', error);
    return [];
  }
}

/**
 * Initialize the grid with data from the database
 * 
 * This function sets up the grid on a specified container and
 * configures it with data from the database. It also initializes
 * the filter system and applies default filters.
 * 
 * @param {string} containerId - ID of the HTML element to contain the grid
 * @param {Object} config - Optional custom configuration for the grid
 * @returns {boolean} True if grid initialization was successful, false otherwise
 */
async function initializeGridWithDatabaseData(containerId = '#agGridFloating', config = {}) {
  console.log('=== Initializing Grid with Database Data ===');
  
  try {
    // 1. טעינת נתונים מבסיס הנתונים
    console.log('1. Loading data from database...');
    
    // אם זה דף בדיקת הגריד, נטען טריידים במקום תכנונים
    let data;
    if (window.location.pathname.includes('grid-test')) {
      console.log('Grid test page detected, loading trades instead of trade plans...');
      data = await loadDataByType('trades', config);
    } else {
      data = await loadDataFromDatabase(config);
    }
    
    // 2. יצירת הגריד עם הגדרות מותאמות אישית
    console.log('2. Creating grid...');
    const gridOptions = createGrid(containerId, data, config.gridOptions || {});
    
    if (!gridOptions) {
      console.error('Failed to create grid');
      return false;
    }
    
    // 3. אתחול מערכת הפילטרים
    console.log('3. Initializing filter system...');
    initializeFilterSystem();
    
    // 4. החלת פילטרים ברירת מחדל
    console.log('4. Applying default filters...');
    const defaultFilters = config.defaultFilters || DEFAULT_DATA_CONFIG.defaultFilters;
    if (defaultFilters.statuses) {
              applyStatusFilterToGrid(defaultFilters.statuses, null);
    }
    
    // 5. הסטטיסטיקות יתעדכנו על ידי הפילטר
    console.log('5. Statistics will be updated by filter');
    
    console.log('=== Grid with Database Data Initialized Successfully ===');
    return true;
    
  } catch (error) {
    console.error('Error initializing grid with database data:', error);
    return false;
  }
}

/**
 * Refresh data from the database
 * 
 * This function fetches the latest data from the database and updates
 * the grid if it exists. It also updates the statistics.
 * 
 * @param {Object} config - Optional custom configuration for the data source
 * @returns {Promise<Array>} The refreshed data array
 */
async function refreshDatabaseData(config = {}) {
  console.log('Refreshing database data...');
  
  try {
    const newData = await loadDataFromDatabase(config);
    
    // עדכון הגריד אם הוא קיים
    if (window.gridApi) {
      updateGridData(newData);
      // הסטטיסטיקות יתעדכנו על ידי הפילטר
    } else {
      // אם הגריד לא קיים, עדכן רק את הסטטיסטיקות
      updateSummaryStats(newData);
    }
    
    console.log('Database data refreshed successfully');
    return newData;
    
  } catch (error) {
    console.error('Error refreshing database data:', error);
    return null;
  }
}

/**
 * Load a list of accounts from the server
 * 
 * This function fetches a list of account names from the backend API.
 * It's used to populate dropdowns for account filtering.
 * 
 * @returns {Promise<Array<string>>} Promise that resolves to an array of account names
 */
async function loadAccountsList() {
  try {
    console.log('Loading accounts list from server...');
    
            const response = await fetch('http://127.0.0.1:8080/api/accounts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const accounts = await response.json();
    console.log('Accounts loaded:', accounts);
    
    // החזרת רשימת שמות החשבונות בלבד
    const accountNames = accounts.map(account => account.name);
    console.log('Account names:', accountNames);
    
    return accountNames;
  } catch (error) {
    console.error('Error loading accounts list:', error);
    // במקרה של שגיאה, נחזיר רשימת דוגמה
    return ['חשבון ראשי', 'חשבון משני'];
  }
}

/**
 * Load data based on a specific data type (tradeplans, trades, alerts)
 * 
 * This function fetches data from a specific API endpoint and processes it
 * into a format suitable for the grid. It handles configuration merging.
 * 
 * @param {string} dataType - Type of data to load ('tradeplans', 'trades', 'alerts')
 * @param {Object} customConfig - Optional custom configuration for the data source
 * @returns {Promise<Array>} Promise that resolves to processed data
 */
async function loadDataByType(dataType, customConfig = {}) {
  console.log('=== loadDataByType called ===');
  console.log('Data type:', dataType);
  console.log('Custom config:', customConfig);
  
  const dataTypes = {
    'tradeplans': {
      apiEndpoint: 'http://127.0.0.1:8080/api/tradeplans',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'investment_type',
        amount: 'planned_amount',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    },
    'trades': {
      apiEndpoint: 'http://127.0.0.1:8080/api/trades',
      dataMapping: {
        ticker: 'ticker',
        date: 'opened_at',
        type: 'type',
        amount: 'total_pl',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    },
    'alerts': {
      apiEndpoint: 'http://127.0.0.1:8080/api/alerts',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'type',
        amount: 'condition',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    }
  };
  
  const config = dataTypes[dataType];
  if (!config) {
    console.error('Unknown data type:', dataType);
    return null;
  }
  
  // מיזוג עם הגדרות מותאמות אישית
  const finalConfig = { ...config, ...customConfig };
  console.log('Final config:', finalConfig);
  
  const result = await loadDataFromDatabase(finalConfig);
  console.log('loadDataByType result:', result);
  
  return result;
}

/**
 * Get information about the current data source
 * 
 * This function returns an object containing the current data source,
 * its configuration, and the number of items in it.
 * 
 * @returns {Object} Object containing data source info
 */
function getCurrentDataSourceInfo() {
  return {
    dataSource: currentDataSource,
    config: currentDataConfig,
    count: currentDataSource ? currentDataSource.length : 0
  };
}

/**
 * Check if the server is available
 * 
 * This function attempts to connect to a specific API endpoint to check
 * if the backend server is running and accessible.
 * 
 * @returns {Promise<boolean>} Promise that resolves to true if server is available, false otherwise
 */
async function checkServerAvailability() {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/tradeplans');
    return response.ok;
  } catch (error) {
    console.error('Server not available:', error);
    return false;
  }
}

// הפיכת הפונקציות לזמינות גלובלית
window.getDefaultRowData = getDefaultRowData;
window.loadPlansFromServer = loadPlansFromServer;
window.updateSummaryStats = updateSummaryStats;
window.updateStatsDisplay = updateStatsDisplay;
window.markAlertAsRead = markAlertAsRead;
window.loadFilteredData = loadFilteredData;
window.createSampleData = createSampleData;
window.saveDataToLocalStorage = saveDataToLocalStorage;
window.loadDataFromLocalStorage = loadDataFromLocalStorage;
window.clearDataFromLocalStorage = clearDataFromLocalStorage;
window.initializeData = initializeData;
window.refreshData = refreshData;

// פונקציות חדשות לטעינת נתונים מבסיס הנתונים
window.loadDataFromDatabase = loadDataFromDatabase;
window.processDataForGrid = processDataForGrid;
window.loadFilteredDataFromDatabase = loadFilteredDataFromDatabase;
window.initializeGridWithDatabaseData = initializeGridWithDatabaseData;
window.refreshDatabaseData = refreshDatabaseData;
window.loadDataByType = loadDataByType;
window.getCurrentDataSourceInfo = getCurrentDataSourceInfo;
window.checkServerAvailability = checkServerAvailability;
