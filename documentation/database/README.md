# Database Documentation

## 📋 Overview
This directory contains all database-related documentation for the TikTrack system.

## 📁 Contents

### 📊 **Main Documentation**
- **[CHANGES_AUGUST_2025.md](CHANGES_AUGUST_2025.md)** - Major database changes made in August 2025
- **[PAGE_IMPROVEMENTS.md](PAGE_IMPROVEMENTS.md)** - Database page improvements and enhancements

### 📋 **Reports and Rules**
- **[TRADE_PLANS_RULES_REPORT.md](TRADE_PLANS_RULES_REPORT.md)** - Trade plan rules and validation report
- **[TRADE_STATUS_FIX_REPORT.md](TRADE_STATUS_FIX_REPORT.md)** - Trade status fixes and corrections
- **[TRADE_DATES_FIX_REPORT.md](TRADE_DATES_FIX_REPORT.md)** - Trade date corrections and fixes

## 🗄️ Database Schema

The TikTrack system uses SQLite database with the following main tables:
- **accounts** - User trading accounts
- **tickers** - Stock/crypto symbols
- **trade_plans** - Trading plans and strategies
- **trades** - Actual trades executed
- **executions** - Trade execution details
- **cash_flows** - Cash flow transactions
- **alerts** - System alerts and notifications
- **notes** - User notes with flexible linking
- **currencies** - Supported currencies
- **preferences** - User preferences

## 🔄 Recent Changes (August 2025)

### Major Updates
1. **Flexible Alert System** - New linking system for alerts to any entity
2. **Notes System Enhancement** - Improved file attachment and linking
3. **Currency System** - Enhanced currency support and conversion
4. **Trade Plan Validation** - Improved validation rules and checks

### Migration Files
- All migration files are managed through `Backend/migrations_manager.py`
- Database changes are tracked in version control
- Backup procedures are automated

## 🛠️ Database Management

### Tools
- **Migration Manager**: `Backend/migrations_manager.py`
- **Data Validation**: Built-in validation in models
- **Backup System**: Automated backup procedures

### Best Practices
- Always backup before major changes
- Use migration scripts for schema changes
- Validate data integrity after changes
- Document all changes in this directory

## 🔗 Related Documentation
- [Backend Documentation](../backend/README.md)
- [Development Guidelines](../development/README.md)
- [Server Configuration](../server/README.md)

---

**Last Updated:** August 22, 2025  
**Maintainer:** TikTrack Development Team
