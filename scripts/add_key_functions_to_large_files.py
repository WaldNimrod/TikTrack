#!/usr/bin/env python3
"""
Add Key Functions to Large Files - Partial Completion
====================================================

For very large files (bundles), add at least the most important/most used functions
to the Function Index, even if we can't complete 100%.

Author: TikTrack Development Team
Version: 1.0.0
Created: 2025-01-27
"""

import os
import re
from pathlib import Path
import json

class KeyFunctionsAdder:
    def __init__(self):
        self.scripts_dir = Path("trading-ui/scripts")
        self.backup_dir = Path("backup/add_key_functions")
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # Define key functions to prioritize for each large file
        self.key_functions_map = {
            'modules.bundle.js': [
                'initModulesSystem', 'loadModule', 'registerModule', 'getModule',
                'moduleLoader', 'checkModuleDependencies', 'loadModulesConfig'
            ],
            'base.bundle.js': [
                'initBaseSystem', 'loadBaseConfig', 'setupBaseEnvironment',
                'initializeCoreSystems', 'loadBaseDependencies', 'configureBase'
            ],
            'import-user-data.js': [
                'initImportSystem', 'startImportProcess', 'validateImportData',
                'processImportFile', 'showImportProgress', 'handleImportErrors'
            ],
            'dashboard-widgets.bundle.js': [
                'initDashboardWidgets', 'loadWidget', 'renderWidget', 'updateWidget',
                'configureWidget', 'widgetManager', 'createWidgetContainer'
            ],
            'entity-services.bundle.js': [
                'initEntityServices', 'getEntityData', 'saveEntityData', 'validateEntity',
                'entityServiceManager', 'loadEntityConfig', 'processEntityRequest'
            ],
            'services.bundle.js': [
                'initServices', 'loadService', 'callService', 'serviceManager',
                'configureServices', 'serviceRegistry', 'handleServiceResponse'
            ],
            'entity-details.bundle.js': [
                'initEntityDetails', 'loadEntityDetails', 'renderEntityDetails',
                'updateEntityDetails', 'entityDetailsManager', 'configureEntityDetails'
            ],
            'init-system.bundle.js': [
                'initSystem', 'loadInitConfig', 'initializeComponents',
                'setupInitEnvironment', 'initSystemManager', 'configureInitSystem'
            ],
            'preferences.bundle.js': [
                'initPreferences', 'loadPreferences', 'savePreferences',
                'updatePreferences', 'preferencesManager', 'configurePreferences'
            ],
            'executions.js': [
                'initExecutionsPage', 'loadExecutions', 'renderExecutionsTable',
                'handleExecutionAction', 'updateExecutionsStats', 'filterExecutions'
            ]
        }

    def extract_existing_index_functions(self, content):
        """Extract functions already in the Function Index"""
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

    def find_key_functions_in_content(self, content, key_functions):
        """Find which key functions actually exist in the content"""
        found_functions = {}

        for key_func in key_functions:
            # Look for the function in the content
            patterns = [
                fr'\bfunction\s+{re.escape(key_func)}\s*\(',
                fr'\bconst\s+{re.escape(key_func)}\s*=',
                fr'\blet\s+{re.escape(key_func)}\s*=',
                fr'\bvar\s+{re.escape(key_func)}\s*=',
                fr'\b{re.escape(key_func)}\s*\(',
                fr'\b{re.escape(key_func)}\s*=\s*function',
                fr'window\.{re.escape(key_func)}\s*=',
                fr'global\.{re.escape(key_func)}\s*='
            ]

            for pattern in patterns:
                if re.search(pattern, content, re.MULTILINE):
                    found_functions[key_func] = {
                        'name': key_func,
                        'type': 'key_function',
                        'category': 'Key Functions'
                    }
                    break

        return found_functions

    def generate_key_functions_index(self, key_functions):
        """Generate Function Index for key functions"""
        if not key_functions:
            return ""

        index_lines = ["===== KEY FUNCTIONS INDEX =====", ""]
        index_lines.append("=== Key Functions ===")

        for func_name, func_info in sorted(key_functions.items()):
            desc = func_name.replace('_', ' ').replace('-', ' ').title()
            index_lines.append(f"- {func_name}() - {desc}")

        index_lines.append("")
        return '\n'.join(index_lines).rstrip()

    def add_key_functions_to_file(self, file_path, filename):
        """Add key functions to a large file's Function Index"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if 'FUNCTION INDEX' not in content:
                return False

            # Get key functions for this file
            key_functions_list = self.key_functions_map.get(filename, [])
            if not key_functions_list:
                return False

            # Find which key functions exist in the content
            existing_indexed = self.extract_existing_index_functions(content)
            key_functions = self.find_key_functions_in_content(content, key_functions_list)

            # Filter out already indexed functions
            new_key_functions = {}
            for func_name, func_info in key_functions.items():
                if func_name not in existing_indexed:
                    new_key_functions[func_name] = func_info

            if not new_key_functions:
                return False  # All key functions already indexed

            # Generate index for new key functions
            key_index = self.generate_key_functions_index(new_key_functions)

            if not key_index:
                return False

            # Find where to insert - after existing Function Index
            lines = content.split('\n')
            insert_index = -1

            for i, line in enumerate(lines):
                if '===== FUNCTION INDEX =====' in line:
                    # Find the end of the existing index
                    j = i + 1
                    while j < len(lines):
                        if (j + 1 < len(lines) and
                            lines[j].strip() == '' and
                            not lines[j + 1].strip().startswith('-') and
                            not lines[j + 1].strip().startswith('===') and
                            '*/' not in lines[j + 1]):
                            insert_index = j
                            break
                        j += 1
                    break

            if insert_index == -1:
                return False

            # Backup
            backup_path = self.backup_dir / f"{filename}.backup"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

            # Insert key functions index
            new_content = (
                '\n'.join(lines[:insert_index]) +
                '\n' + key_index + '\n' +
                '\n'.join(lines[insert_index:])
            )

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"✅ Added {len(new_key_functions)} key functions to {filename}")
            return True

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False

    def process_large_files(self, incompleteness_data):
        """Process the largest incomplete files"""
        processed = 0
        successful = 0

        # Get the largest incomplete files
        incomplete = [r for r in incompleteness_data['detailed_report'] if not r['is_complete']]
        large_incomplete = sorted(incomplete, key=lambda x: len(x['missing_in_index']), reverse=True)

        # Process top 10 largest files
        for result in large_incomplete[:10]:
            filename = result['filename']
            file_path = Path(result['file'])

            if file_path.exists() and filename in self.key_functions_map:
                processed += 1
                if self.add_key_functions_to_file(file_path, filename):
                    successful += 1

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

    print(f"🔧 Adding key functions to {min(10, incomplete_count)} largest incomplete files...")

    adder = KeyFunctionsAdder()
    successful, processed = adder.process_large_files(incompleteness_data)

    print("\n📊 KEY FUNCTIONS ADDITION RESULTS")
    print(f"Files processed: {processed}")
    print(f"Successfully updated: {successful}")
    print(f"Success rate: {successful/processed*100:.1f}%" if processed > 0 else "0%")

    # Run verification again
    print("\n🔄 Running final verification...")
    os.system("python3 scripts/verify_function_index_completeness.py | grep -E '(Complete indexes|Incomplete indexes)'")

    print("\n✅ Key functions addition completed!")
    print(f"Backups saved to: {adder.backup_dir}")

if __name__ == "__main__":
    main()
