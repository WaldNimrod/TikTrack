# Team 20 → Team 10: דוח השלמת ADR-015

**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מנדט:** TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md  
**סטטוס:** ✅ **הושלם**

---

## 1. סיכום ביצוע

| דרישה (§2) | סטטוס | תוצר |
|------------|--------|------|
| **§2.1** הרחבת GET /reference/brokers | ✅ | display_name, is_supported, default_fees; "other" עם is_supported=false |
| **§2.2** DB/API עמלות לפי חשבון | ✅ | trading_account_id; הסרת broker; commission_value NUMERIC(20,6) |
| **§2.3** מיגרציה Account↔Fees | ✅ | סקריפט + תיעוד; נמסר ל-Team 60 |

---

## 2. קבצים עודכנו/נוצרו

### מיגרציה
| קובץ | תיאור |
|------|--------|
| `scripts/migrations/adr_015_brokers_fees_trading_account_id.sql` | סקריפט מיגרציה — trading_account_id, הסרת broker |
| `scripts/migrations/README_ADR_015_MIGRATION.md` | הוראות הרצה ואימות |

### תאום Team 60
| קובץ | תיאור |
|------|--------|
| `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_ADR_015_MIGRATION_SCRIPT_DELIVERY.md` | מסירת סקריפט + נוהל הרצה |

### Backend
| קובץ | תיאור |
|------|--------|
| `api/models/brokers_fees.py` | trading_account_id; הסרת broker |
| `api/schemas/brokers_fees.py` | BrokerFeeCreateRequest/UpdateRequest: trading_account_id |
| `api/services/brokers_fees_service.py` | לוגיקה לפי trading_account_id |
| `api/routers/brokers_fees.py` | trading_account_id ב-create/update/summary |
| `api/schemas/reference.py` | BrokerReferenceItem: display_name, is_supported, default_fees |
| `api/data/defaults_brokers.json` | מבנה חדש + IBKR (3 עמלות) + "other" |
| `api/services/reference_service.py` | מקור: trading_accounts.broker; מבנה ADR-015 |

---

## 3. שינויי חוזה API — Team 30

### GET /api/v1/reference/brokers
**לפני:** `{ "value": "...", "label": "..." }`  
**אחרי:** `{ "value": "...", "display_name": "...", "label": "...", "is_supported": bool, "default_fees": [...] }`

- **label** נשמר (alias ל-display_name) — תאימות לאחור ל-D16/D18
- נוספו **display_name**, **is_supported**, **default_fees**
- פריט **"other"** — value: `"other"`, is_supported: false

---

## 4. צעדים הבאים

| צוות | צעד |
|------|------|
| **Team 60** | הרצת מיגרציה לפי TEAM_20_TO_TEAM_60_ADR_015_MIGRATION_SCRIPT_DELIVERY.md |
| **Team 30** | עדכון D16/D18 להתאמה לחוזה החדש (display_name, default_fees) |

---

## 5. SSOT / רפרנסים

- **DDL:** documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
- **תוכנית:** TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md
- **הודעת משילות:** documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md

---

**Team 20 (Backend)**  
**log_entry | ADR_015 | COMPLETION_REPORT | TO_TEAM_10 | 2026-02-12**
