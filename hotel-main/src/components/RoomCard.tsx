import { Bed, Check, ChevronRight, Maximize2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Room } from '../types/index.ts';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  showCalculatedPrice?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, showCalculatedPrice = false }) => {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const name = language === 'ar' ? room.name_ar : language === 'en' ? room.name_en : room.name_fr;
  const description = language === 'ar' ? room.description_ar : language === 'en' ? room.description_en : room.description_fr;

  const displayPrice = showCalculatedPrice && room.price_per_night_dzd
    ? room.price_per_night_dzd
    : room.base_price_dzd;

  return (
    <div className="bg-[#241C16] border border-[#D4A359]/25 hover:border-[#D4A359]/60 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_35px_rgba(212,163,89,0.18)] transition-all duration-300 flex flex-col group">
      
      {/* Image Container with Fallback */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#2D231C]">
        {!imageError && room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#2D231C] to-[#18120E] text-center">
            <div className="w-12 h-12 rounded-full border border-[#D4A359]/50 flex items-center justify-center text-[#E6BF7A] mb-2 font-serif text-xl shadow-sm">
              G
            </div>
            <span className="text-xs text-[#FAF6F0] font-serif">{name}</span>
            <span className="text-[10px] text-[#D4A359] mt-1 uppercase tracking-wider">La Gazelle d'Or Resort</span>
          </div>
        )}

        {/* Surface Badge */}
        <div className="absolute top-3 left-3 bg-[#18120E]/85 backdrop-blur-sm border border-[#D4A359]/35 px-2.5 py-1 rounded-lg text-xs text-[#FAF6F0] flex items-center gap-1.5 font-mono shadow-sm">
          <Maximize2 className="w-3 h-3 text-[#D4A359]" />
          <span>{room.surface_sqm} {t('roomSqm')}</span>
        </div>

        {/* Capacity Badge */}
        <div className="absolute top-3 right-3 bg-[#18120E]/85 backdrop-blur-sm border border-[#D4A359]/35 px-2.5 py-1 rounded-lg text-xs text-[#FAF6F0] flex items-center gap-1.5 font-mono shadow-sm">
          <Users className="w-3 h-3 text-[#D4A359]" />
          <span>{room.max_adults} {t('roomAdults')}</span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Bedding info */}
          <div className="flex items-center gap-1.5 text-xs text-[#E6BF7A] font-medium mb-2">
            <Bed className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>{room.bed_config}</span>
          </div>

          {/* Room Title */}
          <h3 className="font-serif text-xl font-bold text-[#FAF6F0] mb-2.5 group-hover:text-[#E6BF7A] transition-colors">
            {name}
          </h3>

          {/* Room Description */}
          <p className="text-xs sm:text-sm text-[#DDD3C5] leading-relaxed line-clamp-3 mb-4 font-light">
            {description}
          </p>

          {/* Key Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {room.amenities.slice(0, 4).map((a) => (
                <span
                  key={a.code}
                  className="inline-flex items-center gap-1 text-[11px] text-[#CFC4B5] border border-[#D4A359]/20 px-2 py-0.5 rounded-md bg-[#18120E]/60"
                >
                  <Check className="w-3 h-3 text-[#D4A359]" />
                  <span>{language === 'ar' ? a.name_ar : language === 'en' ? a.name_en : a.name_fr}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-[#D4A359]/20 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mt-auto">
          <div>
            <span className="block text-[11px] text-[#A89E90] uppercase tracking-wider">
              {showCalculatedPrice ? t('perNight') : t('priceFrom')}
            </span>
            <div className="flex items-baseline gap-1 text-[#FAF6F0]">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#E6BF7A] tabular-nums">
                {Number(displayPrice).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#DDD3C5]">DZD</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(room)}
            className="w-full xs:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm tracking-wide shadow-[0_2px_12px_rgba(212,163,89,0.25)] transition-all cursor-pointer transform active:scale-95"
          >
            <span>{t('btnReserveRoom')}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
