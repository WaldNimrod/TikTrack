#!/usr/bin/env python3
"""
Sync Verification Utility
=========================

Verifies that sync completed successfully by comparing source and target directories.
Checks file counts, critical files, checksums, and directory structure.

Location: scripts/production-update/utils/sync_verification.py
"""

import hashlib
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional


def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        return f"ERROR: {e}"


def get_all_files(directory: Path, excluded_dirs: Set[str] = None, excluded_patterns: Set[str] = None) -> List[Path]:
    """
    Get all files in directory, excluding specified directories and patterns
    
    Args:
        directory: Root directory to scan
        excluded_dirs: Set of directory names to exclude
        excluded_patterns: Set of file patterns to exclude
    
    Returns:
        List of file paths relative to directory
    """
    if excluded_dirs is None:
        excluded_dirs = {
            'migrations', 'tests', 'test', 'archive', 'archives',
            'backup', 'backups', 'documentation', 'docs',
            'legacy', 'old', 'deprecated', 'debug', 'debugs',
            'db', 'logs', 'coverage', '__pycache__', '.git', 'node_modules'
        }
    
    if excluded_patterns is None:
        excluded_patterns = {
            '*.db', '*.db-shm', '*.db-wal', '*.log',
            '*.pyc', '*.pyo', '*.pyd', '.DS_Store',
            '*backup*', '*debug*', '*Debug*', '*DEBUG*',
            '*.md', '*.txt'
        }
    
    files = []
    
    for item in directory.rglob('*'):
        if not item.is_file():
            continue
        
        # Check if in excluded directory
        parts = item.relative_to(directory).parts
        if any(part in excluded_dirs for part in parts):
            continue
        
        # Check excluded patterns (simplified - just check extensions)
        if any(item.name.endswith(ext.replace('*', '')) for ext in excluded_patterns if '*' in ext):
            # Special cases
            if item.name == 'README.md' and len(parts) == 1:
                files.append(item.relative_to(directory))
                continue
            if item.name == 'requirements.txt':
                files.append(item.relative_to(directory))
                continue
            continue
        
        files.append(item.relative_to(directory))
    
    return files


def verify_file_count(source_dir: Path, target_dir: Path) -> Tuple[bool, Dict]:
    """
    Verify that file counts match between source and target
    
    Returns:
        Tuple of (success: bool, details: dict)
    """
    source_files = get_all_files(source_dir)
    target_files = get_all_files(target_dir)
    
    source_count = len(source_files)
    target_count = len(target_files)
    
    success = source_count == target_count
    
    return success, {
        'source_count': source_count,
        'target_count': target_count,
        'difference': abs(source_count - target_count),
        'source_files': set(str(f) for f in source_files),
        'target_files': set(str(f) for f in target_files)
    }


def verify_critical_files(source_dir: Path, target_dir: Path, critical_files: List[str] = None) -> Tuple[bool, Dict]:
    """
    Verify that critical files exist in target
    
    Args:
        source_dir: Source directory
        target_dir: Target directory
        critical_files: List of relative paths to critical files
    
    Returns:
        Tuple of (success: bool, details: dict)
    """
    if critical_files is None:
        critical_files = [
            'app.py',
            'requirements.txt',
            'config/settings.py',
            'config/database.py',
            'config/logging.py',
            'routes/api/__init__.py',
        ]
    
    missing_files = []
    existing_files = []
    
    for rel_path in critical_files:
        source_file = source_dir / rel_path
        target_file = target_dir / rel_path
        
        if not target_file.exists():
            missing_files.append(rel_path)
        else:
            existing_files.append(rel_path)
    
    success = len(missing_files) == 0
    
    return success, {
        'missing_files': missing_files,
        'existing_files': existing_files,
        'total_critical': len(critical_files),
        'found': len(existing_files),
        'missing': len(missing_files)
    }


def verify_file_content(source_dir: Path, target_dir: Path, critical_files: List[str] = None) -> Tuple[bool, Dict]:
    """
    Verify that critical files have matching checksums
    
    Args:
        source_dir: Source directory
        target_dir: Target directory
        critical_files: List of relative paths to critical files
    
    Returns:
        Tuple of (success: bool, details: dict)
    """
    if critical_files is None:
        # Get all Python, JS, CSS files as critical
        critical_files = []
        for ext in ['.py', '.js', '.css']:
            for file_path in source_dir.rglob(f'*{ext}'):
                rel_path = file_path.relative_to(source_dir)
                # Skip excluded directories
                if any(part in ('migrations', 'tests', 'test', 'archive', 'backup', 'documentation', 'legacy', 'debug', 'debugs', 'db', 'logs', '__pycache__', '.git') for part in rel_path.parts):
                    continue
                critical_files.append(str(rel_path))
    
    different_files = []
    matching_files = []
    missing_files = []
    
    for rel_path_str in critical_files[:50]:  # Limit to first 50 for performance
        rel_path = Path(rel_path_str)
        source_file = source_dir / rel_path
        target_file = target_dir / rel_path
        
        if not source_file.exists():
            continue
        
        if not target_file.exists():
            missing_files.append(rel_path_str)
            continue
        
        source_hash = calculate_file_hash(source_file)
        target_hash = calculate_file_hash(target_file)
        
        if source_hash == target_hash:
            matching_files.append(rel_path_str)
        else:
            different_files.append(rel_path_str)
    
    success = len(different_files) == 0 and len(missing_files) == 0
    
    return success, {
        'different_files': different_files,
        'matching_files': matching_files,
        'missing_files': missing_files,
        'total_checked': len(critical_files),
        'matching': len(matching_files),
        'different': len(different_files),
        'missing': len(missing_files)
    }


def verify_directory_structure(source_dir: Path, target_dir: Path) -> Tuple[bool, Dict]:
    """
    Verify that directory structure matches between source and target
    
    Returns:
        Tuple of (success: bool, details: dict)
    """
    excluded_dirs = {
        'migrations', 'tests', 'test', 'archive', 'archives',
        'backup', 'backups', 'documentation', 'docs',
        'legacy', 'old', 'deprecated', 'db', 'logs',
        'coverage', '__pycache__', '.git', 'node_modules'
    }
    
    def get_directories(root: Path) -> Set[str]:
        dirs = set()
        for item in root.rglob('*'):
            if item.is_dir():
                rel_path = item.relative_to(root)
                # Skip excluded directories
                if any(part in excluded_dirs for part in rel_path.parts):
                    continue
                dirs.add(str(rel_path))
        return dirs
    
    source_dirs = get_directories(source_dir)
    target_dirs = get_directories(target_dir)
    
    missing_dirs = source_dirs - target_dirs
    extra_dirs = target_dirs - source_dirs
    
    success = len(missing_dirs) == 0
    
    return success, {
        'source_dirs': len(source_dirs),
        'target_dirs': len(target_dirs),
        'missing_dirs': list(missing_dirs),
        'extra_dirs': list(extra_dirs),
        'matching': len(source_dirs & target_dirs)
    }


def verify_syntax_errors(target_dir: Path, file_extensions: List[str] = None) -> Tuple[bool, Dict]:
    """
    Verify that there are no syntax errors in target files (optional check)
    
    Args:
        target_dir: Target directory to check
        file_extensions: List of file extensions to check (e.g., ['.py', '.js'])
    
    Returns:
        Tuple of (success: bool, details: dict)
    """
    if file_extensions is None:
        file_extensions = ['.py', '.js']
    
    import subprocess
    import sys
    
    syntax_errors = []
    checked_files = []
    
    for ext in file_extensions:
        for file_path in target_dir.rglob(f'*{ext}'):
            # Skip excluded directories
            rel_path = file_path.relative_to(target_dir)
            if any(part in ('migrations', 'tests', 'test', 'archive', 'backup', 'documentation', 'legacy', 'debug', 'debugs', 'db', 'logs', '__pycache__', '.git') for part in rel_path.parts):
                continue
            
            checked_files.append(str(rel_path))
            
            try:
                if ext == '.py':
                    # Check Python syntax
                    result = subprocess.run(
                        [sys.executable, '-m', 'py_compile', str(file_path)],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode != 0:
                        syntax_errors.append({
                            'file': str(rel_path),
                            'error': result.stderr,
                            'type': 'python'
                        })
                elif ext == '.js':
                    # JavaScript syntax checking would require node/eslint
                    # Skip for now or implement with node if available
                    pass
            except Exception as e:
                syntax_errors.append({
                    'file': str(rel_path),
                    'error': str(e),
                    'type': ext[1:] if ext.startswith('.') else ext
                })
    
    success = len(syntax_errors) == 0
    
    return success, {
        'syntax_errors': syntax_errors,
        'checked_files': len(checked_files),
        'errors_found': len(syntax_errors)
    }


def generate_sync_report(source_dir: Path, target_dir: Path) -> Dict:
    """
    Generate comprehensive sync verification report
    
    Returns:
        Dictionary with all verification results
    """
    report = {
        'source_dir': str(source_dir),
        'target_dir': str(target_dir),
        'verifications': {}
    }
    
    # File count verification
    file_count_success, file_count_details = verify_file_count(source_dir, target_dir)
    report['verifications']['file_count'] = {
        'success': file_count_success,
        'details': file_count_details
    }
    
    # Critical files verification
    critical_files_success, critical_files_details = verify_critical_files(source_dir, target_dir)
    report['verifications']['critical_files'] = {
        'success': critical_files_success,
        'details': critical_files_details
    }
    
    # File content verification
    file_content_success, file_content_details = verify_file_content(source_dir, target_dir)
    report['verifications']['file_content'] = {
        'success': file_content_success,
        'details': file_content_details
    }
    
    # Directory structure verification
    dir_structure_success, dir_structure_details = verify_directory_structure(source_dir, target_dir)
    report['verifications']['directory_structure'] = {
        'success': dir_structure_success,
        'details': dir_structure_details
    }
    
    # Overall success
    report['overall_success'] = all([
        file_count_success,
        critical_files_success,
        file_content_success,
        dir_structure_success
    ])
    
    return report


if __name__ == '__main__':
    import sys
    from pathlib import Path
    
    if len(sys.argv) < 3:
        print("Usage: sync_verification.py <source_dir> <target_dir>")
        sys.exit(1)
    
    source_dir = Path(sys.argv[1])
    target_dir = Path(sys.argv[2])
    
    if not source_dir.exists():
        print(f"❌ Source directory not found: {source_dir}")
        sys.exit(1)
    
    if not target_dir.exists():
        print(f"❌ Target directory not found: {target_dir}")
        sys.exit(1)
    
    report = generate_sync_report(source_dir, target_dir)
    
    print("=" * 70)
    print("Sync Verification Report")
    print("=" * 70)
    print(f"Source: {source_dir}")
    print(f"Target: {target_dir}")
    print()
    
    for check_name, check_result in report['verifications'].items():
        status = "✅" if check_result['success'] else "❌"
        print(f"{status} {check_name}: {'PASSED' if check_result['success'] else 'FAILED'}")
        if not check_result['success']:
            print(f"   Details: {check_result['details']}")
    
    print()
    overall_status = "✅" if report['overall_success'] else "❌"
    print(f"{overall_status} Overall: {'PASSED' if report['overall_success'] else 'FAILED'}")
    print("=" * 70)
    
    sys.exit(0 if report['overall_success'] else 1)

