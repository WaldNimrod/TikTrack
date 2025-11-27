#!/usr/bin/env python3
"""
סקריפט חקירה מעמיקה של בעיית Session Management

מטרה: לזהות מדויק את הבעיה שגורמת ל-query להחזיר רק 1 רשומה במקום 120
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask, g
from config.database import get_db, engine, SessionLocal
from sqlalchemy import text, event
from sqlalchemy.orm import Session
from models.trade_plan import TradePlan
from services.trade_plan_service import TradePlanService
import logging
from datetime import datetime

# הפעלת לוגים מפורטים
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# הוספת event listeners לניטור
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    logger.info(f"🔌 CONNECTION EVENT: New connection created")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.info(f"📤 CHECKOUT EVENT: Connection checked out from pool")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    logger.info(f"📥 CHECKIN EVENT: Connection checked in to pool")

@event.listens_for(Session, "after_begin")
def receive_after_begin(session, transaction, connection):
    logger.info(f"🟢 AFTER_BEGIN: Session {id(session)} began transaction")

@event.listens_for(Session, "after_rollback")
def receive_after_rollback(session):
    logger.info(f"🔴 AFTER_ROLLBACK: Session {id(session)} rolled back")

@event.listens_for(Session, "after_commit")
def receive_after_commit(session):
    logger.info(f"✅ AFTER_COMMIT: Session {id(session)} committed")

@event.listens_for(TradePlan, 'load')
def receive_load(target, context):
    logger.info(f"🔵 LOAD: TradePlan {target.id} loaded")

def print_section(title):
    """הדפסת כותרת סעיף"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def investigate():
    """חקירה מעמיקה של הבעיה"""
    
    print_section("חקירה מעמיקה - Session Management Issue")
    
    # שלב 1: בדיקת Connection Pool
    print_section("שלב 1: בדיקת Connection Pool")
    print(f"Pool size: {engine.pool.size()}")
    print(f"Pool checked out: {engine.pool.checkedout()}")
    print(f"Pool overflow: {engine.pool.overflow()}")
    print(f"Pool checked in: {engine.pool.checkedin()}")
    
    # שלב 2: בדיקת ישירה ב-DB
    print_section("שלב 2: בדיקה ישירה ב-DB")
    direct_db = SessionLocal()
    try:
        count = direct_db.execute(text("SELECT COUNT(*) FROM trade_plans")).scalar()
        print(f"✅ Direct DB query: {count} תוכניות")
    finally:
        direct_db.close()
    
    # שלב 3: בדיקה דרך Flask Context
    print_section("שלב 3: בדיקה דרך Flask Context")
    app = Flask(__name__)
    
    with app.app_context():
        db = next(get_db())
        g.db = db
        
        print(f"Session ID: {id(db)}")
        print(f"Identity map size: {len(db.identity_map)}")
        print(f"Transaction active: {db.in_transaction()}")
        
        # בדיקת SQL count
        count_sql = db.execute(text("SELECT COUNT(*) FROM trade_plans")).scalar()
        print(f"SQL COUNT: {count_sql}")
        
        # בדיקת ORM count
        count_orm = db.query(TradePlan).count()
        print(f"ORM COUNT: {count_orm}")
        
        # בדיקת ORM all
        all_plans = db.query(TradePlan).limit(10).all()
        print(f"ORM ALL (limit 10): {len(all_plans)} plans")
        
        db.close()
    
    # שלב 4: בדיקה דרך Service
    print_section("שלב 4: בדיקה דרך TradePlanService")
    with app.app_context():
        db = next(get_db())
        g.db = db
        
        print(f"Session ID: {id(db)}")
        
        # קריאה ל-service
        plans = TradePlanService.get_all(db)
        print(f"Service.get_all() returned: {len(plans)} plans")
        
        db.close()
    
    # שלב 5: בדיקה של מספר sessions
    print_section("שלב 5: בדיקת Session Reuse")
    sessions = []
    for i in range(3):
        db = SessionLocal()
        sessions.append((i+1, id(db), db))
        count = db.query(TradePlan).count()
        print(f"Session {i+1}: ID={id(db)}, COUNT={count}")
    
    for _, _, db in sessions:
        db.close()
    
    print_section("סיום חקירה")
    print("✅ החקירה הושלמה")

if __name__ == "__main__":
    investigate()

