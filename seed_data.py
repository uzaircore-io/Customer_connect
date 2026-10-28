"""
CustomerConnect — Realistic Demonstration Data Seeder
Populates SQLite database with 60 businesses, 180 products, 75 services,
240 appointment slots, 80 reviews, 40 sample orders, reservations & inquiries across Srinagar, Kashmir.
Uses deterministic random seed (42) for reproducible demonstration.
"""

import random
import sqlite3
from datetime import datetime, timedelta, timezone
from database.connection import get_db_connection, initialize_database
import config

RANDOM_SEED = 42

BUSINESS_NAMES_BY_CATEGORY = {
    "Watches": [
        ("Kashmir Chrono Studio", "Heritage and luxury timepieces with master Swiss servicing.", "Lal Chowk"),
        ("Jhelum Watch Co.", "Vintage mechanical watches, quartz chronographs, and battery replacements.", "Rajbagh"),
        ("Chinar Precision Horology", "Authorized dealer of premium Japanese and Swiss wristwatches.", "Jawahar Nagar"),
        ("Boulevard Timepieces", "Minimalist dress watches and antique pocket watch restorations.", "Sanat Nagar"),
        ("Valley Dial Works", "Sports timepieces, smartwatches, and custom leather watch straps.", "Baghat"),
        ("Zabarwan Watch House", "Affordable and classic family timekeeping with warranty support.", "Rawalpora"),
    ],
    "Jewelry": [
        ("Nightingale Gold Smiths", "Handcrafted traditional Kashmiri 22k bridal and temple jewelry.", "Lal Chowk"),
        ("Chinar Silver & Gems", "Hand-engraved sterling silver jewelry, jade pendants, and rings.", "Rajbagh"),
        ("Saffron Valley Jewelers", "Contemporary fine diamond solitaires and platinum bands.", "Jawahar Nagar"),
        ("Koh-i-Maran Ornaments", "Antique silver filigree, ethnic chokers, and lapis lazuli stones.", "Sanat Nagar"),
        ("Pari Mahal Gems", "Certified gemstones, ruby earrings, and bespoke engagement rings.", "Baghat"),
        ("Gulmarg Silver Craft", "Traditional tribal silver cuffs, ear cuffs, and modern minimalist jewelry.", "Barzulla"),
    ],
    "Electronics": [
        ("Valley Smart Tech Hub", "Laptops, high-fidelity audio equipment, and home automation systems.", "Lal Chowk"),
        ("Lal Chowk Digital Point", "Smartphones, tablets, wireless headphones, and genuine accessories.", "Lal Chowk"),
        ("Highland Sound & Vision", "Audiophile headphones, DACs, projectors, and home theater setups.", "Rajbagh"),
        ("Chinar Cybertronics", "Custom PC gaming rigs, graphic cards, and networking solutions.", "Sanat Nagar"),
        ("Kashmir Gadget Depot", "Smart home devices, dashcams, and mobile photography gear.", "Rawalpora"),
        ("Apex Apple & PC Reseller", "Authorized computer accessories, displays, and repair parts.", "Barzulla"),
    ],
    "Clothing": [
        ("Pashmina & Loom Boutique", "Authentic handwoven cashmere pashmina shawls and stoles.", "Lal Chowk"),
        ("Chinar Silk Emporium", "Pure silk sarees, formal kurtas, and traditional Kashmiri pherans.", "Rajbagh"),
        ("Srinagar Heritage Weaves", "Embroidered jackets, artisan scarves, and wool coats.", "Jawahar Nagar"),
        ("Urban Valley Apparel", "Contemporary casual wear, linen shirts, and tailored trousers.", "Baghat"),
        ("Gulshan Men's Tailoring", "Bespoke formal suits, tuxedos, and made-to-measure blazers.", "Sanat Nagar"),
        ("Koshur Couture", "Fusion bridal wear, embroidered capes, and bespoke occasion wear.", "Barzulla"),
    ],
    "Salons": [
        ("Velvet Chinar Grooming Lounge", "Executive men's grooming, beard styling, and revitalizing facials.", "Rajbagh"),
        ("Lotus Herbals & Spa", "Ayurvedic hair therapies, organic facials, and bridal makeovers.", "Lal Chowk"),
        ("Aura Unisex Hair Studio", "Precision hair sculpting, balayage coloring, and keratin treatments.", "Jawahar Nagar"),
        ("Bloom Beauty & Wellness", "Skin rejuvenation, herbal massages, and manicures.", "Sanat Nagar"),
        ("The Gentleman's Chair", "Hot towel shaves, classic fades, and beard oils.", "Baghat"),
        ("Silk & Sheen Studio", "Bridal artistry, hair extensions, and customized spa rituals.", "Nowgam"),
    ],
    "Clinics": [
        ("Valley Diagnostic Care", "Comprehensive wellness checks, pathology labs, and consultations.", "Lal Chowk"),
        ("Chinar Dental Specialists", "Painless root canals, cosmetic teeth whitening, and alignment.", "Rajbagh"),
        ("Srinagar Ortho & Physio Clinic", "Sports rehabilitation, spine therapy, and joint wellness.", "Jawahar Nagar"),
        ("Kashmir Vision Center", "Comprehensive eye examinations, spectacles, and contact lens fittings.", "Sanat Nagar"),
        ("Dr. Mir Family Practice", "General consultations, pediatrics, and preventive health screenings.", "Rawalpora"),
        ("Serenity Skin & Derma", "Dermatology consultations, acne therapy, and medical facials.", "Barzulla"),
    ],
    "Restaurants": [
        ("Ahdoos Wazwan Corner", "Authentic 7-course Kashmiri wazwan feasts and mutton seekh kebabs.", "Lal Chowk"),
        ("Chinar Pine Bistro", "Freshly baked walnut bread, Kashmiri Kahwa, and Italian wood-fired pizza.", "Rajbagh"),
        ("Mughal Darbar Traditional", "Gushtaba, Rogan Josh, Rista, and saffron pulao.", "Lal Chowk"),
        ("Boulevard Cafe 1950", "Artisan coffees, cold brews, French pastries, and lakeview brunch.", "Sanat Nagar"),
        ("The Herb & Spice Kitchen", "Vegetarian North Indian thalis, paneer specialties, and naan.", "Baghat"),
        ("Saffron Terrace Grill", "Charcoal barbecue, roasted trout fish, and tandoori breads.", "Barzulla"),
    ],
    "Home Services": [
        ("Valley Spark Electricals", "Residential electrical wiring, inverter backup, and chandelier setup.", "Lal Chowk"),
        ("Chinar Flow Plumbing & Heating", "Central heating maintenance, boiler repairs, and bathroom plumbing.", "Rajbagh"),
        ("Kashmir Safe Home Solutions", "CCTV surveillance installation, smart locks, and intercoms.", "Jawahar Nagar"),
        ("CleanNest Deep Cleaning", "Sofa extraction, rug washing, kitchen sanitization, and deep cleaning.", "Sanat Nagar"),
        ("Alpine Thermal Insulation", "Double glazed window sealing, roof weatherproofing, and attic heating.", "Nowgam"),
        ("Heritage Wood Polishing", "Walnut wood conditioning, floor lacquering, and antique furniture restoration.", "Barzulla"),
    ],
    "Tutors": [
        ("Apex AI & Data Science Academy", "Python, machine learning, deep learning, and college project coaching.", "Rajbagh"),
        ("Kashmir Physics & Math Circle", "IIT-JEE and NEET foundation coaching with interactive problem solving.", "Lal Chowk"),
        ("Chinar Coding Bootcamp", "Full-stack web development, React, Node.js, and database engineering.", "Jawahar Nagar"),
        ("Valley English & IELTS Studio", "Spoken English, IELTS band 8+ preparation, and business communication.", "Sanat Nagar"),
        ("Scholars ChemLab Coaching", "Organic chemistry, lab demonstrations, and board exam mentoring.", "Baghat"),
        ("Pioneer Commerce Hub", "Financial accounting, economics, and CA Foundation tutoring.", "Rawalpora"),
    ],
    "Repair Services": [
        ("Valley Mobile Doctor", "Instant display replacement, battery swap, and motherboard IC repairs.", "Lal Chowk"),
        ("Chinar Laptop Specialists", "MacBook logic board repair, SSD upgrades, and liquid damage recovery.", "Rajbagh"),
        ("Precision Appliance Clinic", "Refrigerator, washing machine, and microwave repairs at doorstep.", "Jawahar Nagar"),
        ("Srinagar Camera Repair Lab", "DSLR sensor cleaning, lens calibration, and shutter mechanism fixes.", "Sanat Nagar"),
        ("AutoFix Kashmiri Motors", "Two-wheeler tuning, brake service, and carburettor cleaning.", "Rawalpora"),
        ("Master Clock & Instrument Fix", "Antique mechanical pendulum repairs and precision gauge restoration.", "Barzulla"),
    ],
}

SAMPLE_REVIEWS = [
    (5, "Exceptional craftsmanship and transparent pricing. Highly recommended in Srinagar!"),
    (5, "Best in town! Very polite staff, genuine products, and spotless service."),
    (4, "Great experience overall. Fair price and delivered right on time."),
    (4, "High quality work. Parking was slightly crowded near the area, but the business itself is 5-star."),
    (5, "Booking through CustomerConnect was so effortless. Found them in 2 minutes!"),
    (3, "Good service, but waiting time was a little longer than expected during peak evening hours."),
    (5, "Top notch quality! Definitely returning for all my future requirements."),
    (4, "Very responsive over WhatsApp before I even visited the shop."),
]

SAMPLE_CUSTOMERS = [
    ("Aadil Hussain", "+91 94190 11001", "aadil.hussain@demo.local"),
    ("Zubair Ahmad", "+91 94190 11002", "zubair.ahmad@demo.local"),
    ("Mehak Jan", "+91 94190 11003", "mehak.jan@demo.local"),
    ("Faizan Tariq", "+91 94190 11004", "faizan.tariq@demo.local"),
    ("Iqra Bashir", "+91 94190 11005", "iqra.bashir@demo.local"),
    ("Umar Farooq", "+91 94190 11006", "umar.farooq@demo.local"),
    ("Sana Mir", "+91 94190 11007", "sana.mir@demo.local"),
    ("Tanveer Wani", "+91 94190 11008", "tanveer.wani@demo.local"),
]


def seed_database(db_path: str = config.DATABASE_PATH) -> None:
    """Wipe and seed reproducible demonstration database."""
    random.seed(RANDOM_SEED)

    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    # Drop existing tables cleanly to ensure idempotency
    cursor.execute("PRAGMA foreign_keys = OFF;")
    tables = [
        "favorites", "inquiries", "payments", "order_items", "orders",
        "reservations", "reviews", "appointments", "customers",
        "appointment_slots", "services", "products", "business_hours", "businesses"
    ]
    for tbl in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {tbl};")
    cursor.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    # Initialize schema
    initialize_database(db_path)

    # Insert Customers
    for name, phone, email in SAMPLE_CUSTOMERS:
        cursor.execute(
            "INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)",
            (name, phone, email)
        )

    # Insert 60 Businesses across 10 categories
    business_counter = 0
    all_biz_ids = []
    appointment_biz_ids = []

    for cat_name, biz_list in BUSINESS_NAMES_BY_CATEGORY.items():
        for name, desc, area in biz_list:
            business_counter += 1
            coords = config.SRINAGAR_AREAS.get(area, config.SRINAGAR_AREAS["Lal Chowk"])
            # Small realistic spatial jitter around area center (~200-800m)
            lat = round(coords["lat"] + random.uniform(-0.005, 0.005), 5)
            lon = round(coords["lon"] + random.uniform(-0.005, 0.005), 5)

            phone = f"+91 94190 {random.randint(20000, 99999)}"
            wa = f"9194190{random.randint(20000, 99999)}"
            email = f"contact@{name.lower().replace(' ', '').replace('&', '').replace('-', '')[:14]}.demo.local"

            verified = 1 if random.random() > 0.25 else 0
            has_warranty = 1 if cat_name in ("Electronics", "Watches", "Repair Services", "Home Services") else (1 if random.random() > 0.5 else 0)
            has_return = 1 if cat_name in ("Clothing", "Watches", "Jewelry", "Electronics") else 0

            cursor.execute(
                """
                INSERT INTO businesses (
                    name, category, area, address, latitude, longitude,
                    phone, whatsapp, email, verified, has_warranty,
                    has_return_policy, supports_online_pay, supports_cod,
                    supports_pay_at_pickup, avg_rating, review_count, description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 0.0, 0, ?)
                """,
                (
                    name, cat_name, area, f"{random.randint(10, 180)}, Main Market, {area}, Srinagar",
                    lat, lon, phone, wa, email, verified, has_warranty, has_return, desc
                )
            )
            biz_id = cursor.lastrowid
            all_biz_ids.append((biz_id, cat_name, name))

            if cat_name in ("Salons", "Clinics", "Tutors", "Repair Services", "Home Services"):
                appointment_biz_ids.append(biz_id)

            # Insert Business Hours (Monday to Sunday)
            is_overnight = 1 if cat_name in ("Restaurants",) and random.random() > 0.7 else 0
            open_h = "11:00" if is_overnight else "09:30"
            close_h = "01:30" if is_overnight else "20:00"

            for day_idx in range(7):
                # Sunday closed for some services
                is_closed = 1 if (day_idx == 6 and cat_name in ("Clinics", "Tutors") and random.random() > 0.4) else 0
                cursor.execute(
                    """
                    INSERT INTO business_hours (business_id, day_of_week, is_closed, open_time, close_time, is_overnight)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (biz_id, day_idx, is_closed, open_h, close_h, is_overnight)
                )

    # Insert Products (3 products per retail/goods business = 180 total products)
    product_templates = {
        "Watches": [
            ("Classic Automatic Heritage", 8500.0, 15, "Self-winding movement with sapphire crystal and leather strap."),
            ("Sapphire Chronograph Pro", 14500.0, 8, "Precision stopwatch tachymeter with 100m water resistance."),
            ("Minimalist Sunray Dress Watch", 3800.0, 25, "Ultra-thin stainless steel mesh watch with sunburst dial."),
        ],
        "Jewelry": [
            ("Handcrafted Silver Filigree Earrings", 2800.0, 18, "Traditional Kashmiri artisan filigree in 925 sterling silver."),
            ("Dejhoor Pendant Chain Set", 12500.0, 6, "Authentic bridal dejhoor motif with 18k gold vermeil finish."),
            ("Carved Lapis Lazuli Ring", 1950.0, 30, "Natural Afghan lapis stone set in bezel silver band."),
        ],
        "Electronics": [
            ("AuraFlow Studio ANC Headphones", 6499.0, 12, "Hybrid active noise cancellation with 40-hour battery life."),
            ("VoltPro 65W GaN Fast Charger", 1499.0, 40, "Dual USB-C fast charger for laptops and smartphones."),
            ("StreamCast 4K Ultra Webcam", 3200.0, 14, "Crisp 60fps streaming with dual stereo noise-reducing mics."),
        ],
        "Clothing": [
            ("Pure Cashmere Hand-Spun Pashmina", 9500.0, 10, "Feather-light GI-certified authentic handwoven Kashmiri pashmina."),
            ("Tilla Embroidered Woolen Pheran", 6200.0, 15, "Warm soft wool pheran with metallic Kashmiri tilla needlework."),
            ("Handloom Khadi Linen Shirt", 1850.0, 22, "Breathable natural dye relaxed fit organic summer shirt."),
        ],
        "Restaurants": [
            ("Traditional Wazwan Feast Platter", 1400.0, 20, "Complete tasting set: Rogan Josh, Rista, Seekh Kebab, and Kahwa."),
            ("Special Saffron Kahwa Jar (250g)", 650.0, 35, "Whole green tea leaves blended with pure saffron and almonds."),
            ("Walnut Fudge Cake Box", 450.0, 25, "Traditional local walnut brownie fudge confection."),
        ],
        "Repair Services": [
            ("Tempered Glass & Curved Screen Guard", 350.0, 50, "9H hardness Oleophobic protective glass coating."),
            ("Braided Fast Data USB-C Cable", 499.0, 60, "Reinforced aramid fiber 100W PD charging cable."),
            ("Magnetic Laptop Thermal Cooling Stand", 1200.0, 15, "Aluminum ergonomic folding stand with heat dissipation."),
        ],
    }

    product_count = 0
    all_products = []
    for biz_id, cat_name, biz_name in all_biz_ids:
        templates = product_templates.get(cat_name, [
            (f"{biz_name} Signature Package A", 1200.0, 20, "Standard curated product/starter kit."),
            (f"{biz_name} Premium Package B", 2500.0, 15, "Upgraded edition with added warranty and accessories."),
            (f"{biz_name} Value Choice C", 650.0, 30, "Essential daily product offering."),
        ])
        for p_name, price, stock, desc in templates:
            cursor.execute(
                """
                INSERT INTO products (business_id, name, category, price, stock, reserved_stock, description, sku)
                VALUES (?, ?, ?, ?, ?, 0, ?, ?)
                """,
                (biz_id, p_name, cat_name, price, stock, desc, f"SKU-{cat_name[:3].upper()}-{biz_id}-{product_count+1}")
            )
            product_count += 1
            all_products.append((cursor.lastrowid, biz_id, price))

    # Insert Services for service businesses (75 services total)
    service_templates = {
        "Salons": [
            ("Royal Beard Sculpt & Hot Towel Shave", 450.0, 35, "Steam preparation, botanical oil massage, and razor finish."),
            ("Deep Herbal Scalp & Hair Spa", 950.0, 50, "Argan oil infusion with scalp pressure point massage."),
            ("Full Executive Haircut & Styling", 500.0, 40, "Consultation, precision cut, wash, and blow dry."),
        ],
        "Clinics": [
            ("General Health & Vitals Consultation", 400.0, 25, "Blood pressure, ECG review, and preventive health exam."),
            ("Complete Dental Cleaning & Polish", 1200.0, 45, "Ultrasonic scaling and enamel stain removal."),
            ("Digital Eye Refraction & Retinal Scan", 350.0, 20, "Computerized vision acuity and intraocular pressure test."),
        ],
        "Tutors": [
            ("1-on-1 Data Science & AI Mentorship", 1500.0, 60, "Personalized Python algorithms and project code review."),
            ("College Math & Statistics Problem Class", 800.0, 60, "Linear algebra, probability, and calculus mastery."),
            ("IELTS Speaking & Listening Mock Exam", 900.0, 45, "Full simulated interview with structured feedback."),
        ],
        "Home Services": [
            ("Boiler & Heating System Winterization", 1800.0, 90, "Inspection, pressure testing, and radiator bleed."),
            ("Kitchen & Deep Home Sanitization", 2400.0, 120, "Industrial steam cleaner extraction for tiles and rugs."),
            ("Smart CCTV Surveillance Configuration", 1500.0, 60, "Wiring, Wi-Fi pairing, and mobile alert setup."),
        ],
        "Repair Services": [
            ("Smartphone Display & Touch IC Replacement", 2200.0, 45, "Original OLED display with 6 months warranty."),
            ("Laptop Thermal Paste & Fan Deep Clean", 850.0, 40, "Eliminates thermal throttling and fan noise."),
            ("Water Damaged Logic Board Diagnostic", 1100.0, 60, "Ultrasonic board wash and micro-soldering inspection."),
        ],
    }

    all_services = []
    for biz_id in appointment_biz_ids:
        # Get category of this business
        cursor.execute("SELECT category FROM businesses WHERE id = ?", (biz_id,))
        cat = cursor.fetchone()["category"]
        s_list = service_templates.get(cat, [
            ("Professional Diagnostic & Consultation", 600.0, 45, "Thorough on-site evaluation and quote."),
            ("Standard Service Package", 1200.0, 60, "Full operational service and tuning."),
            ("Express Priority Service", 1800.0, 30, "Priority emergency turnaround."),
        ])
        for s_name, price, dur, desc in s_list:
            cursor.execute(
                """
                INSERT INTO services (business_id, name, category, price, duration_minutes, description)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (biz_id, s_name, cat, price, dur, desc)
            )
            all_services.append((cursor.lastrowid, biz_id, price))

    # Insert 240 Appointment Slots across the next 7 days
    base_date = datetime.now().date()
    times = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30"]
    slot_count = 0
    all_slots = []

    for biz_id in appointment_biz_ids[:20]:  # Seed across 20 appointment-enabled businesses
        for day_offset in range(1, 4):  # Next 3 days
            date_str = (base_date + timedelta(days=day_offset)).isoformat()
            for t in times[:4]:
                end_t = (datetime.strptime(t, "%H:%M") + timedelta(minutes=60)).strftime("%H:%M")
                cursor.execute(
                    """
                    INSERT INTO appointment_slots (business_id, slot_date, start_time, end_time, is_booked)
                    VALUES (?, ?, ?, ?, 0)
                    """,
                    (biz_id, date_str, t, end_t)
                )
                slot_count += 1
                all_slots.append((cursor.lastrowid, biz_id, date_str, t))

    # Insert 80 Customer Reviews with realistic text & recalculate ratings
    for _ in range(80):
        biz = random.choice(all_biz_ids)
        biz_id = biz[0]
        cust = random.choice(SAMPLE_CUSTOMERS)
        rating, comment = random.choice(SAMPLE_REVIEWS)
        # Small random variation in rating
        r_val = max(1, min(5, rating + random.choice([0, 0, 0, -1, 1])))

        cursor.execute(
            """
            INSERT INTO reviews (business_id, customer_name, rating, comment, is_verified_transaction)
            VALUES (?, ?, ?, ?, 1)
            """,
            (biz_id, cust[0], r_val, comment)
        )

    # Recalculate average ratings for all businesses
    for biz_id, _, _ in all_biz_ids:
        cursor.execute("SELECT COUNT(*) as cnt, AVG(rating) as avg_r FROM reviews WHERE business_id = ?", (biz_id,))
        stat = cursor.fetchone()
        cnt = stat["cnt"]
        avg_r = round(stat["avg_r"], 2) if cnt > 0 else round(random.uniform(4.0, 4.9), 1)
        cnt = cnt if cnt > 0 else random.randint(5, 25)
        cursor.execute("UPDATE businesses SET avg_rating = ?, review_count = ? WHERE id = ?", (avg_r, cnt, biz_id))

    # Insert 40 Sample Orders & Payments
    for i in range(40):
        prod = random.choice(all_products)
        p_id, b_id, price = prod
        cust = random.choice(SAMPLE_CUSTOMERS)
        qty = random.randint(1, 3)
        total = price * qty
        order_num = f"CC-ORD-{1000 + i}"
        status = random.choice(["Confirmed", "Processing", "Delivered", "Ready for Pickup"])
        fulfillment = random.choice(["Pickup", "Delivery"])
        pay_method = random.choice(["Demo Online", "Cash on Delivery", "Pay at Pickup"])
        pay_status = "Demo Paid" if pay_method == "Demo Online" else ("Pending at Pickup" if pay_method == "Pay at Pickup" else "Pending COD")

        cursor.execute(
            """
            INSERT INTO orders (
                order_number, business_id, customer_name, customer_phone,
                customer_email, total_amount, fulfillment_type,
                delivery_address, order_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (order_num, b_id, cust[0], cust[1], cust[2], total, fulfillment, "Lal Chowk, Srinagar", status)
        )
        ord_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
            (ord_id, p_id, qty, price, total)
        )

        cursor.execute(
            """
            INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_ref, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (ord_id, total, pay_method, pay_status, f"TXN-DEMO-{10000+i}", "Initial seed demonstration transaction")
        )

    # Insert Sample Reservations & Inquiries
    for i in range(12):
        prod = random.choice(all_products)
        p_id, b_id, price = prod
        cust = random.choice(SAMPLE_CUSTOMERS)
        res_code = f"CC-RES-{2000 + i}"
        exp = (datetime.now(timezone.utc) + timedelta(hours=48)).isoformat()
        cursor.execute(
            """
            INSERT INTO reservations (
                reservation_code, business_id, product_id, quantity,
                customer_name, customer_phone, customer_email,
                fulfillment_type, payment_preference, status, expires_at
            ) VALUES (?, ?, ?, 1, ?, ?, ?, 'Pickup', 'Pay at Pickup', 'Confirmed', ?)
            """,
            (res_code, b_id, p_id, cust[0], cust[1], cust[2], exp)
        )

    for i in range(10):
        biz = random.choice(all_biz_ids)
        cust = random.choice(SAMPLE_CUSTOMERS)
        cursor.execute(
            """
            INSERT INTO inquiries (business_id, customer_name, customer_phone, message, channel, is_resolved)
            VALUES (?, ?, ?, ?, 'WhatsApp', ?)
            """,
            (biz[0], cust[0], cust[1], f"Hello! Is the {biz[1]} item available for instant pickup today?", random.choice([0, 1]))
        )

    conn.commit()
    conn.close()
    print(f"CustomerConnect database successfully seeded at: {db_path}")
    print(f"Populated: {len(all_biz_ids)} businesses, {product_count} products, {len(all_services)} services, {slot_count} slots.")


if __name__ == "__main__":
    seed_database()
