# TikTrack Backend Makefile

.PHONY: help install test lint format clean build run deploy docker-build docker-run docker-stop

# Default target
help:
	@echo "TikTrack Backend - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install dependencies"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code"
	@echo "  run         - Run development server"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  docker-stop  - Stop Docker containers"
	@echo ""
	@echo "Deployment:"
	@echo "  build       - Build application"
	@echo "  deploy      - Deploy to staging"
	@echo "  deploy-prod - Deploy to production"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Clean up files"
	@echo "  logs        - Show logs"

# Development
install:
	@echo "📦 Installing dependencies..."
	pip install -r requirements_new.txt
	pip install pytest pytest-cov pytest-flask flake8 black isort

test:
	@echo "🧪 Running tests..."
	python -m pytest tests/ -v --cov=. --cov-report=html

lint:
	@echo "🔍 Running linting..."
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

format:
	@echo "🎨 Formatting code..."
	black .
	isort .

run:
	@echo "🚀 Starting development server..."
	python app_new.py

# Docker
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t tiktrack-backend .

docker-run:
	@echo "🐳 Starting with Docker Compose..."
	docker-compose up -d

docker-stop:
	@echo "🐳 Stopping Docker containers..."
	docker-compose down

# Deployment
build:
	@echo "🔨 Building application..."
	python3 -c "from app_new import create_app; print('✅ Build successful')"

deploy:
	@echo "🚀 Deploying to staging..."
	chmod +x scripts/deploy.sh
	./scripts/deploy.sh staging

deploy-prod:
	@echo "🚀 Deploying to production..."
	chmod +x scripts/deploy.sh
	./scripts/deploy.sh production

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	rm -rf build/
	rm -rf dist/

logs:
	@echo "📋 Showing logs..."
	docker-compose logs -f tiktrack-backend

# Quick commands
dev: install run
test-full: lint test
docker: docker-build docker-run
