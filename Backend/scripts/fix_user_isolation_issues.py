#!/usr/bin/env python3
"""
Fix User Isolation Issues in API Routes
סקריפט לתיקון פערים בסינון user_id ב-API routes

WARNING: This script modifies source files. Review all changes carefully before committing.
"""

import os
import re
import ast
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Base directory
BASE_DIR = Path(__file__).parent.parent
API_ROUTES_DIR = BASE_DIR / "routes" / "api"

# Public endpoints that don't require user_id filtering
PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/api/ai_analysis/templates',
]

# System/admin endpoints that might not need user_id (but should still check authentication)
SYSTEM_ENDPOINTS = [
    'system_settings',
    'system_overview',
    'database_schema',
    'constraints',
    'query_optimization',
    'file_scanner',
    'css_management',
    'server_management',
    'server_logs',
    'cache_management',
    'cache_sync',
    'cache_changes',
    'quality_check',
    'quality_lint',
    'background_tasks',
]

# Models that should have user_id
MODELS_WITH_USER_ID = [
    'Trade', 'Execution', 'TradePlan', 'TradingAccount', 
    'Alert', 'Note', 'CashFlow', 'ImportSession', 'UserTicker',
    'WatchList', 'Tag', 'TagCategory', 'AIAnalysisRequest'
]

# Models that are shared/system-wide (don't need user_id filtering)
SHARED_MODELS = [
    'Currency', 'TradingMethod', 'NoteRelationType', 'PreferenceGroup',
    'SystemSettingGroup', 'ExternalDataProvider', 'MarketDataQuote'
]

@dataclass
class Fix:
    """Represents a fix to be applied"""
    file_path: Path
    function_name: str
    line_number: int
    fix_type: str
    old_code: str
    new_code: str
    description: str
    confidence: float  # 0.0 to 1.0 - how confident we are this fix is correct

class RouteFixer:
    """Fix user isolation issues in API routes"""
    
    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.fixes = []
        self.files_modified = set()
        
    def analyze_and_fix_file(self, file_path: Path) -> List[Fix]:
        """Analyze a file and generate fixes"""
        fixes = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                tree = ast.parse(content, filename=str(file_path))
        except Exception as e:
            logger.warning(f"Error parsing {file_path}: {e}")
            return fixes
        
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
                    func_fixes = self._analyze_and_fix_route_function(
                        node, file_path, content, lines
                    )
                    fixes.extend(func_fixes)
        
        return fixes
    
    def _analyze_and_fix_route_function(
        self, 
        func_node: ast.FunctionDef, 
        file_path: Path, 
        content: str,
        lines: List[str]
    ) -> List[Fix]:
        """Analyze a route function and generate fixes"""
        fixes = []
        func_name = func_node.name
        func_start = func_node.lineno - 1
        func_end = func_node.end_lineno if hasattr(func_node, 'end_lineno') else func_start + 100
        
        # Get function source code
        func_code = '\n'.join(lines[func_start:func_end])
        func_lines = lines[func_start:func_end]
        
        # Check if it's a public endpoint
        is_public = False
        route_path = None
        for decorator in func_node.decorator_list:
            if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
                if decorator.func.attr == 'route':
                    if len(decorator.args) > 0 and isinstance(decorator.args[0], ast.Constant):
                        route_path = decorator.args[0].value
                        if any(route_path.startswith(public) for public in PUBLIC_ENDPOINTS):
                            is_public = True
                            break
        
        if is_public:
            return fixes  # Skip public endpoints
        
        # Check if it's a system endpoint
        is_system = any(sys_endpoint in str(file_path) for sys_endpoint in SYSTEM_ENDPOINTS)
        
        # Analyze function body
        has_user_id_getattr = 'getattr(g, \'user_id\'' in func_code or 'getattr(g, "user_id"' in func_code
        has_user_id_filter = '.filter(' in func_code and 'user_id' in func_code
        has_user_id_param = 'user_id=' in func_code
        has_resolve_user_id = '_resolve_user_id()' in func_code
        has_db_query = 'db.query(' in func_code or 'db_session.query(' in func_code
        has_service_call = any(f'.{method}(' in func_code for method in ['get_all', 'get_by_id', 'create', 'update', 'delete'])
        uses_base_api = 'base_api.' in func_code or 'BaseEntityAPI' in func_code
        
        # Skip if uses BaseEntityAPI (it handles user_id automatically)
        if uses_base_api:
            return fixes
        
        # Generate fixes based on patterns
        if has_db_query and not has_user_id_getattr and not has_resolve_user_id:
            # Direct query without user_id check
            fix = self._generate_user_id_check_fix(
                func_node, func_lines, func_start, file_path, func_name
            )
            if fix:
                fixes.append(fix)
        
        elif has_service_call and not has_user_id_param and not has_resolve_user_id:
            # Service call without user_id parameter
            fix = self._generate_service_user_id_fix(
                func_node, func_lines, func_start, file_path, func_name, func_code
            )
            if fix:
                fixes.append(fix)
        
        elif has_user_id_getattr and not has_user_id_filter and not has_user_id_param and has_db_query:
            # Has user_id but doesn't use it in query
            fix = self._generate_query_filter_fix(
                func_node, func_lines, func_start, file_path, func_name, func_code
            )
            if fix:
                fixes.append(fix)
        
        elif has_resolve_user_id and not has_user_id_filter and not has_user_id_param and has_db_query:
            # Resolves user_id but doesn't use it
            fix = self._generate_resolved_user_id_usage_fix(
                func_node, func_lines, func_start, file_path, func_name, func_code
            )
            if fix:
                fixes.append(fix)
        
        return fixes
    
    def _generate_user_id_check_fix(
        self, func_node, func_lines, func_start, file_path, func_name
    ) -> Optional[Fix]:
        """Generate fix for missing user_id check"""
        # Find where to insert user_id check (after db: Session = g.db)
        insert_line = None
        for i, line in enumerate(func_lines):
            if 'db: Session = g.db' in line or 'db = g.db' in line:
                insert_line = func_start + i + 1
                break
        
        if insert_line is None:
            # Try to find after @handle_database_session
            for i, line in enumerate(func_lines):
                if 'handle_database_session' in line:
                    # Find first non-empty line after decorators
                    for j in range(i + 1, len(func_lines)):
                        if func_lines[j].strip() and not func_lines[j].strip().startswith('@'):
                            insert_line = func_start + j
                            break
                    break
        
        if insert_line is None:
            logger.warning(f"Could not find insertion point for user_id check in {file_path}:{func_name}")
            return None
        
        # Generate fix
        indent = '        '  # Standard indent for function body
        old_code = func_lines[insert_line - func_start] if insert_line - func_start < len(func_lines) else ''
        
        new_code = f"""{indent}# Get user_id from Flask context (set by auth middleware)
{indent}user_id = getattr(g, 'user_id', None)
{indent}
{indent}if user_id is None:
{indent}    return jsonify({{
{indent}        "status": "error",
{indent}        "error": {{"message": "User authentication required"}},
{indent}        "version": "1.0"
{indent}    }}), 401
{indent}
{old_code}"""
        
        return Fix(
            file_path=file_path,
            function_name=func_name,
            line_number=insert_line + 1,
            fix_type="add_user_id_check",
            old_code=old_code,
            new_code=new_code,
            description=f"Add user_id authentication check to {func_name}",
            confidence=0.8
        )
    
    def _generate_service_user_id_fix(
        self, func_node, func_lines, func_start, file_path, func_name, func_code
    ) -> Optional[Fix]:
        """Generate fix for service calls missing user_id parameter"""
        # This is more complex - need to find service calls and add user_id
        # For now, skip - this requires more context analysis
        return None
    
    def _generate_query_filter_fix(
        self, func_node, func_lines, func_start, file_path, func_name, func_code
    ) -> Optional[Fix]:
        """Generate fix for queries that have user_id but don't filter by it"""
        # Find db.query lines
        query_lines = []
        for i, line in enumerate(func_lines):
            if 'db.query(' in line or 'db_session.query(' in line:
                query_lines.append((i, line))
        
        if not query_lines:
            return None
        
        # Find the first query and add filter
        line_idx, line = query_lines[0]
        actual_line = func_start + line_idx
        
        # Check if already has filter
        if '.filter(' in line and 'user_id' in line:
            return None
        
        # Find the model name
        model_match = re.search(r'db\.query\((\w+)', line)
        if not model_match:
            return None
        
        model_name = model_match.group(1)
        
        # Check if model should have user_id
        if model_name not in MODELS_WITH_USER_ID:
            return None
        
        # Generate fix - add filter after query
        old_code = line
        indent = ' ' * (len(line) - len(line.lstrip()))
        
        # Find where query ends (before .all(), .first(), etc.)
        query_end_pattern = r'\.(all|first|count|one|one_or_none)\(\)'
        if re.search(query_end_pattern, func_code):
            # Need to insert filter before the method call
            new_code = f"{line.rstrip()}\n{indent}if user_id is not None:\n{indent}    query = query.filter({model_name}.user_id == user_id)"
        else:
            # Simple case - add filter
            new_code = f"{line.rstrip()}\n{indent}if user_id is not None:\n{indent}    query = query.filter({model_name}.user_id == user_id)"
        
        return Fix(
            file_path=file_path,
            function_name=func_name,
            line_number=actual_line + 1,
            fix_type="add_query_filter",
            old_code=old_code,
            new_code=new_code,
            description=f"Add user_id filter to query in {func_name}",
            confidence=0.7
        )
    
    def _generate_resolved_user_id_usage_fix(
        self, func_node, func_lines, func_start, file_path, func_name, func_code
    ) -> Optional[Fix]:
        """Generate fix for functions that resolve user_id but don't use it"""
        # Similar to query filter fix
        return None
    
    def apply_fixes(self, fixes: List[Fix]) -> Dict[str, int]:
        """Apply fixes to files"""
        stats = {
            'files_modified': 0,
            'fixes_applied': 0,
            'fixes_skipped': 0
        }
        
        # Group fixes by file
        fixes_by_file = {}
        for fix in fixes:
            if fix.file_path not in fixes_by_file:
                fixes_by_file[fix.file_path] = []
            fixes_by_file[fix.file_path].append(fix)
        
        # Sort fixes by line number (descending) to avoid line number shifts
        for file_path, file_fixes in fixes_by_file.items():
            file_fixes.sort(key=lambda f: f.line_number, reverse=True)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                original_lines = lines.copy()
                
                for fix in file_fixes:
                    if fix.confidence < 0.6:
                        logger.warning(f"Skipping low-confidence fix: {fix.description}")
                        stats['fixes_skipped'] += 1
                        continue
                    
                    # Apply fix
                    line_idx = fix.line_number - 1
                    if line_idx < len(lines):
                        # Replace the line
                        lines[line_idx] = fix.new_code + '\n'
                        stats['fixes_applied'] += 1
                        logger.info(f"Applied fix: {fix.description} at {file_path}:{fix.line_number}")
                    else:
                        logger.warning(f"Line {fix.line_number} out of range in {file_path}")
                        stats['fixes_skipped'] += 1
                
                # Write back if changes were made
                if lines != original_lines:
                    if not self.dry_run:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.writelines(lines)
                        stats['files_modified'] += 1
                        logger.info(f"Modified {file_path}")
                    else:
                        logger.info(f"[DRY RUN] Would modify {file_path}")
                        stats['files_modified'] += 1
                
            except Exception as e:
                logger.error(f"Error applying fixes to {file_path}: {e}")
                stats['fixes_skipped'] += len(file_fixes)
        
        return stats
    
    def analyze_all_routes(self) -> List[Fix]:
        """Analyze all API route files and generate fixes"""
        all_fixes = []
        
        if not API_ROUTES_DIR.exists():
            logger.error(f"API routes directory not found: {API_ROUTES_DIR}")
            return all_fixes
        
        # Get all Python files in API routes directory
        route_files = list(API_ROUTES_DIR.glob("*.py"))
        
        logger.info(f"Analyzing {len(route_files)} route files...")
        
        for file_path in route_files:
            if file_path.name.startswith('__'):
                continue
            
            logger.info(f"Analyzing {file_path.name}...")
            fixes = self.analyze_and_fix_file(file_path)
            all_fixes.extend(fixes)
            logger.info(f"  Found {len(fixes)} potential fixes")
        
        return all_fixes
    
    def generate_report(self, fixes: List[Fix]) -> str:
        """Generate a report of all fixes"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("User Isolation Fixes Report")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Group by fix type
        fixes_by_type = {}
        for fix in fixes:
            if fix.fix_type not in fixes_by_type:
                fixes_by_type[fix.fix_type] = []
            fixes_by_type[fix.fix_type].append(fix)
        
        report_lines.append(f"Total Fixes Generated: {len(fixes)}")
        report_lines.append("")
        report_lines.append("Fixes by Type:")
        for fix_type, type_fixes in sorted(fixes_by_type.items()):
            report_lines.append(f"  - {fix_type}: {len(type_fixes)}")
        report_lines.append("")
        
        # Group by confidence
        high_confidence = [f for f in fixes if f.confidence >= 0.7]
        medium_confidence = [f for f in fixes if 0.5 <= f.confidence < 0.7]
        low_confidence = [f for f in fixes if f.confidence < 0.5]
        
        report_lines.append("Fixes by Confidence:")
        report_lines.append(f"  - High (>=0.7): {len(high_confidence)}")
        report_lines.append(f"  - Medium (0.5-0.7): {len(medium_confidence)}")
        report_lines.append(f"  - Low (<0.5): {len(low_confidence)}")
        report_lines.append("")
        
        # Detailed fixes
        report_lines.append("=" * 80)
        report_lines.append("Detailed Fixes")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        for fix in sorted(fixes, key=lambda x: (x.file_path, x.line_number)):
            report_lines.append(f"[{fix.fix_type}] {fix.file_path}:{fix.line_number}")
            report_lines.append(f"  Function: {fix.function_name}")
            report_lines.append(f"  Description: {fix.description}")
            report_lines.append(f"  Confidence: {fix.confidence:.2f}")
            report_lines.append(f"  Old code: {fix.old_code[:100]}...")
            report_lines.append(f"  New code: {fix.new_code[:100]}...")
            report_lines.append("")
        
        return "\n".join(report_lines)


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix user isolation issues in API routes')
    parser.add_argument('--dry-run', action='store_true', default=True,
                       help='Dry run mode (default: True)')
    parser.add_argument('--apply', action='store_true',
                       help='Actually apply fixes (overrides --dry-run)')
    parser.add_argument('--min-confidence', type=float, default=0.6,
                       help='Minimum confidence threshold for fixes (default: 0.6)')
    
    args = parser.parse_args()
    
    dry_run = not args.apply
    
    if not dry_run:
        response = input("⚠️  WARNING: This will modify source files. Continue? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Aborted by user")
            return 0
    
    fixer = RouteFixer(dry_run=dry_run)
    
    logger.info("Starting user isolation fix analysis...")
    fixes = fixer.analyze_all_routes()
    
    # Filter by confidence
    fixes = [f for f in fixes if f.confidence >= args.min_confidence]
    
    # Generate report
    report = fixer.generate_report(fixes)
    
    # Print report
    print(report)
    
    # Save report to file
    report_file = BASE_DIR / "reports" / "user_isolation_fixes_report.txt"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    logger.info(f"Report saved to: {report_file}")
    
    if not dry_run:
        logger.info("Applying fixes...")
        stats = fixer.apply_fixes(fixes)
        logger.info(f"Applied {stats['fixes_applied']} fixes to {stats['files_modified']} files")
        logger.info(f"Skipped {stats['fixes_skipped']} fixes")
    else:
        logger.info(f"[DRY RUN] Would apply {len(fixes)} fixes")
        logger.info("Run with --apply to actually apply fixes")
    
    return 0


if __name__ == "__main__":
    exit(main())
