# TikTrack – מסמך דוקומנטציה לייבוא נתוני IBKR (CSV)

## מטרת המסמך
להגדיר בצורה מלאה את אופן הייבוא ממערכת Interactive Brokers (IBKR) אל TikTrack, תוך התמקדות בתנועות אמיתיות בלבד (Real Cash Movements) והתעלמות מרעשי הדו"ח החשבונאיים של IBKR.

## 1. עיקר המסקנה
קובץ ה־CSV של IBKR כולל אך ורק תנועות כסף אמיתיות — ולכן ניתן לסמוך עליו לחלוטין לצורך ייבוא:
- יתרות
- עמלות אמיתיות
- ריביות אמיתיות
- דיבידנדים נטו
- מס במקור
- קניות ומכירות (Executions)

ואילו דוח PDF/HTML כולל *גם* התאמות חשבונאיות שלא מייצגות כסף אמיתי.

## 2. מה ה־PDF מכיל (ולמה לא לייבא ממנו)
דוח PDF מכיל:
- NAV Changes
- FX Translation Gain/Loss
- Accrual Rollovers
- Internal Adjustments
- Totals מחושבים
- Base Currency Summary
- Ending Cash שאינו מבוסס על תזרים אמיתי

אלו **לא** מייצגים כסף שנכנס/יצא ולכן אין לייבא אותם.

## 3. מה ה־CSV כן מכיל (רשומות אמיתיות בלבד)
- Deposits
- Withdrawals
- Transfers אמיתיים
- Dividends
- Withholding Tax
- Payment in Lieu
- Broker Interest (Paid/Received)
- עמלות פר-עסקה
- Executions מלאים (Buy/Sell)

כל אלו מייצגים תנועת כסף אמיתית ולכן נדרש לייבא.

## 4. רשומות שאין לייבא
- FX Translation Gain/Loss
- Accruals (Interest/Dividend)
- NAV Adjustments
- Internal Accounting Entries
- Totals מה־PDF
- Ending Cash / Settled Cash מה־PDF

## 5. חישובים ב־TikTrack
### יתרת מזומן
מחושבת כך:
```
Σ(all real cash flows)
```

### עמלות
מבוססות על עמלות המופיעות בעסקאות בלבד.

### דיבידנדים ומסים
```
dividends_net = dividends - withholding_tax
```

### רווח/הפסד ממומש
מבוסס על התאמת Executions בלבד.

## 6. מה לא עושים
- לא מנסים להשוות Totals של IBKR ל־CSV (לא תואם ולא צריך).
- לא מייבאים Adjustments ו־Accruals.
- לא מייבאים FX Translation.

## 7. מה TikTrack צריכה לבצע
### בצד הייבוא
- לטעון את כל ה־Cash Flow האמיתיים.
- לסווג לפי flow_type.
- לטעון Executions ולחברם ל־Trades.

### בצד מנוע החישוב
- לבצע חישוב יתרה אמיתית.
- חישוב עמלות אמיתי.
- חישוב רווח/הפסד אמיתי.

### בצד התצוגה
- להציג רק כסף אמיתי.
- לא להראות Adjustments.
- לא להציג נתוני PDF.

## 8. יתרון TikTrack
TikTrack מציגה תזרים אמיתי בלבד — ללא רעשי חשבונאות פנימיים — ולכן נותנת תמונה אמיתית ונכונה יותר מהדו"ח של IBKR.

---

זהו מסמך ההתייחסות הרשמי לייבוא נתוני IBKR למערכת TikTrack.
