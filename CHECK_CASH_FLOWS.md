# בדיקת cash_flows בבסיס הנתונים

## דרך דפדפן:

1. פתח את העמוד: `http://localhost:8080/cash_flows`
2. אם הטבלה ריקה - ✅ הרשומות נמחקו!
3. אם יש רשומות - הריץ את הסקריפט שוב

## דרך קונסול דפדפן:

פתח קונסול בעמוד כלשהו והרץ:

```javascript
fetch('http://localhost:8080/api/cash_flows')
  .then(r => r.json())
  .then(data => {
    console.log(`Found ${data.data?.length || 0} cash flows`);
    if (data.data && data.data.length > 0) {
      console.log('First record:', data.data[0]);
    }
  });
```

## דרך טרמינל מקומי:

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp
python3 scripts/delete-cash-flows-simple.py
```

## מה לעשות אם עדיין יש רשומות:

1. בדוק שהשרת רץ: `http://localhost:8080`
2. רענון קשיח של הדף (Cmd+Shift+R)
3. ניקוי cache מלא דרך הכפתור 🧹 בתפריט







