from sqlalchemy import Column, Integer, String, ForeignKey
from .base import BaseModel
from typing import Dict, Any, Optional

class Note(BaseModel):
    """
    Notes model with flexible association system
    
    The association system allows linking notes to different entities in the system:
    - account (id=1): Note associated with account
    - trade (id=2): Note associated with trade  
    - trade_plan (id=3): Note associated with trade plan
    - ticker (id=4): Note associated with ticker
    
    System advantages:
    - Flexibility: Ability to associate notes with any type of entity
    - Easy expansion: Adding new entity types without changing table structure
    - Consistency: Using the same association system as alerts
    """
    __tablename__ = "notes"
    
    content = Column(String(10000), nullable=False)
    attachment = Column(String(500), nullable=True)  # path to file
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False)
    related_id = Column(Integer, nullable=False)
    
    def __repr__(self) -> str:
        related_type = 'account' if self.related_type_id == 1 else 'trade' if self.related_type_id == 2 else 'trade_plan' if self.related_type_id == 3 else 'none'
        return f"<Note(id={self.id}, related_type='{related_type}', related_id={self.related_id}, content='{self.content[:50]}...')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with backward compatibility"""
        result: Dict[str, Any] = super().to_dict()
        
        # Determine related_type based on related_type_id
        if self.related_type_id == 1:
            result['related_type'] = 'account'
        elif self.related_type_id == 2:
            result['related_type'] = 'trade'
        elif self.related_type_id == 3:
            result['related_type'] = 'trade_plan'
        else:
            result['related_type'] = None
        
        result['related_id'] = self.related_id
        
        # No backward compatibility needed - using only related_type_id and related_id
        
        return result
