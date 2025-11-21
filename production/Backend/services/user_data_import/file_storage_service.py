"""
File Storage Service - Manages import file storage outside database

This service handles file storage operations for import sessions,
keeping large file contents out of the database for better performance.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-27
"""

import os
import json
import hashlib
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class FileStorageService:
    """
    Manages file storage for import sessions.
    
    This service handles:
    - File storage outside database
    - File metadata management
    - File deduplication using hashes
    - Cleanup of old files
    - File integrity verification
    """
    
    def __init__(self, base_dir: str = "Backend/data/import_files"):
        """
        Initialize the file storage service.
        
        Args:
            base_dir: Base directory for storing import files
        """
        self.base_dir = Path(base_dir)
        self.ensure_base_directory()
    
    def ensure_base_directory(self) -> None:
        """Ensure the base directory exists"""
        try:
            self.base_dir.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Ensured base directory exists: {self.base_dir}")
        except Exception as e:
            logger.error(f"Failed to create base directory {self.base_dir}: {str(e)}")
            raise
    
    def get_session_dir(self, session_id: int, user_id: int = 1) -> Path:
        """
        Get the directory path for a specific session.
        
        Args:
            session_id: Import session ID
            user_id: User ID (defaults to 1 for single-user system)
            
        Returns:
            Path to session directory
        """
        user_dir = self.base_dir / f"user_{user_id}"
        session_dir = user_dir / f"session_{session_id}"
        return session_dir
    
    def save_file(self, session_id: int, file_content: str, filename: str,
                  user_id: int = 1) -> Dict[str, Any]:
        """
        Save file content to storage.
        
        Args:
            session_id: Import session ID
            file_content: File content as string
            filename: Original filename
            user_id: User ID (defaults to 1)
            
        Returns:
            Dict with save results including file path and metadata
        """
        try:
            # Get session directory
            session_dir = self.get_session_dir(session_id, user_id)
            session_dir.mkdir(parents=True, exist_ok=True)
            
            # Calculate file hash for deduplication
            file_hash = hashlib.sha256(file_content.encode('utf-8')).hexdigest()
            file_size = len(file_content.encode('utf-8'))
            
            # Save original file
            original_file_path = session_dir / "original.csv"
            with open(original_file_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            
            # Save metadata
            metadata = {
                'session_id': session_id,
                'user_id': user_id,
                'original_filename': filename,
                'file_size': file_size,
                'file_hash': file_hash,
                'saved_at': datetime.now().isoformat(),
                'file_path': str(original_file_path.relative_to(self.base_dir))
            }
            
            metadata_path = session_dir / "metadata.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Saved file for session {session_id}: {file_size} bytes, hash: {file_hash[:16]}...")
            
            return {
                'success': True,
                'file_path': str(original_file_path),
                'metadata_path': str(metadata_path),
                'file_size': file_size,
                'file_hash': file_hash,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to save file for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_file(self, session_id: int, user_id: int = 1) -> Optional[str]:
        """
        Get file content from storage.
        
        Args:
            session_id: Import session ID
            user_id: User ID (defaults to 1)
            
        Returns:
            File content as string or None if not found
        """
        try:
            session_dir = self.get_session_dir(session_id, user_id)
            file_path = session_dir / "original.csv"
            
            if not file_path.exists():
                logger.warning(f"File not found for session {session_id}")
                return None
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Get metadata
            metadata = self.get_file_metadata(session_id, user_id)
            
            logger.debug(f"Retrieved file for session {session_id}: {len(content)} characters")
            return {
                'success': True,
                'content': content,
                'filename': metadata.get('original_filename', 'original.csv') if metadata else 'original.csv'
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get file for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_file_metadata(self, session_id: int, user_id: int = 1) -> Optional[Dict[str, Any]]:
        """
        Get file metadata from storage.
        
        Args:
            session_id: Import session ID
            user_id: User ID (defaults to 1)
            
        Returns:
            File metadata dictionary or None if not found
        """
        try:
            session_dir = self.get_session_dir(session_id, user_id)
            metadata_path = session_dir / "metadata.json"
            
            if not metadata_path.exists():
                logger.warning(f"Metadata not found for session {session_id}")
                return None
            
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            return metadata
            
        except Exception as e:
            logger.error(f"❌ Failed to get metadata for session {session_id}: {str(e)}")
            return None
    
    def delete_file(self, session_id: int, user_id: int = 1) -> bool:
        """
        Delete file and metadata from storage.
        
        Args:
            session_id: Import session ID
            user_id: User ID (defaults to 1)
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            session_dir = self.get_session_dir(session_id, user_id)
            
            if not session_dir.exists():
                logger.warning(f"Session directory not found: {session_dir}")
                return True  # Already deleted
            
            # Delete files
            files_deleted = 0
            for file_path in session_dir.iterdir():
                try:
                    file_path.unlink()
                    files_deleted += 1
                except Exception as e:
                    logger.warning(f"Failed to delete {file_path}: {str(e)}")
            
            # Delete directory
            try:
                session_dir.rmdir()
            except OSError:
                logger.warning(f"Directory not empty, could not remove: {session_dir}")
            
            logger.info(f"✅ Deleted {files_deleted} files for session {session_id}")
            return {
                'success': True,
                'message': f'Deleted {files_deleted} files successfully'
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to delete files for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_file_integrity(self, session_id: int, user_id: int = 1) -> Dict[str, Any]:
        """
        Verify file integrity using hash.
        
        Args:
            session_id: Import session ID
            user_id: User ID (defaults to 1)
            
        Returns:
            Dict with verification results
        """
        try:
            # Get file content
            file_content = self.get_file(session_id, user_id)
            if not file_content:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            # Get metadata
            metadata = self.get_file_metadata(session_id, user_id)
            if not metadata:
                return {
                    'success': False,
                    'error': 'Metadata not found'
                }
            
            # Calculate current hash
            current_hash = hashlib.sha256(file_content.encode('utf-8')).hexdigest()
            stored_hash = metadata.get('file_hash')
            
            # Verify integrity
            is_valid = current_hash == stored_hash
            
            result = {
                'success': True,
                'is_valid': is_valid,
                'current_hash': current_hash,
                'stored_hash': stored_hash,
                'file_size': len(file_content.encode('utf-8')),
                'expected_size': metadata.get('file_size')
            }
            
            if not is_valid:
                logger.warning(f"File integrity check failed for session {session_id}")
                result['error'] = 'Hash mismatch - file may be corrupted'
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to verify file integrity for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def find_duplicate_files(self, file_hash: str) -> List[Dict[str, Any]]:
        """
        Find files with the same hash (duplicates).
        
        Args:
            file_hash: Hash to search for
            
        Returns:
            List of duplicate file information
        """
        try:
            duplicates = []
            
            # Search through all user directories
            for user_dir in self.base_dir.iterdir():
                if not user_dir.is_dir() or not user_dir.name.startswith('user_'):
                    continue
                
                # Search through session directories
                for session_dir in user_dir.iterdir():
                    if not session_dir.is_dir() or not session_dir.name.startswith('session_'):
                        continue
                    
                    metadata_path = session_dir / "metadata.json"
                    if metadata_path.exists():
                        try:
                            with open(metadata_path, 'r', encoding='utf-8') as f:
                                metadata = json.load(f)
                            
                            if metadata.get('file_hash') == file_hash:
                                duplicates.append({
                                    'session_id': metadata.get('session_id'),
                                    'user_id': metadata.get('user_id'),
                                    'filename': metadata.get('original_filename'),
                                    'file_size': metadata.get('file_size'),
                                    'saved_at': metadata.get('saved_at'),
                                    'file_path': str(session_dir)
                                })
                        except Exception as e:
                            logger.debug(f"Failed to read metadata {metadata_path}: {str(e)}")
            
            logger.info(f"Found {len(duplicates)} duplicate files for hash {file_hash[:16]}...")
            return duplicates
            
        except Exception as e:
            logger.error(f"❌ Failed to find duplicate files: {str(e)}")
            return []
    
    def cleanup_old_files(self, days: int = 30) -> int:
        """
        Clean up old files and directories.
        
        Args:
            days: Number of days to keep files
            
        Returns:
            Number of files cleaned up
        """
        try:
            cutoff_time = datetime.now().timestamp() - (days * 24 * 60 * 60)
            cleaned_count = 0
            
            # Search through all user directories
            for user_dir in self.base_dir.iterdir():
                if not user_dir.is_dir() or not user_dir.name.startswith('user_'):
                    continue
                
                # Search through session directories
                for session_dir in user_dir.iterdir():
                    if not session_dir.is_dir() or not session_dir.name.startswith('session_'):
                        continue
                    
                    # Check if directory is old
                    if session_dir.stat().st_mtime < cutoff_time:
                        try:
                            # Count files before deletion
                            file_count = len(list(session_dir.iterdir()))
                            
                            # Delete directory and contents
                            for file_path in session_dir.iterdir():
                                file_path.unlink()
                            session_dir.rmdir()
                            
                            cleaned_count += file_count
                            logger.debug(f"Cleaned up old session directory: {session_dir}")
                            
                        except Exception as e:
                            logger.warning(f"Failed to clean up {session_dir}: {str(e)}")
            
            logger.info(f"✅ Cleaned up {cleaned_count} old files")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"❌ Failed to cleanup old files: {str(e)}")
            return 0
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """
        Get storage statistics.
        
        Returns:
            Dictionary with storage statistics
        """
        try:
            total_files = 0
            total_size = 0
            user_counts = {}
            session_counts = {}
            
            # Search through all directories
            for user_dir in self.base_dir.iterdir():
                if not user_dir.is_dir() or not user_dir.name.startswith('user_'):
                    continue
                
                user_id = user_dir.name
                user_counts[user_id] = 0
                
                for session_dir in user_dir.iterdir():
                    if not session_dir.is_dir() or not session_dir.name.startswith('session_'):
                        continue
                    
                    user_counts[user_id] += 1
                    session_counts[session_dir.name] = 0
                    
                    for file_path in session_dir.iterdir():
                        if file_path.is_file():
                            total_files += 1
                            total_size += file_path.stat().st_size
                            session_counts[session_dir.name] += 1
            
            return {
                'total_files': total_files,
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'user_counts': user_counts,
                'session_counts': session_counts,
                'base_directory': str(self.base_dir)
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get storage stats: {str(e)}")
            return {
                'total_files': 0,
                'total_size_bytes': 0,
                'total_size_mb': 0,
                'user_counts': {},
                'session_counts': {},
                'base_directory': str(self.base_dir)
            }
