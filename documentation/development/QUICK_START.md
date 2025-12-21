# TikTrack Quick Start Guide

## 📋 Overview

This guide will help you get up and running with the TikTrack Trading Management System development environment quickly. Follow these steps to set up your development environment and start contributing to the project.

## 🚀 Prerequisites

### **Required Software**

- **Python 3.8+**: Latest stable version
- **Node.js 16+**: For frontend development
- **Git**: Version control system
- **SQLite**: Database (included with Python)
- **VS Code**: Recommended IDE (or your preferred editor)

### **System Requirements**

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for package downloads

## ⚡ Quick Setup (5 Minutes)

### **1. Clone the Repository**

```bash
git clone https://github.com/your-org/tiktrack.git
cd tiktrack
```

### **2. Set Up Python Environment**

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### **3. Set Up Frontend**

```bash
# Navigate to frontend directory
cd trading-ui

# Frontend files are served directly by Flask
# No Node.js setup required
```

### **4. Initialize Database**

```bash
# Navigate back to root
cd ..

# Run database setup
python Backend/create_fresh_database.py
```

### **5. Start Backend Server**

```bash
# Start development server
python Backend/dev_server.py
```

## 🎯 Verify Installation

### **Check Backend**

- Open browser to: `http://localhost:8080`
- You should see the TikTrack application
- Database should be accessible

### **Check Frontend**

- Open browser to: `http://localhost:8080`
- All pages should load without errors
- Navigation should work properly

### **Local Environment Layout**

- **Primary development instance**: `/Users/nimrod/Documents/TikTrack/TikTRACKAPP` (serves on port `8080`).
- **Test/staging instance**: `/Users/nimrod/Documents/TikTrack/TikTrackApp-Production` (serves on port `5001`).
- Ensure you run commands in the correct folder for the environment you intend to test.

### **Accessing the code review workplan**

- The Hebrew code-review report and work plan lives in Git at `reports/code_review_initial_findings.md` on branch `work`.
- To make it available locally: `git fetch origin` then either `git checkout work` or cherry-pick/merge into your working branch before opening the file.
- Keep your local clone in sync before running the servers on ports `8080`/`5001` to ensure the latest plan is visible.

## 📁 Project Structure

```
TikTrack/
├── Backend/                 # Python backend
│   ├── dev_server.py       # Development server
│   ├── create_fresh_database.py  # Database setup
│   └── requirements.txt    # Python dependencies
├── trading-ui/             # Frontend application
│   ├── index.html         # Main HTML file
│   ├── scripts/           # JavaScript files
│   └── styles/            # CSS files
├── documentation/         # Project documentation
└── backups/              # Backup files
```

## 🔧 Development Workflow

### **1. Making Changes**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Test your changes

# Commit changes
git add .
git commit -m "Add feature description"

# Push to remote
git push origin feature/your-feature-name
```

### **2. Testing Changes**

```bash
# Run backend tests
# Manual testing - no automated test suite currently

# Frontend testing is manual
# Test all pages and functionality

# Manual testing
# - Test all affected pages
# - Verify database operations
# - Check for console errors
```

### **3. Code Quality**

```bash
# Python linting
pip install flake8
flake8 Backend/

# Format code
# Python: black Backend/
```

## 🗄️ Database Management

### **Database Location**

- **File**: `Backend/db/simpleTrade_new.db`
- **Type**: SQLite database
- **Backup**: Automatic backups in `backups/` directory

### **Common Database Operations**

```bash
# Reset database to fresh state
python Backend/create_fresh_database.py

# View database (using SQLite browser)
sqlite3 Backend/db/simpleTrade_new.db

# Backup database
cp Backend/db/simpleTrade_new.db backups/backup_$(date +%Y%m%d_%H%M%S).db
```

## 🎨 Frontend Development

### **File Structure**

```
trading-ui/
├── index.html              # Main application page
├── scripts/
│   ├── app.js             # Main application logic
│   ├── tables.js          # Table management
│   ├── modals.js          # Modal system
│   └── utils.js           # Utility functions
├── styles/
│   ├── main.css           # Main stylesheet
│   └── components.css     # Component styles
└── pages/                 # Individual page files
    ├── trades.html
    ├── accounts.html
    └── alerts.html
```

### **Adding New Pages**

1. Create HTML file in `trading-ui/pages/`
2. Add navigation link in `index.html`
3. Create corresponding JavaScript file
4. Add page-specific styles
5. Update documentation

## 🔧 Backend Development

### **File Structure**

```
Backend/
├── dev_server.py          # Main server file
├── models/                # Database models
├── api/                   # API endpoints
├── utils/                 # Utility functions
└── config/                # Configuration files
```

### **Adding New API Endpoints**

1. Define model in `models/`
2. Create API endpoint in `dev_server.py`
3. Add validation and error handling
4. Test endpoint functionality
5. Update API documentation

## 🧪 Testing

### **Running Tests**

```bash
# Backend tests
python -m pytest Backend/tests/

# Frontend tests (if configured)
npm test

# Manual testing checklist
# - [ ] All pages load correctly
# - [ ] CRUD operations work
# - [ ] Filters function properly
# - [ ] No console errors
# - [ ] Responsive design works
```

### **Test Data**

- Sample data is created automatically
- Use `create_fresh_database.py` to reset with sample data
- Test with various data scenarios

## 🚨 Common Issues

### **Port Already in Use**

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
python Backend/dev_server.py --port 8081
```

### **Database Locked**

```bash
# Close any open database connections
# Restart the development server
# If persistent, delete and recreate database
rm Backend/db/simpleTrade_new.db
python Backend/create_fresh_database.py
```

### **Frontend Issues**

```bash
# Clear browser cache
# Refresh page with Ctrl+F5

# Check for JavaScript errors in browser console
```

## 📚 Next Steps

### **Learning Resources**

1. **Read Documentation**: Start with `documentation/README.md`
2. **Study Code**: Review existing implementations
3. **Join Team**: Connect with other developers
4. **Ask Questions**: Use team communication channels

### **First Tasks**

1. **Familiarize**: Explore all pages and features
2. **Understand**: Study the codebase structure
3. **Contribute**: Pick a small bug or feature
4. **Document**: Update documentation as needed

## 🔗 Useful Commands

### **Development Commands**

```bash
# Start development
./restart

# View logs
tail -f logs/dev.log

# Check status
ps aux | grep python

# Database operations
sqlite3 Backend/db/simpleTrade_new.db ".tables"
```

### **Git Commands**

```bash
# Check status
git status

# View changes
git diff

# View history
git log --oneline

# Switch branches
git checkout main
```

## 📞 Getting Help

### **Documentation**

- **Main Docs**: `documentation/README.md`
- **API Docs**: `documentation/api/`
- **Database Docs**: `documentation/database/`

### **Team Support**

- **Slack**: #tiktrack-dev
- **Email**: dev@tiktrack.com
- **Issues**: GitHub Issues

---

**Welcome to TikTrack Development!** 🚀

**Last Updated**: August 29, 2025  
**Version**: 2.0  
**Maintainer**: TikTrack Development Team
