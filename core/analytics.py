"""
CustomerConnect — Analytics and Reporting Aggregation
Provides summary metrics and category distributions for Plotly charts and studio analytics.
"""

from typing import Dict, Any, List
from database.connection import get_db_connection


def get_platform_analytics(db_path: str) -> Dict[str, Any]:
    """Retrieve platform-wide operational metrics."""
    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as count FROM businesses")
        total_businesses = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM products")
        total_products = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM services")
        total_services = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as gmv FROM orders")
        order_stats = cursor.fetchone()
        total_orders = order_stats["count"]
        total_gmv = order_stats["gmv"]

        cursor.execute("SELECT COUNT(*) as count FROM appointments")
        total_appointments = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM reservations")
        total_reservations = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM reviews")
        total_reviews = cursor.fetchone()["count"]

        # Category distribution of businesses
        cursor.execute("SELECT category, COUNT(*) as count FROM businesses GROUP BY category ORDER BY count DESC")
        category_dist = [dict(row) for row in cursor.fetchall()]

        # Area distribution
        cursor.execute("SELECT area, COUNT(*) as count FROM businesses GROUP BY area ORDER BY count DESC")
        area_dist = [dict(row) for row in cursor.fetchall()]

        # Order status distribution
        cursor.execute("SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status")
        order_status_dist = [dict(row) for row in cursor.fetchall()]

        # Payment methods distribution
        cursor.execute("SELECT payment_method, COUNT(*) as count, SUM(amount) as total FROM payments GROUP BY payment_method")
        payment_dist = [dict(row) for row in cursor.fetchall()]

        return {
            "total_businesses": total_businesses,
            "total_products": total_products,
            "total_services": total_services,
            "total_orders": total_orders,
            "total_gmv": round(total_gmv, 2),
            "total_appointments": total_appointments,
            "total_reservations": total_reservations,
            "total_reviews": total_reviews,
            "category_distribution": category_dist,
            "area_distribution": area_dist,
            "order_status_distribution": order_status_dist,
            "payment_distribution": payment_dist,
        }
    finally:
        conn.close()


def get_business_studio_analytics(db_path: str, business_id: int) -> Dict[str, Any]:
    """Retrieve isolated analytics for a specific business owner studio."""
    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT name, avg_rating, review_count, category, area FROM businesses WHERE id = ?", (business_id,))
        biz = cursor.fetchone()
        if not biz:
            return {}

        cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(stock), 0) as total_stock FROM products WHERE business_id = ?", (business_id,))
        p_stat = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as count FROM services WHERE business_id = ?", (business_id,))
        s_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE business_id = ?", (business_id,))
        o_stat = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as count FROM appointments WHERE business_id = ?", (business_id,))
        apt_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM reservations WHERE business_id = ?", (business_id,))
        res_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM inquiries WHERE business_id = ?", (business_id,))
        inq_count = cursor.fetchone()["count"]

        return {
            "business": dict(biz),
            "product_count": p_stat["count"],
            "total_stock": p_stat["total_stock"],
            "service_count": s_count,
            "order_count": o_stat["count"],
            "revenue": round(o_stat["revenue"], 2),
            "appointment_count": apt_count,
            "reservation_count": res_count,
            "inquiry_count": inq_count,
        }
    finally:
        conn.close()
