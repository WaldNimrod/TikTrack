# 📊 מטריצת גרסאות נוכחית (Version Matrix)

**מקור:** TT2_VERSION_MATRIX.md (Google Drive) — מסונכרן עם נוהל ADR-016.  
**עדכון מטריצה:** לפי [TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md).

---

| Layer | Current Version | Ceiling (SV) | Status |
| :--- | :--- | :--- | :--- |
| **System Version (SV)** | **1.0.0** | - | 🔒 LOCKED |
| API Layer | (לבדיקה) | 1.x.x | ⚠️ לאימות Team 90 |
| Database Schema | (לבדיקה) | 1.x.x | ⚠️ לאימות Team 90 |
| UI Package | (לבדיקה) | 1.x.x | ⚠️ לאימות Team 90 |
| Routes Config | 1.1.2 | 1.x.x | ✅ Aligned |

**Last Updated:** 30.1.2026  
**הערה:** גרסה ראשית המערכת = **1.0**. אף שכבה לא רשאית לעלות מעל 1.x.x (חוק Ceiling).

---

## 📍 מיקומי גרסה בקוד (לצורך אימות)

| Layer | מיקום מקובל בפרויקט |
| :--- | :--- |
| System Version (SV) | מוגדר בתיעוד — מסמך זה + [TT2_VERSIONING_POLICY.md](./TT2_VERSIONING_POLICY.md) |
| API Layer | `api/` — גרסה ב-config/package או בתיעוד API |
| Database Schema | תיעוד DDL (למשל 2.5 = PHX_DB_SCHEMA_V2.5) |
| UI Package | `ui/package.json` — שדה `version` |
| Routes Config | `ui/public/routes.json` או `ui/dist/routes.json` — שדה `version` |

**אימות:** בדיקת תאימות לגרסת המערכת (Ceiling) מתבצעת ע"י **Team 90** לפי [TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md).
