# 🗺️ Field Map LOD 400: מנוע חוקים (Playbooks)
**project_domain:** TIKTRACK

**סשן:** S20.09.C | **סטטוס:** תיקון מבנה rules_json (Mandatory)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)` (G-03).

## 2. סכימת פלייבוקים (Playbooks Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `playbook_names` | `VARCHAR(100)` | `String` | שם האסטרטגיה. |
| `rules_json` | `JSONB` | `Object` | **מבנה חוקים מפורט (ראה מטה).** |
| `target_rr_ratios` | `NUMERIC(20, 8)` | `Decimal` | יחס RR יעד. |

## 3. מבנה rules_json (LOD 400 Specification)
אובייקט ה-JSONB חייב להכיל את המפתחות הבאים:
```json
{
  "entry_criteria": {
    "indicators": ["RSI", "EMA_200"],
    "logic_operator": "AND"
  },
  "exit_criteria": {
    "stop_loss_pct": 2.5,
    "take_profit_pct": 7.5
  },
  "risk_management": {
    "max_position_size_pct": 10.0,
    "trailing_stop_enabled": true
  }
}
```