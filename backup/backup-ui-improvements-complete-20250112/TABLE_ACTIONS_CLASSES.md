# מחלקות עמודת פעולות לטבלאות

## 🎯 הגדרות רוחב לפי מספר כפתורים

### מחלקות CSS:
- `.actions-1-btn` - 60px (1 כפתור)
- `.actions-2-btn` - 80px (2 כפתורים)  
- `.actions-3-btn` - 120px (3 כפתורים)
- `.actions-4-btn` - 160px (4 כפתורים)
- `.actions-5-btn` - 200px (5 כפתורים)

### שימוש:
```html
<th class="col-actions actions-cell actions-3-btn">פעולות</th>
<td class="col-actions actions-cell actions-3-btn">...</td>
```

### חישוב רוחב:
- כפתור אחד: 28px + margin 4px = 32px
- 1 כפתור: 60px (32px + padding 28px)
- 2 כפתורים: 80px (64px + padding 16px)
- 3 כפתורים: 120px (96px + padding 24px)
- 4 כפתורים: 160px (128px + padding 32px)
- 5 כפתורים: 200px (160px + padding 40px)

### עמודים עם טבלאות:
1. `cash_flows.html` - 3 כפתורים (קישור + עריכה + מחיקה)
2. `trades.html` - TBD
3. `executions.html` - TBD
4. `accounts.html` - TBD
5. `alerts.html` - TBD
6. `tickers.html` - TBD
7. `trade_plans.html` - TBD
8. `db_display.html` - TBD
9. `db_extradata.html` - TBD
10. `test-header-only.html` - TBD

### עדכון:
כדי לעדכן רוחב עמודת פעולות, שנה את המחלקה ב-HTML ו-JavaScript:
- HTML: `<th class="col-actions actions-cell actions-X-btn">`
- JavaScript: `<td class="col-actions actions-cell actions-X-btn">`
