#!/usr/bin/env python3
"""
Date Usage Audit Script
======================

This script scans the codebase for date-related code patterns and identifies
places where dates might not be using the centralized date handling systems.

The script does NOT modify code - it only generates a report of suspicious
locations that need manual review.

Centralized Systems:
- Frontend: FieldRendererService.renderDate, dateUtils, window.formatDate
- Backend: DateNormalizationService, BaseEntityUtils.normalize_output

Author: TikTrack Development Team
Version: 1.0
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple, Set
from collections import defaultdict
from datetime import datetime

# Directories to scan
SCAN_DIRECTORIES = [
    'trading-ui/scripts',
    'Backend/routes/api',
    'Backend/services',
    'Backend/models',
]

# Files to exclude
EXCLUDE_PATTERNS = [
    r'.*\.min\.js$',
    r'.*node_modules.*',
    r'.*\.pyc$',
    r'.*__pycache__.*',
    r'.*\.git.*',
    r'.*archive.*',
    r'.*backup.*',
    r'.*_Tmp.*',
    r'.*production/.*',
]

# Centralized date handling patterns (GOOD - these should be used)
GOOD_PATTERNS = {
    'js': [
        r'FieldRendererService\.renderDate',
        r'window\.FieldRendererService\.renderDate',
        r'dateUtils\.formatDate',
        r'window\.dateUtils\.formatDate',
        r'window\.formatDate',
        r'dateUtils\.formatDateTime',
        r'window\.dateUtils\.formatDateTime',
        r'dateUtils\.parseEnvelope',
        r'dateUtils\.ensureDateEnvelope',
        r'dateUtils\.getEpochMilliseconds',
        r'DateNormalizationService',  # Backend service reference
    ],
    'py': [
        r'DateNormalizationService',
        r'normalize_output',
        r'normalize_input_payload',
        r'BaseEntityUtils\.normalize_output',
        r'BaseEntityUtils\.normalize_input',
        r'_get.*normalizer',
        r'now_envelope',
        r'_to_envelope',
    ],
}

# Suspicious patterns (BAD - these might need review)
SUSPICIOUS_PATTERNS = {
    'js': [
        # Direct Date constructor usage (might be OK in some contexts, but check)
        (r'new\s+Date\s*\([^)]*\)(?!\s*\.(toLocale|toISO|toDate|toTime))', 'Direct Date() constructor - consider using dateUtils'),
        # Direct date formatting methods
        (r'\.toLocaleString\s*\(', 'Direct toLocaleString() - should use FieldRendererService.renderDate'),
        (r'\.toLocaleDateString\s*\(', 'Direct toLocaleDateString() - should use FieldRendererService.renderDate'),
        (r'\.toLocaleTimeString\s*\(', 'Direct toLocaleTimeString() - should use FieldRendererService.renderDate'),
        (r'\.toISOString\s*\(', 'Direct toISOString() - should use dateUtils'),
        (r'\.toDateString\s*\(', 'Direct toDateString() - should use FieldRendererService.renderDate'),
        (r'\.toTimeString\s*\(', 'Direct toTimeString() - should use FieldRendererService.renderDate'),
        # Date parsing
        (r'Date\.parse\s*\(', 'Direct Date.parse() - should use dateUtils.parseEnvelope'),
        # Date manipulation
        (r'\.getTime\s*\(', 'Direct getTime() - should use dateUtils.getEpochMilliseconds'),
        (r'\.getFullYear\s*\(', 'Direct getFullYear() - might need dateUtils'),
        (r'\.getMonth\s*\(', 'Direct getMonth() - might need dateUtils'),
        (r'\.getDate\s*\(', 'Direct getDate() - might need dateUtils'),
        (r'\.getHours\s*\(', 'Direct getHours() - might need dateUtils'),
        (r'\.getMinutes\s*\(', 'Direct getMinutes() - might need dateUtils'),
        # Third-party date libraries (should not be used)
        (r'moment\s*\(', 'moment.js usage - should use centralized dateUtils'),
        (r'dayjs\s*\(', 'dayjs usage - should use centralized dateUtils'),
        (r'luxon\s*\.', 'luxon usage - should use centralized dateUtils'),
        # Local formatDate functions (might be OK if they delegate to centralized)
        (r'function\s+formatDate\s*\(', 'Local formatDate function - should use FieldRendererService.renderDate'),
        (r'const\s+formatDate\s*=', 'Local formatDate constant - should use FieldRendererService.renderDate'),
        (r'let\s+formatDate\s*=', 'Local formatDate variable - should use FieldRendererService.renderDate'),
        # Direct date field access without normalization (only in display/rendering contexts)
        (r'(innerHTML|textContent|appendChild|insertAdjacentHTML).*\.(created_at|updated_at|date)\s*[^.]', 'Direct date field access in rendering - should use FieldRendererService.renderDate'),
    ],
    'py': [
        # Direct datetime usage without normalization
        (r'datetime\.now\s*\(', 'Direct datetime.now() - should use DateNormalizationService.now_envelope()'),
        (r'datetime\.utcnow\s*\(', 'Direct datetime.utcnow() - should use DateNormalizationService'),
        (r'from\s+datetime\s+import\s+datetime', 'Direct datetime import - should use DateNormalizationService'),
        # Direct isoformat usage
        (r'\.isoformat\s*\(', 'Direct isoformat() - should use DateNormalizationService.normalize_output()'),
        # Direct strftime usage
        (r'\.strftime\s*\(', 'Direct strftime() - should use DateNormalizationService for display formatting'),
        # Direct date field access in API responses
        (r'created_at.*jsonify', 'Direct created_at in jsonify - should use normalize_output'),
        (r'updated_at.*jsonify', 'Direct updated_at in jsonify - should use normalize_output'),
        # Missing normalization in API endpoints
        (r'@.*route.*\ndef\s+get_.*\(.*\):\s*\n(?!.*normalize_output)', 'API endpoint might be missing normalize_output'),
        (r'return\s+jsonify.*data.*\)\s*\n(?!.*normalize)', 'API response might be missing date normalization'),
    ],
}

# Context patterns to check if suspicious patterns are actually OK
CONTEXT_OK_PATTERNS = {
    'js': [
        r'FieldRendererService\.renderDate',  # If nearby, might be OK
        r'dateUtils\.',  # If nearby, might be OK
        r'window\.formatDate',  # If nearby, might be OK
        r'//.*OK.*date',  # Comment indicates intentional
        r'//.*TODO.*date',  # Comment indicates known issue
    ],
    'py': [
        r'DateNormalizationService',  # If nearby, might be OK
        r'normalize_output',  # If nearby, might be OK
        r'#.*OK.*date',  # Comment indicates intentional
        r'#.*TODO.*date',  # Comment indicates known issue
    ],
}


class DateUsageAuditor:
    def __init__(self, base_dir: str = '.'):
        self.base_dir = Path(base_dir)
        self.issues: List[Dict] = []
        self.stats = defaultdict(int)
        
    def should_exclude_file(self, file_path: Path) -> bool:
        """Check if file should be excluded from scanning"""
        file_str = str(file_path)
        for pattern in EXCLUDE_PATTERNS:
            if re.search(pattern, file_str, re.IGNORECASE):
                return True
        return False
    
    def get_file_type(self, file_path: Path) -> str:
        """Determine file type (js or py)"""
        ext = file_path.suffix.lower()
        if ext == '.js':
            return 'js'
        elif ext == '.py':
            return 'py'
        return None
    
    def check_context(self, content: str, line_num: int, pattern: str, file_type: str) -> bool:
        """Check if suspicious pattern is in OK context"""
        # Check 5 lines before and after
        lines = content.split('\n')
        start = max(0, line_num - 5)
        end = min(len(lines), line_num + 6)
        context = '\n'.join(lines[start:end])
        
        for ok_pattern in CONTEXT_OK_PATTERNS.get(file_type, []):
            if re.search(ok_pattern, context, re.IGNORECASE):
                return True
        return False
    
    def scan_file(self, file_path: Path) -> List[Dict]:
        """Scan a single file for date usage patterns"""
        issues = []
        file_type = self.get_file_type(file_path)
        
        if not file_type or self.should_exclude_file(file_path):
            return issues
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
        except Exception as e:
            return [{
                'file': str(file_path),
                'line': 0,
                'type': 'error',
                'message': f'Error reading file: {str(e)}',
                'severity': 'low'
            }]
        
        # Check for suspicious patterns
        for pattern, message in SUSPICIOUS_PATTERNS.get(file_type, []):
            for match in re.finditer(pattern, content, re.MULTILINE):
                line_num = content[:match.start()].count('\n') + 1
                line_content = lines[line_num - 1] if line_num <= len(lines) else ''
                
                # Skip if in OK context
                if self.check_context(content, line_num - 1, pattern, file_type):
                    continue
                
                # Skip if it's part of a good pattern
                skip = False
                for good_pattern in GOOD_PATTERNS.get(file_type, []):
                    if re.search(good_pattern, line_content, re.IGNORECASE):
                        skip = True
                        break
                if skip:
                    continue
                
                issues.append({
                    'file': str(file_path.relative_to(self.base_dir)),
                    'line': line_num,
                    'type': 'suspicious',
                    'pattern': pattern,
                    'message': message,
                    'code': line_content.strip(),
                    'severity': 'medium'
                })
                self.stats['suspicious_patterns'] += 1
        
        # Check for missing normalization in API endpoints (Python)
        if file_type == 'py' and 'routes/api' in str(file_path):
            issues.extend(self.check_api_normalization(file_path, content, lines))
        
        return issues
    
    def check_api_normalization(self, file_path: Path, content: str, lines: List[str]) -> List[Dict]:
        """Check if API endpoints are using date normalization"""
        issues = []
        
        # Look for route definitions
        route_pattern = r'@.*\.route\([^)]+\)\s*\n\s*def\s+(\w+)\s*\([^)]*\):'
        for match in re.finditer(route_pattern, content, re.MULTILINE):
            func_name = match.group(1)
            func_start = match.end()
            
            # Find function body (next def or end of function)
            func_end_match = re.search(r'\n\s*def\s+', content[func_start:])
            if func_end_match:
                func_body = content[func_start:func_start + func_end_match.start()]
            else:
                func_body = content[func_start:func_start + 2000]  # Limit search
            
            # Check if function returns jsonify with data
            if 'jsonify' in func_body and ('data' in func_body or 'created_at' in func_body or 'updated_at' in func_body):
                # Skip if it's a utility endpoint that doesn't return date data
                if any(skip in func_body.lower() for skip in ['error', 'status', 'message', 'health', 'cache', 'log']):
                    # Only check if it actually has date fields
                    if not re.search(r'(created_at|updated_at|date|timestamp).*jsonify', func_body, re.IGNORECASE):
                        continue
                
                # Check if it uses normalize_output or BaseEntityAPI (which handles normalization)
                has_normalization = (
                    'normalize_output' in func_body or 
                    'DateNormalizationService' in func_body or
                    'BaseEntityAPI' in func_body or
                    'base_api' in func_body or
                    'BaseEntityUtils' in func_body
                )
                
                if not has_normalization:
                    # Check if it returns date fields from database models
                    if re.search(r'(\.created_at|\.updated_at|\.date|\.timestamp|to_dict\(\))', func_body):
                        line_num = content[:match.start()].count('\n') + 1
                        issues.append({
                            'file': str(file_path.relative_to(self.base_dir)),
                            'line': line_num,
                            'type': 'missing_normalization',
                            'pattern': 'API endpoint',
                            'message': f'API endpoint {func_name}() might be missing date normalization (returns date fields)',
                            'code': lines[line_num - 1].strip() if line_num <= len(lines) else '',
                            'severity': 'high'
                        })
                        self.stats['missing_normalization'] += 1
        
        return issues
    
    def scan_directory(self, directory: Path) -> None:
        """Scan a directory recursively"""
        if not directory.exists():
            return
        
        for file_path in directory.rglob('*'):
            if file_path.is_file():
                file_type = self.get_file_type(file_path)
                if file_type:
                    self.stats['files_scanned'] += 1
                    issues = self.scan_file(file_path)
                    self.issues.extend(issues)
    
    def generate_report(self) -> str:
        """Generate a formatted report"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("DATE USAGE AUDIT REPORT")
        report_lines.append("=" * 80)
        report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")
        report_lines.append("This report identifies places where dates might not be using")
        report_lines.append("the centralized date handling systems.")
        report_lines.append("")
        report_lines.append("Centralized Systems:")
        report_lines.append("  - Frontend: FieldRendererService.renderDate, dateUtils, window.formatDate")
        report_lines.append("  - Backend: DateNormalizationService, BaseEntityUtils.normalize_output")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("SUMMARY")
        report_lines.append("=" * 80)
        report_lines.append(f"Files scanned: {self.stats['files_scanned']}")
        report_lines.append(f"Suspicious patterns found: {self.stats['suspicious_patterns']}")
        report_lines.append(f"Missing normalization: {self.stats['missing_normalization']}")
        report_lines.append("")
        
        # Group issues by severity
        high_severity = [i for i in self.issues if i.get('severity') == 'high']
        medium_severity = [i for i in self.issues if i.get('severity') == 'medium']
        low_severity = [i for i in self.issues if i.get('severity') == 'low']
        
        if high_severity:
            report_lines.append("=" * 80)
            report_lines.append("HIGH SEVERITY ISSUES")
            report_lines.append("=" * 80)
            for issue in high_severity:
                report_lines.append(f"\n[{issue['file']}:{issue['line']}] {issue['message']}")
                report_lines.append(f"  Code: {issue.get('code', 'N/A')}")
        
        if medium_severity:
            report_lines.append("\n" + "=" * 80)
            report_lines.append("MEDIUM SEVERITY ISSUES")
            report_lines.append("=" * 80)
            for issue in medium_severity:
                report_lines.append(f"\n[{issue['file']}:{issue['line']}] {issue['message']}")
                report_lines.append(f"  Code: {issue.get('code', 'N/A')}")
        
        if low_severity:
            report_lines.append("\n" + "=" * 80)
            report_lines.append("LOW SEVERITY ISSUES")
            report_lines.append("=" * 80)
            for issue in low_severity:
                report_lines.append(f"\n[{issue['file']}:{issue['line']}] {issue['message']}")
        
        # Group by file
        report_lines.append("\n" + "=" * 80)
        report_lines.append("ISSUES BY FILE")
        report_lines.append("=" * 80)
        issues_by_file = defaultdict(list)
        for issue in self.issues:
            issues_by_file[issue['file']].append(issue)
        
        for file_path in sorted(issues_by_file.keys()):
            report_lines.append(f"\n{file_path}:")
            for issue in issues_by_file[file_path]:
                report_lines.append(f"  Line {issue['line']}: [{issue['severity'].upper()}] {issue['message']}")
                if issue.get('code'):
                    report_lines.append(f"    {issue['code']}")
        
        return '\n'.join(report_lines)
    
    def run(self) -> str:
        """Run the audit"""
        print("Starting date usage audit...")
        
        for dir_name in SCAN_DIRECTORIES:
            dir_path = self.base_dir / dir_name
            if dir_path.exists():
                print(f"Scanning {dir_name}...")
                self.scan_directory(dir_path)
            else:
                print(f"Directory not found: {dir_name}")
        
        print(f"\nScan complete. Found {len(self.issues)} issues.")
        return self.generate_report()


def main():
    """Main entry point"""
    import sys
    
    base_dir = Path('.')
    if len(sys.argv) > 1:
        base_dir = Path(sys.argv[1])
    
    auditor = DateUsageAuditor(base_dir)
    report = auditor.run()
    
    # Print report
    print("\n" + report)
    
    # Save report to file
    report_file = base_dir / 'documentation' / 'audits' / f'date_usage_audit_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
    report_file.parent.mkdir(parents=True, exist_ok=True)
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport saved to: {report_file}")
    
    # Also save as JSON for programmatic access
    json_file = report_file.with_suffix('.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'stats': dict(auditor.stats),
            'issues': auditor.issues
        }, f, indent=2, ensure_ascii=False)
    
    print(f"JSON report saved to: {json_file}")


if __name__ == '__main__':
    main()

