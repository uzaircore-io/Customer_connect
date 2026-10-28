"""
CustomerConnect — Review and Rating Calculation Engine
Handles verified & unverified customer reviews and recalculates business average ratings.
"""

from typing import Tuple, Dict, Any
from database.connection import get_db_connection


def add_business_review(
    db_path: str,
    business_id: int,
    customer_name: str,
    rating: int,
    comment: str,
    order_id: int | None = None,
    appointment_id: int | None = None
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Submit review and update business rating averages:
    - Verifies rating in [1, 5]
    - Checks if linked to real order/appointment (is_verified_transaction)
    - Recomputes avg_rating and review_count on businesses table
    """
    if not (1 <= rating <= 5):
        return False, "Rating must be an integer between 1 and 5 stars.", {}

    if not customer_name.strip() or not comment.strip():
        return False, "Reviewer name and comment cannot be empty.", {}

    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()

        is_verified = 1 if (order_id or appointment_id) else 0

        # Check duplicate review on same transaction if order_id is provided
        if order_id:
            cursor.execute("SELECT id FROM reviews WHERE order_id = ?", (order_id,))
            if cursor.fetchone():
                return False, "A review has already been submitted for this order.", {}

        if appointment_id:
            cursor.execute("SELECT id FROM reviews WHERE appointment_id = ?", (appointment_id,))
            if cursor.fetchone():
                return False, "A review has already been submitted for this appointment.", {}

        # Insert review
        cursor.execute(
            """
            INSERT INTO reviews (
                business_id, customer_name, rating, comment,
                is_verified_transaction, order_id, appointment_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (business_id, customer_name, rating, comment, is_verified, order_id, appointment_id)
        )

        # Recalculate average rating & review count for business
        cursor.execute(
            "SELECT COUNT(*) as cnt, AVG(rating) as avg_r FROM reviews WHERE business_id = ?",
            (business_id,)
        )
        stats = cursor.fetchone()
        new_cnt = stats["cnt"]
        new_avg = round(stats["avg_r"], 2) if stats["avg_r"] is not None else 0.0

        cursor.execute(
            "UPDATE businesses SET avg_rating = ?, review_count = ? WHERE id = ?",
            (new_avg, new_cnt, business_id)
        )

        conn.commit()

        return True, "Review posted successfully!", {
            "business_id": business_id,
            "new_avg_rating": new_avg,
            "total_reviews": new_cnt,
            "is_verified": bool(is_verified)
        }

    except Exception as e:
        conn.rollback()
        return False, f"Failed to post review: {str(e)}", {}
    finally:
        conn.close()
