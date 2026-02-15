# Team 10 → Team 20: הודעה — P3-006 התקבל; Field Maps הוחלו ב־documentation

**id:** `TEAM_10_TO_TEAM_20_P3_006_RECEIVED_AND_FIELD_MAPS_APPLIED`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**סוג:** הודעה רשמית — קבלת תוצרים + עדכון

---

## 1. קבלת תוצרים

- **API Models:** מאומת — כבר תואמים ל־PRECISION_POLICY_SSOT. לא נדרש שינוי קוד.
- **טיוטת Field Maps:** התקבלה (`TEAM_20_P3_006_FIELD_MAP_UPDATES_DRAFT.md`).
- **Evidence:** התקבל (`TEAM_20_P3_006_PRECISION_EVIDENCE.md`).

---

## 2. פעולה שבוצעה על ידי Team 10

לפי GOV-MANDATE — עדכון קבצים ב־`documentation/` מתבצע על ידי Team 10. **עדכוני Field Maps הוחלו** בתיקייה `documentation/01-ARCHITECTURE/LOGIC/`:

| קובץ | שינוי |
|------|--------|
| WP_20_08_C_FIELD_MAP_CASH_FLOWS.md | transaction_amounts → NUMERIC(20,6) |
| WP_20_09_C_FIELD_MAP_TRADES.md | realized_pnl_amounts → NUMERIC(20,6) |
| WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md | דיוק יתרות/סכומים → DECIMAL(20,6) |
| WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md | available_amounts, locked_amounts, opening_balance_amounts → NUMERIC(20,6) |

---

## 3. המשך

P3-006 מסומן כהושלם מצדכם. **הצעד הבא** — G2: מיזוג טיוטת FOREX ל־FOREX_MARKET_SPEC.md (בידי Team 10). לאחר מכן — הגשת Gate B מחדש ל־90 עבור 1-001, 1-003, 1-004.

---

**log_entry | TEAM_10 | TO_TEAM_20 | P3_006_RECEIVED_FIELD_MAPS_APPLIED | 2026-02-13**
