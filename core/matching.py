"""
CustomerConnect — MultiMatch Pro Ranking Engine
Transparent multi-criteria scoring algorithm and priority-order sorting with "Why This Vendor" breakdown.
"""

from typing import List, Dict, Any


def calculate_normalized_scores(vendors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculate min-max normalized component scores for each vendor in [0.0, 1.0].
    Normalized components:
      - rating_score: (rating - min_r) / (max_r - min_r)
      - distance_score: 1.0 - (dist - min_d) / (max_d - min_d)  (shorter distance = higher score)
      - price_score: 1.0 - (price - min_p) / (max_p - min_p)   (lower price = higher score)
      - trust_score: combined verified status (0.5) + normalized reviews (0.5)
      - availability_score: (in-stock or open_now)
    """
    if not vendors:
        return []

    # Extract ranges for normalization with safe defaults
    ratings = [v.get("avg_rating", 0.0) for v in vendors]
    distances = [v.get("distance_km", 1.0) for v in vendors]
    prices = [v.get("starting_price", 500.0) for v in vendors]
    reviews = [v.get("review_count", 0) for v in vendors]

    min_r, max_r = min(ratings, default=1.0), max(ratings, default=5.0)
    min_d, max_d = min(distances, default=0.5), max(distances, default=15.0)
    min_p, max_p = min(prices, default=100.0), max(prices, default=20000.0)
    min_rev, max_rev = min(reviews, default=0), max(reviews, default=100)

    # Prevent division by zero
    diff_r = max_r - min_r if max_r > min_r else 1.0
    diff_d = max_d - min_d if max_d > min_d else 1.0
    diff_p = max_p - min_p if max_p > min_p else 1.0
    diff_rev = max_rev - min_rev if max_rev > min_rev else 1.0

    scored_vendors = []
    for v in vendors:
        item = dict(v)

        r = v.get("avg_rating", 0.0)
        d = v.get("distance_km", 999.0)
        p = v.get("starting_price", 0.0)
        rev = v.get("review_count", 0)
        is_verified = 1.0 if v.get("verified", False) else 0.0
        is_open = 1.0 if v.get("is_open_now", False) else 0.0

        # Normalization math
        s_rating = max(0.0, min(1.0, (r - min_r) / diff_r))
        s_distance = max(0.0, min(1.0, 1.0 - ((d - min_d) / diff_d)))
        s_price = max(0.0, min(1.0, 1.0 - ((p - min_p) / diff_p)))
        s_trust = 0.5 * is_verified + 0.5 * max(0.0, min(1.0, (rev - min_rev) / diff_rev))
        s_avail = 0.5 * is_open + 0.5 * (1.0 if v.get("total_stock", 0) > 0 or v.get("supports_appointments", False) else 0.0)

        item["_norm_rating"] = round(s_rating, 3)
        item["_norm_distance"] = round(s_distance, 3)
        item["_norm_price"] = round(s_price, 3)
        item["_norm_trust"] = round(s_trust, 3)
        item["_norm_avail"] = round(s_avail, 3)

        scored_vendors.append(item)

    return scored_vendors


def rank_vendors_weighted(
    vendors: List[Dict[str, Any]],
    weights: Dict[str, float] | None = None
) -> List[Dict[str, Any]]:
    """
    Weighted Smart Ranking:
      Match Score = sum(weight_i * normalized_score_i)
      Default weights: Rating (30%), Distance (25%), Price (25%), Trust (20%)
    """
    if not vendors:
        return []

    if weights is None:
        weights = {
            "rating": 0.30,
            "distance": 0.25,
            "price": 0.25,
            "trust": 0.20,
        }

    # Normalize weights so they sum to 1.0
    total_w = sum(weights.values())
    if total_w <= 0:
        total_w = 1.0
    norm_w = {k: v / total_w for k, v in weights.items()}

    normalized_vendors = calculate_normalized_scores(vendors)

    for item in normalized_vendors:
        score = (
            norm_w.get("rating", 0.0) * item["_norm_rating"]
            + norm_w.get("distance", 0.0) * item["_norm_distance"]
            + norm_w.get("price", 0.0) * item["_norm_price"]
            + norm_w.get("trust", 0.0) * item["_norm_trust"]
            + norm_w.get("avail", 0.0) * item["_norm_avail"]
        )
        match_percentage = round(score * 100, 1)
        item["match_score"] = match_percentage

        # Compatibility breakdown ("Why This Vendor?")
        item["compatibility_breakdown"] = {
            "Rating Score": f"{item['_norm_rating'] * 100:.0f}%",
            "Distance Convenience": f"{item['_norm_distance'] * 100:.0f}%",
            "Price Match": f"{item['_norm_price'] * 100:.0f}%",
            "Trust & Reviews": f"{item['_norm_trust'] * 100:.0f}%",
            "Availability": f"{item['_norm_avail'] * 100:.0f}%",
        }

        # Generate human-readable why statement
        strengths = []
        if item["_norm_rating"] >= 0.8:
            strengths.append(f"Top-rated ({item.get('avg_rating', 0):.1f}★)")
        if item["_norm_distance"] >= 0.8:
            strengths.append(f"Nearby ({item.get('distance_km', 0):.1f} km away)")
        if item["_norm_price"] >= 0.8:
            strengths.append("High price affordability")
        if item["_norm_trust"] >= 0.7:
            strengths.append("Verified trusted merchant")
        if not strengths:
            strengths.append("Balanced option across distance and pricing")

        item["why_this_vendor"] = " · ".join(strengths)

    # Sort descending by match score
    return sorted(normalized_vendors, key=lambda x: x["match_score"], reverse=True)


def rank_vendors_priority_order(
    vendors: List[Dict[str, Any]],
    priorities: List[str]
) -> List[Dict[str, Any]]:
    """
    Priority Order Sorting:
      Applies criteria in sequential order, using subsequent criteria as tie-breakers.
      Supported criteria: 'Highest Rating', 'Nearest Distance', 'Lowest Price',
      'Most Reviewed', 'Verified Business', 'Availability'.
    """
    if not vendors:
        return []

    normalized_vendors = calculate_normalized_scores(vendors)

    def sort_key(v: Dict[str, Any]) -> tuple:
        keys = []
        for p in priorities:
            if p == "Highest Rating":
                keys.append(-v.get("avg_rating", 0.0))
            elif p == "Nearest Distance":
                keys.append(v.get("distance_km", 999.0))
            elif p == "Lowest Price":
                keys.append(v.get("starting_price", 999999.0))
            elif p == "Most Reviewed":
                keys.append(-v.get("review_count", 0))
            elif p == "Verified Business":
                keys.append(0 if v.get("verified", False) else 1)
            elif p == "Availability":
                keys.append(0 if v.get("is_open_now", False) else 1)
        return tuple(keys)

    sorted_list = sorted(normalized_vendors, key=sort_key)

    # Assign match ranking labels
    for idx, item in enumerate(sorted_list):
        item["rank_position"] = idx + 1
        item["why_this_vendor"] = f"Ranked #{idx+1} based on priority sequence: {' > '.join(priorities)}"

    return sorted_list
