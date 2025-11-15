#!/usr/bin/env python3
"""
Tag Service Tests - TikTrack
============================

Unit tests for TagService helper utilities that handle tag ID normalization
and cleanup routines used during entity deletion flows.
"""

import unittest
from unittest.mock import MagicMock

import os
import sys

from sqlalchemy import create_engine, CheckConstraint
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.tag_service import TagService  # noqa: E402
from models.tag_link import TagLink  # noqa: E402
from models.tag import Tag  # noqa: E402
from models.tag_category import TagCategory  # noqa: E402
from models.base import Base  # noqa: E402
from models.ticker import Ticker  # noqa: E402


class TestTagServiceNormalization(unittest.TestCase):
    """Validate tag ID normalization safeguards."""

    def test_normalize_ids_accepts_string_numbers(self):
        """String values that represent integers should be converted."""
        normalized = TagService._normalize_ids([1, "2", "3", 4])
        self.assertEqual(normalized, {1, 2, 3, 4})

    def test_normalize_ids_rejects_invalid_values(self):
        """Non-numeric values should raise ValueError."""
        with self.assertRaises(ValueError):
            TagService._normalize_ids([1, "abc", 3])

        with self.assertRaises(ValueError):
            TagService._normalize_ids([None, True])


class TestTagServiceCleanup(unittest.TestCase):
    """Ensure cleanup helpers remove tag links as expected."""

    def setUp(self):
        self.mock_session = MagicMock()
        self.mock_query = self.mock_session.query.return_value
        self.mock_filter = self.mock_query.filter.return_value

    def test_remove_all_tags_for_entity_deletes_links(self):
        """remove_all_tags_for_entity should delete tag links for entity."""
        self.mock_filter.delete.return_value = 2

        deleted = TagService.remove_all_tags_for_entity(self.mock_session, 'trade', 123)

        self.assertEqual(deleted, 2)
        self.mock_session.query.assert_called_with(TagLink)
        filter_args, filter_kwargs = self.mock_query.filter.call_args
        self.assertFalse(filter_kwargs)
        self.assertEqual(len(filter_args), 2)
        self.assertEqual(str(filter_args[0]), str(TagLink.entity_type == 'trade'))
        self.assertEqual(str(filter_args[1]), str(TagLink.entity_id == 123))
        self.mock_filter.delete.assert_called_once_with(synchronize_session=False)

    def test_remove_all_tags_for_type_deletes_all_links(self):
        """remove_all_tags_for_type should delete tag links for entity type."""
        self.mock_filter.delete.return_value = 5

        deleted = TagService.remove_all_tags_for_type(self.mock_session, 'trade_plan')

        self.assertEqual(deleted, 5)
        self.mock_session.query.assert_called_with(TagLink)
        filter_args, filter_kwargs = self.mock_query.filter.call_args
        self.assertFalse(filter_kwargs)
        self.assertEqual(len(filter_args), 1)
        self.assertEqual(str(filter_args[0]), str(TagLink.entity_type == 'trade_plan'))
        self.mock_filter.delete.assert_called_once_with(synchronize_session=False)


class TestTagServiceSlugify(unittest.TestCase):
    """Validate slug generation for multilingual names."""

    def test_slugify_preserves_unicode_characters(self):
        """Hebrew names should remain readable and replace spaces with hyphen."""
        slug = TagService._slugify("פיצה טעימה")
        self.assertEqual(slug, "פיצה-טעימה")

    def test_slugify_punycode_fallback_for_non_word_chars(self):
        """Names comprised of emoji/symbols should generate deterministic slug."""
        slug = TagService._slugify("🍕🍕")
        self.assertTrue(slug)
        self.assertEqual(slug, "vi8ha")


class TestTagServiceAggregations(unittest.TestCase):
    """Integration-style tests for aggregation helpers using in-memory SQLite."""

    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        cls.SessionLocal = sessionmaker(bind=cls.engine)
        cls._strip_sqlite_check_constraints()

    @staticmethod
    def _strip_sqlite_check_constraints():
        """Remove unsupported CHECK constraints when using sqlite in-memory."""
        removable_names = {"active_trades_consistency", "ticker_status_auto_update"}
        table = Ticker.__table__
        for constraint in list(table.constraints):
            if isinstance(constraint, CheckConstraint) and constraint.name in removable_names:
                table.constraints.remove(constraint)

    def setUp(self):
        Base.metadata.drop_all(self.engine, checkfirst=True)
        Base.metadata.create_all(self.engine)
        self.session = self.SessionLocal()
        self._seed_data()

    def tearDown(self):
        self.session.close()

    def _seed_data(self):
        category = TagCategory(user_id=1, name="אסטרטגיות", color_hex="#26baac")
        self.session.add(category)
        self.session.flush()

        self.breakout_tag = Tag(
            user_id=1,
            category_id=category.id,
            name="Breakout",
            slug="breakout",
            usage_count=5,
        )
        self.trend_tag = Tag(
            user_id=1,
            category_id=category.id,
            name="Trend Following",
            slug="trend-following",
            usage_count=3,
        )
        self.recent_tag = Tag(
            user_id=1,
            category_id=category.id,
            name="Recent Pick",
            slug="recent-pick",
            usage_count=1,
        )
        self.session.add_all([self.breakout_tag, self.trend_tag, self.recent_tag])
        self.session.flush()

        links = [
            TagLink(tag_id=self.breakout_tag.id, entity_type="trade_plan", entity_id=101),
            TagLink(tag_id=self.breakout_tag.id, entity_type="trade_plan", entity_id=102),
            TagLink(tag_id=self.trend_tag.id, entity_type="trade", entity_id=201),
            TagLink(tag_id=self.recent_tag.id, entity_type="trade_plan", entity_id=103),
        ]
        self.session.add_all(links)
        self.session.commit()

    def test_get_tag_cloud_returns_usage_data(self):
        cloud = TagService.get_tag_cloud_data(self.session, user_id=1, limit=10)
        self.assertEqual(len(cloud), 3)
        self.assertEqual(cloud[0]["name"], "Breakout")
        self.assertEqual(cloud[0]["usage_count"], 5)
        self.assertEqual(cloud[0]["category_name"], "אסטרטגיות")

    def test_search_tags_enforces_minimum_length(self):
        with self.assertRaises(ValueError):
            TagService.search_tags(self.session, user_id=1, query="ב")

    def test_search_tags_returns_assignments(self):
        results = TagService.search_tags(self.session, user_id=1, query="Break")
        self.assertTrue(results)
        first_entry = results[0]
        self.assertEqual(first_entry["tag"]["name"], "Breakout")
        self.assertGreaterEqual(len(first_entry["assignments"]), 1)

    def test_get_smart_suggestions_by_entity(self):
        payload = TagService.get_smart_suggestions(
            self.session,
            user_id=1,
            entity_type="trade_plan",
            entity_id=101,
            limit=3,
        )
        self.assertIn("top_entity_tags", payload)
        self.assertTrue(payload["top_entity_tags"])
        self.assertIn("recent_tags", payload)
        self.assertTrue(payload["recent_tags"])


if __name__ == '__main__':
    unittest.main()

