import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Room } from '../types/index.ts';
import { RoomCard } from './RoomCard.tsx';

interface RoomsSectionProps {
  onSelectRoom: (room: Room) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ onSelectRoom }) => {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms) setRooms(data.rooms);
      })
      .catch((err) => console.error('Error loading rooms:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRooms = activeFilter === 'all'
    ? rooms
    : rooms.filter((r) => r.type_code === activeFilter);

  return (
    <section id="rooms" className="py-20 bg-[#18120E] text-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs text-[#E6BF7A] font-semibold uppercase tracking-widest block mb-2 font-mono">
            Architecture des Mille Coupoles
          </span>
          <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF6F0] mb-3 sm:mb-4 text-balance">
            {t('roomsTitle')}
          </h2>
          <p className="text-xs sm:text-base text-[#E3D8CB] leading-relaxed font-light text-balance px-2">
            {t('roomsSubtitle')}
          </p>

          {/* Interactive Category Filter Controls (Mobile horizontal swipe, desktop centered wrap) */}
          <div className="flex items-center sm:justify-center gap-2 mt-6 overflow-x-auto pb-2 px-1 -mx-1 scrollbar-none sm:flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold shadow-[0_2px_12px_rgba(212,163,89,0.3)]'
                  : 'bg-[#241C16] text-[#DDD3C5] hover:text-[#FAF6F0] border border-[#D4A359]/25 hover:border-[#D4A359]/50'
              }`}
            >
              Tous les hébergements
            </button>
            <button
              onClick={() => setActiveFilter('hotel_room')}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                activeFilter === 'hotel_room'
                  ? 'bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold shadow-[0_2px_12px_rgba(212,163,89,0.3)]'
                  : 'bg-[#241C16] text-[#DDD3C5] hover:text-[#FAF6F0] border border-[#D4A359]/25 hover:border-[#D4A359]/50'
              }`}
            >
              Chambres d'Hôtel
            </button>
            <button
              onClick={() => setActiveFilter('bungalow')}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                activeFilter === 'bungalow'
                  ? 'bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold shadow-[0_2px_12px_rgba(212,163,89,0.3)]'
                  : 'bg-[#241C16] text-[#DDD3C5] hover:text-[#FAF6F0] border border-[#D4A359]/25 hover:border-[#D4A359]/50'
              }`}
            >
              Bungalows Sahariens
            </button>
            <button
              onClick={() => setActiveFilter('khaima')}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                activeFilter === 'khaima'
                  ? 'bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold shadow-[0_2px_12px_rgba(212,163,89,0.3)]'
                  : 'bg-[#241C16] text-[#DDD3C5] hover:text-[#FAF6F0] border border-[#D4A359]/25 hover:border-[#D4A359]/50'
              }`}
            >
              Tentes Khaïma Royales
            </button>
            <button
              onClick={() => setActiveFilter('villa')}
              className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                activeFilter === 'villa'
                  ? 'bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold shadow-[0_2px_12px_rgba(212,163,89,0.3)]'
                  : 'bg-[#241C16] text-[#DDD3C5] hover:text-[#FAF6F0] border border-[#D4A359]/25 hover:border-[#D4A359]/50'
              }`}
            >
              Villas Royales
            </button>
          </div>
        </div>

        {/* Room Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4A359]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={onSelectRoom}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
