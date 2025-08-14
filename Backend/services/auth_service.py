from sqlalchemy.orm import Session
from models.user import User
from models.role import Role
from models.user_role import UserRole
from typing import Optional, List
import bcrypt
import jwt
import json
from datetime import datetime, timedelta
import os

class AuthService:
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    @staticmethod
    def hash_password(password: str) -> str:
        """הצפנת סיסמה"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """אימות סיסמה"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """יצירת JWT token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """אימות JWT token"""
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """אימות משתמש"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.password_hash):
            return None
        return user
    
    @staticmethod
    def create_user(db: Session, username: str, email: str, password: str, roles: List[str] = None) -> User:
        """יצירת משתמש חדש"""
        # בדיקה אם המשתמש כבר קיים
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing_user:
            raise ValueError("User already exists")
        
        # יצירת המשתמש
        hashed_password = AuthService.hash_password(password)
        user = User(
            username=username,
            email=email,
            password_hash=hashed_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # הוספת תפקידים
        if roles:
            AuthService.assign_roles_to_user(db, user.id, roles)
        
        return user
    
    @staticmethod
    def assign_roles_to_user(db: Session, user_id: int, role_names: List[str]) -> bool:
        """הקצאת תפקידים למשתמש"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        for role_name in role_names:
            role = db.query(Role).filter(Role.name == role_name).first()
            if role:
                # בדיקה אם התפקיד כבר מוקצה
                existing = db.query(UserRole).filter(
                    UserRole.user_id == user_id,
                    UserRole.role_id == role.id
                ).first()
                if not existing:
                    user_role = UserRole(
                        user_id=user_id, 
                        role_id=role.id,
                        assigned_at=datetime.now()
                    )
                    db.add(user_role)
        
        db.commit()
        return True
    
    @staticmethod
    def get_user_roles(db: Session, user_id: int) -> List[str]:
        """קבלת תפקידי המשתמש"""
        user_roles = db.query(UserRole).filter(UserRole.user_id == user_id).all()
        role_names = []
        for user_role in user_roles:
            role = db.query(Role).filter(Role.id == user_role.role_id).first()
            if role:
                role_names.append(role.name)
        return role_names
    
    @staticmethod
    def check_permission(db: Session, user_id: int, permission: str) -> bool:
        """בדיקת הרשאה למשתמש"""
        user_roles = AuthService.get_user_roles(db, user_id)
        for role_name in user_roles:
            role = db.query(Role).filter(Role.name == role_name).first()
            if role and role.permissions:
                try:
                    permissions = json.loads(role.permissions)
                    if permission in permissions:
                        return True
                except json.JSONDecodeError:
                    continue
        return False
    
    @staticmethod
    def update_last_login(db: Session, user_id: int) -> bool:
        """עדכון זמן התחברות אחרון"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_login = datetime.now()
            db.commit()
            return True
        return False
    
    @staticmethod
    def get_user_with_roles(db: Session, user_id: int) -> Optional[dict]:
        """קבלת משתמש עם תפקידיו"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        roles = AuthService.get_user_roles(db, user_id)
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "last_login": user.last_login,
            "roles": roles
        }
    
    @staticmethod
    def create_role(db: Session, name: str, description: str = None, permissions: List[str] = None) -> Role:
        """יצירת תפקיד חדש"""
        existing_role = db.query(Role).filter(Role.name == name).first()
        if existing_role:
            raise ValueError("Role already exists")
        
        permissions_json = json.dumps(permissions) if permissions else None
        role = Role(
            name=name,
            description=description,
            permissions=permissions_json
        )
        db.add(role)
        db.commit()
        db.refresh(role)
        return role
    
    @staticmethod
    def get_all_roles(db: Session) -> List[Role]:
        """קבלת כל התפקידים"""
        return db.query(Role).all()
    
    @staticmethod
    def audit_login(db: Session, user_id: int, success: bool, ip_address: str = None) -> bool:
        """רישום אירוע התחברות"""
        # כאן אפשר להוסיף טבלת audit logs
        # כרגע נחזיר True
        return True
