# Team 20 — נוהל איתחול Backend
**project_domain:** TIKTRACK

**מנדט:** Team 20 אחראי על צד השרת — **חובה** לאתחל Backend לאחר כל שינוי קוד שדורש טעינה מחדש.  
**מקור:** SERVERS_SCRIPTS_SSOT, הנחיית Nimrod  
**תאריך:** 2026-02-16

---

## 1. כלל ברזל

**כל עדכון קוד ב־API (models, services, routers, schemas) דורש איתחול Backend.**  
בלי איתחול — התיקון לא פעיל; Team 50 יבצע בדיקות חוזרות מיותרות.

---

## 2. סקריפטים (SERVERS_SCRIPTS_SSOT)

| סקריפט | תפקיד |
|--------|-------|
| `scripts/stop-backend.sh` | עצירת Backend (פורט 8082) |
| `scripts/start-backend.sh` | הפעלת Backend |
| `scripts/restart-backend.sh` | stop → sleep 2 → start |

---

## 3. נוהל אימות לפי מודול

### 3.1 User Tickers (me_tickers / user_tickers_service)

```bash
bash scripts/verify-user-tickers-fix.sh
```

**מבצע:** restart Backend + run-user-tickers-qa-api.sh

### 3.2 Notes D35 (notes / notes_service / note_attachments)

```bash
bash scripts/verify-notes-d35-fix.sh
```

**מבצע:** restart Backend + run-notes-d35-qa-api.sh

### 3.3 מודול אחר (ללא סקריפט verify ייעודי)

```bash
bash scripts/restart-backend.sh
# לאחר עליית Backend — הרצת QA רלוונטי / בדיקה ידנית
```

---

## 4. רצף עבודה חובה

1. **שינוי קוד** — models, services, routers, schemas
2. **איתחול** — `restart-backend.sh` או `verify-*-fix.sh` לפי מודול
3. **אימות** — QA API / בדיקה ידנית
4. **הגשה** — רק לאחר שאימות עבר

---

## 5. אי־אחריות Team 50

Team 50 **לא** אחראי לאתחל שרתים. Team 20 דואג לאיתחול **לפני** הגשה ל־QA.

---

**log_entry | TEAM_20 | BACKEND_RESTART_WORK_PROCEDURE | 2026-02-16**
