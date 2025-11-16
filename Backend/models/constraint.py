from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import BaseModel


class Constraint(BaseModel):
    __tablename__ = "constraints"

    table_name = Column(String(50), nullable=False)
    column_name = Column(String(50), nullable=False)
    constraint_type = Column(String(20), nullable=False)
    constraint_name = Column(String(100), nullable=False)
    constraint_definition = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    enum_values = relationship(
        "EnumValue", back_populates="constraint", cascade="all, delete-orphan"
    )
    validations = relationship(
        "ConstraintValidation", back_populates="constraint", cascade="all, delete-orphan"
    )


class EnumValue(BaseModel):
    __tablename__ = "enum_values"

    constraint_id = Column(Integer, ForeignKey("constraints.id"), nullable=False)
    value = Column(String(50), nullable=False)
    display_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    constraint = relationship("Constraint", back_populates="enum_values")


class ConstraintValidation(BaseModel):
    __tablename__ = "constraint_validations"

    constraint_id = Column(Integer, ForeignKey("constraints.id"), nullable=False)
    validation_type = Column(String(20), nullable=False)
    validation_rule = Column(Text, nullable=False)
    error_message = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    constraint = relationship("Constraint", back_populates="validations")



