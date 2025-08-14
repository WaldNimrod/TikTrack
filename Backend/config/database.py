from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from .settings import DATABASE_URL

# יצירת engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False
)

# יצירת session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# יצירת base class למודלים
Base = declarative_base()

def get_db():
    """פונקציה לקבלת DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """יצירת כל הטבלאות"""
    from models import ticker, trade, account, trade_plan, alert, cash_flow, note, execution
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
