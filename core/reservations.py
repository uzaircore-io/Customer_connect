"""
CustomerConnect — ReserveNow Product Pre-booking & Inventory Engine
Atomically reserves stock, enforces quantity constraints, and restores stock on cancellation.
"""

import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any
from database.connection import get_db_connection


def create_product_reservation(
    db_path: str,
    business_id: int,
    product_id: int,
    quantity: int,
    customer_name: str,
    customer_phone: str,
    customer_email: str,
    fulfillment_type: str = "Pickup",
    payment_preference: str = "Pay at Pickup",
    expiry_hours: int = 48
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    ReserveNow workflow:
    1. Verify product has sufficient available stock (stock - reserved_stock >= quantity).
    2. Atomically increment reserved_stock.
    3. Insert reservation record with expiration timestamp.
    4. Create linked pending payment record.
    Returns (success, message, reservation_details).
    """
    if quantity <= 0:
        return False, "Quantity must be greater than zero.", {}

    if not customer_name.strip() or not customer_phone.strip():
        return False, "Customer name and phone number are required.", {}

    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()

        # Step 1: Check available stock with write lock
        cursor.execute(
            "SELECT name, price, stock, reserved_stock FROM products WHERE id = ? AND business_id = ? AND is_active = 1",
            (product_id, business_id)
        )
        product = cursor.fetchone()
        if not product:
            return False, "Product not found or inactive.", {}

        available_stock = product["stock"] - product["reserved_stock"]
        if available_stock < quantity:
            return False, f"Insufficient stock. Only {available_stock} items currently available for reservation.", {}

        # Step 2: Atomic stock reservation
        cursor.execute(
            "UPDATE products SET reserved_stock = reserved_stock + ? WHERE id = ?",
            (quantity, product_id)
        )

        # Step 3: Insert reservation
        res_code = f"CC-RES-{uuid.uuid4().hex[:6].upper()}"
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=expiry_hours)).isoformat()

        cursor.execute(
            """
            INSERT INTO reservations (
                reservation_code, business_id, product_id, quantity,
                customer_name, customer_phone, customer_email,
                fulfillment_type, payment_preference, status, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
            """,
            (
                res_code, business_id, product_id, quantity,
                customer_name, customer_phone, customer_email,
                fulfillment_type, payment_preference, expires_at
            )
        )
        res_id = cursor.lastrowid

        # Step 4: Record associated payment tracking entry
        pay_method = "Pay at Pickup" if payment_preference == "Pay at Pickup" else ("Demo Online" if payment_preference == "Demo Paid" else "Cash on Delivery")
        pay_status = "Demo Paid" if payment_preference == "Demo Paid" else ("Pending at Pickup" if payment_preference == "Pay at Pickup" else "Pending COD")
        total_val = product["price"] * quantity

        cursor.execute(
            """
            INSERT INTO payments (
                reservation_id, amount, payment_method, payment_status, transaction_ref, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (res_id, total_val, pay_method, pay_status, f"PAY-{uuid.uuid4().hex[:8].upper()}", "ReserveNow Pre-booking")
        )

        conn.commit()

        details = {
            "reservation_code": res_code,
            "product_name": product["name"],
            "quantity": quantity,
            "unit_price": product["price"],
            "total_price": total_val,
            "fulfillment": fulfillment_type,
            "payment_preference": payment_preference,
            "payment_status": pay_status,
            "expires_at": expires_at,
            "customer_name": customer_name,
        }
        return True, "Reservation confirmed! Item reserved exclusively for you.", details

    except Exception as e:
        conn.rollback()
        return False, f"Failed to reserve product: {str(e)}", {}
    finally:
        conn.close()


def cancel_reservation(db_path: str, reservation_code: str) -> Tuple[bool, str]:
    """
    Cancel reservation and restore reserved inventory.
    """
    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, product_id, quantity, status FROM reservations WHERE reservation_code = ?", (reservation_code,))
        res = cursor.fetchone()
        if not res:
            return False, "Reservation code not found."

        if res["status"] in ("Cancelled", "Collected", "Expired"):
            return False, f"Cannot cancel reservation in '{res['status']}' state."

        # Restore reserved inventory
        cursor.execute(
            "UPDATE products SET reserved_stock = MAX(0, reserved_stock - ?) WHERE id = ?",
            (res["quantity"], res["product_id"])
        )

        cursor.execute("UPDATE reservations SET status = 'Cancelled' WHERE id = ?", (res["id"],))

        # Update payment status if pending
        cursor.execute(
            "UPDATE payments SET payment_status = 'Refunded (demo)' WHERE reservation_id = ? AND payment_status = 'Demo Paid'",
            (res["id"],)
        )

        conn.commit()
        return True, "Reservation cancelled and inventory restored."

    except Exception as e:
        conn.rollback()
        return False, f"Error cancelling reservation: {str(e)}"
    finally:
        conn.close()
