"""
CustomerConnect — Application Configuration
Intelligent Local Business Discovery, Comparison, Booking & Commerce Platform
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = os.environ.get("CUSTOMERCONNECT_DB", str(BASE_DIR / "customerconnect.db"))

APP_TITLE = "CustomerConnect"
APP_TAGLINE = "Discover. Compare. Connect. Reserve."
APP_SUBTITLE = "Intelligent Local Business Discovery, Comparison, Booking & Commerce Platform"

# Color Palette (Botanical Cream / Terracotta theme from reference design)
THEME = {
    "bg_cream": "#F8E8D0",
    "bg_ivory": "#FFFDF8",
    "bg_beige": "#E9DDCB",
    "soft_peach": "#E9C5A4",
    "terracotta": "#BF7149",
    "coffee": "#80503A",
    "deep_brown": "#4A3024",
    "muted_sage": "#D8E1D3",
    "border_soft": "#D7C4AF",
}

# Supported Business Categories (Part 5)
CATEGORIES = [
    "Watches",
    "Jewelry",
    "Electronics",
    "Clothing",
    "Salons",
    "Clinics",
    "Restaurants",
    "Home Services",
    "Tutors",
    "Repair Services",
]

# Srinagar Target Areas & Coordinates (Part 18 & Part 14)
SRINAGAR_AREAS = {
    "Lal Chowk": {"lat": 34.0725, "lon": 74.8105},
    "Rajbagh": {"lat": 34.0620, "lon": 74.8250},
    "Jawahar Nagar": {"lat": 34.0535, "lon": 74.8190},
    "Sanat Nagar": {"lat": 34.0280, "lon": 74.7990},
    "Baghat": {"lat": 34.0380, "lon": 74.8050},
    "Rawalpora": {"lat": 34.0205, "lon": 74.7890},
    "Nowgam": {"lat": 34.0040, "lon": 74.8250},
    "Barzulla": {"lat": 34.0450, "lon": 74.8010},
}

DEFAULT_USER_AREA = "Lal Chowk"
TIMEZONE = "Asia/Kolkata"

# Booking & Reservation Defaults
DEFAULT_RESERVATION_EXPIRY_HOURS = 48
DEMO_MAX_COMPARISON_ITEMS = 4
