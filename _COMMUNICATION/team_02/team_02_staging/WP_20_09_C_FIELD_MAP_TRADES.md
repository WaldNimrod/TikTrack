# 🗺️ Field Map LOD 400: טריידים ופוזיציות (Trades)
**project_domain:** TIKTRACK

**סשן:** S20.09.C | **מודל:** אגרגציית FIFO (Batch C)

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת טריידים (Trades Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | |
| `entry_execution_ids` | `BIGINT (FK)` | `ULID` | ביצוע כניסה (FIFO). |
| `realized_pnl_amounts`| `NUMERIC(20, 8)` | `Decimal` | P&L ממומש (20,8). |