# 📊 Field Inventory: Tickers Entity (D-05)
**project_domain:** TIKTRACK
**Session:** S10.01 | **Team:** 10

## 1. Core Fields
| Field | Type | UI Component | Logic |
| :--- | :--- | :--- | :--- |
| ticker_symbol | String | Badge | Primary Key |
| company_name | String | Label | Market Display |
| current_price | Decimal | LTR Text | Port 8080 |

## 2. Business Logic
- Trend detection based on price_change_pct.
- GAS Bridge integration for real-time updates.