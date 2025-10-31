# בדיקה מקיפה - מערכת הכפתורים

## בעיה שזוהתה
כפתור "הוסף תזרים מזומנים" לא עובד

## סיבה
היה חסר טעינת הקובץ `event-handler-manager.js` בעמוד `cash_flows.html`

## פתרון שיושם
הוספתי את הקובץ `event-handler-manager.js` לעמוד cash_flows.html בשורה 166

## בדיקה מקיפה לשאר העמודים

כעת צריך לבדוק שכל העמודים המרכזיים (8 עמודי CRUD) טוענים את event-handler-manager.js:

- [ ] trades.html
- [ ] trading_accounts.html
- [ ] alerts.html
- [ ] executions.html (לפי grep נמצא כבר!)
- [ ] tickers.html
- [ ] cash_flows.html ✅ תוקן
- [ ] trade_plans.html
- [ ] notes.html

## מערכת כפתורים - איך זה אמור לעבוד

1. כפתור עם `data-onclick="showAddCashFlowModal()"` נטען
2. EventHandlerManager שומע ל-click events
3. כשהוא מזהה כפתור עם `data-onclick`, הוא מריץ: `eval(onclickValue)`
4. הפונקציה `showAddCashFlowModal()` מופעלת
5. הפונקציה קוראת ל-`window.ModalManagerV2.showModal('cashFlowModal', 'add')`
6. המודל נפתח

## מה לבדוק עכשיו

1. פתיחת העמוד cash_flows בדפדפן
2. בדיקה שהכפתור "הוסף תזרים מזומנים" עובד
3. בדיקת שאר העמודים
