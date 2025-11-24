#!/usr/bin/env python3
"""
Bundle Size Analysis Script
===========================

This script analyzes the bundle size of all JavaScript files in the trading-ui/scripts directory
to identify opportunities for code splitting and optimization.

Usage:
    python3 scripts/testing/analyze_bundle_size.py
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / 'trading-ui' / 'scripts'

# Package manifest path
PACKAGE_MANIFEST_PATH = SCRIPTS_DIR / 'init-system' / 'package-manifest.js'


def get_file_size(file_path: Path) -> int:
    """Get file size in bytes."""
    try:
        return file_path.stat().st_size
    except FileNotFoundError:
        return 0


def format_size(size_bytes: int) -> str:
    """Format size in human-readable format."""
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f}KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f}MB"


def analyze_directory(directory: Path) -> Dict[str, int]:
    """Analyze all JavaScript files in a directory."""
    sizes = {}
    
    for file_path in directory.rglob('*.js'):
        if file_path.is_file():
            relative_path = file_path.relative_to(SCRIPTS_DIR)
            size = get_file_size(file_path)
            sizes[str(relative_path)] = size
    
    return sizes


def parse_package_manifest() -> Dict:
    """Parse package manifest to get package information."""
    try:
        with open(PACKAGE_MANIFEST_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract PACKAGE_MANIFEST object (simplified parsing)
        # This is a basic parser - might need improvement for complex cases
        packages = {}
        
        # Find package definitions
        import re
        package_pattern = r"(\w+):\s*\{[^}]*id:\s*['\"](\w+)['\"][^}]*name:\s*['\"]([^'\"]+)['\"][^}]*scripts:\s*\[(.*?)\]\s*\}"
        
        matches = re.finditer(package_pattern, content, re.DOTALL)
        for match in matches:
            package_id = match.group(2)
            package_name = match.group(3)
            scripts_content = match.group(4)
            
            # Extract scripts
            scripts = []
            script_pattern = r"file:\s*['\"]([^'\"]+)['\"]"
            script_matches = re.finditer(script_pattern, scripts_content)
            for script_match in script_matches:
                scripts.append(script_match.group(1))
            
            packages[package_id] = {
                'name': package_name,
                'scripts': scripts
            }
        
        return packages
    except Exception as e:
        print(f"Warning: Could not parse package manifest: {e}")
        return {}


def calculate_package_sizes(packages: Dict, file_sizes: Dict[str, int]) -> Dict[str, Dict]:
    """Calculate total size for each package."""
    package_sizes = {}
    
    for package_id, package_info in packages.items():
        total_size = 0
        script_sizes = {}
        
        for script_file in package_info['scripts']:
            # Try to find the file
            script_path = None
            for file_path, size in file_sizes.items():
                if script_file in file_path or file_path.endswith(script_file):
                    script_path = file_path
                    script_sizes[script_file] = size
                    total_size += size
                    break
        
        package_sizes[package_id] = {
            'name': package_info['name'],
            'total_size': total_size,
            'script_count': len(package_info['scripts']),
            'script_sizes': script_sizes
        }
    
    return package_sizes


def identify_large_files(file_sizes: Dict[str, int], threshold: int = 100 * 1024) -> List[Tuple[str, int]]:
    """Identify files larger than threshold (default: 100KB)."""
    large_files = [(path, size) for path, size in file_sizes.items() if size > threshold]
    return sorted(large_files, key=lambda x: x[1], reverse=True)


def identify_unused_code(file_sizes: Dict[str, int]) -> List[str]:
    """Identify potentially unused files (files not in package manifest)."""
    packages = parse_package_manifest()
    all_scripts = set()
    
    for package_info in packages.values():
        all_scripts.update(package_info['scripts'])
    
    unused = []
    for file_path in file_sizes.keys():
        file_name = os.path.basename(file_path)
        if file_name not in all_scripts and not any(script in file_path for script in all_scripts):
            # Check if it's a test file or utility
            if 'test' not in file_path.lower() and 'util' not in file_path.lower():
                unused.append(file_path)
    
    return unused


def main():
    """Main function to analyze bundle size."""
    print("=" * 80)
    print("Bundle Size Analysis - TikTrack Trading UI")
    print("=" * 80)
    print()
    
    # Analyze all JavaScript files
    print("📊 Analyzing JavaScript files...")
    file_sizes = analyze_directory(SCRIPTS_DIR)
    total_size = sum(file_sizes.values())
    file_count = len(file_sizes)
    
    print(f"Total files: {file_count}")
    print(f"Total size: {format_size(total_size)}")
    print()
    
    # Parse package manifest
    print("📦 Analyzing packages...")
    packages = parse_package_manifest()
    package_sizes = calculate_package_sizes(packages, file_sizes)
    
    # Sort packages by size
    sorted_packages = sorted(package_sizes.items(), key=lambda x: x[1]['total_size'], reverse=True)
    
    print(f"Total packages: {len(packages)}")
    print()
    
    # Display package sizes
    print("=" * 80)
    print("Package Sizes (sorted by size)")
    print("=" * 80)
    print()
    
    for package_id, package_info in sorted_packages[:20]:  # Top 20
        print(f"📦 {package_info['name']} ({package_id}):")
        print(f"   Total: {format_size(package_info['total_size'])}")
        print(f"   Scripts: {package_info['script_count']}")
        if package_info['script_sizes']:
            largest_scripts = sorted(
                package_info['script_sizes'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            print(f"   Largest scripts:")
            for script, size in largest_scripts:
                print(f"     - {script}: {format_size(size)}")
        print()
    
    # Identify large files
    print("=" * 80)
    print("Large Files (>100KB)")
    print("=" * 80)
    print()
    
    large_files = identify_large_files(file_sizes)
    if large_files:
        for file_path, size in large_files[:10]:  # Top 10
            print(f"⚠️  {file_path}: {format_size(size)}")
        print()
    else:
        print("✅ No files larger than 100KB")
        print()
    
    # Recommendations
    print("=" * 80)
    print("Recommendations")
    print("=" * 80)
    print()
    
    # Calculate potential savings
    large_packages = [p for p in sorted_packages if p[1]['total_size'] > 200 * 1024]
    if large_packages:
        print("💡 Code Splitting Opportunities:")
        for package_id, package_info in large_packages[:5]:
            print(f"   - {package_info['name']}: {format_size(package_info['total_size'])}")
            print(f"     Consider lazy loading for non-critical scripts")
        print()
    
    # Calculate potential reduction
    if large_files:
        large_files_total = sum(size for _, size in large_files)
        potential_reduction = large_files_total * 0.2  # 20% reduction target
        print(f"💡 Potential Bundle Size Reduction:")
        print(f"   Current total: {format_size(total_size)}")
        print(f"   Target reduction: {format_size(potential_reduction)} (20%)")
        print(f"   Target size: {format_size(total_size - potential_reduction)}")
        print()
    
    # Save results to JSON
    output_file = BASE_DIR / 'documentation' / '05-REPORTS' / 'BUNDLE_SIZE_ANALYSIS.json'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    results = {
        'total_size': total_size,
        'total_files': file_count,
        'packages': {
            package_id: {
                'name': info['name'],
                'total_size': info['total_size'],
                'script_count': info['script_count']
            }
            for package_id, info in package_sizes.items()
        },
        'large_files': [
            {'path': path, 'size': size}
            for path, size in large_files
        ],
        'recommendations': {
            'code_splitting_opportunities': [
                {
                    'package_id': package_id,
                    'name': info['name'],
                    'size': info['total_size']
                }
                for package_id, info in large_packages[:5]
            ]
        }
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"📄 Results saved to: {output_file}")


if __name__ == '__main__':
    main()

