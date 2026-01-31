# 🚨 דרישה דחופה: צוות 10 → צוות 60 (DevOps & Platform)

**From:** Team 10 (The Gateway)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-01-31  
**Session:** SESSION_01  
**Priority:** 🔴 **URGENT - BLOCKING**

---

## 🚨 בעיה קריטית

**הפורטים לא עובדים - הפרויקט לא רץ.**

---

## 📋 רקע

לאחר עדכון הפורטים בהתאם ל-Master Blueprint:
- **Frontend V2:** Port 8080 (כפי שמוגדר: "Ports: V2 (8080), Legacy (8081)")
- **Backend API:** Port 8082 (הועבר מ-8080 כדי למנוע התנגשות)

**הבעיה:** השינויים לא עובדים - השרתים לא רצים או לא מתחברים כראוי.

---

## 🔍 מה נבדק ונעשה

### **שינויים שבוצעו:**

1. ✅ `ui/vite.config.js` - עודכן ל-port 8080, proxy ל-8082
2. ✅ `ui/.env.development` - עודכן ל-`VITE_API_BASE_URL=http://localhost:8082/api/v1`
3. ✅ `api/main.py` - עודכן ל-`uvicorn.run(app, host="0.0.0.0", port=8082)`
4. ✅ כל הסקריפטים (`start-backend.sh`, `start-frontend.sh`) - עודכנו
5. ✅ כל משימות Cursor (`.vscode/tasks.json`) - עודכנו
6. ✅ כל התיעוד - עודכן

### **מה לא עובד:**

- ❌ השרתים לא רצים כראוי
- ❌ יש בעיה בחיבור בין Frontend ל-Backend
- ❌ הפורטים לא מתפקדים כמצופה

---

## 🎯 דרישה לצוות 60

### **P0 - דחוף (חובה לטפל עכשיו):**

1. **בדיקת תצורת פורטים:**
   - בדוק את `ui/vite.config.js` - האם הפורט מוגדר נכון?
   - בדוק את `api/main.py` - האם הפורט מוגדר נכון?
   - בדוק את `.env.development` - האם ה-API Base URL נכון?
   - בדוק את הסקריפטים - האם הם מפעילים את השרתים על הפורטים הנכונים?

2. **בדיקת התנגשויות פורטים:**
   - בדוק אם יש תהליכים שרצים על פורטים 8080 או 8082
   - בדוק אם יש קונפליקטים עם Legacy (8081)
   - ודא שהפורטים פנויים

3. **בדיקת חיבור Frontend-Backend:**
   - בדוק את ה-proxy ב-Vite (`/api` → `http://localhost:8082`)
   - בדוק את CORS ב-Backend - האם הוא מאפשר גישה מ-`http://localhost:8080`?
   - בדוק את ה-Environment Variables - האם `VITE_API_BASE_URL` נכון?

4. **בדיקת הסקריפטים:**
   - הרץ את `./scripts/start-backend.sh` - האם הוא מפעיל את Backend על 8082?
   - הרץ את `./scripts/start-frontend.sh` - האם הוא מפעיל את Frontend על 8080?
   - בדוק את הלוגים - האם יש שגיאות?

5. **תיקון מיידי:**
   - תקן כל בעיה שתזהה
   - ודא שהכל עובד לפני שתדווח

---

## 📝 דרישות דיווח

**אחרי הבדיקה והתיקון, יש לספק:**

1. **דוח מפורט:**
   - מה הבעיה שזוהתה?
   - מה התיקון שבוצע?
   - מה הסטטוס הנוכחי?

2. **הוראות הרצה:**
   - איך להריץ את השרתים עכשיו?
   - מה הפורטים הסופיים?
   - מה צריך לבדוק?

3. **אימות:**
   - האם Backend רץ על הפורט הנכון?
   - האם Frontend רץ על הפורט הנכון?
   - האם הם מתחברים זה לזה?

---

## ⚠️ חשוב

- **זה חוסם את כל העבודה** - Frontend ו-Backend לא יכולים לעבוד בלי זה
- **צוות 30 ממתין** - הם לא יכולים לבדוק את הקוד שלהם בלי שרתים רצים
- **צוות 50 ממתין** - הם לא יכולים לבצע QA בלי שרתים רצים

**יש לטפל בזה עכשיו.**

---

## 📡 קישורים רלוונטיים

- **Master Blueprint:** `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- **Infrastructure Guide:** `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md`
- **Vite Config:** `ui/vite.config.js`
- **Backend Main:** `api/main.py`
- **Scripts:** `scripts/start-backend.sh`, `scripts/start-frontend.sh`

---

## ✅ קריטריונים להצלחה

הדרישה נחשבת מושלמת כאשר:

- ✅ Backend רץ על פורט 8082 ללא שגיאות
- ✅ Frontend רץ על פורט 8080 ללא שגיאות
- ✅ Frontend מתחבר ל-Backend דרך proxy (`/api` → `http://localhost:8082`)
- ✅ Health check עובד: `curl http://localhost:8082/health`
- ✅ דף Index נטען: `http://localhost:8080/`
- ✅ API requests עובדים מהדפדפן

---

**ממתין לתגובה דחופה.**

**Team 10 (The Gateway)**
