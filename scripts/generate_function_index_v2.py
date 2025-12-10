#!/usr/bin/env python3
"""
Function Index Generator V2 for TikTrack JavaScript Files
==========================================================

Enhanced version with better pattern recognition for different file types:
- IIFE (Immediately Invoked Function Expression) files
- Class-based files
- Arrow function files
- Mixed pattern files

Author: TikTrack Development Team
Version: 2.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class EnhancedFunctionIndexGenerator:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.backup_dir = Path("backup/function_index_v2")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def extract_functions_comprehensive(self, content):
        """Enhanced function extraction with multiple patterns"""
        functions = []

        # Pattern 1: Traditional function declarations
        func_pattern = r'^\s*(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{'
        matches = re.findall(func_pattern, content, re.MULTILINE)
        for match in matches:
            functions.append({
                'name': match,
                'type': 'function_declaration',
                'category': 'Traditional Functions'
            })

        # Pattern 2: Arrow functions assigned to variables/const
        arrow_pattern = r'^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?=>\s*{'
        matches = re.findall(arrow_pattern, content, re.MULTILINE)
        for match in matches:
            functions.append({
                'name': match,
                'type': 'arrow_function',
                'category': 'Arrow Functions'
            })

        # Pattern 3: Class methods (within class context)
        lines = content.split('\n')
        in_class = False
        class_name = None
        brace_count = 0

        for i, line in enumerate(lines):
            # Track brace count to handle nested structures
            brace_count += line.count('{') - line.count('}')

            # Detect class start
            class_match = re.match(r'^\s*class\s+(\w+)', line)
            if class_match and brace_count >= 0:
                in_class = True
                class_name = class_match.group(1)
                continue

            # Detect class end (when brace count returns to class level)
            if in_class and brace_count <= 1 and re.match(r'^\s*}\s*$', line.strip()):
                in_class = False
                class_name = None
                continue

            # Extract methods within class
            if in_class and class_name:
                method_match = re.match(r'^\s*(\w+)\s*\(([^)]*)\)\s*{', line)
                if method_match:
                    method_name = method_match.group(1)
                    if method_name not in ['constructor', 'if', 'for', 'while', 'catch', 'try']:
                        functions.append({
                            'name': f"{class_name}.{method_name}",
                            'type': 'class_method',
                            'category': 'Class Methods'
                        })

        # Pattern 4: Object methods (obj.method = function)
        obj_method_pattern = r'(\w+)\.(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(obj_method_pattern, content)
        for obj_name, method_name in matches:
            functions.append({
                'name': f"{obj_name}.{method_name}",
                'type': 'object_method',
                'category': 'Object Methods'
            })

        # Pattern 5: Functions within IIFE that are assigned to window/global
        window_assign_pattern = r'window\.(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(window_assign_pattern, content)
        for match in matches:
            functions.append({
                'name': match,
                'type': 'global_function',
                'category': 'Global Functions'
            })

        # Pattern 6: Functions in IIFE assigned to variables
        iife_assign_pattern = r'(?:const|let|var)\s+(\w+)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))\s*{'
        matches = re.findall(iife_assign_pattern, content)
        for match in matches:
            # Avoid duplicates with arrow functions
            if not any(f['name'] == match and f['type'] == 'arrow_function' for f in functions):
                functions.append({
                    'name': match,
                    'type': 'iife_function',
                    'category': 'IIFE Functions'
                })

        # Remove duplicates while preserving order and preferring more specific types
        seen = set()
        unique_functions = []
        for func in functions:
            key = func['name']
            if key not in seen:
                seen.add(key)
                unique_functions.append(func)

        return unique_functions

    def categorize_functions_smart(self, functions):
        """Smart categorization based on function names and types"""
        categories = {}

        for func in functions:
            name = func['name'].lower()
            category = func.get('category', 'Other')

            if category not in categories:
                categories[category] = []

            # Add some smart categorization based on name patterns
            if any(keyword in name for keyword in ['init', 'initialize', 'setup', 'start', 'create', 'build']):
                if 'Initialization' not in categories:
                    categories['Initialization'] = []
                categories['Initialization'].append(func)
            elif any(keyword in name for keyword in ['handle', 'on', 'event', 'click', 'change', 'submit']):
                if 'Event Handlers' not in categories:
                    categories['Event Handlers'] = []
                categories['Event Handlers'].append(func)
            elif any(keyword in name for keyword in ['render', 'display', 'show', 'hide', 'update', 'refresh']):
                if 'UI Functions' not in categories:
                    categories['UI Functions'] = []
                categories['UI Functions'].append(func)
            elif any(keyword in name for keyword in ['fetch', 'get', 'load', 'save', 'data', 'api', 'request']):
                if 'Data Functions' not in categories:
                    categories['Data Functions'] = []
                categories['Data Functions'].append(func)
            elif any(keyword in name for keyword in ['util', 'helper', 'format', 'validate', 'check', 'parse']):
                if 'Utility Functions' not in categories:
                    categories['Utility Functions'] = []
                categories['Utility Functions'].append(func)
            else:
                categories[category].append(func)

        # Remove empty categories and clean up
        return {k: v for k, v in categories.items() if v}

    def generate_function_index(self, functions):
        """Generate Function Index string"""
        if not functions:
            return ""

        categorized = self.categorize_functions_smart(functions)

        index_lines = ["===== FUNCTION INDEX =====", ""]

        for category, funcs in categorized.items():
            if funcs:
                index_lines.append(f"=== {category} ===")
                for func in funcs:
                    name = func['name']
                    # Clean up the name for display
                    display_name = name.replace('window.', '').replace('global.', '')

                    # Create a readable description
                    desc = display_name.replace('_', ' ').replace('-', ' ').title()
                    if '.' in display_name:
                        parts = display_name.split('.')
                        desc = f"{parts[-1].replace('_', ' ').title()}"

                    index_lines.append(f"- {display_name}() - {desc}")
                index_lines.append("")

        return "\n".join(index_lines).rstrip()

    def has_function_index(self, content):
        """Check if file already has Function Index"""
        patterns = [
            r'FUNCTION INDEX',
            r'Function Index',
            r'INDEX OF FUNCTIONS',
            r'Functions Index',
            r'===== FUNCTION INDEX ====='
        ]

        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        return False

    def find_best_insertion_point(self, content):
        """Find the best place to insert Function Index"""
        lines = content.split('\n')

        # Look for the end of the header comment block
        for i, line in enumerate(lines):
            if line.strip().startswith('/**') or line.strip().startswith('/*'):
                # Find the end of this comment block
                j = i
                while j < len(lines):
                    if (line.strip().startswith('/**') and '*/' in lines[j]) or \
                       (line.strip().startswith('/*') and lines[j].strip().endswith('*/')):
                        return j + 2  # Insert after the comment block
                    j += 1

        # Fallback: find first non-comment, non-empty line
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith('//') and not stripped.startswith('/*') and not stripped.startswith('*'):
                return i

        return 0  # Beginning of file

    def add_function_index_to_file(self, file_path):
        """Add Function Index to a JavaScript file with enhanced logic"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if self.has_function_index(content):
                print(f"⏭️  Skipping {file_path.name} - already has Function Index")
                return False

            # Extract functions using enhanced method
            functions = self.extract_functions_comprehensive(content)
            if not functions:
                print(f"⚠️  Skipping {file_path.name} - no functions found")
                return False

            # Generate Function Index
            function_index = self.generate_function_index(functions)
            if not function_index:
                print(f"⚠️  Skipping {file_path.name} - could not generate Function Index")
                return False

            # Find best insertion point
            insert_index = self.find_best_insertion_point(content)

            # Backup original file
            backup_path = self.backup_dir / f"{file_path.name}.backup"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

            # Insert Function Index
            lines = content.split('\n')
            new_content = (
                '\n'.join(lines[:insert_index]) +
                '\n\n' + function_index + '\n\n' +
                '\n'.join(lines[insert_index:])
            )

            # Write updated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"✅ Added Function Index to {file_path.name} ({len(functions)} functions, {len(function_index.split('=== '))-1} categories)")
            return True

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False

    def process_files_batch(self, file_list, batch_size=50):
        """Process files in batches for better progress tracking"""
        processed = 0
        successful = 0
        total = len(file_list)

        for i in range(0, total, batch_size):
            batch = file_list[i:i+batch_size]
            batch_processed = 0
            batch_successful = 0

            for file_path in batch:
                full_path = Path(file_path)
                if full_path.exists():
                    batch_processed += 1
                    if self.add_function_index_to_file(full_path):
                        batch_successful += 1

            processed += batch_processed
            successful += batch_successful

            print(f"📊 Batch {i//batch_size + 1}: {batch_successful}/{batch_processed} files updated "
                  f"(Total: {successful}/{processed} = {successful/processed*100:.1f}%)")

        return successful, processed

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

    print(f"🔧 Processing {len(missing_files)} files missing Function Index with enhanced algorithm...")

    generator = EnhancedFunctionIndexGenerator()
    successful, processed = generator.process_files_batch(missing_files, batch_size=25)

    print("\n📊 FUNCTION INDEX GENERATION V2 COMPLETED")
    print(f"Total files processed: {processed}")
    print(f"Successfully updated: {successful}")
    print(f"Success rate: {successful/processed*100:.1f}%" if processed > 0 else "0%")

    # Run final scan to show improvement
    print("\n🔄 Running final scan...")
    os.system("python3 scripts/code_documentation_scanner.py | tail -5")

    print("\n✅ Enhanced Function Index generation completed!")
    print(f"Backups saved to: {generator.backup_dir}")

if __name__ == "__main__":
    main()
