/**
 * Header Links Updater - Dynamic header links based on authentication status
 * --------------------------------------------------------
 * מעדכן את קישורי ה-Header בהתאם לסטטוס ההתחברות
 * - כפתור משתמש: אם לא מחובר → עמוד כניסה, אם מחובר → עמוד ניהול פרופיל
 * - קישורים מדויקים בין העמודים
 * 
 * מיקום: components/core/ (גנרי לכל המערכת)
 */

(function initHeaderLinks() {
  'use strict';
  
  /**
   * Check if user is authenticated
   */
  function isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
  }
  
  /**
   * Update user profile link based on authentication status
   */
  function updateUserProfileLink() {
    const userProfileLink = document.getElementById('filterUserProfileLink');
    if (!userProfileLink) return;
    
    if (isAuthenticated()) {
      // User is logged in - link to profile page
      userProfileLink.href = '/user_profile';
      userProfileLink.setAttribute('title', 'פרופיל משתמש');
    } else {
      // User is not logged in - link to login page
      userProfileLink.href = '/login';
      userProfileLink.setAttribute('title', 'התחברות');
    }
  }
  
  /**
   * Update all header links
   */
  function updateHeaderLinks() {
    // Update user profile link
    updateUserProfileLink();
    
    // Update home link (already correct, but ensure it's set)
    const homeLinks = document.querySelectorAll('a[data-page="home"]');
    homeLinks.forEach(link => {
      if (!link.href || link.href === '#' || link.href.endsWith('#')) {
        link.href = '/';
      }
    });
    
    // Update logo link
    const logoLink = document.querySelector('.logo-section .logo');
    if (logoLink && (!logoLink.href || logoLink.href === '#' || logoLink.href.endsWith('#'))) {
      logoLink.href = '/';
    }
    
    // Update trading accounts link in dropdown
    const tradingAccountsLink = document.querySelector('a[href="/trading_accounts"]');
    if (tradingAccountsLink) {
      tradingAccountsLink.href = '/trading_accounts';
    }
    
    // Ensure all navigation links have correct paths
    const navLinks = {
      '/trade_plans': '/trade_plans',
      '/trades': '/trades',
      '/research': '/research',
      '/user_profile': '/user_profile',
      '/trading_accounts': '/trading_accounts',
      '/login': '/login',
      '/register': '/register',
      '/reset-password': '/reset-password'
    };
    
    Object.keys(navLinks).forEach(path => {
      const links = document.querySelectorAll(`a[href="${path}"], a[href="${path}/"]`);
      links.forEach(link => {
        link.href = navLinks[path];
      });
    });
  }
  
  /**
   * Add login/register/reset password links to header if needed
   */
  function addAuthLinks() {
    // Check if auth links already exist
    const existingAuthLinks = document.querySelector('.header-auth-links');
    if (existingAuthLinks) return;
    
    // Find a good place to add auth links (e.g., before user profile section)
    const userSection = document.getElementById('filterUserSection');
    if (!userSection) return;
    
    // Only add auth links if user is not authenticated
    if (!isAuthenticated()) {
      const authLinksContainer = document.createElement('div');
      authLinksContainer.className = 'header-auth-links';
      authLinksContainer.style.display = 'flex';
      authLinksContainer.style.gap = 'var(--spacing-md, 8px)';
      authLinksContainer.style.alignItems = 'center';
      
      const registerLink = document.createElement('a');
      registerLink.href = '/register';
      registerLink.className = 'header-auth-link';
      registerLink.textContent = 'הרשמה';
      registerLink.setAttribute('data-page', 'register');
      
      const separator = document.createElement('span');
      separator.textContent = '|';
      separator.style.color = 'var(--apple-text-secondary, #86868b)';
      separator.style.margin = '0 var(--spacing-xs, 4px)';
      
      const resetLink = document.createElement('a');
      resetLink.href = '/reset-password';
      resetLink.className = 'header-auth-link';
      resetLink.textContent = 'שחזור סיסמה';
      resetLink.setAttribute('data-page', 'reset-password');
      
      authLinksContainer.appendChild(registerLink);
      authLinksContainer.appendChild(separator);
      authLinksContainer.appendChild(resetLink);
      
      // Insert before user section
      userSection.parentNode.insertBefore(authLinksContainer, userSection);
    }
  }
  
  /**
   * Remove auth links if user is authenticated
   */
  function removeAuthLinks() {
    const authLinks = document.querySelector('.header-auth-links');
    if (authLinks && isAuthenticated()) {
      authLinks.remove();
    }
  }
  
  /**
   * Initialize header links
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        updateHeaderLinks();
        addAuthLinks();
        
        // Listen for auth state changes
        window.addEventListener('storage', function(e) {
          if (e.key === 'access_token') {
            updateHeaderLinks();
            if (isAuthenticated()) {
              removeAuthLinks();
            } else {
              addAuthLinks();
            }
          }
        });
      });
    } else {
      updateHeaderLinks();
      addAuthLinks();
      
      // Listen for auth state changes
      window.addEventListener('storage', function(e) {
        if (e.key === 'access_token') {
          updateHeaderLinks();
          if (isAuthenticated()) {
            removeAuthLinks();
          } else {
            addAuthLinks();
          }
        }
      });
    }
  }
  
  // Auto-initialize
  init();
  
  // Export for manual updates
  window.HeaderLinksUpdater = {
    update: updateHeaderLinks,
    isAuthenticated: isAuthenticated
  };
})();
