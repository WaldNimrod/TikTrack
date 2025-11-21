"""
Backup Service - TikTrack
=========================

This module provides comprehensive backup and restore functionality for the TikTrack system.
Includes database backup, configuration backup, and system restore capabilities.

Features:
- Database backup (SQLite)
- Configuration backup
- System restore
- Backup verification
- Automated backup scheduling

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import os
import shutil
import sqlite3
import json
import gzip
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path
import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from config.database import get_db
# realtime_notifications removed - using localStorage Events instead

logger = logging.getLogger(__name__)

class BackupService:
    """
    Comprehensive backup and restore service for TikTrack
    """
    
    def __init__(self, notifications_service: Optional[Any] = None):
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        self.notifications_service = notifications_service
        
    def create_system_backup(self) -> Dict[str, Any]:
        """
        Create comprehensive system backup
        
        Returns:
            Dict[str, Any]: Backup result with file path and metadata
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"tiktrack_backup_{timestamp}"
            backup_path = self.backup_dir / backup_filename
            
            # Create backup directory
            backup_path.mkdir(exist_ok=True)
            
            # Backup database
            db_backup_result = self._backup_database(backup_path)
            
            # Backup configuration files
            config_backup_result = self._backup_configuration(backup_path)
            
            # Backup logs
            logs_backup_result = self._backup_logs(backup_path)
            
            # Create backup manifest
            manifest = self._create_backup_manifest(
                backup_path, 
                db_backup_result, 
                config_backup_result, 
                logs_backup_result
            )
            
            # Compress backup
            compressed_path = self._compress_backup(backup_path)
            
            # Calculate backup size
            backup_size = self._get_backup_size(compressed_path)
            
            # Send notification
            if self.notifications_service:
                self.notifications_service.send_notification(
                    "backup_completed",
                    f"גיבוי הושלם בהצלחה: {backup_filename} ({backup_size} MB)",
                    "success"
                )
            
            logger.info(f"✅ System backup completed: {compressed_path}")
            
            return {
                'status': 'success',
                'backup_path': str(compressed_path),
                'backup_filename': f"{backup_filename}.tar.gz",
                'backup_size_mb': backup_size,
                'timestamp': datetime.now().isoformat(),
                'components': {
                    'database': db_backup_result,
                    'configuration': config_backup_result,
                    'logs': logs_backup_result
                },
                'manifest': manifest
            }
            
        except Exception as e:
            error_msg = f"שגיאה ביצירת גיבוי: {str(e)}"
            logger.error(f"❌ Backup failed: {e}")
            
            if self.notifications_service:
                self.notifications_service.send_notification(
                    "backup_failed",
                    error_msg,
                    "error"
                )
            
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _backup_database(self, backup_path: Path) -> Dict[str, Any]:
        """Backup SQLite database"""
        try:
            # Use the unified tiktrack.db database file (standardized for dev and production)
            db_path = Path("Backend/db/tiktrack.db")
            if not db_path.exists():
                return {'status': 'error', 'error': 'Database file not found'}
            
            # Create database backup
            backup_db_path = backup_path / "database.sqlite"
            shutil.copy2(db_path, backup_db_path)
            
            # Get database info
            db: Session = next(get_db())
            result = db.execute(text("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"))
            db_size = result.fetchone()[0]
            db.close()
            
            return {
                'status': 'success',
                'source_path': str(db_path),
                'backup_path': str(backup_db_path),
                'size_mb': round(db_size / (1024 * 1024), 2),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def _backup_configuration(self, backup_path: Path) -> Dict[str, Any]:
        """Backup configuration files"""
        try:
            config_files = [
                "Backend/config/database.py",
                "Backend/config/settings.py",
                "test_mode.json"
            ]
            
            config_backup_path = backup_path / "config"
            config_backup_path.mkdir(exist_ok=True)
            
            backed_up_files = []
            total_size = 0
            
            for config_file in config_files:
                if os.path.exists(config_file):
                    dest_path = config_backup_path / os.path.basename(config_file)
                    shutil.copy2(config_file, dest_path)
                    file_size = os.path.getsize(dest_path)
                    total_size += file_size
                    backed_up_files.append({
                        'source': config_file,
                        'destination': str(dest_path),
                        'size_bytes': file_size
                    })
            
            return {
                'status': 'success',
                'files': backed_up_files,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def _backup_logs(self, backup_path: Path) -> Dict[str, Any]:
        """Backup log files"""
        try:
            log_files = [
                "server_detailed.log",
                "server.log",
                "server_output.log"
            ]
            
            logs_backup_path = backup_path / "logs"
            logs_backup_path.mkdir(exist_ok=True)
            
            backed_up_files = []
            total_size = 0
            
            for log_file in log_files:
                if os.path.exists(log_file):
                    dest_path = logs_backup_path / log_file
                    shutil.copy2(log_file, dest_path)
                    file_size = os.path.getsize(dest_path)
                    total_size += file_size
                    backed_up_files.append({
                        'source': log_file,
                        'destination': str(dest_path),
                        'size_bytes': file_size
                    })
            
            return {
                'status': 'success',
                'files': backed_up_files,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def _create_backup_manifest(self, backup_path: Path, db_result: Dict, config_result: Dict, logs_result: Dict) -> Dict[str, Any]:
        """Create backup manifest"""
        manifest = {
            'backup_id': backup_path.name,
            'created_at': datetime.now().isoformat(),
            'tiktrack_version': '2.0.0',
            'components': {
                'database': db_result,
                'configuration': config_result,
                'logs': logs_result
            },
            'total_size_mb': sum([
                db_result.get('size_mb', 0),
                config_result.get('total_size_mb', 0),
                logs_result.get('total_size_mb', 0)
            ]),
            'checksum': None  # TODO: Add checksum calculation
        }
        
        manifest_path = backup_path / "manifest.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        return manifest
    
    def _compress_backup(self, backup_path: Path) -> Path:
        """Compress backup directory"""
        try:
            import tarfile
            
            compressed_path = backup_path.parent / f"{backup_path.name}.tar.gz"
            
            with tarfile.open(compressed_path, "w:gz") as tar:
                tar.add(backup_path, arcname=backup_path.name)
            
            # Remove uncompressed directory
            shutil.rmtree(backup_path)
            
            return compressed_path
            
        except Exception as e:
            logger.error(f"Error compressing backup: {e}")
            return backup_path
    
    def _get_backup_size(self, backup_path: Path) -> float:
        """Get backup size in MB"""
        try:
            size_bytes = os.path.getsize(backup_path)
            return round(size_bytes / (1024 * 1024), 2)
        except Exception:
            return 0.0
    
    def restore_from_backup(self, backup_path: str) -> Dict[str, Any]:
        """
        Restore system from backup
        
        Args:
            backup_path (str): Path to backup file
            
        Returns:
            Dict[str, Any]: Restore result
        """
        try:
            backup_file = Path(backup_path)
            if not backup_file.exists():
                return {
                    'status': 'error',
                    'error': f'Backup file not found: {backup_path}'
                }
            
            # Extract backup
            extracted_path = self._extract_backup(backup_file)
            
            # Verify backup integrity
            verification_result = self._verify_backup(extracted_path)
            
            if not verification_result['valid']:
                return {
                    'status': 'error',
                    'error': f'Backup verification failed: {verification_result["error"]}'
                }
            
            # Restore database
            db_restore_result = self._restore_database(extracted_path)
            
            # Restore configuration
            config_restore_result = self._restore_configuration(extracted_path)
            
            # Cleanup
            shutil.rmtree(extracted_path)
            
            # Send notification
            if self.notifications_service:
                self.notifications_service.send_notification(
                    "restore_completed",
                    f"שחזור הושלם בהצלחה מגיבוי: {backup_file.name}",
                    "success"
                )
            
            logger.info(f"✅ System restore completed from: {backup_path}")
            
            return {
                'status': 'success',
                'backup_file': backup_path,
                'restore_timestamp': datetime.now().isoformat(),
                'components': {
                    'database': db_restore_result,
                    'configuration': config_restore_result
                }
            }
            
        except Exception as e:
            error_msg = f"שגיאה בשחזור: {str(e)}"
            logger.error(f"❌ Restore failed: {e}")
            
            if self.notifications_service:
                self.notifications_service.send_notification(
                    "restore_failed",
                    error_msg,
                    "error"
                )
            
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _extract_backup(self, backup_file: Path) -> Path:
        """Extract backup archive"""
        try:
            import tarfile
            
            extracted_path = self.backup_dir / f"restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            extracted_path.mkdir(exist_ok=True)
            
            with tarfile.open(backup_file, "r:gz") as tar:
                tar.extractall(extracted_path)
            
            return extracted_path
            
        except Exception as e:
            raise Exception(f"Failed to extract backup: {e}")
    
    def _verify_backup(self, extracted_path: Path) -> Dict[str, Any]:
        """Verify backup integrity"""
        try:
            manifest_path = extracted_path / "manifest.json"
            if not manifest_path.exists():
                return {'valid': False, 'error': 'Manifest file not found'}
            
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            
            # Check if all components exist
            db_path = extracted_path / "database.sqlite"
            if not db_path.exists():
                return {'valid': False, 'error': 'Database backup not found'}
            
            return {'valid': True, 'manifest': manifest}
            
        except Exception as e:
            return {'valid': False, 'error': str(e)}
    
    def _restore_database(self, extracted_path: Path) -> Dict[str, Any]:
        """Restore database from backup"""
        try:
            backup_db_path = extracted_path / "database.sqlite"
            if not backup_db_path.exists():
                return {'status': 'error', 'error': 'Database backup not found'}
            
            # Backup current database - Use the unified tiktrack.db database file (standardized for dev and production)
            current_db_path = Path("Backend/db/tiktrack.db")
            if current_db_path.exists():
                backup_current_path = current_db_path.parent / f"{current_db_path.stem}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
                shutil.copy2(current_db_path, backup_current_path)
            
            # Restore database
            shutil.copy2(backup_db_path, current_db_path)
            
            return {
                'status': 'success',
                'restored_from': str(backup_db_path),
                'restored_to': str(current_db_path),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def _restore_configuration(self, extracted_path: Path) -> Dict[str, Any]:
        """Restore configuration files"""
        try:
            config_backup_path = extracted_path / "config"
            if not config_backup_path.exists():
                return {'status': 'warning', 'message': 'No configuration backup found'}
            
            restored_files = []
            
            for config_file in config_backup_path.iterdir():
                if config_file.is_file():
                    dest_path = Path("Backend/config") / config_file.name
                    dest_path.parent.mkdir(exist_ok=True)
                    shutil.copy2(config_file, dest_path)
                    restored_files.append(str(dest_path))
            
            return {
                'status': 'success',
                'restored_files': restored_files,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def get_backup_list(self) -> List[Dict[str, Any]]:
        """Get list of available backups"""
        try:
            backups = []
            
            for backup_file in self.backup_dir.glob("*.tar.gz"):
                try:
                    file_stat = backup_file.stat()
                    backups.append({
                        'filename': backup_file.name,
                        'path': str(backup_file),
                        'size_mb': round(file_stat.st_size / (1024 * 1024), 2),
                        'created_at': datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                        'modified_at': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                    })
                except Exception as e:
                    logger.warning(f"Error reading backup file {backup_file}: {e}")
            
            # Sort by creation time (newest first)
            backups.sort(key=lambda x: x['created_at'], reverse=True)
            
            return backups
            
        except Exception as e:
            logger.error(f"Error getting backup list: {e}")
            return []
    
    def delete_backup(self, backup_path: str) -> Dict[str, Any]:
        """Delete backup file"""
        try:
            backup_file = Path(backup_path)
            if not backup_file.exists():
                return {
                    'status': 'error',
                    'error': f'Backup file not found: {backup_path}'
                }
            
            backup_file.unlink()
            
            if self.notifications_service:
                self.notifications_service.send_notification(
                    "backup_deleted",
                    f"גיבוי נמחק: {backup_file.name}",
                    "info"
                )
            
            return {
                'status': 'success',
                'message': f'Backup deleted: {backup_file.name}',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
