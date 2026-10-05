import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Info,
  Loader2,
  Printer,
  ShieldCheck,
  User,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { HotelService, Room } from '../types/index.ts';
import { GazelleLogo } from './GazelleLogo.tsx';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoom?: Room | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedRoom,
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  initialChildren = 0,
}) => {
  const { language, t } = useLanguage();

  // Wizard Steps: 1: Dates, 2: Room Selection, 3: Services, 4: Guest & Payment, 5: Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(preselectedRoom ? 3 : 1);

  // Search parameters
  const today = new Date();
  const defIn = new Date(today);
  defIn.setDate(today.getDate() + 2);
  const defOut = new Date(today);
  defOut.setDate(today.getDate() + 5);

  const [checkIn, setCheckIn] = useState(initialCheckIn || defIn.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(initialCheckOut || defOut.toISOString().split('T')[0]);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  // Available rooms from API
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(preselectedRoom || null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Available Services from API
  const [allServices, setAllServices] = useState<HotelService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});

  // Guest Details
  const [guest, setGuest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Algérie',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [arrivalTime, setArrivalTime] = useState('14:00');
  const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'cib' | 'edahabia' | 'card'>('arrival');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Fetch Services on load
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setAllServices(data.services);
      })
      .catch((err) => console.error('Failed to load services:', err));
  }, []);

  // Update selected room when preselectedRoom changes
  useEffect(() => {
    if (preselectedRoom) {
      setSelectedRoom(preselectedRoom);
      setStep(3);
    }
  }, [preselectedRoom]);

  // Query Availability API
  const fetchAvailability = async () => {
    setLoadingRooms(true);
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams({
        checkIn,
        checkOut,
        adults: String(adults),
        children: String(children),
      });
      const res = await fetch(`/api/availability?${queryParams.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche des disponibilités.');
      }
      setAvailableRooms(data.rooms || []);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingRooms(false);
    }
  };

  const calculateNights = () => {
    const inD = new Date(checkIn);
    const outD = new Date(checkOut);
    if (isNaN(inD.getTime()) || isNaN(outD.getTime())) return 1;
    return Math.max(1, Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  // Price calculations (Client preview only, server calculates authoritatively)
  const roomPricePerNight = selectedRoom?.price_per_night_dzd || selectedRoom?.base_price_dzd || 0;
  const roomSubtotal = roomPricePerNight * nights;

  const servicesSubtotal = Object.entries(selectedServices).reduce((sum, [sId, qty]) => {
    const service = allServices.find((s) => s.id === sId);
    return sum + (service ? service.price_dzd * qty : 0);
  }, 0);

  const taxesTotal = Math.round(roomSubtotal * 0.09 + (nights * 500));
  const estimatedGrandTotal = roomSubtotal + servicesSubtotal + taxesTotal;

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const copy = { ...prev };
      if (copy[serviceId]) {
        delete copy[serviceId];
      } else {
        copy[serviceId] = 1;
      }
      return copy;
    });
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const servicesPayload = Object.entries(selectedServices).map(([serviceId, quantity]) => ({
        serviceId,
        quantity,
      }));

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          adults: Number(adults),
          children: Number(children),
          guest,
          services: servicesPayload,
          paymentMethod,
          specialRequests,
          arrivalTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la confirmation de la réservation.');
      }

      setConfirmedBooking(data);
      setStep(5);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#241C16] border sm:border-[#D4A359]/35 border-t border-[#D4A359]/40 rounded-t-2xl sm:rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(212,163,89,0.15)] overflow-hidden flex flex-col h-[95vh] sm:h-auto sm:max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#D4A359]/25 flex items-center justify-between bg-[#18120E] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <GazelleLogo variant="horizontal" size="sm" theme="gold" />
            <span className="hidden xs:inline text-[11px] sm:text-xs text-[#E6BF7A] font-mono border-l rtl:border-r border-[#D4A359]/30 pl-2.5 rtl:pr-2.5 truncate">
              Moteur Officiel
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[#2E241C] text-[#DDD3C5] hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        {step < 5 && (
          <div className="bg-[#1C1611] border-b border-[#D4A359]/20 shrink-0">
            {/* Mobile compact progress bar */}
            <div className="sm:hidden px-4 py-2.5">
              <div className="flex items-center justify-between text-xs text-[#E6BF7A] font-medium mb-1.5">
                <span>Étape {step} sur 4</span>
                <span className="font-semibold text-[#FAF6F0]">
                  {step === 1 ? t('bookingStep1') : step === 2 ? t('bookingStep2') : step === 3 ? t('bookingStep3') : t('bookingStep4')}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`rounded-full transition-all ${
                      s <= step
                        ? 'bg-gradient-to-r from-[#D4A359] to-[#E6BF7A]'
                        : 'bg-[#2E241C]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop / Tablet step indicators */}
            <div className="hidden sm:flex px-6 py-3 items-center justify-between text-xs font-medium text-[#A89E90]">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-gradient-to-r from-[#D4A359] to-[#C58F3B] text-[#171310]' : 'bg-[#2E241C] text-[#A89E90]'}`}>1</span>
                <span className={step === 1 ? 'text-[#FAF6F0] font-semibold' : ''}>{t('bookingStep1')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 rtl:rotate-180" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-[#D4A359] text-[#171310]' : 'bg-[#2E241C] text-[#A89E90]'}`}>2</span>
                <span className={step === 2 ? 'text-[#FAF6F0] font-semibold' : ''}>{t('bookingStep2')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 rtl:rotate-180" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-[#D4A359] text-[#171310]' : 'bg-[#2E241C] text-[#A89E90]'}`}>3</span>
                <span className={step === 3 ? 'text-[#FAF6F0] font-semibold' : ''}>{t('bookingStep3')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 rtl:rotate-180" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 4 ? 'bg-[#D4A359] text-[#171310]' : 'bg-[#2E241C] text-[#A89E90]'}`}>4</span>
                <span className={step === 4 ? 'text-[#FAF6F0] font-semibold' : ''}>{t('bookingStep4')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-[#FBF9F5]">
          
          {errorMsg && (
            <div className="mb-6 p-4 rounded bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5">
              <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Dates & Guests */}
          {step === 1 && (
            <div className="max-w-xl mx-auto py-4">
              <h2 className="font-serif text-2xl font-bold text-[#FBF9F5] mb-2 text-center">
                {t('bookingStep1')}
              </h2>
              <p className="text-sm text-[#D8D2C6] mb-8 text-center font-light">
                Sélectionnez vos dates d'arrivée et de départ pour consulter les disponibilités en temps réel.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                      {t('widgetCheckIn')}
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                      {t('widgetCheckOut')}
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                      {t('widgetAdults')}
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                    >
                      <option value="1">1 {t('roomAdults')}</option>
                      <option value="2">2 {t('roomAdults')}</option>
                      <option value="3">3 {t('roomAdults')}</option>
                      <option value="4">4 {t('roomAdults')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                      {t('widgetChildren')}
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                    >
                      <option value="0">0 {t('roomChildren')}</option>
                      <option value="1">1 {t('roomChildren')}</option>
                      <option value="2">2 {t('roomChildren')}</option>
                      <option value="3">3 {t('roomChildren')}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loadingRooms}
                  onClick={fetchAvailability}
                  className="w-full mt-6 bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold py-3.5 min-h-[48px] rounded-xl text-sm tracking-wide shadow-[0_4px_16px_rgba(212,163,89,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {loadingRooms ? <Loader2 className="w-5 h-5 animate-spin text-[#171310]" /> : <Calendar className="w-4 h-4 text-[#171310]" />}
                  <span>{t('widgetSearch')}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Accommodation */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#E6BF7A] flex items-center gap-1 hover:underline cursor-pointer min-h-[36px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>Modifier les dates ({nights} {t('nightsCount')}, {adults} {t('roomAdults')})</span>
                </button>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF6F0] mb-2">
                {t('bookingAvailableRooms')}
              </h2>
              <p className="text-xs text-[#E6BF7A] mb-6 font-mono">
                {checkIn} → {checkOut} · {nights} {t('nightsCount')}
              </p>

              {availableRooms.length === 0 ? (
                <div className="p-8 text-center border border-[#D4A359]/25 rounded-xl bg-[#18120E]">
                  <p className="text-sm text-[#DDD3C5] mb-4">{t('noRoomsAvailable')}</p>
                  <button
                    onClick={() => setStep(1)}
                    className="bg-[#D4A359] text-[#171310] font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Changer de dates
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableRooms.map((r) => {
                    const isSelected = selectedRoom?.id === r.id;
                    const name = language === 'ar' ? r.name_ar : language === 'en' ? r.name_en : r.name_fr;
                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-[#D4A359] bg-[#D4A359]/15'
                            : 'border-[#D4A359]/25 bg-[#18120E] hover:border-[#D4A359]/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-serif font-bold text-base sm:text-lg text-[#FAF6F0]">{name}</span>
                            <span className="text-[11px] text-[#E6BF7A] font-mono border border-[#D4A359]/35 px-2 py-0.5 rounded">
                              {r.available_units} disponible{(r.available_units ?? 1) > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-[#DDD3C5] line-clamp-2 mb-2 font-light">
                            {language === 'ar' ? r.description_ar : language === 'en' ? r.description_en : r.description_fr}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#A89E90]">
                            <span>{r.surface_sqm} m²</span>
                            <span>·</span>
                            <span>{r.bed_config}</span>
                            <span>·</span>
                            <span>Max {r.max_adults} {t('roomAdults')}</span>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D4A359]/15 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                          <div>
                            <span className="block text-[10px] text-[#A89E90] uppercase">{t('perNight')}</span>
                            <span className="font-mono text-lg sm:text-xl font-bold text-[#E6BF7A] tabular-nums">
                              {Number(r.price_per_night_dzd || r.base_price_dzd).toLocaleString()} DZD
                            </span>
                            <span className="hidden sm:block text-xs text-[#A89E90] mt-0.5">
                              Total {nights} nuits : {Number((r.price_per_night_dzd || r.base_price_dzd) * nights).toLocaleString()} DZD
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoom(r);
                              setStep(3);
                            }}
                            className="sm:mt-3 bg-gradient-to-r from-[#D4A359] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm shadow transition-all cursor-pointer active:scale-95"
                          >
                            Sélectionner
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Customize Stay with Add-on Services */}
          {step === 3 && selectedRoom && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#E6BF7A] flex items-center gap-1 hover:underline cursor-pointer min-h-[36px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>Changer d'hébergement ({selectedRoom.name_fr})</span>
                </button>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF6F0] mb-1">
                {t('customizeStayTitle')}
              </h2>
              <p className="text-xs text-[#DDD3C5] mb-6 font-light">
                {t('customizeStaySubtitle')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
                {allServices.map((service) => {
                  const isChecked = Boolean(selectedServices[service.id]);
                  const sName = language === 'ar' ? service.name_ar : language === 'en' ? service.name_en : service.name_fr;
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 active:scale-[0.99] ${
                        isChecked
                          ? 'border-[#D4A359] bg-[#D4A359]/15'
                          : 'border-[#D4A359]/25 bg-[#18120E] hover:border-[#D4A359]/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-[#D4A359] border-[#D4A359] text-[#171310]' : 'border-[#D4A359]/40'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#FAF6F0]">{sName}</span>
                          <span className="font-mono text-xs font-bold text-[#E6BF7A] tabular-nums whitespace-nowrap">
                            +{Number(service.price_dzd).toLocaleString()} DZD
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A89E90] line-clamp-2 mt-1 font-light">
                          {language === 'ar' ? service.description_ar : language === 'en' ? service.description_en : service.description_fr}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl border border-[#D4A359]/35 bg-[#18120E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#A89E90] block">Total estimé avec options</span>
                  <span className="font-mono text-lg sm:text-xl font-bold text-[#E6BF7A] tabular-nums">
                    {estimatedGrandTotal.toLocaleString()} DZD
                  </span>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold px-6 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm tracking-wide shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Continuer vers les coordonnées</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Guest Details & Payment Method */}
          {step === 4 && selectedRoom && (
            <form onSubmit={handleCreateReservation}>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-[#E6BF7A] flex items-center gap-1 hover:underline cursor-pointer min-h-[36px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>Modifier les services optionnels</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Guest Form & Payment */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Guest Information */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#FAF6F0] mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#D4A359]" />
                      <span>{t('guestDetailsTitle')}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('firstName')} *</label>
                        <input
                          type="text"
                          required
                          value={guest.firstName}
                          onChange={(e) => setGuest({ ...guest, firstName: e.target.value })}
                          className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('lastName')} *</label>
                        <input
                          type="text"
                          required
                          value={guest.lastName}
                          onChange={(e) => setGuest({ ...guest, lastName: e.target.value })}
                          className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('email')} *</label>
                        <input
                          type="email"
                          required
                          value={guest.email}
                          onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                          className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('phone')} *</label>
                        <input
                          type="tel"
                          required
                          value={guest.phone}
                          onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                          placeholder="+213 550 00 00 00"
                          className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                      <div>
                        <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('country')}</label>
                        <input
                          type="text"
                          value={guest.country}
                          onChange={(e) => setGuest({ ...guest, country: e.target.value })}
                          className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('arrivalTime')}</label>
                        <select
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
                        >
                          <option value="12:00 - 14:00">12:00 - 14:00</option>
                          <option value="14:00 - 16:00">14:00 - 16:00 (Check-in standard)</option>
                          <option value="16:00 - 18:00">16:00 - 18:00</option>
                          <option value="18:00 - 21:00">18:00 - 21:00 (Arrivée en soirée)</option>
                          <option value="Tardive après 21h">Arrivée tardive après 21h</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3.5">
                      <label className="block text-xs text-[#E6BF7A] mb-1 font-medium">{t('specialRequests')}</label>
                      <textarea
                        rows={2}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Précisions de literie, régime sans gluten, lit bébé..."
                        className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2 text-base sm:text-xs text-[#FAF6F0]"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#FAF6F0] mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#D4A359]" />
                      <span>{t('paymentMethodTitle')}</span>
                    </h3>

                    <div className="space-y-2.5">
                      <label className={`block p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${
                        paymentMethod === 'arrival' ? 'border-[#D4A359] bg-[#D4A359]/15' : 'border-[#D4A359]/25 bg-[#18120E]'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'arrival'}
                            onChange={() => setPaymentMethod('arrival')}
                            className="text-[#D4A359] accent-[#D4A359] w-4 h-4"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[#FAF6F0] block">
                              {t('paymentPayOnArrival')}
                            </span>
                            <span className="text-xs text-[#A89E90] block">
                              {t('paymentPayOnArrivalDesc')}
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`block p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${
                        paymentMethod === 'cib' ? 'border-[#D4A359] bg-[#D4A359]/15' : 'border-[#D4A359]/25 bg-[#18120E]'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'cib'}
                            onChange={() => setPaymentMethod('cib')}
                            className="text-[#D4A359] accent-[#D4A359] w-4 h-4"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[#FAF6F0] block">
                              {t('paymentCibEdahabia')}
                            </span>
                            <span className="text-xs text-[#A89E90] block">
                              {t('paymentCibEdahabiaDesc')}
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`block p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${
                        paymentMethod === 'card' ? 'border-[#D4A359] bg-[#D4A359]/15' : 'border-[#D4A359]/25 bg-[#18120E]'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="text-[#D4A359] accent-[#D4A359] w-4 h-4"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[#FAF6F0] block">
                              {t('paymentIntCard')}
                            </span>
                            <span className="text-xs text-[#A89E90] block">
                              {t('paymentIntCardDesc')}
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Financial Summary */}
                <div className="bg-[#18120E] p-4 sm:p-5 rounded-xl border border-[#D4A359]/30 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#FAF6F0] border-b border-[#D4A359]/20 pb-2.5 mb-4">
                      {t('bookingSummary')}
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[#A89E90] block">Hébergement :</span>
                        <span className="font-semibold text-[#FAF6F0]">{selectedRoom.name_fr}</span>
                      </div>
                      <div className="flex justify-between text-[#DDD3C5]">
                        <span>Dates :</span>
                        <span className="font-mono">{checkIn} → {checkOut}</span>
                      </div>
                      <div className="flex justify-between text-[#DDD3C5]">
                        <span>Durée :</span>
                        <span>{nights} {t('nightsCount')}</span>
                      </div>
                      <div className="flex justify-between text-[#DDD3C5]">
                        <span>Voyageurs :</span>
                        <span>{adults} {t('roomAdults')}, {children} {t('roomChildren')}</span>
                      </div>

                      <div className="pt-3 border-t border-[#D4A359]/15 space-y-1.5">
                        <div className="flex justify-between text-[#DDD3C5]">
                          <span>{t('roomSubtotal')} :</span>
                          <span className="font-mono tabular-nums">{roomSubtotal.toLocaleString()} DZD</span>
                        </div>
                        {servicesSubtotal > 0 && (
                          <div className="flex justify-between text-[#DDD3C5]">
                            <span>{t('servicesSubtotal')} :</span>
                            <span className="font-mono tabular-nums">+{servicesSubtotal.toLocaleString()} DZD</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[#DDD3C5]">
                          <span>{t('taxesFees')} :</span>
                          <span className="font-mono tabular-nums">+{taxesTotal.toLocaleString()} DZD</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#D4A359]/30 flex justify-between items-baseline">
                        <span className="font-serif font-bold text-sm text-[#FAF6F0]">{t('totalAmount')}</span>
                        <span className="font-mono text-lg font-bold text-[#E6BF7A] tabular-nums">
                          {estimatedGrandTotal.toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-6 bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold py-3.5 min-h-[48px] rounded-xl text-sm tracking-wide shadow-[0_4px_16px_rgba(212,163,89,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#171310]" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#171310]" />
                    )}
                    <span>{t('btnConfirmBooking')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 5: Official Booking Confirmation */}
          {step === 5 && confirmedBooking && (
            <div className="max-w-2xl mx-auto py-4 sm:py-6 text-center">
              <div className="mb-4 inline-flex flex-col items-center">
                <GazelleLogo variant="full" size="md" theme="gold" />
              </div>

              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0] mb-2">
                {t('bookingSuccessTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#DDD3C5] mb-6 sm:mb-8 font-light">
                {t('bookingSuccessSubtitle')}
              </p>

              {/* Official Unique Booking Reference Box */}
              <div className="p-4 sm:p-6 rounded-xl border border-[#D4A359] bg-[#18120E] mb-6 sm:mb-8 text-left shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4A359]/20 pb-3 mb-4 gap-1">
                  <span className="text-xs text-[#E6BF7A] font-semibold uppercase tracking-wider font-mono">
                    {t('bookingRefLabel')}
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#E6BF7A] tracking-wider">
                    {confirmedBooking.bookingNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-[#DDD3C5]">
                  <div>
                    <span className="text-[#A89E90] block">Client Principal :</span>
                    <span className="font-semibold text-[#FAF6F0]">{confirmedBooking.guest?.firstName} {confirmedBooking.guest?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[#A89E90] block">Hébergement :</span>
                    <span className="font-semibold text-[#FAF6F0]">{confirmedBooking.roomName}</span>
                  </div>
                  <div>
                    <span className="text-[#A89E90] block">Séjour :</span>
                    <span className="font-mono">{confirmedBooking.checkIn} au {confirmedBooking.checkOut} ({confirmedBooking.nights} nuits)</span>
                  </div>
                  <div>
                    <span className="text-[#A89E90] block">Montant Garanti :</span>
                    <span className="font-mono font-bold text-[#E6BF7A] text-sm tabular-nums">
                      {Number(confirmedBooking.grandTotalDzd).toLocaleString()} DZD
                    </span>
                  </div>
                </div>

                {confirmedBooking.payment && (
                  <div className="mt-4 pt-3 border-t border-[#D4A359]/15 text-xs text-[#A89E90]">
                    <span className="block font-semibold text-[#E6BF7A]">Modalité de Règlement :</span>
                    <span>{confirmedBooking.payment.message}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#D4A359] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-6 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm tracking-wide shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4 text-[#171310]" />
                  <span>{t('printVoucher')}</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto border border-[#D4A359]/40 text-[#FAF6F0] hover:bg-[#D4A359]/15 font-medium px-6 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm tracking-wide transition-colors cursor-pointer active:scale-95"
                >
                  {t('backToHome')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
