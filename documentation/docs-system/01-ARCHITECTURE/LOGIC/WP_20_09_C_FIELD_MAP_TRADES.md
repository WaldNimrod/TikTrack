# 🗺️ Field Map LOD 400: טריידים ופוזיציות (Trades)
**project_domain:** TIKTRACK

**id:** `WP_20_09_C_FIELD_MAP_TRADES`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.09.C | **מודל:** אגרגציית FIFO (Batch C)

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת טריידים (Trades Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | |
| `entry_execution_ids` | `BIGINT (FK)` | `ULID` | ביצוע כניסה (FIFO). |
| `realized_pnl_amounts`| `NUMERIC(20, 6)` | `Decimal` | P&L ממומש (20,6) — PRECISION_POLICY_SSOT. |