---
id: ADR-017
owner: Architect
status: LOCKED - G-LEAD APPROVED
SV: 1.0.0
---
# 🏰 מנדט אדריכל: השלמות בץ 2.5 (Cumulative Polish)

## 🛠️ 1. יישור גרסאות ל-1.0.0
- חובת הורדת כל גרסאות הקוד (UI, API, DB) מ-2.x ל-1.x.
- המערכת מוגדרת רשמית כדור 1.0 של פיניקס.

## 📊 2. רפקטור עמלות (Account-based Fees)
- סיום המעבר לטבלת trading_account_fees.
- חסימה: אין לאשר עמודי D18/D21 ללא רפקטור נתונים מלא (ADR-014).

## 🔐 3. אבטחה ומשילות
- אכיפת Redirect ל-Home (/) לכל משתמש לא מחובר בכל עמוד שאינו Open.
- User Icon: SUCCESS (מחובר) / WARNING (מנותק). שחור = פסילה.

**log_entry | [Architect] | BATCH_2_5_FINAL_SEAL | GREEN | 13.2.2026, 2:16:58**