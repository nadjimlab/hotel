import {
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Utensils,
  Waves,
  Wind
} from 'lucide-react';
import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { GazelleLogo } from './GazelleLogo.tsx';

interface SectionProps {
  onOpenBooking: () => void;
}

export const DiningSection: React.FC<SectionProps> = ({ onOpenBooking }) => {
  const { t } = useLanguage();

  return (
    <section id="dining" className="py-12 sm:py-20 bg-[#18120E] text-[#FAF6F0] border-t border-[#D4A359]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs text-[#E6BF7A] font-semibold uppercase tracking-widest block mb-2 font-mono">
            Gastronomie & Saveurs du Souf
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF6F0] mb-3 sm:mb-4 text-balance">
            {t('diningTitle')}
          </h2>
          <p className="text-xs sm:text-base text-[#DDD3C5] leading-relaxed font-light">
            {t('diningDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Restaurant Le Mirage */}
          <div className="p-5 sm:p-8 rounded-2xl bg-[#241C16] border border-[#D4A359]/25 hover:border-[#D4A359]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#D4A359]/15 border border-[#D4A359]/30 flex items-center justify-center text-[#E6BF7A] mb-5 group-hover:scale-105 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0] mb-2 group-hover:text-[#E6BF7A] transition-colors">
                Le Mirage · Restaurant Panoramique
              </h3>
              <p className="text-xs text-[#E6BF7A] font-mono mb-4">Petit-déjeuner · Déjeuner · Dîner Gastronomique</p>
              <p className="text-xs sm:text-sm text-[#DDD3C5] leading-relaxed font-light mb-6">
                Surplombant les reflets de la piscine et les ondulations des dunes, Le Mirage célèbre les produits du terroir soufi : couscous traditionnel d'El Oued, dattes Deglet Nour rôties, agneau mijoté aux herbes du Sahara et pâtisseries fines au miel.
              </p>
            </div>
            <div className="pt-4 border-t border-[#D4A359]/20 flex items-center justify-between text-xs text-[#A89E90]">
              <span>Capacité : 180 couverts</span>
              <span className="text-[#E6BF7A] font-semibold">Service Continu 07:00 - 23:00</span>
            </div>
          </div>

          {/* Dîner Bivouac sous les Étoiles */}
          <div className="p-8 rounded-2xl bg-[#241C16] border border-[#D4A359]/25 hover:border-[#D4A359]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#D4A359]/15 border border-[#D4A359]/30 flex items-center justify-center text-[#E6BF7A] mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0] mb-2 group-hover:text-[#E6BF7A] transition-colors">
                Bivouac Royal sous la Voûte Céleste
              </h3>
              <p className="text-xs text-[#E6BF7A] font-mono mb-4">Expérience Nocturne Exclusive sur Réservation</p>
              <p className="text-xs sm:text-sm text-[#DDD3C5] leading-relaxed font-light mb-6">
                Une parenthèse féerique au cœur du Grand Erg. Installez-vous sur des tapis bédouins autour d'un grand feu de braises pour savourer le méchoui à l'ancienne et le thé à la menthe infusé au sable brûlant, bercé par les mélodies du désert.
              </p>
            </div>
            <div className="pt-4 border-t border-[#D4A359]/20 flex items-center justify-between text-xs text-[#A89E90]">
              <span>Cadre privatisable</span>
              <button
                onClick={onOpenBooking}
                className="text-[#E6BF7A] font-semibold hover:underline cursor-pointer"
              >
                Réserver une table &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SpaSection: React.FC<SectionProps> = ({ onOpenBooking }) => {
  const { t } = useLanguage();

  return (
    <section id="spa" className="py-12 sm:py-20 bg-[#221A15] text-[#FAF6F0] border-t border-[#D4A359]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs text-[#E6BF7A] font-semibold uppercase tracking-widest block mb-2 font-mono">
            Thermalisme & Sérénité
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF6F0] mb-3 sm:mb-4 text-balance">
            {t('spaTitle')}
          </h2>
          <p className="text-xs sm:text-base text-[#DDD3C5] leading-relaxed font-light">
            {t('spaDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#18120E] border border-[#D4A359]/25 hover:border-[#D4A359]/50 transition-all">
            <Waves className="w-6 h-6 text-[#E6BF7A] mb-3" />
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#FAF6F0] mb-1">Bassin Thermal Intérieur</h4>
            <p className="text-xs text-[#A89E90] leading-relaxed">
              Piscine couverte chauffée alimentée par les eaux minérales naturelles d'El Oued, bienfaisantes pour le corps et l'esprit.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#18120E] border border-[#D4A359]/25 hover:border-[#D4A359]/50 transition-all">
            <Wind className="w-6 h-6 text-[#E6BF7A] mb-3" />
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#FAF6F0] mb-1">Hammam Royal Traditionnel</h4>
            <p className="text-xs text-[#A89E90] leading-relaxed">
              Bains de vapeur en marbre pur, gommage au savon noir artisanal et friction aux sels minéraux sahariens.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#18120E] border border-[#D4A359]/25 hover:border-[#D4A359]/50 transition-all">
            <Sparkles className="w-6 h-6 text-[#E6BF7A] mb-3" />
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#FAF6F0] mb-1">Soins aux Extraits de Dattes</h4>
            <p className="text-xs text-[#A89E90] leading-relaxed">
              Enveloppements nutritifs exclusifs élaborés à partir du nectar de Deglet Nour de la palmeraie privée du resort.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#18120E] border border-[#D4A359]/25 hover:border-[#D4A359]/50 transition-all flex flex-col justify-between">
            <div>
              <Compass className="w-6 h-6 text-[#E6BF7A] mb-3" />
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#FAF6F0] mb-1">Massages Signature</h4>
              <p className="text-xs text-[#A89E90] leading-relaxed">
                6 cabines de soins privatives individuelles et en duo pour une déconnexion sensorielle absolue.
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="mt-4 text-xs font-semibold text-[#E6BF7A] hover:underline cursor-pointer self-start"
            >
              Ajouter à votre séjour &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ActivitiesSection: React.FC<SectionProps> = ({ onOpenBooking }) => {
  const { t } = useLanguage();

  return (
    <section id="activities" className="py-12 sm:py-20 bg-[#18120E] text-[#FAF6F0] border-t border-[#D4A359]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs text-[#E6BF7A] font-semibold uppercase tracking-widest block mb-2 font-mono">
            Échappées & Découvertes
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF6F0] mb-3 sm:mb-4 text-balance">
            {t('activitiesTitle')}
          </h2>
          <p className="text-xs sm:text-base text-[#DDD3C5] leading-relaxed font-light">
            {t('activitiesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="p-5 sm:p-7 rounded-2xl bg-[#241C16] border border-[#D4A359]/25 hover:border-[#D4A359]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all">
            <span className="text-xs text-[#E6BF7A] font-mono block mb-2 font-semibold">01 · Aventure & Adrénaline</span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF6F0] mb-2">Safari 4x4 Grandes Dunes</h3>
            <p className="text-xs sm:text-sm text-[#DDD3C5] leading-relaxed font-light mb-4">
              Franchissez les crêtes vertigineuses du Grand Erg Oriental avec nos pilotes aguerris et admirez les vagues de sable à perte de vue.
            </p>
          </div>

          <div className="p-5 sm:p-7 rounded-2xl bg-[#241C16] border border-[#D4A359]/25 hover:border-[#D4A359]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all">
            <span className="text-xs text-[#E6BF7A] font-mono block mb-2 font-semibold">02 · Contemplation</span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF6F0] mb-2">Méharée au Coucher du Soleil</h3>
            <p className="text-xs sm:text-sm text-[#DDD3C5] leading-relaxed font-light mb-4">
              Avancez au rythme apaisant des dromadaires tandis que les ombres s'allongent et que le désert se pare de teintes pourpres et ambrées.
            </p>
          </div>

          <div className="p-5 sm:p-7 rounded-2xl bg-[#241C16] border border-[#D4A359]/25 hover:border-[#D4A359]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all">
            <span className="text-xs text-[#E6BF7A] font-mono block mb-2 font-semibold">03 · Culture & Patrimoine</span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF6F0] mb-2">La Cité aux Mille Coupoles</h3>
            <p className="text-xs sm:text-sm text-[#DDD3C5] leading-relaxed font-light mb-4">
              Visite guidée exclusive du cœur historique d'El Oued, de ses marchés aux épices, ses fabriques de tapis et de ses ghouts traditionnels.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LocationSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="location" className="py-12 sm:py-20 bg-[#221A15] text-[#FAF6F0] border-t border-[#D4A359]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          
          <div>
            <span className="text-[10px] sm:text-xs text-[#E6BF7A] font-semibold uppercase tracking-widest block mb-2 font-mono">
              Situation & Accès
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF6F0] mb-3 sm:mb-4">
              {t('locationTitle')}
            </h2>
            <p className="text-xs sm:text-base text-[#DDD3C5] leading-relaxed font-light mb-6 sm:mb-8">
              {t('locationDesc')}
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4A359] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block">Adresse du Complexe :</strong>
                  <span className="text-[#DDD3C5]">{t('contactAddress')}</span>
                  <span className="text-[#A89E90] block text-xs mt-0.5 font-mono">Coordonnées GPS : 33.3683° N, 6.8674° E</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#D4A359] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block">Téléphone Réception :</strong>
                  <a href="tel:+21332140000" className="text-[#E6BF7A] hover:underline font-mono">
                    {t('contactPhone')}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#D4A359] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block">Email Réservations :</strong>
                  <a href="mailto:reservations@hotel-lagazelledor.dz" className="text-[#E6BF7A] hover:underline break-all">
                    {t('contactEmail')}
                  </a>
                </div>
              </div>

              {/* Direct WhatsApp CTA */}
              <div className="pt-2">
                <a
                  href="https://wa.me/213550000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-4 py-2.5 min-h-[44px] rounded-xl text-xs tracking-wide shadow-md transition-colors active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter la conciergerie sur WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Location Visual representation */}
          <div className="p-5 sm:p-7 rounded-2xl border border-[#D4A359]/35 bg-[#18120E] shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4A359]/20">
              <span className="font-serif font-bold text-base text-[#FAF6F0]">Plan d'Accès Régional</span>
              <span className="text-[11px] text-[#E6BF7A] font-mono font-semibold">Guemar ELU · 20 min</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#241C16] border border-[#D4A359]/15 space-y-2 text-xs text-[#DDD3C5]">
              <div className="flex justify-between flex-wrap gap-1">
                <span>Vols réguliers :</span>
                <span className="font-semibold text-[#FAF6F0]">Alger (ALG) &rarr; El Oued Guemar (ELU)</span>
              </div>
              <div className="flex justify-between">
                <span>Durée du vol :</span>
                <span className="font-mono">1h 15min</span>
              </div>
              <div className="flex justify-between">
                <span>Service Navette VIP :</span>
                <span className="text-emerald-400 font-semibold">Gratuit & Inclus (sur demande)</span>
              </div>
            </div>

            <div className="text-[11px] text-[#A89E90] leading-relaxed">
              Le service de conciergerie assure votre prise en charge dès la sortie du terminal de l'aéroport international de Guemar dans un véhicule climatisé avec chauffeur privé.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#140F0C] text-[#A89E90] border-t border-[#D4A359]/20 py-8 sm:py-12 text-xs font-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-[#2C211A] text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <GazelleLogo variant="horizontal" size="md" theme="gold" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[#DDD3C5] text-xs">
            <span>140 Hectares de Palmeraie</span>
            <span className="hidden sm:inline">·</span>
            <span>Spa Thermal 2500m²</span>
            <span className="hidden sm:inline">·</span>
            <span>Moteur de Réservation Production</span>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8C8072] text-center sm:text-left">
          <p>© {new Date().getFullYear()} La Gazelle d'Or Resort & Spa. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="hover:text-[#DDD3C5] transition-colors cursor-pointer">Mentions Légales</span>
            <span>·</span>
            <span className="hover:text-[#DDD3C5] transition-colors cursor-pointer">Politique de Confidentialité</span>
            <span>·</span>
            <span className="hover:text-[#DDD3C5] transition-colors cursor-pointer">Conditions Générales de Vente</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
