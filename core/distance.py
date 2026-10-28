"""
CustomerConnect — Haversine Distance Calculation
Calculates approximate straight-line geodesic distance between coordinates.
"""

import math
from typing import Dict, Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    r = 6371.0  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    # Clamp to avoid floating point domain errors in sqrt/atan2
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = r * c
    return round(distance, 2)


def get_area_distance(area_name: str, target_lat: float, target_lon: float, areas_dict: Dict[str, Any]) -> float:
    """Helper to get distance from a named area to a target coordinate."""
    if area_name not in areas_dict:
        return 999.0
    ref = areas_dict[area_name]
    return haversine_distance(ref["lat"], ref["lon"], target_lat, target_lon)
