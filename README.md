# TikTrack - Trading Management System

## Overview
TikTrack is a comprehensive trading management system designed to simplify portfolio management and trading operations. The system provides a modern web interface for managing trades, accounts, alerts, and trading plans with advanced constraint management capabilities.

## Features

### Core Trading Management
- **Trade Tracking**: Monitor open and closed trades with real-time P&L
- **Investment Types**: Support for swing, investment, and passive trading
- **Account Management**: Multi-account support with different currencies
- **Trade Planning**: Advanced planning and execution tracking

### Alert System
- **Price Alerts**: Set price-based notifications
- **Condition Alerts**: Complex condition monitoring
- **Email Notifications**: Automated alert delivery
- **Smart Linking**: Link alerts to any entity in the system

### Dynamic Constraint Management System
- **Database Constraints**: Dynamic constraint definition and management
- **Constraint Types**: CHECK, NOT NULL, UNIQUE, FOREIGN KEY, ENUM
- **Web Interface**: User-friendly constraint management UI
- **Validation System**: Real-time constraint validation
- **Migration Support**: Automated constraint migration tools

### Unified Filter System
- **Smart Filtering**: Advanced filtering across all pages with "All" option
- **User Preferences**: Multi-user support with default user "nimrod"
- **Local Filtering**: Client-side filtering for better performance
- **State Persistence**: Filter states saved between sessions
- **RTL Support**: Full Hebrew interface support

### Notes and Documentation
- **Trade Notes**: Document trading decisions and analysis
- **File Attachments**: Support for PDF, images, and documents
- **Search and Filter**: Advanced note management
- **Rich Text Support**: Formatted note content

## Quick Start

### Prerequisites
- Python 3.8 or higher
- SQLite 3.30 or higher
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/WaldNimrod/TikTrack.git
cd TikTrack

# Start the development server
./restart quick

# Access the application
http://localhost:8080
```

### 📋 **Important Files**
- **[PROJECT_STATUS_SUMMARY.md](PROJECT_STATUS_SUMMARY.md)** - Complete project status and progress
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates
- **[FILTER_UPDATE_SUMMARY.md](FILTER_UPDATE_SUMMARY.md)** - Filter system update summary
- **[documentation/](documentation/)** - Comprehensive documentation

## 🚀 Server Restart System

TikTrack includes a sophisticated server restart system with multiple modes for different scenarios:

> 📋 **לפרטים מלאים:** ראה [PROJECT_STATUS_SUMMARY.md](PROJECT_STATUS_SUMMARY.md)

### Quick Restart Mode
```bash
./restart quick          # Fast restart (5-10 seconds)
```
**Use for:** Development, testing, minor changes
- Stops server processes
- Cleans port conflicts  
- Basic health checks
- Simple API testing

### Complete Restart Mode
```bash
./restart complete       # Comprehensive restart (30-60 seconds)
```
**Use for:** Production, troubleshooting, major issues
- Complete system analysis
- Database lock cleanup
- Cache and temp file cleanup
- Package dependency checks
- Route validation (23+ endpoints)
- Performance monitoring
- Automatic problem fixing

### Smart Auto Mode
```bash
./restart                # Automatic mode selection
```
**Features:**
- Intelligent mode detection based on system health
- Memory usage analysis
- Error pattern recognition
- Database lock detection
- Automatic problem diagnosis

### Interactive Mode
```bash
./restart --interactive  # User choice with menu
```

### Additional Options
```bash
./restart --help         # Show all options
./restart --status       # Show system status
./restart --info         # Show mode information
./restart --verbose      # Detailed output
```

### Troubleshooting
If you encounter issues:
1. **Quick restart fails:** Try `./restart complete`
2. **Complete restart too slow:** Try `./restart quick`
3. **Persistent issues:** Use `./restart --verbose complete`
4. **Interactive troubleshooting:** Use `./restart --interactive`

For detailed documentation, see: `documentation/server/RESTART_SCRIPT_GUIDE.md`

> 📋 **לפרטים מלאים על הפרויקט:** ראה [PROJECT_STATUS_SUMMARY.md](PROJECT_STATUS_SUMMARY.md)

### First Steps
1. **Create Accounts**: Add your trading accounts
2. **Set Constraints**: Configure database constraints through the UI
3. **Add Trades**: Start tracking your trades
4. **Set Alerts**: Configure price and condition alerts
5. **Add Notes**: Document your trading decisions

## System Architecture

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **API**: RESTful API design
- **Authentication**: Session-based authentication

### Frontend
- **Framework**: Vanilla JavaScript with Web Components
- **UI Framework**: Bootstrap 5
- **Responsive Design**: Mobile-first approach
- **RTL Support**: Right-to-left layout for Hebrew

### Database
- **Engine**: SQLite 3 with WAL mode
- **ORM**: SQLAlchemy
- **Constraints**: Dynamic constraint management system
- **Migrations**: Automated schema updates

## Dynamic Constraint Management

### Overview
The constraint management system allows administrators to define, modify, and enforce database constraints dynamically through a web interface without requiring direct database schema changes.

### Supported Constraint Types
1. **CHECK**: Custom validation rules
2. **NOT NULL**: Required field validation
3. **UNIQUE**: Unique value enforcement
4. **FOREIGN KEY**: Referential integrity
5. **ENUM**: Predefined value lists

### Usage Examples

#### Adding a CHECK Constraint
```json
{
    "table_name": "trades",
    "column_name": "investment_type",
    "constraint_type": "CHECK",
    "constraint_name": "valid_investment_type",
    "constraint_definition": "investment_type IN ('swing', 'investment', 'passive')"
}
```

#### Adding an ENUM Constraint
```json
{
    "table_name": "accounts",
    "column_name": "status",
    "constraint_type": "ENUM",
    "constraint_name": "account_status_enum",
    "enum_values": [
        {"value": "active", "display_name": "פעיל", "sort_order": 1},
        {"value": "inactive", "display_name": "לא פעיל", "sort_order": 2}
    ]
}
```

## API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Key Endpoints
- `GET /trades` - List all trades
- `POST /trades` - Create new trade
- `GET /accounts` - List all accounts
- `GET /alerts` - List all alerts
- `GET /constraints` - List all constraints
- `POST /constraints` - Create new constraint

### Response Format
```json
{
    "status": "success|error",
    "message": "Human readable message",
    "data": {...}
}
```

## Development

### Project Structure
```
TikTrackApp/
├── Backend/              # Python Flask backend
│   ├── models/          # SQLAlchemy models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── migrations/      # Database migrations
│   └── db/             # Database files
├── trading-ui/          # Frontend application
│   ├── scripts/        # JavaScript files
│   ├── styles/         # CSS files
│   └── images/         # Static assets
└── documentation/      # Project documentation
```

### Development Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start development server
./start_dev.sh

# Run tests
python3 -m pytest Backend/tests/
```

### Database Migrations
```bash
# Run migration
python3 Backend/migrations/migration_name.py

# Create backup
cp Backend/db/simpleTrade_new.db Backend/db/backup_$(date +%Y%m%d_%H%M%S).db
```

## Testing

### Test Pages
- `/test_crud` - CRUD operations testing
- `/test_api` - API functionality testing
- `/test_security` - Security testing

### API Testing
```bash
# Test constraints endpoint
curl http://localhost:8080/api/v1/constraints

# Test health endpoint
curl http://localhost:8080/api/v1/constraints/health
```

## Documentation

### Core Documentation
- [Project Summary](documentation/project/PROJECT_SUMMARY.md)
- [API Documentation](documentation/api/README.md)
- [Database Documentation](documentation/database/README.md)
- [Development Guide](documentation/development/README.md)

### Feature Documentation
- [Constraint System](documentation/features/constraints/CONSTRAINT_SYSTEM_DOCUMENTATION.md)
- [Alert System](documentation/features/alerts/README.md)
- [Trade Management](documentation/features/trading/README.md)

## Security

### Data Protection
- Input validation at application level
- Parameterized queries to prevent SQL injection
- Access control through application logic
- Regular security audits

### Backup Strategy
- Automated backup procedures
- Encrypted backup storage
- Backup rotation policies
- Regular restore testing

## Performance

### Optimization
- Database indexing strategy
- Query optimization
- Asset optimization
- Caching implementation

### Monitoring
- Health checks
- Performance metrics
- Error tracking
- Usage analytics

## Contributing

### Development Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use ES6+ for JavaScript
- Add type annotations
- Write comprehensive tests

## Support

### Getting Help
- Check the documentation
- Review the API documentation
- Test with the provided test pages
- Contact the development team

### Reporting Issues
- Provide detailed description
- Include error messages
- Specify environment details
- Attach relevant logs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flask framework for the backend
- Bootstrap for the UI framework
- SQLite for the database engine
- All contributors to the project

---

**Version**: 2.0.0  
**Last Updated**: August 23, 2025  
**Author**: TikTrack Development Team
