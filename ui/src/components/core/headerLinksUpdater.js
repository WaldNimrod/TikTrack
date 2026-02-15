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
   * Gate B Fix: Check multiple token storage locations
   */
  function isAuthenticated() {
    // ADR-017: Check access_token + authToken (SSOT: TT2_AUTH_GUARDS_AND_ROUTE_SSOT)
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!(accessToken || authToken);
  }

  /**
   * Check if user has admin role (ADMIN or SUPERADMIN)
   * Type D (Admin-only) per ADR-013, TT2_AUTH_GUARDS_AND_ROUTE_SSOT
   */
  function isAdmin() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
                  sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      return role === 'ADMIN' || role === 'SUPERADMIN';
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Handle logout action
   * Gate B Fix: Complete logout functionality with event dispatch
   */
  async function handleLogout() {
    try {
      // Try to use authService if available (React context)
      if (window.authService && typeof window.authService.logout === 'function') {
        await window.authService.logout();
      } else {
        // Fallback: Clear tokens manually
        localStorage.removeItem('access_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth_token'); // legacy cleanup
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('auth_token'); // legacy cleanup
      }
      
      // Dispatch logout event for real-time updates
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      window.maskedLog?.('[Header Links Updater] Logout error:', { message: error?.message });
      // Even on error, clear tokens and redirect to home
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('auth_token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      window.location.href = '/';
    }
  }
  
  /**
   * Update user profile link based on authentication status
   * Gate B Fix: Add colors (alert/success), real-time state updates, and logout functionality
   */
  function updateUserProfileLink() {
    const userProfileLink = document.getElementById('filterUserProfileLink');
    if (!userProfileLink) return;
    
    const isAuth = isAuthenticated();
    
    // Remove existing click handlers to prevent duplicates
    const newLink = userProfileLink.cloneNode(true);
    userProfileLink.parentNode.replaceChild(newLink, userProfileLink);
    const link = document.getElementById('filterUserProfileLink');
    
    if (isAuth) {
      // User is logged in - show profile link OR logout button
      // Gate B Fix: Make it a clickable button that can logout
      link.href = '/profile';
      link.setAttribute('title', 'פרופיל משתמש / התנתקות');
      // Gate B Fix: Add success color class (green/positive state)
      link.classList.remove('user-profile-link--alert');
      link.classList.add('user-profile-link--success');
      // Update icon color via CSS variable or class
      const userIcon = link.querySelector('.user-icon');
      if (userIcon) {
        userIcon.classList.remove('user-icon--alert');
        userIcon.classList.add('user-icon--success');
      }
      
      // Gate B Fix: Add logout functionality on right-click or long-press
      // For now, we'll make it navigate to profile, but add a logout option
      // Users can logout from profile page, or we can add a dropdown menu later
      link.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
          handleLogout();
        }
      });
    } else {
      // User is not logged in - link to login page
      link.href = '/login';
      link.setAttribute('title', 'התחברות');
      // Gate B Fix: Add alert color class (warning/alert state)
      link.classList.remove('user-profile-link--success');
      link.classList.add('user-profile-link--alert');
      // Update icon color via CSS variable or class
      const userIcon = link.querySelector('.user-icon');
      if (userIcon) {
        userIcon.classList.remove('user-icon--success');
        userIcon.classList.add('user-icon--alert');
      }
    }
  }
  
  /**
   * Show/hide Management menu per admin role (Type D)
   * Guest or non-admin: menu hidden. Admin only: menu visible.
   */
  function updateManagementMenuVisibility() {
    const el = document.getElementById('nav-management') ||
               document.querySelector('.tiktrack-nav-item.dropdown[data-admin-only="true"]');
    if (!el) return;
    el.style.display = isAdmin() ? '' : 'none';
  }

  /**
   * Update all header links
   */
  function updateHeaderLinks() {
    // Update user profile link
    updateUserProfileLink();
    // Management menu: admin only (Type D per ADR-013)
    updateManagementMenuVisibility();
    
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
    
    // Gate B Fix: Update financial pages links to use .html extension (per routes.json)
    const tradingAccountsLinks = document.querySelectorAll('a[href="/trading_accounts"], a[href="/trading_accounts.html"], a[data-page="trading_accounts"]');
    tradingAccountsLinks.forEach(link => {
      link.href = '/trading_accounts.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'trading_accounts');
      }
    });
    
    const brokersFeesLinks = document.querySelectorAll('a[href="/brokers_fees"], a[href="/brokers_fees.html"], a[data-page="brokers_fees"]');
    brokersFeesLinks.forEach(link => {
      link.href = '/brokers_fees.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'brokers_fees');
      }
    });
    
    const cashFlowsLinks = document.querySelectorAll('a[href="/cash_flows"], a[href="/cash_flows.html"], a[data-page="cash_flows"]');
    cashFlowsLinks.forEach(link => {
      link.href = '/cash_flows.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'cash_flows');
      }
    });
    
    // Gate B Fix: Update data_dashboard link to use .html extension (per routes.json)
    const dataDashboardLinks = document.querySelectorAll('a[href="/data_dashboard"], a[href="/data_dashboard.html"], a[data-page="data_dashboard"]');
    dataDashboardLinks.forEach(link => {
      link.href = '/data_dashboard.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'data_dashboard');
      }
    });

    const userTickersLinks = document.querySelectorAll('a[href="/user_tickers"], a[href="/user_tickers.html"], a[data-page="user_tickers"]');
    userTickersLinks.forEach(link => {
      link.href = '/user_tickers.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'user_tickers');
      }
    });
    
    // Gate B Fix: Update trade_plans link to use .html extension (per routes.json)
    const tradePlansLinks = document.querySelectorAll('a[href="/trade_plans"], a[href="/trade_plans.html"], a[data-page="trade_plans"]');
    tradePlansLinks.forEach(link => {
      link.href = '/trade_plans.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'trade_plans');
      }
    });

    // Menu SSOT: ai_analysis, trades (per TT2_PAGES_SSOT_MASTER_LIST)
    const aiAnalysisLinks = document.querySelectorAll('a[href="/ai_analysis"], a[href="/ai_analysis.html"], a[data-page="ai_analysis"]');
    aiAnalysisLinks.forEach(link => {
      link.href = '/ai_analysis.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'ai_analysis');
      }
    });

    const tradesLinks = document.querySelectorAll('a[href="/trades"], a[href="/trades.html"], a[data-page="trades"]');
    tradesLinks.forEach(link => {
      link.href = '/trades.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'trades');
      }
    });
    
    // Gate B Fix: Update trades_history link to use .html extension (per routes.json)
    const tradesHistoryLinks = document.querySelectorAll('a[href="/trades_history"], a[href="/trades_history.html"], a[data-page="trades_history"]');
    tradesHistoryLinks.forEach(link => {
      link.href = '/trades_history.html';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'trades_history');
      }
    });
    
    // Gate B Fix: Update user_profile link to use React route /profile
    const userProfileLinks = document.querySelectorAll('a[href="/user_profile"], a[href="/profile"], a[data-page="user_profile"]');
    userProfileLinks.forEach(link => {
      link.href = '/profile';
      if (!link.hasAttribute('data-page')) {
        link.setAttribute('data-page', 'user_profile');
      }
    });
    
    // Gate B Fix: Ensure all dropdown parent links use # (they don't navigate, only open dropdown)
    const dropdownToggles = document.querySelectorAll('.tiktrack-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
      const href = toggle.getAttribute('href');
      if (href && href !== '#' && !href.startsWith('#')) {
        // Only set to # if it's not a valid page route
        const validRoutes = ['/trade_plans.html', '/trades', '/research', '/data_dashboard.html'];
        if (!validRoutes.includes(href)) {
          toggle.href = '#';
        }
      }
    });
    
    // Ensure all navigation links have correct paths (comprehensive mapping)
    // Per TT2_PAGES_SSOT_MASTER_LIST, TEAM_10_TO_TEAM_30_MENU_SSOT_ALIGNMENT
    const navLinks = {
      // React routes (no .html)
      '/profile': '/profile',
      '/user_profile': '/profile', // Redirect old path
      '/login': '/login',
      '/register': '/register',
      '/reset-password': '/reset-password',
      // HTML routes (with .html)
      '/trade_plans': '/trade_plans.html',
      '/ai_analysis': '/ai_analysis.html',
      '/trades': '/trades.html',
      '/trades_history': '/trades_history.html',
      '/trading_accounts': '/trading_accounts.html',
      '/brokers_fees': '/brokers_fees.html',
      '/cash_flows': '/cash_flows.html',
      '/data_dashboard': '/data_dashboard.html'
    };
    
    Object.keys(navLinks).forEach(path => {
      const links = document.querySelectorAll(`a[href="${path}"], a[href="${path}/"]`);
      links.forEach(link => {
        // Only update if it's not already correct
        if (link.href !== navLinks[path] && !link.href.endsWith(navLinks[path])) {
          link.href = navLinks[path];
        }
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
   * Gate B Fix: Real-time state updates via multiple event listeners
   */
  function init() {
    // Initial update
    function performInitialUpdate() {
      updateHeaderLinks();
      addAuthLinks();
    }
    
    // Update on auth state changes
    function handleAuthStateChange() {
      updateHeaderLinks();
      if (isAuthenticated()) {
        removeAuthLinks();
      } else {
        addAuthLinks();
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        performInitialUpdate();
        
        // Gate B Fix: Listen for storage changes (cross-tab auth updates)
        window.addEventListener('storage', function(e) {
          if (e.key === 'access_token' || e.key === 'auth_token') {
            handleAuthStateChange();
          }
        });
        
        // Gate B Fix: Listen for custom auth events (same-tab auth updates)
        window.addEventListener('auth:login', handleAuthStateChange);
        window.addEventListener('auth:logout', handleAuthStateChange);
        window.addEventListener('auth:token-expired', handleAuthStateChange);
        
        // Gate B Fix: Poll for auth state changes (fallback for immediate updates)
        // Check every 500ms for first 5 seconds, then every 2 seconds
        let pollCount = 0;
        const pollInterval = setInterval(function() {
          pollCount++;
          const currentAuthState = isAuthenticated();
          const lastAuthState = window._lastAuthState;
          
          if (currentAuthState !== lastAuthState) {
            handleAuthStateChange();
            window._lastAuthState = currentAuthState;
          }
          
          // Stop polling after 30 seconds (60 checks at 500ms)
          if (pollCount > 60) {
            clearInterval(pollInterval);
          }
        }, 500);
        
        // Store initial auth state
        window._lastAuthState = isAuthenticated();
      });
    } else {
      performInitialUpdate();
      
      // Gate B Fix: Listen for storage changes (cross-tab auth updates)
      window.addEventListener('storage', function(e) {
        if (e.key === 'access_token' || e.key === 'auth_token') {
          handleAuthStateChange();
        }
      });
      
      // Gate B Fix: Listen for custom auth events (same-tab auth updates)
      window.addEventListener('auth:login', handleAuthStateChange);
      window.addEventListener('auth:logout', handleAuthStateChange);
      window.addEventListener('auth:token-expired', handleAuthStateChange);
      
      // Gate B Fix: Poll for auth state changes (fallback for immediate updates)
      let pollCount = 0;
      const pollInterval = setInterval(function() {
        pollCount++;
        const currentAuthState = isAuthenticated();
        const lastAuthState = window._lastAuthState;
        
        if (currentAuthState !== lastAuthState) {
          handleAuthStateChange();
          window._lastAuthState = currentAuthState;
        }
        
        // Stop polling after 30 seconds (60 checks at 500ms)
        if (pollCount > 60) {
          clearInterval(pollInterval);
        }
      }, 500);
      
      // Store initial auth state
      window._lastAuthState = isAuthenticated();
    }
  }
  
  // Auto-initialize
  init();
  
  // Export for manual updates
  window.HeaderLinksUpdater = {
    update: updateHeaderLinks,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin
  };
})();
