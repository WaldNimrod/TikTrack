// ===== DIRECT INITIALIZATION =====
// Initialize dashboard directly when DOM is ready

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 DOM Content Loaded - Initializing External Data Dashboard directly...');
  
  // Wait a bit for all scripts to load
  setTimeout(() => {
    try {
      // Create dashboard instance if it doesn't exist
      if (!window.externalDataDashboard) {
        window.externalDataDashboard = new ExternalDataDashboard();
      }
      
      // Initialize the dashboard
      if (window.externalDataDashboard && !window.externalDataDashboard.isInitialized) {
        window.externalDataDashboard.init();
      }
      
      console.log('✅ Direct dashboard initialization completed');
    } catch (error) {
      console.error('❌ Error in direct dashboard initialization:', error);
    }
  }, 500);
});

// ===== GLOBAL INITIALIZATION FUNCTION =====
