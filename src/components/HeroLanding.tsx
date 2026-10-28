import React from 'react';
import { Search, Sparkles, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Product } from '../types';

interface HeroLandingProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onExploreAll: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  products,
  onSelectProduct,
  onExploreAll,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden bg-[#F8E8D0] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Botanical Dried Branches & Ceramic Vases (matching reference visual composition) */}
      <div className="absolute left-0 bottom-0 pointer-events-none select-none hidden md:block z-0 opacity-90 transition-transform duration-700 hover:scale-105">
        <svg
          width="260"
          height="420"
          viewBox="0 0 260 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Ceramic Terracotta Vase */}
          <path
            d="M50 320 C50 280, 75 270, 75 240 L85 240 C85 270, 110 280, 110 320 C110 380, 50 380, 50 320 Z"
            fill="#BF7149"
          />
          <ellipse cx="80" cy="240" rx="10" ry="3" fill="#A85834" />
          <ellipse cx="80" cy="355" rx="30" ry="12" fill="#80503A" opacity="0.15" />
          {/* Dried Botanical Branch Left */}
          <path
            d="M80 240 Q65 140 30 50 M80 200 Q105 130 135 70 M60 170 Q30 130 20 100 M95 160 Q120 110 145 90 M45 110 Q25 80 15 60"
            stroke="#A36B4E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Botanical Dried Leaves / Seed Pods */}
          <ellipse cx="30" cy="48" rx="14" ry="7" transform="rotate(-30 30 48)" fill="#C28460" />
          <ellipse cx="135" cy="68" rx="13" ry="6" transform="rotate(25 135 68)" fill="#B5734E" />
          <ellipse cx="20" cy="98" rx="12" ry="6" transform="rotate(-40 20 98)" fill="#C28460" />
          <ellipse cx="145" cy="88" rx="12" ry="5" transform="rotate(20 145 88)" fill="#A8623E" />
          <ellipse cx="15" cy="58" rx="10" ry="5" transform="rotate(-45 15 58)" fill="#A8623E" />
          {/* Wooden / Sandstone Pedestal */}
          <rect x="25" y="370" width="110" height="28" rx="8" fill="#E4D3BF" />
        </svg>
      </div>

      <div className="absolute right-0 bottom-0 pointer-events-none select-none hidden md:block z-0 opacity-90 transition-transform duration-700 hover:scale-105">
        <svg
          width="260"
          height="420"
          viewBox="0 0 260 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Right Terracotta Ceramic Ribbed Vase */}
          <path
            d="M170 325 C170 285, 190 275, 190 245 L200 245 C200 275, 220 285, 220 325 C220 380, 170 380, 170 325 Z"
            fill="#D48660"
          />
          <ellipse cx="195" cy="245" rx="8" ry="3" fill="#B56E49" />
          {/* Dried Botanical Sprig Right */}
          <path
            d="M195 245 Q195 150 215 50 M195 190 Q170 130 150 80 M205 160 Q230 115 245 85 M180 130 Q160 90 145 70"
            stroke="#A36B4E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="215" cy="48" r="9" fill="#B56E49" />
          <circle cx="150" cy="78" r="8" fill="#C28460" />
          <circle cx="245" cy="83" r="8" fill="#A8623E" />
          <circle cx="145" cy="68" r="7" fill="#C28460" />
          {/* Wooden Pedestals */}
          <rect x="155" y="370" width="80" height="30" rx="10" fill="#E4D3BF" />
        </svg>
      </div>

      {/* Main Centered Framed Outline (matching reference image) */}
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <div className="rounded-[36px] border border-[#D7C4AF] bg-[#FFFDF8]/70 backdrop-blur-sm p-8 sm:p-14 text-center shadow-[0_12px_40px_rgba(74,48,36,0.06)] relative overflow-hidden">
          {/* Soft peach abstract background blob inside frame */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E9C5A4]/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#D8E1D3]/35 blur-3xl pointer-events-none" />

          {/* Minimal Icon / Accent */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-[#E9DDCB]/50 border border-[#D7C4AF]/60 text-[11px] font-semibold text-[#80503A] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#BF7149]" />
            Intelligent Local Discovery Platform
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#4A3024] tracking-tight mb-4 leading-tight">
            Discover Local. Shop Smarter.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#80503A] max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Find trusted local businesses, compare better options, and connect with confidence.
          </p>

          {/* White Pill-Shaped Search Bar with Terracotta Button (exact reference match) */}
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto flex items-center bg-[#FFFDF8] border border-[#D7C4AF] rounded-full p-1.5 shadow-[0_8px_25px_rgba(74,48,36,0.08)] hover:border-[#BF7149]/60 transition-all focus-within:ring-2 focus-within:ring-[#BF7149]/30"
          >
            <div className="pl-4 text-[#80503A]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, services, or local businesses..."
              className="w-full px-3 py-2.5 bg-transparent text-[#4A3024] placeholder-[#80503A]/60 text-sm focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="bg-[#BF7149] hover:bg-[#80503A] text-[#FFFDF8] font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              Explore Nearby
            </button>
          </form>

          {/* Feature Highlights beneath search */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#80503A] font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#BF7149]" />
              Verified Local Vendors
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#BF7149]" />
              Real-time Opening Hours
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#BF7149]" />
              Haversine Distance Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Floating Horizontal Product Showcase (overlapping lower part of frame, exact reference match) */}
      <div className="relative z-20 max-w-5xl mx-auto w-full mt-6 md:-mt-8">
        <div className="flex items-center justify-between mb-3 px-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3024]">
              Discover Your Next Favorite
            </h2>
            <p className="text-xs text-[#80503A]">Curated artisan items & top local products ready for reservation</p>
          </div>
          <button
            onClick={onExploreAll}
            className="text-xs font-semibold text-[#BF7149] hover:text-[#80503A] flex items-center gap-1 group"
          >
            View All Catalog
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Scrollable Horizontal Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-2.5 shadow-[0_6px_18px_rgba(74,48,36,0.06)] hover:border-[#BF7149] hover:shadow-[0_8px_24px_rgba(191,113,73,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              {/* Product Thumbnail */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#F8E8D0]/60 mb-2.5 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-1.5 right-1.5 bg-[#FFFDF8]/90 backdrop-blur-xs text-[9px] font-bold text-[#BF7149] px-1.5 py-0.5 rounded-md">
                  {product.category}
                </span>
              </div>

              {/* Product Details */}
              <div className="text-left">
                <h3 className="font-serif text-xs font-bold text-[#4A3024] line-clamp-1 group-hover:text-[#BF7149] transition-colors">
                  {product.name}
                </h3>
                <p className="text-[10px] text-[#80503A] line-clamp-1 mb-1">
                  {product.businessName}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-[#E9DDCB]">
                  <span className="text-xs font-bold text-[#BF7149]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-[#80503A]">
                    {product.stock - product.reservedStock > 0 ? 'In Stock' : 'Pre-order'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
