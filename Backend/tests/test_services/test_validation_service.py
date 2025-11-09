import unittest

from services.validation_service import ValidationService


class TestValidationServiceHelpers(unittest.TestCase):
    """Unit tests for lightweight validation helpers used post-normalization."""

    def test_validate_not_null(self):
        self.assertTrue(ValidationService._validate_not_null("value"))
        self.assertFalse(ValidationService._validate_not_null(""))
        self.assertFalse(ValidationService._validate_not_null(None))

    def test_validate_range(self):
        definition = "amount >= 0 AND amount <= 100"
        self.assertTrue(ValidationService._validate_range(50, definition))
        self.assertFalse(ValidationService._validate_range(-5, definition))
        self.assertFalse(ValidationService._validate_range(150, definition))


if __name__ == "__main__":
    unittest.main()

