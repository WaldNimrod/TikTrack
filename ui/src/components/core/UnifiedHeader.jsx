/**
 * UnifiedHeader - רכיב Header מאוחד (LOD 400)
 * --------------------------------------------
 * רכיב React ל-Unified Header מלא עם Navigation ו-Filters
 * 
 * @description מימוש Unified Header לפי הבלופרינט V3
 * @standard JS Standards Protocol ✅ | CSS Standards Protocol ✅
 * @blueprintSource _COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePhoenixFilter } from '../../cubes/shared/contexts/PhoenixFilterContext.jsx';

/**
 * UnifiedHeader Component
 * 
 * @description רכיב Header מאוחד עם Navigation ו-Filters (LOD 400, 120px)
 */
const UnifiedHeader = () => {
  const navigate = useNavigate();
  const { filters, setFilter, clearFilters } = usePhoenixFilter();
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  /**
   * Handle Filter Toggle
   */
  const handleFilterToggle = () => {
    setIsFiltersExpanded(!isFiltersExpanded);
  };

  /**
   * Handle Search Change
   */
  const handleSearchChange = (e) => {
    setFilter('search', e.target.value);
  };

  /**
   * Handle Search Clear
   */
  const handleSearchClear = () => {
    setFilter('search', '');
  };

  /**
   * Handle Filter Reset (Restore defaults from user preferences - when available)
   */
  const handleFilterReset = () => {
    // TODO: Restore defaults from user preferences when available
    // For now, just clear all filters
    clearFilters();
  };

  /**
   * Handle Filter Clear (Set all filters to "הצג הכול")
   */
  const handleFilterClear = () => {
    // Set all filters to "הצג הכול" (null)
    setFilter('status', null);
    setFilter('investmentType', null);
    setFilter('tradingAccount', null);
    setFilter('dateRange', { from: null, to: null });
    setFilter('search', '');
  };

  /**
   * Handle Filter Selection (for hover-based dropdowns)
   */
  const handleFilterSelect = (filterType, value) => {
    // Map filter types to correct context keys
    const filterKeyMap = {
      'status': 'status',
      'type': 'investmentType',
      'account': 'tradingAccount',
      'dateRange': 'dateRange'
    };
    
    const contextKey = filterKeyMap[filterType] || filterType;
    const filterValue = value === 'הכול' ? null : value;
    
    // Special handling for dateRange (it's an object)
    if (contextKey === 'dateRange') {
      setFilter(contextKey, { from: null, to: null });
    } else {
      setFilter(contextKey, filterValue);
    }
  };

  /**
   * Initialize dropdown menus (hover-based) - EXACT from blueprint
   */
  useEffect(() => {
    const initDropdownMenus = () => {
      const dropdownItems = document.querySelectorAll('#unified-header .tiktrack-nav-item.dropdown');
      
      dropdownItems.forEach(item => {
        const dropdownToggle = item.querySelector('.tiktrack-dropdown-toggle');
        const dropdownMenu = item.querySelector('.tiktrack-dropdown-menu');
        const dropdownArrow = item.querySelector('.tiktrack-dropdown-arrow');
        
        if (!dropdownToggle || !dropdownMenu) return;
        
        // Open dropdown on mouseenter
        item.addEventListener('mouseenter', function() {
          dropdownMenu.style.opacity = '1';
          dropdownMenu.style.visibility = 'visible';
          dropdownMenu.style.transform = 'translateY(0)';
          dropdownMenu.style.display = 'flex';
          
          // Rotate arrow 180 degrees (not 90)
          if (dropdownArrow) {
            dropdownArrow.style.transform = 'rotate(180deg)';
          }
        });
        
        // Close dropdown on mouseleave
        item.addEventListener('mouseleave', function() {
          dropdownMenu.style.opacity = '0';
          dropdownMenu.style.visibility = 'hidden';
          dropdownMenu.style.transform = 'translateY(-10px)';
          
          // Reset arrow rotation
          if (dropdownArrow) {
            dropdownArrow.style.transform = 'rotate(0deg)';
          }
          
          // Hide menu after transition
          setTimeout(() => {
            if (dropdownMenu.style.opacity === '0') {
              dropdownMenu.style.display = 'none';
            }
          }, 300); // Match CSS transition duration
        });
      });
    };

    // Initialize dropdowns
    initDropdownMenus();
  }, []);

  /**
   * Initialize filter dropdowns (hover-based) - EXACT from blueprint
   */
  useEffect(() => {
    const initFilterDropdowns = () => {
      const filterDropdowns = document.querySelectorAll('#unified-header .filter-dropdown');
      filterDropdowns.forEach(dropdown => {
        const filterMenu = dropdown.querySelector('.filter-menu');
        if (filterMenu) {
          dropdown.addEventListener('mouseenter', function() {
            filterMenu.style.display = 'block';
            filterMenu.style.opacity = '1';
            filterMenu.style.visibility = 'visible';
            filterMenu.style.transform = 'translateY(0)';
          });
          
          dropdown.addEventListener('mouseleave', function() {
            filterMenu.style.display = 'none';
            filterMenu.style.opacity = '0';
            filterMenu.style.visibility = 'hidden';
            filterMenu.style.transform = 'translateY(-10px)';
          });
        }
      });
    };

    // Initialize filter dropdowns
    if (isFiltersExpanded) {
      initFilterDropdowns();
    }
  }, [isFiltersExpanded]);

  return (
    <header id="unified-header">
      <div className="header-content">
        <div className="header-top">
          <div className="header-container">
            
            {/* Navigation: Standard navigation menu WITH DROPDOWNS (hover-based) */}
            <div className="header-nav">
              <nav className="main-nav">
                <ul className="tiktrack-nav-list">
                  {/* Home Link */}
                  <li className="tiktrack-nav-item">
                    <Link to="/" className="tiktrack-nav-link" data-page="home">
                      <img src="/images/icons/entities/home.svg" alt="בית" width="36" height="36" className="nav-icon home-icon-only" />
                    </Link>
                  </li>
                  
                  {/* Dropdown Menus - Hover-based (CSS handles display) */}
                  <li className="tiktrack-nav-item dropdown">
                    <Link to="/trade_plans" className="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="trade_plans">
                      <span className="nav-text">תכנון</span>
                      <span className="tiktrack-dropdown-arrow">▼</span>
                    </Link>
                    <ul className="tiktrack-dropdown-menu" id="menu-0">
                      <li><Link className="tiktrack-dropdown-item" to="/ai_analysis">אנליזת AI</Link></li>
                    </ul>
                  </li>
                  
                  <li className="tiktrack-nav-item dropdown">
                    <Link to="/trades" className="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="trades">
                      <span className="nav-text">מעקב</span>
                      <span className="tiktrack-dropdown-arrow">▼</span>
                    </Link>
                    <ul className="tiktrack-dropdown-menu" id="menu-1">
                      <li><Link className="tiktrack-dropdown-item" to="/watch_lists">רשימות צפייה</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/ticker_dashboard">📊 דשבורד טיקר</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/trading_journal">📓 יומן מסחר</Link></li>
                    </ul>
                  </li>
                  
                  <li className="tiktrack-nav-item dropdown">
                    <Link to="/research" className="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="research">
                      <span className="nav-text">מחקר</span>
                      <span className="tiktrack-dropdown-arrow">▼</span>
                    </Link>
                    <ul className="tiktrack-dropdown-menu" id="menu-2">
                      <li><Link className="tiktrack-dropdown-item" to="/strategy-analysis">📊 ניתוח אסטרטגיות</Link></li>
                      <li className="separator"></li>
                      <li><Link className="tiktrack-dropdown-item" to="/trade_history">📈 היסטוריית טרייד</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/portfolio-state">💼 מצב תיק היסטורי</Link></li>
                    </ul>
                  </li>
                  
                  <li className="tiktrack-nav-item dropdown">
                    <Link to="#" className="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="data">
                      <span className="nav-text">נתונים</span>
                      <span className="tiktrack-dropdown-arrow">▼</span>
                    </Link>
                    <ul className="tiktrack-dropdown-menu" id="menu-3">
                      <li><Link className="tiktrack-dropdown-item" to="/alerts">התראות</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/notes">הערות</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/trading_accounts">חשבונות מסחר</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/user_ticker">הטיקרים שלי</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/tickers">טיקרים (מנהל)</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/executions">ביצועים</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/cash_flows">תזרימי מזומנים</Link></li>
                    </ul>
                  </li>
                  
                  <li className="tiktrack-nav-item dropdown">
                    <Link to="#" className="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="settings">
                      <span className="nav-text">הגדרות</span>
                      <span className="tiktrack-dropdown-arrow">▼</span>
                    </Link>
                    <ul className="tiktrack-dropdown-menu" id="menu-4">
                      <li><Link className="tiktrack-dropdown-item" to="/user_profile">👤 פרופיל משתמש</Link></li>
                      <li className="separator"></li>
                      <li><Link className="tiktrack-dropdown-item" to="/data_import">ייבוא נתונים</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/tag_management">ניהול תגיות</Link></li>
                      <li><Link className="tiktrack-dropdown-item" to="/preferences">העדפות</Link></li>
                    </ul>
                  </li>
                  
                  <li className="tiktrack-nav-item dropdown">
                    <Link to="/dev_tools" className="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="development-tools">
                      <span className="nav-text">פיתוח</span>
                      <span className="tiktrack-dropdown-arrow">▼</span>
                    </Link>
                    <ul className="tiktrack-dropdown-menu" id="menu-5">
                      <li><Link className="tiktrack-dropdown-item" to="/system_management">🔧 ניהול מערכת</Link></li>
                    </ul>
                  </li>
                  
                  {/* Utils */}
                  <li className="tiktrack-nav-item">
                    <Link to="#" className="tiktrack-nav-link" title="ניקוי">
                      <span className="nav-text utils-icon-clean">🧹</span>
                    </Link>
                  </li>
                  <li className="tiktrack-nav-item">
                    <Link to="#" className="tiktrack-nav-link" title="רענון מהיר">
                      <span className="nav-text utils-icon-fast">⚡</span>
                    </Link>
                  </li>
                  <li className="tiktrack-nav-item">
                    <Link to="#" className="tiktrack-nav-link" title="חיפוש">
                      <span className="nav-text utils-icon-search">🔍</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            
            {/* Logo Section */}
            <div className="logo-section">
              <Link to="/" className="logo">
                <img src="/images/logo.svg" alt="TikTrack Logo" className="logo-image" />
                <span className="logo-text">פשוט לנהל תיק</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Header Filters Row */}
        <div className={`header-filters ${!isFiltersExpanded ? 'collapsed' : ''}`} {...(!isFiltersExpanded && { style: { display: 'none' } })}>
          <div className="filters-container">
            {/* Filter Groups - Hover-based (CSS handles display) */}
            <div className="filter-group status-filter">
              <div className="filter-dropdown">
                <button className="filter-toggle status-filter-toggle js-filter-toggle" id="statusFilterToggle">
                  <span className="selected-value selected-status-text" id="selectedStatus">
                    {typeof filters.status === 'string' ? filters.status : 'כל סטטוס'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="filter-menu" id="statusFilterMenu">
                  <div className="status-filter-item" data-value="הכול" onClick={() => handleFilterSelect('status', 'הכול')}>
                    <span className="option-text">הכול</span>
                  </div>
                  <div className="status-filter-item" data-value="פתוח" onClick={() => handleFilterSelect('status', 'פתוח')}>
                    <span className="option-text">פתוח</span>
                  </div>
                  <div className="status-filter-item" data-value="סגור" onClick={() => handleFilterSelect('status', 'סגור')}>
                    <span className="option-text">סגור</span>
                  </div>
                  <div className="status-filter-item" data-value="מבוטל" onClick={() => handleFilterSelect('status', 'מבוטל')}>
                    <span className="option-text">מבוטל</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group type-filter">
              <div className="filter-dropdown">
                <button className="filter-toggle type-filter-toggle js-filter-toggle" id="typeFilterToggle">
                  <span className="selected-value selected-type-text" id="selectedType">
                    {typeof filters.investmentType === 'string' ? filters.investmentType : 'כל סוג השקעה'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="filter-menu" id="typeFilterMenu">
                  <div className="type-filter-item" data-value="הכול" onClick={() => handleFilterSelect('type', 'הכול')}>
                    <span className="option-text">הכול</span>
                  </div>
                  <div className="type-filter-item" data-value="Long" onClick={() => handleFilterSelect('type', 'Long')}>
                    <span className="option-text">Long</span>
                  </div>
                  <div className="type-filter-item" data-value="Short" onClick={() => handleFilterSelect('type', 'Short')}>
                    <span className="option-text">Short</span>
                  </div>
                  <div className="type-filter-item" data-value="מניות" onClick={() => handleFilterSelect('type', 'מניות')}>
                    <span className="option-text">מניות</span>
                  </div>
                  <div className="type-filter-item" data-value="אופציות" onClick={() => handleFilterSelect('type', 'אופציות')}>
                    <span className="option-text">אופציות</span>
                  </div>
                  <div className="type-filter-item" data-value="חוזים עתידיים" onClick={() => handleFilterSelect('type', 'חוזים עתידיים')}>
                    <span className="option-text">חוזים עתידיים</span>
                  </div>
                  <div className="type-filter-item" data-value="קרנות" onClick={() => handleFilterSelect('type', 'קרנות')}>
                    <span className="option-text">קרנות</span>
                  </div>
                  <div className="type-filter-item" data-value="אגרות חוב" onClick={() => handleFilterSelect('type', 'אגרות חוב')}>
                    <span className="option-text">אגרות חוב</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group account-filter">
              <div className="filter-dropdown">
                <button className="filter-toggle account-filter-toggle js-filter-toggle" id="accountFilterToggle">
                  <span className="selected-value selected-account-text" id="selectedAccount">
                    {typeof filters.tradingAccount === 'string' ? filters.tradingAccount : 'כל חשבון מסחר'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="filter-menu" id="accountFilterMenu">
                  <div className="account-filter-item" data-value="הכול" onClick={() => handleFilterSelect('account', 'הכול')}>
                    <span className="option-text">הכול</span>
                  </div>
                  {/* TODO: Dynamic trading accounts when available */}
                </div>
              </div>
            </div>

            <div className="filter-group date-range-filter">
              <div className="filter-dropdown">
                <button className="filter-toggle date-range-filter-toggle js-filter-toggle" id="dateRangeFilterToggle">
                  <span className="selected-value selected-date-text" id="selectedDateRange">
                    {filters.dateRange && typeof filters.dateRange === 'object' && (filters.dateRange.from || filters.dateRange.to) ? 'טווח תאריכים' : 'כל זמן'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="filter-menu" id="dateRangeFilterMenu">
                  <div className="date-range-filter-item" data-value="כל זמן" onClick={() => handleFilterSelect('dateRange', 'כל זמן')}>
                    <span className="option-text">כל זמן</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group search-filter">
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  className="search-filter-input js-search-input" 
                  id="searchFilterInput" 
                  placeholder="חיפוש..."
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                />
                {filters.search && (
                  <button className="search-clear-btn js-search-clear" title="נקה חיפוש" onClick={handleSearchClear}>×</button>
                )}
              </div>
            </div>

            <div className="filter-actions">
              <button className="reset-btn js-filter-reset" title="איפוס פילטרים" onClick={handleFilterReset}>
                <span className="btn-text">↻</span>
              </button>
              <button className="clear-btn js-filter-clear" title="נקה כל הפילטרים" onClick={handleFilterClear}>
                <span className="btn-text">×</span>
              </button>
            </div>

            <div className="filter-user-section" id="filterUserSection">
              <Link to="/user_profile" className="user-profile-link" id="filterUserProfileLink" title="פרופיל משתמש">
                <svg className="user-icon" width="19.2" height="19.2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="filter-toggle-section filter-toggle-main">
            <button 
              className="header-filter-toggle-btn js-header-filter-toggle" 
              id="headerFilterToggleBtnMain" 
              title="הצג/הסתר פילטרים"
              onClick={handleFilterToggle}
            >
              <span className="header-filter-arrow">{isFiltersExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
