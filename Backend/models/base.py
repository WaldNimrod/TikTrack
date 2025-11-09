from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from typing import Dict, Any
from datetime import date, datetime

# Create base class for models
Base = declarative_base()


class BaseModel(Base):
    """
    Base model with common fields for all entities

    This model provides common fields that are shared across all entities:
    - id: Primary key
    - created_at: Timestamp when the record was created
    """

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the SQLAlchemy model into a serializable dictionary while keeping
        datetime values intact. Date normalization is handled later by the
        DateNormalizationService so envelopes can be produced with the user's timezone.
        """
        result: Dict[str, Any] = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, date) and not isinstance(value, datetime):
                # Promote pure date objects to naive UTC datetimes at midnight so the
                # normalization layer can treat them consistently.
                value = datetime.combine(value, datetime.min.time())
            result[column.name] = value
        return result

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"
