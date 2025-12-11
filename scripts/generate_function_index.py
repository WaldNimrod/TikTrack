#!/usr/bin/env python3
"""
Function Index Generator for TikTrack JavaScript Files
======================================================

This script automatically generates Function Index for JavaScript files
that are missing it. The Function Index follows the standard format used
in the TikTrack project.

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class FunctionIndexGenerator:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.backup_dir = Path("backup/function_index_generation")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def extract_functions(self, content):
        """Extract all functions from JavaScript content"""
        functions = []

        # Pattern for function declarations: function name(...) {
        func_pattern = r'^\s*(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{'
        matches = re.findall(func_pattern, content, re.MULTILINE)
        for match in matches:
            functions.append({
                'name': match,
                'type': 'function_declaration',
                'line': None
            })

        # Pattern for arrow functions assigned to variables: const/let/var name = (...) => {
        arrow_pattern = r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?=>\s*{'
        matches = re.findall(arrow_pattern, content, re.MULTILINE)
        for match in matches:
            functions.append({
                'name': match,
                'type': 'arrow_function',
                'line': None
            })

        # Pattern for class methods: methodName(...) {
        # This is more complex as it needs to be within class context
        class_method_pattern = r'^\s*(\w+)\s*\([^)]*\)\s*{'
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

            # Check if we're exiting a class (next class or end of class)
            if in_class and (re.match(r'^\s*class\s+', line) or re.match(r'^\s*}\s*$', line.strip())):
                in_class = False
                class_name = None
                continue

            # If we're in a class, look for methods
            if in_class:
                method_match = re.match(class_method_pattern, line)
                if method_match and not line.strip().startswith('//') and not line.strip().startswith('*'):
                    method_name = method_match.group(1)
                    # Skip constructor and common non-method patterns
                    if method_name not in ['constructor', 'if', 'for', 'while', 'catch', 'try']:
                        functions.append({
                            'name': f"{class_name}.{method_name}",
                            'type': 'class_method',
                            'line': i + 1
                        })

        # Remove duplicates while preserving order
        seen = set()
        unique_functions = []
        for func in functions:
            key = func['name']
            if key not in seen:
                seen.add(key)
                unique_functions.append(func)

        return unique_functions

    def categorize_functions(self, functions):
        """Categorize functions into logical groups"""
        categories = {
            'Initialization': [],
            'Core Functions': [],
            'Event Handlers': [],
            'UI Functions': [],
            'Data Functions': [],
            'Utility Functions': [],
            'API Functions': [],
            'Helper Functions': [],
            'Other': []
        }

        for func in functions:
            name = func['name'].lower()

            if any(keyword in name for keyword in ['init', 'initialize', 'setup', 'start', 'create', 'build']):
                categories['Initialization'].append(func)
            elif any(keyword in name for keyword in ['handle', 'on', 'event', 'click', 'change', 'submit']):
                categories['Event Handlers'].append(func)
            elif any(keyword in name for keyword in ['render', 'display', 'show', 'hide', 'update', 'refresh']):
                categories['UI Functions'].append(func)
            elif any(keyword in name for keyword in ['fetch', 'get', 'load', 'save', 'data', 'api', 'request']):
                categories['Data Functions'].append(func)
            elif any(keyword in name for keyword in ['util', 'helper', 'format', 'validate', 'check', 'parse']):
                categories['Utility Functions'].append(func)
            elif any(keyword in name for keyword in ['api', 'service', 'endpoint', 'call']):
                categories['API Functions'].append(func)
            elif any(keyword in name for keyword in ['core', 'main', 'process', 'execute', 'run']):
                categories['Core Functions'].append(func)
            else:
                categories['Other'].append(func)

        # Remove empty categories
        return {k: v for k, v in categories.items() if v}

    def generate_function_index(self, functions):
        """Generate Function Index string"""
        if not functions:
            return ""

        categorized = self.categorize_functions(functions)

        index_lines = ["===== FUNCTION INDEX =====", ""]

        for category, funcs in categorized.items():
            if funcs:
                index_lines.append(f"=== {category} ===")
                for func in funcs:
                    name = func['name']
                    if '.' in name:  # Class method
                        class_name, method_name = name.split('.', 1)
                        index_lines.append(f"- {class_name}.{method_name}() - {method_name.replace('_', ' ').title()}")
                    else:
                        index_lines.append(f"- {name}() - {name.replace('_', ' ').replace('-', ' ').title()}")
                index_lines.append("")

        return "\n".join(index_lines).rstrip()

    def has_function_index(self, content):
        """Check if file already has Function Index"""
        return 'FUNCTION INDEX' in content or 'Function Index' in content

    def add_function_index_to_file(self, file_path):
        """Add Function Index to a JavaScript file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if self.has_function_index(content):
                print(f"⏭️  Skipping {file_path.name} - already has Function Index")
                return False

            # Extract functions
            functions = self.extract_functions(content)
            if not functions:
                print(f"⚠️  Skipping {file_path.name} - no functions found")
                return False

            # Generate Function Index
            function_index = self.generate_function_index(functions)
            if not function_index:
                print(f"⚠️  Skipping {file_path.name} - could not generate Function Index")
                return False

            # Find where to insert the Function Index
            lines = content.split('\n')

            # Look for the end of the header comment block
            insert_index = 0
            in_header_comment = False

            for i, line in enumerate(lines):
                if line.strip().startswith('/**') or line.strip().startswith('/*'):
                    in_header_comment = True
                elif in_header_comment and (line.strip().startswith('*/') or line.strip().endswith('*/')):
                    # Found end of header comment
                    insert_index = i + 2  # Insert after the comment block
                    break
                elif in_header_comment and line.strip() == '':
                    # Empty line in header comment
                    continue
                elif not in_header_comment and line.strip() != '':
                    # Found first non-comment, non-empty line
                    insert_index = i
                    break

            # Backup original file
            backup_path = self.backup_dir / f"{file_path.name}.backup"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

            # Insert Function Index
            new_content = (
                '\n'.join(lines[:insert_index]) +
                '\n\n' + function_index + '\n\n' +
                '\n'.join(lines[insert_index:])
            )

            # Write updated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"✅ Added Function Index to {file_path.name} ({len(functions)} functions)")
            return True

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False

    def process_missing_files(self, missing_files_list):
        """Process all files missing Function Index"""
        processed = 0
        successful = 0

        for file_path in missing_files_list:
            full_path = Path(file_path)
            if full_path.exists():
                processed += 1
                if self.add_function_index_to_file(full_path):
                    successful += 1

                # Progress indicator
                if processed % 50 == 0:
                    print(f"📊 Progress: {processed}/{len(missing_files_list)} files processed")

        print("\n📊 FUNCTION INDEX GENERATION COMPLETED")
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

    missing_files = scan_data.get('files_missing_index', [])
    if not missing_files:
        print("✅ No files missing Function Index!")
        return

    print(f"🔧 Processing {len(missing_files)} files missing Function Index...")

    generator = FunctionIndexGenerator()
    successful, failed = generator.process_missing_files(missing_files)

    print("\n✅ Function Index generation completed!")
    print(f"Backups saved to: {generator.backup_dir}")

if __name__ == "__main__":
    main()
