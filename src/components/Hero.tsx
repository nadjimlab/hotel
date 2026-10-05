import { Compass, Sparkles } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { BookingWidget } from './BookingWidget.tsx';

import { ResortBackground } from './ResortBackground.tsx';

interface HeroProps {
  onOpenBooking: () => void;
  onExplore: () => void;
  onSearch: (params: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExplore, onSearch }) => {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#18120E] text-[#FAF6F0]">
      {/* Aerial Dusk Resort Oasis Background (images.jfif) */}
      <ResortBackground intensity="vibrant" showOverlay={true} />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 md:pt-20 pb-8 sm:pb-12 text-center flex-1 flex flex-col justify-center">
        
        <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 animate-fadeIn">
          <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4A359]" />
          <span className="text-[10px] sm:text-xs text-[#E6BF7A] font-semibold tracking-[0.25em] uppercase font-mono">
            El Oued · Sahara Algérien
          </span>
          <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4A359]" />
        </div>

        {/* Marquee Display Headline */}
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF6F0] max-w-4xl mx-auto leading-[1.18] text-balance mb-4 sm:mb-6 drop-shadow-sm">
          {t('heroTitle')}
        </h1>

        {/* Refined Prose Subtitle */}
        <p className="text-xs sm:text-base md:text-lg text-[#E3D8CB] max-w-2xl mx-auto leading-relaxed font-light mb-6 sm:mb-10 text-balance">
          {t('heroSubtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-14 w-full max-w-md sm:max-w-none mx-auto">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-6 sm:px-8 py-3.5 min-h-[48px] rounded-xl text-sm sm:text-base tracking-wide shadow-[0_4px_20px_rgba(212,163,89,0.35)] hover:shadow-[0_6px_25px_rgba(212,163,89,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span>{t('btnBook')}</span>
          </button>
          <button
            onClick={onExplore}
            className="w-full sm:w-auto border border-[#D4A359]/40 hover:border-[#D4A359] hover:bg-[#D4A359]/15 text-[#FAF6F0] font-semibold px-6 py-3.5 min-h-[48px] rounded-xl text-sm sm:text-base tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 bg-[#241C16]/60 backdrop-blur-sm active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#D4A359]" />
            <span>{t('btnDiscover')}</span>
          </button>
        </div>
      </div>

      {/* Embedded Booking Search Widget */}
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 pb-10">
        <BookingWidget onSearch={onSearch} />
      </div>
    </div>
  );
};
