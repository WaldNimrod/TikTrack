# 👥 צוותים נדרשים לשלב הראשון - פייז 1
**project_domain:** TIKTRACK

**From:** Team 10 (The Gateway)  
**To:** Team 00 (Lead Architect) & Gemini Bridge (Control Bridge)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity

---

## 🎯 סיכום הצוותים הנדרשים

לפייז 1 (מודול משתמשים ואוטנטיקציה) נדרשים **4 צוותי ביצוע**:

1. **צוות 20 (Backend)** - קריטי (P0)
2. **צוות 30 (Frontend)** - קריטי (P0) 
3. **צוות 40 (UI Assets)** - חשוב (P1)
4. **צוות 50 (QA)** - חשוב (P1)

---

## 📋 פירוט לפי צוות

### 1. צוות 20 (Backend) - קריטי ⭐

**תפקיד:** מימוש FastAPI בהתאמה ל-LOD 400 SQL

**משימות ראשיות:** 9 משימות

#### שלב 1 (יכול להתחיל עכשיו):
- ✅ **משימה 20.1.1:** הקמת תשתית DB (4 שעות)
  - וידוא schema קיים
  - בדיקת indexes ו-constraints
  
- ✅ **משימה 20.1.4:** מימוש Encryption Service (2 שעות)
  - בחירת library (cryptography.fernet)
  - יצירת EncryptionService class
  - פונקציות encrypt/decrypt

#### שלב 2 (לאחר clarification):
- ⚠️ **משימה 20.1.2:** הגדרת SQLAlchemy Models (3 שעות)
  - תלוי בשאלה 1: אסטרטגיית מזהים (UUID vs ULID)
  
- ⚠️ **משימה 20.1.3:** הגדרת Pydantic Schemas (2 שעות)
  - תלוי ב-Models (20.1.2)
  
- ⚠️ **משימה 20.1.5:** מימוש Authentication Service (6 שעות)
  - תלוי בשאלה 2: JWT Structure
  
- **משימה 20.1.6:** מימוש Password Reset Service (4 שעות)
  - יכול להתחיל עם Mock
  
- **משימה 20.1.7:** מימוש API Keys Service (4 שעות)
  
- **משימה 20.1.8:** מימוש API Routes (5 שעות)
  
- **משימה 20.1.9:** עדכון OpenAPI Spec (3 שעות)

**סה"כ זמן משוער:** 33 שעות (4-5 ימי עבודה)

---

### 2. צוות 30 (Frontend) - קריטי ⭐

**תפקיד:** מימוש Pixel Perfect מול Design Tokens בלבד

**משימות ראשיות:** 7 משימות

**תלויות:**
- ❌ תלוי ב-OpenAPI Spec (משימה 20.1.9)
- ❌ תלוי ב-AuthService (משימה 20.1.5)

#### משימות:
- **משימה 30.1.1:** יצירת Auth Service (Frontend) (3 שעות)
- **משימה 30.1.2:** יצירת Login Component (D15) (4 שעות)
- **משימה 30.1.3:** יצירת Register Component (D15) (4 שעות)
- **משימה 30.1.4:** יצירת Password Reset Flow (D15) (5 שעות)
- **משימה 30.1.5:** יצירת API Keys Management (D24) (6 שעות)
- **משימה 30.1.6:** יצירת Security Settings View (D25) (4 שעות)
- **משימה 30.1.7:** יצירת Protected Routes (2 שעות)

**סה"כ זמן משוער:** 28 שעות (3-4 ימי עבודה)

**מועד התחלה:** לאחר השלמת משימות 20.1.5 ו-20.1.9

---

### 3. צוות 40 (UI Assets) - חשוב

**תפקיד:** יצירת Design Tokens ו-Styles

**משימות ראשיות:** 2 משימות

#### משימות (יכול להתחיל עכשיו):
- ✅ **משימה 40.1.1:** יצירת Design Tokens (2 שעות)
  - `design-tokens/auth.json`
  - `design-tokens/forms.json`
  
- ✅ **משימה 40.1.2:** יצירת Auth Components Styles (3 שעות)
  - Styling ל-LoginForm
  - Styling ל-RegisterForm
  - Styling ל-PasswordReset forms
  - Responsive design

**סה"כ זמן משוער:** 5 שעות (יום עבודה אחד)

**מועד התחלה:** יכול להתחיל עכשיו (לא תלוי)

---

### 4. צוות 50 (QA) - חשוב

**תפקיד:** ולידציה של Evidence בתיקייה 05-REPORTS/artifacts

**משימות ראשיות:** 2 משימות

#### משימות (יכול להתחיל עכשיו):
- ✅ **משימה 50.1.1:** יצירת Test Scenarios (3 שעות)
  - Login flow tests
  - Register flow tests
  - Password reset flow tests
  - API Keys CRUD tests
  - Error scenarios
  
- ✅ **משימה 50.1.2:** יצירת Sanity Checklist (2 שעות)
  - Checklist ל-DB schema
  - Checklist ל-API endpoints
  - Checklist ל-UI components
  - Checklist ל-security

**סה"כ זמן משוער:** 5 שעות (יום עבודה אחד)

**מועד התחלה:** יכול להתחיל עכשיו (על בסיס המפרט)

---

## 🚦 תלויות וסדר ביצוע

### Critical Path:
```
DB Schema (20.1.1) 
  → Models (20.1.2) ⚠️ תלוי בשאלה 1
    → Schemas (20.1.3)
      → AuthService (20.1.5) ⚠️ תלוי בשאלה 2
        → OpenAPI Spec (20.1.9)
          → Frontend Auth Service (30.1.1)
            → Components (30.1.2-30.1.7)
```

### Parallel Work (יכול להתחיל עכשיו):
- ✅ **Encryption Service (20.1.4)** - במקביל ל-Models
- ✅ **Design Tokens (40.1.1-40.1.2)** - במקביל לכל
- ✅ **Test Scenarios (50.1.1-50.1.2)** - במקביל לכל

---

## 📊 סיכום לפי מועד התחלה

### יכול להתחיל עכשיו (שלב 1):
1. **צוות 20 (חלקי):**
   - משימה 20.1.1: DB Schema verification
   - משימה 20.1.4: Encryption Service

2. **צוות 40 (מלא):**
   - משימה 40.1.1: Design Tokens
   - משימה 40.1.2: Auth Components Styles

3. **צוות 50 (מלא):**
   - משימה 50.1.1: Test Scenarios
   - משימה 50.1.2: Sanity Checklist

### ממתין ל-clarification (שלב 2):
1. **צוות 20 (המשך):**
   - כל שאר המשימות (לאחר תשובות לשאלות 1 ו-2)

2. **צוות 30 (מלא):**
   - כל המשימות (לאחר OpenAPI Spec ו-AuthService)

---

## ⚠️ חסמים להפעלה

### Blockers קריטיים:
1. **שאלה 1:** אסטרטגיית מזהים (UUID vs ULID)
   - חוסם: משימה 20.1.2 (Models)
   
2. **שאלה 2:** JWT Structure
   - חוסם: משימה 20.1.5 (AuthService)

### Non-Blockers:
3. **שאלה 3:** SMS Provider (יכול להתחיל עם Mock)
4. **שאלה 4:** Email Provider (יכול להתחיל עם Mock)

---

## 🎯 המלצה להפעלה

### אפשרות מומלצת: הפעלה מדורגת (Phased Activation)

**שלב 1 (עכשיו):**
- ✅ צוות 20: משימות 20.1.1, 20.1.4
- ✅ צוות 40: כל המשימות
- ✅ צוות 50: כל המשימות

**שלב 2 (לאחר clarification):**
- ⚠️ צוות 20: כל שאר המשימות
- ⚠️ צוות 30: כל המשימות

**יתרונות:**
- ניצול זמן בזמן המתנה ל-clarification
- התקדמות במשימות לא-תלויות
- הפחתת סיכון

---

## 📈 Timeline משוער

### Phase 1.1 (DB & Backend Foundation): 2 ימים
- יום 1: DB Schema + Encryption Service (צוות 20)
- יום 2: Design Tokens + Styles (צוות 40) + Test Scenarios (צוות 50)

### Phase 1.2 (לאחר clarification): 2 ימים
- יום 3: Models + Schemas + AuthService (צוות 20)
- יום 4: PasswordReset + ApiKey Services (צוות 20)

### Phase 1.3 (API Routes): 1 יום
- יום 5: Routes + OpenAPI Spec (צוות 20)

### Phase 1.4 (Frontend): 2 ימים
- יום 6: Auth Service + Login/Register Components (צוות 30)
- יום 7: Password Reset + API Keys + Security View (צוות 30)

### Phase 1.5 (QA & Polish): 1 יום
- יום 8: Testing + Bug fixes + Documentation

**סה"כ:** 8 ימי עבודה (6 ימים לאחר clarification)

---

## ✅ סיכום

**צוותים נדרשים לשלב הראשון:**
1. ✅ **צוות 20 (Backend)** - קריטי, יכול להתחיל חלקית עכשיו
2. ⏸️ **צוות 30 (Frontend)** - קריטי, ממתין ל-Backend
3. ✅ **צוות 40 (UI Assets)** - חשוב, יכול להתחיל עכשיו
4. ✅ **צוות 50 (QA)** - חשוב, יכול להתחיל עכשיו

**מוכנות להפעלה:** 🟡 חלקית (3 מתוך 4 צוותים יכולים להתחיל)

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ✅ TEAMS IDENTIFIED & READY FOR ACTIVATION
