# 📊 מטריצת גרסאות נוכחית (Version Matrix)

**מקור המבנה והכללים:** קבצי האדריכלית — `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX.md` (או Google Drive).  
**ערך SV נוכחי:** נקבע ע"י G-Lead — גרסה ראשית **1.0** (במקור האדריכלית הופיע 2.0.0; אותו נוהל Ceiling).  
**עדכון מטריצה:** לפי [TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md).

---

| Layer | Layer Version (code) | Display Version (SV-prefixed) | Ceiling (SV) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **System Version (SV)** | **1.0** | **1.0.0** | - | 🔒 LOCKED |
| API Layer | 2.5.2 | **1.0.2.5.2** | 1.x.x | ✅ Aligned |
| Database Schema | 2.5.0 | **1.0.2.5.0** | 1.x.x | ✅ Aligned |
| UI Package | 2.0.0 | **1.0.2.0.0** | 1.x.x | ✅ Aligned |
| Routes Config | 1.1.2 | **1.0.1.1.2** | 1.x.x | ✅ Aligned |

**Last Updated:** 12.2.2026  
**הערה:** גרסה ראשית המערכת = **1.0**. כל שכבה מציגה גרסה בפורמט SV-prefixed (ADR-016). מקור גרסת API: `api/__init__.py` + `api/main.py` (מסונכרנים).

---

## 📍 מיקומי גרסה בקוד (לצורך אימות)

| Layer | מיקום מקובל בפרויקט |
| :--- | :--- |
| System Version (SV) | קובץ **`VERSION`** (שורש הפרויקט) — מקור יחיד; תיעוד: [TT2_VERSIONING_POLICY.md](./TT2_VERSIONING_POLICY.md) + מסמך זה |
| API Layer | `api/__init__.py` — `__version__` (SSOT); `api/main.py` — `version=__version__` |
| Database Schema | תיעוד DDL (למשל 2.5 = PHX_DB_SCHEMA_V2.5) |
| UI Package | `ui/package.json` — שדה `version` |
| Routes Config | **רק** `ui/public/routes.json` — שדה `version`. `ui/dist/routes.json` נוצר ב-build (אין לעדכן ידנית). |

**אימות:** בדיקת תאימות לגרסת המערכת (Ceiling) מתבצעת ע"י **Team 90** לפי [TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md).
