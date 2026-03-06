# S002_P002_MATERIALIZATION_EVIDENCE_SIGNATURE_PROFILE_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** S002_P002_MATERIALIZATION_EVIDENCE_SIGNATURE_PROFILE  
**from:** Team 170 (Spec & Governance)  
**date:** 2026-03-06  
**in_response_to:** TEAM_190_TO_TEAM_170_S002_P002_MCP_QA_TRANSITION_LLD400_ACTIVATION_PROMPT_v1.0.0, ARCHITECT_DECISION_MCP_QA_TRANSITION_v1.1.0

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_1_PREPARATION |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1. Purpose

Define the Ed25519 signing profile for `MATERIALIZATION_EVIDENCE.json` packages under S002-P002: canonical payload canonicalization, key custody and rotation ownership (Team 60), and verification checkpoints (Team 90; Team 190 spot-check).

---

## 2. Signature Algorithm

| Field | Value |
|-------|-------|
| signature_algorithm | Ed25519 |
| key_custodian_team | Team 60 |
| signature_type | Detached signature over canonicalized JSON payload (see §3). |

---

## 3. Canonical Payload Canonicalization Rule

1. **Payload:** The signable payload is the full `MATERIALIZATION_EVIDENCE.json` document **excluding** the signature section (see §4).
2. **Canonical form:** JSON serialized in **canonical form**: UTF-8, no unnecessary whitespace, keys sorted lexicographically (recursively for nested objects), no trailing newline.
3. **Hash:** Compute SHA-256 over the canonical UTF-8 octet stream. Store as `signed_payload_sha256` (hex string) in the signature section.
4. **Sign:** Ed25519 sign the **canonical UTF-8 octet stream** (not the hash). The signature is stored as Base64 in `signature_base64`.

**Rule:** Any change to the payload (including key order or whitespace) invalidates the signature unless the payload is re-canonicalized and re-signed.

---

## 4. Required Signature Section Fields

Every `MATERIALIZATION_EVIDENCE.json` that includes a signature MUST have a signature section with:

| Field | Type | Description |
|-------|------|-------------|
| signature_algorithm | string | `Ed25519` |
| key_id | string | Identifier of the key used (e.g. key version or id). |
| signature_base64 | string | Detached Ed25519 signature, Base64-encoded. |
| signed_payload_sha256 | string | SHA-256 of canonical payload, hex. |
| signed_at_utc | string | ISO 8601 UTC timestamp of signing. |
| signed_by_team | string | Team identifier (e.g. `Team_60`). |

Optional for governance (recommended): `key_custodian_team` = Team 60.

---

## 5. Key Custody and Rotation Ownership

| Responsibility | Owner |
|----------------|-------|
| Key generation | Team 60 |
| Key storage and access control | Team 60 |
| Key rotation policy and execution | Team 60 |
| Signing of MATERIALIZATION_EVIDENCE payloads (using canonical form) | Team 60 (or delegate under Team 60 control) |

Team 60 does **not** verify evidence for gate passage; verification is Team 90 and Team 190 (see §6).

---

## 6. Verification Checkpoints

| Checkpoint | Owner | When |
|------------|-------|------|
| GATE_5 / GATE_6 package verification | Team 90 | Verification of signature and payload integrity for packages submitted at GATE_5 and GATE_6. |
| Constitutional spot-check at intake/spec boundaries | Team 190 | Spot-check of signature presence, algorithm, and key/signature consistency at spec intake or boundary reviews. |

**Flow:** Team 60 signs → Team 90 verifies in GATE_5..GATE_6 context → Team 190 may spot-check at intake/spec boundaries. No ambiguity: custody (Team 60) vs verification (Team 90, Team 190).

---

## 7. References

1. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_MCP_QA_TRANSITION_v1.1.0.md`
2. LOD200 / schema: `MATERIALIZATION_EVIDENCE_JSON_SCHEMA_v1.0.0.md` (when present under Team 100/170 LOD200 outputs).

---

**log_entry | TEAM_170 | S002_P002_MATERIALIZATION_EVIDENCE_SIGNATURE_PROFILE_v1.0.0 | PRODUCED | 2026-03-06**
