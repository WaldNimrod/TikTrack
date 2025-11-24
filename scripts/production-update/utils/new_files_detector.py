#!/usr/bin/env python3
"""
New Files Detector
==================

Detects new and changed files between development and production directories.
"""

import hashlib
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from logger import get_logger
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger


class NewFilesDetector:
    """Detects new and changed files"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
        self.dev_backend = project_root / "Backend"
        self.prod_backend = project_root / "production" / "Backend"
        self.dev_ui = project_root / "trading-ui"
        self.prod_ui = project_root / "production" / "trading-ui"
    
    def calculate_file_hash(self, file_path: Path) -> Optional[str]:
        """Calculate MD5 hash of a file"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception as e:
            self.logger.warning(f"  ⚠️  Could not hash {file_path}: {e}")
            return None
    
    def compare_directories(self, dev_dir: Path, prod_dir: Path, 
                          exclude_patterns: Optional[List[str]] = None) -> Tuple[List[Path], List[Path], List[Path]]:
        """Compare two directories
        
        Returns:
            Tuple of (new_files, changed_files, deleted_files)
        """
        if exclude_patterns is None:
            exclude_patterns = [
                '__pycache__',
                '.pyc',
                '.pyo',
                '.pyd',
                '.db',
                '.db-shm',
                '.db-wal',
                '.log',
                'node_modules',
                '.git'
            ]
        
        new_files = []
        changed_files = []
        deleted_files = []
        
        if not dev_dir.exists():
            self.logger.warning(f"  ⚠️  Development directory not found: {dev_dir}")
            return new_files, changed_files, deleted_files
        
        if not prod_dir.exists():
            self.logger.warning(f"  ⚠️  Production directory not found: {prod_dir}")
            # All dev files are new
            for file_path in dev_dir.rglob('*'):
                if file_path.is_file():
                    # Check if should be excluded
                    if any(pattern in str(file_path) for pattern in exclude_patterns):
                        continue
                    new_files.append(file_path.relative_to(dev_dir))
            return new_files, changed_files, deleted_files
        
        # Get all files in dev
        dev_files = {}
        for file_path in dev_dir.rglob('*'):
            if file_path.is_file():
                # Check if should be excluded
                if any(pattern in str(file_path) for pattern in exclude_patterns):
                    continue
                
                rel_path = file_path.relative_to(dev_dir)
                dev_files[rel_path] = file_path
        
        # Get all files in prod
        prod_files = {}
        for file_path in prod_dir.rglob('*'):
            if file_path.is_file():
                # Check if should be excluded
                if any(pattern in str(file_path) for pattern in exclude_patterns):
                    continue
                
                rel_path = file_path.relative_to(prod_dir)
                prod_files[rel_path] = file_path
        
        # Find new files (in dev but not in prod)
        for rel_path, dev_file in dev_files.items():
            if rel_path not in prod_files:
                new_files.append(rel_path)
            else:
                # Check if changed (compare hashes)
                dev_hash = self.calculate_file_hash(dev_file)
                prod_hash = self.calculate_file_hash(prod_files[rel_path])
                
                if dev_hash and prod_hash and dev_hash != prod_hash:
                    changed_files.append(rel_path)
        
        # Find deleted files (in prod but not in dev)
        for rel_path in prod_files:
            if rel_path not in dev_files:
                deleted_files.append(rel_path)
        
        return new_files, changed_files, deleted_files
    
    def find_new_files(self) -> Dict[str, List[Path]]:
        """Find new files in Backend and UI"""
        result = {
            'backend_new': [],
            'backend_changed': [],
            'backend_deleted': [],
            'ui_new': [],
            'ui_changed': [],
            'ui_deleted': []
        }
        
        # Compare Backend
        self.logger.info("  🔍 Comparing Backend directories...")
        new, changed, deleted = self.compare_directories(self.dev_backend, self.prod_backend)
        result['backend_new'] = new
        result['backend_changed'] = changed
        result['backend_deleted'] = deleted
        
        # Compare UI
        self.logger.info("  🔍 Comparing UI directories...")
        new, changed, deleted = self.compare_directories(self.dev_ui, self.prod_ui)
        result['ui_new'] = new
        result['ui_changed'] = changed
        result['ui_deleted'] = deleted
        
        return result
    
    def find_changed_files(self) -> List[Path]:
        """Find files that have changed significantly"""
        # This is already included in find_new_files
        # But we can add more sophisticated change detection here
        all_files = self.find_new_files()
        return all_files['backend_changed'] + all_files['ui_changed']
    
    def check_critical_files(self) -> Dict[str, bool]:
        """Check if critical files exist"""
        critical_files = {
            'backend_app': self.prod_backend / "app.py",
            'backend_settings': self.prod_backend / "config" / "settings.py",
            'backend_requirements': self.prod_backend / "requirements.txt",
            'ui_index': self.prod_ui / "index.html",
            'ui_trades': self.prod_ui / "trades.html",
            'ui_alerts': self.prod_ui / "alerts.html"
        }
        
        results = {}
        for name, path in critical_files.items():
            exists = path.exists()
            results[name] = exists
            if not exists:
                self.logger.warning(f"  ⚠️  Critical file missing: {path}")
        
        return results
    
    def generate_report(self) -> Dict:
        """Generate a comprehensive report"""
        files_info = self.find_new_files()
        critical_check = self.check_critical_files()
        
        return {
            'new_files': {
                'backend': len(files_info['backend_new']),
                'ui': len(files_info['ui_new']),
                'total': len(files_info['backend_new']) + len(files_info['ui_new'])
            },
            'changed_files': {
                'backend': len(files_info['backend_changed']),
                'ui': len(files_info['ui_changed']),
                'total': len(files_info['backend_changed']) + len(files_info['ui_changed'])
            },
            'deleted_files': {
                'backend': len(files_info['backend_deleted']),
                'ui': len(files_info['ui_deleted']),
                'total': len(files_info['backend_deleted']) + len(files_info['ui_deleted'])
            },
            'critical_files': critical_check,
            'details': {
                'backend_new': [str(p) for p in files_info['backend_new'][:20]],  # First 20
                'backend_changed': [str(p) for p in files_info['backend_changed'][:20]],
                'ui_new': [str(p) for p in files_info['ui_new'][:20]],
                'ui_changed': [str(p) for p in files_info['ui_changed'][:20]]
            },
            'warnings': [
                name for name, exists in critical_check.items() if not exists
            ]
        }


def detect_new_files(project_root: Optional[Path] = None) -> Dict:
    """
    Main entry point for new files detection
    
    Args:
        project_root: Project root path (defaults to auto-detect)
    
    Returns:
        Dict with detection results
    """
    if project_root is None:
        project_root = PROJECT_ROOT
    
    detector = NewFilesDetector(project_root)
    return detector.generate_report()


if __name__ == '__main__':
    report = detect_new_files()
    import json
    print(json.dumps(report, indent=2, default=str))

