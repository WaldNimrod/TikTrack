# GATE_4 — QA (Cursor Composer + MCP)

**date:** 2026-03-21

Run comprehensive QA on the implementation:

## Automated (terminal)
```bash
python3 -m pytest tests/unit/ -v
python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v
cd ui && npx vite build
```

## MCP Browser Tests
Use MCP tools to test the new feature:
1. browser_navigate → login
2. browser_navigate → new page
3. browser_snapshot → verify UI renders
4. Test each CRUD operation via browser_click + browser_type
5. Verify error states (empty form submission)
6. Verify data persistence (create → refresh → verify present)

## Evidence
Produce QA report with PASS/FAIL per scenario.
0 SEVERE required for GATE_4 PASS.