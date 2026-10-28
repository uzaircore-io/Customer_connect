"""
CustomerConnect — Payment Simulator & Order Processing
Handles Pay Now (demo checkout), Cash on Delivery, and Pay at Pickup.
DISCLAIMER: DEMO SIMULATION ONLY — NO REAL MONEY IS CHARGED.
"""

import uuid
from typing import Tuple, Dict, Any, List
from database.connection import get_db_connection


PAYMENT_DISCLAIMER = "Demo Payment Simulation — No real bank account, card, or UPI credentials charged."


def process_order_checkout(
    db_path: str,
    business_id: int,
    customer_name: str,
    customer_phone: str,
    customer_email: str,
    items: List[Dict[str, Any]],  # [{product_id, quantity, unit_price}]
    fulfillment_type: str,        # "Pickup" or "Delivery"
    payment_method: str,          # "Demo Online", "Cash on Delivery", "Pay at Pickup"
    delivery_address: str = ""
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Execute order checkout:
    1. Calculate totals.
    2. Enforce stock availability & deduct stock.
    3. Insert order record and order_items.
    4. Record payment with independent payment status.
    """
    if not items:
        return False, "Order items cannot be empty.", {}

    if not customer_name.strip() or not customer_phone.strip():
        return False, "Customer name and phone number are required.", {}

    if fulfillment_type == "Delivery" and not delivery_address.strip():
        return False, "Delivery address is required for delivery orders.", {}

    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()

        # Check vendor payment permissions
        cursor.execute("SELECT supports_online_pay, supports_cod, supports_pay_at_pickup FROM businesses WHERE id = ?", (business_id,))
        b_info = cursor.fetchone()
        if not b_info:
            return False, "Business not found.", {}

        if payment_method == "Cash on Delivery" and not b_info["supports_cod"]:
            return False, "Vendor does not support Cash on Delivery.", {}
        if payment_method == "Pay at Pickup" and not b_info["supports_pay_at_pickup"]:
            return False, "Vendor does not support Pay at Pickup.", {}
        if payment_method == "Demo Online" and not b_info["supports_online_pay"]:
            return False, "Vendor does not support Online Payments.", {}

        total_amount = 0.0
        order_items_to_insert = []

        # Validate stock and calculate sum
        for itm in items:
            p_id = itm["product_id"]
            qty = itm["quantity"]

            cursor.execute("SELECT name, price, stock, reserved_stock FROM products WHERE id = ? AND business_id = ?", (p_id, business_id))
            prod = cursor.fetchone()
            if not prod:
                return False, f"Product ID {p_id} not found.", {}

            avail = prod["stock"] - prod["reserved_stock"]
            if avail < qty:
                return False, f"Insufficient stock for {prod['name']}. Available: {avail}, requested: {qty}.", {}

            subtotal = prod["price"] * qty
            total_amount += subtotal
            order_items_to_insert.append((p_id, qty, prod["price"], subtotal))

            # Deduct stock
            cursor.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (qty, p_id))

        order_no = f"CC-ORD-{uuid.uuid4().hex[:6].upper()}"
        cursor.execute(
            """
            INSERT INTO orders (
                order_number, business_id, customer_name, customer_phone,
                customer_email, total_amount, fulfillment_type,
                delivery_address, order_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
            """,
            (
                order_no, business_id, customer_name, customer_phone,
                customer_email, total_amount, fulfillment_type, delivery_address
            )
        )
        order_id = cursor.lastrowid

        # Insert items
        for itm_data in order_items_to_insert:
            cursor.execute(
                """
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
                """,
                (order_id, itm_data[0], itm_data[1], itm_data[2], itm_data[3])
            )

        # Payment status determined independently
        if payment_method == "Demo Online":
            pay_status = "Demo Paid"
        elif payment_method == "Cash on Delivery":
            pay_status = "Pending COD"
        else:
            pay_status = "Pending at Pickup"

        tx_ref = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        cursor.execute(
            """
            INSERT INTO payments (
                order_id, amount, payment_method, payment_status, transaction_ref, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (order_id, total_amount, payment_method, pay_status, tx_ref, PAYMENT_DISCLAIMER)
        )

        conn.commit()

        details = {
            "order_number": order_no,
            "order_id": order_id,
            "total_amount": total_amount,
            "fulfillment": fulfillment_type,
            "payment_method": payment_method,
            "payment_status": pay_status,
            "transaction_ref": tx_ref,
            "disclaimer": PAYMENT_DISCLAIMER,
        }
        return True, "Order confirmed successfully!", details

    except Exception as e:
        conn.rollback()
        return False, f"Checkout failed: {str(e)}", {}
    finally:
        conn.close()
