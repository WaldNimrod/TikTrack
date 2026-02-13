# Team 30 → Team 10: עדכון רשימת עמודים וסקואופ — ניהול טיקרים (D22)

**id:** `TEAM_30_TO_TEAM_10_TICKERS_PAGE_SCOPE_UPDATE`  
**from:** Team 30 (Frontend Execution)  
**to:** Team 10 (The Gateway)  
**date:** 2026-01-31  
**re:** הוספת עמוד ניהול טיקרים לרשימות העמודים ול-SSOT

---

## 1. סיכום

עמוד **ניהול טיקרים** (`tickers.html`) הושלם והוטמע. מסמך זה מעדכן את Team 10 על הוספת העמוד לרשימות הרשמיות ולסקואופ.

---

## 2. פרטי העמוד

| שדה | ערך |
|-----|-----|
| **ID** | D22 |
| **קובץ** | tickers.html |
| **תיאור** | ניהול טיקרים |
| **נתיב** | `ui/src/views/management/tickers/` |
| **Route** | `/tickers.html` |
| **מבנה** | תבנית בסיס (POL-015); סיכום עליון; טבלה סטנדרטית + CRUD |

---

## 3. תוכן מימוש

| רכיב | תיאור |
|------|--------|
| **קונטיינר עליון** | סיכום: סה"כ טיקרים, טיקרים פעילים |
| **טבלה** | סמל, מחיר אחרון, שינוי יומי, שם חברה, סוג, סטטוס, פעולות |
| **CRUD** | הוספה, עריכה, מחיקה (soft delete) |
| **API** | `GET/POST/PUT/DELETE /api/v1/tickers` + `/tickers/summary` |

---

## 4. עדכונים בוצעו ב-SSOT

| מסמך | עדכון |
|------|--------|
| **TT2_OFFICIAL_PAGE_TRACKER** | D22 נוסף למטריצת עמודים; סטטוס 3. IN PROGRESS |
| **routes.json** | tickers ב-management (v1.2.0) |
| **page-manifest.json** | tickers נוסף ל-Factory |
| **unified-header** | קישור ניהול טיקרים קיים (P3-002) |

---

## 5. סקואופ (Scope)

| הקשר | סטטוס |
|------|--------|
| **Roadmap v2.1** | באץ' 3 — USER_TICKERS & **TICKERS_MGR** |
| **Blueprint Scope** | IN SCOPE — עמוד מאושר ב-Roadmap |
| **P3-003 (Blueprint Drift)** | tickers — **לא** OUT OF SCOPE; חלק מהסקואופ הרשמי |

---

## 6. בקשת עדכון

**Team 10 נדרש:**
1. לאשר את עדכון TT2_OFFICIAL_PAGE_TRACKER (העדכון כבר בוצע על ידי Team 30).
2. לכלול את D22 במטריצת Blueprint ↔ Roadmap (P3-003) — **IN SCOPE**.
3. להפיץ לעדכון רלוונטי לצוותים 31, 40, 50 לפי הצורך.

---

## 7. קבצים רלוונטיים

| קובץ | תפקיד |
|------|--------|
| `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` | רשימת עמודים מעודכנת |
| `ui/public/routes.json` | routes SSOT |
| `ui/scripts/page-manifest.json` | Template Factory |
| `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` | Roadmap (TICKERS_MGR באץ' 3) |

---

**log_entry | [Team 30] | TICKERS_PAGE_SCOPE_UPDATE | TO_TEAM_10 | 2026-01-31**
