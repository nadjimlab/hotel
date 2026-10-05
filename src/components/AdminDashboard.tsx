import {  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Filter,
  Layers,
  List,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AdminDashboardKPIs } from '../types/index.ts';
import { GazelleLogo } from './GazelleLogo.tsx';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, token, login, logout, isStaff } = useAuth();

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@hotel-lagazelledor.dz');
  const [passwordInput, setPasswordInput] = useState('Gazelle2026!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Data
  const [kpis, setKpis] = useState<AdminDashboardKPIs | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<'reservations' | 'calendar' | 'reports' | 'logo'>('reservations');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Logo State
  const [customLogoState, setCustomLogoState] = useState<string | null>(() => localStorage.getItem('lgd_custom_logo'));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      localStorage.setItem('lgd_custom_logo', base64);
      setCustomLogoState(base64);
      window.dispatchEvent(new Event('lgd_logo_updated'));
      alert('تم تحديث شعار الموقع بنجاح!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem('lgd_custom_logo');
    setCustomLogoState(null);
    window.dispatchEvent(new Event('lgd_logo_updated'));
    alert('تم استعادة الشعار الافتراضي!');
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Identifiants invalides');
      }
      login(data.token, data.user);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Fetch Dashboard KPIs and Reservations
  const refreshData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // KPIs
      const kpiRes = await fetch('/api/admin/dashboard', { headers });
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }

      // Reservations
      let resUrl = `/api/admin/reservations?status=${statusFilter}`;
      if (searchQuery) resUrl += `&search=${encodeURIComponent(searchQuery)}`;
      const rRes = await fetch(resUrl, { headers });
      if (rRes.ok) {
        const rData = await rRes.json();
        setReservations(rData.reservations || []);
      }

      // Audit Logs
      const logsRes = await fetch('/api/admin/audit-logs', { headers });
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setAuditLogs(lData.logs || []);
      }

      // Reports
      const repRes = await fetch('/api/admin/reports', { headers });
      if (repRes.ok) {
        const repData = await repRes.json();
        setReportsData(repData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isStaff && token) {
      refreshData();
    }
  }, [isStaff, token, statusFilter]);

  // Update Reservation Status (Check-in, Check-out, Cancel)
  const updateStatus = async (id: string, newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Export CSV
  const exportCsv = () => {
    if (reservations.length === 0) return;
    const headers = ['N° Réservation', 'Client', 'Email', 'Téléphone', 'Hébergement', 'Arrivée', 'Départ', 'Statut', 'Total DZD'];
    const rows = reservations.map((r) => [
      r.booking_number,
      `"${r.first_name} ${r.last_name}"`,
      r.guest_email,
      r.guest_phone,
      `"${r.room_name_fr}"`,
      r.check_in,
      r.check_out,
      r.status,
      r.grand_total_dzd,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservations_lagazelledor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not authenticated as staff/admin, display login screen
  if (!isStaff) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-[#FAF6F0]">
        <div className="w-full max-w-md bg-[#241C16] border border-[#D4A359]/35 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="mb-4">
              <GazelleLogo variant="full" size="md" theme="gold" />
            </div>
            <div className="w-10 h-10 rounded-xl border border-[#D4A359]/50 bg-[#18120E] flex items-center justify-center text-[#E6BF7A] mb-3 shadow-[0_0_15px_rgba(212,163,89,0.25)]">
              <Shield className="w-5 h-5 text-[#D4A359]" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF6F0]">{t('loginTitle')}</h1>
            <p className="text-xs text-[#DDD3C5] mt-1 font-light">{t('loginSubtitle')}</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                Email Professionnel
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E6BF7A] mb-1.5 uppercase tracking-wider">
                Mot de Passe
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#18120E] border border-[#D4A359]/20 text-[11px] text-[#A89E90]">
              <span>Compte Admin par défaut : </span>
              <strong className="text-[#E6BF7A]">admin@hotel-lagazelledor.dz</strong> / <code className="text-[#E6BF7A]">Gazelle2026!</code>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold py-3 min-h-[44px] rounded-xl text-sm tracking-wide shadow flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#171310]" /> : <UserCheck className="w-4 h-4 text-[#171310]" />}
              <span>{t('btnLogin')}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 text-[#FAF6F0]">
      
      {/* Top Console Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#D4A359]/20">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
            {t('adminTitle')}
          </h1>
          <p className="text-xs text-[#E6BF7A] font-mono mt-0.5">
            Connecté : {user?.name} ({user?.email}) · Rôle : {user?.role.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={refreshData}
            disabled={loadingData}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg border border-[#D4A359]/30 hover:border-[#D4A359] text-xs text-[#FAF6F0] bg-[#18120E] transition-colors cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E6BF7A] ${loadingData ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg border border-red-500/30 hover:bg-red-950/40 text-xs text-red-300 transition-colors cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('btnLogout')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-6 sm:mb-8">
          
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/20 shadow-sm">
            <span className="text-[10px] sm:text-[11px] text-[#A89E90] block uppercase tracking-wider">{t('kpiTodayArrivals')}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#E6BF7A] tabular-nums">{kpis.todayArrivals}</span>
              <span className="text-[10px] text-[#A89E90]">chambres</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/20 shadow-sm">
            <span className="text-[10px] sm:text-[11px] text-[#A89E90] block uppercase tracking-wider">{t('kpiTodayDepartures')}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#FAF6F0] tabular-nums">{kpis.todayDepartures}</span>
              <span className="text-[10px] text-[#A89E90]">départs</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/20 shadow-sm">
            <span className="text-[10px] sm:text-[11px] text-[#A89E90] block uppercase tracking-wider">{t('kpiActiveBookings')}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">{kpis.activeReservations}</span>
              <span className="text-[10px] text-[#A89E90]">en cours</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/20 shadow-sm">
            <span className="text-[10px] sm:text-[11px] text-[#A89E90] block uppercase tracking-wider">{t('kpiOccupancy')}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#E6BF7A] tabular-nums">{kpis.occupancyRate}%</span>
              <span className="text-[10px] text-[#A89E90]">sur {kpis.totalRoomsInventory} ch.</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/30 shadow-sm">
            <span className="text-[10px] sm:text-[11px] text-[#A89E90] block uppercase tracking-wider">{t('kpiRevenue')}</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-lg sm:text-xl font-bold text-[#E6BF7A] tabular-nums">
                {Number(kpis.totalRevenueDzd).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#A89E90]">DZD</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation - Scrollable on mobile */}
      <div className="flex items-center gap-2 border-b border-[#D4A359]/20 mb-6 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'reservations'
              ? 'bg-gradient-to-r from-[#D4A359] to-[#C58F3B] text-[#171310] shadow'
              : 'text-[#DDD3C5] hover:text-white hover:bg-[#241C16]'
          }`}
        >
          <List className="w-4 h-4" />
          <span>{t('tabReservations')}</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'calendar'
              ? 'bg-gradient-to-r from-[#D4A359] to-[#C58F3B] text-[#171310] shadow'
              : 'text-[#DDD3C5] hover:text-white hover:bg-[#241C16]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('tabCalendar')}</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-[#D4A359] to-[#C58F3B] text-[#171310] shadow'
              : 'text-[#DDD3C5] hover:text-white hover:bg-[#241C16]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('tabReports')}</span>
        </button>
        <button
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'logo'
              ? 'bg-gradient-to-r from-[#D4A359] to-[#C58F3B] text-[#171310] shadow'
              : 'text-[#DDD3C5] hover:text-white hover:bg-[#241C16]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>شعار الموقع (Logo)</span>
        </button>
      </div>

      {/* TAB 1: RESERVATIONS LIST */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/20 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A89E90]" />
                <input
                  type="text"
                  placeholder="Rechercher (Nom, N° LGD-...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refreshData()}
                  className="bg-[#18120E] border border-[#D4A359]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D4A359] w-full sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#18120E] border border-[#D4A359]/30 rounded-xl px-3 py-2 text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D4A359]"
              >
                <option value="all">Tous les statuts</option>
                <option value="confirmed">Confirmée</option>
                <option value="checked_in">Checked-in</option>
                <option value="checked_out">Checked-out</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4A359]/10 hover:bg-[#D4A359]/20 text-[#E6BF7A] border border-[#D4A359]/40 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('btnExportCsv')}</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-[#241C16] border border-[#D4A359]/20 rounded-xl overflow-x-auto shadow-md">
            <table className="w-full text-left text-xs text-[#DDD3C5]">
              <thead className="bg-[#18120E] text-[#E6BF7A] uppercase font-semibold border-b border-[#D4A359]/20 font-mono">
                <tr>
                  <th className="py-3 px-4">N° Dossier</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Hébergement</th>
                  <th className="py-3 px-4">Arrivée - Départ</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Total DZD</th>
                  <th className="py-3 px-4 text-center">Actions Front-Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A359]/10 font-light">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#A89E90]">
                      Aucune réservation ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : (
                  reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-[#18120E]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#E6BF7A] whitespace-nowrap">
                        {r.booking_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#FAF6F0]">{r.first_name} {r.last_name}</div>
                        <div className="text-[11px] text-[#A89E90]">{r.guest_phone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[#FAF6F0]">
                        {r.room_name_fr}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#DDD3C5]">
                        {r.check_in} → {r.check_out}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${
                          r.status === 'confirmed' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' :
                          r.status === 'checked_in' ? 'bg-blue-950/80 text-blue-400 border border-blue-500/30' :
                          r.status === 'checked_out' ? 'bg-neutral-800 text-neutral-300' :
                          r.status === 'cancelled' ? 'bg-red-950/80 text-red-400 border border-red-500/30' : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#E6BF7A] tabular-nums whitespace-nowrap">
                        {Number(r.grand_total_dzd).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {r.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(r.id, 'checked_in')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Arrivée
                            </button>
                          )}
                          {r.status === 'checked_in' && (
                            <button
                              onClick={() => updateStatus(r.id, 'checked_out')}
                              className="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Départ
                            </button>
                          )}
                          {r.status !== 'cancelled' && r.status !== 'checked_out' && (
                            <button
                              onClick={() => updateStatus(r.id, 'cancelled')}
                              className="px-2 py-1 text-red-400 hover:text-red-300 text-[11px] underline cursor-pointer"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PMS CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="bg-[#241C16] border border-[#D4A359]/20 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-bold text-[#FAF6F0]">
              Calendrier d'Occupation des Hébergements (PMS)
            </h3>
            <span className="text-xs text-[#E6BF7A] font-mono">Vue Synoptique</span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {reservations.slice(0, 10).map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-[#18120E] border border-[#D4A359]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-[#E6BF7A] font-bold block">{r.booking_number}</span>
                  <span className="font-semibold text-sm text-[#FAF6F0]">{r.first_name} {r.last_name}</span>
                  <span className="text-xs text-[#A89E90] block">{r.room_name_fr}</span>
                </div>
                <div className="sm:text-right">
                  <span className="font-mono text-xs text-[#DDD3C5] block">{r.check_in} → {r.check_out}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS & AUDIT LOGS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue by Month */}
          <div className="bg-[#241C16] border border-[#D4A359]/20 rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#FAF6F0] mb-4">
              Chiffre d'Affaires Mensuel (DZD)
            </h3>
            <div className="space-y-2.5">
              {reportsData?.revenueByMonth?.map((m: any) => (
                <div key={m.month} className="flex justify-between items-center p-2.5 rounded-lg bg-[#18120E] text-xs">
                  <span className="font-mono text-[#FAF6F0] font-semibold">{m.month}</span>
                  <span className="text-[#A89E90]">{m.reservations_count} réservations</span>
                  <span className="font-mono font-bold text-[#E6BF7A] tabular-nums">
                    {Number(m.total_revenue).toLocaleString()} DZD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Audit Logs */}
          <div className="bg-[#241C16] border border-[#D4A359]/20 rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#FAF6F0] mb-4">
              Journal d'Audit & Sécurité
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-[#18120E] border border-[#D4A359]/10 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-[#A89E90]">
                    <span className="font-mono text-[#E6BF7A]">{log.action}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-[#FAF6F0] font-mono text-[11px]">
                    Acteur : {log.actor_email} · Dossier : {log.entity_id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOGO & BRANDING */}
      {activeTab === 'logo' && (
        <div className="bg-[#241C16] border border-[#D4A359]/20 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-lg text-center">
          <div className="space-y-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF6F0]">
              تخصيص شعار الموقع (Logo & Brand)
            </h3>
            <p className="text-xs sm:text-sm text-[#A89E90]">
              قم برفع صورة الشعار الخاص بك لاستخدامها فوراً في شريط التنقل (Navbar)، واجهة الترحيب، وجميع أجزاء الموقع دون أي تعديل.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#18120E] border border-[#D4A359]/30">
            <div className="mb-4">
              <GazelleLogo size="lg" />
            </div>
            <span className="text-xs text-[#E6BF7A] font-medium mb-4">
              {customLogoState ? 'الشعار المخصص الحالي' : 'الشعار الافتراضي (SVG)'}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <label className="cursor-pointer bg-gradient-to-r from-[#D4A359] via-[#E2B874] to-[#C58F3B] hover:from-[#E2B874] hover:to-[#D4A359] text-[#171310] font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                <span>رفع صورة الشعار</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>

              {customLogoState && (
                <button
                  onClick={handleRemoveLogo}
                  className="bg-[#2A1F18] hover:bg-[#38271E] text-rose-400 border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
                >
                  استعادة الشعار الافتراضي
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
