# 🚀 TikTrack Phoenix - Server Management Scripts

**Team:** 60 (DevOps & Platform)  
**Date:** 2026-01-31  
**Session:** SESSION_01

---

## 📋 Overview

סקריפטים להפעלה, עצירה ואתחול של שרתי הפרויקט (Backend ו-Frontend).

---

## 🛠️ Available Scripts

### **Backend Scripts:**

#### **`start-backend.sh`**
הפעלת שרת Backend על פורט 8080.

**שימוש:**
```bash
./scripts/start-backend.sh
```

**מה זה עושה:**
- בודק אם virtual environment קיים (יוצר אם לא)
- מפעיל virtual environment
- בודק אם dependencies מותקנים (מתקין אם לא)
- בודק אם פורט 8080 תפוס (מציע להרוג process קיים)
- מפעיל את FastAPI server עם uvicorn

**פלט:**
- API Base URL: `http://localhost:8080/api/v1`
- Health Check: `http://localhost:8080/health`
- API Docs: `http://localhost:8080/docs`

---

#### **`stop-backend.sh`**
עצירת שרת Backend.

**שימוש:**
```bash
./scripts/stop-backend.sh
```

**מה זה עושה:**
- מוצא process שרץ על פורט 8080
- הורג את ה-process

---

#### **`restart-backend.sh`**
אתחול שרת Backend.

**שימוש:**
```bash
./scripts/restart-backend.sh
```

**מה זה עושה:**
- עוצר את השרת
- ממתין 2 שניות
- מפעיל את השרת מחדש

---

### **Frontend Scripts:**

#### **`start-frontend.sh`**
הפעלת שרת Frontend Dev על פורט 3000.

**שימוש:**
```bash
./scripts/start-frontend.sh
```

**מה זה עושה:**
- בודק אם node_modules קיים (מתקין dependencies אם לא)
- בודק אם פורט 3000 תפוס (מציע להרוג process קיים)
- מפעיל את Vite dev server

**פלט:**
- Frontend URL: `http://localhost:3000`
- API Proxy: `/api -> http://localhost:8080`

---

#### **`stop-frontend.sh`**
עצירת שרת Frontend Dev.

**שימוש:**
```bash
./scripts/stop-frontend.sh
```

**מה זה עושה:**
- מוצא process שרץ על פורט 3000
- הורג את ה-process

---

## 🎯 Cursor Tasks

ניתן להפעיל את הסקריפטים גם דרך Cursor Tasks:

**פתיחת Tasks:**
- `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
- הקלד: `Tasks: Run Task`
- בחר את המשימה הרצויה

**משימות זמינות:**
- 🚀 Start Backend Server (Port 8080)
- 🛑 Stop Backend Server
- 🔄 Restart Backend Server
- 🚀 Start Frontend Dev Server (Port 3000)
- 🛑 Stop Frontend Dev Server
- 🚀 Start All Servers (Backend + Frontend) - **Default Build Task**
- 🛑 Stop All Servers
- 📋 Check Server Status

---

## 📋 Quick Start

### **הפעלת כל השרתים:**

**דרך Terminal:**
```bash
# Terminal 1 - Backend
./scripts/start-backend.sh

# Terminal 2 - Frontend
./scripts/start-frontend.sh
```

**דרך Cursor Tasks:**
1. `Cmd+Shift+P` → `Tasks: Run Task`
2. בחר: `🚀 Start All Servers (Backend + Frontend)`

---

## ⚠️ Requirements

### **Backend:**
- Python 3.11+
- Virtual environment (נוצר אוטומטית)
- Dependencies (מותקנים אוטומטית)

### **Frontend:**
- Node.js 18+
- npm
- Dependencies (מותקנים אוטומטית)

---

## 🔧 Troubleshooting

### **Port Already in Use:**
הסקריפטים יבדקו אוטומטית אם הפורט תפוס ויציעו להרוג את ה-process הקיים.

**אם זה לא עובד:**
```bash
# Backend (8080)
lsof -ti:8080 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### **Virtual Environment Issues:**
אם יש בעיות עם virtual environment:
```bash
cd api
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **Dependencies Issues:**
אם יש בעיות עם dependencies:
```bash
# Backend
cd api
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ui
npm install
```

---

## 📝 Notes

- כל הסקריפטים עם executable permissions (`chmod +x`)
- הסקריפטים תומכים ב-macOS ו-Linux
- Windows: יש להשתמש ב-Git Bash או WSL

---

**Maintained By:** Team 60 (DevOps & Platform)  
**Last Updated:** 2026-01-31
