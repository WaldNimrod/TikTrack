#!/usr/bin/env python3
"""
TikTrack Active Files Mapper
============================

Maps all active files in the TikTrack system by analyzing imports and dependencies.
This script identifies which files are actually used in production.

Purpose: Create a comprehensive list of files needed for production environment
Location: Backend/scripts/map_active_files.py
"""

import os
import sys
import ast
import json
from pathlib import Path
from typing import Set, Dict, List
from collections import defaultdict

# Add Backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

class FileMapper:
    """Maps active files by analyzing Python imports"""
    
    def __init__(self, backend_dir: Path):
        self.backend_dir = backend_dir
        self.active_files: Set[str] = set()
        self.file_dependencies: Dict[str, Set[str]] = defaultdict(set)
        self.visited_files: Set[str] = set()
        
    def normalize_path(self, file_path: str) -> str:
        """Normalize file path to relative path from backend_dir"""
        try:
            rel_path = os.path.relpath(file_path, self.backend_dir)
            return rel_path.replace('\\', '/')
        except ValueError:
            return file_path
    
    def find_python_file(self, module_path: str, from_file: str) -> str:
        """Find Python file for a given module path"""
        # Handle relative imports
        if module_path.startswith('.'):
            from_dir = os.path.dirname(from_file)
            parts = module_path.split('.')
            depth = len([p for p in parts if p == ''])
            module_name = '.'.join([p for p in parts if p])
            
            if depth > 0:
                for _ in range(depth - 1):
                    from_dir = os.path.dirname(from_dir)
            
            if module_name:
                file_path = os.path.join(from_dir, module_name.replace('.', os.sep) + '.py')
            else:
                file_path = os.path.join(from_dir, '__init__.py')
        else:
            # Absolute import
            parts = module_path.split('.')
            file_path = os.path.join(self.backend_dir, *parts) + '.py'
        
        # Check if file exists
        if os.path.exists(file_path):
            return file_path
        
        # Try __init__.py
        init_path = file_path.replace('.py', '/__init__.py')
        if os.path.exists(init_path):
            return init_path
        
        return None
    
    def extract_imports(self, file_path: str) -> Set[str]:
        """Extract all imports from a Python file"""
        imports = set()
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content, filename=file_path)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.add(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.add(node.module)
        except Exception as e:
            print(f"Warning: Could not parse {file_path}: {e}")
        
        return imports
    
    def is_backend_file(self, module_path: str) -> bool:
        """Check if module is from Backend directory"""
        # Check if it's a standard library or external package
        if module_path.split('.')[0] in ['os', 'sys', 'json', 'datetime', 'typing', 
                                         'flask', 'pathlib', 'logging',
                                         'subprocess', 'time', 'psutil', 'collections',
                                         'traceback', 'shutil', 'sqlalchemy']:
            return False
        
        # Check if it starts with config, routes, services, models, utils
        if module_path.split('.')[0] in ['config', 'routes', 'services', 'models', 'utils']:
            return True
        
        return False
    
    def scan_file(self, file_path: str, depth: int = 0):
        """Recursively scan a file for imports"""
        if depth > 10:  # Prevent infinite recursion
            return
        
        normalized_path = self.normalize_path(file_path)
        
        if normalized_path in self.visited_files:
            return
        
        if not os.path.exists(file_path):
            return
        
        self.visited_files.add(normalized_path)
        self.active_files.add(normalized_path)
        
        # Extract imports
        imports = self.extract_imports(file_path)
        
        for imp in imports:
            if self.is_backend_file(imp):
                imported_file = self.find_python_file(imp, file_path)
                if imported_file:
                    self.file_dependencies[normalized_path].add(self.normalize_path(imported_file))
                    self.scan_file(imported_file, depth + 1)
    
    def scan_directory(self, directory: Path, pattern: str = "*.py"):
        """Scan all Python files in a directory"""
        for file_path in directory.rglob(pattern):
            if file_path.is_file():
                normalized_path = self.normalize_path(str(file_path))
                self.active_files.add(normalized_path)
    
    def categorize_files(self) -> Dict[str, List[str]]:
        """Categorize files by directory"""
        categories = {
            'config': [],
            'routes': [],
            'services': [],
            'models': [],
            'utils': [],
            'scripts': [],
            'other': []
        }
        
        for file_path in sorted(self.active_files):
            if file_path.startswith('config/'):
                categories['config'].append(file_path)
            elif file_path.startswith('routes/'):
                categories['routes'].append(file_path)
            elif file_path.startswith('services/'):
                categories['services'].append(file_path)
            elif file_path.startswith('models/'):
                categories['models'].append(file_path)
            elif file_path.startswith('utils/'):
                categories['utils'].append(file_path)
            elif file_path.startswith('scripts/'):
                categories['scripts'].append(file_path)
            else:
                categories['other'].append(file_path)
        
        return categories
    
    def generate_report(self) -> Dict:
        """Generate comprehensive report"""
        categories = self.categorize_files()
        
        report = {
            'summary': {
                'total_files': len(self.active_files),
                'by_category': {cat: len(files) for cat, files in categories.items()}
            },
            'files': categories,
            'dependencies': {k: list(v) for k, v in self.file_dependencies.items()}
        }
        
        return report

def main():
    """Main function"""
    print("=" * 60)
    print("TikTrack Active Files Mapper")
    print("=" * 60)
    print()
    
    backend_dir = Path(__file__).parent.parent
    mapper = FileMapper(backend_dir)
    
    # Start with app.py
    app_py = backend_dir / 'app.py'
    print(f"📄 Scanning main file: {app_py}")
    mapper.scan_file(str(app_py))
    
    # Scan all routes
    routes_dir = backend_dir / 'routes'
    print(f"📁 Scanning routes directory...")
    mapper.scan_directory(routes_dir)
    
    # Scan all services
    services_dir = backend_dir / 'services'
    print(f"📁 Scanning services directory...")
    mapper.scan_directory(services_dir)
    
    # Scan all models
    models_dir = backend_dir / 'models'
    print(f"📁 Scanning models directory...")
    mapper.scan_directory(models_dir)
    
    # Scan all utils
    utils_dir = backend_dir / 'utils'
    print(f"📁 Scanning utils directory...")
    mapper.scan_directory(utils_dir)
    
    # Scan config
    config_dir = backend_dir / 'config'
    print(f"📁 Scanning config directory...")
    mapper.scan_directory(config_dir)
    
    # Generate report
    print()
    print("📊 Generating report...")
    report = mapper.generate_report()
    
    # Print summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total active files: {report['summary']['total_files']}")
    print()
    print("By category:")
    for category, count in report['summary']['by_category'].items():
        print(f"  {category}: {count} files")
    
    # Save report
    output_file = backend_dir.parent / 'PRODUCTION_FILES_LIST.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print()
    print(f"✅ Report saved to: {output_file}")
    
    # Generate markdown report
    md_file = backend_dir.parent / 'PRODUCTION_FILES_LIST.md'
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write("# TikTrack Production Files List\n\n")
        f.write(f"**Generated:** {Path(__file__).stat().st_mtime}\n\n")
        f.write(f"**Total Files:** {report['summary']['total_files']}\n\n")
        
        f.write("## Summary by Category\n\n")
        f.write("| Category | Count |\n")
        f.write("|----------|-------|\n")
        for category, count in report['summary']['by_category'].items():
            f.write(f"| {category} | {count} |\n")
        
        f.write("\n## Files by Category\n\n")
        for category, files in report['files'].items():
            if files:
                f.write(f"### {category.upper()}\n\n")
                for file_path in sorted(files):
                    f.write(f"- `{file_path}`\n")
                f.write("\n")
    
    print(f"✅ Markdown report saved to: {md_file}")
    print()
    print("=" * 60)
    print("Done!")
    print("=" * 60)

if __name__ == '__main__':
    main()
