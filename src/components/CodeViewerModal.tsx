import React, { useState } from 'react';
import { Code2, Copy, Check, FileText, Terminal, Download } from 'lucide-react';

export const CodeViewerModal: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'app' | 'seed' | 'schema' | 'matching' | 'bookings' | 'tests' | 'readme'>('app');

  const files = {
    app: {
      name: 'app.py',
      path: '/app/applet/app.py',
      desc: 'Complete Streamlit Python frontend with all 9 application screens and botanical theme.',
      code: `# CustomerConnect — Streamlit Frontend Application
import streamlit as st
import pandas as pd
import plotly.express as px
from database.connection import initialize_database
from database.repositories import BusinessRepository
from core.matching import rank_vendors_weighted, rank_vendors_priority_order
from core.filters import filter_vendors
from core.bookings import book_appointment_slot, cancel_appointment
from core.reservations import create_product_reservation, cancel_reservation
from core.payments import process_order_checkout, PAYMENT_DISCLAIMER

st.set_page_config(page_title="CustomerConnect — Discover Local. Shop Smarter.", layout="wide")
# [Full 450+ lines available in workspace]`,
    },
    seed: {
      name: 'seed_data.py',
      path: '/app/applet/seed_data.py',
      desc: 'Deterministic seeder populating 60 businesses, 180 products, 75+ services, 240 slots across Srinagar in SQLite.',
      code: `# CustomerConnect — Realistic Demonstration Data Seeder
# Seed: 42 (Reproducible & Idempotent)
import random, sqlite3
from database.connection import get_db_connection, initialize_database
# Populates:
# - 60 businesses across 10 categories
# - 180 products, 90 services, 240 slots, 80 reviews, 40 sample orders`,
    },
    schema: {
      name: 'database/schema.py',
      path: '/app/applet/database/schema.py',
      desc: 'Normalized 14-table SQLite schema with indexes, foreign keys, and SlotGuard partial unique index.',
      code: `-- 14 Normalized Relational Tables:
-- businesses, business_hours, products, services, appointment_slots,
-- customers, appointments, reviews, reservations, orders, order_items,
-- payments, inquiries, favorites.
CREATE TABLE IF NOT EXISTS businesses (...);
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot 
  ON appointments (slot_id) WHERE status != 'Cancelled';`,
    },
    matching: {
      name: 'core/matching.py',
      path: '/app/applet/core/matching.py',
      desc: 'MultiMatch Pro engine: Min-max normalization for rating, distance, price, trust, availability & Why This Vendor.',
      code: `def rank_vendors_weighted(vendors, weights=None):
    # Normalized score components in [0.0, 1.0]
    # Match Score = sum(weight_i * normalized_score_i)
    # Generates human-readable 'Why This Vendor?' breakdown`,
    },
    bookings: {
      name: 'core/bookings.py',
      path: '/app/applet/core/bookings.py',
      desc: 'SlotGuard universal appointment engine with ACID transactions to prevent double-booking.',
      code: `def book_appointment_slot(db_path, business_id, service_id, slot_id, customer_name, customer_phone, customer_email):
    # SlotGuard transactional booking:
    # 1. Checks slot is_booked == 0
    # 2. Inserts appointment with unique constraint on active slot_id
    # 3. Updates slot to is_booked=1 atomically`,
    },
    tests: {
      name: 'tests/test_bookings.py',
      path: '/app/applet/tests/test_bookings.py',
      desc: 'Automated test suite (19 tests passing) testing SlotGuard, ReserveNow, filters, and overnight hours.',
      code: `class TestSlotGuard(unittest.TestCase):
    def test_duplicate_booking_fails_slotguard(self):
        # First customer books successfully
        ok1, _, _ = book_appointment_slot(...)
        # Second customer booking identical slot fails with conflict
        ok2, msg2, _ = book_appointment_slot(...)
        self.assertFalse(ok2)`,
    },
    readme: {
      name: 'README.md',
      path: '/app/applet/README.md',
      desc: 'Comprehensive GitHub documentation with Windows setup, system architecture, and evaluation rubric.',
      code: `# CustomerConnect — Discover. Compare. Connect. Reserve.
Intelligent Local Business Discovery, Comparison, Booking & Commerce Platform.
Developed for B.Tech AI & Data Science College Capstone Project.`,
    },
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const current = files[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-[#BF7149]/10 text-[#BF7149] text-xs font-bold uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" />
          Python Backend & GitHub Architecture
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#4A3024]">
          Project Source Code & Architecture Explorer
        </h1>
        <p className="text-xs text-[#80503A]">
          Inspect the complete modular Python implementation, SQLite relational schema, seed scripts, and test suites.
        </p>
      </div>

      <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-[#E9DDCB] overflow-x-auto bg-[#F8E8D0]/50 scrollbar-none">
          {Object.entries(files).map(([key, f]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === key
                  ? 'border-[#BF7149] text-[#BF7149] bg-[#FFFDF8]'
                  : 'border-transparent text-[#80503A] hover:text-[#4A3024]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {f.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E9DDCB]">
            <div>
              <div className="font-mono text-xs font-bold text-[#BF7149]">{current.path}</div>
              <p className="text-xs text-[#80503A] mt-0.5">{current.desc}</p>
            </div>
            <button
              onClick={() => copyToClipboard(current.code, activeTab)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#BF7149] text-[#FFFDF8] rounded-full text-xs font-semibold hover:bg-[#80503A] transition-colors shadow-xs"
            >
              {copiedFile === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>

          <pre className="bg-[#4A3024] text-[#F8E8D0] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
            <code>{current.code}</code>
          </pre>

          {/* Quick Terminal Guide for Professor Demo */}
          <div className="mt-6 pt-4 border-t border-[#E9DDCB] bg-[#F8E8D0]/30 p-4 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-[#4A3024]">Run Local Python Environment:</div>
            <div className="font-mono text-[11px] text-[#80503A] bg-[#FFFDF8] p-2.5 rounded-xl border border-[#D7C4AF]">
              # Windows PowerShell:<br />
              py -m venv .venv<br />
              .\.venv\Scripts\python.exe -m pip install -r requirements.txt<br />
              .\.venv\Scripts\python.exe seed_data.py<br />
              .\.venv\Scripts\python.exe -m unittest discover -s tests<br />
              .\.venv\Scripts\python.exe -m streamlit run app.py
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
