# Init/Loading Target Spec - Manifest Loader Only

status: draft
owner: team_0
editor: team_e
read_only: teams_a_b_c_d_f
source_of_truth: this file

## purpose
Define the final target state for init/loading: manifest-generated, loader-only, per-page entry, no direct script loading.

## non_goals
- No partial migration plan here.
- No backward compatibility for manual script loading in production pages.

## target_state_summary
- Manifest is generated at build time and is the only source of truth.
- HTML pages load only the loader and the manifest (no direct page scripts).
- Loader selects per-page entry and loads dependencies in order.
- Development/testing pages are allowed to load extra scripts only when explicitly flagged.
- Violations are surfaced immediately (UI banner + logger + matrix flag).

## definitions
- manifest: build-generated JSON describing page entries, deps, and load order.
- loader: the only script allowed to orchestrate script loading at runtime.
- production page: page_mode=production (no extra scripts allowed).
- development/testing page: page_mode=development|testing (extra scripts allowed but flagged).

## architecture
### html contract
Each page must contain only:
- loader.js (single entry)
- manifest.json (or manifest.js that exports JSON)
- optional page meta (data attributes for page key)

No other <script src="..."> tags are permitted in production pages.

### loader responsibilities
- Resolve page key from <meta name="page-key"> or body data attribute.
- Read manifest and locate page entry.
- Load required bundles/modules in the exact manifest order.
- Verify required globals after load (per entry).
- Detect non-manifest script tags and decide enforcement outcome.

### manifest schema (example)
```json
{
  "version": "1.0.0",
  "generated_at": "2026-01-04T14:00:00Z",
  "pages": {
    "preferences": {
      "page_mode": "production",
      "entry": "scripts/pages/preferences.entry.js",
      "deps": [
        "scripts/core/base.js",
        "scripts/core/auth.js",
        "scripts/core/header.js",
        "scripts/core/init-system.js"
      ],
      "required_globals": ["TikTrackAuth", "UnifiedAppInitializer"],
      "allow_extra_scripts": false
    },
    "dev_tools": {
      "page_mode": "development",
      "entry": "scripts/pages/dev_tools.entry.js",
      "deps": ["scripts/core/base.js"],
      "required_globals": ["UnifiedAppInitializer"],
      "allow_extra_scripts": true
    }
  }
}
```

### development/testing flag rules
- page_mode=development|testing allows extra scripts but triggers a YELLOW warning.
- page_mode=production disallows extra scripts; any violation triggers RED.
- allow_extra_scripts must be false in production pages.

## enforcement policy
### runtime
- if production page loads any non-manifest script:
  - show RED banner: "INIT LOADING VIOLATION"
  - log error event: INIT/LOAD_ORDER_VIOLATION
  - mark matrix as FAIL
- if development/testing page loads extra scripts:
  - show YELLOW banner: "DEV PAGE OVERRIDE"
  - log warning event: INIT/DEV_PAGE_OVERRIDE

### logging requirements
- log payload fields:
  - page_key, page_mode, extra_script_urls, manifest_hash, timestamp
- logger event IDs:
  - INIT/LOAD_ORDER_VIOLATION
  - INIT/DEV_PAGE_OVERRIDE
  - INIT/MISSING_REQUIRED_GLOBAL

### CI enforcement
- block PRs that add direct <script src="scripts/.."> tags in production pages.
- allow dev/testing pages only when page_mode is set and allow_extra_scripts=true.

## acceptance criteria
- 100% pages use loader-only contract.
- manifest is generated and versioned on every build.
- any deviation is visible in UI + logger + matrix.
- dev/testing pages are explicitly flagged and visible.

## open_items
- finalize manifest generator location (build script name).
- decide loader file path and naming convention.
