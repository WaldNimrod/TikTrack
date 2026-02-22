# 🗺️ Field Map LOD 400: טריידים ופוזיציות (Trades)
**project_domain:** TIKTRACK

**סשן:** S20.09 | **מודל:** אגרגציית FIFO (Batch C)

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת טריידים (Trades Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | בעלות חשבונות מסחר. |
| `entry_execution_ids` | `BIGINT (FK)` | `ULID` | ביצוע כניסה (FIFO). |
| `exit_execution_ids` | `BIGINT (FK)` | `ULID` | ביצוע יציאה. |
| `realized_pnl_amounts`| `NUMERIC(20, 8)` | `Decimal` | P&L ממומש בדיוק 20,8. |
| `aggregation_strategy_enums`| `VARCHAR(10)` | `Enum` | FIFO (Default). |
| `is_closed_flags` | `BOOLEAN` | `Boolean` | סטטוס פוזיציות. |