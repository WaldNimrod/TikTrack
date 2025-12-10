#!/usr/bin/env python3
"""
Complete Function Indexes - Add Missing Functions
==================================================

This script analyzes files with incomplete Function Index and adds
the missing functions to make the indexes 100% complete.

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class FunctionIndexCompleter:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.backup_dir = Path("backup/complete_indexes")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

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

    def categorize_functions_smart(self, functions):
        """Smart categorization based on function names and types"""
        categories = {}

        for func_info in functions.values():
            name = func_info['name'].lower()
            category = func_info['category']

            if category not in categories:
                categories[category] = []

            # Add some smart categorization based on name patterns
            if any(keyword in name for keyword in ['init', 'initialize', 'setup', 'start', 'create', 'build']):
                if 'Initialization' not in categories:
                    categories['Initialization'] = []
                categories['Initialization'].append(func_info)
            elif any(keyword in name for keyword in ['handle', 'on', 'event', 'click', 'change', 'submit']):
                if 'Event Handlers' not in categories:
                    categories['Event Handlers'] = []
                categories['Event Handlers'].append(func_info)
            elif any(keyword in name for keyword in ['render', 'display', 'show', 'hide', 'update', 'refresh']):
                if 'UI Functions' not in categories:
                    categories['UI Functions'] = []
                categories['UI Functions'].append(func_info)
            elif any(keyword in name for keyword in ['fetch', 'get', 'load', 'save', 'data', 'api', 'request']):
                if 'Data Functions' not in categories:
                    categories['Data Functions'] = []
                categories['Data Functions'].append(func_info)
            elif any(keyword in name for keyword in ['util', 'helper', 'format', 'validate', 'check', 'parse']):
                if 'Utility Functions' not in categories:
                    categories['Utility Functions'] = []
                categories['Utility Functions'].append(func_info)
            else:
                categories[category].append(func_info)

        return {k: v for k, v in categories.items() if v}

    def generate_complete_function_index(self, all_functions, indexed_functions):
        """Generate complete Function Index including missing functions"""
        # Start with existing categories if any
        categories = self.categorize_functions_smart(all_functions)

        # Add missing functions to appropriate categories
        missing_functions = {}
        for func_name, func_info in all_functions.items():
            clean_name = func_name.split('.')[-1] if '.' in func_name else func_name
            if clean_name not in indexed_functions:
                category = func_info['category']
                if category not in missing_functions:
                    missing_functions[category] = []
                missing_functions[category].append(func_info)

        # Merge missing functions into categories
        for category, funcs in missing_functions.items():
            if category not in categories:
                categories[category] = []
            categories[category].extend(funcs)

        # Generate index content
        index_lines = ["===== FUNCTION INDEX =====", ""]

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

        return "\n".join(index_lines).rstrip()

    def complete_file_index(self, file_path):
        """Complete Function Index for a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if 'FUNCTION INDEX' not in content:
                return False

            # Extract all functions and indexed functions
            all_functions = self.extract_all_functions(content)
            indexed_functions = self.extract_indexed_functions(content)

            # Check if already complete
            all_clean_names = {name.split('.')[-1] if '.' in name else name for name in all_functions.keys()}
            if all_clean_names.issubset(indexed_functions):
                return False  # Already complete

            # Generate complete index
            complete_index = self.generate_complete_function_index(all_functions, indexed_functions)

            if not complete_index:
                return False

            # Find and replace the existing index
            index_pattern = r'(===== FUNCTION INDEX =====.*?)(?=\*/|\n\s*\n\s*(?:\*/|class|\(function|function|\{|$))'
            new_content = re.sub(index_pattern, complete_index, content, flags=re.DOTALL | re.IGNORECASE)

            if new_content == content:
                # Fallback: find and replace more broadly
                lines = content.split('\n')
                start_idx = -1
                end_idx = -1

                for i, line in enumerate(lines):
                    if '===== FUNCTION INDEX =====' in line:
                        start_idx = i
                    elif start_idx != -1 and line.strip() == '' and i > start_idx + 5:
                        end_idx = i
                        break

                if start_idx != -1 and end_idx != -1:
                    # Backup
                    backup_path = self.backup_dir / f"{file_path.name}.backup"
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(content)

                    # Replace
                    new_lines = lines[:start_idx] + [complete_index] + lines[end_idx:]
                    new_content = '\n'.join(new_lines)

                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

                    added_count = len(all_clean_names - indexed_functions)
                    print(f"✅ Completed index for {file_path.name} (+{added_count} functions)")
                    return True

            return False

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False

    def process_incomplete_files(self, incompleteness_data):
        """Process files with incomplete indexes"""
        processed = 0
        successful = 0

        # Sort by most incomplete first
        sorted_files = sorted(
            [r for r in incompleteness_data['detailed_report'] if not r['is_complete']],
            key=lambda x: len(x['missing_in_index']),
            reverse=True
        )

        for result in sorted_files:
            file_path = Path(result['file'])
            if file_path.exists():
                processed += 1
                if self.complete_file_index(file_path):
                    successful += 1

                # Progress indicator
                if processed % 20 == 0:
                    print(f"📊 Progress: {processed}/{len(sorted_files)} files processed")

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

    print(f"🔧 Completing {incomplete_count} incomplete Function Indexes...")

    completer = FunctionIndexCompleter()
    successful, processed = completer.process_incomplete_files(incompleteness_data)

    print("\n📊 COMPLETION RESULTS")
    print(f"Files processed: {processed}")
    print(f"Successfully completed: {successful}")
    print(f"Success rate: {successful/processed*100:.1f}%" if processed > 0 else "0%")

    # Run verification again
    print("\n🔄 Running final verification...")
    os.system("python3 scripts/verify_function_index_completeness.py | grep -E '(Complete indexes|Incomplete indexes)'")

    print("\n✅ Function Index completion completed!")
    print(f"Backups saved to: {completer.backup_dir}")

if __name__ == "__main__":
    main()
