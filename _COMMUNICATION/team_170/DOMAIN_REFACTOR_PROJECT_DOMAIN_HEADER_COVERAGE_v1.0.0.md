# DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0

**id:** DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0  
**from:** Team 170  
**re:** E5 — Mandatory project_domain header (TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0)  
**date:** 2026-02-22  
**project_domain:** AGENTS_OS

---

## Minimum metrics (reproducible)

**Methodology:** In-scope = all .md under _COMMUNICATION (excl. 99-ARCHIVE), documentation, api, ui, tests, scripts, agents_os. Rule: `project_domain: TIKTRACK | AGENTS_OS | SHARED` (or **project_domain:** variant) must appear within the first 20 lines. Verification: `grep -l 'project_domain' <in-scope paths>` then per-file check first 20 lines.

| metric | value | note |
|--------|-------|------|
| total markdown files in-scope | 1054 | Live count per methodology above. |
| files with valid `project_domain` (first 20 lines) | 1054 | After remediation 2026-02-22. |
| files missing header | 0 | Three files previously non-compliant were fixed (see below). |
| files with invalid header value | 0 | — |
| exception list | _COMMUNICATION/99-ARCHIVE/** | Bounded; archived; owner Team 170. |

**Files fixed to meet first-20-lines rule (2026-02-22):** TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md; TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_COMPLETION_REMAND_v1.0.0.md; TEAM_190_DOMAIN_REFACTOR_REVALIDATION_POST_BQ_CLOSURE_CLAIM_2026-02-22.md.

---

## Valid header format (canonical)

- **Rule:** One of the following must appear within the first 20 lines of each in-scope .md file:
  - `project_domain: TIKTRACK`
  - `project_domain: AGENTS_OS`
  - `project_domain: SHARED`
- **Acceptable variants:** Same with optional `**` (bold) around the line, e.g. `**project_domain:** AGENTS_OS`.
- **Verification:** Reproducible by grep: `grep -l 'project_domain:' <in-scope paths>`; in-scope = _COMMUNICATION (excl. 99-ARCHIVE), documentation, api, ui, tests, scripts, agents_os.
- **Exception list (deterministic):** _COMMUNICATION/99-ARCHIVE/** — no header required; owner Team 170.

---

## Coverage summary

All in-scope markdown ( _COMMUNICATION excluding 99-ARCHIVE, documentation, api, ui, tests, scripts ) now has a valid `project_domain` header. agents_os/ and moved artifacts retain AGENTS_OS; WP001 and shared context use SHARED; remainder TIKTRACK.

---

## Exceptions (bounded)

| path_pattern | reason | owner | remediation |
|--------------|--------|-------|--------------|
| _COMMUNICATION/99-ARCHIVE/** | Archived; legacy marker optional. | Team 170 | Add single-line legacy marker or leave as exception. |
| Staging / POC sample / one-off | Per scoping. | Team 170 | Add project_domain or move to archive. |

---

**log_entry | TEAM_170 | DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE | v1.0.0 | 2026-02-22**
