from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel


class SystemSettingGroup(BaseModel):
    __tablename__ = 'system_setting_groups'

    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    types = relationship('SystemSettingType', back_populates='group', cascade='all, delete-orphan')


class SystemSettingType(BaseModel):
    __tablename__ = 'system_setting_types'

    group_id = Column(Integer, ForeignKey('system_setting_groups.id'), nullable=False)
    key = Column(String(150), nullable=False, unique=True)
    data_type = Column(String(20), nullable=False)  # string, integer, number, boolean, json
    description = Column(Text, nullable=True)
    default_value = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    constraints_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    group = relationship('SystemSettingGroup', back_populates='types')
    values = relationship('SystemSetting', back_populates='type', cascade='all, delete-orphan')


class SystemSetting(BaseModel):
    __tablename__ = 'system_settings'

    type_id = Column(Integer, ForeignKey('system_setting_types.id'), nullable=False, index=True)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(100), nullable=True)

    type = relationship('SystemSettingType', back_populates='values')


