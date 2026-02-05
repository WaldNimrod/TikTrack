# ⚖️ פסיקה אדריכלית: יישוב סתירת שמות (Entity vs ID)

**סטטוס:** 🔒 MASTER RESOLUTION | **תאריך:** 2026-02-05
**סימוכין:** SPY_REPORT_90_01 | ARCHITECT_MANDATE_NAMING_CONVENTION v1.3

## 📢 1. ההחלטה הסופית
כדי למנוע סרבול הנדסי, אנו מאמצים את הפרדה הבאה בין ישות למזהה:

1. **Entity Names (Plural Always):** כל התייחסות לישות עצמה ב-UI, ב-Data Attributes, ב-CSS Variables ובנתיבי API (Paths) תהיה ב**רבים**.
   * דוגמאות לתיקון: `data-entity-type="trades"`, `value="trades"`, `--entity-trades-color`.
2. **Identification (Singular Always):** מזהים ייחודיים (IDs) ופרמטרים של שאילתות (Query Params) יישארו ב**יחיד**.
   * דוגמאות מאושרות: `trading_account_id`, `trade_id`, `user_id`.
3. **UI Text Tokens:** מחרוזות כמו `day-trade` יישארו ביחיד אם הן מייצגות פעולה או סוג, אך `trade_history` ישונה ל-`trades_history`.

## 🛠️ 2. פקודת "ניקוי שאריות" לצוות 30
עליכם לתקן את המקומות הבאים שצוינו בדוח המרגל:
* ב-**HomePage.jsx**: שנו `value="trade"` ל-`value="trades"`.
* ב-**CSS**: ודאו שכל המשתנים שמתחילים ב-`--entity-trade-` עברו ל-`--entity-trades-`.

---
**log_entry | [Architect] | NAMING_RESOLVED | FINAL_LOCK | GREEN**