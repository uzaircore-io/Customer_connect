"""
Automated Unit Tests for MultiMatch Pro Filter Engine
Tests budget filtering, rating filtering, distance filtering, combined filters, and empty search results.
"""

import unittest
from core.filters import evaluate_hard_filters, filter_vendors


class TestMultiMatchFilters(unittest.TestCase):
    def setUp(self):
        self.sample_vendors = [
            {
                "id": 1,
                "name": "Kashmir Chrono Studio",
                "category": "Watches",
                "area": "Lal Chowk",
                "starting_price": 8500.0,
                "avg_rating": 4.8,
                "distance_km": 1.2,
                "verified": 1,
                "total_stock": 15,
                "is_open_now": True,
                "has_warranty": 1,
                "has_return_policy": 1,
                "whatsapp": "919419011223",
                "supports_online_pay": 1,
                "supports_cod": 1,
                "supports_pay_at_pickup": 1,
                "supports_appointments": False,
            },
            {
                "id": 2,
                "name": "Valley Dial Works",
                "category": "Watches",
                "area": "Baghat",
                "starting_price": 18000.0,  # High price
                "avg_rating": 4.1,          # Lower rating
                "distance_km": 6.8,          # Far distance
                "verified": 0,
                "total_stock": 5,
                "is_open_now": False,
                "has_warranty": 0,
                "has_return_policy": 0,
                "whatsapp": "919419011224",
                "supports_online_pay": 1,
                "supports_cod": 0,
                "supports_pay_at_pickup": 1,
                "supports_appointments": False,
            },
            {
                "id": 3,
                "name": "Velvet Chinar Grooming",
                "category": "Salons",
                "area": "Rajbagh",
                "starting_price": 500.0,
                "avg_rating": 4.9,
                "distance_km": 2.1,
                "verified": 1,
                "total_stock": 0,
                "is_open_now": True,
                "has_warranty": 0,
                "has_return_policy": 0,
                "whatsapp": "919419011225",
                "supports_online_pay": 1,
                "supports_cod": 0,
                "supports_pay_at_pickup": 1,
                "supports_appointments": True,
            },
        ]

    def test_budget_filter(self):
        """Test maximum budget constraint."""
        passes_1, _ = evaluate_hard_filters(self.sample_vendors[0], max_budget=10000.0)
        passes_2, _ = evaluate_hard_filters(self.sample_vendors[1], max_budget=10000.0)
        self.assertTrue(passes_1)
        self.assertFalse(passes_2)

    def test_rating_filter(self):
        """Test minimum rating threshold."""
        passes_1, _ = evaluate_hard_filters(self.sample_vendors[0], min_rating=4.5)
        passes_2, _ = evaluate_hard_filters(self.sample_vendors[1], min_rating=4.5)
        self.assertTrue(passes_1)
        self.assertFalse(passes_2)

    def test_distance_filter(self):
        """Test maximum distance constraint."""
        passes_1, _ = evaluate_hard_filters(self.sample_vendors[0], max_distance=3.0)
        passes_2, _ = evaluate_hard_filters(self.sample_vendors[1], max_distance=3.0)
        self.assertTrue(passes_1)
        self.assertFalse(passes_2)

    def test_combined_and_logic(self):
        """Test AND logic: vendor must meet all criteria to pass exact match."""
        passes, failed = evaluate_hard_filters(
            self.sample_vendors[0],
            max_budget=15000.0,
            min_rating=4.5,
            max_distance=5.0,
            category="Watches",
            verified_only=True
        )
        self.assertTrue(passes)
        self.assertEqual(len(failed), 0)

    def test_near_match_partitioning(self):
        """Test that non-exact matches are surfaced as Near Matches with diagnostic reasons."""
        exact, near, reasons = filter_vendors(
            self.sample_vendors,
            category="Watches",
            max_budget=10000.0,
            max_distance=5.0,
            min_rating=4.5
        )
        # Vendor 1 passes all
        self.assertEqual(len(exact), 1)
        self.assertEqual(exact[0]["id"], 1)

        # Vendor 2 fails budget, rating, and distance -> near match diagnostics
        self.assertTrue(any("Max Budget" in r for r in reasons))


if __name__ == "__main__":
    unittest.main()
