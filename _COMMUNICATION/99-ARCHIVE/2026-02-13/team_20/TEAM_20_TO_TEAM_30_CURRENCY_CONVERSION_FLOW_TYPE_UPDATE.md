# Team 20 → Team 30: עדכון — CURRENCY_CONVERSION flow_type

**מאת:** Team 20 (Backend)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**הקשר:** מזהה ברור להמרת מטבע — לא להשתמש ב-OTHER

---

## 1. סיכום השינוי

הוספנו `flow_type` ייעודי **`CURRENCY_CONVERSION`** להמרת מטבע (במקום OTHER).

---

## 2. עדכונים שכבר בוצעו בקוד

| קובץ | שינוי |
|------|-------|
| `ui/src/views/financial/cashFlows/cashFlowsForm.js` | הוספת אופציה "המרת מטבע" (CURRENCY_CONVERSION) בתפריט סוג תנועה |
| `ui/src/views/financial/cashFlows/cash_flows.html` | הוספת אופציה בסינון flowType |
| `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` | הוספת תווית "המרת מטבע" ב-flowTypeLabels |
| `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` | הוספת CURRENCY_CONVERSION ל-flowTypeLabels |

---

## 3. מה נדרש מצדכם

- **אין פעולה נדרשת** — השינויים בוצעו.
- **וידוא:** לאחר הרצת מיגרציה — לבדוק ש-D21 מציג תזרימי המרה, ושניתן להוסיף תזרים מסוג "המרת מטבע".

---

## 4. ערך חדש ב-API

```
flow_type: "CURRENCY_CONVERSION"
```

תצוגה בעברית: **המרת מטבע**.

---

**log_entry | TEAM_20 | CURRENCY_CONVERSION_FLOW_TYPE_UPDATE | TO_TEAM_30 | 2026-02-12**
