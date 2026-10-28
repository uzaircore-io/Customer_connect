"""
CustomerConnect — Intelligent Local Business Discovery, Comparison, Booking & Commerce Platform
Tagline: Discover. Compare. Connect. Reserve.
Streamlit Python Application
"""

import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, date
import config
from database.connection import initialize_database
from database.repositories import BusinessRepository
from core.matching import rank_vendors_weighted, rank_vendors_priority_order
from core.filters import filter_vendors
from core.bookings import book_appointment_slot, cancel_appointment
from core.reservations import create_product_reservation, cancel_reservation
from core.payments import process_order_checkout, PAYMENT_DISCLAIMER
from core.reviews import add_business_review
from core.analytics import get_platform_analytics, get_business_studio_analytics
from seed_data import seed_database

# Set page configuration with botanical branding
st.set_page_config(
    page_title="CustomerConnect — Discover Local. Shop Smarter.",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Botanical Theme CSS (warm cream #F8E8D0, terracotta #BF7149, deep brown #4A3024)
CUSTOM_CSS = """
<style>
    /* Theme color variables */
    :root {
        --bg-cream: #F8E8D0;
        --bg-ivory: #FFFDF8;
        --terracotta: #BF7149;
        --coffee: #80503A;
        --deep-brown: #4A3024;
        --border-soft: #D7C4AF;
    }
    
    .stApp {
        background-color: #F8E8D0;
        color: #4A3024;
    }
    
    /* Elegant serif typography for main headlines */
    h1, h2, h3 {
        font-family: 'Georgia', 'Playfair Display', serif;
        color: #4A3024;
    }
    
    /* Warm botanical frame container */
    .botanical-frame {
        background: #FFFDF8;
        border: 1px solid #D7C4AF;
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(74, 48, 36, 0.05);
        margin-bottom: 30px;
    }
    
    /* Terracotta primary buttons */
    .stButton > button {
        background-color: #BF7149 !important;
        color: #FFFDF8 !important;
        border-radius: 9999px !important;
        border: none !important;
        font-weight: 600 !important;
        padding: 8px 24px !important;
        transition: all 0.2s ease !important;
    }
    .stButton > button:hover {
        background-color: #80503A !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(191, 113, 73, 0.25);
    }
    
    /* Card design */
    .vendor-card {
        background: #FFFDF8;
        border: 1px solid #D7C4AF;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        transition: all 0.2s ease;
    }
    .vendor-card:hover {
        border-color: #BF7149;
        box-shadow: 0 6px 20px rgba(128, 80, 58, 0.08);
    }
    
    /* Badges */
    .badge-verified {
        color: #BF7149;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    /* Floating showcase container */
    .showcase-scroll {
        display: flex;
        overflow-x: auto;
        gap: 16px;
        padding: 10px 0;
    }
    
    .disclaimer-banner {
        background: #F4E7DA;
        border-left: 4px solid #BF7149;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.85rem;
        color: #80503A;
        margin: 10px 0;
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# Initialize Session State
if "user_area" not in st.session_state:
    st.session_state.user_area = "Lal Chowk"
if "comparison_ids" not in st.session_state:
    st.session_state.comparison_ids = []
if "cart" not in st.session_state:
    st.session_state.cart = []
if "search_query" not in st.session_state:
    st.session_state.search_query = ""

# Ensure database exists
initialize_database()
repo = BusinessRepository()

# Sidebar Navigation
st.sidebar.markdown(
    """
    <div style='text-align: center; padding: 10px 0;'>
        <h2 style='color: #4A3024; margin: 0; font-family: serif;'>CustomerConnect</h2>
        <p style='color: #80503A; font-size: 0.85rem; margin-top: 4px;'>Discover · Compare · Connect · Reserve</p>
    </div>
    """,
    unsafe_allow_html=True
)

st.sidebar.markdown("---")

# Area Selector in sidebar
current_area = st.sidebar.selectbox(
    "📍 Your Location (Srinagar)",
    options=list(config.SRINAGAR_AREAS.keys()),
    index=list(config.SRINAGAR_AREAS.keys()).index(st.session_state.user_area)
)
st.session_state.user_area = current_area

nav_choice = st.sidebar.radio(
    "Navigation",
    options=[
        "🌿 Home (Reference Design)",
        "🔍 Explore Businesses",
        "⚡ MultiMatch Pro Engine",
        "⚖️ Vendor Comparison",
        "📅 Universal Appointments",
        "🛍️ Product Reservations & Orders",
        "🏬 Business Owner Studio",
        "📊 Analytics Dashboard",
        "⚙️ Admin & Database",
    ],
    index=0
)

st.sidebar.markdown("---")
st.sidebar.caption(f"Connected to SQLite Database · {config.TIMEZONE}")
st.sidebar.caption(PAYMENT_DISCLAIMER)

# -------------------------------------------------------------
# SCREEN 1: LANDING PAGE (REFERENCE DESIGN MATCH)
# -------------------------------------------------------------
if nav_choice == "🌿 Home (Reference Design)":
    # Hero Centered Rounded Botanical Frame
    st.markdown(
        """
        <div class='botanical-frame' style='text-align: center; max-width: 960px; margin: 0 auto 30px auto;'>
            <p style='text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; color: #80503A; margin-bottom: 8px;'>
                Intelligent Local Business Discovery
            </p>
            <h1 style='font-size: 3rem; margin-bottom: 12px; color: #4A3024;'>
                Discover Local. Shop Smarter.
            </h1>
            <p style='font-size: 1.15rem; color: #80503A; max-width: 650px; margin: 0 auto 24px auto;'>
                Find trusted local businesses, compare better options, and connect with confidence.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Search Bar
    col_s1, col_s2 = st.columns([5, 1])
    with col_s1:
        search_input = st.text_input(
            "Search",
            placeholder="Search products, services, or local businesses...",
            label_visibility="collapsed"
        )
    with col_s2:
        search_btn = st.button("Explore Nearby", use_container_width=True)

    if search_btn or search_input:
        st.session_state.search_query = search_input
        st.success(f"Searching businesses matching: '{search_input}' in {st.session_state.user_area}")

    # Floating Product Showcase Heading
    st.markdown(
        """
        <div style='text-align: center; margin-top: 40px; margin-bottom: 20px;'>
            <h3 style='color: #4A3024;'>Discover Your Next Favorite</h3>
            <p style='color: #80503A; font-size: 0.9rem;'>Handcrafted curation from local artisans, boutiques, and certified shops in Srinagar</p>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Showcase Cards Grid
    businesses = repo.get_all_businesses_enriched(user_area=st.session_state.user_area)
    showcase_biz = businesses[:6]

    cols = st.columns(3)
    for idx, b in enumerate(showcase_biz):
        with cols[idx % 3]:
            st.markdown(
                f"""
                <div class='vendor-card'>
                    <div style='display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;'>
                        <span style='font-size: 0.75rem; text-transform: uppercase; color: #BF7149; font-weight: 600;'>{b['category']}</span>
                        <span style='font-size: 0.85rem; color: #4A3024; font-weight: 600;'>★ {b['avg_rating']} ({b['review_count']})</span>
                    </div>
                    <h4 style='margin: 0 0 6px 0; color: #4A3024; font-family: serif; font-size: 1.25rem;'>{b['name']}</h4>
                    <p style='color: #80503A; font-size: 0.85rem; margin-bottom: 12px; height: 40px; overflow: hidden;'>{b['description']}</p>
                    <div style='display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E9DDCB; padding-top: 10px; font-size: 0.85rem;'>
                        <span>Starting from <b>₹{b['starting_price']:.0f}</b></span>
                        <span style='color: #80503A;'>📍 {b['distance_km']:.1f} km</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

# -------------------------------------------------------------
# SCREEN 2: EXPLORE BUSINESSES
# -------------------------------------------------------------
elif nav_choice == "🔍 Explore Businesses":
    st.markdown("## 🔍 Explore Local Businesses")
    st.markdown("Browse all verified merchants across Srinagar across 10 specialized categories.")

    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        query = st.text_input("Search by name, product, or keyword", value=st.session_state.search_query)
    with col2:
        cat_filter = st.selectbox("Category", options=["All Categories"] + config.CATEGORIES)
    with col3:
        sort_by = st.selectbox("Sort By", ["Highest Rating", "Nearest Distance", "Lowest Price", "Most Reviewed"])

    businesses = repo.get_all_businesses_enriched(user_area=st.session_state.user_area)

    # Filter
    filtered = []
    for b in businesses:
        if cat_filter != "All Categories" and b["category"] != cat_filter:
            continue
        if query.strip():
            q = query.lower()
            if q not in b["name"].lower() and q not in b["description"].lower() and q not in b["category"].lower():
                continue
        filtered.append(b)

    # Sort
    if sort_by == "Highest Rating":
        filtered.sort(key=lambda x: x["avg_rating"], reverse=True)
    elif sort_by == "Nearest Distance":
        filtered.sort(key=lambda x: x["distance_km"])
    elif sort_by == "Lowest Price":
        filtered.sort(key=lambda x: x["starting_price"])
    elif sort_by == "Most Reviewed":
        filtered.sort(key=lambda x: x["review_count"], reverse=True)

    st.markdown(f"**Found {len(filtered)} matching businesses in Srinagar**")

    for b in filtered:
        with st.container():
            c1, c2, c3 = st.columns([3, 1, 1])
            with c1:
                st.markdown(f"### {b['name']}")
                st.caption(f"{b['category']} · {b['area']} · {b['distance_km']:.1f} km away · {'🟢 ' + b['open_status_text'] if b['is_open_now'] else '🔴 ' + b['open_status_text']}")
                st.write(b["description"])
            with c2:
                st.metric("Rating", f"{b['avg_rating']:.1f} ★", f"{b['review_count']} reviews")
                st.write(f"Starting from: **₹{b['starting_price']:.0f}**")
            with c3:
                # Add to compare button
                if b["id"] in st.session_state.comparison_ids:
                    if st.button("Remove Compare", key=f"rm_cmp_{b['id']}"):
                        st.session_state.comparison_ids.remove(b["id"])
                        st.rerun()
                else:
                    if st.button("Add to Compare", key=f"add_cmp_{b['id']}"):
                        if len(st.session_state.comparison_ids) < config.DEMO_MAX_COMPARISON_ITEMS:
                            st.session_state.comparison_ids.append(b["id"])
                            st.rerun()
                        else:
                            st.warning(f"Maximum {config.DEMO_MAX_COMPARISON_ITEMS} businesses can be compared at once.")

                # Directions & WhatsApp link
                wa_url = f"https://wa.me/{b['whatsapp']}?text=Hello%20{b['name']},%20I%20found%20you%20on%20CustomerConnect!"
                gmaps_url = f"https://www.google.com/maps/search/?api=1&query={b['latitude']},{b['longitude']}"
                st.markdown(f"[💬 WhatsApp]({wa_url}) · [🗺️ Directions]({gmaps_url})")

            st.markdown("---")

# -------------------------------------------------------------
# SCREEN 3: MULTIMATCH PRO ENGINE
# -------------------------------------------------------------
elif nav_choice == "⚡ MultiMatch Pro Engine":
    st.markdown("## ⚡ MultiMatch Pro Recommendation Engine")
    st.markdown("Transparent multi-criteria scoring combining strict hard filters with weighted normalized ranking.")

    with st.expander("🛠️ Configure MultiMatch Criteria & Filters", expanded=True):
        f_col1, f_col2, f_col3 = st.columns(3)
        with f_col1:
            budget = st.slider("Maximum Budget (₹)", 500, 30000, 15000, step=500)
            min_r = st.slider("Minimum Rating (★)", 1.0, 5.0, 4.0, step=0.1)
            max_d = st.slider("Maximum Distance (km)", 0.5, 20.0, 5.0, step=0.5)
        with f_col2:
            sel_cat = st.selectbox("Category Filter", ["All Categories"] + config.CATEGORIES)
            verified_only = st.checkbox("Verified Business Only", value=False)
            open_only = st.checkbox("Open Now Only", value=False)
            in_stock_only = st.checkbox("In-Stock Available Only", value=False)
        with f_col3:
            st.markdown("**Multi-Priority Weights:**")
            w_rating = st.slider("Rating Weight", 0.0, 1.0, 0.35, step=0.05)
            w_dist = st.slider("Distance Weight", 0.0, 1.0, 0.25, step=0.05)
            w_price = st.slider("Price Affordability Weight", 0.0, 1.0, 0.25, step=0.05)
            w_trust = st.slider("Trust & Reviews Weight", 0.0, 1.0, 0.15, step=0.05)

    businesses = repo.get_all_businesses_enriched(user_area=st.session_state.user_area)

    # Evaluate Hard Filters
    exact_matches, near_matches, restrictive_reasons = filter_vendors(
        businesses,
        max_budget=budget,
        min_rating=min_r,
        max_distance=max_d,
        category=sel_cat,
        verified_only=verified_only,
        open_now=open_only,
        in_stock_only=in_stock_only
    )

    weights = {"rating": w_rating, "distance": w_dist, "price": w_price, "trust": w_trust}
    ranked_exact = rank_vendors_weighted(exact_matches, weights)

    st.markdown(f"### Exact Matches ({len(ranked_exact)})")
    if not ranked_exact:
        st.warning("No exact matches satisfied all hard filters simultaneously.")
        if restrictive_reasons:
            st.info(f"Most restrictive filter conditions: {', '.join(restrictive_reasons[:3])}")

        if near_matches:
            st.markdown("#### 💡 Near Matches (Closest alternatives)")
            ranked_near = rank_vendors_weighted(near_matches, weights)
            for v in ranked_near[:5]:
                st.markdown(f"**{v['name']}** · Missed due to: *{', '.join(v.get('near_miss_reasons', []))}*")
    else:
        for idx, v in enumerate(ranked_exact):
            with st.container():
                c1, c2, c3 = st.columns([3, 1, 1])
                with c1:
                    st.markdown(f"#### #{idx+1} {v['name']} — **{v['match_score']:.1f}% Match**")
                    st.caption(f"{v['category']} · {v['area']} · {v['distance_km']:.1f} km away · Starting: ₹{v['starting_price']:.0f}")
                    st.markdown(f"**Why This Vendor?** {v['why_this_vendor']}")
                    with st.expander("Compatibility Breakdown"):
                        st.json(v["compatibility_breakdown"])
                with c2:
                    st.metric("Smart Match", f"{v['match_score']:.0f}%", f"★ {v['avg_rating']}")
                with c3:
                    if st.button("Add to Compare", key=f"mm_cmp_{v['id']}"):
                        if v["id"] not in st.session_state.comparison_ids:
                            st.session_state.comparison_ids.append(v["id"])
                            st.success("Added to comparison!")
                st.markdown("---")

# -------------------------------------------------------------
# SCREEN 4: VENDOR COMPARISON
# -------------------------------------------------------------
elif nav_choice == "⚖️ Vendor Comparison":
    st.markdown("## ⚖️ Side-by-Side Vendor Comparison")
    st.markdown(f"Compare up to {config.DEMO_MAX_COMPARISON_ITEMS} local businesses across pricing, ratings, distance, warranties, and payment methods.")

    if not st.session_state.comparison_ids:
        st.info("No businesses selected for comparison yet. Browse businesses in 'Explore' or 'MultiMatch Pro' and click 'Add to Compare'.")
    else:
        cmp_businesses = [repo.get_business_by_id(b_id) for b_id in st.session_state.comparison_ids if repo.get_business_by_id(b_id)]

        if st.button("Clear All Comparison"):
            st.session_state.comparison_ids = []
            st.rerun()

        cols = st.columns(len(cmp_businesses))
        for idx, b in enumerate(cmp_businesses):
            with cols[idx]:
                st.markdown(f"### {b['name']}")
                st.caption(f"{b['category']} · {b['area']}")
                st.metric("Rating", f"{b['avg_rating']} ★", f"{b['review_count']} reviews")
                st.write(f"**Verified:** {'Yes ✅' if b['verified'] else 'No ❌'}")
                st.write(f"**Warranty:** {'Available ✅' if b['has_warranty'] else 'None ❌'}")
                st.write(f"**Return Policy:** {'Available ✅' if b['has_return_policy'] else 'None ❌'}")
                st.write(f"**Online Pay:** {'Supported ✅' if b['supports_online_pay'] else 'No ❌'}")
                st.write(f"**Cash on Delivery:** {'Supported ✅' if b['supports_cod'] else 'No ❌'}")
                st.write(f"**Pay at Pickup:** {'Supported ✅' if b['supports_pay_at_pickup'] else 'No ❌'}")
                st.write(f"**Status:** {'🟢 Open' if b['is_open_now'] else '🔴 Closed'}")

                if st.button(f"Remove", key=f"del_cmp_{b['id']}"):
                    st.session_state.comparison_ids.remove(b["id"])
                    st.rerun()

# -------------------------------------------------------------
# SCREEN 5: UNIVERSAL APPOINTMENTS (SLOTGUARD)
# -------------------------------------------------------------
elif nav_choice == "📅 Universal Appointments":
    st.markdown("## 📅 Universal Appointment Booking")
    st.markdown("Book salon visits, clinical checks, repair appointments, and academic tutoring with **SlotGuard** conflict prevention.")

    businesses = repo.get_all_businesses_enriched(user_area=st.session_state.user_area)
    service_biz = [b for b in businesses if b["supports_appointments"]]

    sel_b_name = st.selectbox("Select Business", options=[b["name"] for b in service_biz])
    selected_b = next((b for b in service_biz if b["name"] == sel_b_name), None)

    if selected_b:
        b_details = repo.get_business_by_id(selected_b["id"])
        services = b_details.get("services", [])

        if not services:
            st.warning("No services currently listed for this business.")
        else:
            s_col1, s_col2 = st.columns(2)
            with s_col1:
                sel_service_name = st.selectbox("Select Service", options=[f"{s['name']} (₹{s['price']:.0f} · {s['duration_minutes']} min)" for s in services])
                sel_service_idx = [f"{s['name']} (₹{s['price']:.0f} · {s['duration_minutes']} min)" for s in services].index(sel_service_name)
                service_obj = services[sel_service_idx]

                booking_d = st.date_input("Appointment Date", min_value=date.today())
                date_str = booking_d.isoformat()

            with s_col2:
                slots = repo.get_available_slots(selected_b["id"], date_str)
                if not slots:
                    st.info(f"No available slots found for {date_str}. Slots may already be booked or not yet configured.")
                    slot_choice = None
                else:
                    slot_choice = st.selectbox("Available Time Slot", options=[f"{s['start_time']} - {s['end_time']}" for s in slots])
                    chosen_slot = slots[[f"{s['start_time']} - {s['end_time']}" for s in slots].index(slot_choice)]

            st.markdown("#### Customer Details")
            c_name = st.text_input("Full Name", value="Aadil Hussain")
            c_phone = st.text_input("Contact Phone", value="+91 94190 11001")
            c_email = st.text_input("Email Address", value="aadil.hussain@demo.local")

            if slot_choice and st.button("Confirm Appointment Booking"):
                success, msg, details = book_appointment_slot(
                    config.DATABASE_PATH,
                    selected_b["id"],
                    service_obj["id"],
                    chosen_slot["id"],
                    c_name,
                    c_phone,
                    c_email
                )
                if success:
                    st.success(f"{msg} Your reference code is: **{details['booking_reference']}**")
                    st.balloons()
                else:
                    st.error(f"SlotGuard Alert: {msg}")

# -------------------------------------------------------------
# SCREEN 6: PRODUCT RESERVATION & ORDERS
# -------------------------------------------------------------
elif nav_choice == "🛍️ Product Reservations & Orders":
    st.markdown("## 🛍️ ReserveNow Product Pre-Booking & Checkout")
    st.markdown("Reserve products before visiting the shop with inventory lock, or simulate a demo online purchase.")

    st.markdown(f"<div class='disclaimer-banner'>⚠️ {PAYMENT_DISCLAIMER}</div>", unsafe_allow_html=True)

    businesses = repo.get_all_businesses_enriched(user_area=st.session_state.user_area)
    sel_b_name = st.selectbox("Select Store", options=[b["name"] for b in businesses])
    selected_b = next((b for b in businesses if b["name"] == sel_b_name), None)

    if selected_b:
        b_details = repo.get_business_by_id(selected_b["id"])
        products = b_details.get("products", [])

        if not products:
            st.info("No physical products found for this vendor.")
        else:
            col1, col2 = st.columns(2)
            with col1:
                prod_names = [f"{p['name']} (₹{p['price']:.0f} · Stock: {p['stock'] - p['reserved_stock']})" for p in products]
                sel_p_str = st.selectbox("Product", options=prod_names)
                p_idx = prod_names.index(sel_p_str)
                prod = products[p_idx]
                qty = st.number_input("Quantity", min_value=1, max_value=max(1, prod["stock"] - prod["reserved_stock"]), value=1)

            with col2:
                action_type = st.radio("Action", ["Reserve for Pickup (ReserveNow)", "Direct Checkout Order"])
                pay_method = st.selectbox("Payment Preference", ["Pay at Pickup", "Cash on Delivery", "Demo Online (Simulated)"])

            c_name = st.text_input("Your Name", "Mehak Jan")
            c_phone = st.text_input("Your Phone", "+91 94190 11003")
            c_email = st.text_input("Your Email", "mehak.jan@demo.local")

            if st.button("Complete Transaction"):
                if action_type == "Reserve for Pickup (ReserveNow)":
                    ok, msg, det = create_product_reservation(
                        config.DATABASE_PATH,
                        selected_b["id"],
                        prod["id"],
                        qty,
                        c_name,
                        c_phone,
                        c_email,
                        fulfillment_type="Pickup",
                        payment_preference=pay_method if pay_method in ("Pay at Pickup", "Demo Paid") else "Pending COD"
                    )
                    if ok:
                        st.success(f"{msg} Reservation ID: **{det['reservation_code']}**")
                    else:
                        st.error(msg)
                else:
                    method_map = {"Demo Online (Simulated)": "Demo Online", "Cash on Delivery": "Cash on Delivery", "Pay at Pickup": "Pay at Pickup"}
                    ok, msg, det = process_order_checkout(
                        config.DATABASE_PATH,
                        selected_b["id"],
                        c_name,
                        c_phone,
                        c_email,
                        items=[{"product_id": prod["id"], "quantity": qty}],
                        fulfillment_type="Pickup" if pay_method == "Pay at Pickup" else "Delivery",
                        payment_method=method_map[pay_method],
                        delivery_address="Main Market, Srinagar"
                    )
                    if ok:
                        st.success(f"{msg} Order Number: **{det['order_number']}**")
                        st.info(f"Payment Status: {det['payment_status']} · {det['disclaimer']}")
                    else:
                        st.error(msg)

# -------------------------------------------------------------
# SCREEN 7: BUSINESS OWNER STUDIO
# -------------------------------------------------------------
elif nav_choice == "🏬 Business Owner Studio":
    st.markdown("## 🏬 Business Owner Studio")
    st.caption("Manage catalog, update pricing, view customer appointments and orders.")

    businesses = repo.get_all_businesses_enriched(user_area=st.session_state.user_area)
    owner_biz = st.selectbox("Select Business to Manage (Demo Selector)", [b["name"] for b in businesses])
    b_obj = next((b for b in businesses if b["name"] == owner_biz), None)

    if b_obj:
        b_id = b_obj["id"]
        stats = get_business_studio_analytics(config.DATABASE_PATH, b_id)

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Products in Catalog", stats.get("product_count", 0))
        m2.metric("Total Stock", stats.get("total_stock", 0))
        m3.metric("Appointments", stats.get("appointment_count", 0))
        m4.metric("Revenue (Demo)", f"₹{stats.get('revenue', 0.0):.0f}")

        b_full = repo.get_business_by_id(b_id)
        st.markdown("### Existing Products")
        if b_full.get("products"):
            df_p = pd.DataFrame(b_full["products"])
            st.dataframe(df_p[["name", "price", "stock", "reserved_stock"]], use_container_width=True)

        st.markdown("### Customer Reviews")
        if b_full.get("reviews"):
            for r in b_full["reviews"][:5]:
                st.markdown(f"**{r['customer_name']}** ({r['rating']}★): {r['comment']}")

# -------------------------------------------------------------
# SCREEN 8: ANALYTICS DASHBOARD
# -------------------------------------------------------------
elif nav_choice == "📊 Analytics Dashboard":
    st.markdown("## 📊 Platform Operations Analytics")
    st.caption("Live aggregate analytics processed with Pandas and visualised with Plotly.")

    analytics = get_platform_analytics(config.DATABASE_PATH)

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Businesses", analytics["total_businesses"])
    m2.metric("Total Products", analytics["total_products"])
    m3.metric("Total Appointments", analytics["total_appointments"])
    m4.metric("Total Orders", analytics["total_orders"])

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("#### Businesses by Category")
        df_cat = pd.DataFrame(analytics["category_distribution"])
        if not df_cat.empty:
            fig1 = px.pie(df_cat, names="category", values="count", color_discrete_sequence=px.colors.sequential.Teal)
            st.plotly_chart(fig1, use_container_width=True)

    with c2:
        st.markdown("#### Businesses by Srinagar Area")
        df_area = pd.DataFrame(analytics["area_distribution"])
        if not df_area.empty:
            fig2 = px.bar(df_area, x="area", y="count", color_discrete_sequence=["#BF7149"])
            st.plotly_chart(fig2, use_container_width=True)

# -------------------------------------------------------------
# SCREEN 9: ADMIN & DATABASE
# -------------------------------------------------------------
elif nav_choice == "⚙️ Admin & Database":
    st.markdown("## ⚙️ Admin Demo Overview & Seeding")
    st.markdown("Administrative tools for college project demonstration and evaluation.")

    st.info(f"Database File: {config.DATABASE_PATH}")

    if st.button("🔄 Reset & Re-Seed Demo Dataset"):
        seed_database(config.DATABASE_PATH)
        st.success("Database successfully reset and seeded with 60 businesses, 180 products, 75+ services, and 240 slots!")
        st.rerun()
