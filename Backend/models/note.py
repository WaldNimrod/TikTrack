from sqlalchemy import Column, Integer, String, ForeignKey, event
from .base import BaseModel
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class Note(BaseModel):
    """
    Notes model with flexible association system
    
    The association system allows linking notes to different entities in the system:
    - trading_account (id=1): Note associated with trading account
    - trade (id=2): Note associated with trade  
    - trade_plan (id=3): Note associated with trade plan
    - ticker (id=4): Note associated with ticker
    
    System advantages:
    - Flexibility: Ability to associate notes with any type of entity
    - Easy expansion: Adding new entity types without changing table structure
    - Consistency: Using the same association system as alerts
    """
    __tablename__ = "notes"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User who owns this note")
    content = Column(String(10000), nullable=False)
    attachment = Column(String(500), nullable=True)  # path to file
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False)
    related_id = Column(Integer, nullable=False)
    
    def __repr__(self) -> str:
        related_type = 'trading_account' if self.related_type_id == 1 else 'trade' if self.related_type_id == 2 else 'trade_plan' if self.related_type_id == 3 else 'none'
        return f"<Note(id={self.id}, related_type='{related_type}', related_id={self.related_id}, content='{self.content[:50]}...')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with backward compatibility"""
        result: Dict[str, Any] = super().to_dict()
        
        # Determine related_type based on related_type_id
        if self.related_type_id == 1:
            result['related_type'] = 'trading_account'
        elif self.related_type_id == 2:
            result['related_type'] = 'trade'
        elif self.related_type_id == 3:
            result['related_type'] = 'trade_plan'
        else:
            result['related_type'] = None
        
        result['related_id'] = self.related_id
        
        # No backward compatibility needed - using only related_type_id and related_id
        
        return result


# ========================================
# SQLAlchemy Event Listeners for Tag Links Cleanup
# ========================================

@event.listens_for(Note, 'after_delete')
def note_deleted(mapper, connection, target):
    """
    Event listener for when a note is deleted.
    Automatically removes all associated tag links.
    """
    try:
        from services.tag_service import TagService
        from sqlalchemy.orm import Session
        
        session = Session(bind=connection)
        TagService.remove_all_tags_for_entity(
            session, 'note', target.id
        )
        session.close()
    except Exception as e:
        logger.error(f"Error cleaning up tags for note {target.id}: {e}")
        # Don't raise - allow deletion to proceed even if tag cleanup fails
