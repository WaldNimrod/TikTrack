#!/usr/bin/env python3
"""
Smart Sync Utility
==================

Intelligent file synchronization that ensures ALL files are properly updated.
Uses checksums and modification times to detect and update changed files.
"""

import hashlib
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from logger import get_logger
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger


class SmartSync:
    """Smart file synchronization with verification"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
    
    def calculate_checksum(self, file_path: Path) -> str:
        """Calculate MD5 checksum of a file"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def should_update_file(self, source: Path, target: Path) -> Tuple[bool, str]:
        """
        Determine if file should be updated
        
        Returns:
            (should_update, reason)
        """
        if not source.exists():
            return False, "source doesn't exist"
        
        if not target.exists():
            return True, "target doesn't exist"
        
        # Check modification time
        source_mtime = source.stat().st_mtime
        target_mtime = target.stat().st_mtime
        
        if source_mtime > target_mtime:
            return True, f"source is newer ({source_mtime} > {target_mtime})"
        
        # Even if mtime is same, check checksum to be sure
        try:
            source_checksum = self.calculate_checksum(source)
            target_checksum = self.calculate_checksum(target)
            
            if source_checksum != target_checksum:
                return True, f"checksum differs ({source_checksum[:8]} != {target_checksum[:8]})"
        except Exception as e:
            # If checksum fails, update anyway to be safe
            return True, f"checksum check failed: {e}"
        
        return False, "files are identical"
    
    def sync_file(self, source: Path, target: Path, force: bool = False) -> bool:
        """Sync a single file"""
        if not source.exists():
            return False
        
        should_update, reason = self.should_update_file(source, target)
        
        if not should_update and not force:
            return True  # Already up to date
        
        try:
            # Ensure target directory exists
            target.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            shutil.copy2(source, target)
            
            if should_update:
                self.logger.info(f"  ✅ Updated: {target.relative_to(self.project_root)} ({reason})")
            else:
                self.logger.info(f"  ✅ Copied: {target.relative_to(self.project_root)}")
            
            return True
        except Exception as e:
            self.logger.error(f"  ❌ Failed to sync {source}: {e}")
            return False
    
    def sync_directory(self, source: Path, target: Path, 
                      ignore_patterns: List[str] = None,
                      force: bool = False) -> Dict[str, int]:
        """
        Sync entire directory with smart updates
        
        Returns:
            Dict with counts: {'copied': X, 'updated': Y, 'skipped': Z, 'failed': W}
        """
        if ignore_patterns is None:
            ignore_patterns = ['node_modules', '.git', '__pycache__', '*.pyc', '.DS_Store', 'coverage', '*.log']
        
        stats = {'copied': 0, 'updated': 0, 'skipped': 0, 'failed': 0}
        
        if not source.exists():
            self.logger.warning(f"  ⚠️  Source directory not found: {source}")
            return stats
        
        # Create target directory
        target.mkdir(parents=True, exist_ok=True)
        
        # Walk through source directory
        for item in source.rglob('*'):
            # Skip ignored patterns
            if any(pattern in str(item) for pattern in ignore_patterns):
                continue
            
            if item.is_file():
                relative_path = item.relative_to(source)
                target_file = target / relative_path
                
                should_update, reason = self.should_update_file(item, target_file)
                
                if self.sync_file(item, target_file, force=force):
                    if should_update:
                        stats['updated'] += 1
                    else:
                        stats['copied'] += 1
                else:
                    stats['failed'] += 1
            elif item.is_dir():
                # Ensure directory exists
                relative_path = item.relative_to(source)
                target_dir = target / relative_path
                target_dir.mkdir(parents=True, exist_ok=True)
        
        return stats
    
    def verify_sync(self, source: Path, target: Path, 
                   ignore_patterns: List[str] = None) -> Dict[str, List[str]]:
        """
        Verify that sync was successful
        
        Returns:
            Dict with lists: {'missing': [], 'different': [], 'extra': []}
        """
        if ignore_patterns is None:
            ignore_patterns = ['node_modules', '.git', '__pycache__', '*.pyc', '.DS_Store', 'coverage', '*.log']
        
        results = {'missing': [], 'different': [], 'extra': []}
        
        if not source.exists():
            return results
        
        # Check all source files
        for item in source.rglob('*'):
            if any(pattern in str(item) for pattern in ignore_patterns):
                continue
            
            if item.is_file():
                relative_path = item.relative_to(source)
                target_file = target / relative_path
                
                if not target_file.exists():
                    results['missing'].append(str(relative_path))
                else:
                    # Verify checksum
                    try:
                        source_checksum = self.calculate_checksum(item)
                        target_checksum = self.calculate_checksum(target_file)
                        
                        if source_checksum != target_checksum:
                            results['different'].append(str(relative_path))
                    except Exception:
                        # If checksum fails, assume different
                        results['different'].append(str(relative_path))
        
        # Check for extra files in target
        if target.exists():
            for item in target.rglob('*'):
                if any(pattern in str(item) for pattern in ignore_patterns):
                    continue
                
                if item.is_file():
                    relative_path = item.relative_to(target)
                    source_file = source / relative_path
                    
                    if not source_file.exists():
                        results['extra'].append(str(relative_path))
        
        return results


def smart_sync_ui(source_ui: Path, target_ui: Path, force: bool = False) -> bool:
    """Smart sync UI directory"""
    syncer = SmartSync(source_ui.parent)
    
    # Remove target if exists (clean sync)
    if target_ui.exists():
        syncer.logger.info("  🗑️  Removing existing production UI...")
        shutil.rmtree(target_ui)
    
    syncer.logger.info("  📁 Copying UI files with smart sync...")
    
    stats = syncer.sync_directory(
        source_ui,
        target_ui,
        ignore_patterns=['node_modules', '.git', '__pycache__', '*.pyc', '.DS_Store', 'coverage', '*.log'],
        force=force
    )
    
    syncer.logger.info(f"  ✅ Copied: {stats['copied']}, Updated: {stats['updated']}, Skipped: {stats['skipped']}, Failed: {stats['failed']}")
    
    # Verify sync
    syncer.logger.info("  🔍 Verifying sync...")
    verification = syncer.verify_sync(source_ui, target_ui)
    
    if verification['missing']:
        syncer.logger.warning(f"  ⚠️  {len(verification['missing'])} files missing in target")
    if verification['different']:
        syncer.logger.warning(f"  ⚠️  {len(verification['different'])} files differ from source")
    
    if not verification['missing'] and not verification['different']:
        syncer.logger.info("  ✅ Sync verification passed")
        return True
    else:
        syncer.logger.warning("  ⚠️  Sync verification found issues")
        return False


if __name__ == '__main__':
    project_root = PROJECT_ROOT
    source_ui = project_root / "trading-ui"
    target_ui = project_root / "production" / "trading-ui"
    
    success = smart_sync_ui(source_ui, target_ui, force=True)
    sys.exit(0 if success else 1)

