#!/usr/bin/env python3
"""
JSDoc Generator for TikTrack JavaScript Files
=============================================

This script automatically generates JSDoc comments for JavaScript files
that are missing comprehensive documentation.

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class JSDocGenerator:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.backup_dir = Path("backup/jsdoc_generation")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def extract_functions_for_jsdoc(self, content):
        """Extract functions that need JSDoc"""
        functions = []

        # Pattern for function declarations: function name(...) {
        func_pattern = r'^\s*(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*{'
        matches = re.findall(func_pattern, content, re.MULTILINE)
        for match in matches:
            func_name, params = match
            functions.append({
                'name': func_name,
                'type': 'function_declaration',
                'params': [p.strip() for p in params.split(',') if p.strip()],
                'line': None
            })

        # Pattern for arrow functions assigned to variables: const/let/var name = (...) => {
        arrow_pattern = r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?=>\s*{'
        matches = re.findall(arrow_pattern, content, re.MULTILINE)
        for match in matches:
            func_name = match
            # Try to find parameters for this arrow function
            params = []
            functions.append({
                'name': func_name,
                'type': 'arrow_function',
                'params': params,
                'line': None
            })

        # Pattern for class methods
        lines = content.split('\n')
        in_class = False
        class_name = None

        for i, line in enumerate(lines):
            # Check if we're entering a class
            class_match = re.match(r'^\s*class\s+(\w+)', line)
            if class_match:
                in_class = True
                class_name = class_match.group(1)
                continue

            # Check if we're exiting a class
            if in_class and (re.match(r'^\s*class\s+', line) or re.match(r'^\s*}\s*$', line.strip())):
                in_class = False
                class_name = None
                continue

            # If we're in a class, look for methods
            if in_class:
                method_match = re.match(r'^\s*(\w+)\s*\(([^)]*)\)\s*{', line)
                if method_match and not line.strip().startswith('//'):
                    method_name, params = method_match.groups()
                    if method_name not in ['constructor', 'if', 'for', 'while', 'catch', 'try']:
                        functions.append({
                            'name': f"{class_name}.{method_name}",
                            'type': 'class_method',
                            'params': [p.strip() for p in params.split(',') if p.strip()],
                            'line': i + 1
                        })

        # Remove duplicates
        seen = set()
        unique_functions = []
        for func in functions:
            key = func['name']
            if key not in seen:
                seen.add(key)
                unique_functions.append(func)

        return unique_functions

    def generate_jsdoc_for_function(self, func_info):
        """Generate JSDoc comment for a function"""
        name = func_info['name']
        params = func_info['params']

        jsdoc_lines = ['/**']

        # Function description
        if '.' in name:
            class_name, method_name = name.split('.', 1)
            jsdoc_lines.append(f' * {method_name} - {method_name.replace("_", " ").title()}')
        else:
            jsdoc_lines.append(f' * {name} - {name.replace("_", " ").title()}')

        jsdoc_lines.append(' *')

        # Parameters
        for param in params:
            if param:
                jsdoc_lines.append(f' * @param {{*}} {param} - Parameter description')

        # Return type (generic)
        jsdoc_lines.append(' * @returns {{*}} Return description')

        jsdoc_lines.append(' */')

        return '\n'.join(jsdoc_lines)

    def has_meaningful_jsdoc(self, content):
        """Check if file has meaningful JSDoc comments"""
        jsdoc_pattern = r'/\*\*[\s\S]*?\*/'
        jsdoc_matches = re.findall(jsdoc_pattern, content)

        meaningful_count = 0
        for match in jsdoc_matches:
            lines = match.split('\n')
            # Count meaningful JSDoc (more than basic structure)
            if len(lines) > 4 or '@param' in match or '@returns' in match or '@description' in match:
                meaningful_count += 1

        return meaningful_count > 2  # At least 3 meaningful JSDoc blocks

    def add_jsdoc_to_file(self, file_path):
        """Add JSDoc comments to functions in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if self.has_meaningful_jsdoc(content):
                print(f"⏭️  Skipping {file_path.name} - already has meaningful JSDoc")
                return False

            # Extract functions
            functions = self.extract_functions_for_jsdoc(content)
            if not functions:
                print(f"⚠️  Skipping {file_path.name} - no functions found to document")
                return False

            # Backup original file
            backup_path = self.backup_dir / f"{file_path.name}.backup"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

            lines = content.split('\n')
            new_lines = []
            functions_processed = 0

            for i, line in enumerate(lines):
                # Check if this line starts a function
                function_found = None
                for func in functions:
                    if func['line'] and func['line'] - 1 == i:  # Line numbers are 1-based
                        function_found = func
                        break
                    elif not func['line']:  # Try to match by function name in line
                        if f"function {func['name']}(" in line or f"{func['name']} = " in line or f"{func['name']}(" in line:
                            function_found = func
                            break

                if function_found and functions_processed < 5:  # Limit to 5 functions per file to avoid overwhelming
                    # Check if there's already a JSDoc comment above
                    has_existing_jsdoc = False
                    for j in range(max(0, i-10), i):  # Check last 10 lines
                        if '*/' in lines[j] and j > 0 and '/**' in lines[j-1]:
                            has_existing_jsdoc = True
                            break

                    if not has_existing_jsdoc:
                        # Add JSDoc comment
                        jsdoc_comment = self.generate_jsdoc_for_function(function_found)
                        new_lines.append(jsdoc_comment)
                        functions_processed += 1

                new_lines.append(line)

            # Write updated content
            new_content = '\n'.join(new_lines)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"✅ Added JSDoc to {file_path.name} ({functions_processed} functions)")
            return True

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False

    def process_missing_files(self, missing_files_list):
        """Process all files missing JSDoc"""
        processed = 0
        successful = 0

        for file_path in missing_files_list:
            full_path = Path(file_path)
            if full_path.exists():
                processed += 1
                if self.add_jsdoc_to_file(full_path):
                    successful += 1

                # Progress indicator
                if processed % 10 == 0:
                    print(f"📊 Progress: {processed}/{len(missing_files_list)} files processed")

        print("\n📊 JSDOC GENERATION COMPLETED")
        print(f"Total files processed: {processed}")
        print(f"Successfully updated: {successful}")
        print(f"Failed/Skipped: {processed - successful}")

        return successful, processed - successful

def main():
    # Load missing files from scan results
    scan_results_path = Path("reports/code_documentation_scan.json")
    if not scan_results_path.exists():
        print("❌ Scan results not found. Please run the scanner first.")
        return

    with open(scan_results_path, 'r', encoding='utf-8') as f:
        scan_data = json.load(f)

    missing_files = scan_data.get('files_missing_jsdoc', [])
    if not missing_files:
        print("✅ No files missing JSDoc!")
        return

    print(f"📝 Processing {len(missing_files)} files missing JSDoc...")

    generator = JSDocGenerator()
    successful, failed = generator.process_missing_files(missing_files)

    print("\n✅ JSDoc generation completed!")
    print(f"Backups saved to: {generator.backup_dir}")

if __name__ == "__main__":
    main()
