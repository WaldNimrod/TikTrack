# Team 30 → Team 10: עדכון רשימת עמודים וסקואופ — שני עמודים חדשים

**id:** `TEAM_30_TO_TEAM_10_NEW_PAGES_SCOPE_UPDATE`  
**from:** Team 30 (Frontend Execution)  
**to:** Team 10 (The Gateway)  
**date:** 2026-01-31  
**re:** הוספת עמודים D22 (ניהול טיקרים) ו-D23 (דשבורד נתונים) לרשימות העמודים ול-SSOT

---

## 1. סיכום

נוצרו שני עמודים חדשים במערכת. מסמך זה מעדכן את Team 10 על הוספתם לרשימות הרשמיות ולסקואופ.

---

## 2. פרטי העמודים

### D22 — ניהול טיקרים

| שדה | ערך |
|-----|-----|
| **ID** | D22 |
| **קובץ** | tickers.html |
| **תיאור** | ניהול טיקרים |
| **נתיב** | `ui/src/views/management/tickers/` |
| **Route** | `/tickers.html` |
| **קישור בתפריט** | ניהול → ניהול טיקרים |
| **מבנה** | תבנית בסיס (POL-015); סיכום עליון; טבלה סטנדרטית + CRUD |

**תוכן מימוש:**
- קונטיינר עליון: סיכום (סה"כ טיקרים, טיקרים פעילים)
- טבלה: סמל, מחיר אחרון, שינוי יומי, שם חברה, סוג, סטטוס, פעולות
- CRUD: הוספה, עריכה, מחיקה (soft delete)
- API: `GET/POST/PUT/DELETE /api/v1/tickers` + `/tickers/summary`

**סקואופ:** Roadmap v2.1 באץ' 3 — TICKERS_MGR | **IN SCOPE**

---

### D23 — דשבורד נתונים

| שדה | ערך |
|-----|-----|
| **ID** | D23 |
| **קובץ** | data_dashboard.html |
| **תיאור** | דשבורד נתונים |
| **נתיב** | `ui/src/views/data/dataDashboard/` |
| **Route** | `/data_dashboard.html` |
| **קישור בתפריט** | נתונים → דשבורד נתונים (פריט ראשון בתפריט) |
| **מבנה** | תבנית בלבד — ללא לוגיקה/API |

**תוכן מימוש:**
- קונטיינר סיכום: תבנית placeholder
- קונטיינר כרטיסי קיצור: תבנית placeholder
- **סטטוס:** תבנית בלבד; תוכן מלא יושלם בהמשך

**סקואופ:** דשבורד מרכזי לתפריט נתונים — **IN SCOPE** (הגדרה חדשה)

---

## 3. עדכונים בוצעו ב-SSOT

| מסמך | עדכון |
|------|--------|
| **TT2_OFFICIAL_PAGE_TRACKER** | D22, D23 נוספו למטריצת עמודים; גרסה v4.2 |
| **routes.json** | tickers ב-management; data_dashboard ב-data (v1.2.0) |
| **page-manifest.json** | tickers, data_dashboard נוספו ל-Template Factory |
| **unified-header.html** | דשבורד נתונים — פריט ראשון בתפריט נתונים; ניהול טיקרים קיים |
| **vite.config.js** | מיפוי /tickers.html, /data_dashboard.html |

---

## 4. בקשת עדכון

**Team 10 נדרש:**
1. לאשר את עדכון TT2_OFFICIAL_PAGE_TRACKER (העדכון כבר בוצע על ידי Team 30).
2. לכלול את D22 ו-D23 במטריצת Blueprint ↔ Roadmap (P3-003) — **IN SCOPE**.
3. להפיץ לעדכון רלוונטי לצוותים 31, 40, 50 לפי הצורך.
4. לעדכן את 00_MASTER_INDEX במידת הצורך.

---

## 5. קבצים רלוונטיים

| קובץ | תפקיד |
|------|--------|
| `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` | רשימת עמודים מעודכנת (v4.2) |
| `ui/public/routes.json` | routes SSOT |
| `ui/scripts/page-manifest.json` | Template Factory (5 עמודים) |
| `ui/src/views/management/tickers/` | D22 — ניהול טיקרים |
| `ui/src/views/data/dataDashboard/` | D23 — דשבורד נתונים |

---

**log_entry | [Team 30] | NEW_PAGES_SCOPE_UPDATE | TO_TEAM_10 | D22_D23 | 2026-01-31**
