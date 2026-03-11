**date:** 2026-03-11

# Team 20 → AUTO-WP003-05 — דוח סטטוס סופי

**תאריך:** 2026-03-11  
**סטטוס:** **BLOCK** — נדרשת הפעלה מחדש של PostgreSQL

---

## 1) סיכום ביצוע

| שלב | תוצאה |
|-----|--------|
| Terminate lock holders | הופסקו 4 connections (67415, 67707, 67712, 67713) |
| Backfill market_cap | ❌ lock timeout — UPDATE נתקע |
| Verify | ❌ BLOCK — market_cap null לכל 3 הסמלים |

---

## 2) סיבת החסימה

**Connections תקועים** — מספר backends (למשל 67415, 67707) במצב:
- `state=active`, `query=COMMIT`, `wait=LWLock/WALWrite`
- מחזיקים `RowExclusiveLock` על כל פרטיציות `ticker_prices`
- `pg_terminate_backend(pid)` מחזיר True אך ה-backend לא נעלם (ייתכן בעיה ברשת/Docker או 권ונות)

**מקור:** `client_addr=192.168.65.1` (Docker bridge) — כנראה connection מ־host ל-DB ב-Docker.

---

## 3) פתרון חובה — הפעלת PostgreSQL מחדש

**יש להפעיל מחדש את PostgreSQL כדי לנקות connections תקועים.**

### אם PostgreSQL ב-Docker:
```bash
# מצא את ה-container
docker ps | grep -i postgres

# הפעל מחדש (החלף <container_name> בשם האמיתי)
docker restart <container_name>
```

### אם PostgreSQL מקומי (Homebrew וכו׳):
```bash
brew services restart postgresql
# או
sudo systemctl restart postgresql
```

### אחרי ההפעלה מחדש:
```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
./scripts/run_auto_wp003_05_full_flow.sh
```

---

## 4) סקריפטים זמינים

| סקריפט | שימוש |
|--------|--------|
| `scripts/run_auto_wp003_05_full_flow.sh` | terminate → backfill → verify (תהליך מלא) |
| `scripts/terminate_ticker_prices_blockers.py` | הפעלת pg_terminate_backend על lock holders |
| `scripts/backfill_market_cap_auto_wp003_05.py` | עדכון market_cap לשורות null |
| `scripts/verify_g7_prehuman_automation.py` | אימות PASS/BLOCK |
| `make backfill-market-cap-after-terminate` | terminate + backfill דרך Makefile |

---

## 5) שינויים שבוצעו בקוד

- **savepoint per row** — כששורה נכשלת (lock timeout), שאר השורות ממשיכות
- **מיפוי TEVA.TA→TEVA** ל-Alpha OVERVIEW
- **CoinGecko** כמקור ל-BTC-USD
- **Partition pruning** ב-UPDATE (id + price_timestamp)
- **lock_timeout** — 5s per row; 15s session

---

**log_entry | TEAM_20 | AUTO_WP003_05_FINAL_STATUS | BLOCK_REQUIRES_PG_RESTART | 2026-03-11**
