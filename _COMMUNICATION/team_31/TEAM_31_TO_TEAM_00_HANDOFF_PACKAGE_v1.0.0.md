# Team 31 → Team 00: חבילת Handoff — הפעלת צוות 31 החדש
date: 2026-03-15

**from:** Team 31 (Blueprint)  
**to:** Team 00 (האדריכלית הראשית)  
**date:** [למלא בתאריך מסירת החבילה]  
**id:** TEAM_31_TO_TEAM_00_HANDOFF_PACKAGE  
**version:** v1.0.0  
**מטרה:** לאפשר להגדיר ולהפעיל את צוות 31 החדש בצורה חלקה ומלאה בהתבסס על הידע והניסיון שצבר צוות 31.

---

## 1. תפקיד צוות 31 (Blueprint)

| היבט | תיאור |
|------|--------|
| **תפקיד** | ייצור **בלופרינטים ויזואליים** (HTML/CSS סטטי) — תבניות עיצוביות לעמודים ולמודולים. |
| **לא באחריות** | קוד ליבה של עמודים, לוגיקת נתונים, אינטגרציית API, סקריפטים בתוך HTML, המצאת שמות שדות. |
| **מסירה** | Blueprint מועבר ל-**Team 30 / Team 40** למימוש; תיאום דרך **Team 10 (The Gateway)**. |
| **מקורות** | אפיון קיים, Legacy HTML/JS למיפוי מבנה, סגנונות קיימים במערכת (קישור אליהם). |

---

## 2. עקרונות מחייבים (Governance)

- **Fluid Design:** רספונסיביות (clamp, min/max, Grid) — ללא Media Queries מיותרים.
- **Design Tokens SSOT:** `phoenix-base.css` בלבד.
- **Clean Slate Rule:** אין JavaScript בתוך HTML; אין `style` inline — רק classes ו-`data-action` ללוגיקה חיצונית.
- **LEGO System:** מבנה מודולרי — `tt-container` > `tt-section` > `tt-section-row`.
- **Blueprint = תבנית עיצובית:** mock data בלבד; שימוש בסגנונות קיימים (קישור לקבצי CSS במערכת).
- **נקודת אמת לעמודים:** `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`, `TT2_OFFICIAL_PAGE_TRACKER.md` — עדכון בתיאום עם Team 10.

**תיעוד חובה למסירת Blueprint:**  
`documentation/05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md` (או מקבילו ב־docs-governance).

---

## 3. מיקום העבודה והתוצרים

### 3.1 סאנדבוקס (מקור אמת לכל הבלופרינטים)

| פריט | נתיב |
|------|------|
| **אינדקס הסאנדבוקס** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/index.html` |
| **תיקיית הבלופרינטים** | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/` |
| **מוסכמת שמות** | כל קובץ Blueprint מסתיים ב־`_BLUEPRINT.html` (ללא תחיליות D15, D16 וכו'). |

**פתיחת האינדקס:** לפתוח את `index.html` בדפדפן (יחסית ל-repo או דרך שרת סטטי) — כל הקישורים שם פעילים.

### 3.2 תבניות עמוד (Templates)

| קובץ | תיאור |
|------|--------|
| `sandbox_v2/D15_PAGE_TEMPLATE_V2.html` | תבנית בסיסית V2 |
| `sandbox_v2/D15_PAGE_TEMPLATE_V3.html` | תבנית V3 **נעולה וסופית** — מוכנה למימוש צוות 30 |
| `sandbox_v2/D15_PAGE_TEMPLATE_FULL_V2.html` | תבנית מלאה V2 (מבוססת יישום 30/40) |

### 3.3 קבצי תיעוד רלוונטיים (תיקיית team_31)

- **Handoff זה:** `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_00_HANDOFF_PACKAGE_v1.0.0.md`
- **תשובה P3-003 Scope/Drift:** `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_10_P3_003_SCOPE_AND_DRIFT_RESPONSE.md` אם קיים; אחרת: `_COMMUNICATION/99-ARCHIVE/2026-02-15/team_31/TEAM_31_TO_TEAM_10_P3_003_SCOPE_AND_DRIFT_RESPONSE.md`.
- **Gate-0 Notes (D35):** `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_10_MB3A_GATE0_NOTES_SCOPE_INPUT.md`
- **Build Alerts (D34):** `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_10_MB3A_ALERTS_BUILD_ACK_AND_HANDOFF.md`

**ארכיון (תיעוד היסטורי):**  
תיעוד נוסף של צוות 31 הועבר ל־`_COMMUNICATION/99-ARCHIVE/2026-02-15/team_31/` — כולל משלוחי שלב 2, טמפלייט V3, ספצים (Notes, Alerts, Executions, User Ticker, Tickers), וניתוחי מודולים. רשימת קבצים: חיפוש לפי `team_31` תחת `99-ARCHIVE`.

---

## 4. סטטוס משימות — עדכון לפי אינדקס הסאנדבוקס

### 4.1 הושלם ואושר / הושלם

| קטגוריה | פריטים |
|---------|--------|
| **תבניות** | D15_PAGE_TEMPLATE_V2, V3 (נעול), FULL_V2 |
| **Auth + דשבורד + פרופיל** | index, login, register, reset_password, user_profile, user_profile_view |
| **נתונים** | trading_accounts, brokers_fees, cash_flows, tickers, alerts, notes, user_ticker, executions |
| **תכנון/מעקב** | trade_plans, trades, watch_lists |
| **מודולים (Modals)** | modal_add_edit, modal_add_edit_complex, modal_view_details, modal_confirmation, modal_linked_items, modal_trade_full_details |

### 4.2 סלוט — לא התחיל (לפי אינדקס)

- **הגדרות/נתונים:** data_import, tag_management, preferences, system_management, management  
- **מתקדם:** ai_analysis, ticker_dashboard, trading_journal, strategy_analysis, trades_history, portfolio_state, research, api_keys, securities  

(יישור ל-Scope/Drift: ראה TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX ו־TEAM_31_TO_TEAM_10_P3_003_SCOPE_AND_DRIFT_RESPONSE.)

### 4.3 מיני-באצ'ים (MB3A — Notes & Alerts)

- **Notes (D35):** Gate-0 תועד; Blueprint קיים — `notes_BLUEPRINT.html`; מסירה ל-30/40 ו-Gate-A/B/KP לפי תוכנית Team 10.
- **Alerts (D34):** Gate-0 ננעל; Build — Blueprint מסור ל-30/40 (TEAM_31_TO_TEAM_10_MB3A_ALERTS_BUILD_ACK_AND_HANDOFF); המשך Gate-A → Gate-B → Gate-KP אצל Team 10/50/90.

---

## 5. קישורים לתיעוד מערכת (מחוץ ל-team_31)

| מסמך | נתיב (יחסית לשורש הריפו) |
|------|----------------------------|
| **SSOT עמודים** | `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md` |
| **Page Tracker** | `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` |
| **מטריצת Scope/Drift** | `_COMMUNICATION/team_10/TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md` |
| **דרישות מסירת Blueprint** | `documentation/05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md` (או מקביל ב־docs-governance) |
| **SLA 30/40** | `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md` (או מקביל) |
| **Governance / Bible** | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (או 09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md לפי מבנה נוכחי) |
| **נוהל Handoff Blueprint** | `documentation/05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md` |
| **Routes** | `ui/public/routes.json` |

---

## 6. תהליך עבודה מומלץ לצוות 31 החדש

1. **קבלת מנדט:** מ-Team 00 / Team 10 — עמוד או מודול ל-Blueprint; תנאי Gate-0 אם רלוונטי.
2. **נעילת סקופ:** תיאום עם Team 10 ל-Scope Lock (קובץ ייעודי כגון TEAM_10_MB3A_*_SCOPE_LOCK.md) ועדכון SSOT/Page Tracker.
3. **בניית Blueprint:** ב־`team_31_staging/sandbox_v2/`; קישור ל-CSS קיים; LEGO; mock data; ללא inline styles/scripts; `data-action` לפעולות.
4. **עדכון אינדקס:** הוספת שורה ב־`sandbox_v2/index.html` עם קישור וסטטוס.
5. **מסירה:** מסמך מסירה קצר ל-Team 10 + מסירת Blueprint ל-30/40; סגירה עם Seal (SOP-013) לפי נוהל.

---

## 7. סיכום

- **תפקיד:** Blueprint בלבד — תבניות ויזואליות למימוש בידי 30/40.  
- **מקור אמת לתוצרים:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/index.html` וקבצי `*_BLUEPRINT.html` באותה תיקייה.  
- **סטטוס:** עשרות בלופרינטים הושלמו (עמודים + מודולים); יתר רשומים כסלוט באינדקס; MB3A Notes/Alerts במסלול שערים (10/50/90).  
- **תיעוד היסטורי:** `_COMMUNICATION/99-ARCHIVE/2026-02-15/team_31/` (ובתיקיית team_31_staging שם).

חבילה זו מאפשרת ל-Team 00 להפעיל את צוות 31 החדש עם גישה מלאה למיקומים, לעקרונות ולסטטוס המשימות.

---

**log_entry | TEAM_31 | TO_TEAM_00 | HANDOFF_PACKAGE_v1.0.0 | [date]**
