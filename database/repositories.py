"""
CustomerConnect — Repository Layer for Database Operations
High-level data access methods with parameterized queries and joins.
"""

from typing import List, Dict, Any, Optional
from database.connection import get_db_connection
from core.distance import haversine_distance
from core.opening_hours import is_business_open_now
import config


class BusinessRepository:
    def __init__(self, db_path: str = config.DATABASE_PATH):
        self.db_path = db_path

    def get_all_businesses_enriched(self, user_area: str = config.DEFAULT_USER_AREA) -> List[Dict[str, Any]]:
        """Fetch all businesses with calculated distance from user area, hours status, and price ranges."""
        conn = get_db_connection(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM businesses ORDER BY avg_rating DESC")
            biz_rows = [dict(row) for row in cursor.fetchall()]

            ref_coords = config.SRINAGAR_AREAS.get(user_area, config.SRINAGAR_AREAS[config.DEFAULT_USER_AREA])
            user_lat, user_lon = ref_coords["lat"], ref_coords["lon"]

            enriched = []
            for b in biz_rows:
                b_id = b["id"]

                # Calculate Haversine distance
                dist = haversine_distance(user_lat, user_lon, b["latitude"], b["longitude"])
                b["distance_km"] = dist

                # Get starting price & stock from products/services
                cursor.execute(
                    "SELECT MIN(price) as min_p, SUM(stock) as sum_stock FROM products WHERE business_id = ? AND is_active = 1",
                    (b_id,)
                )
                prod_stat = cursor.fetchone()

                cursor.execute(
                    "SELECT MIN(price) as min_s_p, COUNT(*) as s_count FROM services WHERE business_id = ? AND is_active = 1",
                    (b_id,)
                )
                serv_stat = cursor.fetchone()

                min_prices = []
                if prod_stat and prod_stat["min_p"] is not None:
                    min_prices.append(prod_stat["min_p"])
                if serv_stat and serv_stat["min_s_p"] is not None:
                    min_prices.append(serv_stat["min_s_p"])

                b["starting_price"] = min(min_prices) if min_prices else 299.0
                b["total_stock"] = prod_stat["sum_stock"] if prod_stat and prod_stat["sum_stock"] is not None else 0
                b["supports_appointments"] = bool(serv_stat and serv_stat["s_count"] > 0)

                # Get opening hours
                cursor.execute("SELECT * FROM business_hours WHERE business_id = ?", (b_id,))
                hours = [dict(h) for h in cursor.fetchall()]
                b["hours_schedule"] = hours
                is_open, open_msg = is_business_open_now(hours)
                b["is_open_now"] = is_open
                b["open_status_text"] = open_msg

                enriched.append(b)

            return enriched
        finally:
            conn.close()

    def get_business_by_id(self, business_id: int) -> Optional[Dict[str, Any]]:
        """Fetch single business with all products, services, hours, and recent reviews."""
        conn = get_db_connection(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM businesses WHERE id = ?", (business_id,))
            biz = cursor.fetchone()
            if not biz:
                return None
            res = dict(biz)

            cursor.execute("SELECT * FROM business_hours WHERE business_id = ? ORDER BY day_of_week ASC", (business_id,))
            res["hours"] = [dict(r) for r in cursor.fetchall()]
            is_open, open_msg = is_business_open_now(res["hours"])
            res["is_open_now"] = is_open
            res["open_status_text"] = open_msg

            cursor.execute("SELECT * FROM products WHERE business_id = ? AND is_active = 1", (business_id,))
            res["products"] = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM services WHERE business_id = ? AND is_active = 1", (business_id,))
            res["services"] = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM reviews WHERE business_id = ? ORDER BY created_at DESC", (business_id,))
            res["reviews"] = [dict(r) for r in cursor.fetchall()]

            return res
        finally:
            conn.close()

    def get_available_slots(self, business_id: int, date_str: str) -> List[Dict[str, Any]]:
        """Fetch unbooked appointment slots for a specific business and date."""
        conn = get_db_connection(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM appointment_slots WHERE business_id = ? AND slot_date = ? AND is_booked = 0 ORDER BY start_time ASC",
                (business_id, date_str)
            )
            return [dict(r) for r in cursor.fetchall()]
        finally:
            conn.close()
