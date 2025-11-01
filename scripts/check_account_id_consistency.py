#!/usr/bin/env python3
"""
Account ID Consistency Checker - TikTrack
==========================================
This script searches the entire codebase for any remaining references to 'account_id'
that should be 'trading_account_id' and generates a comprehensive report.

Usage:
    python scripts/check_account_id_consistency.py [--detailed]

Author: TikTrack Development Team
Version: 1.0
Date: 2025-01-28
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple, Set
from collections import defaultdict
from datetime import datetime
import argparse

# Configuration
ROOT_DIR = Path(__file__).parent.parent
SEARCH_DIRS = [
    'trading-ui/scripts',
    'Backend/routes/api',
    'Backend/models',
    'Backend/services',
    'trading-ui/scripts/modal-configs',
    'trading-ui/scripts/services',
    'trading-ui/scripts/modules',
    'trading-ui/scripts/conditions',
]

EXCLUDE_PATTERNS = [
    r'\.backup',
    r'\.pyc',
    r'__pycache__',
    r'node_modules',
    r'\.git',
    r'archive',
    r'backup',
    r'\.md',
    r'\.txt',
]

LEGACY_FIELDS = [
    'account_id',
]

ALLOWED_CONTEXTS = [
    '#.*account_id',  # Comments
    'from.*account_id',  # Imports
    'import.*account_id',  # Imports
    'account_id === undefined',  # Undefined checks
    'account_id\s*\|\|',  # Fallback patterns
    'fieldName\s*===\s*[\'"]account_id[\'"]',  # String comparisons
    'if.*fieldName.*==.*account_id',  # String comparisons
    'fieldName.*account_id',  # String checks in legacy handlers
]

TARGET_FIELD = 'trading_account_id'


class AccountIdChecker:
    """Main class for checking account_id consistency"""
    
    def __init__(self, root_dir: Path, detailed: bool = False):
        self.root_dir = root_dir
        self.detailed = detailed
        self.results = defaultdict(list)
        self.file_extensions = {'.js', '.jsx', '.ts', '.tsx', '.py'}
        self.total_files_scanned = 0
        self.total_matches_found = 0
        self.problematic_matches = []
        self.allowed_matches = []
        
    def should_exclude_file(self, file_path: Path) -> bool:
        """Check if file should be excluded from search"""
        file_str = str(file_path)
        
        for pattern in EXCLUDE_PATTERNS:
            if re.search(pattern, file_str, re.IGNORECASE):
                return True
        return False
    
    def is_allowed_context(self, line: str, line_num: int) -> bool:
        """Check if account_id usage is in allowed context"""
        line_lower = line.lower()
        
        for context in ALLOWED_CONTEXTS:
            if re.search(context, line, re.IGNORECASE):
                return True
        
        return False
    
    def search_file(self, file_path: Path) -> Dict:
        """Search a single file for account_id references"""
        matches = []
        allowed = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    # Search for account_id patterns
                    if re.search(r'\baccount_id\b', line):
                        match_info = {
                            'line': line_num,
                            'content': line.rstrip(),
                            'file': str(file_path.relative_to(self.root_dir))
                        }
                        
                        if self.is_allowed_context(line, line_num):
                            allowed.append(match_info)
                        else:
                            matches.append(match_info)
        
        except Exception as e:
            print(f"⚠️  Error reading {file_path}: {e}")
            return {'matches': [], 'allowed': []}
        
        return {'matches': matches, 'allowed': allowed}
    
    def search_directory(self, directory: Path) -> None:
        """Recursively search a directory for account_id references"""
        if not directory.exists():
            if self.detailed:
                print(f"⚠️  Directory not found: {directory}")
            return
        
        for root, dirs, files in os.walk(directory):
            # Filter out excluded directories
            dirs[:] = [d for d in dirs if not any(re.search(p, d, re.IGNORECASE) for p in EXCLUDE_PATTERNS)]
            
            for file in files:
                file_path = Path(root) / file
                
                # Check if file should be excluded
                if self.should_exclude_file(file_path):
                    continue
                
                # Check if file extension is relevant
                if file_path.suffix not in self.file_extensions:
                    continue
                
                self.total_files_scanned += 1
                
                # Search file
                file_results = self.search_file(file_path)
                
                if file_results['matches']:
                    self.results[str(file_path.relative_to(self.root_dir))] = file_results['matches']
                    self.total_matches_found += len(file_results['matches'])
                    self.problematic_matches.extend(file_results['matches'])
                
                if file_results['allowed']:
                    self.allowed_matches.extend(file_results['allowed'])
    
    def run_check(self) -> None:
        """Run the consistency check"""
        print("🔍 Starting Account ID Consistency Check...\n")
        
        for search_dir in SEARCH_DIRS:
            directory = self.root_dir / search_dir
            if self.detailed:
                print(f"📂 Scanning: {search_dir}")
            self.search_directory(directory)
        
        print(f"\n✅ Scan completed!\n")
    
    def generate_report(self) -> str:
        """Generate a comprehensive report"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("ACCOUNT ID CONSISTENCY CHECK REPORT")
        report_lines.append("=" * 80)
        report_lines.append(f"Generated: {timestamp}")
        report_lines.append(f"Root Directory: {self.root_dir}")
        report_lines.append("")
        
        # Summary
        report_lines.append("📊 SUMMARY")
        report_lines.append("-" * 80)
        report_lines.append(f"Total files scanned: {self.total_files_scanned}")
        report_lines.append(f"Directories searched: {len(SEARCH_DIRS)}")
        report_lines.append(f"Problematic matches found: {self.total_matches_found}")
        report_lines.append(f"Allowed matches found: {len(self.allowed_matches)}")
        report_lines.append(f"Files with issues: {len(self.results)}")
        report_lines.append("")
        
        # Status
        if self.total_matches_found == 0:
            report_lines.append("✅ STATUS: PASS - No problematic account_id references found!")
            report_lines.append("   The codebase is consistent with trading_account_id usage.")
        else:
            report_lines.append("⚠️  STATUS: ISSUES FOUND")
            report_lines.append("   Some files may still use account_id instead of trading_account_id.")
        report_lines.append("")
        
        # Detailed results
        if self.total_matches_found > 0:
            report_lines.append("🔴 PROBLEMATIC MATCHES")
            report_lines.append("-" * 80)
            report_lines.append("")
            
            for file_path, matches in sorted(self.results.items()):
                report_lines.append(f"📄 File: {file_path}")
                report_lines.append("")
                
                for match in matches[:10]:  # Limit to first 10 matches per file
                    report_lines.append(f"   Line {match['line']:4d}: {match['content'].strip()}")
                
                if len(matches) > 10:
                    report_lines.append(f"   ... and {len(matches) - 10} more matches")
                
                report_lines.append("")
        
        # Allowed matches (if detailed)
        if self.detailed and self.allowed_matches:
            report_lines.append("")
            report_lines.append("🟢 ALLOWED MATCHES (Comments, imports, etc.)")
            report_lines.append("-" * 80)
            
            for match in self.allowed_matches[:20]:  # Limit to 20
                report_lines.append(f"   {match['file']}:{match['line']} - {match['content'].strip()}")
            
            if len(self.allowed_matches) > 20:
                report_lines.append(f"   ... and {len(self.allowed_matches) - 20} more allowed matches")
            
            report_lines.append("")
        
        # Recommendations
        if self.total_matches_found > 0:
            report_lines.append("")
            report_lines.append("💡 RECOMMENDATIONS")
            report_lines.append("-" * 80)
            report_lines.append("1. Review each problematic match above")
            report_lines.append("2. Determine if it should use trading_account_id instead")
            report_lines.append("3. Update field references consistently across the codebase")
            report_lines.append("4. Ensure backend API expects trading_account_id for all endpoints")
            report_lines.append("5. Run this script again after fixes to verify consistency")
            report_lines.append("")
        
        # Footer
        report_lines.append("=" * 80)
        report_lines.append("END OF REPORT")
        report_lines.append("=" * 80)
        
        return "\n".join(report_lines)
    
    def save_report(self, output_file: str = None) -> None:
        """Save report to file"""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"account_id_consistency_report_{timestamp}.txt"
        
        report = self.generate_report()
        
        output_path = self.root_dir / "reports" / output_file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"📄 Report saved to: {output_path}")
    
    def print_report(self) -> None:
        """Print report to console"""
        report = self.generate_report()
        print(report)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Check codebase for account_id consistency'
    )
    parser.add_argument(
        '--detailed',
        action='store_true',
        help='Show detailed information including allowed matches'
    )
    parser.add_argument(
        '--save',
        action='store_true',
        help='Save report to file'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='Output file name (when using --save)'
    )
    
    args = parser.parse_args()
    
    # Create checker
    checker = AccountIdChecker(ROOT_DIR, detailed=args.detailed)
    
    # Run check
    checker.run_check()
    
    # Generate and display report
    checker.print_report()
    
    # Save if requested
    if args.save or args.output:
        checker.save_report(args.output)
    
    # Exit with appropriate code
    sys.exit(0 if checker.total_matches_found == 0 else 1)


if __name__ == '__main__':
    main()

