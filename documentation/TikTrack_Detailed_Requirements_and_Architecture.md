
# TikTrack – Detailed Requirements & Proposed Architecture

## 1. System Overview
TikTrack is a trading management system designed to provide a unified and convenient interface for planning, monitoring, and analyzing investment activities across multiple accounts.  
The system supports:
- Swing trades (short- to medium-term)
- Medium-to-long-term investments
- Passive savings (ETF/pension)  

It covers three major stages:
1. Trade planning  
2. Monitoring open trades  
3. Post-trade analytics  

---

## 2. Core Entities
The system is built around a set of core entities:

- **Account** – Represents a trading account, with balance, P/L, and associated trades/plans.  
- **Trade** – Represents a specific investment/trade, linked to an account and ticker.  
- **Execution** – Represents a buy/sell execution within a trade.  
- **Open Execution Request** – Pending instruction, removed once executed.  
- **Trade Plan** – Pre-trade planning record (ticker, type, conditions, target/stop).  
- **Cash Flow** – Deposits, fees, dividends, needed for accurate P&L and MTM.  
- **Alert** – Notifications linked to tickers/accounts.  
- **Performance Snapshot** – Daily record of total value, open/closed P&L.  
- **Ticker** – Represents a stock/ETF with symbol, type, exchange.  
- **Note** – General text notes linked to plans, trades, or accounts.  

---

## 3. Database Schema
The database schema (SQLite + SQLAlchemy ORM) includes normalized tables for:
- Accounts  
- Tickers  
- Trade Plans  
- Trades  
- Executions  
- Cash Flows  
- Alerts  
- Performance Snapshots  
- Notes  

Indexes are defined on frequently queried fields (e.g., `tickers.symbol`, `accounts.status`, trade timestamps).  
Migrations are managed via **Alembic** for version control.

---

## 4. Backend Architecture
The backend is implemented in **Flask** with a layered architecture:

- **Presentation Layer** – Flask routes, RESTful APIs.  
- **Business Logic Layer** – Service classes (e.g., `TradeService`, `AccountService`).  
- **Data Access Layer** – SQLAlchemy ORM models.  
- **Database Layer** – SQLite (WAL mode).  

This architecture ensures separation of concerns, maintainability, and scalability.

---

## 5. Market Data Integration
The system requires frequent updates of market prices and daily changes for active tickers.  

A modular pipeline is proposed with a strict **external/internal boundary**:

- **Provider Adapters** – Yahoo (Stage 1), IBKR (Stage 2).  
- **Normalizer** – Converts external DTOs into a unified internal DTO.  
- **Orchestrator/Scheduler** – Manages refresh policies, fallback providers, backoff.  
- **Ingest API** – Validates, logs, and persists data into DB (`quotes_last`, `intraday_slots`).  
- **Cache** – Short TTL to avoid redundant requests.  

**Stages:**  
- Stage 1: Yahoo only.  
- Stage 2: Add IBKR with delayed data and failover logic.  

---

## 6. Frontend & UI
- Built in **Vanilla JS** with **Web Components**.  
- **Bootstrap 5** for styling.  
- **AG-Grid** for smart data grids.  
- **RTL support** for Hebrew.  

Key screens include:
- Dashboard  
- Trade Planning  
- Open Trades  
- Closed Trades Analysis  
- Accounts  
- Settings  

The UI consumes backend APIs and market data via the **internal API**, ensuring no direct exposure to external providers.

---

## 7. Security & Operations
- **Security:** Role-based access control (RBAC) with JWT, audit logging, encrypted backups.  
- **Operations:** Automated migrations (Alembic), CI/CD with testing, structured logging, monitoring with Sentry/metrics.  

---

## 8. Benefits & Roadmap
### Benefits
- Maintainability  
- Scalability  
- Modularity  
- Future-proofing  

### Roadmap
1. Finalize stable DB + backend  
2. Implement Yahoo market data integration  
3. Add IBKR adapter  
4. Expand to multiple providers  
5. Enhance analytics and reporting dashboards  

---

*Version: 1.0 (August 2025)*  
*Author: TikTrack Development Team*
