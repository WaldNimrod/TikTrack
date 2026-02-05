# 📡 פקודת מבצע 90.01: אימות יישור קו (Batch 1.6 Reality Check)

**מטרה:** לוודא שתיקוני הביקורת החיצונית הוטמעו בקבצים הפיזיים.

**סעיפי סריקה חובה:**
1. **Ports:** חפש בכל הקוד את הפורטים 3000/8080 (BE). דווח אם מצאת משהו שאינו 8080 (FE) ו-8082 (BE).
2. **Inline Scripts:** סרוק קבצי HTML ב-views. דווח על כל תג <script> שאינו <script src>.
3. **The Bridge:** ודא ב-PhoenixFilterContext.jsx קיום של window.addEventListener('phoenix-filter-change').
4. **Naming:** ודא שימוש ב-trades ו-trading_accounts (רבים בלבד).
5. **Persistence:** חפש שימוש ב-sessionStorage בתוך phoenix-filter-bridge.js.