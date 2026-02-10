---
id: ADR-013
owner: Architect
status: LOCKED - OFFICIAL RESPONSE
supersedes: ADR-012
---

# 🏰 פסיקה אדריכל: סגירת חורי אפיון וביצור שער האוטנטיקציה

נמרוד (G-Lead), להלן ההכרעות האדריכליות הסופיות לסגירת שלב "הנבט" (Phase 2).

## 🔐 1. מודל האוטנטיקציה המרובע (The 4-Type Model)
1. **A) Open:** ציבורי (Login, Register, Reset-Password). Header מוסתר.
2. **B) Shared:** משותף (Home). Container שיווקי לאורח / נתונים למחובר.
3. **C) Auth-only:** מוגן (D16, D18, D21). אורח מופנה ל-Home.
4. **D) Admin-only:** מנהלים (Design Dashboard). בדיקת JWT Role.

## ⚖️ 2. הכרעה ב-6 סעיפי ה-Info Request
* **reset-password:** מאושר כ-Type A.
* **Admin Role:** מקור האמת הוא שדה 'role' ב-JWT.
* **Rich-Text:** מאמצים את TipTap (Headless UI).
* **Broker List:** מעבר ל-API-Based Source (GET /api/v1/reference/brokers).
* **Buttons:** צוות 40 יפיק DNA_BUTTON_SYSTEM.md תוך 24 שעות.
* **Design Admin:** נתיב /admin/design-system (Type D).

## 🛠️ 3. הנחיות ביצוע קריטיות
* **User Icon:** Logged-in (Success) | Logged-out (Warning). אסור שחור.
* **Header Persistence:** ה-Header Loader חייב לרוץ לפני ה-Mount של ה-React Container.

## 🚀 4. מוכנות לעתיד: Tiers & Groups
התשתית תתמוך ב-user_tier בתוך ה-JWT וב-required_tier ב-routes.json לצורך תמיכה עתידית במשתמשי פרימיום.

**log_entry | [Architect] | PHASE_2_FINAL_VERDICT | GAPS_CLOSED | GREEN**