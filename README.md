# CustomerConnect — Intelligent Local Business Discovery, Comparison, Booking & Commerce Platform

> **Tagline:** *Discover. Compare. Connect. Reserve.*  
> **Target Dataset:** Srinagar, Jammu & Kashmir (Lal Chowk, Rajbagh, Jawahar Nagar, Sanat Nagar, Baghat, Rawalpora, Nowgam, Barzulla)  
> **Academic Project:** B.Tech Artificial Intelligence & Data Science College Capstone

---

## 🌿 1. Overview & Problem Statement

Local commerce in regional cities often suffers from fragmented discovery. Consumers struggle to find reliable information regarding:
- Real-time shop operating hours (including night/overnight schedules).
- Product in-stock availability before making a physical trip.
- Objective side-by-side comparisons of local merchants (warranties, return policies, payment methods).
- Seamless appointment scheduling for clinics, salons, and tutors without double-booking conflicts.

**CustomerConnect** solves this by providing a unified, multi-criteria discovery, comparison, and pre-booking platform tailored for local markets, combining:
1. **MultiMatch Pro Engine:** Transparent multi-criteria scoring algorithm balancing distance, pricing, ratings, and trust metrics.
2. **SlotGuard Concurrency Protection:** ACID transactional appointment engine that prevents double bookings.
3. **ReserveNow Inventory Lock:** Product pre-booking engine with real-time stock allocation and automatic stock restoration upon cancellation.
4. **Exact Botanical Aesthetic:** Designed according to warm minimalist botanical principles (terracotta accents, cream backgrounds, dried branches, and ceramic silhouettes).

---

## 🎨 2. Visual Theme & Color Palette

The interface reproduces a warm, botanical editorial aesthetic:
- **Main Cream Background:** `#F8E8D0`
- **Warm Ivory Card Surface:** `#FFFDF8`
- **Light Beige Framing:** `#E9DDCB`
- **Soft Peach Accent:** `#E9C5A4`
- **Terracotta Primary:** `#BF7149`
- **Coffee Brown:** `#80503A`
- **Deep Brown Text:** `#4A3024`
- **Muted Sage Green:** `#D8E1D3`
- **Soft Taupe Border:** `#D7C4AF`

---

## ⚡ 3. MultiMatch Pro & SmartMatch Algorithm

Unlike black-box recommendation engines, CustomerConnect uses a transparent two-tier recommendation pipeline:

### Step 1: Strict Hard Filters (AND-Logic)
Vendors must meet every non-negotiable criterion selected by the customer:
- `starting_price <= max_budget`
- `avg_rating >= min_rating`
- `distance_km <= max_distance` (calculated using Haversine geodesic formula)
- Mandatory business attributes: Verified, Open Now, Warranty, Return Policy, Payment Options.

*If zero exact matches exist, the diagnostic engine isolates the most restrictive filters and surfaces nearest alternatives.*

### Step 2: Normalized SmartMatch Scoring
Component scores are normalized to $[0.0, 1.0]$:

$$\text{Score}_{\text{Rating}} = \frac{R - R_{\min}}{R_{\max} - R_{\min}}$$

$$\text{Score}_{\text{Distance}} = 1 - \frac{D - D_{\min}}{D_{\max} - D_{\min}}$$

$$\text{Score}_{\text{Price}} = 1 - \frac{P - P_{\min}}{P_{\max} - P_{\min}}$$

$$\text{Score}_{\text{Trust}} = 0.5 \times \text{Verified} + 0.5 \times \frac{\text{Reviews} - \text{Reviews}_{\min}}{\text{Reviews}_{\max} - \text{Reviews}_{\min}}$$

$$\text{Match Score} = w_R \cdot \text{Score}_R + w_D \cdot \text{Score}_D + w_P \cdot \text{Score}_P + w_T \cdot \text{Score}_T$$

---

## 🏗️ 4. System Architecture & Project File Structure

```text
CustomerConnect/
│
├── app.py                      # Main Streamlit application with all 9 screens
├── config.py                   # Global configuration, theme tokens, Srinagar coords
├── requirements.txt            # Streamlit, Pandas, Plotly, Pillow, Pytest
├── README.md                   # Complete GitHub documentation & guide
├── .gitignore                  # Git ignore rules for venv, sqlite, cache
├── seed_data.py                # Deterministic seed generator (60 businesses, 180 products)
├── customerconnect.db          # Persistent SQLite database file
│
├── database/
│   ├── __init__.py             # Database package exports
│   ├── connection.py           # SQLite connection factory & PRAGMA foreign_keys
│   ├── schema.py               # 14 normalized relational tables & partial indexes
│   └── repositories.py         # Business, product, and slot data access queries
│
├── core/
│   ├── __init__.py             # Core engine exports
│   ├── distance.py             # Haversine geodesic formula implementation
│   ├── filters.py              # MultiMatch hard filter evaluation & Near Match
│   ├── matching.py             # SmartMatch weighted scoring & priority order sorting
│   ├── bookings.py             # SlotGuard appointment booking with ACID locks
│   ├── reservations.py         # ReserveNow product pre-booking & inventory lock
│   ├── payments.py             # Demo simulated checkout, COD & Pay at Pickup
│   ├── reviews.py              # Review submission & atomic rating recalculation
│   ├── opening_hours.py        # Open Now & overnight schedule evaluation
│   └── analytics.py            # Platform metrics & studio aggregations
│
└── tests/
    ├── test_filters.py         # Budget, rating, and distance filter unit tests
    ├── test_matching.py        # MultiMatch normalized scoring unit tests
    ├── test_bookings.py        # SlotGuard concurrency & cancellation tests
    ├── test_reservations.py    # ReserveNow stock lock and restore tests
    └── test_opening_hours.py   # Daytime and overnight schedule tests
```

---

## 🗄️ 5. Normalized SQLite Database Schema (14 Tables)

1. `businesses`: Merchant profile, coordinates, contact info, ratings, and policy flags.
2. `business_hours`: Monday–Sunday operating hours with overnight spillover flags.
3. `products`: Retail inventory with physical stock and locked `reserved_stock`.
4. `services`: Appointment-based offerings with pricing and duration.
5. `appointment_slots`: Date and time intervals for booking.
6. `customers`: User contact records.
7. `appointments`: Confirmed bookings with SlotGuard partial unique index on `slot_id`.
8. `reviews`: 1–5 star reviews with verification status and business foreign keys.
9. `reservations`: Product pre-booking records with 48-hour expiration timestamps.
10. `orders`: Order fulfillment tracking records.
11. `order_items`: Line items with product ID, quantity, and unit price.
12. `payments`: Payment tracking decoupled from fulfillment status.
13. `inquiries`: Customer WhatsApp and digital messages.
14. `favorites`: User-bookmarked local businesses.

---

## 🚀 6. Step-by-Step Installation & Setup (Windows & macOS/Linux)

### Prerequisites
- Python 3.10 or newer (tested on Python 3.10, 3.11, and 3.12).
- Git.

### Step 1: Clone Repository & Create Virtual Environment
```powershell
# Windows PowerShell
git clone https://github.com/your-username/CustomerConnect.git
cd CustomerConnect

py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
git clone https://github.com/your-username/CustomerConnect.git
cd CustomerConnect

python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Populate SQLite Database with Seed Data
```powershell
python seed_data.py
```
*Output: Populates 60 businesses, 180 products, 90 services, and 240 appointment slots across Srinagar.*

### Step 4: Run Automated Unit Tests
```powershell
python -m unittest discover -s tests
```
*Output: 19 unit tests passing cleanly in under 0.1 seconds.*

### Step 5: Launch the Streamlit Application
```powershell
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 🧪 7. Live Demonstration Walkthrough for Evaluation

1. **Marketplace Discovery:** Browse through 10 categories (Watches, Jewelry, Electronics, Salons, Clinics, etc.).
2. **MultiMatch Pro Engine:** Adjust budget to ₹15,000, rating to 4.5★, and maximum distance to 5 km. See the SmartMatch percentage score and inspect the **Why This Vendor?** breakdown.
3. **Vendor Comparison:** Select 4 merchants and click **Compare** to inspect prices, warranty policies, and return terms side by side.
4. **SlotGuard Appointment Booking:** Book a slot at a salon or clinic. Try booking the same slot a second time; witness SlotGuard detect and block the double-booking.
5. **ReserveNow Pre-Booking:** Reserve a product for store pickup. Check inventory before and after reservation to observe reserved stock locking.
6. **Cancellation & Stock Restoration:** Cancel an order or reservation; observe available inventory immediately restored.
7. **Business Owner Studio:** Switch to any merchant to inspect incoming appointments, manage stock, and edit operating hours.
8. **Operations Analytics:** Inspect live category distribution and revenue trends rendered with Plotly.

---

## ⚠️ 8. Payment & Review Disclaimers

- **Simulated Payments Only:** CustomerConnect does not connect to live banking networks or real credit card processing. No real money is charged.
- **Fictional Demonstration Dataset:** Business names, contact telephone numbers, and customer testimonials are simulated for academic demonstration and do not correspond to living individuals or real transactions.

---

## 🔮 9. Future Roadmap

- Real-time Google Maps Places API and live GPS routing.
- Razorpay / Stripe payment gateway integration with webhooks.
- Multi-tenant JWT merchant authentication and role-based permissions (RBAC).
- SMS / WhatsApp business API push notifications for slot reminders.
- Mobile application using Flutter / React Native.

---

## 👨‍💻 10. Author & Academic Information

- **Student Name:** B.Tech AI & Data Science Candidate
- **Course:** Capstone Software Architecture & Machine Learning Engineering
- **Institution:** Department of Artificial Intelligence & Data Science
- **License:** MIT License
