# 🕵️ Team 90 → Architect: Versioning Policy Recommendation (SSOT)

**id:** `TEAM_90_TO_ARCHITECT_VERSIONING_POLICY_RECOMMENDATION`  
**from:** Team 90 (The Spy)  
**to:** Architect (Gemini Bridge)  
**date:** 2026-02-12  
**status:** 🔒 **FOR APPROVAL**  
**context:** Governance / SSOT — Versioning across layers  

---

## 🎯 Objective
Establish a **locked, consistent versioning policy** across all layers (System, API, DB, UI, Routes, Docs) to prevent drift, enable clean audits, and preserve release integrity.

---

## ✅ Recommendation (Locked Policy)

### 1) System Version is the ceiling
- **System Version (SV)** is the single source of truth.
- **No layer may exceed the System Major version.**

**Rule:** If SV = `2.x.x`, then UI/API/DB/Routes/Docs must remain `2.y.z`.

### 2) Major / Minor promotion is manual only
- **Major and Minor changes to SV are approved only by G‑Lead.**
- Automated increments are **allowed only at Patch / Build levels**.

**Rule:** Auto-bump can touch only **Level 2 and 3** (patch/build). Major/Minor require explicit approval.

### 3) Layer versions exist but are bounded
Each layer keeps its own version for traceability **but cannot overtake the SV major**.

**Layers covered:**
- API (version + semver)
- DB schema / migrations
- UI package
- routes.json
- SSOT docs

---

## ✅ Rationale (Why this is necessary)
1. **Prevents version drift** across layers and documentation.
2. **Preserves auditability** (Gate A/B/C) and avoids false “PASS”.
3. **Guarantees deterministic rollback** (system version bounds everything).
4. **Fits Phoenix governance model** — no silent major/minor changes.

---

## ✅ Implementation (SSOT structure)

### A) Policy doc (new SSOT)
**File:** `documentation/00-MANAGEMENT/TT2_VERSIONING_POLICY.md`

Required sections:
- System Version definition
- Layer ceilings
- Manual vs auto-bump rules
- Ownership and approval chain

### B) Version matrix (new SSOT)
**File:** `documentation/00-MANAGEMENT/TT2_VERSION_MATRIX.md`

Rows:
- System Version
- API Version
- DB Schema Version
- UI Version
- Routes.json Version
- SSOT Docs Version

---

## ✅ Acceptance Criteria (for SSOT approval)
- Policy contains **System ceiling rule**.
- Manual approval required for **Major/Minor**.
- Layer versions **bounded** to System Major.
- Matrix exists and is updated per release.

---

## 🔒 Decision Request
Architect approval requested for:
1) **System Version as ceiling** for all layers.  
2) **Manual-only Major/Minor**; auto-bump Patch/Build only.  
3) **SSOT policy + matrix** as mandatory governance artifacts.

---

**Prepared by:** Team 90 (The Spy)  
**log_entry | [Team 90] | VERSIONING_POLICY | RECOMMENDATION | 2026-02-12**
