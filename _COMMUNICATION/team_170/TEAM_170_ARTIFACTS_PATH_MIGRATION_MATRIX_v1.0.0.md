# TEAM 170 — מטריצת מיגרציה: נתיבי ארטיפקטים (remediation Team 190 BLOCK)
## Document: TEAM_170_ARTIFACTS_PATH_MIGRATION_MATRIX_v1.0.0.md

**From:** Team 170
**To:** Team 190, Team 10
**date:** 2026-02-19
**purpose:** מטריצה מלאה — producers/consumers של נתיבי documentation/05-REPORTS → documentation/reports/05-REPORTS

---

## Code (updated to canonical)

| קובץ | סוג | סטטוס |
|------|-----|--------|
| tests/gate-b-e2e.test.js | consumer | UPDATED |
| tests/phase1-completion-b-validation.test.js | consumer | UPDATED |
| tests/flow-type-ssot-e2e.test.js | consumer | UPDATED |
| tests/external-data-live-ui-evidence-capture.e2e.test.js | consumer | UPDATED |
| scripts/team_50_generate_corroboration_v207.py | producer/consumer | UPDATED |
| scripts/team_50_generate_corroboration_v208.py | producer/consumer | UPDATED |
| scripts/team_50_generate_corroboration_v209.py | producer/consumer | UPDATED |
| scripts/team_50_verify_g7_v207_corroboration_prereqs.py | consumer | UPDATED |
| scripts/team_50_verify_g7_v208_corroboration_prereqs.py | consumer | UPDATED |
| scripts/team_50_verify_g7_v209_corroboration_prereqs.py | consumer | UPDATED |
| scripts/team_50_verify_timestamp_in_et_window.py | consumer | UPDATED |
| scripts/run_g7_cc01_v207_market_open.sh | producer | UPDATED |
| scripts/run_g7_cc01_v208_market_open.sh | producer | UPDATED |
| scripts/run_g7_cc01_v209_market_open_window.sh | producer | UPDATED |
| scripts/run_g7_part_a_evidence.py | producer | UPDATED |
| scripts/verify_g7_part_a_runtime.py | consumer | UPDATED |
| scripts/run-md-settings-403-evidence.sh | consumer | UPDATED |
| scripts/seed_base_test_user.py | ref | UPDATED |
| agents_os/validators/spec/tier2_section_structure.py | consumer (LLD400/LOD200) | UPDATED → 06-TEMPLATES |

## Validator (templates path)

| קובץ | מיקום ישן | מיקום חדש | סטטוס |
|------|-----------|-----------|--------|
| tier2_section_structure.py | AGENTS_OS_GOVERNANCE/02-TEMPLATES | 06-TEMPLATES | UPDATED |

## Documentation (updated)

| קובץ | סטטוס |
|------|--------|
| documentation/docs-system/01-ARCHITECTURE/FOREX_MARKET_SPEC.md | UPDATED |
| documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md | UPDATED |

## Residual (archived / legacy — לא מעודכן)

הפניות ב־_COMMUNICATION/99-ARCHIVE ו־archive/documentation_legacy — היסטוריות; לא מעודכנות לקנון.

---

**residual_active:** 0 (all code + active docs updated)
