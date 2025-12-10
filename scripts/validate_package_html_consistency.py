#!/usr/bin/env python3
"""
Package-HTML Consistency Validator
===================================

Automatically validates that all packages defined in page-initialization-configs.js
have their corresponding script tags in the HTML files.

This prevents the "Missing required globals" error by catching inconsistencies early.

Usage:
    python3 scripts/validate_package_html_consistency.py
    python3 scripts/validate_package_html_consistency.py --page portfolio-state
    python3 scripts/validate_package_html_consistency.py --fix-missing
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
TRADING_UI_DIR = PROJECT_ROOT / "trading-ui"
SCRIPTS_DIR = TRADING_UI_DIR / "scripts"

# Correct paths
PAGE_CONFIGS_FILE = SCRIPTS_DIR / "page-initialization-configs.js"
PACKAGE_MANIFEST_FILE = SCRIPTS_DIR / "init-system" / "package-manifest.js"

def load_page_configs() -> Dict:
    """Load page initialization configs"""
    config_file = PAGE_CONFIGS_FILE

    with open(config_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the PAGE_CONFIGS object using regex
    match = re.search(r'window\.PAGE_CONFIGS\s*=\s*({.*?});', content, re.DOTALL)
    if not match:
        raise ValueError("Could not parse PAGE_CONFIGS from file")

    # Convert to valid JSON (replace single quotes, etc.)
    config_str = match.group(1)
    config_str = config_str.replace("'", '"')
    config_str = re.sub(r'(\w+):', r'"\1":', config_str)  # Add quotes to keys
    config_str = re.sub(r',\s*}', '}', config_str)  # Remove trailing commas

    try:
        return json.loads(config_str)
    except json.JSONDecodeError as e:
        print(f"Failed to parse PAGE_CONFIGS: {e}")
        return {}

def load_package_manifest() -> Dict:
    """Load package manifest"""
    manifest_file = PACKAGE_MANIFEST_FILE

    with open(manifest_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the PACKAGE_MANIFEST object
    match = re.search(r'window\.PACKAGE_MANIFEST\s*=\s*({.*?});', content, re.DOTALL)
    if not match:
        raise ValueError("Could not parse PACKAGE_MANIFEST from file")

    manifest_str = match.group(1)
    manifest_str = manifest_str.replace("'", '"')
    manifest_str = re.sub(r'(\w+):', r'"\1":', manifest_str)
    manifest_str = re.sub(r',\s*}', '}', manifest_str)

    try:
        return json.loads(manifest_str)
    except json.JSONDecodeError as e:
        print(f"Failed to parse PACKAGE_MANIFEST: {e}")
        return {}

def get_scripts_from_html(html_file: Path) -> Set[str]:
    """Extract script src paths from HTML file"""
    scripts = set()

    if not html_file.exists():
        return scripts

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all script tags with src
    script_pattern = r'<script[^>]*src=["\']([^"\']*\.js[^"\']*)["\'][^>]*>'
    matches = re.findall(script_pattern, content, re.IGNORECASE)

    for match in matches:
        # Extract just the filename without path and version
        filename = Path(match).name.split('?')[0]  # Remove version parameters
        scripts.add(filename)

    return scripts

def validate_page_packages(page_name: str, page_config: Dict, package_manifest: Dict) -> List[str]:
    """Validate packages for a specific page"""
    issues = []

    if 'packages' not in page_config:
        issues.append(f"❌ No packages defined for page {page_name}")
        return issues

    packages = page_config['packages']
    html_file = TRADING_UI_DIR / f"{page_name}.html"

    # Check if HTML file exists
    if not html_file.exists():
        issues.append(f"❌ HTML file not found: {html_file}")
        return issues

    # Get scripts from HTML
    html_scripts = get_scripts_from_html(html_file)

    for package_name in packages:
        # Check if package exists in manifest
        if package_name not in package_manifest:
            issues.append(f"❌ Package '{package_name}' not found in manifest (page: {page_name})")
            continue

        package = package_manifest[package_name]

        # Check if package has scripts
        if 'scripts' not in package:
            continue

        # Check each script in the package
        for script in package['scripts']:
            script_file = script.get('file', '')
            if not script_file:
                continue

            # Check if script is loaded in HTML
            if script_file not in html_scripts:
                issues.append(f"❌ Script '{script_file}' for package '{package_name}' not found in {page_name}.html")
                issues.append(f"   💡 Add: <script src=\"../../scripts/{script_file}?v=1.0.0\" defer></script>")

    return issues

def generate_fixes(issues: List[str]) -> str:
    """Generate a summary of fixes needed"""
    if not issues:
        return "✅ No issues found - all packages are properly loaded!"

    fixes = []
    html_fixes = {}

    for issue in issues:
        if "Add:" in issue:
            # Extract package name and script info
            match = re.search(r"Script '([^']+)' for package '([^']+)' not found in ([^']+)\.html", issue)
            if match:
                script_file, package_name, page_name = match.groups()
                if page_name not in html_fixes:
                    html_fixes[page_name] = []
                html_fixes[page_name].append(f"    <script src=\"../../scripts/{script_file}?v=1.0.0\" defer></script> <!-- {package_name} -->")

    if html_fixes:
        fixes.append("\n🔧 REQUIRED FIXES:")
        for page_name, scripts in html_fixes.items():
            fixes.append(f"\n📄 Add to {page_name}.html:")
            fixes.append("<!-- Insert in the appropriate load order position -->")
            for script in scripts:
                fixes.append(script)

    return "\n".join(fixes)

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Validate package-HTML consistency')
    parser.add_argument('--page', help='Validate specific page only')
    parser.add_argument('--fix-missing', action='store_true', help='Attempt to fix missing script tags')

    args = parser.parse_args()

    print("🔍 Package-HTML Consistency Validator")
    print("=" * 50)

    try:
        # Load configurations
        page_configs = load_page_configs()
        package_manifest = load_package_manifest()

        if not page_configs or not package_manifest:
            print("❌ Failed to load configurations")
            return 1

        print(f"📋 Loaded {len(page_configs)} page configs and {len(package_manifest)} packages")

        all_issues = []

        # Validate pages
        if args.page:
            if args.page not in page_configs:
                print(f"❌ Page '{args.page}' not found in configs")
                return 1

            issues = validate_page_packages(args.page, page_configs[args.page], package_manifest)
            if issues:
                all_issues.extend(issues)
                print(f"\n🚨 ISSUES for {args.page}:")
                for issue in issues:
                    print(f"   {issue}")
        else:
            for page_name, page_config in page_configs.items():
                issues = validate_page_packages(page_name, page_config, package_manifest)
                if issues:
                    all_issues.extend(issues)
                    print(f"\n🚨 ISSUES for {page_name}:")
                    for issue in issues:
                        print(f"   {issue}")

        # Generate fixes
        if all_issues:
            print(f"\n📊 SUMMARY: {len(all_issues)} issues found")
            print(generate_fixes(all_issues))

            if args.fix_missing:
                print("\n🔧 Auto-fix not implemented yet - please apply fixes manually")

            return 1
        else:
            print("\n✅ All pages have consistent package loading!")
            return 0

    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return 1

if __name__ == '__main__':
    exit(main())
