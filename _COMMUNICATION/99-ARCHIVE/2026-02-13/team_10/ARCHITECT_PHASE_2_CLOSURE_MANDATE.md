---
id: ADR-008
owner: Architect
status: LOCKED
supersedes: ARCHITECT_PHASE_2_FINAL_RESOLUTION_BLOCKERS.md
---

# 🏰 מנדט אדריכל: נעילת פייז 2 והנחיות Retrofit (v1.0)

**מאת:** אדריכלית גשר (Gemini)
**אל:** כל הצוותים (10-90)
**נושא:** פסיקה סופית בנושאי רספונסיביות, נתונים וחלוקת אחריות
**סטטוס:** 🔒 **FINAL SEAL** | **תאריך:** 2026-02-09

---

## ⚖️ 1. הכרעות ה-Retrofit (הצעד הבא)

### א. אסטרטגיית רספונסיביות (Option D - Sticky Isolation)
חובה ליישם ב-100% מהטבלאות (D16, D18, D21, D23):
* **Sticky Start:** עמודת הזהות מקובעת (inset-inline-start: 0).
* **Sticky End:** עמודת הפעולות מקובעת (inset-inline-end: 0).
* **Fluid Weights:** שימוש ב-clamp() לרוחב עמודות נתונים.
* **איסור:** חל איסור מוחלט על display: none להסתרת עמודות במובייל.

### ב. ניהול נתונים (Seeding Policy)
מעבר לניהול נתונים מבוסס קוד (Python Seeders):
* **Test Data:** כל נתון דמה יקבל פלאג is_test_data = true.
* **Wipe Control:** צוות 60 יספק פקודת make db-clean המוחקת רק נתוני טסט.
* **Presentation:** נדחה לשלב מאוחר יותר (Deferred).

---

## 👥 2. חלוקת אחריות Frontend (SLA 30/40)

כדי להבטיח Pixel Perfect ומהירות ביצוע:
* **צוות 40 (UI Assets):** אחראי בלעדי על **Presentational Components**. רכיבים "טיפשים" ב-React, ללא לוגיקה, תואמי Blueprint ב-100%.
* **צוות 30 (Frontend):** אחראי על **Container Components**. הזרקת לוגיקה, API, State וניהול ה-Bridge לתוך הרכיבים שסיפק צוות 40.

---

## 🛡️ 3. שערי הולידציה (Quality Gates)

סדר האישור המחייב לכל רכיב:
1. **Gate A (צוות 50):** בדיקה אוטומטית מלאה (0 SEVERE).
2. **Gate B (צוות 90):** בדיקת משילות, חוזים ו-SSOT (המרגל).
3. **Gate C (G-Lead - נמרוד):** בדיקה ידנית אנושית סופית (Human-Only).

---

## 🚀 4. פסיקה בנושא Endpoints חסרים
* **החלטה:** Option A (Implement).
* צוות 20 יממש ב-Backend את ה-Summary ל-Brokers ואת ה-Conversions ל-Cash Flows. 

---
**log_entry | [Architect] | PHASE_2_LOCKED | RETROFIT_INITIATED | GREEN | 2026-02-09**