"""
Migration: Seed Trading Methods and Parameters
Date: 2025-11-11
Description: Seeds core trading methods and parameter definitions for the
conditions and reasons system. The script is idempotent and will only insert
records when the tables are empty.
"""

import json
import os
import sqlite3
from datetime import datetime


METHODS_DEFINITION = [
    {
        "name_en": "Moving Averages",
        "name_he": "ממוצעים נעים",
        "category": "technical_indicators",
        "description_en": "Evaluate price action relative to configurable moving averages.",
        "description_he": "ניתוח תנועת מחיר ביחס לממוצעים נעים ניתנים להגדרה.",
        "icon_class": "fa-chart-line",
        "sort_order": 10,
        "parameters": [
            {
                "parameter_key": "ma_period",
                "parameter_name_en": "Moving Average Period",
                "parameter_name_he": "תקופת ממוצע נע",
                "parameter_type": "period",
                "default_value": "20",
                "min_value": "1",
                "max_value": "200",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 1
            },
            {
                "parameter_key": "ma_type",
                "parameter_name_en": "Moving Average Type",
                "parameter_name_he": "סוג ממוצע נע",
                "parameter_type": "dropdown",
                "default_value": "SMA",
                "validation_rule": json.dumps({"allowed_values": ["SMA", "EMA", "WMA"]}, ensure_ascii=False),
                "is_required": True,
                "sort_order": 2
            },
            {
                "parameter_key": "comparison_type",
                "parameter_name_en": "Comparison Type",
                "parameter_name_he": "סוג השוואה",
                "parameter_type": "dropdown",
                "default_value": "above",
                "validation_rule": json.dumps(
                    {"allowed_values": ["above", "below", "cross_up", "cross_down"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 3
            }
        ]
    },
    {
        "name_en": "Volume Analysis",
        "name_he": "ניתוח נפח",
        "category": "volume_analysis",
        "description_en": "Identify unusual trading activity based on configurable volume thresholds.",
        "description_he": "זיהוי פעילות מסחר חריגה על בסיס ספי נפח מוגדרים.",
        "icon_class": "fa-water",
        "sort_order": 20,
        "parameters": [
            {
                "parameter_key": "volume_period",
                "parameter_name_en": "Volume Lookback Period",
                "parameter_name_he": "תקופת נפח להשוואה",
                "parameter_type": "period",
                "default_value": "20",
                "min_value": "5",
                "max_value": "200",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 1
            },
            {
                "parameter_key": "volume_multiplier",
                "parameter_name_en": "Volume Multiplier",
                "parameter_name_he": "מכפיל נפח",
                "parameter_type": "number",
                "default_value": "1.5",
                "min_value": "0.1",
                "max_value": "10",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 2
            },
            {
                "parameter_key": "comparison_type",
                "parameter_name_en": "Comparison Type",
                "parameter_name_he": "סוג השוואה",
                "parameter_type": "dropdown",
                "default_value": "above",
                "validation_rule": json.dumps(
                    {"allowed_values": ["above", "below"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 3
            }
        ]
    },
    {
        "name_en": "Support & Resistance",
        "name_he": "תמיכה והתנגדות",
        "category": "support_resistance",
        "description_en": "Track proximity and interaction with key price levels.",
        "description_he": "מעקב אחר קרבה והתנהגות סביב רמות מחיר מרכזיות.",
        "icon_class": "fa-bullseye",
        "sort_order": 30,
        "parameters": [
            {
                "parameter_key": "level_price",
                "parameter_name_en": "Level Price",
                "parameter_name_he": "מחיר רמה",
                "parameter_type": "price",
                "default_value": None,
                "validation_rule": None,
                "is_required": True,
                "sort_order": 1
            },
            {
                "parameter_key": "level_type",
                "parameter_name_en": "Level Type",
                "parameter_name_he": "סוג רמה",
                "parameter_type": "dropdown",
                "default_value": "support",
                "validation_rule": json.dumps(
                    {"allowed_values": ["support", "resistance"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 2
            },
            {
                "parameter_key": "tolerance_pct",
                "parameter_name_en": "Tolerance (%)",
                "parameter_name_he": "אחוז סבילות",
                "parameter_type": "percentage",
                "default_value": "2.0",
                "min_value": "0.1",
                "max_value": "10",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 3
            },
            {
                "parameter_key": "comparison_type",
                "parameter_name_en": "Comparison Type",
                "parameter_name_he": "סוג השוואה",
                "parameter_type": "dropdown",
                "default_value": "near",
                "validation_rule": json.dumps(
                    {"allowed_values": ["near", "above", "below", "break_up", "break_down"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 4
            }
        ]
    },
    {
        "name_en": "Trend Lines",
        "name_he": "קווי מגמה",
        "category": "trend_analysis",
        "description_en": "Evaluate price interaction with calculated trend lines.",
        "description_he": "הערכת התנהגות המחיר מול קווי מגמה מחושבים.",
        "icon_class": "fa-chart-trend-up",
        "sort_order": 40,
        "parameters": [
            {
                "parameter_key": "trend_type",
                "parameter_name_en": "Trend Type",
                "parameter_name_he": "סוג מגמה",
                "parameter_type": "dropdown",
                "default_value": "uptrend",
                "validation_rule": json.dumps(
                    {"allowed_values": ["uptrend", "downtrend"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 1
            },
            {
                "parameter_key": "lookback_period",
                "parameter_name_en": "Lookback Period",
                "parameter_name_he": "תקופת בדיקה",
                "parameter_type": "period",
                "default_value": "20",
                "min_value": "10",
                "max_value": "200",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 2
            },
            {
                "parameter_key": "comparison_type",
                "parameter_name_en": "Comparison Type",
                "parameter_name_he": "סוג השוואה",
                "parameter_type": "dropdown",
                "default_value": "bounce",
                "validation_rule": json.dumps(
                    {"allowed_values": ["bounce", "break_up", "break_down"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 3
            },
            {
                "parameter_key": "tolerance_pct",
                "parameter_name_en": "Tolerance (%)",
                "parameter_name_he": "אחוז סבילות",
                "parameter_type": "percentage",
                "default_value": "3.0",
                "min_value": "0.5",
                "max_value": "10",
                "validation_rule": None,
                "is_required": False,
                "sort_order": 4
            }
        ]
    },
    {
        "name_en": "Technical Patterns",
        "name_he": "דפוסים טכניים",
        "category": "price_patterns",
        "description_en": "Detect classical technical patterns with configurable confidence.",
        "description_he": "זיהוי דפוסים טכניים קלאסיים עם רמת ביטחון ניתנת להגדרה.",
        "icon_class": "fa-wave-square",
        "sort_order": 50,
        "parameters": [
            {
                "parameter_key": "pattern_type",
                "parameter_name_en": "Pattern Type",
                "parameter_name_he": "סוג דפוס",
                "parameter_type": "dropdown",
                "default_value": "cup_handle",
                "validation_rule": json.dumps(
                    {"allowed_values": ["cup_handle", "head_shoulders", "triangle"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 1
            },
            {
                "parameter_key": "lookback_period",
                "parameter_name_en": "Lookback Period",
                "parameter_name_he": "תקופת בדיקה",
                "parameter_type": "period",
                "default_value": "30",
                "min_value": "10",
                "max_value": "200",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 2
            }
        ]
    },
    {
        "name_en": "Fibonacci Retracement",
        "name_he": "פיבונאצ'י",
        "category": "fibonacci",
        "description_en": "Monitor Fibonacci retracement zones and golden levels.",
        "description_he": "מעקב אחר אזורי פיבונאצ'י ואזורי הזהב.",
        "icon_class": "fa-divide",
        "sort_order": 60,
        "parameters": [
            {
                "parameter_key": "lookback_period",
                "parameter_name_en": "Lookback Period",
                "parameter_name_he": "תקופת בדיקה",
                "parameter_type": "period",
                "default_value": "20",
                "min_value": "10",
                "max_value": "200",
                "validation_rule": None,
                "is_required": True,
                "sort_order": 1
            },
            {
                "parameter_key": "comparison_type",
                "parameter_name_en": "Comparison Type",
                "parameter_name_he": "סוג השוואה",
                "parameter_type": "dropdown",
                "default_value": "in_zone",
                "validation_rule": json.dumps(
                    {"allowed_values": ["in_zone", "above", "below"]},
                    ensure_ascii=False
                ),
                "is_required": True,
                "sort_order": 2
            },
            {
                "parameter_key": "fib_type",
                "parameter_name_en": "Fibonacci Type",
                "parameter_name_he": "סוג פיבונאצ'י",
                "parameter_type": "dropdown",
                "default_value": "retracement",
                "validation_rule": json.dumps(
                    {"allowed_values": ["retracement", "extension"]},
                    ensure_ascii=False
                ),
                "is_required": False,
                "sort_order": 3
            }
        ]
    }
]


def seed_methods(connection: sqlite3.Connection) -> None:
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM trading_methods")
    existing_methods = cursor.fetchone()[0]

    if existing_methods > 0:
        return

    timestamp = datetime.utcnow().isoformat()

    for method in METHODS_DEFINITION:
        cursor.execute(
            """
            INSERT INTO trading_methods (
                name_en, name_he, category,
                description_en, description_he,
                icon_class, is_active, sort_order,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            """,
            (
                method["name_en"],
                method["name_he"],
                method["category"],
                method["description_en"],
                method["description_he"],
                method["icon_class"],
                method["sort_order"],
                timestamp,
                timestamp,
            ),
        )

        method_id = cursor.lastrowid

        for param in method["parameters"]:
            cursor.execute(
                """
                INSERT INTO method_parameters (
                    method_id,
                    parameter_key,
                    parameter_name_en,
                    parameter_name_he,
                    parameter_type,
                    default_value,
                    min_value,
                    max_value,
                    validation_rule,
                    is_required,
                    sort_order,
                    help_text_en,
                    help_text_he,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    method_id,
                    param["parameter_key"],
                    param["parameter_name_en"],
                    param["parameter_name_he"],
                    param["parameter_type"],
                    param.get("default_value"),
                    param.get("min_value"),
                    param.get("max_value"),
                    param.get("validation_rule"),
                    1 if param.get("is_required", True) else 0,
                    param.get("sort_order", 0),
                    param.get("help_text_en"),
                    param.get("help_text_he"),
                    timestamp,
                    timestamp,
                ),
            )

    connection.commit()


def upgrade():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")

    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database not found at {db_path}")

    connection = sqlite3.connect(db_path)
    try:
        seed_methods(connection)
        print("✅ Trading methods master data seeded successfully.")
    finally:
        connection.close()


def downgrade():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")

    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database not found at {db_path}")

    connection = sqlite3.connect(db_path)
    try:
        cursor = connection.cursor()
        method_names = tuple(method["name_en"] for method in METHODS_DEFINITION)
        cursor.execute(
            f"DELETE FROM method_parameters WHERE method_id IN (SELECT id FROM trading_methods WHERE name_en IN ({','.join(['?'] * len(method_names))}))",
            method_names,
        )
        cursor.execute(
            f"DELETE FROM trading_methods WHERE name_en IN ({','.join(['?'] * len(method_names))})",
            method_names,
        )
        connection.commit()
        print("↩️ Trading methods master data rolled back.")
    finally:
        connection.close()


if __name__ == "__main__":
    upgrade()

