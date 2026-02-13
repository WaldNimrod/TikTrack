# 📡 Team 90 → Team 10: הפעלת תהליך (ADR‑013 + SLA 30/40) — הודעה מרכזית אחת

**מאת:** Team 90 (The Spy)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026‑02‑10  
**סטטוס:** 🔒 **MANDATORY — ההודעה היחידה להפעלת התהליך**

---

## ✅ החלטות האדריכלית (LOCKED)

### ADR‑013 — פסיקה סופית (Auth + Gaps Closure)
**מסמך:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`

כולל: Auth Model 4‑Type, TipTap, Broker API, Admin role (JWT), Design Admin route, User Icon, Header Loader לפני React mount.

### Pre‑coding Mapping Mandate
**מסמך:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`

קבצי מיפוי **חובה** לפני קוד:
- **DATA_MAP_FINAL.json** (Team 20/30)
- **CSS_RETROFIT_PLAN** (Team 40)
- **ROUTES_MAP A/B/C/D** (Team 10)

### SLA 30/40 — SSOT מחייב
**מסמך:** `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`

- **צוות 40:** Presentational בלבד (0% Logic, 0% API).
- **צוות 30:** Containers / Logic / API בלבד.
- **איסור מוחלט:** קריאות API בתיקיות UI.

---

## ✅ החלטות היישום המחייבות (לשלב בתוכנית)

### 🔐 Auth Model (4‑Type)
| טיפוס | Routes / עמודים | התנהגות |
|--------|------------------|----------|
| **A) Open** | /login, /register, /reset-password | Header **מוסתר** |
| **B) Shared** | Home | שיווקי לאורח + נתונים למחובר |
| **C) Auth‑only** | D16, D18, D21 (וכן עמודים מוגנים אחרים) | אורח → **Home** |
| **D) Admin‑only** | /admin/design-system | JWT role; אחר → redirect/403 |

- **User Icon:** Success / Warning בלבד — **אסור שחור**.
- **Header Loader:** חייב לרוץ **לפני** React mount.

### ✅ החלטות תשתית/UI נוספות
| נושא | החלטה |
|------|--------|
| **Rich‑Text** | TipTap (Headless UI) |
| **Broker List** | API **GET /api/v1/reference/brokers** |
| **Buttons** | Team 40 מפיק **DNA_BUTTON_SYSTEM.md** תוך **24 שעות** |
| **Design Admin Dashboard** | **/admin/design-system** (Type D) |

---

## 🔒 שלב חובה: Pre‑coding Mapping (Blocking)

**אין להתחיל קידוד לפני:**
1. קובצי מיפוי מלאים (DATA_MAP_FINAL.json, CSS_RETROFIT_PLAN, ROUTES_MAP A/B/C/D).
2. **אישור ויזואלי של נמרוד** על המיפוי.
3. עדכון תוכנית העבודה בהתאם.

---

## 📌 מסמכים מחייבים (קישורים לכל מקורות האמת)

**מסמכים אדריכליים (מקור רשמי):**
| נושא | מסמך / נתיב |
|------|--------------|
| **ADR‑013 (Final Verdict)** | `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` |
| **Pre‑coding Mapping Mandate** | `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md` |

**יתר מסמכים:**
| נושא | מסמך / נתיב |
|------|--------------|
| **SLA 30/40 (SSOT)** | `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md` |
| **Work Plan (Team 10)** | `_COMMUNICATION/team_10/TEAM_10_VISUAL_GAPS_WORK_PLAN.md` |
| **Open Questions (Team 10)** | `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_VISUAL_GAPS_OPEN_QUESTIONS.md` |
| **Supplement Info (Team 10)** | `_COMMUNICATION/team_10/TEAM_10_VISUAL_GAPS_SUPPLEMENT_INFO_REPORT.md` |
| **Team 90 Visual Gaps Tasks** | `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_ADDITIONAL_VISUAL_GAPS_TASKS.md` |
| **Auth UI Requirements** | `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_30_AUTH_ACCESS_UI_REQUIREMENTS.md` |
| **Routes SSOT** | `ui/public/routes.json` |
| **Page Tracker** | `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` |

---

## ✅ דרישות פעולה מצוות 10 (מיידי)

1. **לעדכן** את תוכנית העבודה לפי ADR‑013 (Auth Model, TipTap, Broker API, Admin Route, Header Loader).
2. **להיכנס למצב MAPPING_MODE** ולהשלים את שלושת קבצי המיפוי.
3. **לא לאשר קידוד** לפני אישור מיפוי ויזואלי (נמרוד).
4. **להוציא הנחיות** לצוותים בהתאם לחלוקת SLA 30/40.
5. **להפיק דוח עדכון** אל Team 90 לפני פנייה לאדריכלית.  
   *(Team 90: אם תרצו, נבדוק את העדכונים לפני שליחה לאדריכלית.)*

---

**Team 90 (The Spy)**  
**log_entry | ADR_013_SLA_ACTIVATION | MANDATORY | 2026-02-10**
