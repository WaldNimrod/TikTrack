// Page Initialization Configs - Minimal version for testing

// Minimal configs for auth pages - prevent loading heavy systems
const pageInitializationConfigs = {
  login: {
    name: "Login",
    requiredGlobals: ["window.Logger"],
    pageKey: "login",
    customInitializers: [
      async function(pageConfig) {
        console.log("🔐 Login page initialized - minimal config");
      }
    ]
  },

  register: {
    name: "Register",
    requiredGlobals: ["window.Logger"],
    pageKey: "register",
    customInitializers: [
      async function(pageConfig) {
        console.log("🔐 Register page initialized - minimal config");
      }
    ]
  },

  forgot_password: {
    name: "Forgot Password",
    requiredGlobals: ["window.Logger"],
    pageKey: "forgot_password",
    customInitializers: [
      async function(pageConfig) {
        console.log("🔐 Forgot Password page initialized - minimal config");
      }
    ]
  },

  reset_password: {
    name: "Reset Password",
    requiredGlobals: ["window.Logger"],
    pageKey: "reset_password",
    customInitializers: [
      async function(pageConfig) {
        console.log("🔐 Reset Password page initialized - minimal config");
      }
    ]
  },

  index: {
    name: "Index/Home Page",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.DashboardData", "window.TikTrackAuth"],
    pageKey: "index",
    customInitializers: [
      async function(pageConfig) {
        // #region agent log - H3: Index page initialization
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:init',message:'Index page initialization started',data:{ucmInitialized:window.UnifiedCacheManager?.initialized,dashboardDataExists:!!window.DashboardData,tikTrackAuthExists:!!window.TikTrackAuth,isAuthenticated:window.TikTrackAuth?.isAuthenticated?.()||false,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        console.log("🏠 Index page initialized - home dashboard");

        // #region agent log - widget initialization check
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:widgetCheck',message:'Checking widget availability before initialization',data:{recentItemsWidgetExists:!!window.RecentItemsWidget,tickerListWidgetExists:!!window.TickerListWidget,tickerChartWidgetExists:!!window.TickerChartWidget,watchListsWidgetExists:!!window.WatchListsWidget,tagWidgetExists:!!window.TagWidget,unifiedPendingActionsWidgetExists:!!window.UnifiedPendingActionsWidget,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization_check',hypothesisId:'widget_initialization'})}).catch(()=>{});
        // #endregion
        
        // Check authentication first (same as other protected pages)
        if (window.ensureAuthenticatedForPage) {
          const authResult = await window.ensureAuthenticatedForPage("index");
          if (!authResult) {
            // User was redirected to login - exit early
            return;
          }
        }
        
        // Wait for auth to be ready
        if (window.TikTrackAuth && window.TikTrackAuth.isAuthenticated && window.TikTrackAuth.isAuthenticated()) {
          // Initialize unified recent items widget before loading data
          if (typeof window.RecentItemsWidget !== 'undefined' && typeof window.RecentItemsWidget.init === 'function') {
            try {
              const containerId = 'recentItemsWidgetContainer';
              const containerExists = document.getElementById(containerId);
              
              if (containerExists) {
                window.RecentItemsWidget.init(containerId, {
                  defaultTab: 'trades',
                  maxItems: 5
                });
                window.Logger?.info?.('✅ RecentItemsWidget initialized', { 
                  containerId,
                  page: 'index' 
                });
              } else {
                // Retry after short delay if container not found
                setTimeout(() => {
                  if (document.getElementById(containerId)) {
                    window.RecentItemsWidget.init(containerId, {
                      defaultTab: 'trades',
                      maxItems: 5
                    });
                    window.Logger?.info?.('✅ RecentItemsWidget initialized (retry)', { 
                      containerId,
                      page: 'index' 
                    });
                  } else {
                    window.Logger?.warn?.('⚠️ RecentItemsWidget container not found', { 
                      containerId,
                      page: 'index' 
                    });
                  }
                }, 500);
              }
            } catch (error) {
              window.Logger?.warn?.('⚠️ Error initializing RecentItemsWidget:', error, { 
                page: 'index' 
              });
            }
            
            // ✅ טען נתונים באופן עצמאי אחרי init
            if (window.RecentItemsWidget && window.RecentItemsWidget.initialized) {
              try {
                if (window.DashboardData && typeof window.DashboardData.getRecentTrades === 'function') {
                  // #region agent log - H4: calling getRecentTrades
                  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:callGetRecentTrades',message:'H4: Calling getRecentTrades',data:{timestamp:Date.now(),dashboardDataExists:!!window.DashboardData,hasGetRecentTrades:!!window.DashboardData?.getRecentTrades},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
                  // #endregion
                  
                  const trades = await window.DashboardData.getRecentTrades({ limit: 5 });
                  const plans = await window.DashboardData.getRecentTradePlans({ limit: 5 });
                  
                  // #region agent log - H4: got recent data
                  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:gotRecentData',message:'H4: Got recent data',data:{timestamp:Date.now(),tradesCount:trades?.length||0,plansCount:plans?.length||0,hasRender:!!window.RecentItemsWidget?.render},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
                  // #endregion
                  
                  if (window.RecentItemsWidget.render) {
                    await window.RecentItemsWidget.render({ trades, tradePlans: plans });
                    window.Logger?.info?.('✅ RecentItemsWidget: Data loaded independently', { 
                      tradesCount: trades?.length || 0,
                      plansCount: plans?.length || 0,
                      page: 'index' 
                    });
                  }
                } else {
                  // #region agent log - H4: DashboardData.getRecentTrades not available
                  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:getRecentTradesNotAvailable',message:'H4: DashboardData.getRecentTrades not available',data:{timestamp:Date.now(),dashboardDataExists:!!window.DashboardData,hasGetRecentTrades:!!window.DashboardData?.getRecentTrades},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
                  // #endregion
                }
              } catch (error) {
                // #region agent log - H4: error loading recent data
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:errorLoadingRecentData',message:'H4: Error loading recent data',data:{timestamp:Date.now(),error:error?.message},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
                // #endregion
                window.Logger?.warn?.('⚠️ RecentItemsWidget: Error loading data independently', { 
                  error: error?.message, 
                  page: 'index' 
                });
              }
            }
          }
          
          // Initialize other widgets (TickerListWidget, TagWidget, WatchListsWidget)
          // These widgets manage their own loading states, but need to be initialized to start loading data
          // #region agent log - widget initialization check
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:widgetInitCheck',message:'Checking widget availability',data:{tickerListWidgetExists:!!window.TickerListWidget,tickerChartWidgetExists:!!window.TickerChartWidget,watchListsWidgetExists:!!window.WatchListsWidget,tagWidgetExists:!!window.TagWidget,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
          // #endregion
          
          if (window.TickerListWidget && typeof window.TickerListWidget.init === 'function') {
            try {
              // #region agent log - TickerListWidget init start
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerListWidget:init',message:'TickerListWidget init started',data:{containerExists:!!document.getElementById('tickerListWidgetContainer'),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.TickerListWidget.init('tickerListWidgetContainer', {
                maxItems: 5,
                defaultTab: 'active'
              });
              // #region agent log - TickerListWidget init success
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerListWidget:success',message:'TickerListWidget initialized successfully',data:{containerHasContent:!!document.getElementById('tickerListWidgetContainer')?.innerHTML?.trim(),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.info?.('✅ TickerListWidget initialized', { page: 'index' });
            } catch (error) {
              // #region agent log - TickerListWidget init error
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerListWidget:error',message:'TickerListWidget init failed',data:{error:error?.message,containerExists:!!document.getElementById('tickerListWidgetContainer'),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.error?.('❌ Error initializing TickerListWidget', { error: error?.message }, { page: 'index' });
            }
          } else {
            // #region agent log - TickerListWidget not available
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerListWidget:notAvailable',message:'TickerListWidget not available',data:{exists:!!window.TickerListWidget,hasInit:typeof window.TickerListWidget?.init === 'function',globalKeys:Object.keys(window).filter(k=>k.includes('Ticker')).join(','),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
            // #endregion
          }
          
          if (window.TickerChartWidget && typeof window.TickerChartWidget.init === 'function') {
            try {
              // #region agent log - TickerChartWidget init start
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerChartWidget:init',message:'TickerChartWidget init started',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.TickerChartWidget.init('tickerChartWidgetContainer', {
                maxItems: 3
              });
              // #region agent log - TickerChartWidget init success
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerChartWidget:success',message:'TickerChartWidget initialized successfully',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.info?.('✅ TickerChartWidget initialized', { page: 'index' });
            } catch (error) {
              // #region agent log - TickerChartWidget init error
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerChartWidget:error',message:'TickerChartWidget init failed',data:{error:error?.message,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.error?.('❌ Error initializing TickerChartWidget', { error: error?.message }, { page: 'index' });
            }
          } else {
            // #region agent log - TickerChartWidget not available
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TickerChartWidget:notAvailable',message:'TickerChartWidget not available',data:{exists:!!window.TickerChartWidget,hasInit:typeof window.TickerChartWidget?.init === 'function',timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
            // #endregion
          }
          
          if (window.WatchListsWidget && typeof window.WatchListsWidget.init === 'function') {
            try {
              // #region agent log - WatchListsWidget init start
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:WatchListsWidget:init',message:'WatchListsWidget init started',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              await window.WatchListsWidget.init('watchListsWidgetContainer', {
                maxItems: 10
              });
              // #region agent log - WatchListsWidget init success
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:WatchListsWidget:success',message:'WatchListsWidget initialized successfully',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.info?.('✅ WatchListsWidget initialized', { page: 'index' });
            } catch (error) {
              // #region agent log - WatchListsWidget init error
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:WatchListsWidget:error',message:'WatchListsWidget init failed',data:{error:error?.message,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.error?.('❌ Error initializing WatchListsWidget', { error: error?.message }, { page: 'index' });
            }
          } else {
            // #region agent log - WatchListsWidget not available
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:WatchListsWidget:notAvailable',message:'WatchListsWidget not available',data:{exists:!!window.WatchListsWidget,hasInit:typeof window.WatchListsWidget?.init === 'function',timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
            // #endregion
          }

          if (window.UnifiedPendingActionsWidget && typeof window.UnifiedPendingActionsWidget.init === 'function') {
            try {
              // #region agent log - UnifiedPendingActionsWidget init start
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:UnifiedPendingActionsWidget:init',message:'UnifiedPendingActionsWidget init started',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              await window.UnifiedPendingActionsWidget.init('unifiedPendingActionsWidgetContainer', {
                defaultAction: 'assign',
                defaultEntity: 'trades'
              });
              // #region agent log - UnifiedPendingActionsWidget init success
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:UnifiedPendingActionsWidget:success',message:'UnifiedPendingActionsWidget initialized successfully',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.info?.('✅ UnifiedPendingActionsWidget initialized', { page: 'index' });
              
              // Render widget after initialization to populate content
              if (window.UnifiedPendingActionsWidget && typeof window.UnifiedPendingActionsWidget.render === 'function') {
                await window.UnifiedPendingActionsWidget.render();
                // #region agent log - UnifiedPendingActionsWidget render called
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:UnifiedPendingActionsWidget:render',message:'UnifiedPendingActionsWidget.render() called',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
                // #endregion
              }
            } catch (error) {
              // #region agent log - UnifiedPendingActionsWidget init error
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:UnifiedPendingActionsWidget:error',message:'UnifiedPendingActionsWidget init failed',data:{error:error?.message,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.error?.('❌ Error initializing UnifiedPendingActionsWidget', { error: error?.message }, { page: 'index' });
            }
          } else {
            // #region agent log - UnifiedPendingActionsWidget not available
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:UnifiedPendingActionsWidget:notAvailable',message:'UnifiedPendingActionsWidget not available',data:{exists:!!window.UnifiedPendingActionsWidget,hasInit:typeof window.UnifiedPendingActionsWidget?.init === 'function',timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
            // #endregion
          }

          // Initialize TagWidget (it loads data automatically on init via refreshTagCloud)
          if (window.TagWidget && typeof window.TagWidget.init === 'function') {
            try {
              // #region agent log - TagWidget init start
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TagWidget:init',message:'TagWidget init started',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.TagWidget.init('tagWidgetContainer');
              // #region agent log - TagWidget init success
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TagWidget:success',message:'TagWidget initialized successfully',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.info?.('✅ TagWidget initialized', { page: 'index' });
            } catch (error) {
              // #region agent log - TagWidget init error
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TagWidget:error',message:'TagWidget init failed',data:{error:error?.message,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
              // #endregion
              window.Logger?.error?.('❌ Error initializing TagWidget', { error: error?.message }, { page: 'index' });
            }
          } else {
            // #region agent log - TagWidget not available
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:TagWidget:notAvailable',message:'TagWidget not available',data:{exists:!!window.TagWidget,hasInit:typeof window.TagWidget?.init === 'function',timestamp:Date.now()},sessionId:'debug-session',runId:'widget_initialization',hypothesisId:'widget_loading'})}).catch(()=>{});
            // #endregion
          }
          
          // #region agent log - H3: Calling loadDashboardData
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:loadData',message:'Calling loadDashboardData',data:{dashboardDataExists:!!window.DashboardData,loadDashboardDataExists:!!window.loadDashboardData,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
          
          if (window.loadDashboardData) {
            try {
              await window.loadDashboardData();
              // #region agent log - H3: DashboardData loaded
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:dataLoaded',message:'DashboardData loaded successfully',data:{dashboardDataExists:!!window.DashboardData,hasLoadMethod:!!window.DashboardData?.load,hasGetSummaryStats:!!window.DashboardData?.getSummaryStats,hasGetRecentTrades:!!window.DashboardData?.getRecentTrades,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
              // #endregion
              
              // ✅ Summary Stats - Initialization עצמאי
              if (window.DashboardData && typeof window.DashboardData.getSummaryStats === 'function') {
                try {
                  // #region agent log - H5: calling getSummaryStats
                  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:callGetSummaryStats',message:'H5: Calling getSummaryStats',data:{timestamp:Date.now(),dashboardDataExists:!!window.DashboardData,hasGetSummaryStats:!!window.DashboardData?.getSummaryStats},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
                  // #endregion
                  
                  const stats = await window.DashboardData.getSummaryStats();
                  
                  // #region agent log - H5: got summary stats
                  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:gotSummaryStats',message:'H5: Got summary stats',data:{timestamp:Date.now(),tradesCount:stats.trades?.length||0,alertsCount:stats.alerts?.length||0,accountsCount:stats.accounts?.length||0,hasUpdateSummaryStats:!!window.updateSummaryStats},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
                  // #endregion
                  
                  if (window.updateSummaryStats) {
                    const currencySymbol = stats.currencySymbol || '$';
                    window.updateSummaryStats({
                      trades: stats.trades || [],
                      alerts: stats.alerts || [],
                      accounts: stats.accounts || [],
                      cashFlows: stats.cashFlows || []
                    }, currencySymbol);
                    window.Logger?.info?.('✅ Summary Stats: Updated independently', { 
                      tradesCount: stats.trades?.length || 0,
                      alertsCount: stats.alerts?.length || 0,
                      accountsCount: stats.accounts?.length || 0,
                      page: 'index' 
                    });
                  } else {
                    // #region agent log - H5: updateSummaryStats not available
                    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:updateSummaryStatsNotAvailable',message:'H5: updateSummaryStats not available',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
                    // #endregion
                  }
                } catch (error) {
                  // #region agent log - H5: error loading summary stats
                  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:errorLoadingSummaryStats',message:'H5: Error loading summary stats',data:{timestamp:Date.now(),error:error?.message},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
                  // #endregion
                  window.Logger?.warn?.('⚠️ Summary Stats: Error loading data independently', { 
                    error: error?.message, 
                    page: 'index' 
                  });
                }
              } else {
                // #region agent log - H5: DashboardData.getSummaryStats not available
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:getSummaryStatsNotAvailable',message:'H5: DashboardData.getSummaryStats not available',data:{timestamp:Date.now(),dashboardDataExists:!!window.DashboardData,hasGetSummaryStats:!!window.DashboardData?.getSummaryStats},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
                // #endregion
              }
            } catch (error) {
              // #region agent log - H3: DashboardData load error
              fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:dataLoadError',message:'DashboardData load failed',data:{error:error?.message,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
              // #endregion
              window.Logger?.error?.('❌ Failed to load dashboard data', { error: error?.message }, { page: 'index' });
            }
          } else {
            // #region agent log - H3: loadDashboardData not available
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:loadDataMissing',message:'loadDashboardData function not available',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            window.Logger?.warn?.('⚠️ loadDashboardData function not available', { page: 'index' });
          }
        } else {
          // #region agent log - H3: Not authenticated
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:index:notAuth',message:'User not authenticated, skipping dashboard data load',data:{tikTrackAuthExists:!!window.TikTrackAuth,isAuthenticated:window.TikTrackAuth?.isAuthenticated?.()||false,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
          window.Logger?.info?.('ℹ️ User not authenticated, dashboard data will load after login', { page: 'index' });
        }
      }
    ]
  },

  crud_testing_dashboard: {
    name: "CRUD Testing Dashboard",
    packages: [
      "base",
      "services",
      "ui-advanced",
      "crud",
      "init-system"
    ],
    requiredGlobals: [
      "window.UnifiedAppInitializer",
      "window.pageInitializationConfigs",
      "window.PACKAGE_MANIFEST",
      "window.Logger",
      "window.CacheSyncManager",
      "window.IconSystem",
      "window.API_BASE_URL",
      "window.APIFetchWrapper",
      "ModalManagerV2",
      "window.TikTrackAuth"
    ],
    pageKey: "crud_testing_dashboard",
    initializeFunction: async function() {
      console.log("Initializing CRUD Testing Dashboard");
    },
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("crud_testing_dashboard");
        }
      }
    ]
  },

  // CRUD Batch A - Tag Management, Database Display, Database Extra Data
  tag_management: {
    name: "Tag Management",
    packages: [
      "base",
      "services",
      "ui-advanced",
      "init-system"
    ],
    requiredGlobals: [
      "window.UnifiedAppInitializer",
      "window.pageInitializationConfigs",
      "window.PACKAGE_MANIFEST",
      "window.Logger",
      "window.CacheSyncManager",
      "window.IconSystem",
      "window.API_BASE_URL",
      "window.APIFetchWrapper",
      "window.TikTrackAuth",
      "window.TagManagementPage"
    ],
    pageKey: "tag_management",
    initializeFunction: async function() {
      console.log("Initializing Tag Management Page");
    },
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("tag_management");
        }
      }
    ]
  },

  db_display: {
    name: "Database Display",
    packages: [
      "base",
      "services",
      "ui-advanced",
      "init-system"
    ],
    requiredGlobals: [
      "window.UnifiedAppInitializer",
      "window.pageInitializationConfigs",
      "window.PACKAGE_MANIFEST",
      "NotificationSystem",
      "DataUtils",
      "window.Logger",
      "window.CacheSyncManager",
      "window.IconSystem",
      "window.API_BASE_URL",
      "window.APIFetchWrapper",
      "ModalManagerV2",
      "window.TikTrackAuth"
    ],
    pageKey: "db_display",
    initializeFunction: async function() {
      console.log("Initializing Database Display Page");
    },
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("db_display");
        }
      }
    ]
  },

  db_extradata: {
    name: "Database Extra Data",
    packages: [
      "base",
      "services",
      "ui-advanced",
      "init-system"
    ],
    requiredGlobals: [
      "window.UnifiedAppInitializer",
      "window.pageInitializationConfigs",
      "window.PACKAGE_MANIFEST",
      "NotificationSystem",
      "DataUtils",
      "window.Logger",
      "window.CacheSyncManager",
      "window.IconSystem",
      "window.API_BASE_URL",
      "window.APIFetchWrapper",
      "ModalManagerV2",
      "window.TikTrackAuth"
    ],
    pageKey: "db_extradata",
    initializeFunction: async function() {
      console.log("Initializing Database Extra Data Page");
    },
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("db_extradata");
        }
      }
    ]
  },

  executions: {
    name: "Executions",
    requiredGlobals: ["UnifiedAppInitializer", "TikTrackAuth"],
    pageKey: "executions",
    customInitializers: [
      async function(pageConfig) {
        // Auth check - CRITICAL: Check return value!
        if (window.ensureAuthenticatedForPage) {
          const authResult = await window.ensureAuthenticatedForPage("executions");
          if (!authResult) {
            // User was redirected to login - exit early
            return;
          }
        }
      }
    ]
  },

  trade_history: {
    name: "Trade History",
    requiredGlobals: ["UnifiedAppInitializer", "TikTrackAuth"],
    pageKey: "trade_history",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("trade_history");
        }
      }
    ]
  },

  trades: {
    name: "Trades",
    requiredGlobals: ["UnifiedAppInitializer", "TikTrackAuth"],
    pageKey: "trades",
    customInitializers: [
      async function(pageConfig) {
        // Auth check - CRITICAL: Check return value!
        if (window.ensureAuthenticatedForPage) {
          const authResult = await window.ensureAuthenticatedForPage("trades");
          if (!authResult) {
            // User was redirected to login - exit early
            return;
          }
        }
        
        // Clear all loaders (ultra-aggressive)
        try {
          // Clear static HTML loaders
          const tradesCount = document.getElementById('tradesCount');
          if (tradesCount && tradesCount.textContent.includes('טוען')) {
            tradesCount.textContent = '0';
          }
          
          const loadingRow = document.querySelector('#tradesTable tbody tr td.loading');
          if (loadingRow) {
            loadingRow.parentElement.remove();
          }
          
          // Clear ALL elements with "טוען" text (including dynamic loaders)
          document.querySelectorAll('*').forEach(el => {
            const text = el.textContent || '';
            const innerHTML = el.innerHTML || '';
            if ((text.includes('טוען') || innerHTML.includes('טוען')) && 
                (el.tagName === 'DIV' || el.tagName === 'SPAN' || el.tagName === 'P' || 
                 el.tagName === 'H5' || el.tagName === 'H6' || el.tagName === 'H4' ||
                 el.tagName === 'TD' || el.classList.contains('spinner-border') || el.classList.contains('spinner-grow'))) {
              const style = window.getComputedStyle(el);
              if (style.display !== 'none' && style.visibility !== 'hidden' && !el.hidden) {
                const trimmedText = text.trim();
                if (trimmedText === 'טוען' || trimmedText === 'טוען...' || trimmedText.includes('טוען טריידים')) {
                  el.classList.add('d-none');
                  el.style.display = 'none';
                  el.hidden = true;
                }
              }
            }
          });
          
          window.Logger?.debug?.('✅ Trades loaders cleared (ultra-aggressive)', { page: 'trades' });
        } catch (error) {
          window.Logger?.error?.('❌ Error clearing trades loaders', error, { page: 'trades' });
        }
        
        // Load data
        if (window.loadTradesData) {
          await window.loadTradesData();
        }
      }
    ]
  },

  trades_formatted: {
    name: "Trades Formatted",
    requiredGlobals: ["UnifiedAppInitializer", "TikTrackAuth"],
    pageKey: "trades_formatted",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("trades_formatted");
        }
      }
    ]
  },

  // Add authentication protection to all unprotected pages
  ai_analysis: {
    name: "AI Analysis",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "ai_analysis",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("ai_analysis");
        }
        // Initialize AI analysis functionality
        if (window.initializeAIAnalysisPage) {
          await window.initializeAIAnalysisPage();
        }
      }
    ]
  },

  research: {
    name: "Research",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "research",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("research");
        }
        // Initialize research functionality
        if (window.initializeResearchPage) {
          await window.initializeResearchPage();
        }
      }
    ]
  },

  constraints: {
    name: "Constraints",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "constraints",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("constraints");
        }
        // Initialize constraints functionality
        if (window.initializeConstraintsPage) {
          await window.initializeConstraintsPage();
        }
      }
    ]
  },

  database_page_entities: {
    name: "Database Page Entities",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "database_page_entities",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("database_page_entities");
        }
        // Initialize database entities functionality
        if (window.initializeDatabasePageEntities) {
          await window.initializeDatabasePageEntities();
        }
      }
    ]
  },

  helper_tables_page_entities: {
    name: "Helper Tables Page Entities",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "helper_tables_page_entities",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("helper_tables_page_entities");
        }
        // Initialize helper tables functionality
        if (window.initializeHelperTablesPageEntities) {
          await window.initializeHelperTablesPageEntities();
        }
      }
    ]
  },

  currencies: {
    name: "Currencies",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "currencies",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("currencies");
        }
        // Initialize currencies functionality
        if (window.initializeCurrenciesPage) {
          await window.initializeCurrenciesPage();
        }
      }
    ]
  },

  preferences_groups_management: {
    name: "Preferences Groups Management",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "preferences_groups_management",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("preferences_groups_management");
        }
        // Initialize preferences groups functionality
        if (window.initializePreferencesGroupsManagementPage) {
          await window.initializePreferencesGroupsManagementPage();
        }
      }
    ]
  },

  button_color_mapping: {
    name: "Button Color Mapping",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "button_color_mapping",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("button_color_mapping");
        }
        // Initialize button color mapping functionality
        if (window.initializeButtonColorMapping) {
          window.initializeButtonColorMapping();
        }
      }
    ]
  },

  system_management: {
    name: "System Management",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "system_management",
    customInitializers: [
      async function(pageConfig) {
        // Auth check - CRITICAL: Check return value!
        if (window.ensureAuthenticatedForPage) {
          const authResult = await window.ensureAuthenticatedForPage("system_management");
          if (!authResult) {
            // User was redirected to login - exit early
            return;
          }
        }
        // Initialize system management functionality
        if (window.initializeSystemManagement) {
          window.initializeSystemManagement();
        }
      }
    ]
  },

  dynamic_colors_display: {
    name: "Dynamic Colors Display",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "dynamic_colors_display",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("dynamic_colors_display");
        }
        // Initialize dynamic colors display functionality
        if (window.initializeDynamicColorsDisplay) {
          window.initializeDynamicColorsDisplay();
        }
      }
    ]
  },

  user_management: {
    name: "User Management",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "user_management",
    customInitializers: [
      async function(pageConfig) {
        // #region agent log - U1: user_management initializer entry
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:user_management:entry',message:'U1: user_management initializer started',data:{ensureAuthExists:!!window.ensureAuthenticatedForPage,initFunctionExists:!!window.initializeUserManagement,authTokenExists:!!sessionStorage.getItem('authToken'),currentUserExists:!!sessionStorage.getItem('currentUser'),timestamp:Date.now()},sessionId:'debug-session',runId:'run6_user_mgmt_fix',hypothesisId:'U1'})}).catch(()=>{});
        // #endregion
        
        if (window.ensureAuthenticatedForPage) {
          const authResult = await window.ensureAuthenticatedForPage("user_management");
          
          // #region agent log - U2: auth check result
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:user_management:authResult',message:'U2: ensureAuthenticatedForPage returned',data:{authResult,timestamp:Date.now()},sessionId:'debug-session',runId:'run6_user_mgmt_fix',hypothesisId:'U2'})}).catch(()=>{});
          // #endregion
        }
        // Initialize user management functionality
        if (window.initializeUserManagement) {
          window.initializeUserManagement();
        }
      }
    ]
  },

  cash_flows: {
    name: "Cash Flows",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "cash_flows",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("cash_flows");
        }
      }
    ]
  },

  cash_flows_old: {
    name: "Cash Flows Old",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "cash_flows_old",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("cash_flows_old");
        }
      }
    ]
  },

  code_quality_dashboard: {
    name: "Code Quality Dashboard",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "code_quality_dashboard",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("code_quality_dashboard");
        }
      }
    ]
  },

  crud_testing_dashboard_old: {
    name: "CRUD Testing Dashboard Old",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "crud_testing_dashboard_old",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("crud_testing_dashboard_old");
        }
      }
    ]
  },

  css_management: {
    name: "CSS Management",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "css_management",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("css_management");
        }
      }
    ]
  },

  data_import: {
    name: "Data Import",
    requiredGlobals: ["window.UnifiedAppInitializer", "window.Logger", "window.TikTrackAuth"],
    pageKey: "data_import",
    customInitializers: [
      async function(pageConfig) {
        if (window.ensureAuthenticatedForPage) {
          await window.ensureAuthenticatedForPage("data_import");
        }
      }
    ]
  }
};

// Export for global access
console.log('🔧 [page-initialization-configs] About to export configs, window exists:', typeof window !== 'undefined');
if (typeof window !== 'undefined') {
  window.pageInitializationConfigs = pageInitializationConfigs;
  console.log('✅ [page-initialization-configs] Exported configs successfully, count:', Object.keys(pageInitializationConfigs).length);
} else {
  console.log('❌ [page-initialization-configs] Window not available for export');
}

// Auth function - FIXED: Now performs real authentication check with redirect loop prevention
async function ensureAuthenticatedForPage(pageName) {
  // #region agent log - ensureAuthenticatedForPage entry
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:entry',message:'ensureAuthenticatedForPage called',data:{pageName:pageName,hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken'),recentLoginTimestamp:sessionStorage.getItem('recent_login_timestamp'),timestamp:Date.now()},sessionId:'debug-session',runId:'redirect_loop_fix',hypothesisId:'redirect_loop_prevention'})}).catch(()=>{});
  // #endregion
  console.log(`🔐 [Page Auth] Checking authentication for page: ${pageName}`);

  // Check if this is a public page
  const publicPages = ['login', 'register', 'forgot_password', 'reset_password'];
  if (publicPages.some(page => pageName.includes(page))) {
    console.log(`✅ [Page Auth] Public page ${pageName}, skipping auth check`);
    return true;
  }

  // ===== REDIRECT LOOP PREVENTION (same as auth-guard.js) =====
  // Check for recent login to prevent redirect loop
  const recentLogin = sessionStorage.getItem('recent_login_timestamp');
  if (recentLogin) {
    const timeSinceLogin = Date.now() - parseInt(recentLogin);
    if (timeSinceLogin < 5000) {
      // #region agent log - recent login detected
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:recentLogin',message:'Recent login detected, waiting',data:{pageName:pageName,timeSinceLogin:timeSinceLogin,timestamp:Date.now()},sessionId:'debug-session',runId:'redirect_loop_fix',hypothesisId:'redirect_loop_prevention'})}).catch(()=>{});
      // #endregion
      console.log(`⏳ [Page Auth] Recent login detected (${timeSinceLogin}ms ago), waiting before check`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Clear timestamp after waiting to prevent future loops
      sessionStorage.removeItem('recent_login_timestamp');
    }
  }

  // Additional delay to allow session cookie to be set after page reload
  // This prevents race condition where we check auth before session is ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Wait for TikTrackAuth to be loaded (auth.js might not be ready yet)
  if (!window.TikTrackAuth && !window.checkAuthentication) {
    console.log(`⏳ [Page Auth] Waiting for auth.js to load...`);
    // Wait up to 5 seconds for auth.js to load
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.TikTrackAuth || window.checkAuthentication) {
        console.log(`✅ [Page Auth] auth.js loaded after ${i + 1} attempts`);
        break;
      }
    }
  }

  // Wait for tokens to be available (bootstrap from sessionStorage)
  // This prevents redirect when tokens exist but haven't been loaded yet
  let tokenReady = false;
  for (let i = 0; i < 10; i++) {
    const hasUC = window.UnifiedCacheManager?.initialized;
    // Try SessionStorageLayer through UnifiedCacheManager first (preferred method)
    const ucToken = hasUC ? await window.UnifiedCacheManager.get('authToken', { 
      layer: 'sessionStorage', 
      includeUserId: false 
    }).catch((e) => {
      return null;
    }) : null;
    // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
    const ssToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('authToken') : null;
    // Check window globals (bootstrap may have set them)
    const windowToken = window.authToken;
    const windowUser = window.currentUser;

    // #region agent log - token check attempt
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:tokenCheck',message:'Token check attempt',data:{pageName:pageName,attempt:i+1,ucToken:!!ucToken,ssToken:!!ssToken,windowToken:!!windowToken,windowUser:!!windowUser,hasUC:hasUC,ucInitialized:window.UnifiedCacheManager?.initialized,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_H3_H5'})}).catch(()=>{});
    // #endregion

    if (ucToken || ssToken || windowToken) {
      tokenReady = true;
      // #region agent log - token found
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:tokenFound',message:'Token found after waiting',data:{pageName:pageName,attempt:i+1,ucToken:!!ucToken,ssToken:!!ssToken,windowToken:!!windowToken,tokenSource:ucToken?'ucm':ssToken?'session':'window',timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_H3_H5'})}).catch(()=>{});
      // #endregion
      console.log(`✅ [Page Auth] Token found! UC: ${!!ucToken}, SS: ${!!ssToken}, Window: ${!!windowToken}`);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // ✅ CRITICAL FIX: If no token found after waiting, check if bootstrap is still running
  // Bootstrap runs synchronously but may not have completed yet
  if (!tokenReady) {
    // Wait for bootstrap to complete (check window globals)
    console.log(`⏳ [Page Auth] No token found after initial wait, checking if bootstrap is still running...`);
    for (let j = 0; j < 20; j++) {
      const hasWindowToken = !!window.authToken;
      const hasWindowUser = !!window.currentUser;
      const hasSessionToken = !!sessionStorage.getItem('authToken');
      
      // #region agent log - bootstrap wait check
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:bootstrapWait',message:'Waiting for bootstrap to complete',data:{pageName:pageName,attempt:j+1,hasWindowToken,hasWindowUser,hasSessionToken,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_bootstrap_timing'})}).catch(()=>{});
      // #endregion
      
      if (hasWindowToken || hasSessionToken) {
        tokenReady = true;
        console.log(`✅ [Page Auth] Token found after bootstrap wait! Window: ${hasWindowToken}, Session: ${hasSessionToken}`);
        // #region agent log - bootstrap token found
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:bootstrapTokenFound',message:'Token found after bootstrap wait',data:{pageName:pageName,attempt:j+1,hasWindowToken,hasSessionToken,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_bootstrap_timing'})}).catch(()=>{});
        // #endregion
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // #region agent log - token ready status
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:tokenReadyStatus',message:'Token ready status before auth check',data:{pageName:pageName,tokenReady:tokenReady,hasWindowToken:!!window.authToken,hasWindowUser:!!window.currentUser,hasSessionToken:!!sessionStorage.getItem('authToken'),timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_H3_H5'})}).catch(()=>{});
  // #endregion

  // Perform real authentication check using auth.js
  // Try window.TikTrackAuth.checkAuthentication first (preferred)
  // Fallback to window.checkAuthentication for backward compatibility
  const checkAuthFunction = window.TikTrackAuth?.checkAuthentication || window.checkAuthentication;
  
  // #region agent log - before auth check
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:beforeAuthCheck',message:'About to call checkAuthentication',data:{pageName:pageName,tokenReady:tokenReady,hasCheckAuthFunction:typeof checkAuthFunction === 'function',hasTikTrackAuth:!!window.TikTrackAuth,hasCheckAuth:typeof window.checkAuthentication === 'function',windowToken:!!window.authToken,windowUser:!!window.currentUser,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_H3_H5'})}).catch(()=>{});
  // #endregion
  
  if (typeof checkAuthFunction === 'function') {
    try {
      const authResult = await checkAuthFunction();
      
      // #region agent log - auth check result
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:authCheckResult',message:'Auth check result received',data:{pageName:pageName,authenticated:authResult?.authenticated,hasUser:!!authResult?.user,hasError:!!authResult?.error,error:authResult?.error,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix',hypothesisId:'H1_H3_H5'})}).catch(()=>{});
      // #endregion
      
      if (authResult && authResult.authenticated) {
        // #region agent log - authentication success
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:authSuccess',message:'Authentication successful',data:{pageName:pageName,authenticated:true,timestamp:Date.now()},sessionId:'debug-session',runId:'redirect_loop_fix',hypothesisId:'redirect_loop_prevention'})}).catch(()=>{});
        // #endregion
        console.log(`✅ [Page Auth] User authenticated for ${pageName}`);
        // #region agent log - auth success details
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'page-initialization-configs.js:auth_success',
            message: 'Authentication successful - proceeding with page initialization',
            data: {
              timestamp: Date.now(),
              page: window.location.pathname,
              pageName: pageName,
              authenticated: true,
              user: authResult.user ? { id: authResult.user.id, role: authResult.user.role } : null,
              tokenPresent: !!authResult.token,
              apiConfigAvailable: typeof window.API_CONFIG !== 'undefined',
              apiWrapperAvailable: typeof window.APIFetchWrapper !== 'undefined'
            },
            sessionId: 'batch_d_auth_debug',
            hypothesisId: 'H1_auth_initialization'
          })
        }).catch(() => {});
        // #endregion
        return true;
      } else {
        // #region agent log - authentication failed
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:authFailed',message:'Authentication failed, redirecting',data:{pageName:pageName,authenticated:false,authResult:authResult,timestamp:Date.now()},sessionId:'debug-session',runId:'redirect_loop_fix',hypothesisId:'redirect_loop_prevention'})}).catch(()=>{});
        // #endregion
        console.log(`❌ [Page Auth] User not authenticated for ${pageName}, redirecting to login`);
        // Redirect to login page
        const currentUrl = window.location.href;
        if (!currentUrl.includes('login.html')) {
          sessionStorage.setItem('login_redirect_url', currentUrl);
        }
        window.location.href = '/login.html';
        return false;
      }
    } catch (error) {
      console.error(`❌ [Page Auth] Authentication check failed for ${pageName}:`, error);
      // #region agent log - auth check exception
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'page-initialization-configs.js:auth_check_exception',
          message: 'Authentication check threw exception',
          data: {
            timestamp: Date.now(),
            page: window.location.pathname,
            error: error.message,
            pageName: pageName,
            hasCheckAuthentication: typeof window.checkAuthentication === 'function'
          },
          sessionId: 'batch_d_auth_debug',
          hypothesisId: 'H1_auth_initialization'
        })
      }).catch(() => {});
      // #endregion
      // On error, redirect to login to be safe
      // #region agent log - auth check error
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'page-initialization-configs.js:auth_check_error',
          message: 'Authentication check failed with error - redirecting to login',
          data: {
            timestamp: Date.now(),
            page: window.location.pathname,
            error: error.message,
            pageName: pageName,
            stackTrace: error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'
          },
          sessionId: 'batch_d_auth_debug',
          hypothesisId: 'H1_auth_initialization'
        })
      }).catch(() => {});
      // #endregion
      window.location.href = '/login.html';
      return false;
    }
  } else {
    console.warn(`⚠️ [Page Auth] checkAuthentication not available for ${pageName}, redirecting to login for safety`);
    // If checkAuthentication is not available, redirect to login to be safe
    window.location.href = '/login.html';
    return false;
  }
}
window.ensureAuthenticatedForPage = ensureAuthenticatedForPage;
