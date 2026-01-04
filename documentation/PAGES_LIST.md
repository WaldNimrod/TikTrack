# רשימת עמודים - TikTrack

**תאריך עדכון:** דצמבר 2025 - עדכון as-made לפי הקוד בפועל  
**גרסה:** 4.2.0  
**סטטוס:** ✅ סטנדרט underscore מיושם בקוד ובתיעוד

---

## ⚠️ כללים חד-משמעיים (CRITICAL)

### ✅ URLs: Snake Case בלבד

כל URLs חייבים להיות ב-**snake_case** (קו תחתון). **אין חריגים.**

### ❌ URLs: ללא .html

**.html אסור בקישורי מערכת ובדיקות.** השתמש ב-URLs נקיים בלבד.

### 📋 חריגים

ראה: `KEBAB_CASE_EXCEPTIONS.md`, `PERMANENT_EXCEPTIONS.md`

---

## ✅ מקור אמת (as-made)

**מקורות:**  

1) `production/trading-ui/*.html` (Runtime build)  
2) `production/Backend/routes/pages.py` (Routes)  
3) `trading-ui/*.html` (Dev source)  
4) `trading-ui/scripts/cross-page-testing-system.js` (User pages group)

**סה״כ קבצי HTML פעילים:** Production: 60, Dev source: 65

### 🟢 עמודי משתמש

| עמוד | כתובת | הערות |
|------|--------|-------|
| **index.html** | `/` | |
| **research.html** | `/research` | |
| **trades.html** | `/trades` | |
| **executions.html** | `/executions` | |
| **alerts.html** | `/alerts` | |
| **trade_plans.html** | `/trade_plans` | |
| **tickers.html** | `/tickers` | |
| **trading_accounts.html** | `/trading_accounts` | |
| **notes.html** | `/notes` | |
| **cash_flows.html** | `/cash_flows` | |
| **trade_history.html** | `/trade_history` | |
| **trading_journal.html** | `/trading_journal` | |
| **ai_analysis.html** | `/ai_analysis` | |
| **watch_lists.html** | `/watch_lists` | |
| **user_profile.html** | `/user_profile` | |
| **user_management.html** | `/user_management` | |
| **ticker_dashboard.html** | `/ticker_dashboard` | |
| **portfolio_state.html** | `/portfolio_state` | |
| **data_import.html** | `/data_import` | |
| **user_ticker.html** | `/user_ticker` | |
| **preferences.html** | `/preferences` | |
| **tag_management.html** | `/tag_management` | |

### 🔵 עמודי אימות

| עמוד | כתובת | הערות |
|------|--------|-------|
| **login.html** | `/login` | |
| **register.html** | `/register` | |
| **forgot_password.html** | `/forgot_password` | |
| **reset_password.html** | `/reset_password` | |

### 🟠 עמודי מוניטור וכלי פיתוח

| עמוד | כתובת | הערות |
|------|--------|-------|
| **background_tasks.html** | `/background_tasks` | |
| **cache_management.html** | `/cache_management` | |
| **chart_management.html** | `/chart_management` | |
| **code_quality_dashboard.html** | `/code_quality_dashboard` | |
| **css_management.html** | `/css_management` | |
| **db_display.html** | `/db_display` | |
| **db_extradata.html** | `/db_extradata` | |
| **designs.html** | `/designs` | |
| **dev_tools.html** | `/dev_tools` | |
| **dynamic_colors_display.html** | `/dynamic_colors_display` | |
| **external_data_dashboard.html** | `/external_data_dashboard` | |
| **init_system_management.html** | `/init_system_management` | |
| **notifications_center.html** | `/notifications_center` | |
| **preferences_groups_management.html** | `/preferences_groups_management` | |
| **server_monitor.html** | `/server_monitor` | |
| **system_management.html** | `/system_management` | |
| **conditions_modals.html** | `/conditions_modals` | |
| **constraints.html** | `/constraints` | |
| **button_color_mapping.html** | `/button_color_mapping` | |
| **crud_testing_dashboard.html** | `/crud_testing_dashboard` | |
| **watch_list.html** | `/watch_list` | |
| **defer_test.html** | `/defer_test` | |

### 🟣 עמודי בדיקות

| עמוד | כתובת | הערות |
|------|--------|-------|
| **test_script_loading.html** | `/test_script_loading` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_phase1_recovery.html** | `/test_phase1_recovery` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_bootstrap_popover_comparison.html** | `/test_bootstrap_popover_comparison` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_overlay_debug.html** | `/test_overlay_debug` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_recent_items_widget.html** | `/test_recent_items_widget` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_phase3_1_comprehensive.html** | `/test_phase3_1_comprehensive` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_unified_widget_comprehensive.html** | `/test_unified_widget_comprehensive` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_user_ticker_integration.html** | `/test_user_ticker_integration` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_ticker_widgets_performance.html** | `/test_ticker_widgets_performance` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_frontend_wrappers.html** | `/test_frontend_wrappers` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_unified_widget.html** | `/test_unified_widget` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_unified_widget_integration.html** | `/test_unified_widget_integration` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_nested_modal_rich_text.html** | `/test_nested_modal_rich_text` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **button_color_mapping_simple.html** | `/button_color_mapping_simple` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **tradingview_widgets_showcase.html** | `/tradingview_widgets_showcase` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_header_only.html** | `/test_header_only` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **conditions_test.html** | `/conditions_test` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **mockups/flag_quick_action.html** | `/mockups/flag_quick_action` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **mockups/watch_lists_page.html** | `/mockups/watch_lists_page` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **mockups/add_ticker_modal.html** | `/mockups/add_ticker_modal` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **mockups/watch_list_modal.html** | `/mockups/watch_list_modal` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_monitoring.html** | `/test_monitoring` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_quill.html** | `/test_quill` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_cash_flow.html** | `/test_cash_flow` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_sorting.html** | `/test_sorting` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_modal_loop.html** | `/test_modal_loop` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_modal_stability.html** | `/test_modal_stability` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_runtime.html** | `/test_runtime` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |
| **test_auth_console.html** | `/test_auth_console` | עמוד משני (תפריט רמה 3 / כלי פיתוח) |

---

> הערה: סעיפי ההיסטוריה הועברו לקובץ ארכיון ייעודי ואינם חלק מהמקור אמת.
