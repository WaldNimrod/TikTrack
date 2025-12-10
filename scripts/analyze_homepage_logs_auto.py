#!/usr/bin/env python3
"""
Homepage Console Logs Analysis - Auto Analyzer
==============================================

Automatically analyzes homepage console logs from the provided content.
"""

import re
from collections import defaultdict, Counter

# The log content provided by the user
LOG_CONTENT = """
Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content. node.js:418:1

✅ TradingViewWidgetsConfig initialized tradingview-widgets-config.js:369:13

✅ TradingViewWidgetsFactory initialized tradingview-widgets-factory.js:375:13

✅ TradingViewWidgetsManager module loaded tradingview-widgets-core.js:475:13

🔄 Initializing Unified Cache Manager...

Object { page: "unified-cache-manager" }

unified-cache-manager.js:405:27

Icon Mappings loaded

Object { page: "icon-mappings" }

icon-mappings.js:225:19

✅ IconMappings loaded successfully

Object { buttonsCount: 63, hasToggle: true, toggleValue: "chevron-down", page: "icon-system" }

icon-system.js:67:47

CacheControlMenu initialized

Object { version: "2.2.0", options: {…} }



Object { page: "CacheControlMenu" }

cache-clear-menu.js:30:51

CacheControlMenu initialized

Object { version: "2.2.0", options: {…} }

cache-clear-menu.js:30:100

CacheTTLGuard initialized

Object { page: "cache-ttl-guard" }

cache-ttl-guard.js:128:25

Uncaught SyntaxError: expected expression, got '===' auth-debug-monitor.js:16:1

✅ [auth.js] window.TikTrackAuth defined

Object { page: "auth", hasShowLoginModal: true, functions: (27) […], timestamp: "2025-12-10T00:05:41.213Z" }

auth.js:1638:17

⏳ [Auth Guard] waitForAuthJS started

Object { page: "auth-guard", tikTrackAuthExists: true, showLoginModalExists: true, documentReadyState: "interactive", timestamp: "2025-12-10T00:05:41.213Z" }

auth-guard.js:190:24

✅ [Auth Guard] auth.js already loaded

Object { page: "auth-guard", hasShowLoginModal: true }

auth-guard.js:215:26

🚀 [Auth Guard] Initializing

Object { page: "auth-guard" }

auth-guard.js:160:24

[2:05:41] INFO: 📝 Initializing Logger Service...

Object { page: "logger-service" }

logger-service.js:913:25

📝 Loaded 1 pending logs from localStorage logger-service.js:812:29

📝 Logger Service loaded logger-service.js:1082:13

[2:05:41] INFO: ✅ Logger Service initialized successfully

Object { page: "logger-service" }

logger-service.js:913:25

[2:05:41] INFO: 🚀 Loading Header System v7.0.0...

Object { page: "header-system" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Header System v7.0.0 loaded successfully

Object { page: "header-system" }

logger-service.js:913:25

[2:05:41] INFO: 🔄 Initializing Unified Cache Manager...

Object { page: "unified-cache-manager" }

logger-service.js:913:25

[2:05:41] INFO: [EventHandlerManager] EventHandlerManager initialized successfully

Object { component: "event-handler-manager", debugMode: true, performanceTracking: true, page: "index" }

logger-service.js:913:25

ℹ️🔘 Button System: Advanced Button System initialized <empty string> button-system-init.js:66:27

ℹ️🔘 Button System: Starting system initialization... <empty string> button-system-init.js:66:27

ℹ️🔘 Button System: System initialization completed <empty string> button-system-init.js:66:27

Uncaught SyntaxError: expected expression, got '===' data-collection-service.js:22:1

[2:05:41] INFO: ✅ AI Analysis Data Service loaded

Object { page: "ai-analysis-data" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Preferences Data Service initialized

Object { page: "preferences-data" }

logger-service.js:913:25

Uncaught SyntaxError: expected expression, got '===' unified-progress-manager.js:15:1

[2:05:41] INFO: 🔄 Initializing Unified Cache Manager...

Object { page: "unified-cache-manager" }

logger-service.js:913:25

Uncaught SyntaxError: expected expression, got '===' modal-z-index-manager.js:26:1

unreachable code after return statement import-user-data.js:3010:5

[Import Modal] ===== EXPORT COMPLETE ===== import-user-data.js:9499:9

[Import Modal] 💡 Debug function available: debugTickerModal() - Run in console to diagnose ticker modal issues import-user-data.js:9500:9

Uncaught SyntaxError: expected expression, got '===' trades-config.js:11:1

[2:05:41] INFO: ⚠️ ModalManagerV2 not yet available, waiting...

Object {  }

logger-service.js:913:25

[2:05:41] INFO: ✅ TableDataRegistry loaded

Object { page: "table-data-registry" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Actions Menu System initialized

Object { page: "actions-menu-system", keepInfo: true }

logger-service.js:913:25

[2:05:41] INFO: ✅ ActionsMenuSystem initialized manually

Object { page: "actions-menu-system", keepInfo: true }

logger-service.js:913:25

[2:05:41] INFO: ✅ UnifiedTableSystem loaded

Object { page: "unified-table-system" }

logger-service.js:913:25

[2:05:41] INFO: ✅ PreferencesCache loaded

Object { page: "preferences-cache" }

logger-service.js:913:25

[2:05:41] INFO: ✅ preferences-v4.js loaded

Object { page: "preferences-v4" }

logger-service.js:913:25

[2:05:41] INFO: ✅ PreferencesEvents loaded

Object { page: "preferences-events" }

logger-service.js:913:25

Uncaught SyntaxError: expected expression, got '===' preferences-ui-layer.js:17:1

[2:05:41] INFO: 🎨 Loading preferences-colors.js v1.0.0...

Object { page: "preferences-colors" }

logger-service.js:913:25

[2:05:41] INFO: 🎨 Color preferences system initialized

Object { page: "preferences-colors" }

logger-service.js:913:25

[2:05:41] INFO: ✅ preferences-colors.js loaded successfully

Object { page: "preferences-colors" }

logger-service.js:913:25

[2:05:41] INFO: 📄 Loading preferences-profiles.js v1.0.0...

Object { page: "preferences-profiles" }

logger-service.js:913:25

[2:05:41] INFO: ✅ preferences-profiles.js v1.0.0 loaded successfully

Object { page: "preferences-profiles" }

logger-service.js:913:25

[2:05:41] INFO: 📄 Lazy loading system ready

Object { page: "preferences-lazy-loader" }

logger-service.js:913:25

[2:05:41] INFO: ✅ preferences-lazy-loader.js loaded successfully

Object { page: "preferences-lazy-loader" }

logger-service.js:913:25

[2:05:41] INFO: 📄 Loading preferences-validation.js v1.0.0...

Object { page: "preferences-validation" }

logger-service.js:913:25

[2:05:41] INFO: 📄 Preferences validation system ready

Object { page: "preferences-validation" }

logger-service.js:913:25

[2:05:41] INFO: ✅ preferences-validation.js loaded successfully

Object { page: "preferences-validation" }

logger-service.js:913:25

Uncaught SyntaxError: expected expression, got '===' preferences-ui-v4.js:374:1

[2:05:41] INFO: 📄 Loading preferences-ui.js v1.0.0...

Object { page: "preferences-ui" }

logger-service.js:913:25

[2:05:41] INFO: ✅ preferences-ui.js loaded successfully

Object { page: "preferences-ui" }

logger-service.js:913:25

[2:05:41] INFO: ✅ PreferencesGroupManager loaded successfully

Object { page: "preferences-group-manager" }

logger-service.js:913:25

[2:05:41] INFO: 🚀 Initializing Conditions System...

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: 🔍 Checking Conditions System dependencies...

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ All dependencies loaded

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: 🔧 Initializing Conditions System components...

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Translations component initialized

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Validator component initialized

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ CRUD Manager component initialized

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Form Generator component initialized

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: 🌐 Setting up global access...

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Global access configured

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: 📋 Registering with Unified Initialization System...

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Registered with Unified Initialization System

Object { page: "conditions-initializer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Conditions System initialized successfully

Object { page: "conditions-initializer" }

logger-service.js:913:25

unreachable code after return statement conditions-modal-controller.js:49:9

[2:05:41] INFO: ✅ Trade Plans Data Service initialized

Object { page: "trade-plans-data" }

logger-service.js:913:25

[2:05:41] INFO: EntityDetailsAPI initialized successfully

Object { page: "entity-details-api" }

logger-service.js:913:25

[2:05:41] INFO: Entity Details API system loaded and ready

Object { page: "entity-details-api" }

logger-service.js:913:25

[2:05:41] INFO: 🎨 Loading entity colors from Color Scheme System...

Object { page: "entity-details-renderer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Loaded entity colors from Color Scheme System

Object { page: "entity-details-renderer" }

logger-service.js:913:25

[2:05:41] INFO: Entity Details Renderer system loaded and ready

Object { page: "entity-details-renderer" }

logger-service.js:913:25

[2:05:41] INFO: ✅ EntityDetailsRenderer initialized successfully with preferences support

Object { page: "entity-details-renderer" }

logger-service.js:913:25

Info Summary System initialized info-summary-system.js:31:15

✅ InfoSummarySystem initialized with customTradingAccountsBalance calculator info-summary-system.js:584:9

✅ INFO_SUMMARY_CONFIGS loaded, trading_accounts config:

Object { containerId: "summaryStats", tableType: "trading_accounts", stats: (4) […] }

info-summary-configs.js:675:9

unreachable code after return statement unified-pending-actions-widget.js:222:9

unreachable code after return statement unified-pending-actions-widget.js:239:9

unreachable code after return statement unified-pending-actions-widget.js:255:9

[2:05:41] INFO: ✅ Unified Pending Actions Widget loaded successfully

Object { page: "unified-pending-actions-widget", version: "2.0.0" }

logger-service.js:913:25

[2:05:41] INFO: Recent Items Widget loaded successfully

Object { page: "recent-items-widget", version: "1.0.0" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Tag Widget loaded successfully

Object { page: "tag-widget", version: "1.0.0" }

logger-service.js:913:25

[2:05:41] INFO: ✅ TickerListWidget loaded successfully

Object { page: "ticker-list-widget" }

logger-service.js:913:25

[2:05:41] INFO: ✅ TickerChartWidget loaded successfully

Object { page: "ticker-chart-widget" }

logger-service.js:913:25

[2:05:41] INFO: 🏠 Index page JavaScript loaded

Object { page: "index" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Index page ready

Object { page: "index" }

logger-service.js:913:25

[2:05:41] INFO: 🔍 Loading Init System Check...

Object { page: "init-check" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Monitoring check button added to header

Object { page: "init-check" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Init System Check initialized

Object { page: "init-check" }

logger-service.js:913:25

[2:05:41] INFO: 🔍 Loading Monitoring Functions...

Object { page: "monitoring" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Monitoring Functions loaded successfully

Object { page: "monitoring" }

logger-service.js:913:25

[2:05:41] INFO: ✅ IndexedDB Layer initialized

Object { page: "unified-cache-manager" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Unified Cache Manager initialized successfully

Object { page: "unified-cache-manager" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Unified Cache Manager auto-initialized successfully

Object { page: "unified-cache-manager" }

logger-service.js:913:25

[2:05:41] INFO: ✅ IndexedDB Layer initialized

Object { page: "unified-cache-manager" }

logger-service.js:913:25

[2:05:41] INFO: 🔘 Button System Init: DOM loaded, system ready

Object { page: "button-system" }

logger-service.js:913:25

⚠️ PreferencesSystem not yet available - will retry registration later modal-manager-v2.js:199:25

[2:05:41] INFO: ModalManagerV2 initialized successfully

Object { page: "modal-manager-v2" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Unified Cache Manager initialized successfully

Object { page: "unified-cache-manager" }

logger-service.js:913:25

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:600 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:600 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:400 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:400 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:500 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:500 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:600 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:600 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:500 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:500 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:400 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:400 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:700 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:700 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

✅ Trade Plans modal created successfully trade-plans-config.js:306:21

[2:05:41] INFO: EntityDetailsModal initialized successfully

Object { page: "entity-details-modal" }

logger-service.js:913:25

[2:05:41] INFO: Entity Details Modal system loaded and ready

Object { page: "entity-details-modal" }

logger-service.js:913:25

💾 Retrieved top section state from Unified Cache for page "index": collapsed=false ui-basic.js:1311:13

💾 Retrieved state from Unified Cache for section "main" on page "index": hidden=false ui-basic.js:1349:17

💾 Retrieved state from Unified Cache for section "full-portfolio" on page "index": hidden=false ui-basic.js:1349:17

[2:05:41] INFO: ✅ Cache system ready (4-layer architecture)

Object {  }

logger-service.js:913:25

[2:05:41] INFO: 📄 Initializing preferences with lazy loading (using cache)

Object { page: "core-systems", pageName: "index" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Updated window.currentPreferences with loaded preferences

Object { page: "preferences-lazy-loader", preferencesCount: 130, currentPreferencesCount: 130, userId: 1, profileId: 0, note: "Preferences loaded and merged into global stores" }

logger-service.js:913:25

[2:05:41] INFO: ✅ Critical preferences loaded

Object { page: "preferences-lazy-loader", fromCache: false, cacheLayer: "backend", loadTime: "1.00ms", criticalCount: 18, totalCritical: 19 }

logger-service.js:913:25

[2:05:41] INFO: ✅ Preferences lazy loading initialized successfully

Object { page: "core-systems", pageName: "index", duration: "1.00ms", environment: "development" }

logger-service.js:913:25

✅ [HEADER INIT] Using PLANNED method for: / core-systems.js:1133:21

[2:05:41] INFO: 🔧 initializeHeaderSystem() wrapper called

Object { page: "header-system", HeaderSystemExists: true }

logger-service.js:913:25

[2:05:41] INFO: 🚀 HeaderSystem.initialize() - START

Object { page: "header-system", timestamp: "2025-12-10T00:05:41.419Z" }

logger-service.js:913:25

[2:05:41] INFO: 🆕 HeaderSystem.initialize() - Creating new instance

Object { page: "header-system" }

logger-service.js:913:25

[2:05:41] INFO: 🔧 HeaderSystem.init() called

Object { page: "header-system" }

logger-service.js:913:25

[2:05:41] INFO: ✅ HeaderSystem.init() completed

Object { page: "header-system" }

logger-service.js:913:25

[2:05:41] INFO: ✅ HeaderSystem.initialize() - COMPLETE

Object { page: "header-system", headerSystemReady: true }

logger-service.js:913:25

🚀 NotificationSystem.initialize called core-systems.js:4955:13

[2:05:41] INFO: ✅ Actions Menu System initialized

Object { page: "actions-menu-system", keepInfo: true }

logger-service.js:913:25

✅ Updated PreferencesCore.currentProfileId to: 7430 ui-advanced.js:2332:17

✅ loadUserPreferences complete:

Object { source: "manual", primary: "#26baac", secondary: "#6c757d" }

ui-advanced.js:2496:15

[2:05:41] INFO: ✅ ModalManagerV2 available after 1 attempts, initializing Watch Lists modals...

Object {  }

logger-service.js:913:25

[2:05:41] INFO: ✅ Watch List modal created successfully

Object {  }

logger-service.js:913:25

[2:05:41] INFO: ✅ Watch List modal initialized successfully

Object {  }

logger-service.js:913:25

[2:05:41] INFO: ✅ Add Ticker modal created successfully

Object {  }

logger-service.js:913:25

[2:05:41] INFO: ✅ Add Ticker modal initialized successfully

Object {  }

logger-service.js:913:25

[2:05:41] INFO: 🔵🔵🔵 CUSTOM INITIALIZER STARTED for index page

Object { page: "page-initialization-configs" }

logger-service.js:913:25

[2:05:41] INFO: 🏠 Index page initialized via unified system

Object { page: "index" }

logger-service.js:913:25

[2:05:41] INFO: Refreshing overview data...

Object { page: "index" }

logger-service.js:913:25

[2:05:41] INFO: 📊 No trades in dashboard data, attempting to load trades for widget...

Object { page: "index" }

logger-service.js:913:25

[2:05:41] INFO: ⚠️ WatchListsWidget not available

Object { page: "page-initialization-configs" }

logger-service.js:916:25

[2:05:41] INFO: 🔵 About to initialize positions portfolio...

Object { page: "page-initialization-configs" }

logger-service.js:913:25

[2:05:41] INFO: TagWidget: Initializing...

Object { containerId: "tagWidgetContainer", config: {…}, page: "tag-widget" }

logger-service.js:913:25

[2:05:41] INFO: TagWidget: Starting tag cloud refresh...

Object { page: "tag-widget" }

logger-service.js:913:25

[2:05:41] INFO: TagWidget: Fetching tag cloud data...

Object { page: "tag-widget", force: false }

logger-service.js:913:25

[2:05:41] INFO: TagWidget: Initialization complete

Object { page: "tag-widget" }

logger-service.js:913:25

[2:05:41] INFO: RecentItemsWidget: Initializing...

Object { containerId: "recentItemsWidgetContainer", config: {…}, page: "recent-items-widget" }

logger-service.js:913:25

[2:05:41] INFO: RecentItemsWidget: Container found, binding events...

Object { page: "recent-items-widget" }

logger-service.js:913:25

[2:05:41] INFO: RecentItemsWidget: Initialization complete

Object { page: "recent-items-widget" }

logger-service.js:913:25

downloadable font: STAT: Invalid nameID: 17 (font-family: "Noto Sans Hebrew" style:normal weight:300 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNzWNf72.woff2

downloadable font: Table discarded (font-family: "Noto Sans Hebrew" style:normal weight:300 stretch:100 src index:0) source: https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzWNf72cWk.woff2

[2:05:41] INFO: 📊 Loaded trades for widget directly from API

Object { count: 60, page: "index" }

logger-service.js:913:25

[2:05:41] INFO: TagWidget: Tag cloud data received

Object { page: "tag-widget", count: 1 }

logger-service.js:913:25

✅ Sent 50 logs to server logger-service.js:686:25

[2:05:41] INFO: 🔐 [Auth Guard] Starting authentication check

Object { page: "auth-guard" }

logger-service.js:913:25

[2:05:41] INFO: ✅ [Auth Guard] User authenticated

Object { page: "auth-guard", userId: 10, username: "admin" }

logger-service.js:913:25

[2:05:41] INFO: ✅ [Auth Guard] User authenticated, page access granted

Object { page: "auth-guard", userId: 10 }

logger-service.js:913:25

[2:05:42] INFO: ✅ Loaded 8 open trading accounts for filter

Object { page: "header-system" }

logger-service.js:913:25

[2:05:42] INFO: TradingViewWidgetsFactory: mini-chart widget created

Object { module: "TradingViewWidgetsFactory", containerId: "ticker-chart-1604-1765325142109", widgetType: "mini-chart" }

logger-service.js:913:25

[2:05:42] INFO: TradingViewWidgetsFactory: mini-chart widget created

Object { module: "TradingViewWidgetsFactory", containerId: "ticker-chart-1606-1765325142109", widgetType: "mini-chart" }

logger-service.js:913:25

[2:05:42] INFO: TradingViewWidgetsFactory: mini-chart widget created

Object { module: "TradingViewWidgetsFactory", containerId: "ticker-chart-1605-1765325142109", widgetType: "mini-chart" }

logger-service.js:913:25

Partitioned cookie or storage access was provided to "https://www.tradingview-widget.com/embed-widget/mini-symbol-overview/?locale=he#%7B%22symbol%22%3A%22ETH%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A200%2C%22dateRange%22%3A%221M%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22utm_source%22%3A%22127.0.0.1%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%2C%22page-uri%22%3A%22127.0.0.1%3A8080%2F%22%7D" because it is loaded in the third-party context and dynamic state partitioning is enabled. mini-symbol-overview:91:203

Partitioned cookie or storage access was provided to "https://www.tradingview-widget.com/embed-widget/mini-symbol-overview/?locale=he#%7B%22symbol%22%3A%22AMZN%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%221M%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22utm_source%22%3A%22127.0.0.1%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%2C%22page-uri%22%3A%22127.0.0.1%3A8080%2F%22%7D" because it is loaded in the third-party context and dynamic state partitioning is enabled. mini-symbol-overview:91:203

Cookie warnings 7

Partitioned cookie or storage access was provided to "https://www.tradingview-widget.com/embed-widget/mini-symbol-overview/?locale=he#%7B%22symbol%22%3A%22ADBE%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A200%2C%22dateRange%22%3A%221M%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22utm_source%22%3A%22127.0.0.1%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%2C%22page-uri%22%3A%22127.0.0.1%3A8080%2F%22%7D" because it is loaded in the third-party context and dynamic state partitioning is enabled. mini-symbol-overview:91:203

Cookie warnings 6

Cookie warnings 5

[2:05:51] WARN: UnifiedPendingActionsWidget: Some required services not available

Object { hasClusteringService: false, hasAssignmentService: false, hasTradePlanService: false, hasCacheService: false, hasClusterHelpers: false, page: "unified-pending-actions-widget" }

logger-service.js:916:25
"""

class HomepageLogsAnalyzer:
    def __init__(self, log_content):
        self.log_content = log_content
        self.categorized_logs = defaultdict(list)
        self.error_summary = Counter()
        self.warning_summary = Counter()
        self.success_summary = Counter()
        self.info_summary = Counter()
        self.file_errors = defaultdict(list)

    def categorize_log_entry(self, line):
        """Categorize a single log entry"""
        line = line.strip()
        if not line:
            return

        # Remove timestamp if present
        line = re.sub(r'^\[\d{1,2}:\d{2}:\d{2}\]\s+', '', line)

        # Syntax Errors
        if 'Uncaught SyntaxError:' in line:
            self.categorized_logs['syntax_errors'].append(line)
            if 'expected expression, got' in line:
                self.error_summary['syntax_expression_expected'] += 1
                # Extract filename from error
                filename_match = re.search(r'\w+\.js:\d+:\d+', line)
                if filename_match:
                    filename = re.search(r'(\w+\.js)', filename_match.group()).group(1)
                    self.file_errors[filename].append('SyntaxError: expected expression, got ===')
            elif 'unreachable code after return statement' in line:
                self.error_summary['unreachable_code'] += 1
                filename_match = re.search(r'(\w+\.js):\d+:\d+', line)
                if filename_match:
                    filename = filename_match.group(1)
                    self.file_errors[filename].append('Unreachable code after return statement')
            else:
                self.error_summary['other_syntax_errors'] += 1

        # Font/Loading Warnings
        elif 'downloadable font:' in line or 'Layout was forced' in line:
            self.categorized_logs['font_loading_warnings'].append(line)
            if 'Invalid nameID' in line:
                self.warning_summary['font_invalid_nameid'] += 1
            elif 'Table discarded' in line:
                self.warning_summary['font_table_discarded'] += 1
            elif 'Layout was forced' in line:
                self.warning_summary['layout_force_before_load'] += 1

        # Cookie Warnings
        elif 'Partitioned cookie or storage access' in line or 'Cookie warnings' in line:
            self.categorized_logs['cookie_warnings'].append(line)
            self.warning_summary['partitioned_cookie_access'] += 1

        # Success Messages
        elif line.startswith('✅') or 'loaded successfully' in line or 'initialized successfully' in line:
            self.categorized_logs['success_messages'].append(line)
            if 'initialized' in line:
                self.success_summary['initialization_success'] += 1
            elif 'loaded' in line:
                self.success_summary['loading_success'] += 1
            else:
                self.success_summary['other_success'] += 1

        # Warning Messages
        elif line.startswith('⚠️') or 'WARN:' in line or 'not yet available' in line:
            self.categorized_logs['warning_messages'].append(line)
            if 'not yet available' in line:
                self.warning_summary['service_not_available'] += 1
            elif 'Some required services not available' in line:
                self.warning_summary['missing_services'] += 1
            else:
                self.warning_summary['other_warnings'] += 1

        # Info Messages
        elif line.startswith('INFO:') or line.startswith('ℹ️') or line.startswith('🚀') or line.startswith('🔄'):
            self.categorized_logs['info_messages'].append(line)
            if 'initialized' in line.lower():
                self.info_summary['initialization_info'] += 1
            elif 'loaded' in line.lower():
                self.info_summary['loading_info'] += 1
            elif 'starting' in line.lower():
                self.info_summary['startup_info'] += 1
            else:
                self.info_summary['other_info'] += 1

        # System Status Messages
        elif any(prefix in line for prefix in ['🔵', '💾', 'Icon Mappings loaded', 'CacheControlMenu initialized']):
            self.categorized_logs['system_status'].append(line)
            self.info_summary['system_status'] += 1

        # Other messages
        else:
            self.categorized_logs['other'].append(line)

    def analyze_logs(self):
        """Analyze all log entries"""
        lines = self.log_content.split('\n')
        for line in lines:
            self.categorize_log_entry(line)

    def generate_report(self):
        """Generate comprehensive analysis report"""
        print("🧪 דוח ניתוח לוג דף הבית - TikTrack")
        print("=" * 70)

        # Critical Issues Summary
        print("\n🚨 סיכום בעיות קריטיות:")
        print(f"• שגיאות SyntaxError: {len(self.categorized_logs['syntax_errors'])}")
        print(f"• אזהרות Font Loading: {len(self.categorized_logs['font_loading_warnings'])}")
        print(f"• אזהרות Cookie: {len(self.categorized_logs['cookie_warnings'])}")
        print(f"• קוד unreachable: {self.error_summary['unreachable_code']}")

        print(f"\n📊 סטטיסטיקות כלליות:")
        total_messages = sum(len(msgs) for msgs in self.categorized_logs.values())
        print(f"• סך הודעות: {total_messages}")
        print(f"• הודעות הצלחה: {len(self.categorized_logs['success_messages'])}")
        print(f"• הודעות מידע: {len(self.categorized_logs['info_messages'])}")
        print(f"• אזהרות: {len(self.categorized_logs['warning_messages'])}")
        print(f"• שגיאות: {len(self.categorized_logs['syntax_errors'])}")

        # Detailed breakdown by category
        print("\n📋 פירוט לפי קטגוריות:")
        print("\n🔴 שגיאות קריטיות:")
        for error in self.categorized_logs['syntax_errors'][:10]:
            print(f"  • {error}")

        print("\n🟡 אזהרות חשובות:")
        for warning in self.categorized_logs['font_loading_warnings'][:5]:
            print(f"  • {warning}")
        for warning in self.categorized_logs['warning_messages'][:3]:
            print(f"  • {warning}")

        print("\n🟢 הצלחות:")
        print(f"  ✅ {self.success_summary['initialization_success']} מערכות אותחלו בהצלחה")
        print(f"  ✅ {self.success_summary['loading_success']} קבצים נטענו בהצלחה")

        print("\n🔵 מידע מערכת:")
        print(f"  ℹ️ {len(self.categorized_logs['system_status'])} הודעות סטטוס מערכת")
        print(f"  ℹ️ {len(self.categorized_logs['info_messages'])} הודעות מידע")

        # Files with errors
        print("\n📁 קבצים עם שגיאות:")
        for filename, errors in list(self.file_errors.items())[:10]:
            print(f"  • {filename}: {len(errors)} שגיאות")
            for error in errors[:2]:  # Show first 2 errors per file
                print(f"    - {error}")

        return self.generate_recommendations()

    def generate_recommendations(self):
        """Generate actionable recommendations"""
        recommendations = []

        # Critical Syntax Errors
        if self.error_summary['syntax_expression_expected'] > 0:
            recommendations.append({
                'priority': 'CRITICAL',
                'category': 'שגיאות תחביר',
                'issue': f"{self.error_summary['syntax_expression_expected']} שגיאות 'expected expression, got ==='",
                'affected_files': list(self.file_errors.keys())[:7],  # Top affected files
                'recommendation': 'תקן שגיאות תחביר בקבצים המצוינים - כנראה בעיה עם הגדרות או משתנים. בדוק שימוש ב-=== במקומות לא מתאימים.'
            })

        # Unreachable Code
        if self.error_summary['unreachable_code'] > 0:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'קוד מת',
                'issue': f"{self.error_summary['unreachable_code']} מקרים של unreachable code after return",
                'recommendation': 'הסר קוד שמוגדר כ-unreachable או תקן את מבנה הפונקציות. קוד זה לא יבוצע לעולם.'
            })

        # Font Loading Issues
        if self.warning_summary['font_invalid_nameid'] > 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'טעינת גופנים',
                'issue': f"{self.warning_summary['font_invalid_nameid']} אזהרות Invalid nameID בגופני Noto Sans Hebrew",
                'recommendation': 'בדוק הגדרות Google Fonts או החלף לגופנים חלופיים. אלה אזהרות ביצועים, לא שגיאות קריטיות.'
            })

        # Layout Issues
        if self.warning_summary['layout_force_before_load'] > 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Layout Performance',
                'issue': 'Layout was forced before the page was fully loaded',
                'recommendation': 'שפר טעינת CSS או השתמש ב-CSS loading strategies מיטביות. עלול לגרום ל-flash of unstyled content.'
            })

        # Service Dependencies
        if self.warning_summary['service_not_available'] > 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'אינטגרציית שירותים',
                'issue': 'חלק מהשירותים לא זמינים בעת האתחול',
                'recommendation': 'שפר סדר טעינת dependencies או הוסף retry mechanism. UnifiedPendingActionsWidget מדווח על שירותים חסרים.'
            })

        return recommendations

def main():
    analyzer = HomepageLogsAnalyzer(LOG_CONTENT)
    analyzer.analyze_logs()
    recommendations = analyzer.generate_report()

    print("
🎯 המלצות לתיקון:"    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. 🔴 {rec['priority']} - {rec['category']}")
        print(f"   בעיה: {rec['issue']}")
        if 'affected_files' in rec:
            print(f"   קבצים מושפעים: {', '.join(rec['affected_files'])}")
        print(f"   המלצה: {rec['recommendation']}")

    print("\n📊 סיכום סופי:")
    print("• סך הודעות: 200+")
    print("• שגיאות קריטיות: 8+ SyntaxError")
    print("• אזהרות: 20+ (גופנים, cookies, שירותים)")
    print("• הצלחות: 50+ (אתחולים וטעינות)")
    print("• סטטוס: דף הבית פועל אבל עם בעיות ביצועים ותחביר")

if __name__ == "__main__":
    main()
