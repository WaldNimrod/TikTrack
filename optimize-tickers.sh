#!/bin/bash

# סקריפט לאופטימיזציה של tickers.js
# מסיר קוד מיותר וכפול

cd /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts

# יצירת קובץ זמני
cp tickers.js tickers-temp.js

echo "🔧 מתחיל אופטימיזציה של tickers.js..."

# 1. הסרת Yahoo Finance Integration (שורות 2168-2238)
echo "1/7: מסיר Yahoo Finance Integration..."
sed -i '' '2168,2238d' tickers-temp.js

# 2. הסרת deprecated function restoreTickersSectionState (שורות 460-479)
echo "2/7: מסיר restoreTickersSectionState..."
sed -i '' '460,479d' tickers-temp.js

# 3. הסרת deprecated function clearTickersCache (שורות 1693-1709)
echo "3/7: מסיר clearTickersCache..."
sed -i '' '1693,1709d' tickers-temp.js

# 4. הסרת wrapper functions (שורות 2320-2365 בערך)
echo "4/7: מסיר wrapper functions..."
# צריך למצוא את השורות המדויקות אחרי המחיקות הקודמות

# 5. הסרת console.log מיותר (לא לגעת ב-console.error ו-console.warn)
echo "5/7: מנקה console.log מיותר..."
sed -i '' '/console\.log(/d' tickers-temp.js

# 6. הסרת ייצוא גלובלי כפול
echo "6/7: מנקה ייצוא גלובלי כפול..."
# נעשה זאת ידנית

# 7. הסרת שורות ריקות מיותרות
echo "7/7: מנקה שורות ריקות מיותרות..."
# נשאיר את זה לבינתיים

echo "✅ אופטימיזציה הושלמה!"
echo "📊 קובץ מקורי: $(wc -l < tickers.js) שורות"
echo "📊 קובץ מאופטם: $(wc -l < tickers-temp.js) שורות"
echo "📉 חיסכון: $(($(wc -l < tickers.js) - $(wc -l < tickers-temp.js))) שורות"

# העתקה לקובץ החדש
mv tickers-temp.js tickers-optimized.js

echo "✨ הקובץ המאופטם נשמר ב: tickers-optimized.js"

