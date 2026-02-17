# בדיקת שימוש במחלקות סטנדרטיות — בקרת תקינות + עמודים

**תאריך:** 2026-01-31  
**הקשר:** חובה להשתמש ב-tt-section-row, col-12, info-summary וכו'  
**סטטוס:** ✅ תוקן 2026-01-31

---

## 1. הסטנדרט (לפי PAGE_LAYOUT_AND_SECTIONS_SSOT)

| רכיב | מחלקה/אלמנט | שימוש |
|------|-------------|--------|
| שורת תוכן | `tt-section-row` | חלוקה ל-grid עם auto-fit |
| עמודה full-width | `col-12` | בתוך tt-section-row |
| סיכום מידע | `info-summary` | info-summary__row, info-summary__content |
| סקציה | `tt-section` | index-section__header + index-section__body |

---

## 2. עמודים שעומדים בסטנדרט ✅

| עמוד | מבנה |
|------|------|
| **trading_accounts** | tt-section-row > col-12 > info-summary (info-summary__row, info-summary__content) |
| **cash_flows** | tt-section-row > col-12 > info-summary |
| **brokers_fees** | tt-section-row > col-12 > info-summary |
| **data_dashboard** | tt-section-row > col-12 > info-summary |
| **system_management** | tt-section-row > col-12 |
| **tickers – סיכום** | tt-section-row > col-12 > info-summary ✅ |

---

## 3. נדרש לעדכן — בקרת תקינות (data-integrity)

**מיקום:** `tickers.content.html` + `tickersDataIntegrityInit.js` + `D15_DASHBOARD_STYLES.css`

### 3.1 מבנה נוכחי (לא סטנדרטי)

```
data-integrity-panel (flex)
├── tickerDataIntegrityDetail
│   └── [JS יוצר:]
│       ├── data-integrity-summary-cards (grid 3 cols) ❌
│       │   └── data-integrity-card × 3
│       └── data-integrity-detail-grid (grid 1fr 1fr) ❌
│           ├── data-integrity-detail-row--header
│           ├── data-integrity-detail-col
│           └── data-integrity-detail-col
└── tt-section-row (tickerDataIntegrityGapsRow) ✅
```

### 3.2 מה להמיר לסטנדרט

| רכיב נוכחי | סטנדרט מומלץ | קובץ לעדכון |
|------------|--------------|-------------|
| `data-integrity-summary-cards` (grid 3 cols) | `tt-section-row` עם 3 children | tickersDataIntegrityInit.js |
| `data-integrity-detail-grid` (grid 2 cols) | `tt-section-row` × 2: header + שורת 2 עמודות | tickersDataIntegrityInit.js |
| `data-integrity-detail-col` | children של tt-section-row (או col-12 אם רוצים) | tickersDataIntegrityInit.js |
| `data-integrity-detail-row` (שורת label:value) | יכול להישאר — תוכן פרטני, לא layout | — |
| `data-integrity-gaps-row` | כבר tt-section-row ✅ | — |

### 3.3 CSS להסרה/התאמה

ב־`D15_DASHBOARD_STYLES.css`:
- `.data-integrity-summary-cards` — grid-template-columns מותאם
- `.data-integrity-detail-grid` — grid-template-columns 1fr 1fr
- `.data-integrity-detail-col` — flex
- `.data-integrity-detail-row--header` — grid-column

להחליף ב־שימוש ב־tt-section-row (שמוגדר ב־phoenix-components).

---

## 4. עמודים אחרים — סיכום

| עמוד | סטטוס | הערות |
|------|-------|------|
| trading_accounts | ✅ | info-summary + tt-section-row |
| cash_flows | ✅ | info-summary + tt-section-row |
| brokers_fees | ✅ | info-summary + tt-section-row |
| data_dashboard | ✅ | info-summary + tt-section-row |
| tickers (סיכום) | ✅ | info-summary + tt-section-row |
| **tickers (data-integrity)** | ❌ | data-integrity-* מותאם |

---

## 5. סדר עדכון מומלץ

1. **tickersDataIntegrityInit.js** — להמיר את ה־HTML המוזרק ל־tt-section-row במקום data-integrity-summary-cards ו־data-integrity-detail-grid.
2. **D15_DASHBOARD_STYLES.css** — להסיר/לצמצם CSS של data-integrity-summary-cards, data-integrity-detail-grid, data-integrity-detail-col; לשמור רק עיצוב כרטיסים ובאנרים.
3. **בדיקה** — לוודא שהמבנה תואם לשאר העמודים (tt-section-row > col-12 או children ישירים).
