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

1) keep init/loading stable with monitoring guardrails (team_f)
2) confirm remaining crud scope not yet validated (trading_journal)
3) continue entity batches (two at a time) with full mapping + validation
4) run final regression after each batch
5) low priority: homepage widget issues after core stability

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

- date: 01.01.26
