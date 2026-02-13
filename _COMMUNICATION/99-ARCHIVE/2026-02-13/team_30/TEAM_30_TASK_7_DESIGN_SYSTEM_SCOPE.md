# Team 30: משימה 7 — דף טבלת צבעים דינמית — היקף וייחוס

**מאת:** Team 30 (Frontend Integration)  
**תאריך:** 2026-02-10  
**הקשר:** `TEAM_10_TO_ALL_TEAMS_NEXT_PHASE_AFTER_GATE_A_KICKOFF.md` — משימה 7  
**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` — משימה 6

---

## 1. בסיס התוכן (מקור)

**דף הדגמה זמני** שנוצר עם Team 40:

- **מיקום:** `_COMMUNICATION/team_40/demos/button-system-demo.html`
- **תוכן:** פלטת צבעים סטאטית (63 משתנים) + דוגמאות כפתורים
- **מבנה:** קטגוריות (Brand, Entity, Message, Investment, Numeric, Base, Border) + רשימת מחלקות כפתור
- **SSOT:** נטען מ־`phoenix-base.css`, `D15_DASHBOARD_STYLES.css`, `D15_IDENTITY_STYLES.css`, `phoenix-modal.css`

---

## 2. דרישת יישום

**להמיר** את התוכן מדף HTML סטטי לדף **סטנדרטי ודינמי** תחת מערכת הקונטיינרים:

| פריט | דרישה |
|------|--------|
| **Route** | `/admin/design-system` (Type D — Admin-only) |
| **מבנה** | `tt-container` > `tt-section` — כמו שאר העמודים |
| **רכיב** | `DesignSystemDashboard.jsx` (כבר קיים כ-placeholder) |
| **דינמיות** | קריאת משתני CSS מ־`phoenix-base.css` (או computed) — טבלת צבעים דינמית |
| **כפתורים** | שימוש בדוגמאות מ־`button-system-demo.html` כמקור |

---

## 3. קבצי רפרנס

| קובץ | שימוש |
|------|--------|
| `_COMMUNICATION/team_40/demos/button-system-demo.html` | בסיס תוכן — פלטה + כפתורים |
| `ui/src/styles/phoenix-base.css` | SSOT למשתני צבע (שורות 132–320 בערך) |
| `_COMMUNICATION/team_40/DNA_BUTTON_SYSTEM.md` | SSOT מחלקות כפתור |
| `ui/src/components/admin/DesignSystemDashboard.jsx` | רכיב יעד — להחליף placeholder |

---

## 4. תוצרי יישום

1. `DesignSystemDashboard.jsx` — רכיב מלא עם `tt-container` / `tt-section`
2. קטע פלטה — טבלה דינמית של משתני צבע (parse מ-CSS או computed)
3. קטע כפתורים — דוגמאות כפתורים לפי DNA_BUTTON_SYSTEM
4. Route `/admin/design-system` — Type D, מוגן ב־ProtectedRoute + `requireAdmin`

---

**Team 30 (Frontend)**  
**log_entry | TASK_7_DESIGN_SYSTEM_SCOPE | 2026-02-10**
