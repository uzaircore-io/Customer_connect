import React, { useState } from 'react';
import { SlidersHorizontal, CheckCircle2, AlertCircle, Sparkles, Scale, Info, ArrowUpDown } from 'lucide-react';
import { Business, MultiMatchWeights } from '../types';
import { checkHardFilters, scoreAndRankVendors, ScoredBusiness } from '../utils/engine';

interface MultiMatchViewProps {
  businesses: Business[];
  userArea: string;
  comparisonIds: number[];
  onToggleCompare: (id: number) => void;
  onBookAppointment: (b: Business) => void;
  onReserveProduct: (b: Business) => void;
}

export const MultiMatchView: React.FC<MultiMatchViewProps> = ({
  businesses,
  userArea,
  comparisonIds,
  onToggleCompare,
  onBookAppointment,
  onReserveProduct,
}) => {
  // Hard filters
  const [maxBudget, setMaxBudget] = useState<number>(15000);
  const [minRating, setMinRating] = useState<number>(4.0);
  const [maxDistance, setMaxDistance] = useState<number>(6.0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [warrantyOnly, setWarrantyOnly] = useState<boolean>(false);
  const [returnPolicyOnly, setReturnPolicyOnly] = useState<boolean>(false);

  // Ranking Mode & Weights
  const [rankingMode, setRankingMode] = useState<'weighted' | 'priority'>('weighted');
  const [weights, setWeights] = useState<MultiMatchWeights>({
    rating: 0.35,
    distance: 0.25,
    price: 0.25,
    trust: 0.15,
  });

  // Evaluate hard filters
  const exactMatches: Business[] = [];
  const nearMatches: ScoredBusiness[] = [];
  const failureFrequency: Record<string, number> = {};

  businesses.forEach((b) => {
    const { passes, failedReasons } = checkHardFilters(b, {
      maxBudget,
      minRating,
      maxDistance,
      category: selectedCategory,
      verifiedOnly,
      openNow: openNowOnly,
      hasWarranty: warrantyOnly,
      hasReturnPolicy: returnPolicyOnly,
    });

    if (passes) {
      exactMatches.push(b);
    } else {
      failedReasons.forEach((r) => {
        failureFrequency[r] = (failureFrequency[r] || 0) + 1;
      });
      if (failedReasons.length <= 2) {
        nearMatches.push({
          ...b,
          matchScore: 0,
          whyThisVendor: 'Near Match candidate',
          compatibilityBreakdown: {
            ratingScore: '0%',
            distanceConvenience: '0%',
            priceAffordability: '0%',
            trustScore: '0%',
          },
          nearMissReasons: failedReasons,
        });
      }
    }
  });

  const rankedExact = scoreAndRankVendors(exactMatches, weights);
  const rankedNear = scoreAndRankVendors(nearMatches, weights).slice(0, 4);

  // Top restrictive reasons
  const topRestrictive = Object.entries(failureFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Tagline */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-[#BF7149]/10 text-[#BF7149] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          MultiMatch Pro Decision Engine
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3024]">
          Personalized Multi-Priority Recommendation
        </h1>
        <p className="text-sm text-[#80503A] max-w-2xl mt-1">
          Combine non-negotiable hard filters with transparent normalized mathematical scoring. Zero black-box bias.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Filter Controls & Weight Sliders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Hard Filters Panel */}
          <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDCB] mb-4">
              <h2 className="font-serif text-lg font-bold text-[#4A3024] flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#BF7149]" />
                1. Non-Negotiable Hard Filters
              </h2>
              <span className="text-[11px] font-bold text-[#BF7149] uppercase">Strict AND</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category */}
              <div>
                <label className="block font-semibold text-[#4A3024] mb-1">Business Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-2.5 py-1.5 font-medium text-[#4A3024] focus:outline-none"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Watches">Watches</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Salons">Salons</option>
                  <option value="Clinics">Clinics</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Tutors">Tutors</option>
                  <option value="Repair Services">Repair Services</option>
                </select>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Max Starting Budget</span>
                  <span className="text-[#BF7149] font-bold">₹{maxBudget.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>

              {/* Min Rating Slider */}
              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Minimum Rating</span>
                  <span className="text-[#BF7149] font-bold">{minRating.toFixed(1)} ★</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>

              {/* Max Distance */}
              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Max Distance from {userArea}</span>
                  <span className="text-[#BF7149] font-bold">{maxDistance.toFixed(1)} km</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="15.0"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>

              {/* Feature checkboxes */}
              <div className="pt-2 border-t border-[#E9DDCB] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#4A3024]">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded accent-[#BF7149]"
                  />
                  <span>Verified Merchant Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#4A3024]">
                  <input
                    type="checkbox"
                    checked={openNowOnly}
                    onChange={(e) => setOpenNowOnly(e.target.checked)}
                    className="rounded accent-[#BF7149]"
                  />
                  <span>Currently Open Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#4A3024]">
                  <input
                    type="checkbox"
                    checked={warrantyOnly}
                    onChange={(e) => setWarrantyOnly(e.target.checked)}
                    className="rounded accent-[#BF7149]"
                  />
                  <span>Warranty Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#4A3024]">
                  <input
                    type="checkbox"
                    checked={returnPolicyOnly}
                    onChange={(e) => setReturnPolicyOnly(e.target.checked)}
                    className="rounded accent-[#BF7149]"
                  />
                  <span>Return Policy Guaranteed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Multi-Priority Ranking Weights Panel */}
          <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDCB] mb-4">
              <h2 className="font-serif text-lg font-bold text-[#4A3024] flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-[#BF7149]" />
                2. Multi-Priority Weights
              </h2>
              <span className="text-[11px] font-bold text-[#80503A]">Algorithm: SmartMatch</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Rating Importance</span>
                  <span className="text-[#BF7149] font-bold">{Math.round(weights.rating * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.rating}
                  onChange={(e) => setWeights({ ...weights, rating: Number(e.target.value) })}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Proximity / Distance Convenience</span>
                  <span className="text-[#BF7149] font-bold">{Math.round(weights.distance * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.distance}
                  onChange={(e) => setWeights({ ...weights, distance: Number(e.target.value) })}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Price Affordability</span>
                  <span className="text-[#BF7149] font-bold">{Math.round(weights.price * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.price}
                  onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#4A3024] mb-1">
                  <span>Trust & Review Volume</span>
                  <span className="text-[#BF7149] font-bold">{Math.round(weights.trust * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.trust}
                  onChange={(e) => setWeights({ ...weights, trust: Number(e.target.value) })}
                  className="w-full accent-[#BF7149] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Exact Matches & Why This Vendor Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#4A3024]">
              Exact Matches ({rankedExact.length})
            </h2>
            <span className="text-xs text-[#80503A]">
              Sorted by normalized multi-criteria SmartMatch score
            </span>
          </div>

          {rankedExact.length === 0 ? (
            <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#BF7149]/10 rounded-full flex items-center justify-center mx-auto text-[#BF7149]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4A3024]">
                No exact matches satisfy all hard filters simultaneously
              </h3>
              <p className="text-xs text-[#80503A] max-w-md mx-auto">
                Hard filters use strict AND logic. Consider loosening the most restrictive conditions below.
              </p>

              {topRestrictive.length > 0 && (
                <div className="bg-[#F8E8D0]/60 p-4 rounded-2xl max-w-lg mx-auto text-left text-xs">
                  <div className="font-semibold text-[#4A3024] mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#BF7149]" />
                    Most Restrictive Filter Blockers:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#80503A]">
                    {topRestrictive.map(([reason, count]) => (
                      <li key={reason}>
                        <span className="font-medium text-[#4A3024]">{reason}</span> (blocked {count} vendors)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Near Matches Section */}
              {rankedNear.length > 0 && (
                <div className="pt-6 border-t border-[#E9DDCB] text-left">
                  <h4 className="font-serif text-lg font-bold text-[#4A3024] mb-3">
                    💡 Near Matches (Close Alternatives)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rankedNear.map((v) => (
                      <div
                        key={v.id}
                        className="bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-2xl p-4 text-xs"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-serif font-bold text-sm text-[#4A3024]">{v.name}</span>
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                            Near Match
                          </span>
                        </div>
                        <p className="text-[#80503A] mb-2">
                          {v.category} · {v.area} ({v.distanceKm?.toFixed(1)} km)
                        </p>
                        <div className="text-[11px] text-[#BF7149] font-medium bg-[#FFFDF8] p-2 rounded-lg border border-[#D7C4AF]/50">
                          Missed by: {v.nearMissReasons?.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {rankedExact.map((v, idx) => {
                const isCompared = comparisonIds.includes(v.id);

                return (
                  <div
                    key={v.id}
                    className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-5 shadow-xs hover:border-[#BF7149] hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E9DDCB]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#BF7149] text-[#FFFDF8] font-bold text-sm flex items-center justify-center font-serif shadow-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-xl font-bold text-[#4A3024]">{v.name}</h3>
                            <span className="text-[10px] uppercase font-bold text-[#BF7149] bg-[#BF7149]/10 px-2 py-0.5 rounded-full">
                              {v.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#80503A]">
                            {v.area} · {v.distanceKm?.toFixed(1)} km from {userArea} · {v.openStatusText}
                          </p>
                        </div>
                      </div>

                      {/* SmartMatch Score Badge */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#80503A]">SmartMatch Score</div>
                          <div className="font-serif text-2xl font-bold text-[#BF7149]">
                            {v.matchScore.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why This Vendor? Section */}
                    <div className="py-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3024] mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Why This Vendor?
                      </div>
                      <p className="text-xs text-[#80503A] font-medium pl-5">{v.whyThisVendor}</p>
                    </div>

                    {/* Compatibility Breakdown Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 bg-[#F8E8D0]/40 rounded-2xl px-3 border border-[#D7C4AF]/40 text-xs">
                      <div>
                        <div className="text-[10px] text-[#80503A]">Rating Match</div>
                        <div className="font-bold text-[#4A3024]">
                          {v.compatibilityBreakdown.ratingScore} ({v.avgRating}★)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#80503A]">Distance Convenience</div>
                        <div className="font-bold text-[#4A3024]">
                          {v.compatibilityBreakdown.distanceConvenience} ({v.distanceKm?.toFixed(1)} km)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#80503A]">Price Affordability</div>
                        <div className="font-bold text-[#4A3024]">
                          {v.compatibilityBreakdown.priceAffordability} (From ₹{v.startingPrice})
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#80503A]">Trust & Reviews</div>
                        <div className="font-bold text-[#4A3024]">
                          {v.compatibilityBreakdown.trustScore} ({v.reviewCount} reviews)
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-[#E9DDCB] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[#80503A]">
                        Supports: {v.supportsOnlinePay ? 'Online Pay · ' : ''}
                        {v.supportsCod ? 'COD · ' : ''}
                        {v.supportsPayAtPickup ? 'Pay at Pickup' : ''}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleCompare(v.id)}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 border transition-colors ${
                            isCompared
                              ? 'bg-[#BF7149] text-[#FFFDF8] border-[#BF7149]'
                              : 'bg-transparent border-[#D7C4AF] text-[#4A3024] hover:border-[#BF7149]'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                          {isCompared ? 'Compared' : 'Compare'}
                        </button>

                        {v.category === 'Salons' || v.category === 'Clinics' || v.category === 'Tutors' ? (
                          <button
                            onClick={() => onBookAppointment(v)}
                            className="px-4 py-1.5 bg-[#BF7149] text-[#FFFDF8] rounded-lg font-semibold hover:bg-[#80503A] transition-colors"
                          >
                            Book Appointment
                          </button>
                        ) : (
                          <button
                            onClick={() => onReserveProduct(v)}
                            className="px-4 py-1.5 bg-[#BF7149] text-[#FFFDF8] rounded-lg font-semibold hover:bg-[#80503A] transition-colors"
                          >
                            Reserve Item
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
