# ARCHITECT DIRECTIVE — P&L Calculation & Reconciliation Policy
## D36 + D37 Canonical Lock

```
id:             ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0
from:           Team 00 — Chief Architect
to:             Team 170 (spec/governance), Team 10 (implementation routing)
cc:             Team 20 (backend), Team 30 (frontend), Team 100 (awareness)
date:           2026-03-03
authority:      Team 00 constitutional authority — Nimrod-approved 2026-03-03
status:         LOCKED
relates_to:     D36 (P&L page, S004), D37 (data_import, S004)
```

---

## 1. LOCKED DECISIONS

### 1.1 P&L Calculation Method

**Iron Rule: NUMERIC(20,8) for all P&L values — zero rounding.**

**Calculation method:** FIFO / FILO per user preference (`pl_method` in D39 Preferences).
- Default: `FIFO`
- User-configurable in D39 Preferences page
- `pl_method` preference affects ALL P&L calculations across the entire system (D36, D29, D32)
- `pl_method` is stored in `user_data.users.settings JSONB` (D39 preferences storage)

**P&L types:**
- `realized_pl`: stored on trade close — computed at close time using FIFO/FILO
- `mtm` (mark-to-market): computed on read — never stored
- Both are `NUMERIC(20,8)`

---

### 1.2 Reconciliation Strategy

**Phase 1 (S004 — current roadmap): Option B — Delta-Reset via Enhanced Import**

The D37 import process is the primary mechanism for keeping the system synchronized with the user's real broker account. This is NOT just data import — it is also the reconciliation layer.

**How it works:**

```
User opens D37 import flow
    ↓
Selects import mode: executions | cash_flows | both
    ↓
Uploads file (IBKR or IBI format)
    ↓
System runs: DELTA DETECTION
    ├── Finds executions in file NOT in system → "Missing executions: 3"
    ├── Finds cash flows in file NOT in system → "Missing cash flows: 2"
    └── Computes P&L delta (broker P&L vs system P&L) → "P&L delta: $127.50"
    ↓
DELTA REPORT shown to user:
    "נמצאו פערים בין הייבוא לנתוני המערכת"
    - 3 ביצועים חסרים → [ייבא / דלג]
    - 2 תזרימים חסרים → [ייבא / דלג]
    - פער P&L: $127.50 → [פרטים]
    ↓
User approves → system imports missing records and recalculates
    ↓
Audit log: import session record (not per-row) with delta summary
```

**Architectural rules:**
- Delta detection runs EVERY import — not optional
- User must explicitly approve each delta category before records are imported
- Uploaded file is ARCHIVED (saved to storage) — never discarded
- Audit log: one record per import SESSION (not per DB row)
- P&L recalculation triggered automatically after approved reconciliation

---

### 1.3 Broker Connectors

**Primary connector: IBKR (Interactive Brokers)**
- IBKR Flex Query report format (CSV)
- Parser: `api/connectors/ibkr/ibkr_parser.py`

**Second connector: IBI**
- Parser: `api/connectors/ibi/ibi_parser.py`

**Architecture requirement:**
- `BaseConnector` abstract class: `api/connectors/base_connector.py`
- All connectors implement the same interface:
  ```python
  class BaseConnector:
      def parse_executions(self, file_path) -> List[ExecutionRecord]: ...
      def parse_cash_flows(self, file_path) -> List[CashFlowRecord]: ...
      def detect_format(self, file_path) -> str: ...
      def validate_file(self, file_path) -> ValidationResult: ...
  ```
- IBI connector: LOD400-stage implementation (connector architecture established at LOD200)

---

### 1.4 Future Phase (S006+): Option C — Direct Broker API

**Planned but NOT in scope until S006+:**
- Real-time account sync via IBKR TWS API / IBI API
- Eliminates manual file import dependency
- Completely replaces Delta-Reset flow for connected accounts
- Manual import (D37) remains available as fallback

**This is a ROADMAP ENTRY only at this stage:**
```
ID: S006-DIRECT-BROKER-API
Trigger: After D37 (data_import) GATE_8 PASS
Prerequisite: Direct broker API credentials management (admin + user)
```

---

## 2. D36 PAGE SCOPE (P&L)

D36 is a DISPLAY page. It does not implement calculation logic directly — it calls the P&L service.

**D36 displays:**
- Realized P&L per trade (from stored `realized_pl`)
- Unrealized P&L (MTM, computed on read)
- P&L by account / by ticker / by period (aggregations)
- P&L method displayed: "שיטת חישוב: FIFO" (from D39 preference)

**D36 does NOT:**
- Store any P&L values itself
- Implement FIFO/FILO algorithm (that is the service layer)
- Handle import or reconciliation (that is D37)

---

## 3. D37 PAGE SCOPE (Data Import)

**D37 is both import AND reconciliation.**

**Entry modes (user selects on D37 page entry):**
- `executions_only`: parse and import execution records only
- `cash_flows_only`: parse and import cash flow records only
- `both`: parse and import both (recommended)

**D37 page sections:**
1. Mode selector (executions / cash flows / both)
2. Broker selector (IBKR / IBI) → determines which parser to use
3. File upload → validation + archive
4. Delta Report (always shown — user reviews before importing)
5. Import confirmation → records imported, P&L recalculated
6. Import history (last N sessions with delta summary)

---

## 4. IMPACT ON OTHER PAGES

| Page | How this directive affects it |
|---|---|
| D39 Preferences | `pl_method` (FIFO/FILO) and `pl_currency` live here |
| D29 Trades | Uses `pl_method` from preferences when calculating realized P&L on close |
| D32 Portfolio State | Daily snapshot job uses `pl_method` from preferences |
| D36 P&L | Display only — reads from stored `realized_pl` + computes MTM |
| D37 Import | Full scope per §1.2 — import + delta detection + reconciliation |

---

## 5. ROUTING

| Team | Action |
|---|---|
| Team 170 | Update D36 and D37 descriptions in SSOT and program registry to reflect dual scope |
| Team 20 | Implement `BaseConnector`, `IBKRConnector`, `IBIConnector` (LOD400-stage) |
| Team 20 | Implement delta detection algorithm in `api/services/import_reconciliation_service.py` |
| Team 30 | Implement Delta Report UI in D37 page |
| Team 30 | Display `pl_method` label on D36 page |

---

*log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY | v1.0.0_ISSUED | 2026-03-03*
