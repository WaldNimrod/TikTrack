/**
 * Script to scan and categorize the last 1000 notifications
 * סקריפט לסריקה וסיווג 1000 ההודעות האחרונות
 */

// Load the notification system
const fs = require('fs');
const path = require('path');

// Mock browser environment for Node.js
global.window = {
  localStorage: {
    getItem: (key) => {
      try {
        const data = fs.readFileSync(path.join(__dirname, 'trading-ui', 'localStorage_backup.json'), 'utf8');
        const parsed = JSON.parse(data);
        return parsed[key] || null;
      } catch (error) {
        return null;
      }
    }
  }
};

// Load the notification category detector
const categoryDetectorPath = path.join(__dirname, 'trading-ui', 'scripts', 'notification-category-detector.js');
const categoryDetectorCode = fs.readFileSync(categoryDetectorPath, 'utf8');

// Execute the category detector code
eval(categoryDetectorCode);

// Function to get notifications from localStorage
function getGlobalNotifications() {
  try {
    const existingHistory = JSON.parse(window.localStorage.getItem('tiktrack_global_notifications_history') || '[]');
    return existingHistory.slice(-1000); // Get last 1000 notifications
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Function to categorize notifications
function categorizeNotifications(notifications) {
  const categories = {};
  let totalProcessed = 0;
  let totalWithCategory = 0;
  
  console.log(`🔍 Processing ${notifications.length} notifications...`);
  
  notifications.forEach((notification, index) => {
    totalProcessed++;
    
    // Try to detect category using the existing mechanism
    let category = 'general';
    
    if (notification.category && notification.category !== 'general') {
      category = notification.category;
      totalWithCategory++;
    } else {
      // Use the detection function
      try {
        category = window.detectNotificationCategory(
          notification.message || '',
          notification.type || 'info',
          notification.title || '',
          {
            fileName: notification.page || '',
            functionName: '',
            stackTrace: ''
          }
        );
      } catch (error) {
        console.warn(`Error detecting category for notification ${index}:`, error);
        category = 'general';
      }
    }
    
    // Count categories
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category]++;
    
    // Log every 100th notification
    if (index % 100 === 0) {
      console.log(`Processed ${index + 1}/${notifications.length} notifications...`);
    }
  });
  
  return {
    categories,
    totalProcessed,
    totalWithCategory,
    totalWithoutCategory: totalProcessed - totalWithCategory
  };
}

// Main execution
console.log('🚀 Starting notification scan...');
console.log('📅 Time:', new Date().toLocaleString('he-IL'));

const notifications = getGlobalNotifications();
console.log(`📊 Found ${notifications.length} notifications in history`);

if (notifications.length === 0) {
  console.log('❌ No notifications found. Make sure the page has been used and notifications were generated.');
  process.exit(1);
}

const results = categorizeNotifications(notifications);

console.log('\n📈 CATEGORIZATION RESULTS:');
console.log('========================');
console.log(`Total notifications processed: ${results.totalProcessed}`);
console.log(`Notifications with explicit category: ${results.totalWithCategory}`);
console.log(`Notifications without category: ${results.totalWithoutCategory}`);
console.log(`Detection rate: ${((results.totalWithCategory / results.totalProcessed) * 100).toFixed(1)}%`);

console.log('\n📊 CATEGORY DISTRIBUTION:');
console.log('========================');

// Sort categories by count
const sortedCategories = Object.entries(results.categories)
  .sort(([,a], [,b]) => b - a);

sortedCategories.forEach(([category, count]) => {
  const percentage = ((count / results.totalProcessed) * 100).toFixed(1);
  const icon = window.getCategoryIcon ? window.getCategoryIcon(category) : '📋';
  console.log(`${icon} ${category}: ${count} (${percentage}%)`);
});

console.log('\n✅ Scan completed successfully!');

