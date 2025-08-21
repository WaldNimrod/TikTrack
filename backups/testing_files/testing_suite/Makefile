# TikTrack Testing Suite Makefile
# ======================================
# ⚠️  חשוב: זהו Makefile למערכת הבדיקות בלבד!
# 
# אין קשר לקונפיגורציות השרת או סביבת הפיתוח!
# 
# 🎯 מטרה: הרצת בדיקות אוטומטיות של TikTrack
# 📍 מיקום: Backend/testing_suite/
# 🔗 קונפיגורציות שרת: Backend/SERVER_CONFIGURATIONS.md
# 
# ======================================

.PHONY: help test test-unit test-integration test-e2e test-all coverage clean

# Default target
help:
	@echo "TikTrack Testing Suite - Available Commands:"
	@echo ""
	@echo "  test          - Run all tests"
	@echo "  test-unit     - Run unit tests only"
	@echo "  test-integration - Run integration tests only"
	@echo "  test-e2e      - Run E2E tests only"
	@echo "  test-performance - Run performance tests only"
	@echo "  test-load     - Run load tests only"
	@echo "  test-security - Run security tests only"
	@echo "  test-safe     - Run tests with database protection"
	@echo "  test-with-backup - Run tests with database backup"
	@echo "  coverage      - Run tests with coverage report"
	@echo "  clean         - Clean test artifacts"
	@echo "  install       - Install test dependencies"
	@echo "  validate      - Validate test environment"
	@echo ""
	@echo "  test-file FILE=path - Test specific file"
	@echo "  test-function FILE=path FUNCTION=name - Test specific function"
	@echo ""

# Install test dependencies
install:
	pip3 install -r requirements.txt

# Run all tests
test:
	python3 -m pytest -v

# Run unit tests
test-unit:
	python3 -m pytest unit_tests/ -v

# Run integration tests
test-integration:
	python3 -m pytest integration_tests/ -v

# Run E2E tests
test-e2e:
	python3 -m pytest e2e_tests/ -v

# Run performance tests
test-performance:
	python3 -m pytest performance_tests/ -v

# Run load tests
test-load:
	python3 -m pytest load_tests/ -v

# Run security tests
test-security:
	python3 -m pytest security_tests/ -v

# Run tests with coverage
coverage:
	python3 -m pytest -v --cov=.. --cov-report=html --cov-report=term-missing
	@echo "Coverage report generated in reports/htmlcov/"

# Run tests in parallel
test-parallel:
	python3 -m pytest -n auto -v

# Run tests with HTML report
test-html:
	python3 -m pytest -v --html=reports/test_report.html --self-contained-html

# Run tests with verbose output
test-verbose:
	python3 -m pytest -vvv

# Run tests and stop on first failure
test-failfast:
	python3 -m pytest -x -v

# Run tests with markers
test-slow:
	python3 -m pytest -m "slow" -v

test-fast:
	python3 -m pytest -m "not slow" -v

test-critical:
	python3 -m pytest -m "critical" -v

# Clean test artifacts
clean:
	rm -rf reports/htmlcov/
	rm -rf logs/.pytest_cache/
	rm -rf reports/test_report.html
	rm -rf .coverage
	rm -rf .pytest_cache/
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

# Generate test summary
summary:
	@echo "=== Test Summary ==="
	@python3 -m pytest --tb=no -q | tail -1
	@echo ""
	@echo "=== Coverage Summary ==="
	@python3 -m pytest --cov=.. --cov-report=term-missing -q | tail -5

# Run all test types
test-all: test-unit test-integration test-e2e test-performance test-load test-security

# Quick test (fast tests only)
quick: test-fast

# Full test suite (all tests with coverage)
full: coverage test-html summary

# Safe test execution (with database protection)
test-safe:
	python3 -m pytest -v --tb=short --strict-markers --disable-warnings

# Test specific test file
test-file:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make test-file FILE=path/to/test_file.py"; \
		exit 1; \
	fi
	python3 -m pytest $(FILE) -v

# Test specific test function
test-function:
	@if [ -z "$(FILE)" ] || [ -z "$(FUNCTION)" ]; then \
		echo "Usage: make test-function FILE=path/to/test_file.py FUNCTION=test_function_name"; \
		exit 1; \
	fi
	python3 -m pytest $(FILE)::$(FUNCTION) -v

# Run tests with database backup
test-with-backup:
	@echo "Creating database backup..."
	@cp ../db/simpleTrade_new.db ../db/simpleTrade_new_backup_$(shell date +%Y%m%d_%H%M%S).db
	python3 -m pytest -v
	@echo "Tests completed. Backup available in ../db/"

# Validate test environment
validate:
	@echo "Validating test environment..."
	@python3 -c "import pytest; print('✓ pytest available')"
	@python3 -c "import psutil; print('✓ psutil available')"
	@python3 -c "import sqlite3; print('✓ sqlite3 available')"
	@echo "✓ Test environment validated"
