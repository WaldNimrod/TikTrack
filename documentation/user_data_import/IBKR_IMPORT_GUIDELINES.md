# 📄 מסמך הנחיות – ייבוא נתונים מ-IBKR (CSV) למערכת TikTrack

## ייבוא מדויק של תנועות כספיות אמיתיות בלבד

---

## 🎯 מטרת המסמך

להגדיר בצורה מלאה:

* אילו נתונים מייבאים מה-CSV של Interactive Brokers (IBKR)
* אילו נתונים מתעלמים מהם (כי אינם תנועות כסף אמיתיות)
* מה ההבדל בין דוח PDF/HTML לבין קובץ CSV
* איך TikTrack צריכה לחשב יתרות, עמלות, תזרים ורווח/הפסד
* איך למנוע טעויות בהשוואה מול "Totals" של IBKR

---

# 1. ✔ עיקר המסקנה

## ה-CSV של IBKR כולל רק תנועות כסף אמיתיות (Real Cash Movements)

ולכן:

### ✔ ניתן לבסס עליו ייבוא אמין, מדויק ויציב

### ✔ יש להציג למשתמש רק תנועות אמיתיות

### ✔ יש להתעלם לחלוטין מתנועות חשבונאיות פנימיות של IBKR (שאינן Cash)

---

# 2. ⚠ ההבדל המהותי: PDF ≠ CSV

## מה ה-PDF של IBKR מציג?

דוח PDF/HTML של IBKR מכיל:

* חישובי NAV
* FX Translation Gain/Loss
* Accrual Rollovers
* Internal Adjustments
* סיכומי דוח (Totals)
* סיכומי Cash Detail לפי מטבע
* הערכות חשבונאיות שונות
* Consolidations (עמלות ברמת חשבון, לא ברמת טרייד)

## מה ה-CSV מציג?

רק רשומות Raw אמיתיות:

* תנועות כסף שנכנסו או יצאו
* דיבידנדים אמיתיים
* מס במקור
* עמלות מסחר פר עסקה
* ריבית שנגבתה בפועל
* תנועות קנייה/מכירה (Executions)
* Transfers אמיתיים
* Payment in Lieu of Dividends

---

# 3. ✔ מה מייבאים (רשימות אמיתיות בלבד)

## רשומות אמיתיות שצריך *כן* לייבא

### תנועות מזומנים אמיתיות (Cash Flow)

* `deposit` - הפקדות
* `withdrawal` - משיכות
* `transfer` - העברות (בוודאי internal / external אמיתי)
* `dividend` - דיבידנדים
* `withholding_tax` / `tax` - מס במקור
* `payment_in_lieu` - Payment in Lieu of Dividends
* `interest` - ריבית ששולמה/התקבלה בפועל
* `fee` / `commission` - עמלות ומסים משויכות לעסקאות
* `borrow_fee` - עמלות הלוואה (אם הוגדרה בפועל)
* `forex_conversion` - המרות מטבע אמיתיות (מ-Trades section)

### עסקאות מסחר (Executions)

כל buy / sell כולל:

* כמות
* מחיר
* עמלה
* תאריך
* צד פעולה

---

# 4. ❌ מה לא מייבאים (לא תנועות, לא כסף, לא אמיתי)

הנתונים הבאים מופיעים בדוח PDF אך **לא** ב-CSV (או כן ב-CSV אך אינם תנועת Cash אמיתית):

## רשומות שיש להתעלם מהן

* **Cash FX Translation Gain/Loss** - רווח/הפסד לא ממומש מהמרת מטבע על יתרות
* **Change in Dividend Accruals** - דיבידנדים שהוכרזו אך לא שולמו (חשבונאי בלבד)
* **Change in Interest Accruals** - ריבית שהוכרזה אך לא נגבתה (חשבונאי בלבד)
* **Accrual Rollovers** - גלגולים חשבונאיים
* **NAV Adjustments** - התאמות NAV
* **Internal Accounting Entries** - רשומות חשבונאיות פנימיות
* **Base Currency Summary Totals** - סיכומים בדוח
* **Ending Cash / Ending Settled Cash מה־PDF** - יתרות סיכום
* **Totals בדוח PDF** - סיכומים כלליים
* **Broker summaries** - עמלות כלליות ברמת חשבון, לא ברמת טרייד
* **Trades (Sales) / Trades (Purchase)** - תנועות מזומנים מקנייה/מכירה (חלק מ-executions, לא cashflow נפרד)

### הסיבה

אלו **תנועות חשבונאיות פנימיות** לצורך דיווח בלבד — אינן מייצגות כסף שנכנס או יצא מהחשבון.

---

# 5. ✔ איך TikTrack צריכה לחשב נתונים?

תבסס על Light Model:

## 5.1 יתרת מזומן (Cash Balance)

החישוב הנכון:

```
cash_balance = Σ(amount of all real cash flows)
```

לא כולל:

❌ FX Translation  
❌ Accruals  
❌ NAV Changes  
❌ חלק מ-"Account Adjustments"

---

## 5.2 סיכום עמלות (Fees/Commissions)

בטוח ומדויק ב-100%:

```
sum(fee_column_of_execution_records)
```

לא משתמשים בכלל בדוחות PDF.

---

## 5.3 דיבידנדים נטו ומסים

```
dividends = sum(dividend)
tax = sum(withholding_tax)
dividends_net = dividends - tax
```

---

## 5.4 ריביות

רק מה שמופיע בפועל כ:

```
Broker Interest Paid and Received
```

---

## 5.5 רווח/הפסד ממומש (Realized PnL)

מבוסס **אך ורק** על execution pairs  
לא על Totals של הדוח.

---

# 6. ✔ מה לא עושים

### ❌ לא מנסים להשוות לסה"כ בדוח PDF

כי ה-"Totals" שם כוללים נתונים:

* שאינם תנועות
* חלקיים
* במטבע בסיס
* אחרי התאמות FX של IBKR
* אחרי קונסולידציות פנימיות

### ❌ לא מייבאים accrual

כי:

* אינו כסף אמיתי
* אינו משפיע על יתרת חשבון
* IBKR לא מכניס אותו לתזרים

### ❌ לא מייבאים FX Translation

כי:

* אינו מייצג פעולה
* IBKR מחשב אותו כ-adjustment חשבונאי בלבד

---

# 7. 🎯 מה TikTrack צריכה לבצע עכשיו (רשימת משימות)

## 7.1 בצד הייבוא

✔ לשמור את כל תנועות ה-Cash Flow מה-CSV  
✔ לסווג נכון לפי flow_type  
✔ לשמור executions ואף להצליב עם Trades  
✔ **לא לייבא** Cash FX Translation, Accruals, Trades (Sales/Purchase)  
✔ **לא להשוות** ל-Totals של Cash Report שכוללים דברים שאינם תנועות

## 7.2 בצד המנוע (core logic)

✔ חישוב יתרה אמיתית = סכום כל התנועות  
✔ חישובי עמלות לפי executions  
✔ חישוב רווח/הפסד לפי executions בלבד  
✔ חישוב דיבידנדים ומסים לפי cash_flow בלבד  
✔ תמיכה במטבעות לפי סכומי ה-CSV

## 7.3 בצד התצוגה

✔ להציג למשתמש רק נתונים המבוססים על Cash אמיתי  
✔ לא להציג מספרים מתוך PDF  
✔ לא להציג Cash FX Translation  
✔ לא להציג Accruals

## 7.4 בצד ההתאמה מול ממשק IBKR

✔ להבהיר למשתמש:  
המספרים בטיקטראק מציגים **כסף אמיתי בלבד**,  
בעוד IBKR מציג גם התאמות חשבונאיות.

---

# 8. ⭐ יתרון משמעותי לטיקטראק

TikTrack מציגה:

* **תזרים אמיתי ונקי**
* **רווח/הפסד אמיתי**
* **יתרות Cash מדויקות**
* **עמלות בפועל**

בניגוד ל-IBKR שמציג מיקס של:

* Cash
* Adjustments
* FX
* Accruals

המשתמש מקבל תמונה אמיתית — הרבה יותר מדויקת.

---

# 9. ✨ הסיכום הסופי

## ✔ המערכת שלכם עושה את הדבר הנכון

## ✔ הייבוא דרך CSV הוא מדויק ואמין

## ✔ יש להתעלם לחלוטין מכל מה שאינו Cash אמיתי

## ✔ מי שמסתמך על PDF יקבל מספרים שונים (ובהכרח פחות נכונים)

## ✔ TikTrack תהיה מדויקת יותר מ-IBKR לגבי כסף אמיתי בחשבון

---

## קישורים רלוונטיים

- `Backend/connectors/user_data_import/ibkr_connector.py` - פרסור קובץ IBKR
- `Backend/services/user_data_import/import_orchestrator.py` - תהליך הייבוא
- `Backend/services/cash_flow_service.py` - יצירת תזרימים
- `Backend/models/cash_flow.py` - מודל CashFlow

---

**תאריך עדכון**: 2025-01-16  
**גרסה**: 1.0.0

