"""
Real-time Notifications Service - TikTrack
==========================================

Real-time notification system using Flask-SocketIO for instant user updates.

Features:
- WebSocket server with Flask-SocketIO
- Event broadcasting to all users
- User-specific notifications
- Background tasks integration
- Database change notifications
- Connection management and monitoring

Dependencies:
- Flask-SocketIO
- Background tasks system
- Notification system utilities

@author TikTrack Development Team
@version 1.0.0
@lastUpdated September 2, 2025
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request, session
import json

logger = logging.getLogger(__name__)

class RealtimeNotificationsService:
    """
    Real-time notifications service for TikTrack
    """
    
    def __init__(self, socketio: SocketIO):
        self.socketio = socketio
        self.connected_users: Dict[str, Dict[str, Any]] = {}
        self.user_rooms: Dict[str, str] = {}
        self.notification_history: List[Dict[str, Any]] = []
        self.max_history_size = 1000
        
        # Register event handlers
        self._register_event_handlers()
        
        logger.info("Real-time Notifications Service initialized")
    
    def _register_event_handlers(self):
        """Register WebSocket event handlers"""
        
        @self.socketio.on('connect')
        def handle_connect():
            """Handle client connection"""
            try:
                user_id = self._get_user_id()
                session_id = request.sid
                
                # Store connection info
                self.connected_users[session_id] = {
                    'user_id': user_id,
                    'connected_at': datetime.now(),
                    'user_agent': request.headers.get('User-Agent', 'Unknown'),
                    'ip_address': request.remote_addr
                }
                
                # Join user-specific room
                if user_id:
                    room_name = f"user_{user_id}"
                    join_room(room_name)
                    self.user_rooms[session_id] = room_name
                    
                    logger.info(f"User {user_id} connected via session {session_id}")
                    
                    # Send connection confirmation
                    emit('connected', {
                        'status': 'connected',
                        'user_id': user_id,
                        'timestamp': datetime.now().isoformat()
                    })
                else:
                    logger.warning(f"Anonymous user connected via session {session_id}")
                    
            except Exception as e:
                logger.error(f"Error handling connection: {e}")
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Handle client disconnection"""
            try:
                session_id = request.sid
                
                if session_id in self.connected_users:
                    user_id = self.connected_users[session_id].get('user_id')
                    
                    # Leave user room
                    if session_id in self.user_rooms:
                        room_name = self.user_rooms[session_id]
                        leave_room(room_name)
                        del self.user_rooms[session_id]
                    
                    # Remove connection info
                    del self.connected_users[session_id]
                    
                    logger.info(f"User {user_id} disconnected from session {session_id}")
                    
            except Exception as e:
                logger.error(f"Error handling disconnection: {e}")
        
        @self.socketio.on('join_room')
        def handle_join_room(data):
            """Handle joining a specific room"""
            try:
                room_name = data.get('room')
                if room_name:
                    join_room(room_name)
                    logger.info(f"Session {request.sid} joined room {room_name}")
                    
                    emit('room_joined', {
                        'room': room_name,
                        'status': 'joined',
                        'timestamp': datetime.now().isoformat()
                    })
                    
            except Exception as e:
                logger.error(f"Error joining room: {e}")
        
        @self.socketio.on('leave_room')
        def handle_leave_room(data):
            """Handle leaving a specific room"""
            try:
                room_name = data.get('room')
                if room_name:
                    leave_room(room_name)
                    logger.info(f"Session {request.sid} left room {room_name}")
                    
                    emit('room_left', {
                        'room': room_name,
                        'status': 'left',
                        'timestamp': datetime.now().isoformat()
                    })
                    
            except Exception as e:
                logger.error(f"Error leaving room: {e}")
    
    def _get_user_id(self) -> Optional[str]:
        """Get user ID from session or request"""
        # TODO: Implement proper user authentication
        # For now, return session ID as user identifier
        return request.sid
    
    def broadcast_notification(self, event: str, data: Dict[str, Any], room: Optional[str] = None):
        """
        Broadcast notification to all connected clients or specific room
        
        Args:
            event: Event name to emit
            data: Data to send with the event
            room: Optional room name to limit broadcast
        """
        try:
            if room:
                self.socketio.emit(event, data, room=room)
                logger.info(f"Broadcasted {event} to room {room}")
            else:
                self.socketio.emit(event, data)
                logger.info(f"Broadcasted {event} to all clients")
                
            # Store in history
            self._store_notification(event, data, room)
            
        except Exception as e:
            logger.error(f"Error broadcasting notification {event}: {e}")
    
    def send_user_notification(self, user_id: str, event: str, data: Dict[str, Any]):
        """
        Send notification to specific user
        
        Args:
            user_id: Target user ID
            event: Event name to emit
            data: Data to send with the event
        """
        try:
            room_name = f"user_{user_id}"
            self.socketio.emit(event, data, room=room_name)
            
            logger.info(f"Sent {event} to user {user_id}")
            
            # Store in history
            self._store_notification(event, data, room_name)
            
        except Exception as e:
            logger.error(f"Error sending notification to user {user_id}: {e}")
    
    def _store_notification(self, event: str, data: Dict[str, Any], room: Optional[str] = None):
        """Store notification in history"""
        try:
            notification = {
                'event': event,
                'data': data,
                'room': room,
                'timestamp': datetime.now().isoformat(),
                'recipient_count': len(self.connected_users) if not room else 1
            }
            
            self.notification_history.append(notification)
            
            # Maintain history size
            if len(self.notification_history) > self.max_history_size:
                self.notification_history.pop(0)
                
        except Exception as e:
            logger.error(f"Error storing notification: {e}")
    
    # ===== BACKGROUND TASKS INTEGRATION =====
    
    def notify_background_task_started(self, task_name: str, task_id: str, user_id: Optional[str] = None):
        """Notify when background task starts"""
        data = {
            'task_name': task_name,
            'task_id': task_id,
            'status': 'started',
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'background_task_started', data)
        else:
            self.broadcast_notification('background_task_started', data)
    
    def notify_background_task_completed(self, task_name: str, task_id: str, result: Dict[str, Any], user_id: Optional[str] = None):
        """Notify when background task completes"""
        data = {
            'task_name': task_name,
            'task_id': task_id,
            'status': 'completed',
            'result': result,
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'background_task_completed', data)
        else:
            self.broadcast_notification('background_task_completed', data)
    
    def notify_background_task_failed(self, task_name: str, task_id: str, error: str, user_id: Optional[str] = None):
        """Notify when background task fails"""
        data = {
            'task_name': task_name,
            'task_id': task_id,
            'status': 'failed',
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'background_task_failed', data)
        else:
            self.broadcast_notification('background_task_failed', data)
    
    # ===== DATABASE CHANGE NOTIFICATIONS =====
    
    def notify_data_updated(self, table: str, record_id: str, operation: str, user_id: Optional[str] = None):
        """Notify when data is updated"""
        data = {
            'table': table,
            'record_id': record_id,
            'operation': operation,
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'data_updated', data)
        else:
            self.broadcast_notification('data_updated', data)
    
    def notify_data_error(self, table: str, operation: str, error: str, user_id: Optional[str] = None):
        """Notify when data operation fails"""
        data = {
            'table': table,
            'operation': operation,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'data_error', data)
        else:
            self.broadcast_notification('data_error', data)
    
    # ===== EXTERNAL DATA NOTIFICATIONS =====
    
    def notify_external_data_update(self, provider: str, ticker_count: int, user_id: Optional[str] = None):
        """Notify when external data is updated"""
        data = {
            'provider': provider,
            'ticker_count': ticker_count,
            'status': 'updated',
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'external_data_update', data)
        else:
            self.broadcast_notification('external_data_update', data)
    
    def notify_external_data_error(self, provider: str, error: str, user_id: Optional[str] = None):
        """Notify when external data update fails"""
        data = {
            'provider': provider,
            'error': error,
            'status': 'error',
            'timestamp': datetime.now().isoformat()
        }
        
        if user_id:
            self.send_user_notification(user_id, 'external_data_error', data)
        else:
            self.broadcast_notification('external_data_error', data)
    
    # ===== SYSTEM STATUS =====
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            'connected_users': len(self.connected_users),
            'active_rooms': len(set(self.user_rooms.values())),
            'total_notifications': len(self.notification_history),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_user_connections(self) -> List[Dict[str, Any]]:
        """Get list of user connections"""
        return [
            {
                'session_id': session_id,
                'user_id': info.get('user_id'),
                'connected_at': info.get('connected_at').isoformat() if info.get('connected_at') else None,
                'user_agent': info.get('user_agent'),
                'ip_address': info.get('ip_address'),
                'room': self.user_rooms.get(session_id)
            }
            for session_id, info in self.connected_users.items()
        ]
    
    def get_notification_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get notification history"""
        return self.notification_history[-limit:] if limit > 0 else self.notification_history.copy()
