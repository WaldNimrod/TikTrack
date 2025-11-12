# Trade Plan Matching Service

**עדכון אחרון:** 12 בנובמבר 2025  
**מיקום קוד:** `Backend/services/trade_plan_matching_service.py`  
**מטרה:** איתור טריידים ללא תוכנית מסחר והצעת פעולות מאוזנות (שיוך לתוכנית קיימת או יצירת תוכנית חדשה).

---

## סקירה

מערכת זו משלימה את הזיהוי המשולש (ביצועים ↔ טרייד ↔ תוכנית מסחר) על ידי סריקה של טריידים ללא תוכנית, חישוב ניקוד מתאים והפקת שתי תוצרים עיקריים:

1. **Assignment Suggestions** – הצעות לשיוך טרייד לתוכנית קיימת המתאימה באותו טיקר וחשבון, כולל נימוקים ודירוג.
2. **Creation Suggestions** – הצעות ליצור תוכנית חדשה מתוך טרייד (עם נתוני פרה-מילוי לטופס), כאשר טריידים שכבר קיבלו הצעת שיוך מקבלים עדיפות נמוכה יותר.

הערכת ההתאמה מתבססת על:
- התאמת טיקר (דרישת חובה).
- התאמת חשבון מסחר.
- התאמת צד (Long/Short).
- קרבת תאריכים בין הטרייד לתוכנית.
- הערות וצבר ביצועי קנייה לצורך יצירת תוכנית חדשה.

---

## נקודות אינטגרציה

| רכיב | תיאור |
|------|-------|
| `TradeService.get_trades_without_plan` | אחזור טריידים ללא תוכנית, עם אופציית טעינת קשרים. |
| `TradePlanService` | וידוא קיום תכניות פתוחות והפעלת בדיקות נתונים. |
| `CacheSyncManager` | דפוס invalidation חדש: `trade-plan-linked` → מרענן `trades-data` ו-`dashboard-data`. |
| דף הבית (`pending-trade-plan-widget.js`) | צורכת את השירות להצגת הווידג׳ט החדש בדף הבית. |

---

## API Endpoints

| מתודה | נתיב | תיאור | Cache TTL | Invalidations |
|-------|------|--------|-----------|---------------|
| `GET` | `/api/trades/pending-plan/assignments` | מחזיר רשימת הצעות לשיוך טריידים קיימים לתוכניות פתוחות. | 60 שניות (`@cache_with_deps`) | `['trades', 'trade-plans']` |
| `GET` | `/api/trades/pending-plan/creations` | מחזיר רשימת הצעות ליצירת תוכנית חדשה על בסיס טריידים ללא תוכנית. משתמש במדד ההצעות הקיים כדי להוריד עדיפות לטריידים שכבר קיבלו הצעת שיוך. | 60 שניות (`@cache_with_deps`) | `['trades', 'trade-plans']` |
| `POST` | `/api/trades/<trade_id>/link-plan` | משייך טרייד לתוכנית קיימת (כולל בדיקת התאמה בטיקר) ומפעיל invalidation ל-`trade-plan-linked`. | N/A | `['trades', 'trade-plans', 'dashboard', 'positions', 'portfolio']` |

### מבנה תגובה – Assignments

```jsonc
[
  {
    "trade_id": 123,
    "trade": { "id": 123, "ticker_symbol": "AAPL", ... },
    "best_score": 85,
    "primary_suggestion": {
      "trade_plan_id": 42,
      "score": 85,
      "match_reasons": ["טיקר תואם", "חשבון מסחר תואם", "תאריך קרוב"],
      "plan": { "id": 42, "status": "open", ... }
    },
    "suggestions": [
      { "trade_plan_id": 42, "score": 85, "match_reasons": [...] },
      { "trade_plan_id": 31, "score": 72, "match_reasons": [...] }
    ]
  }
]
```

### מבנה תגובה – Creations

```jsonc
[
  {
    "trade_id": 123,
    "trade": { "id": 123, "ticker_symbol": "AAPL", ... },
    "score": 55,
    "has_assignment_suggestion": true,
    "metrics": {
      "buy_execution_count": 2,
      "net_quantity": 50,
      "gross_investment": 5030.5,
      "first_execution_at": "2025-11-10T14:30:00Z",
      "has_notes": true
    },
    "prefill": {
      "ticker_id": 8,
      "trading_account_id": 3,
      "side": "long",
      "investment_type": "swing",
      "entry_price": 100.61,
      "entry_date": "2025-11-10T14:30:00Z",
      "quantity": 50,
      "planned_amount": 5030.5,
      "notes": "<p>Prefilled notes…</p>"
    }
  }
]
```

---

## Scoring Logic (Assignment)

| קריטריון | ניקוד | הערות |
|----------|-------|--------|
| התאמת טיקר | 50 | בסיס חובה. |
| התאמת חשבון | +25 | אם הטרייד והתוכנית באותו חשבון. |
| התאמת צד | +10 | אם שני הצדדים זהים (Long/Short). |
| סטטוס תוכנית פתוח | +5 | נותן עדיפות לתוכניות פעילות. |
| תאריך בטווח/קרוב | +10 / +5 | התאמה מלאה בטווח; קרבה (±7 ימים) מוסיפה ניקוד. |

הניקוד מוגבל ל־100, והצגות עם ניקוד מתחת ל־50 לא יוחזרו ל-API.

### Scoring Logic (Creation)

- בסיס: 70 נקודות.
- טרייד עם יותר מביצוע קנייה אחד: +10.
- קיום הערות: +5.
- טרייד בעל הצעת שיוך קיימת: -40 (עדיפות נמוכה ביצירת תוכנית חדשה).
- הניקוד מוגבל ל־95.

---

## טיפול בנתונים

- שימוש ב-`joinedload` למניעת N+1 בקשרים (טרייד ↔ חשבון/טיקר/ביצועים).
- פונקציות `_serialize_trade` ו-`_serialize_plan` מחזירות מידע מינימלי הדרוש ל-UI.
- נתוני פרה-מילוי (`prefill`) מותאמים לשדות הקיימים ב-`tradePlansModal`.
- סט מושבת של פריטים שנדחו נשמר ב-`UnifiedCacheManager` בצד ה-Frontend (`pending-trade-plan-widget.js`).

---

## הרחבות עתידיות

- תמיכה בנתוני סיכון/יעדים מתוך היסטוריית הטרייד.
- חשיפה של REST endpoint להצעות ספציפיות לטיקר.
- בדיקות עומק ביצועים (batch scoring) שמסתמכות על cache שרת עתידי.

---

## תיעוד משלים

- [Execution Trade Matching Service](EXECUTION_TRADE_MATCHING_SERVICE.md) – שירות מקביל לביצועים ↔ טרייד.
- `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md` – פרק Dashboard Widgets.
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md` – רשימת המערכות הכלליות המעודכנת.


