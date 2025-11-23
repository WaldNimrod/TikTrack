# TradingView Lightweight Charts - רשימת פיצ'רים וממשקים

**תאריך יצירה:** 27 ינואר 2025  
**מטרה:** רשימה מקיפה של כל הפיצ'רים האפשריים ב-TradingView Lightweight Charts לצורך סיווג וסינון

---

## 📋 רשימת פיצ'רים - נא לסמן מה לכלול

### A. סוגי גרפים (Chart Types)

1. **Line Chart** - גרף קו בסיסי
   - ✅ כבר מימשנו
   - דוגמה: `/examples/line-series.html`

2. **Area Chart** - גרף אזור (ממולא)
   - ✅ כבר מימשנו ב-adapter
   - דוגמה: `/examples/area-series.html`

3. **Candlestick Chart** - נרות יפניים
   - ✅ כבר מימשנו
   - דוגמה: `/examples/candlestick-series.html`

4. **Bar Chart** - גרף עמודות
   - דוגמה: `/examples/bar-series.html`

5. **Histogram Chart** - היסטוגרמה
   - דוגמה: `/examples/histogram-series.html`

6. **Baseline Chart** - גרף עם קו בסיס
   - דוגמה: `/examples/baseline-series.html`

---

### B. תצוגת מחירים (Price Display)

7. **תצוגת מחיר ($)** - תצוגה בערכים מוחלטים
   - ✅ כבר מימשנו
   - `priceFormat: { type: 'price' }`

8. **תצוגת אחוזים (%)** - תצוגה באחוזים מהערך הראשון
   - ✅ כבר מימשנו
   - `priceFormat: { type: 'percent' }`
   - דוגמה: `/examples/percentage-scale.html`

9. **תצוגת Volume** - נפח מסחר
   - ✅ כבר מימשנו
   - דוגמה: `/examples/volume-overlay.html`

10. **תצוגת Volume ב-Price Scale** - נפח בציר Y
    - ✅ כבר מימשנו
    - דוגמה: `/examples/volume-overlay-price-scale.html`

---

### C. ציר Y (Y-Axis / Price Scale)

11. **Linear Scale** - ציר Y ליניארי
    - ✅ כבר מימשנו
    - `priceScale: { mode: 0 }`

12. **Logarithmic Scale** - ציר Y לוגריתמי
    - ✅ כבר מימשנו
    - `priceScale: { mode: 1 }`
    - דוגמה: `/examples/logarithmic-scale.html`

13. **Left Price Scale** - ציר Y שמאלי
    - ✅ כבר מימשנו
    - `priceScaleId: 'left'`

14. **Right Price Scale** - ציר Y ימני
    - ✅ כבר מימשנו (ברירת מחדל)
    - `priceScaleId: 'right'`

15. **Multiple Price Scales** - מספר צירים Y
    - ✅ כבר מימשנו (left + right)
    - דוגמה: `/examples/two-scales.html`

16. **Price Scale Margins** - שולי ציר Y
    - ✅ כבר מימשנו
    - `scaleMargins: { top: 0.1, bottom: 0.1 }`

17. **Auto Scale** - התאמה אוטומטית
    - ✅ כבר מימשנו
    - `autoScale: true`

---

### D. ציר X (Time Scale)

18. **Time Visible** - הצגת תאריכים/שעות
    - ✅ כבר מימשנו
    - `timeScale: { timeVisible: true }`

19. **Seconds Visible** - הצגת שניות (לתצוגת intraday)
    - ✅ כבר מימשנו
    - `timeScale: { secondsVisible: true }`

20. **Custom Time Format** - פורמט זמן מותאם אישית
    - דוגמה: `/examples/time-format.html`

21. **Time Zone** - אזור זמן
    - דוגמה: `/examples/timezone.html`

22. **Fit Content** - התאמת הגרף לנתונים
    - ✅ כבר מימשנו
    - `chart.timeScale().fitContent()`

23. **Scroll Position** - שליטה במיקום הגלילה
    - `chart.timeScale().scrollToPosition(position, animated)`

24. **Visible Range** - טווח זמן גלוי
    - ✅ כבר מימשנו
    - `chart.timeScale().setVisibleRange(range)`

---

### E. אינטראקטיביות בסיסית (Basic Interactivity)

25. **Crosshair** - קו חוצה (אופקי + אנכי)
    - ✅ כבר מימשנו
    - `crosshair: { mode: 1 }`
    - דוגמה: `/examples/crosshair.html`

26. **Crosshair Move Event** - אירוע תנועת העכבר
    - `chart.subscribeCrosshairMove(callback)`
    - דוגמה: `/examples/crosshair.html`

27. **Click Event** - אירוע לחיצה
    - `chart.subscribeClick(callback)`

28. **Double Click Event** - אירוע לחיצה כפולה
    - `chart.subscribeDoubleClick(callback)`

29. **Mouse Move Event** - אירוע תנועת עכבר
    - דרך crosshair move

---

### F. כלי ציור ומדידה (Drawing Tools & Annotations)

30. **Markers** - סימנים על הגרף
    - ✅ כבר מימשנו (בעמוד portfolio-state-page)
    - דוגמה: `/examples/markers.html`

31. **Time-Based Markers** - סימנים לפי זמן
    - דוגמה: `/examples/time-based-markers.html`

32. **Price-Based Markers** - סימנים לפי מחיר
    - דוגמה: `/examples/price-based-markers.html`

33. **Custom Marker Shapes** - צורות מותאמות אישית
    - דוגמה: `/examples/custom-marker-shapes.html`

34. **Canvas Overlay - Custom Drawing** - ציור מותאם אישית
    - ✅ כבר מימשנו (canvas overlay)
    - דוגמה: Custom implementation

35. **Horizontal Line Tool** - כלי קו אופקי
    - ✅ כבר מימשנו (בכלי ציור)

36. **Vertical Line Tool** - כלי קו אנכי
    - ✅ כבר מימשנו (בכלי ציור)

37. **Line Drawing Tool** - כלי ציור קו
    - ✅ כבר מימשנו (בכלי ציור)

38. **Arrow Tool** - כלי חץ
    - ✅ כבר מימשנו (בכלי ציור)

39. **Rectangle Tool** - כלי מלבן
    - ✅ כבר מימשנו (בכלי ציור)

40. **Text Annotation Tool** - כלי טקסט
    - ✅ כבר מימשנו (בכלי ציור)

41. **Measurement Tool** - כלי מדידה (מרחק/מחיר)
    - ✅ כבר מימשנו (בכלי ציור)

42. **Fibonacci Retracement** - פיבונאצ'י
    - ✅ כבר מימשנו

43. **Trend Lines** - קווי מגמה
    - ✅ כבר מימשנו

44. **Support/Resistance Lines** - קווי תמיכה/התנגדות
    - ✅ כבר מימשנו

---

### G. Zoom & Pan (זום ופן)

45. **Mouse Wheel Zoom** - זום עם גלגלת עכבר
    - ✅ כבר מובנה (ברירת מחדל)

46. **Touch Zoom** - זום במגע (מובייל)
    - ✅ כבר מובנה

47. **Zoom Buttons** - כפתורי זום (+/-)
    - ✅ כבר מימשנו

48. **Pan (Drag)** - גרירה על הגרף
    - ✅ כבר מובנה (ברירת מחדל)

49. **Reset Zoom** - איפוס זום
    - ✅ כבר מימשנו
    - `chart.timeScale().resetTimeScale()`

50. **Zoom to Selection** - זום לבחירה
    - ⏳ אופציונלי (לא נדרש כרגע)

---

### H. Grid & Layout (רשת ועיצוב)

51. **Grid Lines** - קווי רשת
    - ✅ כבר מימשנו
    - `grid: { vertLines: {}, horzLines: {} }`

52. **Grid Colors** - צבעי רשת
    - ✅ כבר מימשנו

53. **Background Color** - צבע רקע
    - ✅ כבר מימשנו
    - `layout: { background: { type: 'solid', color: '...' } }`

54. **Transparent Background** - רקע שקוף
    - ✅ כבר מימשנו
    - `background: { type: 'solid', color: 'transparent' }`

55. **Text Colors** - צבעי טקסט
    - ✅ כבר מימשנו
    - `layout: { textColor: '...' }`

56. **Font Settings** - הגדרות גופן
    - `layout: { fontFamily: '...', fontSize: ... }`

---

### I. Multiple Series (מספר סדרות)

57. **Multiple Line Series** - מספר סדרות קו
    - ✅ כבר מימשנו (comparison series)

58. **Mixed Series Types** - סוגי סדרות מעורבים
    - Line + Candlestick + Area
    - דוגמה: `/examples/mixed-series.html`

59. **Overlay Series** - סדרות חופפות
    - דוגמה: `/examples/series-overlay.html`

60. **Series Visibility Toggle** - הפעלה/כיבוי סדרות
    - ✅ כבר מימשנו
    - `series.applyOptions({ visible: false })`

61. **Series Legend** - מקרא סדרות
    - ✅ כבר מימשנו

---

### J. Studies & Indicators (מחקרים ומחוונים)

62. **Moving Average (MA)** - ממוצע נע
    - ✅ כבר מימשנו

63. **Bollinger Bands** - פסי בולינגר
    - דוגמה: Custom calculation + area series

64. **RSI (Relative Strength Index)** - RSI
    - דוגמה: Custom calculation + histogram

65. **MACD** - MACD
    - דוגמה: Custom calculation + histogram

66. **Volume Indicator** - מחוון נפח
    - ✅ כבר מימשנו

---

### K. Events & Callbacks (אירועים)

67. **Series Hover** - ריחוף על סדרה
    - דרך crosshair move

68. **Price Line Hover** - ריחוף על קו מחיר
    - דרך crosshair move

69. **Time Axis Click** - לחיצה על ציר זמן
    - דרך click event

---

### L. Data Management (ניהול נתונים)

70. **Dynamic Data Updates** - עדכון נתונים דינמי
    - `series.update(data)`
    - ✅ כבר מימשנו

71. **Data Streaming** - הזרמת נתונים בזמן אמת
    - דוגמה: `/examples/real-time.html`

72. **Historical Data Loading** - טעינת נתונים היסטוריים
    - ✅ כבר מימשנו

73. **Data Pagination** - דפדוף בנתונים
    - דוגמה: Custom implementation

74. **Lazy Loading** - טעינה עצלה
    - ✅ כבר מימשנו

---

### M. Export & Screenshot (ייצוא ותמונות)

75. **Chart Screenshot** - צילום מסך של הגרף
    - ✅ כבר מימשנו
    - `chart.takeScreenshot()`

76. **Export as Image** - ייצוא כתמונה (PNG/JPG)
    - ✅ כבר מימשנו

77. **Export as PDF** - ייצוא כ-PDF
    - דוגמה: Custom implementation

---

### N. Advanced Features (פיצ'רים מתקדמים)

78. **Watermark** - סימן מים
    - `layout: { watermark: { ... } }`
    - דוגמה: `/examples/watermark.html`

79. **Custom Price Formatter** - פורמטר מחיר מותאם אישית
    - `priceFormat: { formatter: function }`
    - דוגמה: `/examples/custom-price-formatter.html`

80. **Custom Time Formatter** - פורמטר זמן מותאם אישית
    - `timeScale: { tickMarkFormatter: function }`
    - דוגמה: `/examples/custom-time-formatter.html`

81. **Multiple Charts Sync** - סנכרון מספר גרפים
    - ✅ כבר מימשנו (⚠️ מורכב - ראה תיעוד מפורט)
    - תיעוד: `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_MULTIPLE_CHARTS_SYNC.md`

82. **Chart in Chart** - גרף בתוך גרף
    - דוגמה: Custom implementation

83. **Responsive Chart** - גרף רספונסיבי
    - ✅ כבר מימשנו
    - `window.addEventListener('resize')`

84. **Chart Resize** - שינוי גודל הגרף
    - ✅ כבר מימשנו
    - `chart.applyOptions({ width, height })`

---

### O. Performance & Optimization (ביצועים)

85. **Request Animation Frame** - אופטימיזציה של רינדור
    - ✅ כבר מימשנו

86. **Data Sampling** - דגימת נתונים (לנתונים גדולים)
    - ✅ כבר מימשנו

87. **Virtualization** - וירטואליזציה של נתונים
    - ✅ כבר מימשנו

---

### P. UI Controls (בקרות ממשק)

88. **Time Range Selector** - בחירת טווח זמן
    - ✅ כבר מימשנו (כפתורים בכותרת)

89. **Chart Type Selector** - בחירת סוג גרף
    - ✅ כבר מימשנו (כפתורים בכותרת)

90. **Unit Size Selector** - בחירת גודל יחידה
    - ✅ כבר מימשנו (כפתורים בכותרת)

91. **View Mode Toggle** - החלפה בין מצבי תצוגה ($/%)
    - ✅ כבר מימשנו (כפתורים בכותרת)

92. **Scale Mode Toggle** - החלפה בין ליניארי/לוגריתמי
    - ✅ כבר מימשנו (כפתורים בכותרת)

93. **Drawing Tools Toggle** - הפעלה/כיבוי כלי ציור
    - ✅ כבר מימשנו (כפתור בכותרת)

---

### Q. Accessibility (נגישות)

94. **Keyboard Navigation** - ניווט במקלדת
    - ✅ כבר מימשנו

95. **Screen Reader Support** - תמיכה בקורא מסך
    - דוגמה: Custom implementation

96. **ARIA Labels** - תוויות ARIA
    - דוגמה: Custom implementation

---

### R. Integration Features (פיצ'רי אינטגרציה)

97. **Theme Integration** - אינטגרציה עם ערכת נושא
    - ✅ כבר מימשנו (TradingViewTheme)

98. **Color Scheme Integration** - אינטגרציה עם מערכת צבעים
    - ✅ כבר מימשנו (ColorSchemeSystem)

99. **Preferences Integration** - אינטגרציה עם העדפות
    - ✅ כבר מימשנו (אינטגרציה עם PreferencesCore)

---

**סה"כ: 99 פיצ'רים אפשריים**

---

## 📝 הוראות סיווג

**נא לסמן לכל פיצ'ר:**
- ✅ **לכלול** - רלוונטי ויש לממש
- ⏳ **אופציונלי** - אפשר להוסיף בהמשך
- ❌ **לא לכלול** - לא רלוונטי או לא נדרש

---

**תאריך עדכון:** 27 ינואר 2025  
**גרסה:** 1.0.0

