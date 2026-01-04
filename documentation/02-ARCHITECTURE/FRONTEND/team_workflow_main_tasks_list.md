# Team Workflow Main Tasks List

purpose: single, fixed master task list for team_0 orchestration
owner: team_0
status: active
source_of_truth: documentation/02-ARCHITECTURE/FRONTEND/team_workflow_main_tasks_list.md
archived_reference: documentation/05-REPORTS/ARCHIVE/CRUD_TESTING_INTEGRATION_MASTER_PLAN_2026_01_01.md

## usage_rules

- this file is the master task list (fixed, not daily)
- daily team files include the current subset of tasks from this file
- team_0 updates this file continuously based on priority changes

## current_priorities

0) task_0_option1_load_order_discipline ✅ COMPLETED - Task 1 unblocked, Cache Stage B-Lite ready
1) init_loading_full_78_pages_stability ✅ COMPLETED - ready for cache_stage_b_lite
2) remove_iframe_remaining_usage ✅ COMPLETED - runtime verification passed
3) remove_iframe_remaining_usage
4) additional_crud_pages_completion
5) crud_final_closures_and_regression
6) homepage_widgets_cleanup
7) data_import_end_to_end_process
8) crud_testing_dashboard_full_test_suite
9) itcss_compliance_audit_post_init

## current_tasks_detail

0) task_0_option1_load_order_discipline
   - scope: enforce Option 1 auth discipline through unified loading system (manifest + page configs + init checks)
   - owner: team_0 (integration) + team_a (auth/core) + team_f (monitoring) + team_d (QA) + team_e (docs)
   - deliverables:
     1) static audit of manifest + page configs for auth load order and missing auth package
     2) runtime QA for auth redirect-only behavior (no modal) across public/auth/monitor groups
     3) enforcement gate: fail init when auth order or auth package is missing for protected pages
     4) single SOT list for PUBLIC_PAGES used by auth-guard + init classification
     5) evidence pack with file paths + QA results
   - intermediate_steps:
     1) confirm manifest load order: auth before header, init-system last
     2) list pages missing auth package in page-initialization-configs.js
     3) validate protected pages include auth package and auth guard load order 23-24
     4) add monitoring gate to treat missing auth package as FAIL (no warn-only)
     5) re-run QA on dev port 8080 and update matrix
   - acceptance:
     - auth package present for all protected pages in page configs
     - public pages list aligned across auth-guard and init system
     - no login modal usage; redirect-only flow verified by QA
     - monitoring shows 0 load-order violations for auth/header
   - status_notes:
     - evidence: documentation/05-REPORTS/artifacts/2026_01_03/team_0__task_0_option1_load_order_audit__evidence_manifest_page_configs.json
     - monitoring_evidence: documentation/05-REPORTS/artifacts/2026_01_03/option1_load_order_discipline_monitoring_evidence.json
     - qa_failure_evidence: documentation/05-REPORTS/artifacts/2026_01_03/team_d_option1_load_order_discipline_qa_2026-01-03T19-40-51.json
     - backend_alignment_evidence: documentation/05-REPORTS/artifacts/2026_01_03/team_c_task_0_option1_load_order_backend_auth_alignment_check_2026_01_03.json
     - backend_fix_evidence: documentation/05-REPORTS/artifacts/2026_01_03/team_c_task_0_system_catalog_endpoints_public_fix_evidence_2026_01_03.json
     - ui_reverification_evidence: documentation/05-REPORTS/artifacts/2026_01_03/team_b_auth_pages_reverification_2026_01_03.json
     - groupings_evidence: documentation/05-REPORTS/artifacts/2026_01_03/option1_load_order_qa_groupings.json
     - modal_cleanup_evidence: documentation/05-REPORTS/artifacts/2026_01_03/team_b_comprehensive_modal_cleanup_final_report_2026_01_03.json
     - code_level_mapping: documentation/05-REPORTS/artifacts/2026_01_04/team_0__task_0_code_level_violation_mapping.json
     - code_level_fixes: documentation/05-REPORTS/artifacts/2026_01_04/team_b_code_level_fixes_applied_2026_01_04.json
     - broken_script_tag_fixes: documentation/05-REPORTS/artifacts/2026_01_04/team_b_broken_script_tags_fixed_2026_01_04.json
     - backend_phase1_fix: documentation/05-REPORTS/artifacts/2026_01_03/team_c_monitor_endpoints_public_fix_evidence_2026_01_03.json
     - current_status: All pages reported PASS; awaiting final QA evidence before Post-Green Checklist and scope expansion.
     - focus_evidence: documentation/05-REPORTS/artifacts/2026_01_04/team_0_focus_6_pages_mapping_2026_01_04.json
     - action_plan: documentation/05-REPORTS/FOCUS_6_PAGES_ACTION_PLAN_2026_01_04.md
     - group_b_fixes: documentation/05-REPORTS/artifacts/2026_01_04/team_0_group_b_timeout_reduction_db_system_management_2026_01_04.json
     - group_b_watch_conditions_fixes: documentation/05-REPORTS/artifacts/2026_01_04/team_0_group_b_direct_fixes_watch_list_conditions_modals_2026_01_04.json
     - group_4_user_profile_fix: documentation/05-REPORTS/artifacts/2026_01_04/team_0_group_4_user_profile_globals_fix_2026_01_04.json

1) auth_architecture_option1_alignment
   - scope: standardize auth storage to UnifiedCacheManager SessionStorageLayer only (no login modal; redirect to /login.html only)
   - owner: team_0 (integration) + team_e (documentation) + team_d (QA)
   - deliverables:
     1) architecture_summary (single source of truth) describing:
        - auth storage: SessionStorageLayer via UnifiedCacheManager
        - bootstrap keys: dev_authToken/dev_currentUser (sessionStorage only)
        - redirect-only flow: /login.html, no modal
        - public pages list and guard behavior
     2) documentation updates:
        - authentication implementation guide
        - auth debugging guide
        - security guidelines (redirect-only)
        - testing checklist (auth storage + cache clearing impact)
     3) code alignment checklist (no code changes unless docs are approved):
        - remove localStorage authToken/currentUser usage
        - remove any modal login references
        - ensure redirect guards skip /login.html
     4) QA plan:
        - clean unauthenticated flow (redirect to /login.html)
        - authenticated flow after login (no redirect loop)
        - cross-tab consistency (sessionStorage only)
        - cache clear scenarios (auth preserved/cleared as expected)
   - acceptance:
     - documentation matches code behavior and storage policy
     - authToken/currentUser never stored in localStorage
     - no login modal usage anywhere in code or docs
     - QA evidence on dev port 8080 confirms redirect-only and no loop
   - status_notes:
     - dependency: finalize architecture decision (Option 1 confirmed)
     - blocking: do not change code until docs updated and approved

2) init_loading_full_78_pages_stability ✅ COMPLETED
   - scope: verify init/loading across all 78 pages with monitoring guardrails
   - deliverables: full page map, missing_globals list, load_order issues, confirmed fixes ✅ DELIVERED
   - acceptance: 0 critical init/loading blockers on any page ✅ MET
   - failure_subtasks (rolling): 5 subtasks active, non-critical
     1) Fix header-system.js syntax error (Unexpected token ';') blocking header render
     1.1) Fix header-system.js unexpected end of input (missing closure)
     2) Resolve PageStateManager duplicate declaration (bundle conflict)
     3) Fix cross-page-testing-system.js syntax error
     4) Homepage content mismatch (cash flow module shown instead of dashboard)
     5) Remove auth guard TEST MODE fallback in production paths
     6) Enforce redirect to login page only (no login modal usage)
     7) Login modal deprecated: remove references and usage in code/docs
     8) Remove api-fetch-wrapper TEST MODE skip redirect and modalId undefined in auth.js
     9) Define/verify showLoginRequiredMessage and graceful degradation for widgets
     10) Resolve loadEntityColors undefined (verify export mapping)
     11) QA environment for auth-required flows must be dev port 8080 (production is separate branches/folders)
     12) Fix auth redirect loop on homepage (ensure window.authToken/currentUser bootstrap)
     13) Remove redundant local auth checks in user pages (use ensureAuthenticatedForPage only) to prevent redirect loops (e.g., user-profile.js)
   - status_notes:
     - scope_confirmed: 67 app pages (test/mockups excluded)
     - p0_pages: strategy_analysis (pass), chart_management (pass), external_data_dashboard (pass)
     - evidence: documentation/05-REPORTS/INIT_LOADING_FULL_PAGE_MATRIX_2026_01_01.md; focused_api_results.json > task_1_p0_team_f_alignment_mime_verification
     - next: continue init/loading verification for remaining pages; align Team F monitoring notes (ui-basic.js reference)
   - owner: team_f

3) remove_iframe_remaining_usage
   - scope: remove any remaining iframe usage in testing flows and dashboard utilities
   - deliverables: code scan report + runtime verification that tests run in main window
   - acceptance: 0 iframe usage in testing code; logger evidence for main-window execution
   - status_notes:
     - code_changes_reported: iframe references removed or disabled via USE_IFRAMES=false
     - evidence: documentation/05-REPORTS/artifacts/2026_01_02/task2_iframe_runtime_verification.txt
     - status: GREEN - runtime verification confirms main-window execution
   - owner: team_a/team_b/team_d

4) additional_crud_pages_completion
   - scope: complete remaining crud pages not yet covered
   - pages: tag_management, database_page_entities, helper_tables_page_entities
   - deliverables: per-page coverage notes + logger/network evidence + qa results
   - acceptance: each page passes CRUD checks without duplicate coverage
   - status_notes:
     - api_db_ready: team_c reports curl 201/400 for tag, tag_category, currency, trading_method
     - qa_state: team_d reported failures; fail list captured in documentation/05-REPORTS/artifacts/2026_01_02/fail_list_additional_crud_entities_2026_01_02.json
   - owner: team_a/team_b/team_c/team_d

5) crud_final_closures_and_regression
   - scope: close remaining crud scope (trading_journal) and run final regression
   - deliverables: qa reports + logger/network evidence for remaining entities
   - acceptance: all remaining entities pass and final regression green
   - status_notes:
     - blocked_by: task_1_init_loading_p0 + task_3_additional_crud_pages_completion
   - owner: team_a/team_b/team_c/team_d

6) homepage_widgets_cleanup
   - scope: widget issues on homepage after core stability
   - deliverables: list of widget defects + fixes + verification notes
   - acceptance: homepage widgets render without blocking errors
   - owner: team_b (ui) + team_a (integration)

7) data_import_end_to_end_process
   - scope: long process track for data_import workflows
   - deliverables: end_to_end test plan + validation mapping + qa evidence
   - acceptance: complete workflow passes with documented evidence
   - owner: team_c/team_d

8) crud_testing_dashboard_full_test_suite
   - scope: complete all non-crud test suites on the CRUD testing dashboard
   - deliverables: per-test checklist + logger evidence + qa results for each test group
   - acceptance: all dashboard test groups pass; no iframe usage; no blocking console errors
   - owner: team_a/team_b/team_d (support: team_f for init/loading stability)

   stages:
   - stage_5_1_inventory_and_baseline
     - map all dashboard test groups and buttons
     - capture baseline failures with logger-only evidence
   - stage_5_2_table_sorting_and_sections
     - fix and validate table_sorting_tests
     - fix and validate sections_open_close_tests
   - stage_5_3_defaults_and_info_summary
     - fix and validate defaults_application_tests
     - fix and validate info_summary_element_tests
   - stage_5_4_dynamic_colors_and_filters
     - fix and validate dynamic_colors_tests
     - fix and validate header_filters_and_internal_filters_tests
   - stage_5_5_testing_tools_and_final_pass
     - fix and validate testing_tools_suite
     - run full dashboard test suite and confirm all tests green

9) itcss_compliance_audit_post_init
   - scope: enforce ITCSS compliance for official pages only (exclude test pages per PAGES_LIST)
   - deliverables: CSS layer audit + removal/relocation plan + verification evidence
   - acceptance: no ITCSS violations or extra CSS files outside defined layers
   - status_notes:
     - blocked_by: init_loading_full_78_pages_stability (run only after pages load correctly)
   - owner: team_a/team_c (support: team_e for documentation)

## stage_1_tasks_before_stage_2

1) clean_console_errors_on_testing_page
2) remove_iframe_and_all_references_in_testing_code
3) scan_duplicate_testing_code_and_cleanup
4) add_jsdoc_for_testing_code
5) add_index_functions_for_testing_code
6) enforce_logger_only_evidence
7) confirm_unifiedpayloadbuilder_is_sot
8) focused_run_trade_plan_and_cash_flow_2_2_pass
9) update_daily_reports_and_master_plan_with_evidence

## open_items_init_loading

1) fix_condition_operator_enum_mismatch_in_frontend
2) investigate_color_scheme_system_script_halt_and_dom_wipe
3) collect_aligned_runtime_evidence_from_team_a_f_b_same_environment
4) verify_defer_attributes_and_script_loading_chain_end_to_end
5) document_loading_failure_point_and_resolution

## stage_2_entity_batches

batch_1: executions + trading_accounts
batch_2: tickers + trades
batch_3: notes + alerts
batch_4: user_profile + watch_lists
batch_5: trading_journal + (tbd)

## future_long_process_tasks

1) data_import_end_to_end_process (separate future track; full workflow + validation)

## ownership_map

- team_a: testing code structure, iframe removal, jsdoc, index_functions
- team_b: ui validation, logger_only enforcement, duplicate cleanup
- team_c: backend readiness, constraints validation
- team_d: focused qa runs (trade_plan, cash_flow)
- team_e: documentation updates and daily files
- team_f: init/loading verification and monitoring

## last_update

- date: 02.01.26
