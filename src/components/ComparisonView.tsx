import React from 'react';
import { Scale, Check, X, Trash2, ArrowLeft } from 'lucide-react';
import { Business } from '../types';

interface ComparisonViewProps {
  comparisonBusinesses: Business[];
  onRemoveFromCompare: (id: number) => void;
  onClearAll: () => void;
  onExploreMore: () => void;
  onBookAppointment: (b: Business) => void;
  onReserveProduct: (b: Business) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  comparisonBusinesses,
  onRemoveFromCompare,
  onClearAll,
  onExploreMore,
  onBookAppointment,
  onReserveProduct,
}) => {
  if (comparisonBusinesses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#BF7149]/10 text-[#BF7149] flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#4A3024] mb-2">No Vendors in Comparison</h2>
        <p className="text-sm text-[#80503A] max-w-md mx-auto mb-6">
          Add up to 4 local merchants from Explore or MultiMatch Pro to compare them side by side across pricing, ratings, warranties, and service details.
        </p>
        <button
          onClick={onExploreMore}
          className="px-6 py-2.5 bg-[#BF7149] text-[#FFFDF8] font-semibold text-xs rounded-full hover:bg-[#80503A] transition-colors"
        >
          Browse Local Businesses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onExploreMore}
            className="inline-flex items-center gap-1 text-xs text-[#80503A] hover:text-[#BF7149] mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
          </button>
          <h1 className="font-serif text-3xl font-bold text-[#4A3024]">
            Side-by-Side Vendor Comparison
          </h1>
          <p className="text-xs text-[#80503A]">
            Comparing {comparisonBusinesses.length} of 4 businesses in Srinagar
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#80503A] hover:text-red-700 border border-[#D7C4AF] rounded-full hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Comparison
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-4 min-w-[700px]"
          style={{ gridTemplateColumns: `repeat(${comparisonBusinesses.length}, minmax(240px, 1fr))` }}
        >
          {comparisonBusinesses.map((b) => (
            <div
              key={b.id}
              className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header with image */}
                <div className="relative h-36 rounded-2xl overflow-hidden mb-3 bg-[#E9DDCB]">
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => onRemoveFromCompare(b.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FFFDF8]/90 text-[#80503A] hover:text-red-600 flex items-center justify-center shadow-xs transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] uppercase font-bold text-[#BF7149] tracking-wider mb-1">
                  {b.category}
                </div>
                <h3 className="font-serif text-xl font-bold text-[#4A3024] mb-1">{b.name}</h3>
                <p className="text-xs text-[#80503A] mb-4">{b.area}</p>

                {/* Attributes Comparison */}
                <div className="space-y-3 text-xs border-t border-[#E9DDCB] pt-3">
                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Starting Price</span>
                    <span className="font-bold text-[#BF7149]">
                      ₹{b.startingPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Customer Rating</span>
                    <span className="font-bold text-[#4A3024]">
                      ★ {b.avgRating.toFixed(1)} ({b.reviewCount})
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Proximity</span>
                    <span className="font-medium text-[#4A3024]">
                      {b.distanceKm?.toFixed(1)} km away
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Verified Status</span>
                    <span>
                      {b.verified ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <X className="w-4 h-4 text-stone-400 inline" />
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Warranty Included</span>
                    <span>
                      {b.hasWarranty ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <X className="w-4 h-4 text-stone-400 inline" />
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Return Policy</span>
                    <span>
                      {b.hasReturnPolicy ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <X className="w-4 h-4 text-stone-400 inline" />
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Pay at Pickup</span>
                    <span>
                      {b.supportsPayAtPickup ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <X className="w-4 h-4 text-stone-400 inline" />
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#E9DDCB]/50">
                    <span className="text-[#80503A]">Cash on Delivery</span>
                    <span>
                      {b.supportsCod ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <X className="w-4 h-4 text-stone-400 inline" />
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#80503A]">Current Status</span>
                    <span className={b.isOpenNow ? 'text-emerald-700 font-semibold' : 'text-[#80503A]'}>
                      {b.openStatusText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-3 border-t border-[#E9DDCB]">
                {b.category === 'Salons' || b.category === 'Clinics' || b.category === 'Tutors' ? (
                  <button
                    onClick={() => onBookAppointment(b)}
                    className="w-full py-2 bg-[#80503A] text-[#FFFDF8] rounded-xl text-xs font-semibold hover:bg-[#4A3024] transition-colors"
                  >
                    Book Appointment
                  </button>
                ) : (
                  <button
                    onClick={() => onReserveProduct(b)}
                    className="w-full py-2 bg-[#BF7149] text-[#FFFDF8] rounded-xl text-xs font-semibold hover:bg-[#80503A] transition-colors"
                  >
                    Reserve Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
