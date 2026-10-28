"""
CustomerConnect — Opening Hours & Status Engine
Calculates Open Now / Closed Now status, overnight shifts, and next opening times in Asia/Kolkata timezone.
"""

from datetime import datetime, time
from typing import List, Dict, Any, Tuple


def parse_time_str(time_str: str) -> time:
    """Parse 'HH:MM' string to datetime.time."""
    parts = time_str.strip().split(":")
    return time(int(parts[0]), int(parts[1]))


def is_business_open_now(
    hours_schedule: List[Dict[str, Any]],
    current_dt: datetime | None = None
) -> Tuple[bool, str]:
    """
    Check if a business is currently open based on a list of daily schedules.
    Each schedule entry has:
      - day_of_week: int (0=Monday, 6=Sunday)
      - is_closed: int/bool
      - open_time: str 'HH:MM'
      - close_time: str 'HH:MM'
      - is_overnight: int/bool (e.g. 21:00 to 03:00)
    Returns (is_open, status_text_or_next_open).
    """
    if not hours_schedule:
        return False, "Hours not configured"

    if current_dt is None:
        # Default to current local time
        current_dt = datetime.now()

    curr_weekday = current_dt.weekday()  # 0=Monday, 6=Sunday
    curr_time = current_dt.time()

    # Find schedule for today
    today_sched = next((s for s in hours_schedule if s.get("day_of_week") == curr_weekday), None)

    # Also check yesterday's schedule for overnight spillover into today's early morning
    yesterday_weekday = (curr_weekday - 1) % 7
    yesterday_sched = next((s for s in hours_schedule if s.get("day_of_week") == yesterday_weekday), None)

    # Check overnight spillover first (e.g. yesterday opened at 20:00 and closes at 04:00 today)
    if yesterday_sched and not yesterday_sched.get("is_closed") and yesterday_sched.get("is_overnight"):
        close_t = parse_time_str(yesterday_sched.get("close_time", "00:00"))
        if curr_time < close_t:
            return True, f"Open Now (Overnight until {close_t.strftime('%I:%M %p')})"

    if not today_sched or today_sched.get("is_closed"):
        return False, "Closed Today"

    open_t = parse_time_str(today_sched.get("open_time", "09:00"))
    close_t = parse_time_str(today_sched.get("close_time", "20:00"))
    is_overnight = bool(today_sched.get("is_overnight"))

    if is_overnight:
        # e.g. Open 18:00 to 02:00
        if curr_time >= open_t or curr_time < close_t:
            return True, f"Open Now until {close_t.strftime('%I:%M %p')}"
        else:
            return False, f"Closed Now (Opens at {open_t.strftime('%I:%M %p')})"
    else:
        # Regular daytime schedule
        if open_t <= curr_time <= close_t:
            return True, f"Open Now until {close_t.strftime('%I:%M %p')}"
        elif curr_time < open_t:
            return False, f"Closed Now (Opens today at {open_t.strftime('%I:%M %p')})"
        else:
            return False, f"Closed for today (Closed at {close_t.strftime('%I:%M %p')})"
