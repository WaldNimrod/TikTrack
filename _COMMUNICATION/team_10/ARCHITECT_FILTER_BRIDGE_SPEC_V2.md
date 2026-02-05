# 📡 מפרט טכני מורחב: Phoenix Dynamic Bridge (v2.0)

**סטטוס:** 🔒 LOCKED | **הקשר:** D16/D18/D21 Navigation

## 1. אחידות התשתית (Loader Pattern)
ה-Header יוטען בדיוק כמו הפוטר באמצעות `header-loader.js`. המטרה: אפס למידה לצוות 30.

## 2. הזרקת נתונים דינמיים (Dynamic Data Injection)
כדי לאכלס את רשימת חשבונות המסחר בתוך הפילטר ב-Header:
1. **The Registry:** ה-Bridge מחזיק אובייקט גלובלי `window.PhoenixBridge`.
2. **React Side:** ברגע שרכיב ה-App מקבל חשבונות מה-API, הוא קורא ל-`window.PhoenixBridge.updateOptions('accounts', data)`.
3. **Vanilla Side:** ה-Header מקשיב לשינוי ומייצר אלמנטים של `<li>` בתוך ה-Dropdown של הפילטר דינמית.

## 3. שמירת מצב (State & Persistence)
* **URL First:** כל שינוי פילטר מעדכן את ה-URL Params (למשל `?account_id=123`).
* **Session Cache:** ה-Bridge שומר את המצב האחרון ב-`sessionStorage`.
* **Cross-Page:** במעבר בין עמודי HTML (למשל מ-D16 ל-D21), ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.

## 4. משימה לצוות 30 (Implementation Task)
מימוש קובץ `phoenix-filter-bridge.js` המכיל את פונקציות ה-`updateOptions` וה-`syncWithUrl`.

---
**log_entry | [Architect] | DYNAMIC_BRIDGE_V2 | PUSHED | GREEN | 2026-02-03**