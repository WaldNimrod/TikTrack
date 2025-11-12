import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app, create_app, db
from sqlalchemy import text
from config.settings import DATABASE_URL


def test_create_app_binds_in_memory_sqlite():
    test_app = create_app({"SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    assert test_app is app

    session = db.session
    try:
        bound_url = str(session.bind.url)
        assert bound_url.startswith("sqlite"), f"Unexpected bind URL: {bound_url}"
        session.execute(text("SELECT 1"))
    finally:
        db.remove()
        # Restore the global SQLAlchemy binding so subsequent tests use the project database
        test_app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
        create_app({"SQLALCHEMY_DATABASE_URI": DATABASE_URL})
        db.ensure()
