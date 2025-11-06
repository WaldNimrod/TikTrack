#!/usr/bin/env python3
"""
Naming Consistency Checker - TikTrack
====================================

Script to check for naming consistency across the codebase.
Specifically checks for 'account', 'filter', 'trading_account' etc.

Author: TikTrack Development Team
Date: January 2025
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime

# ===== CONFIGURATION =====

# Directories to search
SEARCH_DIRS = [
    'trading-ui/scripts',
    'Backend',
    'trading-ui/scripts/modal-configs',
    'documentation'
]

# Files to exclude
EXCLUDE_PATTERNS = [
    r'__pycache__',
    r'\.pyc$',
    r'node_modules',
    r'\.git',
    r'debug-.*\.html',
    r'\.min\.js',
    r'backup',
    r'archive'
]

# Strings to search for
SEARCH_PATTERNS = {
    'OLD_FILTER_NAMES': [
        r'defaultAccountFilter',  # Old filter name (should exist only in migrations)
        r'defaultTradingAccount',  # Old name (should NOT exist)
        r'filter.*account.*default|default.*account.*filter',  # Mixed old patterns
    ],
    'CORRECT_FILTER_NAMES': [
        r'default_trading_account',  # Correct name for default account preference
        r'defaultAccountFilter',  # Correct name for filter preference
    ],
    'LABEL_INCONSISTENCIES': [
        r'label.*חשבון מסחר.*מסחר.*מסחר',  # Double "מסחר"
        r'label.*filter.*account',  # Using "filter account" in labels
    ]
}

# File types to check
INCLUDE_EXTENSIONS = ['.js', '.py', '.json', '.md', '.html']

# ===== SEARCH FUNCTIONS =====

def should_exclude_file(filepath: str) -> bool:
    """Check if file should be excluded from search"""
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, filepath, re.IGNORECASE):
            return True
    return False


def get_file_extension(filepath: str) -> str:
    """Get file extension"""
    return Path(filepath).suffix.lower()


def search_pattern_in_file(filepath: str, pattern: str, pattern_name: str) -> List[Dict]:
    """Search for a pattern in a file and return matches"""
    results = []
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Find all matches
        matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
        
        for match in matches:
            # Get line number
            line_num = content[:match.start()].count('\n') + 1
            
            # Get context (previous and next lines)
            lines = content.split('\n')
            context_start = max(0, line_num - 2)
            context_end = min(len(lines), line_num + 1)
            context = '\n'.join(lines[context_start:context_end])
            
            results.append({
                'file': filepath,
                'pattern_name': pattern_name,
                'pattern': pattern,
                'line': line_num,
                'match': match.group(0),
                'context': context
            })
    
    except Exception as e:
        print(f"⚠️  Error reading {filepath}: {e}")
    
    return results


def scan_directory(directory: str) -> Dict[str, List[Dict]]:
    """Scan a directory for all relevant files"""
    all_results = {}
    
    for pattern_category, patterns in SEARCH_PATTERNS.items():
        all_results[pattern_category] = []
    
    for root, dirs, files in os.walk(directory):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if not should_exclude_file(d)]
        
        for file in files:
            filepath = os.path.join(root, file)
            
            # Check if file should be excluded
            if should_exclude_file(filepath):
                continue
            
            # Check if file extension matches
            if get_file_extension(filepath) not in INCLUDE_EXTENSIONS:
                continue
            
            # Search for each pattern category
            for pattern_category, patterns in SEARCH_PATTERNS.items():
                for pattern in patterns:
                    matches = search_pattern_in_file(filepath, pattern, f"{pattern_category}:{pattern}")
                    all_results[pattern_category].extend(matches)
    
    return all_results


# ===== REPORTING =====

def generate_report(results: Dict[str, List[Dict]]) -> str:
    """Generate a formatted report"""
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("NAMING CONSISTENCY REPORT - TikTrack")
    report_lines.append("=" * 80)
    report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append("")
    
    # Summary
    total_findings = sum(len(matches) for matches in results.values())
    report_lines.append(f"TOTAL FINDINGS: {total_findings}")
    report_lines.append("")
    
    # Detailed findings by category
    for category, matches in results.items():
        if not matches:
            continue
        
        report_lines.append("-" * 80)
        report_lines.append(f"CATEGORY: {category}")
        report_lines.append(f"Count: {len(matches)}")
        report_lines.append("-" * 80)
        
        # Group by file
        files_dict = {}
        for match in matches:
            filepath = match['file']
            if filepath not in files_dict:
                files_dict[filepath] = []
            files_dict[filepath].append(match)
        
        # Display by file
        for filepath, file_matches in sorted(files_dict.items()):
            report_lines.append("")
            report_lines.append(f"📄 {filepath}")
            report_lines.append(f"   {len(file_matches)} matches")
            
            for match in file_matches[:5]:  # Show first 5 matches per file
                report_lines.append(f"   Line {match['line']}: {match['pattern_name']}")
                # Show context
                context_lines = match['context'].split('\n')
                for ctx_line in context_lines:
                    if match['match'].lower() in ctx_line.lower():
                        # Highlight the matching line
                        highlighted = ctx_line.replace(match['match'], f"**{match['match']}**")
                        report_lines.append(f"   > {highlighted}")
                    else:
                        report_lines.append(f"     {ctx_line}")
            
            if len(file_matches) > 5:
                report_lines.append(f"   ... and {len(file_matches) - 5} more matches")
        
        report_lines.append("")
    
    report_lines.append("=" * 80)
    
    return '\n'.join(report_lines)


def save_report(report: str, output_file: str = 'naming_consistency_report.txt'):
    """Save report to file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"✅ Report saved to: {output_file}")


# ===== MAIN =====

def main():
    """Main function"""
    print("🔍 Starting Naming Consistency Check...")
    print("")
    
    # Get base directory (project root)
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent if script_dir.name == 'scripts' else script_dir
    
    # Scan all directories
    all_results = {}
    for category in SEARCH_PATTERNS.keys():
        all_results[category] = []
    
    for search_dir in SEARCH_DIRS:
        full_path = base_dir / search_dir
        if not full_path.exists():
            print(f"⚠️  Directory not found: {full_path}")
            continue
        
        print(f"🔍 Scanning: {search_dir}/")
        dir_results = scan_directory(str(full_path))
        
        # Merge results
        for category, matches in dir_results.items():
            all_results[category].extend(matches)
    
    print("")
    print("📊 Generating report...")
    
    # Generate report
    report = generate_report(all_results)
    
    # Print report
    print("\n")
    print(report)
    print("\n")
    
    # Save to file
    output_file = base_dir / 'naming_consistency_report.txt'
    save_report(report, str(output_file))
    
    # Summary
    total_old_names = len(all_results.get('OLD_FILTER_NAMES', []))
    total_inconsistencies = len(all_results.get('LABEL_INCONSISTENCIES', []))
    
    print("")
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Old filter name occurrences: {total_old_names}")
    print(f"Label inconsistencies: {total_inconsistencies}")
    print("")
    
    if total_old_names == 0 and total_inconsistencies == 0:
        print("✅ Codebase is clean! No naming issues found.")
    else:
        print("⚠️  Found naming inconsistencies. Review the report above.")
    print("")
    
    return all_results


if __name__ == '__main__':
    results = main()

