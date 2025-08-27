#!/bin/bash

echo "🚀 Setting up TikTrack development environment..."

# Check if Python 3.9+ is installed
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
required_version="3.9"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.9+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install development dependencies
echo "📚 Installing development dependencies..."
pip install -r Backend/requirements.txt
pip install pre-commit mypy black isort flake8 pytest

# Install pre-commit hooks
echo "🔗 Installing pre-commit hooks..."
pre-commit install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p Backend/logs
mkdir -p Backend/uploads/notes
mkdir -p Backend/testing_suite/reports

# Set up database
echo "🗄️ Setting up database..."
cd Backend
python -c "
from config.database import init_db
init_db()
print('✅ Database initialized successfully!')
"

# Run initial type check
echo "🔍 Running initial type check..."
mypy Backend/ --ignore-missing-imports

# Run initial formatting
echo "🎨 Running initial code formatting..."
black Backend/
isort Backend/

echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run type check: mypy Backend/"
echo "3. Run tests: pytest Backend/testing_suite/"
echo "4. Format code: black Backend/"
echo "5. Sort imports: isort Backend/"
echo ""
echo "🔧 Pre-commit hooks are now active and will run automatically on commit"
