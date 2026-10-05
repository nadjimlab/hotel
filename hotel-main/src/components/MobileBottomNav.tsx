import { Bed, Calendar, Home, Sparkles, User } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenBooking: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenBooking,
}) => {
  const { t } = useLanguage();

  const handleTabClick = (view: string) => {
    if (view === currentView && view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#18120E]/95 backdrop-blur-xl border-t border-[#D4A359]/30 shadow-[0_-8px_25px_rgba(0,0,0,0.65)] pb-safe transition-all select-none"
    >
      <div className="grid grid-cols-5 items-center h-15 px-1 max-w-md mx-auto">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-lg active:scale-95 cursor-pointer ${
            currentView === 'home'
              ? 'text-[#E6BF7A]'
              : 'text-[#9E9385] hover:text-[#FAF6F0]'
          }`}
          aria-label={t('navHome')}
        >
          <Home className={`w-5 h-5 transition-transform ${currentView === 'home' ? 'scale-110 text-[#E6BF7A]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[56px]">
            {t('navHome')}
          </span>
          {currentView === 'home' && (
            <span className="w-1 h-1 rounded-full bg-[#D4A359] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Accommodations / Rooms */}
        <button
          onClick={() => handleTabClick('rooms')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-lg active:scale-95 cursor-pointer ${
            currentView === 'rooms'
              ? 'text-[#E6BF7A]'
              : 'text-[#9E9385] hover:text-[#FAF6F0]'
          }`}
          aria-label={t('navRooms')}
        >
          <Bed className={`w-5 h-5 transition-transform ${currentView === 'rooms' ? 'scale-110 text-[#E6BF7A]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[56px]">
            {t('navRooms')}
          </span>
          {currentView === 'rooms' && (
            <span className="w-1 h-1 rounded-full bg-[#D4A359] mt-0.5" />
          )}
        </button>

        {/* Tab 3: Center Primary Booking CTA Button */}
        <div className="flex items-center justify-center -mt-4">
          <button
            onClick={onOpenBooking}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#D4A359] via-[#E6BF7A] to-[#B88432] text-[#171310] flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(212,163,89,0.5)] border-2 border-[#FAF6F0]/40 active:scale-90 transition-transform cursor-pointer"
            aria-label={t('btnBook')}
          >
            <Calendar className="w-5 h-5 text-[#171310]" />
            <span className="text-[9px] font-extrabold uppercase tracking-tighter leading-none mt-0.5">
              {t('btnBook').split(' ')[0]}
            </span>
          </button>
        </div>

        {/* Tab 4: Spa Thermal */}
        <button
          onClick={() => handleTabClick('spa')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-lg active:scale-95 cursor-pointer ${
            currentView === 'spa'
              ? 'text-[#E6BF7A]'
              : 'text-[#9E9385] hover:text-[#FAF6F0]'
          }`}
          aria-label={t('navSpa')}
        >
          <Sparkles className={`w-5 h-5 transition-transform ${currentView === 'spa' ? 'scale-110 text-[#E6BF7A]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[56px]">
            {t('navSpa')}
          </span>
          {currentView === 'spa' && (
            <span className="w-1 h-1 rounded-full bg-[#D4A359] mt-0.5" />
          )}
        </button>

        {/* Tab 5: My Bookings */}
        <button
          onClick={() => handleTabClick('my-bookings')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-lg active:scale-95 cursor-pointer ${
            currentView === 'my-bookings'
              ? 'text-[#E6BF7A]'
              : 'text-[#9E9385] hover:text-[#FAF6F0]'
          }`}
          aria-label={t('navMyBookings')}
        >
          <User className={`w-5 h-5 transition-transform ${currentView === 'my-bookings' ? 'scale-110 text-[#E6BF7A]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[56px]">
            {t('navMyBookings')}
          </span>
          {currentView === 'my-bookings' && (
            <span className="w-1 h-1 rounded-full bg-[#D4A359] mt-0.5" />
          )}
        </button>

      </div>
    </nav>
  );
};
