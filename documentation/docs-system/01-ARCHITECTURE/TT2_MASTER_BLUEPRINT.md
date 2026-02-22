# 🏛️ TikTrack V2: Master Blueprint
**project_domain:** TIKTRACK

**id:** `TT2_MASTER_BLUEPRINT`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-13  
**version:** v2.6

---

- Stack: React 18, TS, Vite, FastAPI, PostgreSQL.
- IDs: Hybrid Strategy (ULID for External, BIGINT for Internal).
- Time: Global UTC.
- Design: Lego UI Architecture (Core 15).
- Ports: V2 Frontend (8080), Backend API (8082), Legacy (8081).

## 🔄 Architect Mandate Implementation Status

**Last Updated:** 2026-02-13

### **P0/P1/P2 Complete:**
- ✅ **Port Unification:** Frontend (8080), Backend (8082)
- ✅ **Routes SSOT:** `routes.json` v1.1.2
- ✅ **Transformers Hardened:** v1.2 (Forced number conversion for financial fields)
- ✅ **Bridge Integration:** HTML Shell ↔ React Content
- ✅ **Security:** Masked Log (Token leakage prevention)
- ✅ **Scripts Policy:** Hybrid Scripts Policy (Allowed `<script src>`, Forbidden inline)

### **Batch Status:**
- ✅ **Batch 1:** Identity & Auth - COMPLETE (2026-02-02)
- ✅ **Batch 2:** Financial Core - CLOSED (2026-02-12)
- 🟠 **Batch 2.5:** Completions Mandate LOCKED (ADR‑017/ADR‑018) — execution tracked in Team 10 evidence logs
