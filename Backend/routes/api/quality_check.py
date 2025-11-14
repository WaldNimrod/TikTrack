#!/usr/bin/env python3
"""
Quality Check API - TikTrack Backend
====================================

API endpoints for running code quality checks
"""

import os
import subprocess
import json
import re
from datetime import datetime
from pathlib import Path
from flask import Blueprint, jsonify
import logging

# Create blueprint
bp = Blueprint('quality_check', __name__)

# Setup logging
logger = logging.getLogger(__name__)

# Configuration
PROJECT_ROOT = Path(__file__).resolve().parents[3]
CONFIG = {
    'scripts_dir': PROJECT_ROOT / 'scripts',
    'monitors_dir': PROJECT_ROOT / 'scripts' / 'monitors',
    'generators_dir': PROJECT_ROOT / 'scripts' / 'generators',
    'reports_dir': PROJECT_ROOT / 'reports',
    'timeout': 30  # seconds
}
FUNCTION_INDEX_SCRIPTS_ROOT = PROJECT_ROOT / 'trading-ui' / 'scripts'
FUNCTION_INDEX_EXCLUDED_PARTS = {
    'archive',
    'backup',
    'backup-old-initialization-systems',
    'coverage',
    'node_modules',
    '__pycache__'
}
FUNCTION_DECLARATION_PATTERN = re.compile(r'\bfunction\s+[A-Za-z_]\w*\s*\(')
FUNCTION_INDEX_BLOCK_PATTERN = re.compile(r'/\*[\s\S]*?FUNCTION INDEX[\s\S]*?\*/', re.IGNORECASE)

@bp.route('/error-handling', methods=['POST'])
def check_error_handling():
    """Run Error Handling Coverage Monitor"""
    try:
        logger.info("Running Error Handling Coverage Monitor")
        
        # Run the monitor script
        result = run_script('error-handling-monitor.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_error_handling_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in error-handling check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/jsdoc', methods=['POST'])
def check_jsdoc():
    """Run JSDoc Coverage Reporter"""
    try:
        logger.info("Running JSDoc Coverage Reporter")
        
        # Run the reporter script
        result = run_script('jsdoc-coverage.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_jsdoc_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in jsdoc check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/naming', methods=['POST'])
def check_naming():
    """Run Naming Conventions Validator"""
    try:
        logger.info("Running Naming Conventions Validator")
        
        # Run the validator script
        result = run_script('naming-conventions-validator.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_naming_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in naming check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/function-index', methods=['POST'])
def check_function_index():
    """Validate Function Index coverage across scripts."""
    try:
        logger.info("Running Function Index coverage scan")
        data = build_function_index_report()
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as exc:
        logger.error(f"Error in function index check: {exc}")
        return jsonify({
            'status': 'error',
            'message': str(exc),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/generate-function-index', methods=['POST'])
def generate_function_index():
    """Generate Function Index for all files"""
    try:
        logger.info("Generating Function Index")
        
        # Run the generator script
        result = run_script('generate-function-index.js')
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'message': 'Function Index generated successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating function index: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/all', methods=['POST'])
def check_all():
    """Run all quality checks"""
    try:
        logger.info("Running all quality checks")
        
        results = {}
        
        # Run all checks
        checks = ['error-handling', 'jsdoc', 'naming', 'function-index', 'duplicates']
        
        for check in checks:
            try:
                if check == 'error-handling':
                    result = run_script('error-handling-monitor.js')
                    if result['success']:
                        results[check] = parse_error_handling_output(result['output'])
                elif check == 'jsdoc':
                    result = run_script('jsdoc-coverage.js')
                    if result['success']:
                        results[check] = parse_jsdoc_output(result['output'])
                elif check == 'naming':
                    result = run_script('naming-conventions-validator.js')
                    if result['success']:
                        results[check] = parse_naming_output(result['output'])
                elif check == 'function-index':
                    results[check] = build_function_index_report()
                elif check == 'duplicates':
                    result = run_script('advanced-duplicate-detector.js')
                    if result['success']:
                        results[check] = parse_duplicates_output(result['output'])
            except Exception as e:
                logger.error(f"Error in {check} check: {e}")
                results[check] = {'error': str(e)}
        
        return jsonify({
            'status': 'success',
            'data': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in all checks: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

def run_script(script_name):
    """Run a Node.js script and return the result"""
    try:
        script_path = _resolve_script_path(script_name)

        if script_path is None:
            return {
                'success': False,
                'error': f'Script not found: {script_name}'
            }
        
        # Run the script
        result = subprocess.run(
            ['node', str(script_path)],
            capture_output=True,
            text=True,
            timeout=CONFIG['timeout'],
            cwd=str(PROJECT_ROOT)
        )
        
        if result.returncode == 0:
            return {
                'success': True,
                'output': result.stdout,
                'error': result.stderr
            }
        else:
            return {
                'success': False,
                'error': result.stderr or 'Script execution failed'
            }
            
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Script execution timeout'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def parse_error_handling_output(output):
    """Parse Error Handling Monitor output"""
    try:
        # Look for the summary section in the output
        lines = output.split('\n')
        
        summary = {
            'total': 0,
            'withCoverage': 0,
            'withoutCoverage': 0,
            'coveragePercentage': '0.00'
        }
        
        pages = []
        
        # Parse the output to extract data
        for line in lines:
            if 'Total Functions:' in line:
                summary['total'] = int(line.split(':')[1].strip())
            elif 'With Coverage:' in line:
                summary['withCoverage'] = int(line.split(':')[1].strip())
            elif 'Without Coverage:' in line:
                summary['withoutCoverage'] = int(line.split(':')[1].strip())
            elif 'Coverage:' in line:
                coverage_str = line.split(':')[1].strip()
                summary['coveragePercentage'] = coverage_str.replace('%', '')
            elif '✅' in line or '⚠️' in line:
                # Parse page line
                parts = line.strip().split()
                if len(parts) >= 3:
                    status = parts[0]
                    filename = parts[1]
                    coverage = parts[2].replace('%', '')
                    
                    pages.append({
                        'file': filename,
                        'coveragePercentage': coverage,
                        'totalFunctions': 0,  # Would need more parsing
                        'functionsWithCoverage': 0,
                        'functionsWithoutCoverage': 0
                    })
        
        return {
            'summary': summary,
            'pages': pages
        }
        
    except Exception as e:
        logger.error(f"Error parsing error handling output: {e}")
        return {
            'summary': {'total': 0, 'withCoverage': 0, 'withoutCoverage': 0, 'coveragePercentage': '0.00'},
            'pages': []
        }

def parse_jsdoc_output(output):
    """Parse JSDoc Coverage Reporter output"""
    try:
        # Similar parsing logic for JSDoc output
        lines = output.split('\n')
        
        summary = {
            'total': 0,
            'withJSDoc': 0,
            'withoutJSDoc': 0,
            'coveragePercentage': '0.00'
        }
        
        pages = []
        
        for line in lines:
            if 'Total Functions:' in line:
                summary['total'] = int(line.split(':')[1].strip())
            elif 'With JSDoc:' in line:
                summary['withJSDoc'] = int(line.split(':')[1].strip())
            elif 'Without JSDoc:' in line:
                summary['withoutJSDoc'] = int(line.split(':')[1].strip())
            elif 'Coverage:' in line:
                coverage_str = line.split(':')[1].strip()
                summary['coveragePercentage'] = coverage_str.replace('%', '')
            elif '✅' in line or '⚠️' in line:
                parts = line.strip().split()
                if len(parts) >= 3:
                    status = parts[0]
                    filename = parts[1]
                    coverage = parts[2].replace('%', '')
                    
                    pages.append({
                        'file': filename,
                        'coveragePercentage': coverage,
                        'totalFunctions': 0,
                        'functionsWithJSDoc': 0,
                        'functionsWithoutJSDoc': 0
                    })
        
        return {
            'summary': summary,
            'pages': pages
        }
        
    except Exception as e:
        logger.error(f"Error parsing jsdoc output: {e}")
        return {
            'summary': {'total': 0, 'withJSDoc': 0, 'withoutJSDoc': 0, 'coveragePercentage': '0.00'},
            'pages': []
        }

def parse_naming_output(output):
    """Parse Naming Conventions Validator output"""
    try:
        lines = output.split('\n')
        
        summary = {
            'total': 0,
            'compliant': 0,
            'violations': 0
        }
        
        pages = []
        
        for line in lines:
            if 'Total Items:' in line:
                summary['total'] = int(line.split(':')[1].strip())
            elif 'Compliant:' in line:
                summary['compliant'] = int(line.split(':')[1].strip())
            elif 'Violations:' in line:
                summary['violations'] = int(line.split(':')[1].strip())
            elif '✅' in line or '⚠️' in line:
                parts = line.strip().split()
                if len(parts) >= 3:
                    status = parts[0]
                    filename = parts[1]
                    violations = int(parts[2].replace('violation(s)', '').strip())
                    
                    pages.append({
                        'file': filename,
                        'violations': [],
                        'total': 0,
                        'compliant': 0
                    })
        
        return {
            'summary': summary,
            'pages': pages
        }
        
    except Exception as e:
        logger.error(f"Error parsing naming output: {e}")
        return {
            'summary': {'total': 0, 'compliant': 0, 'violations': 0},
            'pages': []
        }

def parse_duplicates_output(output):
    """Parse Advanced Duplicate Detector output"""
    try:
        lines = output.split('\n')
        marker = '__REPORT_JSON__'

        report_json = None
        for line in reversed(lines):
            if line.startswith(marker):
                report_json = line[len(marker):].strip()
                break

        if report_json:
            try:
                report = json.loads(report_json)
            except json.JSONDecodeError as exc:
                logger.error(f"Failed to decode duplicate detector report: {exc}")
            else:
                summary = report.get('summary', {})
                duplicates_map = report.get('duplicates', {})

                flattened_duplicates = []
                for dup_type, dup_items in duplicates_map.items():
                    for item in dup_items:
                        flattened_duplicates.append({
                            'type': dup_type.lower(),
                            'similarity': item.get('similarity', 0),
                            'confidence': item.get('confidence', 0),
                            'category': item.get('category'),
                            'func1': item.get('func1', {}),
                            'func2': item.get('func2', {}),
                            'recommendation': item.get('recommendation', None)
                        })

                return {
                    'summary': {
                        'totalFunctions': summary.get('totalFunctions', 0),
                        'totalDuplicates': summary.get('totalDuplicates', 0),
                        'exactDuplicates': summary.get('exactDuplicates', 0),
                        'nearDuplicates': summary.get('nearDuplicates', 0),
                        'similarPatterns': summary.get('similarPatterns', 0),
                        'potentialDuplicates': summary.get('potentialDuplicates', 0)
                    },
                    'duplicates': flattened_duplicates,
                    'categories': report.get('categories', {}),
                    'recommendations': report.get('recommendations', [])
                }

        # Fallback to legacy parsing if JSON marker not found
        summary = {
            'totalFunctions': 0,
            'totalDuplicates': 0,
            'exactDuplicates': 0,
            'nearDuplicates': 0,
            'similarPatterns': 0,
            'potentialDuplicates': 0
        }

        for line in lines:
            if 'Total Functions Analyzed' in line:
                summary['totalFunctions'] = int(line.split(':')[1].strip())
            elif 'Total Duplicates Found' in line:
                summary['totalDuplicates'] = int(line.split(':')[1].strip())
            elif 'Exact Duplicates' in line:
                summary['exactDuplicates'] = int(line.split(':')[1].strip())
            elif 'Near Duplicates' in line:
                summary['nearDuplicates'] = int(line.split(':')[1].strip())
            elif 'Similar Patterns' in line:
                summary['similarPatterns'] = int(line.split(':')[1].strip())
            elif 'Potential Duplicates' in line:
                summary['potentialDuplicates'] = int(line.split(':')[1].strip())

        return {
            'summary': summary,
            'duplicates': [],
            'categories': {},
            'recommendations': []
        }
        
    except Exception as e:
        logger.error(f"Error parsing duplicates output: {e}")
        return {
            'summary': {
                'totalFunctions': 0,
                'totalDuplicates': 0,
                'exactDuplicates': 0,
                'nearDuplicates': 0,
                'similarPatterns': 0,
                'potentialDuplicates': 0
            },
            'duplicates': [],
            'categories': {},
            'recommendations': [],
            'error': str(e)
        }

@bp.route('/duplicates', methods=['POST'])
def check_duplicates():
    """Run Simple Duplicate Code Detector"""
    try:
        logger.info("Running Simple Duplicate Code Detector")
        
        # Run the advanced detector script
        result = run_script('advanced-duplicate-detector.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_duplicates_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error running duplicate detection: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        })


def build_function_index_report():
    """Scan project scripts and report Function Index coverage."""
    scripts_root = FUNCTION_INDEX_SCRIPTS_ROOT
    if not scripts_root.exists():
        raise FileNotFoundError(f'Scripts directory not found: {scripts_root}')

    pages = []
    for file_path in sorted(scripts_root.rglob('*.js')):
        relative = file_path.relative_to(scripts_root)
        if any(part in FUNCTION_INDEX_EXCLUDED_PARTS for part in relative.parts):
            continue

        try:
            content = file_path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            content = file_path.read_text(encoding='utf-8', errors='ignore')

        has_index = 'FUNCTION INDEX' in content
        total_functions = len(FUNCTION_DECLARATION_PATTERN.findall(content))

        index_entries = []
        if has_index:
            block_match = FUNCTION_INDEX_BLOCK_PATTERN.search(content)
            if block_match:
                index_entries = re.findall(r'-\s+(.+)', block_match.group(0))

        pages.append({
            'file': f"trading-ui/scripts/{relative.as_posix()}",
            'hasIndex': has_index,
            'missingIndex': not has_index,
            'indexEntries': len(index_entries),
            'totalFunctions': total_functions,
            'lastModified': datetime.utcfromtimestamp(file_path.stat().st_mtime).isoformat() + 'Z'
        })

    total_files = len(pages)
    files_with_index = sum(1 for page in pages if page['hasIndex'])
    summary = {
        'total': total_files,
        'filesWithIndex': files_with_index,
        'filesWithoutIndex': total_files - files_with_index,
        'coveragePercentage': f"{(files_with_index / total_files * 100):.2f}" if total_files else "0.00"
    }

    return {
        'summary': summary,
        'pages': pages,
        'issues': {
            'missingIndex': [page['file'] for page in pages if page['missingIndex']]
        },
        'generatedAt': datetime.utcnow().isoformat() + 'Z'
    }


def _resolve_script_path(script_name):
    """Return the first existing script path from configured directories."""
    search_roots = [
        CONFIG['monitors_dir'],
        CONFIG['generators_dir'],
        CONFIG['scripts_dir']
    ]

    for root in search_roots:
        candidate = Path(root) / script_name
        if candidate.exists():
            return candidate

    return None

        except UnicodeDecodeError:
            content = file_path.read_text(encoding='utf-8', errors='ignore')

        has_index = 'FUNCTION INDEX' in content
        total_functions = len(FUNCTION_DECLARATION_PATTERN.findall(content))

        index_entries = []
        if has_index:
            block_match = FUNCTION_INDEX_BLOCK_PATTERN.search(content)
            if block_match:
                index_entries = re.findall(r'-\s+(.+)', block_match.group(0))

        pages.append({
            'file': f"trading-ui/scripts/{relative.as_posix()}",
            'hasIndex': has_index,
            'missingIndex': not has_index,
            'indexEntries': len(index_entries),
            'totalFunctions': total_functions,
            'lastModified': datetime.utcfromtimestamp(file_path.stat().st_mtime).isoformat() + 'Z'
        })

    total_files = len(pages)
    files_with_index = sum(1 for page in pages if page['hasIndex'])
    summary = {
        'total': total_files,
        'filesWithIndex': files_with_index,
        'filesWithoutIndex': total_files - files_with_index,
        'coveragePercentage': f"{(files_with_index / total_files * 100):.2f}" if total_files else "0.00"
    }

    return {
        'summary': summary,
        'pages': pages,
        'issues': {
            'missingIndex': [page['file'] for page in pages if page['missingIndex']]
        },
        'generatedAt': datetime.utcnow().isoformat() + 'Z'
    }


def _resolve_script_path(script_name):
    """Return the first existing script path from configured directories."""
    search_roots = [
        CONFIG['monitors_dir'],
        CONFIG['generators_dir'],
        CONFIG['scripts_dir']
    ]

    for root in search_roots:
        candidate = Path(root) / script_name
        if candidate.exists():
            return candidate

    return None
