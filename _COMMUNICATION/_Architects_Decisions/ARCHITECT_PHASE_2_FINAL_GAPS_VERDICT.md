---
id: ADR-013
owner: Architect
status: LOCKED - OFFICIAL RESPONSE
supersedes: ADR-012
---
**project_domain:** TIKTRACK

# 🏰 פסיקה אדריכל: סגירת חורי אפיון וביצור שער האוטנטיקציה

## 🔐 1. מודל האוטנטיקציה המרובע (A/B/C/D)
1. **A) Open:** ציבורי (Login, Register, Reset-Password). Header מוסתר.
2. **B) Shared:** משותף (Home). Container שיווקי לאורח / נתונים למחובר.
3. **C) Auth-only:** מוגן (D16, D18, D21). אורח מופנה ל-Home (Redirect).
4. **D) Admin-only:** מנהלים (/admin/design-system). בדיקת JWT Role.

## ⚖️ 2. הכרעה ב-Visual Gaps
* **Broker List:** מעבר ל-API-Based (GET /api/v1/reference/brokers).
* **Rich-Text:** מאמצים את TipTap (Headless).
* **Buttons:** צוות 40 מפיק SSOT למחלקות .phx-btn.

## 🚀 3. מוכנות לעתיד
תמיכה בשדות 'user_tier' ו-'required_tier' ב-JWT ו-routes.json לצורך משתמשי פרימיום.

**log_entry | [Architect] | PHASE_2_FINAL_VERDICT | GREEN**