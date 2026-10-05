import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Loader2,
  Printer,
  Search,
  User,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Reservation } from '../types/index.ts';
import { GazelleLogo } from './GazelleLogo.tsx';

export const CustomerPortal: React.FC = () => {
  const { t, language } = useLanguage();

  const [bookingNumber, setBookingNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  // Cancellation State
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingNumber || !email) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/reservations/lookup?bookingNumber=${encodeURIComponent(bookingNumber.trim())}&email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Aucune réservation trouvée avec ces identifiants.');
      }
      setReservation(data.reservation);
    } catch (err: any) {
      setErrorMsg(err.message);
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!reservation) return;

    setCancelling(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/reservations/${reservation.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          reason: cancelReason || 'Annulation demandée par le client via le portail'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Impossible d\'annuler la réservation.');
      }
      setSuccessMsg(data.message || 'Votre réservation a bien été annulée.');
      setReservation({ ...reservation, status: 'cancelled' });
      setShowCancelConfirm(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('statusConfirmed')}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('statusPending')}</span>
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-500/30 text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>{t('statusCheckedIn')}</span>
          </span>
        );
      case 'checked_out':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('statusCheckedOut')}</span>
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/80 text-red-400 border border-red-500/30 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t('statusCancelled')}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-[#FAF6F0]">
      
      {/* Official Brand Logo & Title */}
      <div className="text-center mb-8 sm:mb-10 flex flex-col items-center">
        <div className="mb-4">
          <GazelleLogo variant="full" size="md" theme="gold" />
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#FAF6F0] mb-2 sm:mb-3">
          {t('myBookingsTitle')}
        </h1>
        <p className="text-xs sm:text-base text-[#DDD3C5] max-w-xl mx-auto font-light">
          {t('myBookingsSubtitle')}
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-[#241C16] border border-[#D4A359]/35 rounded-2xl p-4 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] mb-10">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider font-mono">
                {t('inputBookingNumber')} *
              </label>
              <input
                type="text"
                required
                placeholder="ex: LGD-2026-000101"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359]/40 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                {t('inputEmail')} *
              </label>
              <input
                type="email"
                required
                placeholder="votre-email@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359]/40"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-[#A89E90]">
              Astuce : Utilisez l'exemple de démo <code className="text-[#E6BF7A] font-mono">LGD-2026-000101</code> avec <code className="text-[#E6BF7A] font-mono">nadjim.guest@example.com</code>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-6 py-3 min-h-[44px] rounded-xl text-sm tracking-wide shadow-[0_2px_12px_rgba(212,163,89,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#171310]" /> : <Search className="w-4 h-4 text-[#171310]" />}
              <span>{t('btnFindBooking')}</span>
            </button>
          </div>
        </form>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5">
          <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reservation Voucher Card */}
      {reservation && (
        <div className="bg-[#241C16] border border-[#D4A359]/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Header Strip */}
          <div className="bg-[#18120E] px-6 py-4 border-b border-[#D4A359]/25 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#A89E90] block uppercase tracking-wider font-mono">
                {t('bookingRefLabel')}
              </span>
              <span className="font-mono text-2xl font-bold text-[#E6BF7A]">
                {reservation.bookingNumber}
              </span>
            </div>

            <div>{getStatusBadge(reservation.status)}</div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Guest & Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#D4A359]/20">
              <div>
                <h4 className="text-xs font-semibold text-[#E6BF7A] uppercase tracking-wider mb-2 font-mono">
                  Client & Séjour
                </h4>
                <div className="space-y-1 text-sm text-[#DDD3C5]">
                  <p className="font-semibold text-[#FAF6F0] text-base">
                    {reservation.guest.firstName} {reservation.guest.lastName}
                  </p>
                  <p>{reservation.guest.email}</p>
                  <p>{reservation.guest.phone}</p>
                  <p>{reservation.guest.country}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#E6BF7A] uppercase tracking-wider mb-2 font-mono">
                  Détails de l'Hébergement
                </h4>
                <div className="space-y-1 text-sm text-[#DDD3C5]">
                  <p className="font-serif font-bold text-[#FAF6F0] text-base">
                    {reservation.room?.name_fr || 'Hébergement La Gazelle d\'Or'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4A359]" />
                    <span>Du <strong>{reservation.checkIn}</strong> au <strong>{reservation.checkOut}</strong></span>
                  </p>
                  <p>
                    {reservation.adults} {t('roomAdults')}, {reservation.children} {t('roomChildren')}
                  </p>
                  {reservation.arrivalTime && (
                    <p className="text-xs text-[#A89E90]">
                      Arrivée estimée : {reservation.arrivalTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Add-on Services */}
            {reservation.services && reservation.services.length > 0 && (
              <div className="pb-6 border-b border-[#D4A359]/20">
                <h4 className="text-xs font-semibold text-[#E6BF7A] uppercase tracking-wider mb-3 font-mono">
                  Prestations & Expériences Sahariennes Incluses
                </h4>
                <div className="space-y-2">
                  {reservation.services.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#18120E] border border-[#D4A359]/15">
                      <span className="text-[#FAF6F0] font-medium">{s.name_fr} (x{s.quantity})</span>
                      <span className="font-mono text-[#E6BF7A] font-semibold tabular-nums">
                        {Number(s.totalDzd).toLocaleString()} DZD
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Breakdown */}
            <div className="bg-[#18120E] p-4 rounded-xl border border-[#D4A359]/25">
              <div className="space-y-2 text-xs text-[#DDD3C5]">
                <div className="flex justify-between">
                  <span>Hébergement :</span>
                  <span className="font-mono tabular-nums">{Number(reservation.roomTotalDzd).toLocaleString()} DZD</span>
                </div>
                {reservation.servicesTotalDzd > 0 && (
                  <div className="flex justify-between">
                    <span>Prestations complémentaires :</span>
                    <span className="font-mono tabular-nums">+{Number(reservation.servicesTotalDzd).toLocaleString()} DZD</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes de séjour & TVA :</span>
                  <span className="font-mono tabular-nums">+{Number(reservation.taxesDzd).toLocaleString()} DZD</span>
                </div>
                <div className="pt-2 border-t border-[#D4A359]/25 flex justify-between items-baseline font-bold text-sm text-[#FAF6F0]">
                  <span>Montant Total Garanti :</span>
                  <span className="font-mono text-lg text-[#E6BF7A] tabular-nums">
                    {Number(reservation.grandTotalDzd).toLocaleString()} DZD
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Confirmation Prompt */}
            {showCancelConfirm ? (
              <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-red-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>{t('cancelConfirmPrompt')}</span>
                </div>
                <input
                  type="text"
                  placeholder="Motif de l'annulation (facultatif)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[#18120E] border border-red-500/30 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {cancelling ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="border border-neutral-600 text-neutral-300 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Ne pas annuler
                  </button>
                </div>
              </div>
            ) : null}

            {/* Actions Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] text-[#171310] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_2px_10px_rgba(212,163,89,0.3)] transition-all cursor-pointer transform active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-[#171310]" />
                  <span>{t('printVoucher')}</span>
                </button>
              </div>

              {reservation.status !== 'cancelled' && !showCancelConfirm && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                >
                  {t('btnCancelBooking')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
