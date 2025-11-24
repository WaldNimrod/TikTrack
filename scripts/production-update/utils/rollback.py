#!/usr/bin/env python3
"""
Rollback Manager
================

Manages rollback functionality for the production update process.
"""

import json
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List

# Import logger and reporter - handle both relative and absolute imports
try:
    from .logger import get_logger
    from .reporter import get_reporter
except ImportError:
    # Fallback for direct execution
    from logger import get_logger
    from reporter import get_reporter


class RollbackManager:
    """Manages rollback operations"""
    
    def __init__(self, snapshot_dir: Optional[Path] = None):
        self.snapshot_dir = snapshot_dir or Path("_Tmp/production-update-snapshots")
        self.snapshot_dir.mkdir(parents=True, exist_ok=True)
        self.logger = get_logger()
        self.reporter = get_reporter()
        self.current_snapshot: Optional[str] = None
    
    def create_snapshot(self, label: str = "pre-update") -> str:
        """
        Create snapshot before update
        
        Returns:
            Snapshot ID
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        snapshot_id = f"{label}_{timestamp}"
        snapshot_path = self.snapshot_dir / snapshot_id
        snapshot_path.mkdir(parents=True, exist_ok=True)
        
        snapshot_info = {
            'id': snapshot_id,
            'label': label,
            'timestamp': datetime.now().isoformat(),
            'files': {}
        }
        
        # Save current git state
        try:
            result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                capture_output=True,
                text=True,
                check=True
            )
            snapshot_info['git_commit'] = result.stdout.strip()
        except Exception as e:
            self.logger.warning(f"Could not get git commit: {e}")
        
        # Save production config files
        config_backup = snapshot_path / "config"
        config_backup.mkdir(exist_ok=True)
        
        production_config = Path("production/Backend/config")
        if production_config.exists():
            shutil.copytree(production_config, config_backup / "config", dirs_exist_ok=True)
            snapshot_info['files']['config'] = str(config_backup / "config")
        
        # Note: System uses PostgreSQL - database backups are handled via PostgreSQL tools
        # No file-based DB backup tracking needed
        
        # Save snapshot info
        info_file = snapshot_path / "snapshot_info.json"
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump(snapshot_info, f, indent=2, ensure_ascii=False)
        
        self.current_snapshot = snapshot_id
        self.logger.info(f"📸 Created snapshot: {snapshot_id}")
        
        return snapshot_id
    
    def rollback(self, snapshot_id: Optional[str] = None) -> bool:
        """
        Rollback to a snapshot
        
        Args:
            snapshot_id: Snapshot ID to rollback to (uses current if None)
        """
        if snapshot_id is None:
            snapshot_id = self.current_snapshot
        
        if snapshot_id is None:
            self.logger.error("No snapshot ID provided and no current snapshot")
            return False
        
        snapshot_path = self.snapshot_dir / snapshot_id
        if not snapshot_path.exists():
            self.logger.error(f"Snapshot not found: {snapshot_id}")
            return False
        
        info_file = snapshot_path / "snapshot_info.json"
        if not info_file.exists():
            self.logger.error(f"Snapshot info not found: {snapshot_id}")
            return False
        
        with open(info_file, 'r', encoding='utf-8') as f:
            snapshot_info = json.load(f)
        
        self.logger.info(f"🔄 Rolling back to snapshot: {snapshot_id}")
        
        # Restore config files
        if 'config' in snapshot_info.get('files', {}):
            config_backup = Path(snapshot_info['files']['config'])
            if config_backup.exists():
                production_config = Path("production/Backend/config")
                if production_config.exists():
                    shutil.rmtree(production_config)
                shutil.copytree(config_backup, production_config)
                self.logger.info("  ✅ Restored config files")
        
        # Note: System uses PostgreSQL - database restore is handled via PostgreSQL tools
        # No file-based DB restore needed
        
        # Restore git state (if commit saved)
        if 'git_commit' in snapshot_info:
            try:
                subprocess.run(
                    ['git', 'reset', '--hard', snapshot_info['git_commit']],
                    check=True
                )
                self.logger.info(f"  ✅ Restored git state to {snapshot_info['git_commit']}")
            except Exception as e:
                self.logger.warning(f"  ⚠️  Could not restore git state: {e}")
        
        self.logger.info(f"✅ Rollback completed: {snapshot_id}")
        return True
    
    def list_snapshots(self) -> List[Dict]:
        """List all available snapshots"""
        snapshots = []
        for snapshot_dir in self.snapshot_dir.iterdir():
            if snapshot_dir.is_dir():
                info_file = snapshot_dir / "snapshot_info.json"
                if info_file.exists():
                    with open(info_file, 'r', encoding='utf-8') as f:
                        snapshots.append(json.load(f))
        return sorted(snapshots, key=lambda x: x['timestamp'], reverse=True)

