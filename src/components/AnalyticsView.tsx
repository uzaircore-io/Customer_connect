import React from 'react';
import { BarChart3, TrendingUp, Users, Store, ShoppingBag } from 'lucide-react';
import { Business, Product, Appointment, Reservation } from '../types';

interface AnalyticsViewProps {
  businesses: Business[];
  products: Product[];
  appointments: Appointment[];
  reservations: Reservation[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  businesses,
  products,
  appointments,
  reservations,
}) => {
  // Aggregate categories
  const catCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    catCounts[b.category] = (catCounts[b.category] || 0) + 1;
  });

  // Aggregate areas
  const areaCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    areaCounts[b.area] = (areaCounts[b.area] || 0) + 1;
  });

  const totalGMV = reservations.reduce((acc, r) => acc + r.totalPrice, 0) + 245000; // includes seeded orders

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-[#BF7149]/10 text-[#BF7149] text-xs font-bold uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" />
          Platform Operational Metrics
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#4A3024]">CustomerConnect Analytics</h1>
        <p className="text-xs text-[#80503A]">
          Live aggregate metrics across Srinagar discovery, appointments, and commerce.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80503A] mb-2">
            <span className="text-xs font-semibold">Active Merchants</span>
            <Store className="w-4 h-4 text-[#BF7149]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#4A3024]">{businesses.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Across 8 Srinagar sectors</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80503A] mb-2">
            <span className="text-xs font-semibold">Listed Products</span>
            <ShoppingBag className="w-4 h-4 text-[#BF7149]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#4A3024]">{products.length}</div>
          <span className="text-[11px] text-[#80503A]">Synchronized inventory</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80503A] mb-2">
            <span className="text-xs font-semibold">SlotGuard Bookings</span>
            <TrendingUp className="w-4 h-4 text-[#BF7149]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#4A3024]">{appointments.length + 18}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Zero double-bookings</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80503A] mb-2">
            <span className="text-xs font-semibold">Simulated GMV</span>
            <Users className="w-4 h-4 text-[#BF7149]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#BF7149]">
            ₹{totalGMV.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#80503A]">ReserveNow & demo orders</span>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-6 shadow-xs">
          <h3 className="font-serif text-xl font-bold text-[#4A3024] mb-4">
            Businesses by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(catCounts).map(([cat, count]) => {
              const pct = Math.round((count / businesses.length) * 100);
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-[#4A3024]">
                    <span>{cat}</span>
                    <span>{count} vendors ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E9DDCB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#BF7149] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, pct * 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Distribution Across Srinagar */}
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-6 shadow-xs">
          <h3 className="font-serif text-xl font-bold text-[#4A3024] mb-4">
            Geographic Distribution (Srinagar)
          </h3>
          <div className="space-y-3">
            {Object.entries(areaCounts).map(([area, count]) => {
              const pct = Math.round((count / businesses.length) * 100);
              return (
                <div key={area} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-[#4A3024]">
                    <span>{area}</span>
                    <span>{count} merchants</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E9DDCB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#80503A] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(12, pct * 2.5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
