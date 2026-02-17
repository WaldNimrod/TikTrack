# Team 70 | Reports — Active vs Archive Map

**id:** TEAM_70_REPORTS_ACTIVE_VS_ARCHIVE_MAP  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_MODEL_B_LOCKED_CORRECTION_DIRECTIVE  
**status:** SUBMITTED

---

## 1) Policy Summary

- **Active reports** — `documentation/reports/` (last 48h per prior directive; Model B)
- **Archive reports** — `archive/documentation/legacy_documentation_2026-2-17/05-REPORTS`, `.../08-REPORTS`
- **Reason:** Active contains recent evidence (<48h); full inventory preserved in archive.

---

## 2) Counts

| Source | Active | Archive | Total |
|--------|--------|---------|-------|
| 05-REPORTS | 74 | 74 | 148 |
| 08-REPORTS | 6 | 132 | 138 |
| **Total** | **80** | **206** | **286** |

---

## 3) Active — documentation/reports/

### 05-REPORTS (74 files)

```
documentation/reports/05-REPORTS/
├── artifacts/ (26)
├── artifacts_SESSION_01/ (48)
└── ...
```

### 08-REPORTS (6 files)

```
documentation/reports/08-REPORTS/
└── artifacts_SESSION_01/ (6)
```

---

## 4) Archive — legacy snapshot

### 05-REPORTS (74 additional files in archive only)

Full path: `archive/documentation/legacy_documentation_2026-2-17/05-REPORTS/`

### 08-REPORTS (132 additional files in archive only)

Full path: `archive/documentation/legacy_documentation_2026-2-17/08-REPORTS/`

---

## 5) Mapping Rule

| Location | Status | Criteria |
|----------|--------|----------|
| `documentation/reports/05-REPORTS/` | ACTIVE | Last 48h (per directive) |
| `documentation/reports/08-REPORTS/` | ACTIVE | Last 48h (per directive) |
| `archive/.../05-REPORTS/` | ARCHIVED | Full legacy inventory |
| `archive/.../08-REPORTS/` | ARCHIVED | Full legacy inventory |

---

**log_entry | TEAM_70 | REPORTS_ACTIVE_VS_ARCHIVE_MAP | 2026-02-17**
