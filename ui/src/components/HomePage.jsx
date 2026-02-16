/**
 * HomePage - עמוד הבית / דשבורד ראשי (D15_INDEX)
 * --------------------------------------------
 * עמוד הבית הראשי של המערכת עם וויגיטים ותוכן דמה
 * 
 * @description תבנית V3 מבוססת על הבלופרינט המלא
 * Header נטען דינמית דרך headerLoader.js
 * @blueprintSource _COMMUNICATION/team_01/team_01_staging/D15_INDEX.html
 * @standard JS Standards Protocol ✅ | CSS Standards Protocol ✅ | No-Inline Scripts ✅
 */

import React, { useState, useEffect } from 'react';
import PageFooter from './core/PageFooter.jsx';
import { debugLog } from '../utils/debug.js';
import authService from '../cubes/identity/services/auth.js';

// Dashboard-specific styles (must load after phoenix-base.css, phoenix-components.css, phoenix-header.css)
import '../styles/D15_DASHBOARD_STYLES.css';

/**
 * HomePage Component
 * 
 * @description עמוד בית ראשי עם התראות פעילות, סיכום, וויגיטים וטבלת פורטפוליו
 * Type B (Shared): עמוד יחיד עם שני Containers - Guest (אורח) + Logged-in (מחובר)
 * אין Redirect לאורח - אורח נשאר באותו route ורואה Guest Container
 */
const HomePage = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Section toggle state
  const [openSections, setOpenSections] = useState({
    'top': true,
    'main': true,
    'portfolio': true,
  });

  // Portfolio summary toggle state
  const [showPortfolioSummary, setShowPortfolioSummary] = useState(false);

  // Widget tabs state
  const [activeTabs, setActiveTabs] = useState({
    'recentTrades': 'recentTradesPane',
    'pendingActions': 'pendingAssignPlansPane',
    'tickerList': 'tickerActivePane',
  });

  /**
   * Handle Section Toggle
   */
  const handleSectionToggle = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    debugLog('HomePage', `Section ${sectionId} toggled`, { isOpen: !openSections[sectionId] });
  };

  /**
   * Handle Portfolio Summary Toggle
   */
  const handlePortfolioSummaryToggle = () => {
    setShowPortfolioSummary(prev => !prev);
    debugLog('HomePage', 'Portfolio summary toggled', { isOpen: !showPortfolioSummary });
  };

  /**
   * Handle Widget Tab Change
   */
  const handleWidgetTabChange = (widgetId, tabPaneId) => {
    setActiveTabs(prev => ({
      ...prev,
      [widgetId]: tabPaneId
    }));
    debugLog('HomePage', `Widget tab changed`, { widgetId, tabPaneId });
  };

  /**
   * Check authentication status
   * Type B (Shared): Check auth state to determine which container to show
   */
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        // Check if user has access token
        const hasToken = authService.isAuthenticated();
        
        if (hasToken) {
          // Try to verify token is valid by getting current user
          try {
            await authService.getCurrentUser();
            setIsAuthenticated(true);
            debugLog('HomePage', 'User authenticated - showing Logged-in Container');
          } catch (error) {
            // Token might be expired or invalid
            setIsAuthenticated(false);
            debugLog('HomePage', 'Token invalid - showing Guest Container');
          }
        } else {
          setIsAuthenticated(false);
          debugLog('HomePage', 'No token - showing Guest Container');
        }
      } catch (error) {
        setIsAuthenticated(false);
        debugLog('HomePage', 'Auth check failed - showing Guest Container', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    debugLog('HomePage', 'Component mounted');
  }, []);

  return (
    <>
      {/* Unified Header - Loaded dynamically via headerLoader.js */}
      {/* Header is injected at the beginning of <body> by headerLoader.js */}
      
      {/* Page Wrapper: Full-width gray background */}
      <div className="page-wrapper">
        {/* Page Container: Centered, max-width 1400px */}
        <div className="page-container">
          {/* Main Content */}
          <main>
            {/* Type B (Shared): Two Containers in same page */}
            {/* Guest Container - shown to unauthenticated users */}
            {!isAuthenticated && (
              <tt-container data-container-type="guest">
                <tt-section>
                  <div className="guest-container">
                    <div className="guest-container__header">
                      <h1 className="guest-container__title">ברוכים הבאים ל-TikTrack</h1>
                      <p className="guest-container__subtitle">פלטפורמה מתקדמת לניהול מסחר ופורטפוליו</p>
                    </div>
                    <div className="guest-container__content">
                      <div className="guest-container__features">
                        <div className="guest-container__feature">
                          <h3>ניהול פורטפוליו</h3>
                          <p>עקוב אחר כל החשבונות והפוזיציות שלך במקום אחד</p>
                        </div>
                        <div className="guest-container__feature">
                          <h3>ניתוח מתקדם</h3>
                          <p>כלים חזקים לניתוח ביצועים וקבלת החלטות מושכלות</p>
                        </div>
                        <div className="guest-container__feature">
                          <h3>תמיכה מלאה</h3>
                          <p>צוות מקצועי זמין לעזור בכל שאלה</p>
                        </div>
                      </div>
                      <div className="guest-container__actions">
                        <a href="/login" className="btn btn-primary">התחבר</a>
                        <a href="/register" className="btn btn-secondary">הירשם</a>
                      </div>
                    </div>
                  </div>
                </tt-section>
              </tt-container>
            )}

            {/* Logged-in Container - shown to authenticated users */}
            {isAuthenticated && (
              <tt-container data-container-type="logged-in">
                {/* Top Section: Active Alerts & Summary */}
                <tt-section data-section="top">
                {/* Section Header */}
                <div className="index-section__header">
                  <div className="index-section__header-title">
                    <img 
                      src="/images/icons/entities/home.svg" 
                      alt="דף הבית" 
                      className="index-section__header-icon" 
                      width="20" 
                      height="20"
                    />
                    <h1 className="index-section__header-text">דף הבית - TikTrack</h1>
                  </div>
                  <div className="index-section__header-actions">
                    {/* Alert bell - only shown when there are alerts AND section is closed */}
                    {!openSections['top'] && (
                      <button 
                        className="index-section__header-alert-btn" 
                        aria-label="פתח התראות פעילות"
                        onClick={() => handleSectionToggle('top')}
                      >
                        <span className="index-section__header-alert-icon">🔔</span>
                        <span className="index-section__header-alert-count">3</span>
                      </button>
                    )}
                    <button 
                      className="index-section__header-toggle-btn" 
                      aria-label="הצג/הסתר"
                      onClick={() => handleSectionToggle('top')}
                      aria-expanded={openSections['top']}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6l6 -6"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Section Body */}
                {openSections['top'] && (
                  <div className="index-section__body">
                    {/* Active Alerts Component */}
                    <div className="active-alerts" data-role="container">
                      <div className="active-alerts__header">
                        <div className="active-alerts__title-group">
                          <button 
                            type="button" 
                            className="active-alerts__title-trigger" 
                            aria-label="פתח עמוד ההתראות"
                          >
                            <span className="active-alerts__title-icon" aria-hidden="true">🔔</span>
                            <span className="active-alerts__title-text" data-role="title-text">התראות פעילות</span>
                          </button>
                          <span className="active-alerts__count-badge" data-role="count" aria-live="polite">3</span>
                        </div>
                        <div className="active-alerts__filters" data-role="filters" aria-label="סינון לפי סוג התראה"></div>
                      </div>

                      <div className="active-alerts__body">
                        <div className="active-alerts__list" data-role="list" role="list">
                          {/* Alert Card 1: Trade Alert */}
                          <article 
                            className="active-alerts__card active-alerts__card--trades" 
                            role="listitem" 
                            data-alert-id="1" 
                            data-entity-type="trades"
                          >
                            <div className="active-alerts__card-header">
                              <div className="active-alerts__header-linked">
                                <div 
                                  className="linked-object-card notes-linked-object active-alerts__linked-entity" 
                                  role="link" 
                                  tabIndex="0" 
                                  data-entity-type="trades" 
                                  data-entity-id="1"
                                >
                                  <div className="linked-object-card-icon">
                                    <img 
                                      src="/images/icons/entities/trades.svg" 
                                      alt="טרייד" 
                                      className="linked-object-card-icon-img" 
                                      width="60" 
                                      height="60"
                                    />
                                  </div>
                                  <div className="linked-object-card-content">
                                    <div className="linked-object-card-title">
                                      <span className="linked-object-card-type">טרייד</span>
                                      <span className="linked-object-card-name">טרייד 1</span>
                                    </div>
                                    <div className="linked-object-card-meta">
                                      <span className="status-badge" data-status-category="open" data-entity="trades">פתוח</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="active-alerts__details">
                                <button className="btn btn-view-alert" type="button" aria-label="פרטי התראה">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="active-alerts__card-body">
                              <div className="active-alerts__row active-alerts__row--condition">
                                <span className="active-alerts__row-label">תנאי</span>
                                <span className="active-alerts__row-value">מחיר &gt; 189.98</span>
                              </div>
                              <div className="active-alerts__row active-alerts__row--message">
                                <span className="active-alerts__row-label">הודעה</span>
                                <span className="active-alerts__row-value">⚡ התראה חדשה: מחיר INTC הגיע ל-$189.98 - הזדמנות לקנייה</span>
                              </div>
                            </div>
                            <div className="active-alerts__card-footer">
                              <time className="active-alerts__timestamp">2026-02-01 10:30</time>
                              <div className="active-alerts__actions">
                                <button 
                                  type="button" 
                                  className="active-alerts__mark_read" 
                                  data-alert-id="1" 
                                  aria-label="סמן התראה כנקראה"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          </article>

                          {/* Alert Card 2: Account Alert */}
                          <article 
                            className="active-alerts__card active-alerts__card--account" 
                            role="listitem" 
                            data-alert-id="2" 
                            data-entity-type="trading_accounts"
                          >
                            <div className="active-alerts__card-header">
                              <div className="active-alerts__header-linked">
                                <div 
                                  className="linked-object-card notes-linked-object active-alerts__linked-entity" 
                                  role="link" 
                                  tabIndex="0" 
                                  data-entity-type="trading_accounts" 
                                  data-entity-id="1"
                                >
                                  <div className="linked-object-card-icon">
                                    <img 
                                      src="/images/icons/entities/trading_accounts.svg" 
                                      alt="חשבון מסחר" 
                                      className="linked-object-card-icon-img" 
                                      width="60" 
                                      height="60"
                                    />
                                  </div>
                                  <div className="linked-object-card-content">
                                    <div className="linked-object-card-title">
                                      <span className="linked-object-card-type">חשבון מסחר</span>
                                      <span className="linked-object-card-name">חשבון 1</span>
                                    </div>
                                    <div className="linked-object-card-meta">
                                      <span className="status-badge" data-status-category="active" data-entity="trading_accounts">פעיל</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="active-alerts__details">
                                <button className="btn btn-view-alert" type="button" aria-label="פרטי התראה">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="active-alerts__card-body">
                              <div className="active-alerts__row active-alerts__row--condition">
                                <span className="active-alerts__row-label">תנאי</span>
                                <span className="active-alerts__row-value">יתרה &lt; $10,000</span>
                              </div>
                              <div className="active-alerts__row active-alerts__row--message">
                                <span className="active-alerts__row-label">הודעה</span>
                                <span className="active-alerts__row-value">⚠️ התראה: יתרת חשבון מסחר נמוכה - נדרש מימון</span>
                              </div>
                            </div>
                            <div className="active-alerts__card-footer">
                              <time className="active-alerts__timestamp">2026-02-01 09:15</time>
                              <div className="active-alerts__actions">
                                <button 
                                  type="button" 
                                  className="active-alerts__mark_read" 
                                  data-alert-id="2" 
                                  aria-label="סמן התראה כנקראה"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          </article>

                          {/* Alert Card 3: Ticker Alert */}
                          <article 
                            className="active-alerts__card active-alerts__card--ticker" 
                            role="listitem" 
                            data-alert-id="3" 
                            data-entity-type="ticker"
                          >
                            <div className="active-alerts__card-header">
                              <div className="active-alerts__header-linked">
                                <div 
                                  className="linked-object-card notes-linked-object active-alerts__linked-entity" 
                                  role="link" 
                                  tabIndex="0" 
                                  data-entity-type="ticker" 
                                  data-entity-id="1"
                                >
                                  <div className="linked-object-card-icon">
                                    <img 
                                      src="/images/icons/entities/tickers.svg" 
                                      alt="טיקר" 
                                      className="linked-object-card-icon-img" 
                                      width="60" 
                                      height="60"
                                    />
                                  </div>
                                  <div className="linked-object-card-content">
                                    <div className="linked-object-card-title">
                                      <span className="linked-object-card-type">טיקר</span>
                                      <span className="linked-object-card-name">AAPL</span>
                                    </div>
                                    <div className="linked-object-card-meta">
                                      <span className="status-badge" data-status-category="active" data-entity="ticker">פעיל</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="active-alerts__details">
                                <button className="btn btn-view-alert" type="button" aria-label="פרטי התראה">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="active-alerts__card-body">
                              <div className="active-alerts__row active-alerts__row--condition">
                                <span className="active-alerts__row-label">תנאי</span>
                                <span className="active-alerts__row-value">מחיר &gt; $150.00</span>
                              </div>
                              <div className="active-alerts__row active-alerts__row--message">
                                <span className="active-alerts__row-label">הודעה</span>
                                <span className="active-alerts__row-value">📈 התראה: AAPL עלה מעל $150.00 - סימן חיובי</span>
                              </div>
                            </div>
                            <div className="active-alerts__card-footer">
                              <time className="active-alerts__timestamp">2026-02-01 08:45</time>
                              <div className="active-alerts__actions">
                                <button 
                                  type="button" 
                                  className="active-alerts__mark_read" 
                                  data-alert-id="3" 
                                  aria-label="סמן התראה כנקראה"
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          </article>
                        </div>
                        <div className="active-alerts__empty is-hidden" data-role="empty-state">
                          <span className="active-alerts__empty-icon" aria-hidden="true">🔕</span>
                          <span className="active-alerts__empty-text">אין התראות חדשות</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Information */}
                    <div className="info-summary" id="summaryStats">
                      {/* First Row: Summary Stats */}
                      <div className="info-summary__row info-summary__row--first">
                        <div className="info-summary__content">
                          <div>סה"כ טריידים: <strong id="totalTrades">82</strong></div>
                          <div>סה"כ התראות: <strong id="totalAlerts">3</strong></div>
                          <div>יתרה נוכחית: <strong id="currentBalance"><span className="numeric-value-positive" dir="ltr">+$372,660.00</span></strong></div>
                          <div>רווח/הפסד: <strong id="totalPnL"><span className="numeric-value-positive" dir="ltr">+$1,768.00</span></strong></div>
                        </div>
                        <button 
                          className="portfolio-summary__toggle-btn" 
                          id="portfolioSummaryToggleSize" 
                          aria-label={showPortfolioSummary ? "הצג סיכום מצומצם" : "הצג סיכום מלא"} 
                          title={showPortfolioSummary ? "הצג סיכום מצומצם" : "הצג סיכום מלא"}
                          onClick={handlePortfolioSummaryToggle}
                        >
                          {showPortfolioSummary ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                              <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                      {/* Second Row: Portfolio Summary (hidden by default) */}
                      {showPortfolioSummary && (
                        <div className="info-summary__row info-summary__row--second" id="portfolioSummaryContent">
                          <div className="info-summary__content">
                            <span>חשבונות פעילים: 31 מתוך 53</span>
                            <span>שווי כולל: <span className="numeric-value-positive" dir="ltr">+$372,660.00</span></span>
                            <span>שווי ממוצע לחשבון מסחר: <span className="numeric-value-positive" dir="ltr">+$7,031.32</span></span>
                            <span>טריידים פתוחים: 71</span>
                            <span>P/L כולל: <span className="numeric-value-positive" dir="ltr">+$1,768.00</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </tt-section>

              {/* Main Content Section: Dashboard Widgets */}
              <tt-section data-section="main">
                {/* Section Header */}
                <div className="index-section__header">
                  <div className="index-section__header-title">
                    <img 
                      src="/images/icons/entities/home.svg" 
                      alt="לוח בקרה" 
                      className="index-section__header-icon" 
                      width="20" 
                      height="20"
                    />
                    <h2 className="index-section__header-text">לוח בקרה</h2>
                  </div>
                  <div className="index-section__header-meta">
                    <span className="index-section__header-count">טריידים: 82 • התראות פעילות: 3 • חשבונות: 53</span>
                  </div>
                  <div className="index-section__header-actions">
                    <button 
                      className="index-section__header-toggle-btn" 
                      aria-label="הצג/הסתר"
                      onClick={() => handleSectionToggle('main')}
                      aria-expanded={openSections['main']}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6l6 -6"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Section Body: Widget Placeholders */}
                {openSections['main'] && (
                  <div className="index-section__body">
                    <tt-section-row>
                      {/* Widget Placeholder: Recent Items */}
                      <div className="widget-placeholder">
                        <div className="widget-placeholder__header">
                          <div className="widget-placeholder__header-title-row">
                            <h3 className="widget-placeholder__title">
                              <img 
                                src="/images/icons/entities/trades.svg" 
                                alt="טריידים אחרונים" 
                                width="20" 
                                height="20" 
                                className="widget-placeholder__title-icon"
                              />
                              טריידים אחרונים
                            </h3>
                          </div>
                          <ul className="widget-placeholder__tabs" role="tablist">
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['recentTrades'] === 'recentTradesPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['recentTrades'] === 'recentTradesPane'}
                                aria-controls="recentTradesPane"
                                onClick={() => handleWidgetTabChange('recentTrades', 'recentTradesPane')}
                              >
                                טריידים אחרונים
                              </button>
                            </li>
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['recentTrades'] === 'recentPlansPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['recentTrades'] === 'recentPlansPane'}
                                aria-controls="recentPlansPane"
                                onClick={() => handleWidgetTabChange('recentTrades', 'recentPlansPane')}
                              >
                                תוכניות אחרונות
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="widget-placeholder__body">
                          {activeTabs['recentTrades'] === 'recentTradesPane' && (
                            <div className="widget-placeholder__tab-content" id="recentTradesPane" role="tabpanel">
                              <ul className="widget-placeholder__list">
                                {/* Example Trade Item 1 */}
                                <li className="widget-placeholder__list-item">
                                  <div className="widget-placeholder__item-header">
                                    <div className="widget-placeholder__item-title">
                                      <img 
                                        src="/images/icons/entities/trades.svg" 
                                        alt="טרייד" 
                                        width="16" 
                                        height="16" 
                                        className="widget-placeholder__item-icon"
                                      />
                                      <span className="widget-placeholder__item-name">SPY</span>
                                    </div>
                                    <div className="widget-placeholder__item-meta">
                                      <span className="status-badge" data-status-category="open">פתוח</span>
                                      <span className="widget-placeholder__item-date">25.01.26</span>
                                    </div>
                                    <div className="widget-placeholder__item-amount">
                                      <span className="numeric-value-positive" dir="ltr">+$175.00</span>
                                    </div>
                                  </div>
                                </li>
                                {/* Example Trade Item 2 */}
                                <li className="widget-placeholder__list-item">
                                  <div className="widget-placeholder__item-header">
                                    <div className="widget-placeholder__item-title">
                                      <img 
                                        src="/images/icons/entities/trades.svg" 
                                        alt="טרייד" 
                                        width="16" 
                                        height="16" 
                                        className="widget-placeholder__item-icon"
                                      />
                                      <span className="widget-placeholder__item-name">AAPL</span>
                                    </div>
                                    <div className="widget-placeholder__item-meta">
                                      <span className="status-badge" data-status-category="open">פתוח</span>
                                      <span className="widget-placeholder__item-date">24.01.26</span>
                                    </div>
                                    <div className="widget-placeholder__item-amount">
                                      <span className="numeric-value-negative" dir="ltr">-$45.20</span>
                                    </div>
                                  </div>
                                </li>
                                {/* Example Trade Item 3 */}
                                <li className="widget-placeholder__list-item">
                                  <div className="widget-placeholder__item-header">
                                    <div className="widget-placeholder__item-title">
                                      <img 
                                        src="/images/icons/entities/trades.svg" 
                                        alt="טרייד" 
                                        width="16" 
                                        height="16" 
                                        className="widget-placeholder__item-icon"
                                      />
                                      <span className="widget-placeholder__item-name">MSFT</span>
                                    </div>
                                    <div className="widget-placeholder__item-meta">
                                      <span className="status-badge" data-status-category="closed">סגור</span>
                                      <span className="widget-placeholder__item-date">23.01.26</span>
                                    </div>
                                    <div className="widget-placeholder__item-amount">
                                      <span className="numeric-value-positive" dir="ltr">+$320.50</span>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          )}
                          {activeTabs['recentTrades'] === 'recentPlansPane' && (
                            <div className="widget-placeholder__tab-content widget-placeholder__tab-content--hidden" id="recentPlansPane" role="tabpanel">
                              <ul className="widget-placeholder__list">
                                {/* Example Plan Item 1 */}
                                <li className="widget-placeholder__list-item">
                                  <div className="widget-placeholder__item-header">
                                    <div className="widget-placeholder__item-title">
                                      <img 
                                        src="/images/icons/entities/trade_plans.svg" 
                                        alt="תוכנית" 
                                        width="16" 
                                        height="16" 
                                        className="widget-placeholder__item-icon"
                                      />
                                      <span className="widget-placeholder__item-name">תוכנית SPY - Swing</span>
                                    </div>
                                    <div className="widget-placeholder__item-meta">
                                      <span className="status-badge" data-status-category="active">פעיל</span>
                                      <span className="widget-placeholder__item-date">25.01.26</span>
                                    </div>
                                  </div>
                                </li>
                                {/* Example Plan Item 2 */}
                                <li className="widget-placeholder__list-item">
                                  <div className="widget-placeholder__item-header">
                                    <div className="widget-placeholder__item-title">
                                      <img 
                                        src="/images/icons/entities/trade_plans.svg" 
                                        alt="תוכנית" 
                                        width="16" 
                                        height="16" 
                                        className="widget-placeholder__item-icon"
                                      />
                                      <span className="widget-placeholder__item-name">תוכנית AAPL - Day Trade</span>
                                    </div>
                                    <div className="widget-placeholder__item-meta">
                                      <span className="status-badge" data-status-category="active">פעיל</span>
                                      <span className="widget-placeholder__item-date">24.01.26</span>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Widget Placeholder: Pending Actions */}
                      <div className="widget-placeholder">
                        <div className="widget-placeholder__header">
                          <div className="widget-placeholder__header-title-row">
                            <h3 className="widget-placeholder__title">
                              <img 
                                src="/images/icons/entities/executions.svg" 
                                alt="פעולות ממתינות" 
                                width="20" 
                                height="20" 
                                className="widget-placeholder__title-icon"
                              />
                              פעולות ממתינות
                            </h3>
                            <div className="widget-placeholder__header-badges">
                              <span className="widget-placeholder__badge">0</span>
                            </div>
                          </div>
                          <ul className="widget-placeholder__tabs" role="tablist">
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['pendingActions'] === 'pendingAssignPlansPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['pendingActions'] === 'pendingAssignPlansPane'}
                                aria-controls="pendingAssignPlansPane"
                                onClick={() => handleWidgetTabChange('pendingActions', 'pendingAssignPlansPane')}
                              >
                                שיוך תוכניות
                              </button>
                            </li>
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['pendingActions'] === 'pendingAssignTradesPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['pendingActions'] === 'pendingAssignTradesPane'}
                                aria-controls="pendingAssignTradesPane"
                                onClick={() => handleWidgetTabChange('pendingActions', 'pendingAssignTradesPane')}
                              >
                                שיוך טריידים
                              </button>
                            </li>
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['pendingActions'] === 'pendingCreatePlansPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['pendingActions'] === 'pendingCreatePlansPane'}
                                aria-controls="pendingCreatePlansPane"
                                onClick={() => handleWidgetTabChange('pendingActions', 'pendingCreatePlansPane')}
                              >
                                יצירת תוכניות
                              </button>
                            </li>
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['pendingActions'] === 'pendingCreateTradesPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['pendingActions'] === 'pendingCreateTradesPane'}
                                aria-controls="pendingCreateTradesPane"
                                onClick={() => handleWidgetTabChange('pendingActions', 'pendingCreateTradesPane')}
                              >
                                יצירת טריידים
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="widget-placeholder__body">
                          {activeTabs['pendingActions'] === 'pendingAssignPlansPane' && (
                            <div className="widget-placeholder__tab-content" id="pendingAssignPlansPane" role="tabpanel">
                              <p className="widget-placeholder__text">כל הטריידים מלווים בתוכנית מתאימה. עבודה מצוינת!</p>
                            </div>
                          )}
                          {activeTabs['pendingActions'] === 'pendingAssignTradesPane' && (
                            <div className="widget-placeholder__tab-content widget-placeholder__tab-content--hidden" id="pendingAssignTradesPane" role="tabpanel">
                              <p className="widget-placeholder__text">אין טריידים הזקוקים לשיוך</p>
                            </div>
                          )}
                          {activeTabs['pendingActions'] === 'pendingCreatePlansPane' && (
                            <div className="widget-placeholder__tab-content widget-placeholder__tab-content--hidden" id="pendingCreatePlansPane" role="tabpanel">
                              <p className="widget-placeholder__text">אין הצעות ליצירת תוכניות</p>
                            </div>
                          )}
                          {activeTabs['pendingActions'] === 'pendingCreateTradesPane' && (
                            <div className="widget-placeholder__tab-content widget-placeholder__tab-content--hidden" id="pendingCreateTradesPane" role="tabpanel">
                              <p className="widget-placeholder__text">אין אשכולות ליצירת טרייד</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </tt-section-row>

                    <tt-section-row>
                      {/* Widget Placeholder: Tag Widget */}
                      <div className="widget-placeholder">
                        <div className="widget-placeholder__header">
                          <div className="widget-placeholder__header-title-row">
                            <h3 className="widget-placeholder__title">
                              <img 
                                src="/images/icons/entities/home.svg" 
                                alt="תגיות" 
                                width="20" 
                                height="20" 
                                className="widget-placeholder__title-icon"
                              />
                              תגיות
                            </h3>
                            <form className="widget-placeholder__search-form">
                              <input 
                                type="search" 
                                className="widget-placeholder__search-input" 
                                placeholder="חיפוש תגית..." 
                                id="tagWidgetSearchInput"
                              />
                              <select className="widget-placeholder__search-select" id="tagWidgetSearchEntityFilter">
                                <option value="">כל היישויות</option>
                                <option value="trades">טריידים</option>
                                <option value="trade_plans">תכניות</option>
                                <option value="ticker">טיקרים</option>
                              </select>
                              <button type="submit" className="widget-placeholder__search-btn" aria-label="חפש">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <path d="m21 21-4.35-4.35"></path>
                                </svg>
                              </button>
                            </form>
                          </div>
                        </div>
                        <div className="widget-placeholder__body">
                          <div className="widget-placeholder__tag-cloud">
                            <button className="widget-placeholder__tag-btn" type="button">🏷️ test tag</button>
                            <button className="widget-placeholder__tag-btn" type="button">🏷️ swing</button>
                            <button className="widget-placeholder__tag-btn" type="button">🏷️ day-trade</button>
                            <button className="widget-placeholder__tag-btn" type="button">🏷️ long-term</button>
                            <button className="widget-placeholder__tag-btn" type="button">🏷️ tech</button>
                          </div>
                        </div>
                      </div>

                      {/* Widget Placeholder: Ticker List */}
                      <div className="widget-placeholder">
                        <div className="widget-placeholder__header">
                          <div className="widget-placeholder__header-title-row">
                            <h3 className="widget-placeholder__title">
                              <img 
                                src="/images/icons/entities/tickers.svg" 
                                alt="רשימת טיקרים" 
                                width="20" 
                                height="20" 
                                className="widget-placeholder__title-icon"
                              />
                              רשימת טיקרים
                            </h3>
                            <button className="widget-placeholder__refresh-btn align-push-down" aria-label="רענן" title="רענן">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
                              </svg>
                            </button>
                          </div>
                          <ul className="widget-placeholder__tabs" role="tablist">
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['tickerList'] === 'tickerActivePane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['tickerList'] === 'tickerActivePane'}
                                aria-controls="tickerActivePane"
                                onClick={() => handleWidgetTabChange('tickerList', 'tickerActivePane')}
                              >
                                טיקרים פעילים
                              </button>
                            </li>
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['tickerList'] === 'tickerWatchlistPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['tickerList'] === 'tickerWatchlistPane'}
                                aria-controls="tickerWatchlistPane"
                                onClick={() => handleWidgetTabChange('tickerList', 'tickerWatchlistPane')}
                              >
                                רשימת צפיה
                              </button>
                            </li>
                            <li className="widget-placeholder__tab-item" role="presentation">
                              <button 
                                className={`widget-placeholder__tab-btn ${activeTabs['tickerList'] === 'tickerAllPane' ? 'widget-placeholder__tab-btn--active' : ''}`}
                                role="tab" 
                                aria-selected={activeTabs['tickerList'] === 'tickerAllPane'}
                                aria-controls="tickerAllPane"
                                onClick={() => handleWidgetTabChange('tickerList', 'tickerAllPane')}
                              >
                                כל הטיקרים
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="widget-placeholder__body">
                          <p className="widget-placeholder__text">Widget ייבנה בשלב מאוחר</p>
                        </div>
                      </div>

                      {/* Widget Placeholder: Ticker Chart */}
                      <div className="widget-placeholder">
                        <div className="widget-placeholder__header">
                          <div className="widget-placeholder__header-title-row">
                            <h3 className="widget-placeholder__title">
                              <img 
                                src="/images/icons/entities/tickers.svg" 
                                alt="גרף טיקר" 
                                width="20" 
                                height="20" 
                                className="widget-placeholder__title-icon"
                              />
                              גרף טיקר
                            </h3>
                            <button className="widget-placeholder__refresh-btn align-push-down" aria-label="רענן" title="רענן">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="widget-placeholder__body">
                          <div className="widget-placeholder__chart-grid">
                            {/* Example Chart Item 1 */}
                            <div className="widget-placeholder__chart-item">
                              <div className="widget-placeholder__chart-header">
                                <div className="widget-placeholder__item-title">
                                  <strong className="widget-placeholder__item-symbol">AAPL</strong>
                                  <span className="widget-placeholder__item-name">Apple Inc.</span>
                                </div>
                                <div className="widget-placeholder__item-price">
                                  <div className="widget-placeholder__item-price-value">
                                    <span className="numeric-value-positive" dir="ltr">$150.25</span>
                                  </div>
                                  <div className="widget-placeholder__item-price-change">
                                    <span className="numeric-value-positive" dir="ltr">+5.48%</span>
                                    <span className="numeric-value-positive" dir="ltr">+$7.89</span>
                                  </div>
                                </div>
                                <button className="widget-placeholder__action-btn" aria-label="דשבורד" title="דשבורד">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                                  </svg>
                                </button>
                              </div>
                              <div className="widget-placeholder__chart-placeholder">
                                <p className="widget-placeholder__text">גרף יוצג כאן</p>
                              </div>
                              <div className="widget-placeholder__item-metrics">
                                <span className="widget-placeholder__metric">
                                  <span className="metric-label">ATR:</span>
                                  <span className="metric-value">$2.45</span>
                                </span>
                              </div>
                            </div>
                            {/* Example Chart Item 2 */}
                            <div className="widget-placeholder__chart-item">
                              <div className="widget-placeholder__chart-header">
                                <div className="widget-placeholder__item-title">
                                  <strong className="widget-placeholder__item-symbol">MSFT</strong>
                                  <span className="widget-placeholder__item-name">Microsoft Corp.</span>
                                </div>
                                <div className="widget-placeholder__item-price">
                                  <div className="widget-placeholder__item-price-value">
                                    <span className="numeric-value-positive" dir="ltr">$380.75</span>
                                  </div>
                                  <div className="widget-placeholder__item-price-change">
                                    <span className="numeric-value-positive" dir="ltr">+1.59%</span>
                                    <span className="numeric-value-positive" dir="ltr">+$5.88</span>
                                  </div>
                                </div>
                                <button className="widget-placeholder__action-btn" aria-label="דשבורד" title="דשבורד">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                                  </svg>
                                </button>
                              </div>
                              <div className="widget-placeholder__chart-placeholder">
                                <p className="widget-placeholder__text">גרף יוצג כאן</p>
                              </div>
                              <div className="widget-placeholder__item-metrics">
                                <span className="widget-placeholder__metric">
                                  <span className="metric-label">ATR:</span>
                                  <span className="metric-value">$4.20</span>
                                </span>
                              </div>
                            </div>
                            {/* Example Chart Item 3 */}
                            <div className="widget-placeholder__chart-item">
                              <div className="widget-placeholder__chart-header">
                                <div className="widget-placeholder__item-title">
                                  <strong className="widget-placeholder__item-symbol">GOOGL</strong>
                                  <span className="widget-placeholder__item-name">Alphabet Inc.</span>
                                </div>
                                <div className="widget-placeholder__item-price">
                                  <div className="widget-placeholder__item-price-value">
                                    <span className="numeric-value-positive" dir="ltr">$142.30</span>
                                  </div>
                                  <div className="widget-placeholder__item-price-change">
                                    <span className="numeric-value-positive" dir="ltr">+1.14%</span>
                                    <span className="numeric-value-positive" dir="ltr">+$1.61</span>
                                  </div>
                                </div>
                                <button className="widget-placeholder__action-btn" aria-label="דשבורד" title="דשבורד">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                                  </svg>
                                </button>
                              </div>
                              <div className="widget-placeholder__chart-placeholder">
                                <p className="widget-placeholder__text">גרף יוצג כאן</p>
                              </div>
                              <div className="widget-placeholder__item-metrics">
                                <span className="widget-placeholder__metric">
                                  <span className="metric-label">ATR:</span>
                                  <span className="metric-value">$3.15</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </tt-section-row>
                  </div>
                )}
              </tt-section>

              {/* Portfolio Table Section */}
              <tt-section data-section="portfolio">
                {/* Section Header */}
                <div className="index-section__header">
                  <div className="index-section__header-title">
                    <img 
                      src="/images/icons/entities/trading_accounts.svg" 
                      alt="פורטפוליו" 
                      className="index-section__header-icon" 
                      width="20" 
                      height="20"
                    />
                    <h2 className="index-section__header-text">פורטפוליו</h2>
                  </div>
                  <div className="index-section__header-meta">
                    <span className="index-section__header-count">3 פוזיציות פעילות</span>
                  </div>
                  <div className="index-section__header-actions">
                    {/* Portfolio Filters */}
                    <div className="portfolio-header-filters">
                      {/* Account Filter Dropdown */}
                      <select 
                        id="portfolioAccountFilter" 
                        className="portfolio-filter-select align-push-down" 
                        aria-label="לבחור חשבון מסחר"
                      >
                        <option value="">כל חשבונות המסחר</option>
                        <option value="1">חשבון 1</option>
                        <option value="2">חשבון 2</option>
                      </select>
                      
                      {/* Side Filter Buttons */}
                      <div className="portfolio-side-filters align-push-down" role="group" id="portfolioSideFilterGroup">
                        <button 
                          className="portfolio-side-filter-btn" 
                          data-side="" 
                          aria-label="הצג הכל" 
                          title="הצג הכל" 
                          type="button"
                        >
                          ↕
                        </button>
                        <button 
                          className="portfolio-side-filter-btn portfolio-side-filter-long" 
                          data-side="long" 
                          aria-label="רק לונג" 
                          title="רק לונג" 
                          type="button"
                        >
                          ↑
                        </button>
                        <button 
                          className="portfolio-side-filter-btn portfolio-side-filter-short" 
                          data-side="short" 
                          aria-label="רק שורט" 
                          title="רק שורט" 
                          type="button"
                        >
                          ↓
                        </button>
                      </div>
                      
                      {/* Checkboxes Container */}
                      <div className="portfolio-checkboxes-container align-push-down">
                        <label className="portfolio-checkbox-label">
                          <input type="checkbox" id="portfolioIncludeClosed" className="portfolio-checkbox-input" />
                          <span className="portfolio-checkbox-text">הצג פוזיציות סגורות</span>
                        </label>
                        <label className="portfolio-checkbox-label">
                          <input type="checkbox" id="portfolioUnifyAccounts" className="portfolio-checkbox-input" />
                          <span className="portfolio-checkbox-text">אחד פוזיציות בין חשבונות מסחר</span>
                        </label>
                      </div>
                    </div>
                    
                    <button 
                      className="index-section__header-toggle-btn" 
                      aria-label="הצג/הסתר"
                      onClick={() => handleSectionToggle('portfolio')}
                      aria-expanded={openSections['portfolio']}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6l6 -6"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Section Body: Portfolio Table */}
                {openSections['portfolio'] && (
                  <div className="index-section__body">
                    <div className="portfolio-table-wrapper">
                      <table className="portfolio-table" id="portfolioTable" data-table-type="portfolio">
                        <thead>
                          <tr>
                            <th className="col-side">צד</th>
                            <th className="col-symbol">סימבול</th>
                            <th className="col-ticker">נוכחי</th>
                            <th className="col-quantity">כמות</th>
                            <th className="col-avg-price">מחיר ממוצע</th>
                            <th className="col-market-value">שווי שוק</th>
                            <th className="col-unrealized-pl">P/L</th>
                            <th className="col-account">חשבון מסחר</th>
                            <th className="col-percent-portfolio">% פורטפוליו</th>
                            <th className="col-actions">פעולות</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Example Row 1 */}
                          <tr>
                            <td className="col-side"><span className="side-badge side-badge--long">↑</span></td>
                            <td className="col-symbol">AAPL</td>
                            <td className="col-ticker"><span className="numeric-value-positive" dir="ltr">$150.25</span></td>
                            <td className="col-quantity">100</td>
                            <td className="col-avg-price"><span className="numeric-value-positive" dir="ltr">$148.50</span></td>
                            <td className="col-market-value"><span className="numeric-value-positive" dir="ltr">$15,025.00</span></td>
                            <td className="col-unrealized-pl"><span className="numeric-value-positive" dir="ltr">+$175.00</span></td>
                            <td className="col-account">חשבון 1</td>
                            <td className="col-percent-portfolio">4.03%</td>
                            <td className="col-actions">
                              <button className="btn-action" aria-label="פעולות">⋯</button>
                            </td>
                          </tr>
                          {/* Example Row 2 */}
                          <tr>
                            <td className="col-side"><span className="side-badge side-badge--short">↓</span></td>
                            <td className="col-symbol">MSFT</td>
                            <td className="col-ticker"><span className="numeric-value-positive" dir="ltr">$380.75</span></td>
                            <td className="col-quantity">50</td>
                            <td className="col-avg-price"><span className="numeric-value-positive" dir="ltr">$385.00</span></td>
                            <td className="col-market-value"><span className="numeric-value-positive" dir="ltr">$19,037.50</span></td>
                            <td className="col-unrealized-pl"><span className="numeric-value-negative" dir="ltr">-$212.50</span></td>
                            <td className="col-account">חשבון 2</td>
                            <td className="col-percent-portfolio">5.10%</td>
                            <td className="col-actions">
                              <button className="btn-action" aria-label="פעולות">⋯</button>
                            </td>
                          </tr>
                          {/* Example Row 3 */}
                          <tr>
                            <td className="col-side"><span className="side-badge side-badge--long">↑</span></td>
                            <td className="col-symbol">GOOGL</td>
                            <td className="col-ticker"><span className="numeric-value-positive" dir="ltr">$142.30</span></td>
                            <td className="col-quantity">75</td>
                            <td className="col-avg-price"><span className="numeric-value-positive" dir="ltr">$140.00</span></td>
                            <td className="col-market-value"><span className="numeric-value-positive" dir="ltr">$10,672.50</span></td>
                            <td className="col-unrealized-pl"><span className="numeric-value-positive" dir="ltr">+$172.50</span></td>
                            <td className="col-account">חשבון 1</td>
                            <td className="col-percent-portfolio">2.86%</td>
                            <td className="col-actions">
                              <button className="btn-action" aria-label="פעולות">⋯</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </tt-section>
              </tt-container>
            )}
          </main>
        </div>
      </div>

      {/* Page Footer */}
      <PageFooter />
    </>
  );
};

export default HomePage;
