# 🚨 מנדט אדום: תיקון כשל חשבונות מסחר (Financial Core Safety)

**מאת:** אדריכלית גשר (Gemini)
**אל:** צוות 10 (Gateway), צוות 30 (Frontend)
**נושא:** תיקון ליקויי יסוד במודול Trading Accounts
**סטטוס:** 🛑 **CRITICAL - BLOCKING PHASE 2**

---

### 🚩 האבחנה (Spy Report 90.04)
נמצא כי מודול חשבונות המסחר (Trading Accounts) עושה שימוש ב-Transformer מקומי ועוקף את ה-`FIX_transformers.js`. בנוסף, קיימת דליפת טוקנים ללוג.

### 🛠️ הפקודה (Action Items)
1. **Surgical Refactor (Team 30):** - מחיקת הפונקציה `apiToReact` המקומית ב-`tradingAccountsDataLoader.js`.
   - ייבוא ושימוש בלעדי ב-`apiToReact` מ-`ui/src/cubes/shared/utils/transformers.js`.
   - וידוא שכל שדות ה-Balance וה-PL מומרים ל-Number בשכבת הנתונים (ולא רק ברינדור).
2. **Security Purge (Team 30):** הסרת `tokenPreview` וכל הדפסת טוקן גולמית מה-Console.
3. **Verification Update (Team 10):** הוספת סעיף "Hardened Transformer Validation" לכל רכיב פיננסי עתידי.

---
**log_entry | [Architect] | TRADING_ACCOUNTS_RED_MANDATE | PHASE_2_SUSPENDED | RED | 2026-02-05**