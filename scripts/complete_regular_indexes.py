#!/usr/bin/env python3
"""
Complete Regular Function Indexes - Focus on Non-Bundle Files
===========================================================

This script focuses on completing Function Indexes for regular files
(not bundle files) that have a reasonable number of missing functions.

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class RegularIndexCompleter:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.backup_dir = Path("backup/complete_regular_indexes")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # Skip bundle files and very large files
        self.skip_patterns = [
            '.bundle.js',
            '.min.js',
            'lightweight-charts',
            'charting_library'
        ]

    def extract_all_functions(self, content):
        """Extract all functions from JavaScript content"""
        functions = {}

        # Pattern 1: Traditional function declarations: function name(...) {
        func_pattern = r'^\s*(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{'
        matches = re.findall(func_pattern, content, re.MULTILINE)
        for match in matches:
            functions[match] = {
                'name': match,
                'type': 'function_declaration',
                'category': 'Functions'
            }

        # Pattern 2: Arrow functions assigned to variables: const/let/var name = (...) => {
        arrow_pattern = r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?=>\s*{'
        matches = re.findall(arrow_pattern, content, re.MULTILINE)
        for match in matches:
            functions[match] = {
                'name': match,
                'type': 'arrow_function',
                'category': 'Arrow Functions'
            }

        # Pattern 3: Class methods
        lines = content.split('\n')
        in_class = False
        class_name = None
        brace_count = 0

        for i, line in enumerate(lines):
            brace_count += line.count('{') - line.count('}')

            class_match = re.match(r'^\s*class\s+(\w+)', line)
            if class_match and brace_count >= 0:
                in_class = True
                class_name = class_match.group(1)
                continue

            if in_class and brace_count <= 1 and re.match(r'^\s*}\s*$', line.strip()):
                in_class = False
                class_name = None
                continue

            if in_class and class_name:
                method_match = re.match(r'^\s*(\w+)\s*\(([^)]*)\)\s*{', line)
                if method_match:
                    method_name = method_match.group(1)
                    if method_name not in ['constructor', 'if', 'for', 'while', 'catch', 'try']:
                        full_name = f"{class_name}.{method_name}"
                        functions[full_name] = {
                            'name': full_name,
                            'type': 'class_method',
                            'category': 'Class Methods'
                        }

        # Pattern 4: Object methods: obj.method = function
        obj_method_pattern = r'(\w+)\.(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(obj_method_pattern, content)
        for obj_name, method_name in matches:
            full_name = f"{obj_name}.{method_name}"
            functions[full_name] = {
                'name': full_name,
                'type': 'object_method',
                'category': 'Object Methods'
            }

        # Pattern 5: Functions assigned to window/global
        window_assign_pattern = r'window\.(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(window_assign_pattern, content)
        for match in matches:
            functions[match] = {
                'name': match,
                'type': 'global_function',
                'category': 'Global Functions'
            }

        return functions

    def extract_indexed_functions(self, content):
        """Extract functions listed in Function Index"""
        indexed_functions = set()

        index_pattern = r'===== FUNCTION INDEX =====(.*?)(?=\*/|\n\s*\n\s*(?:\*/|class|\(function|function|\{|$))'
        index_match = re.search(index_pattern, content, re.DOTALL | re.IGNORECASE)

        if index_match:
            index_content = index_match.group(1)
            func_lines = re.findall(r'-\s*([^()]+)\(\s*[^)]*\)\s*-', index_content)
            for func in func_lines:
                clean_func = func.strip()
                if '.' in clean_func:
                    clean_func = clean_func.split('.')[-1]
                indexed_functions.add(clean_func)

        return indexed_functions

    def generate_missing_functions_index(self, missing_functions, category_map):
        """Generate index content for missing functions"""
        categories = {}

        for func_name in missing_functions:
            # Find the function info
            func_info = None
            for all_funcs in category_map.values():
                for f in all_funcs:
                    if f['name'] == func_name or f['name'].split('.')[-1] == func_name:
                        func_info = f
                        break
                if func_info:
                    break

            if func_info:
                category = func_info['category']
                if category not in categories:
                    categories[category] = []
                categories[category].append(func_info)

        # Generate index content for missing functions
        index_lines = []

        for category, funcs in sorted(categories.items()):
            if funcs:
                index_lines.append(f"=== {category} ===")
                for func in sorted(funcs, key=lambda x: x['name']):
                    name = func['name']
                    display_name = name.replace('window.', '').replace('global.', '')
                    desc = display_name.replace('_', ' ').replace('-', ' ').title()
                    if '.' in display_name:
                        parts = display_name.split('.')
                        desc = f"{parts[-1].replace('_', ' ').title()}"
                    index_lines.append(f"- {display_name}() - {desc}")
                index_lines.append("")

        return '\n'.join(index_lines).rstrip()

    def add_missing_functions_to_index(self, file_path):
        """Add missing functions to existing Function Index"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if 'FUNCTION INDEX' not in content:
                return False

            # Extract all functions and indexed functions
            all_functions = self.extract_all_functions(content)
            indexed_functions = self.extract_indexed_functions(content)

            # Find missing functions
            all_clean_names = {name.split('.')[-1] if '.' in name else name for name in all_functions.keys()}
            missing_clean_names = all_clean_names - indexed_functions

            if not missing_clean_names:
                return False  # Already complete

            # Get full function names for missing functions
            missing_full_names = set()
            for func_name, func_info in all_functions.items():
                clean_name = func_name.split('.')[-1] if '.' in func_name else func_name
                if clean_name in missing_clean_names:
                    missing_full_names.add(func_name)

            # Categorize functions for index generation
            category_map = {}
            for func_name, func_info in all_functions.items():
                category = func_info['category']
                if category not in category_map:
                    category_map[category] = []
                category_map[category].append(func_info)

            # Generate index for missing functions
            missing_index = self.generate_missing_functions_index(missing_full_names, category_map)

            if not missing_index:
                return False

            # Find the end of existing Function Index
            lines = content.split('\n')
            index_end = -1

            for i, line in enumerate(lines):
                if '===== FUNCTION INDEX =====' in line:
                    # Find the end of the index
                    j = i + 1
                    while j < len(lines):
                        if (j + 1 < len(lines) and
                            lines[j].strip() == '' and
                            not lines[j + 1].strip().startswith('-') and
                            not lines[j + 1].strip().startswith('===') and
                            '*/' not in lines[j + 1]):
                            index_end = j
                            break
                        j += 1
                    break

            if index_end == -1:
                return False

            # Backup
            backup_path = self.backup_dir / f"{file_path.name}.backup"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

            # Insert missing functions before the end of index
            new_content = (
                '\n'.join(lines[:index_end]) +
                '\n' + missing_index + '\n' +
                '\n'.join(lines[index_end:])
            )

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"✅ Added {len(missing_clean_names)} missing functions to {file_path.name}")
            return True

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False

    def should_process_file(self, file_path):
        """Check if file should be processed (not bundle, not too large)"""
        filename = file_path.name

        # Skip bundle files
        if any(pattern in filename for pattern in self.skip_patterns):
            return False

        # Skip very large files (probably bundles)
        try:
            size_kb = file_path.stat().st_size / 1024
            if size_kb > 200:  # Skip files larger than 200KB
                return False
        except:
            pass

        return True

    def process_regular_incomplete_files(self, incompleteness_data, max_missing=50):
        """Process regular files with incomplete indexes"""
        processed = 0
        successful = 0

        # Get incomplete files, filter out bundles and large files
        incomplete = [r for r in incompleteness_data['detailed_report']
                     if not r['is_complete'] and len(r['missing_in_index']) <= max_missing]

        # Filter further
        filtered_incomplete = []
        for result in incomplete:
            file_path = Path(result['file'])
            if self.should_process_file(file_path):
                filtered_incomplete.append(result)

        print(f"🎯 Processing {len(filtered_incomplete)} regular files with up to {max_missing} missing functions...")

        for result in filtered_incomplete:
            file_path = Path(result['file'])
            if file_path.exists():
                processed += 1
                if self.add_missing_functions_to_index(file_path):
                    successful += 1

                # Progress indicator
                if processed % 25 == 0:
                    print(f"📊 Progress: {processed}/{len(filtered_incomplete)} files processed")

        return successful, processed

def main():
    # Load incompleteness data
    incompleteness_path = Path("reports/function_index_completeness.json")
    if not incompleteness_path.exists():
        print("❌ Incompleteness data not found. Please run the verifier first.")
        return

    with open(incompleteness_path, 'r', encoding='utf-8') as f:
        incompleteness_data = json.load(f)

    incomplete_count = incompleteness_data['incomplete_indexes']
    if incomplete_count == 0:
        print("✅ All Function Indexes are already complete!")
        return

    print(f"🔧 Completing regular Function Indexes (up to 50 missing functions per file)...")

    completer = RegularIndexCompleter()
    successful, processed = completer.process_regular_incomplete_files(incompleteness_data, max_missing=50)

    print("\n📊 COMPLETION RESULTS")
    print(f"Files processed: {processed}")
    print(f"Successfully completed: {successful}")
    print(f"Success rate: {successful/processed*100:.1f}%" if processed > 0 else "0%")

    # Run verification again
    print("\n🔄 Running final verification...")
    os.system("python3 scripts/verify_function_index_completeness.py | grep -E '(Complete indexes|Incomplete indexes)'")

    print("\n✅ Regular Function Index completion completed!")
    print(f"Backups saved to: {completer.backup_dir}")

if __name__ == "__main__":
    main()
