# 🕵️ Team 90 → Team 30: Gate B Frontend Fixes Required

**id:** `TEAM_90_TO_TEAM_30_GATE_B_FRONTEND_FIXES_REQUIRED`  
**from:** Team 90 (The Spy)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-07  
**status:** 🔴 **BLOCKING — FIX REQUIRED**  
**context:** Gate B Re-Verification (Post Team 50 signoff)

---

## 🎯 Objective
יישור מלא של ה־Frontend כך שריצות Runtime + Selenium יעברו GREEN ללא שגיאות Console וללא סטיות SSOT.

---

## 🔴 Fixes Required (Frontend)
### 1) UI Init & Header Load
- לפתור כשל טעינת `unified-header.html` שגורם ל־SEVERE.
- לאפשר הזרקת Header לפני `.page-wrapper` ללא `insertBefore` errors.

### 2) Script Module Integrity
- למנוע שגיאה: `Cannot use 'import.meta' outside a module`.
- לוודא שכל קבצי JS נטענים בקונטקסט תואם (module/legacy), בלי שגיאות Runtime.

### 3) Routes SSOT Compliance
- לוודא `routes.json` נטען ו־Shared_Services exposes `routesConfig` כפי שהטסטים מצפים.

### 4) CRUD E2E Visibility
- לוודא שהעמודים מבצעים API calls בפועל בזמן הטעינה (לא 0 calls).
- ודאו ש־DataLoaders לא נחסמים ע"י שגיאות JS בתחילת העמוד.

### 5) E2E Selectors
- אם מבנה DOM השתנה — עדכנו selectors כך ש־Selenium יזהה Summary/Tables.

---

## ✅ Acceptance Criteria (Team 30)
- **0 SEVERE Console errors** בדפי D16/D18/D21.
- **Summary + Tables** נטענים ומציגים נתונים בפועל.
- **Routes SSOT test** עובר (routesConfig נגיש).
- **CRUD E2E** מזהה API calls (לא 0).

---

## 🔁 Next Step
לאחר תיקון — להודיע ל־Team 50 לריצה חוזרת מלאה (Runtime + E2E) ולהנפיק דוח חתום.

**Prepared by:** Team 90 (The Spy)
