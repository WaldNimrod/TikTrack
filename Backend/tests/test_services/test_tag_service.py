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

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.tag_service import TagService  # noqa: E402
from models.tag_link import TagLink  # noqa: E402


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


if __name__ == '__main__':
    unittest.main()

