from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from .base import BaseModel
from typing import Dict, Any, Optional, List

class Ticker(BaseModel):
    """
    מודל טיקר - מייצג מניה, ETF, מטבע קריפטו או כל נכס פיננסי אחר
    
    Attributes:
        symbol (str): סימבול הטיקר - חייב להיות ייחודי, מקסימום 10 תווים
        name (str): שם החברה או הנכס - מקסימום 100 תווים
        type (str): סוג הנכס - stock, etf, crypto, forex, commodity
        remarks (str): הערות נוספות - מקסימום 500 תווים
        currency_id (int): מזהה המטבע מטבלת המטבעות
        active_trades (bool): האם יש טריידים פעילים בנכס זה
        
    Relationships:
        trades: רשימת הטריידים המקושרים לטיקר זה
        trade_plans: רשימת תכנוני הטרייד המקושרים לטיקר זה
        
    Constraints:
        - symbol חייב להיות ייחודי במערכת
        - symbol לא יכול להיות ריק
        - symbol מוגבל ל-10 תווים
        - currency_id חייב להתייחס למטבע קיים בטבלת המטבעות
        
    Example:
        >>> ticker = Ticker(
        ...     symbol="AAPL",
        ...     name="Apple Inc.",
        ...     type="stock",
        ...     currency_id=1,  # מזהה USD בטבלת המטבעות
        ...     remarks="חברת טכנולוגיה אמריקאית"
        ... )
    """
    __tablename__ = "tickers"
    __table_args__ = {'extend_existing': True}
    
    # Primary fields
    symbol = Column(String(10), unique=True, nullable=False, index=True, 
                   comment="סימבול הטיקר - חייב להיות ייחודי")
    name = Column(String(100), nullable=True, 
                 comment="שם החברה או הנכס")
    type = Column(String(20), nullable=True, 
                 comment="סוג הנכס: stock, etf, crypto, forex, commodity")
    remarks = Column(String(500), nullable=True, 
                    comment="הערות נוספות על הטיקר")
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=False,
                        comment="מזהה המטבע מטבלת המטבעות")
    active_trades = Column(Boolean, default=False, nullable=True, 
                          comment="האם יש טריידים פעילים")
    
    # Relationships
    # Each ticker belongs to one currency
    currency = relationship("Currency", backref="tickers")
    
    trades = relationship("Trade", back_populates="ticker", 
                         cascade="all, delete-orphan")
    trade_plans = relationship("TradePlan", back_populates="ticker", 
                              cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """ייצוג מחרוזת של הטיקר"""
        return f"<Ticker(symbol='{self.symbol}', name='{self.name}', type='{self.type}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        המרת הטיקר למילון JSON
        
        Returns:
            Dict[str, Any]: מילון עם כל שדות הטיקר
            
        Example:
            >>> ticker = Ticker(symbol="AAPL", name="Apple Inc.")
            >>> ticker.to_dict()
            {'id': 1, 'symbol': 'AAPL', 'name': 'Apple Inc.', ...}
        """
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # אם זה תאריך
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        return result
    
    @property
    def display_name(self) -> str:
        """
        שם תצוגה של הטיקר - שילוב של סימבול ושם
        
        Returns:
            str: שם תצוגה בפורמט "SYMBOL - Name"
            
        Example:
            >>> ticker = Ticker(symbol="AAPL", name="Apple Inc.")
            >>> ticker.display_name
            'AAPL - Apple Inc.'
        """
        if self.name:
            return f"{self.symbol} - {self.name}"
        return self.symbol
    
    def is_active(self) -> bool:
        """
        בדיקה האם הטיקר פעיל (יש לו טריידים או תכנונים פתוחים)
        
        Returns:
            bool: True אם הטיקר פעיל, False אחרת
        """
        return self.active_trades or len(self.trades) > 0 or len(self.trade_plans) > 0
    
    def get_linked_items_count(self) -> Dict[str, int]:
        """
        ספירת פריטים מקושרים לטיקר
        
        Returns:
            Dict[str, int]: מילון עם מספר הפריטים המקושרים
            
        Example:
            >>> ticker.get_linked_items_count()
            {'trades': 5, 'trade_plans': 2, 'notes': 1, 'alerts': 0}
        """
        return {
            'trades': len(self.trades),
            'trade_plans': len(self.trade_plans),
            'notes': 0,  # יטען בנפרד אם נדרש
            'alerts': 0   # יטען בנפרד אם נדרש
        }
