#!/usr/bin/env python3
"""
User Service - Complete User Management
Date: January 5, 2025
Description: Complete user service for managing users and their preferences
"""

import sqlite3
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from pathlib import Path

from config.settings import DB_PATH as CONFIG_DB_PATH

# Import preferences service
from .preferences_service import PreferencesService

logger = logging.getLogger(__name__)

class UserService:
    """
    Complete user service for managing users and their preferences
    
    This service provides functionality to:
    - Manage user accounts (CRUD operations)
    - Handle user preferences through the new preferences system
    - Get user information and statistics
    - Manage user sessions and authentication (future)
    """
    
    def __init__(self, db_path: str = None):
        """Initialize the user service"""
        if db_path is None:
            db_path = str(Path(CONFIG_DB_PATH))

        self.db_path = db_path
        self.preferences_service = PreferencesService(db_path)
        logger.info(f"UserService initialized with database: {db_path}")
    
    def get_db_connection(self) -> sqlite3.Connection:
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            Dict with user information or None if not found
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, 
                       is_active, is_default, created_at, updated_at
                FROM users 
                WHERE id = ?
            """, (user_id,))
            
            row = cursor.fetchone()
            if row:
                user = {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'first_name': row[3],
                    'last_name': row[4],
                    'is_active': bool(row[5]),
                    'is_default': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8],
                    'full_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1],
                    'display_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1]
                }
                logger.info(f"Retrieved user {user_id}: {user['username']}")
                return user
            else:
                logger.warning(f"User {user_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
        finally:
            conn.close()
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Get user by username
        
        Args:
            username: Username
            
        Returns:
            Dict with user information or None if not found
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, 
                       is_active, is_default, created_at, updated_at
                FROM users 
                WHERE username = ?
            """, (username,))
            
            row = cursor.fetchone()
            if row:
                user = {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'first_name': row[3],
                    'last_name': row[4],
                    'is_active': bool(row[5]),
                    'is_default': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8],
                    'full_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1],
                    'display_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1]
                }
                logger.info(f"Retrieved user by username {username}: {user['id']}")
                return user
            else:
                logger.warning(f"User with username {username} not found")
                return None
            
        except Exception as e:
            logger.error(f"Error getting user by username {username}: {e}")
            return None
        finally:
            conn.close()
    
    def get_default_user(self) -> Optional[Dict[str, Any]]:
        """
        Get the default user
        
        Returns:
            Dict with default user information or None if not found
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, 
                       is_active, is_default, created_at, updated_at
                FROM users 
                WHERE is_default = 1
                LIMIT 1
            """)
            
            row = cursor.fetchone()
            if row:
                user = {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'first_name': row[3],
                    'last_name': row[4],
                    'is_active': bool(row[5]),
                    'is_default': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8],
                    'full_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1],
                    'display_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1]
                }
                logger.info(f"Retrieved default user: {user['username']}")
                return user
            else:
                logger.warning("No default user found")
                return None
                
        except Exception as e:
            logger.error(f"Error getting default user: {e}")
            return None
        finally:
            conn.close()
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """
        Get all users
        
        Returns:
            List of user dictionaries
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, 
                       is_active, is_default, created_at, updated_at
                FROM users 
                ORDER BY is_default DESC, username ASC
            """)
            
            users = []
            for row in cursor.fetchall():
                user = {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'first_name': row[3],
                    'last_name': row[4],
                    'is_active': bool(row[5]),
                    'is_default': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8],
                    'full_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1],
                    'display_name': f"{row[3] or ''} {row[4] or ''}".strip() or row[1]
                }
                users.append(user)
            
            logger.info(f"Retrieved {len(users)} users")
            return users
            
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []
        finally:
            conn.close()
    
    def create_user(self, username: str, email: str = None, 
                   first_name: str = None, last_name: str = None,
                   is_default: bool = False) -> Optional[Dict[str, Any]]:
        """
        Create a new user
        
        Args:
            username: Username (required)
            email: Email address
            first_name: First name
            last_name: Last name
            is_default: Whether this is the default user
            
        Returns:
            Dict with created user information or None if failed
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Check if username already exists
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            if cursor.fetchone():
                logger.error(f"Username {username} already exists")
                return None
            
            # If this is the default user, unset other default users
            if is_default:
                cursor.execute("UPDATE users SET is_default = 0")
            
            # Create user
            cursor.execute("""
                INSERT INTO users (username, email, first_name, last_name, is_default, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (username, email, first_name, last_name, is_default, 
                  datetime.now().isoformat(), datetime.now().isoformat()))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Get the created user
            user = self.get_user_by_id(user_id)
            logger.info(f"Created user {user_id}: {username}")
            return user
            
        except Exception as e:
            logger.error(f"Error creating user {username}: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def update_user(self, user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Update user information
        
        Args:
            user_id: User ID
            **kwargs: Fields to update (username, email, first_name, last_name, is_active, is_default)
            
        Returns:
            Dict with updated user information or None if failed
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Build update query
            allowed_fields = ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_default']
            update_fields = []
            values = []
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    values.append(value)
            
            if not update_fields:
                logger.warning(f"No valid fields to update for user {user_id}")
                return self.get_user_by_id(user_id)
            
            # Add updated_at
            update_fields.append("updated_at = ?")
            values.append(datetime.now().isoformat())
            values.append(user_id)
            
            # Execute update
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                logger.warning(f"User {user_id} not found for update")
                return None
            
            # If setting as default, unset other default users
            if kwargs.get('is_default'):
                cursor.execute("UPDATE users SET is_default = 0 WHERE id != ?", (user_id,))
            
            conn.commit()
            
            # Get the updated user
            user = self.get_user_by_id(user_id)
            logger.info(f"Updated user {user_id}")
            return user
            
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def delete_user(self, user_id: int) -> bool:
        """
        Delete a user (soft delete by setting is_active = False)
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Don't allow deleting the default user
            cursor.execute("SELECT is_default FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                logger.warning(f"User {user_id} not found for deletion")
                return False
            
            if row[0]:  # is_default
                logger.error(f"Cannot delete default user {user_id}")
                return False
            
            # Soft delete by setting is_active = False
            cursor.execute("""
                UPDATE users 
                SET is_active = 0, updated_at = ?
                WHERE id = ?
            """, (datetime.now().isoformat(), user_id))
            
            conn.commit()
            logger.info(f"Soft deleted user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def get_user_preferences(self, user_id: int) -> Dict[str, Any]:
        """
        Get user preferences using the new preferences system
        
        Args:
            user_id: User ID
            
        Returns:
            Dict with user preferences
        """
        try:
            return self.preferences_service.get_all_user_preferences(user_id)
        except Exception as e:
            logger.error(f"Error getting preferences for user {user_id}: {e}")
            return {}
    
    def set_user_preferences(self, user_id: int, preferences: Dict[str, Any]) -> bool:
        """
        Set user preferences using the new preferences system
        
        Args:
            user_id: User ID
            preferences: Dict with preferences to set
            
        Returns:
            True if successful, False otherwise
        """
        try:
            return self.preferences_service.save_preferences(user_id, preferences)
        except Exception as e:
            logger.error(f"Error setting preferences for user {user_id}: {e}")
            return False
    
    def get_user_statistics(self, user_id: int) -> Dict[str, Any]:
        """
        Get user statistics
        
        Args:
            user_id: User ID
            
        Returns:
            Dict with user statistics
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return {}
            
            # Get preferences count
            preferences = self.get_user_preferences(user_id)
            
            # Get profiles count
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM preference_profiles WHERE user_id = ?", (user_id,))
            profiles_count = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'user_id': user_id,
                'username': user['username'],
                'display_name': user['display_name'],
                'is_default': user['is_default'],
                'is_active': user['is_active'],
                'preferences_count': len(preferences),
                'profiles_count': profiles_count,
                'created_at': user['created_at'],
                'updated_at': user['updated_at']
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics for user {user_id}: {e}")
            return {}
    
    @staticmethod
    def update_user_preferences(user_id: int, preferences: Dict[str, Any]) -> bool:
        """
        Static method for updating user preferences (for backward compatibility)
        
        Args:
            user_id: User ID
            preferences: Dict with preferences to set
            
        Returns:
            True if successful, False otherwise
        """
        service = UserService()
        return service.set_user_preferences(user_id, preferences)