/**
 * Phoenix-Widget-Tabs-Ver: v2.0.0 | Widget Tabs JavaScript
 * Sync-Time: 2026-02-02 00:00:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ EXTERNAL JS - Clean Slate Rule Compliant
 * 
 * Purpose:
 * Handles widget tabs functionality (switching between tab panes).
 * All JavaScript is external - NO inline scripts in HTML.
 * 
 * Usage:
 * Add <script src="./widget-tabs.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initWidgetTabs() {
  'use strict';
  
  function initTabs() {
    const widgetTabs = document.querySelectorAll('.widget-placeholder__tab-btn');
    
    widgetTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabList = this.closest('.widget-placeholder__tabs');
        if (!tabList) return;
        
        const widget = tabList.closest('.widget-placeholder');
        if (!widget) return;
        
        const targetPaneId = this.getAttribute('aria-controls');
        
        // Remove active class from all tabs in this widget
        widget.querySelectorAll('.widget-placeholder__tab-btn').forEach(btn => {
          btn.classList.remove('widget-placeholder__tab-btn--active');
          btn.setAttribute('aria-selected', 'false');
        });
        
        // Hide all tab content in this widget
        widget.querySelectorAll('.widget-placeholder__tab-content').forEach(content => {
          content.classList.add('widget-placeholder__tab-content--hidden');
        });
        
        // Activate clicked tab
        this.classList.add('widget-placeholder__tab-btn--active');
        this.setAttribute('aria-selected', 'true');
        
        // Show corresponding content
        const targetPane = document.getElementById(targetPaneId);
        if (targetPane) {
          targetPane.classList.remove('widget-placeholder__tab-content--hidden');
        }
      });
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    // DOM already loaded
    initTabs();
  }
})();
