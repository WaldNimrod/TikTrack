# 🔒 אסטרטגיה מפורטת: Phase 1.8 - Infrastructure & Retrofit

**מאת:** אדריכלית גשר (Gemini)
**אל:** צוות 10 (The Gateway)
**נושא:** פסיקה בשאלות פתוחות ופירוט משימות לצוותי הביצוע
**סטטוס:** 🔒 **LOCKED & MANDATORY**

---

## ⚖️ 1. פסיקה בשאלות הבהרה (Clarifications)

### א. סדר העדיפויות (Strict Order)
אנחנו פועלים בשיטת "מצודת הידע":
1. **שלב 1: נעילת חוזים (The Contract Lock):** השלמת PDSC Boundary ו-UAI External JS Contract. (יעד: 48 שעות).
2. **שלב 2: בניית המנוע (Core Construction):** מימוש פיזי של ה-UAI Engine ו-PDSC Client/Server.
3. **שלב 3: הסבה (Retrofit):** רק כשהמנוע יציב, מעבירים עמודים קיימים ל-UAI.

### ב. UAI ו-Inline JS
* **החלטה:** חובה להשלים את המעבר ל-External JS (`pageConfig.js`) לפני תחילת ה-Retrofit. 
* **Namespace:** נעילה על `window.UAI.config`.

### ג. PDSC Boundary
* **החלטה:** החוזה המשותף (`TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`) הוא תנאי סף לכתיבת הקוד.

---

## 🛠️ 2. פירוט משימות לצוותים (להפצה ע"י צוות 10)

### 🌐 צוות 20 (Backend)
- **משימה:** מימוש ה-PDSC Server ב-Python.
- **תוצר:** מערכת Error Schema אחידה (JSON) ו-Validation Schemas (Pydantic).
- **דגש:** ה-API חייב לעבוד לפי ה-OpenAPI SSOT המעודכן.

### ⚛️ צוות 30 (Frontend)
- **משימה:** בניית ה-UAI Engine ו-PDSC Client (`Shared_Services.js`).
- **תוצר:** Lifecycle של 5 שלבים עובד ב-Browser.
- **ריטרופיט:** הסבת Dashboard ראשון (הפיילוט).

### 🎨 צוות 40 (Design)
- **משימה:** הטמעת ה-CSS Verifier ב-DOMStage.
- **תוצר:** ודאו שכל העמודים הקיימים (D15) נטענים בסדר: Pico -> Base -> Components.

### 🛡️ צוות 50 (QA)
- **משימה:** בניית "בוחן שלב 1.8".
- **תוצר:** צ'ק-ליסט אימות ל-UAI (האם כל עמוד מעלה Banner של ה-Verifier?).

---

**log_entry | [Architect] | INFRA_DETAILED_STRATEGY | GATEWAY_READY | GREEN | 2026-02-07**