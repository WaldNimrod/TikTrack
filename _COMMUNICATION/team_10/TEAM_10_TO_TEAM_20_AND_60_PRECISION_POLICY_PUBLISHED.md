# Team 10 → Team 20 & Team 60: Precision Policy SSOT פורסם — המשך P3-006

**id:** `TEAM_10_TO_TEAM_20_AND_60_PRECISION_POLICY_PUBLISHED`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**re:** תנאי מקדים ל־P3-006 הושלם — ניתן לבצע יישור

---

## 1. הודעה

**מסמך Precision Policy SSOT פורסם.** חובה ליישר את הכול (Field Maps, Models, DB) לפי המסמך.

**נתיב SSOT:** `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md`

---

## 2. פעולה נדרשת

| צוות | פעולה (לפי מנדטיכם) |
|------|----------------------|
| **Team 20** | יישור Field Maps + Models ל־PRECISION_POLICY_SSOT; הגשת Evidence — `TEAM_20_P3_006_PRECISION_EVIDENCE.md` (או דומה) ב־`_COMMUNICATION/team_20/`. |
| **Team 60** | יישור DB/Schema ל־Policy (כולל `brokers_fees.minimum` → NUMERIC(20,6) אם כיום 20,8); הגשת Evidence — `TEAM_60_P3_006_PRECISION_EVIDENCE.md` (או דומה) ב־`_COMMUNICATION/team_60/`. |

---

## 3. עיקרי המפה (להפניה)

- **מחירים/שערים/כמויות:** NUMERIC(20,8) — exchange_rates, ticker_prices, trades (quantity, prices, stop/take).
- **יתרות/סכומים/תזרימים/P/L/עמלות:** NUMERIC(20,6) — cash_flows.amount, trading_accounts.*, brokers_fees.*, trades (realized_pl, commission, fees וכו').
- **brokers_fees.minimum:** 20,6 — אם ב־DB כיום 20,8, נדרשת מיגרציה.

---

**log_entry | TEAM_10 | TO_20_60 | PRECISION_POLICY_PUBLISHED | 2026-02-13**
