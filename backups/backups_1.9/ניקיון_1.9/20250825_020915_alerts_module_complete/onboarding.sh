#!/bin/bash

echo "🎉 Welcome to the TikTrack team!"
echo "=================================="
echo ""

# Check if this is first time setup
if [ -f ".onboarding_completed" ]; then
    echo "✅ Onboarding already completed. Skipping..."
    exit 0
fi

echo "📋 Starting automated onboarding process..."
echo ""

# 1. Setup development environment
echo "🔧 Step 1: Setting up development environment..."
chmod +x setup_development.sh
./setup_development.sh

# 2. Install VS Code extensions
echo "🔧 Step 2: Installing VS Code extensions..."
code --install-extension ms-python.python
code --install-extension ms-python.black-formatter
code --install-extension ms-python.isort
code --install-extension ms-python.flake8
code --install-extension ms-python.mypy-type-checker

# 3. Create developer profile
echo "👤 Step 3: Creating developer profile..."
read -p "Enter your name: " DEVELOPER_NAME
read -p "Enter your email: " DEVELOPER_EMAIL

# Create developer info file
cat > .developer_info << EOF
DEVELOPER_NAME="$DEVELOPER_NAME"
DEVELOPER_EMAIL="$DEVELOPER_EMAIL"
ONBOARDING_DATE="$(date +%Y-%m-%d)"
EOF

# 4. Run initial checks
echo "🔍 Step 4: Running initial quality checks..."
make check-all

# 5. Show welcome message
echo ""
echo "🎉 Onboarding completed successfully!"
echo "====================================="
echo ""
echo "📚 Next steps:"
echo "1. Read the development guidelines:"
echo "   - Backend/DEVELOPMENT_GUIDELINES.md"
echo "   - README_DEVELOPMENT.md"
echo ""
echo "2. Familiarize yourself with the templates:"
echo "   - Backend/templates/function_templates.py"
echo ""
echo "3. Test your setup:"
echo "   - make type-check"
echo "   - make test"
echo ""
echo "4. Start developing:"
echo "   - Use templates for new functions"
echo "   - Always add type annotations"
echo "   - Run checks before committing"
echo ""
echo "🔧 Your development environment is ready!"
echo ""

# Mark onboarding as completed
touch .onboarding_completed

echo "📝 Onboarding completed on $(date)" >> .onboarding_completed
