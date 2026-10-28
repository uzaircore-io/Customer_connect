"""
CustomerConnect — MultiMatch Pro Hard Filter Engine
Implements strict AND-filtering and diagnostic Near-Match detection when 0 exact matches occur.
"""

from typing import List, Dict, Any, Tuple


def evaluate_hard_filters(
    vendor: Dict[str, Any],
    max_budget: float | None = None,
    min_rating: float | None = None,
    max_distance: float | None = None,
    category: str | None = None,
    area: str | None = None,
    open_now: bool = False,
    verified_only: bool = False,
    in_stock_only: bool = False,
    has_warranty: bool = False,
    has_return_policy: bool = False,
    supports_whatsapp: bool = False,
    supports_online_pay: bool = False,
    supports_cod: bool = False,
    supports_pay_at_pickup: bool = False,
    supports_appointments: bool = False,
) -> Tuple[bool, List[str]]:
    """
    Evaluate all active hard filters with strict AND logic.
    Returns (passes_all, list_of_failed_filter_names).
    """
    failed_filters = []

    # Category filter
    if category and category != "All Categories":
        if vendor.get("category") != category:
            failed_filters.append(f"Category (expected '{category}')")

    # Area filter
    if area and area != "All Areas":
        if vendor.get("area") != area:
            failed_filters.append(f"Area (expected '{area}')")

    # Budget filter (checks minimum product/service price of vendor)
    if max_budget is not None and max_budget > 0:
        starting_price = vendor.get("starting_price", 0.0)
        if starting_price > max_budget:
            failed_filters.append(f"Max Budget (₹{starting_price:.0f} > ₹{max_budget:.0f})")

    # Rating filter
    if min_rating is not None and min_rating > 0:
        vendor_rating = vendor.get("avg_rating", 0.0)
        if vendor_rating < min_rating:
            failed_filters.append(f"Min Rating ({vendor_rating:.1f} < {min_rating:.1f})")

    # Distance filter
    if max_distance is not None and max_distance > 0:
        vendor_dist = vendor.get("distance_km", 999.0)
        if vendor_dist > max_distance:
            failed_filters.append(f"Max Distance ({vendor_dist:.1f}km > {max_distance:.1f}km)")

    # Open Now
    if open_now:
        if not vendor.get("is_open_now", False):
            failed_filters.append("Currently Open Now")

    # Verified
    if verified_only:
        if not vendor.get("verified", False):
            failed_filters.append("Verified Business Status")

    # In Stock
    if in_stock_only:
        if vendor.get("total_stock", 0) <= 0:
            failed_filters.append("In-Stock Availability")

    # Warranty
    if has_warranty:
        if not vendor.get("has_warranty", False):
            failed_filters.append("Warranty Policy")

    # Return Policy
    if has_return_policy:
        if not vendor.get("has_return_policy", False):
            failed_filters.append("Return Policy")

    # WhatsApp
    if supports_whatsapp:
        if not vendor.get("whatsapp"):
            failed_filters.append("WhatsApp Contact Support")

    # Online Payment
    if supports_online_pay:
        if not vendor.get("supports_online_pay", False):
            failed_filters.append("Online Payment Support")

    # Cash on Delivery
    if supports_cod:
        if not vendor.get("supports_cod", False):
            failed_filters.append("Cash on Delivery")

    # Pay at Pickup
    if supports_pay_at_pickup:
        if not vendor.get("supports_pay_at_pickup", False):
            failed_filters.append("Pay at Pickup")

    # Appointments
    if supports_appointments:
        if not vendor.get("supports_appointments", False):
            failed_filters.append("Appointment Booking Support")

    return len(failed_filters) == 0, failed_filters


def filter_vendors(
    vendors: List[Dict[str, Any]],
    **filter_kwargs: Any
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str]]:
    """
    Partition vendors into exact matches and near matches (those missing only 1 or 2 filters).
    Returns (exact_matches, near_matches, restrictive_reasons).
    """
    exact = []
    near = []
    failed_counts: Dict[str, int] = {}

    for v in vendors:
        passes, failed = evaluate_hard_filters(v, **filter_kwargs)
        if passes:
            exact.append(v)
        else:
            for f in failed:
                failed_counts[f] = failed_counts.get(f, 0) + 1
            if len(failed) <= 2:
                # Shallow copy with reason attached
                v_copy = dict(v)
                v_copy["near_miss_reasons"] = failed
                near.append(v_copy)

    # Sort restrictive reasons by most common blockers
    sorted_reasons = sorted(failed_counts.keys(), key=lambda k: failed_counts[k], reverse=True)
    return exact, near, sorted_reasons
