"""
Automated Unit Tests for SlotGuard Universal Appointment Engine
Tests concurrency protection, conflict prevention, and slot cancellation in SQLite.
"""

import unittest
import tempfile
import os
from database.connection import initialize_database, get_db_connection
from core.bookings import book_appointment_slot, cancel_appointment


class TestSlotGuard(unittest.TestCase):
    def setUp(self):
        # Create temporary isolated SQLite database
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.db_path = self.temp_db.name
        self.temp_db.close()
        initialize_database(self.db_path)

        # Seed sample business, service, and slot
        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO businesses (name, category, area, address, latitude, longitude, phone, whatsapp, email)
            VALUES ('Demo Salon', 'Salons', 'Rajbagh', 'Rajbagh Main', 34.062, 74.825, '+919419011111', '919419011111', 'salon@demo.local')
            """
        )
        self.biz_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO services (business_id, name, category, price, duration_minutes) VALUES (?, 'Haircut', 'Salons', 400.0, 30)",
            (self.biz_id,)
        )
        self.service_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO appointment_slots (business_id, slot_date, start_time, end_time, is_booked) VALUES (?, '2026-11-01', '10:00', '11:00', 0)",
            (self.biz_id,)
        )
        self.slot_id = cursor.lastrowid
        conn.commit()
        conn.close()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_first_booking_succeeds(self):
        """Standard valid booking succeeds and reserves the slot."""
        success, msg, details = book_appointment_slot(
            self.db_path, self.biz_id, self.service_id, self.slot_id,
            "Customer One", "+919419000001", "one@demo.local"
        )
        self.assertTrue(success)
        self.assertIn("confirmed", msg.lower())
        self.assertTrue(details["booking_reference"].startswith("CC-APT-"))

    def test_duplicate_booking_fails_slotguard(self):
        """Second attempt to book the exact same slot must be rejected by SlotGuard."""
        # First customer books
        ok1, _, _ = book_appointment_slot(
            self.db_path, self.biz_id, self.service_id, self.slot_id,
            "Customer One", "+919419000001", "one@demo.local"
        )
        self.assertTrue(ok1)

        # Second customer attempts to book the same slot
        ok2, msg2, _ = book_appointment_slot(
            self.db_path, self.biz_id, self.service_id, self.slot_id,
            "Customer Two", "+919419000002", "two@demo.local"
        )
        self.assertFalse(ok2)
        self.assertTrue("conflict" in msg2.lower() or "already" in msg2.lower() or "claimed" in msg2.lower())

    def test_cancel_appointment_frees_slot(self):
        """Cancelling an appointment frees the slot so another customer can book."""
        ok1, _, details = book_appointment_slot(
            self.db_path, self.biz_id, self.service_id, self.slot_id,
            "Customer One", "+919419000001", "one@demo.local"
        )
        self.assertTrue(ok1)

        cancel_ok, _ = cancel_appointment(self.db_path, details["booking_reference"])
        self.assertTrue(cancel_ok)

        # Now Customer Two can successfully book the freed slot
        ok2, _, details2 = book_appointment_slot(
            self.db_path, self.biz_id, self.service_id, self.slot_id,
            "Customer Two", "+919419000002", "two@demo.local"
        )
        self.assertTrue(ok2)
        self.assertNotEqual(details["booking_reference"], details2["booking_reference"])


if __name__ == "__main__":
    unittest.main()
