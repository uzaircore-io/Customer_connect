import React from 'react';
import { MapPin, SlidersHorizontal, Scale, Calendar, ShoppingBag, Store, BarChart3, Code2 } from 'lucide-react';
import { SRINAGAR_AREAS } from '../data/mockData';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userArea: string;
  setUserArea: (area: string) => void;
  compareCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userArea,
  setUserArea,
  compareCount,
}) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'multimatch', label: 'MultiMatch Pro', icon: SlidersHorizontal },
    { id: 'compare', label: `Compare (${compareCount})`, icon: Scale },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'studio', label: 'Business Studio', icon: Store },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'codebase', label: 'Python Codebase', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8E8D0]/90 backdrop-blur-md border-b border-[#D7C4AF]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo matching reference typography */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex flex-col items-start text-left group focus:outline-none"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-[#4A3024] group-hover:text-[#BF7149] transition-colors">
              CustomerConnect
            </span>
            <span className="text-[11px] font-medium tracking-widest uppercase text-[#80503A]/80">
              Discover · Compare · Reserve
            </span>
          </button>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 rounded-full ${
                    isActive
                      ? 'bg-[#BF7149] text-[#FFFDF8] shadow-sm'
                      : 'text-[#4A3024] hover:text-[#BF7149] hover:bg-[#E9DDCB]/50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Location Area Selector (Srinagar) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FFFDF8] border border-[#D7C4AF] rounded-full px-3 py-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#BF7149]" />
              <select
                value={userArea}
                onChange={(e) => setUserArea(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#4A3024] focus:outline-none cursor-pointer pr-1"
                aria-label="Select Srinagar Location Area"
              >
                {Object.keys(SRINAGAR_AREAS).map((area) => (
                  <option key={area} value={area} className="text-[#4A3024] bg-[#FFFDF8]">
                    {area}, Srinagar
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto gap-1 px-4 py-2 border-t border-[#D7C4AF]/40 bg-[#F8E8D0]/95 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded-full ${
              currentTab === item.id
                ? 'bg-[#BF7149] text-[#FFFDF8]'
                : 'text-[#4A3024] hover:bg-[#E9DDCB]/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
