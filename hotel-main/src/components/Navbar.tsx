import { Calendar, Globe, Menu, Shield, Sparkles, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Language } from '../types/index.ts';

interface NavbarProps {
  onOpenBooking: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  currentView,
  setCurrentView,
}) => {
  const { language, setLanguage, t, direction } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', labelKey: 'resortName' as const, view: 'home' },
    { id: 'rooms', labelKey: 'navRooms' as const, view: 'rooms' },
    { id: 'dining', labelKey: 'navDining' as const, view: 'dining' },
    { id: 'spa', labelKey: 'navSpa' as const, view: 'spa' },
    { id: 'activities', labelKey: 'navActivities' as const, view: 'activities' },
    { id: 'location', labelKey: 'navLocation' as const, view: 'location' },
  ];

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const languages: Array<{ code: Language; label: string; flag: string }> = [
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#18120E]/95 backdrop-blur-md border-b border-[#D4A359]/25 text-[#FAF6F0] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Zone 1: Hotel Name Text */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left group cursor-pointer focus:outline-none min-w-0"
          aria-label={t('resortName')}
        >
          <span className="font-serif font-bold text-base sm:text-lg tracking-wider text-[#FAF6F0]">
            LA GAZELLE D'OR
          </span>
          <span className="block text-[9px] tracking-[0.2em] uppercase text-[#E6BF7A]">
            RESORT & SPA
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-medium tracking-wide">
          {navLinks.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.view)}
              className={`transition-colors py-1 cursor-pointer whitespace-nowrap ${
                currentView === item.view
                  ? 'text-[#E6BF7A] border-b-2 border-[#D4A359] font-semibold'
                  : 'text-[#DDD3C5] hover:text-[#FAF6F0]'
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('my-bookings')}
            className={`transition-colors py-1 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              currentView === 'my-bookings'
                ? 'text-[#E6BF7A] border-b-2 border-[#D4A359] font-semibold'
                : 'text-[#DDD3C5] hover:text-[#FAF6F0]'
            }`}
          >
            <User className="w-4 h-4 text-[#D4A359]" />
            <span>{t('navMyBookings')}</span>
          </button>
        </nav>

        {/* Zone 3: Actions (VIP Tour, Language, Admin Link, Booking CTA) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          


          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] rounded-lg border border-[#D4A359]/30 hover:border-[#D4A359] bg-[#241C16] text-xs font-medium text-[#FAF6F0] transition-colors cursor-pointer active:scale-95"
              title="Changer de langue / Change Language"
              aria-label="Sélectionner la langue"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4A359]" />
              <span className="uppercase font-semibold text-xs">{language}</span>
            </button>

            {langMenuOpen && (
              <div 
                className={`absolute ${direction === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-36 bg-[#241C16] border border-[#D4A359]/35 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn`}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-[#D4A359]/20 text-[#E6BF7A] font-bold'
                        : 'text-[#DDD3C5] hover:bg-[#2F241C] hover:text-white'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-base">{l.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Back-Office Portal Link */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`hidden md:flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 min-h-[40px] rounded-lg transition-all cursor-pointer ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-[#D4A359] to-[#C58F3B] text-[#171310] font-bold'
                : 'text-[#E6BF7A] hover:bg-[#D4A359]/15 border border-[#D4A359]/35 bg-[#241C16]'
            }`}
            title="Console PMS & Direction"
          >
            <Shield className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>{user ? user.role : t('navAdmin')}</span>
          </button>

          {/* Primary Booking CTA Button (Visible on tablet & desktop, thumb nav handles mobile) */}
          <button
            onClick={onOpenBooking}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl text-xs sm:text-sm tracking-wide shadow-[0_4px_16px_rgba(212,163,89,0.3)] hover:shadow-[0_6px_22px_rgba(212,163,89,0.45)] transition-all whitespace-nowrap cursor-pointer transform active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#171310]" />
            <span className="truncate">{t('btnBook')}</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#DDD3C5] hover:text-white hover:bg-[#241C16] border border-transparent hover:border-[#D4A359]/25 focus:outline-none active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#E6BF7A]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with smooth backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#241C16]/98 backdrop-blur-xl border-b border-[#D4A359]/25 px-4 pt-2 pb-6 space-y-1 shadow-2xl animate-fadeIn">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.view)}
              className={`flex items-center justify-between w-full text-left py-3 px-3 min-h-[48px] rounded-lg text-sm font-medium transition-all ${
                currentView === item.view
                  ? 'bg-[#D4A359]/15 text-[#E6BF7A] font-bold border-l-2 rtl:border-r-2 border-[#D4A359]'
                  : 'text-[#DDD3C5] hover:text-white hover:bg-[#2E241C]'
              }`}
            >
              <span>{t(item.labelKey)}</span>
              {currentView === item.view && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]" />
              )}
            </button>
          ))}

          <button
            onClick={() => handleNavClick('my-bookings')}
            className={`flex items-center justify-between w-full text-left py-3 px-3 min-h-[48px] rounded-lg text-sm font-medium transition-all ${
              currentView === 'my-bookings'
                ? 'bg-[#D4A359]/15 text-[#E6BF7A] font-bold border-l-2 rtl:border-r-2 border-[#D4A359]'
                : 'text-[#DDD3C5] hover:text-white hover:bg-[#2E241C]'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4A359]" />
              <span>{t('navMyBookings')}</span>
            </div>
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`flex items-center justify-between w-full text-left py-3 px-3 min-h-[48px] rounded-lg text-sm font-medium transition-all ${
              currentView === 'admin'
                ? 'bg-[#D4A359]/15 text-[#E6BF7A] font-bold border-l-2 rtl:border-r-2 border-[#D4A359]'
                : 'text-[#E6BF7A] hover:bg-[#2E241C]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4A359]" />
              <span>{t('navAdmin')}</span>
            </div>
          </button>



          {/* Quick Book CTA inside drawer */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('btnBook')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
