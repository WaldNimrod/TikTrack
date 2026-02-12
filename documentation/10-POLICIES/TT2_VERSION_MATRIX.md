# 📊 מטריצת גרסאות נוכחית (Version Matrix)

**מקור:** TT2_VERSION_MATRIX.md (Google Drive) — מסונכרן עם נוהל ADR-016.  
**עדכון מטריצה:** לפי [TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md).

---

| Layer | Current Version | Ceiling (SV) | Status |
| :--- | :--- | :--- | :--- |
| **System Version (SV)** | **2.0.0** | - | 🔒 LOCKED |
| API Layer | 2.0.0 | 2.x.x | ✅ Aligned |
| Database Schema | 2.5.0 | 2.x.x | ✅ Aligned |
| UI Package | 2.1.0 | 2.x.x | ✅ Aligned |
| Routes Config | 1.1.2 | 2.x.x | ⚠️ PENDING BUMP |

**Last Updated:** 12.2.2026, 19:08:43

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
