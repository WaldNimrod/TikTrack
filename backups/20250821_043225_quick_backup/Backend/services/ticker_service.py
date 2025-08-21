"""
שירות ניהול טיקרים - TikTrack

מודול זה מכיל את כל הלוגיקה העסקית לניהול טיקרים במערכת.
כולל CRUD operations, ולידציה, בדיקת פריטים מקושרים ועוד.

Classes:
    TickerService: שירות ראשי לניהול טיקרים

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from sqlalchemy.orm import Session
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.note import Note
from models.alert import Alert
from typing import List, Optional, Dict, Any, Union

class TickerService:
    """
    שירות לניהול טיקרים במערכת TikTrack
    
    שירות זה מספק את כל הפונקציונליות הנדרשת לניהול טיקרים:
    - יצירה, קריאה, עדכון ומחיקה (CRUD)
    - ולידציה של נתונים
    - בדיקת פריטים מקושרים
    - ניהול סטטוס פעילות
    
    Attributes:
        VALID_TICKER_TYPES (List[str]): סוגי טיקרים תקינים במערכת
        MAX_SYMBOL_LENGTH (int): אורך מקסימלי לסימבול
        MAX_NAME_LENGTH (int): אורך מקסימלי לשם
        MAX_REMARKS_LENGTH (int): אורך מקסימלי להערות
        CURRENCY_LENGTH (int): אורך קבוע למטבע
        
    Example:
        >>> service = TickerService()
        >>> tickers = service.get_all(db_session)
        >>> new_ticker = service.create(db_session, {
        ...     'symbol': 'AAPL',
        ...     'name': 'Apple Inc.',
        ...     'type': 'stock'
        ... })
    """
    
    # Constants for validation
    VALID_TICKER_TYPES: List[str] = ['stock', 'etf', 'crypto', 'forex', 'commodity']
    MAX_SYMBOL_LENGTH: int = 10
    MAX_NAME_LENGTH: int = 100
    MAX_REMARKS_LENGTH: int = 500
    CURRENCY_LENGTH: int = 3
    @staticmethod
    def get_all(db: Session) -> List[Ticker]:
        """
        קבלת כל הטיקרים מהמערכת
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            
        Returns:
            List[Ticker]: רשימת כל הטיקרים במערכת
            
        Example:
            >>> tickers = TickerService.get_all(db_session)
            >>> print(f"מספר טיקרים במערכת: {len(tickers)}")
        """
        return db.query(Ticker).all()
    
    @staticmethod
    def get_by_id(db: Session, ticker_id: int) -> Optional[Ticker]:
        """
        קבלת טיקר לפי מזהה
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            ticker_id (int): מזהה הטיקר
            
        Returns:
            Optional[Ticker]: הטיקר אם נמצא, None אחרת
            
        Example:
            >>> ticker = TickerService.get_by_id(db_session, 1)
            >>> if ticker:
            ...     print(f"נמצא טיקר: {ticker.symbol}")
        """
        return db.query(Ticker).filter(Ticker.id == ticker_id).first()
    
    @staticmethod
    def get_by_symbol(db: Session, symbol: str) -> Optional[Ticker]:
        """
        קבלת טיקר לפי סימבול
        
        Args:
            db (Session): חיבור לבסיס הנתונים
            symbol (str): סימבול הטיקר
            
        Returns:
            Optional[Ticker]: הטיקר אם נמצא, None אחרת
            
        Example:
            >>> ticker = TickerService.get_by_symbol(db_session, "AAPL")
            >>> if ticker:
            ...     print(f"נמצא טיקר: {ticker.name}")
        """
        return db.query(Ticker).filter(Ticker.symbol == symbol.upper()).first()
    
    @staticmethod
    def validate_ticker_data(ticker_data: dict) -> Dict[str, Any]:
        """
        ולידציה של נתוני טיקר
        
        פונקציה זו בודקת את תקינות הנתונים לפני שמירה לבסיס הנתונים.
        כוללת בדיקות אורך, פורמט, ערכים מותרים ועוד.
        
        Args:
            ticker_data (dict): מילון עם נתוני הטיקר לוולידציה
                - symbol (str): סימבול הטיקר
                - name (str): שם הטיקר
                - type (str): סוג הטיקר
                - currency (str): מטבע הטיקר
                - remarks (str): הערות
                
        Returns:
            Dict[str, Any]: מילון עם תוצאות הולידציה
                - is_valid (bool): האם הנתונים תקינים
                - errors (List[str]): רשימת שגיאות
                - warnings (List[str]): רשימת אזהרות
                
        Example:
            >>> data = {'symbol': 'AAPL', 'name': 'Apple Inc.', 'type': 'stock'}
            >>> result = TickerService.validate_ticker_data(data)
            >>> print(f"תקין: {result['is_valid']}")
            >>> print(f"שגיאות: {result['errors']}")
        """
        errors = []
        warnings = []
        
        # בדיקת סימבול
        symbol = ticker_data.get('symbol', '').strip().upper()
        if not symbol:
            errors.append("סימבול הוא שדה חובה")
        elif len(symbol) > TickerService.MAX_SYMBOL_LENGTH:
            errors.append(f"סימבול לא יכול להיות ארוך מ-{TickerService.MAX_SYMBOL_LENGTH} תווים")
        elif not symbol.isalnum():
            errors.append("סימבול יכול להכיל רק אותיות ומספרים באנגלית")
        
        # בדיקת שם
        name = ticker_data.get('name', '').strip()
        if name and len(name) > TickerService.MAX_NAME_LENGTH:
            errors.append(f"שם לא יכול להיות ארוך מ-{TickerService.MAX_NAME_LENGTH} תווים")
        
        # בדיקת סוג
        ticker_type = ticker_data.get('type', '').strip()
        if ticker_type and ticker_type not in TickerService.VALID_TICKER_TYPES:
            warnings.append(f"סוג לא מוכר: {ticker_type}. סוגים מוכרים: {', '.join(TickerService.VALID_TICKER_TYPES)}")
        
        # בדיקת מטבע
        currency = ticker_data.get('currency', '').strip().upper()
        if currency and len(currency) != TickerService.CURRENCY_LENGTH:
            errors.append(f"מטבע חייב להיות בדיוק {TickerService.CURRENCY_LENGTH} תווים")
        
        # בדיקת הערות
        remarks = ticker_data.get('remarks', '').strip()
        if remarks and len(remarks) > TickerService.MAX_REMARKS_LENGTH:
            errors.append(f"הערות לא יכולות להיות ארוכות מ-{TickerService.MAX_REMARKS_LENGTH} תווים")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    @staticmethod
    def check_symbol_exists(db: Session, symbol: str, exclude_id: int = None) -> bool:
        """
        בדיקה אם סימבול כבר קיים
        
        Args:
            db: Session - חיבור לבסיס הנתונים
            symbol: str - הסימבול לבדיקה
            exclude_id: int - מזהה טיקר לא לכלול בבדיקה (לעריכה)
        
        Returns:
            bool - True אם הסימבול קיים, False אחרת
        """
        query = db.query(Ticker).filter(Ticker.symbol == symbol.upper())
        if exclude_id:
            query = query.filter(Ticker.id != exclude_id)
        return query.first() is not None
    
    @staticmethod
    def create(db: Session, ticker_data: dict) -> Ticker:
        """יצירת טיקר חדש עם ולידציה"""
        # ולידציה של הנתונים
        validation = TickerService.validate_ticker_data(ticker_data)
        if not validation['is_valid']:
            raise ValueError(f"נתונים לא תקינים: {'; '.join(validation['errors'])}")
        
        # בדיקה שהסימבול לא קיים
        symbol = ticker_data.get('symbol', '').strip().upper()
        if TickerService.check_symbol_exists(db, symbol):
            raise ValueError(f"סימבול {symbol} כבר קיים במערכת")
        
        # נרמול הנתונים
        ticker_data['symbol'] = symbol
        if 'name' in ticker_data:
            ticker_data['name'] = ticker_data['name'].strip()
        if 'currency' in ticker_data:
            ticker_data['currency'] = ticker_data['currency'].strip().upper()
        
        ticker = Ticker(**ticker_data)
        db.add(ticker)
        db.commit()
        db.refresh(ticker)
        return ticker
    
    @staticmethod
    def update(db: Session, ticker_id: int, ticker_data: dict) -> Optional[Ticker]:
        """עדכון טיקר עם ולידציה"""
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            raise ValueError(f"טיקר עם מזהה {ticker_id} לא נמצא")
        
        # ולידציה של הנתונים
        validation = TickerService.validate_ticker_data(ticker_data)
        if not validation['is_valid']:
            raise ValueError(f"נתונים לא תקינים: {'; '.join(validation['errors'])}")
        
        # בדיקה שהסימבול לא קיים (אם השתנה)
        if 'symbol' in ticker_data:
            symbol = ticker_data.get('symbol', '').strip().upper()
            if TickerService.check_symbol_exists(db, symbol, exclude_id=ticker_id):
                raise ValueError(f"סימבול {symbol} כבר קיים במערכת")
            ticker_data['symbol'] = symbol
        
        # נרמול הנתונים
        if 'name' in ticker_data:
            ticker_data['name'] = ticker_data['name'].strip()
        if 'currency' in ticker_data:
            ticker_data['currency'] = ticker_data['currency'].strip().upper()
        
        # עדכון השדות
        for key, value in ticker_data.items():
            setattr(ticker, key, value)
        
        db.commit()
        db.refresh(ticker)
        return ticker
    
    @staticmethod
    def check_linked_items(db: Session, ticker_id: int) -> Dict[str, Any]:
        """
        בדיקת פריטים מקושרים לטיקר לפני מחיקה
        
        מחזיר מילון עם:
        - has_linked_items: האם יש פריטים מקושרים
        - open_trades: רשימת טריידים פתוחים
        - open_trade_plans: רשימת תכנונים פתוחים
        - notes: רשימת הערות מקושרות
        - alerts: רשימת התראות מקושרות
        """
        result = {
            'has_linked_items': False,
            'open_trades': [],
            'open_trade_plans': [],
            'notes': [],
            'alerts': []
        }
        
        # בדיקת טריידים פתוחים
        open_trades = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).all()
        
        if open_trades:
            result['open_trades'] = [trade.to_dict() for trade in open_trades]
            result['has_linked_items'] = True
        
        # בדיקת תכנונים פתוחים
        open_trade_plans = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).all()
        
        if open_trade_plans:
            result['open_trade_plans'] = [plan.to_dict() for plan in open_trade_plans]
            result['has_linked_items'] = True
        
        # בדיקת הערות מקושרות (related_type_id = 4 עבור ticker)
        notes = db.query(Note).filter(
            Note.related_type_id == 4,  # ticker
            Note.related_id == ticker_id
        ).all()
        
        if notes:
            result['notes'] = [note.to_dict() for note in notes]
            result['has_linked_items'] = True
        
        # בדיקת התראות מקושרות (related_type_id = 4 עבור ticker)
        alerts = db.query(Alert).filter(
            Alert.related_type_id == 4,  # ticker
            Alert.related_id == ticker_id
        ).all()
        
        if alerts:
            result['alerts'] = [alert.to_dict() for alert in alerts]
            result['has_linked_items'] = True
        
        return result
    
    @staticmethod
    def delete(db: Session, ticker_id: int) -> bool:
        """
        מחיקת טיקר - רק אם אין פריטים מקושרים
        מחזיר True אם הטיקר נמחק בהצלחה, False אחרת
        """
        # בדיקה שהטיקר קיים
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return False
        
        # בדיקת פריטים מקושרים
        linked_items = TickerService.check_linked_items(db, ticker_id)
        if linked_items['has_linked_items']:
            # יש פריטים מקושרים - לא ניתן למחוק
            raise ValueError("Cannot delete ticker with linked items (open trades, trade plans, notes, or alerts)")
        
        # אין פריטים מקושרים - ניתן למחוק
        db.delete(ticker)
        db.commit()
        return True
    
    @staticmethod
    def update_open_status(db: Session, ticker_id: int) -> bool:
        """עדכון סטטוס פתיחה של טיקר"""
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # בדיקה אם יש תכנונים פתוחים
        open_plans = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        # בדיקה אם יש טריידים פתוחים
        open_trades = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # עדכון סטטוס
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if ticker:
            ticker.active_trades = (open_plans > 0 or open_trades > 0)
            db.commit()
            return True
        return False
