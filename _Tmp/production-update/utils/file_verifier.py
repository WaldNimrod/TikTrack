#!/usr/bin/env python3
"""
File Verification System
========================

Verifies that all files are properly synchronized between dev and production.
Uses checksums and file inventory to detect differences.
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


class FileVerifier:
    """Verifies file synchronization"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
        
        self.backend_source = project_root / "Backend"
        self.backend_target = project_root / "production" / "Backend"
        self.ui_source = project_root / "trading-ui"
        self.ui_target = project_root / "production" / "trading-ui"
    
    def calculate_checksum(self, file_path: Path) -> Optional[str]:
        """Calculate MD5 checksum of a file"""
        try:
            hash_md5 = hashlib.md5()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            self.logger.warning(f"    ⚠️  Could not calculate checksum for {file_path}: {e}")
            return None
    
    def get_file_inventory(self, directory: Path, 
                          extensions: Optional[List[str]] = None) -> Dict[str, Dict]:
        """Get inventory of all files in directory"""
        if not directory.exists():
            return {}
        
        inventory = {}
        
        if extensions is None:
            extensions = ['.py', '.html', '.js', '.css', '.json']
        
        for file_path in directory.rglob('*'):
            if not file_path.is_file():
                continue
            
            if file_path.suffix not in extensions:
                continue
            
            # Skip certain directories
            if any(skip in str(file_path) for skip in ['__pycache__', '.git', 'node_modules', '.DS_Store']):
                continue
            
            rel_path = file_path.relative_to(directory)
            checksum = self.calculate_checksum(file_path)
            
            inventory[str(rel_path)] = {
                'path': str(rel_path),
                'size': file_path.stat().st_size,
                'mtime': file_path.stat().st_mtime,
                'checksum': checksum
            }
        
        return inventory
    
    def compare_inventories(self, source_inv: Dict, target_inv: Dict) -> Dict:
        """Compare two file inventories"""
        source_files = set(source_inv.keys())
        target_files = set(target_inv.keys())
        
        missing_files = sorted(source_files - target_files)
        extra_files = sorted(target_files - source_files)
        common_files = sorted(source_files & target_files)
        
        different_files = []
        identical_files = []
        
        for file_path in common_files:
            source_info = source_inv[file_path]
            target_info = target_inv[file_path]
            
            if source_info['checksum'] and target_info['checksum']:
                if source_info['checksum'] == target_info['checksum']:
                    identical_files.append(file_path)
                else:
                    different_files.append({
                        'path': file_path,
                        'source_size': source_info['size'],
                        'target_size': target_info['size'],
                        'source_checksum': source_info['checksum'],
                        'target_checksum': target_info['checksum']
                    })
            else:
                # If checksum unavailable, compare size and mtime
                if (source_info['size'] != target_info['size'] or 
                    abs(source_info['mtime'] - target_info['mtime']) > 1):
                    different_files.append({
                        'path': file_path,
                        'source_size': source_info['size'],
                        'target_size': target_info['size']
                    })
                else:
                    identical_files.append(file_path)
        
        return {
            'missing_files': missing_files,
            'extra_files': extra_files,
            'different_files': different_files,
            'identical_files': identical_files,
            'total_source': len(source_inv),
            'total_target': len(target_inv),
            'total_identical': len(identical_files),
            'total_different': len(different_files),
            'total_missing': len(missing_files)
        }
    
    def verify_backend(self) -> Dict:
        """Verify Backend files"""
        self.logger.info("  🔍 Verifying Backend files...")
        
        source_inv = self.get_file_inventory(self.backend_source, ['.py'])
        target_inv = self.get_file_inventory(self.backend_target, ['.py'])
        
        comparison = self.compare_inventories(source_inv, target_inv)
        
        if comparison['total_different'] == 0 and comparison['total_missing'] == 0:
            self.logger.info(f"    ✅ All Backend files synchronized ({comparison['total_identical']} files)")
        else:
            if comparison['total_missing'] > 0:
                self.logger.warning(f"    ⚠️  {comparison['total_missing']} files missing in production")
            if comparison['total_different'] > 0:
                self.logger.warning(f"    ⚠️  {comparison['total_different']} files differ from source")
        
        return comparison
    
    def verify_ui(self) -> Dict:
        """Verify UI files"""
        self.logger.info("  🔍 Verifying UI files...")
        
        source_inv = self.get_file_inventory(
            self.ui_source, 
            ['.html', '.js', '.css', '.json']
        )
        target_inv = self.get_file_inventory(
            self.ui_target,
            ['.html', '.js', '.css', '.json']
        )
        
        comparison = self.compare_inventories(source_inv, target_inv)
        
        if comparison['total_different'] == 0 and comparison['total_missing'] == 0:
            self.logger.info(f"    ✅ All UI files synchronized ({comparison['total_identical']} files)")
        else:
            if comparison['total_missing'] > 0:
                self.logger.warning(f"    ⚠️  {comparison['total_missing']} UI files missing in production")
            if comparison['total_different'] > 0:
                self.logger.warning(f"    ⚠️  {comparison['total_different']} UI files differ from source")
        
        return comparison
    
    def verify_critical_files(self) -> Dict:
        """Verify critical files that must be identical"""
        critical_files = [
            'Backend/config/settings.py',
            'Backend/routes/api/__init__.py',
            'Backend/app.py'
        ]
        
        self.logger.info("  🔍 Verifying critical files...")
        
        issues = []
        
        for rel_path in critical_files:
            source_file = self.project_root / rel_path
            target_file = self.project_root / "production" / rel_path
            
            if not source_file.exists():
                continue
            
            if not target_file.exists():
                issues.append(f"Missing: {rel_path}")
                continue
            
            source_checksum = self.calculate_checksum(source_file)
            target_checksum = self.calculate_checksum(target_file)
            
            if source_checksum and target_checksum:
                if source_checksum != target_checksum:
                    # For config files, this might be expected (after transformation)
                    if 'settings.py' in rel_path:
                        self.logger.info(f"    ℹ️  {rel_path} differs (expected after transformation)")
                    else:
                        issues.append(f"Different: {rel_path}")
                else:
                    self.logger.info(f"    ✅ {rel_path} matches")
        
        if issues:
            self.logger.warning(f"    ⚠️  {len(issues)} critical file issues found")
            for issue in issues:
                self.logger.warning(f"      - {issue}")
        else:
            self.logger.info("    ✅ All critical files verified")
        
        return {
            'issues': issues,
            'all_ok': len(issues) == 0
        }
    
    def verify_all(self) -> Dict:
        """Verify all files"""
        results = {}
        
        results['backend'] = self.verify_backend()
        results['ui'] = self.verify_ui()
        results['critical'] = self.verify_critical_files()
        
        # Summary
        backend_ok = (results['backend']['total_different'] == 0 and 
                     results['backend']['total_missing'] == 0)
        ui_ok = (results['ui']['total_different'] == 0 and 
                results['ui']['total_missing'] == 0)
        critical_ok = results['critical']['all_ok']
        
        all_ok = backend_ok and ui_ok and critical_ok
        
        if all_ok:
            self.logger.info("  ✅ All files verified and synchronized")
        else:
            self.logger.warning("  ⚠️  Some files are not synchronized")
        
        results['all_ok'] = all_ok
        
        return results


def verify_files(project_root: Optional[Path] = None) -> Dict:
    """
    Main entry point for file verification
    
    Args:
        project_root: Project root path (defaults to auto-detect)
    
    Returns:
        Dict with verification results
    """
    if project_root is None:
        project_root = PROJECT_ROOT
    
    verifier = FileVerifier(project_root)
    return verifier.verify_all()


if __name__ == '__main__':
    results = verify_files()
    print(f"Verification results: {results}")


