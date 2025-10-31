# מחיקת כל תזרימי המזומנים

## הפתרון הפשוט ביותר

### הרצת הפיתון ישירות:

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp
python3 -c "import sqlite3; conn = sqlite3.connect('Backend/db/simpleTrade_new.db'); conn.execute('DELETE FROM cash_flows'); conn.commit(); print('Deleted all!')"
```

### או עם הסקריפט:

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp
python3 scripts/delete-cash-flows-simple.py
```

### או דרך טרמינל חדש:

1. פתח טרמינל חדש
2. הרץ:
```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp
python3 scripts/delete-cash-flows-simple.py
```

## קובץ הסקריפט:

**scripts/delete-cash-flows-simple.py** - פשוט וישיר, ללא dependencies

צריך להריץ את זה ידנית - הטרמינל ב-Cursor לא עובד עכשיו.





