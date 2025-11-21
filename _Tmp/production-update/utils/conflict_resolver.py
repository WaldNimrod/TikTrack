#!/usr/bin/env python3
"""
Conflict Resolver
=================

Automatically resolves Git merge conflicts according to predefined rules.
"""

import subprocess
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Import logger and reporter - handle both relative and absolute imports
try:
    from .logger import get_logger
    from .reporter import get_reporter
except ImportError:
    # Fallback for direct execution
    from logger import get_logger
    from reporter import get_reporter


class ConflictResolver:
    """Resolves Git merge conflicts automatically"""
    
    # Files that should always keep production version
    PRODUCTION_FILES = [
        'production/Backend/config/settings.py',
        'production/Backend/config/logging.py',
        'production/Backend/config/database.py',
    ]
    
    # Patterns that should keep production version
    PRODUCTION_PATTERNS = [
        'production/Backend/config/',
    ]
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
        self.reporter = get_reporter()
    
    def detect_conflicts(self) -> List[str]:
        """Detect files with merge conflicts"""
        try:
            result = subprocess.run(
                ['git', 'diff', '--check', '--name-only'],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                check=False
            )
            
            # Check for unmerged files
            result2 = subprocess.run(
                ['git', 'ls-files', '-u'],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                check=False
            )
            
            conflicts = []
            if result2.returncode == 0 and result2.stdout.strip():
                # Parse unmerged files
                for line in result2.stdout.strip().split('\n'):
                    if line:
                        parts = line.split()
                        if len(parts) >= 4:
                            conflicts.append(parts[3])
            
            return list(set(conflicts))
        except Exception as e:
            self.logger.error(f"Error detecting conflicts: {e}")
            return []
    
    def resolve_conflict(self, file_path: str, strategy: str = 'auto') -> bool:
        """
        Resolve conflict for a single file
        
        Args:
            file_path: Path to conflicted file
            strategy: 'theirs' (main wins), 'ours' (production wins), 'auto' (smart)
        """
        try:
            # Determine resolution strategy
            if strategy == 'auto':
                strategy = self._determine_strategy(file_path)
            
            if strategy == 'ours':
                # Keep production version
                subprocess.run(
                    ['git', 'checkout', '--ours', file_path],
                    cwd=self.project_root,
                    check=True
                )
                self.logger.info(f"  ✅ Resolved {file_path} (keeping production version)")
                return True
            elif strategy == 'theirs':
                # Keep main version
                subprocess.run(
                    ['git', 'checkout', '--theirs', file_path],
                    cwd=self.project_root,
                    check=True
                )
                self.logger.info(f"  ✅ Resolved {file_path} (keeping main version)")
                return True
            else:
                self.logger.warning(f"  ⚠️  Unknown strategy for {file_path}, requires manual resolution")
                return False
        except Exception as e:
            self.logger.error(f"  ❌ Error resolving {file_path}: {e}")
            return False
    
    def _determine_strategy(self, file_path: str) -> str:
        """Determine resolution strategy for a file"""
        # Production config files - keep production
        if any(file_path.startswith(pattern) for pattern in self.PRODUCTION_PATTERNS):
            return 'ours'
        
        if file_path in self.PRODUCTION_FILES:
            return 'ours'
        
        # Default: main wins
        return 'theirs'
    
    def resolve_all(self) -> Tuple[int, int]:
        """
        Resolve all conflicts automatically
        
        Returns:
            Tuple of (resolved_count, unresolved_count)
        """
        conflicts = self.detect_conflicts()
        
        if not conflicts:
            self.logger.info("✅ No conflicts detected")
            return 0, 0
        
        self.logger.info(f"🔍 Found {len(conflicts)} conflicted files")
        
        resolved = 0
        unresolved = 0
        
        for conflict_file in conflicts:
            strategy = self._determine_strategy(conflict_file)
            if self.resolve_conflict(conflict_file, strategy):
                resolved += 1
                self.reporter.add_file_updated(conflict_file, {'action': 'conflict_resolved'})
            else:
                unresolved += 1
                self.reporter.add_warning(f"Conflict requires manual resolution: {conflict_file}", "merge")
        
        # Stage resolved files
        if resolved > 0:
            try:
                subprocess.run(
                    ['git', 'add'] + [c for c in conflicts if self._determine_strategy(c) in ['ours', 'theirs']],
                    cwd=self.project_root,
                    check=True
                )
            except Exception as e:
                self.logger.warning(f"Warning: Could not stage resolved files: {e}")
        
        return resolved, unresolved
    
    def requires_manual_resolution(self) -> List[str]:
        """Get list of files that require manual resolution"""
        conflicts = self.detect_conflicts()
        return [c for c in conflicts if self._determine_strategy(c) not in ['ours', 'theirs']]

