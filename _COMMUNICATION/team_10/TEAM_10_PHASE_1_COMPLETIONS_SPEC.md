# 📋 מפרט השלמות Phase 1 — דרישות ופרמטרי הצלחה

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50, Team 90 (ולצוותים 20/60 כנדרש)  
**תאריך:** 2026-02-09  
**הקשר:** השלמות נדרשות לאחר דוח `TEAM_90_TO_TEAM_10_PHASE_1_QA_INDEPENDENT_VERIFICATION` — Runtime/E2E עברו; שני נושאים נותרו להשלמה.

---

## 1. השלמה א' — בדיקה מלאה של רספונסיביות

**סטטוס:** ✅ **אומת** — Team 90 דיווח מעבר בדיקות רספונסיביות (Sticky Start/End) ב-E2E; 19/19 Pass. ראה `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_PHASE_1_QA_RESPONSIVE_VERIFICATION_UPDATE.md`.

### דרישה
- **כל הממשק בכל העמודים** חייב להיות רספונסיבי ואחיד (לא רק טבלאות).  
- **טבלאות D16, D18, D21:** Sticky Start/End (עמודות מזהה ופעולות מקובעות), Fluid עם clamp() לרוחב עמודות; איסור display:none.  
- מקור: ADR-010, `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`, תוכנית סגירה שלב 3.

### אחראים
**Team 90 + Team 50** — ביצוע בדיקות רספונסיביות (מכשירים שונים, רוחבי מסך, וידוא Option D).

### פרמטרי הצלחה
| פרמטר | הצלחה |
|--------|--------|
| כל העמודים (D16, D18, D21 + Dashboard, Profile) | layout רספונסיבי; אין שבירה או גלילה שבורה ברוחבים שונים. |
| טבלאות | Sticky Start/End פועל; עמודות עם clamp() מתכווצות/מתרחבות; אין הסתרת עמודות ב-display:none. |
| תיעוד | דוח/ארטיפקט המאשר מעבר בדיקות רספונסיביות (Team 90 או 50). |

---

## 2. השלמה ב' — מימוש נתוני בדיקה בכל הטבלאות הקיימות

**צ'קליסט להשלמה:** ראה `_COMMUNICATION/team_10/TEAM_10_PHASE_1_COMPLETION_B_CHECKLIST.md`.  
**סטטוס:** צוות 60 (גיבוי + seed) ✅ | צוות 50 (ולידציה) ✅ — תצוגה מאומתת. **התגלו בעיות וחוסרים** — תיעוד: `TEAM_10_PHASE_1_COMPLETION_B_FINDINGS_AND_FOLLOWUP.md`; הודעות מעקב: Team 20 (Brokers Fees POST 500), Team 30 (UI CRUD handlers).

### דרישה
**בכל טבלה בממשק שמוזנת מנתוני Backend — חייבים להיות נתוני בדיקה (seed)** כך שהמשתמש (ו-QA) רואים שורות בטאבל, לא טבלאות ריקות.

**טבלאות קיימות (סקופ Phase 1 / Financial Core) וכמויות מוגדרות:**

| עמוד | טבלת Backend | תיאור | רשומות נתוני בדיקה (מוגדר) |
|------|----------------|--------|------------------------------|
| D16 | `user_data.trading_accounts` | חשבונות מסחר | **3** |
| D18 | `user_data.brokers_fees` | עמלות ברוקרים | **6** |
| D21 | `user_data.cash_flows` | תזרים מזומנים | **10** |

הכמויות מוגדרות ב-`scripts/seed_test_data.py` (חובה לשמור עליהן unless משנים במפורש).

- נתוני בדיקה = שורות עם `is_test_data = true`, נוצרות ע"י סקריפטי Seed (SOP-011).  
- **נוהל חובה לפני הרצת seed:** (1) גיבוי לבסיס הנתונים — `python3 scripts/create_full_backup.py` (כולל אימות אוטומטי שהגיבוי תקין). (2) וידוא שהגיבוי הצליח (קוד 0 + "Backup verified"). (3) רק אז דחיפת הנתונים — `scripts/seed_qa_test_user.py` ואז `scripts/seed_test_data.py`, או `make db-backup-then-fill`. ראה `scripts/README_SEED_TEST_DATA.md`.

### אחראים (לפי מבנה ארגוני — CURSOR_INTERNAL_PLAYBOOK)
- **Team 60 (DevOps ובסיס נתונים):** גיבוי, seed, דיווח ל-Team 10. וידוא שסקריפטי ה-Seed מכסים את שלוש הטבלאות.  
- **Team 50 (QA):** ולידציה — אחרי הרצת seed, בדיקה בדפדפן שכל עמוד (D16, D18, D21) מציג **לפחות שורה אחת** בטאבל; אישור ל-Team 10.  
- **Team 10:** תיעוד — עדכון מפרט ההשלמות ורישום "השלמה ב' הושלמה" לאחר אישור צוות 50.  
- **Team 90:** בקרה חיצונית ויועץ (לא נדרש לאישור השלמה ב').

### פרמטרי הצלחה

| פרמטר | הצלחה |
|--------|--------|
| **סקריפטים** | `seed_test_data.py` מזין את שלוש הטבלאות (trading_accounts, brokers_fees, cash_flows) עם `is_test_data = true`. הרצה מסתיימת ב-0 והדפסת "Test data seeded successfully". |
| **לאחר הרצת seed** | ב-DB: בכל טבלה רלוונטית יש ≥1 שורה עם `is_test_data = true` (למשתמש QA / למשתמש שמזין את הממשק). |
| **בממשק (דפדפן)** | D16 — טבלת חשבונות מציגה שורות; D18 — טבלת עמלות מציגה שורות; D21 — טבלת תזרים מציגה שורות. לא "אין נתונים" / 0 רשומות כשמשתמש מחובר עם נתוני בדיקה. |
| **תיעוד** | Team 50 מאשר ל-Team 10 (הודעה ב-`team_50/`); Team 10 מעדכן את המפרט ורושם שהשלמה ב' הושלמה. |

### הערה
אם טבלה לא מקבלת נתונים בגלל פילטר (למשל רק משתמש מסוים) — יש לוודא שמשתמש הבדיקה (למשל TikTrackAdmin) מקושר לנתוני ה-seed. ראה `scripts/README_SEED_QA_USER.md` ו-`scripts/seed_test_data.py`.

---

## 2א. טבלאות נוספות במערכת (לא בסקופ seed נוכחי)

לפי `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — יש טבלאות נוספות; חלקן יידרשו נתוני בדיקה כשהעמודים/ה-API יופעלו.

### market_data (נתוני שוק — גלובליים)
| טבלה | תיאור | הערה |
|------|--------|------|
| **`market_data.tickers`** | **טבלת טיקרים** — מטא-דאטה (סימבול, בורסה, סקטור, תעשייה, ticker_type). קיימת ב-DDL. | טיקרים גלובליים (לא per-user). קישור למשתמש דרך `trades`, `trade_plans`, `alerts` (ticker_id). |
| `market_data.ticker_prices` | מחירי טיקרים (היסטוריה) | |
| `market_data.exchanges` | בורסות | |
| `market_data.sectors` | סקטורים | |
| `market_data.industries` | תעשיות | |
| `market_data.market_cap_groups` | קבוצות שווי שוק | |
| `market_data.external_data_providers` | ספקי נתונים חיצוניים | |
| `market_data.data_refresh_logs` | לוג רענון נתונים | |
| `market_data.intraday_data_slots` | סלוטים תוך-יומיים | |
| `market_data.system_trading_calendar` | לוח מסחר | |

### user_data (נתוני משתמש — נוסף על D16/D18/D21)
| טבלה | תיאור | seed נוכחי |
|------|--------|------------|
| `user_data.users` | משתמשים | משתמש QA: `seed_qa_test_user.py` |
| `user_data.password_reset_requests` | בקשת איפוס סיסמה | — |
| `user_data.user_api_keys` | מפתחות API למשתמש | — |
| `user_data.strategies` | אסטרטגיות מסחר | — |
| `user_data.trade_plans` | תוכניות מסחר (קשור ל-ticker_id) | — |
| `user_data.trades` | עסקאות (קשור ל-ticker_id, trading_account_id) | — |
| `user_data.executions` | ביצועים (מלאי) | — |
| `user_data.alerts` | התראות (ניתן לקשר ל-ticker_id) | — |
| `user_data.notes` | הערות (פולימורפי) | — |

**סיכום:** **טבלת הטיקרים קיימת:** `market_data.tickers`. אין טבלה נפרדת "טיקרים למשתמש" — אותה טבלה גלובלית; המשתמש מקושר לטיקרים דרך `user_data.trades`, `user_data.trade_plans`, `user_data.alerts` (שדה `ticker_id`). אם בעתיד יהיו עמודים/API ל-strategies, trades, alerts או לרשימת טיקרים — יידרש להרחיב את `seed_test_data.py` (כולל זריעת שורות ב-`market_data.tickers` אם רלוונטי) עם `is_test_data = true` בהתאם.

---

## 3. סיכום

| השלמה | דרישה בקצרה | פרמטר הצלחה עיקרי | סטטוס |
|--------|--------------|---------------------|--------|
| **א'** | רספונסיביות מלאה — Option D, כל העמודים והטבלאות | דוח מאשר: כל הממשק רספונסיבי; טבלאות Sticky + Fluid. | ✅ **אומת** (Team 90) |
| **ב'** | נתוני בדיקה בכל הטבלאות הקיימות (D16, D18, D21) | תצוגה אומתה ✅; **פערים:** Brokers Fees POST 500, UI CRUD לא ממומש — מעקב ב-FINDINGS_AND_FOLLOWUP. | ✅ תצוגה אומתה; פערים במעקב |

לאחר השלמת **השלמה ב'** — ניתן לרשום Phase 1 כ**סגור להשלמות** ולעבור לשלב 2 ללא דופי.

---

**log_entry | [Team 10] | PHASE_1_COMPLETIONS_SPEC | SENT | 2026-02-09**
