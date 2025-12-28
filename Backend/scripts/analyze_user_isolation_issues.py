#!/usr/bin/env python3
"""
Analyze User Isolation Issues in API Routes
סקריפט לזיהוי פערים בסינון user_id ב-API routes
"""

import os
import re
import ast
from pathlib import Path
from typing import List, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base directory
BASE_DIR = Path(__file__).parent.parent
API_ROUTES_DIR = BASE_DIR / "routes" / "api"

# Models that should have user_id
MODELS_WITH_USER_ID = [
    'Trade', 'Execution', 'TradePlan', 'TradingAccount', 
    'Alert', 'Note', 'CashFlow', 'ImportSession', 'UserTicker',
    'WatchList', 'Tag', 'TagCategory', 'AIAnalysisRequest'
]

# Public endpoints that don't require user_id filtering
PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/api/ai_analysis/templates',
]

class RouteAnalyzer:
    """Analyze API routes for user isolation issues"""
    
    def __init__(self):
        self.issues = []
        self.routes_checked = []
        
    def analyze_file(self, file_path: Path) -> List[Dict]:
        """Analyze a single Python file for user isolation issues"""
        issues = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                tree = ast.parse(content, filename=str(file_path))
        except Exception as e:
            logger.warning(f"Error parsing {file_path}: {e}")
            return issues
        
        # Check for route decorators
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Check if function has route decorator
                has_route = any(
                    isinstance(d, ast.Call) and 
                    isinstance(d.func, ast.Attribute) and 
                    d.func.attr == 'route'
                    for d in node.decorator_list
                )
                
                if has_route:
                    route_info = self._analyze_route_function(node, file_path, content)
                    if route_info:
                        issues.append(route_info)
        
        return issues
    
    def _analyze_route_function(self, func_node: ast.FunctionDef, file_path: Path, content: str) -> Dict:
        """Analyze a route function for user isolation issues"""
        func_name = func_node.name
        func_line = func_node.lineno
        
        # Get function source code
        lines = content.split('\n')
        func_start = func_node.lineno - 1
        func_end = func_node.end_lineno if hasattr(func_node, 'end_lineno') else func_start + 50
        func_code = '\n'.join(lines[func_start:func_end])
        
        # Check for user_id usage
        has_user_id_getattr = 'getattr(g, \'user_id\'' in func_code or 'getattr(g, "user_id"' in func_code
        has_user_id_filter = '.filter(' in func_code and 'user_id' in func_code
        has_user_id_param = 'user_id=' in func_code
        has_resolve_user_id = '_resolve_user_id()' in func_code
        
        # Check for database queries
        has_db_query = 'db.query(' in func_code or 'db_session.query(' in func_code
        has_service_call = any(f'.{method}(' in func_code for method in ['get_all', 'get_by_id', 'create', 'update', 'delete'])
        
        # Check if it's a public endpoint (by checking route path)
        is_public = False
        for decorator in func_node.decorator_list:
            if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
                if decorator.func.attr == 'route':
                    if len(decorator.args) > 0 and isinstance(decorator.args[0], ast.Constant):
                        route_path = decorator.args[0].value
                        if any(route_path.startswith(public) for public in PUBLIC_ENDPOINTS):
                            is_public = True
                            break
        
        # Determine issue type
        issue_type = None
        severity = None
        
        if is_public:
            return None  # Public endpoints don't need user_id filtering
        
        if has_db_query and not has_user_id_getattr and not has_resolve_user_id:
            # Direct query without user_id check
            issue_type = "missing_user_id_check"
            severity = "high"
        elif has_service_call and not has_user_id_param and not has_resolve_user_id:
            # Service call without user_id parameter
            issue_type = "missing_user_id_parameter"
            severity = "medium"
        elif has_user_id_getattr and not has_user_id_filter and not has_user_id_param:
            # Has user_id but doesn't use it
            issue_type = "user_id_not_used"
            severity = "high"
        elif has_resolve_user_id:
            # Uses _resolve_user_id - check if it's used correctly
            if not has_user_id_filter and not has_user_id_param:
                issue_type = "user_id_resolved_but_not_used"
                severity = "medium"
            else:
                return None  # Looks good
        else:
            # No obvious issues, but might be using BaseEntityAPI
            if 'BaseEntityAPI' in func_code or 'base_api' in func_code:
                return None  # BaseEntityAPI handles user_id automatically
            # Check if it's a system/admin endpoint
            if any(keyword in func_code.lower() for keyword in ['system', 'admin', 'constraint', 'schema']):
                return None  # System endpoints might not need user_id
        
        if issue_type:
            return {
                'file': str(file_path.relative_to(BASE_DIR)),
                'function': func_name,
                'line': func_line,
                'issue_type': issue_type,
                'severity': severity,
                'has_user_id_getattr': has_user_id_getattr,
                'has_user_id_filter': has_user_id_filter,
                'has_user_id_param': has_user_id_param,
                'has_resolve_user_id': has_resolve_user_id,
                'has_db_query': has_db_query,
                'has_service_call': has_service_call,
            }
        
        return None
    
    def analyze_all_routes(self) -> List[Dict]:
        """Analyze all API route files"""
        all_issues = []
        
        if not API_ROUTES_DIR.exists():
            logger.error(f"API routes directory not found: {API_ROUTES_DIR}")
            return all_issues
        
        # Get all Python files in API routes directory
        route_files = list(API_ROUTES_DIR.glob("*.py"))
        
        logger.info(f"Analyzing {len(route_files)} route files...")
        
        for file_path in route_files:
            if file_path.name.startswith('__'):
                continue
            
            logger.info(f"Analyzing {file_path.name}...")
            issues = self.analyze_file(file_path)
            all_issues.extend(issues)
            self.routes_checked.append(file_path.name)
        
        return all_issues
    
    def generate_report(self, issues: List[Dict]) -> str:
        """Generate a report of all issues"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("User Isolation Issues Analysis Report")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Group by severity
        high_issues = [i for i in issues if i['severity'] == 'high']
        medium_issues = [i for i in issues if i['severity'] == 'medium']
        
        report_lines.append(f"Total Issues Found: {len(issues)}")
        report_lines.append(f"  - High Severity: {len(high_issues)}")
        report_lines.append(f"  - Medium Severity: {len(medium_issues)}")
        report_lines.append("")
        
        # Group by issue type
        issue_types = {}
        for issue in issues:
            issue_type = issue['issue_type']
            if issue_type not in issue_types:
                issue_types[issue_type] = []
            issue_types[issue_type].append(issue)
        
        report_lines.append("Issues by Type:")
        for issue_type, type_issues in sorted(issue_types.items()):
            report_lines.append(f"  - {issue_type}: {len(type_issues)}")
        report_lines.append("")
        
        # Detailed issues
        report_lines.append("=" * 80)
        report_lines.append("Detailed Issues")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        for issue in sorted(issues, key=lambda x: (x['severity'] == 'high', x['file'], x['line'])):
            report_lines.append(f"[{issue['severity'].upper()}] {issue['file']}:{issue['line']}")
            report_lines.append(f"  Function: {issue['function']}")
            report_lines.append(f"  Issue Type: {issue['issue_type']}")
            report_lines.append(f"  Details:")
            report_lines.append(f"    - Has user_id getattr: {issue['has_user_id_getattr']}")
            report_lines.append(f"    - Has user_id filter: {issue['has_user_id_filter']}")
            report_lines.append(f"    - Has user_id parameter: {issue['has_user_id_param']}")
            report_lines.append(f"    - Has resolve_user_id: {issue['has_resolve_user_id']}")
            report_lines.append(f"    - Has DB query: {issue['has_db_query']}")
            report_lines.append(f"    - Has service call: {issue['has_service_call']}")
            report_lines.append("")
        
        report_lines.append("=" * 80)
        report_lines.append(f"Files Checked: {len(self.routes_checked)}")
        report_lines.append("=" * 80)
        
        return "\n".join(report_lines)


def main():
    """Main function"""
    analyzer = RouteAnalyzer()
    
    logger.info("Starting user isolation analysis...")
    issues = analyzer.analyze_all_routes()
    
    # Generate report
    report = analyzer.generate_report(issues)
    
    # Print report
    print(report)
    
    # Save report to file
    report_file = BASE_DIR / "reports" / "user_isolation_analysis_report.txt"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    logger.info(f"Report saved to: {report_file}")
    logger.info(f"Found {len(issues)} issues")
    
    # Return exit code based on issues found
    if issues:
        high_issues = [i for i in issues if i['severity'] == 'high']
        if high_issues:
            logger.warning(f"Found {len(high_issues)} high severity issues!")
            return 1
    
    return 0


if __name__ == "__main__":
    exit(main())

