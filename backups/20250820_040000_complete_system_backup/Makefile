.PHONY: help setup install test type-check format lint clean

# Default target
help:
	@echo "TikTrack Development Commands:"
	@echo ""
	@echo "  setup      - Setup development environment"
	@echo "  install    - Install dependencies"
	@echo "  test       - Run all tests"
	@echo "  type-check - Run type checking with mypy"
	@echo "  format     - Format code with black and isort"
	@echo "  lint       - Run linting with flake8"
	@echo "  clean      - Clean cache files"
	@echo "  check-all  - Run all checks (type, format, lint)"
	@echo "  pre-commit - Run pre-commit hooks on all files"

# Setup development environment
setup:
	@echo "🚀 Setting up TikTrack development environment..."
	chmod +x setup_development.sh
	./setup_development.sh

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pip install -r Backend/requirements.txt
	pip install pre-commit mypy black isort flake8 pytest

# Run tests
test:
	@echo "🧪 Running tests..."
	pytest Backend/testing_suite/ -v --tb=short

# Type checking
type-check:
	@echo "🔍 Running type checking..."
	mypy Backend/ --ignore-missing-imports

# Format code
format:
	@echo "🎨 Formatting code..."
	black Backend/
	isort Backend/

# Lint code
lint:
	@echo "🔧 Running linting..."
	flake8 Backend/ --max-line-length=88 --extend-ignore=E203,W503

# Clean cache files
clean:
	@echo "🧹 Cleaning cache files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

# Run all checks
check-all: type-check format lint
	@echo "✅ All checks completed!"

# Run pre-commit hooks
pre-commit:
	@echo "🔗 Running pre-commit hooks..."
	pre-commit run --all-files

# Quick development cycle
dev-cycle: format type-check lint test
	@echo "✅ Development cycle completed!"

# Database operations
db-init:
	@echo "🗄️ Initializing database..."
	cd Backend && python -c "from config.database import init_db; init_db()"

db-reset:
	@echo "🔄 Resetting database..."
	rm -f Backend/db/simpleTrade_new.db
	cd Backend && python -c "from config.database import init_db; init_db()"

# Server operations
server-dev:
	@echo "🚀 Starting development server..."
	cd Backend && python app.py

server-prod:
	@echo "🚀 Starting production server..."
	cd Backend && python run_waitress_fixed.py

# Documentation
docs:
	@echo "📚 Generating documentation..."
	cd Backend && python -c "import pydoc; pydoc.writedocs('docs')"

# Security checks
security:
	@echo "🔒 Running security checks..."
	bandit -r Backend/ -f json -o security-report.json

# Performance checks
performance:
	@echo "⚡ Running performance tests..."
	pytest Backend/testing_suite/performance_tests/ -v

# Coverage report
coverage:
	@echo "📊 Generating coverage report..."
	pytest Backend/testing_suite/ --cov=Backend --cov-report=html --cov-report=term

# Docker operations
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t tiktrack:latest Backend/

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 tiktrack:latest

# Backup operations
backup:
	@echo "💾 Creating backup..."
	tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz Backend/db/ Backend/logs/

# Monitoring
monitor:
	@echo "📊 Starting monitoring..."
	cd Backend && python monitor_server.py

# Tutorial and Learning
tutorial:
	@echo "📚 Starting Type Annotations Tutorial..."
	cd Backend && python tutorials/type_annotations_tutorial.py

type-check-report:
	@echo "🔍 Generating detailed type annotation report..."
	cd Backend && python utils/type_checker.py

onboarding:
	@echo "🎉 Starting onboarding process..."
	chmod +x onboarding.sh
	./onboarding.sh

help-new-developer:
	@echo "🚀 Quick Start for New Developers:"
	@echo ""
	@echo "1. Run onboarding:"
	@echo "   make onboarding"
	@echo ""
	@echo "2. Take the tutorial:"
	@echo "   make tutorial"
	@echo ""
	@echo "3. Check for type issues:"
	@echo "   make type-check-report"
	@echo ""
	@echo "4. Run all checks:"
	@echo "   make check-all"
	@echo ""
	@echo "5. Start developing!"
	@echo "   Remember: Always add type annotations!"
