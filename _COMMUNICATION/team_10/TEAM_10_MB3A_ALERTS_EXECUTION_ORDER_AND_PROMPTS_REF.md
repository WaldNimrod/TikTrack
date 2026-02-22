# MB3A Alerts — סדר ביצוע ומיקום הפרומטים להפעלה
**project_domain:** TIKTRACK

**תאריך:** 2026-02-16  
**סטטוס Spy:** PASS — מותר להתקדם עם MB3A Alerts לפי השרשרת המוגדרת.  
**הערת משילות:** מסמכי team_90 ייווצרו/ייחתמו **רק ע"י Team 90** (יושרה טריטוריאלית).

---

## 1. סדר הביצוע (תרשים)

```
Gate-0 Alerts (10)     ✅ הושלם — Scope Lock, SSOT, Page Tracker
        ↓
Build — Team 31        פרומט ① (Blueprint/ממשק D34)
        ↓
Build — Team 30       פרומט ② (UI אינטגרציה) — תלות: 31
Build — Team 40       פרומט ③ (UI/סטיילינג) — תלות: 31; תאום 30
        ↓
Gate-A — Team 50      פרומט ④ (QA + Seal) — תלות: Build מוכן
        ↓
Gate-B — Team 90      פרומט ⑤ (בקשת Spy) — תלות: Gate-A PASS. **תוצר 90:** קובץ PASS/Seal ע"י Team 90 בלבד.
        ↓
Gate-KP — Team 10     פרומט ⑥ (קידום ידע, ארכיון, סגירת MB3A)
```

---

## 2. איפה הפרומטים — מיקום לפי סדר

| # | שלב | צוות | מיקום הפרומט | הערות |
|---|-----|------|----------------|--------|
| — | Gate-0 | 10 | הושלם | TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md קיים; SSOT/Page Tracker עודכנו. |
| ① | Build | **31** | [TEAM_10_MB3A_ALERTS_ACTIVATION.md](TEAM_10_MB3A_ALERTS_ACTIVATION.md) §2.2 | פרומט מלא בפנים. גרסה נפרדת: [TEAM_10_TO_TEAM_31_MB3A_ALERTS_BUILD_ACTIVATION.md](TEAM_10_TO_TEAM_31_MB3A_ALERTS_BUILD_ACTIVATION.md) |
| ② | Build | **30** | [TEAM_10_MB3A_ALERTS_ACTIVATION.md](TEAM_10_MB3A_ALERTS_ACTIVATION.md) §2.3 | פרומט מלא בפנים. גרסה נפרדת: [TEAM_10_TO_TEAM_30_40_MB3A_ALERTS_BUILD_PROMPTS.md](TEAM_10_TO_TEAM_30_40_MB3A_ALERTS_BUILD_PROMPTS.md) (סעיף Team 30) |
| ③ | Build | **40** | [TEAM_10_MB3A_ALERTS_ACTIVATION.md](TEAM_10_MB3A_ALERTS_ACTIVATION.md) §2.4 | פרומט מלא בפנים. גרסה נפרדת: [TEAM_10_TO_TEAM_30_40_MB3A_ALERTS_BUILD_PROMPTS.md](TEAM_10_TO_TEAM_30_40_MB3A_ALERTS_BUILD_PROMPTS.md) (סעיף Team 40) |
| ④ | Gate-A | **50** | [TEAM_10_MB3A_ALERTS_ACTIVATION.md](TEAM_10_MB3A_ALERTS_ACTIVATION.md) §2.5 | לאחר Build — דוח QA + Seal (SOP-013). פרומט מפורט יישלח עם מסירת Build. |
| ⑤ | Gate-B | **90** | [TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS.md](TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS.md) §2.2.4 | בקשת אימות Spy **לאחר** Gate-A PASS. **תוצר:** קובץ PASS/Seal ב-team_90 — רק ע"י Team 90. |
| ⑥ | Gate-KP | **10** | [TEAM_10_MB3A_ALERTS_ACTIVATION.md](TEAM_10_MB3A_ALERTS_ACTIVATION.md) §2.7 | קידום ידע, ארכיון, ניקוי — Team 10. |

---

## 3. מסמך ראשי להפעלה (כל הפרומטים במקום אחד)

**קובץ:** `_COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_ACTIVATION.md`

- **§2.2** — פרומט ל-Team 31 (Build Alerts)  
- **§2.3** — פרומט ל-Team 30 (UI אינטגרציה)  
- **§2.4** — פרומט ל-Team 40 (UI/סטיילינג)  
- **§2.5** — Gate-A (50) — תנאי + כיוון  
- **§2.6** — Gate-B (90) — כיוון  
- **§2.7** — Gate-KP (10)

---

## 4. קבצים נפרדים להעברה (לפי צוות)

| צוות | קובץ להעברה | תוכן |
|------|-------------|------|
| 31 | [TEAM_10_TO_TEAM_31_MB3A_ALERTS_BUILD_ACTIVATION.md](TEAM_10_TO_TEAM_31_MB3A_ALERTS_BUILD_ACTIVATION.md) | הפעלת Build Alerts; קישור למסמך המלא |
| 30 + 40 | [TEAM_10_TO_TEAM_30_40_MB3A_ALERTS_BUILD_PROMPTS.md](TEAM_10_TO_TEAM_30_40_MB3A_ALERTS_BUILD_PROMPTS.md) | שני הפרומטים (30, 40) — להעברה אחרי/בתיאום עם 31 |

---

## 5. קלט חובה לכל צוות Build

- **Scope Lock:** [TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md](TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md)  
- **Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/alerts_BLUEPRINT.html`  
- **תוכנית:** [TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md](TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md) §4  

---

## 6. צד שרת (Backend/API) — D34 Alerts

**מצב נוכחי:**

| רכיב | סטטוס | מקור |
|------|--------|------|
| **DB** | טבלה מוגדרת ב-DDL | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — טבלת `user_data.alerts` (id, user_id, target_type, target_id, ticker_id, alert_type, priority, condition_*, title, message, is_active, is_triggered, …). אין מיגרציה נפרדת ל-Alerts ב-MB3A; הטבלה חלק מה-DDL הראשי. |
| **API** | לא מוגדר ב-MB3A | אין חוזה OpenAPI ל-alerts ב-documentation/07-CONTRACTS; אין ראוטים ל-alerts ב-backend (רק `trigger_alert_id` ב-trades). |

**משמעות:** עמוד ההתראות (D34) יכול כרגע להיבנות כ-**UI בלבד** (mock/placeholder data) עד שיוגדר וימומש צד שרת.

**אפשרויות:**

1. **להמשיך בלי שרת (MB3A נוכחי):** UI לפי Blueprint + Scope Lock; נתונים מדומים. תיאום עם תיעוד API "כאשר יוגדר" (כפי ב-Scope Lock). Gate-A על UI בלבד.
2. **להוסיף שלב Backend Alerts:** לפני או במקביל ל-Build — (א) הגדרת חוזה OpenAPI ל-alerts (למשל GET /users/me/alerts, PATCH לפי צורך) — דרך Team 10/GIN אם נדרש שמות שדות; (ב) הפעלת **Team 20** לראוטים/שירותים ל-alerts. תוצר: API תואם DDL; 30/40 מתחברים ל-API אמיתי.

**אם בוחרים באפשרות 2:** יש להוסיף לשלב הביצוע "Backend Alerts — Team 20" (לאחר Gate-0, לפני או במקביל ל-Build 31→30/40). טיוטת הפעלה כללית ל-20 קיימת: [TEAM_10_TO_TEAM_20_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md](TEAM_10_TO_TEAM_20_MB3A_NOTES_ALERTS_ACTIVATION_DRAFT.md) — נדרש עדכון לפרומט Alerts ספציפי + הפניה ל-DDL ול-OpenAPI (או addendum) לאחר שיוגדר.

**החלטה:** דרך Team 10 (The Gateway). לאחר החלטה — לעדכן תוכנית §4 ו/או מסמך זה.

---

**log_entry | TEAM_10 | MB3A_ALERTS_EXECUTION_ORDER_REF | 2026-02-16**
