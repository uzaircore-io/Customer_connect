"""
Automated Unit Tests for Opening Hours & Overnight Schedule Engine
Tests daytime open status, overnight spillover, and closed status in Asia/Kolkata timezone.
"""

import unittest
from datetime import datetime
from core.opening_hours import is_business_open_now


class TestOpeningHours(unittest.TestCase):
    def setUp(self):
        # Schedule: Mon-Sat 09:00-20:00, Sun Closed
        self.standard_schedule = [
            {"day_of_week": d, "is_closed": 0, "open_time": "09:00", "close_time": "20:00", "is_overnight": 0}
            for d in range(6)
        ] + [{"day_of_week": 6, "is_closed": 1, "open_time": "09:00", "close_time": "20:00", "is_overnight": 0}]

        # Overnight schedule: Everyday 18:00 to 02:00
        self.overnight_schedule = [
            {"day_of_week": d, "is_closed": 0, "open_time": "18:00", "close_time": "02:00", "is_overnight": 1}
            for d in range(7)
        ]

    def test_daytime_open_status(self):
        """At 14:00 on Wednesday, standard business must report Open Now."""
        wednesday_2pm = datetime(2026, 10, 28, 14, 0)  # 2026-10-28 is a Wednesday
        is_open, msg = is_business_open_now(self.standard_schedule, current_dt=wednesday_2pm)
        self.assertTrue(is_open)
        self.assertIn("Open Now", msg)

    def test_daytime_closed_after_hours(self):
        """At 22:00 on Wednesday, standard business must report Closed."""
        wednesday_10pm = datetime(2026, 10, 28, 22, 0)
        is_open, msg = is_business_open_now(self.standard_schedule, current_dt=wednesday_10pm)
        self.assertFalse(is_open)
        self.assertIn("Closed", msg)

    def test_overnight_open_status_late_night(self):
        """At 23:30, overnight restaurant must report Open Now."""
        wednesday_1130pm = datetime(2026, 10, 28, 23, 30)
        is_open, msg = is_business_open_now(self.overnight_schedule, current_dt=wednesday_1130pm)
        self.assertTrue(is_open)
        self.assertIn("Open Now", msg)

    def test_overnight_open_status_early_morning_spillover(self):
        """At 01:15 AM (past midnight), overnight restaurant must report Open Now until 02:00 AM."""
        thursday_115am = datetime(2026, 10, 29, 1, 15)
        is_open, msg = is_business_open_now(self.overnight_schedule, current_dt=thursday_115am)
        self.assertTrue(is_open)
        self.assertIn("Open Now", msg)


if __name__ == "__main__":
    unittest.main()
