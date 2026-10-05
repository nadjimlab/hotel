import { Calendar, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface BookingWidgetProps {
  onSearch: (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    roomSlug?: string;
  }) => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  isCompact?: boolean;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  onSearch,
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  initialChildren = 0,
  isCompact = false,
}) => {
  const { t } = useLanguage();

  // Initialize dates: Check-in tomorrow, Check-out in 4 days
  const today = new Date();
  const defIn = new Date(today);
  defIn.setDate(today.getDate() + 2);
  const defOut = new Date(today);
  defOut.setDate(today.getDate() + 5);

  const [checkIn, setCheckIn] = useState(
    initialCheckIn || defIn.toISOString().split('T')[0]
  );
  const [checkOut, setCheckOut] = useState(
    initialCheckOut || defOut.toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [roomSlug, setRoomSlug] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkIn,
      checkOut,
      adults: Number(adults),
      children: Number(children),
      roomSlug: roomSlug || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-[#241C16]/95 backdrop-blur-md border border-[#D4A359]/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(212,163,89,0.12)] p-4 sm:p-6 text-[#FAF6F0] ${
        isCompact ? 'max-w-4xl' : 'max-w-5xl'
      } mx-auto`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-end">
        {/* Check-In */}
        <div>
          <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4A359]" />
            {t('widgetCheckIn')}
          </label>
          <input
            type="date"
            value={checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359]/40 transition-colors"
          />
        </div>

        {/* Check-Out */}
        <div>
          <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4A359]" />
            {t('widgetCheckOut')}
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359]/40 transition-colors"
          />
        </div>

        {/* Adults & Children */}
        <div>
          <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#D4A359]" />
            {t('widgetAdults')} & {t('widgetChildren')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-2 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
            >
              <option value="1">1 {t('roomAdults')}</option>
              <option value="2">2 {t('roomAdults')}</option>
              <option value="3">3 {t('roomAdults')}</option>
              <option value="4">4 {t('roomAdults')}</option>
            </select>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-2 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
            >
              <option value="0">0 {t('roomChildren')}</option>
              <option value="1">1 {t('roomChildren')}</option>
              <option value="2">2 {t('roomChildren')}</option>
              <option value="3">3 {t('roomChildren')}</option>
            </select>
          </div>
        </div>

        {/* Accommodation Category */}
        <div>
          <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
            {t('widgetRoomType')}
          </label>
          <select
            value={roomSlug}
            onChange={(e) => setRoomSlug(e.target.value)}
            className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
          >
            <option value="">{t('widgetAllTypes')}</option>
            <option value="chambre-deluxe-double">Chambres Deluxe</option>
            <option value="bungalow-saharien-prestige">Bungalows Sahariens</option>
            <option value="tente-khaima-royale">Tentes Khaïma Royales</option>
            <option value="villa-royale-des-mille-coupoles">Villas Royales</option>
          </select>
        </div>

        {/* Search CTA Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold py-3 px-4 min-h-[44px] rounded-xl text-sm tracking-wide shadow-[0_4px_16px_rgba(212,163,89,0.3)] hover:shadow-[0_6px_20px_rgba(212,163,89,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
          >
            <Search className="w-4 h-4 text-[#171310]" />
            <span className="truncate">{t('widgetSearch')}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
