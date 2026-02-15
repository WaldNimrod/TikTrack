---
id: TEAM_70_HISTORICAL_DIFFERENTIATION
owner: Team 70 (Product Intelligence)
status: DRAFT
context: TEAM_70_DIRECTIVE_NARRATIVE_PRODUCTION — Task 2
base: PI_STRATEGIC_NARRATIVE_REPORT.md
date: 2026-02-15
---

# הבדלה היסטורית: POC (המורשת) vs פיניקס

## עיקרון
**"הטכנולוגיה חדשה, הניסיון הוא של שנים."**  
פיניקס הוא Materialization של ניסיון מבצעי — לא כתיבה מאפס.

---

## מה עובר מה-POC (המורשת)

| נכס | תיאור |
|-----|--------|
| **לוגיקת עסקים** | זרימות משתמש מוכחות: הרשמה, כניסה, ניהול חשבונות, תזרימים |
| **מודל נתונים** | ישויות: Trading Account, Broker, Fees, Cash Flow, Ticker, Trade |
| **הבנת המשתמש** | סוחרים, משקיעים, מנהלי תיק — ICP מוכח |
| **תרחישי מסחר** | תוכניות טרייד, יומן, ביצועים — זרימות מוכרות מה-POC |
| **מושגים** | "הטיקרים שלי", "דשבורד נתונים", "ניתוח אסטרטגיות" |

---

## מה בלעדי לפיניקס

| נכס | תיאור |
|-----|--------|
| **Unified Shell** | ממשק אחיד — כל העמודים עובדים באותו אופן. אין "עמודים שונים לגמרי" |
| **Bridge (HTML ↔ React)** | חוויה נזילה — React ו-HTML חיים יחד. מעבר חלק, לא שתי מערכות |
| **דיוק מוגבר** | NUMERIC(20,8) — אפס טעויות עיגול. סטנדרט בנקאי |
| **Cache-first** | נתוני שוק תמיד זמינים. לעולם לא חוסם את ה-UI |
| **Governance LOD 400** | Evidence gates — לא סוגרים בלי הוכחה. משמעת איכות |
| **PDSC Boundary** | API boundary ברור — UI לא קורא ל-API ישירות. אבטחה ונקיות |
| **RTL מלא** | עברית ראשית — לא תרגום מאוחר |
| **Provider-agnostic mapping** | Yahoo + Alpha, עם fallback — לא תלות ביחיד |
| **Smart History Fill** | מילוי פערים אוטומטי — 250 ימי מסחר, Gap-first |

---

## המסר לשיווק ולמשקיעים

- **מ-POC:** "למדנו מה עובד. המשתמשים הכירו את הזרימות."
- **מ-Phoenix:** "שדרגנו את התשתית. עכשיו זה עובד מהר, בטוח, ועם דיוק מקצועי."

---

**log_entry | TEAM_70 | HISTORICAL_DIFFERENTIATION_CREATED | 2026-02-15**
