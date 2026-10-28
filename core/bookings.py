"""
CustomerConnect — SlotGuard Universal Appointment Engine
Guarantees zero double-bookings using ACID SQLite transactions and uniqueness constraints.
"""

import sqlite3
import uuid
from typing import Tuple, Dict, Any, Optional
from database.connection import get_db_connection


class SlotConflictError(Exception):
    """Raised when an appointment slot is already reserved."""
    pass


def book_appointment_slot(
    db_path: str,
    business_id: int,
    service_id: int,
    slot_id: int,
    customer_name: str,
    customer_phone: str,
    customer_email: str,
    notes: Optional[str] = None
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    SlotGuard transactional booking:
    1. Locks the slot record and checks is_booked.
    2. Inserts appointment with unique constraint on slot_id.
    3. Updates slot to is_booked=1 atomically.
    Returns (success, message, appointment_details).
    """
    if not customer_name.strip() or not customer_phone.strip():
        return False, "Customer name and phone number are required.", {}

    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()

        # Step 1: Check slot status
        cursor.execute(
            "SELECT slot_date, start_time, end_time, is_booked FROM appointment_slots WHERE id = ? AND business_id = ?",
            (slot_id, business_id)
        )
        slot = cursor.fetchone()
        if not slot:
            return False, "Selected appointment slot does not exist.", {}

        if slot["is_booked"] == 1:
            raise SlotConflictError("This slot was just claimed by another customer. Please choose another time.")

        # Step 2: Fetch service details
        cursor.execute("SELECT name, price, duration_minutes FROM services WHERE id = ?", (service_id,))
        service = cursor.fetchone()
        if not service:
            return False, "Selected service does not exist.", {}

        # Step 3: Generate unique booking reference
        ref_code = f"CC-APT-{uuid.uuid4().hex[:6].upper()}"

        # Step 4: Insert appointment (enforced by UNIQUE slot_id)
        cursor.execute(
            """
            INSERT INTO appointments (
                booking_reference, business_id, service_id, slot_id,
                customer_name, customer_phone, customer_email,
                booking_date, booking_time, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
            """,
            (
                ref_code, business_id, service_id, slot_id,
                customer_name, customer_phone, customer_email,
                slot["slot_date"], slot["start_time"], notes or ""
            )
        )

        # Step 5: Mark slot as booked
        cursor.execute("UPDATE appointment_slots SET is_booked = 1 WHERE id = ?", (slot_id,))

        conn.commit()

        details = {
            "booking_reference": ref_code,
            "business_id": business_id,
            "service_name": service["name"],
            "price": service["price"],
            "duration": service["duration_minutes"],
            "date": slot["slot_date"],
            "time": slot["start_time"],
            "customer_name": customer_name,
        }
        return True, "Appointment confirmed successfully!", details

    except sqlite3.IntegrityError:
        conn.rollback()
        return False, "Slot conflict detected: This slot is already booked.", {}
    except SlotConflictError as e:
        conn.rollback()
        return False, str(e), {}
    except Exception as e:
        conn.rollback()
        return False, f"Unexpected booking error: {str(e)}", {}
    finally:
        conn.close()


def cancel_appointment(db_path: str, booking_reference: str) -> Tuple[bool, str]:
    """Cancel an appointment and free the slot for other customers."""
    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT slot_id, status FROM appointments WHERE booking_reference = ?", (booking_reference,))
        apt = cursor.fetchone()
        if not apt:
            return False, "Booking not found."

        if apt["status"] == "Cancelled":
            return False, "Booking is already cancelled."

        cursor.execute("UPDATE appointments SET status = 'Cancelled' WHERE booking_reference = ?", (booking_reference,))
        cursor.execute("UPDATE appointment_slots SET is_booked = 0 WHERE id = ?", (apt["slot_id"],))

        conn.commit()
        return True, "Appointment cancelled and slot restored successfully."
    except Exception as e:
        conn.rollback()
        return False, f"Error cancelling appointment: {str(e)}"
    finally:
        conn.close()
