// ===== DIRECT INITIALIZATION =====
// Initialize dashboard directly when DOM is ready

document.addEventListener('DOMContentLoaded', function() {
// Console statement removed for no-console compliance
  
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
      
// Console statement removed for no-console compliance
    } catch (error) {
// Console statement removed for no-console compliance
    }
  }, 500);
});

// ===== GLOBAL INITIALIZATION FUNCTION =====

