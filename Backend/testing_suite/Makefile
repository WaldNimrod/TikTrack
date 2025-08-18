# TikTrack Testing Suite Makefile

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
	@echo "  coverage      - Run tests with coverage report"
	@echo "  clean         - Clean test artifacts"
	@echo "  install       - Install test dependencies"
	@echo ""

# Install test dependencies
install:
	pip3 install pytest pytest-cov pytest-html pytest-xdist

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
