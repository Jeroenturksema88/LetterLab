'use client';

// app/profiel/page.tsx — Profielinstelling-scherm (ouder helpt kind).
// Drie keuzes: geslacht (verplicht), dominante hand (default rechts) en naam
// (optioneel — fallback "Vriendje" voor 3,5-jarigen die niet typen).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProfielStore } from '@/stores/profiel-store';
import { useInstellingenStore } from '@/stores/instellingen-store';
import type { DominanteHand } from '@/types';

export default function ProfielPagina() {
  const router = useRouter();
  const { setNaam, setGeslacht, markeerProfielIngesteld, geslacht, naam } = useProfielStore();
  const huidigeHand = useInstellingenStore((s) => s.dominanteHand);
  const updateInstellingen = useInstellingenStore((s) => s.updateInstellingen);

  const [gekozenGeslacht, setGekozenGeslacht] = useState<'jongen' | 'meisje' | null>(geslacht);
  const [gekozenHand, setGekozenHand] = useState<DominanteHand>(huidigeHand);
  const [invoerNaam, setInvoerNaam] = useState(naam || '');

  const handleBevestig = () => {
    if (!gekozenGeslacht) return;

    // Naam is optioneel: als leeg gelaten, gebruik vriendelijke fallback.
    // Een 3,5-jarige kan zelf geen naam typen; ouder moet kunnen doorklikken.
    const naamOmTeOpslaan = invoerNaam.trim() || 'Vriendje';

    setNaam(naamOmTeOpslaan);
    setGeslacht(gekozenGeslacht);
    updateInstellingen({ dominanteHand: gekozenHand });
    markeerProfielIngesteld();
    router.push('/');
  };

  const handleGeslachtKeuze = (keuze: 'jongen' | 'meisje') => {
    setGekozenGeslacht(keuze);
  };

  // Geslachtkeuze is wel verplicht (twee duidelijke knoppen, kind kan zelf kiezen).
  // Naam mag leeg blijven — fallback is "Vriendje".
  const isGereed = gekozenGeslacht !== null;

  return (
    <div className="h-full relative overflow-hidden flex flex-col items-center justify-center gap-6 p-8">
      {/* Achtergrond — zachte warme gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #FFF8F0 0%, #FFF0E0 50%, #FFE8D0 100%)',
        }}
      />

      {/* Decoratieve zwevende vormpjes */}
      <motion.div
        className="absolute top-[10%] left-[8%] pointer-events-none"
        animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#C7D2FE" opacity="0.5" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute top-[15%] right-[10%] pointer-events-none"
        animate={{ y: [0, 10, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <polygon points="16,2 30,30 2,30" fill="#FDE68A" opacity="0.5" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-[12%] left-[15%] pointer-events-none"
        animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36">
          <rect x="4" y="4" width="28" height="28" rx="6" fill="#A7F3D0" opacity="0.4" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-[18%] right-[12%] pointer-events-none"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="#FBCFE8" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Geslacht-keuze — twee grote silhouet-knoppen */}
      <motion.div
        className="flex gap-8 md:gap-12 relative z-10"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
      >
        {/* Jongen-knop */}
        <motion.button
          onClick={() => handleGeslachtKeuze('jongen')}
          className="relative flex items-center justify-center rounded-[2rem] cursor-pointer outline-none focus:outline-none"
          style={{
            width: 160,
            height: 180,
            background: gekozenGeslacht === 'jongen'
              ? 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)'
              : 'linear-gradient(135deg, #F0F4FF 0%, #E0E8FF 100%)',
            border: gekozenGeslacht === 'jongen'
              ? '4px solid #60A5FA'
              : '3px solid rgba(255,255,255,0.7)',
            boxShadow: gekozenGeslacht === 'jongen'
              ? '0 8px 30px -4px rgba(59, 130, 246, 0.35), inset 0 2px 4px rgba(255,255,255,0.6)'
              : '0 4px 20px -4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.7)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Jongen silhouet SVG */}
          <svg width="80" height="115" viewBox="0 0 90 130" fill="none">
            <circle cx="45" cy="30" r="22" fill={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'} />
            <path d="M23 28C23 14 33 8 45 8C57 8 67 14 67 28" fill={gekozenGeslacht === 'jongen' ? '#2563EB' : '#64748B'} />
            <path d="M45 52V82" stroke={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'} strokeWidth="8" strokeLinecap="round" />
            <path d="M45 62L25 78M45 62L65 78" stroke={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'} strokeWidth="7" strokeLinecap="round" />
            <path d="M45 82L30 115M45 82L60 115" stroke={gekozenGeslacht === 'jongen' ? '#3B82F6' : '#94A3B8'} strokeWidth="7" strokeLinecap="round" />
          </svg>

          {gekozenGeslacht === 'jongen' && (
            <motion.div
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        {/* Meisje-knop */}
        <motion.button
          onClick={() => handleGeslachtKeuze('meisje')}
          className="relative flex items-center justify-center rounded-[2rem] cursor-pointer outline-none focus:outline-none"
          style={{
            width: 160,
            height: 180,
            background: gekozenGeslacht === 'meisje'
              ? 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%)'
              : 'linear-gradient(135deg, #FFF0F6 0%, #FFE4EE 100%)',
            border: gekozenGeslacht === 'meisje'
              ? '4px solid #F472B6'
              : '3px solid rgba(255,255,255,0.7)',
            boxShadow: gekozenGeslacht === 'meisje'
              ? '0 8px 30px -4px rgba(244, 114, 182, 0.35), inset 0 2px 4px rgba(255,255,255,0.6)'
              : '0 4px 20px -4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.7)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
          whileTap={{ scale: 0.92 }}
        >
          <svg width="80" height="115" viewBox="0 0 90 130" fill="none">
            <circle cx="45" cy="30" r="22" fill={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'} />
            <path
              d="M23 28C23 14 33 8 45 8C57 8 67 14 67 28L70 55C70 55 62 48 55 48L54 35C54 35 50 40 45 40C40 40 36 35 36 35L35 48C28 48 20 55 20 55L23 28Z"
              fill={gekozenGeslacht === 'meisje' ? '#DB2777' : '#64748B'}
            />
            <path d="M45 52L32 95L58 95L45 52Z" fill={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'} strokeLinecap="round" />
            <path d="M38 60L22 76M52 60L68 76" stroke={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'} strokeWidth="7" strokeLinecap="round" />
            <path d="M38 95L32 120M52 95L58 120" stroke={gekozenGeslacht === 'meisje' ? '#EC4899' : '#94A3B8'} strokeWidth="7" strokeLinecap="round" />
          </svg>

          {gekozenGeslacht === 'meisje' && (
            <motion.div
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Hand-keuze — twee handjes met palm-naar-jou.
          Kleinere knoppen dan geslacht (secondaire info) maar nog steeds groot
          genoeg voor kindervingers. Default = rechts; ouder kan switchen. */}
      <motion.div
        className="flex gap-4 md:gap-6 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 120 }}
      >
        <HandKnop
          hand="links"
          gekozen={gekozenHand === 'links'}
          onClick={() => setGekozenHand('links')}
        />
        <HandKnop
          hand="rechts"
          gekozen={gekozenHand === 'rechts'}
          onClick={() => setGekozenHand('rechts')}
        />
      </motion.div>

      {/* Naam-invoerveld — de ene plek waar tekst OK is (ouder vult in) */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <input
          type="text"
          value={invoerNaam}
          onChange={(e) => setInvoerNaam(e.target.value)}
          placeholder="Naam..."
          maxLength={20}
          autoComplete="off"
          className="w-full text-center text-2xl md:text-3xl font-bold rounded-2xl py-3 px-6 outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
            color: '#4B3A2A',
            caretColor: '#F59E0B',
          }}
        />
      </motion.div>

      {/* Bevestig-knop — grote gekleurde pijl */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
      >
        <motion.button
          onClick={handleBevestig}
          disabled={!isGereed}
          className="flex items-center justify-center rounded-full cursor-pointer outline-none focus:outline-none disabled:cursor-not-allowed"
          style={{
            width: 72,
            height: 72,
            background: isGereed
              ? 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)'
              : 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
            border: '4px solid rgba(255,255,255,0.7)',
            boxShadow: isGereed
              ? '0 8px 30px -4px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)'
              : '0 4px 12px -4px rgba(0,0,0,0.1)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
          whileTap={isGereed ? { scale: 0.85 } : undefined}
          animate={isGereed ? { y: [0, -4, 0] } : {}}
          transition={isGereed ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } as any : undefined}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

// Compacte hand-knop met palm-naar-jou silhouet. Spiegelbeeld voor links/rechts.
//
// SVG is van nature een RECHTERhand vanuit de viewer-perspectief: duim aan de
// linkerkant van het viewbox (een kind dat zijn rechterhand opheft met palm
// naar mij toe heeft zijn duim aan MIJN linkerkant). Voor de linkerhand
// spiegelen we via `scaleX(-1)`. (Eerdere versie had dit per ongeluk
// omgedraaid — zie [[Tracklog]] 2026-04-26 IV.)
function HandKnop({
  hand,
  gekozen,
  onClick,
}: {
  hand: DominanteHand;
  gekozen: boolean;
  onClick: () => void;
}) {
  const accent = hand === 'links' ? '#7C3AED' : '#059669';
  const accentDonker = hand === 'links' ? '#5B21B6' : '#047857';
  const accentLicht = hand === 'links' ? '#DDD6FE' : '#A7F3D0';
  const accentZacht = hand === 'links' ? '#F5F3FF' : '#ECFDF5';
  const inactiefKleur = '#CBD5E1';
  const inactiefDonker = '#94A3B8';

  const handKleur = gekozen ? accent : inactiefKleur;
  const cuffKleur = gekozen ? accentDonker : inactiefDonker;

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center rounded-[1.5rem] cursor-pointer outline-none focus:outline-none"
      style={{
        width: 124,
        height: 124,
        background: gekozen
          ? `linear-gradient(135deg, ${accentLicht} 0%, ${accentLicht}CC 100%)`
          : `linear-gradient(135deg, ${accentZacht} 0%, #FFFFFF 100%)`,
        border: gekozen
          ? `4px solid ${accent}`
          : '3px solid rgba(255,255,255,0.8)',
        boxShadow: gekozen
          ? `0 6px 20px -4px ${accent}40, inset 0 2px 4px rgba(255,255,255,0.6)`
          : '0 4px 14px -4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.6)',
        transition: 'border 0.2s, box-shadow 0.2s',
      }}
      whileTap={{ scale: 0.92 }}
      aria-label={hand === 'links' ? 'Linkshandig' : 'Rechtshandig'}
      aria-pressed={gekozen}
    >
      {/* Hand-silhouet — vriendelijke, organische vorm met getapeerde vingers,
          gefande spreiding en uitstekende duim. Voor de linkerhand spiegelen
          via scaleX(-1). Subtiele palm-glans + cuff-band voor diepte. */}
      <svg
        width="84"
        height="100"
        viewBox="0 0 120 150"
        fill="none"
        style={{ transform: hand === 'links' ? 'scaleX(-1)' : undefined }}
      >
        {/* Mouw-cuff onderaan voor visuele grondaarding */}
        <rect x="42" y="128" width="44" height="14" rx="7" fill={cuffKleur} />

        {/* Duim — uitstekend naar links-onder, gebogen vorm */}
        <path
          d="M 34 88
             C 24 84, 10 90, 8 102
             C 6 114, 18 120, 26 114
             C 34 108, 38 98, 36 88
             Z"
          fill={handKleur}
        />

        {/* Palm — afgeronde, licht-bolstaande vorm, breder in midden */}
        <path
          d="M 32 78
             C 28 84, 28 105, 32 118
             C 36 126, 44 130, 52 130
             L 76 130
             C 84 130, 92 126, 96 118
             C 100 105, 100 84, 96 78
             Z"
          fill={handKleur}
        />

        {/* Wijsvinger — middellange, naast duim */}
        <path
          d="M 36 78
             C 33 56, 33 30, 38 22
             Q 44 14, 50 22
             C 53 30, 53 56, 50 78
             Z"
          fill={handKleur}
        />

        {/* Middelvinger — langste, in het midden */}
        <path
          d="M 52 78
             C 49 50, 49 18, 54 10
             Q 60 2, 66 10
             C 69 18, 69 50, 66 78
             Z"
          fill={handKleur}
        />

        {/* Ringvinger — iets korter dan middel */}
        <path
          d="M 68 78
             C 65 55, 65 25, 70 17
             Q 76 9, 82 17
             C 85 25, 85 55, 82 78
             Z"
          fill={handKleur}
        />

        {/* Pink — kortste, helemaal rechts */}
        <path
          d="M 84 78
             C 81 62, 81 40, 86 32
             Q 92 24, 98 32
             C 101 40, 101 62, 98 78
             Z"
          fill={handKleur}
        />

        {/* Subtiele palm-lijn voor diepte (lichte handlijn) */}
        <path
          d="M 42 100 Q 64 106, 86 100"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.35"
          fill="none"
        />

        {/* Zachte glans op palm voor diepte */}
        <ellipse cx="60" cy="103" rx="16" ry="11" fill="white" opacity="0.18" />
      </svg>

      {gekozen && (
        <motion.div
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: accent }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
