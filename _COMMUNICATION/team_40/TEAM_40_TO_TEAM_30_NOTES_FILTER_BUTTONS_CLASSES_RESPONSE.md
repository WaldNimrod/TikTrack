# Team 40 → Team 30: תשובה — מחלקות לכפתורי פילטר (עמוד הערות D35)

**from:** Team 40 (UI Assets & Design)  
**to:** Team 30 (Frontend)  
**date:** 2026-02-16  
**re:** [TEAM_30_TO_TEAM_40_NOTES_FILTER_BUTTONS_CLASSES_REQUEST.md](../team_30/TEAM_30_TO_TEAM_40_NOTES_FILTER_BUTTONS_CLASSES_REQUEST.md)

---

## 1. סיכום

הפילטר מוגדר כסדרת איקונים בכותרת הקונטיינר.  
**מחלקות:** `filter-buttons-container`, `filter-icon-btn`, `filter-icon-btn--active` (מצב פעיל/לא פעיל).

---

## 2. מיקום CSS

**קובץ:** `ui/src/styles/phoenix-components.css`  
**סקשן:** Notes (D35) — Entity filter icon bar (שורות 340–408)

---

## 3. מחלקות והתנהגות

| מחלקה | תיאור |
|-------|--------|
| `.filter-buttons-container` | עטיפה לסדרת איקונים — flex, רווח — בכותרת הקונטיינר |
| `.filter-icon-btn` | כפתור איקון 36×36 — רקע ניטרלי, מסגרת, hover. תמונה 20×20 |
| `.filter-icon-btn--active` | מצב נבחר — רקע לבן, מסגרת 2px בצבע מותג (`--color-brand`) |

**צבע פעיל לפי ישות:** לפי `data-filter-type` — override ל־`--color-brand` כך שהמסגרת והאיקון מקבלים את צבע הישות כשהכפתור פעיל.

---

## 4. טבלת data-filter-type ↔ איקון

| `data-filter-type` | איקון | נתיב |
|--------------------|-------|------|
| `all` | notes.svg | `/images/icons/entities/notes.svg` |
| `account` | trading_accounts.svg | `/images/icons/entities/trading_accounts.svg` |
| `trade` | trades.svg | `/images/icons/entities/trades.svg` |
| `trade_plan` | trade_plans.svg | `/images/icons/entities/trade_plans.svg` |
| `ticker` | tickers.svg | `/images/icons/entities/tickers.svg` |

---

## 5. דוגמת HTML (להחלפת inline)

```html
<div class="filter-buttons-container">
  <button class="filter-icon-btn filter-icon-btn--active" data-filter-type="all" aria-label="הצג הכל" title="הצג הכל - כל סוגי הישויות">
    <img src="/images/icons/entities/notes.svg" alt="הכל" width="20" height="20">
  </button>
  <button class="filter-icon-btn" data-filter-type="account" aria-label="הערות על חשבונות" title="סינון לפי: חשבונות">
    <img src="/images/icons/entities/trading_accounts.svg" alt="חשבונות" width="20" height="20">
  </button>
  <button class="filter-icon-btn" data-filter-type="trade" aria-label="הערות על טריידים" title="סינון לפי: טריידים">
    <img src="/images/icons/entities/trades.svg" alt="טריידים" width="20" height="20">
  </button>
  <button class="filter-icon-btn" data-filter-type="trade_plan" aria-label="הערות על תוכניות השקעה" title="סינון לפי: תוכניות">
    <img src="/images/icons/entities/trade_plans.svg" alt="תוכניות" width="20" height="20">
  </button>
  <button class="filter-icon-btn" data-filter-type="ticker" aria-label="הערות על טיקרים" title="סינון לפי: טיקרים">
    <img src="/images/icons/entities/tickers.svg" alt="טיקרים" width="20" height="20">
  </button>
</div>
```

---

## 6. אישור

אפשר להתחיל עם inline עד להחלפה ב-classes.  
צוות 30 יכול לעבור ל-markup עם המחלקות האלה ולהוסיף/להסיר `filter-icon-btn--active` לפי הכפתור הנבחר.

---

**log_entry | TEAM_40 | TO_30 | NOTES_FILTER_BUTTONS_CLASSES_RESPONSE | 2026-02-16**
