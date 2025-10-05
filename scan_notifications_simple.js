/**
 * Simple script to scan notifications from the browser console
 * סקריפט פשוט לסריקת הודעות מהקונסול של הדפדפן
 */

// This script should be run in the browser console on the notifications-center page
// הסקריפט הזה צריך לרוץ בקונסול של הדפדפן בעמוד מרכז התראות

function scanNotifications() {
  console.log('🚀 Starting notification scan...');
  console.log('📅 Time:', new Date().toLocaleString('he-IL'));
  
  // Get notifications from global collector
  if (typeof window.getGlobalNotifications !== 'function') {
    console.error('❌ getGlobalNotifications function not available');
    return;
  }
  
  const notifications = window.getGlobalNotifications();
  console.log(`📊 Found ${notifications.length} notifications in history`);
  
  if (notifications.length === 0) {
    console.log('❌ No notifications found. Make sure notifications were generated.');
    return;
  }
  
  // Get last 1000 notifications
  const last1000 = notifications.slice(-1000);
  console.log(`🔍 Processing last ${last1000.length} notifications...`);
  
  const categories = {};
  let totalProcessed = 0;
  let totalWithCategory = 0;
  
  last1000.forEach((notification, index) => {
    totalProcessed++;
    
    let category = 'general';
    
    // Check if notification already has a category
    if (notification.category && notification.category !== 'general') {
      category = notification.category;
      totalWithCategory++;
    } else {
      // Try to detect category using the existing mechanism
      if (typeof window.detectNotificationCategory === 'function') {
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
      } else {
        // Fallback: try to detect from content
        const content = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
        
        if (content.includes('system') || content.includes('server')) {
          category = 'system';
        } else if (content.includes('development') || content.includes('debug')) {
          category = 'development';
        } else if (content.includes('business') || content.includes('trade')) {
          category = 'business';
        } else if (content.includes('performance') || content.includes('slow')) {
          category = 'performance';
        } else if (content.includes('ui') || content.includes('interface')) {
          category = 'ui';
        } else if (content.includes('security') || content.includes('login')) {
          category = 'security';
        } else if (content.includes('network') || content.includes('connection')) {
          category = 'network';
        } else if (content.includes('database') || content.includes('sql')) {
          category = 'database';
        } else if (content.includes('api') || content.includes('service')) {
          category = 'api';
        } else if (content.includes('cache') || content.includes('memory')) {
          category = 'cache';
        } else {
          category = 'general';
        }
      }
    }
    
    // Count categories
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category]++;
    
    // Log every 100th notification
    if (index % 100 === 0) {
      console.log(`Processed ${index + 1}/${last1000.length} notifications...`);
    }
  });
  
  console.log('\n📈 CATEGORIZATION RESULTS:');
  console.log('========================');
  console.log(`Total notifications processed: ${totalProcessed}`);
  console.log(`Notifications with explicit category: ${totalWithCategory}`);
  console.log(`Notifications without category: ${totalProcessed - totalWithCategory}`);
  console.log(`Detection rate: ${((totalWithCategory / totalProcessed) * 100).toFixed(1)}%`);
  
  console.log('\n📊 CATEGORY DISTRIBUTION:');
  console.log('========================');
  
  // Sort categories by count
  const sortedCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a);
  
  sortedCategories.forEach(([category, count]) => {
    const percentage = ((count / totalProcessed) * 100).toFixed(1);
    let icon = '📋';
    
    // Try to get icon from category detector
    if (typeof window.getCategoryIcon === 'function') {
      try {
        icon = window.getCategoryIcon(category);
      } catch (error) {
        // Use fallback icons
        const fallbackIcons = {
          'system': '⚙️',
          'development': '🛠️',
          'business': '💼',
          'performance': '⚡',
          'ui': '🎨',
          'security': '🔒',
          'network': '🌐',
          'database': '🗄️',
          'api': '🔌',
          'cache': '💾',
          'general': '📢'
        };
        icon = fallbackIcons[category] || '📋';
      }
    }
    
    console.log(`${icon} ${category}: ${count} (${percentage}%)`);
  });
  
  console.log('\n✅ Scan completed successfully!');
  
  return {
    categories,
    totalProcessed,
    totalWithCategory,
    totalWithoutCategory: totalProcessed - totalWithCategory
  };
}

// Export for use
if (typeof window !== 'undefined') {
  window.scanNotifications = scanNotifications;
  console.log('📋 scanNotifications function loaded. Run scanNotifications() to start the scan.');
} else {
  console.log('This script should be run in a browser environment.');
}

