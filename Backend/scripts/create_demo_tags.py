#!/usr/bin/env python3
"""
TikTrack Demo Tags Creation Script
==================================

Creates beautiful and impressive tags for demo data, including:
- Tag categories with colors
- Professional tags in each category
- Tag assignments to tickers, trade plans, and trades

Usage:
    python3 Backend/scripts/create_demo_tags.py [--dry-run] [--verbose]

Options:
    --dry-run: Show what would be done without creating tags
    --verbose: Show detailed progress information

Author: TikTrack Development Team
Version: 1.0.0
Date: November 2025
"""

import sys
import os
import random
import argparse
from typing import Dict, List, Optional, Tuple

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from config.settings import DATABASE_URL
from models.tag_category import TagCategory
from models.tag import Tag
from models.tag_link import TagLink
from models.ticker import Ticker
from models.trade_plan import TradePlan
from models.trade import Trade
from services.tag_service import TagService

# ============================================================================
# Demo Tags Configuration
# ============================================================================

DEMO_TAG_CATEGORIES = [
    {
        'name': 'סוגי מסחר',
        'color_hex': '#3B82F6',  # Blue
        'order_index': 10,
        'tags': [
            ('Swing Trading', 'מסחר סווינג - אחזקה קצרת טווח', 'מסחר לטווח קצר עם החזקה של מספר ימים עד שבועות'),
            ('Day Trading', 'מסחר יומי - סגירה באותו יום', 'מסחר עם פתיחה וסגירה באותו יום מסחר'),
            ('Long Term', 'השקעה ארוכת טווח', 'השקעות ארוכות טווח עם החזקה של חודשים עד שנים'),
            ('Scalping', 'סקלפינג - מסחר מהיר', 'מסחר מהיר עם רווחים קטנים ותדירות גבוהה'),
            ('Position Trading', 'מסחר עמדה', 'מסחר עם אחזקה ארוכה לכמה שבועות או חודשים'),
        ]
    },
    {
        'name': 'סוגי נכסים',
        'color_hex': '#10B981',  # Green
        'order_index': 20,
        'tags': [
            ('Tech Stocks', 'מניות טכנולוגיה', 'חברות טכנולוגיה, תוכנה וחומרה'),
            ('Dividend Stocks', 'מניות דיווידנד', 'מניות המחלקות דיווידנדים קבועים'),
            ('Growth Stocks', 'מניות צמיחה', 'מניות של חברות עם פוטנציאל צמיחה גבוה'),
            ('Value Stocks', 'מניות ערך', 'מניות שמחירן נמוך מהערך הפנימי'),
            ('ETF', 'קרנות נסחרות', 'קרנות נסחרות בבורסה (Exchange Traded Funds)'),
            ('Blue Chips', 'מניות כחול-לבן', 'מניות של חברות גדולות ויציבות'),
            ('Small Cap', 'מניות קטנות', 'מניות של חברות עם שווי שוק קטן'),
            ('Large Cap', 'מניות גדולות', 'מניות של חברות עם שווי שוק גדול'),
        ]
    },
    {
        'name': 'אסטרטגיות',
        'color_hex': '#8B5CF6',  # Purple
        'order_index': 30,
        'tags': [
            ('Breakout', 'פריצת רמות', 'מסחר על פריצת רמות מחיר חשובות'),
            ('Breakdown', 'שבירת רמות', 'מסחר על שבירת רמות תמיכה'),
            ('Trend Following', 'מעקב מגמה', 'מסחר במגמה הקיימת של השוק'),
            ('Mean Reversion', 'חזרה לממוצע', 'מסחר על חזרת מחיר לממוצע'),
            ('Support/Resistance', 'תמיכה/התנגדות', 'מסחר סביב רמות תמיכה והתנגדות'),
            ('Momentum', 'מומנטום', 'מסחר על מומנטום חזק במחיר'),
            ('Dollar Cost Averaging', 'השקעה חוזרת', 'השקעה חוזרת בסכום קבוע'),
        ]
    },
    {
        'name': 'רמת סיכון',
        'color_hex': '#F59E0B',  # Orange
        'order_index': 40,
        'tags': [
            ('Low Risk', 'סיכון נמוך', 'השקעות עם סיכון נמוך ויציבות גבוהה'),
            ('Medium Risk', 'סיכון בינוני', 'השקעות עם סיכון בינוני ותשואה מתונה'),
            ('High Risk', 'סיכון גבוה', 'השקעות עם סיכון גבוה ופוטנציאל תשואה גבוה'),
            ('High Volatility', 'תנודתיות גבוהה', 'נכסים עם תנודתיות מחיר גבוהה'),
            ('Stable', 'יציב', 'נכסים יציבים עם תנודתיות נמוכה'),
        ]
    },
    {
        'name': 'תזמון',
        'color_hex': '#EC4899',  # Pink
        'order_index': 50,
        'tags': [
            ('Entry', 'נקודת כניסה', 'תגית לזיהוי נקודות כניסה טובות'),
            ('Exit', 'נקודת יציאה', 'תגית לזיהוי נקודות יציאה טובות'),
            ('Hold', 'החזקה', 'תגית לזיהוי השקעות להחזקה'),
            ('Watch List', 'רשימת מעקב', 'תגית לנכסים במעקב פעיל'),
            ('Active Trade', 'טרייד פעיל', 'תגית לטריידים פעילים כרגע'),
        ]
    },
]

# ============================================================================
# Tag Creator
# ============================================================================

class DemoTagCreator:
    """יוצר תגיות יפות ומרשימות לנתוני הדוגמה"""
    
    def __init__(self, db_session: Session, dry_run: bool = False, verbose: bool = False, username: Optional[str] = None):
        self.db = db_session
        self.dry_run = dry_run
        self.verbose = verbose
        self.username = username
        self.tag_service = TagService()
        self.created_count = {
            'categories': 0,
            'tags': 0,
            'links': 0
        }
        self.categories_cache: Dict[str, TagCategory] = {}
        self.tags_cache: Dict[str, Tag] = {}
        self.user_id: Optional[int] = None
    
    def create_all(self) -> Dict[str, int]:
        """יוצר את כל התגיות והשימושים"""
        print("🚀 מתחיל ליצור תגיות לנתוני הדוגמה...")
        if self.dry_run:
            print("🔍 DRY RUN - מציג מה היה נוצר, ללא יצירת תגיות")
        print("-" * 70)
        
        # Get user ID
        self._get_user_id()
        
        # Create categories and tags
        self._create_categories_and_tags()
        
        if not self.dry_run:
            # Assign tags to entities (only if not dry-run)
            self._assign_tags_to_entities()
            
            # Commit all changes
            self.db.commit()
        
        print()
        print("✅ יצירת תגיות הושלמה בהצלחה!")
        return self.created_count
    
    def _get_user_id(self) -> None:
        """מביא את ID המשתמש הפעיל"""
        if self.username:
            # Search by username
            result = self.db.execute(text("SELECT id FROM users WHERE username = :username"), {"username": self.username}).fetchone()
            if not result:
                raise ValueError(f"משתמש '{self.username}' לא נמצא במערכת")
            self.user_id = result[0]
            if self.verbose:
                print(f"   👤 משתמש: {self.username} (ID: {self.user_id})")
        else:
            # Backward compatibility - use first user
            result = self.db.execute(text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
            if not result:
                raise ValueError("לא נמצא משתמש במערכת")
            self.user_id = result[0]
            if self.verbose:
                print(f"   👤 משתמש: ID {self.user_id} - משתמש ראשון שנמצא")
    
    def _create_categories_and_tags(self) -> None:
        """יוצר קטגוריות ותגיות"""
        print()
        print("📁 יוצר קטגוריות ותגיות...")
        
        for category_config in DEMO_TAG_CATEGORIES:
            category_name = category_config['name']
            color_hex = category_config['color_hex']
            order_index = category_config['order_index']
            
            # Check if category exists
            existing_category = self.db.query(TagCategory).filter(
                TagCategory.user_id == self.user_id,
                TagCategory.name == category_name
            ).first()
            
            if existing_category:
                if self.verbose or self.dry_run:
                    print(f"   ⏭️  קטגוריה '{category_name}' כבר קיימת (ID: {existing_category.id})")
                category = existing_category
            else:
                if self.dry_run:
                    print(f"   🔍 היה נוצר קטגוריה: {category_name} ({color_hex})")
                    # Create a mock category for dry-run
                    from types import SimpleNamespace
                    category = SimpleNamespace(id=None, name=category_name)
                    self.created_count['categories'] += 1
                else:
                    # Create category
                    category = self.tag_service.create_category(
                        self.db,
                        self.user_id,
                        category_name,
                        color_hex=color_hex,
                        order_index=order_index
                    )
                    self.created_count['categories'] += 1
                    print(f"   ✅ יצרתי קטגוריה: {category_name} ({color_hex})")
            
            self.categories_cache[category_name] = category
            
            # Create tags in category
            for tag_name_en, tag_name_he, tag_description in category_config['tags']:
                # Use English name - Hebrew names create empty slugs which cause conflicts
                tag_name = tag_name_en
                
                # Check if tag exists (by exact name match only)
                # Use direct SQL to ensure accurate check
                existing_result = self.db.execute(
                    text('SELECT id FROM tags WHERE user_id = :user_id AND name = :name'),
                    {'user_id': self.user_id, 'name': tag_name}
                ).fetchone()
                
                tag = None
                
                if existing_result:
                    existing_tag_id = existing_result[0]
                    existing_tag = self.db.query(Tag).filter(Tag.id == existing_tag_id).first()
                    if existing_tag:
                        if self.verbose or self.dry_run:
                            print(f"      ⏭️  תגית '{tag_name}' כבר קיימת (ID: {existing_tag.id})")
                        tag = existing_tag
                else:
                    # Tag doesn't exist - create it
                    if self.dry_run:
                        print(f"      🔍 היה נוצר תגית: {tag_name} ({tag_description[:50]}...)")
                        # Create a mock tag for dry-run
                        from types import SimpleNamespace
                        tag = SimpleNamespace(id=None, name=tag_name)
                        self.created_count['tags'] += 1
                    else:
                        # Create tag (TagService creates slug automatically)
                        try:
                            tag = self.tag_service.create_tag(
                                self.db,
                                self.user_id,
                                tag_name,
                                category_id=category.id,
                                description=tag_description
                            )
                            self.created_count['tags'] += 1
                            if self.verbose:
                                print(f"      ✅ יצרתי תגית: {tag_name}")
                        except ValueError as e:
                            # Tag already exists (by slug)
                            if 'already exists' in str(e):
                                # Try to find by slug
                                from services.tag_service import TagService
                                tag_slug = TagService._slugify(tag_name)
                                existing_by_slug = self.db.execute(
                                    text('SELECT id FROM tags WHERE user_id = :user_id AND slug = :slug'),
                                    {'user_id': self.user_id, 'slug': tag_slug}
                                ).fetchone()
                                if existing_by_slug:
                                    tag = self.db.query(Tag).filter(Tag.id == existing_by_slug[0]).first()
                                    if self.verbose:
                                        print(f"      ⏭️  תגית '{tag_name}' כבר קיימת לפי slug (ID: {tag.id})")
                                else:
                                    raise
                            else:
                                raise
                
                # Store in cache with both English and Hebrew names (if tag was created/found)
                if tag:
                    self.tags_cache[tag_name_en] = tag
                    self.tags_cache[tag_name] = tag
        
        print(f"   ✅ נוצרו {self.created_count['categories']} קטגוריות ו-{self.created_count['tags']} תגיות")
    
    
    def _assign_tags_to_entities(self) -> None:
        """משייך תגיות לישויות"""
        print()
        print("🔗 משייך תגיות לישויות...")
        
        # Get all entities
        tickers = self.db.query(Ticker).filter(Ticker.symbol != 'SPY').all()
        trade_plans = self.db.query(TradePlan).all()
        trades = self.db.query(Trade).all()
        
        if self.dry_run:
            # Estimate links in dry-run
            estimated_links = len(tickers) * 0.4 + len(trade_plans) * 0.6 + len(trades) * 0.5
            print(f"   🔍 היה משויך בערך {int(estimated_links)} תגיות לישויות")
            print(f"      - {len(tickers)} טיקרים")
            print(f"      - {len(trade_plans)} תוכניות")
            print(f"      - {len(trades)} טריידים")
            self.created_count['links'] = int(estimated_links)
            return
        
        # Assign tags to tickers
        self._assign_tags_to_tickers(tickers)
        
        # Assign tags to trade plans
        self._assign_tags_to_trade_plans(trade_plans)
        
        # Assign tags to trades
        self._assign_tags_to_trades(trades)
        
        print(f"   ✅ שויכו {self.created_count['links']} תגיות לישויות")
    
    def _assign_tags_to_tickers(self, tickers: List[Ticker]) -> None:
        """משייך תגיות לטיקרים"""
        tag_assignments = {
            'Tech Stocks': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'ADBE', 'ORCL', 'CRM', 'SNOW', 'PANW', 'AMD', 'COIN'],
            'Dividend Stocks': ['JNJ', 'PG', 'KO', 'PEP', 'WMT', 'TGT', 'MCD', 'DIS'],
            'ETF': ['SPY', 'QQQ', 'VOO', 'VTI', 'DIA', 'IWM', 'TLT', 'IVV'],
            'Large Cap': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'JNJ', 'V', 'PG', 'MA'],
            'Growth Stocks': ['TSLA', 'NVDA', 'SNOW', 'COIN', 'UPST', 'AFRM', 'RIVN'],
        }
        
        assigned = 0
        for ticker in tickers:
            tags_to_assign = []
            
            # Assign based on symbol
            for tag_name, symbols in tag_assignments.items():
                if ticker.symbol in symbols and tag_name in self.tags_cache:
                    tags_to_assign.append(self.tags_cache[tag_name])
            
            # Random additional tags
            if random.random() < 0.3:  # 30% chance
                if ticker.type == 'stock':
                    if 'Tech Stocks' in self.tags_cache and random.random() < 0.5:
                        tags_to_assign.append(self.tags_cache['Tech Stocks'])
                    if 'Blue Chips' in self.tags_cache and random.random() < 0.3:
                        tags_to_assign.append(self.tags_cache['Blue Chips'])
                elif ticker.type == 'etf':
                    if 'ETF' in self.tags_cache:
                        tags_to_assign.append(self.tags_cache['ETF'])
            
            # Assign tags
            for tag in tags_to_assign:
                if self._assign_tag_to_entity(tag, 'ticker', ticker.id):
                    assigned += 1
        
        if self.verbose:
            print(f"      ✅ שויכו תגיות ל-{assigned} טיקרים")
    
    def _assign_tags_to_trade_plans(self, trade_plans: List[TradePlan]) -> None:
        """משייך תגיות לתוכניות מסחר"""
        assigned = 0
        
        for plan in trade_plans:
            tags_to_assign = []
            
            # Based on investment type
            if plan.investment_type == 'swing':
                if 'Swing Trading' in self.tags_cache:
                    tags_to_assign.append(self.tags_cache['Swing Trading'])
            elif plan.investment_type == 'long_term':
                if 'Long Term' in self.tags_cache:
                    tags_to_assign.append(self.tags_cache['Long Term'])
            
            # Random strategy tags
            if random.random() < 0.4:  # 40% chance
                strategy_tags = ['Breakout', 'Trend Following', 'Support/Resistance', 'Momentum']
                strategy_tag = random.choice(strategy_tags)
                if strategy_tag in self.tags_cache:
                    tags_to_assign.append(self.tags_cache[strategy_tag])
            
            # Risk level based on side
            if plan.side == 'long':
                if random.random() < 0.3:
                    risk_tags = ['Low Risk', 'Medium Risk', 'High Risk']
                    risk_tag = random.choice(risk_tags)
                    if risk_tag in self.tags_cache:
                        tags_to_assign.append(self.tags_cache[risk_tag])
            
            # Timing tags
            if random.random() < 0.2:  # 20% chance
                if 'Entry' in self.tags_cache:
                    tags_to_assign.append(self.tags_cache['Entry'])
            
            # Assign tags
            for tag in tags_to_assign:
                if self._assign_tag_to_entity(tag, 'trade_plan', plan.id):
                    assigned += 1
        
        if self.verbose:
            print(f"      ✅ שויכו תגיות ל-{assigned} תוכניות מסחר")
    
    def _assign_tags_to_trades(self, trades: List[Trade]) -> None:
        """משייך תגיות לטריידים"""
        assigned = 0
        
        for trade in trades:
            tags_to_assign = []
            
            # Active trade tag
            if trade.status == 'open':
                if 'Active Trade' in self.tags_cache:
                    tags_to_assign.append(self.tags_cache['Active Trade'])
            
            # Based on trade plan if exists
            if trade.trade_plan_id:
                # Get tags from trade plan
                plan_tags = self.db.query(TagLink).join(Tag).filter(
                    TagLink.entity_type == 'trade_plan',
                    TagLink.entity_id == trade.trade_plan_id
                ).all()
                for tag_link in plan_tags:
                    if tag_link.tag_id in [t.id for t in tags_to_assign]:
                        continue
                    tag = self.db.query(Tag).filter(Tag.id == tag_link.tag_id).first()
                    if tag:
                        tags_to_assign.append(tag)
            
            # Exit tag for closed trades
            if trade.status == 'closed':
                if random.random() < 0.3 and 'Exit' in self.tags_cache:
                    tags_to_assign.append(self.tags_cache['Exit'])
            
            # Assign tags
            for tag in tags_to_assign:
                if self._assign_tag_to_entity(tag, 'trade', trade.id):
                    assigned += 1
        
        if self.verbose:
            print(f"      ✅ שויכו תגיות ל-{assigned} טריידים")
    
    def _assign_tag_to_entity(self, tag: Tag, entity_type: str, entity_id: int) -> bool:
        """משייך תגית לישות (אם עוד לא משויכת)"""
        # Check if already assigned
        existing = self.db.query(TagLink).filter(
            TagLink.tag_id == tag.id,
            TagLink.entity_type == entity_type,
            TagLink.entity_id == entity_id
        ).first()
        
        if existing:
            return False
        
        # Create link
        tag_link = TagLink(
            tag_id=tag.id,
            entity_type=entity_type,
            entity_id=entity_id,
            created_by=self.user_id
        )
        self.db.add(tag_link)
        
        # Update tag usage count
        tag.usage_count += 1
        tag.last_used_at = tag.created_at
        
        self.created_count['links'] += 1
        return True

# ============================================================================
# Main Entry Point
# ============================================================================

def _build_engine_kwargs():
    """בונה פרמטרים ל-engine עבור PostgreSQL"""
    return {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }

def main():
    parser = argparse.ArgumentParser(
        description='Create beautiful tags for TikTrack demo data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without creating tags'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    parser.add_argument(
        '--username',
        type=str,
        help='Username to create tags for (if not provided, uses first user for backward compatibility)'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🏷️  TikTrack - יצירת תגיות לנתוני דוגמה")
    print("=" * 70)
    print()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        creator = DemoTagCreator(db, dry_run=args.dry_run, verbose=args.verbose, username=args.username)
        results = creator.create_all()
        
        print()
        print("=" * 70)
        print("📊 סיכום:")
        print("=" * 70)
        print(f"   קטגוריות: {results['categories']}")
        print(f"   תגיות: {results['tags']}")
        print(f"   קישורים: {results['links']}")
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת תגיות: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()

