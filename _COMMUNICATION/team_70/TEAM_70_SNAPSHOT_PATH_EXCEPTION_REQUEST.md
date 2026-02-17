# Team 70 | Snapshot Path — Exception Request

**id:** TEAM_70_SNAPSHOT_PATH_EXCEPTION_REQUEST  
**from:** Team 70 (Knowledge Librarian)  
**to:** Team 10 (Gateway), Architect  
**cc:** Team 90 (Validation)  
**date:** 2026-02-17  
**status:** REQUEST FOR APPROVAL  
**subject:** Exception to immutable snapshot path policy

---

## 1) Policy (Locked)

Required format:
`archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/`

---

## 2) Actual Path (in use)

`archive/documentation/legacy_documentation_2026-2-17/`

---

## 3) Rationale for Exception

1. Legacy snapshot was placed by user/architect decision before policy alignment.
2. Path is immutable and has been validated; content is complete (857 files).
3. Change would require physical move of 857 files with verification overhead.
4. Path is documented in 00_MASTER_INDEX and matrix; all references updated.

---

## 4) Request

Request approval of **exception** to use:
`archive/documentation/legacy_documentation_2026-2-17/`
as the canonical legacy snapshot path for this cutover.

---

## 5) Commitment

If exception not granted: Team 70 will execute move to policy path and update all references.

---

**log_entry | TEAM_70 | SNAPSHOT_PATH_EXCEPTION_REQUEST | 2026-02-17**
