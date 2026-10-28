"""
Automated Unit Tests for ReserveNow Product Reservation Engine
Tests stock constraints, inventory reservation lock, and stock restoration on cancellation.
"""

import unittest
import tempfile
import os
from database.connection import initialize_database, get_db_connection
from core.reservations import create_product_reservation, cancel_reservation


class TestReserveNow(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.db_path = self.temp_db.name
        self.temp_db.close()
        initialize_database(self.db_path)

        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO businesses (name, category, area, address, latitude, longitude, phone, whatsapp, email)
            VALUES ('Demo Watch Shop', 'Watches', 'Lal Chowk', 'Main Market', 34.072, 74.810, '+919419011111', '919419011111', 'watch@demo.local')
            """
        )
        self.biz_id = cursor.lastrowid

        # Product with stock of 5
        cursor.execute(
            """
            INSERT INTO products (business_id, name, category, price, stock, reserved_stock, is_active)
            VALUES (?, 'Heritage Chrono', 'Watches', 8000.0, 5, 0, 1)
            """,
            (self.biz_id,)
        )
        self.prod_id = cursor.lastrowid
        conn.commit()
        conn.close()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_reservation_locks_stock(self):
        """Reserving 3 items increments reserved_stock from 0 to 3."""
        ok, msg, det = create_product_reservation(
            self.db_path, self.biz_id, self.prod_id, 3,
            "Aadil", "+919419011001", "aadil@demo.local"
        )
        self.assertTrue(ok)
        self.assertIn("confirmed", msg.lower())

        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT stock, reserved_stock FROM products WHERE id = ?", (self.prod_id,))
        p = cursor.fetchone()
        conn.close()

        self.assertEqual(p["stock"], 5)
        self.assertEqual(p["reserved_stock"], 3)

    def test_reservation_exceeding_stock_fails(self):
        """Attempting to reserve more than available inventory (5 - 3 = 2 left) fails gracefully."""
        # Reserve 3 items first
        create_product_reservation(
            self.db_path, self.biz_id, self.prod_id, 3,
            "Aadil", "+919419011001", "aadil@demo.local"
        )

        # Attempt to reserve 3 more items (only 2 left)
        ok2, msg2, _ = create_product_reservation(
            self.db_path, self.biz_id, self.prod_id, 3,
            "Zubair", "+919419011002", "zubair@demo.local"
        )
        self.assertFalse(ok2)
        self.assertIn("insufficient", msg2.lower())

    def test_cancellation_restores_stock(self):
        """Cancelling a reservation restores reserved_stock back to available pool."""
        ok, _, det = create_product_reservation(
            self.db_path, self.biz_id, self.prod_id, 2,
            "Aadil", "+919419011001", "aadil@demo.local"
        )
        self.assertTrue(ok)

        cancel_ok, _ = cancel_reservation(self.db_path, det["reservation_code"])
        self.assertTrue(cancel_ok)

        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT reserved_stock FROM products WHERE id = ?", (self.prod_id,))
        p = cursor.fetchone()
        conn.close()

        self.assertEqual(p["reserved_stock"], 0)


if __name__ == "__main__":
    unittest.main()
