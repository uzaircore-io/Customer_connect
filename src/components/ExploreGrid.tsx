import React, { useState } from 'react';
import { Star, MapPin, Clock, ShieldCheck, Phone, MessageSquare, ExternalLink, Scale, Calendar, ShoppingBag } from 'lucide-react';
import { Business, BusinessCategory } from '../types';

interface ExploreGridProps {
  businesses: Business[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userArea: string;
  comparisonIds: number[];
  onToggleCompare: (id: number) => void;
  onBookAppointment: (b: Business) => void;
  onReserveProduct: (b: Business) => void;
}

const CATEGORIES: ('All' | BusinessCategory)[] = [
  'All',
  'Watches',
  'Jewelry',
  'Electronics',
  'Clothing',
  'Salons',
  'Clinics',
  'Restaurants',
  'Home Services',
  'Tutors',
  'Repair Services',
];

export const ExploreGrid: React.FC<ExploreGridProps> = ({
  businesses,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  userArea,
  comparisonIds,
  onToggleCompare,
  onBookAppointment,
  onReserveProduct,
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price' | 'reviews'>('rating');

  const filtered = businesses.filter((b) => {
    if (selectedCategory !== 'All' && b.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchCat = b.category.toLowerCase().includes(q);
      const matchArea = b.area.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchArea) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return b.avgRating - a.avgRating;
    if (sortBy === 'distance') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    if (sortBy === 'price') return a.startingPrice - b.startingPrice;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Filter Pills (Functional interactive tab buttons) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl font-bold text-[#4A3024]">
            Universal Business Discovery
          </h2>
          <span className="text-xs text-[#80503A]">
            Showing {sorted.length} businesses relative to {userArea}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#BF7149] text-[#FFFDF8] shadow-xs'
                  : 'bg-[#FFFDF8] border border-[#D7C4AF] text-[#4A3024] hover:border-[#BF7149] hover:bg-[#E9DDCB]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-[#FFFDF8] p-3 rounded-2xl border border-[#D7C4AF]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, specialty, or keywords..."
          className="w-full sm:w-80 px-3 py-1.5 text-xs bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg text-[#4A3024] placeholder-[#80503A]/70 focus:outline-none focus:ring-1 focus:ring-[#BF7149]"
        />

        <div className="flex items-center gap-2 text-xs text-[#4A3024]">
          <span className="text-[#80503A] font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#4A3024] focus:outline-none cursor-pointer"
          >
            <option value="rating">Highest Rating ★</option>
            <option value="distance">Nearest Distance 📍</option>
            <option value="price">Lowest Starting Price ₹</option>
            <option value="reviews">Most Reviewed 💬</option>
          </select>
        </div>
      </div>

      {/* Businesses Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF8] rounded-3xl border border-[#D7C4AF] p-8">
          <p className="font-serif text-xl text-[#4A3024] mb-2">No businesses matched your search</p>
          <p className="text-xs text-[#80503A] mb-4">Try clearing filters or selecting another category.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#BF7149] text-[#FFFDF8] text-xs font-semibold rounded-full"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((b) => {
            const isCompared = comparisonIds.includes(b.id);
            const waUrl = `https://wa.me/${b.whatsapp}?text=Hello%20${encodeURIComponent(
              b.name
            )},%20I%20found%20your%20business%20on%20CustomerConnect.%20Can%20you%20share%20more%20details?`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`;

            return (
              <div
                key={b.id}
                className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#BF7149]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Image Banner */}
                  <div className="relative h-44 w-full bg-[#E9DDCB] overflow-hidden">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-[#FFFDF8]/90 backdrop-blur-xs text-[#4A3024] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#D7C4AF]/50">
                        {b.category}
                      </span>
                      {b.verified && (
                        <span className="bg-[#BF7149] text-[#FFFDF8] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-[#FFFDF8]/90 backdrop-blur-xs text-[#4A3024] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#BF7149] text-[#BF7149]" />
                      {b.avgRating.toFixed(1)}
                      <span className="text-[10px] text-[#80503A]">({b.reviewCount})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-serif text-lg font-bold text-[#4A3024] leading-snug">
                        {b.name}
                      </h3>
                      <span className="text-xs font-bold text-[#BF7149] whitespace-nowrap">
                        From ₹{b.startingPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-xs text-[#80503A] line-clamp-2 mb-3">
                      {b.description}
                    </p>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-[#80503A] mb-3 pb-3 border-b border-[#E9DDCB]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#BF7149]" />
                        {b.area} ({b.distanceKm?.toFixed(1)} km)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#BF7149]" />
                        <span className={b.isOpenNow ? 'text-emerald-700 font-medium' : 'text-[#80503A]'}>
                          {b.openStatusText}
                        </span>
                      </span>
                    </div>

                    {/* Contact Hub Quick Actions */}
                    <div className="flex items-center justify-between text-xs text-[#80503A] mb-3">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${b.phone}`}
                        className="flex items-center gap-1 hover:text-[#BF7149] font-medium"
                        title="Call Store"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#BF7149] font-medium"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleCompare(b.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-colors ${
                      isCompared
                        ? 'bg-[#BF7149] text-[#FFFDF8] border-[#BF7149]'
                        : 'bg-transparent border-[#D7C4AF] text-[#4A3024] hover:border-[#BF7149]'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    {isCompared ? 'Compared' : 'Compare'}
                  </button>

                  {b.category === 'Salons' || b.category === 'Clinics' || b.category === 'Tutors' ? (
                    <button
                      onClick={() => onBookAppointment(b)}
                      className="px-3 py-1.5 bg-[#80503A] hover:bg-[#4A3024] text-[#FFFDF8] rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Slot
                    </button>
                  ) : (
                    <button
                      onClick={() => onReserveProduct(b)}
                      className="px-3 py-1.5 bg-[#BF7149] hover:bg-[#80503A] text-[#FFFDF8] rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Reserve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
