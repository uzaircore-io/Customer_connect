"""
Automated Unit Tests for MultiMatch Pro Smart Ranking & Priority Sorting
Tests normalized scoring, adjustable weights, priority-order cascading, and Why This Vendor breakdown.
"""

import unittest
from core.matching import rank_vendors_weighted, rank_vendors_priority_order, calculate_normalized_scores


class TestMultiMatchRanking(unittest.TestCase):
    def setUp(self):
        self.vendors = [
            {
                "id": 1,
                "name": "High Rating / High Price",
                "avg_rating": 4.9,
                "distance_km": 4.0,
                "starting_price": 12000.0,
                "review_count": 85,
                "verified": 1,
                "is_open_now": True,
                "total_stock": 10,
            },
            {
                "id": 2,
                "name": "Low Price / Near Distance",
                "avg_rating": 4.2,
                "distance_km": 0.8,
                "starting_price": 2500.0,
                "review_count": 20,
                "verified": 0,
                "is_open_now": True,
                "total_stock": 5,
            },
        ]

    def test_normalized_scores_in_range(self):
        """Ensure all normalized scores are strictly between 0.0 and 1.0."""
        scored = calculate_normalized_scores(self.vendors)
        self.assertEqual(len(scored), 2)
        for s in scored:
            self.assertGreaterEqual(s["_norm_rating"], 0.0)
            self.assertLessEqual(s["_norm_rating"], 1.0)
            self.assertGreaterEqual(s["_norm_distance"], 0.0)
            self.assertLessEqual(s["_norm_distance"], 1.0)
            self.assertGreaterEqual(s["_norm_price"], 0.0)
            self.assertLessEqual(s["_norm_price"], 1.0)

    def test_weighted_ranking_prioritizes_rating(self):
        """When rating weight is heavy (80%), highest rated vendor must rank #1."""
        ranked = rank_vendors_weighted(
            self.vendors,
            weights={"rating": 0.80, "distance": 0.10, "price": 0.05, "trust": 0.05}
        )
        self.assertEqual(ranked[0]["id"], 1)
        self.assertTrue("Rating Score" in ranked[0]["compatibility_breakdown"])

    def test_weighted_ranking_prioritizes_distance(self):
        """When distance weight is heavy (80%), nearest vendor must rank #1."""
        ranked = rank_vendors_weighted(
            self.vendors,
            weights={"rating": 0.05, "distance": 0.80, "price": 0.10, "trust": 0.05}
        )
        self.assertEqual(ranked[0]["id"], 2)

    def test_priority_order_sorting(self):
        """Test cascading criteria sorting without weighted formulas."""
        # Lowest Price first
        ranked = rank_vendors_priority_order(self.vendors, priorities=["Lowest Price", "Highest Rating"])
        self.assertEqual(ranked[0]["id"], 2)

        # Highest Rating first
        ranked_r = rank_vendors_priority_order(self.vendors, priorities=["Highest Rating", "Nearest Distance"])
        self.assertEqual(ranked_r[0]["id"], 1)


if __name__ == "__main__":
    unittest.main()
