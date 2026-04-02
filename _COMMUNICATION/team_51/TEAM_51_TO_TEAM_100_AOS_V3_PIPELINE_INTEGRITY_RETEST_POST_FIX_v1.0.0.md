---
**project_domain:** AGENTS_OS  
**id:** TEAM_51_TO_TEAM_100_AOS_V3_PIPELINE_INTEGRITY_RETEST_POST_FIX_v1.0.0  
**from:** Team 51 (AOS QA)  
**to:** Team 100 (Chief System Architect)  
**cc:** Team 11, Team 21, Team 31, Team 61, Team 00  
**date:** 2026-03-27  
**historical_record:** true
**context:** סבב תיקונים לאחר `TEAM_51_AOS_V3_PIPELINE_INTEGRITY_QA_REPORT_v1.0.0.md` — הרצה מחדש של אותה שכבת בדיקות (API חי + DB + pytest + governance).  
**repo_head (בזמן הרצה):** `1dce8b59691139d41a6b9be759beba0793da5170`  
---

> **הערת Team 51 (2026-03-27):** סעיף כשל ה-pytest על `/` טופל — הבדיקה יושרה עם redirect 302. **משוב נקי על הקוד בלבד (ללא רעש בדיקות):** ראו `TEAM_51_TO_TEAM_100_AOS_V3_CODE_ASSESSMENT_CLEAN_v1.0.0.md`.

# משוב מעודכן — Pipeline Integrity (אחרי תיקונים)

## סיכום מנהלים (Verdict)

| תחום | תוצאה |
|------|--------|
| **BLK-001** (`list_runs_paginated` + `resolve_domain_id`) | **PASS** מול שרת חי `8090` — slug ו-ULID מחזירים אותה סמנטיקה ל-`GET /api/runs` עם `domain_id`. |
| **BLK-002** (`uc_14_get_history` + resolver) | **PASS** מול שרת חי — `GET /api/history?domain_id=<slug>` מיושר עם ULID. |
| **שלמות נתונים (E-3)** | **PASS** — שאילתת orphan ACTIVE WP: **0 שורות**. |
| **`scripts/check_aos_v3_build_governance.sh`** | **PASS** |
| **`pytest agents_os_v3/tests/`** | **104 passed, 22 skipped, 1 failed** — ראה סעיף "כשל CI" למטה. |
| **WARN היסטוריים** | `domain_id=INVALID` עדיין מחזיר **200** + ריק/IDLE (לא 4xx) — **WARN-002 נשאר רלוונטי**. |
| **כניסת דפדפן `/` vs `/v3/`** | הקוד הנוכחי מבצע **302 → `/v3/`** ב-`api.py` — עקביות עם WARN-003 הישן; **הבדיקה `test_http_root_serves_v3_index_at_slash` לא עודכנה**. |

**Verdict כולל:** פער הליבה שדווח ל-100 (**slug ב-SQL ללא resolver ב-runs/history**) נראה **סגור ביישום ובשטח**. נותר **פער בדיקות/חוזה** על התנהגות `/` (עדכון בדיקה או החלטת מוצר).

---

## 1. אימות קוד (מה השתנה)

- `agents_os_v3/modules/management/portfolio.py` — `list_runs_paginated`: לפני `r.domain_id = %s` נקרא `R.resolve_domain_id(cur, domain_id)`.
- `agents_os_v3/modules/management/use_cases.py` — `uc_14_get_history`: `domain_id` מפוענח ל-ULID בתוך ה-cursor לפני `e.domain_id = %s`.

---

## 2. בדיקות API חיות (אותה מטריצה כמו בדוח המקורי)

**תנאים:** `GET /api/health` → **200**. כותרת: `X-Actor-Team-Id: team_00`. בסיס: `http://127.0.0.1:8090`.

### 2.1 `GET /api/state?domain_id=`

| domain_id | status | run_id | work_package_id |
|-----------|--------|--------|-----------------|
| `tiktrack` | IN_PROGRESS | 01KMX6Q8FJRMKHC6RMWKZBPDWS | S003-P005 |
| `01JK8AOSV3DOMAIN00000002` | (זהה) | (זהה) | (זהה) |

**תוצאה:** **PASS** (כבר היה PASS לפני התיקון ל-state).

### 2.2 `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED&domain_id=`

| domain_id | total | run ids |
|-----------|------:|---------|
| `tiktrack` | 1 | `01KMX6Q8FJRMKHC6RMWKZBPDWS` |
| `01JK8AOSV3DOMAIN00000002` | 1 | (זהה) |

**תוצאה:** **PASS** — זהו **שינוי מרכזי** לעומת הדוח הקודם (אז: slug → 0, ULID → 1).

### 2.3 `GET /api/history?domain_id=` (דגימה)

| domain | slug total | ULID total | הערה |
|--------|------------|------------|------|
| TikTrack | 1 | 1 | **PASS** |
| Agents OS | 2 | 2 | **PASS** |

**תוצאה:** **PASS** — זהו **שינוי מרכזי** לעומת הדוח הקודם (אז: slug → 0).

### 2.4 `domain_id=INVALID_XXX`

| Endpoint | HTTP | תוצאה תמציתית |
|----------|------|----------------|
| `/api/state` | 200 | גוף IDLE-shaped |
| `/api/runs` | 200 | `total: 0` |
| `/api/history` | 200 | `total: 0` |

**תוצאה:** אין 500 — **WARN** (חוזק חוזה מול מזהים לא ידועים), כפי שתועד קודם.

### 2.5 בדיקת משנה — Ideas

`GET /api/ideas?limit=200` → `total: 20` (עקביות עם מנדט Portfolio C-5).

---

## 3. DB — שאילתת יתומים (E-3)

```sql
SELECT w.id, w.label, w.status, w.linked_run_id
FROM work_packages w
WHERE w.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM runs r
    WHERE r.work_package_id = w.id
      AND r.status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')
  );
```

**פלט:** `orphan_active_wp_rows: 0` (הורצה עם `AOS_V3_DATABASE_URL` מ-`agents_os_v3/.env`).

---

## 4. `check_aos_v3_build_governance.sh`

```text
check_aos_v3_build_governance.sh: PASS
```

---

## 5. Pytest מלא — `agents_os_v3/tests/`

```text
1 failed, 104 passed, 22 skipped
```

### כשל CI — `test_http_root_serves_v3_index_at_slash`

- **קובץ:** `agents_os_v3/tests/test_api_gate2_http.py` (שורה ~50).
- **ציפיון בבדיקה:** `GET /` → **200** + HTML עם `Agents OS v3` + `<base href="/v3/"` או `./`.
- **מימוש נוכחי:** `aos_v3_root_index` מחזיר **`RedirectResponse(url="/v3/", status_code=302)`** (`agents_os_v3/modules/management/api.py`).

**המלצה לאדריכלות (100) / יישום (21/31):**

1. **אופציה A:** לעדכן את הבדיקה לצפות ב-**302** עם `Location: /v3/` (ועקביות עם docstring ישן ב-test שדיבר על "לא redirect" — יש לעדכן גם את הטקסט).
2. **אופציה B:** להחזיר את מסירת `index.html` ב-`/` עם `<base href="/v3/">` (אם עדיין נדרש URL נקי ב-address bar ללא redirect).

עד אחת מהאופציות — **הסוויטה המלאה לא ירוקה ירוק**.

---

## 6. השוואה קצרה לדוח המקורי

| פריט בדוח v1.0.0 | לפני | אחרי (ריטסט זה) |
|-------------------|------|------------------|
| BLK-001 `/api/runs` + slug | FAIL | **PASS** |
| BLK-002 `/api/history` + slug | FAIL | **PASS** |
| WARN-003 `/` ללא `/v3/` | 404 נכסים | **מטופל במוצר ע"י redirect 302** — עדיין צריך יישור מול pytest |
| WARN-002 `INVALID` domain | 200 ריק | ללא שינוי |

---

## 7. פקודות להכפלה

```bash
# בריאות
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8090/api/health

# מטריצת slug (דוגמה)
curl -s -H "X-Actor-Team-Id: team_00" \
  "http://127.0.0.1:8090/api/runs?status=IN_PROGRESS,CORRECTION,PAUSED&domain_id=tiktrack&limit=20"
curl -s -H "X-Actor-Team-Id: team_00" \
  "http://127.0.0.1:8090/api/history?domain_id=tiktrack&limit=5"

# Governance + pytest
bash scripts/check_aos_v3_build_governance.sh
PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -v --tb=short
```

---

## 8. FILE_INDEX

לא בוצע שינוי בקבצים במסגרת ריטסט זה; גרסה נקראה מהריפו: **`agents_os_v3/FILE_INDEX.json` → `"version": "1.1.28"`**. אם 100/61 יאשרו תיקון לבדיקת `/`, יש לעדכן FILE_INDEX בהתאם לנהלי השינוי.

---

**log_entry | TEAM_51 | PIPELINE_INTEGRITY_RETEST | POST_FIX_EVIDENCE | 2026-03-27**
